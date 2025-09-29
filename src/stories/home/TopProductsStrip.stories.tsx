import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TopProductsStrip from '../../components/Home/TopProductsStrip';
import { useHomepageStore } from '../../stores/homepageStore';
import { ProductCardView } from '../../lib/interfaces/homepage';

const meta: Meta<typeof TopProductsStrip> = {
  title: 'Home/TopProductsStrip',
  component: TopProductsStrip,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    enableShowcase: {
      control: 'boolean',
      description: 'Feature flag to enable/disable the showcase layout',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for featured products
const mockFeaturedProducts: ProductCardView[] = [
  {
    slug: 'acorn-180-stairlift',
    title: 'Acorn 180 Stairlift',
    description: 'Premium curved stairlift with advanced safety features and smooth operation.',
    price: 2899,
    financingCopy: 'from $99/mo',
    badges: ['Top Seller', 'Premium'],
    imageUrl: '/180-stairlift-wh.jpg',
    rating: 4.8,
    isFeatured: true,
    optionsSummary: '12 options available',
    relatedOptions: [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312],
    productId: '180',
    databaseId: 180,
  },
  {
    slug: 'acorn-130-stairlift',
    title: 'Acorn 130 Stairlift',
    description: 'Reliable straight stairlift designed for comfort and accessibility.',
    price: 2299,
    financingCopy: 'from $75/mo',
    badges: ['Best Value'],
    imageUrl: '/130-stairlift-wh.jpg',
    rating: 4.6,
    isFeatured: true,
    optionsSummary: '8 options available',
    relatedOptions: [201, 202, 203, 204, 205, 206, 207, 208],
    productId: '130',
    databaseId: 130,
  },
  {
    slug: 'outdoor-stairlift',
    title: 'Outdoor Stairlift',
    description: 'Weather-resistant stairlift for outdoor steps and porches.',
    price: 3299,
    financingCopy: 'from $125/mo',
    badges: ['Weather Resistant'],
    imageUrl: '/acorn-outdoor-stair-lift-uk.jpg',
    rating: 4.7,
    isFeatured: true,
    optionsSummary: '6 options available',
    relatedOptions: [401, 402, 403, 404, 405, 406],
    productId: 'outdoor',
    databaseId: 999,
  },
  {
    slug: 'platform-lift',
    title: 'Platform Lift',
    description: 'Wheelchair-accessible vertical platform lift for multi-level access.',
    price: 4999,
    financingCopy: 'from $175/mo',
    badges: ['Wheelchair Accessible', 'ADA Compliant'],
    imageUrl: '/temp.webp',
    rating: 4.9,
    isFeatured: true,
    optionsSummary: '15 options available',
    relatedOptions: [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515],
    productId: 'platform',
    databaseId: 777,
  },
];

// Story decorator to populate the store with mock data
const WithMockStore = (Story: any) => {
  // Set mock data in the store
  React.useEffect(() => {
    const store = useHomepageStore.getState();
    store.fetchFeaturedProducts = async () => {
      useHomepageStore.setState({
        featuredProducts: mockFeaturedProducts,
        loading: false,
        error: null,
      });
    };
    store.fetchFeaturedProducts();
  }, []);

  return <Story />;
};

export const Default: Story = {
  args: {
    enableShowcase: true,
  },
  decorators: [WithMockStore],
};

export const FeatureDisabled: Story = {
  args: {
    enableShowcase: false,
  },
  decorators: [WithMockStore],
};

export const Loading: Story = {
  args: {
    enableShowcase: true,
  },
  decorators: [
    (Story: any) => {
      React.useEffect(() => {
        useHomepageStore.setState({
          featuredProducts: [],
          loading: true,
          error: null,
        });
      }, []);
      return <Story />;
    },
  ],
};

export const Error: Story = {
  args: {
    enableShowcase: true,
  },
  decorators: [
    (Story: any) => {
      React.useEffect(() => {
        useHomepageStore.setState({
          featuredProducts: [],
          loading: false,
          error: 'Failed to load featured products',
        });
      }, []);
      return <Story />;
    },
  ],
};

export const MobileView: Story = {
  args: {
    enableShowcase: true,
  },
  decorators: [WithMockStore],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const TabletView: Story = {
  args: {
    enableShowcase: true,
  },
  decorators: [WithMockStore],
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};