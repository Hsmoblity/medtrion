import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Form from './step-form';

const meta: Meta<typeof Form> = {
  title: 'Components/StepForm',
  component: Form
};

export default meta;

type Story = StoryObj<typeof Form>;

const MockedForm = () => {
  useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ success: true })
    }) as Response;
    return () => {
      global.fetch = originalFetch;
    };
  }, []);

  return <Form />;
};

export const Default: Story = {
  render: () => <MockedForm />
};
