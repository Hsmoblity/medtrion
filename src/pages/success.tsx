import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useCartStore } from "stores/cartStore";
import MetaHead from "components/MetaHead";
import Link from "next/link";
import PaymentStatus, { PaymentStatusData } from "../components/payment/PaymentStatus";

const Success = () => {
  const clearCart = useCartStore(state => state.clearCart);
  const router = useRouter();
  const { wpOrderId, session_id } = router.query as { wpOrderId?: string; session_id?: string };
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData | null>(null);

  useEffect(() => {
    // Clear all cart items on success page
    clearCart();
  }, [clearCart]);

  const handleStatusUpdate = (statusData: PaymentStatusData) => {
    setPaymentStatusData(statusData);
  };

  // Determine if we should show enhanced details
  const hasSessionId = Boolean(session_id);
  const isPaymentConfirmed = paymentStatusData?.sessionStatus === 'complete' && 
                           paymentStatusData?.paymentStatus === 'paid';

  return (
    <>
      <MetaHead
        title={"Payment Successful"}
        description={
          "Thank you for your purchase! Your payment has been processed successfully."
        }
      />
      <div>
        <div className="bg-white min-h-screen py-20 md:mx-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Success Icon */}
            <svg viewBox="0 0 24 24" className="text-green-600 w-16 h-16 mx-auto my-6">
              <path fill="currentColor"
                d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z">
              </path>
            </svg>
            
            <div className="text-center">
              <h1 className="md:text-3xl text-xl text-gray-900 font-bold text-center mb-4">
                Payment Successful!
              </h1>
              <p className="text-gray-600 my-2 text-lg">
                Thank you for completing your secure online payment.
              </p>
              <p className="text-gray-500 mb-8">
                Your receipt will shortly arrive to your email!
              </p>

              {/* Order Reference */}
              {wpOrderId && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 inline-block">
                  <p className="text-sm text-gray-600 mb-1">Order Reference</p>
                  <p className="font-mono text-lg font-semibold text-gray-900">{wpOrderId}</p>
                </div>
              )}
            </div>

            {/* Enhanced Payment Status */}
            {hasSessionId && (
              <div className="mb-8">
                <PaymentStatus 
                  sessionId={session_id}
                  wpOrderId={wpOrderId}
                  onStatusUpdate={handleStatusUpdate}
                  className="max-w-md mx-auto"
                />
              </div>
            )}

            {/* Payment Confirmation Details */}
            {isPaymentConfirmed && paymentStatusData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Payment Confirmed
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {paymentStatusData.amountTotal && paymentStatusData.currency && (
                    <div>
                      <span className="text-green-700 font-medium">Amount Paid:</span>
                      <p className="text-green-900 font-semibold">
                        {new Intl.NumberFormat('en-CA', {
                          style: 'currency',
                          currency: paymentStatusData.currency.toUpperCase(),
                        }).format(paymentStatusData.amountTotal / 100)}
                      </p>
                    </div>
                  )}

                  {paymentStatusData.paymentMethod && (
                    <div>
                      <span className="text-green-700 font-medium">Payment Method:</span>
                      <p className="text-green-900 font-semibold capitalize">
                        {paymentStatusData.paymentMethod}
                      </p>
                    </div>
                  )}

                  {paymentStatusData.customerEmail && (
                    <div>
                      <span className="text-green-700 font-medium">Receipt Email:</span>
                      <p className="text-green-900 font-semibold">
                        {paymentStatusData.customerEmail}
                      </p>
                    </div>
                  )}

                  {paymentStatusData.orderStatus && paymentStatusData.orderStatus !== 'unknown' && (
                    <div>
                      <span className="text-green-700 font-medium">Order Status:</span>
                      <p className="text-green-900 font-semibold capitalize">
                        {paymentStatusData.orderStatus}
                      </p>
                    </div>
                  )}
                </div>

                {paymentStatusData.webhookProcessed && (
                  <div className="mt-4 flex items-center text-sm text-green-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Payment processing completed
                  </div>
                )}
              </div>
            )}

            {/* What's Next Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">What's Next?</h2>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Email Confirmation</p>
                    <p>You'll receive an order confirmation email within the next few minutes.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <div>
                    <p className="font-medium">Order Processing</p>
                    <p>Our team will begin processing your order and will contact you with delivery details.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium">Customer Support</p>
                    <p>If you have any questions, feel free to contact us at{' '}
                      <a href="mailto:support@hsmobility.com" className="text-blue-600 hover:text-blue-500 transition-colors">
                        support@hsmobility.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <Link 
                href="/" 
                className="inline-block px-8 py-3 bg-blue-600 rounded-md hover:bg-blue-700 text-white font-semibold transition-colors duration-200 shadow-sm"
              >
                Continue Shopping
              </Link>
              
              <div>
                <a 
                  href="mailto:support@hsmobility.com" 
                  className="text-sm text-gray-600 hover:text-gray-500 transition-colors duration-200"
                >
                  Need help? Contact Support
                </a>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-center mt-8">
              <p className="text-xs text-gray-400">
                Your payment was processed securely. This transaction is protected by industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Success;
