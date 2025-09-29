import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Cursor } from './custom-cursor';

const meta: Meta<typeof Cursor> = {
  title: 'Components/Cursor',
  component: Cursor,
  args: {
    children: (
      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-semibold">
        HS
      </div>
    )
  }
};

export default meta;

type Story = StoryObj<typeof Cursor>;

const CursorPlayground = (props: React.ComponentProps<typeof Cursor>) => {
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div className="relative flex h-64 items-center justify-center border border-dashed">
      <p className="text-gray-600">Move your cursor here to see the custom cursor.</p>
      <Cursor {...props} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <CursorPlayground {...args} />
};

export const AttachedToParent: Story = {
  args: {
    attachToParent: true
  },
  render: (args) => (
    <div className="relative flex h-64 items-center justify-center border border-dashed bg-gray-50">
      <p className="text-gray-600">Hover inside to reveal the cursor</p>
      <CursorPlayground {...args} />
    </div>
  )
};
