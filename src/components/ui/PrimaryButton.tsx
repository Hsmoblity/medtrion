"use client";

import React, { forwardRef } from 'react';
import Link from 'next/link';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  asChild?: boolean;
  href?: string;
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ 
    children, 
    size = 'md', 
    fullWidth = false, 
    loading = false, 
    asChild = false,
    href,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    // Base classes following Base Style Foundation
    const baseClasses = [
      // Colors - following Primary Blue tokens
      'bg-blue-600 hover:bg-blue-700 text-white',
      // Focus ring - following accessibility guidelines
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      // Transitions
      'transition-colors duration-200',
      // Typography
      'font-medium',
      // Border radius
      'rounded-md',
      // Disabled state
      'disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-75',
      // Flex for loading state
      'inline-flex items-center justify-center',
      // Prevent text selection
      'select-none'
    ].join(' ');

    // Size variants
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combine all classes
    const combinedClasses = [
      baseClasses,
      sizeClasses[size],
      widthClasses,
      className
    ].filter(Boolean).join(' ');

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Button content with optional loading state
    const buttonContent = (
      <>
        {loading && <LoadingSpinner />}
        {children}
      </>
    );

    // If href is provided, wrap in Link
    if (href && !asChild) {
      return (
        <Link href={href} className={combinedClasses}>
          {buttonContent}
        </Link>
      );
    }

    // If asChild is true, clone the child element with our props
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        className: `${child.props.className || ''} ${combinedClasses}`.trim(),
        ref,
        disabled: disabled || loading,
        ...props,
        ...child.props, // Child props take precedence
      });
    }

    // Standard button
    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;