// Payment Components - Professional Checkout Experience
// Export all payment-related components for easy importing

export { default as PaymentPage } from './PaymentPage';
export { default as PersonalInformationPanel } from './PersonalInformationPanel';
export { default as PaymentMethodPanel } from './PaymentMethodPanel';
export { default as OrderSummaryPanel } from './OrderSummaryPanel';
export { default as EditCartButton } from './EditCartButton';
export { default as PaymentComponentsDemo } from './PaymentComponentsDemo';
export { default as PaymentRetry } from './PaymentRetry';
export { default as PaymentStatus } from './PaymentStatus';

// Export payment-related types
export type { PaymentStatusData } from './PaymentStatus';

// Type exports
export type { default as PersonalInfoFormData } from './PersonalInformationPanel';

/**
 * Professional Payment Page Components
 * 
 * Features:
 * - Real-time form validation with react-hook-form and zod
 * - Professional design with Tailwind CSS
 * - Dark mode support
 * - Responsive layout (mobile, tablet, desktop)
 * - WCAG AA accessibility compliance
 * - Trust signals and security badges
 * - Comprehensive order summary
 * - Edit cart functionality
 * - Multiple payment method support
 * - TypeScript support
 * 
 * Usage:
 * ```tsx
 * import { PaymentPage } from '@/components/payment';
 * 
 * function CheckoutPage() {
 *   const handlePayment = async (data) => {
 *     // Process payment logic
 *   };
 *   
 *   return <PaymentPage onCompletePayment={handlePayment} />;
 * }
 * ```
 * 
 * Individual Components:
 * ```tsx
 * import { 
 *   PersonalInformationPanel,
 *   PaymentMethodPanel,
 *   OrderSummaryPanel,
 *   EditCartButton 
 * } from '@/components/payment';
 * ```
 */