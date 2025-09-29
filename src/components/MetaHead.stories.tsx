import type { Meta, StoryObj } from '@storybook/react';
import MetaHead from './MetaHead';

const meta: Meta<typeof MetaHead> = {
  title: 'Components/MetaHead',
  component: MetaHead,
  args: {
    title: 'Acorn 180 Curved Stairlift',
    description: 'Reliable mobility assistance with smooth starts, soft stops, and tailored rail options.',
    featuredImage: 'https://picsum.photos/seed/meta-head/800/420',
    type: 'product'
  },
  parameters: {
    nextjs: {
      router: {
        asPath: '/product/acorn-180-curved-stairlift',
        push: (...args: unknown[]) => {
          console.info('[router.push]', ...args);
        }
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof MetaHead>;

export const Default: Story = {};
