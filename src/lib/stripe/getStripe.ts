import { loadStripe, Stripe } from "@stripe/stripe-js";

const cache: Map<string, Promise<Stripe | null>> = new Map();

export interface StripeConfig {
  publishableKey?: string;
  environment?: 'test' | 'live';
}

/**
 * Get Stripe instance with dynamic configuration support
 */
const getStripe = async (config?: StripeConfig): Promise<Stripe | null> => {
  let publishableKey = config?.publishableKey;

  // If no key provided, try to fetch from HSM plugin
  if (!publishableKey) {
    try {
      const apiUrl = '/wp-json/hsm-stripe/v1/stripe/config';
      const params = new URLSearchParams();
      
      if (config?.environment) {
        params.append('environment', config.environment);
      }
      
      const url = `${apiUrl}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 5000);
          return controller.signal;
        })()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.publishable_key) {
          publishableKey = data.data.publishable_key;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Stripe config from HSM plugin:', err);
    }
  }

  // Fallback to environment variable
  if (!publishableKey) {
    publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  }

  if (!publishableKey || publishableKey.trim().length === 0) {
    console.warn(
      'Stripe publishable key is missing. Provide a key, configure HSM plugin, or set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.'
    );
    return Promise.resolve<Stripe | null>(null);
  }

  // Check cache
  if (cache.has(publishableKey)) {
    return cache.get(publishableKey)!;
  }

  // Load Stripe
  const promise = loadStripe(publishableKey).catch((err) => {
    console.error('loadStripe failed:', err);
    return null;
  });

  cache.set(publishableKey, promise);
  return promise;
};

/**
 * Legacy function for backward compatibility
 */
const getStripeLegacy = (publishableKey?: string) => {
  return getStripe({ publishableKey });
};

// Export both new and legacy functions
export default getStripe;
export { getStripeLegacy };
