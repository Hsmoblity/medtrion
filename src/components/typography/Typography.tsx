/**
 * Typography Component - Base component for all text elements
 * Provides consistent typography across the application with semantic variants
 */

import React from 'react';
import { TypographyProps, TypographyVariant } from '../../types/typography';
import { designSystem, themeClasses } from '../../styles/theme';

// Utility function to generate typography classes
const getTypographyClasses = (props: Omit<TypographyProps, 'children'>): string => {
  const {
    variant = 'base',
    size,
    weight,
    family,
    color,
    align,
    lineHeight,
    letterSpacing,
    responsive = true,
    className = ''
  } = props;

  const classes: string[] = [];

  // Base typography class from theme
  if (variant && themeClasses.text[variant as keyof typeof themeClasses.text]) {
    classes.push(themeClasses.text[variant as keyof typeof themeClasses.text]);
  } else {
    // Fallback to manual class generation
    
    // Font Size
    if (size) {
      classes.push(`text-${size}`);
    } else {
      // Default sizes based on variant
      const defaultSizes: Record<TypographyVariant, string> = {
        h1: 'text-5xl',
        h2: 'text-4xl',
        h3: 'text-3xl',
        h4: 'text-2xl',
        h5: 'text-xl',
        h6: 'text-lg',
        large: 'text-lg',
        base: 'text-base',
        small: 'text-sm',
        caption: 'text-xs',
        link: 'text-base',
        button: 'text-base',
        label: 'text-sm',
        code: 'text-sm',
        quote: 'text-lg',
        highlight: 'text-base'
      };
      classes.push(defaultSizes[variant] || 'text-base');
    }

    // Font Weight
    if (weight) {
      classes.push(`font-${weight}`);
    } else {
      // Default weights based on variant
      const defaultWeights: Record<TypographyVariant, string> = {
        h1: 'font-bold',
        h2: 'font-semibold',
        h3: 'font-semibold',
        h4: 'font-medium',
        h5: 'font-medium',
        h6: 'font-medium',
        large: 'font-normal',
        base: 'font-normal',
        small: 'font-normal',
        caption: 'font-normal',
        link: 'font-medium',
        button: 'font-semibold',
        label: 'font-medium',
        code: 'font-normal',
        quote: 'font-normal',
        highlight: 'font-medium'
      };
      classes.push(defaultWeights[variant] || 'font-normal');
    }

    // Font Family
    if (family) {
      classes.push(`font-${family}`);
    } else {
      // Default families based on variant
      const defaultFamilies: Record<TypographyVariant, string> = {
        h1: 'font-display',
        h2: 'font-display',
        h3: 'font-display',
        h4: 'font-display',
        h5: 'font-display',
        h6: 'font-display',
        large: 'font-primary',
        base: 'font-primary',
        small: 'font-primary',
        caption: 'font-primary',
        link: 'font-primary',
        button: 'font-primary',
        label: 'font-primary',
        code: 'font-mono',
        quote: 'font-primary',
        highlight: 'font-primary'
      };
      classes.push(defaultFamilies[variant] || 'font-primary');
    }

    // Line Height
    if (lineHeight) {
      classes.push(`leading-${lineHeight}`);
    } else {
      // Default line heights based on variant
      const defaultLineHeights: Record<TypographyVariant, string> = {
        h1: 'leading-tight',
        h2: 'leading-tight',
        h3: 'leading-snug',
        h4: 'leading-snug',
        h5: 'leading-normal',
        h6: 'leading-normal',
        large: 'leading-relaxed',
        base: 'leading-normal',
        small: 'leading-normal',
        caption: 'leading-normal',
        link: 'leading-normal',
        button: 'leading-normal',
        label: 'leading-normal',
        code: 'leading-normal',
        quote: 'leading-relaxed',
        highlight: 'leading-normal'
      };
      classes.push(defaultLineHeights[variant] || 'leading-normal');
    }

    // Letter Spacing
    if (letterSpacing) {
      classes.push(`tracking-${letterSpacing}`);
    } else if (['h1', 'h2'].includes(variant)) {
      classes.push('tracking-tight');
    } else if (variant === 'button') {
      classes.push('tracking-wide');
    }

    // Color based on variant
    if (color) {
      const colorClasses: Record<typeof color, string> = {
        primary: 'text-gray-900 dark:text-white',
        secondary: 'text-gray-600 dark:text-gray-400',
        tertiary: 'text-gray-500 dark:text-gray-500',
        inverse: 'text-white dark:text-gray-900',
        accent: 'text-blue-600 dark:text-blue-400',
        success: 'text-green-600 dark:text-green-400',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
        info: 'text-blue-600 dark:text-blue-400'
      };
      classes.push(colorClasses[color]);
    } else {
      // Default colors based on variant
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant)) {
        classes.push('text-gray-900 dark:text-white');
      } else if (variant === 'link') {
        classes.push('text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300');
      } else {
        classes.push('text-gray-700 dark:text-gray-300');
      }
    }
  }

  // Text Alignment
  if (align) {
    classes.push(`text-${align}`);
  }

  // Responsive typography
  if (responsive) {
    classes.push('responsive-text');
  }

  // Additional className
  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
};

// Determine the HTML element based on variant
const getElementType = (variant: TypographyVariant, as?: keyof JSX.IntrinsicElements): keyof JSX.IntrinsicElements => {
  if (as) return as;

  const elementMap: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    large: 'p',
    base: 'p',
    small: 'p',
    caption: 'span',
    link: 'a',
    button: 'span',
    label: 'label',
    code: 'code',
    quote: 'blockquote',
    highlight: 'mark'
  };

  return elementMap[variant] || 'p';
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'base',
  children,
  as,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const Element = getElementType(variant, as);
  const typographyClasses = getTypographyClasses({ variant, className, ...props });

  // Common props for all elements
  const commonProps = {
    className: typographyClasses,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    id,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy
  };

  // Special handling for specific elements
  if (Element === 'a' && variant === 'link') {
    return (
      <Element
        {...commonProps}
        href="#"
        tabIndex={0}
        role="link"
      >
        {children}
      </Element>
    );
  }

  if (Element === 'code') {
    return (
      <Element
        {...commonProps}
        className={`${typographyClasses} bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1 py-0.5 rounded`}
      >
        {children}
      </Element>
    );
  }

  if (Element === 'mark') {
    return (
      <Element
        {...commonProps}
        className={`${typographyClasses} bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-1 rounded`}
      >
        {children}
      </Element>
    );
  }

  if (Element === 'blockquote') {
    return (
      <Element
        {...commonProps}
        className={`${typographyClasses} italic border-l-4 border-gray-300 dark:border-gray-600 pl-4`}
      >
        {children}
      </Element>
    );
  }

  return (
    <Element {...commonProps}>
      {children}
    </Element>
  );
};

export default Typography;