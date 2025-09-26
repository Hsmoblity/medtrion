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

let parsedCartItems: any[] = [];
if (typeof window !== "undefined") {
  const cartItemsStr = Cookies.get("_cart");
  if (cartItemsStr) {
    try {
      const raw = JSON.parse(cartItemsStr);
      if (Array.isArray(raw)) parsedCartItems = raw;
    } catch (e) {
      // ignore malformed cookie and start fresh
      parsedCartItems = [];
    }
  }
}

// Normalize cookie-loaded items into the in-memory CartProduct shape
export const initialState = parsedCartItems.map((it: any) => ({
  cartItemId: it.cartItemId || uuid(),
  slug: it.slug,
  quantity: Number(it.quantity ?? 1),
  variationId: it.variationId ?? null,
  options: it.options ?? [],
  // Optional friendly fields to help client UI without extra fetches
  name: it.name ?? undefined,
  price: it.price ?? undefined
}));

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
  // Persist a compact but useful shape to the cookie so session restore
  // and client-side editors have enough information without refetching.
  const cookieProducts =
    cartItems.length > 0 &&
    cartItems.map((item: CartProduct) => ({
      cartItemId: item.cartItemId,
      slug: item.slug,
      quantity: item.quantity,
      variationId: (item as any).variationId ?? null,
      options: (item as any).options ?? [],
      // store friendly display fields to avoid an extra product fetch on restore
      name: (item as any).name ?? undefined,
      price: (item as any).price ?? undefined
    }));

  if (typeof window !== "undefined") {
    const isHttps = window.location && window.location.protocol === "https:";
    Cookies.set("_cart", JSON.stringify(cookieProducts || []), {
      expires: 30,
      secure: isHttps,
      sameSite: "lax"
    });
  }
};
