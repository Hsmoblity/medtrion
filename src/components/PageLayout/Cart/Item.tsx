import { useContext } from "react";
import { CartProduct } from "lib/interfaces";
import Image from "next/image";
import CartItemsContext from "contexts/cartItemsContext";
import Types from "reducers/cart/types";
import { normalizeImageUrl } from '../../../lib/utils/image'
// import urlFor from "lib/sanity/urlFor";

interface ItemProps {
  product: CartProduct;
}

const Item: React.FC<ItemProps> = ({ product }) => {
  const { dispatch } = useContext(CartItemsContext);
  const { slug, productPictures, title, price, quantity } = product;

  const removeWholeProduct = () => {
    dispatch({
      type: Types.removeWholeProduct,
      payload: slug
    });
  };

  const removeSingleItem = () => {
    dispatch({
      type: Types.removeSingleItem,
      payload: slug
    });
  };

  const addSingleItem = () => {
    dispatch({
      type: Types.addToCart,
      payload: product
    });
  };

  const getSafeImage = () =>
    normalizeImageUrl(productPictures?.[0]?.fields?.file?.url || product.featuredImage)

  return (
    <div>
      <div className="flex flex-row mb-3 justify-between">
        <div className="w-4/5 flex flex-row">
          <Image
            src={getSafeImage()}
            width={64}
            height={64}
            className="clickable-img"
            quality={100}
            alt={title}
          />
          <span className="text-lg ml-4 text-black">{title}</span>
        </div>
        <div className="w-1/5">
          <span className="text-lg text-black">
            ${price * Number(quantity)}
          </span>
        </div>
      </div>
      <div className="flex flex-row">
        <button
          onClick={removeWholeProduct}
          className="border border-gray-500 p-1 border-solid w-9 h-9 flex flex-row justify-center items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <input
          type="text"
          className="border border-gray-500 p-1 border-solid bg-transparent ml-2 outline-none text-black flex-1 h-9 pl-3"
          value={quantity}
          disabled
        />
        <button
          className="border border-gray-500 p-1 border-solid w-9 h-9 flex flex-row justify-center items-center text-black font-black text-2xl"
          onClick={removeSingleItem}
        >
          -
        </button>
        <button
          className="border border-gray-500 p-1 border-solid w-9 h-9 flex flex-row justify-center items-center text-black font-black text-2xl"
          onClick={addSingleItem}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Item;
