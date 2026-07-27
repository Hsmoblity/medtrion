import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { GraphQLClient } from "graphql-request";
import Hero from "@/components/Common/Hero";
import {
  MdLocationOn as MapPinIcon,
  MdPhone as PhoneIcon,
  MdEmail as EnvelopeIcon,
  MdAccessTime as ClockIcon,
} from "react-icons/md";
import PageLayout from "../components/PageLayout/PageLayout";
import MetaHead from "../components/MetaHead";
import ContactForm from "../components/Web3Forms/ContactForm";
import { GET_CONTACT_INFO } from "../lib/graphql/queries";

// CMS data types
interface ContactPhone {
  name: string;
  number: string;
}

interface OpenHour {
  day: string;
  hours: string;
}

interface Logo {
  sourceUrl: string;
  altText?: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

interface ContactInfo {
  contactAddress: string;
  contactEmail: string;
  contactPhone: ContactPhone[];
  openHours: OpenHour[];
  logo?: string | Logo; // Can be string URL or Logo object
}

// Parse "Street:3495 Rebecca St,City:Oakville ON,Postal:L6L 6X9" into parts
function parseAddress(raw: string): {
  street: string;
  city: string;
  postal: string;
  full: string;
} {
  const parts: Record<string, string> = {};
  raw.split(",").forEach((segment) => {
    const colonIdx = segment.indexOf(":");
    if (colonIdx !== -1) {
      const key = segment.slice(0, colonIdx).trim().toLowerCase();
      const val = segment.slice(colonIdx + 1).trim();
      parts[key] = val;
    }
  });
  const street = parts["street"] ?? "";
  const city = parts["city"] ?? "";
  const postal = parts["postal"] ?? "";
  return {
    street,
    city,
    postal,
    full: [street, city, postal].filter(Boolean).join(", "),
  };
}

// Fallback static data if CMS is unavailable
const FALLBACK_CONTACT: ContactInfo = {
  contactAddress: "Street:3495 Rebecca St,City:Oakville ON,Postal:L6L 6X9",
  contactEmail: "Info@medtrion.ca",
  contactPhone: [{ name: "General Inquiries", number: "+1 (905) 330-1774" }],
  openHours: [
    { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  logo: "/med-logo.png", // String URL fallback
};

// Form validation schema
const ContactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  preferredContact: z.enum(["email", "phone", "either"]),
  inquiryType: z.enum(["quote", "support", "general", "complaint"]),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

interface ContactPageProps {
  contactInfo: ContactInfo;
}

const ContactPage: React.FC<ContactPageProps> = ({ contactInfo }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const address = parseAddress(contactInfo.contactAddress);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

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
      console.log("Form submitted successfully:", result);
      setSubmitStatus("success");
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout hideFooter>
      <MetaHead
        title="Contact Us - Medtrion"
        description="Get in touch with Medtrion for mobility solutions, stairlifts, and lift chairs. Contact us for free quotes and expert advice."
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <Hero
          badge="Contact Support"
          title="Contact Us"
          description="Ready to improve your mobility? Get in touch with our experts for personalized solutions and free consultations."
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
        />

        {/* Main Content */}
        <section className="py-12 sm:py-14">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mx-auto w-full max-w-[600px] rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]"
            >
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-[#0b1f3a]">
                  Send us a Message
                </h2>
                <div className="mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              </div>
              <p className="mt-2 text-base text-gray-600">
                Tell us about your needs and we’ll help you with the right
                mobility solution.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-12 rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]"
            >
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-[#0b1f3a]">
                  Get in Touch
                </h2>
                <div className="mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              </div>
              <p className="mt-2 text-base text-gray-600">
                We’re here to answer your questions and guide you every step of
                the way.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#0b1f3a]/10 bg-white/80 p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fef7eb] text-[#f7a236]">
                    <MapPinIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0b1f3a]">
                    Visit Our Office
                  </h3>
                  <address className="text-gray-600 not-italic leading-relaxed">
                    {address.street}
                    <br />
                    {address.city}
                    <br />
                    {address.postal}
                  </address>
                </div>

                <div className="rounded-[22px] border border-[#0b1f3a]/10 bg-white/80 p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fef7eb] text-[#f7a236]">
                    <PhoneIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0b1f3a]">
                    Call Us
                  </h3>
                  <div className="space-y-2">
                    {contactInfo.contactPhone.map((p) => (
                      <div key={p.name}>
                        <span className="text-sm text-gray-500">{p.name}</span>
                        <a
                          href={`tel:${p.number}`}
                          className="block font-medium text-[#153a5f] transition-colors hover:text-[#3fa2a3]"
                        >
                          {p.number}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-[#0b1f3a]/10 bg-white/80 p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fef7eb] text-[#f7a236]">
                    <EnvelopeIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0b1f3a]">
                    Email Us
                  </h3>
                  <a
                    href={`mailto:${contactInfo.contactEmail}`}
                    className="text-lg font-medium text-[#153a5f] transition-colors hover:text-[#3fa2a3]"
                  >
                    {contactInfo.contactEmail}
                  </a>
                </div>

                <div className="rounded-[22px] border border-[#0b1f3a]/10 bg-white/80 p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fef7eb] text-[#f7a236]">
                    <ClockIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-[#0b1f3a]">
                    Business Hours
                  </h3>
                  <div className="space-y-1 text-gray-600">
                    {contactInfo.openHours.map((h) => (
                      <p key={h.day}>
                        <span className="font-medium">{h.day}:</span> {h.hours}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)]"
            >
              <div className="mb-4">
                <h2 className="text-3xl font-bold text-[#0b1f3a]">Find Us</h2>
                <div className="mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              </div>
              <div className="relative mt-6 h-[420px] overflow-hidden rounded-2xl border border-[#0b1f3a]/10">
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
                  className="inline-flex items-center font-medium text-[#153a5f] transition-colors hover:text-[#3fa2a3]"
                >
                  <MapPinIcon className="mr-2 h-5 w-5" />
                  Open in Google Maps
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="bg-gradient-to-br from-[#f4f8fb] via-[#f7fbfd] to-[#fef7eb] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#0b1f3a] mb-4">
                Why Choose Medtrion?
              </h2>
              <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We're committed to providing exceptional mobility solutions with
                personalized service and expert support.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0b1f3a] to-[#3fa2a3] text-2xl font-bold text-white">
                  <span>✓</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0b1f3a]">
                  Free Consultation
                </h3>
                <p className="text-gray-600">
                  Get a complimentary home assessment and personalized
                  recommendations from our mobility experts.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#f7a236] to-[#ffbf63] text-2xl font-bold text-white">
                  <span>⚡</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0b1f3a]">
                  Quick Response
                </h3>
                <p className="text-gray-600">
                  We respond to all inquiries within 24 hours and provide
                  same-day quotes when possible.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-8 text-center shadow-[0_15px_40px_rgba(11,31,58,0.06)]">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3fa2a3] to-[#0b1f3a] text-2xl font-bold text-white">
                  <span>🛡️</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0b1f3a]">
                  Expert Support
                </h3>
                <p className="text-gray-600">
                  Our certified technicians provide ongoing support and
                  maintenance for all our mobility solutions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  ContactPageProps
> = async () => {
  try {
    const endpoint =
      process.env.WP_GRAPHQL_URL ||
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL ||
      "";
    if (!endpoint) throw new Error("No GraphQL endpoint configured");

    const client = new GraphQLClient(endpoint, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await client.request<{
      page: { contactFields: ContactInfo };
    }>(GET_CONTACT_INFO);

    console.log(
      "✅ Contact info fetched from CMS:",
      JSON.stringify(data.page.contactFields.contactPhone, null, 2),
    );

    return {
      props: {
        contactInfo: data.page.contactFields,
      },
    };
  } catch (error) {
    console.error("❌ Failed to fetch contact info from CMS:", error);
    console.error(
      "Using fallback contact data with",
      FALLBACK_CONTACT.contactPhone.length,
      "phone(s)",
    );
    return {
      props: {
        contactInfo: FALLBACK_CONTACT,
      },
    };
  }
};

export default ContactPage;
