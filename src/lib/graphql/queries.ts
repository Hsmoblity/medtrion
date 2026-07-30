/**
 * Centralized GraphQL Query Templates
 * 
 * This file contains all GraphQL queries used throughout the application.
 * All other files should import and use these templates instead of defining their own.
 * 
 * Benefits:
 * - Single source of truth for all GraphQL queries
 * - Easier maintenance and updates
 * - Consistent field selection across the app
 * - Better type safety and validation
 * - Reduced code duplication
 */

import { gql } from 'graphql-request';

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/**
 * Get all products with basic information and related options
 * Used by: src/lib/woocommerce.ts - fetchGraphQLProducts()
 */
export const GET_ALL_PRODUCTS = gql`
  query GetProducts {
    products(where: { typeIn: [SIMPLE] }, first: 50) {
      nodes {
        id
        databaseId
        name
        slug
        description
        shortDescription
        productSpecifications
        
        # New GraphQL field added by WP plugin: relatedOptions
        relatedOptions
        seo {
          title
          description
          focusKeywords
        }
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
      }
    }
  }
`;

/**
 * Get single product by slug with comprehensive data
 * Used by: src/lib/graphql/configurator.ts - getProductBySlug()
 */
export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    products(where: { slugIn: [$slug] }, first: 1) {
      nodes {
        id
        databaseId
        name
        slug
        __typename
        shortDescription
        description
        seo {
          title
          description
          focusKeywords
        }
        localAttributes { 
          nodes { 
            label 
            options 
          } 
        }
        globalAttributes { 
          nodes { 
            label 
            terms { 
              nodes { 
                name 
              } 
            } 
          } 
        }
        relatedOptions
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
        ... on SimpleProduct { 
          price 
          regularPrice 
          salePrice 
          sku
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          sku
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
  }
`;

/**
 * Get products by database IDs (batch query)
 * Used by: src/lib/woocommerce.ts - fetchProductsByDatabaseIds()
 */
export const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [Int]) {
    products(where: { include: $ids, typeIn: [VARIABLE] }) {
      nodes {
        id
        databaseId
        name
        slug
        __typename
        description
        shortDescription
        productSpecifications
        globalAttributes { 
          nodes { 
            label 
            terms { 
              nodes { 
                name 
              } 
            } 
          } 
        }
        type
        # Prefer server-provided relatedOptions field from plugin
        relatedOptions
        variableType
        image { sourceUrl }
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
        ... on ProductWithVariations {
          attributes{
            nodes{
              name
            }
          }
          variations(first: 50) {
            nodes {
              id
              databaseId
              sku
              price
              regularPrice
              salePrice
              image { sourceUrl }
              attributes { nodes { id name value } }
            }
          }
        }
      }
    }
  }
`;

/**
 * Get single option product by database ID
 * Used by: src/lib/woocommerce.ts - fetchOptionProductById()
 * Used by: src/lib/graphql/configurator.ts - getOptionProductById()
 */
export const GET_OPTION_PRODUCT_BY_ID = gql`
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
`;

/**
 * Get option products by IDs with configurator-specific fields
 * Used by: src/lib/woocommerce.ts - fetchOptionProductsByIds()
 */
export const GET_OPTION_PRODUCTS_BY_IDS = gql`
  query GetOptionProductsByIds($ids: [Int]) {
    products(where: { include: $ids, typeIn: [VARIABLE] }) {
      nodes {
        id
        databaseId
        name
        slug
        __typename
        description
        shortDescription
        productSpecifications
        type
        relatedOptions
        variableType
        image { sourceUrl }
        galleryImages(first: 10) { 
          nodes { 
            sourceUrl 
          } 
        }
        ... on VariableProduct {
          price 
          regularPrice 
          salePrice 
          sku
          attributes {
            nodes {
              name
              label
              options
            }
          }
          variations(first: 50) {
            nodes {
              id
              databaseId
              name
              sku
              price
              regularPrice
              salePrice
              image { sourceUrl }
              attributes { 
                nodes { 
                  id 
                  name 
                  value 
                } 
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Get model with configuration categories
 * Used by: src/lib/graphql/configurator.ts - getModelWithCategories()
 */
export const GET_MODEL_WITH_CATEGORIES = gql`
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
`;

// ============================================================================
// CART QUERIES
// ============================================================================

/**
 * Get cart contents by cart key
 * Used by: src/lib/woocommerce.ts - fetchGraphQLCart()
 */
export const GET_CART = gql`
  query GetCart($key: String!) {
    cart(key: $key) {
      contents {
        nodes {
          product {
            node {
              id
              name
              image {
                sourceUrl
              }
            }
          }
          quantity
          total
        }
      }
      total
    }
  }
`;

// ============================================================================
// CONFIGURATOR QUERIES
// ============================================================================

/**
 * Get configuration categories for a model
 * Used by: src/lib/graphql/configurator.ts - getConfigurationCategories()
 */
export const GET_CONFIGURATION_CATEGORIES = gql`
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
`;

/**
 * Check compatibility between selected options
 * Used by: src/lib/graphql/configurator.ts - checkCompatibility()
 */
export const CHECK_COMPATIBILITY = gql`
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
`;

/**
 * Calculate financing options
 * Used by: src/lib/graphql/configurator.ts - calculateFinancing()
 */
export const CALCULATE_FINANCING = gql`
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
`;

/**
 * Estimate insurance coverage
 * Used by: src/lib/graphql/configurator.ts - estimateInsurance()
 */
export const ESTIMATE_INSURANCE = gql`
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
`;

/**
 * Load saved configuration
 * Used by: src/lib/graphql/configurator.ts - loadConfiguration()
 */
export const LOAD_CONFIGURATION = gql`
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
`;

// ============================================================================
// MUTATION QUERIES
// ============================================================================

/**
 * Add configuration to cart
 * Used by: src/lib/graphql/configurator.ts - addConfigurationToCart()
 */
export const ADD_CONFIGURATION_TO_CART = gql`
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
`;

/**
 * Update cart item configuration
 * Used by: src/lib/graphql/configurator.ts - updateCartItemConfiguration()
 */
export const UPDATE_CART_ITEM_CONFIGURATION = gql`
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
`;

/**
 * Save configuration
 * Used by: src/lib/graphql/configurator.ts - saveConfiguration()
 */
export const SAVE_CONFIGURATION = gql`
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
`;

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy CONFIGURATOR_QUERIES object for backward compatibility
 * @deprecated Use individual named exports instead
 */
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

/**
 * Legacy CONFIGURATOR_MUTATIONS object for backward compatibility
 * @deprecated Use individual named exports instead
 */
export const CONFIGURATOR_MUTATIONS = {
  ADD_CONFIGURATION_TO_CART,
  UPDATE_CART_ITEM_CONFIGURATION,
  SAVE_CONFIGURATION,
  LOAD_CONFIGURATION,
};

// ============================================================================
// HOMEPAGE QUERIES
// ============================================================================

/**
 * Get featured products for homepage
 * Used by: src/stores/homepageStore.ts - fetchFeaturedProducts()
 */
export const GET_FEATURED_PRODUCTS = gql`
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
      }
    }
  }
`;

// ============================================================================
// API MUTATIONS
// ============================================================================

/**
 * Create headless Stripe session
 * Used by: src/pages/api/stripe.ts
 */
export const CREATE_HEADLESS_STRIPE_SESSION = gql`
  mutation CreateHeadlessStripeSession($input: HeadlessStripeInput!) {
    createHeadlessStripeSession(input: $input) {
      sessionId
      publishableKey
      order {
        id
        orderNumber
      }
      errors
    }
  }
`;

/**
 * Create headless order
 * Used by: src/pages/api/create-order.ts
 */
export const CREATE_HEADLESS_ORDER = gql`
  mutation CreateHeadlessOrder($input: CreateHeadlessOrderInput!) {
    createHeadlessOrder(input: $input) {
      order { id orderNumber }
      errors
    }
  }
`;

// ============================================================================
// CONTACT PAGE QUERIES
// ============================================================================

/**
 * Get contact page information including logo
 * Used by: src/pages/contact.tsx - getServerSideProps()
 * 
 * NOTE: Logo field is String type (URL only) in WordPress ACF
 */
export const GET_CONTACT_INFO = gql`
  query GetContactInfo {
    page(id: "/contacts/", idType: URI) {
      contactFields {
        contactAddress
        contactEmail
        contactPhone {
          name
          number
        }
        openHours {
          day
          hours
        }
        logo
      }
    }
  }
`;

/**
 * Get site-wide settings including logo
 * Used for header, footer, and other global components
 */
export const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    generalSettings {
      title
      description
      url
    }
    # Custom logo from theme customizer or site settings
    siteLogo {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
`;

// ============================================================================
// QUERY DOCUMENTATION AND USAGE MAP
// ============================================================================

/**
 * Usage map for tracking which queries are used where
 * This helps with maintenance and refactoring
 */
export const QUERY_USAGE_MAP = {
  GET_ALL_PRODUCTS: ['src/lib/woocommerce.ts:fetchGraphQLProducts'],
  GET_PRODUCT_BY_SLUG: ['src/lib/graphql/configurator.ts:getProductBySlug'],
  GET_PRODUCTS_BY_IDS: ['src/lib/woocommerce.ts:fetchProductsByDatabaseIds'],
  GET_OPTION_PRODUCT_BY_ID: [
    'src/lib/woocommerce.ts:fetchOptionProductById',
    'src/lib/graphql/configurator.ts:getOptionProductById'
  ],
  GET_OPTION_PRODUCTS_BY_IDS: ['src/lib/woocommerce.ts:fetchOptionProductsByIds'],
  GET_MODEL_WITH_CATEGORIES: ['src/lib/graphql/configurator.ts:getModelWithCategories'],
  GET_CART: ['src/lib/woocommerce.ts:fetchGraphQLCart'],
  GET_CONFIGURATION_CATEGORIES: ['src/lib/graphql/configurator.ts:getConfigurationCategories'],
  CHECK_COMPATIBILITY: ['src/lib/graphql/configurator.ts:checkCompatibility'],
  CALCULATE_FINANCING: ['src/lib/graphql/configurator.ts:calculateFinancing'],
  ESTIMATE_INSURANCE: ['src/lib/graphql/configurator.ts:estimateInsurance'],
  LOAD_CONFIGURATION: ['src/lib/graphql/configurator.ts:loadConfiguration'],
  ADD_CONFIGURATION_TO_CART: ['src/lib/graphql/configurator.ts:addConfigurationToCart'],
  UPDATE_CART_ITEM_CONFIGURATION: ['src/lib/graphql/configurator.ts:updateCartItemConfiguration'],
  SAVE_CONFIGURATION: ['src/lib/graphql/configurator.ts:saveConfiguration'],
  GET_FEATURED_PRODUCTS: ['src/stores/homepageStore.ts:fetchFeaturedProducts'],
  CREATE_HEADLESS_STRIPE_SESSION: ['src/pages/api/stripe.ts'],
  CREATE_HEADLESS_ORDER: ['src/pages/api/create-order.ts'],
  GET_CONTACT_INFO: ['src/pages/contact.tsx:getServerSideProps'],
  GET_SITE_SETTINGS: ['src/pages/_app.tsx', 'src/components/PageLayout/Header.tsx'],
} as const;

// All queries are already exported individually above
// No need for duplicate export block