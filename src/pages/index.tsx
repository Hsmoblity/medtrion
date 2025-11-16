import MetaHead from "components/MetaHead";
import Hero from "components/hero";
import FAQ from "components/faq";
import Banner from "components/banner";
import { Reviews } from "components/reviews";
import { getProducts } from "lib/contentful/contentful";
import { ProductSchema } from "lib/interfaces";
import ProductList from "components/ProductList/ProductList";
import { Document } from "@contentful/rich-text-types";
import Link from "next/link";

import TopProductsStrip from "components/Home/TopProductsStrip";
import BestSellerSection from "components/Home/BestSellerSection";
import TrustIndicators from "components/Home/TrustIndicators";
import ProblemSolutionSection from "components/Home/ProblemSolutionSection";
import TestimonialCarousel from "components/Home/TestimonialCarousel";
import FloatingActionButton from "components/ui/FloatingActionButton";
import { getFeatureFlag } from "lib/featureFlags";

interface ContentfulProduct {
  fields: {
    title: string;
    slug: string;
    shortDescription: any; // Replace `any` with the appropriate type if known
    featuredImage?: {
      fields: {
        file: {
          url: string;
        };
      };
    };
    productSpecifications: Document;
    productPictures?: any[]; // Replace `any` if you know the type
    price: number;
    affiliate: boolean;
  };
}

interface HomeProps {
  products: ProductSchema[];
  error?: string | null;
}

const Home = ({ products, error }: HomeProps) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const showcaseEnabled = getFeatureFlag('homepage_showcase_layout');
  const trustIndicatorsEnabled = getFeatureFlag('homepage_trust_indicators');
  const problemSolutionEnabled = getFeatureFlag('homepage_problem_solution');
  const testimonialCarouselEnabled = getFeatureFlag('homepage_testimonial_carousel');
  const floatingActionEnabled = getFeatureFlag('homepage_floating_action');
  
  
  return (
    <>
      <MetaHead title=" Health Services & Mobility Products for a Better Life" description="Explore hsMobility for a wide range of health services and mobility products designed to improve your quality of life. As affiliate partners of Acron stairlifts, we offer trusted solutions to help you regain independence and enhance your mobility." />
      <Hero />
      
      {/* Best Seller Section with Real Products - Moved right after Hero */}
      {safeProducts.length > 0 && <BestSellerSection initialProducts={safeProducts} />}
      
      {/* Trust Indicators Section */}
      {trustIndicatorsEnabled && <TrustIndicators />}
      
      {/* Top Products Showcase - Featured Products Strip */}
      <TopProductsStrip enableShowcase={showcaseEnabled} />
      
      {/* Problem-Solution Interactive Section */}
      {problemSolutionEnabled && <ProblemSolutionSection />}
      
      {/* Testimonial Carousel Section */}
      {testimonialCarouselEnabled && <TestimonialCarousel />}
      
      {/* FAQ Section */}
      <div>
        <FAQ />
      </div>
      
      {/* Banner Section */}
      <Banner />

      {/* Get a FREE Quote Section */}
      <div className="py-16 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Get a FREE Quote
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Request a free consultation and we'll help you find the perfect mobility solution
          </p>
          <Link
            href="/consultation/google-form"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-900 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Request Your Free Consultation
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <Reviews />
      </div>

      {/* Floating Action Button */}
      {floatingActionEnabled && (
        <FloatingActionButton
          onClick={() => console.log('Floating action clicked')}
          label="Get Help"
        />
      )}
    </>
  );
};



import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  // Re-enable server-side product fetching for basic functionality
  try {
    console.log('Homepage: Attempting to fetch products...');
    const response = await getProducts("");
    
    // Check for error in response
    if (response.error) {
      console.error('Homepage: Product fetch error:', response.error);
    }
    
    // Ensure values are JSON-serializable (replace `undefined` with `null`)
    const sanitize = (v: any): any => {
      if (v === undefined) return null;
      if (v === null) return null;
      if (Array.isArray(v)) return v.map(sanitize);
      if (typeof v === 'object') {
        const out: any = {};
        for (const k of Object.keys(v)) {
          out[k] = sanitize(v[k]);
        }
        return out;
      }
      return v;
    };

    const items = Array.isArray(response.items) ? response.items.map(sanitize) : [];
    console.log('Homepage: Successfully fetched', items.length, 'products');

    return {
      props: {
        products: items,
        error: response.error || null,
      },
    };
  } catch (error) {
    console.error('Homepage: Failed to fetch products:', error);
    // Return empty products array instead of failing completely
    return {
      props: {
        products: [],
        error: error instanceof Error ? error.message : 'Failed to load products',
      },
    };
  }
};

export default Home;
