import React from 'react';
import Image from 'next/image';
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

  const companyLogoSrc = typeof content.companyInfo.logo === 'string'
    ? content.companyInfo.logo
    : content.companyInfo.logo.sourceUrl;

  const companyLogoAlt = typeof content.companyInfo.logo === 'string'
    ? `${content.companyInfo.name} logo`
    : content.companyInfo.logo.altText || `${content.companyInfo.name} logo`;

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <footer
        className={`
          w-full bg-slate-950 text-white
          ${className}
        `}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className={`${footerDesignTokens.colors.background} ${getVariantClasses()} border-t border-slate-700`}>
          <div className={`${footerDesignTokens.layout.container} ${footerDesignTokens.spacing.container} space-y-10`}>
            {/* Main columns */}
            <div className="grid items-start gap-6 xl:grid-cols-3">
              <div className=" py-6 pl-0 pr-6">
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={companyLogoSrc}
                        alt={companyLogoAlt}
                        width={144}
                        height={48}
                        className="h-12 w-auto object-contain filter invert"
                        unoptimized
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-white">Google Reviews</p>
                        <div className="mt-2 flex items-center gap-3 text-white">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <span key={starIndex} className="text-[#f7a236]">★</span>
                            ))}
                          </div>
                          <span className="text-sm font-medium text-white">200+ rating and review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="max-w-3xl text-sm leading-7 text-white">
                    {content.companyInfo.description}
                  </p>
                </div>
              </div>

              {content.navigation
                .filter(nav => nav.title === 'Help')
                .map((nav, index) => (
                  <div
                    key={index}
                    className=""
                  >
                    <FooterNavigation
                      title={nav.title}
                      links={nav.links}
                      className="!mb-0"
                    />
                  </div>
                ))}

              <div className="">
                <h3 className={`${footerDesignTokens.typography.heading} mb-4`}>Contact</h3>
                <FooterContact companyInfo={content.companyInfo} className="!p-0" />
              </div>
            </div>

            {/* Payments and city tags */}
            <div className="rounded-[35px] border border-slate-800  p-6">
              <PaymentMethods paymentMethods={content.paymentMethods} className="mb-0" />
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.32em] text-white">
                {[
                  { label: 'Oakville', href: '/stairlifts-oakville' },
                  { label: 'Burlington', href: '/stairlifts-burlington' },
                  { label: 'Mississauga', href: '/stairlifts-mississauga' },
                  { label: 'Milton', href: '/stairlifts-milton' },
                  { label: 'Brampton', href: '/stairlifts-brampton' },
                  { label: 'Toronto', href: '/stairlifts-toronto' },
                  { label: 'Hamilton', href: '/stairlifts-hamilton' }
                ].map((city) => (
                  <a
                    key={city.label}
                    href={city.href}
                    className="rounded-full bg-slate-900/80 px-3 py-2 text-white transition-colors duration-200 hover:bg-slate-800 hover:text-[#f7a236]"
                  >
                    {city.label}
                  </a>
                ))}
              </div>
            </div>

            <FooterLegal legal={content.legal} className="px-6" />
          </div>
        </div>
      </footer>
    </>
  );
};

export default ProfessionalFooter;