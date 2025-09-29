import type { Meta, StoryObj } from '@storybook/react';
import PrimaryButton from './PrimaryButton';
import Link from 'next/link';

const meta: Meta<typeof PrimaryButton> = {
  title: 'UI/PrimaryButton',
  component: PrimaryButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Primary action button following the Base Style Foundation design tokens. Supports size variants, loading states, and composition with Next.js Link.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Button size variant',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner and disables button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Renders as a child element for composition',
    },
    href: {
      control: 'text',
      description: 'If provided, renders as Next.js Link',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic button variants
export const Default: Story = {
  args: {
    children: 'Primary Button',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// State variants
export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const LoadingFullWidth: Story = {
  args: {
    children: 'Adding to Cart...',
    loading: true,
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

// Link variants
export const AsLink: Story = {
  args: {
    children: 'View Products',
    href: '/products',
  },
};

export const AsLinkLarge: Story = {
  args: {
    children: 'Shop Now',
    href: '/products',
    size: 'lg',
  },
};

// Composition variants
export const AsChild: Story = {
  args: {
    children: <span>Custom Element</span>,
    asChild: true,
  },
};

export const AsChildWithNextLink: Story = {
  render: () => (
    <PrimaryButton asChild>
      <Link href="/products">Next.js Link Composition</Link>
    </PrimaryButton>
  ),
};

// Interactive examples
export const InteractiveExample: Story = {
  render: () => {
    const handleClick = () => {
      alert('Button clicked!');
    };

    return (
      <div className="space-y-4">
        <div className="space-x-4">
          <PrimaryButton size="sm" onClick={handleClick}>
            Small
          </PrimaryButton>
          <PrimaryButton size="md" onClick={handleClick}>
            Medium
          </PrimaryButton>
          <PrimaryButton size="lg" onClick={handleClick}>
            Large
          </PrimaryButton>
        </div>
        <div className="space-y-2">
          <PrimaryButton fullWidth onClick={handleClick}>
            Full Width Button
          </PrimaryButton>
          <PrimaryButton fullWidth loading>
            Loading State
          </PrimaryButton>
          <PrimaryButton fullWidth disabled>
            Disabled State
          </PrimaryButton>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

// Accessibility showcase
export const AccessibilityShowcase: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Focus States</h3>
        <p className="text-sm text-gray-600">Try tabbing through these buttons to see the focus ring</p>
        <div className="space-x-4">
          <PrimaryButton>First Button</PrimaryButton>
          <PrimaryButton>Second Button</PrimaryButton>
          <PrimaryButton disabled>Disabled Button</PrimaryButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">ARIA Labels</h3>
        <div className="space-x-4">
          <PrimaryButton aria-label="Add product to shopping cart">
            Add to Cart
          </PrimaryButton>
          <PrimaryButton loading aria-label="Processing your request">
            Processing...
          </PrimaryButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Design System Colors (for visual regression testing)
export const DesignSystemColors: Story = {
  render: () => (
    <div className="space-y-4 p-4 bg-gray-50">
      <h3 className="text-lg font-semibold">Color System Verification</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Light Background</h4>
          <div className="bg-white p-4 rounded-lg space-y-2">
            <PrimaryButton>Primary Button</PrimaryButton>
            <PrimaryButton loading>Loading State</PrimaryButton>
            <PrimaryButton disabled>Disabled State</PrimaryButton>
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium">Gray Background</h4>
          <div className="bg-gray-100 p-4 rounded-lg space-y-2">
            <PrimaryButton>Primary Button</PrimaryButton>
            <PrimaryButton loading>Loading State</PrimaryButton>
            <PrimaryButton disabled>Disabled State</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};