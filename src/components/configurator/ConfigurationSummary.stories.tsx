import React from 'react';
import { Story, Meta } from '@storybook/react';
import ConfigurationSummary from './ConfigurationSummary';
import { useConfiguratorStore } from '../../stores/configuratorStore';

export default {
  title: 'Configurator/ConfigurationSummary',
  component: ConfigurationSummary,
} as Meta;

const Template: Story<React.ComponentProps<typeof ConfigurationSummary>> = (args) => {
  const { setModel, setCategories, addOption } = useConfiguratorStore();

  React.useEffect(() => {
    setModel({
      databaseId: 100,
      name: 'Stairlift 130',
      regularPrice: '2500.00',
    });
    setCategories([
      {
        id: 'safety',
        name: 'Safety',
        options: [
          { databaseId: 1, name: 'Heated Seat', regularPrice: '150.00' },
          { databaseId: 2, name: 'Extra Sensor', regularPrice: '100.00' },
        ],
      },
    ]);
  }, [setModel, setCategories]);

  return <ConfigurationSummary {...args} />;
};

export const Default = Template.bind({});
Default.args = {};

export const WithOptions = Template.bind({});
WithOptions.args = {};
WithOptions.play = async () => {
  const { addOption } = useConfiguratorStore.getState();
  addOption({ databaseId: 1, name: 'Heated Seat', regularPrice: '150.00' }, 'safety');
};
