import type { Meta, StoryObj } from '@storybook/react';
import Item from './Item';
import { sampleCartItems, withCartEnvironment } from '../../storybook/storyHelpers';

const product = {
  ...sampleCartItems[0],
  productPictures: sampleCartItems[0].productPictures,
  variations: sampleCartItems[0].variations || [
    {
      id: 'var_1',
      databaseId: 101,
      attributes: [
        { name: 'Rail', value: 'Curved' },
        { name: 'Finish', value: 'Bronze' }
      ]
    }
  ],
  options: sampleCartItems[0].options
};

const meta: Meta<typeof Item> = {
  title: 'Components/Cart/Item',
  component: Item,
  decorators: [withCartEnvironment([product], true)],
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

type Story = StoryObj<typeof Item>;

export const Default: Story = {};
