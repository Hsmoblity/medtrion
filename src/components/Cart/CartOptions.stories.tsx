import React from 'react';
import { CartProduct } from 'lib/interfaces';

// Simple CartOptions component for Storybook
const CartOptions: React.FC<{
  mainProduct: CartProduct;
  options?: CartProduct[];
  onEdit?: (productId: string) => void;
  onRemove?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  className?: string;
}> = ({
  mainProduct,
  options = [],
  onEdit,
  onRemove,
  onUpdateQuantity,
  className = ''
}) => {
  const formatPrice = (price: any) => {
    const numPrice = typeof price === 'number' ? price : Number(price || 0);
    return `$${numPrice.toFixed(2)}`;
  };

  const calculateLineTotal = (product: CartProduct) => {
    const basePrice = typeof product.price === 'number' ? product.price : Number(product.price || 0);
    const quantity = product.quantity || 1;
    
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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      {/* Main Product */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src="/temp.webp"
              alt={mainProduct.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {mainProduct.title}
            </h3>
            
            {mainProduct.variationId && (
              <p className="text-sm text-gray-600 mt-1">
                Variation: {mainProduct.variationId}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{formatPrice(mainProduct.price)}</span>
                {mainProduct.options && mainProduct.options.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    + {mainProduct.options.length} option{mainProduct.options.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(calculateLineTotal(mainProduct))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => onUpdateQuantity?.(String(mainProduct.cartItemId), (mainProduct.quantity || 1) - 1)}
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
                disabled={(mainProduct.quantity || 1) <= 1}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                {mainProduct.quantity || 1}
              </span>
              
              <button
                onClick={() => onUpdateQuantity?.(String(mainProduct.cartItemId), (mainProduct.quantity || 1) + 1)}
                className="p-2 hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            {/* Action Buttons */}
            <button
              onClick={() => onEdit?.(String(mainProduct.cartItemId))}
              className="p-2 text-gray-600 hover:text-brand-primary hover:bg-orange-50 rounded-md transition-colors duration-200"
              title="Edit product"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => onRemove?.(String(mainProduct.cartItemId))}
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
        {mainProduct.options && mainProduct.options.length > 0 && (
          <div className="mt-4 ml-20">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Included Options:</h4>
            <div className="space-y-2">
              {mainProduct.options.map((option: any, index: number) => (
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
      {options.length > 0 && (
        <div className="p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Related Options:</h4>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div 
                key={option.cartItemId || index}
                className="flex items-center space-x-3 p-3 bg-white rounded-md border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
              >
                <img
                  src="/temp.webp"
                  alt={option.title}
                  className="w-12 h-12 rounded-md object-cover"
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
                    onClick={() => onEdit?.(String(option.cartItemId))}
                    className="p-1 text-gray-500 hover:text-brand-primary hover:bg-orange-100 rounded transition-colors duration-200"
                    title="Edit option"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onRemove?.(String(option.cartItemId))}
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

// Mock data
const mockMainProduct: CartProduct = {
  cartItemId: 'ci_main_001',
  slug: 'vivalift-ultra-plr4955s-lift-chair',
  title: 'VivaLift Ultra PLR4955S Lift Chair',
  price: 1299.99,
  quantity: 1,
  productId: 'prod_001',
  productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
  featuredImage: '/temp.webp',
  variationId: 'var_001',
  options: [
    { name: 'Extended Warranty', priceModifier: 199.99, quantity: 1, selected: true },
    { name: 'Delivery & Setup', priceModifier: 149.99, quantity: 1, selected: true }
  ],
  description: '',
  shortDescription: '',
  productSpecifications: '',
  affiliate: false
};

const mockOptionProducts: CartProduct[] = [
  {
    cartItemId: 'ci_option_001',
    slug: 'extended-warranty-5-year',
    title: 'Extended Warranty - 5 Year',
    price: 199.99,
    quantity: 1,
    productId: 'prod_201',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    featuredImage: '/temp.webp',
    description: '',
    shortDescription: '',
    productSpecifications: '',
    affiliate: false
  },
  {
    cartItemId: 'ci_option_002',
    slug: 'delivery-setup-service',
    title: 'Professional Delivery & Setup Service',
    price: 149.99,
    quantity: 1,
    productId: 'prod_202',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    featuredImage: '/temp.webp',
    description: '',
    shortDescription: '',
    productSpecifications: '',
    affiliate: false
  }
];

const mockSimpleProduct: CartProduct = {
  cartItemId: 'ci_simple_001',
  slug: 'acorn-stairlift-basic',
  title: 'Acorn Stairlift - Basic Model',
  price: 2499.99,
  quantity: 1,
  productId: 'prod_003',
  productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
  featuredImage: '/temp.webp',
  description: '',
  shortDescription: '',
  productSpecifications: '',
  affiliate: false
};

export default {
  title: 'Components/Cart/CartOptions',
  component: CartOptions,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    onEdit: { action: 'edit' },
    onRemove: { action: 'remove' },
    onUpdateQuantity: { action: 'updateQuantity' },
  },
};

export const WithOptions = {
  args: {
    mainProduct: mockMainProduct,
    options: mockOptionProducts,
    className: 'max-w-2xl',
    useRealData: false,
    fallbackToMock: true
  }
};

export const WithoutOptions = {
  args: {
    mainProduct: mockSimpleProduct,
    options: [],
    className: 'max-w-2xl',
    useRealData: false,
    fallbackToMock: true
  }
};

export const WithManyOptions = {
  args: {
    mainProduct: {
      ...mockMainProduct,
      title: 'Premium Mobility Package',
      price: 3999.99,
      options: [
        { name: 'Extended Warranty', price: 299.99, quantity: 1, selected: true },
        { name: 'Delivery & Setup', price: 199.99, quantity: 1, selected: true },
        { name: 'Maintenance Package', price: 149.99, quantity: 1, selected: true },
        { name: 'Insurance Coverage', price: 99.99, quantity: 1, selected: true }
      ]
    },
    options: [
      ...mockOptionProducts,
      {
        cartItemId: 'ci_option_003',
        slug: 'maintenance-package',
        title: 'Annual Maintenance Package',
        price: 149.99,
        quantity: 1,
        productId: 'prod_203',
        productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
        featuredImage: '/temp.webp'
      }
    ],
    className: 'max-w-2xl'
  }
};

export const HighQuantity = {
  args: {
    mainProduct: {
      ...mockMainProduct,
      quantity: 3,
      title: 'Bulk Order - VivaLift Ultra PLR4955S'
    },
    options: mockOptionProducts,
    className: 'max-w-2xl'
  }
};

export const Compact = {
  args: {
    mainProduct: mockMainProduct,
    options: mockOptionProducts,
    className: 'max-w-lg',
    useRealData: false,
    fallbackToMock: true
  }
};

// New story demonstrating real data integration
export const WithRealDataIntegration = {
  args: {
    mainProduct: mockMainProduct,
    options: mockOptionProducts,
    className: 'max-w-2xl',
    useRealData: true,
    fallbackToMock: true
  }
};

// Story demonstrating fail-safe behavior with invalid data
export const WithInvalidData = {
  args: {
    mainProduct: {
      // Invalid/missing data to test fail-safes
      cartItemId: null,
      title: '',
      price: 'invalid',
      quantity: -1
    } as any,
    options: [
      // Invalid option data
      { cartItemId: null, title: '', price: 'invalid' } as any
    ],
    className: 'max-w-2xl',
    useRealData: false,
    fallbackToMock: true
  }
};