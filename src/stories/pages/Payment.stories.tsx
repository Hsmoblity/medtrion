import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import Header from '../../components/PageLayout/Header';
import Footer from '../../components/PageLayout/Footer';
import { PrimaryButton } from 'components/ui';

// Mock the Next.js router
const mockRouter = {
  push: () => {},
  replace: () => {},
  query: {},
  pathname: '/payment',
  asPath: '/payment',
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
};

// Mock fetch for API calls
const mockFetch = (url: string, options?: any) => {
  console.log('Mock API call:', url, options);
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      order: {
        orderNumber: 'ORD-12345',
        id: '12345'
      }
    })
  });
};

// Mock data for mobility products
const mockCartWithProducts = [
  {
    cartItemId: 'ci_1',
    slug: 'acorn-straight-stairlift',
    productId: '1413',
    title: 'Acorn Straight Stairlift',
    price: 2999,
    quantity: 1,
    options: [
      {
        name: 'Extended Warranty',
        price: 299,
        quantity: 1,
        priceModifier: 299
      },
      {
        name: 'Installation Service',
        price: 199,
        quantity: 1,
        priceModifier: 199
      }
    ]
  },
  {
    cartItemId: 'ci_2',
    slug: 'acorn-curved-stairlift',
    productId: '1414',
    title: 'Acorn Curved Stairlift',
    price: 3999,
    quantity: 1,
    options: [
      {
        name: 'Premium Upholstery',
        price: 199,
        quantity: 1,
        priceModifier: 199
      }
    ]
  },
  {
    cartItemId: 'ci_3',
    slug: 'pool-lift-basic',
    productId: '1417',
    title: 'EZ 2 Pool Lift with Sling',
    price: 3274,
    quantity: 1,
    options: []
  }
];

const mockEmptyCart: any[] = [];

const mockCartWithOptions = [
  {
    cartItemId: 'ci_4',
    slug: 'golden-cloud-stairlift',
    productId: '1407',
    title: 'Golden Cloud PR515SME With Twilight',
    price: 2679,
    quantity: 2,
    options: [
      {
        name: 'Factory Options',
        price: 316,
        quantity: 1,
        priceModifier: 316
      },
      {
        name: 'Color Upgrade',
        price: 286,
        quantity: 1,
        priceModifier: 286
      },
      {
        name: 'Accessories Package',
        price: 285,
        quantity: 1,
        priceModifier: 285
      },
      {
        name: 'Delivery Service',
        price: 449,
        quantity: 1,
        priceModifier: 449
      }
    ]
  }
];

// Payment component for Storybook (without Next.js dependencies)
const PaymentPageStorybook = ({ cartItems, onNavigate }: { cartItems: any[], onNavigate?: (href: string) => void }) => {
  const [message, setMessage] = useState('Preparing payment (simulated)...');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    postalCode: '',
    country: '',
    note: '',
    email: '',
    phone: ''
  });

  const isValid = form.firstName && form.lastName && form.address1 && form.city && form.postalCode && form.country;

  useEffect(() => {
    setMessage('Enter shipping information to complete order');
  }, []);

  // Include attached option prices when computing subtotal
  const subtotal = cartItems && cartItems.length ? cartItems.reduce((s: number, it: any) => {
    const base = typeof it.price === 'number' ? it.price : Number(it.price || 0) || 0;
    let opts = 0;
    if (it.options && Array.isArray(it.options) && it.options.length > 0) {
      for (const o of it.options) {
        const op = typeof o.price === 'number' ? o.price : Number(o.price || o.priceModifier || 0) || 0;
        const oq = Number(o.quantity || 1) || 1;
        opts += op * oq;
      }
    }
    const configuredPerUnit = base + opts;
    return s + configuredPerUnit * (Number(it.quantity) || 1);
  }, 0) : 0;
  
  const taxRate = 0.13; // example tax 13%
  const tax = Math.round((subtotal * taxRate) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setMessage('Creating order (simulated)...');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const orderData = {
        lineItems: cartItems.map((i: any) => ({ 
          slug: i.slug, 
          productId: i.productId ?? undefined, 
          quantity: i.quantity, 
          price: i.price, 
          title: i.title, 
          options: i.options ?? undefined 
        })),
        customer: {
          shipping: {
            first_name: form.firstName,
            last_name: form.lastName,
            address_1: form.address1,
            city: form.city,
            postcode: form.postalCode,
            country: form.country,
            phone: form.phone,
          },
          billing: form.email ? { email: form.email } : null
        },
        meta: {
          simulatedPayment: true,
          paymentMethod: 'card_dummy',
          subtotal,
          tax,
          total,
          note: form.note
        }
      };

      console.log('Order data:', orderData);
      
      const wpOrderIdResp = 'ORD-12345';
      const href = `/success${wpOrderIdResp ? `?wpOrderId=${encodeURIComponent(String(wpOrderIdResp))}` : ''}`;
      
      if (onNavigate) {
        onNavigate(href);
      } else {
        alert(`Order created successfully! Would navigate to: ${href}`);
      }
      
    } catch (err) {
      console.warn('Payment/order create failed', err);
      setMessage('Failed to create order — try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 px-4">
        {/* Left: form inputs */}
        <div className="lg:col-span-7 bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">{message}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">First name</label>
                <input 
                  value={form.firstName} 
                  onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} 
                  className="w-full border p-2 rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last name</label>
                <input 
                  value={form.lastName} 
                  onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))} 
                  className="w-full border p-2 rounded" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Address</label>
              <input 
                value={form.address1} 
                onChange={e => setForm(prev => ({ ...prev, address1: e.target.value }))} 
                className="w-full border p-2 rounded" 
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium">City</label>
                <input 
                  value={form.city} 
                  onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} 
                  className="w-full border p-2 rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Postal code</label>
                <input 
                  value={form.postalCode} 
                  onChange={e => setForm(prev => ({ ...prev, postalCode: e.target.value }))} 
                  className="w-full border p-2 rounded" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Country</label>
                <input 
                  value={form.country} 
                  onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))} 
                  className="w-full border p-2 rounded" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input 
                value={form.phone} 
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} 
                className="w-full border p-2 rounded" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Email (optional)</label>
              <input 
                value={form.email} 
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} 
                className="w-full border p-2 rounded" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Order note (optional)</label>
              <textarea 
                value={form.note} 
                onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))} 
                className="w-full border p-2 rounded" 
                rows={3} 
              />
            </div>

            <div className="flex justify-end">
              <PrimaryButton 
                disabled={!isValid || submitting} 
                type="submit"
                loading={submitting}
              >
                {submitting ? 'Please wait...' : 'Place Order (simulate)'}
              </PrimaryButton>
            </div>
          </form>
        </div>

        {/* Right: cart summary */}
        <aside className="lg:col-span-5">
          <div className="bg-white p-6 rounded shadow sticky top-20">
            <h3 className="text-lg font-medium mb-3">Order summary</h3>
            <div className="divide-y">
              <div className="space-y-3 pb-3">
                {(cartItems && cartItems.length) ? cartItems.map((it: any) => {
                  const base = typeof it.price === 'number' ? it.price : Number(it.price || 0) || 0;
                  let opts = 0;
                  const optionLines: any[] = [];
                  if (it.options && Array.isArray(it.options) && it.options.length > 0) {
                    for (const o of it.options) {
                      const op = typeof o.price === 'number' ? o.price : Number(o.price || o.priceModifier || 0) || 0;
                      const oq = Number(o.quantity || 1) || 1;
                      opts += op * oq;
                      optionLines.push({ name: o.name || o.title || o.value, price: op, quantity: oq });
                    }
                  }
                  const configuredPerUnit = base + opts;
                  const lineTotal = configuredPerUnit * (Number(it.quantity) || 1);
                  return (
                    <div key={it.cartItemId || it.slug} className="pb-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <div className="font-medium">{it.title || it.name || it.slug}</div>
                          <div className="text-xs text-gray-500">Qty: {it.quantity ?? 1}</div>
                        </div>
                        <div className="text-sm">${Number(lineTotal).toFixed(2)}</div>
                      </div>
                      {optionLines.length > 0 && (
                        <div className="mt-2 ml-3 text-xs text-gray-600">
                          {optionLines.map((ol, idx) => (
                            <div key={idx} className="flex justify-between">
                              <div>{ol.name}{ol.quantity && ol.quantity > 1 ? ` x${ol.quantity}` : ''}</div>
                              <div>${(ol.price * (ol.quantity || 1)).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }) : <div className="text-sm text-gray-500">Cart is empty</div>}
              </div>

              <div className="py-3">
                <div className="flex justify-between text-sm"><div>Subtotal</div><div>${subtotal.toFixed(2)}</div></div>
                <div className="flex justify-between text-sm"><div>Tax ({Math.round(taxRate * 100)}%)</div><div>${tax.toFixed(2)}</div></div>
                <div className="flex justify-between text-base font-semibold mt-2"><div>Total</div><div>${total.toFixed(2)}</div></div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Payment (test)</h4>
              <div className="border rounded p-3">
                <label className="block text-xs text-gray-600">Card number</label>
                <input className="w-full p-2 border rounded mt-1" placeholder="4242 4242 4242 4242" />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input className="p-2 border rounded" placeholder="MM/YY" />
                  <input className="p-2 border rounded" placeholder="CVC" />
                </div>
                <div className="text-xs text-gray-500 mt-2">This is a dummy card input and will not process real payments.</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Wrapper component to provide mock context
const PaymentPageWrapper = ({ cartItems, onNavigate }: { cartItems: any[], onNavigate?: (href: string) => void }) => {
  return (
    <div>
      <Header />
      <PaymentPageStorybook cartItems={cartItems} onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

const meta: Meta<typeof PaymentPageWrapper> = {
  title: 'Pages/Payment',
  component: PaymentPageWrapper,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Payment page with comprehensive form validation and order summary. Includes mock API calls for testing without actual order creation.'
      }
    }
  },
  argTypes: {
    cartItems: {
      description: 'Array of cart items to display in the order summary',
      control: { type: 'object' }
    },
    mockRouter: {
      description: 'Mock Next.js router for navigation',
      control: { type: 'object' }
    }
  }
};

export default meta;
type Story = StoryObj<typeof PaymentPageWrapper>;

// Story: With Populated Cart
export const WithPopulatedCart: Story = {
  args: {
    cartItems: mockCartWithProducts
  },
  parameters: {
    docs: {
      description: {
        story: 'Payment page with a cart containing various mobility products, including items with and without options. Shows realistic pricing calculations with tax.'
      }
    }
  }
};

// Story: With Empty Cart
export const WithEmptyCart: Story = {
  args: {
    cartItems: mockEmptyCart
  },
  parameters: {
    docs: {
      description: {
        story: 'Payment page in its empty state. Shows empty cart message and disabled form submission.'
      }
    }
  }
};

// Story: With Form Validation States
export const WithFormValidation: Story = {
  args: {
    cartItems: mockCartWithOptions
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the form validation states. Form is initially invalid and becomes valid as required fields are filled. Shows error handling and submission states.'
      }
    }
  }
};

// Story: Mobile View
export const MobileView: Story = {
  args: {
    cartItems: mockCartWithProducts
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Payment page optimized for mobile viewport. Tests responsive design with single column layout and touch-friendly form elements.'
      }
    }
  }
};

// Story: With Complex Options
export const WithComplexOptions: Story = {
  args: {
    cartItems: mockCartWithOptions
  },
  parameters: {
    docs: {
      description: {
        story: 'Payment page with products that have multiple options and accessories. Demonstrates complex pricing calculations including base price, options, and quantities.'
      }
    }
  }
};

// Story: Tablet View
export const TabletView: Story = {
  args: {
    cartItems: mockCartWithProducts
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    },
    docs: {
      description: {
        story: 'Payment page optimized for tablet viewport. Shows responsive grid layout with proper spacing for medium-sized screens.'
      }
    }
  }
};

// Story: Desktop Large View
export const DesktopLargeView: Story = {
  args: {
    cartItems: mockCartWithProducts
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop'
    },
    docs: {
      description: {
        story: 'Payment page on large desktop screens. Shows full two-column layout with form on the left and order summary on the right.'
      }
    }
  }
};

// Story: Form Interaction Demo
export const FormInteractionDemo: Story = {
  args: {
    cartItems: mockCartWithProducts,
    onNavigate: (href: string) => {
      console.log('Navigation to:', href);
      alert(`Would navigate to: ${href}`);
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of form submission. Shows the complete flow from form validation to order creation simulation. Mock API calls prevent actual order creation.'
      }
    }
  }
};

// Story: Error State
export const ErrorState: Story = {
  args: {
    cartItems: mockCartWithProducts,
    onNavigate: (href: string) => {
      throw new Error('Simulated API error');
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when order creation fails. Shows user-friendly error messages and retry functionality.'
      }
    }
  }
};

// Story: Loading State
export const LoadingState: Story = {
  args: {
    cartItems: mockCartWithProducts,
    onNavigate: (href: string) => {
      // Simulate slow API response
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Navigation to:', href);
          alert(`Order created successfully! Would navigate to: ${href}`);
          resolve(href);
        }, 3000);
      });
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state during order submission. Demonstrates disabled form and loading indicators while processing.'
      }
    }
  }
};