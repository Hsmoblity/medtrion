import React, { useEffect } from 'react';
import { useHomepageStore } from '../../stores/homepageStore';
import ProductHeroCard from './ProductHeroCard';

interface TopProductsStripProps {
  enableShowcase?: boolean; // Feature flag support
}

const TopProductsStrip: React.FC<TopProductsStripProps> = ({ enableShowcase = true }) => {
  const { featuredProducts, loading, error, fetchFeaturedProducts } = useHomepageStore();

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

  useEffect(() => {
    if (enableShowcase) {
      fetchFeaturedProducts();
    }
  }, [fetchFeaturedProducts, enableShowcase]);

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
    return (
      <div className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Top Products</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our top-rated mobility solutions, carefully selected for quality and customer satisfaction.
          </p>
        </div>
        
        {/* Desktop: Grid layout, Mobile: Horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product, index) => (
            <ProductHeroCard 
              key={product.databaseId || product.slug || index} 
              product={product} 
              priority={index === 0}
              onHeroClick={handleHeroProductClick}
              position={index}
            />
          ))}
        </div>
        
        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <div key={product.databaseId || product.slug || index} className="flex-none w-72">
                <ProductHeroCard 
                  product={product} 
                  priority={index === 0}
                  onHeroClick={handleHeroProductClick}
                  position={index}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopProductsStrip;
