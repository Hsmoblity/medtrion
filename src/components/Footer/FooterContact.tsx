import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FooterContactProps } from '../../lib/interfaces/footer';

/* Lightweight inline icons — no external icon package required */
const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const MapPin = () => (
  <svg {...iconProps}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Mail = () => (
  <svg {...iconProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const Phone = () => (
  <svg {...iconProps}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

const Globe = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
  </svg>
);

/**
 * Footer Contact Component
 *
 * Displays company contact information with a clean, professional layout.
 * Icons anchor each contact type, phone numbers are grouped as labeled
 * "cards" instead of a stacked list, and typography uses a proper scale
 * (no default browser serif) so it reads as designed, not unstyled.
 */
const FooterContact: React.FC<FooterContactProps> = ({
  companyInfo,
  className = '',
}) => {
  const rowClass =
    'flex items-start gap-3 text-[15px] leading-relaxed text-gray-600';
  const iconWrapClass =
    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700';
  const linkClass =
    'text-gray-700 transition-colors duration-200 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`font-sans ${className}`}
    >

      <div className="space-y-6">
        {/* Logo */}
        <div className="flex justify-center lg:justify-start">
          <img
            src={
              typeof companyInfo.logo === 'string'
                ? companyInfo.logo
                : companyInfo.logo.sourceUrl
            }
            alt={
              typeof companyInfo.logo === 'string'
                ? `${companyInfo.name} logo`
                : companyInfo.logo.altText || `${companyInfo.name} logo`
            }
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* Description */}
        <p className="text-center text-[15px] leading-relaxed text-gray-600 lg:text-left">
          {companyInfo.description}
        </p>

        {/* Contact details */}
        <ul className="space-y-4">
          {/* Address */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={rowClass}
          >
            <span className={iconWrapClass}>
              <MapPin />
            </span>
            <address className="not-italic pt-1">
              {companyInfo.address.split('\n').map((line, index, arr) => (
                <React.Fragment key={index}>
                  {line}
                  {index < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </address>
          </motion.li>

          {/* Email */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className={rowClass}
          >
            <span className={iconWrapClass}>
              <Mail />
            </span>
            <Link
              href={`mailto:${companyInfo.email}`}
              className={`${linkClass} pt-1`}
              aria-label={`Send email to ${companyInfo.email}`}
            >
              {companyInfo.email}
            </Link>
          </motion.li>

          {/* Phone(s) */}
          <motion.li
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className={rowClass}
          >
            <span className={iconWrapClass}>
              <Phone />
            </span>

            {companyInfo.contactPhone && companyInfo.contactPhone.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                {companyInfo.contactPhone.map((phoneItem, index) => (
                  <div key={index} className="flex flex-col">
                    {phoneItem.name && (
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {phoneItem.name}
                      </span>
                    )}
                    <Link
                      href={`tel:${phoneItem.number}`}
                      className={linkClass}
                      aria-label={`Call ${phoneItem.name || 'us'} at ${phoneItem.number}`}
                    >
                      {phoneItem.number}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <Link
                href={`tel:${companyInfo.phone}`}
                className={`${linkClass} pt-1`}
                aria-label={`Call ${companyInfo.phone}`}
              >
                {companyInfo.phone}
              </Link>
            )}
          </motion.li>

          {/* Website */}
          {companyInfo.website && (
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className={rowClass}
            >
              <span className={iconWrapClass}>
                <Globe />
              </span>
              <Link
                href={companyInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClass} pt-1`}
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