import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import LazyImageExample from './LazyImageExample';

const meta: Meta<typeof LazyImageExample> = {
  title: 'Examples/LazyImageUsage',
  component: LazyImageExample,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# LazyImage Usage Examples

This story demonstrates how to use the LazyImage component in real-world scenarios.

## Use Cases Demonstrated:
- **Hero Images**: Priority loading for above-the-fold content
- **Product Grids**: Lazy loading for product listings
- **Error Handling**: Graceful fallbacks for failed images
- **Performance**: Benefits of lazy loading

## Key Features Shown:
- Priority loading for important images
- Lazy loading for below-the-fold content
- Error handling with placeholder fallbacks
- Smooth transitions and animations
- Responsive design patterns

## Performance Benefits:
- Reduced initial page load time
- Lower bandwidth usage
- Better Core Web Vitals scores
- Improved user experience
        `
      }
    }
  },
  tags: ['example', 'lazy-loading', 'performance', 'usage']
};

export default meta;
type Story = StoryObj<typeof LazyImageExample>;

export const Default: Story = {
  args: {}
};

export const ScrollToSeeLazyLoading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Scroll down to see the lazy-loading effect in action. Images will only load when they enter the viewport.'
      }
    }
  }
};