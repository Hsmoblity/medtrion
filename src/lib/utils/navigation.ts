import { useRouter } from 'next/router';
import { useCallback } from 'react';

/**
 * Analytics tracking for navigation events
 */
interface NavigationEvent {
  linkName: string;
  destination: string;
  linkType: 'internal' | 'external' | 'anchor' | 'tel' | 'mailto';
  deviceType: 'desktop' | 'mobile';
}

const trackNavigation = (event: NavigationEvent) => {
  // Google Analytics tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'navigation_click', {
      event_category: 'Navigation',
      event_label: event.linkName,
      custom_map: {
        destination: event.destination,
        link_type: event.linkType,
        device_type: event.deviceType
      }
    });
  }

  // Custom analytics logging
  console.log('Navigation Event:', {
    timestamp: new Date().toISOString(),
    ...event
  });

  // Send to custom analytics endpoint if available
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'navigation',
        ...event
      })
    }).catch(error => {
      console.warn('Analytics tracking failed:', error);
    });
  }
};

/**
 * Custom hook for handling cross-page anchor navigation
 * Ensures proper navigation from any page to homepage sections
 */
export const useAnchorNavigation = () => {
  const router = useRouter();

  const navigateToAnchor = useCallback(async (href: string, linkName?: string) => {
    // Parse the href to extract path and hash
    const url = new URL(href, window.location.origin);
    const path = url.pathname;
    const hash = url.hash;

    // Determine link type and device type
    const linkType = href.startsWith('#') ? 'anchor' : 
                    href.startsWith('tel:') ? 'tel' :
                    href.startsWith('mailto:') ? 'mailto' :
                    href.startsWith('http') ? 'external' : 'internal';
    
    const deviceType = window.innerWidth >= 768 ? 'desktop' : 'mobile';

    // Track navigation event
    if (linkName) {
      trackNavigation({
        linkName,
        destination: href,
        linkType: linkType as any,
        deviceType
      });
    }

    // If we're already on the target page and have a hash, just scroll
    if (router.asPath.split('#')[0] === path && hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Navigate to the page first
    if (hash) {
      // For hash navigation, navigate to the page then scroll
      await router.push(path);
      
      // Wait for the page to load and then scroll to the anchor
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Small delay to ensure DOM is ready
    } else {
      // Regular navigation without hash
      await router.push(href);
    }
  }, [router]);

  return { navigateToAnchor };
};

/**
 * Utility function to handle anchor navigation without hooks (for use in event handlers)
 */
export const handleAnchorNavigation = async (href: string, router: any, linkName?: string) => {
  const url = new URL(href, window.location.origin);
  const path = url.pathname;
  const hash = url.hash;

  // Determine link type and device type
  const linkType = href.startsWith('#') ? 'anchor' : 
                  href.startsWith('tel:') ? 'tel' :
                  href.startsWith('mailto:') ? 'mailto' :
                  href.startsWith('http') ? 'external' : 'internal';
  
  const deviceType = window.innerWidth >= 768 ? 'desktop' : 'mobile';

  // Track navigation event
  if (linkName) {
    trackNavigation({
      linkName,
      destination: href,
      linkType: linkType as any,
      deviceType
    });
  }

  // If we're already on the target page and have a hash, just scroll
  if (router.asPath.split('#')[0] === path && hash) {
    const element = document.getElementById(hash.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }

  // Navigate to the page first
  if (hash) {
    // For hash navigation, navigate to the page then scroll
    await router.push(path);
    
    // Wait for the page to load and then scroll to the anchor
    setTimeout(() => {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  } else {
    // Regular navigation without hash
    await router.push(href);
  }
};