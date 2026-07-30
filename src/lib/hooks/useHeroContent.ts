import { useState, useEffect } from 'react';
import {
HeroContent,
HeroContentResponse,
} from '../interfaces/hero';
import {
getProductsByCategory,
} from '../woocommerce';

/**

* Hook for fetching and managing hero section content.
* Fetches all products from the Stair Lifts category.
  */
  export const useHeroContent = (): HeroContentResponse => {
  const [content, setContent] =
  useState<HeroContent | null>(null);

const [loading, setLoading] =
useState(true);

const [error, setError] =
useState<string | null>(null);

useEffect(() => {
const fetchHeroContent = async () => {
try {
setLoading(true);
setError(null);


    // Fetch all products from the Stair Lifts category
    const data = await getProductsByCategory(
      'stair-lifts'
    ) as {
      products: {
        nodes: Array<{
          slug?: string;
        }>;
      };
    };

    const products =
      data.products?.nodes || [];

    console.log(
      'Hero Stair Lifts products:',
      products
    );

    // Get all Stair Lifts product slugs
    // No .slice() means all category products are included
    const stairLiftProductSlugs = products
      .map((product) => product.slug)
      .filter(
        (slug): slug is string =>
          Boolean(slug)
      );

    const heroContent: HeroContent = {
      title:
        'Express Your Freedom with Medtrion',

      subtitle:
        'Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products',

      statistics: [
        {
          value: '1000+',
          label: 'Satisfied Customers',
          icon: 'FaUsers',
        },
        {
          value: '5 Years',
          label: 'Warranty Coverage',
          icon: 'FaShieldAlt',
        },
        {
          value: '24/7',
          label: 'Expert Support',
          icon: 'FaHeadset',
        },
      ],

      ctaButtons: [
        {
          text: 'Explore Products',
          href: '/products',
          variant: 'primary',
        },
        {
          text: 'Get Free Quote',
          href:
            '/consultation/google-form',
          variant: 'secondary',
        },
      ],

      // All products from Stair Lifts category
      featuredProducts:
        stairLiftProductSlugs,
    };

    setContent(heroContent);
  } catch (err) {
    console.error(
      'Failed to fetch Stair Lifts products:',
      err
    );

    setError(
      err instanceof Error
        ? err.message
        : 'Failed to load Stair Lifts products'
    );

    // Hero content remains visible,
    // but old featured products are not used
    setContent({
      title:
        'Express Your Freedom with Medtrion',

      subtitle:
        'Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products',

      statistics: [
        {
          value: '1000+',
          label: 'Satisfied Customers',
          icon: 'FaUsers',
        },
        {
          value: '5 Years',
          label: 'Warranty Coverage',
          icon: 'FaShieldAlt',
        },
        {
          value: '24/7',
          label: 'Expert Support',
          icon: 'FaHeadset',
        },
      ],

      ctaButtons: [
        {
          text: 'Explore Products',
          href: '/products',
          variant: 'primary',
        },
        {
          text: 'Get Free Quote',
          href:
            '/consultation/google-form',
          variant: 'secondary',
        },
      ],

      featuredProducts: [],
    });
  } finally {
    setLoading(false);
  }
};

fetchHeroContent();


}, []);

return {
content: content || {
title:
'Express Your Freedom with Medtrion',


  subtitle:
    'Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products',

  statistics: [],

  ctaButtons: [],

  featuredProducts: [],
},

loading,

error,


};
};
