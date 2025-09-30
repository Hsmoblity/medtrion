/**
 * Hero section interfaces for dynamic content management
 */

export interface HeroStatistic {
  value: string;
  label: string;
  icon?: string; // Icon name from react-icons
}

export interface HeroCTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary';
}

export interface HeroContent {
  title: string;
  subtitle: string;
  statistics: HeroStatistic[];
  ctaButtons: HeroCTAButton[];
  featuredProducts: string[]; // Product slugs for featured products
}

export interface HeroContentResponse {
  content: HeroContent;
  loading: boolean;
  error: string | null;
}
