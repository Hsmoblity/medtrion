import React from 'react';
import MobileLayout from '../layout/MobileLayout';
import MobileButton from '../ui/MobileButton';
import MobileImage from '../ui/MobileImage';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

interface MobileHomePageProps {
  featuredProducts?: any[];
  heroData?: any;
  className?: string;
}

/**
 * Mobile-optimized homepage component
 * Provides mobile-specific homepage layout and interactions
 */
const MobileHomePage: React.FC<MobileHomePageProps> = ({
  featuredProducts = [],
  heroData,
  className = '',
}) => {
  const { isMobile, isTablet, getMobileOptimizations, scrollToElement } = useMobileOptimization();
  const optimizations = getMobileOptimizations();

  // Mobile-specific hero section
  const renderHeroSection = () => {
    const heroStyles = {
      position: 'relative' as const,
      height: isMobile ? '60vh' : '70vh',
      minHeight: isMobile ? '400px' : '500px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      textAlign: 'center' as const,
      padding: isMobile ? '40px 20px' : '60px 40px',
    };

    return (
      <section 
        className="mobile-hero"
        style={heroStyles}
        aria-label="Hero section"
      >
        <div style={{
          maxWidth: '800px',
          width: '100%',
        }}>
          <h1 style={{
            fontSize: isMobile ? '28px' : '36px',
            fontWeight: 'bold',
            marginBottom: isMobile ? '16px' : '24px',
            lineHeight: 1.2,
          }}>
            {heroData?.title || 'Premium Mobility Solutions'}
          </h1>
          
          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            marginBottom: isMobile ? '24px' : '32px',
            opacity: 0.9,
            lineHeight: 1.6,
          }}>
            {heroData?.description || 'Discover innovative products and exceptional service to enhance your transportation experience.'}
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' as const : 'row' as const,
            gap: isMobile ? '12px' : '16px',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <MobileButton
              variant="primary"
              size="large"
              onClick={() => scrollToElement('products')}
              fullWidth={isMobile}
            >
              Explore Products
            </MobileButton>
            
            <MobileButton
              variant="outline"
              size="large"
              onClick={() => scrollToElement('configurator')}
              fullWidth={isMobile}
            >
              Start Configuring
            </MobileButton>
          </div>
        </div>
      </section>
    );
  };

  // Mobile-specific featured products section
  const renderFeaturedProducts = () => {
    const sectionStyles = {
      padding: isMobile ? '40px 20px' : '60px 40px',
      backgroundColor: '#ffffff',
    };

    const gridStyles = {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isMobile ? '20px' : '32px',
      maxWidth: '1200px',
      margin: '0 auto',
    };

    return (
      <section 
        id="products"
        className="mobile-featured-products"
        style={sectionStyles}
        aria-label="Featured products"
      >
        <div style={{
          textAlign: 'center' as const,
          marginBottom: isMobile ? '32px' : '48px',
        }}>
          <h2 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: isMobile ? '12px' : '16px',
          }}>
            Featured Products
          </h2>
          
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Discover our most popular mobility solutions designed for modern living.
          </p>
        </div>

        <div style={gridStyles}>
          {featuredProducts.slice(0, isMobile ? 3 : 6).map((product, index) => (
            <div
              key={product.id || index}
              className="mobile-product-card"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              <MobileImage
                src={product.image || '/placeholder-product.jpg'}
                alt={product.name || 'Product image'}
                width={300}
                height={200}
                className="product-image"
                loading={index < 2 ? 'eager' : 'lazy'}
                placeholder="Loading product..."
                fallback="/placeholder-product.jpg"
              />
              
              <div style={{
                padding: isMobile ? '16px' : '20px',
              }}>
                <h3 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: isMobile ? '8px' : '12px',
                  lineHeight: 1.3,
                }}>
                  {product.name || 'Product Name'}
                </h3>
                
                <p style={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: '#6b7280',
                  marginBottom: isMobile ? '12px' : '16px',
                  lineHeight: 1.5,
                }}>
                  {product.description || 'Product description goes here.'}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isMobile ? '12px' : '16px',
                }}>
                  <span style={{
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: 'bold',
                    color: '#059669',
                  }}>
                    ${product.price || '999'}
                  </span>
                  
                  <MobileButton
                    variant="primary"
                    size="small"
                    onClick={() => {/* Navigate to product */}}
                  >
                    View Details
                  </MobileButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Mobile-specific configurator section
  const renderConfiguratorSection = () => {
    const sectionStyles = {
      padding: isMobile ? '40px 20px' : '60px 40px',
      backgroundColor: '#f8fafc',
    };

    return (
      <section 
        id="configurator"
        className="mobile-configurator"
        style={sectionStyles}
        aria-label="Product configurator"
      >
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center' as const,
        }}>
          <h2 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: isMobile ? '16px' : '24px',
          }}>
            Customize Your Solution
          </h2>
          
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#6b7280',
            marginBottom: isMobile ? '24px' : '32px',
            lineHeight: 1.6,
          }}>
            Use our advanced configurator to customize your mobility solution with options, accessories, and personalization features.
          </p>
          
          <MobileButton
            variant="primary"
            size="large"
            onClick={() => {/* Navigate to configurator */}}
            fullWidth={isMobile}
          >
            Start Configuration
          </MobileButton>
        </div>
      </section>
    );
  };

  // Mobile-specific features section
  const renderFeaturesSection = () => {
    const features = [
      {
        icon: '🚀',
        title: 'Fast Delivery',
        description: 'Quick and reliable shipping to your doorstep',
      },
      {
        icon: '🛡️',
        title: 'Warranty Protection',
        description: 'Comprehensive warranty coverage for peace of mind',
      },
      {
        icon: '🔧',
        title: 'Expert Support',
        description: 'Professional installation and maintenance services',
      },
    ];

    const sectionStyles = {
      padding: isMobile ? '40px 20px' : '60px 40px',
      backgroundColor: '#ffffff',
    };

    const gridStyles = {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: isMobile ? '24px' : '32px',
      maxWidth: '1000px',
      margin: '0 auto',
    };

    return (
      <section 
        className="mobile-features"
        style={sectionStyles}
        aria-label="Features and benefits"
      >
        <div style={{
          textAlign: 'center' as const,
          marginBottom: isMobile ? '32px' : '48px',
        }}>
          <h2 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: isMobile ? '12px' : '16px',
          }}>
            Why Choose HSM Mobility?
          </h2>
          
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            color: '#6b7280',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            We provide exceptional value through quality products, reliable service, and customer-focused solutions.
          </p>
        </div>

        <div style={gridStyles}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="mobile-feature-card"
              style={{
                textAlign: 'center' as const,
                padding: isMobile ? '24px 16px' : '32px 24px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontSize: isMobile ? '32px' : '40px',
                marginBottom: isMobile ? '16px' : '20px',
              }}>
                {feature.icon}
              </div>
              
              <h3 style={{
                fontSize: isMobile ? '18px' : '20px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: isMobile ? '8px' : '12px',
              }}>
                {feature.title}
              </h3>
              
              <p style={{
                fontSize: isMobile ? '14px' : '16px',
                color: '#6b7280',
                lineHeight: 1.5,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <MobileLayout
      title="HSM Mobility - Premium Mobility Solutions"
      description="Discover innovative products and exceptional service to enhance your transportation experience."
      className={`mobile-home-page ${className}`}
    >
      {renderHeroSection()}
      {renderFeaturedProducts()}
      {renderConfiguratorSection()}
      {renderFeaturesSection()}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-home-page {
          /* Mobile-specific homepage optimizations */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .mobile-hero {
          /* Mobile-specific hero optimizations */
          background-attachment: scroll; /* Prevent parallax issues on mobile */
        }

        .mobile-product-card {
          /* Mobile-specific product card optimizations */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-product-card:active {
          transform: scale(0.98);
        }

        .mobile-feature-card {
          /* Mobile-specific feature card optimizations */
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .mobile-feature-card:active {
          transform: scale(0.98);
        }

        /* Mobile-specific responsive adjustments */
        @media (max-width: 767px) {
          .mobile-hero {
            height: 60vh !important;
            min-height: 400px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .mobile-hero {
            height: 65vh !important;
            min-height: 450px !important;
          }
        }

        @media (min-width: 1024px) {
          .mobile-hero {
            height: 70vh !important;
            min-height: 500px !important;
          }
        }

        /* Mobile-specific accessibility */
        .mobile-home-page:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Mobile-specific performance optimizations */
        .mobile-home-page * {
          will-change: auto;
        }

        .mobile-home-page .mobile-product-card:hover *,
        .mobile-home-page .mobile-feature-card:hover * {
          will-change: transform;
        }
      `}</style>
    </MobileLayout>
  );
};

export default MobileHomePage;