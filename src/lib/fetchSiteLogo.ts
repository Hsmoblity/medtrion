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
 * 
 * Note: Set LOGO_FIELD_TYPE in .env to optimize query order:
 * - LOGO_FIELD_TYPE=string (default) - Tries string query first
 * - LOGO_FIELD_TYPE=object - Tries object query first
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

    const logoFieldType = process.env.LOGO_FIELD_TYPE || 'string';

    // Optimize query order based on known field type
    if (logoFieldType === 'string') {
      // Try string query first (faster for string fields)
      try {
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
      } catch (stringError) {
        // String query failed, try object query
      }
    }

    // Try object query (either first if configured, or as fallback)
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
      // If object query fails and we haven't tried string yet, try it now
      if (logoFieldType !== 'string') {
        try {
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
        } catch (stringError) {
          // Both queries failed
        }
      }
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
  return logo?.sourceUrl || '/med-logo.png';
}

/**
 * Get logo alt text with fallback
 */
export function getLogoAlt(logo: SiteLogo | null | undefined): string {
  return logo?.altText || 'Medtrion Logo';
}
