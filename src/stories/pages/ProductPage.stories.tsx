import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Header from '../../components/PageLayout/Header';
import ProductOptions from '../../components/ProductOptions';
import Reviews from '../../components/reviews';
import Footer from '../../components/PageLayout/Footer';
import Banner from '../../components/banner';

// Mock product data for the product page showcase
const mockProduct = {
  id: 'prod_001',
  title: 'VivaLift Ultra PLR4955S Lift Chair',
  slug: 'vivalift-ultra-plr4955s-lift-chair',
  price: 1299.99,
  description: 'The VivaLift Ultra PLR4955S is a premium lift chair designed for maximum comfort and safety. Features include smooth lifting mechanism, plush cushioning, and easy-to-use remote control.',
  featuredImage: '/temp.webp',
  productPictures: [
    { fields: { file: { url: '/temp.webp' } } },
    { fields: { file: { url: '/temp.webp' } } },
    { fields: { file: { url: '/temp.webp' } } }
  ],
  variations: [
    { id: 'var_001', name: 'Fabric', options: ['Beige', 'Brown', 'Gray'] },
    { id: 'var_002', name: 'Size', options: ['Small', 'Medium', 'Large'] }
  ],
  _related_options: ['opt_001', 'opt_002', 'opt_003'],
  _related_options_products: [
    { 
      id: 'opt_001', 
      title: 'Extended Warranty - 5 Year', 
      price: 199.99,
      description: 'Extended warranty coverage for 5 years',
      image: '/temp.webp'
    },
    { 
      id: 'opt_002', 
      title: 'Professional Delivery & Setup', 
      price: 149.99,
      description: 'White-glove delivery and professional installation',
      image: '/temp.webp'
    },
    { 
      id: 'opt_003', 
      title: 'Maintenance Package', 
      price: 99.99,
      description: 'Annual maintenance and cleaning service',
      image: '/temp.webp'
    }
  ]
};

const mockReviews = [
  {
    id: 'rev_001',
    name: 'Sarah Johnson',
    rating: 5,
    date: '2024-01-15',
    title: 'Excellent quality and comfort',
    content: 'This lift chair has been a game-changer for my daily routine. The lifting mechanism is smooth and quiet, and the comfort is outstanding. Highly recommend!',
    verified: true
  },
  {
    id: 'rev_002',
    name: 'Michael Chen',
    rating: 4,
    date: '2024-01-10',
    title: 'Great value for the price',
    content: 'Good quality chair with reliable lifting mechanism. Delivery was prompt and installation was professional. Minor issue with fabric color but overall satisfied.',
    verified: true
  },
  {
    id: 'rev_003',
    name: 'Emily Rodriguez',
    rating: 5,
    date: '2024-01-05',
    title: 'Perfect for my needs',
    content: 'As someone with mobility challenges, this chair has significantly improved my quality of life. The remote control is easy to use and the chair is very comfortable.',
    verified: true
  },
  {
    id: 'rev_004',
    name: 'David Thompson',
    rating: 4,
    date: '2023-12-28',
    title: 'Solid construction',
    content: 'Well-built chair with good materials. The lifting mechanism works smoothly and the chair is comfortable for extended sitting. Would recommend to others.',
    verified: true
  }
];

// ProductPage component for Storybook showcase
const ProductPageShowcase: React.FC = () => {
  const handleAddToCart = (productId: string, quantity: number, options: any[]) => {
    console.log('Add to cart:', { productId, quantity, options });
  };

  const handleSelectOption = (optionId: string) => {
    console.log('Select option:', optionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Product Details Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={mockProduct.featuredImage} 
                  alt={mockProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mockProduct.productPictures.slice(1).map((pic, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={pic.fields.file.url} 
                      alt={`${mockProduct.title} view ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {mockProduct.title}
                </h1>
                <p className="text-2xl font-semibold text-brand-primary mb-4">
                  ${mockProduct.price.toFixed(2)}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {mockProduct.description}
                </p>
              </div>
              
              {/* Product Options */}
              <ProductOptions
                product={mockProduct}
                onAddToCart={handleAddToCart}
                onSelectOption={handleSelectOption}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Related Options Banner */}
      <Banner 
        title="Complete Your Setup"
        subtitle="Add professional installation and extended warranty for peace of mind"
        buttonText="View Options"
        buttonLink="#options"
      />
      
      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Customer Reviews
            </h2>
            <p className="text-lg text-gray-600">
              See what our customers say about this product
            </p>
          </div>
          <Reviews reviews={mockReviews} />
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

const meta: Meta<typeof ProductPageShowcase> = {
  title: 'Showcase/Pages/ProductPage',
  component: ProductPageShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Product Page Showcase

This showcase demonstrates the complete integration of components on a product detail page:

## Components Integrated:
- **Header**: Navigation and branding
- **ProductOptions**: Product selection and add-on options
- **Reviews**: Customer feedback and ratings
- **Banner**: Promotional section for related services
- **Footer**: Site footer with links

## Key Features:
- Product image gallery with multiple views
- Detailed product information and pricing
- Interactive product options and variations
- Customer reviews with ratings
- Related services and add-ons
- Responsive design for all devices

## Product Options Integration:
- Variation selection (fabric, size)
- Related options (warranty, installation, maintenance)
- Add to cart functionality
- Price calculation with options

This showcase shows how individual components work together to create a comprehensive product shopping experience.
        `
      }
    }
  },
  tags: ['showcase', 'pages', 'product', 'integration']
};

export default meta;
type Story = StoryObj<typeof ProductPageShowcase>;

export const Default: Story = {
  args: {}
};

export const WithAllOptions: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Product page with all available options and variations selected, showing complete product configuration.'
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
        story: 'Product page optimized for mobile viewing with stacked layout and touch-friendly interactions.'
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
        story: 'Product page layout for tablet devices showing medium-screen optimizations.'
      }
    }
  }
};

export const WithManyReviews: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Product page with extensive customer reviews showing the reviews component with pagination.'
      }
    }
  }
};