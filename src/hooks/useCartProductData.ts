import { useMemo } from 'react';
import { CartProduct } from '../lib/interfaces/cart';

interface EnhancedCartProduct extends Omit<CartProduct, 'title' | 'featuredImage' | 'description' | 'shortDescription'> {
  title: string;
  featuredImage: string | { sourceUrl?: string };
  description: string;
  shortDescription: string;
}

/**
 * Hook to enhance cart items with fallback data for missing fields
 * Provides sensible defaults for title, images, etc. when missing
 */
export const useCartProductData = (cartItems: CartProduct[]): EnhancedCartProduct[] => {
  return useMemo(() => {
    return cartItems.map((item): EnhancedCartProduct => ({
      ...item,
      title: item.title || formatSlugToTitle(item.slug),
      featuredImage: item.featuredImage || '',
      description: item.description || '',
      shortDescription: item.shortDescription || `${formatSlugToTitle(item.slug)} - $${item.price}`
    }));
  }, [cartItems]);
};

/**
 * Convert slug to readable title
 * e.g., "vivalift-tranquil-2-plr-935s-lift-chair" -> "Vivalift Tranquil 2 PLR 935s Lift Chair"
 */
function formatSlugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Clear the product cache (kept for compatibility)
 */
export const clearProductCache = () => {
  // No longer needed with this approach, but kept for compatibility
};