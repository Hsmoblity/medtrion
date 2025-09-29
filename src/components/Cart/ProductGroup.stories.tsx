import type { Meta, StoryObj } from '@storybook/react';
import ProductGroup from './ProductGroup';
import { CartProduct } from '../../lib/interfaces';

const meta: Meta<typeof ProductGroup> = {
  title: 'Cart/ProductGroup',
  component: ProductGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProductGroup>;

// Mock product data
const mockMainProduct: CartProduct = {
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
  options: []
};

const mockOptions = [
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
  },
  {
    name: 'Delivery Service',
    price: 698.00,
    quantity: 1,
    sku: 'DELIVERY-001',
    category: 'Service'
  }
];

const mockGroup = {
  mainProduct: mockMainProduct,
  options: mockOptions,
  configId: 'config_123'
};

export const Default: Story = {
  args: {
    group: mockGroup,
    showGroupHeader: true,
    showGroupTotal: true,
    onEditConfiguration: (product) => console.log('Edit configuration for:', product.title),
    onRemoveProduct: (product) => console.log('Remove product:', product.title),
    onUpdateQuantity: (product, quantity) => console.log('Update quantity for', product.title, 'to', quantity),
  },
};

export const WithoutGroupHeader: Story = {
  args: {
    group: mockGroup,
    showGroupHeader: false,
    showGroupTotal: true,
    onEditConfiguration: (product) => console.log('Edit configuration for:', product.title),
    onRemoveProduct: (product) => console.log('Remove product:', product.title),
    onUpdateQuantity: (product, quantity) => console.log('Update quantity for', product.title, 'to', quantity),
  },
};

export const WithoutGroupTotal: Story = {
  args: {
    group: mockGroup,
    showGroupHeader: true,
    showGroupTotal: false,
    onEditConfiguration: (product) => console.log('Edit configuration for:', product.title),
    onRemoveProduct: (product) => console.log('Remove product:', product.title),
    onUpdateQuantity: (product, quantity) => console.log('Update quantity for', product.title, 'to', quantity),
  },
};

export const SingleOption: Story = {
  args: {
    group: {
      mainProduct: mockMainProduct,
      options: [mockOptions[0]],
      configId: 'config_124'
    },
    showGroupHeader: true,
    showGroupTotal: true,
    onEditConfiguration: (product) => console.log('Edit configuration for:', product.title),
    onRemoveProduct: (product) => console.log('Remove product:', product.title),
    onUpdateQuantity: (product, quantity) => console.log('Update quantity for', product.title, 'to', quantity),
  },
};

export const NoOptions: Story = {
  args: {
    group: {
      mainProduct: mockMainProduct,
      options: [],
      configId: 'config_125'
    },
    showGroupHeader: true,
    showGroupTotal: true,
    onEditConfiguration: (product) => console.log('Edit configuration for:', product.title),
    onRemoveProduct: (product) => console.log('Remove product:', product.title),
    onUpdateQuantity: (product, quantity) => console.log('Update quantity for', product.title, 'to', quantity),
  },
};

export const Mobile: Story = {
  args: {
    group: mockGroup,
    showGroupHeader: true,
    showGroupTotal: true,
    onEditConfiguration: (product) => console.log('Edit configuration for:', product.title),
    onRemoveProduct: (product) => console.log('Remove product:', product.title),
    onUpdateQuantity: (product, quantity) => console.log('Update quantity for', product.title, 'to', quantity),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};