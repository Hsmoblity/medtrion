import MetaHead from "components/MetaHead";
import Hero from "components/hero";
import FAQ from "components/faq";
import Banner from "components/banner";
import { Reviews } from "components/reviews";
import Form from "components/step-form";
import { getProducts } from "lib/contentful/contentful";
import { ProductSchema } from "lib/interfaces";
import ProductList from "components/ProductList/ProductList";
import { Document } from "@contentful/rich-text-types";

import TopProductsStrip from "components/Home/TopProductsStrip";
import BestSellerSection from "components/Home/BestSellerSection";
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
  
  
  return (
    <>
      <MetaHead title=" Health Services & Mobility Products for a Better Life" description="Explore hsMobility for a wide range of health services and mobility products designed to improve your quality of life. As affiliate partners of Acron stairlifts, we offer trusted solutions to help you regain independence and enhance your mobility." />
      <Hero />
      
      {/* Top Products Showcase - Featured Products Strip */}
      <TopProductsStrip enableShowcase={showcaseEnabled} />
      
      {/* Best Seller Section with Real Products - HIDDEN */}
      {/* <BestSellerSection initialProducts={safeProducts} /> */}
      
      {/* FAQ Section */}
      <div>
        <FAQ />
      </div>
      
      {/* Banner Section */}
      <Banner />
      
      {/* Contact Form Section */}
      <div className="py-8">
        <Form />
      </div>

      {/* Reviews Section */}
      <div>
        <Reviews />
      </div>
    </>
  );
};



import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  try {
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

    return {
      props: {
        products: items,
        error: response.error || null,
      },
    };
  } catch (error) {
    console.error('Homepage: Failed to fetch products:', error);
    return {
      props: {
        products: [],
        error: error instanceof Error ? error.message : 'Failed to load products',
      },
    };
  }
};

export default Home;
