/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useFormUrl Hook - React Hook for Single Form URL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @deprecated Google Form URLs are no longer used. Use Web3Forms components directly.
 * 
 * This hook is kept for backward compatibility but will always return null.
 * Use ConsultationForm or ContactForm components instead.
 * 
 * USAGE:
 * ```typescript
 * // DEPRECATED - Use Web3Forms components instead
 * const { url, loading, error } = useFormUrl('/wp-json/hsm/v1/consult-form-url');
 * ```
 */

import { useState } from 'react'

interface UseFormUrlOptions {
  apiPath: string
  embedUrl?: string | null
  enabled?: boolean
}

interface UseFormUrlResult {
  url: string | null
  loading: boolean
  error: string | null
}

/**
 * Hook for fetching a single form URL from WordPress API
 * @deprecated Use Web3Forms components (ConsultationForm, ContactForm) instead
 */
export function useFormUrl({
  apiPath,
  embedUrl,
  enabled = true
}: UseFormUrlOptions): UseFormUrlResult {
  // Always return null since Google Forms are deprecated
  return {
    url: null,
    loading: false,
    error: 'Google Forms are deprecated. Please use Web3Forms components (ConsultationForm, ContactForm) instead.',
  }
}

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

