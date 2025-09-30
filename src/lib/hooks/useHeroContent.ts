import { useState, useEffect } from 'react';
import { HeroContent, HeroContentResponse } from '../interfaces/hero';

/**
 * Hook for fetching and managing hero section content
 * Integrates with Contentful CMS for dynamic content
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

        // For now, use mock data - will be replaced with Contentful integration
        const mockContent: HeroContent = {
          title: "Express Your Freedom with HS Mobility",
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
              href: "/contact",
              variant: "secondary"
            }
          ],
          featuredProducts: [
            "acorn-stairlifts-acorn-180-curved-stairlift",
            "acorn-stairlifts-acorn-130-straight-stairlift",
            "acorn-stairlifts-outdoor-stairlift"
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setContent(mockContent);
      } catch (err) {
        console.error('Failed to fetch hero content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load hero content');
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  return {
    content: content || {
      title: "Express Your Freedom with HS Mobility",
      subtitle: "Empowering 1000+ Satisfied Customers to Stay Independent with Exceptional mobility products",
      statistics: [],
      ctaButtons: [],
      featuredProducts: []
    },
    loading,
    error
  };
};
