import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import LazyImage from './LazyImage';

const meta: Meta<typeof LazyImage> = {
  title: 'Components/Common/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# LazyImage Component

A reusable lazy-loading image component that improves performance by only loading images when they enter the viewport.

## Features:
- **Intersection Observer API**: Only loads images when they're visible
- **Multiple Placeholder Types**: Shimmer effect, LQIP, or none
- **Fail-Safe Mechanism**: Shows placeholder if image fails to load
- **Smooth Transitions**: Fade-in effect when image loads
- **Accessibility**: Requires alt text for screen readers
- **Performance Optimized**: Configurable threshold and root margin

## Props:
- \`src\`: Image source URL
- \`alt\`: Alt text (required for accessibility)
- \`width/height\`: Image dimensions
- \`className\`: CSS classes
- \`placeholder\`: 'shimmer' | 'lqip' | 'none'
- \`placeholderSrc\`: Custom placeholder image
- \`priority\`: Load immediately (above the fold)
- \`threshold\`: Intersection observer threshold
- \`rootMargin\`: Intersection observer root margin
        `
      }
    }
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Image source URL'
    },
    alt: {
      control: 'text',
      description: 'Alt text for accessibility'
    },
    width: {
      control: 'number',
      description: 'Image width'
    },
    height: {
      control: 'number',
      description: 'Image height'
    },
    className: {
      control: 'text',
      description: 'CSS classes'
    },
    placeholder: {
      control: 'select',
      options: ['shimmer', 'lqip', 'none'],
      description: 'Placeholder type'
    },
    placeholderSrc: {
      control: 'text',
      description: 'Custom placeholder image source'
    },
    priority: {
      control: 'boolean',
      description: 'Load immediately (above the fold)'
    },
    threshold: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'Intersection observer threshold'
    },
    rootMargin: {
      control: 'text',
      description: 'Intersection observer root margin'
    },
    onLoad: { action: 'loaded' },
    onError: { action: 'error' }
  },
  tags: ['lazy-loading', 'image', 'performance', 'accessibility']
};

export default meta;
type Story = StoryObj<typeof LazyImage>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=1',
    alt: 'Random image from Picsum',
    width: 400,
    height: 300,
    className: 'rounded-lg shadow-md'
  }
};

export const WithShimmerPlaceholder: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=2',
    alt: 'Image with shimmer placeholder',
    width: 400,
    height: 300,
    placeholder: 'shimmer',
    className: 'rounded-lg shadow-md'
  }
};

export const WithLQIPPlaceholder: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=3',
    alt: 'Image with LQIP placeholder',
    width: 400,
    height: 300,
    placeholder: 'lqip',
    placeholderSrc: 'https://picsum.photos/400/300?random=3&blur=10',
    className: 'rounded-lg shadow-md'
  }
};

export const NoPlaceholder: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=4',
    alt: 'Image without placeholder',
    width: 400,
    height: 300,
    placeholder: 'none',
    className: 'rounded-lg shadow-md'
  }
};

export const PriorityLoading: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=5',
    alt: 'Priority loaded image',
    width: 400,
    height: 300,
    priority: true,
    className: 'rounded-lg shadow-md'
  }
};

export const FailedImage: Story = {
  args: {
    src: 'https://invalid-url-that-will-fail.com/image.jpg',
    alt: 'Image that will fail to load',
    width: 400,
    height: 300,
    className: 'rounded-lg shadow-md'
  }
};

export const NullSource: Story = {
  args: {
    src: null,
    alt: 'Image with null source',
    width: 400,
    height: 300,
    className: 'rounded-lg shadow-md'
  }
};

export const UndefinedSource: Story = {
  args: {
    src: undefined,
    alt: 'Image with undefined source',
    width: 400,
    height: 300,
    className: 'rounded-lg shadow-md'
  }
};

export const CustomPlaceholder: Story = {
  args: {
    src: 'https://picsum.photos/400/300?random=6',
    alt: 'Image with custom placeholder',
    width: 400,
    height: 300,
    placeholder: 'lqip',
    placeholderSrc: '/placeholder.svg',
    className: 'rounded-lg shadow-md'
  }
};

export const ResponsiveSizes: Story = {
  args: {
    src: 'https://picsum.photos/800/600?random=7',
    alt: 'Responsive image',
    width: 400,
    height: 300,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    className: 'rounded-lg shadow-md w-full h-auto'
  }
};

export const MultipleImages: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => (
        <LazyImage
          key={i}
          src={`https://picsum.photos/400/300?random=${i + 10}`}
          alt={`Gallery image ${i + 1}`}
          width={400}
          height={300}
          className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          placeholder="shimmer"
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple lazy-loading images in a grid layout. Scroll to see the lazy-loading effect in action.'
      }
    }
  }
};

export const PerformanceTest: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
        <p className="text-gray-600 mb-6">
          Scroll down to see lazy-loading in action. Images only load when they enter the viewport.
        </p>
      </div>
      
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <LazyImage
            src={`https://picsum.photos/200/150?random=${i + 20}`}
            alt={`Performance test image ${i + 1}`}
            width={200}
            height={150}
            className="rounded-md shadow-sm"
            placeholder="shimmer"
            threshold={0.1}
            rootMargin="100px"
          />
          <div>
            <h4 className="font-medium">Image {i + 1}</h4>
            <p className="text-sm text-gray-600">
              This image will only load when it is about to enter the viewport.
            </p>
          </div>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Performance test with many images. Open browser dev tools to see network requests and observe lazy-loading behavior."
      }
    }
  }
};
