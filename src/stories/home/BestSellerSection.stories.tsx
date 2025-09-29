import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import BestSellerSection from '../../components/Home/BestSellerSection';
import { ProductSchema } from '../../lib/interfaces';

const meta: Meta<typeof BestSellerSection> = {
  title: 'Home/BestSellerSection',
  component: BestSellerSection,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialProducts: {
      control: false,
      description: 'Array of products to display in the best seller section',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock product data
const mockProducts: ProductSchema[] = [
  {
    title: 'Acorn 180 Curved Stairlift',
    slug: 'acorn-180-curved-stairlift',
    description: 'The Acorn 180 is our most advanced curved stairlift, designed to navigate the most complex staircases with smooth, quiet operation.',
    shortDescription: 'Advanced curved stairlift with smooth, quiet operation for complex staircases.',
    featuredImage: {
      fields: {
        file: {
          url: '/180-stairlift-wh.jpg'
        }
      }
    },
    productSpecifications: 'Weight capacity: 300 lbs, Track length: Custom fitted, Safety features: Multiple sensors',
    productPictures: [
      { fields: { file: { url: '/180-stairlift-wh.jpg' } } },
      { fields: { file: { url: '/180-stairlift-moving.png' } } }
    ],
    price: 2899,
    affiliate: false,
    productId: '180',
    _related_options: ['seat-options', 'rail-options', 'control-options'],
  },
  {
    title: 'Acorn 130 Straight Stairlift',
    slug: 'acorn-130-straight-stairlift',
    description: 'The reliable Acorn 130 straight stairlift offers dependable mobility for straight staircases with easy-to-use controls.',
    shortDescription: 'Reliable straight stairlift with easy-to-use controls and dependable performance.',
    featuredImage: {
      fields: {
        file: {
          url: '/130-stairlift-wh.jpg'
        }
      }
    },
    productSpecifications: 'Weight capacity: 300 lbs, Rail length: Standard sizes available, Installation: Quick and clean',
    productPictures: [
      { fields: { file: { url: '/130-stairlift-wh.jpg' } } },
      { fields: { file: { url: '/130-stairlift-seated.jpg' } } }
    ],
    price: 2299,
    affiliate: false,
    productId: '130',
    _related_options: ['seat-options', 'control-options'],
  },
  {
    title: 'Outdoor Stairlift Solution',
    slug: 'outdoor-stairlift-solution',
    description: 'Weather-resistant outdoor stairlift designed to withstand the elements while providing safe access to your outdoor spaces.',
    shortDescription: 'Weather-resistant outdoor stairlift for safe access to outdoor spaces.',
    featuredImage: {
      fields: {
        file: {
          url: '/acorn-outdoor-stair-lift-uk.jpg'
        }
      }
    },
    productSpecifications: 'Weather protection: IP55 rated, Materials: Corrosion-resistant, Temperature range: -20°C to +50°C',
    productPictures: [
      { fields: { file: { url: '/acorn-outdoor-stair-lift-uk.jpg' } } },
      { fields: { file: { url: '/outdoor-cover.jpg' } } }
    ],
    price: 3499,
    affiliate: false,
    productId: 'outdoor',
    _related_options: ['weather-cover', 'outdoor-controls'],
  },
  {
    title: 'Premium Platform Lift',
    slug: 'premium-platform-lift',
    description: 'Wheelchair-accessible vertical platform lift providing smooth vertical transportation for multi-level homes.',
    shortDescription: 'Wheelchair-accessible vertical platform lift for multi-level access.',
    featuredImage: '/temp.webp',
    productSpecifications: 'Platform size: 36" x 48", Weight capacity: 750 lbs, Travel height: Up to 14 feet',
    productPictures: [
      { fields: { file: { url: '/temp.webp' } } }
    ],
    price: 4999,
    affiliate: false,
    productId: 'platform',
    _related_options: ['platform-size', 'safety-features', 'control-options'],
  },
  {
    title: 'Mobility Scooter Elite',
    slug: 'mobility-scooter-elite',
    description: 'High-performance mobility scooter with long-range battery and comfortable seating for all-day use.',
    shortDescription: 'High-performance mobility scooter with long-range battery and comfort.',
    featuredImage: '/temp.webp',
    productSpecifications: 'Range: 25 miles, Max speed: 8 mph, Weight capacity: 350 lbs, Battery: Lithium-ion',
    productPictures: [
      { fields: { file: { url: '/temp.webp' } } }
    ],
    price: 1899,
    affiliate: false,
    productId: 'scooter-elite',
    _related_options: ['battery-upgrade', 'comfort-package'],
  },
  {
    title: 'Walk-In Tub Deluxe',
    slug: 'walk-in-tub-deluxe',
    description: 'Luxurious walk-in tub with therapeutic jets, heated surfaces, and easy-access door for safe bathing.',
    shortDescription: 'Luxurious walk-in tub with therapeutic features and safe access.',
    featuredImage: '/temp.webp',
    productSpecifications: 'Dimensions: 30" x 60", Door: Inward opening, Jets: 12 therapeutic jets, Heating: Heated seat and back',
    productPictures: [
      { fields: { file: { url: '/temp.webp' } } }
    ],
    price: 5999,
    affiliate: false,
    productId: 'walk-in-tub',
    _related_options: ['jet-upgrade', 'heating-package', 'accessibility-features'],
  },
];

export const Default: Story = {
  args: {
    initialProducts: mockProducts,
  },
};

export const WithFewProducts: Story = {
  args: {
    initialProducts: mockProducts.slice(0, 3),
  },
};

export const NoProducts: Story = {
  args: {
    initialProducts: [],
  },
};

export const LoadingState: Story = {
  args: {
    initialProducts: undefined, // This will trigger the loading state
  },
  decorators: [
    (Story) => {
      // Mock the getProducts function to never resolve
      const originalGetProducts = require('../../lib/contentful/contentful').getProducts;
      require('../../lib/contentful/contentful').getProducts = () => new Promise(() => {});
      
      React.useEffect(() => {
        return () => {
          // Restore original function on cleanup
          require('../../lib/contentful/contentful').getProducts = originalGetProducts;
        };
      }, []);
      
      return <Story />;
    },
  ],
};

export const ErrorState: Story = {
  args: {
    initialProducts: undefined,
  },
  decorators: [
    (Story) => {
      // Mock the getProducts function to reject
      const originalGetProducts = require('../../lib/contentful/contentful').getProducts;
      require('../../lib/contentful/contentful').getProducts = () => Promise.reject(new Error('Network error'));
      
      React.useEffect(() => {
        return () => {
          // Restore original function on cleanup
          require('../../lib/contentful/contentful').getProducts = originalGetProducts;
        };
      }, []);
      
      return <Story />;
    },
  ],
};