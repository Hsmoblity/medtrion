/**
 * Link Component - Accessible and consistent link styling
 * Supports both internal Next.js links and external links
 */

import React from 'react';
import NextLink from 'next/link';
import { LinkProps } from '../../types/typography';
import Typography from './Typography';

export const Link: React.FC<LinkProps> = ({
  href,
  target,
  rel,
  external = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  // Determine if link is external
  const isExternal = external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  
  // Default rel for external links
  const linkRel = rel || (isExternal && target === '_blank' ? 'noopener noreferrer' : undefined);

  // Common link props
  const linkProps = {
    href,
    target,
    rel: linkRel,
    onClick
  };

  const linkContent = (
    <Typography
      variant="link"
      as="span"
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );

  // External links or links with target="_blank"
  if (isExternal) {
    return (
      <a {...linkProps}>
        {linkContent}
      </a>
    );
  }

  // Internal Next.js links
  return (
    <NextLink href={href} passHref legacyBehavior>
      <a {...linkProps}>
        {linkContent}
      </a>
    </NextLink>
  );
};

export default Link;