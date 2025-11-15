/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useFormUrl Hook - React Hook for Single Form URL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Custom React hook for fetching a single form URL (consultation or contact)
 * This is a simplified version of useGoogleFormUrl that uses the API manager
 * 
 * USAGE:
 * ```typescript
 * const { url, loading, error } = useFormUrl('/wp-json/hsm/v1/consult-form-url');
 * ```
 */

import { useEffect, useState } from 'react'
import { apiManager, ApiError } from '../api-manager'

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
 * Uses the centralized API manager
 */
export function useFormUrl({
  apiPath,
  embedUrl,
  enabled = true
}: UseFormUrlOptions): UseFormUrlResult {
  const [url, setUrl] = useState<string | null>(embedUrl ?? null)
  const [loading, setLoading] = useState(!embedUrl && enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || url || embedUrl) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        // Determine which API method to use based on path
        let fetchedUrl: string
        
        if (apiPath.includes('consult-form-url')) {
          fetchedUrl = await apiManager.forms.getConsultFormUrl()
        } else if (apiPath.includes('contact-form-url')) {
          fetchedUrl = await apiManager.forms.getContactFormUrl()
        } else {
          throw new Error(`Unknown form URL path: ${apiPath}`)
        }

        // Validate URL
        if (!fetchedUrl || fetchedUrl.trim() === '') {
          throw new Error('Form URL is not configured in CMS. Please contact the administrator.')
        }

        if (!cancelled) setUrl(fetchedUrl)
      } catch (e) {
        const errorMessage = e instanceof ApiError 
          ? e.message 
          : e instanceof Error 
            ? e.message 
            : 'Failed to load form URL'
        console.error('Error fetching form url', e)
        if (!cancelled) setError(errorMessage)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [apiPath, embedUrl, enabled, url])

  return { url, loading, error }
}

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

