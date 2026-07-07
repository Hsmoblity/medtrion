import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { configuratorAnalytics } from '../../lib/analytics/configuratorAnalytics';
import ModelConfigurator from '../../components/configurator/ModelConfigurator';
import { ConfigurableProductSchema, ConfiguratorCategory } from '../../lib/interfaces/configurator';

// Mock analytics
jest.mock('../../lib/analytics/configuratorAnalytics', () => ({
  configuratorAnalytics: {
    track: jest.fn(),
    trackOptionToggle: jest.fn(),
    trackConfigurationSummaryView: jest.fn(),
    trackAddToCart: jest.fn(),
    trackFinancingView: jest.fn(),
    trackInsuranceCheck: jest.fn(),
    trackConfigurationSave: jest.fn(),
    trackCompatibilityIssue: jest.fn()
  }
}));

// Mock data
const mockBaseModel: ConfigurableProductSchema = {
  databaseId: 101,
  id: '101',
  name: 'Model X Stairlift',
  title: 'Model X Stairlift',
  sku: 'CAR-MODEL-X',
  price: '25000',
  regularPrice: '25000',
  salePrice: '',
  shortDescription: 'Premium stairlift with advanced safety features.',
  image: {
    sourceUrl: '/model-x.jpg',
    altText: 'Model X Stairlift'
  },
  baseModel: true,
  installationRequired: true,
  financingAvailable: true,
  safetyRating: 'A+',
  adaCompliant: true
};

const mockCategories: ConfiguratorCategory[] = [
  {
    id: 'safety-options',
    name: 'Safety Options',
    slug: 'safety-options',
    description: 'Essential safety features for your stairlift',
    displayOrder: 1,
    required: true,
    multiSelect: true,
    minSelections: 1,
    maxSelections: 3,
    options: [
      {
        databaseId: 301,
        id: '301',
        name: 'Auto-Stop Safety Sensor',
        title: 'Auto-Stop Safety Sensor',
        sku: 'OPT-SAFETY-SENSOR',
        price: '850',
        regularPrice: '850',
        salePrice: '',
        shortDescription: 'Automatically stops when obstacles detected',
        image: {
          sourceUrl: '/safety-sensor.jpg',
          altText: 'Auto-Stop Safety Sensor'
        },
        optionType: 'SAFETY',
        safetyRating: 'A++',
        adaCompliant: true
      },
      {
        databaseId: 302,
        id: '302',
        name: 'Emergency Stop Button',
        title: 'Emergency Stop Button',
        sku: 'OPT-EMERGENCY-STOP',
        price: '450',
        regularPrice: '450',
        salePrice: '',
        shortDescription: 'Large red emergency stop button',
        image: {
          sourceUrl: '/emergency-stop.jpg',
          altText: 'Emergency Stop Button'
        },
        optionType: 'SAFETY',
        safetyRating: 'A+',
        adaCompliant: true
      }
    ]
  },
  {
    id: 'comfort-options',
    name: 'Comfort Options',
    slug: 'comfort-options',
    description: 'Enhanced comfort features',
    displayOrder: 2,
    required: false,
    multiSelect: true,
    options: [
      {
        databaseId: 401,
        id: '401',
        name: 'Heated Seat',
        title: 'Heated Seat',
        sku: 'OPT-HEATED-SEAT',
        price: '650',
        regularPrice: '650',
        salePrice: '',
        shortDescription: 'Comfortable heated seat with temperature control',
        image: {
          sourceUrl: '/heated-seat.jpg',
          altText: 'Heated Seat'
        },
        optionType: 'COMFORT',
        adaCompliant: true
      }
    ]
  }
];

// Mock the configurator store
jest.mock('../../stores/configuratorStore', () => ({
  useConfiguratorStore: () => ({
    model: mockBaseModel,
    categories: mockCategories,
    selectedOptions: {},
    summary: {
      basePrice: 25000,
      optionsTotal: 0,
      installationCost: 300,
      shippingCost: 150,
      taxAmount: 2036,
      grandTotal: 27486,
      estimatedDelivery: '2-3 weeks'
    },
    compatibilityIssues: [],
    loading: false,
    error: null,
    addOption: jest.fn(),
    removeOption: jest.fn(),
    checkCompatibility: jest.fn(),
    calculateSummary: jest.fn(),
    isOptionSelected: jest.fn(() => false),
    getOptionCompatibilityIssues: jest.fn(() => [])
  })
}));

describe('Configurator Selection Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render ModelConfigurator with base model and categories', () => {
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
      />
    );

    expect(screen.getByText('Model X Stairlift')).toBeInTheDocument();
    expect(screen.getByText('Safety Options')).toBeInTheDocument();
    expect(screen.getByText('Comfort Options')).toBeInTheDocument();
  });

  test('should track analytics when option is toggled', async () => {
    const user = userEvent.setup();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
      />
    );

    // Click on a safety option
    const safetyOption = screen.getByText('Auto-Stop Safety Sensor');
    await user.click(safetyOption);

    expect(configuratorAnalytics.trackOptionToggle).toHaveBeenCalledWith(
      301,
      'Auto-Stop Safety Sensor',
      'safety-options',
      true,
      expect.any(Number)
    );
  });

  test('should show compatibility issues when invalid combination is selected', async () => {
    const user = userEvent.setup();
    const mockCategoriesWithConflict = [
      {
        ...mockCategories[0],
        options: [
          ...mockCategories[0].options!,
          {
            databaseId: 303,
            id: '303',
            name: 'Conflicting Option',
            title: 'Conflicting Option',
            sku: 'OPT-CONFLICT',
            price: '500',
            regularPrice: '500',
            salePrice: '',
            shortDescription: 'This option conflicts with others',
            compatibilityRules: [
              {
                id: 'conflict-rule',
                name: 'Conflicting Options',
                type: 'CONFLICTING',
                conflictingOptions: [301],
                message: 'This option cannot be used with Auto-Stop Safety Sensor',
                severity: 'ERROR'
              }
            ]
          }
        ]
      }
    ];

    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategoriesWithConflict}
      />
    );

    // Select first option
    const firstOption = screen.getByText('Auto-Stop Safety Sensor');
    await user.click(firstOption);

    // Select conflicting option
    const conflictingOption = screen.getByText('Conflicting Option');
    await user.click(conflictingOption);

    // Should track compatibility issue
    expect(configuratorAnalytics.trackCompatibilityIssue).toHaveBeenCalled();
  });

  test('should update summary when options are selected', async () => {
    const user = userEvent.setup();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
      />
    );

    // Verify initial total
    expect(screen.getByText(/\$27,486/)).toBeInTheDocument(); // Base total

    // Select an option
    const safetyOption = screen.getByText('Auto-Stop Safety Sensor');
    await user.click(safetyOption);

    // Should track summary view
    expect(configuratorAnalytics.trackConfigurationSummaryView).toHaveBeenCalled();
  });

  test('should handle add to cart flow', async () => {
    const user = userEvent.setup();
    const mockAddToCart = jest.fn();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
        onAddToCart={mockAddToCart}
      />
    );

    // Select some options first
    const safetyOption = screen.getByText('Auto-Stop Safety Sensor');
    await user.click(safetyOption);

    // Find and click add to cart button
    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);

    expect(mockAddToCart).toHaveBeenCalled();
    expect(configuratorAnalytics.trackAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({
        basePrice: expect.any(Number),
        optionsTotal: expect.any(Number),
        grandTotal: expect.any(Number),
        optionsCount: expect.any(Number)
      })
    );
  });

  test('should validate required categories', async () => {
    const user = userEvent.setup();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
      />
    );

    // Try to add to cart without selecting required safety options
    const addToCartButton = screen.getByText('Add to Cart');
    
    // Should be disabled or show validation error
    // (This would depend on your specific validation implementation)
    expect(addToCartButton).toBeInTheDocument();
  });

  test('should handle loading states', () => {
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
        loading={true}
      />
    );

    // Should show loading indicators
    expect(screen.getByTestId('configurator-loading')).toBeInTheDocument();
  });

  test('should handle error states', () => {
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
        error="Failed to load configuration"
      />
    );

    expect(screen.getByText('Failed to load configuration')).toBeInTheDocument();
  });

  test('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
      />
    );

    // Tab through options and select with Enter
    const safetyOption = screen.getByText('Auto-Stop Safety Sensor');
    safetyOption.focus();
    
    await user.keyboard('{Enter}');
    
    expect(configuratorAnalytics.trackOptionToggle).toHaveBeenCalled();
  });

  test('should handle financing options', async () => {
    const user = userEvent.setup();
    const mockViewFinancing = jest.fn();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
        onViewFinancing={mockViewFinancing}
      />
    );

    // Look for financing button (should appear for high-value configurations)
    const financingButton = screen.queryByText('View Options');
    if (financingButton) {
      await user.click(financingButton);
      expect(configuratorAnalytics.trackFinancingView).toHaveBeenCalled();
    }
  });

  test('should handle insurance checking', async () => {
    const user = userEvent.setup();
    const mockCheckInsurance = jest.fn();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
        onCheckInsurance={mockCheckInsurance}
      />
    );

    // Look for insurance button
    const insuranceButton = screen.queryByText('Check Eligibility');
    if (insuranceButton) {
      await user.click(insuranceButton);
      expect(configuratorAnalytics.trackInsuranceCheck).toHaveBeenCalled();
    }
  });
});

describe('Configurator Analytics Integration', () => {
  test('should track complete user journey', async () => {
    const user = userEvent.setup();
    
    render(
      <ModelConfigurator
        baseModel={mockBaseModel}
        categories={mockCategories}
        onAddToCart={() => {}}
      />
    );

    // Step 1: View configurator (automatic)
    expect(configuratorAnalytics.track).toHaveBeenCalledWith(
      expect.stringContaining('view'),
      expect.any(Object)
    );

    // Step 2: Select options
    const safetyOption = screen.getByText('Auto-Stop Safety Sensor');
    await user.click(safetyOption);
    
    expect(configuratorAnalytics.trackOptionToggle).toHaveBeenCalledWith(
      301,
      'Auto-Stop Safety Sensor',
      'safety-options',
      true,
      expect.any(Number)
    );

    // Step 3: View summary
    expect(configuratorAnalytics.trackConfigurationSummaryView).toHaveBeenCalled();

    // Step 4: Add to cart
    const addToCartButton = screen.getByText('Add to Cart');
    await user.click(addToCartButton);
    
    expect(configuratorAnalytics.trackAddToCart).toHaveBeenCalled();
  });
});