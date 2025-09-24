import { CartProduct } from "lib/interfaces";
import Item from "./Item";

interface ItemListProps {
  products: CartProduct[];
}

const ItemList: React.FC<ItemListProps> = ({ products }) => {
  return (
    <div className="flex flex-col">
      {products.map((product) => (
        <Item key={String(product.cartItemId ?? `ci_${product.slug}`)} product={product} />
      ))}
    </div>
  );
};

export default ItemList;
