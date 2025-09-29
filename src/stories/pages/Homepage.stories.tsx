import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Header from '../../components/PageLayout/Header';
import Hero from '../../components/hero';
import ProductList from '../../components/ProductList/ProductList';
import Footer from '../../components/PageLayout/Footer';
import Banner from '../../components/banner';
import FAQ from '../../components/faq';

// Mock data for the homepage showcase
const mockProducts = [
  {
    id: 'prod_001',
    title: 'VivaLift Ultra PLR4955S Lift Chair',
    slug: 'vivalift-ultra-plr4955s-lift-chair',
    price: 1299.99,
    featuredImage: '/temp.webp',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    _related_options: ['opt_001', 'opt_002'],
    _related_options_products: [
      { id: 'opt_001', title: 'Extended Warranty', price: 199.99 },
      { id: 'opt_002', title: 'Delivery & Setup', price: 149.99 }
    ]
  },
  {
    id: 'prod_002',
    title: 'Acorn Stairlift - Basic Model',
    slug: 'acorn-stairlift-basic',
    price: 2499.99,
    featuredImage: '/temp.webp',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    _related_options: ['opt_003'],
    _related_options_products: [
      { id: 'opt_003', title: 'Professional Installation', price: 299.99 }
    ]
  },
  {
    id: 'prod_003',
    title: 'Pride Mobility Scooter LX',
    slug: 'pride-mobility-scooter-lx',
    price: 1899.99,
    featuredImage: '/temp.webp',
    productPictures: [{ fields: { file: { url: '/temp.webp' } } }],
    _related_options: [],
    _related_options_products: []
  }
];

const mockFAQData = [
  {
    question: "What is the warranty on your mobility products?",
    answer: "All our mobility products come with a comprehensive warranty. Lift chairs typically have a 2-year warranty on the mechanism and 1-year on the fabric. Stairlifts come with a 2-year warranty on all mechanical parts. Scooters have a 1-year warranty covering all components."
  },
  {
    question: "Do you offer installation services?",
    answer: "Yes, we provide professional installation services for all our products. Our certified technicians will install your mobility equipment safely and efficiently. Installation fees vary by product type and complexity."
  },
  {
    question: "Can I try before I buy?",
    answer: "Absolutely! We encourage customers to try our products before making a purchase. Visit our showroom to test different models and find the perfect fit for your needs."
  },
  {
    question: "What financing options are available?",
    answer: "We offer flexible financing options including 0% APR for qualified buyers, extended payment plans, and we accept most major insurance plans. Contact us to discuss the best financing option for your situation."
  }
];

// Homepage component for Storybook showcase
const HomepageShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <Hero 
        title="Premium Mobility Solutions"
        subtitle="Discover our range of lift chairs, stairlifts, and mobility scooters designed for comfort and independence."
        image="/temp.webp"
        buttonText="Shop Now"
        buttonLink="/products"
      />
      
      {/* Banner */}
      <Banner 
        title="Free Delivery & Setup"
        subtitle="Professional installation included with every purchase"
        buttonText="Learn More"
        buttonLink="/services"
      />
      
      {/* Product List */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our top-rated mobility solutions designed to enhance your daily life
            </p>
          </div>
          <ProductList products={mockProducts} />
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Get answers to common questions about our products and services
            </p>
          </div>
          <FAQ faqs={mockFAQData} />
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

const meta: Meta<typeof HomepageShowcase> = {
  title: 'Showcase/Pages/Homepage',
  component: HomepageShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Homepage Showcase

This showcase demonstrates the complete integration of key components on the homepage:

## Components Integrated:
- **Header**: Navigation and branding
- **Hero**: Main banner with call-to-action
- **Banner**: Promotional section
- **ProductList**: Featured products display
- **FAQ**: Common questions section
- **Footer**: Site footer with links

## Key Features:
- Responsive design with Tailwind CSS
- Mock data integration for realistic display
- Component composition showing real-world usage
- Accessibility considerations
- Mobile-first approach

This showcase shows how individual components work together to create a cohesive user experience.
        `
      }
    }
  },
  tags: ['showcase', 'pages', 'homepage', 'integration']
};

export default meta;
type Story = StoryObj<typeof HomepageShowcase>;

export const Default: Story = {
  args: {}
};

export const WithCustomProducts: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Homepage with custom product selection showcasing different product types and configurations.'
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
        story: 'Homepage optimized for mobile viewing with responsive component layouts.'
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
        story: 'Homepage layout for tablet devices showing medium-screen optimizations.'
      }
    }
  }
};