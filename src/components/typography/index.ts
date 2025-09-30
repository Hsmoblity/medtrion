/**
 * Typography System - Export all typography components
 * Comprehensive typography system for consistent design across the application
 */

// Core Typography Component
export { default as Typography } from './Typography';

// Heading Components
export { 
  default as Heading,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6
} from './Heading';

// Text Components
export { 
  default as Text,
  BodyLarge,
  Body,
  BodySmall,
  Caption
} from './Text';

// Interactive Components
export { default as Link } from './Link';

// Special Components
export { default as Code } from './Code';
export { default as Quote } from './Quote';

// Types
export type {
  TypographyProps,
  HeadingProps,
  TextProps,
  LinkProps,
  CodeProps,
  QuoteProps,
  TypographyVariant,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
  TypographyColor,
  TextAlign
} from '../../types/typography';

// Theme and utilities
export { designSystem, themeClasses } from '../../styles/theme';