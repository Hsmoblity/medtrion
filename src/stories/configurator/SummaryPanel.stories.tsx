import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SummaryPanel from '../../components/configurator/SummaryPanel';
import { PrimaryButton } from 'components/ui';

// Mock configuration data
const mockConfiguration = {
  basePrice: 25000,
  optionsTotal: 3250,
  installationCost: 300,
  shippingCost: 150,
  taxAmount: 2296,
  grandTotal: 30996,
  estimatedDelivery: '2-3 weeks'
};

const mockPreviousConfiguration = {
  basePrice: 25000,
  optionsTotal: 2100,
  installationCost: 300,
  shippingCost: 150,
  taxAmount: 2212,
  grandTotal: 29762,
  estimatedDelivery: '2-3 weeks'
};

const meta: Meta<typeof SummaryPanel> = {
  title: 'Configurator/SummaryPanel',
  component: SummaryPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Interactive pricing summary panel with animated price updates, financing options, and insurance information.'
      }
    }
  },
  argTypes: {
    loading: {
      control: 'boolean'
    },
    disabled: {
      control: 'boolean'
    },
    screenReaderOptimized: {
      control: 'boolean'
    },
    onAddToCart: {
      action: 'add-to-cart'
    },
    onViewFinancing: {
      action: 'view-financing'
    },
    onCheckInsurance: {
      action: 'check-insurance'
    }
  }
};

export default meta;
type Story = StoryObj<typeof SummaryPanel>;

// Default configuration summary
export const Default: Story = {
  args: {
    configuration: mockConfiguration,
    onAddToCart: () => console.log('Add to cart clicked'),
    loading: false,
    disabled: false
  }
};

// With previous configuration for animation
export const WithAnimation: Story = {
  args: {
    configuration: mockConfiguration,
    previousConfiguration: mockPreviousConfiguration,
    onAddToCart: () => console.log('Add to cart clicked')
  }
};

// Loading state
export const Loading: Story = {
  args: {
    configuration: mockConfiguration,
    loading: true,
    onAddToCart: () => console.log('Add to cart clicked')
  }
};

// Disabled state
export const Disabled: Story = {
  args: {
    configuration: mockConfiguration,
    disabled: true,
    onAddToCart: () => console.log('Add to cart clicked')
  }
};

// With financing options
export const WithFinancing: Story = {
  args: {
    configuration: {
      ...mockConfiguration,
      grandTotal: 15000 // Higher amount to trigger financing
    },
    onAddToCart: () => console.log('Add to cart clicked'),
    onViewFinancing: () => console.log('View financing clicked')
  }
};

// With insurance options
export const WithInsurance: Story = {
  args: {
    configuration: {
      ...mockConfiguration,
      grandTotal: 8000 // Amount that triggers insurance
    },
    onAddToCart: () => console.log('Add to cart clicked'),
    onCheckInsurance: () => console.log('Check insurance clicked')
  }
};

// Full features - financing and insurance
export const FullFeatures: Story = {
  args: {
    configuration: {
      ...mockConfiguration,
      grandTotal: 25000
    },
    onAddToCart: () => console.log('Add to cart clicked'),
    onViewFinancing: () => console.log('View financing clicked'),
    onCheckInsurance: () => console.log('Check insurance clicked')
  }
};

// Screen reader optimized
export const ScreenReader: Story = {
  args: {
    configuration: mockConfiguration,
    screenReaderOptimized: true,
    onAddToCart: () => console.log('Add to cart clicked')
  }
};

// Minimal configuration (base price only)
export const MinimalConfiguration: Story = {
  args: {
    configuration: {
      basePrice: 25000,
      optionsTotal: 0,
      installationCost: 0,
      shippingCost: 150,
      taxAmount: 2012,
      grandTotal: 27162,
      estimatedDelivery: '1-2 weeks'
    },
    onAddToCart: () => console.log('Add to cart clicked')
  }
};

// High value configuration
export const HighValue: Story = {
  args: {
    configuration: {
      basePrice: 45000,
      optionsTotal: 8500,
      installationCost: 500,
      shippingCost: 200,
      taxAmount: 4336,
      grandTotal: 58536,
      estimatedDelivery: '3-4 weeks'
    },
    onAddToCart: () => console.log('Add to cart clicked'),
    onViewFinancing: () => console.log('View financing clicked'),
    onCheckInsurance: () => console.log('Check insurance clicked')
  }
};

// Interactive demo with price updates
export const InteractiveDemo: Story = {
  render: function InteractiveDemoComponent() {
    const [currentConfig, setCurrentConfig] = React.useState(mockConfiguration);
    const [previousConfig, setPreviousConfig] = React.useState(mockPreviousConfiguration);
    
    const updatePrice = () => {
      setPreviousConfig(currentConfig);
      setCurrentConfig({
        ...currentConfig,
        optionsTotal: currentConfig.optionsTotal + Math.floor(Math.random() * 1000) + 500,
        grandTotal: currentConfig.grandTotal + Math.floor(Math.random() * 1000) + 500,
        taxAmount: Math.floor((currentConfig.grandTotal + 500) * 0.08)
      });
    };
    
    return (
      <div className="space-y-4">
        <PrimaryButton
          onClick={updatePrice}
        >
          Update Configuration
        </PrimaryButton>
        <SummaryPanel
          configuration={currentConfig}
          previousConfiguration={previousConfig}
          onAddToCart={() => console.log('Add to cart clicked')}
          onViewFinancing={() => console.log('View financing clicked')}
          onCheckInsurance={() => console.log('Check insurance clicked')}
        />
      </div>
    );
  }
};

// Legacy simple panel (backward compatibility)
export const LegacySimple: Story = {
  args: {
    title: 'Total Price',
    currentValue: 30996,
    previousValue: 29762
  }
};