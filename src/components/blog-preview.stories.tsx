import type { Meta, StoryObj } from '@storybook/react';
import { BlogsPre } from './blog-preview';

const sampleBlogs = Array.from({ length: 9 }).map((_, index) => ({
  date: '2024-08-0' + ((index % 9) + 1),
  title: `Mobility Insight ${index + 1}`,
  description: 'Discover practical guidance on choosing the perfect stairlift and keeping it in top condition for daily use.',
  link: '#',
  image: `https://picsum.photos/seed/blog-${index}/400/300`,
  alt: `Mobility blog ${index + 1}`
}));

const meta: Meta<typeof BlogsPre> = {
  title: 'Components/BlogPreview',
  component: BlogsPre,
  args: {
    blogs: sampleBlogs
  }
};

export default meta;

type Story = StoryObj<typeof BlogsPre>;

export const Default: Story = {};
