import type { Meta, StoryObj } from '@storybook/react';
import PageLayout from './PageLayout';
import { withCartEnvironment, sampleCartItems } from '../storybook/storyHelpers';

const meta: Meta<typeof PageLayout> = {
  title: 'Components/PageLayout/Layout',
  component: PageLayout,
  decorators: [withCartEnvironment(sampleCartItems, true)]
};

export default meta;

type Story = StoryObj<typeof PageLayout>;

const PlaceholderContent = () => (
  <div className="mx-auto max-w-4xl space-y-6 px-6 py-24 text-gray-800">
    <h1 className="text-4xl font-bold">Stairlift Solutions</h1>
    <p>
      Explore our curated collection of stairlifts, home accessibility upgrades, and support services.
      This placeholder content demonstrates how the global layout wraps pages.
    </p>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Trusted Craftsmanship</h2>
        <p>Every installation includes certified technicians and responsive aftercare.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Flexible Financing</h2>
        <p>We tailor payment plans to fit your needs without compromising safety.</p>
      </div>
    </div>
  </div>
);

export const Default: Story = {
  render: () => (
    <PageLayout>
      <PlaceholderContent />
    </PageLayout>
  )
};
