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

const FALLBACK_CONTENT = `
  <p>Medtrion are committed to protecting your privacy, and support a general policy of openness about how we collect, use and disclose your Personal Information in accordance with relevant data protection laws.</p>
  <p>The purpose of this Privacy Policy is to inform you about Medtrion practices relating to the collection, use and disclosure of Personal Information that may be provided through access to or use of our websites, services or products, or that may otherwise be collected by us. By using any of Medtrion websites, mobile applications or other digital platforms that link to this Privacy Policy, you consent to the collection, use and disclosure of your Personal Information in accordance with this Privacy Policy.</p>
  <p>This Privacy Policy also explains how you can contact us if you have a question about, want to access, correct or delete any Personal Information that Medtrion may be holding about you.</p>
`;

const PrivacyPolicyPage: React.FC<LegalPageProps> = ({ title, content, modified }) => {
  const lastUpdated = modified
    ? new Date(modified).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <PageLayout hideFooter>
      <MetaHead
        title="Privacy Policy - Medtrion"
        description="Read Medtrion's Privacy Policy to understand how we collect, use, and protect your personal information."
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-r from-[#0b1f3a] via-[#153a5f] to-[#3fa2a3] text-white pt-20 pb-12 sm:pt-24 sm:pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">{title}</h1>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                How we collect, use, and protect your personal information.
              </p>
              {lastUpdated && (
                <p className="text-sm sm:text-base text-gray-400 mt-4">Last updated: {lastUpdated}</p>
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
                  <a href="/terms-of-service" className="text-green-600 hover:text-green-800 hover:underline">Terms of Service</a>
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
      query GetPrivacyPolicy {
        page(id: "/privacy-policy-2/", idType: URI) {
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
    console.error('Failed to fetch privacy policy from CMS:', error);
    return {
      props: {
        title: 'Privacy Policy',
        content: FALLBACK_CONTENT,
        modified: null,
      },
      revalidate: 3600,
    };
  }
};

export default PrivacyPolicyPage;
