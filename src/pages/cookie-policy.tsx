import React from 'react';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { GraphQLClient } from 'graphql-request';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';
import Hero from "@/components/common/Hero";
interface LegalPageProps {
  title: string;
  content: string;
  modified: string | null;
}

const CookiePolicyPage: React.FC<LegalPageProps> = ({ title, content, modified }) => {
  const lastUpdated = modified
    ? new Date(modified).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <PageLayout hideFooter>
      <MetaHead
        title="Cookie Policy | Medtrion"
        description="Learn how Medtrion uses cookies to improve your browsing experience, and how you can manage your cookie preferences."
      />

      <div className="min-h-screen bg-gray-50">
        <Hero
            badge={`Last updated: ${lastUpdated}`}
            title="Cookie Policy"
            description="Learn how we use cookies and similar technologies to enhance your experience."
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Cookie Policy" },
            ]}
          />

        {/* Content */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12"
            >
              <div
                className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-brand-primary hover:prose-a:text-brand-dark"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <div className="border-t pt-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/privacy-policy" className="text-brand-primary hover:text-brand-dark hover:underline">Privacy Policy</a>
                  <a href="/terms-of-service" className="text-brand-primary hover:text-brand-dark hover:underline">Terms of Service</a>
                  <a href="/contact" className="text-brand-primary hover:text-brand-dark hover:underline">Contact Us</a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export const getStaticProps: GetStaticProps<LegalPageProps> = async () => {
  try {
    const endpoint = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '';
    const client = new GraphQLClient(endpoint, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await client.request<{
      page: { title: string; content: string; modified: string } | null;
    }>(`
      query GetCookiePolicy {
        page(id: "/cookie-policy/", idType: URI) {
          title
          content
          modified
        }
      }
    `);

    if (!data.page) throw new Error('Page not found in CMS');

    return {
      props: {
        title: data.page.title,
        content: data.page.content,
        modified: data.page.modified,
      },
      revalidate: 86400,
    };
  } catch (error) {
    console.error('Failed to fetch cookie policy from CMS:', error);
    return {
      props: {
        title: 'Cookie Policy',
        content: '<p>Please contact us for our full Cookie Policy.</p>',
        modified: null,
      },
      revalidate: 3600,
    };
  }
};

export default CookiePolicyPage;
