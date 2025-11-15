/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useStripeApi Hook - React Hook for Stripe API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Custom React hook for accessing Stripe-related APIs
 * 
 * USAGE:
 * ```typescript
 * const { config, loading, error, calculateTax, createPaymentIntent } = useStripeApi();
 * ```
 */

import { useState, useCallback } from 'react'
import { apiManager, ApiError } from '../api-manager'

interface StripeConfig {
  publishable_key: string
  environment: 'test' | 'live'
}

interface UseStripeApiResult {
  config: StripeConfig | null
  loading: boolean
  error: string | null
  getConfig: (environment?: 'test' | 'live') => Promise<StripeConfig>
  calculateTax: (params: {
    country: string
    state: string
    items: string | any[]
  }) => Promise<{
    tax_rate: number
    tax_amount: number
    total: number
  }>
  createPaymentIntent: (data: {
    amount: number
    currency?: string
    metadata?: Record<string, any>
  }) => Promise<{
    client_secret: string
    payment_intent_id: string
  }>
  updateOrderStatus: (data: {
    orderId: number
    status?: string
    paymentStatus?: string
    paymentIntentId?: string
    amountPaid?: number
    currency?: string
    metadata?: Record<string, any>
  }) => Promise<any>
  refetch: () => Promise<void>
}

/**
 * Hook for accessing Stripe APIs
 */
export function useStripeApi(environment?: 'test' | 'live'): UseStripeApiResult {
  const [config, setConfig] = useState<StripeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = useCallback(async (env?: 'test' | 'live'): Promise<StripeConfig> => {
    setLoading(true)
    setError(null)

    try {
      const stripeConfig = await apiManager.stripe.getConfig(env || environment)
      setConfig(stripeConfig)
      return stripeConfig
    } catch (err) {
      const errorMessage = err instanceof ApiError
        ? err.message
        : 'Failed to load Stripe configuration'
      setError(errorMessage)
      console.error('Error fetching Stripe config:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [environment])

  const calculateTax = useCallback(async (params: {
    country: string
    state: string
    items: string | any[]
  }) => {
    try {
      return await apiManager.stripe.calculateTax(params)
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to calculate tax'
      throw new Error(errorMessage)
    }
  }, [])

  const createPaymentIntent = useCallback(async (data: {
    amount: number
    currency?: string
    metadata?: Record<string, any>
  }) => {
    try {
      return await apiManager.stripe.createPaymentIntent(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to create payment intent'
      throw new Error(errorMessage)
    }
  }, [])

  const updateOrderStatus = useCallback(async (data: {
    orderId: number
    status?: string
    paymentStatus?: string
    paymentIntentId?: string
    amountPaid?: number
    currency?: string
    metadata?: Record<string, any>
  }) => {
    try {
      return await apiManager.stripe.updateOrderStatus(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update order status'
      throw new Error(errorMessage)
    }
  }, [])

  return {
    config,
    loading,
    error,
    getConfig: fetchConfig,
    calculateTax,
    createPaymentIntent,
    updateOrderStatus,
    refetch: async () => { await fetchConfig(environment) },
  }
}

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

