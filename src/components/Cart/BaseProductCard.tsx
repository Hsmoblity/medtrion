import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CartProduct } from '../../lib/interfaces';
import { normalizeImageUrl } from '../../lib/utils/image';
import { parsePrice, formatPrice } from '../../lib/utils/priceUtils';
import styles from './CartLayout.module.css';

interface BaseProductCardProps {
  product: CartProduct;
  showControls?: boolean;
  showConfiguration?: boolean;
  onEditConfiguration?: () => void;
  onRemoveProduct?: () => void;
  onUpdateQuantity?: (quantity: number) => void;
}

const BaseProductCard: React.FC<BaseProductCardProps> = ({
  product,
  showControls = true,
  showConfiguration = true,
  onEditConfiguration,
  onRemoveProduct,
  onUpdateQuantity
}) => {
  const router = useRouter();
  const { title, slug, price, quantity = 1, productPictures, featuredImage, options = [] } = product;
  
  const getSafeImage = () => normalizeImageUrl(productPictures?.[0]?.fields?.file?.url || featuredImage) || '/placeholder-image.jpg';
  
  const calculateTotalPrice = () => {
    const basePrice = parsePrice(price);
    let optionsPrice = 0;
    
    if (options && Array.isArray(options)) {
      for (const option of options) {
        const optionPrice = parsePrice((option as any).price || option.priceModifier);
        const optionQuantity = Number(option.quantity || 1) || 1;
        optionsPrice += optionPrice * optionQuantity;
      }
    }
    
    return (basePrice + optionsPrice) * quantity;
  };

  const calculatePerUnitPrice = () => {
    const basePrice = parsePrice(price);
    let optionsPrice = 0;
    
    if (options && Array.isArray(options)) {
      for (const option of options) {
        const optionPrice = parsePrice((option as any).price || option.priceModifier);
        const optionQuantity = Number(option.quantity || 1) || 1;
        optionsPrice += optionPrice * optionQuantity;
      }
    }
    
    return basePrice + optionsPrice;
  };

  return (
    <div 
      className={styles.baseProductCard}
      role="article"
      aria-label={`Base product: ${title}`}
    >
      {/* Product Image Section */}
      <div className={styles.productImageSection}>
        <Image
          src={getSafeImage()}
          alt={title}
          width={192}
          height={128}
          className={styles.productImage}
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      {/* Product Information Section */}
      <div className={styles.productInfoSection} role="region" aria-label="Product information">
        {/* Product Header */}
        <div className={styles.productHeader}>
          <div className="flex items-center justify-between">
            <h2 className={styles.productTitle} id={`product-title-${product.cartItemId}`}>
              {title}
            </h2>
            {slug ? (
              <a
                href={`/product/${slug}`}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/product/${slug}`);
                }}
              >
                View More →
              </a>
            ) : (
              <span className="text-sm text-gray-400 font-medium">
                Product details unavailable
              </span>
            )}
          </div>
          <div className={styles.productMeta}>
            <span className={styles.productSku}>SKU: {slug}</span>
            <span className={styles.productType}>Base Model</span>
          </div>
        </div>
        
        {/* Configuration Status */}
        {showConfiguration && (options.length > 0 || product.variationId) && (
          <div className={styles.configurationStatus}>
            <div className={styles.configIndicator}>
              <div className={styles.connectionDot}></div>
              <span className={styles.configText}>Configured Product</span>
            </div>
            {onEditConfiguration && (
              <button 
                className={styles.btnEditConfig} 
                onClick={onEditConfiguration}
                aria-label={`Edit configuration for ${title}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Configuration</span>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Product Controls Section */}
      {showControls && (
        <div className={styles.productControlsSection}>
          {/* Quantity Controls */}
          <div className={styles.quantityControls}>
            <button 
              className={styles.btnQuantity} 
              onClick={() => onUpdateQuantity?.(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className={styles.quantityDisplay}>{quantity}</span>
            <button 
              className={styles.btnQuantity} 
              onClick={() => onUpdateQuantity?.(quantity + 1)}
              aria-label="Increase quantity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          {/* Price Display */}
          <div className={styles.priceDisplay}>
            <span className={styles.priceAmount}>{formatPrice(calculatePerUnitPrice())}</span>
            <span className={styles.priceLabel}>Base Price</span>
          </div>
          
          {/* Remove Button */}
          {onRemoveProduct && (
            <button 
              className={styles.btnRemove} 
              onClick={onRemoveProduct}
              aria-label={`Remove ${title} from cart`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Remove</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseProductCard;