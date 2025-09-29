import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import ModelConfigurator from '../src/components/configurator/ModelConfigurator';
import OptionCard from '../src/components/configurator/OptionCard';
import { ConfigurableProductSchema, ConfiguratorCategory } from '../src/lib/interfaces/configurator';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the configurator store
jest.mock('../src/stores/configuratorStore', () => ({
  useConfiguratorStore: jest.fn(() => ({
    selectedOptions: {},
    compatibilityIssues: [],
    setSelectedOptions: jest.fn(),
    addOption: jest.fn(),
    removeOption: jest.fn(),
    checkCompatibility: jest.fn(),
    clearCompatibilityIssues: jest.fn(),
  })),
}));

// Mock ClientOnly component
jest.mock('../src/components/ClientOnly', () => {
  return function MockClientOnly({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

describe('Configurator View Details Functionality', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    asPath: '/product/test-product/configure',
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  describe('ModelConfigurator Component', () => {
    const mockBaseModel: ConfigurableProductSchema = {
      id: 'base-model-1',
      databaseId: 1,
      name: 'Test Base Model',
      slug: 'test-base-model',
      description: 'Test base model description',
      shortDescription: 'Test base model',
      price: 1000,
      regularPrice: 1000,
      salePrice: null,
      sku: 'BASE-001',
      image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
      galleryImages: { nodes: [] },
      productSpecifications: '',
      relatedOptions: [],
      configuratorCategories: [],
      compatibilityRules: [],
      installationRequired: false,
      financingAvailable: true,
      insuranceCoverage: 'Standard',
      safetyRating: 'A+',
      adaCompliant: true,
      weightCapacity: 300,
    };

    const mockCategory: ConfiguratorCategory = {
      id: 'category-1',
      name: 'Test Category',
      description: 'Test category description',
      options: [
        {
          id: 'option-1',
          databaseId: 2,
          name: 'Test Option 1',
          slug: 'test-option-1',
          description: 'Test option 1 description',
          shortDescription: 'Test option 1',
          price: 200,
          regularPrice: 200,
          salePrice: null,
          sku: 'OPT-001',
          image: { sourceUrl: '/option1.jpg', altText: 'Option 1' },
          galleryImages: { nodes: [] },
          productSpecifications: '',
          relatedOptions: [],
          configuratorCategories: [],
          compatibilityRules: [],
          installationRequired: false,
          financingAvailable: true,
          insuranceCoverage: 'Standard',
          safetyRating: 'A',
          adaCompliant: true,
          weightCapacity: 250,
        },
        {
          id: 'option-2',
          databaseId: 3,
          name: 'Test Option 2',
          slug: 'test-option-2',
          description: 'Test option 2 description',
          shortDescription: 'Test option 2',
          price: 300,
          regularPrice: 300,
          salePrice: null,
          sku: 'OPT-002',
          image: { sourceUrl: '/option2.jpg', altText: 'Option 2' },
          galleryImages: { nodes: [] },
          productSpecifications: '',
          relatedOptions: [],
          configuratorCategories: [],
          compatibilityRules: [],
          installationRequired: false,
          financingAvailable: true,
          insuranceCoverage: 'Premium',
          safetyRating: 'A+',
          adaCompliant: true,
          weightCapacity: 350,
        },
      ],
    };

    it('should render configurator with categories', () => {
      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[mockCategory]}
        />
      );

      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    it('should handle View Details click for option with slug', () => {
      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[mockCategory]}
        />
      );

      // Click on category to show options
      const categoryButton = screen.getByText('Test Category');
      fireEvent.click(categoryButton);

      // Wait for options to render
      waitFor(() => {
        const viewDetailsButton = screen.getByText('View Details');
        fireEvent.click(viewDetailsButton);

        expect(mockPush).toHaveBeenCalledWith('/product/test-option-1');
      });
    });

    it('should handle View Details click for option without slug', () => {
      const optionWithoutSlug = {
        ...mockCategory.options[0],
        slug: '',
      };

      const categoryWithoutSlug = {
        ...mockCategory,
        options: [optionWithoutSlug],
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[categoryWithoutSlug]}
        />
      );

      // Click on category to show options
      const categoryButton = screen.getByText('Test Category');
      fireEvent.click(categoryButton);

      // Wait for options to render
      waitFor(() => {
        const viewDetailsButton = screen.getByText('View Details');
        fireEvent.click(viewDetailsButton);

        expect(consoleSpy).toHaveBeenCalledWith(
          'Option has no slug for navigation:',
          expect.objectContaining({ slug: '' })
        );
        expect(mockPush).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should handle View Details click for option with null slug', () => {
      const optionWithNullSlug = {
        ...mockCategory.options[0],
        slug: null,
      };

      const categoryWithNullSlug = {
        ...mockCategory,
        options: [optionWithNullSlug],
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[categoryWithNullSlug]}
        />
      );

      // Click on category to show options
      const categoryButton = screen.getByText('Test Category');
      fireEvent.click(categoryButton);

      // Wait for options to render
      waitFor(() => {
        const viewDetailsButton = screen.getByText('View Details');
        fireEvent.click(viewDetailsButton);

        expect(consoleSpy).toHaveBeenCalledWith(
          'Option has no slug for navigation:',
          expect.objectContaining({ slug: null })
        );
        expect(mockPush).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('OptionCard Component', () => {
    const mockOption: ConfigurableProductSchema = {
      id: 'option-1',
      databaseId: 2,
      name: 'Test Option',
      slug: 'test-option',
      description: 'Test option description',
      shortDescription: 'Test option',
      price: 200,
      regularPrice: 200,
      salePrice: null,
      sku: 'OPT-001',
      image: { sourceUrl: '/option.jpg', altText: 'Option' },
      galleryImages: { nodes: [] },
      productSpecifications: '',
      relatedOptions: [],
      configuratorCategories: [],
      compatibilityRules: [],
      installationRequired: false,
      financingAvailable: true,
      insuranceCoverage: 'Standard',
      safetyRating: 'A',
      adaCompliant: true,
      weightCapacity: 250,
    };

    const mockOnViewDetails = jest.fn();

    it('should render View Details button', () => {
      render(
        <OptionCard
          option={mockOption}
          categoryId="category-1"
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButton = screen.getByText('View Details');
      expect(viewDetailsButton).toBeInTheDocument();
    });

    it('should call onViewDetails when View Details button is clicked', () => {
      render(
        <OptionCard
          option={mockOption}
          categoryId="category-1"
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButton = screen.getByText('View Details');
      fireEvent.click(viewDetailsButton);

      expect(mockOnViewDetails).toHaveBeenCalledWith(mockOption);
    });

    it('should handle View Details click with keyboard navigation', () => {
      render(
        <OptionCard
          option={mockOption}
          categoryId="category-1"
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewDetailsButton = screen.getByText('View Details');
      
      // Test Enter key
      fireEvent.keyDown(viewDetailsButton, { key: 'Enter' });
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockOption);

      // Test Space key
      fireEvent.keyDown(viewDetailsButton, { key: ' ' });
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockOption);
    });

    it('should handle Ctrl+D keyboard shortcut for View Details', () => {
      render(
        <OptionCard
          option={mockOption}
          categoryId="category-1"
          onViewDetails={mockOnViewDetails}
        />
      );

      const optionCard = screen.getByRole('article');
      
      // Test Ctrl+D shortcut
      fireEvent.keyDown(optionCard, { key: 'd', ctrlKey: true });
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockOption);
    });

    it('should handle Cmd+D keyboard shortcut for View Details on Mac', () => {
      render(
        <OptionCard
          option={mockOption}
          categoryId="category-1"
          onViewDetails={mockOnViewDetails}
        />
      );

      const optionCard = screen.getByRole('article');
      
      // Test Cmd+D shortcut
      fireEvent.keyDown(optionCard, { key: 'd', metaKey: true });
      expect(mockOnViewDetails).toHaveBeenCalledWith(mockOption);
    });
  });

  describe('Integration Tests', () => {
    it('should navigate to product detail page when View Details is clicked', () => {
      const mockOption: ConfigurableProductSchema = {
        id: 'option-1',
        databaseId: 2,
        name: 'Test Option',
        slug: 'test-option',
        description: 'Test option description',
        shortDescription: 'Test option',
        price: 200,
        regularPrice: 200,
        salePrice: null,
        sku: 'OPT-001',
        image: { sourceUrl: '/option.jpg', altText: 'Option' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A',
        adaCompliant: true,
        weightCapacity: 250,
      };

      const mockCategory: ConfiguratorCategory = {
        id: 'category-1',
        name: 'Test Category',
        description: 'Test category description',
        options: [mockOption],
      };

      const mockBaseModel: ConfigurableProductSchema = {
        id: 'base-model-1',
        databaseId: 1,
        name: 'Test Base Model',
        slug: 'test-base-model',
        description: 'Test base model description',
        shortDescription: 'Test base model',
        price: 1000,
        regularPrice: 1000,
        salePrice: null,
        sku: 'BASE-001',
        image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A+',
        adaCompliant: true,
        weightCapacity: 300,
      };

      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[mockCategory]}
        />
      );

      // Click on category to show options
      const categoryButton = screen.getByText('Test Category');
      fireEvent.click(categoryButton);

      // Wait for options to render and click View Details
      waitFor(() => {
        const viewDetailsButton = screen.getByText('View Details');
        fireEvent.click(viewDetailsButton);

        expect(mockPush).toHaveBeenCalledWith('/product/test-option');
      });
    });

    it('should handle multiple View Details clicks correctly', () => {
      const mockOptions: ConfigurableProductSchema[] = [
        {
          id: 'option-1',
          databaseId: 2,
          name: 'Test Option 1',
          slug: 'test-option-1',
          description: 'Test option 1 description',
          shortDescription: 'Test option 1',
          price: 200,
          regularPrice: 200,
          salePrice: null,
          sku: 'OPT-001',
          image: { sourceUrl: '/option1.jpg', altText: 'Option 1' },
          galleryImages: { nodes: [] },
          productSpecifications: '',
          relatedOptions: [],
          configuratorCategories: [],
          compatibilityRules: [],
          installationRequired: false,
          financingAvailable: true,
          insuranceCoverage: 'Standard',
          safetyRating: 'A',
          adaCompliant: true,
          weightCapacity: 250,
        },
        {
          id: 'option-2',
          databaseId: 3,
          name: 'Test Option 2',
          slug: 'test-option-2',
          description: 'Test option 2 description',
          shortDescription: 'Test option 2',
          price: 300,
          regularPrice: 300,
          salePrice: null,
          sku: 'OPT-002',
          image: { sourceUrl: '/option2.jpg', altText: 'Option 2' },
          galleryImages: { nodes: [] },
          productSpecifications: '',
          relatedOptions: [],
          configuratorCategories: [],
          compatibilityRules: [],
          installationRequired: false,
          financingAvailable: true,
          insuranceCoverage: 'Premium',
          safetyRating: 'A+',
          adaCompliant: true,
          weightCapacity: 350,
        },
      ];

      const mockCategory: ConfiguratorCategory = {
        id: 'category-1',
        name: 'Test Category',
        description: 'Test category description',
        options: mockOptions,
      };

      const mockBaseModel: ConfigurableProductSchema = {
        id: 'base-model-1',
        databaseId: 1,
        name: 'Test Base Model',
        slug: 'test-base-model',
        description: 'Test base model description',
        shortDescription: 'Test base model',
        price: 1000,
        regularPrice: 1000,
        salePrice: null,
        sku: 'BASE-001',
        image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A+',
        adaCompliant: true,
        weightCapacity: 300,
      };

      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[mockCategory]}
        />
      );

      // Click on category to show options
      const categoryButton = screen.getByText('Test Category');
      fireEvent.click(categoryButton);

      // Wait for options to render
      waitFor(() => {
        const viewDetailsButtons = screen.getAllByText('View Details');
        
        // Click first View Details button
        fireEvent.click(viewDetailsButtons[0]);
        expect(mockPush).toHaveBeenCalledWith('/product/test-option-1');
        
        // Click second View Details button
        fireEvent.click(viewDetailsButtons[1]);
        expect(mockPush).toHaveBeenCalledWith('/product/test-option-2');
        
        expect(mockPush).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle router navigation errors gracefully', () => {
      const mockRouterWithError = {
        push: jest.fn().mockRejectedValue(new Error('Navigation failed')),
        asPath: '/product/test-product/configure',
      };
      (useRouter as jest.Mock).mockReturnValue(mockRouterWithError);

      const mockOption: ConfigurableProductSchema = {
        id: 'option-1',
        databaseId: 2,
        name: 'Test Option',
        slug: 'test-option',
        description: 'Test option description',
        shortDescription: 'Test option',
        price: 200,
        regularPrice: 200,
        salePrice: null,
        sku: 'OPT-001',
        image: { sourceUrl: '/option.jpg', altText: 'Option' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A',
        adaCompliant: true,
        weightCapacity: 250,
      };

      const mockCategory: ConfiguratorCategory = {
        id: 'category-1',
        name: 'Test Category',
        description: 'Test category description',
        options: [mockOption],
      };

      const mockBaseModel: ConfigurableProductSchema = {
        id: 'base-model-1',
        databaseId: 1,
        name: 'Test Base Model',
        slug: 'test-base-model',
        description: 'Test base model description',
        shortDescription: 'Test base model',
        price: 1000,
        regularPrice: 1000,
        salePrice: null,
        sku: 'BASE-001',
        image: { sourceUrl: '/test-image.jpg', altText: 'Test image' },
        galleryImages: { nodes: [] },
        productSpecifications: '',
        relatedOptions: [],
        configuratorCategories: [],
        compatibilityRules: [],
        installationRequired: false,
        financingAvailable: true,
        insuranceCoverage: 'Standard',
        safetyRating: 'A+',
        adaCompliant: true,
        weightCapacity: 300,
      };

      render(
        <ModelConfigurator
          baseModel={mockBaseModel}
          categories={[mockCategory]}
        />
      );

      // Click on category to show options
      const categoryButton = screen.getByText('Test Category');
      fireEvent.click(categoryButton);

      // Wait for options to render and click View Details
      waitFor(() => {
        const viewDetailsButton = screen.getByText('View Details');
        
        // Should not throw error when navigation fails
        expect(() => fireEvent.click(viewDetailsButton)).not.toThrow();
      });
    });
  });
});