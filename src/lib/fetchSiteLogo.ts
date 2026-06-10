/**
 * Site Logo Fetcher
 * 
 * Fetches the site logo from WordPress GraphQL (ACF custom field)
 * Used by _app.tsx to provide logo globally to Header, Drawer, and Footer
 */

import { GraphQLClient } from 'graphql-request';

export interface SiteLogo {
  sourceUrl: string;
  altText?: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

/**
 * Fetch site logo from WordPress GraphQL
 * Queries the ACF logo field from the contact page
 * Handles both String (URL only) and Object (with metadata) return types
 */
export async function fetchSiteLogo(): Promise<SiteLogo | null> {
  try {
    const endpoint = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '';
    if (!endpoint) {
      console.warn('No GraphQL endpoint configured for logo fetch');
      return null;
    }

    const client = new GraphQLClient(endpoint, {
      headers: { 'Content-Type': 'application/json' },
    });

    // First try: Query logo as an object (Image field with metadata)
    try {
      const dataWithObject = await client.request<{
        page: { 
          contactFields: { 
            logo: SiteLogo 
          } 
        };
      }>(`
        query GetSiteLogo {
          page(id: "/contacts/", idType: URI) {
            contactFields {
              logo {
                sourceUrl
                altText
                mediaDetails {
                  width
                  height
                }
              }
            }
          }
        }
      `);

      if (dataWithObject.page?.contactFields?.logo) {
        return dataWithObject.page.contactFields.logo;
      }
    } catch (objectError: any) {
      // If object query fails, logo might be a string field
      console.log('Logo field is not an object, trying string query...');
    }

    // Second try: Query logo as a string (URL only)
    const dataWithString = await client.request<{
      page: { 
        contactFields: { 
          logo: string 
        } 
      };
    }>(`
      query GetSiteLogoString {
        page(id: "/contacts/", idType: URI) {
          contactFields {
            logo
          }
        }
      }
    `);

    const logoUrl = dataWithString.page?.contactFields?.logo;
    if (logoUrl && typeof logoUrl === 'string') {
      return {
        sourceUrl: logoUrl,
        altText: 'Medtrion Logo',
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch site logo from CMS:', error);
    return null;
  }
}

/**
 * Get logo URL with fallback
 * Returns CMS logo URL or fallback to static file
 */
export function getLogoUrl(logo: SiteLogo | null | undefined): string {
  return logo?.sourceUrl || '/Logo.png';
}

/**
 * Get logo alt text with fallback
 */
export function getLogoAlt(logo: SiteLogo | null | undefined): string {
  return logo?.altText || 'Medtrion Logo';
}
