import type { Meta, StoryObj } from '@storybook/react';
import { Reviews } from './reviews';

const meta: Meta<typeof Reviews> = {
  title: 'Components/Reviews',
  component: Reviews
};

export default meta;

type Story = StoryObj<typeof Reviews>;

export const Default: Story = {
  render: () => <Reviews />
};
