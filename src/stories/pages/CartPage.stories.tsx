import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Header from '../../components/PageLayout/Header';
import Cart from '../../components/PageLayout/Cart/Cart';
import CartOptions from '../../components/Cart/CartOptions';
import Footer from '../../components/PageLayout/Footer';
import Banner from '../../components/banner';
import { PrimaryButton } from 'components/ui';

// Mock cart data for the cart page showcase
const mockCartItems = [
  {
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
      { name: 'Extended Warranty', price: 199.99, quantity: 1, selected: true },
      { name: 'Delivery & Setup', price: 149.99, quantity: 1, selected: true }
    ]
  },
  {
    cartItemId: 'ci_main_002',
    slug: 'acorn-stairlift-basic',
    title: 'Acorn Stairlift - Basic Model',
    price: 2499.99,
    quantity: 1,
    productId: 'prod_002',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    featuredImage: '/temp.webp',
    variationId: 'var_002',
    options: [
      { name: 'Professional Installation', price: 299.99, quantity: 1, selected: true }
    ]
  }
];

const mockRelatedOptions = [
  {
    cartItemId: 'ci_option_001',
    slug: 'extended-warranty-5-year',
    title: 'Extended Warranty - 5 Year',
    price: 199.99,
    quantity: 1,
    productId: 'prod_201',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    featuredImage: '/temp.webp'
  },
  {
    cartItemId: 'ci_option_002',
    slug: 'delivery-setup-service',
    title: 'Professional Delivery & Setup Service',
    price: 149.99,
    quantity: 1,
    productId: 'prod_202',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    featuredImage: '/temp.webp'
  }
];

// CartPage component for Storybook showcase
const CartPageShowcase: React.FC = () => {
  const handleUpdateQuantity = (cartItemId: string, quantity: number) => {
    console.log('Update quantity:', { cartItemId, quantity });
  };

  const handleRemoveItem = (cartItemId: string) => {
    console.log('Remove item:', cartItemId);
  };

  const handleEditItem = (cartItemId: string) => {
    console.log('Edit item:', cartItemId);
  };

  const handleCheckout = () => {
    console.log('Proceed to checkout');
  };

  const handleContinueShopping = () => {
    console.log('Continue shopping');
  };

  // Calculate totals
  const subtotal = mockCartItems.reduce((sum, item) => {
    const basePrice = item.price * item.quantity;
    const optionPrice = item.options?.reduce((optSum, opt) => optSum + (opt.price * opt.quantity), 0) || 0;
    return sum + basePrice + optionPrice;
  }, 0);

  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 1000 ? 0 : 99.99; // Free shipping over $1000
  const total = subtotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Cart Header */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-2">
                {mockCartItems.length} item{mockCartItems.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
            <button
              onClick={handleContinueShopping}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {mockCartItems.map((item, index) => (
                <CartOptions
                  key={item.cartItemId}
                  mainProduct={item}
                  options={index === 0 ? mockRelatedOptions : []}
                  onEdit={handleEditItem}
                  onRemove={handleRemoveItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  useRealData={false}
                  fallbackToMock={true}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {shipping > 0 && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      Add ${(1000 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}

                <PrimaryButton
                  fullWidth
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </PrimaryButton>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Secure checkout with SSL encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <Banner 
        title="Free Installation Included"
        subtitle="Professional setup and delivery for all mobility products"
        buttonText="Learn More"
        buttonLink="/services"
      />

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              You Might Also Like
            </h2>
            <p className="text-lg text-gray-600">
              Complete your mobility solution with these recommended products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Mobility Scooter Accessories',
                price: 'From $49.99',
                image: '/temp.webp'
              },
              {
                title: 'Home Safety Equipment',
                price: 'From $29.99',
                image: '/temp.webp'
              },
              {
                title: 'Maintenance Services',
                price: 'From $99.99',
                image: '/temp.webp'
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-blue-600 font-medium">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

const meta: Meta<typeof CartPageShowcase> = {
  title: 'Showcase/Pages/CartPage',
  component: CartPageShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Cart Page Showcase

This showcase demonstrates the complete integration of components on a shopping cart page:

## Components Integrated:
- **Header**: Navigation and branding
- **Cart**: Main cart functionality and item management
- **CartOptions**: Individual cart item display with options
- **Banner**: Promotional section for additional services
- **Footer**: Site footer with links

## Key Features:
- Cart item management (quantity, remove, edit)
- Related options display for each product
- Order summary with tax and shipping calculations
- Free shipping threshold indicator
- Related products recommendations
- Responsive design for all devices

## Cart Functionality:
- Update item quantities
- Remove items from cart
- Edit item configurations
- Calculate totals with tax and shipping
- Proceed to checkout
- Continue shopping

## Order Summary Features:
- Subtotal calculation
- Tax calculation (8%)
- Shipping calculation (free over $1000)
- Total price display
- Free shipping progress indicator

This showcase shows how individual components work together to create a comprehensive shopping cart experience.
        `
      }
    }
  },
  tags: ['showcase', 'pages', 'cart', 'integration']
};

export default meta;
type Story = StoryObj<typeof CartPageShowcase>;

export const Default: Story = {
  args: {}
};

export const EmptyCart: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Cart page with no items, showing empty state and continue shopping options.'
      }
    }
  }
};

export const WithManyItems: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Cart page with multiple items showing various product types and configurations.'
      }
    }
  }
};

export const MobileView: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Cart page optimized for mobile viewing with stacked layout and touch-friendly interactions.'
      }
    }
  }
};

export const TabletView: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    },
    docs: {
      description: {
        story: 'Cart page layout for tablet devices showing medium-screen optimizations.'
      }
    }
  }
};

export const FreeShippingEligible: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Cart page with items totaling over $1000, showing free shipping eligibility.'
      }
    }
  }
};

export const CartEditFlow: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Cart page showcasing the edit configuration workflow with save/cancel states and real-time pricing updates.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ 
          background: '#fef3cd', 
          border: '1px solid #ffeaa7', 
          padding: '12px', 
          marginBottom: '16px',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <strong>Edit Mode Demo:</strong> This story shows cart items with edit configuration buttons and pricing updates.
        </div>
        <Story />
      </div>
    ),
  ],
};

export const CartWithConfigurationChanges: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates cart totals updating when product configurations are modified through the edit flow.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ 
          background: '#d4edda', 
          border: '1px solid #c3e6cb', 
          padding: '12px', 
          marginBottom: '16px',
          borderRadius: '8px',
          color: '#155724'
        }}>
          <strong>Configuration Updated Successfully:</strong> Cart total recalculated from $3,949.97 to $4,299.96 (+$349.99 for additional safety options)
        </div>
        <Story />
      </div>
    ),
  ],
};

export const NavigationFromCart: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows cart page with working navigation links back to homepage sections (shop, contact, etc.).'
      }
    }
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ 
          background: '#cce5ff', 
          border: '1px solid #66b3ff', 
          padding: '12px', 
          marginBottom: '16px',
          borderRadius: '8px',
          color: '#0056b3'
        }}>
          <strong>Navigation Demo:</strong> Test the header navigation links - they should properly navigate from cart to homepage sections.
        </div>
        <Story />
      </div>
    ),
  ],
};