import React from 'react';
import PersonalInformationPanel from './PersonalInformationPanel';
import PaymentMethodPanel from './PaymentMethodPanel';
import OrderSummaryPanel from './OrderSummaryPanel';
import EditCartButton from './EditCartButton';

/**
 * Demo component showing all payment components in action
 * This is for demonstration purposes and shows how each component can be used
 */
const PaymentComponentsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Payment Components Demo
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            <PersonalInformationPanel 
              onValidationChange={(isValid) => console.log('Personal info valid:', isValid)}
              onDataChange={(data) => console.log('Personal info data:', data)}
            />
            
            <PaymentMethodPanel 
              onPaymentMethodChange={(method) => console.log('Payment method:', method)}
            />
            
            <EditCartButton 
              onEditCart={() => console.log('Edit cart clicked')}
            />
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <OrderSummaryPanel 
              showEditButton={true}
              onEditCart={() => console.log('Edit cart from summary')}
            />
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Component Usage Examples
          </h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">PersonalInformationPanel</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Handles customer information with real-time validation using react-hook-form and zod.
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {`<PersonalInformationPanel 
  onValidationChange={(isValid) => setFormValid(isValid)}
  onDataChange={(data) => setCustomerInfo(data)}
/>`}
              </code>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">PaymentMethodPanel</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Payment method selection with card form or Stripe integration placeholder.
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {`<PaymentMethodPanel 
  onPaymentMethodChange={(method) => setPaymentMethod(method)}
/>`}
              </code>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">OrderSummaryPanel</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Shows cart items, pricing breakdown, and edit cart functionality.
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {`<OrderSummaryPanel 
  showEditButton={true}
  onEditCart={() => router.push('/cart')}
/>`}
              </code>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">EditCartButton</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Standalone button for cart editing with multiple style variants.
              </p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                {`<EditCartButton 
  variant="outline"
  size="medium"
  onEditCart={() => router.push('/cart')}
/>`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentComponentsDemo;