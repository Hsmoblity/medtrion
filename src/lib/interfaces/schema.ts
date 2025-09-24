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
  _related_options?: Array<number | string>;
  _related_options_products?: Array<{
    id?: string;
    databaseId?: number;
    name?: string;
    slug?: string;
    description?: string;
    type?: string;
    soldIndividually?: boolean;
    price?: any;
    regularPrice?: any;
    salePrice?: any;
    image?: string | { sourceUrl?: string } | null;
    gallery?: string[];
    variations?: Array<{
      id?: string;
      databaseId?: number;
      name?: string | null;
      price?: any;
      sku?: string | null;
      image?: string | { sourceUrl?: string } | null;
      attributes?: Array<{ id?: string; name?: string; value?: string }>;
    }>;
  }>;
}

