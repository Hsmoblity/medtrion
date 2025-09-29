import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCardView } from '../../lib/interfaces/homepage';
import { PrimaryButton } from 'components/ui';
import dynamic from 'next/dynamic';

const RichContent = dynamic(() => import('components/RichContent'), { ssr: false });

interface ProductHeroCardProps {
  product: ProductCardView;
  priority?: boolean; // For pre-loading the first image
  onHeroClick?: (productSlug: string, badge: string, position: number) => void;
  position?: number;
}

const ProductHeroCard: React.FC<ProductHeroCardProps> = ({ 
  product, 
  priority = false, 
  onHeroClick,
  position = 0 
}) => {
  const handleClick = () => {
    if (onHeroClick) {
      const badge = product.badges.length > 0 ? product.badges[0] : '';
      onHeroClick(product.slug, badge, position);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
      {/* Badges */}
      {product.badges.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          {product.badges.slice(0, 2).map((badge, index) => (
            <span
              key={index}
              className="inline-block rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white mb-2 mr-2"
            >
              {badge}
            </span>
          ))}
        </div>
      )}
      
      {/* Rating */}
      {product.rating && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 rounded-full px-2 py-1">
          <span className="text-xs font-semibold text-gray-900">★ {product.rating}</span>
        </div>
      )}

      <div className="block">
        <div className="relative h-64 w-full">
          <Image
            src={product.imageUrl || '/placeholder.svg'}
            alt={product.title || 'Product image'}
            fill
            style={{ 
              objectFit: 'cover'
            }}
            priority={priority}
            className="transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
          {product.description && (
            <div className="mt-2 text-gray-600 line-clamp-2">
              <RichContent content={product.description} />
            </div>
          )}
          
          {/* Options Summary */}
          {product.optionsSummary && (
            <p className="mt-2 text-sm text-blue-600">{product.optionsSummary}</p>
          )}
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              {product.price && (
                <span className="text-2xl font-bold text-gray-900">${product.price}</span>
              )}
              {product.financingCopy && (
                <span className="text-sm text-gray-500">{product.financingCopy}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <PrimaryButton 
                size="sm"
                href={`/product/${product.slug}`}
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
};

export default ProductHeroCard;
