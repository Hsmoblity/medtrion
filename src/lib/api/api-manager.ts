/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API MANAGER - Centralized Repository for CMS API Calls
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * This is the centralized API manager that acts as a repository/controller
 * for all WordPress REST API calls. All frontend components should use
 * this manager instead of making direct fetch calls to WordPress APIs.
 * 
 * CONSOLIDATED API STRUCTURE:
 * - hsm/v1: General HSM endpoints (health, settings, form URLs, consultation)
 * - hsm-stripe/v1: Stripe payment operations (tax, payment intent, orders)
 * - hsm-graphql/v1: GraphQL proxy operations (not used directly, via woocommerce.ts)
 * 
 * USAGE:
 * ```typescript
 * import { apiManager } from '@/lib/api/api-manager';
 * 
 * // Get consultation form URL
 * const formUrl = await apiManager.forms.getConsultFormUrl();
 * 
 * // Submit consultation
 * await apiManager.forms.submitConsultation(data);
 * 
 * // Get Stripe config
 * const config = await apiManager.stripe.getConfig();
 * ```
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base API configuration
 */
const getApiBaseUrl = (): string => {
  // Use Next.js API proxy for client-side calls to avoid CORS
  if (typeof window !== 'undefined') {
    return '' // Relative URLs use Next.js API proxy
  }
  // Server-side: use direct WordPress URL
  return process.env.WP_API_URL || process.env.NEXT_PUBLIC_WP_API_URL || 'https://cms.medtrion.ca'
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl()
  const isClientSide = typeof window !== 'undefined'
  
  // Client-side: use Next.js API proxy
  // Server-side: use direct WordPress URL
  const url = isClientSide 
    ? `/api/wp-rest-proxy?path=${encodeURIComponent(endpoint)}`
    : `${baseUrl.replace(/\/$/, '')}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      )
    }

    const data = await response.json()
    
    // Handle WordPress REST API response format
    if (data.success !== undefined) {
      return {
        success: data.success,
        data: data.data || data.url || data,
        message: data.message,
        error: data.error,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown API error',
      undefined,
      error
    )
  }
}

/**
 * Forms API (hsm/v1 namespace)
 * @deprecated Google Form URLs are no longer used. Use Web3Forms components directly.
 */
export const formsApi = {
  /**
   * Submit consultation form via Web3Forms
   * @deprecated Use Web3Forms directly in components. This method is kept for backward compatibility.
   */
  async submitConsultation(data: {
    name: string
    email: string
    phone?: string
    message?: string
    cart?: any
    orderTotal?: number
    gRecaptchaToken?: string
  }): Promise<ApiResponse> {
    // Use Next.js API route for submission (handles validation, rate limiting, etc.)
    const response = await fetch('/api/submit-consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new ApiError(
        errorData.error || 'Failed to submit consultation',
        response.status,
        errorData
      )
    }

    return await response.json()
  },
}

/**
 * Stripe API (hsm-stripe/v1 namespace)
 */
export const stripeApi = {
  /**
   * Get Stripe configuration
   */
  async getConfig(environment?: 'test' | 'live'): Promise<{
    publishable_key: string
    environment: 'test' | 'live'
  }> {
    const params = new URLSearchParams()
    if (environment) {
      params.append('environment', environment)
    }
    
    const endpoint = `/wp-json/hsm-stripe/v1/stripe/config${params.toString() ? `?${params.toString()}` : ''}`
    const response = await apiFetch<{ data: { publishable_key: string; environment: string } }>(endpoint)
    
    if (!response.success || !response.data?.data?.publishable_key) {
      throw new ApiError('Stripe configuration not available')
    }
    
    return {
      publishable_key: response.data.data.publishable_key,
      environment: response.data.data.environment as 'test' | 'live',
    }
  },

  /**
   * Calculate tax
   */
  async calculateTax(params: {
    country: string
    state: string
    items: string | any[]
  }): Promise<{
    tax_rate: number
    tax_amount: number
    total: number
  }> {
    const itemsParam = typeof params.items === 'string' 
      ? params.items 
      : JSON.stringify(params.items)
    
    const endpoint = `/wp-json/hsm-stripe/v1/tax/calculate?country=${encodeURIComponent(params.country)}&state=${encodeURIComponent(params.state)}&items=${encodeURIComponent(itemsParam)}`
    const response = await apiFetch<{ tax_rate: number; tax_amount: number; total: number }>(endpoint)
    
    if (!response.success || !response.data) {
      throw new ApiError('Tax calculation failed')
    }
    
    return response.data
  },

  /**
   * Create payment intent
   */
  async createPaymentIntent(data: {
    amount: number
    currency?: string
    metadata?: Record<string, any>
  }): Promise<{
    client_secret: string
    payment_intent_id: string
  }> {
    // Use Next.js API route for payment intent creation
    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new ApiError(
        errorData.error || 'Failed to create payment intent',
        response.status,
        errorData
      )
    }

    const result = await response.json()
    return {
      client_secret: result.clientSecret,
      payment_intent_id: result.paymentIntentId,
    }
  },

  /**
   * Update order status
   */
  async updateOrderStatus(data: {
    orderId: number
    status?: string
    paymentStatus?: string
    paymentIntentId?: string
    amountPaid?: number
    currency?: string
    metadata?: Record<string, any>
  }): Promise<ApiResponse<{
    order: {
      id: number
      status: string
      paymentStatus: string
    }
  }>> {
    // Use Next.js API route for order status update
    const response = await fetch('/api/payment/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new ApiError(
        errorData.error || 'Failed to update order status',
        response.status,
        errorData
      )
    }

    return await response.json()
  },
}

/**
 * System API (hsm/v1 namespace)
 */
export const systemApi = {
  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse<{
    status: string
    timestamp: string
  }>> {
    return apiFetch('/wp-json/hsm/v1/health')
  },

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<ApiResponse<{
    plugin_version: string
    wordpress_version: string
    woocommerce_active: boolean
  }>> {
    return apiFetch('/wp-json/hsm/v1/system-status')
  },
}

/**
 * Main API Manager
 */
export const apiManager = {
  forms: formsApi,
  stripe: stripeApi,
  system: systemApi,
}

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

