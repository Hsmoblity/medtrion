import { configuratorAPI, configuratorGraphQL } from '../src/lib/graphql/configurator';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Configurator Live Endpoint Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.CONFIGURATOR_GRAPHQL_URL;
    delete process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL;
    delete process.env.WP_GRAPHQL_URL;
    delete process.env.NEXT_PUBLIC_WP_GRAPHQL_URL;
  });

  describe('Environment Configuration', () => {
    it('should use CONFIGURATOR_GRAPHQL_URL when available', () => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
      
      // Re-import to get new instance with updated env
      jest.resetModules();
      const { configuratorGraphQL: newClient } = require('../src/lib/graphql/configurator');
      
      expect(newClient.endpoint).toBe('https://api.example.com/graphql');
    });

    it('should fallback to NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL when server endpoint unavailable', () => {
      process.env.NEXT_PUBLIC_CONFIGURATOR_GRAPHQL_URL = 'https://client.example.com/graphql';
      
      jest.resetModules();
      const { configuratorGraphQL: newClient } = require('../src/lib/graphql/configurator');
      
      expect(newClient.endpoint).toBe('https://client.example.com/graphql');
    });

    it('should use mock API in development when no live endpoints configured', () => {
      process.env.NODE_ENV = 'development';
      
      jest.resetModules();
      const { configuratorGraphQL: newClient } = require('../src/lib/graphql/configurator');
      
      expect(newClient.endpoint).toBe('/api/graphql');
    });

    it('should use WP_GRAPHQL_URL in production when no configurator endpoint configured', () => {
      process.env.NODE_ENV = 'production';
      process.env.WP_GRAPHQL_URL = 'https://wp.example.com/graphql';
      
      jest.resetModules();
      const { configuratorGraphQL: newClient } = require('../src/lib/graphql/configurator');
      
      expect(newClient.endpoint).toBe('https://wp.example.com/graphql');
    });
  });

  describe('Live Endpoint Integration', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
    });

    it('should successfully fetch model with categories from live endpoint', async () => {
      const mockResponse = {
        data: {
          product: {
            id: '1',
            databaseId: 1,
            name: 'Test Model',
            slug: 'test-model',
            description: 'Test description',
            price: 1000,
            configuratorCategories: [
              {
                id: 'safety',
                name: 'Safety Features',
                options: [
                  {
                    id: 'safety-1',
                    name: 'Safety Rail',
                    price: 500
                  }
                ]
              }
            ]
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await configuratorAPI.getModelWithCategories('test-model');

      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data.product);
      expect(result.fallback).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('GetModelWithCategories'),
        })
      );
    });

    it('should handle GraphQL errors gracefully', async () => {
      const mockErrorResponse = {
        errors: [
          {
            message: 'Product not found',
            locations: [{ line: 2, column: 3 }],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      });

      const result = await configuratorAPI.getModelWithCategories('nonexistent-model');

      expect(result.error).toBe(true);
      expect(result.message).toContain('GraphQL errors');
      expect(result.data).toBe(null);
      expect(result.fallback).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await configuratorAPI.getModelWithCategories('test-model');

      expect(result.error).toBe(true);
      expect(result.message).toBe('Network error');
      expect(result.data).toBe(null);
      expect(result.fallback).toBe(true);
    });

    it('should handle invalid response structure', async () => {
      const mockInvalidResponse = {
        data: {
          // Missing product field
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvalidResponse,
      });

      const result = await configuratorAPI.getModelWithCategories('test-model');

      expect(result.error).toBe(true);
      expect(result.message).toContain('Invalid response structure');
      expect(result.data).toBe(null);
      expect(result.fallback).toBe(true);
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await configuratorAPI.getModelWithCategories('test-model');

      expect(result.error).toBe(true);
      expect(result.message).toContain('GraphQL request failed: 500');
      expect(result.data).toBe(null);
      expect(result.fallback).toBe(true);
    });
  });

  describe('Configuration Categories Integration', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
    });

    it('should fetch configuration categories from live endpoint', async () => {
      const mockResponse = {
        data: {
          configuratorCategories: [
            {
              id: 'safety',
              name: 'Safety Features',
              options: [
                {
                  id: 'safety-1',
                  name: 'Safety Rail',
                  price: 500
                }
              ]
            }
          ]
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await configuratorAPI.getConfigurationCategories('1');

      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.fallback).toBe(false);
    });
  });

  describe('Compatibility Check Integration', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
    });

    it('should check compatibility from live endpoint', async () => {
      const mockResponse = {
        data: {
          checkCompatibility: {
            issues: []
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await configuratorAPI.checkCompatibility(['option-1', 'option-2']);

      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.fallback).toBe(false);
    });
  });

  describe('Financing Calculation Integration', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
    });

    it('should calculate financing from live endpoint', async () => {
      const mockResponse = {
        data: {
          calculateFinancing: {
            options: [
              {
                id: 'financing-1',
                name: 'Standard Financing',
                monthlyPayment: 299,
                termMonths: 60
              }
            ]
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const configuration = {
        baseModelId: 1,
        selectedOptions: [1, 2]
      };

      const result = await configuratorAPI.calculateFinancing(configuration);

      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.fallback).toBe(false);
    });
  });

  describe('Insurance Estimation Integration', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
    });

    it('should estimate insurance from live endpoint', async () => {
      const mockResponse = {
        data: {
          estimateInsurance: {
            estimatedCoverage: 12000,
            coveragePercentage: 80,
            providers: [
              {
                name: 'Medicare',
                coverageType: 'Durable Medical Equipment'
              }
            ]
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const configuration = {
        baseModelId: 1,
        selectedOptions: [1, 2]
      };

      const result = await configuratorAPI.estimateInsurance(configuration);

      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.fallback).toBe(false);
    });
  });

  describe('Service Unavailability Handling', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://unavailable.example.com/graphql';
    });

    it('should handle service unavailability gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      const result = await configuratorAPI.getModelWithCategories('test-model');

      expect(result.error).toBe(true);
      expect(result.message).toBe('Service unavailable');
      expect(result.data).toBe(null);
      expect(result.fallback).toBe(true);
    });

    it('should provide fallback data when service is unavailable', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      const result = await configuratorAPI.getModelWithCategories('test-model');

      // Should return structured error response that can be handled by UI
      expect(result).toEqual({
        error: true,
        message: 'Service unavailable',
        data: null,
        fallback: true
      });
    });
  });

  describe('Schema Validation', () => {
    beforeEach(() => {
      process.env.CONFIGURATOR_GRAPHQL_URL = 'https://api.example.com/graphql';
    });

    it('should validate required fields in response', async () => {
      const mockResponse = {
        data: {
          product: {
            id: '1',
            // Missing required fields like name, slug, etc.
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await configuratorAPI.getModelWithCategories('test-model');

      // Should still return success but with validation warnings
      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data.product);
    });

    it('should handle schema drift gracefully', async () => {
      const mockResponse = {
        data: {
          product: {
            id: '1',
            name: 'Test Model',
            slug: 'test-model',
            // New fields that weren't in original schema
            newField: 'new value',
            configuratorCategories: [
              {
                id: 'safety',
                name: 'Safety Features',
                // New option fields
                newOptionField: 'new option value',
                options: []
              }
            ]
          }
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await configuratorAPI.getModelWithCategories('test-model');

      expect(result.error).toBe(false);
      expect(result.data).toEqual(mockResponse.data.product);
      // Should handle new fields gracefully without breaking
    });
  });
});