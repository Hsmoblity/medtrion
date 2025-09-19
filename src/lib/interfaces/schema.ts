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
}

