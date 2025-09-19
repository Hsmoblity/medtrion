import Types from "./types";
import { ProductSchema } from "lib/interfaces";

export interface BulkAddAction {
  type: Types.bulkAdd;
  payload: ProductSchema[];
}

export interface AddToCartAction {
  type: Types.addToCart;
  payload: any; // payload should include cartItemId (optional) and full product data
}

export interface UpdateCartItemAction {
  type: Types.updateCartItem;
  payload: { cartItemId: string; changes: any };
}

export interface RemoveSingleItemAction {
  type: Types.removeSingleItem;
  payload: { cartItemId: string };
}

export interface RemoveWholeProduct {
  type: Types.removeWholeProduct;
  payload: { cartItemId: string };
}

export interface RemoveAllItems {
  type: Types.removeAllItems;
}
