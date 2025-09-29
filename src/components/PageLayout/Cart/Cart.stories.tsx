import type { Meta, StoryObj } from '@storybook/react';
import Cart from './Cart';
import { sampleCartItems, withCartEnvironment } from '../../storybook/storyHelpers';

const meta: Meta<typeof Cart> = {
  title: 'Components/Cart/DrawerCart',
  component: Cart,
  decorators: [withCartEnvironment(sampleCartItems, true)],
  parameters: {
    nextjs: {
      router: {
        push: (...args: unknown[]) => {
          console.info('[router.push]', ...args);
        },
        pathname: '/cart'
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof Cart>;

export const Default: Story = {
  render: () => <Cart />
};
