import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Hero from "@/components/common/Hero";
import MetaHead from "@/components/MetaHead";
import PageLayout from "@/components/PageLayout/PageLayout";

interface StairliftLocationPageProps {
  city: string;
  metaTitle?: string;
  metaDescription?: string;
  pageTitle?: string;
  description?: string;
}

const StairliftLocationPage: React.FC<StairliftLocationPageProps> = ({
  city,
  metaTitle,
  metaDescription,
  pageTitle,
  description,
}) => {
  const resolvedMetaTitle = metaTitle || `Stairlifts in ${city} | Medtrion`;
  const resolvedMetaDescription =
    metaDescription ||
    `Discover stairlift solutions in ${city} with Medtrion. Enjoy free consultations, professional installation, and reliable support for safe home mobility.`;
  const resolvedPageTitle = pageTitle || `Stairlifts in ${city}`;

  return (
    <PageLayout hideFooter>
      <MetaHead title={resolvedMetaTitle} description={resolvedMetaDescription} />

      <div className="min-h-screen bg-gray-50">
        <Hero
          badge={city}
          title={resolvedPageTitle}
          description={description || `Find trusted stairlift solutions for homes in ${city}. Medtrion provides free consultations, expert installation, and dependable service for safer daily movement.`}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: `Stairlifts in ${city}` },
          ]}
        />

        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-8 shadow-[0_20px_60px_rgba(11,31,58,0.08)] sm:p-10"
            >
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold text-[#0b1f3a]">
                  Safe stairlift installation for {city}
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Whether you need a straight or curved stairlift, our team helps you choose the right mobility solution for your home and budget. We focus on comfort, reliability, and smooth installation from the first consultation to the final setup.
                </p>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-[22px] border border-[#0b1f3a]/10 bg-white/80 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0b1f3a]">Why homeowners choose Medtrion</h3>
                  <ul className="mt-4 space-y-3 text-gray-600">
                    <li>• Free, no-pressure consultation</li>
                    <li>• Professional installation and support</li>
                    <li>• Trusted stairlift options for different homes</li>
                  </ul>
                </div>

                <div className="rounded-[22px] border border-[#0b1f3a]/10 bg-white/80 p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#0b1f3a]">Serving your area</h3>
                  <p className="mt-4 text-gray-600">
                    We help families across {city} and nearby communities find dependable mobility upgrades that improve independence and daily comfort.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#f7a236] px-6 py-3 font-semibold text-white transition hover:bg-[#3fa2a3] hover:text-white"
                >
                  Book a Free Consultation
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-[#0b1f3a]/15 px-6 py-3 font-semibold text-[#0b1f3a] transition hover:border-[#3fa2a3] hover:text-[#3fa2a3]"
                >
                  View Stairlift Options
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default StairliftLocationPage;
