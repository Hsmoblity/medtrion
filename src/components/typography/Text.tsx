/**
 * Text Components - Body text elements with semantic variants
 * Provides consistent body text styling across the application
 */

import React from 'react';
import { TextProps } from '../../types/typography';
import Typography from './Typography';

export const Text: React.FC<TextProps> & {
  Large: React.FC<Omit<TextProps, 'variant'>>;
  Body: React.FC<Omit<TextProps, 'variant'>>;
  Small: React.FC<Omit<TextProps, 'variant'>>;
  Caption: React.FC<Omit<TextProps, 'variant'>>;
} = ({
  variant = 'base',
  children,
  className = '',
  ...props
}) => {
  return (
    <Typography
      variant={variant}
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );
};

// Convenient text variant components
export const BodyLarge: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="large" {...props} />
);

export const Body: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="base" {...props} />
);

export const BodySmall: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="small" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

// Compound Text component with sub-components
Text.Large = BodyLarge;
Text.Body = Body;
Text.Small = BodySmall;
Text.Caption = Caption;

export default Text;