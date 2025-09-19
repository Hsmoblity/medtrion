import Cookies from "js-cookie";
import Types from "./types";
import { CartProduct, CookieCart } from "lib/interfaces";
import {
  AddToCartAction,
  RemoveSingleItemAction,
  BulkAddAction,
  RemoveWholeProduct,
  UpdateCartItemAction,
  RemoveAllItems
} from "./actions";

const cartItemsStr = Cookies.get("_cart");
const parsedCartItems = cartItemsStr ? JSON.parse(cartItemsStr) : [];

export const initialState = parsedCartItems;

export type ACTIONTYPES =
  | AddToCartAction
  | RemoveSingleItemAction
  | RemoveWholeProduct
  | BulkAddAction
  | UpdateCartItemAction
  | RemoveAllItems;

// small uuid generator for cartItemId
const uuid = () => 'ci_' + Math.random().toString(36).slice(2, 9);

export const cartReducer = (state: CartProduct[], action: ACTIONTYPES) => {
  switch (action.type) {
    case Types.bulkAdd:
      return action.payload;
    case Types.addToCart: {
      const payload: any = action.payload;
      // ensure each cart item has a unique cartItemId so duplicates with different options can coexist
      const cartItemId = payload.cartItemId || uuid();
      const itemToAdd: CartProduct = {
        ...payload,
        cartItemId,
        quantity: payload.quantity ?? 1
      };
      // If an existing cart item has the same cartItemId, increase its quantity
      let found = false;
      const newCart = state.map((p) => {
        if (p.cartItemId && p.cartItemId === cartItemId) {
          found = true;
          return { ...p, quantity: Number(p.quantity) + Number(itemToAdd.quantity || 1) };
        }
        return p;
      });
      const cart = found ? newCart : [...state, itemToAdd];
      updateCookie(cart);
      return cart;
    }

    case Types.removeSingleItem: {
      const { cartItemId } = (action.payload as any) || {};
      const newCart = state.reduce((items: CartProduct[], item: CartProduct) => {
        if (item.cartItemId === cartItemId && item.quantity && item.quantity > 1) {
          return [...items, { ...item, quantity: item.quantity - 1 }];
        }
        if (item.cartItemId !== cartItemId) return [...items, item];
        return items;
      }, [] as CartProduct[]);
      updateCookie(newCart);
      return newCart;
    }

    case Types.removeWholeProduct: {
      const { cartItemId } = (action.payload as any) || {};
      const filtered = state.filter((item) => item.cartItemId !== cartItemId);
      updateCookie(filtered);
      return filtered;
    }

    case Types.removeAllItems:
      updateCookie([]);
      return [];

    case Types.updateCartItem: {
      const { cartItemId, changes } = action.payload as any;
      const updated = state.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        return { ...item, ...changes };
      });
      updateCookie(updated);
      return updated;
    }

    default:
      throw new Error();
  }
};

const updateCookie = (cartItems: CartProduct[]) => {
  const cookieProducts =
    cartItems.length > 0 &&
    cartItems.map((item: CartProduct) => ({ cartItemId: item.cartItemId, slug: item.slug, quantity: item.quantity }));
  Cookies.set("_cart", JSON.stringify(cookieProducts || []), {
    expires: 30,
    secure: true,
    sameSite: "lax"
  });
};
