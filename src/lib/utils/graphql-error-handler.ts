/**
 * GraphQL Error Handler Utility
 * Provides centralized error handling for GraphQL requests with timeout management,
 * retry logic, and graceful fallback mechanisms.
 */

export interface GraphQLErrorContext {
  url: string;
  attempt: number;
  maxAttempts: number;
  message: string;
  stack?: string;
  cause?: string;
}

export interface GraphQLRequestOptions {
  timeout?: number;
  maxAttempts?: number;
  retryDelay?: number;
  enableRetry?: boolean;
}

export class GraphQLTimeoutError extends Error {
  constructor(message: string, public context: GraphQLErrorContext) {
    super(message);
    this.name = 'GraphQLTimeoutError';
  }
}

export class GraphQLNetworkError extends Error {
  constructor(message: string, public context: GraphQLErrorContext) {
    super(message);
    this.name = 'GraphQLNetworkError';
  }
}

export class GraphQLValidationError extends Error {
  constructor(message: string, public url: string) {
    super(message);
    this.name = 'GraphQLValidationError';
  }
}

/**
 * Validates GraphQL endpoint URL and configuration
 */
export function validateGraphQLEndpoint(url: string): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: 'GraphQL URL is required' };
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'GraphQL URL must use HTTP or HTTPS protocol' };
    }
    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: `Invalid GraphQL URL format: ${url}` };
  }
}

/**
 * Creates a fetch request with timeout support
 */
export function createTimeoutFetch(timeoutMs: number = 10000) {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  };
}

/**
 * Implements exponential backoff for retry delays
 */
export function calculateRetryDelay(attempt: number, baseDelay: number = 300): number {
  return baseDelay * Math.pow(2, attempt - 1);
}

/**
 * Categorizes GraphQL errors for appropriate handling
 */
export function categorizeGraphQLError(error: any): 'timeout' | 'network' | 'graphql' | 'unknown' {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('timeout') || message.includes('aborted') || error.name === 'AbortError') {
    return 'timeout';
  }
  
  if (message.includes('fetch failed') || message.includes('network') || message.includes('connect')) {
    return 'network';
  }
  
  if (message.includes('graphql') || error?.errors) {
    return 'graphql';
  }
  
  return 'unknown';
}

/**
 * Logs GraphQL errors with appropriate context
 */
export function logGraphQLError(error: any, context: Partial<GraphQLErrorContext> = {}) {
  const errorCategory = categorizeGraphQLError(error);
  const errorContext: GraphQLErrorContext = {
    url: context.url || 'unknown',
    attempt: context.attempt || 1,
    maxAttempts: context.maxAttempts || 1,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    cause: error?.cause?.toString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(`GraphQL ${errorCategory} error (attempt ${errorContext.attempt}/${errorContext.maxAttempts}):`, {
      url: errorContext.url,
      message: errorContext.message,
      stack: errorContext.stack,
      cause: errorContext.cause,
    });
  } else {
    console.warn(`GraphQL request failed: ${errorCategory} error on attempt ${errorContext.attempt}`);
  }

  return { errorCategory, errorContext };
}

/**
 * Default options for GraphQL requests
 */
export const DEFAULT_GRAPHQL_OPTIONS: Required<GraphQLRequestOptions> = {
  timeout: 10000, // 10 seconds
  maxAttempts: 3,
  retryDelay: 300, // 300ms base delay
  enableRetry: true,
};