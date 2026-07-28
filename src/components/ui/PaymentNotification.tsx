import React from 'react';
import { FaExclamationCircle, FaCreditCard, FaEnvelope, FaPhone } from 'react-icons/fa';

interface PaymentNotificationProps {
  type: 'configuration' | 'maintenance' | 'error';
  title: string;
  message: string;
  showContactInfo?: boolean;
  onRetry?: () => void;
  className?: string;
}

const PaymentNotification: React.FC<PaymentNotificationProps> = ({
  type,
  title,
  message,
  showContactInfo = true,
  onRetry,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'configuration':
        return <FaCreditCard className="w-6 h-6 text-[#3fa2a3]" />;
      case 'maintenance':
        return <FaExclamationCircle className="w-6 h-6 text-yellow-600" />;
      case 'error':
        return <FaExclamationCircle className="w-6 h-6 text-red-600" />;
      default:
        return <FaExclamationCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'configuration':
        return 'bg-orange-50 border-orange-200';
      case 'maintenance':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'configuration':
        return 'text-brand-dark';
      case 'maintenance':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${getBackgroundColor()} ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${getTextColor()} mb-2`}>
            {title}
          </h3>
          
          <p className={`text-sm ${getTextColor()} mb-4`}>
            {message}
          </p>
          
          {showContactInfo && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaEnvelope className="w-4 h-4" />
                <span>Email us at: <a href="mailto:support@medtrion.ca" className="text-[#3fa2a3] hover:text-brand-dark underline">support@medtrion.ca</a></span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FaPhone className="w-4 h-4" />
                <span>Call us at: <a href="tel:+1-800-HSM-HELP" className="text-[#3fa2a3] hover:text-brand-dark underline">1-800-HSM-HELP</a></span>
              </div>
            </div>
          )}
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-primary font-semibold rounded-[35px] text-white bg-[#3fa2a3] hover:bg-[#f7a236] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7a236] transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentNotification;
