import React from 'react';
import { CartProduct } from 'lib/interfaces';
import Image from 'next/image';
import { normalizeImageUrl } from '../../lib/utils/image';
import { useCartStore } from '../../stores/cartStore';
import { useSession } from '../../hooks/useSession';

interface CartOptionsProps {
  mainProduct: CartProduct;
  options?: CartProduct[];
  onEdit?: (productId: string) => void;
  onRemove?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  className?: string;
  // Real data integration props
  useRealData?: boolean;
  fallbackToMock?: boolean;
}

const CartOptions: React.FC<CartOptionsProps> = ({
  mainProduct,
  options = [],
  onEdit,
  onRemove,
  onUpdateQuantity,
  className = '',
  useRealData = false,
  fallbackToMock = true
}) => {
  // Real data integration hooks
  const cartStore = useCartStore();
  const { addToRecentlyViewed } = useSession();
  
  // Mock data fallback
  const getMockProduct = React.useCallback((): CartProduct => ({
    cartItemId: 'mock_001',
    slug: 'mock-product',
    title: 'Mock Product',
    description: 'Mock product description',
    shortDescription: 'Mock short description',
    productSpecifications: 'Mock specifications',
    affiliate: false,
    price: 99.99,
    quantity: 1,
    productId: 'mock_prod',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    featuredImage: '/temp.webp',
    variationId: null,
    options: []
  }), []);

  // Fail-safe data validation and fallbacks
  const validateAndFallback = React.useCallback((product: CartProduct): CartProduct => {
    if (!product || typeof product !== 'object') {
      return getMockProduct();
    }
    
    return {
      ...product,
      cartItemId: product.cartItemId || `fallback_${Date.now()}`,
      slug: product.slug || 'unknown-product',
      title: product.title || 'Unknown Product',
      description: product.description || 'No description available',
      shortDescription: product.shortDescription || 'No short description available',
      productSpecifications: product.productSpecifications || 'No specifications available',
      affiliate: product.affiliate || false,
      price: typeof product.price === 'number' ? product.price : 0,
      quantity: typeof product.quantity === 'number' ? product.quantity : 1,
      productId: product.productId || 'unknown',
      productPictures: Array.isArray(product.productPictures) ? product.productPictures : [],
      featuredImage: product.featuredImage || '/temp.webp',
      variationId: product.variationId || null,
      options: Array.isArray(product.options) ? product.options : []
    };
  }, [getMockProduct]);
  
  // Validate and potentially fallback data
  const safeMainProduct = React.useMemo(() => {
    const validated = validateAndFallback(mainProduct);
    if (fallbackToMock && (!validated.title || validated.title === 'Unknown Product')) {
      return getMockProduct();
    }
    return validated;
  }, [mainProduct, fallbackToMock, validateAndFallback, getMockProduct]);
  
  const safeOptions = React.useMemo(() => {
    if (!Array.isArray(options)) return [];
    return options.map(validateAndFallback);
  }, [options, validateAndFallback]);
  const getSafeImage = (product: CartProduct) => {
    return normalizeImageUrl(
      product.productPictures?.[0]?.fields?.file?.url || 
      product.featuredImage || 
      '/temp.webp'
    ) || '/temp.webp';
  };

  const formatPrice = (price: any) => {
    const numPrice = typeof price === 'number' ? price : Number(price || 0);
    return `$${numPrice.toFixed(2)}`;
  };

  const calculateLineTotal = (product: CartProduct) => {
    const basePrice = typeof product.price === 'number' ? product.price : Number(product.price || 0);
    const quantity = product.quantity || 1;
    
    // Add option prices if any
    let optionPrice = 0;
    if (product.options && Array.isArray(product.options)) {
      optionPrice = product.options.reduce((sum, option: any) => {
        const optPrice = typeof option.price === 'number' ? option.price : Number(option.price || 0);
        const optQuantity = option.quantity || 1;
        return sum + (optPrice * optQuantity);
      }, 0);
    }
    
    return (basePrice + optionPrice) * quantity;
  };

  // Enhanced handlers with real data integration
  const handleQuantityChange = (product: CartProduct, newQuantity: number) => {
    if (useRealData && product.cartItemId) {
      // Use real cart store
      cartStore.updateQuantity(product.cartItemId, newQuantity);
      // Track in session
      addToRecentlyViewed(product.slug);
    } else if (onUpdateQuantity && product.cartItemId) {
      // Use callback if provided
      onUpdateQuantity(String(product.cartItemId), newQuantity);
    }
  };

  const handleRemove = (product: CartProduct) => {
    if (useRealData && product.cartItemId) {
      // Use real cart store
      cartStore.removeFromCart(product.cartItemId);
    } else if (onRemove && product.cartItemId) {
      // Use callback if provided
      onRemove(String(product.cartItemId));
    }
  };

  const handleEdit = (product: CartProduct) => {
    if (useRealData && product.cartItemId) {
      // Track interaction in session
      addToRecentlyViewed(product.slug);
      // Could navigate to edit page or open modal
    } else if (onEdit && product.cartItemId) {
      // Use callback if provided
      onEdit(String(product.cartItemId));
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Data Source Indicator (for debugging) */}
      {useRealData && (
        <div className="px-4 py-1 bg-blue-50 border-b border-blue-200">
          <span className="text-xs text-blue-600 font-medium">Real Data Mode</span>
        </div>
      )}
      
      {/* Main Product */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Image
              src={getSafeImage(safeMainProduct)}
              width={80}
              height={80}
              alt={safeMainProduct.title || 'Product image'}
              className="rounded-lg object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {safeMainProduct.title}
            </h3>
            
            {safeMainProduct.variationId && (
              <p className="text-sm text-gray-600 mt-1">
                Variation: {safeMainProduct.variationId}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{formatPrice(safeMainProduct.price)}</span>
                {safeMainProduct.options && safeMainProduct.options.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    + {safeMainProduct.options.length} option{safeMainProduct.options.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(calculateLineTotal(safeMainProduct))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(safeMainProduct, (safeMainProduct.quantity || 1) - 1)}
                className="p-2 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(safeMainProduct.quantity || 1) <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                {safeMainProduct.quantity || 1}
              </span>
              
              <button
                onClick={() => handleQuantityChange(safeMainProduct, (safeMainProduct.quantity || 1) + 1)}
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => handleEdit(safeMainProduct)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="Edit product"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => handleRemove(safeMainProduct)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              title="Remove product"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main Product Options */}
        {safeMainProduct.options && safeMainProduct.options.length > 0 && (
          <div className="mt-4 ml-20">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Included Options:</h4>
            <div className="space-y-2">
              {safeMainProduct.options.map((option: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {option.name || option.title || `Option ${index + 1}`}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(option.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Related Options */}
      {safeOptions.length > 0 && (
        <div className="p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Related Options:</h4>
          <div className="space-y-3">
            {safeOptions.map((option, index) => (
              <div 
                key={option.cartItemId || index}
                className="flex items-center space-x-3 p-3 bg-white rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <Image
                  src={getSafeImage(option)}
                  width={48}
                  height={48}
                  alt={option.title || 'Option image'}
                  className="rounded-md object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {option.title}
                  </h5>
                  <p className="text-xs text-gray-500">
                    {option.slug}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(option.price)}
                  </span>
                  
                  <button
                    onClick={() => handleEdit(option)}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                    title="Edit option"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleRemove(option)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                    title="Remove option"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartOptions;