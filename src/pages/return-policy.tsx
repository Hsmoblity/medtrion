import React from 'react';
import { GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import { GraphQLClient } from 'graphql-request';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';
import Hero from '@/components/common/Hero';

interface LegalPageProps {
  title: string;
  content: string;
  modified: string | null;
}

const FALLBACK_CONTENT = `
<h2>Return & Refund Policy</h2>

<p><strong>Last Updated:</strong> August 2026</p>

<p>
At Medtrion, customer satisfaction is our priority. If you are not completely satisfied with your purchase, we're here to help. Please read our Return & Refund Policy carefully before initiating a return.
</p>

<h3>Return Eligibility</h3>

<p>
Products may be returned within <strong>30 days</strong> from the date of delivery if they meet the following conditions:
</p>

<ul>
<li>Product is unused and in its original condition.</li>
<li>Original packaging, accessories, manuals, and labels are included.</li>
<li>Product has not been damaged, modified, or misused.</li>
<li>Proof of purchase (invoice or order confirmation) is provided.</li>
</ul>

<p>
Products returned without prior authorization may not be accepted.
</p>

<h3>Non-Returnable Items</h3>

<p>
For health, safety, and hygiene reasons, the following items cannot be returned:
</p>

<ul>
<li>Opened or used medical consumables</li>
<li>Personal care or hygiene products</li>
<li>Customized or special-order products</li>
<li>Clearance or final sale items</li>
<li>Gift cards</li>
<li>Products marked as Non-Returnable</li>
</ul>

<h3>Damaged or Defective Products</h3>

<p>If your order arrives damaged, defective, or incorrect:</p>

<ul>
<li>Notify us within 48 hours of delivery.</li>
<li>Email clear photos of the product.</li>
<li>Email clear photos of the packaging.</li>
<li>Email clear photos of the shipping label.</li>
<li>Include your Order Number.</li>
</ul>

<p>
Once verified, we will provide a replacement or issue a refund where applicable.
</p>

<h3>Return Process</h3>

<p>To request a return:</p>

<p>
<strong>Email:</strong> support@medtrion.ca
</p>

<p>Please include:</p>

<ul>
<li>Order Number</li>
<li>Customer Name</li>
<li>Product Name</li>
<li>Reason for Return</li>
<li>Photos (if product is damaged or defective)</li>
</ul>

<p>
Our support team will review your request and provide Return Authorization (RMA) instructions.
</p>

<p>
<strong>Do not send products back without receiving return authorization.</strong>
</p>

<h3>Refunds</h3>

<ul>
<li>Approved refunds will be processed to the original payment method.</li>
<li>Refunds typically take 5–10 business days depending on your bank or payment provider.</li>
<li>Original shipping charges are non-refundable unless the return is due to our error.</li>
</ul>

<h3>Exchange Policy</h3>

<p>We only replace items if they are:</p>

<ul>
<li>Damaged during shipping</li>
<li>Defective</li>
<li>Incorrectly shipped</li>
</ul>

<p>
If you require a different size or model, please place a new order after your refund has been processed.
</p>

<h3>Return Shipping</h3>

<p>
Customers are responsible for return shipping costs unless:
</p>

<ul>
<li>Wrong product was shipped</li>
<li>Product is defective</li>
<li>Product arrived damaged</li>
</ul>

<p>
We recommend using a trackable shipping service, as Medtrion is not responsible for lost return shipments.
</p>

<h3>Order Cancellation</h3>

<p>
Orders may be cancelled before they have been processed or shipped.
</p>

<p>
Once an order has been dispatched, it cannot be cancelled and must follow the standard return procedure.
</p>

<h3>Warranty</h3>

<p>
Many products sold by Medtrion are covered under the manufacturer's warranty.
Warranty coverage varies depending on the manufacturer and product.
</p>

<p>The warranty does not cover:</p>

<ul>
<li>Normal wear and tear</li>
<li>Improper installation</li>
<li>Misuse or abuse</li>
<li>Accidental damage</li>
<li>Unauthorized repairs</li>
</ul>

<p>
Please contact our support team for warranty assistance.
</p>

<h3>Contact Us</h3>

<p>
If you have any questions regarding returns or refunds, please contact us.
</p>

<p>
<strong>Medtrion Canada</strong><br>
Email: support@medtrion.ca<br>
Website: https://medtrion.ca
</p>
`;

const ReturnPolicyPage: React.FC<LegalPageProps> = ({
  title,
  content,
  modified,
}) => {
  const lastUpdated = modified
    ? new Date(modified).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'August 2026';

  return (
    <PageLayout hideFooter>
      <MetaHead
        title="Return & Refund Policy | Medtrion"
        description="Read Medtrion's Return & Refund Policy including eligibility, exchanges, refunds, cancellations, and warranty information."
      />

      <div className="min-h-screen bg-gray-50">
        <Hero
          badge={`Last updated: ${lastUpdated}`}
          title="Return & Refund Policy"
          description="Learn about Medtrion's return, refund, exchange, and warranty policies."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Return & Refund Policy' },
          ]}
        />

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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Policies
                </h3>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/privacy-policy"
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    Privacy Policy
                  </a>

                  <a
                    href="/terms-of-service"
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    Terms of Service
                  </a>

                  <a
                    href="/contact"
                    className="text-green-600 hover:text-green-800 hover:underline"
                  >
                    Contact Us
                  </a>
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
    const endpoint =
      process.env.WP_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
      '';

    const client = new GraphQLClient(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await client.request<{
      page: {
        title: string;
        content: string;
        modified: string;
      } | null;
    }>(`
      query GetReturnPolicy {
        page(id: "/return-policy/", idType: URI) {
          title
          content
          modified
        }
      }
    `);

    if (!data.page) {
      throw new Error('Page not found in CMS');
    }

    return {
      props: {
        title: data.page.title,
        content: data.page.content,
        modified: data.page.modified,
      },
      revalidate: 86400,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (
      process.env.NODE_ENV === 'development' &&
      !errorMessage.includes('Page not found in CMS')
    ) {
      console.error('Failed to fetch return policy from CMS:', error);
    }

    return {
      props: {
        title: 'Return & Refund Policy',
        content: FALLBACK_CONTENT,
        modified: null,
      },
      revalidate: 3600,
    };
  }
};

export default ReturnPolicyPage;