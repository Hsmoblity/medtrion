import { ProductSchema } from "./schema";

export interface CartProduct extends ProductSchema {
  cartItemId?: string;
  quantity?: number;
  variationId?: string | number;
  options?: Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>;
}

export interface CookieCart {
  cartItemId?: string;
  slug: string;
  quantity?: number;
}
