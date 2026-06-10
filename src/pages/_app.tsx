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

interface CustomAppProps extends AppProps {
  pageProps: {
    logo?: SiteLogo | null;
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

        <PageLayout logo={pageProps.logo}>
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

// Fetch logo globally for all pages
MyApp.getInitialProps = async (appContext: AppContext) => {
  // Call page's getInitialProps if it exists
  const appProps = await App.getInitialProps(appContext);

  // Fetch site logo once for all pages
  const logo = await fetchSiteLogo();

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      logo,
    },
  };
};

export default MyApp;
