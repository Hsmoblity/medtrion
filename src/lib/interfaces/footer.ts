/**
 * Professional Footer Component Interfaces
 * 
 * This file defines TypeScript interfaces for the professional footer component
 * that maintains consistency with the header styling and follows the design system.
 */

export interface FooterContent {
  companyInfo: {
    name: string;
    description: string;
    logo: string | {
      sourceUrl: string;
      altText?: string;
    };
    address: string;
    phone: string;
    contactPhone?: Array<{
      name: string;
      number: string;
    }>;
    email: string;
    website?: string;
  };
  navigation: {
    title: string;
    links: Array<{
      label: string;
      href: string;
      external?: boolean;
    }>;
  }[];
  socialMedia: SocialMediaLinkProps[];
  trustIndicators: Array<{
    type: 'certification' | 'award' | 'partnership';
    name: string;
    image: string;
    url?: string;
  }>;
  paymentMethods: string[];
  legal: {
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy?: string;
  };
}

export interface ProfessionalFooterProps {
  variant?: 'full' | 'minimal' | 'compact';
  showSocialMedia?: boolean;
  showTrustIndicators?: boolean;
  showContactForm?: boolean;
  customContent?: FooterContent;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface SocialMediaLinkProps {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube';
  url: string;
  icon: string;
  label?: string;
}

export interface NewsletterSignupProps {
  onSubmit?: (email: string) => Promise<void> | void;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

// Footer Design Tokens

export interface TrustIndicatorProps {
  type: 'certification' | 'award' | 'partnership';
  name: string;
  image: string;
  url?: string;
  className?: string;
}

export interface FooterNavigationProps {
  title: string;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
  className?: string;
}

export interface FooterContactProps {
  companyInfo: FooterContent['companyInfo'];
  className?: string;
}

export interface FooterLegalProps {
  legal: FooterContent['legal'];
  className?: string;
}

export interface FooterPaymentMethodsProps {
  paymentMethods: string[];
  className?: string;
}

// Design system tokens following header consistency
export const footerDesignTokens = {
  colors: {
    background: 'bg-[url(\'/nnnoise.svg\')] bg-cover bg-repeat', // Consistent with header
    text: {
      primary: 'text-black', // Consistent with header
      secondary: 'text-gray-500',
      accent: 'hover:text-indigo-600', // Consistent with header hover colors
      white: 'text-white'
    },
    borders: 'border-gray-300'
  },
  typography: {
    heading: 'text-xl uppercase text-black font-black font-poppins', // Consistent with header
    body: 'text-base leading-6',
    caption: 'text-sm',
    small: 'text-xs'
  },
  spacing: {
    section: 'py-2', // Consistent with header
    container: 'px-4 sm:px-6 md:px-6',
    grid: 'gap-6',
    item: 'my-2'
  },
  layout: {
    container: 'max-w-screen-xl mx-auto',
    grid: 'sm:flex justify-between',
    column: 'p-5'
  }
} as const;

// Default footer content
export const defaultFooterContent: FooterContent = {
  companyInfo: {
    name: 'Medtrion',
    description: 'Medtrion is your trusted source for a wide range of health services and mobility products designed to improve your quality of life. Please note: We are not manufacturers of Acorn stairlifts but proud affiliate partners.',
    logo: '/Logo.png',
    address: '3495 Rebecca St Oakville, ON L6L 6X9',
    phone: '+1 (905) 330-1774',
    email: 'Info@medtrion.ca',
    website: 'https://medtrion.ca'
  },
  navigation: [
    {
      title: 'Menu',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Shop All', href: '/#shop' },
        // { label: 'Acorn Stairlifts', href: '/product/acorn-stairlifts-acorn-180-curved-stairlift' },
        { label: 'Reviews', href: '/#reviews' },
        { label: 'FAQs', href: '/#faq' },
        { label: 'Blogs', href: '/blogs' }
      ]
    }
  ],
  socialMedia: [
    {
      platform: 'facebook',
      url: 'https://www.facebook.com/profile.php?id=61565518749182',
      icon: 'FaFacebook',
      label: 'Follow us on Facebook'
    },
    {
      platform: 'instagram',
      url: 'https://www.instagram.com/healthsupplymobility_/?hl=en',
      icon: 'FaInstagram',
      label: 'Follow us on Instagram'
    }
  ],
  trustIndicators: [],
  paymentMethods: ['visa', 'mastercard', 'amex', 'discover'],
  legal: {
    copyright: '© Copyright 2025. All Rights Reserved.',
    privacyPolicy: '/privacy-policy',
    termsOfService: '/terms-of-service',
    cookiePolicy: '/cookie-policy'
  }
};