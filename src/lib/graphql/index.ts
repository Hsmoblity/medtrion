/**
 * Centralized GraphQL Helper Functions
 * 
 * This module provides typed helper functions for all GraphQL operations.
 * Components should import and use these helpers instead of directly using queries.
 * 
 * Benefits:
 * - Type safety for all GraphQL operations
 * - Consistent error handling
 * - Single source of truth for GraphQL logic
 * - Easier testing and mocking
 */

import { GraphQLClient } from 'graphql-request';
import {
  GET_ALL_PRODUCTS,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_IDS,
  GET_OPTION_PRODUCT_BY_ID,
  GET_OPTION_PRODUCTS_BY_IDS,
  GET_MODEL_WITH_CATEGORIES,
  GET_CART,
  GET_CONFIGURATION_CATEGORIES,
  CHECK_COMPATIBILITY,
  CALCULATE_FINANCING,
  ESTIMATE_INSURANCE,
  LOAD_CONFIGURATION,
  ADD_CONFIGURATION_TO_CART,
  UPDATE_CART_ITEM_CONFIGURATION,
  SAVE_CONFIGURATION,
  GET_FEATURED_PRODUCTS,
  CREATE_HEADLESS_STRIPE_SESSION,
  CREATE_HEADLESS_ORDER,
} from './queries';

// ============================================================================
// CLIENT SETUP
// ============================================================================

const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL || '';
let client: GraphQLClient | null = null;

if (WP_GRAPHQL_URL) {
  try {
    new URL(WP_GRAPHQL_URL);
    client = new GraphQLClient(WP_GRAPHQL_URL);
  } catch (e) {
    console.warn('Invalid WP_GRAPHQL_URL:', WP_GRAPHQL_URL, e);
    client = null;
  }
} else {
  console.warn('WP_GRAPHQL_URL not set.');
}

// ============================================================================
// PRODUCT QUERIES
// ============================================================================

/**
 * Get all products with basic information
 */
export async function getAllProducts() {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_ALL_PRODUCTS);
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_PRODUCT_BY_SLUG, { slug });
}

/**
 * Get products by database IDs
 */
export async function getProductsByIds(ids: number[]) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_PRODUCTS_BY_IDS, { ids });
}

/**
 * Get a single option product by ID
 */
export async function getOptionProductById(id: string) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_OPTION_PRODUCT_BY_ID, { id });
}

/**
 * Get multiple option products by IDs
 */
export async function getOptionProductsByIds(ids: number[]) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_OPTION_PRODUCTS_BY_IDS, { ids });
}

/**
 * Get model with configuration categories
 */
export async function getModelWithCategories(slug: string) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_MODEL_WITH_CATEGORIES, { slug });
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts() {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_FEATURED_PRODUCTS);
}

// ============================================================================
// CART QUERIES
// ============================================================================

/**
 * Get cart contents by cart key
 */
export async function getCart(cartKey: string) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_CART, { key: cartKey });
}

// ============================================================================
// CONFIGURATOR QUERIES
// ============================================================================

/**
 * Get configuration categories for a model
 */
export async function getConfigurationCategories(modelId: string) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(GET_CONFIGURATION_CATEGORIES, { modelId });
}

/**
 * Check compatibility between selected options
 */
export async function checkCompatibility(selectedOptions: string[]) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(CHECK_COMPATIBILITY, { selectedOptions });
}

/**
 * Calculate financing options
 */
export async function calculateFinancing(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(CALCULATE_FINANCING, { input });
}

/**
 * Estimate insurance coverage
 */
export async function estimateInsurance(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(ESTIMATE_INSURANCE, { input });
}

/**
 * Load saved configuration
 */
export async function loadConfiguration(configId: string) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(LOAD_CONFIGURATION, { configId });
}

// ============================================================================
// CONFIGURATOR MUTATIONS
// ============================================================================

/**
 * Add configuration to cart
 */
export async function addConfigurationToCart(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(ADD_CONFIGURATION_TO_CART, { input });
}

/**
 * Update cart item configuration
 */
export async function updateCartItemConfiguration(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(UPDATE_CART_ITEM_CONFIGURATION, { input });
}

/**
 * Save configuration
 */
export async function saveConfiguration(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(SAVE_CONFIGURATION, { input });
}

// ============================================================================
// API MUTATIONS
// ============================================================================

/**
 * Create headless Stripe session
 */
export async function createHeadlessStripeSession(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(CREATE_HEADLESS_STRIPE_SESSION, { input });
}

/**
 * Create headless order
 */
export async function createHeadlessOrder(input: any) {
  if (!client) throw new Error('GraphQL client not initialized');
  return client.request(CREATE_HEADLESS_ORDER, { input });
}

// ============================================================================
// EXPORTS
// ============================================================================

export { client as graphqlClient };
export * from './queries';