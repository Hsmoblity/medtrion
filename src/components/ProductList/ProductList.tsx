"use client";

import { useCartStore } from "stores/cartStore";
import CartVisibilityContext from "contexts/cartVisibilityContext";
import { useRouter } from 'next/navigation';
import { ProductSchema } from "lib/interfaces";
import Link from "next/link";
import { useContext } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { normalizeImageUrl } from '../../lib/utils/image'
import dynamic from 'next/dynamic';
import { Document } from "@contentful/rich-text-types";
import { PrimaryButton } from '../ui';
const RichContent = dynamic(() => import('components/RichContent'), { ssr: false });



const Card = ({ product }: { product: ProductSchema }) => {

  const { toggleCartVisibility } = useContext(CartVisibilityContext);
  const addToCart = useCartStore(state => state.addToCart);
  const router = useRouter();

  // Handle adding to the cart
  const handleAddToCart = () => {
    const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);
    const safePictures = Array.isArray(product.productPictures) && product.productPictures.length ? product.productPictures : [{ fields: { file: { url: product.featuredImage || '/temp.webp' } } }];
    const cartProduct = {
      slug: product.slug,
      title: product.title,
      price: Number(product.price) || 0,
      quantity: 1,
      productPictures: safePictures,
      affiliate: product.affiliate,
      productId: product.productId || undefined,
      // Required CartProduct fields
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      featuredImage: product.featuredImage || '',
      productSpecifications: product.productSpecifications || ''
    };

    // Add to cart using Zustand store (cartItemId will be generated automatically)
    addToCart(cartProduct);
    // Navigate to canonical cart page instead of toggling mini-cart
    try {
      router.push('/cart');
    } catch (e) {
      // Fallback to toggling visibility if router isn't available
      toggleCartVisibility();
    }
  };
  // Determine the image to use
  const imageSrc = normalizeImageUrl(product.productPictures?.[1]?.fields?.file?.url || product.featuredImage)

  // Ensure price is a finite number before formatting to avoid NaN during SSR
  const numericPrice = Number(product.price);
  const safePrice = Number.isFinite(numericPrice) ? numericPrice : 0;

  return (
    <article className="rounded-xl bg-white p-3 shadow-lg hover:shadow-xl transform hover:scale-105 duration-300">
      <Link href={`/product/${product.slug}`}>
        <div className="relative flex items-end overflow-hidden rounded-xl">
          <img
            src={imageSrc}
            alt={`${product.title} Image`}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="mt-1 p-2">
          <h2 className="text-slate-700 font-poppins font-black">{product.title}</h2>
          {/* Render shortDescription client-side to avoid hydration mismatch */}
          <div className="mt-1 text-sm text-slate-400 font-semibold line-clamp-3">
            <RichContent content={(product as any).shortDescription || ''} />
          </div>
          <div className="mt-3 flex items-end justify-between">
            {product.affiliate ? (
              // Affiliate-specific UI
              <>
                <button className="text-sm leading-8 font-bold text-black underline">
                  Learn More
                </button>
                <div className="flex items-center space-x-1.5 rounded-lg bg-black px-4 py-1.5 text-white duration-100 hover:bg-slate-800">
                  <button className="text-sm">Get a Quote</button>
                </div>
              </>
            ) : (
              // Non-affiliate product UI
              <>
                <p className="text-lg font-bold text-blue-500">${safePrice.toFixed(2)}</p>
                <div className="flex flex-col space-y-2">
                  {/* Configure Button - Primary Action */}
                  <PrimaryButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/product/${product.slug}/configure`);
                    }}
                    size="sm"
                    fullWidth
                  >
                    <span className="text-sm font-medium">Configure</span>
                    <svg className="h-4 w-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </PrimaryButton>
                  
                  {/* Add to Cart Button - Secondary Action */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // If product requires option selection, route to options page like product view
                      if (
                        (product.variations && product.variations.length > 0) ||
                        (product.options && Array.isArray(product.options) && product.options.length > 0) ||
                        (product._related_options && Array.isArray(product._related_options) && product._related_options.length > 0)
                      ) {
                        router.push(`/product/${product.slug}/options`);
                        return;
                      }
                      handleAddToCart();
                    }} 
                    className="flex items-center justify-center space-x-1.5 rounded-lg bg-gray-600 px-4 py-1.5 text-white duration-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <span className="text-sm">Add to cart</span>
                    <FaShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};


const ProductList = ({ products }: { products: ProductSchema[] }) => (
  <section id="shop" className="py-10 bg-inherit">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <Card key={index} product={product} />
      ))}
    </div>
  </section>
);

export default ProductList;