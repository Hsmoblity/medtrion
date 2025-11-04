import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHomepageStore } from '../../stores/homepageStore';
import ProductCard from '../ui/ProductCard';
import { useProductFilters } from '../../lib/hooks/useProductFilters';
import { getFeatureFlag } from '../../lib/featureFlags';
import { mapToProductCardView } from '../../lib/interfaces/homepage';

interface TopProductsStripProps {
  enableShowcase?: boolean; // Feature flag support
}

const TopProductsStrip: React.FC<TopProductsStripProps> = ({ enableShowcase = true }) => {
  const { featuredProducts, loading, error, fetchFeaturedProducts } = useHomepageStore();
  const [showFilters, setShowFilters] = useState(false);
  
  // Check if enhanced features are enabled
  const enhancedFeaturesEnabled = getFeatureFlag('homepage_enhanced_products');
  
  // Use product filters hook
  const {
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    totalCount,
    filteredCount
  } = useProductFilters({ products: featuredProducts });

  // Analytics handlers
  const handleHeroProductClick = (productSlug: string, badge: string, position: number) => {
    // Track hero product click event
    if (typeof window !== 'undefined') {
      // Try to send to analytics if available
      try {
        const gtag = (window as any).gtag;
        if (gtag) {
          gtag('event', 'hero_product_click', {
            product_slug: productSlug,
            badge: badge,
            position: position
          });
        }
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }
    
    // Console log for development
    console.log('Hero product clicked:', { productSlug, badge, position });
  };

  // Re-enabled: Product fetching with proper dependency to prevent infinite loop
  useEffect(() => {
    if (enableShowcase && featuredProducts.length === 0 && !loading && !error) {
      console.log('TopProductsStrip: Fetching featured products...');
      fetchFeaturedProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableShowcase]); // ✅ Only depend on enableShowcase to prevent infinite loop

  useEffect(() => {
    if (featuredProducts.length > 0) {
      console.log('Featured Products loaded:', featuredProducts.length);
    }
  }, [featuredProducts]);

  // Don't render if feature flag is disabled
  if (!enableShowcase) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Products</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-gray-200 h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Fallback to static content when API fails
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our top-rated mobility solutions, carefully selected for quality and customer satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Static Product Cards */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Acorn Stairlift</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Acorn 180 Curved Stairlift</h3>
                <p className="text-gray-600 text-sm mb-3">Premium curved stairlift solution</p>
                <a href="/product/acorn-stairlifts-acorn-180-curved-stairlift" className="text-blue-600 hover:text-blue-800 font-medium">
                  Learn More →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Mobility Aid</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Mobility Solutions</h3>
                <p className="text-gray-600 text-sm mb-3">Professional mobility equipment</p>
                <a href="/#contact-us" className="text-blue-600 hover:text-blue-800 font-medium">
                  Get Quote →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Support</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Expert Installation</h3>
                <p className="text-gray-600 text-sm mb-3">Professional setup and support</p>
                <a href="/#contact-us" className="text-blue-600 hover:text-blue-800 font-medium">
                  Contact Us →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Warranty</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">5-Year Warranty</h3>
                <p className="text-gray-600 text-sm mb-3">Comprehensive coverage included</p>
                <a href="/#faq" className="text-blue-600 hover:text-blue-800 font-medium">
                  Learn More →
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <button
              onClick={() => {
                console.log('TopProductsStrip: Retrying fetch...');
                fetchFeaturedProducts();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Load Live Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    // Show static content when no products are loaded
    return (
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our top-rated mobility solutions, carefully selected for quality and customer satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-blue-800 font-semibold">Acorn Stairlift</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Acorn 180 Curved Stairlift</h3>
                <p className="text-gray-600 text-sm mb-3">Premium curved stairlift solution for any staircase</p>
                <a href="/product/acorn-stairlifts-acorn-180-curved-stairlift" className="text-blue-600 hover:text-blue-800 font-medium">
                  Learn More →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-green-800 font-semibold">Mobility Aid</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Professional Installation</h3>
                <p className="text-gray-600 text-sm mb-3">Expert setup and configuration by certified technicians</p>
                <a href="/#contact-us" className="text-blue-600 hover:text-blue-800 font-medium">
                  Get Quote →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-purple-800 font-semibold">24/7 Support</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
                <p className="text-gray-600 text-sm mb-3">Round-the-clock customer service and technical support</p>
                <a href="/#contact-us" className="text-blue-600 hover:text-blue-800 font-medium">
                  Contact Us →
                </a>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                <span className="text-yellow-800 font-semibold">5-Year Warranty</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Comprehensive Warranty</h3>
                <p className="text-gray-600 text-sm mb-3">Complete protection and peace of mind included</p>
                <a href="/#faq" className="text-blue-600 hover:text-blue-800 font-medium">
                  Learn More →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our top-rated mobility solutions, carefully selected for quality and customer satisfaction.
          </p>
        </motion.div>

        {/* Enhanced Features - Filters and Controls */}
        {enhancedFeaturesEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                
                <div className="text-sm text-gray-600">
                  Showing {filteredCount} of {totalCount} products
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg shadow-sm p-4 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSortBy('newest');
                      }}
                      className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Products Grid */}
        {enhancedFeaturesEnabled ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}
          >
            {filteredProducts.slice(0, 8).map((product, index) => (
              <ProductCard
                key={product.databaseId || product.slug || index}
                product={product}
                variant="enhanced"
                index={index}
                priority={index === 0}
                onHeroClick={handleHeroProductClick}
                position={index}
                showConfigureButton={false}
                showAddToCartButton={false}
                cardClickBehavior="configurator"
              />
            ))}
          </motion.div>
        ) : (
          <>
            {/* Desktop: Grid layout, Mobile: Horizontal scroll */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <ProductCard 
                  key={product.databaseId || product.slug || index} 
                  product={product} 
                  variant="hero"
                  priority={index === 0}
                  onHeroClick={handleHeroProductClick}
                  position={index}
                  showConfigureButton={false}
                  showAddToCartButton={false}
                  cardClickBehavior="configurator"
                />
              ))}
            </div>
            
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <div key={product.databaseId || product.slug || index} className="flex-none w-72">
                    <ProductCard 
                      product={product} 
                      variant="hero"
                      priority={index === 0}
                      onHeroClick={handleHeroProductClick}
                      position={index}
                      showConfigureButton={false}
                      showAddToCartButton={false}
                      cardClickBehavior="configurator"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TopProductsStrip;
