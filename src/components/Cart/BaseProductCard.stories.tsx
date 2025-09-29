import type { Meta, StoryObj } from '@storybook/react';
import BaseProductCard from './BaseProductCard';
import { CartProduct } from '../../lib/interfaces';

const meta: Meta<typeof BaseProductCard> = {
  title: 'Cart/BaseProductCard',
  component: BaseProductCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BaseProductCard>;

// Mock product data
const mockProduct: CartProduct = {
  cartItemId: 'ci_123',
  slug: 'vivalift-tranquil-2-plr-935s-lift-chair',
  title: 'VivaLift Tranquil 2 PLR-935S Lift Chair',
  price: 1516.00,
  quantity: 1,
  featuredImage: '/placeholder.svg',
  productPictures: [
    {
      fields: {
        file: {
          url: '/placeholder.svg'
        }
      }
    }
  ],
  options: [
    {
      name: 'Warranty Extension',
      price: 179.00,
      quantity: 1,
      sku: 'WARR-EXT-001',
      category: 'Warranty'
    },
    {
      name: 'Fabric Color Upgrade',
      price: 0,
      quantity: 1,
      sku: 'FABRIC-001',
      category: 'Customization'
    }
  ]
};

const mockProductWithoutOptions: CartProduct = {
  cartItemId: 'ci_124',
  slug: 'simple-product',
  title: 'Simple Product',
  price: 299.99,
  quantity: 2,
  featuredImage: '/placeholder.svg',
  productPictures: [
    {
      fields: {
        file: {
          url: '/placeholder.svg'
        }
      }
    }
  ],
  options: []
};

export const Default: Story = {
  args: {
    product: mockProduct,
    showControls: true,
    showConfiguration: true,
    onEditConfiguration: () => console.log('Edit configuration clicked'),
    onRemoveProduct: () => console.log('Remove product clicked'),
    onUpdateQuantity: (quantity) => console.log('Update quantity:', quantity),
  },
};

export const WithoutOptions: Story = {
  args: {
    product: mockProductWithoutOptions,
    showControls: true,
    showConfiguration: false,
    onEditConfiguration: () => console.log('Edit configuration clicked'),
    onRemoveProduct: () => console.log('Remove product clicked'),
    onUpdateQuantity: (quantity) => console.log('Update quantity:', quantity),
  },
};

export const WithoutControls: Story = {
  args: {
    product: mockProduct,
    showControls: false,
    showConfiguration: true,
  },
};

export const Mobile: Story = {
  args: {
    product: mockProduct,
    showControls: true,
    showConfiguration: true,
    onEditConfiguration: () => console.log('Edit configuration clicked'),
    onRemoveProduct: () => console.log('Remove product clicked'),
    onUpdateQuantity: (quantity) => console.log('Update quantity:', quantity),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};