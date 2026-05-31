import React from 'react';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { GraphQLClient } from 'graphql-request';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';

interface LegalPageProps {
  title: string;
  content: string;
  modified: string | null;
}

const TermsOfServicePage: React.FC<LegalPageProps> = ({ title, content, modified }) => {
  const lastUpdated = modified
    ? new Date(modified).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <PageLayout>
      <MetaHead
        title="Terms of Service - Medtrion"
        description="Read the terms and conditions for using Medtrion services and website. Understand your rights and responsibilities."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-green-900 to-green-800 text-white pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">{title}</h1>
              <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto">
                Please read these terms and conditions carefully before using our services.
              </p>
              {lastUpdated && (
                <p className="text-sm sm:text-base text-green-200 mt-4">Last updated: {lastUpdated}</p>
              )}
            </motion.div>
          </div>
        </section>

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
                className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-green-600 hover:prose-a:text-green-800"
                dangerouslySetInnerHTML={{ __html: content }}
              />

              <div className="border-t pt-6 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/privacy-policy" className="text-green-600 hover:text-green-800 hover:underline">Privacy Policy</a>
                  <a href="/cookie-policy" className="text-green-600 hover:text-green-800 hover:underline">Cookie Policy</a>
                  <a href="/contact" className="text-green-600 hover:text-green-800 hover:underline">Contact Us</a>
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
      query GetTermsOfService {
        page(id: "/terms-of-service/", idType: URI) {
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
    console.error('Failed to fetch terms of service from CMS:', error);
    return {
      props: {
        title: 'Terms of Service',
        content: '<p>Please contact us for our full Terms of Service.</p>',
        modified: null,
      },
      revalidate: 3600,
    };
  }
};

export default TermsOfServicePage;
