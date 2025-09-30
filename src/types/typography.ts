/**
 * Typography System Type Definitions
 * Type-safe interfaces for the comprehensive typography system
 */

// Font Family Types
export type FontFamily = 'primary' | 'secondary' | 'display' | 'monospace';

// Font Size Scale
export type FontSize = 
  | 'xs' | 'sm' | 'base' | 'lg' | 'xl' 
  | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';

// Font Weight Scale
export type FontWeight = 
  | 'thin' | 'extralight' | 'light' | 'normal' 
  | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

// Line Height Scale
export type LineHeight = 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';

// Letter Spacing Scale
export type LetterSpacing = 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';

// Color Variants for Typography
export type TypographyColor = 
  | 'primary' | 'secondary' | 'tertiary' | 'inverse' 
  | 'accent' | 'success' | 'error' | 'warning' | 'info';

// Text Alignment
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

// Semantic Typography Variants
export type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type BodyVariant = 'large' | 'base' | 'small' | 'caption';
export type InteractiveVariant = 'link' | 'button' | 'label';
export type SpecialVariant = 'code' | 'quote' | 'highlight';

// Combined Typography Variant
export type TypographyVariant = 
  | HeadingVariant 
  | BodyVariant 
  | InteractiveVariant 
  | SpecialVariant;

// Typography Configuration Interface
export interface TypographyConfig {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  fontFamily: FontFamily;
  letterSpacing?: string;
  textDecoration?: string;
  fontStyle?: string;
}

// Typography Component Props Interface
export interface TypographyProps {
  // Core Typography Properties
  variant?: TypographyVariant;
  size?: FontSize;
  weight?: FontWeight;
  family?: FontFamily;
  color?: TypographyColor;
  align?: TextAlign;
  
  // Advanced Typography Properties
  lineHeight?: LineHeight;
  letterSpacing?: LetterSpacing;
  responsive?: boolean;
  
  // HTML and Accessibility
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  className?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Event Handlers
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Heading Component Props
export interface HeadingProps extends Omit<TypographyProps, 'variant'> {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  semanticLevel?: 1 | 2 | 3 | 4 | 5 | 6; // For cases where visual and semantic levels differ
}

// Text Component Props
export interface TextProps extends Omit<TypographyProps, 'variant'> {
  variant?: BodyVariant;
}

// Link Component Props
export interface LinkProps extends Omit<TypographyProps, 'variant'> {
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  external?: boolean;
}

// Code Component Props
export interface CodeProps extends Omit<TypographyProps, 'variant'> {
  inline?: boolean;
  language?: string;
  copy?: boolean;
}

// Quote Component Props
export interface QuoteProps extends Omit<TypographyProps, 'variant'> {
  author?: string;
  cite?: string;
}

// Responsive Typography Breakpoint
export interface ResponsiveBreakpoint {
  baseSize: string;
  scaleFactor: number;
  maxWidth?: string;
  minWidth?: string;
}

// Complete Typography Theme Interface
export interface TypographyTheme {
  fontFamily: Record<FontFamily, string[]>;
  fontSize: Record<FontSize, string>;
  fontWeight: Record<FontWeight, number>;
  lineHeight: Record<LineHeight, number>;
  letterSpacing: Record<LetterSpacing, string>;
  semanticTypography: {
    headings: Record<HeadingVariant, TypographyConfig>;
    body: Record<BodyVariant, TypographyConfig>;
    interactive: Record<InteractiveVariant, TypographyConfig>;
    special: Record<SpecialVariant, TypographyConfig>;
  };
  responsiveTypography: {
    mobile: ResponsiveBreakpoint;
    tablet: ResponsiveBreakpoint;
    desktop: ResponsiveBreakpoint;
  };
}

// Utility type for extracting CSS classes
export type TypographyClasses = {
  [K in TypographyVariant]: string;
} & {
  // Legacy compatibility
  heading: string;
  body: string;
  secondary: string;
  muted: string;
};

// Font Loading Status
export type FontLoadingStatus = 'loading' | 'loaded' | 'error';

// Font Display Options
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

// Typography Context Interface
export interface TypographyContextValue {
  theme: TypographyTheme;
  fontLoadingStatus: Record<FontFamily, FontLoadingStatus>;
  responsiveMode: 'mobile' | 'tablet' | 'desktop';
  darkMode: boolean;
}

// CSS-in-JS Typography Styles
export interface TypographyStyles {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  color?: string;
  textAlign?: string;
  textDecoration?: string;
  fontStyle?: string;
}

// Typography Utility Functions
export interface TypographyUtils {
  getFontStack: (family: FontFamily) => string;
  getResponsiveSize: (size: FontSize, breakpoint: 'mobile' | 'tablet' | 'desktop') => string;
  getSemanticStyles: (variant: TypographyVariant) => TypographyStyles;
  generateClassName: (props: TypographyProps) => string;
  validateAccessibility: (element: HTMLElement) => boolean;
}

// Default Export Interface
export interface TypographySystem {
  Typography: React.ComponentType<TypographyProps>;
  Heading: React.ComponentType<HeadingProps>;
  Text: React.ComponentType<TextProps>;
  Link: React.ComponentType<LinkProps>;
  Code: React.ComponentType<CodeProps>;
  Quote: React.ComponentType<QuoteProps>;
  utils: TypographyUtils;
  theme: TypographyTheme;
  classes: TypographyClasses;
}