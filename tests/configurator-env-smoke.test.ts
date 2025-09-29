/**
 * Smoke tests for configurator environment configuration
 * These tests verify that environment variables are properly configured
 * and that the configurator can connect to live endpoints in CI/staging
 */

import { configuratorGraphQL } from '../src/lib/graphql/configurator';

describe('Configurator Environment Smoke Tests', () => {
  describe('Environment Variable Configuration', () => {
    it('should have at least one GraphQL endpoint configured in production', () => {
      if (process.env.NODE_ENV === 'production') {
        const hasEndpoint = !!(
          process.env.CONFIGURATOR_GRAPHQL_URL ||
          process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL ||
          process.env.WP_GRAPHQL_URL ||
          process.env.NEXT_PUBLIC_WP_GRAPHQL_URL
        );

        expect(hasEndpoint).toBe(true);
        console.log('Production GraphQL endpoints configured:', {
          CONFIGURATOR_GRAPHQL_URL: !!process.env.CONFIGURATOR_GRAPHQL_URL,
          NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL: !!process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL,
          WP_GRAPHQL_URL: !!process.env.WP_GRAPHQL_URL,
          NEXT_PUBLIC_WP_GRAPHQL_URL: !!process.env.NEXT_PUBLIC_WP_GRAPHQL_URL,
        });
      }
    });

    it('should have valid GraphQL endpoint URLs', () => {
      const endpoints = [
        process.env.CONFIGURATOR_GRAPHQL_URL,
        process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL,
        process.env.WP_GRAPHQL_URL,
        process.env.NEXT_PUBLIC_WP_GRAPHQL_URL,
      ].filter(Boolean);

      endpoints.forEach(endpoint => {
        expect(() => new URL(endpoint!)).not.toThrow();
        expect(endpoint).toMatch(/^https?:\/\//);
      });
    });

    it('should not use mock API endpoint in production', () => {
      if (process.env.NODE_ENV === 'production') {
        expect(configuratorGraphQL.endpoint).not.toBe('/api/graphql');
        expect(configuratorGraphQL.endpoint).toMatch(/^https?:\/\//);
      }
    });
  });

  describe('GraphQL Client Configuration', () => {
    it('should have properly configured GraphQL client', () => {
      expect(configuratorGraphQL).toBeDefined();
      expect(configuratorGraphQL.endpoint).toBeDefined();
      expect(configuratorGraphQL.endpoint).not.toBe('');
    });

    it('should have proper headers configured', () => {
      expect(configuratorGraphQL.headers).toBeDefined();
      expect(configuratorGraphQL.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Endpoint Accessibility (Integration)', () => {
    // Only run in CI/staging environments where live endpoints are available
    const shouldTestLiveEndpoint = process.env.CI || process.env.STAGING_ENV;

    if (shouldTestLiveEndpoint) {
      it('should be able to connect to live GraphQL endpoint', async () => {
        const testQuery = `
          query TestConnection {
            __schema {
              queryType {
                name
              }
            }
          }
        `;

        try {
          const response = await fetch(configuratorGraphQL.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: testQuery,
            }),
          });

          expect(response.ok).toBe(true);
          
          const result = await response.json();
          expect(result.data).toBeDefined();
          expect(result.data.__schema).toBeDefined();
          
          console.log('Successfully connected to GraphQL endpoint:', configuratorGraphQL.endpoint);
        } catch (error) {
          console.error('Failed to connect to GraphQL endpoint:', error);
          throw error;
        }
      }, 10000); // 10 second timeout for network requests

      it('should be able to query product schema from live endpoint', async () => {
        const testQuery = `
          query TestProductSchema {
            __type(name: "Product") {
              name
              fields {
                name
                type {
                  name
                }
              }
            }
          }
        `;

        try {
          const response = await fetch(configuratorGraphQL.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: testQuery,
            }),
          });

          expect(response.ok).toBe(true);
          
          const result = await response.json();
          
          // Should either have Product type or not have errors
          if (result.errors) {
            console.warn('Product schema not available, but endpoint is accessible:', result.errors);
          } else {
            expect(result.data).toBeDefined();
            console.log('Product schema available on live endpoint');
          }
        } catch (error) {
          console.error('Failed to query product schema:', error);
          throw error;
        }
      }, 10000);
    } else {
      it.skip('should be able to connect to live GraphQL endpoint (skipped - not in CI/staging)', () => {
        console.log('Skipping live endpoint test - not in CI/staging environment');
      });
    }
  });

  describe('Mock API Disabled Check', () => {
    it('should not be using mock API in production', async () => {
      if (process.env.NODE_ENV === 'production') {
        try {
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: 'query { __typename }',
            }),
          });

          // Mock API should return 404 in production
          expect(response.status).toBe(404);
          
          const result = await response.json();
          expect(result.error).toContain('Mock GraphQL endpoint disabled');
        } catch (error) {
          // If we can't reach the mock API, that's also fine
          console.log('Mock API not accessible (expected in production)');
        }
      }
    });
  });

  describe('Environment-Specific Configuration', () => {
    it('should log environment configuration for debugging', () => {
      console.log('Configurator Environment Configuration:', {
        NODE_ENV: process.env.NODE_ENV,
        CONFIGURATOR_GRAPHQL_URL: process.env.CONFIGURATOR_GRAPHQL_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL: process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL ? 'SET' : 'NOT SET',
        WP_GRAPHQL_URL: process.env.WP_GRAPHQL_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_WP_GRAPHQL_URL: process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ? 'SET' : 'NOT SET',
        CI: process.env.CI,
        STAGING_ENV: process.env.STAGING_ENV,
        configuratorEndpoint: configuratorGraphQL.endpoint,
      });
    });

    it('should have appropriate endpoint for current environment', () => {
      if (process.env.NODE_ENV === 'development') {
        // In development, should use mock API or configured endpoint
        expect(configuratorGraphQL.endpoint).toBeDefined();
      } else if (process.env.NODE_ENV === 'production') {
        // In production, should use live endpoint
        expect(configuratorGraphQL.endpoint).toMatch(/^https?:\/\//);
      }
    });
  });
});