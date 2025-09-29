import type { Meta, StoryObj } from '@storybook/react';
import { Lens } from './lens';

const meta: Meta<typeof Lens> = {
  title: 'Components/PageLayout/Lens',
  component: Lens,
  args: {
    zoomFactor: 1.8,
    lensSize: 220
  }
};

export default meta;

type Story = StoryObj<typeof Lens>;

const LensDemo = (args: React.ComponentProps<typeof Lens>) => (
  <div className="mx-auto max-w-2xl">
    <Lens {...args}>
      <img
        src="https://picsum.photos/seed/lens-demo/960/540"
        alt="Lens demo"
        className="h-full w-full object-cover"
      />
    </Lens>
  </div>
);

export const HoverLens: Story = {
  render: (args) => <LensDemo {...args} />
};

export const StaticLens: Story = {
  args: {
    isStatic: true,
    position: { x: 160, y: 140 }
  },
  render: (args) => <LensDemo {...args} />
};
