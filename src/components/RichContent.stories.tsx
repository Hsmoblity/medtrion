import type { Meta, StoryObj } from '@storybook/react';
import RichContent from './RichContent';
import { sampleRichText } from './storybook/storyHelpers';

const meta: Meta<typeof RichContent> = {
  title: 'Components/RichContent',
  component: RichContent
};

export default meta;

type Story = StoryObj<typeof RichContent>;

export const FromRichTextDocument: Story = {
  args: {
    content: sampleRichText,
    className: 'prose'
  }
};

export const FromHtmlString: Story = {
  args: {
    content: '<h2>Key Benefits</h2><p>Compact design and easy installation.</p><ul><li>Professional setup</li><li>24/7 support</li></ul>',
    className: 'prose'
  }
};
