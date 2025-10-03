import React from 'react';
import PaymentNotification from '../ui/PaymentNotification';
import { FaCreditCard, FaShieldAlt, FaClock, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

interface PaymentConfigurationNoticeProps {
  onRetry?: () => void;
  className?: string;
}

const PaymentConfigurationNotice: React.FC<PaymentConfigurationNoticeProps> = ({
  onRetry,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Configuration Notice */}
      <PaymentNotification
        type="configuration"
        title="Payment System Setup Required"
        message="Our payment system is currently being configured. We're working to get secure payment processing set up for you as quickly as possible."
        showContactInfo={true}
        onRetry={onRetry}
      />

      {/* Additional Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          What This Means
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FaShieldAlt className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900">Secure Payment Processing</h5>
              <p className="text-sm text-gray-600">
                We're implementing industry-standard security measures to protect your payment information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FaClock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900">Temporary Service</h5>
              <p className="text-sm text-gray-600">
                This is a temporary situation while we complete our payment system setup.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FaCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900">Your Order is Safe</h5>
              <p className="text-sm text-gray-600">
                Your cart items are saved and will be available once payment processing is ready.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Alternative Ways to Complete Your Order
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <FaCreditCard className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              <strong>Phone Orders:</strong> Call us to place your order over the phone
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <FaEnvelope className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              <strong>Email Orders:</strong> Send us your order details via email
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <FaCheckCircle className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">
              <strong>In-Store Pickup:</strong> Visit our showroom to complete your purchase
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">
          Need Immediate Assistance?
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium text-blue-800">Customer Service</h5>
            <p className="text-sm text-blue-700">
              <a href="tel:+1-800-HSM-HELP" className="hover:text-blue-900 underline">
                1-800-HSM-HELP
              </a>
            </p>
            <p className="text-sm text-blue-700">
              <a href="mailto:support@hsmobility.ca" className="hover:text-blue-900 underline">
                support@hsmobility.ca
              </a>
            </p>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium text-blue-800">Business Hours</h5>
            <p className="text-sm text-blue-700">Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p className="text-sm text-blue-700">Saturday: 10:00 AM - 4:00 PM</p>
            <p className="text-sm text-blue-700">Sunday: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfigurationNotice;