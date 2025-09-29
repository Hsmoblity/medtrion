import type { Meta, StoryObj } from '@storybook/react';
import FAQ from './faq';

const meta: Meta<typeof FAQ> = {
  title: 'Components/FAQ',
  component: FAQ
};

export default meta;

type Story = StoryObj<typeof FAQ>;

export const Default: Story = {
  render: () => <FAQ />
};
