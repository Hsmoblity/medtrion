/**
 * Production environment validation utilities
 * Ensures live endpoints are configured and mock data is disabled
 */

interface EnvironmentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that production environment has live endpoints configured
 * and no mock data dependencies
 */
export const validateProductionEnvironment = (): EnvironmentValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Check for required live endpoint configurations
    const hasConfiguratorEndpoint = !!(
      process.env.CONFIGURATOR_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL
    );
    
    const hasWPEndpoint = !!(
      process.env.WP_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL
    );
    
    const hasContentfulConfig = !!(
      process.env.CONTENTFUL_SPACE_ID &&
      process.env.CONTENTFUL_ACCESS_TOKEN
    );

    // At least one data source should be configured
    if (!hasConfiguratorEndpoint && !hasWPEndpoint && !hasContentfulConfig) {
      errors.push('No live data endpoints configured. Configure at least one of: CONFIGURATOR_GRAPHQL_URL, WP_GRAPHQL_URL, or Contentful credentials');
    } else {
      if (!hasConfiguratorEndpoint) {
        warnings.push('CONFIGURATOR_GRAPHQL_URL not configured - configurator features may fall back to mock data');
      }
      
      if (!hasWPEndpoint) {
        warnings.push('WP_GRAPHQL_URL not configured - WooCommerce features may be limited');
      }
      
      if (!hasContentfulConfig) {
        warnings.push('Contentful credentials not configured - CMS content may be unavailable');
      }
    }

    // Check for potentially problematic environment variables
    if (process.env.NEXT_RELAX_CREATE_ORDER === '1') {
      warnings.push('NEXT_RELAX_CREATE_ORDER is enabled in production - debug mode active for order creation');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Logs environment validation results
 */
export const logEnvironmentValidation = () => {
  const validation = validateProductionEnvironment();
  
  if (process.env.NODE_ENV === 'production') {
    if (validation.isValid) {
      console.info('✅ Production environment validation passed');
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Production environment warnings:', validation.warnings);
      }
    } else {
      console.error('❌ Production environment validation failed:', validation.errors);
      if (validation.warnings.length > 0) {
        console.warn('⚠️ Additional warnings:', validation.warnings);
      }
    }
  } else {
    console.info('🔄 Development environment detected - mock data and debug endpoints enabled');
  }
};

/**
 * Throws an error if production environment is not properly configured
 */
export const assertProductionEnvironment = () => {
  const validation = validateProductionEnvironment();
  
  if (process.env.NODE_ENV === 'production' && !validation.isValid) {
    throw new Error(`Production environment misconfigured: ${validation.errors.join(', ')}`);
  }
};

/**
 * Returns whether mock/debug features should be enabled
 */
export const shouldEnableMockData = (): boolean => {
  // Only enable in development or when explicitly forced
  return process.env.NODE_ENV === 'development' || process.env.FORCE_ENABLE_MOCKS === 'true';
};

/**
 * Returns whether debug endpoints should be enabled
 */
export const shouldEnableDebugEndpoints = (): boolean => {
  // Only enable in development or when explicitly forced
  return process.env.NODE_ENV === 'development' || process.env.FORCE_ENABLE_DEBUG === 'true';
};