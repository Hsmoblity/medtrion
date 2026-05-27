import React from 'react';
import { motion } from 'framer-motion';
import { ProfessionalFooterProps, defaultFooterContent, footerDesignTokens } from '../../lib/interfaces/footer';
import FooterNavigation from './FooterNavigation';
import FooterContact from './FooterContact';
import SocialMediaLinks from './SocialMediaLinks';
import PaymentMethods from './PaymentMethods';
import FooterLegal from './FooterLegal';

/**
 * Professional Footer Component
 * 
 * A modern, professional footer component with enhanced functionality,
 * accessibility, and responsive design. Maintains consistency with header styling.
 */
const ProfessionalFooter: React.FC<ProfessionalFooterProps> = ({
  variant = 'full',
  showSocialMedia = true,
  showTrustIndicators = false,
  showContactForm = false,
  customContent,
  className = "",
  theme = 'auto'
}) => {
  const content = customContent || defaultFooterContent;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": content.companyInfo.name,
    "url": "https://medtrion.ca",
    "logo": content.companyInfo.logo,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": content.companyInfo.address,
      "addressLocality": "Oakville",
      "addressRegion": "ON",
      "postalCode": "L6L 6X9",
      "addressCountry": "CA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": content.companyInfo.phone,
      "contactType": "customer service",
      "email": content.companyInfo.email
    },
    "sameAs": content.socialMedia.map(social => social.url)
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'py-8';
      case 'compact':
        return 'py-4';
      default:
        return 'py-12';
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <footer
        className={`
          w-full bg-inherit
          ${className}
        `}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className={`
          ${footerDesignTokens.colors.background}
          ${getVariantClasses()}
        `}>
          <div className={`
            ${footerDesignTokens.layout.container}
            ${footerDesignTokens.spacing.container}
            ${footerDesignTokens.layout.grid}
            ${footerDesignTokens.colors.text.primary}
            ${variant === 'compact' ? 'sm:text-left text-center' : 'md:text-left text-center'}
          `}>
            
            {/* Navigation Section */}
            {variant !== 'compact' && (
              <div className={`
                ${footerDesignTokens.layout.column}
                ${variant === 'minimal' ? 'sm:w-2/12' : 'sm:w-2/12'}
                border-r border-gray-300 hidden md:block
              `}>
                {content.navigation.map((nav, index) => (
                  <FooterNavigation
                    key={index}
                    title={nav.title}
                    links={nav.links}
                    className="mb-6"
                  />
                ))}
              </div>
            )}
            
            {/* Company Information Section */}
            <div className={`
              ${footerDesignTokens.layout.column}
              ${variant === 'compact' ? 'sm:w-full' : variant === 'minimal' ? 'sm:w-7/12' : 'sm:w-7/12'}
              ${variant === 'compact' ? '' : 'border-r border-gray-300'}
              text-center
            `}>
              <FooterContact
                companyInfo={content.companyInfo}
                className="mb-6"
              />
            </div>
            
            {/* Social Media Section */}
            {variant !== 'compact' && showSocialMedia && content.socialMedia.length > 0 && (
              <div className={`
                ${footerDesignTokens.layout.column}
                ${variant === 'minimal' ? 'sm:w-3/12' : 'sm:w-3/12'}
                px-5 pt-5
              `}>
                <SocialMediaLinks
                  socialMedia={content.socialMedia}
                  className="mb-6"
                />
              </div>
            )}
          </div>
          
          {/* Payment Methods Section */}
          {content.paymentMethods.length > 0 && (
            <div className={`
              ${footerDesignTokens.layout.container}
              ${footerDesignTokens.spacing.container}
              mt-8
            `}>
              <PaymentMethods
                paymentMethods={content.paymentMethods}
                className="mb-6"
              />
            </div>
          )}
          
          {/* Legal Section */}
          <div className={`
            ${footerDesignTokens.layout.container}
            ${footerDesignTokens.spacing.container}
          `}>
            <FooterLegal
              legal={content.legal}
            />
          </div>
        </div>
      </footer>
    </>
  );
};

export default ProfessionalFooter;