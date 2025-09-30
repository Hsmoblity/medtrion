import React from 'react';
import { CartProduct } from '../../lib/interfaces';
import { parsePrice, formatPrice } from '../../lib/utils/priceUtils';
import styles from './CartLayout.module.css';

interface ProductOption {
  name: string;
  title?: string;
  sku?: string;
  price?: number | string;
  priceModifier?: number;
  quantity?: number;
  value?: string;
  category?: string;
}

interface ProductOptionsListProps {
  options: ProductOption[];
  mainProduct: CartProduct;
  showConnections?: boolean;
}

const ProductOptionsList: React.FC<ProductOptionsListProps> = ({
  options,
  mainProduct,
  showConnections = true
}) => {
  if (!options || options.length === 0) {
    return null;
  }

  const formatOptionPrice = (price: number | string | undefined): string => {
    if (!price && price !== 0) return 'Included';
    
    // Use parsePrice to ensure we have a valid number
    const parsedPrice = parsePrice(price);
    
    // Handle 0 price explicitly
    if (parsedPrice === 0) return 'Included';
    
    // Format as currency with fallback protection
    const formattedPrice = formatPrice(parsedPrice, { 
      showCurrency: false,
      fallback: '0.00'
    });
    
    return `+$${formattedPrice}`;
  };

  return (
    <div 
      className={styles.optionsSection}
      role="region" 
      aria-label={`Options for ${mainProduct.title}`}
    >
      {/* Options Header */}
      <div className={styles.optionsHeader}>
        <div className={styles.optionsHeaderLeft}>
          {showConnections && (
            <div className={styles.connectionIndicator}>
              <div className={styles.connectionDot}></div>
              <div className={styles.connectionLineHorizontal}></div>
            </div>
          )}
          <div className={styles.optionsTitleSection}>
            <h3 
              className={styles.optionsTitle} 
              id={`options-title-${mainProduct.cartItemId}`}
            >
              Selected Options
            </h3>
            <p className={styles.optionsSubtitle}>Connected to {mainProduct.title}</p>
          </div>
        </div>
        <div className={styles.optionsCount}>
          {options.length} {options.length === 1 ? 'option' : 'options'}
        </div>
      </div>
      
      {/* Options List */}
      <ul 
        className={styles.optionsList} 
        role="list"
        aria-labelledby={`options-title-${mainProduct.cartItemId}`}
      >
        {options.map((option, index) => (
          <li 
            key={`${option.name}-${option.value || option.sku || index}-${mainProduct.cartItemId}`}
            className={styles.optionItem}
            role="listitem"
          >
            {/* Connection Line */}
            {showConnections && (
              <div className={styles.connectionLine}>
                {index < options.length - 1 ? (
                  <div className={styles.connectionLineVertical}></div>
                ) : (
                  <div className={styles.connectionLineEnd}></div>
                )}
              </div>
            )}
            
            {/* Option Content */}
            <div className={styles.optionContent}>
              <div className={styles.optionHeader}>
                <h4 className={styles.optionTitle}>
                  {option.name || option.title || option.value}
                </h4>
                <span className={styles.optionPrice}>
                  {formatOptionPrice(option.price || option.priceModifier)}
                </span>
              </div>
              <div className={styles.optionMeta}>
                {option.sku && (
                  <span className={styles.optionSku}>SKU: {option.sku}</span>
                )}
                {option.category && (
                  <span className={styles.optionCategory}>{option.category}</span>
                )}
                {option.quantity && option.quantity > 1 && (
                  <span className={styles.optionQuantity}>Qty: {option.quantity}</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductOptionsList;