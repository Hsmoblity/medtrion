import React from 'react';
import { Story, Meta } from '@storybook/react';
import OptionCard from './OptionCard';
import { ConfigurableProductSchema } from '../../lib/interfaces/configurator';

export default {
  title: 'Configurator/OptionCard',
  component: OptionCard,
} as Meta;

const Template: Story<React.ComponentProps<typeof OptionCard>> = (args) => <OptionCard {...args} />;

const mockOption: ConfigurableProductSchema = {
  databaseId: 1,
  name: 'Heated Seat',
  regularPrice: '150.00',
  shortDescription: 'A comfortable heated seat for cold weather.',
  image: {
    sourceUrl: 'https://via.placeholder.com/300',
    altText: 'Heated Seat',
  },
};

export const Default = Template.bind({});
Default.args = {
  option: mockOption,
};

export const Selected = Template.bind({});
Selected.args = {
  option: mockOption,
  isSelected: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  option: mockOption,
  disabled: true,
};

export const WithCompatibilityWarning = Template.bind({});
WithCompatibilityWarning.args = {
  option: mockOption,
  compatibilityIssues: [
    {
      rule: {
        id: '1',
        name: 'Conflict Rule',
        type: 'CONFLICTING',
        message: 'This option conflicts with another selected option.',
        severity: 'WARNING',
      },
      affectedOptions: [1],
      autoResolvable: false,
    },
  ],
};

export const WithCompatibilityError = Template.bind({});
WithCompatibilityError.args = {
  option: mockOption,
  compatibilityIssues: [
    {
      rule: {
        id: '2',
        name: 'Requirement Rule',
        type: 'REQUIRED',
        message: 'This option requires another option to be selected.',
        severity: 'ERROR',
      },
      affectedOptions: [1],
      autoResolvable: false,
    },
  ],
};
