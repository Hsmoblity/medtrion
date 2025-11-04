import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FooterContactProps, footerDesignTokens } from '../../lib/interfaces/footer';

/**
 * Footer Contact Component
 * 
 * Displays company contact information with consistent styling.
 * Maintains consistency with header design patterns.
 */
const FooterContact: React.FC<FooterContactProps> = ({
  companyInfo,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={className}
    >
      <h3 className={`${footerDesignTokens.typography.heading} mb-4`}>
        Contact Us
      </h3>
      <div className="space-y-4">
        {/* Company Logo */}
        <div className="flex justify-center lg:justify-start">
          <img
            src={companyInfo.logo}
            alt={`${companyInfo.name} Logo`}
            className="w-64 object-contain mb-4"
          />
        </div>
        
        {/* Company Description */}
        <p className={`
          ${footerDesignTokens.typography.body}
          ${footerDesignTokens.colors.text.secondary}
          mb-6 text-center lg:text-left
        `}>
          {companyInfo.description}
        </p>
        
        {/* Contact Information */}
        <ul className="space-y-3">
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={`
              ${footerDesignTokens.typography.body}
              ${footerDesignTokens.colors.text.secondary}
              ${footerDesignTokens.colors.text.accent}
              transition-colors duration-300
            `}
          >
            <address className="not-italic">
              {companyInfo.address.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < companyInfo.address.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </address>
          </motion.li>
          
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={footerDesignTokens.spacing.item}
          >
            <Link
              href={`mailto:${companyInfo.email}`}
              className={`
                ${footerDesignTokens.typography.body}
                ${footerDesignTokens.colors.text.secondary}
                ${footerDesignTokens.colors.text.accent}
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              aria-label={`Send email to ${companyInfo.email}`}
            >
              {companyInfo.email}
            </Link>
          </motion.li>
          
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={footerDesignTokens.spacing.item}
          >
            <Link
              href={`tel:${companyInfo.phone}`}
              className={`
                ${footerDesignTokens.typography.body}
                ${footerDesignTokens.colors.text.secondary}
                ${footerDesignTokens.colors.text.accent}
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              aria-label={`Call ${companyInfo.phone}`}
            >
              {companyInfo.phone}
            </Link>
          </motion.li>

          {/* Website Link */}
          {companyInfo.website && (
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className={footerDesignTokens.spacing.item}
            >
              <Link
                href={companyInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  ${footerDesignTokens.typography.body}
                  ${footerDesignTokens.colors.text.secondary}
                  ${footerDesignTokens.colors.text.accent}
                  transition-colors duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                aria-label={`Visit our website at ${companyInfo.website}`}
              >
                {companyInfo.website.replace(/^https?:\/\//, '')}
              </Link>
            </motion.li>
          )}
        </ul>
      </div>
    </motion.div>
  );
};

export default FooterContact;