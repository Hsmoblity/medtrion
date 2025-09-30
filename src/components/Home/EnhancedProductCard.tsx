import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ProductCardView } from '../../lib/interfaces/homepage';
import { PrimaryButton } from 'components/ui';
import dynamic from 'next/dynamic';

const RichContent = dynamic(() => import('components/RichContent'), { ssr: false });

interface EnhancedProductCardProps {
  product: ProductCardView;
  index: number;
  priority?: boolean;
  onHeroClick?: (productSlug: string, badge: string, position: number) => void;
  position?: number;
}

const EnhancedProductCard: React.FC<EnhancedProductCardProps> = ({ 
  product, 
  index,
  priority = false, 
  onHeroClick,
  position = 0 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onHeroClick) {
      const badge = product.badges.length > 0 ? product.badges[0] : '';
      onHeroClick(product.slug, badge, position);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image with Overlay */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.imageUrl || '/placeholder.svg'}
          alt={product.title || 'Product image'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Dynamic Badge */}
        {product.badges.length > 0 && (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {product.badges[0]}
            </span>
          </div>
        )}
        
        {/* Rating */}
        {product.rating && (
          <div className="absolute top-4 right-4 bg-white/90 rounded-full px-2 py-1">
            <span className="text-xs font-semibold text-gray-900">★ {product.rating}</span>
          </div>
        )}
        
        {/* Quick Actions Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
        >
          <div className="flex gap-3">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors">
              Quick View
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
              Configure
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        {product.description && (
          <div className="text-gray-600 mb-4 line-clamp-2">
            <RichContent content={product.description} />
          </div>
        )}
        
        {/* Options Summary */}
        {product.optionsSummary && (
          <p className="text-sm text-blue-600 mb-4">{product.optionsSummary}</p>
        )}
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {product.price && (
              <span className="text-2xl font-bold text-gray-900">${product.price}</span>
            )}
            {product.financingCopy && (
              <p className="text-sm text-gray-500">{product.financingCopy}</p>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <PrimaryButton 
            href={`/product/${product.slug}`}
            className="flex-1"
            onClick={handleClick}
          >
            View Details
          </PrimaryButton>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedProductCard;
