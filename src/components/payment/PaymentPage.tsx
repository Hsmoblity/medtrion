import React, { useState } from 'react';
import { useRouter } from 'next/router';
import PersonalInformationPanel from './PersonalInformationPanel';
import PaymentMethodPanel from './PaymentMethodPanel';
import OrderSummaryPanel from './OrderSummaryPanel';
import EditCartButton from './EditCartButton';

interface PaymentPageProps {
  onCompletePayment?: (formData: any) => Promise<void>;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onCompletePayment }) => {
  const router = useRouter();
  const [personalInfoValid, setPersonalInfoValid] = useState(false);
  const [personalInfoData, setPersonalInfoData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'stripe'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEditCart = () => {
    router.push('/cart');
  };

  const handleCompletePayment = async () => {
    if (!personalInfoValid || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const paymentData = {
        personalInfo: personalInfoData,
        paymentMethod,
        // Add other payment details here
      };

      if (onCompletePayment) {
        await onCompletePayment(paymentData);
      } else {
        // Default behavior - simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        router.push('/success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
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
              onPaymentMethodChange={setPaymentMethod}
            />
            
            {/* Mobile Edit Cart Button */}
            <div className="lg:hidden">
              <EditCartButton onEditCart={handleEditCart} />
            </div>
            
            {/* Complete Payment Button */}
            <button
              onClick={handleCompletePayment}
              disabled={!personalInfoValid || isProcessing}
              className={`
                w-full px-8 py-4 rounded-lg font-semibold text-lg
                transition-all duration-200 shadow-lg hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${personalInfoValid && !isProcessing
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                    />
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                'Complete Payment'
              )}
            </button>

            {!personalInfoValid && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Please fill in all required personal information to continue
              </p>
            )}
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