import Stripe from 'stripe';

export interface StripeError extends Error {
  type?: string;
  code?: string;
  decline_code?: string;
  param?: string;
  message: string;
}

export interface ErrorHandlingResult {
  userMessage: string;
  technicalMessage: string;
  shouldRetry: boolean;
  errorCode: string;
}

/**
 * Handle Stripe errors and return user-friendly messages
 */
export function handleStripeError(error: StripeError): ErrorHandlingResult {
  console.error('Stripe error:', {
    type: error.type,
    code: error.code,
    decline_code: error.decline_code,
    param: error.param,
    message: error.message,
  });

  // Card errors
  if (error.type === 'StripeCardError') {
    return handleCardError(error);
  }

  // Rate limit errors
  if (error.type === 'StripeRateLimitError') {
    return {
      userMessage: 'Too many requests. Please wait a moment and try again.',
      technicalMessage: 'Rate limit exceeded',
      shouldRetry: true,
      errorCode: 'RATE_LIMIT_EXCEEDED',
    };
  }

  // Invalid request errors
  if (error.type === 'StripeInvalidRequestError') {
    return {
      userMessage: 'Invalid request. Please check your information and try again.',
      technicalMessage: `Invalid request: ${error.message}`,
      shouldRetry: false,
      errorCode: 'INVALID_REQUEST',
    };
  }

  // API errors
  if (error.type === 'StripeAPIError') {
    return {
      userMessage: 'Payment service temporarily unavailable. Please try again in a few moments.',
      technicalMessage: `Stripe API error: ${error.message}`,
      shouldRetry: true,
      errorCode: 'API_ERROR',
    };
  }

  // Connection errors
  if (error.type === 'StripeConnectionError') {
    return {
      userMessage: 'Network error. Please check your internet connection and try again.',
      technicalMessage: `Connection error: ${error.message}`,
      shouldRetry: true,
      errorCode: 'CONNECTION_ERROR',
    };
  }

  // Authentication errors
  if (error.type === 'StripeAuthenticationError') {
    return {
      userMessage: 'Authentication error. Please contact support.',
      technicalMessage: `Authentication error: ${error.message}`,
      shouldRetry: false,
      errorCode: 'AUTHENTICATION_ERROR',
    };
  }

  // Generic error
  return {
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalMessage: error.message || 'Unknown error',
    shouldRetry: false,
    errorCode: 'UNKNOWN_ERROR',
  };
}

/**
 * Handle card-specific errors
 */
function handleCardError(error: StripeError): ErrorHandlingResult {
  const declineCode = error.decline_code;
  
  switch (declineCode) {
    case 'insufficient_funds':
      return {
        userMessage: 'Your card has insufficient funds. Please try a different payment method.',
        technicalMessage: 'Card declined: insufficient funds',
        shouldRetry: false,
        errorCode: 'INSUFFICIENT_FUNDS',
      };

    case 'card_declined':
      return {
        userMessage: 'Your card was declined. Please try a different payment method or contact your bank.',
        technicalMessage: 'Card declined by issuer',
        shouldRetry: false,
        errorCode: 'CARD_DECLINED',
      };

    case 'expired_card':
      return {
        userMessage: 'Your card has expired. Please use a different payment method.',
        technicalMessage: 'Card expired',
        shouldRetry: false,
        errorCode: 'EXPIRED_CARD',
      };

    case 'incorrect_cvc':
      return {
        userMessage: 'The security code (CVC) is incorrect. Please check and try again.',
        technicalMessage: 'Incorrect CVC',
        shouldRetry: true,
        errorCode: 'INCORRECT_CVC',
      };

    case 'processing_error':
      return {
        userMessage: 'There was an error processing your card. Please try again.',
        technicalMessage: 'Card processing error',
        shouldRetry: true,
        errorCode: 'PROCESSING_ERROR',
      };

    case 'incorrect_number':
      return {
        userMessage: 'The card number is incorrect. Please check and try again.',
        technicalMessage: 'Incorrect card number',
        shouldRetry: true,
        errorCode: 'INCORRECT_NUMBER',
      };

    case 'invalid_expiry_month':
    case 'invalid_expiry_year':
      return {
        userMessage: 'The expiration date is incorrect. Please check and try again.',
        technicalMessage: 'Invalid expiry date',
        shouldRetry: true,
        errorCode: 'INVALID_EXPIRY',
      };

    case 'invalid_cvc':
      return {
        userMessage: 'The security code (CVC) is invalid. Please check and try again.',
        technicalMessage: 'Invalid CVC',
        shouldRetry: true,
        errorCode: 'INVALID_CVC',
      };

    case 'card_velocity_exceeded':
      return {
        userMessage: 'Too many attempts with this card. Please try again later or use a different payment method.',
        technicalMessage: 'Card velocity exceeded',
        shouldRetry: true,
        errorCode: 'CARD_VELOCITY_EXCEEDED',
      };

    case 'pin_try_exceeded':
      return {
        userMessage: 'Too many incorrect PIN attempts. Please try again later.',
        technicalMessage: 'PIN try exceeded',
        shouldRetry: true,
        errorCode: 'PIN_TRY_EXCEEDED',
      };

    case 'test_mode_live_card':
      return {
        userMessage: 'This is a test card and cannot be used in live mode.',
        technicalMessage: 'Test card used in live mode',
        shouldRetry: false,
        errorCode: 'TEST_MODE_LIVE_CARD',
      };

    case 'live_mode_test_card':
      return {
        userMessage: 'This is a live card and cannot be used in test mode.',
        technicalMessage: 'Live card used in test mode',
        shouldRetry: false,
        errorCode: 'LIVE_MODE_TEST_CARD',
      };

    default:
      return {
        userMessage: 'Your card was declined. Please try a different payment method.',
        technicalMessage: `Card declined: ${declineCode || 'unknown reason'}`,
        shouldRetry: false,
        errorCode: 'CARD_DECLINED',
      };
  }
}

/**
 * Check if an error should trigger a retry
 */
export function shouldRetryPayment(error: StripeError): boolean {
  const result = handleStripeError(error);
  return result.shouldRetry;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: StripeError): string {
  const result = handleStripeError(error);
  return result.userMessage;
}

/**
 * Log error for debugging
 */
export function logStripeError(error: StripeError, context?: string): void {
  const result = handleStripeError(error);
  
  console.error('Stripe Error Details:', {
    context: context || 'Unknown',
    type: error.type,
    code: error.code,
    decline_code: error.decline_code,
    param: error.param,
    userMessage: result.userMessage,
    technicalMessage: result.technicalMessage,
    errorCode: result.errorCode,
    shouldRetry: result.shouldRetry,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: StripeError, context?: string) {
  const result = handleStripeError(error);
  
  // Log the error
  logStripeError(error, context);
  
  return {
    success: false,
    error: result.userMessage,
    errorCode: result.errorCode,
    shouldRetry: result.shouldRetry,
    technicalMessage: result.technicalMessage,
  };
}

export default {
  handleStripeError,
  shouldRetryPayment,
  getUserFriendlyErrorMessage,
  logStripeError,
  createErrorResponse,
};