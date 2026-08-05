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
    returnPolicy: string;
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
    background: 'bg-[#050812] text-white',
    text: {
      primary: 'text-white',
      secondary: 'text-white',
      accent: 'text-white hover:text-[#f7a236]',
      white: 'text-white'
    },
    borders: 'border-slate-800'
  },
  typography: {
    heading: 'text-sm uppercase tracking-[0.28em] font-semibold text-white',
    body: 'text-base leading-6 text-white',
    caption: 'text-sm text-slate-400',
    small: 'text-xs text-slate-400'
  },
  spacing: {
    section: 'py-10',
    container: 'px-4 sm:px-6 lg:px-8',
    grid: 'gap-8',
    item: 'my-2'
  },
  layout: {
    container: 'max-w-7xl mx-auto',
    grid: 'grid grid-cols-1 gap-8 xl:grid-cols-4',
    column: 'space-y-4'
  }
} as const;

// Default footer content
export const defaultFooterContent: FooterContent = {
  companyInfo: {
    name: 'Medtrion',
    description: 'Medtrion is your trusted source for a wide range of health services and mobility products designed to improve your quality of life. Please note: We are not manufacturers of Acorn stairlifts but proud affiliate partners.',
    logo: '/med-logo.png',
    address: '3495 Rebecca St Oakville, ON L6L 6X9',
    phone: '+1 (905) 330-1774',
    email: 'Info@medtrion.ca',
    website: 'https://medtrion.ca'
  },
  navigation: [
    {
      title: 'Products',
      links: [
        { label: 'Acorn 180 Curved Stairlift', href: '/product/acorn-stairlifts-acorn-180-curved-stairlift' },
        { label: 'Acorn 130 Straight Stairlift', href: '/product/acorn-stairlifts-acorn-130-straight-stairlift' },
        { label: 'VivaLift Tranquil 2 Lift Chair', href: '/product/vivalift-tranquil-2-plr-935s-lift-chair' },
        { label: 'VivaLift Ultra Lift Chair', href: '/product/vivalift-ultra-plr4955s-lift-chair' },
        { label: 'VivaLift Classic Lift Chair', href: '/product/vivalift-classic-plr-835s-lift-chair' }
      ]
    },

    {
      title: 'Help',
      links: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'FAQ', href: '/#faq' },
        { label: 'Blog', href: '/blogs' },
        { label: 'Contact Us', href: '/contact' }
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
    copyright: '© Copyright 2026. All Rights Reserved.',
    privacyPolicy: '/privacy-policy',
    termsOfService: '/terms-of-service',
    cookiePolicy: '/cookie-policy',
    returnPolicy: '/return-policy'
  }
};