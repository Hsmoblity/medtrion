import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedSubscribeButton, DrawOutlineButton } from './btn';

const meta: Meta<typeof AnimatedSubscribeButton> = {
  title: 'Components/Button/AnimatedSubscribe',
  component: AnimatedSubscribeButton,
  args: {
    buttonColor: '#111827',
    buttonTextColor: '#ffffff',
    subscribeStatus: false,
    initialText: 'Join the list',
    changeText: 'Thanks for subscribing!'
  }
};

export default meta;

type Story = StoryObj<typeof AnimatedSubscribeButton>;

export const Animated: Story = {};

export const Outline: StoryObj<typeof DrawOutlineButton> = {
  name: 'Draw Outline Button',
  render: () => <DrawOutlineButton>Explore</DrawOutlineButton>
};
