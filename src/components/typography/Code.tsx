/**
 * Code Component - Syntax highlighting and code display
 * Supports inline code and code blocks with copy functionality
 */

import React, { useState } from 'react';
import { CodeProps } from '../../types/typography';
import Typography from './Typography';

export const Code: React.FC<CodeProps> = ({
  inline = true,
  language,
  copy = false,
  children,
  className = '',
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof children === 'string') {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  // Inline code
  if (inline) {
    return (
      <Typography
        variant="code"
        as="code"
        className={`inline-code ${className}`}
        {...props}
      >
        {children}
      </Typography>
    );
  }

  // Code block
  return (
    <div className="relative group">
      <pre className={`code-block bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto ${className}`}>
        <Typography
          variant="code"
          as="code"
          className={`block ${language ? `language-${language}` : ''}`}
          {...props}
        >
          {children}
        </Typography>
      </pre>
      
      {copy && (
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded border border-gray-300 dark:border-gray-600 text-xs font-medium"
          title={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Code;