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

interface ContactPhone {
  name: string;
  number: string;
}

interface CustomAppProps extends AppProps {
  pageProps: {
    logo?: SiteLogo | null;
    contactPhone?: ContactPhone[];
    [key: string]: any;
  };
}

function MyApp({ Component, pageProps }: CustomAppProps) {
  return (
    <SessionProvider>
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

        <PageLayout logo={pageProps.logo} contactPhone={pageProps.contactPhone}>
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

// Fetch logo and contact phones globally for all pages
MyApp.getInitialProps = async (appContext: AppContext) => {
  // Call page's getInitialProps if it exists
  const appProps = await App.getInitialProps(appContext);

  // Fetch site logo once for all pages
  const logo = await fetchSiteLogo();

  // Fetch contact phone data
  let contactPhone: ContactPhone[] = [];
  try {
    const endpoint = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '';
    if (endpoint) {
      const client = new GraphQLClient(endpoint, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await client.request<{
        page: { contactFields: { contactPhone: ContactPhone[] } };
      }>(GET_CONTACT_INFO);
      
      if (data?.page?.contactFields?.contactPhone) {
        contactPhone = data.page.contactFields.contactPhone;
      }
    }
  } catch (error) {
    console.error('Failed to fetch contact phone data:', error);
  }

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      logo,
      contactPhone,
    },
  };
};

export default MyApp;
