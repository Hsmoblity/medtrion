import React, { useState, useEffect } from 'react';
import Stripe from 'stripe';

interface PaymentStatusProps {
  sessionId?: string;
  wpOrderId?: string;
  onStatusUpdate?: (status: PaymentStatusData) => void;
  className?: string;
}

export interface PaymentStatusData {
  sessionStatus: 'complete' | 'open' | 'expired' | 'unknown';
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required' | 'unknown';
  paymentMethod?: string;
  amountTotal?: number;
  currency?: string;
  customerEmail?: string;
  webhookProcessed?: boolean;
  orderStatus?: 'processing' | 'completed' | 'failed' | 'pending' | 'unknown';
  lastUpdated?: string;
  errorMessage?: string;
  loading: boolean;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({
  sessionId,
  wpOrderId,
  onStatusUpdate,
  className = ''
}) => {
  const [statusData, setStatusData] = useState<PaymentStatusData>({
    sessionStatus: 'unknown',
    paymentStatus: 'unknown',
    orderStatus: 'unknown',
    loading: true
  });

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (sessionId) {
      verifyPaymentStatus();
    } else {
      setStatusData(prev => ({
        ...prev,
        loading: false,
        errorMessage: 'No session ID provided'
      }));
    }
  }, [sessionId]);

  useEffect(() => {
    if (onStatusUpdate) {
      onStatusUpdate(statusData);
    }
  }, [statusData, onStatusUpdate]);

  const verifyPaymentStatus = async () => {
    if (!sessionId) return;

    try {
      setStatusData(prev => ({ ...prev, loading: true, errorMessage: undefined }));

      // Call our webhook verification endpoint
      const response = await fetch('/api/payment/verify-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          wpOrderId
        })
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const verificationData = await response.json();

      setStatusData({
        sessionStatus: verificationData.session?.status || 'unknown',
        paymentStatus: verificationData.session?.payment_status || 'unknown',
        paymentMethod: verificationData.session?.payment_method_types?.[0] || 'unknown',
        amountTotal: verificationData.session?.amount_total,
        currency: verificationData.session?.currency,
        customerEmail: verificationData.session?.customer_details?.email,
        webhookProcessed: verificationData.webhookProcessed,
        orderStatus: verificationData.orderStatus || 'unknown',
        lastUpdated: new Date().toISOString(),
        loading: false
      });

      setRetryCount(0); // Reset retry count on success

    } catch (error: any) {
      console.error('Payment status verification failed:', error);
      
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      if (newRetryCount < maxRetries) {
        // Retry with exponential backoff
        const delay = Math.pow(2, newRetryCount) * 1000;
        console.log(`Retrying payment status verification in ${delay}ms (attempt ${newRetryCount}/${maxRetries})`);
        
        setTimeout(() => {
          verifyPaymentStatus();
        }, delay);
      } else {
        setStatusData(prev => ({
          ...prev,
          loading: false,
          errorMessage: `Failed to verify payment status: ${error.message}`
        }));
      }
    }
  };

  const getStatusIcon = () => {
    if (statusData.loading) {
      return (
        <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      );
    }

    if (statusData.errorMessage) {
      return (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    if (statusData.sessionStatus === 'complete' && statusData.paymentStatus === 'paid') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getStatusMessage = () => {
    if (statusData.loading) {
      return 'Verifying payment status...';
    }

    if (statusData.errorMessage) {
      return 'Unable to verify payment status';
    }

    if (statusData.sessionStatus === 'complete' && statusData.paymentStatus === 'paid') {
      if (statusData.webhookProcessed) {
        return 'Payment confirmed and processed';
      } else {
        return 'Payment confirmed (processing)';
      }
    }

    if (statusData.sessionStatus === 'open') {
      return 'Payment session still active';
    }

    if (statusData.sessionStatus === 'expired') {
      return 'Payment session expired';
    }

    return 'Payment status unknown';
  };

  const getStatusColor = () => {
    if (statusData.loading) return 'text-blue-600';
    if (statusData.errorMessage) return 'text-yellow-600';
    if (statusData.sessionStatus === 'complete' && statusData.paymentStatus === 'paid') {
      return statusData.webhookProcessed ? 'text-green-600' : 'text-blue-600';
    }
    return 'text-gray-600';
  };

  const formatAmount = (amount?: number, currency?: string) => {
    if (!amount || !currency) return null;
    
    try {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(amount / 100);
    } catch (error) {
      return `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`;
    }
  };

  return (
    <div className={`payment-status ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Payment Status</h3>
          <button
            onClick={verifyPaymentStatus}
            disabled={statusData.loading}
            className="text-xs text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {/* Status Overview */}
          <div className="flex items-center">
            {getStatusIcon()}
            <span className={`ml-2 text-sm font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
          </div>

          {/* Payment Details */}
          {!statusData.loading && !statusData.errorMessage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {statusData.amountTotal && statusData.currency && (
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {formatAmount(statusData.amountTotal, statusData.currency)}
                  </span>
                </div>
              )}

              {statusData.paymentMethod && (
                <div>
                  <span className="text-gray-500">Method:</span>
                  <span className="ml-1 font-medium text-gray-900 capitalize">
                    {statusData.paymentMethod}
                  </span>
                </div>
              )}

              {statusData.orderStatus && statusData.orderStatus !== 'unknown' && (
                <div>
                  <span className="text-gray-500">Order:</span>
                  <span className="ml-1 font-medium text-gray-900 capitalize">
                    {statusData.orderStatus}
                  </span>
                </div>
              )}

              {statusData.webhookProcessed !== undefined && (
                <div>
                  <span className="text-gray-500">Processed:</span>
                  <span className={`ml-1 font-medium ${statusData.webhookProcessed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {statusData.webhookProcessed ? 'Yes' : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {statusData.errorMessage && (
            <div className="text-xs text-yellow-700 bg-yellow-50 rounded p-2">
              {statusData.errorMessage}
              {retryCount < maxRetries && (
                <span className="block mt-1">Retrying automatically...</span>
              )}
            </div>
          )}

          {/* Last Updated */}
          {statusData.lastUpdated && !statusData.loading && (
            <div className="text-xs text-gray-400">
              Last verified: {new Date(statusData.lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;