import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

interface MobileFooterProps {
  isMobile: boolean;
  isTablet: boolean;
}

/**
 * Mobile-optimized footer component
 * Provides mobile-specific footer patterns and optimizations
 */
const MobileFooter: React.FC<MobileFooterProps> = ({
  isMobile,
  isTablet,
}) => {
  // Mobile-specific footer styles
  const footerStyles = {
    backgroundColor: '#1f2937',
    color: '#ffffff',
    padding: isMobile ? '32px 16px' : '48px 24px',
    marginTop: 'auto',
  };

  // Footer content styles
  const footerContentStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: isMobile ? '24px' : '32px',
  };

  // Footer section styles
  const sectionStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: isMobile ? '16px' : '20px',
  };

  // Footer title styles
  const titleStyles = {
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: isMobile ? '8px' : '12px',
  };

  // Footer link styles
  const linkStyles = {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: '1.5',
    transition: 'color 0.2s ease',
  };

  // Social media button styles
  const socialButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? '40px' : '44px',
    height: isMobile ? '40px' : '44px',
    backgroundColor: 'transparent',
    border: '1px solid #374151',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#d1d5db',
    transition: 'all 0.2s ease',
  };

  // Contact info styles
  const contactInfoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
    color: '#d1d5db',
    fontSize: isMobile ? '14px' : '16px',
    marginBottom: isMobile ? '8px' : '12px',
  };

  return (
    <footer 
      className="mobile-footer"
      style={footerStyles}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div style={footerContentStyles}>
        {/* Company Information */}
        <div style={sectionStyles}>
          <h3 style={titleStyles}>HSM Mobility</h3>
          <p style={{
            color: '#d1d5db',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '1.6',
            marginBottom: isMobile ? '16px' : '20px',
          }}>
            Your trusted partner for premium mobility solutions. 
            We provide innovative products and exceptional service 
            to enhance your transportation experience.
          </p>
          
          {/* Social Media Links */}
          <div style={{
            display: 'flex',
            gap: isMobile ? '12px' : '16px',
            marginTop: isMobile ? '16px' : '20px',
          }}>
            <a
              href="https://www.facebook.com/profile.php?id=61565518749182"
              target="_blank"
              rel="noopener noreferrer"
              style={socialButtonStyles}
              aria-label="Follow us on Facebook"
            >
              <FaFacebook size={isMobile ? 16 : 18} />
            </a>
            <a
              href="https://www.instagram.com/healthsupplymobility_/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              style={socialButtonStyles}
              aria-label="Follow us on Instagram"
            >
              <FaInstagram size={isMobile ? 16 : 18} />
            </a>
            <a
              href="https://medtrion.ca"
              target="_blank"
              rel="noopener noreferrer"
              style={socialButtonStyles}
              aria-label="Visit our website"
            >
              <svg width={isMobile ? 16 : 18} height={isMobile ? 16 : 18} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div style={sectionStyles}>
          <h3 style={titleStyles}>Quick Links</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '8px' : '12px',
          }}>
            {[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Configurator', href: '/configurator' },
              { label: 'Blog', href: '/blogs' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#d1d5db';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Customer Service */}
        <div style={sectionStyles}>
          <h3 style={titleStyles}>Customer Service</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: isMobile ? '8px' : '12px',
          }}>
            {[
              { label: 'Support Center', href: '/support' },
              { label: 'Order Tracking', href: '/track' },
              { label: 'Returns & Exchanges', href: '/returns' },
              { label: 'Warranty Information', href: '/warranty' },
              { label: 'FAQ', href: '/faq' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={linkStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#d1d5db';
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div style={sectionStyles}>
          <h3 style={titleStyles}>Contact Information</h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: isMobile ? '8px' : '12px',
          }}>
            <div style={contactInfoStyles}>
              <FaMapMarkerAlt size={isMobile ? 14 : 16} />
              <span>123 Mobility Street, Tech City, TC 12345</span>
            </div>
            <div style={contactInfoStyles}>
              <FaPhone size={isMobile ? 14 : 16} />
              <a 
                href="tel:+1234567890" 
                style={{ ...linkStyles, color: '#d1d5db' }}
              >
                +1 (234) 567-8900
              </a>
            </div>
            <div style={contactInfoStyles}>
              <FaEnvelope size={isMobile ? 14 : 16} />
              <a 
                href="mailto:info@medtrion.ca" 
                style={{ ...linkStyles, color: '#d1d5db' }}
              >
                info@medtrion.ca
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div style={sectionStyles}>
          <h3 style={titleStyles}>Stay Updated</h3>
          <p style={{
            color: '#d1d5db',
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '1.6',
            marginBottom: isMobile ? '12px' : '16px',
          }}>
            Subscribe to our newsletter for the latest updates and offers.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' as const : 'row' as const,
            gap: isMobile ? '12px' : '8px',
          }}>
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: isMobile ? '12px 16px' : '14px 18px',
                border: '1px solid #374151',
                borderRadius: '8px',
                backgroundColor: '#374151',
                color: '#ffffff',
                fontSize: isMobile ? '14px' : '16px',
                outline: 'none',
              }}
            />
            <button
              style={{
                padding: isMobile ? '12px 24px' : '14px 28px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                whiteSpace: 'nowrap' as const,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: isMobile ? '24px' : '32px',
          textAlign: 'center' as const,
          color: '#9ca3af',
          fontSize: isMobile ? '12px' : '14px',
        }}>
          <p style={{ margin: 0, marginBottom: isMobile ? '8px' : '12px' }}>
            © 2025 HSM Mobility. All rights reserved.
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: isMobile ? '16px' : '24px',
            flexWrap: 'wrap' as const,
          }}>
            <a
              href="/privacy-policy"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              Terms of Service
            </a>
            <a
              href="/cookie-policy"
              style={{
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: isMobile ? '12px' : '14px',
              }}
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-footer {
          /* Mobile-specific footer optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .mobile-footer button {
          /* Touch-friendly buttons */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-footer button:active {
          transform: scale(0.95);
        }

        .mobile-footer a {
          /* Touch-friendly links */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-footer a:active {
          color: #ffffff !important;
        }

        .mobile-footer input {
          /* Mobile-friendly input */
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .mobile-footer input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .mobile-footer {
            padding: 32px 16px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-footer {
            padding: 40px 20px !important;
          }
        }

        @media (min-width: 1024px) {
          .mobile-footer {
            padding: 48px 24px !important;
          }
        }

        /* Mobile-specific accessibility */
        .mobile-footer:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </footer>
  );
};

export default MobileFooter;