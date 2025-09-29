import type { Meta, StoryObj } from '@storybook/react';
import TableOfContents from './toc';
import { sampleHeadingsRichText } from './storybook/storyHelpers';

const meta: Meta<typeof TableOfContents> = {
  title: 'Components/TableOfContents',
  component: TableOfContents,
  args: {
    content: sampleHeadingsRichText
  }
};

export default meta;

type Story = StoryObj<typeof TableOfContents>;

export const Default: Story = {};
