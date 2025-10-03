import React, { useEffect, useState } from 'react';
import { ProductSchema } from '../../lib/interfaces';
import { getProducts } from '../../lib/contentful/contentful';
import { PrimaryButton, LoadingOverlay } from 'components/ui';
import ProductCard from '../ui/ProductCard';
import { mapToProductCardView } from '../../lib/interfaces/homepage';
import Link from 'next/link';

interface BestSellerSectionProps {
  initialProducts?: ProductSchema[];
}

const BestSellerSection: React.FC<BestSellerSectionProps> = ({ initialProducts = [] }) => {
  const [products, setProducts] = useState<ProductSchema[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      if (initialProducts.length > 0) return; // Use initial products if provided
      
      setLoading(true);
      try {
        const response = await getProducts("");
        if (response.error) {
          setError(response.error);
        } else {
          // Filter for featured/best seller products or take first 6
          const bestSellers = Array.isArray(response.items) 
            ? response.items.slice(0, 6) 
            : [];
          setProducts(bestSellers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [initialProducts]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Best Sellers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular mobility solutions, trusted by thousands of customers.
            </p>
          </div>
          <LoadingOverlay
            show={true}
            variant="skeleton"
            skeletonCount={6}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            ariaLabel="Loading best seller products"
          />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Best Sellers
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-yellow-700">Unable to load products at this time.</p>
              <p className="text-sm text-yellow-600 mt-2">Please try again later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Best Sellers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular mobility solutions, trusted by thousands of customers worldwide.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => {
            // Convert ProductSchema to ProductCardView format
            const productCardView = mapToProductCardView(product);
            
            // Add Best Seller badge to first 2 products
            if (index < 2) {
              productCardView.badges = ['Best Seller'];
            }

            return (
              <ProductCard 
                key={product.slug || index}
                product={productCardView}
                variant="hero"
                priority={index < 3} // Priority loading for first 3 images
                position={index}
                showConfigureButton={false}
                showAddToCartButton={false}
                cardClickBehavior="configurator"
                onHeroClick={(slug, badge, position) => {
                  // Analytics tracking
                  if (typeof window !== 'undefined') {
                    try {
                      const gtag = (window as any).gtag;
                      if (gtag) {
                        gtag('event', 'best_seller_click', {
                          product_slug: slug,
                          badge: badge,
                          position: position,
                          section: 'best_sellers'
                        });
                      }
                    } catch (error) {
                      console.warn('Analytics tracking failed:', error);
                    }
                  }
                  console.log('Best seller clicked:', { slug, badge, position });
                }}
              />
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <PrimaryButton 
            href="/products"
            size="lg"
          >
            View All Products
            <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};

export default BestSellerSection;