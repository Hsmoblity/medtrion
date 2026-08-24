import Script from "next/script";
import "/globals.css";
import type { AppProps, AppContext } from "next/app";
import App from "next/app";
import PageLayout from "components/PageLayout/PageLayout";
import NextTopLoader from "nextjs-toploader";
import { Cursor } from "components/custom-cursor";
import { SessionProvider } from "contexts/SessionContext";
import { CartVisibilityProvider } from "contexts/cartVisibilityContext";
import ClientOnly from "components/ClientOnly";
import { SiteLogo, fetchSiteLogo } from "lib/fetchSiteLogo";
import { GraphQLClient } from "graphql-request";
import { GET_CONTACT_INFO } from "lib/graphql/queries";
import { PRIMARY_CONTACT_PHONE } from "lib/interfaces/footer";

interface ContactPhone {
  name: string;
  number: string;
}

interface ContactInfo {
  contactAddress: string;
  contactEmail: string;
  contactPhone: ContactPhone[];
}

interface CustomAppProps extends AppProps {
  pageProps: {
    logo?: SiteLogo | null;
    contactInfo?: ContactInfo | null;
    [key: string]: any;
  };
}

function MyApp({ Component, pageProps }: CustomAppProps) {
  return (
    <SessionProvider>
      <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F38S3008XY"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-F38S3008XY');
          `}
        </Script>
      <CartVisibilityProvider>
        <NextTopLoader
          color="#debe75"
          initialPosition={0.3}
          crawlSpeed={500}
          height={6}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={400}
          zIndex={1600}
          showAtBottom={false}
        />

        <PageLayout logo={pageProps.logo} contactInfo={pageProps.contactInfo}>
          <Component {...pageProps} />
        </PageLayout>

        {/* Custom cursor - can be disabled by setting environment variable */}
        {process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR !== 'false' && (
          <ClientOnly>
            <Cursor>
              <div></div>
            </Cursor>
          </ClientOnly>
        )}
      </CartVisibilityProvider>
    </SessionProvider>
  );
}

// Fetch logo and contact info globally for all pages
MyApp.getInitialProps = async (appContext: AppContext) => {
  // Call page's getInitialProps if it exists
  const appProps = await App.getInitialProps(appContext);

  // Fetch site logo once for all pages
  const logo = await fetchSiteLogo();

  // Fetch contact info (address, email, phones)
  let contactInfo: ContactInfo | null = null;
  try {
    const endpoint = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '';
    if (endpoint) {
      const client = new GraphQLClient(endpoint, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await client.request<{
        page: { contactFields: ContactInfo };
      }>(GET_CONTACT_INFO);
      
      if (data?.page?.contactFields) {
        contactInfo = {
          ...data.page.contactFields,
          contactPhone: [{ name: "", number: PRIMARY_CONTACT_PHONE }],
        };
      }
    }
  } catch (error) {
    console.error('Failed to fetch contact info from CMS:', error);
  }

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      logo,
      contactInfo,
    },
  };
};

export default MyApp;
