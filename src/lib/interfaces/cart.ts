import { ProductSchema } from "./schema";

export interface CartProduct extends ProductSchema {
  cartItemId?: string | number | null;
  quantity?: number;
  variationId?: string | number | null;
  options?: Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>;
}

export interface CookieCart {
  cartItemId?: string;
  slug: string;
  quantity?: number;
}
