import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  validateGraphQLEndpoint, 
  createTimeoutFetch, 
  categorizeGraphQLError,
  logGraphQLError,
  calculateRetryDelay,
  GraphQLTimeoutError,
  GraphQLNetworkError,
  GraphQLValidationError
} from '../../src/lib/utils/graphql-error-handler';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GraphQL Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('validateGraphQLEndpoint', () => {
    it('should return valid for proper HTTPS URL', () => {
      const result = validateGraphQLEndpoint('https://example.com/graphql');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return valid for proper HTTP URL', () => {
      const result = validateGraphQLEndpoint('http://localhost:3000/graphql');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for empty URL', () => {
      const result = validateGraphQLEndpoint('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GraphQL URL is required');
    });

    it('should return invalid for malformed URL', () => {
      const result = validateGraphQLEndpoint('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid GraphQL URL format');
    });

    it('should return invalid for non-HTTP protocol', () => {
      const result = validateGraphQLEndpoint('ftp://example.com/graphql');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GraphQL URL must use HTTP or HTTPS protocol');
    });
  });

  describe('createTimeoutFetch', () => {
    it('should resolve when fetch completes before timeout', async () => {
      const mockResponse = new Response('{"data": {}}', { status: 200 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const timeoutFetch = createTimeoutFetch(5000);
      const result = await timeoutFetch('https://example.com/graphql', {
        method: 'POST',
        body: '{"query": "test"}',
      });

      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/graphql', expect.objectContaining({
        method: 'POST',
        body: '{"query": "test"}',
        signal: expect.any(AbortSignal),
      }));
    });

    it('should timeout when fetch takes too long', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const timeoutFetch = createTimeoutFetch(1000);
      const fetchPromise = timeoutFetch('https://example.com/graphql');

      // Fast-forward time to trigger timeout
      vi.advanceTimersByTime(1000);

      await expect(fetchPromise).rejects.toThrow('Request timeout after 1000ms');
    });

    it('should handle fetch errors properly', async () => {
      const fetchError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(fetchError);

      const timeoutFetch = createTimeoutFetch(5000);

      await expect(timeoutFetch('https://example.com/graphql')).rejects.toThrow('Network error');
    });
  });

  describe('categorizeGraphQLError', () => {
    it('should categorize timeout errors', () => {
      const timeoutError = new Error('Request timeout after 5000ms');
      expect(categorizeGraphQLError(timeoutError)).toBe('timeout');

      const abortError = { name: 'AbortError', message: 'Request aborted' };
      expect(categorizeGraphQLError(abortError)).toBe('timeout');
    });

    it('should categorize network errors', () => {
      const networkError = new Error('fetch failed');
      expect(categorizeGraphQLError(networkError)).toBe('network');

      const connectError = new Error('Connect Timeout Error');
      expect(categorizeGraphQLError(connectError)).toBe('network');
    });

    it('should categorize GraphQL errors', () => {
      const graphqlError = new Error('GraphQL errors: syntax error');
      expect(categorizeGraphQLError(graphqlError)).toBe('graphql');

      const errorWithGraphQLField = { errors: [{ message: 'Field error' }] };
      expect(categorizeGraphQLError(errorWithGraphQLField)).toBe('graphql');
    });

    it('should categorize unknown errors', () => {
      const unknownError = new Error('Something else went wrong');
      expect(categorizeGraphQLError(unknownError)).toBe('unknown');
    });
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff correctly', () => {
      expect(calculateRetryDelay(1, 300)).toBe(300);   // 300 * 2^0
      expect(calculateRetryDelay(2, 300)).toBe(600);   // 300 * 2^1
      expect(calculateRetryDelay(3, 300)).toBe(1200);  // 300 * 2^2
      expect(calculateRetryDelay(4, 300)).toBe(2400);  // 300 * 2^3
    });

    it('should use default base delay when not provided', () => {
      expect(calculateRetryDelay(1)).toBe(300);
      expect(calculateRetryDelay(2)).toBe(600);
    });
  });

  describe('logGraphQLError', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = {
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      };
    });

    afterEach(() => {
      consoleSpy.error.mockRestore();
      consoleSpy.warn.mockRestore();
    });

    it('should log detailed error in development', () => {
      // Mock NODE_ENV using vi.stubEnv
      vi.stubEnv('NODE_ENV', 'development');

      const error = new Error('Test error');
      const result = logGraphQLError(error, {
        url: 'https://example.com/graphql',
        attempt: 2,
        maxAttempts: 3,
      });

      expect(result.errorCategory).toBe('unknown');
      expect(result.errorContext.url).toBe('https://example.com/graphql');
      expect(result.errorContext.attempt).toBe(2);
      expect(result.errorContext.maxAttempts).toBe(3);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('GraphQL unknown error'),
        expect.objectContaining({
          url: 'https://example.com/graphql',
          message: 'Test error',
        })
      );

      vi.unstubAllEnvs();
    });

    it('should log warning in production', () => {
      // Mock NODE_ENV using vi.stubEnv
      vi.stubEnv('NODE_ENV', 'production');

      const error = new Error('Test error');
      logGraphQLError(error, { attempt: 1, maxAttempts: 3 });

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('GraphQL request failed: unknown error on attempt 1')
      );

      vi.unstubAllEnvs();
    });
  });

  describe('Error Classes', () => {
    it('should create GraphQLTimeoutError correctly', () => {
      const context = {
        url: 'https://example.com/graphql',
        attempt: 3,
        maxAttempts: 3,
        message: 'Timeout',
      };
      const error = new GraphQLTimeoutError('Request timed out', context);

      expect(error.name).toBe('GraphQLTimeoutError');
      expect(error.message).toBe('Request timed out');
      expect(error.context).toBe(context);
    });

    it('should create GraphQLNetworkError correctly', () => {
      const context = {
        url: 'https://example.com/graphql',
        attempt: 2,
        maxAttempts: 3,
        message: 'Network error',
      };
      const error = new GraphQLNetworkError('Network failed', context);

      expect(error.name).toBe('GraphQLNetworkError');
      expect(error.message).toBe('Network failed');
      expect(error.context).toBe(context);
    });

    it('should create GraphQLValidationError correctly', () => {
      const error = new GraphQLValidationError('Invalid URL', 'bad-url');

      expect(error.name).toBe('GraphQLValidationError');
      expect(error.message).toBe('Invalid URL');
      expect(error.url).toBe('bad-url');
    });
  });
});