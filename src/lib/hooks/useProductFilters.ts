import { useState, useMemo } from 'react';
import { ProductCardView } from '../interfaces/homepage';

export type ViewMode = 'grid' | 'list';
export type SortOption = 'price-low' | 'price-high' | 'rating' | 'name' | 'newest';

interface UseProductFiltersProps {
  products: ProductCardView[];
}

export const useProductFilters = ({ products }: UseProductFiltersProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return 0; // Keep original order for newest
      }
    });

    return sorted;
  }, [products, searchQuery, sortBy]);

  return {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    filteredProducts: filteredAndSortedProducts,
    totalCount: products.length,
    filteredCount: filteredAndSortedProducts.length
  };
};
