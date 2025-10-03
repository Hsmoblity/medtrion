"use client";

import { ProductSchema } from "lib/interfaces";
import ProductCard from '../ui/ProductCard';



const Card = ({ product }: { product: ProductSchema }) => {
  return (
    <ProductCard
      product={product}
      variant="basic"
      showConfigureButton={true}
      showAddToCartButton={true}
      cardClickBehavior="configurator"
    />
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