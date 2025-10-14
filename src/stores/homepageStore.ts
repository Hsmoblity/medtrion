import { create } from 'zustand';
import { ProductSchema } from '../lib/interfaces/schema';
import { ProductCardView, mapToProductCardView, validateProductCardViews } from '../lib/interfaces/homepage';
import { getFeaturedProducts } from '../lib/woocommerce'; // Using consolidated function
import { validateProductSchema, sanitizeForSSR, filterConfigurableProducts, handleInsufficientConfigurableProducts } from '../lib/utils/data-validation';
import { mapWooToProductSchema } from '../lib/contentful/contentful';

interface HomepageState {
  featuredProducts: ProductCardView[];
  loading: boolean;
  error: string | null;
  fetchFeaturedProducts: () => Promise<void>;
}


export const useHomepageStore = create<HomepageState>((set) => ({
  featuredProducts: [],
  loading: false,
  error: null,
  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      // Use consolidated getFeaturedProducts function from woocommerce.ts
      const data = await getFeaturedProducts(4) as { products: { nodes: ProductSchema[] } };
      
      // Map raw GraphQL data to ProductSchema first
      const productSchemas = data.products.nodes
        .map(product => {
          console.log('Homepage Store - Raw WooCommerce product:', {
            name: product.title,
            slug: product.slug,
            featuredImage: product.featuredImage
          });
          
          const mappedProduct = mapWooToProductSchema(product);
          console.log('Homepage Store - Mapped product:', {
            title: mappedProduct.title,
            slug: mappedProduct.slug,
            featuredImage: mappedProduct.featuredImage
          });
          
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
      
      // Check if it's a 404 error or configuration issue - don't retry endlessly
      const errorMessage = error instanceof Error ? error.message : '';
      const is404OrConfigError = errorMessage.includes('404') || 
                                 errorMessage.includes('GraphQL request failed with status 404') ||
                                 errorMessage.includes('Invalid URL') ||
                                 errorMessage.includes('GraphQL client not configured') ||
                                 errorMessage.includes('GraphQL endpoint not properly configured');
      
      if (is404OrConfigError) {
        console.warn('Homepage Store: GraphQL endpoint configuration issue detected, attempting fallback to prevent infinite loops');
        
        // Try fallback to Contentful instead of complete failure
        try {
          const { getProducts } = await import('../lib/contentful/contentful');
          const response = await getProducts("");
          if (response.items && response.items.length > 0) {
            const validatedFallback = response.items
              .map(product => sanitizeForSSR(product));
            
            const configurableFallback = filterConfigurableProducts(validatedFallback);
            const fallbackProducts = configurableFallback.slice(0, 4).map(mapToProductCardView);
            const validatedFallbackProducts = validateProductCardViews(fallbackProducts, 'TopProductsStrip-ConfigFallback');
            
            console.log('Homepage Store: Using Contentful fallback for config error');
            set({ featuredProducts: validatedFallbackProducts, loading: false, error: null });
            return;
          }
        } catch (fallbackError) {
          console.error('Homepage Store: Config error fallback also failed:', fallbackError);
        }
        
        // If fallback fails, then show error with retry capability
        set({ 
          error: 'Products temporarily unavailable. Please try again.', 
          loading: false,
          featuredProducts: [] // Clear any existing products
        });
        return; // Exit early after attempting fallback
      }
      
      // Fallback: try to get products from the main contentful function (only for non-404 errors)
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
