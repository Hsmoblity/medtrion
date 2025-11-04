import React, { useState } from 'react';
import { useRouter } from 'next/router';
import PersonalInformationPanel from './PersonalInformationPanel';
import PaymentMethodPanel from './PaymentMethodPanel';
import OrderSummaryPanel from './OrderSummaryPanel';
import EditCartButton from './EditCartButton';

interface PaymentPageProps {
  onPaymentSuccess?: (paymentIntent: any, personalInfoData?: any) => Promise<void>;
  onCompletePayment?: (formData: any) => Promise<void>; // Legacy support
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSuccess, onCompletePayment }) => {
  const router = useRouter();
  const [personalInfoValid, setPersonalInfoValid] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState<any>(null);
  // Always use Stripe payment method - no dummy payment option
  const [paymentMethod] = useState<'stripe'>('stripe');

  const handleEditCart = () => {
    router.push('/cart');
  };

  // Enhanced payment success handler that includes personal info data
  const handlePaymentSuccessWithData = async (paymentIntent: any) => {
    if (onPaymentSuccess) {
      await onPaymentSuccess(paymentIntent, personalInfoData);
    }
  };

  return (
    <div className="payment-page min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          Checkout
        </h1>
        
        {/* Breadcrumb */}
        <nav className="flex mt-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button 
                onClick={() => router.push('/cart')}
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Cart
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              Checkout
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Forms (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <PersonalInformationPanel 
              onValidationChange={setPersonalInfoValid}
              onDataChange={setPersonalInfoData}
            />
            
            <PaymentMethodPanel 
              onPaymentSuccess={handlePaymentSuccessWithData}
              onPaymentError={(error) => {
                console.error('Payment error:', error);
                alert('Payment failed. Please try again.');
              }}
            />
            
            {/* Mobile Edit Cart Button */}
            <div className="lg:hidden">
              <EditCartButton onEditCart={handleEditCart} />
            </div>
          </div>

          {/* Right Column: Order Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <OrderSummaryPanel 
              showEditButton={true}
              onEditCart={handleEditCart}
            />
          </div>
        </div>
      </div>

      {/* Trust Signals Footer */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Money-Back Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;