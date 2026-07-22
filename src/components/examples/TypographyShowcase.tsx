/**
 * Typography System Example - Comprehensive showcase of typography components
 * This file demonstrates all typography variants and their usage
 */

import React from 'react';
import {
  Typography,
  Heading,
  H1, H2, H3, H4, H5, H6,
  Text,
  Link,
  Code,
  Quote
} from '../typography';

export const TypographyShowcase: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      
      {/* Page Header */}
      <header className="text-center space-y-4">
        <H1>Typography System Showcase</H1>
        <Text variant="large" color="secondary" align="center">
          Comprehensive typography system for consistent, accessible, and beautiful text
        </Text>
      </header>

      {/* Heading Hierarchy */}
      <section className="space-y-6">
        <H2>Heading Hierarchy</H2>
        <div className="space-y-4">
          <H1>Heading Level 1 - Main Page Title</H1>
          <H2>Heading Level 2 - Section Heading</H2>
          <H3>Heading Level 3 - Subsection Heading</H3>
          <H4>Heading Level 4 - Card/Component Heading</H4>
          <H5>Heading Level 5 - Small Heading</H5>
          <H6>Heading Level 6 - Caption Heading</H6>
        </div>
      </section>

      {/* Body Text Variants */}
      <section className="space-y-6">
        <H2>Body Text Variants</H2>
        <div className="space-y-4">
          <div>
            <Text variant="small" weight="medium" color="secondary">Large Body Text</Text>
            <Text variant="large">
              This is large body text, perfect for introductory paragraphs, important content, 
              or when you want to emphasize readability. It uses a larger font size with 
              relaxed line height for optimal reading experience.
            </Text>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Base Body Text</Text>
            <Text variant="base">
              This is the standard body text used throughout the application. It provides 
              excellent readability at 16px with normal line height, making it ideal for 
              most content including articles, descriptions, and general text.
            </Text>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Small Body Text</Text>
            <Text variant="small">
              This is small body text, useful for secondary information, metadata, 
              captions, or when you need to fit more content in limited space while 
              maintaining readability.
            </Text>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Caption Text</Text>
            <Text variant="caption" color="tertiary">
              This is caption text, ideal for image captions, timestamps, labels, and other 
              minimal supporting information.
            </Text>
          </div>
        </div>
      </section>

      {/* Interactive Text */}
      <section className="space-y-6">
        <H2>Interactive Text Elements</H2>
        <div className="space-y-4">
          <div>
            <Text variant="small" weight="medium" color="secondary">Links</Text>
            <Text variant="base">
              Here's a paragraph with an <Link href="/example">internal link</Link> and an{' '}
              <Link href="https://example.com" external>external link</Link>. Links are 
              styled consistently with proper hover states and accessibility support.
            </Text>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Button Text</Text>
            <button className="px-6 py-3 bg-[#3fa2a3] text-white rounded-[35px] font-primary font-semibold hover:bg-[#f7a236] transition-all duration-300">
              <Typography variant="button">Primary Button</Typography>
            </button>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Form Labels</Text>
            <label htmlFor="example-input" className="block">
              <Typography variant="label">Email Address</Typography>
            </label>
            <input 
              id="example-input"
              type="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>
      </section>

      {/* Special Text Elements */}
      <section className="space-y-6">
        <H2>Special Text Elements</H2>
        
        <div className="space-y-4">
          <div>
            <Text variant="small" weight="medium" color="secondary">Inline Code</Text>
            <Text variant="base">
              Use <Code inline>npm install</Code> to install packages, or run{' '}
              <Code inline>yarn dev</Code> to start the development server.
            </Text>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Code Block</Text>
            <Code inline={false} language="javascript" copy>
{`import { Typography, H1, Text } from '@/components/typography';

export const Example = () => {
  return (
    <div>
      <H1>Hello World</H1>
      <Text variant="large">Welcome to our typography system!</Text>
    </div>
  );
};`}
            </Code>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Blockquote</Text>
            <Quote 
              author="Steve Jobs"
              cite="https://example.com"
            >
              Design is not just what it looks like and feels like. Design is how it works.
            </Quote>
          </div>
          
          <div>
            <Text variant="small" weight="medium" color="secondary">Highlighted Text</Text>
            <Text variant="base">
              This paragraph contains <Typography variant="highlight">highlighted text</Typography> that 
              draws attention to important information or key terms.
            </Text>
          </div>
        </div>
      </section>

      {/* Color Variants */}
      <section className="space-y-6">
        <H2>Color Variants</H2>
        <div className="space-y-2">
          <Text color="primary">Primary text color (default)</Text>
          <Text color="secondary">Secondary text color</Text>
          <Text color="tertiary">Tertiary text color</Text>
          <Text color="accent">Accent text color</Text>
          <Text color="success">Success text color</Text>
          <Text color="error">Error text color</Text>
          <Text color="warning">Warning text color</Text>
          <Text color="info">Info text color</Text>
        </div>
      </section>

      {/* Responsive Typography */}
      <section className="space-y-6">
        <H2>Responsive Typography</H2>
        <Text variant="base">
          All typography components support responsive scaling. Text automatically adjusts 
          its size based on screen size, providing optimal readability across devices. 
          On mobile devices, headings are slightly smaller, while on desktop they scale up 
          for better visual hierarchy.
        </Text>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <Text variant="small" weight="medium" color="info">
            💡 Tip: Resize your browser window to see responsive typography in action!
          </Text>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-6">
        <H2>Accessibility Features</H2>
        <div className="space-y-4">
          <ul className="space-y-2">
            <li>
              <Text variant="base">
                <strong>Semantic HTML:</strong> Proper heading hierarchy (h1-h6) for screen readers
              </Text>
            </li>
            <li>
              <Text variant="base">
                <strong>WCAG 2.1 AA Compliance:</strong> Color contrast ratios meet accessibility standards
              </Text>
            </li>
            <li>
              <Text variant="base">
                <strong>Focus Indicators:</strong> Clear focus outlines for keyboard navigation
              </Text>
            </li>
            <li>
              <Text variant="base">
                <strong>Readable Font Sizes:</strong> Minimum 16px base font size
              </Text>
            </li>
            <li>
              <Text variant="base">
                <strong>Reduced Motion:</strong> Respects user's motion preferences
              </Text>
            </li>
          </ul>
        </div>
      </section>

    </div>
  );
};

export default TypographyShowcase;