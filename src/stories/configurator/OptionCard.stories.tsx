import React from 'react';
import OptionCard from '../../components/configurator/OptionCard';
import {
  mockSafetyRail,
  mockPremiumSeat,
  mockProfessionalInstallation,
  mockRemoteControl,
  mockBatteryBackup,
  mockCompatibilityIssues,
  mockFinancingOptions,
  mockInsuranceEstimate,
  makeConfigurableProduct
} from '../../components/storybook/storyHelpers';

// Simple action logger for Storybook
const createAction = (name: string) => (...args: any[]) => {
  console.log(`[${name}]`, ...args);
};

// Story configuration
export default {
  title: 'HSM/OptionCard',
  component: OptionCard,
  parameters: {
    docs: {
      description: {
        component: `
# HSM Option Card Component

Interactive option card for HSM mobility equipment configurator. This component provides:

- **Visual Selection**: Clear selection feedback with accessibility support
- **Compatibility Checking**: Real-time compatibility validation
- **Financing Integration**: Monthly payment calculations and display
- **Insurance Coverage**: Coverage estimation and display
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

## Features

- Multiple variants (default, compact, featured, accessibility)
- Size options (small, medium, large, extra-large)
- Comprehensive event system for integration
- Modal details view with full specifications
- Loading states and error handling
- Compatibility warning system
        `
      }
    },
    layout: 'centered'
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'featured', 'accessibility'],
      description: 'Visual variant of the option card'
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large', 'extra-large'],
      description: 'Size of the option card'
    },
    isSelected: {
      control: { type: 'boolean' },
      description: 'Whether the option is currently selected'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the option is disabled'
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the option is in loading state'
    },
    showPrice: {
      control: { type: 'boolean' },
      description: 'Whether to show pricing information'
    },
    showFinancing: {
      control: { type: 'boolean' },
      description: 'Whether to show financing options'
    },
    showInsurance: {
      control: { type: 'boolean' },
      description: 'Whether to show insurance information'
    },
    highContrast: {
      control: { type: 'boolean' },
      description: 'Enable high contrast mode for accessibility'
    },
    largeText: {
      control: { type: 'boolean' },
      description: 'Enable large text for accessibility'
    },
    reducedMotion: {
      control: { type: 'boolean' },
      description: 'Disable animations for accessibility'
    }
  },
  decorators: [
    (Story: any) => (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto">
          <Story />
        </div>
      </div>
    )
  ]
};

// Template for creating stories
const Template = (args: any) => <OptionCard {...args} />;

// Default story
export const Default = Template.bind({});
(Default as any).args = {
  option: mockSafetyRail,
  categoryId: 'safety-features',
  showPrice: true,
  showFinancing: true,
  showInsurance: true,
  onToggle: createAction('option-toggle'),
  onViewDetails: createAction('view-details'),
  onSelect: createAction('option-select'),
  onDeselect: createAction('option-deselect')
};

// Selected state
export const Selected = Template.bind({});
(Selected as any).args = {
  ...((Default as any).args),
  isSelected: true
};

// Disabled state
export const Disabled = Template.bind({});
(Disabled as any).args = {
  ...((Default as any).args),
  disabled: true,
  option: makeConfigurableProduct({
    name: 'Unavailable Option',
    shortDescription: 'This option is currently unavailable for your configuration.',
    price: 199
  })
};

// Loading state
export const Loading = Template.bind({});
(Loading as any).args = {
  ...((Default as any).args),
  loading: true
};

// Compact variant
export const Compact = () => (
  <div className="p-4 bg-gray-50">
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <OptionCard
        option={mockRemoteControl}
        categoryId="accessories"
        variant="compact"
        size="small"
        onToggle={createAction('toggle-compact-1')}
        onViewDetails={createAction('view-compact-1')}
      />
      <OptionCard
        option={mockBatteryBackup}
        categoryId="safety"
        variant="compact"
        size="small"
        isSelected={true}
        onToggle={createAction('toggle-compact-2')}
        onViewDetails={createAction('view-compact-2')}
      />
    </div>
  </div>
);

// Featured variant
export const Featured = () => (
  <div className="p-8 bg-gray-50">
    <div className="max-w-lg mx-auto">
      <OptionCard
        option={mockPremiumSeat}
        categoryId="comfort"
        variant="featured"
        size="large"
        onToggle={createAction('toggle-featured')}
        onViewDetails={createAction('view-featured')}
      />
    </div>
  </div>
);

// With compatibility issues
export const WithCompatibilityIssues = Template.bind({});
(WithCompatibilityIssues as any).args = {
  ...((Default as any).args),
  option: mockPremiumSeat,
  compatibilityIssues: mockCompatibilityIssues,
  showCompatibility: true
};

// With financing options
export const WithFinancing = Template.bind({});
(WithFinancing as any).args = {
  ...((Default as any).args),
  option: mockProfessionalInstallation,
  financingOptions: mockFinancingOptions,
  showFinancing: true
};

// With insurance coverage
export const WithInsurance = Template.bind({});
(WithInsurance as any).args = {
  ...((Default as any).args),
  option: mockBatteryBackup,
  insuranceEstimate: mockInsuranceEstimate,
  showInsurance: true
};

// Accessibility focused
export const AccessibilityFocused = () => (
  <div className="p-8 bg-white">
    <div className="max-w-xl mx-auto">
      <OptionCard
        option={makeConfigurableProduct({
          name: 'ADA Compliant Safety System',
          shortDescription: 'Comprehensive safety system designed for users with accessibility needs.',
          price: 599,
          adaCompliant: true,
          safetyRating: 'A+',
          optionType: 'SAFETY'
        })}
        categoryId="safety-features"
        variant="accessibility"
        size="extra-large"
        highContrast={true}
        largeText={true}
        reducedMotion={true}
        screenReaderOptimized={true}
        onToggle={createAction('toggle-accessibility')}
        onViewDetails={createAction('view-accessibility')}
      />
    </div>
  </div>
);

// Error state (image loading error)
export const ImageError = Template.bind({});
(ImageError as any).args = {
  ...((Default as any).args),
  option: makeConfigurableProduct({
    name: 'Option with Missing Image',
    shortDescription: 'This option has an invalid image URL to demonstrate error handling.',
    price: 299,
    image: {
      sourceUrl: 'https://invalid-url.com/missing-image.jpg',
      altText: 'Missing image'
    }
  })
};

// Mobile view
export const Mobile = () => (
  <div className="p-4 bg-gray-50" style={{ width: '375px', minHeight: '667px' }}>
    <OptionCard
      option={mockSafetyRail}
      categoryId="safety-features"
      size="medium"
      onToggle={createAction('toggle-mobile')}
      onViewDetails={createAction('view-mobile')}
    />
  </div>
);

// Grid layout
export const GridLayout = () => (
  <div className="p-6 bg-gray-50">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Features</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <OptionCard
        option={mockSafetyRail}
        categoryId="safety-features"
        variant="default"
        onToggle={createAction('toggle-safety-rail')}
        onViewDetails={createAction('view-safety-rail')}
      />
      <OptionCard
        option={mockBatteryBackup}
        categoryId="safety-features"
        variant="default"
        isSelected={true}
        onToggle={createAction('toggle-battery-backup')}
        onViewDetails={createAction('view-battery-backup')}
      />
      <OptionCard
        option={mockRemoteControl}
        categoryId="safety-features"
        variant="default"
        onToggle={createAction('toggle-remote-control')}
        onViewDetails={createAction('view-remote-control')}
      />
    </div>
  </div>
);

// Performance test with many cards
export const PerformanceTest = () => (
  <div className="p-6 bg-gray-50">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Test - 20 Option Cards</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 20 }, (_, index) => (
        <OptionCard
          key={index}
          option={makeConfigurableProduct({
            name: `Option ${index + 1}`,
            shortDescription: `Test option ${index + 1} for performance testing`,
            price: 100 + (index * 50),
            databaseId: index + 1
          })}
          categoryId="test-category"
          variant="compact"
          size="small"
          onToggle={createAction(`toggle-option-${index + 1}`)}
        />
      ))}
    </div>
  </div>
);