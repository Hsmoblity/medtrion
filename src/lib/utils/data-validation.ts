/**
 * Data Validation Utilities for CMS Data Mapping
 * Ensures all CMS data is properly validated and normalized before reaching components
 */

import { ProductSchema } from '../interfaces/schema';
import { ProductCardView } from '../interfaces/homepage';

/**
 * Standardized image interface
 */
export interface StandardizedImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Data validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: any;
}

/**
 * Standardize image data from various CMS sources
 */
export function standardizeImage(image: any): string {
  // Handle string URLs
  if (typeof image === 'string' && image.trim().length > 0) {
    return image;
  }
  
  // Handle GraphQL image objects
  if (image?.sourceUrl) {
    return image.sourceUrl;
  }
  
  // Handle Contentful image objects
  if (image?.fields?.file?.url) {
    return image.fields.file.url;
  }
  
  // Handle nested image objects
  if (image?.url) {
    return image.url;
  }
  
  // Ultimate fallback
  return '/placeholder.svg';
}

/**
 * Extract price from description text as fallback
 */
export function extractPriceFromDescription(description: string): number | null {
  if (!description || typeof description !== 'string') {
    return null;
  }
  
  // Look for price patterns like $1,234.56 or $1234.56
  const priceMatch = description.match(/\$([0-9,]+\.?[0-9]*)/);
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/,/g, '');
    const price = parseFloat(priceStr);
    return !isNaN(price) && price > 0 ? price : null;
  }
  
  return null;
}

/**
 * Generate financing copy from price
 */
export function generateFinancingCopy(price: number | null): string | null {
  if (!price || price <= 0) {
    return null;
  }
  
  // Calculate monthly payment (assuming 24-month financing)
  const monthlyPayment = Math.round(price / 24);
  return `from $${monthlyPayment}/mo`;
}

/**
 * Generate badges based on product data
 */
export function generateBadges(product: ProductSchema): string[] {
  const badges: string[] = [];
  
  // Price-based badges
  if (product.price && product.price > 0) {
    if (product.price > 2000) {
      badges.push('Premium');
    } else if (product.price > 1000) {
      badges.push('Featured');
    }
  }
  
  // Options-based badges
  if (product._related_options?.length > 0) {
    badges.push('Customizable');
  }
  
  // Affiliate badge
  if (product.affiliate) {
    badges.push('Affiliate');
  }
  
  // Description-based badges
  if (product.description && product.description.toLowerCase().includes('best seller')) {
    badges.push('Best Seller');
  }
  
  return badges;
}

/**
 * Validate ProductSchema data
 */
export function validateProductSchema(product: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields validation
  if (!product.slug || typeof product.slug !== 'string') {
    errors.push('Missing or invalid slug');
  }
  
  if (!product.title || typeof product.title !== 'string') {
    errors.push('Missing or invalid title');
  }
  
  if (!product.description || typeof product.description !== 'string') {
    warnings.push('Missing or invalid description');
  }
  
  // Price validation
  if (product.price === null || product.price === undefined) {
    warnings.push('Price is null/undefined - will use fallback');
  } else if (typeof product.price !== 'number' || product.price < 0) {
    warnings.push('Invalid price format');
  }
  
  // Image validation
  const imageUrl = standardizeImage(product.featuredImage);
  if (imageUrl === '/placeholder.svg') {
    warnings.push('Using fallback image');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: product
  };
}

/**
 * Validate ProductCardView data
 */
export function validateProductCardView(product: ProductCardView): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields validation (only critical fields)
  const criticalFields = ['slug', 'title'];
  criticalFields.forEach(field => {
    if (!product[field as keyof ProductCardView]) {
      errors.push(`Missing critical field: ${field}`);
    }
  });
  
  // Optional fields validation (warnings only)
  if (!product.description) {
    warnings.push('Missing description');
  }
  if (!product.imageUrl || product.imageUrl === '/placeholder.svg') {
    warnings.push('Missing or using fallback image');
  }
  
  // Price validation
  if (product.price === null) {
    warnings.push('Price is null - will not display pricing');
  } else if (typeof product.price !== 'number' || product.price < 0) {
    warnings.push('Invalid price format');
  }
  
  // Image validation
  if (product.imageUrl === '/placeholder.svg') {
    warnings.push('Using fallback image');
  }
  
  // RelatedOptions validation
  if (!Array.isArray(product.relatedOptions)) {
    errors.push('relatedOptions must be an array');
  } else {
    const invalidOptions = product.relatedOptions.filter(option => 
      typeof option !== 'number' || isNaN(option) || option <= 0
    );
    if (invalidOptions.length > 0) {
      warnings.push(`Invalid relatedOptions values: ${invalidOptions.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    data: product
  };
}

/**
 * Log validation results for monitoring
 */
export function logValidationResults(component: string, results: ValidationResult[]): void {
  const totalProducts = results.length;
  const validProducts = results.filter(r => r.isValid).length;
  const errorCount = results.reduce((sum, r) => sum + r.errors.length, 0);
  const warningCount = results.reduce((sum, r) => sum + r.warnings.length, 0);
  
  console.group(`📊 Data Validation Report: ${component}`);
  console.log(`Total Products: ${totalProducts}`);
  console.log(`Valid Products: ${validProducts} (${Math.round(validProducts/totalProducts*100)}%)`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Warnings: ${warningCount}`);
  
  if (errorCount > 0) {
    console.warn('🚨 Validation Errors:', results.filter(r => r.errors.length > 0));
  }
  
  if (warningCount > 0) {
    console.info('⚠️ Validation Warnings:', results.filter(r => r.warnings.length > 0));
  }
  
  console.groupEnd();
}

/**
 * Enhanced data sanitization for SSR
 */
export function sanitizeForSSR(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (typeof data !== 'object') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForSSR);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      sanitized[key] = null;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForSSR(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}