import { ProductSchema } from "./schema";

export interface CartProduct extends ProductSchema {
  quantity?: number;
}

export interface CookieCart {
  slug: string;
  quantity?: number;
}
