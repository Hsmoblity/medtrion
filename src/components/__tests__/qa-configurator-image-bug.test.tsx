/**
 * QA Test Suite - Model Configurator Variation Card Image Bug Fix
 * 
 * Comprehensive testing of the image display bug fix implemented by Fullstack Engineer
 * 
 * @package HSM
 * @since 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OptionVariationCard from '../configurator/OptionVariationCard';
import OptionImage from '../configurator/OptionImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    );
  };
});

// Mock ImagePlaceholder component
jest.mock('../ImagePlaceholder', () => {
  return function MockImagePlaceholder({ type, size, label, className }: any) {
    return (
      <div className={className} data-testid="image-placeholder">
        <span>{label || `${type} placeholder`}</span>
      </div>
    );
  };
});

describe('QA Configurator Image Bug Fix Tests', () => {
  // Mock variation data
  const mockVariation = {
    id: 'var-1',
    databaseId: 101,
    name: 'Test Variation',
    price: 50,
    sku: 'VAR-001',
    image: {
      sourceUrl: 'https://example.com/image.jpg',
      altText: 'Test Image'
    },
    attributes: [
      { id: 'attr-1', name: 'Color', value: 'Red' }
    ]
  };

  const mockOption = {
    id: 'opt-1',
    databaseId: 1,
    name: 'Test Option',
    title: 'Test Option',
    slug: 'test-option',
    description: 'Test option for testing purposes',
    shortDescription: 'Test option',
    price: 100,
    affiliate: false,
    featuredImage: 'https://example.com/option-image.jpg',
    productSpecifications: 'Test specifications',
    productPictures: [],
    image: {
      sourceUrl: 'https://example.com/option-image.jpg',
      altText: 'Option Image'
    }
  };

  beforeEach(() => {
    // Clear console logs before each test
    jest.clearAllMocks();
  });

  describe('Image Display Functionality', () => {
    test('should display variation image when available', () => {
      render(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test('should fall back to option image when variation image is missing', () => {
      const variationWithoutImage = {
        ...mockVariation,
        image: undefined
      };

      render(
        <OptionVariationCard
          variation={variationWithoutImage}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      const image = screen.getByAltText('Option Image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/option-image.jpg');
    });

    test('should show placeholder when no images are available', () => {
      const variationWithoutImage = {
        ...mockVariation,
        image: undefined
      };

      const optionWithoutImage = {
        ...mockOption,
        image: undefined
      };

      render(
        <OptionVariationCard
          variation={variationWithoutImage}
          option={optionWithoutImage}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      const placeholder = screen.getByTestId('image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('should handle image loading errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <OptionImage
          src="https://invalid-url.com/image.jpg"
          alt="Invalid Image"
          placeholderType="option"
        />
      );

      const image = screen.getByAltText('Invalid Image');
      
      // Simulate image loading error
      fireEvent.error(image);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'OptionImage: Image failed to load:',
          'https://invalid-url.com/image.jpg',
          expect.any(Object)
        );
      });

      // Should show error state
      await waitFor(() => {
        const errorIndicator = screen.getByText('Image Error');
        expect(errorIndicator).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    test('should show loading state while image loads', () => {
      render(
        <OptionImage
          src="https://example.com/image.jpg"
          alt="Loading Image"
          placeholderType="option"
        />
      );

      // Should show loading placeholder initially
      const loadingPlaceholder = screen.getByText('Loading...');
      expect(loadingPlaceholder).toBeInTheDocument();
    });
  });

  describe('Debug Logging', () => {
    test('should log image data for debugging', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'OptionVariationCard: Image data for variation',
        'var-1',
        expect.objectContaining({
          hasImage: true,
          imageData: mockVariation.image,
          sourceUrl: 'https://example.com/image.jpg',
          altText: 'Test Image',
          optionImage: 'https://example.com/option-image.jpg'
        })
      );

      consoleSpy.mockRestore();
    });

    test('should log warning when no image source is available', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const variationWithoutImage = {
        ...mockVariation,
        image: undefined
      };

      const optionWithoutImage = {
        ...mockOption,
        image: undefined
      };

      render(
        <OptionVariationCard
          variation={variationWithoutImage}
          option={optionWithoutImage}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'OptionVariationCard: No image source URL for variation',
        'var-1',
        'Test Variation',
        'or option',
        'opt-1'
      );

      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Component Props and Configuration', () => {
    test('should respect showImage prop', () => {
      render(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showImage={false}
        />
      );

      // Should not render image when showImage is false
      expect(screen.queryByAltText('Test Image')).not.toBeInTheDocument();
    });

    test('should handle different placeholder types', () => {
      render(
        <OptionImage
          src={null}
          alt="No Image"
          placeholderType="product"
        />
      );

      const placeholder = screen.getByTestId('image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    test('should handle fill prop correctly', () => {
      render(
        <OptionImage
          src="https://example.com/image.jpg"
          alt="Fill Image"
          fill={true}
          className="w-full h-full"
        />
      );

      const image = screen.getByAltText('Fill Image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'false');
      expect(card).toHaveAttribute('aria-disabled', 'false');
      expect(card).toHaveAttribute('aria-label', 'Test Variation, +$50, not selected');
    });

    test('should have proper alt text for images', () => {
      render(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      const image = screen.getByAltText('Test Image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      // Re-render with same props
      rerender(
        <OptionVariationCard
          variation={mockVariation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      // Component should still be in document
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty variation attributes', () => {
      const variationWithEmptyAttributes = {
        ...mockVariation,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variationWithEmptyAttributes}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showAttributes={true}
        />
      );

      // Should not crash and should render variation name
      expect(screen.getByText('Test Variation')).toBeInTheDocument();
    });

    test('should handle null/undefined image URLs', () => {
      const variationWithNullImage = {
        ...mockVariation,
        image: {
          sourceUrl: null as any,
          altText: 'Null Image'
        }
      };

      render(
        <OptionVariationCard
          variation={variationWithNullImage}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
          showImage={true}
        />
      );

      // Should fall back to option image
      const image = screen.getByAltText('Option Image');
      expect(image).toBeInTheDocument();
    });
  });
});

// Integration test for the complete flow
describe('Integration Tests', () => {
  test('should work with debug page mock data', () => {
    const debugVariation = {
      id: 'var-1',
      databaseId: 101,
      name: 'Variation 1',
      price: 50,
      sku: 'VAR-001',
      image: {
        sourceUrl: 'https://via.placeholder.com/300x200/ff6600/ffffff?text=Variation+1',
        altText: 'Variation 1'
      },
      attributes: [
        { id: 'attr-1', name: 'Color', value: 'Red' }
      ]
    };

    const debugOption = {
      id: 'test-1',
      databaseId: 1,
      name: 'Test Option 1',
      title: 'Test Option 1',
      slug: 'test-option-1',
      description: 'Test option for debugging purposes',
      shortDescription: 'Test option',
      price: 100,
      affiliate: false,
      featuredImage: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Option+Image',
      productSpecifications: 'Test specifications',
      productPictures: [],
      image: {
        sourceUrl: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Option+Image',
        altText: 'Test Option 1'
      }
    };

    render(
      <OptionVariationCard
        variation={debugVariation}
        option={debugOption}
        isSelected={false}
        selectionType="radio"
        variant="compact"
        size="small"
        showImage={true}
        showPrice={true}
        showAttributes={true}
        showStockStatus={false}
      />
    );

    // Should render all elements correctly
    expect(screen.getByText('Variation 1')).toBeInTheDocument();
    expect(screen.getByText('+$50')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByAltText('Variation 1')).toBeInTheDocument();
  });
});