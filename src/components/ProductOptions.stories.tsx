import type { Meta, StoryObj } from '@storybook/react';
import ProductOptions from './ProductOptions';
import {
  makeCartProduct,
  sampleCartItems,
  withCartEnvironment
} from './storybook/storyHelpers';

const relatedProducts = [
  {
    databaseId: 501,
    name: 'Outdoor Cover',
    slug: 'outdoor-cover',
    type: 'simple',
    price: 249,
    sku: 'COVER-001',
    image: '/temp.webp'
  },
  {
    databaseId: 502,
    name: 'Premium Seat Upgrade',
    slug: 'premium-seat',
    type: 'variable',
    variableType: 'radio',
    variations: [
      {
        databaseId: 5021,
        name: 'Leather - Black',
        price: 299,
        sku: 'SEAT-L-BLK',
        attributes: [
          { name: 'Material', value: 'Leather' },
          { name: 'Color', value: 'Black' }
        ]
      },
      {
        databaseId: 5022,
        name: 'Leather - Chestnut',
        price: 299,
        sku: 'SEAT-L-CHST',
        attributes: [
          { name: 'Material', value: 'Leather' },
          { name: 'Color', value: 'Chestnut' }
        ]
      }
    ]
  }
];

const meta: Meta<typeof ProductOptions> = {
  title: 'Components/ProductOptions',
  component: ProductOptions,
  decorators: [withCartEnvironment(sampleCartItems)],
  args: {
    relatedIds: [501, 502],
    relatedProducts: relatedProducts as any,
    parentProductId: sampleCartItems[0].productId,
    parentProduct: makeCartProduct({
      cartItemId: sampleCartItems[0].cartItemId,
      options: sampleCartItems[0].options
    }),
    fetchByIds: async () => relatedProducts as any,
    onConfirm: undefined
  }
};

export default meta;

type Story = StoryObj<typeof ProductOptions>;

export const Default: Story = {};

export const WithConfirmHandler: Story = {
  args: {
    onConfirm: async (selected) => {
      console.log('Selected add-ons', selected);
    }
  }
};
