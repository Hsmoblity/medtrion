import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FooterPaymentMethodsProps } from '../../lib/interfaces/footer';

/**
 * Payment Methods Component
 *
 * Displays accepted payment method icons as consistent, bordered badges
 * rather than loose floating logos, so sizes line up and the row reads
 * as one deliberate group instead of scattered images.
 */
const PaymentMethods: React.FC<FooterPaymentMethodsProps> = ({
  paymentMethods,
  className = '',
}) => {
  const getPaymentIcon = (method: string) => {
    const iconMap: { [key: string]: string } = {
      visa: '/visa.svg',
      mastercard: '/mastercard.svg',
      amex: '/amex.svg',
      discover: '/discover.svg',
      paypal: '/paypal.svg',
      applepay: '/applepay.svg',
      googlepay: '/googlepay.svg',
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
      googlepay: 'Google Pay',
    };

    return altMap[method.toLowerCase()] || method;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`font-sans ${className}`}
    >
      <h3 className="text-xl uppercase text-white font-black font-poppins mb-5">
        We accept
      </h3>
      
      <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
            whileHover={{ y: -2 }}
            className="flex h-10 w-16 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-3 transition-shadow duration-200 hover:border-slate-500 hover:shadow-sm"
          >
            <Image
              src={getPaymentIcon(method)}
              alt={getPaymentAlt(method)}
              width={32}
              height={20}
              className="h-5 w-auto object-contain"
              unoptimized
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PaymentMethods;