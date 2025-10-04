/**
 * Hook for fetching Stripe configuration from HSM plugin
 *
 * @package HSM
 * @since 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';

export interface StripeConfig {
  environment: 'test' | 'live';
  publishable_key: string;
  currency: string;
  is_configured: boolean;
  timestamp: string;
  error?: string;
}

export interface UseStripeConfigOptions {
  environment?: 'test' | 'live';
  fallbackToEnv?: boolean;
  cacheTime?: number; // in milliseconds
  retryAttempts?: number;
  retryDelay?: number; // in milliseconds
}

export interface UseStripeConfigReturn {
  config: StripeConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isConfigured: boolean;
}

const CACHE_KEY = 'hsm_stripe_config';
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * Hook to fetch Stripe configuration from HSM plugin
 */
export const useStripeConfig = (options: UseStripeConfigOptions = {}): UseStripeConfigReturn => {
  const {
    environment,
    fallbackToEnv = true,
    cacheTime = DEFAULT_CACHE_TIME,
    retryAttempts = DEFAULT_RETRY_ATTEMPTS,
    retryDelay = DEFAULT_RETRY_DELAY
  } = options;

  const [config, setConfig] = useState<StripeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get cached configuration
   */
  const getCachedConfig = useCallback((): StripeConfig | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (parsed.timestamp && (now - parsed.timestamp) < cacheTime) {
          return parsed.data;
        }
      }
    } catch (err) {
      console.warn('Failed to read cached Stripe config:', err);
    }
    
    return null;
  }, [cacheTime]);

  /**
   * Set cached configuration
   */
  const setCachedConfig = useCallback((configData: StripeConfig) => {
    try {
      const cacheData = {
        data: configData,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.warn('Failed to cache Stripe config:', err);
    }
  }, []);

  /**
   * Get environment variable fallback
   */
  const getEnvFallback = useCallback((): StripeConfig | null => {
    if (!fallbackToEnv) return null;

    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) return null;

    // Determine environment from key prefix
    const env = publishableKey.startsWith('pk_live_') ? 'live' : 'test';

    return {
      environment: env,
      publishable_key: publishableKey,
      currency: 'USD',
      is_configured: true,
      timestamp: new Date().toISOString()
    };
  }, [fallbackToEnv]);

  /**
   * Fetch configuration from HSM plugin API
   */
  const fetchConfig = useCallback(async (attempt = 1): Promise<StripeConfig | null> => {
    try {
      // Build API URL
      const apiUrl = '/wp-json/hsm-stripe/v1/stripe/config';
      const params = new URLSearchParams();
      
      if (environment) {
        params.append('environment', environment);
      }
      
      const url = `${apiUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 10000);
          return controller.signal;
        })()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch Stripe configuration');
      }

      return data.data as StripeConfig;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed to fetch Stripe config:`, err);
      
      if (attempt < retryAttempts) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return fetchConfig(attempt + 1);
      }
      
      throw err;
    }
  }, [environment, retryAttempts, retryDelay]);

  /**
   * Load configuration
   */
  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try cached config first
      const cachedConfig = getCachedConfig();
      if (cachedConfig) {
        setConfig(cachedConfig);
        setLoading(false);
        return;
      }

      // Try to fetch from API
      try {
        const apiConfig = await fetchConfig();
        if (apiConfig) {
          setConfig(apiConfig);
          setCachedConfig(apiConfig);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('Failed to fetch from HSM plugin API:', apiError);
      }

      // Fallback to environment variables
      const envConfig = getEnvFallback();
      if (envConfig) {
        setConfig(envConfig);
        setCachedConfig(envConfig);
        setLoading(false);
        return;
      }

      // No configuration available
      setError('No Stripe configuration available');
      setConfig(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [getCachedConfig, fetchConfig, getEnvFallback, setCachedConfig]);

  /**
   * Refetch configuration
   */
  const refetch = useCallback(async () => {
    // Clear cache
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (err) {
      console.warn('Failed to clear cache:', err);
    }
    
    await loadConfig();
  }, [loadConfig]);

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    refetch,
    isConfigured: config?.is_configured ?? false
  };
};

/**
 * Hook to get Stripe publishable key
 */
export const useStripePublishableKey = (environment?: 'test' | 'live') => {
  const { config, loading, error } = useStripeConfig({ environment });
  
  return {
    publishableKey: config?.publishable_key || null,
    loading,
    error,
    isConfigured: config?.is_configured ?? false
  };
};

/**
 * Hook to check if Stripe is configured
 */
export const useStripeConfigured = (environment?: 'test' | 'live') => {
  const { config, loading } = useStripeConfig({ environment });
  
  return {
    isConfigured: config?.is_configured ?? false,
    loading,
    environment: config?.environment || null
  };
};