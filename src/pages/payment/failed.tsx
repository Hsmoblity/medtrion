import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PrimaryButton } from '../../components/ui';

interface PaymentFailedPageProps {
  sessionId?: string;
  wpOrderId?: string;
  error?: string;
}

const PaymentFailedPage: React.FC<PaymentFailedPageProps> = () => {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { session_id, wp_order_id, error: urlError } = router.query;
    
    if (urlError) {
      setError(urlError as string);
      setLoading(false);
    } else if (session_id) {
      fetchSessionData(session_id as string);
    } else {
      setLoading(false);
    }
  }, [router.query]);

  const fetchSessionData = async (sessionId: string) => {
    try {
      // In a real implementation, you would fetch session data from your backend
      // For now, we'll simulate the data
      const mockSessionData = {
        id: sessionId,
        payment_status: 'failed',
        amount_total: 3870,
        currency: 'cad',
        customer_details: {
          email: 'customer@example.com',
          name: 'John Doe',
        },
        metadata: {
          orderId: 'order_123456',
          itemCount: '3',
        },
      };

      setSessionData(mockSessionData);
    } catch (error: any) {
      console.error('Error fetching session data:', error);
      setError('Failed to load payment information. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    router.push('/consultation');
  };

  const handleContactSupport = () => {
    // In a real implementation, this would open a support chat or contact form
    window.open('mailto:support@hsmobility.ca?subject=Payment Issue', '_blank');
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Failed - HSMobility</title>
        <meta name="description" content="Your payment could not be processed. Please try again." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-lg text-gray-600">
              We're sorry, but your payment could not be processed.
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What happened?</h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                    <p className="text-sm text-red-700 mt-1">
                      {error || 'Your payment could not be processed. This could be due to insufficient funds, an expired card, or other payment issues.'}
                    </p>
                  </div>
                </div>
              </div>

              {sessionData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Transaction Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono">{sessionData.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>${(sessionData.amount_total / 100).toFixed(2)} CAD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{new Date().toLocaleDateString('en-CA')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Common Solutions */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Solutions</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-800">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Check Your Payment Method</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ensure your card has sufficient funds and is not expired. Try using a different payment method.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-800">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Contact Your Bank</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your bank may have blocked the transaction. Contact them to authorize the payment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-800">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Try Again</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sometimes payment issues are temporary. Try processing your payment again.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton
              onClick={handleRetryPayment}
              className="min-w-[200px]"
            >
              Try Payment Again
            </PrimaryButton>
            
            <button
              onClick={handleContactSupport}
              className="min-w-[200px] px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="min-w-[200px] px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Need immediate assistance?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1-800-555-0123"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Call us: 1-800-555-0123
              </a>
              <a
                href="mailto:support@hsmobility.ca"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Email: support@hsmobility.ca
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">Your Information is Secure</h3>
                <p className="text-sm text-green-700 mt-1">
                  We use industry-standard encryption to protect your payment information. No charges were made to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailedPage;