/**
 * Heading Components - Semantic heading elements with proper hierarchy
 * Provides accessible and consistent heading styles across the application
 */

import React from 'react';
import { HeadingProps } from '../../types/typography';
import Typography from './Typography';
import { themeClasses } from '../../styles/theme';

export const Heading: React.FC<HeadingProps> = ({
  level,
  semanticLevel,
  children,
  className = '',
  ...props
}) => {
  // Use semanticLevel for HTML element, level for styling
  const htmlLevel = semanticLevel || level;
  const styleLevel = level;
  
  // Map level to variant
  const variantMap = {
    1: 'h1' as const,
    2: 'h2' as const,
    3: 'h3' as const,
    4: 'h4' as const,
    5: 'h5' as const,
    6: 'h6' as const
  };

  // Map level to HTML element
  const elementMap = {
    1: 'h1' as const,
    2: 'h2' as const,
    3: 'h3' as const,
    4: 'h4' as const,
    5: 'h5' as const,
    6: 'h6' as const
  };

  const variant = variantMap[styleLevel];
  const element = elementMap[htmlLevel];

  return (
    <Typography
      variant={variant}
      as={element}
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );
};

// Individual heading components for convenience
export const H1: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={1} {...props} />
);

export const H2: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={2} {...props} />
);

export const H3: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={3} {...props} />
);

export const H4: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={4} {...props} />
);

export const H5: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={5} {...props} />
);

export const H6: React.FC<Omit<HeadingProps, 'level'>> = (props) => (
  <Heading level={6} {...props} />
);

// Export all components
export default Heading;