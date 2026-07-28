import React, { useState, useEffect } from 'react';
import { ConfigurableProductSchema } from 'lib/interfaces';
import OptionVariationCard from 'components/configurator/OptionVariationCard';

// Debug page to test variation images
const VariationImagesDebug: React.FC = () => {
  const [products, setProducts] = useState<ConfigurableProductSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch some products with variations to test
    const fetchTestData = async () => {
      try {
        setLoading(true);
        
        // You can replace this with actual API call
        // For now, we'll create mock data to test the component
        const mockProducts: ConfigurableProductSchema[] = [
          {
            id: 'test-1',
            databaseId: 1,
            name: 'Test Option 1',
            title: 'Test Option 1',
            slug: 'test-option-1',
            description: 'This is a test option for debugging variation images',
            shortDescription: 'Test option for debugging',
            price: 100,
            affiliate: false,
            featuredImage: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Option+Image',
            productSpecifications: 'Test specifications for debugging purposes',
            productPictures: [],
            image: {
              sourceUrl: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Option+Image',
              altText: 'Test Option 1'
            },
            variations: [
              {
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
              },
              {
                id: 'var-2',
                databaseId: 102,
                name: 'Variation 2',
                price: 75,
                sku: 'VAR-002',
                // No image - should fall back to option image
                attributes: [
                  { id: 'attr-2', name: 'Color', value: 'Blue' }
                ]
              },
              {
                id: 'var-3',
                databaseId: 103,
                name: 'Variation 3',
                price: 0,
                sku: 'VAR-003',
                image: {
                  sourceUrl: 'https://invalid-url-that-will-fail.com/image.jpg',
                  altText: 'Invalid Image'
                },
                attributes: [
                  { id: 'attr-3', name: 'Color', value: 'Green' }
                ]
              }
            ]
          }
        ];
        
        setProducts(mockProducts);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Variation Images Debug
          </h1>
          <p className="text-gray-600">
            Testing variation card image rendering with different scenarios
          </p>
        </div>

        {products.map((product) => (
          <div key={product.id} className="mb-12">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {product.name}
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  Option Image:
                </h3>
                {product.image ? (
                  <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image.sourceUrl}
                      alt={product.image.altText}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No option image</span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  Variations ({product.variations?.length || 0}):
                </h3>
                
                {product.variations && product.variations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {product.variations.map((variation) => (
                      <div key={variation.id} className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {variation.name}
                        </h4>
                        
                        <div className="mb-3">
                          <OptionVariationCard
                            variation={variation}
                            option={product}
                            isSelected={false}
                            selectionType="radio"
                            variant="compact"
                            size="small"
                            showImage={true}
                            showPrice={true}
                            showAttributes={true}
                            showStockStatus={false}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <div>ID: {variation.id}</div>
                          <div>SKU: {variation.sku}</div>
                          <div>Price: ${variation.price}</div>
                          <div>Has Image: {variation.image ? 'Yes' : 'No'}</div>
                          {variation.image && (
                            <div>Image URL: {variation.image.sourceUrl}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No variations available</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariationImagesDebug;