import type { Meta, StoryObj } from '@storybook/react';
import Header from './Header';
import { sampleCartItems, withCartEnvironment } from '../storybook/storyHelpers';

const meta: Meta<typeof Header> = {
  title: 'Components/PageLayout/Header',
  component: Header,
  decorators: [withCartEnvironment(sampleCartItems, true)],
  parameters: {
    nextjs: {
      navigation: {
        push: (...args: unknown[]) => {
          console.info('[router.push]', ...args);
        }
      }
    }
  }
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  render: () => <Header />
};
