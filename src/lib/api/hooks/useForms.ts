/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useForms Hook - React Hook for Forms API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Custom React hook for submitting consultations via Web3Forms
 * 
 * @deprecated Google Form URLs are no longer used. Use Web3Forms components directly.
 * 
 * USAGE:
 * ```typescript
 * const { submitConsultation } = useForms();
 * ```
 */

import { useCallback } from 'react'
import { apiManager, ApiError } from '../api-manager'

interface UseFormsResult {
  submitConsultation: (data: {
    name: string
    email: string
    phone?: string
    message?: string
    cart?: any
    orderTotal?: number
    gRecaptchaToken?: string
  }) => Promise<{ success: boolean; message?: string }>
}

/**
 * Hook for submitting consultations via Web3Forms
 * @deprecated Use Web3Forms components directly (ConsultationForm, ContactForm)
 */
export function useForms(): UseFormsResult {
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
    submitConsultation,
  }
}

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

