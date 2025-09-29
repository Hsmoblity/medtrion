import { create } from 'zustand';
import { ProductSchema } from '../lib/interfaces/schema';
import { ProductCardView, mapToProductCardView, validateProductCardViews } from '../lib/interfaces/homepage';
import { gql } from 'graphql-request';
import { runClientRequest } from '../lib/woocommerce';
import { validateProductSchema, sanitizeForSSR, filterConfigurableProducts, handleInsufficientConfigurableProducts } from '../lib/utils/data-validation';
import { mapWooToProductSchema } from '../lib/contentful/contentful';

interface HomepageState {
  featuredProducts: ProductCardView[];
  loading: boolean;
  error: string | null;
  fetchFeaturedProducts: () => Promise<void>;
}

const GET_FEATURED_PRODUCTS_QUERY = gql`
  query GetFeaturedProducts {
    products(where: { typeIn: [SIMPLE] }, first: 4) {
      nodes {
        id
        databaseId
        name
        slug
        description
        shortDescription
        productSpecifications
        relatedOptions
        image {
          sourceUrl
        }
        galleryImages(first: 10) {
          nodes {
            sourceUrl
          }
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on ProductWithPricing {
          price
          regularPrice
          salePrice
        }
        ... on ExternalProduct {
          price
        }
      }
    }
  }
`;

export const useHomepageStore = create<HomepageState>((set) => ({
  featuredProducts: [],
  loading: false,
  error: null,
  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await runClientRequest(GET_FEATURED_PRODUCTS_QUERY) as { products: { nodes: ProductSchema[] } };
      
      // Map raw GraphQL data to ProductSchema first
      const productSchemas = data.products.nodes
        .map(product => {
          const mappedProduct = mapWooToProductSchema(product);
          const validation = validateProductSchema(mappedProduct);
          if (!validation.isValid) {
            console.warn('Invalid product data:', validation.errors);
          }
          return sanitizeForSSR(mappedProduct);
        });
      
      // Filter for configurable products only
      const configurableProducts = filterConfigurableProducts(productSchemas);
      
      // Map ProductSchema to ProductCardView with validation
      const mappedProducts = configurableProducts.map(mapToProductCardView);
      
      // Final validation of ProductCardView objects
      const finalProducts = validateProductCardViews(mappedProducts, 'TopProductsStrip');
      
      // Handle insufficient configurable products
      const fallbackCheck = handleInsufficientConfigurableProducts(finalProducts.length, 4, 'Homepage Store');
      if (fallbackCheck.shouldShowFallback) {
        console.warn(fallbackCheck.message);
      }
      
      set({ featuredProducts: finalProducts, loading: false });
    } catch (error) {
      console.error('Homepage Store: Failed to fetch featured products:', error);
      // Fallback: try to get products from the main contentful function
      try {
        const { getProducts } = await import('../lib/contentful/contentful');
        const response = await getProducts("");
        if (response.items && response.items.length > 0) {
          // Apply same validation to fallback data
          const validatedFallback = response.items
            .map(product => sanitizeForSSR(product));
          
          // Filter for configurable products only
          const configurableFallback = filterConfigurableProducts(validatedFallback);
          
          const fallbackProducts = configurableFallback.slice(0, 4).map(mapToProductCardView);
          const validatedFallbackProducts = validateProductCardViews(fallbackProducts, 'TopProductsStrip-Fallback');
          
          set({ featuredProducts: validatedFallbackProducts, loading: false });
        } else {
          set({ 
            error: 'No products available for showcase', 
            loading: false 
          });
        }
      } catch (fallbackError) {
        console.error('Homepage Store: Fallback also failed:', fallbackError);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch featured products.', 
          loading: false 
        });
      }
    }
  },
}));
