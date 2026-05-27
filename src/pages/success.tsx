import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { PrimaryButton } from '../components/ui';
import OrderConfirmation from '../components/payment/OrderConfirmation';

interface SuccessPageProps {
  sessionId?: string;
  wpOrderId?: string;
}

const SuccessPage: React.FC<SuccessPageProps> = () => {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { session_id, wp_order_id } = router.query;
    
    if (session_id) {
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
        payment_status: 'paid',
        amount_total: 3870, // Example amount in cents
        currency: 'cad',
        customer_details: {
          email: 'customer@example.com',
          name: 'John Doe',
        },
        shipping_details: {
          address: {
            line1: '123 Main St',
            city: 'Toronto',
            province: 'ON',
            postal_code: 'M5V 3A8',
            country: 'CA',
          },
        },
        metadata: {
          orderId: 'order_123456',
          itemCount: '3',
        },
      };

      setSessionData(mockSessionData);
      
      // Fetch order details if wp_order_id is provided
      if (router.query.wp_order_id) {
        await fetchOrderData(router.query.wp_order_id as string);
      }
      
    } catch (error: any) {
      console.error('Error fetching session data:', error);
      setError('Failed to load payment confirmation. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async (orderId: string) => {
    try {
      // In a real implementation, you would fetch order data from WordPress/WooCommerce
      const mockOrderData = {
        id: orderId,
        status: 'processing',
        total: '3870.00',
        currency: 'CAD',
        line_items: [
          {
            name: 'Acorn 180 Stairlift',
            quantity: 1,
            price: '2899.00',
          },
          {
            name: 'Installation Service',
            quantity: 1,
            price: '500.00',
          },
          {
            name: 'Extended Warranty',
            quantity: 1,
            price: '471.00',
          },
        ],
        shipping_address: {
          first_name: 'John',
          last_name: 'Doe',
          address_1: '123 Main St',
          city: 'Toronto',
          state: 'ON',
          postcode: 'M5V 3A8',
          country: 'CA',
        },
        billing_address: {
          first_name: 'John',
          last_name: 'Doe',
          address_1: '123 Main St',
          city: 'Toronto',
          state: 'ON',
          postcode: 'M5V 3A8',
          country: 'CA',
        },
      };

      setOrderData(mockOrderData);
    } catch (error: any) {
      console.error('Error fetching order data:', error);
      // Don't set error here as session data is more important
    }
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  const handleViewOrder = () => {
    // In a real implementation, this would navigate to an order details page
    console.log('View order:', orderData?.id || sessionData?.metadata?.orderId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <PrimaryButton onClick={() => router.push('/')}>
              Return to Home
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Successful - Medtrion</title>
        <meta name="description" content="Your payment has been processed successfully." />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {/* Order Confirmation */}
          {sessionData && (
            <OrderConfirmation
              sessionData={sessionData}
              orderData={orderData}
              onViewOrder={handleViewOrder}
            />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <PrimaryButton
              onClick={handleContinueShopping}
              className="min-w-[200px]"
            >
              Continue Shopping
            </PrimaryButton>
            
            {orderData && (
              <button
                onClick={handleViewOrder}
                className="min-w-[200px] px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Order Details
              </button>
            )}
          </div>

          {/* Additional Information */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h3>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-800">1</span>
                </div>
                <div>
                  <p className="font-medium">Order Confirmation</p>
                  <p className="text-sm">You'll receive an email confirmation with your order details.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-800">2</span>
                </div>
                <div>
                  <p className="font-medium">Processing</p>
                  <p className="text-sm">Our team will review your order and prepare it for installation.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold text-blue-800">3</span>
                </div>
                <div>
                  <p className="font-medium">Installation Scheduling</p>
                  <p className="text-sm">We'll contact you within 24 hours to schedule your installation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Need help with your order?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+1-800-555-0123"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Call us: 1-800-555-0123
              </a>
              <a
                href="mailto:support@medtrion.ca"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Email: support@medtrion.ca
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessPage;