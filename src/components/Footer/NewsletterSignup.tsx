import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../ui/PrimaryButton';
import { NewsletterSignupProps, footerDesignTokens } from '../../lib/interfaces/footer';

/**
 * Newsletter Signup Component
 * 
 * Professional newsletter signup form with validation, loading states,
 * and success/error feedback. Maintains consistency with header styling.
 */
const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  onSubmit,
  placeholder = "Enter your email",
  buttonText = "Subscribe",
  successMessage = "Thank you for subscribing!",
  errorMessage = "Please enter a valid email",
  className = ""
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage(errorMessage);
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      await onSubmit(email);
      setStatus('success');
      setMessage(successMessage);
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`w-full ${className}`}
    >
      <h3 className={`${footerDesignTokens.typography.heading} mb-4`}>
        Stay Updated
      </h3>
      <p className={`${footerDesignTokens.typography.body} ${footerDesignTokens.colors.text.secondary} mb-6`}>
        Get the latest updates on our products and services.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={`
              flex-1 px-4 py-3 rounded-lg border border-gray-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${footerDesignTokens.typography.body}
              placeholder-gray-400
            `}
            disabled={isLoading}
            aria-label="Email address for newsletter subscription"
            required
          />
          <PrimaryButton
            type="submit"
            loading={isLoading}
            disabled={isLoading || !email.trim()}
            className="px-6 py-3 whitespace-nowrap"
          >
            {isLoading ? 'Subscribing...' : buttonText}
          </PrimaryButton>
        </div>
        
        {message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`text-sm ${getStatusColor()}`}
            role="alert"
            aria-live="polite"
          >
            {message}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default NewsletterSignup;