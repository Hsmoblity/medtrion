import type { Meta, StoryObj } from '@storybook/react';
import Drawer from './drawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => <Drawer />
};
