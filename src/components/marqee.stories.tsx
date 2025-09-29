import type { Meta, StoryObj } from '@storybook/react';
import { InfiniteSlider } from './marqee';

const meta: Meta<typeof InfiniteSlider> = {
  title: 'Components/InfiniteSlider',
  component: InfiniteSlider,
  args: {
    gap: 24,
    duration: 20,
    children: (
      <div className="flex gap-6 text-lg font-semibold">
        <span>⭐ Trusted Installations</span>
        <span>🚚 Free In-Home Consultation</span>
        <span>🛠️ Certified Technicians</span>
        <span>📞 24/7 Support</span>
      </div>
    )
  }
};

export default meta;

type Story = StoryObj<typeof InfiniteSlider>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    children: (
      <div className="flex flex-col gap-4 text-lg font-semibold">
        <span>Customer First</span>
        <span>Professional Installers</span>
        <span>Fast Response</span>
      </div>
    )
  }
};
