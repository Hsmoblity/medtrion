/**
 * Footer Components Export
 * 
 * This file exports all footer-related components for easy importing.
 */

export { default as ProfessionalFooter } from './ProfessionalFooter';
export { default as NewsletterSignup } from './NewsletterSignup';
export { default as SocialMediaLinks } from './SocialMediaLinks';
export { default as FooterNavigation } from './FooterNavigation';
export { default as FooterContact } from './FooterContact';
export { default as PaymentMethods } from './PaymentMethods';
export { default as FooterLegal } from './FooterLegal';

// Export interfaces and types
export type {
  ProfessionalFooterProps,
  FooterContent,
  NewsletterSignupProps,
  SocialMediaLinkProps,
  FooterNavigationProps,
  FooterContactProps,
  FooterLegalProps,
  FooterPaymentMethodsProps
} from '../../lib/interfaces/footer';

export { defaultFooterContent, footerDesignTokens } from '../../lib/interfaces/footer';