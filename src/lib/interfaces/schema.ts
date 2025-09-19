import { Document } from '@contentful/rich-text-types';

export interface ProductSchema {
  title: string;
  slug: string;
  shortDescription: string;
  featuredImage: any,
  productSpecifications: Document;
  productPictures: any;
  price: number;
  affiliate: boolean;
  productId?: string;
  variations?: Array<{
    id: string;
    databaseId?: number;
    price?: number;
    sku?: string;
    image?: { sourceUrl?: string };
    attributes?: Array<{ id?: string; name: string; value: string }>
  }>;
  options?: Array<{ name: string; type?: string; priceModifier?: number; selected?: boolean; quantity?: number; value?: string }>;
}

