/**
 * ═══════════════════════════════════════════════════════════════════════════
 * API Module - Centralized Exports
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Central export point for all API-related functionality
 */

export { apiManager, ApiError } from './api-manager'
export type { ApiResponse } from './api-manager'

// Hooks
export { useForms } from './hooks/useForms'
export { useStripeApi } from './hooks/useStripeApi'
export { useFormUrl } from './hooks/useFormUrl'

// Agent Signature: 160125 - Fullstack - API_Manager_Creation

