import { loadStripe, Stripe } from "@stripe/stripe-js";

const cache: Map<string, Promise<Stripe | null>> = new Map();

const getStripe = (publishableKey?: string) => {
  const key = (publishableKey && publishableKey.trim().length > 0)
    ? publishableKey
    : process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  if (!key || key.trim().length === 0) {
    console.warn(
      'Stripe publishable key is missing. Provide a key or set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.'
    );
    return Promise.resolve<Stripe | null>(null);
  }

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const promise = loadStripe(key).catch((err) => {
    console.error('loadStripe failed:', err);
    return null;
  });

  cache.set(key, promise);
  return promise;
};

export default getStripe;
