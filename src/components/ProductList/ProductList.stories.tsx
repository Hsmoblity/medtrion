import type { Meta, StoryObj } from '@storybook/react';
import ProductList from './ProductList';
import { makeProduct, sampleRichText, withCartEnvironment } from '../storybook/storyHelpers';

const products = [
  makeProduct({
    title: 'Acorn 130 Straight Stairlift',
    slug: 'acorn-130',
    price: 1999,
    shortDescription: sampleRichText,
    productId: 'prod_130'
  }),
  makeProduct({
    title: 'Acorn 180 Curved Stairlift',
    slug: 'acorn-180',
    price: 2899,
    shortDescription: sampleRichText,
    productId: 'prod_180',
    affiliate: true
  }),
  makeProduct({
    title: 'Outdoor Stairlift',
    slug: 'outdoor-stairlift',
    price: 3199,
    shortDescription: sampleRichText,
    productId: 'prod_outdoor'
  })
];

const meta: Meta<typeof ProductList> = {
  title: 'Components/ProductList',
  component: ProductList,
  decorators: [withCartEnvironment()],
  args: {
    products
  }
};

export default meta;

type Story = StoryObj<typeof ProductList>;

export const Default: Story = {};
