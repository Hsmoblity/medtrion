/**
 * Quote Component - Styled blockquotes with attribution
 * Provides consistent quote styling with optional author and citation
 */

import React from 'react';
import { QuoteProps } from '../../types/typography';
import Typography from './Typography';

export const Quote: React.FC<QuoteProps> = ({
  author,
  cite,
  children,
  className = '',
  ...props
}) => {
  return (
    <figure className={`quote-container ${className}`}>
      <Typography
        variant="quote"
        as="blockquote"
        className="quote-text border-l-4 border-blue-500 pl-6 py-2"
        {...props}
      >
        "{children}"
      </Typography>
      
      {(author || cite) && (
        <figcaption className="quote-attribution mt-4 text-sm text-gray-600 dark:text-gray-400">
          {author && (
            <cite className="quote-author font-medium not-italic">
              — {author}
            </cite>
          )}
          {cite && (
            <span className="quote-cite ml-2">
              {author ? ', ' : '— '}
              <a 
                href={cite} 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Source
              </a>
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};

export default Quote;