/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useForms Hook - React Hook for Forms API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Custom React hook for accessing form-related APIs (consultation, contact)
 * 
 * USAGE:
 * ```typescript
 * const { consultFormUrl, contactFormUrl, loading, error, submitConsultation } = useForms();
 * ```
 */

import { useState, useCallback } from 'react'
import { apiManager, ApiError } from '../api-manager'

interface UseFormsResult {
  consultFormUrl: string | null
  contactFormUrl: string | null
  loading: boolean
  error: string | null
  submitConsultation: (data: {
    name: string
    email: string
    phone?: string
    message?: string
    cart?: any
    orderTotal?: number
    gRecaptchaToken?: string
  }) => Promise<{ success: boolean; message?: string }>
  refetch: () => Promise<void>
}

/**
 * Hook for accessing form URLs and submitting consultations
 */
export function useForms(): UseFormsResult {
  const [consultFormUrl, setConsultFormUrl] = useState<string | null>(null)
  const [contactFormUrl, setContactFormUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFormUrls = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [consultUrl, contactUrl] = await Promise.all([
        apiManager.forms.getConsultFormUrl().catch(() => null),
        apiManager.forms.getContactFormUrl().catch(() => null),
      ])

      setConsultFormUrl(consultUrl)
      setContactFormUrl(contactUrl)
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to load form URLs'
      setError(errorMessage)
      console.error('Error fetching form URLs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const submitConsultation = useCallback(async (data: {
    name: string
    email: string
    phone?: string
    message?: string
    cart?: any
    orderTotal?: number
    gRecaptchaToken?: string
  }) => {
    try {
      return await apiManager.forms.submitConsultation(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to submit consultation'
      throw new Error(errorMessage)
    }
  }, [])

  return {
    consultFormUrl,
    contactFormUrl,
    loading,
    error,
    submitConsultation,
    refetch: fetchFormUrls,
  }
}

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

