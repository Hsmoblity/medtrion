import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { GraphQLClient } from 'graphql-request';
import { 
  MdLocationOn as MapPinIcon, 
  MdPhone as PhoneIcon, 
  MdEmail as EnvelopeIcon, 
  MdAccessTime as ClockIcon,
} from 'react-icons/md';
import PageLayout from '../components/PageLayout/PageLayout';
import MetaHead from '../components/MetaHead';
import ContactForm from '../components/Web3Forms/ContactForm';

// CMS data types
interface ContactPhone {
  name: string;
  number: string;
}

interface OpenHour {
  day: string;
  hours: string;
}

interface ContactInfo {
  contactAddress: string;
  contactEmail: string;
  contactPhone: ContactPhone[];
  openHours: OpenHour[];
}

// Parse "Street:3495 Rebecca St,City:Oakville ON,Postal:L6L 6X9" into parts
function parseAddress(raw: string): { street: string; city: string; postal: string; full: string } {
  const parts: Record<string, string> = {};
  raw.split(',').forEach((segment) => {
    const colonIdx = segment.indexOf(':');
    if (colonIdx !== -1) {
      const key = segment.slice(0, colonIdx).trim().toLowerCase();
      const val = segment.slice(colonIdx + 1).trim();
      parts[key] = val;
    }
  });
  const street = parts['street'] ?? '';
  const city   = parts['city']   ?? '';
  const postal = parts['postal'] ?? '';
  return { street, city, postal, full: [street, city, postal].filter(Boolean).join(', ') };
}

// Fallback static data if CMS is unavailable
const FALLBACK_CONTACT: ContactInfo = {
  contactAddress: 'Street:3495 Rebecca St,City:Oakville ON,Postal:L6L 6X9',
  contactEmail: 'Info@medtrion.ca',
  contactPhone: [{ name: 'General Inquiries', number: '+1 (905) 330-1774' }],
  openHours: [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday',        hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday',          hours: 'Closed' },
  ],
};

// Form validation schema
const ContactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredContact: z.enum(['email', 'phone', 'either']),
  inquiryType: z.enum(['quote', 'support', 'general', 'complaint'])
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

interface ContactPageProps {
  contactInfo: ContactInfo;
}

const ContactPage: React.FC<ContactPageProps> = ({ contactInfo }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const address = parseAddress(contactInfo.contactAddress);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema)
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const web3formsUrl = process.env.NEXT_PUBLIC_WEB3FORMS_URL;
      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

      if (!web3formsUrl || !accessKey) {
        throw new Error("Web3Forms configuration missing");
      }

      const response = await fetch(web3formsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...data,
          access_key: accessKey,
          subject: `Contact Form: ${data.subject}`,
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <MetaHead 
        title="Contact Us - Medtrion" 
        description="Get in touch with Medtrion for mobility solutions, stairlifts, and lift chairs. Contact us for free quotes and expert advice."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Contact Us
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto"
              >
                Ready to improve your mobility? Get in touch with our experts for personalized solutions and free consultations.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form (Google Form iframe) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <ContactForm />
              </motion.div>

              {/* Contact Information & Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                  
                  <div className="space-y-6">
                    {/* Address */}
                    <div className="flex items-start">
                      <MapPinIcon className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Our Office</h3>
                        <address className="text-gray-600 not-italic leading-relaxed">
                          {address.street}<br />
                          {address.city}<br />
                          {address.postal}
                        </address>
                      </div>
                    </div>

                    {/* Phones (repeater) */}
                    <div className="flex items-start">
                      <PhoneIcon className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Call Us</h3>
                        <div className="space-y-2">
                          {contactInfo.contactPhone.map((p) => (
                            <div key={p.name}>
                              <span className="text-gray-500 text-sm">{p.name}</span>
                              <a
                                href={`tel:${p.number}`}
                                className="block text-blue-600 hover:text-blue-800 transition-colors font-medium"
                              >
                                {p.number}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Us</h3>
                        <a
                          href={`mailto:${contactInfo.contactEmail}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors text-lg font-medium"
                        >
                          {contactInfo.contactEmail}
                        </a>
                      </div>
                    </div>

                    {/* Hours (repeater) */}
                    <div className="flex items-start">
                      <ClockIcon className="h-6 w-6 text-blue-600 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h3>
                        <div className="text-gray-600 space-y-1">
                          {contactInfo.openHours.map((h) => (
                            <p key={h.day}>
                              <span className="font-medium">{h.day}:</span> {h.hours}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Find Us</h2>
                  <div className="relative h-96 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(address.full)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Medtrion Location"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.full)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors font-medium"
                    >
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Medtrion?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We're committed to providing exceptional mobility solutions with personalized service and expert support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">✓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Consultation</h3>
                <p className="text-gray-600">
                  Get a complimentary home assessment and personalized recommendations from our mobility experts.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Response</h3>
                <p className="text-gray-600">
                  We respond to all inquiries within 24 hours and provide same-day quotes when possible.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Our certified technicians provide ongoing support and maintenance for all our mobility solutions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<ContactPageProps> = async () => {
  try {
    const endpoint = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_GRAPHQL_URL || '';
    if (!endpoint) throw new Error('No GraphQL endpoint configured');

    const client = new GraphQLClient(endpoint, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await client.request<{
      page: { contactFields: ContactInfo };
    }>(`
      query GetContactInfo {
        page(id: "/contacts/", idType: URI) {
          contactFields {
            contactAddress
            contactEmail
            contactPhone { name number }
            openHours { day hours }
          }
        }
      }
    `);

    return {
      props: {
        contactInfo: data.page.contactFields,
      },
    };
  } catch (error) {
    console.error('Failed to fetch contact info from CMS:', error);
    return {
      props: {
        contactInfo: FALLBACK_CONTACT,
      },
    };
  }
};

export default ContactPage;