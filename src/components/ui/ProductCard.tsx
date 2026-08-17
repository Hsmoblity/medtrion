import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ProductSchema } from '../../lib/interfaces/schema';
import { ProductCardView } from '../../lib/interfaces/homepage';
import PrimaryButton from './PrimaryButton';
import { normalizeImageUrl } from '../../lib/utils/image';
import dynamic from 'next/dynamic';
import HydrationErrorBoundary from '../HydrationErrorBoundary';

const RichContent = dynamic(() => import('components/RichContent'), { ssr: false });

// Unified ProductCard component with variant system
export interface ProductCardProps {
  // Data source - can be either ProductSchema or ProductCardView
  product: ProductSchema | ProductCardView;
  
  // Variant system
  variant?: 'basic' | 'enhanced' | 'hero';
  
  // Animation and interaction props
  index?: number;
  priority?: boolean;
  onHeroClick?: (productSlug: string, badge: string, position: number) => void;
  position?: number;
  
  // Behavior props
  showConfigureButton?: boolean;
  showAddToCartButton?: boolean;
  cardClickBehavior?: 'configurator' | 'product-detail';
  
  // Styling props
  className?: string;
  noCardSurface?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'basic',
  index = 0,
  priority = false,
  onHeroClick,
  position = 0,
  showConfigureButton = true,
  showAddToCartButton = true,
  cardClickBehavior = 'configurator',
  className = '',
  noCardSurface = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  // Type guards to determine data source
  const isProductSchema = (p: ProductSchema | ProductCardView): p is ProductSchema => {
    return 'productPictures' in p || 'affiliate' in p;
  };

  const isProductCardView = (p: ProductSchema | ProductCardView): p is ProductCardView => {
    return 'imageUrl' in p && 'badges' in p;
  };

  // Normalize data to common interface
  const normalizedProduct = React.useMemo(() => {
    if (isProductSchema(product)) {
      // Convert ProductSchema to normalized format
      return {
        slug: product.slug,
        title: product.title,
        description: product.shortDescription || product.description,
        price: typeof product.price === 'number' ? product.price : 0,
        imageUrl: normalizeImageUrl(product.productPictures?.[0]?.fields?.file?.url || product.featuredImage) || '/placeholder.svg',
        badges: [],
        rating: null,
        affiliate: product.affiliate || false,
        hasOptions: !!(product.variations?.length || product.options?.length || product._related_options?.length)
      };
    } else {
      // ProductCardView is already normalized
      return {
        slug: product.slug,
        title: product.title,
        description: product.description,
        price: product.price || 0,
        imageUrl: product.imageUrl,
        badges: product.badges || [],
        rating: product.rating,
        affiliate: false,
        hasOptions: !!(product.relatedOptions?.length)
      };
    }
  }, [product]);

  // Event handlers
  const handleClick = () => {
    if (onHeroClick) {
      const badge = normalizedProduct.badges.length > 0 ? normalizedProduct.badges[0] : '';
      onHeroClick(normalizedProduct.slug, badge, position);
    }
  };

  const handleCardClick = () => {
    if (cardClickBehavior === 'configurator') {
      router.push(`/product/${normalizedProduct.slug}/configure`);
    } else {
      router.push(`/product/${normalizedProduct.slug}`);
    }
  };

  const handleConfigureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/product/${normalizedProduct.slug}/configure`);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (normalizedProduct.hasOptions) {
      router.push(`/product/${normalizedProduct.slug}/options`);
    } else {
      // For now, just navigate to product detail page
      // TODO: Implement direct add to cart functionality
      router.push(`/product/${normalizedProduct.slug}`);
    }
  };

  // Render different variants
  const renderBasicVariant = () => (
    <article 
      className={`cursor-pointer rounded-[24px] ${noCardSurface ? 'bg-transparent border-none shadow-none hover:shadow-none' : 'border border-[#0b1f3a]/10 bg-white shadow-[0_15px_40px_rgba(11,31,58,0.06)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(11,31,58,0.1)]'} p-3 transition-all duration-300 ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`View ${normalizedProduct.title} product`}
    >
      <div className="relative flex items-center justify-center overflow-hidden rounded-[18px]">
        <Image
          src={normalizedProduct.imageUrl}
          alt={`${normalizedProduct.title} Image`}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
          priority={priority}
        />
      </div>
      
      <div className="mt-1 p-2">
        <h2 className="font-poppins font-black text-[#0b1f3a]">{normalizedProduct.title}</h2>
        <div className="mt-1 line-clamp-3 text-sm font-semibold text-slate-500">
          <HydrationErrorBoundary>
            <RichContent content={normalizedProduct.description} />
          </HydrationErrorBoundary>
        </div>
        
        <div className="mt-3 flex items-end justify-between">
          {normalizedProduct.affiliate ? (
            <>
              <button className="text-sm leading-8 font-bold text-black underline">
                Learn More
              </button>
              <div className="flex items-center space-x-1.5 rounded-[35px] bg-[#3fa2a3] hover:bg-[#f7a236] px-6 py-3 text-white font-primary font-semibold duration-300 transition-all">
                <button className="text-sm">Get a Quote</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-[#153a5f]">${normalizedProduct.price.toFixed(2)}</p>
              <div className="flex flex-col space-y-2" onClick={(e) => e.stopPropagation()}>
                {showConfigureButton && (
                  <PrimaryButton
                    onClick={handleConfigureClick}
                    size="sm"
                    fullWidth
                  >
                    <span className="text-sm font-medium">Configure</span>
                    <svg className="h-4 w-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </PrimaryButton>
                )}
                
                {showAddToCartButton && (
                  <button 
                    onClick={handleAddToCartClick}
                    className="flex items-center justify-center space-x-1.5 rounded-[35px] bg-[#3fa2a3] px-6 py-3 text-white font-primary font-semibold duration-300 hover:bg-[#f7a236] shadow-md focus:outline-none focus:ring-2 focus:ring-[#f7a236] focus:ring-offset-2"
                  >
                    <span className="text-sm">Add to cart</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );

  const renderEnhancedVariant = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative cursor-pointer overflow-hidden rounded-[24px] ${noCardSurface ? 'border-none bg-transparent shadow-none hover:shadow-none' : 'border border-[#0b1f3a]/10 bg-white shadow-[0_15px_40px_rgba(11,31,58,0.06)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(11,31,58,0.1)]'} transition-all duration-500 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Configure ${normalizedProduct.title} product`}
    >
      {/* Product Image with Overlay */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={normalizedProduct.imageUrl}
          alt={normalizedProduct.title || 'Product image'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Dynamic Badge */}
        {normalizedProduct.badges.length > 0 && (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-[#3fa2a3] to-[#f7a236] text-white px-4 py-2 rounded-full text-sm font-primary font-semibold shadow-md">
              {normalizedProduct.badges[0]}
            </span>
          </div>
        )}
        
        {/* Rating */}
        {normalizedProduct.rating && (
          <div className="absolute top-4 right-4 bg-white/90 rounded-full px-2 py-1">
            <span className="text-xs font-semibold text-gray-900">★ {normalizedProduct.rating}</span>
          </div>
        )}
        
        {/* Configurator Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
        >
          <div className="text-center text-white">
            <div className="text-lg font-semibold mb-2">Click to Configure</div>
            <div className="text-sm opacity-90">Start customizing this product</div>
          </div>
        </motion.div>
      </div>
      
      {/* Product Info - Fixed height for consistent cards */}
      <div className="p-6 flex flex-col h-[280px]">
        <h3 className="mb-3 font-primary text-xl font-semibold text-[#0b1f3a] transition-colors group-hover:text-[#3fa2a3] line-clamp-2">
          {normalizedProduct.title}
        </h3>
        
        {normalizedProduct.description && (
          <div className="mb-3 line-clamp-2 text-gray-600 flex-grow">
            <HydrationErrorBoundary>
              <RichContent content={normalizedProduct.description} />
            </HydrationErrorBoundary>
          </div>
        )}
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {normalizedProduct.price > 0 && (
              <span className="text-2xl font-bold text-gray-900">${normalizedProduct.price.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
          <PrimaryButton 
            href={`/product/${normalizedProduct.slug}`}
            className="flex-1"
            onClick={handleClick}
          >
            View Details
          </PrimaryButton>
          <button className="p-2 border-2 border-[#3fa2a3] rounded-[35px] hover:bg-[#f7a236] transition-all duration-300 text-[#3fa2a3] hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderHeroVariant = () => (
    <div 
      className={`group relative cursor-pointer overflow-hidden rounded-[24px] ${noCardSurface ? 'border-none bg-transparent shadow-none hover:shadow-none' : 'border border-slate-200 bg-slate-50 shadow-[0_15px_40px_rgba(11,31,58,0.06)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(11,31,58,0.1)]'} transition-all duration-300 ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Configure ${normalizedProduct.title} product`}
    >
      {/* Badges */}
      {normalizedProduct.badges.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          {normalizedProduct.badges.slice(0, 2).map((badge, badgeIndex) => (
            <span
              key={badgeIndex}
              className="inline-block rounded-full bg-gradient-to-r from-[#3fa2a3] to-[#f7a236] px-4 py-2 text-xs font-primary font-semibold text-white mb-2 mr-2 shadow-md"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
      
      {/* Rating */}
      {normalizedProduct.rating && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 rounded-full px-2 py-1">
          <span className="text-xs font-semibold text-gray-900">★ {normalizedProduct.rating}</span>
        </div>
      )}

      <div className="block">
        <div className="relative h-64 w-full overflow-hidden bg-white rounded-t-[24px]">
          <Image
            src={normalizedProduct.imageUrl}
            alt={normalizedProduct.title || 'Product image'}
            fill
            style={{ objectFit: 'cover' }}
            priority={priority}
            className="transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <div className="rounded-b-[24px] border-t border-slate-200 bg-slate-50 p-6 flex flex-col justify-between h-[220px]">
          <h3 className="line-clamp-2 text-xl font-semibold text-[#0b1f3a]">{normalizedProduct.title}</h3>
          {normalizedProduct.description && (
            <div className="mt-2 text-slate-600 line-clamp-2">
              <HydrationErrorBoundary>
                <RichContent content={normalizedProduct.description} />
              </HydrationErrorBoundary>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 md:border md:p-2 md:rounded-full">
            <div className="flex flex-col">
              {normalizedProduct.price > 0 && (
                <span className="text-2xl font-bold text-[#153a5f]">${normalizedProduct.price.toFixed(2)}</span>
              )}
            </div>
            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <PrimaryButton 
                size="sm"
                href={`/product/${normalizedProduct.slug}`}
                onClick={handleClick}
                className="text-sm"
              >
                View Details
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'enhanced':
      return renderEnhancedVariant();
    case 'hero':
      return renderHeroVariant();
    case 'basic':
    default:
      return renderBasicVariant();
  }
};

export default ProductCard;