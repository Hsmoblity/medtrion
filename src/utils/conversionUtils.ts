/**
 * Conversion utilities between Configuration and CartProduct formats
 * Implements the standardized conversion specifications from PRDs
 */

import { CartProduct } from '../lib/interfaces/cart';
import { 
  ConfigurableProductSchema, 
  ConfigurationSummary,
  CompatibilityIssue
} from '../lib/interfaces/configurator';

/**
 * Configuration interface aligned with standardized specifications
 */
export interface Configuration {
  baseModel: ConfigurableProductSchema;
  selectedOptions: Record<string, ConfigurableProductSchema[]>;
  summary: ConfigurationSummary;
  compatibilityIssues: CompatibilityIssue[];
  editSessionId?: string;
}

/**
 * Configuration Change Summary for edit sessions
 */
export interface ConfigurationChangeSummary {
  addedOptions: ConfigurableProductSchema[];
  removedOptions: ConfigurableProductSchema[];
  priceChange: number;
  categoryChanges: Record<string, {
    added: ConfigurableProductSchema[];
    removed: ConfigurableProductSchema[];
  }>;
}

/**
 * Convert Configuration format to CartProduct format
 * Used when saving configuration to cart or updating cart items
 */
export const configurationToCartProduct = (config: Configuration): Partial<CartProduct> => {
  const allSelectedOptions = Object.values(config.selectedOptions || {}).flat();
  
  return {
    slug: config.baseModel.slug || '',
    title: config.baseModel.name || '',
    description: config.baseModel.description || '',
    shortDescription: config.baseModel.shortDescription || '',
    featuredImage: config.baseModel.image,
    productSpecifications: config.baseModel.productSpecifications || '',
    productPictures: config.baseModel.productPictures || [],
    price: config.summary?.grandTotal || parseFloat(config.baseModel.price?.toString() || '0'),
    affiliate: false,
    quantity: 1,
    variationId: config.baseModel.databaseId?.toString(),
    options: allSelectedOptions.map(option => ({
      name: option.name || '',
      type: option.optionType || 'option',
      selected: true,
      quantity: 1,
      value: option.id || option.databaseId?.toString() || '',
      priceModifier: parseFloat(option.price?.toString() || '0')
    })),
    // Store configuration metadata in _related_options for compatibility
    _related_options: allSelectedOptions.map(opt => opt.databaseId).filter(Boolean) as number[],
    _related_options_products: allSelectedOptions.map(option => ({
      id: option.id,
      databaseId: option.databaseId,
      name: option.name,
      slug: option.slug,
      description: option.description,
      type: option.optionType
    }))
  };
};

/**
 * Convert CartProduct format to Configuration format
 * Used when loading cart items into configurator for editing
 */
export const cartProductToConfiguration = (item: CartProduct): Configuration => {
  const selectedOptions: Record<string, ConfigurableProductSchema[]> = {};
  
  // Use _related_options_products if available, otherwise convert from options
  if (item._related_options_products) {
    item._related_options_products.forEach(relatedProduct => {
      if (!relatedProduct) return;
      
      const categoryId = relatedProduct.type || 'uncategorized';
      if (!selectedOptions[categoryId]) {
        selectedOptions[categoryId] = [];
      }
      
      selectedOptions[categoryId].push({
        id: relatedProduct.id || relatedProduct.slug || '',
        databaseId: relatedProduct.databaseId,
        name: relatedProduct.name,
        title: relatedProduct.name || '',
        slug: relatedProduct.slug || '',
        description: relatedProduct.description || '',
        shortDescription: relatedProduct.description || '',
        featuredImage: null,
        productSpecifications: '',
        productPictures: [],
        price: 0,
        affiliate: false,
        optionType: (relatedProduct.type as any) || 'ACCESSORY'
      } as ConfigurableProductSchema);
    });
  } else if (item.options) {
    // Fallback: convert from simple options array
    item.options.forEach(option => {
      const categoryId = option.type || 'uncategorized';
      if (!selectedOptions[categoryId]) {
        selectedOptions[categoryId] = [];
      }
      
      selectedOptions[categoryId].push({
        id: option.value || option.name,
        name: option.name,
        title: option.name,
        slug: option.value || option.name.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        shortDescription: '',
        featuredImage: null,
        productSpecifications: '',
        productPictures: [],
        price: option.priceModifier || 0,
        affiliate: false,
        optionType: (option.type as any) || 'ACCESSORY'
      } as ConfigurableProductSchema);
    });
  }
  
  return {
    baseModel: {
      id: item.slug,
      databaseId: (typeof item.variationId === 'string' ? parseInt(item.variationId) : item.variationId) || 0,
      name: item.title,
      title: item.title,
      slug: item.slug,
      description: item.description,
      shortDescription: item.shortDescription,
      featuredImage: item.featuredImage,
      productSpecifications: item.productSpecifications,
      productPictures: item.productPictures,
      price: item.price,
      affiliate: item.affiliate,
      baseModel: true
    } as ConfigurableProductSchema,
    selectedOptions,
    summary: {
      basePrice: item.price,
      optionsTotal: (item.options || []).reduce((sum, opt) => sum + (opt.priceModifier || 0), 0),
      installationCost: 0,
      shippingCost: 0,
      taxAmount: 0,
      grandTotal: item.price,
      estimatedDelivery: '2-3 weeks'
    },
    compatibilityIssues: []
  };
};

/**
 * Calculate changes between original and current configuration
 * Used for edit session change tracking
 */
export const calculateConfigurationChanges = (
  originalConfig: Configuration,
  currentConfig: Configuration
): ConfigurationChangeSummary => {
  const originalOptions = Object.values(originalConfig.selectedOptions || {}).flat();
  const currentOptions = Object.values(currentConfig.selectedOptions || {}).flat();
  
  const addedOptions: ConfigurableProductSchema[] = [];
  const removedOptions: ConfigurableProductSchema[] = [];
  const categoryChanges: Record<string, { added: ConfigurableProductSchema[]; removed: ConfigurableProductSchema[] }> = {};
  
  // Find added options
  currentOptions.forEach(option => {
    const wasSelected = originalOptions.some(orig => 
      orig.id === option.id || orig.databaseId === option.databaseId
    );
    if (!wasSelected) {
      addedOptions.push(option);
      
      const categoryId = option.optionType || 'uncategorized';
      if (!categoryChanges[categoryId]) {
        categoryChanges[categoryId] = { added: [], removed: [] };
      }
      categoryChanges[categoryId].added.push(option);
    }
  });
  
  // Find removed options
  originalOptions.forEach(option => {
    const stillSelected = currentOptions.some(curr => 
      curr.id === option.id || curr.databaseId === option.databaseId
    );
    if (!stillSelected) {
      removedOptions.push(option);
      
      const categoryId = option.optionType || 'uncategorized';
      if (!categoryChanges[categoryId]) {
        categoryChanges[categoryId] = { added: [], removed: [] };
      }
      categoryChanges[categoryId].removed.push(option);
    }
  });
  
  const priceChange = (currentConfig.summary?.grandTotal || 0) - (originalConfig.summary?.grandTotal || 0);
  
  return {
    addedOptions,
    removedOptions,
    priceChange,
    categoryChanges
  };
};

/**
 * Validate configuration for consistency
 * Used before converting or saving configurations
 */
export const validateConfiguration = (config: Configuration): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!config.baseModel) {
    errors.push('Configuration must have a base model');
  }
  
  if (!config.baseModel?.slug) {
    errors.push('Base model must have a slug');
  }
  
  if (!config.summary) {
    errors.push('Configuration must have a summary');
  }
  
  // Validate selected options
  Object.entries(config.selectedOptions || {}).forEach(([categoryId, options]) => {
    if (!Array.isArray(options)) {
      errors.push(`Selected options for category ${categoryId} must be an array`);
    }
    
    options.forEach((option, index) => {
      if (!option.id && !option.databaseId) {
        errors.push(`Option ${index} in category ${categoryId} must have an id or databaseId`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate cart product for configuration compatibility
 * Used before converting cart items to configurations
 */
export const validateCartProductForConfiguration = (item: CartProduct): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!item.slug) {
    errors.push('Cart item must have a slug');
  }
  
  if (!item.title) {
    errors.push('Cart item must have a title');
  }
  
  if (!item.cartItemId) {
    errors.push('Cart item must have a cartItemId');
  }
  
  // Check if it's a configurator item (by checking for related products)
  if (!item._related_options_products && !item._related_options) {
    errors.push('Cart item does not appear to be a configurator item (missing related options)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Merge two configurations
 * Used for applying updates to existing configurations
 */
export const mergeConfigurations = (base: Configuration, updates: Partial<Configuration>): Configuration => {
  return {
    baseModel: updates.baseModel || base.baseModel,
    selectedOptions: updates.selectedOptions || base.selectedOptions,
    summary: updates.summary ? { ...base.summary, ...updates.summary } : base.summary,
    compatibilityIssues: updates.compatibilityIssues || base.compatibilityIssues,
    editSessionId: updates.editSessionId || base.editSessionId
  };
};

/**
 * Create a deep copy of a configuration
 * Used for creating backups before modifications
 */
export const cloneConfiguration = (config: Configuration): Configuration => {
  return JSON.parse(JSON.stringify(config));
};