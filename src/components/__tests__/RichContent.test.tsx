/**
 * RichContent Component Tests
 * 
 * Tests HTML sanitization functionality and Contentful rich text rendering
 * 
 * @package HSM
 * @since 1.0.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import RichContent from '../RichContent';

describe('RichContent Component', () => {
  describe('HTML String Sanitization', () => {
    it('should strip HTML tags from string content', () => {
      const htmlContent = '<p>This is a <strong>test</strong> description with <em>HTML tags</em>.</p>';
      
      render(<RichContent content={htmlContent} />);
      
      expect(screen.getByText('This is a test description with HTML tags.')).toBeInTheDocument();
      expect(screen.queryByText('<p>')).not.toBeInTheDocument();
      expect(screen.queryByText('<strong>')).not.toBeInTheDocument();
    });

    it('should handle empty or null content', () => {
      const { container } = render(<RichContent content={null} />);
      expect(container.firstChild).toBeNull();
      
      const { container: container2 } = render(<RichContent content="" />);
      expect(container2.firstChild).toBeNull();
    });

    it('should handle content without HTML tags', () => {
      const plainContent = 'This is plain text without HTML tags.';
      
      render(<RichContent content={plainContent} />);
      
      expect(screen.getByText(plainContent)).toBeInTheDocument();
    });

    it('should decode HTML entities', () => {
      const htmlContent = '<p>Price: &lt;$100&gt; &amp; &quot;Special&quot;</p>';
      
      render(<RichContent content={htmlContent} />);
      
      expect(screen.getByText('Price: <$100> & "Special"')).toBeInTheDocument();
    });

    it('should handle malformed HTML gracefully', () => {
      const malformedHtml = '<p>Unclosed tag <strong>bold text</p>';
      
      render(<RichContent content={malformedHtml} />);
      
      expect(screen.getByText('Unclosed tag bold text')).toBeInTheDocument();
    });

    it('should apply className correctly', () => {
      const htmlContent = '<p>Test content</p>';
      const className = 'test-class';
      
      const { container } = render(<RichContent content={htmlContent} className={className} />);
      
      expect(container.firstChild).toHaveClass(className);
    });
  });

  describe('Contentful Rich Text', () => {
    it('should render Contentful rich text documents', () => {
      const contentfulDocument = {
        content: [
          {
            content: [
              {
                value: 'Contentful rich text content',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
      };
      
      render(<RichContent content={contentfulDocument} />);
      
      expect(screen.getByText('Contentful rich text content')).toBeInTheDocument();
    });

    it('should handle invalid Contentful documents gracefully', () => {
      const invalidDocument = {
        content: 'invalid'
      };
      
      const { container } = render(<RichContent content={invalidDocument} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle sanitization errors gracefully', () => {
      // Mock sanitizeContent to throw an error
      const originalSanitizeContent = require('../../lib/utils/html-sanitizer').sanitizeContent;
      jest.spyOn(require('../../lib/utils/html-sanitizer'), 'sanitizeContent').mockImplementation(() => {
        throw new Error('Sanitization failed');
      });
      
      const htmlContent = '<p>Test content</p>';
      
      render(<RichContent content={htmlContent} />);
      
      // Should fallback to original content
      expect(screen.getByText(htmlContent)).toBeInTheDocument();
      
      // Restore original function
      require('../../lib/utils/html-sanitizer').sanitizeContent = originalSanitizeContent;
    });
  });
});