import type { Meta, StoryObj } from '@storybook/react';
import LoadingOverlay from './LoadingOverlay';

const meta: Meta<typeof LoadingOverlay> = {
  title: 'UI/LoadingOverlay',
  component: LoadingOverlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A reusable loading overlay component with multiple variants for different use cases.',
      },
    },
  },
  argTypes: {
    show: {
      control: 'boolean',
      description: 'Whether the overlay is visible',
    },
    variant: {
      control: 'select',
      options: ['overlay', 'skeleton', 'inline'],
      description: 'Type of loading overlay to display',
    },
    message: {
      control: 'text',
      description: 'Loading message to display',
    },
    blocking: {
      control: 'boolean',
      description: 'Whether to block interaction (overlay variant only)',
    },
    skeletonCount: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Number of skeleton items to display',
    },
    respectReducedMotion: {
      control: 'boolean',
      description: 'Whether to respect reduced motion preferences',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

// Overlay Variant Stories
export const OverlayDefault: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Loading...',
  },
};

export const OverlayWithCustomMessage: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Please wait while we load your configuration...',
  },
};

export const OverlayWithCustomSpinner: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Processing your request...',
    spinner: (
      <div className="animate-bounce">
        <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
      </div>
    ),
  },
};

// Skeleton Variant Stories
export const SkeletonDefault: Story = {
  args: {
    show: true,
    variant: 'skeleton',
    skeletonCount: 3,
  },
  parameters: {
    layout: 'padded',
  },
};

export const SkeletonProductGrid: Story = {
  args: {
    show: true,
    variant: 'skeleton',
    skeletonCount: 6,
  },
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Story />
      </div>
    ),
  ],
};

export const SkeletonList: Story = {
  args: {
    show: true,
    variant: 'skeleton',
    skeletonCount: 5,
  },
  parameters: {
    layout: 'padded',
  },
};

// Inline Variant Stories
export const InlineDefault: Story = {
  args: {
    show: true,
    variant: 'inline',
    message: 'Saving...',
  },
  parameters: {
    layout: 'padded',
  },
};

export const InlineCompact: Story = {
  args: {
    show: true,
    variant: 'inline',
    message: '',
  },
  parameters: {
    layout: 'padded',
  },
};

// Accessibility Stories
export const AccessibilityExample: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Loading your configuration',
    ariaLabel: 'Loading configuration options',
  },
};

export const ReducedMotion: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Loading with reduced motion',
    respectReducedMotion: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'This story demonstrates the component respecting reduced motion preferences.',
      },
    },
  },
};

// Real-world Usage Examples
export const ConfiguratorLoading: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Loading configuration options...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example usage for configurator page loading state.',
      },
    },
  },
};

export const ShopPageSkeleton: Story = {
  args: {
    show: true,
    variant: 'skeleton',
    skeletonCount: 8,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example usage for shop page product grid skeleton.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Story />
      </div>
    ),
  ],
};

export const CartLoading: Story = {
  args: {
    show: true,
    variant: 'inline',
    message: 'Updating cart...',
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Example usage for cart operations loading state.',
      },
    },
  },
};

// Hidden State
export const Hidden: Story = {
  args: {
    show: false,
    variant: 'overlay',
    message: 'This should not be visible',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component when show prop is false - should not render anything.',
      },
    },
  },
};

// Interactive Demo
export const InteractiveDemo: Story = {
  args: {
    show: true,
    variant: 'overlay',
    message: 'Interactive Demo - Change props in controls',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo where you can change all props using the controls panel.',
      },
    },
  },
};