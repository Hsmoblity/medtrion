import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FooterLegalProps, footerDesignTokens } from '../../lib/interfaces/footer';

/**
 * Footer Legal Component
 * 
 * Displays legal links and copyright information with consistent styling.
 * Maintains consistency with header design patterns.
 */
const FooterLegal: React.FC<FooterLegalProps> = ({
  legal,
  devVersion,
  className = ""
}) => {
  const currentYear = new Date().getFullYear();
  const copyrightText = legal.copyright.replace('2025', currentYear.toString());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`
        flex flex-col items-center space-y-4
        border-t border-gray-300 pt-6 mt-8
        ${className}
      `}
    >
      {/* Legal Links */}
      <div className="flex flex-wrap justify-center gap-6">
        <Link
          href={legal.privacyPolicy}
          className={`
            ${footerDesignTokens.typography.small}
            ${footerDesignTokens.colors.text.secondary}
            ${footerDesignTokens.colors.text.accent}
            transition-colors duration-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            rounded px-2 py-1
          `}
          aria-label="Read our privacy policy"
        >
          Privacy Policy
        </Link>
        
        <Link
          href={legal.termsOfService}
          className={`
            ${footerDesignTokens.typography.small}
            ${footerDesignTokens.colors.text.secondary}
            ${footerDesignTokens.colors.text.accent}
            transition-colors duration-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            rounded px-2 py-1
          `}
          aria-label="Read our terms of service"
        >
          Terms of Service
        </Link>
        
        {legal.cookiePolicy && (
          <Link
            href={legal.cookiePolicy}
            className={`
              ${footerDesignTokens.typography.small}
              ${footerDesignTokens.colors.text.secondary}
              ${footerDesignTokens.colors.text.accent}
              transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              rounded px-2 py-1
            `}
            aria-label="Read our cookie policy"
          >
            Cookie Policy
          </Link>
        )}
      </div>
      
      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className={`
          ${footerDesignTokens.typography.body}
          ${footerDesignTokens.colors.text.secondary}
          text-center
        `}
      >
        {copyrightText}
      </motion.div>
      
      {/* Development Version */}
      {devVersion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={`
            ${footerDesignTokens.typography.small}
            ${footerDesignTokens.colors.text.secondary}
            text-center opacity-75
          `}
        >
          devVer: {devVersion}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FooterLegal;