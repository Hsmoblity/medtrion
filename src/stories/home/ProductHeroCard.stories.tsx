import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProductCard from '../../components/ui/ProductCard';
import { ProductCardView } from '../../lib/interfaces/homepage';

const meta: Meta<typeof ProductCard> = {
  title: 'UI/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    priority: {
      control: 'boolean',
      description: 'Whether to preload the image (for above-the-fold content)',
    },
    position: {
      control: 'number',
      description: 'Position in the hero strip for analytics',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Base mock product
const baseMockProduct: ProductCardView = {
  slug: 'acorn-180-stairlift',
  title: 'Acorn 180 Stairlift',
  description: 'Premium curved stairlift with advanced safety features and smooth operation for any staircase configuration.',
  price: 2899,
  financingCopy: null,
  badges: [],
  imageUrl: '/180-stairlift-wh.jpg',
  rating: null,
  isFeatured: true,
  optionsSummary: null,
  relatedOptions: [],
  productId: '180',
  databaseId: 180,
};

// Shared click handler for all stories
const mockHeroClick = (slug: string, badge: string, position: number) => {
  console.log('Hero card clicked:', { slug, badge, position });
};

export const Default: Story = {
  args: {
    product: baseMockProduct,
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const WithBadges: Story = {
  args: {
    product: {
      ...baseMockProduct,
      badges: ['Top Seller', 'Premium'],
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const WithFinancing: Story = {
  args: {
    product: {
      ...baseMockProduct,
      financingCopy: 'from $99/mo',
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const WithRating: Story = {
  args: {
    product: {
      ...baseMockProduct,
      rating: 4.8,
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const WithOptions: Story = {
  args: {
    product: {
      ...baseMockProduct,
      optionsSummary: '12 options available',
      relatedOptions: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312],
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const FullyLoaded: Story = {
  args: {
    product: {
      ...baseMockProduct,
      badges: ['Top Seller', 'Premium'],
      financingCopy: 'from $99/mo',
      rating: 4.8,
      optionsSummary: '12 options available',
      relatedOptions: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312],
    },
    variant: 'hero',
    priority: true,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const LongTitle: Story = {
  args: {
    product: {
      ...baseMockProduct,
      title: 'Acorn 180 Premium Curved Stairlift with Advanced Safety Features and Custom Rail Configuration',
      badges: ['Premium'],
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const NoPrice: Story = {
  args: {
    product: {
      ...baseMockProduct,
      price: null,
      badges: ['Contact for Quote'],
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};

export const MissingImage: Story = {
  args: {
    product: {
      ...baseMockProduct,
      imageUrl: '/placeholder.svg',
    },
    variant: 'hero',
    priority: false,
    position: 0,
    onHeroClick: mockHeroClick,
    showConfigureButton: false,
    showAddToCartButton: false,
    cardClickBehavior: 'configurator',
  },
};