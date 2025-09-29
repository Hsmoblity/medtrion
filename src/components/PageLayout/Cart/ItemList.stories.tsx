import type { Meta, StoryObj } from '@storybook/react';
import ItemList from './ItemList';
import { sampleCartItems, withCartEnvironment } from '../../storybook/storyHelpers';

const meta: Meta<typeof ItemList> = {
  title: 'Components/Cart/ItemList',
  component: ItemList,
  decorators: [withCartEnvironment(sampleCartItems)],
  args: {
    products: sampleCartItems
  }
};

export default meta;

type Story = StoryObj<typeof ItemList>;

export const Default: Story = {};
