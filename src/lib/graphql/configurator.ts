/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PRODUCT CONFIGURATOR MODULE - Specialized GraphQL Operations
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * This module provides CONFIGURATOR-SPECIFIC GraphQL operations for the
 * ModelConfigurator component. For general product/order/customer operations,
 * use src/lib/woocommerce.ts instead.
 * 
 * OPERATIONS SUPPORTED:
 * • Configuration Categories (get categories for a model)
 * • Compatibility Checking (validate option selections)
 * • Financing Calculations (calculate financing options)
 * • Insurance Estimation (estimate insurance costs)
 * • Configuration Management (save, load, update configurations)
 * • Cart Integration (add configured products to cart)
 * 
 * USAGE:
 * ```typescript
 * import { createDefaultClient, getConfigurationCategories } from '@/lib/graphql/configurator';
 * 
 * // Get configuration categories for a model
 * const categories = await getConfigurationCategories('acorn-130');
 * 
 * // Check if selections are compatible
 * const isCompatible = await checkCompatibility(selectedOptions);
 * ```
 * 
 * RELATED FILES:
 * • src/lib/woocommerce.ts - Primary data fetching (use for general operations)
 * • src/lib/graphql/queries.ts - GraphQL query definitions
 * • src/components/configurator/* - Configurator UI components
 * 
 * NOTE:
 * For product fetching (getProductBySlug, getProducts), use woocommerce.ts instead.
 * This file focuses ONLY on configurator-specific operations.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { 
  GET_PRODUCT_BY_SLUG,
  GET_OPTION_PRODUCT_BY_ID,
  GET_MODEL_WITH_CATEGORIES,
  GET_CONFIGURATION_CATEGORIES,
  CHECK_COMPATIBILITY,
  CALCULATE_FINANCING,
  ESTIMATE_INSURANCE,
  LOAD_CONFIGURATION,
  ADD_CONFIGURATION_TO_CART,
  UPDATE_CART_ITEM_CONFIGURATION,
  SAVE_CONFIGURATION
} from './queries';

export interface GraphQLConfiguratorOptions {
  endpoint: string;
  headers?: Record<string, string>;
}

export class ConfiguratorGraphQLClient {
  private endpoint: string;
  private headers: Record<string, string>;

  constructor(options: GraphQLConfiguratorOptions) {
    this.endpoint = options.endpoint;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  async query(query: string, variables?: Record<string, any>) {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('GraphQL request timeout');
      }
      console.error('GraphQL query failed:', error);
      throw error;
    }
  }

  async mutation(mutation: string, variables?: Record<string, any>) {
    return this.query(mutation, variables);
  }
}

// Legacy CONFIGURATOR_QUERIES object for backward compatibility
// @deprecated - Import individual queries from './queries' instead
export const CONFIGURATOR_QUERIES = {
  GET_PRODUCT_BY_SLUG,
  GET_OPTION_PRODUCT_BY_ID,
  GET_MODEL_WITH_CATEGORIES,
  GET_CONFIGURATION_CATEGORIES,
  CHECK_COMPATIBILITY,
  CALCULATE_FINANCING,
  ESTIMATE_INSURANCE,
  LOAD_CONFIGURATION,
};

// Legacy CONFIGURATOR_MUTATIONS object for backward compatibility
// @deprecated - Import individual mutations from './queries' instead
export const CONFIGURATOR_MUTATIONS = {
  ADD_CONFIGURATION_TO_CART,
  UPDATE_CART_ITEM_CONFIGURATION,
  SAVE_CONFIGURATION,
  LOAD_CONFIGURATION,
};

// Input Types for GraphQL
export interface AddConfigurationInput {
  baseProductId: number;
  optionIds: number[];
  configurationName?: string;
  customerNotes?: string;
  installationAddress?: AddressInput;
}

export interface UpdateCartItemConfigurationInput {
  cartItemKey: string;
  optionIds: number[];
  configurationName?: string;
  customerNotes?: string;
}

export interface SaveConfigurationInput {
  name: string;
  baseModelId: number;
  optionIds: number[];
  notes?: string;
}

export interface AddressInput {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface ConfigurationInput {
  baseModelId: number;
  selectedOptions: number[];
}

// Environment-based GraphQL endpoint configuration
const getConfiguratorEndpoint = (): string => {
  // Priority: CONFIGURATOR_GRAPHQL_URL (server-side) > NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL (client-side) > WooCommerce fallback
  const serverEndpoint = process.env.CONFIGURATOR_GRAPHQL_URL;
  const clientEndpoint = process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL;
  const wooCommerceEndpoint = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;

  // Use server endpoint if available (preferred for production)
  if (serverEndpoint) {
    return serverEndpoint;
  }

  // Use client endpoint if available
  if (clientEndpoint) {
    return clientEndpoint;
  }

  // Fallback to WooCommerce GraphQL endpoint
  if (wooCommerceEndpoint) {
    return wooCommerceEndpoint;
  }

  // No endpoints configured - this will cause errors
  throw new Error('No GraphQL endpoints configured. Set CONFIGURATOR_GRAPHQL_URL, NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL, or WP_GRAPHQL_URL environment variables.');
};

// Default GraphQL client instance
export const configuratorGraphQL = new ConfiguratorGraphQLClient({
  endpoint: getConfiguratorEndpoint(),
  headers: {
    // Add any authentication headers here
    // 'Authorization': `Bearer ${token}`,
  },
});

// Error handling and fallback utilities
const handleConfiguratorError = (error: any, operation: string) => {
  console.error(`Configurator ${operation} failed:`, error);
  
  // Return structured error response
  return {
    error: true,
    message: error.message || `Failed to ${operation}`,
    data: null,
    fallback: true
  };
};

// Import price parsing utilities
import { parsePrice } from '../utils/priceUtils';

// Normalize slug query response to ConfigurableProductSchema
export function normalizeSlugQueryResponse(wooProduct: any): any {
  if (!wooProduct) return null;

  // Helper function to safely parse price strings like "$10.00" to numbers
  // Enhanced to handle variable product price ranges like "$54.00 - $285.00"
  const safeParsePriceForConfigurator = (priceValue: any): number => {
    if (priceValue === null || priceValue === undefined) return 0;
    if (typeof priceValue === 'number') return isNaN(priceValue) ? 0 : priceValue;
    if (typeof priceValue === 'string') {
      // Handle price ranges (e.g., "$54.00 - $285.00") by taking the first price
      if (priceValue.includes(' - ')) {
        const firstPrice = priceValue.split(' - ')[0];
        const parsed = parsePrice(firstPrice);
        return parsed;
      }
      // Use the parsePrice utility for consistent parsing
      const parsed = parsePrice(priceValue);
      return parsed;
    }
    return 0;
  };

  // Normalize relatedOptions (server-provided field) into _related_options
  let relatedOptions: number[] = [];
  try {
    if (wooProduct.relatedOptions) {
      if (Array.isArray(wooProduct.relatedOptions)) {
        relatedOptions = wooProduct.relatedOptions.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
      } else if (typeof wooProduct.relatedOptions === 'string') {
        try {
          const parsed = JSON.parse(wooProduct.relatedOptions);
          if (Array.isArray(parsed)) relatedOptions = parsed.map((v: any) => Number(v)).filter((n: any) => !isNaN(n));
        } catch (e) {
          const parts = wooProduct.relatedOptions.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n));
          if (parts.length > 0) relatedOptions = parts;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to normalize relatedOptions:', e);
  }

  // Normalize images
  const featuredImage = wooProduct.image?.sourceUrl || '';
  const galleryImages = wooProduct.galleryImages?.nodes?.map((img: any) => img.sourceUrl) || [];

  // Normalize local and global attributes
  const localAttributes = wooProduct.localAttributes?.nodes || [];
  const globalAttributes = wooProduct.globalAttributes?.nodes || [];

  // Normalize variations with proper price parsing
  const variations = wooProduct.variations?.nodes?.map((variation: any) => ({
    id: variation.id || variation.databaseId?.toString() || '',
    databaseId: variation.databaseId || undefined,
    name: variation.name || '',
    price: safeParsePriceForConfigurator(variation.price),
    regularPrice: variation.regularPrice ? String(safeParsePriceForConfigurator(variation.regularPrice)) : undefined,
    salePrice: variation.salePrice ? String(safeParsePriceForConfigurator(variation.salePrice)) : undefined,
    sku: variation.sku || undefined,
    image: variation.image?.sourceUrl ? {
      sourceUrl: variation.image.sourceUrl,
      altText: variation.image.altText || variation.name || 'Product variation image'
    } : undefined,
    attributes: variation.attributes?.nodes || []
  })) || [];

  // Log price parsing for debugging
  console.log('🚨 PRICE PARSING DEBUG:', {
    originalPrice: wooProduct.price,
    originalType: typeof wooProduct.price,
    parsedPrice: safeParsePriceForConfigurator(wooProduct.price),
    regularPrice: wooProduct.regularPrice,
    salePrice: wooProduct.salePrice
  });

  return {
    id: wooProduct.id || wooProduct.databaseId?.toString() || '',
    databaseId: wooProduct.databaseId || undefined,
    name: wooProduct.name || '',
    slug: wooProduct.slug || '',
    title: wooProduct.name || '',
    description: wooProduct.description || '',
    shortDescription: wooProduct.shortDescription || '',
    featuredImage,
    image: featuredImage ? {
      sourceUrl: featuredImage,
      altText: `${wooProduct.name} image`
    } : undefined,
    price: safeParsePriceForConfigurator(wooProduct.price),
    regularPrice: wooProduct.regularPrice ? String(safeParsePriceForConfigurator(wooProduct.regularPrice)) : undefined,
    salePrice: wooProduct.salePrice ? String(safeParsePriceForConfigurator(wooProduct.salePrice)) : undefined,
    sku: wooProduct.sku || undefined,
    type: wooProduct.__typename?.replace('Product', '').toLowerCase() || 'simple',
    affiliate: false,
    productId: wooProduct.databaseId?.toString(),
    
    // Configurator-specific fields
    baseModel: true,
    configuratorCategories: [],
    compatibilityRules: [],
    installationRequired: false,
    financingAvailable: false,
    insuranceCoverage: [],
    safetyRating: undefined,
    adaCompliant: false,
    weightCapacity: undefined,
    
    // Additional fields
    productPictures: galleryImages,
    variations,
    options: [],
    relatedOptions: relatedOptions,
    _related_options: relatedOptions,
    _related_options_products: [] as any[],
    
    // Raw WooCommerce data for reference
    localAttributes,
    globalAttributes,
    rawData: wooProduct
  };
}

// Helper functions for common operations
export const configuratorAPI = {
  // Get product by slug
  async getProductBySlug(slug: string) {
    try {
      const result = await configuratorGraphQL.query(GET_PRODUCT_BY_SLUG, { slug });
      
      // Validate response structure
      if (!result || !result.products || !result.products.nodes) {
        throw new Error('Invalid response structure from GraphQL endpoint');
      }
      
      const products = result.products.nodes;
      if (products.length === 0) {
        return {
          error: false,
          data: null,
          fallback: false
        };
      }
      
      return {
        error: false,
        data: products[0], // Return first (and only) product
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'getProductBySlug');
    }
  },
  // Get single option product by database ID
  async getOptionProductById(id: string | number) {
    try {
      const result = await configuratorGraphQL.query(GET_OPTION_PRODUCT_BY_ID, { id });
      
      // Validate response structure
      if (!result || !result.product) {
        throw new Error('Invalid response structure from GraphQL endpoint');
      }
      
      return {
        error: false,
        data: result.product,
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'getOptionProductById');
    }
  },

  // Get model with categories
  async getModelWithCategories(slug: string) {
    try {
      const result = await configuratorGraphQL.query(GET_MODEL_WITH_CATEGORIES, { slug });
      
      // Validate response structure - now using products.nodes[0] instead of product
      if (!result || !result.products || !result.products.nodes || result.products.nodes.length === 0) {
        throw new Error('Invalid response structure from GraphQL endpoint');
      }
      
      return {
        error: false,
        data: result.products.nodes[0],
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'getModelWithCategories');
    }
  },

  // Get configuration categories
  async getConfigurationCategories(modelId: string) {
    try {
      const result = await configuratorGraphQL.query(GET_CONFIGURATION_CATEGORIES, { modelId });
      return {
        error: false,
        data: result,
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'getConfigurationCategories');
    }
  },

  // Check compatibility
  async checkCompatibility(selectedOptions: string[]) {
    try {
      const result = await configuratorGraphQL.query(CHECK_COMPATIBILITY, { selectedOptions });
      return {
        error: false,
        data: result,
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'checkCompatibility');
    }
  },

  // Calculate financing
  async calculateFinancing(configuration: ConfigurationInput) {
    try {
      const result = await configuratorGraphQL.query(CALCULATE_FINANCING, { configuration });
      return {
        error: false,
        data: result,
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'calculateFinancing');
    }
  },

  // Estimate insurance
  async estimateInsurance(configuration: ConfigurationInput) {
    try {
      const result = await configuratorGraphQL.query(ESTIMATE_INSURANCE, { configuration });
      return {
        error: false,
        data: result,
        fallback: false
      };
    } catch (error) {
      return handleConfiguratorError(error, 'estimateInsurance');
    }
  },

  // Add configuration to cart
  async addConfigurationToCart(input: AddConfigurationInput) {
    return configuratorGraphQL.mutation(ADD_CONFIGURATION_TO_CART, { input });
  },

  // Update cart item configuration
  async updateCartItemConfiguration(input: UpdateCartItemConfigurationInput) {
    return configuratorGraphQL.mutation(UPDATE_CART_ITEM_CONFIGURATION, { input });
  },

  // Save configuration
  async saveConfiguration(input: SaveConfigurationInput) {
    return configuratorGraphQL.mutation(SAVE_CONFIGURATION, { input });
  },

  // Load configuration
  async loadConfiguration(id: string) {
    return configuratorGraphQL.query(LOAD_CONFIGURATION, { id });
  },
};