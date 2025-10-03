import { Document } from '@contentful/rich-text-types';

export interface ProductSchema {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  featuredImage: string | { sourceUrl?: string };
  productSpecifications: string | Document;
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
  options?: Array<{ name: string; type?: string; selected?: boolean; quantity?: number; value?: string }>;
  relatedOptions?: Array<number | string>;
  _related_options?: Array<number | string>;
  _related_options_products?: Array<{
    id?: string;
    databaseId?: number;
    name?: string;
    slug?: string;
    description?: string | null;
    type?: string | null;
    relatedOptions?: any | null;
    variableType?: string | null;
    // attributes are provided as an array of nodes
    attributes?: Array<{ id?: string; name?: string; value?: string }>;
    // variations are returned as a flat array
    variations?: Array<{
      id?: string | null;
      databaseId?: number | null;
      name?: string | null;
      price?: any;
      sku?: string | null;
      image?: string | { sourceUrl?: string } | null;
      attributes?: Array<{ id?: string; name?: string; value?: string }>;
    }>;
  }>;
}

