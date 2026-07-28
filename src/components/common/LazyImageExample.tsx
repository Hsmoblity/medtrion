import React from 'react';
import LazyImage from './LazyImage';

// Example component showing how to use LazyImage in place of regular img tags
const LazyImageExample: React.FC = () => {
  const productImages = [
    {
      src: 'https://picsum.photos/400/300?random=1',
      alt: 'Product image 1',
      title: 'VivaLift Ultra PLR4955S Lift Chair'
    },
    {
      src: 'https://picsum.photos/400/300?random=2',
      alt: 'Product image 2',
      title: 'Acorn Stairlift - Basic Model'
    },
    {
      src: 'https://picsum.photos/400/300?random=3',
      alt: 'Product image 3',
      title: 'Pride Mobility Scooter LX'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        LazyImage Component Usage Examples
      </h2>
      
      {/* Hero Image with Priority Loading */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Hero Image (Priority Loading)
        </h3>
        <LazyImage
          src="https://picsum.photos/800/400?random=hero"
          alt="Hero image for mobility products"
          width={800}
          height={400}
          priority={true}
          className="w-full rounded-lg shadow-lg"
          placeholder="shimmer"
        />
      </div>

      {/* Product Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Product Grid (Lazy Loading)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productImages.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <LazyImage
                src={product.src}
                alt={product.alt}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
                placeholder="shimmer"
                threshold={0.1}
                rootMargin="50px"
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-900">{product.title}</h4>
                <p className="text-sm text-gray-600 mt-2">
                  Scroll to see lazy-loading in action
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Handling Example */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Error Handling Example
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <LazyImage
              src="https://invalid-url-that-will-fail.com/image.jpg"
              alt="Image that will fail to load"
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              placeholder="shimmer"
            />
            <div className="p-4">
              <h4 className="font-semibold text-gray-900">Failed Image</h4>
              <p className="text-sm text-gray-600 mt-2">
                This image will fail to load and show the placeholder
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <LazyImage
              src={null}
              alt="Image with null source"
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              placeholder="shimmer"
            />
            <div className="p-4">
              <h4 className="font-semibold text-gray-900">Null Source</h4>
              <p className="text-sm text-gray-600 mt-2">
                This image has a null source and shows the placeholder
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Benefits */}
      <div className="bg-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-brand-dark mb-4">
          Performance Benefits
        </h3>
        <ul className="space-y-2 text-brand-dark">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Images only load when they enter the viewport
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Shimmer placeholder maintains layout stability
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Smooth fade-in transitions improve user experience
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Automatic fallback for failed image loads
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Configurable loading behavior for different use cases
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LazyImageExample;