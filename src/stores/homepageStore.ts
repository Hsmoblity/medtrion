import { create } from 'zustand';
import { ProductSchema } from '../lib/interfaces/schema';
import { ProductCardView, mapToProductCardView, validateProductCardViews } from '../lib/interfaces/homepage';
import {
  getFeaturedProducts,
  getProductsByCategory,
} from '../lib/woocommerce';
import { validateProductSchema, sanitizeForSSR, filterConfigurableProducts, handleInsufficientConfigurableProducts } from '../lib/utils/data-validation';
import { mapWooToProductSchema } from '../lib/contentful/contentful';


interface HomepageState {
featuredProducts: ProductCardView[];
loading: boolean;
error: string | null;

fetchFeaturedProducts: () => Promise<void>;

// Fetch all products from a WooCommerce category
fetchProductsByCategory: (categorySlug: string) => Promise<void>;
}

export const useHomepageStore = create<HomepageState>((set) => ({
featuredProducts: [],
loading: false,
error: null,

// Existing featured products function
fetchFeaturedProducts: async () => {
set({ loading: true, error: null });


try {
  const data = (await getFeaturedProducts(4)) as {
    products: {
      nodes: ProductSchema[];
    };
  };

  const productSchemas = data.products.nodes.map((product) => {
    console.log('Homepage Store - Raw WooCommerce product:', {
      name: product.title,
      slug: product.slug,
      featuredImage: product.featuredImage,
    });

    const mappedProduct = mapWooToProductSchema(product);

    console.log('Homepage Store - Mapped product:', {
      title: mappedProduct.title,
      slug: mappedProduct.slug,
      featuredImage: mappedProduct.featuredImage,
    });

    const validation = validateProductSchema(mappedProduct);

    if (!validation.isValid) {
      console.warn('Invalid product data:', validation.errors);
    }

    return sanitizeForSSR(mappedProduct);
  });

  const configurableProducts =
    filterConfigurableProducts(productSchemas);

  const mappedProducts =
    configurableProducts.map(mapToProductCardView);

  const finalProducts = validateProductCardViews(
    mappedProducts,
    'TopProductsStrip'
  );

  const fallbackCheck =
    handleInsufficientConfigurableProducts(
      finalProducts.length,
      4,
      'Homepage Store'
    );

  if (fallbackCheck.shouldShowFallback) {
    console.warn(fallbackCheck.message);
  }

  set({
    featuredProducts: finalProducts,
    loading: false,
  });
} catch (error) {
  console.error(
    'Homepage Store: Failed to fetch featured products:',
    error
  );

  set({
    error:
      error instanceof Error
        ? error.message
        : 'Failed to fetch featured products.',
    loading: false,
    featuredProducts: [],
  });
}


},

// New function:
// Fetch all products from a specific WooCommerce category
fetchProductsByCategory: async (
categorySlug: string
) => {
set({
loading: true,
error: null,
featuredProducts: [],
});


try {
  const data = (await getProductsByCategory(
    categorySlug
  )) as {
    products: {
      nodes: ProductSchema[];
    };
  };

  console.log(
    `Homepage Store - Products received for "${categorySlug}":`,
    data.products.nodes
  );

  const productSchemas = data.products.nodes.map(
    (product) => {
      const mappedProduct =
        mapWooToProductSchema(product);

      const validation =
        validateProductSchema(mappedProduct);

      if (!validation.isValid) {
        console.warn(
          'Invalid category product:',
          validation.errors
        );
      }

      return sanitizeForSSR(mappedProduct);
    }
  );

 // Convert all category products to carousel card format
const mappedProducts =
  productSchemas.map(
    mapToProductCardView
  );

  // Validate final product cards
  const finalProducts =
    validateProductCardViews(
      mappedProducts,
      `Category-${categorySlug}`
    );

  console.log(
    `Homepage Store - Final "${categorySlug}" products:`,
    finalProducts
  );

  set({
    featuredProducts: finalProducts,
    loading: false,
    error: null,
  });
} catch (error) {
  console.error(
    `Homepage Store: Failed to fetch "${categorySlug}" products:`,
    error
  );

  set({
    error:
      error instanceof Error
        ? error.message
        : `Failed to fetch products from ${categorySlug}.`,
    loading: false,
    featuredProducts: [],
  });
}


},
}));
