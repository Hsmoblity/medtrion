import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';

const TermsOfServicePage: React.FC = () => {
  return (
    <PageLayout>
      <MetaHead 
        title="Terms of Service - Health Supply & Mobility Inc" 
        description="Read the terms and conditions for using Health Supply & Mobility Inc services and website. Understand your rights and responsibilities."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-900 to-green-800 text-white pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Terms of Service
              </h1>
              <p className="text-lg sm:text-xl text-green-100 max-w-2xl mx-auto">
                Please read these terms and conditions carefully before using our services.
              </p>
              <p className="text-sm sm:text-base text-green-200 mt-4">
                Last updated: November 3, 2025
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12"
            >
              
              {/* Table of Contents */}
              <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-gray-50 rounded-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Table of Contents</h2>
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
                  <a href="#acceptance" className="text-green-600 hover:text-green-800 hover:underline">1. Acceptance of Terms</a>
                  <a href="#services" className="text-green-600 hover:text-green-800 hover:underline">2. Description of Services</a>
                  <a href="#user-accounts" className="text-green-600 hover:text-green-800 hover:underline">3. User Accounts</a>
                  <a href="#purchases" className="text-green-600 hover:text-green-800 hover:underline">4. Purchases and Payment</a>
                  <a href="#shipping" className="text-green-600 hover:text-green-800 hover:underline">5. Shipping and Returns</a>
                  <a href="#prohibited-uses" className="text-green-600 hover:text-green-800 hover:underline">6. Prohibited Uses</a>
                  <a href="#intellectual-property" className="text-green-600 hover:text-green-800 hover:underline">7. Intellectual Property</a>
                  <a href="#liability" className="text-green-600 hover:text-green-800 hover:underline">8. Limitation of Liability</a>
                  <a href="#termination" className="text-green-600 hover:text-green-800 hover:underline">9. Termination</a>
                  <a href="#governing-law" className="text-green-600 hover:text-green-800 hover:underline">10. Governing Law</a>
                </nav>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-12">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  These Terms of Service ("Terms") govern your use of the Health Supply & Mobility Inc website 
                  (<a href="https://hsmobility.ca" className="text-green-600 hover:underline">hsmobility.ca</a>) 
                  and services. By accessing or using our website, you agree to be bound by these Terms.
                </p>
              </div>

              {/* Section 1: Acceptance of Terms */}
              <section id="acceptance" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">1. Acceptance of Terms</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                  <p className="text-gray-700">
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                  <p className="text-gray-700">
                    We reserve the right to change these Terms at any time. Your continued use of the website following 
                    any changes indicates your acceptance of the new Terms.
                  </p>
                </div>
              </section>

              {/* Section 2: Description of Services */}
              <section id="services" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">2. Description of Services</h2>
                <p className="text-gray-700 mb-4">Health Supply & Mobility Inc provides:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Sale of mobility equipment including stairlifts, lift chairs, and accessibility products</li>
                  <li>Product consultation and accessibility assessments</li>
                  <li>Installation and maintenance services (where applicable)</li>
                  <li>Customer support and technical assistance</li>
                  <li>Educational content and resources about mobility solutions</li>
                  <li>Financing options for qualified customers</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We are proud affiliate partners and not manufacturers of certain products like Acorn stairlifts.
                  </p>
                </div>
              </section>

              {/* Section 3: User Accounts */}
              <section id="user-accounts" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">3. User Accounts</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Account Creation</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>You must provide accurate and complete information when creating an account</li>
                      <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                      <li>You must be at least 18 years old to create an account</li>
                      <li>One person or legal entity may maintain only one account</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Account Responsibilities</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>You are responsible for all activities that occur under your account</li>
                      <li>Notify us immediately of any unauthorized access or security breach</li>
                      <li>Keep your contact information current and accurate</li>
                      <li>Comply with all applicable laws and regulations</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 4: Purchases and Payment */}
              <section id="purchases" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">4. Purchases and Payment</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Pricing and Availability</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>All prices are in Canadian dollars (CAD) and include applicable taxes where required</li>
                      <li>Prices are subject to change without notice</li>
                      <li>Product availability is subject to stock levels</li>
                      <li>We reserve the right to limit quantities and refuse orders</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Payment Terms</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Payment is required at the time of order unless financing is approved</li>
                      <li>We accept major credit cards, PayPal, and financing options</li>
                      <li>All payments are processed securely through third-party payment processors</li>
                      <li>Orders may be subject to verification and approval</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Order Confirmation</h3>
                    <p className="text-gray-700">
                      Receipt of an order confirmation does not constitute acceptance of your order. We reserve the right 
                      to cancel or modify orders due to pricing errors, product unavailability, or other reasons.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5: Shipping and Returns */}
              <section id="shipping" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">5. Shipping and Returns</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Shipping Policy</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Shipping costs and delivery times vary by location and product</li>
                      <li>Risk of loss and title pass to you upon delivery to the carrier</li>
                      <li>Installation services may be available for certain products</li>
                      <li>Delivery dates are estimates and not guaranteed</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Return Policy</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Returns must be initiated within 30 days of delivery</li>
                      <li>Items must be in original condition with all packaging</li>
                      <li>Custom or installed products may not be returnable</li>
                      <li>Return shipping costs may apply</li>
                      <li>Refunds will be processed to the original payment method</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 6: Prohibited Uses */}
              <section id="prohibited-uses" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">6. Prohibited Uses</h2>
                <p className="text-gray-700 mb-4">You may not use our website for:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Any unlawful purpose or to solicit others to engage in unlawful acts</li>
                  <li>Violating any international, federal, provincial, or local regulations or laws</li>
                  <li>Transmitting or procuring harmful data, viruses, or malicious code</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Interfering with or disrupting our website or services</li>
                  <li>Impersonating another person or entity</li>
                  <li>Harvesting email addresses or other user information</li>
                  <li>Posting false, misleading, or fraudulent content</li>
                </ul>
              </section>

              {/* Section 7: Intellectual Property */}
              <section id="intellectual-property" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">7. Intellectual Property Rights</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Our Content</h3>
                    <p className="text-gray-700 mb-3">
                      The website and its content, including but not limited to text, graphics, images, logos, and software, 
                      are owned by Health Supply & Mobility Inc or its licensors and are protected by copyright and other 
                      intellectual property laws.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Limited License</h3>
                    <p className="text-gray-700 mb-3">
                      We grant you a limited, non-exclusive, non-transferable license to access and use the website 
                      for personal, non-commercial purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Restrictions</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>You may not reproduce, distribute, or publicly display our content</li>
                      <li>You may not modify, adapt, or create derivative works</li>
                      <li>You may not use our content for commercial purposes without permission</li>
                      <li>You may not remove copyright or proprietary notices</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 8: Limitation of Liability */}
              <section id="liability" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">8. Limitation of Liability</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Disclaimers</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>Our website and services are provided "as is" without warranties of any kind</li>
                      <li>We do not warrant that the website will be error-free or uninterrupted</li>
                      <li>We do not guarantee the accuracy or completeness of information</li>
                      <li>Use of the website is at your own risk</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Limitation of Damages</h3>
                    <p className="text-gray-700">
                      In no event shall Health Supply & Mobility Inc be liable for any indirect, incidental, special, 
                      consequential, or punitive damages, including but not limited to loss of profits, data, or use, 
                      incurred by you or any third party, whether in an action of contract or tort.
                    </p>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Some jurisdictions do not allow the exclusion of certain warranties 
                      or limitation of liability, so some of the above limitations may not apply to you.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 9: Termination */}
              <section id="termination" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">9. Termination</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    We may terminate or suspend your account and access to our website immediately, without prior notice 
                    or liability, for any reason, including if you breach these Terms.
                  </p>
                  <p className="text-gray-700">
                    You may terminate your account at any time by contacting us or discontinuing use of our services.
                  </p>
                  <p className="text-gray-700">
                    Upon termination, your right to use the website will cease immediately, but these Terms will remain 
                    in effect regarding any outstanding obligations.
                  </p>
                </div>
              </section>

              {/* Section 10: Governing Law */}
              <section id="governing-law" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">10. Governing Law</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    These Terms shall be governed by and construed in accordance with the laws of the Province of Ontario, 
                    Canada, without regard to its conflict of law provisions.
                  </p>
                  <p className="text-gray-700">
                    Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts 
                    of Ontario, Canada.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Information</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Supply & Mobility Inc</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Address:</strong> 3495 Rebecca St, Oakville, ON L6L 6X9</p>
                    <p><strong>Phone:</strong> <a href="tel:+19053301774" className="text-green-600 hover:underline">+1 (905) 330-1774</a></p>
                    <p><strong>Email:</strong> <a href="mailto:legal@hsmobility.ca" className="text-green-600 hover:underline">legal@hsmobility.ca</a></p>
                    <p><strong>Website:</strong> <a href="https://hsmobility.ca" className="text-green-600 hover:underline">hsmobility.ca</a></p>
                  </div>
                </div>
              </section>

              {/* Terms Updates */}
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Changes to Terms</h2>
                <p className="text-gray-700">
                  We reserve the right to modify these Terms at any time. We will notify users of any significant 
                  changes by posting the updated Terms on this page and updating the "Last updated" date. 
                  Your continued use of the website after changes indicates your acceptance of the updated Terms.
                </p>
              </section>

              {/* Quick Links */}
              <div className="border-t pt-6 sm:pt-8">
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

export default TermsOfServicePage;