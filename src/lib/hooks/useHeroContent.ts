import { useState, useEffect } from 'react';
import { HeroContent, HeroContentResponse } from '../interfaces/hero';
import { runClientRequest } from '../woocommerce';
import { GET_FEATURED_PRODUCTS } from '../graphql/queries';

/**
 * Hook for fetching and managing hero section content
 * Integrates with WooCommerce GraphQL for real product data
 */
export const useHeroContent = (): HeroContentResponse => {
  const [content, setContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real products from WooCommerce GraphQL
        const data = await runClientRequest(GET_FEATURED_PRODUCTS) as { products: { nodes: any[] } };
        const products = data.products.nodes || [];

        // Extract product slugs for featured products
        const featuredProductSlugs = products.slice(0, 3).map(product => product.slug).filter(Boolean);

        // Create hero content with real product data
        const heroContent: HeroContent = {
          title: "Express Your Freedom with Medtrion",
          subtitle: "Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products",
          statistics: [
            {
              value: "1000+",
              label: "Satisfied Customers",
              icon: "FaUsers"
            },
            {
              value: "5 Years",
              label: "Warranty Coverage",
              icon: "FaShieldAlt"
            },
            {
              value: "24/7",
              label: "Expert Support",
              icon: "FaHeadset"
            }
          ],
          ctaButtons: [
            {
              text: "Explore Products",
              href: "/products",
              variant: "primary"
            },
            {
              text: "Get Free Quote",
              href: "/consultation/google-form",
              variant: "secondary"
            }
          ],
          featuredProducts: featuredProductSlugs.length > 0 
            ? featuredProductSlugs 
            : [
                "acorn-stairlifts-acorn-180-curved-stairlift",
                "acorn-stairlifts-acorn-130-straight-stairlift",
                "acorn-stairlifts-outdoor-stairlift"
              ] // Fallback to known product slugs
        };

        setContent(heroContent);
      } catch (err) {
        console.error('Failed to fetch hero content:', err);
        
        // Fallback to mock content if API fails
        const fallbackContent: HeroContent = {
          title: "Express Your Freedom with Medtrion",
          subtitle: "Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products",
          statistics: [
            {
              value: "1000+",
              label: "Satisfied Customers",
              icon: "FaUsers"
            },
            {
              value: "5 Years",
              label: "Warranty Coverage",
              icon: "FaShieldAlt"
            },
            {
              value: "24/7",
              label: "Expert Support",
              icon: "FaHeadset"
            }
          ],
          ctaButtons: [
            {
              text: "Explore Products",
              href: "/products",
              variant: "primary"
            },
            {
              text: "Get Free Quote",
              href: "/consultation/google-form",
              variant: "secondary"
            }
          ],
          featuredProducts: [
            "acorn-stairlifts-acorn-180-curved-stairlift",
            "acorn-stairlifts-acorn-130-straight-stairlift",
            "acorn-stairlifts-outdoor-stairlift"
          ]
        };
        
        setContent(fallbackContent);
        setError(err instanceof Error ? err.message : 'Failed to load hero content');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  return {
    content: content || {
      title: "Express Your Freedom with Medtrion",
      subtitle: "Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products",
      statistics: [],
      ctaButtons: [],
      featuredProducts: []
    },
    loading,
    error
  };
};
