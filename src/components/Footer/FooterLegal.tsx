import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FooterLegalProps } from '../../lib/interfaces/footer';

/**
 * Footer Legal Component
 *
 * Displays legal links and copyright information. Self-contained styling
 * (no external design-token lookup) so typography and spacing render
 * correctly regardless of how those tokens resolve elsewhere in the app.
 */
const FooterLegal: React.FC<FooterLegalProps> = ({
  legal,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();
  const copyrightText = legal.copyright.replace('2025', currentYear.toString());

  const linkClass =
    'text-[13px] font-medium text-white transition-colors duration-200 hover:text-[#f7a236] focus:outline-none focus:ring-[#f7a236] focus:ring-offset-2 rounded-sm px-1 py-0.5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={`
        flex flex-col-reverse items-center gap-4
        border-t border-slate-700 pt-6 mt-8
        sm:flex-row sm:justify-between
        font-sans
        ${className}
      `}
    >
      {/* Copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center text-[13px] text-white sm:text-left"
      >
        {copyrightText}
      </motion.p>

      {/* Legal Links */}
      <nav aria-label="Legal">
        <ul className="flex flex-wrap items-center justify-center gap-2">
          <li>
            <Link
              href={legal.privacyPolicy}
              className={linkClass}
              aria-label="Read our privacy policy"
            >
              Privacy policy
            </Link>
          </li>

          <li>
            <Link
              href={legal.termsOfService}
              className={linkClass}
              aria-label="Read our terms of service"
            >
              Terms of service
            </Link>
          </li>

          {legal.cookiePolicy && (
            <li>
              <Link
                href={legal.cookiePolicy}
                className={linkClass}
                aria-label="Read our cookie policy"
              >
                Cookie policy
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </motion.div>
  );
};

export default FooterLegal;