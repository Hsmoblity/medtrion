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
  onRemoveOption?: (optionIndex: number) => void;
}

const ProductOptionsList: React.FC<ProductOptionsListProps> = ({
  options,
  mainProduct,
  showConnections = true,
  onRemoveOption
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
                <div 
                  className={styles.optionActions}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <span className={styles.optionPrice}>
                    {formatOptionPrice(option.price || option.priceModifier)}
                  </span>
                  {onRemoveOption && (
                    <button
                      onClick={() => onRemoveOption(index)}
                      className={styles.removeOptionButton}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#EF4444';
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9CA3AF';
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      aria-label={`Remove ${option.name || option.title || option.value} option`}
                      title="Remove this option"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                </div>
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