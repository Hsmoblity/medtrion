import type { Meta, StoryObj } from '@storybook/react';
import BlogsList from './blog-list';
import { BlogsPreProps } from './blog-preview';

const sampleBlogs: BlogsPreProps['blogs'] = Array.from({ length: 6 }).map((_, index) => ({
  date: '2024-07-1' + index,
  title: `Accessible Living Tips ${index + 1}`,
  description: 'Learn how to create barrier-free living spaces and support mobility for every family member.',
  link: '#',
  image: `https://picsum.photos/seed/bloglist-${index}/400/300`,
  alt: `Blog list ${index + 1}`
}));

const meta: Meta<typeof BlogsList> = {
  title: 'Components/BlogList',
  component: BlogsList,
  args: {
    blogs: sampleBlogs
  }
};

export default meta;

type Story = StoryObj<typeof BlogsList>;

export const Default: Story = {};
