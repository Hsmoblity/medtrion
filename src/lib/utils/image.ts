/**
 * Image utility functions for handling various image formats
 * 
 * @package HSM
 * @since 1.0.0
 */

/**
 * Type definitions for image sources
 */
export type ImageSource = string | { sourceUrl?: string } | null | undefined;

/**
 * Safely extracts image URL from various formats
 * 
 * @param imageSource - The image source which can be a string, object with sourceUrl, or null/undefined
 * @returns The extracted URL string or null if no valid URL found
 * 
 * @example
 * ```typescript
 * // String format
 * const url1 = extractImageUrl('https://example.com/image.jpg');
 * // Returns: 'https://example.com/image.jpg'
 * 
 * // Object format
 * const url2 = extractImageUrl({ sourceUrl: 'https://example.com/image.jpg' });
 * // Returns: 'https://example.com/image.jpg'
 * 
 * // Null/undefined
 * const url3 = extractImageUrl(null);
 * // Returns: null
 * 
 * // Empty object
 * const url4 = extractImageUrl({});
 * // Returns: null
 * ```
 */
export function extractImageUrl(imageSource: ImageSource): string | null {
  // Handle null/undefined
  if (!imageSource) {
    return null;
  }

  // Handle string format
  if (typeof imageSource === 'string') {
    return imageSource.trim() || null;
  }

  // Handle object format with sourceUrl
  if (typeof imageSource === 'object' && imageSource !== null) {
    const { sourceUrl } = imageSource;
    if (typeof sourceUrl === 'string') {
      return sourceUrl.trim() || null;
    }
  }

  return null;
}

/**
 * Safely extracts image URL with fallback support
 * 
 * @param primarySource - The primary image source
 * @param fallbackSource - The fallback image source
 * @returns The extracted URL string or null if no valid URL found
 * 
 * @example
 * ```typescript
 * const url = extractImageUrlWithFallback(
 *   option.image?.sourceUrl,
 *   option.featuredImage
 * );
 * ```
 */
export function extractImageUrlWithFallback(
  primarySource: ImageSource,
  fallbackSource: ImageSource
): string | null {
  // Try primary source first
  const primaryUrl = extractImageUrl(primarySource);
  if (primaryUrl) {
    return primaryUrl;
  }

  // Fallback to secondary source
  return extractImageUrl(fallbackSource);
}

/**
 * Validates if a string is a valid image URL
 * 
 * @param url - The URL to validate
 * @returns True if the URL appears to be a valid image URL
 */
export function isValidImageUrl(url: string | null): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Basic URL validation
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Gets image alt text with fallback
 * 
 * @param altText - The alt text from image object
 * @param fallbackText - The fallback text (usually option/product name)
 * @returns The alt text or fallback
 */
export function getImageAltText(altText?: string, fallbackText?: string): string {
  if (altText && altText.trim()) {
    return altText.trim();
  }
  
  if (fallbackText && fallbackText.trim()) {
    return `${fallbackText.trim()} image`;
  }
  
  return 'Image';
}

/**
 * Normalizes image URL (alias for extractImageUrl for backward compatibility)
 * 
 * @param imageSource - The image source which can be a string, object with sourceUrl, or null/undefined
 * @returns The extracted URL string or null if no valid URL found
 * 
 * @deprecated Use extractImageUrl instead
 */
export function normalizeImageUrl(imageSource: ImageSource): string | null {
  return extractImageUrl(imageSource);
}