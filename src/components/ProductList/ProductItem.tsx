"use client";

import { AnimatedSubscribeButton } from "components/btn";
import { Lens } from "components/PageLayout/lens";
import { Carousel, CarouselContent, CarouselItem } from "components/pictureCarousal";
import CartContext from "contexts/cartItemsContext";
import Link from "next/link";
import CartVisibilityContext from "contexts/cartVisibilityContext";
import { useContext, useState } from "react";
import { FaCartPlus, FaShoppingCart } from "react-icons/fa";
import Types from "reducers/cart/types";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import { normalizeImageUrl } from '../../lib/utils/image'

interface ProductItemProps {
  product: {
    title: string;
    shortDescription: string;
    featuredImage: string;
    affiliate: boolean;
    productSpeciications: Document;
    productPictures?: { fields: { file: { url: string } } }[];
    price: number;
    slug: string;
  };
}
const options = {
  renderNode: {
    'embedded-asset-block': (node: any) => {
      const fields = node?.data?.target?.fields;
      const file = fields?.file;
      const title = fields?.title;
      const imageUrl = file?.url;
      const imageAlt = title || 'Image';

      if (!imageUrl) return null;

      const src = imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`;

      return (
        <img
          src={src}
          alt={imageAlt}
          className="my-4 max-w-full"
        />
      );
    },
  },
};

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const { toggleCartVisibility } = useContext(CartVisibilityContext);
  const { dispatch } = useContext(CartContext); // Use CartContext to get the dispatch function
  const hasValidSpecs =
    product.productSpeciications &&
    typeof product.productSpeciications === 'object' &&
    Array.isArray((product.productSpeciications as any).content);

  const renderSpecifications = hasValidSpecs
    ? documentToReactComponents(product.productSpeciications, options)
    : null;
  // Handle adding to the cart
  const handleAddToCart = () => {
    const cartProduct = {
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: 1,
      productPictures: product.productPictures,
      affiliate: product.affiliate,
    };

    dispatch({
      type: Types.addToCart,  // Action type for adding the product to the cart
      payload: cartProduct,
    });
    toggleCartVisibility();
  };

  const IMAGE_URLS = product.productPictures?.length
    ? product.productPictures.map((pic) => normalizeImageUrl(pic?.fields?.file?.url))
    : product.featuredImage
      ? [normalizeImageUrl(product.featuredImage)]
      : ['/temp.webp'];


  return (
    <div className="flex flex-col items-center py-8 mt-16 bg-[url('/nnnoise.svg')] bg-cover bg-repeat">
      <div className="flex flex-col md:max-w-screen-2xl md:flex-row w-full justify-center items-start gap-10 z-10">
        {/* Image Section */}
        <div className="relative w-full max-w-md py-8">
          <Carousel disableDrag index={index} onIndexChange={setIndex}>
            <CarouselContent className="relative">
              {IMAGE_URLS.map((url, idx) => (
                <CarouselItem key={idx} className="py-4">
                  <div className="flex aspect-square items-center justify-center  ">
                    <Lens hovering={hovering} setHovering={setHovering}>
                      <img
                        src={url || '/temp.webp'}
                        alt={`Product Image ${idx + 1}`}
                        className=" object-cover object-center"
                      />
                    </Lens>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="flex w-full justify-center space-x-3 px-4">
            {IMAGE_URLS.map((url, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setIndex(idx)}
                className={`h-20 w-20 border ${idx === index
                  ? 'border-blue-500'
                  : 'border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          {/* Details Section */}
          <div className="flex flex-col gap-4 md:max-w-[600px] border-2 p-4 bg-white drop-shadow-lg m-4 rounded-lg">
            {/* Product Title */}

            <p className="md:text-sm text-md text-gray-600 mx-8">
              <span className="font-bold">Shop • </span>
              <span className="font-mono hover:text-blue-300 hover:underline"> {product.title}</span>

            </p>
            <h1 className="md:text-4xl text-xl font-bold text-gray-800 mx-8 font-poppins">
              {product.title}
            </h1>
            {/* Product Description */}
            <p className="md:text-lg text-md text-gray-600 mx-8">
              {product.shortDescription}
            </p>
            <div className="md:text-lg text-md text-gray-600 mx-8">
              {renderSpecifications}
            </div>

            <div className="border-b-[0.2px]"></div>

            {/* Price and Add to Cart */}
            <div className="flex justify-between items-center mx-6">
              {product.affiliate ? (
                // Affiliate-specific UI
                <>
                  <button className="text-md font-bold text-black underline">
                    Learn More
                  </button>
                  <div className="flex items-center space-x-1.5 rounded-lg bg-black px-4 py-1.5 text-white duration-100 hover:bg-slate-800">
                    <button className="text-sm">Get a Quote</button>
                  </div>
                </>
              ) : (
                // Non-affiliate product UI
                <>
                  <p className="text-lg font-bold text-blue-500">${product.price.toFixed(2)}</p>
                  <div className="flex items-center space-x-1.5 rounded-lg bg-black px-4 py-1.5 text-white duration-100 hover:bg-slate-800">
                    <button onClick={handleAddToCart} className="text-sm">Add to cart</button>
                    <FaShoppingCart className="h-4 w-4" />
                  </div>
                </>
              )}

            </div>
          </div>
          <div className="flex flex-col gap-4 md:max-w-[600px] border-2 p-4 bg-white drop-shadow-lg m-4 rounded-lg">
            <div className="md:mt-10">
              <h2 className="text-2xl font-semibold text-gray-800 font-poppins ml-4">Our Bestsellers</h2>
              <div className="flex md:flex-row flex-col gap-8 mt-6">
                <div className="flex flex-col items-center  pb-2">
                  <img
                    loading="lazy"
                    src="/180-stairlift-moving.png"
                    alt="30 Pod Mix"
                    className="object-cover max-w-56 aspect-[1.61]"
                  />
                  <p className="text-xl uppercase text-gray-800 font-bold m-3">For curved staircases</p>
                  <p className="text-lg text-slate-600 md:m-2 mx-8 md:text-left text-center">The Acorn 180 stairlift for curved staircases</p>
                  <button className="relative inline-flex text-nowrap h-12 mt-4 overflow-hidden rounded-lg">
                    <span className="group inline-flex items-center bg-black text-white px-4 py-2">
                      <Link href="/product/acorn-stairlifts-acorn-130-straight-stairlift">Shop Now{" "}</Link>
                      <FaCartPlus className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-3" />
                    </span>
                  </button>


                </div>
                <div className="flex flex-col items-center pb-2">
                  <img
                    loading="lazy"
                    src="/acorn-outdoor-stair-lift-uk.jpg"
                    alt="100 Pod Box"
                    className="object-cover max-w-56 aspect-[1.61]"
                  />
                  <p className="text-xl uppercase text-gray-800 font-bold m-3">For outdoor spaces</p>
                  <p className="text-lg text-slate-600 md:m-2 mx-8 text-center">The Acorn 160 stairlift for  outdoor spaces</p>
                  <button className="relative inline-flex text-nowrap h-12 mt-4 overflow-hidden rounded-lg">
                    <span className="group inline-flex items-center bg-black text-white px-4 py-2">
                      <Link href="/product/acorn-stairlifts-acorn-130-straight-stairlift">Shop Now{" "}</Link>
                      <FaCartPlus className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-3" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
