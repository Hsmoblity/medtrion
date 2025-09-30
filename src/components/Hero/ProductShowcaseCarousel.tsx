import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '../ui';

interface ProductShowcaseCarouselProps {
  products: string[]; // Product slugs
  currentSlide: number;
  onSlideChange: (slide: number) => void;
}

// Mock product data - will be replaced with real product data
const mockProducts = [
  {
    slug: 'acorn-stairlifts-acorn-180-curved-stairlift',
    title: 'Acorn Curved Stairlifts',
    description: 'A comfortable and reliable ride designed for any curved staircases',
    image: '/180-stairlift-moving.png',
    price: 'From $3,495',
    badge: 'Most Popular'
  },
  {
    slug: 'acorn-stairlifts-acorn-130-straight-stairlift',
    title: 'Acorn Straight Stairlifts',
    description: 'The ultimate staircase solution, giving you the full use of the home you love.',
    image: '/130-stairlift-hinge.jpg',
    price: 'From $2,995',
    badge: 'Best Value'
  },
  {
    slug: 'acorn-stairlifts-outdoor-stairlift',
    title: 'Acorn Outdoor Stairlifts',
    description: 'Open up and enjoy your outdoor space with Acorn Stairlifts.',
    image: '/acorn-outdoor-stair-lift-uk.jpg',
    price: 'From $4,495',
    badge: 'Premium'
  }
];

const ProductShowcaseCarousel: React.FC<ProductShowcaseCarouselProps> = ({
  products,
  currentSlide,
  onSlideChange
}) => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      onSlideChange((currentSlide + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, products.length, onSlideChange, isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const currentProduct = mockProducts[currentSlide] || mockProducts[0];

  return (
    <div 
      className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Product Display */}
      <div className="relative h-[450px] md:h-[500px] lg:h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="relative h-full"
          >
            {/* Product Image */}
            <div className="relative h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden">
              <Image
                src={currentProduct.image}
                alt={currentProduct.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority={currentSlide === 0}
              />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentProduct.badge}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                {currentProduct.title}
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 line-clamp-2 text-sm md:text-base">
                {currentProduct.description}
              </p>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  {currentProduct.price}
                </span>
              </div>
              <PrimaryButton 
                href={`/product/${currentProduct.slug}`}
                className="w-full text-sm md:text-base py-3 md:py-4"
              >
                View Details
              </PrimaryButton>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 md:mt-8 space-x-3">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-blue-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => onSlideChange((currentSlide - 1 + products.length) % products.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg transition-all duration-200"
        aria-label="Previous product"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={() => onSlideChange((currentSlide + 1) % products.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg transition-all duration-200"
        aria-label="Next product"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default ProductShowcaseCarousel;
