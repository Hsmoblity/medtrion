import React from 'react';
import { CartProduct } from '../../lib/interfaces';
import { parsePrice, formatPrice } from '../../lib/utils/priceUtils';
import { useCartStore } from 'stores/cartStore';
import BaseProductCard from './BaseProductCard';
import ProductOptionsList from './ProductOptionsList';
import styles from './CartLayout.module.css';

interface ProductGroupProps {
  group: {
    mainProduct: CartProduct;
    options: any[];
    configId?: string;
  };
  showGroupHeader?: boolean;
  showGroupTotal?: boolean;
  onEditConfiguration?: (product: CartProduct) => void;
  onRemoveProduct?: (product: CartProduct) => void;
  onUpdateQuantity?: (product: CartProduct, quantity: number) => void;
}

const ProductGroup: React.FC<ProductGroupProps> = ({
  group,
  showGroupHeader = true,
  showGroupTotal = true,
  onEditConfiguration,
  onRemoveProduct,
  onUpdateQuantity
}) => {
  const { mainProduct, options = [], configId } = group;
  const removeOption = useCartStore(state => state.removeOption);

  console.log(`🔧 DEBUG: Rendering ProductGroup for "${mainProduct.title}" (${mainProduct.cartItemId}) with ${options.length} options:`, {
    mainProduct: {
      title: mainProduct.title,
      cartItemId: mainProduct.cartItemId,
      slug: mainProduct.slug,
      productId: mainProduct.productId,
      price: mainProduct.price
    },
    options: options.map(opt => ({ name: opt.name, value: opt.value, priceModifier: opt.priceModifier }))
  });

  const handleRemoveOption = (optionIndex: number) => {
    if (mainProduct.cartItemId) {
      removeOption(mainProduct.cartItemId, optionIndex);
    }
  };
  
  const calculateGroupTotal = () => {
    const basePrice = parsePrice(mainProduct.price);
    const quantity = mainProduct.quantity || 1;
    let optionsPrice = 0;
    
    if (options && Array.isArray(options)) {
      for (const option of options) {
        const optionPrice = parsePrice(option.price || option.priceModifier);
        const optionQuantity = Number(option.quantity || 1) || 1;
        optionsPrice += optionPrice * optionQuantity;
      }
    }
    
    return (basePrice + optionsPrice) * quantity;
  };

  const getMainProduct = () => mainProduct;
  const groupTotal = calculateGroupTotal();
  const totalItems = 1; // Only count the main product, options are part of it

  return (
    <div 
      className={styles.productGroup}
      role="group" 
      aria-label={`Product group: ${mainProduct.title}`}
    >
      {/* Group Header */}
      {showGroupHeader && (
        <div className={styles.groupHeader}>
          <div className={styles.groupInfo}>
            <h2 className={styles.groupTitle}>{getMainProduct().title}</h2>
            <div className={styles.groupMeta}>
              <span className={styles.itemCount}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
              <span className={styles.groupType}>Configured Product</span>
              {configId && (
                <span className={styles.groupId}>Config ID: {configId}</span>
              )}
            </div>
          </div>
          {showGroupTotal && (
            <div className={styles.groupTotal}>
              <div className={styles.totalPrice}>{formatPrice(groupTotal)}</div>
              <div className={styles.totalLabel}>Group Total</div>
            </div>
          )}
        </div>
      )}
      
      {/* Group Items */}
      <div className={styles.groupItems}>
        {/* Main Product */}
        <div className={styles.mainProductItem}>
          <BaseProductCard
            product={mainProduct}
            showControls={true}
            showConfiguration={true}
            onEditConfiguration={() => onEditConfiguration?.(mainProduct)}
            onRemoveProduct={() => onRemoveProduct?.(mainProduct)}
            onUpdateQuantity={(quantity) => onUpdateQuantity?.(mainProduct, quantity)}
          />
        </div>
        
        {/* Options Section */}
        {options.length > 0 && (
          <div className={styles.optionsSection}>
            <ProductOptionsList 
              options={options} 
              mainProduct={mainProduct}
              showConnections={true}
              onRemoveOption={handleRemoveOption}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGroup;