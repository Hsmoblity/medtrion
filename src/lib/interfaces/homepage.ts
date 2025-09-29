import { ProductSchema } from './schema';
import { 
  standardizeImage, 
  extractPriceFromDescription, 
  generateFinancingCopy, 
  generateBadges,
  validateProductCardView,
  logValidationResults
} from '../utils/data-validation';

/**
 * View-model used by homepage cards for top product showcase
 */
export interface ProductCardView {
  slug: string; // Link target
  title: string;
  description: string; // Short teaser (from Contentful field or curated copy)
  price: number | null; // Base price in dollars
  financingCopy: string | null; // CTA text (e.g., "from $99/mo")
  badges: string[]; // Merchandising badges (e.g., "Top Seller")
  imageUrl: string; // Normalized hero image
  rating: number | null; // Optional review average
  isFeatured: boolean; // Featured flag
  optionsSummary: string | null; // Quick summary of key add-ons
  relatedOptions: number[]; // Array of related option IDs from WooCommerce
  productId?: string;
  databaseId?: number;
}

/**
 * Maps ProductSchema to ProductCardView for homepage display with robust validation
 */
export function mapToProductCardView(product: ProductSchema): ProductCardView {
  // Validate input data
  if (!product) {
    console.error('mapToProductCardView: Product is null/undefined');
    return createFallbackProductCardView();
  }
  
  // Extract price with fallback from description
  let price = product.price || null;
  if (!price && product.description) {
    price = extractPriceFromDescription(product.description);
  }
  
  // Generate badges based on product data
  const badges = generateBadges(product);
  
  // Standardize image URL
  const imageUrl = standardizeImage(product.featuredImage);
  
  // Generate financing copy
  const financingCopy = generateFinancingCopy(price);
  
  // Create description with fallback
  const description = typeof product.shortDescription === 'string' 
    ? product.shortDescription 
    : product.description || 'Product description not available';
  
  // Normalize relatedOptions to ensure it's always an array of numbers
  const relatedOptions: number[] = (() => {
    if (!product._related_options || !Array.isArray(product._related_options)) {
      return [];
    }
    
    return product._related_options
      .map((option: any) => {
        if (typeof option === 'number') return option;
        if (typeof option === 'string') {
          const parsed = parseInt(option, 10);
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      })
      .filter((option: number | null): option is number => option !== null);
  })();

  const productCardView: ProductCardView = {
    slug: product.slug || 'unknown-product',
    title: product.title || 'Untitled Product',
    description: description,
    price: price,
    financingCopy: financingCopy,
    badges: badges,
    imageUrl: imageUrl,
    rating: null, // TODO: Add review data from CMS
    isFeatured: true, // Assume featured if in this view
    optionsSummary: relatedOptions.length > 0 
      ? `${relatedOptions.length} options available`
      : null,
    relatedOptions: relatedOptions,
    productId: product.productId,
    databaseId: typeof product.productId === 'string' ? 
      parseInt(product.productId) : undefined
  };
  
  // Validate the mapped data
  const validation = validateProductCardView(productCardView);
  if (!validation.isValid) {
    console.warn('ProductCardView validation failed:', validation.errors);
  }
  
  return productCardView;
}

/**
 * Create a fallback ProductCardView for error cases
 */
function createFallbackProductCardView(): ProductCardView {
  return {
    slug: 'error-product',
    title: 'Product Not Available',
    description: 'This product is temporarily unavailable.',
    price: null,
    financingCopy: null,
    badges: [],
    imageUrl: '/placeholder.svg',
    rating: null,
    isFeatured: false,
    optionsSummary: null,
    relatedOptions: [],
    productId: undefined,
    databaseId: undefined
  };
}

/**
 * Batch validate multiple ProductCardView objects
 */
export function validateProductCardViews(products: ProductCardView[], component: string): ProductCardView[] {
  const validationResults = products.map(validateProductCardView);
  
  // Log validation results for monitoring
  logValidationResults(component, validationResults);
  
  // For homepage showcase, be more lenient - only filter out products with critical errors
  const validProducts = products.filter((_, index) => {
    const validation = validationResults[index];
    // Only filter out products with critical errors (missing slug or title)
    const hasCriticalErrors = validation.errors.some(error => 
      error.includes('slug') || error.includes('title')
    );
    return !hasCriticalErrors;
  });
  
  if (validProducts.length !== products.length) {
    console.warn(`Filtered out ${products.length - validProducts.length} products with critical errors from ${component}`);
  }
  
  return validProducts;
}