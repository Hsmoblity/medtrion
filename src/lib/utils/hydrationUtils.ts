/**
 * Hydration utilities for development and debugging
 */

import React from 'react';

// Development-only hydration warning
export const warnHydrationIssue = (componentName: string, issue: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `🚨 Hydration Issue in ${componentName}: ${issue}\n` +
      `This may cause hydration mismatches. Check for:\n` +
      `- Invalid HTML nesting (div inside span)\n` +
      `- Conditional rendering differences between server and client\n` +
      `- Dynamic content that differs between SSR and CSR\n` +
      `- Missing suppressHydrationWarning for known differences`
    );
  }
};

// Check for common hydration issues
export const checkHydrationSafety = (element: HTMLElement | null, componentName: string) => {
  if (!element || process.env.NODE_ENV !== 'development') return;

  // Check for invalid nesting
  const invalidNesting = element.querySelectorAll('span div, span p, span h1, span h2, span h3, span h4, span h5, span h6');
  if (invalidNesting.length > 0) {
    warnHydrationIssue(componentName, `Found ${invalidNesting.length} invalid HTML nesting patterns (block elements inside span)`);
  }

  // Check for dangerouslySetInnerHTML without suppressHydrationWarning
  const dangerousHTML = element.querySelectorAll('[data-dangerously-set-inner-html]');
  if (dangerousHTML.length > 0) {
    warnHydrationIssue(componentName, 'Found dangerouslySetInnerHTML usage - ensure suppressHydrationWarning is set');
  }
};

// Safe hydration wrapper for components
export const withHydrationSafety = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const elementRef = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
      if (elementRef.current) {
        checkHydrationSafety(elementRef.current, componentName);
      }
    }, []);

    return React.createElement(Component, {
      ...props,
      ref,
      'data-hydration-safe': componentName
    });
  });
};

// Hydration-safe conditional rendering
export const HydrationSafeConditional = ({ 
  condition, 
  children, 
  fallback = null,
  suppressWarning = false 
}: {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  suppressWarning?: boolean;
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // On server, always render fallback to ensure consistency
  if (!isClient) {
    return React.createElement(React.Fragment, null, fallback);
  }

  // On client, render based on condition
  return condition ? React.createElement(React.Fragment, null, children) : React.createElement(React.Fragment, null, fallback);
};

export default {
  warnHydrationIssue,
  checkHydrationSafety,
  withHydrationSafety,
  HydrationSafeConditional
};