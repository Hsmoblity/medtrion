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
}

const Home = ({ products }: HomeProps) => {
  const safeProducts = Array.isArray(products) ? products : [];
  return (
    <>
      <MetaHead title=" Health Services & Mobility Products for a Better Life" description="Explore hsMobility for a wide range of health services and mobility products designed to improve your quality of life. As affiliate partners of Acron stairlifts, we offer trusted solutions to help you regain independence and enhance your mobility." />
      <Hero />
      <div className=" justify-center mx-auto">
        <h2 className=" text-center md:text-4xl text-2xl uppercase leading-8 text-gray-800 my-6 font-bold font-poppins max-w-4xl mx-auto ">Explore a curated selection of top-notch mobility products crafted to elevate your lifestyle.</h2>
        <ProductList products={safeProducts} />
      </div>
      <div>
        <FAQ />
      </div>
      <Banner />
      <div className="py-8">

        <Form />
      </div>

      {/* <Specs /> */}
      <div >
        <Reviews />
      </div>
    </>
  );
};



import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await getProducts("");
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
    },
  };
};

export default Home;
