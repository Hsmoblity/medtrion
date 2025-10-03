import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface MobileHeaderProps {
  title?: string;
  description?: string;
  isMobile: boolean;
  isTablet: boolean;
}

/**
 * Mobile-optimized header component
 * Provides mobile-specific navigation and header patterns
 */
const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  description,
  isMobile,
  isTablet,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { scrollToTop, detectSwipe } = useMobileOptimization();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.mobile-header') && !target.closest('.mobile-menu')) {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    if (isMenuOpen || isSearchOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, isSearchOpen]);

  // Handle menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsSearchOpen(false);
  };

  // Handle search toggle
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false);
  };

  // Handle logo click
  const handleLogoClick = () => {
    scrollToTop();
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  // Mobile-specific header styles
  const headerStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    height: isMobile ? '60px' : '80px',
  };

  // Header content styles
  const headerContentStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    padding: isMobile ? '0 16px' : '0 24px',
    maxWidth: '100%',
  };

  // Logo styles
  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: isMobile ? '18px' : '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    textDecoration: 'none',
  };

  // Action buttons styles
  const actionButtonsStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px',
  };

  // Button styles
  const buttonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobile ? '40px' : '44px',
    height: isMobile ? '40px' : '44px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s ease',
  };

  return (
    <>
      {/* Mobile Header */}
      <header 
        className="mobile-header"
        style={headerStyles}
        role="banner"
        aria-label="Main navigation"
      >
        <div style={headerContentStyles}>
          {/* Logo */}
          <div 
            style={logoStyles}
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            aria-label="Go to homepage"
          >
            {title || 'HSM Mobility'}
          </div>

          {/* Action Buttons */}
          <div style={actionButtonsStyles}>
            {/* Search Button */}
            <button
              style={buttonStyles}
              onClick={toggleSearch}
              aria-label="Search"
              aria-expanded={isSearchOpen}
            >
              <FaSearch size={isMobile ? 16 : 18} />
            </button>

            {/* Cart Button */}
            <button
              style={buttonStyles}
              onClick={() => {/* Navigate to cart */}}
              aria-label="Shopping cart"
            >
              <FaShoppingCart size={isMobile ? 16 : 18} />
            </button>

            {/* User Button */}
            <button
              style={buttonStyles}
              onClick={() => {/* Navigate to user account */}}
              aria-label="User account"
            >
              <FaUser size={isMobile ? 16 : 18} />
            </button>

            {/* Menu Toggle Button */}
            <button
              style={buttonStyles}
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <FaTimes size={isMobile ? 16 : 18} />
              ) : (
                <FaBars size={isMobile ? 16 : 18} />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div 
            className="mobile-search"
            style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
            }}
          >
            <input
              type="text"
              placeholder="Search products..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
              }}
              autoFocus
            />
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          style={{
            position: 'fixed',
            top: isMobile ? '60px' : '80px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav 
          className="mobile-menu"
          style={{
            position: 'fixed',
            top: isMobile ? '60px' : '80px',
            right: 0,
            width: isMobile ? '280px' : '320px',
            height: 'calc(100vh - 60px)',
            backgroundColor: '#ffffff',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflowY: 'auto',
          }}
          role="navigation"
          aria-label="Mobile navigation menu"
        >
          <div style={{ padding: '24px' }}>
            {/* Navigation Links */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px' 
              }}>
                Navigation
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Configurator', href: '/configurator' },
                  { label: 'Blog', href: '/blogs' },
                  { label: 'Contact', href: '/contact' },
                ].map((item) => (
                  <li key={item.label} style={{ marginBottom: '12px' }}>
                    <a
                      href={item.href}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Actions */}
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '16px' 
              }}>
                Account
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'My Account', href: '/account' },
                  { label: 'Orders', href: '/orders' },
                  { label: 'Wishlist', href: '/wishlist' },
                  { label: 'Settings', href: '/settings' },
                ].map((item) => (
                  <li key={item.label} style={{ marginBottom: '12px' }}>
                    <a
                      href={item.href}
                      style={{
                        display: 'block',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-header {
          /* Mobile-specific header optimizations */
          -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
        }

        .mobile-header button {
          /* Touch-friendly buttons */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-header button:active {
          transform: scale(0.95);
        }

        .mobile-menu {
          /* Mobile menu optimizations */
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        .mobile-menu a {
          /* Touch-friendly links */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-menu a:active {
          background-color: #e5e7eb !important;
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .mobile-menu {
            width: 280px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-menu {
            width: 320px !important;
          }
        }

        /* Mobile-specific accessibility */
        .mobile-header:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .mobile-menu:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default MobileHeader;