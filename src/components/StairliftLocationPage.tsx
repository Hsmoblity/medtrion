"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import Hero from "@/components/common/Hero";
import MetaHead from "@/components/MetaHead";
import PageLayout from "@/components/PageLayout/PageLayout";


import {
  stairliftLocations,
  type Block,
} from "@/data/stairliftLocations";

interface StairliftLocationPageProps {
  city: string;
  metaTitle?: string;
  metaDescription?: string;
  pageTitle?: string;
  description?: string;
}

export default function StairliftLocationPage({
  city,
  metaTitle,
  metaDescription,
  pageTitle,
  description,
}: StairliftLocationPageProps) {
  const content = stairliftLocations[city];

  if (!content) {
    return null;
  }

  const title = metaTitle || `Stairlifts in ${city} | Medtrion`;

  const metaDesc =
    metaDescription ||
    description ||
    `Professional stairlift solutions and installation in ${city} from Medtrion.`;

  const heroTitle =
    pageTitle ||
    content.heading ||
    `Stairlifts in ${city}`;

  return (
    <>
      <MetaHead
        title={title}
        description={metaDesc}
      />
     <div className="min-h-screen bg-gray-50">
      <PageLayout>
        <Hero
          badge={city}
          title={heroTitle}
          description={
            description ||
            `Find trusted stairlift solutions for homes in ${city}. Medtrion provides free consultations, expert installation, and dependable service for safer daily movement.`
          }
          breadcrumbs={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: `Stairlifts in ${city}`,
            },
          ]}
        />
        

         <main className="py-12 sm:py-16">
          <section className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">

            <motion.article
              initial={{
                opacity: 0,
                y: 24,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="rounded-[28px] border border-[#0b1f3a]/10 bg-white p-6 shadow-[0_20px_60px_rgba(11,31,58,0.08)] sm:p-10 lg:p-12"
            >
            <div className="space-y-12">
              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
                  {content.heading}
                </h1>
              </motion.div>

              {/* Flexible Content Blocks */}
              <div className="space-y-12">
                {content.blocks.map((block, index) => (
                  <ContentBlockRenderer
                    key={`${block.type}-${index}`}
                    block={block}
                    index={index}
                  />
                ))}
              </div>
            </div>
            {/* =================================================
                  CTA
              ================================================== */}

              <div className="mt-12 flex flex-wrap gap-4 border-t border-[#0b1f3a]/10 pt-10">

                {/* CONTACT CTA */}

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#f7a236] px-6 py-3 font-semibold text-white transition hover:bg-[#3fa2a3] hover:text-white"
                >
                  Book a Free Consultation
                </Link>

                {/* PRODUCTS CTA */}

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-full border border-[#0b1f3a]/15 px-6 py-3 font-semibold text-[#0b1f3a] transition hover:border-[#3fa2a3] hover:text-[#3fa2a3]"
                >
                  View Stairlift Options
                </Link>
              </div>
               </motion.article>
          </section>
        </main>
      </PageLayout>
      </div>
    </>
  );
}

/* =========================================================
   CONTENT BLOCK RENDERER
========================================================= */

function ContentBlockRenderer({
  block,
  index,
}: {
  block: Block;
  index: number;
}) {
  switch (block.type) {
    /* -----------------------------------------------------
       HEADING
    ----------------------------------------------------- */

    case "heading": {
      const HeadingTag = block.level === 3 ? "h3" : "h2";

      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.45,
            delay: index * 0.03,
          }}
        >
          <HeadingTag className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
            {block.text}
          </HeadingTag>
        </motion.div>
      );
    }

    /* -----------------------------------------------------
       PARAGRAPHS
    ----------------------------------------------------- */

    case "paragraphs":
      return (
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.45,
            delay: index * 0.03,
          }}
        >
          {block.items.map((paragraph, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
      );

    /* -----------------------------------------------------
       LIST
    ----------------------------------------------------- */

    case "list": {
      const ListTag =
        block.variant === "numbered" ? "ol" : "ul";

      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.45,
            delay: index * 0.03,
          }}
        >
          <ListTag
            className={
              block.variant === "numbered"
                ? "list-decimal space-y-4 pl-6 text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg"
                : "list-disc space-y-4 pl-6 text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg"
            }
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ListTag>
        </motion.div>
      );
    }

    /* -----------------------------------------------------
       SECTION
    ----------------------------------------------------- */

    case "section":
      return (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.03,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] md:p-8"
        >
          <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
              {block.heading}
            </h2>

            {block.paragraphs &&
              block.paragraphs.length > 0 && (
                <div className="space-y-5">
                  {block.paragraphs.map(
                    (paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className="text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg"
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>
              )}

            {block.list &&
              block.list.length > 0 && (
                <ul
                  className={
                    block.listVariant === "numbered"
                      ? "list-decimal space-y-4 pl-6 text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg"
                      : "list-disc space-y-4 pl-6 text-base leading-7 text-gray-600 dark:text-gray-300 md:text-lg"
                  }
                >
                  {block.list.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
          </div>
        </motion.section>
      );

    /* -----------------------------------------------------
       CTA
    ----------------------------------------------------- */

    case "cta":
      return (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.03,
          }}
          className="rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-white/10 dark:bg-white/[0.04] md:p-10"
        >
          <div className="space-y-5">
            {block.title && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {block.title}
              </h2>
            )}

            {block.text && (
              <p className="max-w-3xl text-base leading-8 text-gray-600 dark:text-gray-300 md:text-lg">
                {block.text}
              </p>
            )}

            {block.buttonText && block.buttonHref && (
              <div className="pt-2">
                <Link
                  href={block.buttonHref}
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                >
                  {block.buttonText}
                </Link>
              </div>
            )}
          </div>
        </motion.section>
      );

    default:
      return null;
  }
}