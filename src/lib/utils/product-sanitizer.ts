/**
 * Product Data Sanitization Utilities
 * 
 * Provides sanitization functions for product data to ensure compatibility
 * with Next.js SSR serialization requirements. Converts undefined values
 * to null or omits them entirely to prevent serialization errors.
 */

import { ConfigurableProductSchema } from '../interfaces/configurator';

/**
 * Sanitizes product data for SSR serialization
 * Converts undefined values to null to prevent Next.js serialization errors
 * 
 * @param product - The raw product data that may contain undefined values
 * @returns Sanitized product data safe for SSR serialization
 */
export function sanitizeProductForSSR(product: any): any {
  if (product === undefined) return null;
  if (product === null || typeof product !== 'object') return product;
  
  if (Array.isArray(product)) {
    return product.map(item => sanitizeProductForSSR(item));
  }

  const sanitized: any = {};
  
  Object.keys(product).forEach(key => {
    const value = product[key];
    
    if (value === undefined) {
      // Convert undefined to null for SSR compatibility
      sanitized[key] = null;
    } else if (value && typeof value === 'object') {
      // Recursively sanitize nested objects and arrays
      sanitized[key] = sanitizeProductForSSR(value);
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Sanitizes ConfigurableProductSchema specifically for SSR
 * Uses the general sanitizer but with type safety for the configurator schema
 * 
 * @param baseModel - The configurable product model
 * @returns Sanitized model safe for SSR serialization
 */
export function sanitizeConfigurableProduct(baseModel: ConfigurableProductSchema): any {
  return sanitizeProductForSSR(baseModel);
}

/**
 * Sanitizes props object for getServerSideProps return
 * Ensures all props are serializable by Next.js
 * 
 * @param props - The props object to sanitize
 * @returns Sanitized props safe for SSR
 */
export function sanitizeSSRProps<T extends Record<string, any>>(props: T): T {
  return sanitizeProductForSSR(props);
}

/**
 * Type guard to check if value is serializable by Next.js SSR
 * 
 * @param value - Value to check
 * @returns true if value is safe for SSR serialization
 */
export function isSSRSerializable(value: any): boolean {
  if (value === undefined) return false;
  if (value === null) return true;
  if (typeof value === 'function') return false;
  if (typeof value === 'symbol') return false;
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.every(isSSRSerializable);
    }
    
    // Check all object properties
    return Object.values(value).every(isSSRSerializable);
  }
  
  return true;
}