import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '../ui';
import { ProductCardView } from '../../lib/interfaces/homepage';
import { useHomepageStore } from '../../stores/homepageStore';
import { sanitizeHtml } from '../../lib/utils/html-sanitizer';

interface ProductShowcaseCarouselProps {
  products: string[]; // Product slugs
  currentSlide: number;
  onSlideChange: (slide: number) => void;
}

// Fallback mock product data for error states with reliable image URLs
const mockProducts = [
  {
    slug: 'acorn-stairlifts-acorn-180-curved-stairlift',
    title: 'Acorn Curved Stairlifts',
    description: 'A comfortable and reliable ride designed for any curved staircases',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80',
    price: 'From $3,495',
    badge: 'Most Popular'
  },
  {
    slug: 'acorn-stairlifts-acorn-130-straight-stairlift',
    title: 'Acorn Straight Stairlifts',
    description: 'The ultimate staircase solution, giving you the full use of the home you love.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    price: 'From $2,995',
    badge: 'Best Value'
  },
  {
    slug: 'acorn-stairlifts-outdoor-stairlift',
    title: 'Acorn Outdoor Stairlifts',
    description: 'Open up and enjoy your outdoor space with Acorn Stairlifts.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    price: 'From $4,495',
    badge: 'Premium'
  }
];

// Fallback images for different product types
const fallbackImages = [
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&q=80', // Home accessibility
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop&q=80', // Senior mobility
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80', // Home safety/stairs
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80', // Equipment/tools
];

// Helper function to validate image URL
const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Helper function to transform ProductCardView to carousel format
const transformProductForCarousel = (product: ProductCardView, index: number) => {
  const badges = ['Most Popular', 'Best Value', 'Premium', 'Featured'];
  const badge = badges[index % badges.length];
  
  // Get image with fallback - use imageUrl field from ProductCardView
  let imageUrl = product.imageUrl;
  console.log('Hero Slider - Image processing:', {
    originalImageUrl: product.imageUrl,
    isValid: isValidImageUrl(imageUrl),
    index
  });
  
  if (!isValidImageUrl(imageUrl)) {
    // Use fallback image based on index
    imageUrl = fallbackImages[index % fallbackImages.length];
    console.log('Hero Slider - Using fallback image:', imageUrl);
  }
  
  return {
    slug: product.slug,
    title: product.title,
    description: product.description || 'Premium mobility solution for your home',
    image: imageUrl,
    price: product.price ? `From $${product.price}` : 'Contact for pricing',
    badge: badge
  };
};

const ProductShowcaseCarousel: React.FC<ProductShowcaseCarouselProps> = ({
  products,
  currentSlide,
  onSlideChange
}) => {
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const { featuredProducts, loading, error, fetchFeaturedProducts } = useHomepageStore();

  // Fetch real products on component mount
  useEffect(() => {
    if (featuredProducts.length === 0 && !loading) {
      fetchFeaturedProducts();
    }
  }, [featuredProducts.length, loading, fetchFeaturedProducts]);

  // Transform real products for carousel display
  const carouselProducts = featuredProducts.length > 0 
    ? featuredProducts.slice(0, 4).map((product, index) => {
        console.log('Hero Slider - Product data:', {
          slug: product.slug,
          title: product.title,
          imageUrl: product.imageUrl,
          index
        });
        return transformProductForCarousel(product, index);
      })
    : mockProducts;

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      onSlideChange((currentSlide + 1) % carouselProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, carouselProducts.length, onSlideChange, isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Handle image loading errors
  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // Get current product with fallback image handling
  const getCurrentProductWithFallback = () => {
    const product = carouselProducts[currentSlide] || carouselProducts[0];
    if (imageErrors.has(currentSlide)) {
      return {
        ...product,
        image: fallbackImages[currentSlide % fallbackImages.length]
      };
    }
    return product;
  };

  const currentProduct = getCurrentProductWithFallback();

  // Loading state
  if (loading) {
    return (
      <div className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto">
        <div className="relative h-[450px] md:h-[500px] lg:h-[600px] bg-gray-100 rounded-2xl shadow-xl overflow-hidden animate-pulse">
          <div className="h-[300px] md:h-[350px] lg:h-[400px] bg-gray-200"></div>
          <div className="p-6 md:p-8">
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="text-center mt-4 text-sm text-gray-500">
          Loading featured products...
        </div>
      </div>
    );
  }

  // Error state with fallback to mock products
  if (error && featuredProducts.length === 0) {
    console.warn('ProductShowcaseCarousel: Using mock products due to error:', error);
  }

  return (
    <div 
      className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Product Display */}
      <div className="relative min-h-[520px] md:min-h-[560px] lg:min-h-[620px] bg-white rounded-2xl shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="relative min-h-full"
          >
            {/* Product Image */}
            <div className="relative h-[220px] md:h-[260px] lg:h-[300px] overflow-hidden">
              <Image
                src={currentProduct.image}
                alt={currentProduct.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                priority={currentSlide === 0}
                onError={() => handleImageError(currentSlide)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-[#3fa2a3] to-[#f7a236] text-white px-4 py-2 rounded-[35px] text-xs md:text-sm font-primary font-semibold shadow-md transition-all duration-300">
                  {currentProduct.badge}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                {currentProduct.title}
              </h3>
              <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-xs md:text-sm">
                {sanitizeHtml(currentProduct.description || '', { maxLength: 130 })}
              </p>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="text-lg md:text-xl font-bold text-gray-900">
                  {currentProduct.price}
                </span>
              </div>
              <PrimaryButton 
                disabled
                className="w-full text-sm py-2.5 opacity-50 cursor-not-allowed"
                aria-disabled="true"
                title="View Details is temporarily disabled"
              >
                View Details
              </PrimaryButton>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 md:mt-8 space-x-3">
        {carouselProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-[#3fa2a3] scale-125' 
                : 'bg-[#f7a236] hover:bg-[#3fa2a3]'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => onSlideChange((currentSlide - 1 + carouselProducts.length) % carouselProducts.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-[#3fa2a3]/20 bg-[#3fa2a3] text-white shadow-[0_10px_25px_rgba(63,162,163,0.25)] transition-all duration-300 hover:bg-[#f7a236] hover:text-white"
        aria-label="Previous product"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={() => onSlideChange((currentSlide + 1) % carouselProducts.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-[#3fa2a3]/20 bg-[#3fa2a3] text-white shadow-[0_10px_25px_rgba(63,162,163,0.25)] transition-all duration-300 hover:bg-[#f7a236] hover:text-white"
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
