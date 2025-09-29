// GraphQL integration for ModelConfigurator
// This file contains GraphQL queries and mutations for the configurator functionality

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
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL query failed:', error);
      throw error;
    }
  }

  async mutation(mutation: string, variables?: Record<string, any>) {
    return this.query(mutation, variables);
  }
}

// GraphQL Queries
export const CONFIGURATOR_QUERIES = {
  // Get single option product by database ID
  GET_OPTION_PRODUCT_BY_ID: `
    query GetOptionProductById($id: ID!) {
      product(id: $id, idType: DATABASE_ID) {
        id
        databaseId
        name
        slug
        title: name
        description
        shortDescription
        price
        regularPrice
        salePrice
        sku
        type
        image {
          sourceUrl
          altText
        }
        galleryImages(first: 10) {
          nodes {
            sourceUrl
            altText
          }
        }
        productSpecifications
        relatedOptions
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          variableType
          attributes {
            nodes {
              id
              name
            }
          }
          variations(first: 50) {
            nodes {
              id
              databaseId
              name
              price
              regularPrice
              salePrice
              sku
              image {
                sourceUrl
                altText
              }
              attributes {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `,

  // Get base model with configuration categories
  GET_MODEL_WITH_CATEGORIES: `
    query GetModelWithCategories($slug: String!) {
      products(where: { slug: $slug }, first: 1) {
        nodes {
        id
        databaseId
        name
        slug
        title: name
        description
        shortDescription
        price
        regularPrice
        salePrice
        sku
        image {
          sourceUrl
          altText
        }
        galleryImages(first: 10) {
          nodes {
            sourceUrl
            altText
          }
        }
        productSpecifications
        relatedOptions
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          variations(first: 50) {
            nodes {
              id
              databaseId
              name
              price
              regularPrice
              salePrice
              sku
              image {
                sourceUrl
                altText
              }
              attributes {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
        configuratorCategories {
          id
          name
          slug
          description
          icon
          required
          multiSelect
          minSelections
          maxSelections
          options {
            id
            databaseId
            name
            title: name
            description
            shortDescription
            price
            regularPrice
            salePrice
            sku
            image {
              sourceUrl
              altText
            }
            optionType
            compatibilityRules
            installationRequired
            financingAvailable
            safetyRating
            adaCompliant
            weightCapacity
          }
          compatibilityRules
          helpText
        }
        compatibilityRules
        installationRequired
        financingAvailable
        insuranceCoverage
        safetyRating
        adaCompliant
        weightCapacity
        }
      }
    }
  `,

  // Get configuration categories for a model
  GET_CONFIGURATION_CATEGORIES: `
    query GetConfigurationCategories($modelId: ID!) {
      configuratorCategories(modelId: $modelId) {
        id
        name
        slug
        description
        icon
        required
        multiSelect
        minSelections
        maxSelections
        options {
          id
          databaseId
          name
          title
          description
          shortDescription
          price
          regularPrice
          salePrice
          sku
          image {
            sourceUrl
            altText
          }
          optionType
          compatibilityRules {
            id
            name
            description
            affectedOptions
            autoResolvable
          }
          installationRequired
          financingAvailable
          safetyRating
          adaCompliant
          weightCapacity
        }
        compatibilityRules {
          id
          name
          description
          affectedOptions
          autoResolvable
        }
        helpText
      }
    }
  `,

  // Check compatibility between selected options
  CHECK_COMPATIBILITY: `
    query CheckCompatibility($selectedOptions: [ID!]!) {
      checkCompatibility(selectedOptions: $selectedOptions) {
        issues {
          id
          rule {
            id
            name
            description
            affectedOptions
            autoResolvable
          }
          affectedOptions
          severity
          message
          autoResolvable
          suggestedResolutions {
            id
            description
            action
          }
        }
      }
    }
  `,

  // Calculate financing options
  CALCULATE_FINANCING: `
    query CalculateFinancing($configuration: ConfigurationInput!) {
      calculateFinancing(configuration: $configuration) {
        options {
          id
          name
          description
          monthlyPayment
          termMonths
          interestRate
          totalCost
          downPayment
          requiresPreApproval
          eligibility {
            minCreditScore
            maxDebtToIncomeRatio
            employmentRequirements
          }
        }
      }
    }
  `,

  // Estimate insurance coverage
  ESTIMATE_INSURANCE: `
    query EstimateInsurance($configuration: ConfigurationInput!) {
      estimateInsurance(configuration: $configuration) {
        estimatedCoverage
        coveragePercentage
        requirements {
          documentation
          preApproval
          medicalNecessity
        }
        providers {
          name
          coverageType
          estimatedCoverage
          contactInfo
        }
      }
    }
  `,
};

// GraphQL Mutations
export const CONFIGURATOR_MUTATIONS = {
  // Add configuration to cart
  ADD_CONFIGURATION_TO_CART: `
    mutation AddConfigurationToCart($input: AddConfigurationInput!) {
      addConfigurationToCart(input: $input) {
        cart {
          contents {
            nodes {
              key
              product {
                node {
                  id
                  databaseId
                  name
                  price
                  image {
                    sourceUrl
                  }
                }
              }
              quantity
              total
              extraData {
                key
                value
              }
            }
          }
          total
          subtotal
          totalTax
        }
        errors {
          field
          message
        }
      }
    }
  `,

  // Update cart item configuration
  UPDATE_CART_ITEM_CONFIGURATION: `
    mutation UpdateCartItemConfiguration($input: UpdateCartItemConfigurationInput!) {
      updateCartItemConfiguration(input: $input) {
        cart {
          contents {
            nodes {
              key
              product {
                node {
                  id
                  databaseId
                  name
                  price
                  image {
                    sourceUrl
                  }
                }
              }
              quantity
              total
              extraData {
                key
                value
              }
            }
          }
          total
          subtotal
          totalTax
        }
        errors {
          field
          message
        }
      }
    }
  `,

  // Save configuration
  SAVE_CONFIGURATION: `
    mutation SaveConfiguration($input: SaveConfigurationInput!) {
      saveConfiguration(input: $input) {
        configuration {
          id
          name
          baseModelId
          optionIds
          totalPrice
          createdAt
          notes
        }
        errors {
          field
          message
        }
      }
    }
  `,

  // Load saved configuration
  LOAD_CONFIGURATION: `
    query LoadConfiguration($id: ID!) {
      configuration(id: $id) {
        id
        name
        baseModelId
        optionIds
        totalPrice
        createdAt
        notes
        baseModel {
          id
          databaseId
          name
          slug
          title
          description
          price
          image {
            sourceUrl
            altText
          }
        }
        selectedOptions {
          id
          databaseId
          name
          title
          description
          price
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  `,
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

// Helper functions for common operations
export const configuratorAPI = {
  // Get single option product by database ID
  async getOptionProductById(id: string | number) {
    try {
      const result = await configuratorGraphQL.query(CONFIGURATOR_QUERIES.GET_OPTION_PRODUCT_BY_ID, { id });
      
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
      const result = await configuratorGraphQL.query(CONFIGURATOR_QUERIES.GET_MODEL_WITH_CATEGORIES, { slug });
      
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
      const result = await configuratorGraphQL.query(CONFIGURATOR_QUERIES.GET_CONFIGURATION_CATEGORIES, { modelId });
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
      const result = await configuratorGraphQL.query(CONFIGURATOR_QUERIES.CHECK_COMPATIBILITY, { selectedOptions });
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
      const result = await configuratorGraphQL.query(CONFIGURATOR_QUERIES.CALCULATE_FINANCING, { configuration });
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
      const result = await configuratorGraphQL.query(CONFIGURATOR_QUERIES.ESTIMATE_INSURANCE, { configuration });
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
    return configuratorGraphQL.mutation(CONFIGURATOR_MUTATIONS.ADD_CONFIGURATION_TO_CART, { input });
  },

  // Update cart item configuration
  async updateCartItemConfiguration(input: UpdateCartItemConfigurationInput) {
    return configuratorGraphQL.mutation(CONFIGURATOR_MUTATIONS.UPDATE_CART_ITEM_CONFIGURATION, { input });
  },

  // Save configuration
  async saveConfiguration(input: SaveConfigurationInput) {
    return configuratorGraphQL.mutation(CONFIGURATOR_MUTATIONS.SAVE_CONFIGURATION, { input });
  },

  // Load configuration
  async loadConfiguration(id: string) {
    return configuratorGraphQL.query(CONFIGURATOR_MUTATIONS.LOAD_CONFIGURATION, { id });
  },
};