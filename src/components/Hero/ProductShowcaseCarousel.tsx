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
      <div className="relative mx-auto w-full max-w-[420px] sm:max-w-[460px]">
        <div className="relative h-[420px] overflow-hidden rounded-[24px] border border-white/20 bg-white/75 backdrop-blur-sm animate-pulse">
          <div className="h-[220px] bg-gray-200"></div>
          <div className="p-5">
            <div className="mb-3 h-5 rounded bg-gray-200"></div>
            <div className="mb-4 h-3 rounded bg-gray-200"></div>
            <div className="mb-4 h-7 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-300">
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
      className="relative mx-auto w-full max-w-[420px] sm:max-w-[460px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Product Display */}
      <div className="relative min-h-[440px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(7,22,45,0.12)]">
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
            <div className="relative h-[260px] overflow-hidden rounded-t-[24px] bg-white">
              <Image
                src={currentProduct.image}
                alt={currentProduct.title}
                fill
                className="object-contain transition-transform duration-500 hover:scale-105"
                priority={currentSlide === 0}
                onError={() => handleImageError(currentSlide)}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              
              {/* Badge */}
              <div className="absolute top-3 left-3">
                <span className="rounded-full bg-gradient-to-r from-[#3fa2a3] to-[#f7a236] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg">
                  {currentProduct.badge}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="rounded-b-[24px] border-t border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-2 text-[17px] font-semibold text-slate-900">
                {currentProduct.title}
              </h3>
              <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                {sanitizeHtml(currentProduct.description || '', { maxLength: 120 })}
              </p>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  {currentProduct.price}
                </span>
              </div>
              {currentProduct.slug ? (
                <PrimaryButton
                  href={`/products/${currentProduct.slug}`}
                  size="lg"
                  fullWidth
                >
                  View Details
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  disabled
                  className="w-full py-3 text-sm"
                  aria-disabled="true"
                  title="View Details is temporarily unavailable"
                >
                  View Details
                </PrimaryButton>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="mt-5 flex justify-center space-x-2.5">
        {carouselProducts.map((_, index) => (
          <button
            key={index}
            onClick={() => onSlideChange(index)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'scale-125 bg-[#3fa2a3]' 
                : 'bg-white/70 hover:bg-[#3fa2a3]'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductShowcaseCarousel;
