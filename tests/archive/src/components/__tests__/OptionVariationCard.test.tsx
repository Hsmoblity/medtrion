/**
 * Tests for OptionVariationCard component
 * 
 * Tests image rendering and fallback logic for variation cards
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OptionVariationCard from '../configurator/OptionVariationCard';
import { ConfigurableProductSchema } from '../../../lib/interfaces';

// Mock the OptionImage component
jest.mock('../configurator/OptionImage', () => {
  return function MockOptionImage({ src, alt, placeholderType }: any) {
    if (!src) {
      return (
        <div data-testid="placeholder-image" data-placeholder-type={placeholderType}>
          {alt} - Placeholder
        </div>
      );
    }
    return (
      <img 
        data-testid="variation-image" 
        src={src} 
        alt={alt}
        data-placeholder-type={placeholderType}
      />
    );
  };
});

describe('OptionVariationCard', () => {
  const mockOption: ConfigurableProductSchema = {
    id: 'option-1',
    name: 'Test Option',
    price: 100,
    variations: [],
    options: [],
    _related_options: [],
    _related_options_products: [],
    productSpecifications: '',
    globalAttributes: [],
    localAttributes: [],
    __typename: 'SimpleProduct'
  };

  describe('Image Rendering', () => {
    it('should render image with proper sourceUrl and altText', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Red Variation',
        price: 20,
        sku: 'RED-001',
        image: {
          sourceUrl: 'https://example.com/red-variation.jpg',
          altText: 'Red variation product image'
        },
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const image = screen.getByTestId('variation-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/red-variation.jpg');
      expect(image).toHaveAttribute('alt', 'Red variation product image');
    });

    it('should use variation name as alt text when altText is missing', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Blue Variation',
        price: 20,
        sku: 'BLUE-001',
        image: {
          sourceUrl: 'https://example.com/blue-variation.jpg',
          altText: ''
        },
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const image = screen.getByTestId('variation-image');
      expect(image).toHaveAttribute('alt', 'Blue Variation');
    });

    it('should show placeholder when image is missing', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'No Image Variation',
        price: 20,
        sku: 'NO-IMG-001',
        image: undefined,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const placeholder = screen.getByTestId('placeholder-image');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveAttribute('data-placeholder-type', 'option');
      expect(placeholder).toHaveTextContent('No Image Variation - Placeholder');
    });

    it('should show placeholder when image sourceUrl is empty', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Empty Image Variation',
        price: 20,
        sku: 'EMPTY-001',
        image: {
          sourceUrl: '',
          altText: 'Empty image'
        },
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const placeholder = screen.getByTestId('placeholder-image');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveTextContent('Empty Image Variation - Placeholder');
    });

    it('should use fallback alt text when both altText and name are missing', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: '',
        price: 20,
        sku: 'NO-NAME-001',
        image: {
          sourceUrl: 'https://example.com/image.jpg',
          altText: ''
        },
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const image = screen.getByTestId('variation-image');
      expect(image).toHaveAttribute('alt', 'Product variation');
    });
  });

  describe('Component Structure', () => {
    it('should render variation name correctly', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Test Variation',
        price: 20,
        sku: 'TEST-001',
        image: undefined,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      expect(screen.getByText('Test Variation')).toBeInTheDocument();
    });

    it('should render price correctly', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Test Variation',
        price: 25,
        sku: 'TEST-001',
        image: undefined,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      expect(screen.getByText('+$25')).toBeInTheDocument();
    });

    it('should render SKU correctly', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Test Variation',
        price: 20,
        sku: 'TEST-SKU-001',
        image: undefined,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      expect(screen.getByText('SKU: TEST-SKU-001')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Test Variation',
        price: 20,
        sku: 'TEST-001',
        image: undefined,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={false}
          selectionType="radio"
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'false');
      expect(card).toHaveAttribute('aria-disabled', 'false');
      expect(card).toHaveAttribute('aria-label', 'Test Variation, +$20, not selected');
    });

    it('should have proper ARIA attributes when selected', () => {
      const variation = {
        id: 'variation-1',
        databaseId: 101,
        name: 'Test Variation',
        price: 20,
        sku: 'TEST-001',
        image: undefined,
        attributes: []
      };

      render(
        <OptionVariationCard
          variation={variation}
          option={mockOption}
          isSelected={true}
          selectionType="radio"
        />
      );

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-pressed', 'true');
      expect(card).toHaveAttribute('aria-label', 'Test Variation, +$20, selected');
    });
  });
});