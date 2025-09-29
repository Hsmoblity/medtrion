import type { Meta, StoryObj } from '@storybook/react';
import ProductItem from './ProductItem';
import {
  makeProduct,
  sampleRichText,
  withCartEnvironment
} from '../storybook/storyHelpers';

const product = makeProduct({
  title: 'Deluxe Stairlift',
  slug: 'deluxe-stairlift',
  price: 3499,
  productId: 'deluxe_001',
  shortDescription: sampleRichText,
  productPictures: [
    { fields: { file: { url: 'https://picsum.photos/seed/stairlift-1/960/540' } } },
    { fields: { file: { url: 'https://picsum.photos/seed/stairlift-2/960/540' } } },
    { fields: { file: { url: 'https://picsum.photos/seed/stairlift-3/960/540' } } }
  ],
  variations: [
    {
      id: 'var_small',
      databaseId: 201,
      price: 3499,
      sku: 'DLX-SM',
      attributes: [
        { name: 'Rail', value: 'Straight' },
        { name: 'Seat', value: 'Standard' }
      ]
    },
    {
      id: 'var_large',
      databaseId: 202,
      price: 3699,
      sku: 'DLX-LG',
      attributes: [
        { name: 'Rail', value: 'Curved' },
        { name: 'Seat', value: 'Wide' }
      ]
    }
  ],
  options: [
    { name: 'Extra Remote', priceModifier: 129 },
    { name: 'Extended Warranty', priceModifier: 199 }
  ],
  _related_options: [],
  _related_options_products: []
});

const meta: Meta<typeof ProductItem> = {
  title: 'Components/ProductItem',
  component: ProductItem,
  decorators: [withCartEnvironment()],
  args: {
    product
  },
  parameters: {
    nextjs: {
      navigation: {
        push: (...args: unknown[]) => {
          console.info('[router.push]', ...args);
        }
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof ProductItem>;

export const Default: Story = {};
