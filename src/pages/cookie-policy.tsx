import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';

const CookiePolicyPage: React.FC = () => {
  return (
    <PageLayout>
      <MetaHead 
        title="Cookie Policy - Health Supply & Mobility Inc" 
        description="Learn how Health Supply & Mobility Inc uses cookies and similar technologies to improve your browsing experience and provide personalized services."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Cookie Policy
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                Learn how we use cookies and similar technologies to enhance your experience on our website.
              </p>
              <p className="text-sm sm:text-base text-blue-200 mt-4">
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
                  <a href="#what-are-cookies" className="text-blue-600 hover:text-blue-800 hover:underline">1. What Are Cookies?</a>
                  <a href="#why-we-use" className="text-blue-600 hover:text-blue-800 hover:underline">2. Why We Use Cookies</a>
                  <a href="#types-of-cookies" className="text-blue-600 hover:text-blue-800 hover:underline">3. Types of Cookies We Use</a>
                  <a href="#third-party-cookies" className="text-blue-600 hover:text-blue-800 hover:underline">4. Third-Party Cookies</a>
                  <a href="#managing-cookies" className="text-blue-600 hover:text-blue-800 hover:underline">5. Managing Your Cookies</a>
                  <a href="#other-technologies" className="text-blue-600 hover:text-blue-800 hover:underline">6. Other Technologies</a>
                  <a href="#updates" className="text-blue-600 hover:text-blue-800 hover:underline">7. Policy Updates</a>
                  <a href="#contact" className="text-blue-600 hover:text-blue-800 hover:underline">8. Contact Us</a>
                </nav>
              </div>

              {/* Introduction */}
              <div className="mb-8 sm:mb-12">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  This Cookie Policy explains how Health Supply & Mobility Inc uses cookies and similar technologies 
                  when you visit our website <a href="https://hsmobility.ca" className="text-blue-600 hover:underline">hsmobility.ca</a>. 
                  It explains what these technologies are, why we use them, and your choices regarding their use.
                </p>
              </div>

              {/* Section 1: What Are Cookies */}
              <section id="what-are-cookies" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">1. What Are Cookies?</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                    They are widely used to make websites work more efficiently and provide information to website owners.
                  </p>
                  <p className="text-gray-700">
                    Cookies contain information about your visits to the website, such as your preferred language, 
                    login information, and other settings that help improve your browsing experience.
                  </p>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Cookies cannot access your personal files or install software on your device. 
                      They are safe and commonly used across the internet.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2: Why We Use Cookies */}
              <section id="why-we-use" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">2. Why We Use Cookies</h2>
                <p className="text-gray-700 mb-4">We use cookies for several important purposes:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><strong>Essential functionality:</strong> To enable basic website features and navigation</li>
                  <li><strong>Security:</strong> To protect your account and prevent unauthorized access</li>
                  <li><strong>Performance:</strong> To analyze how our website is used and improve its performance</li>
                  <li><strong>Personalization:</strong> To remember your preferences and provide personalized content</li>
                  <li><strong>Shopping experience:</strong> To maintain your shopping cart and checkout process</li>
                  <li><strong>Marketing:</strong> To deliver relevant advertisements and measure their effectiveness</li>
                </ul>
              </section>

              {/* Section 3: Types of Cookies */}
              <section id="types-of-cookies" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">3. Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                      Essential Cookies (Required)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies are necessary for the website to function properly. They cannot be disabled.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                      <li>Session management and user authentication</li>
                      <li>Shopping cart functionality</li>
                      <li>Security and fraud prevention</li>
                      <li>Load balancing and website stability</li>
                    </ul>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duration:</strong> Session cookies (deleted when you close browser) and up to 1 year
                    </div>
                  </div>

                  {/* Performance Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                      Performance Cookies (Analytics)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies help us understand how visitors interact with our website by collecting anonymous information.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                      <li>Google Analytics for website traffic analysis</li>
                      <li>Page performance and loading times</li>
                      <li>Popular content and user journey tracking</li>
                      <li>Error reporting and website optimization</li>
                    </ul>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duration:</strong> Up to 2 years
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                      Functional Cookies (Preferences)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies enable enhanced functionality and personalization based on your preferences.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                      <li>Language and region preferences</li>
                      <li>Accessibility settings</li>
                      <li>Recently viewed products</li>
                      <li>Chat widget and customer support tools</li>
                    </ul>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duration:</strong> Up to 1 year
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                      Marketing Cookies (Advertising)
                    </h3>
                    <p className="text-gray-700 mb-3">
                      These cookies are used to deliver relevant advertisements and measure campaign effectiveness.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4 text-sm">
                      <li>Google Ads and Facebook advertising pixels</li>
                      <li>Retargeting and remarketing campaigns</li>
                      <li>Social media integration and sharing</li>
                      <li>Conversion tracking and attribution</li>
                    </ul>
                    <div className="mt-3 text-sm text-gray-500">
                      <strong>Duration:</strong> Up to 2 years
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Third-Party Cookies */}
              <section id="third-party-cookies" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">4. Third-Party Cookies</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    We work with trusted third-party services that may place their own cookies on your device. 
                    These partners help us provide better services and understand our website usage.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Analytics Partners</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Google Analytics</li>
                        <li>• Google Tag Manager</li>
                        <li>• Hotjar (User behavior)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Advertising Partners</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Google Ads</li>
                        <li>• Facebook Pixel</li>
                        <li>• Microsoft Advertising</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Support & Communication</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Live chat providers</li>
                        <li>• Email marketing tools</li>
                        <li>• Customer support systems</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Social Media</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Facebook integration</li>
                        <li>• Instagram widgets</li>
                        <li>• Social sharing buttons</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> These third-party services have their own privacy policies and cookie practices. 
                      We encourage you to review their policies for more information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5: Managing Cookies */}
              <section id="managing-cookies" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">5. Managing Your Cookie Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
                    <p className="text-gray-700 mb-4">
                      You can control and manage cookies through your browser settings. Most browsers allow you to:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                      <li>View and delete existing cookies</li>
                      <li>Block cookies from specific websites</li>
                      <li>Block third-party cookies</li>
                      <li>Clear all cookies when closing the browser</li>
                      <li>Set preferences for cookie notifications</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Browser-Specific Instructions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" 
                         className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-800">Google Chrome</div>
                        <div className="text-sm text-gray-600 mt-1">Manage cookies in Chrome</div>
                      </a>
                      <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer"
                         className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-800">Mozilla Firefox</div>
                        <div className="text-sm text-gray-600 mt-1">Firefox cookie settings</div>
                      </a>
                      <a href="https://support.apple.com/en-ca/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer"
                         className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-800">Safari</div>
                        <div className="text-sm text-gray-600 mt-1">Safari privacy settings</div>
                      </a>
                      <a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer"
                         className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="font-medium text-gray-800">Microsoft Edge</div>
                        <div className="text-sm text-gray-600 mt-1">Edge cookie management</div>
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Opt-Out Tools</h3>
                    <p className="text-gray-700 mb-4">
                      You can also opt out of specific tracking services:
                    </p>
                    <div className="space-y-2">
                      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer"
                         className="inline-block text-blue-600 hover:text-blue-800 hover:underline mr-4">
                        Google Analytics Opt-out
                      </a>
                      <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer"
                         className="inline-block text-blue-600 hover:text-blue-800 hover:underline mr-4">
                        Facebook Ad Preferences
                      </a>
                      <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer"
                         className="inline-block text-blue-600 hover:text-blue-800 hover:underline">
                        Digital Advertising Alliance Opt-out
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                    <p className="text-sm text-red-800">
                      <strong>Important:</strong> Disabling cookies may affect the functionality of our website. 
                      Some features may not work properly if essential cookies are blocked.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 6: Other Technologies */}
              <section id="other-technologies" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">6. Other Tracking Technologies</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    In addition to cookies, we may use other technologies to collect information:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Web Beacons (Pixel Tags)</h4>
                      <p className="text-gray-700 text-sm">
                        Small transparent images used to track user behavior and measure the effectiveness of email campaigns.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Local Storage</h4>
                      <p className="text-gray-700 text-sm">
                        Browser storage that allows websites to store data locally on your device for improved performance.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Session Replay</h4>
                      <p className="text-gray-700 text-sm">
                        Technology that records user interactions to help us improve website usability and identify issues.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Fingerprinting</h4>
                      <p className="text-gray-700 text-sm">
                        Collection of device and browser characteristics for security and fraud prevention purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7: Updates */}
              <section id="updates" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">7. Policy Updates</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    We may update this Cookie Policy from time to time to reflect changes in our practices, 
                    technology, legal requirements, or other factors.
                  </p>
                  <p className="text-gray-700">
                    When we make significant changes, we will notify you by posting the updated policy on this page 
                    and updating the "Last updated" date at the top of this policy.
                  </p>
                  <p className="text-gray-700">
                    We encourage you to review this policy periodically to stay informed about how we use cookies 
                    and similar technologies.
                  </p>
                </div>
              </section>

              {/* Section 8: Contact */}
              <section id="contact" className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">8. Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have questions about this Cookie Policy or our use of cookies, please contact us:
                </p>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Supply & Mobility Inc</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Privacy Officer:</strong> Data Protection Team</p>
                    <p><strong>Address:</strong> 3495 Rebecca St, Oakville, ON L6L 6X9</p>
                    <p><strong>Phone:</strong> <a href="tel:+19053301774" className="text-blue-600 hover:underline">+1 (905) 330-1774</a></p>
                    <p><strong>Email:</strong> <a href="mailto:privacy@hsmobility.ca" className="text-blue-600 hover:underline">privacy@hsmobility.ca</a></p>
                    <p><strong>Website:</strong> <a href="https://hsmobility.ca" className="text-blue-600 hover:underline">hsmobility.ca</a></p>
                  </div>
                </div>
              </section>

              {/* Consent Management */}
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Cookie Consent</h2>
                <p className="text-gray-700 mb-4">
                  By continuing to use our website, you consent to our use of cookies as described in this policy. 
                  You can withdraw your consent at any time by adjusting your browser settings or contacting us.
                </p>
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Your Rights:</strong> You have the right to know what cookies we use, why we use them, 
                    and how to control or delete them. You can exercise these rights at any time.
                  </p>
                </div>
              </section>

              {/* Quick Links */}
              <div className="border-t pt-6 sm:pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Policies</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 hover:underline">Privacy Policy</a>
                  <a href="/terms-of-service" className="text-blue-600 hover:text-blue-800 hover:underline">Terms of Service</a>
                  <a href="/contact" className="text-blue-600 hover:text-blue-800 hover:underline">Contact Us</a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default CookiePolicyPage;