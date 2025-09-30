import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { handleAnchorNavigation } from '../../lib/utils/navigation';
import { FooterNavigationProps, footerDesignTokens } from '../../lib/interfaces/footer';

/**
 * Footer Navigation Component
 * 
 * Displays navigation links with consistent styling and proper anchor handling.
 * Maintains consistency with header navigation patterns.
 */
const FooterNavigation: React.FC<FooterNavigationProps> = ({
  title,
  links,
  className = ""
}) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <h3 className={`${footerDesignTokens.typography.heading} mb-4`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <motion.li
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={footerDesignTokens.spacing.item}
          >
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  ${footerDesignTokens.typography.body}
                  ${footerDesignTokens.colors.text.secondary}
                  ${footerDesignTokens.colors.text.accent}
                  transition-colors duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                aria-label={`${link.label} (opens in new tab)`}
              >
                {link.label}
              </a>
            ) : link.href.startsWith('#') ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAnchorNavigation(link.href, router, link.label);
                }}
                className={`
                  ${footerDesignTokens.typography.body}
                  ${footerDesignTokens.colors.text.secondary}
                  ${footerDesignTokens.colors.text.accent}
                  transition-colors duration-300
                  text-left
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
              </button>
            ) : (
              <Link
                href={link.href}
                className={`
                  ${footerDesignTokens.typography.body}
                  ${footerDesignTokens.colors.text.secondary}
                  ${footerDesignTokens.colors.text.accent}
                  transition-colors duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
                aria-label={`Navigate to ${link.label}`}
              >
                {link.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default FooterNavigation;