import "/globals.css";
import type { AppProps } from "next/app";
import PageLayout from "components/PageLayout/PageLayout";
import NextTopLoader from "nextjs-toploader";
import { Cursor } from "components/custom-cursor";
import { SessionProvider } from "contexts/SessionContext";
import { CartVisibilityProvider } from "contexts/cartVisibilityContext";

function MyApp({ Component, pageProps }: AppProps) {
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

        <PageLayout>
          <Component {...pageProps} />
        </PageLayout>

        {/* Custom cursor - can be disabled by setting environment variable */}
        {process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR !== 'false' && <Cursor />}
      </CartVisibilityProvider>
    </SessionProvider>
  );
}

export default MyApp;
