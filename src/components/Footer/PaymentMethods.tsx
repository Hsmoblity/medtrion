import React from 'react';
import { motion } from 'framer-motion';
import { FooterPaymentMethodsProps, footerDesignTokens } from '../../lib/interfaces/footer';

/**
 * Payment Methods Component
 * 
 * Displays accepted payment method icons with consistent styling.
 * Maintains consistency with header design patterns.
 */
const PaymentMethods: React.FC<FooterPaymentMethodsProps> = ({
  paymentMethods,
  className = ""
}) => {
  const getPaymentIcon = (method: string) => {
    const iconMap: { [key: string]: string } = {
      visa: '/visa.svg',
      mastercard: '/mastercard.svg',
      amex: '/amex.svg',
      discover: '/discover.svg',
      paypal: '/paypal.svg',
      applepay: '/applepay.svg',
      googlepay: '/googlepay.svg'
    };
    
    return iconMap[method.toLowerCase()] || `/payment-icons/${method.toLowerCase()}.svg`;
  };

  const getPaymentAlt = (method: string) => {
    const altMap: { [key: string]: string } = {
      visa: 'Visa',
      mastercard: 'MasterCard',
      amex: 'American Express',
      discover: 'Discover',
      paypal: 'PayPal',
      applepay: 'Apple Pay',
      googlepay: 'Google Pay'
    };
    
    return altMap[method.toLowerCase()] || method;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={className}
    >
      <h3 className={`${footerDesignTokens.typography.heading} mb-4`}>
        We Accept
      </h3>
      <div className="flex justify-center gap-6 flex-wrap">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="transition-transform duration-300"
          >
            <img
              src={getPaymentIcon(method)}
              alt={getPaymentAlt(method)}
              className="w-10 h-auto object-contain"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PaymentMethods;