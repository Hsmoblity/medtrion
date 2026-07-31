import React from "react";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";

import MetaHead from "../../components/MetaHead";
import Hero from "@/components/common/Hero";

import { runClientRequest } from "../../lib/woocommerce";
import { GET_BLOG_BY_SLUG } from "../../lib/graphql/queries";

interface WordPressPost {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  date: string;
  slug: string;

  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    };
  };
}

interface BlogDetailPageProps {
  blogDetailData: WordPressPost;
}

const BlogDetailPage: React.FC<
  BlogDetailPageProps
> = ({
  blogDetailData: blog,
}) => {
  const formattedDate = new Date(
    blog.date
  ).toLocaleDateString("en-CA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const imageUrl =
    blog.featuredImage?.node?.sourceUrl;

  const imageAlt =
    blog.featuredImage?.node?.altText ||
    blog.title;

  return (
    <>
      <MetaHead
        title={`${blog.title} | Medtrion Canada`}
        description={
          blog.excerpt
            ? blog.excerpt
                .replace(/<[^>]*>/g, "")
                .replace(/&hellip;/g, "...")
                .replace(/&#8217;/g, "'")
                .slice(0, 160)
            : "Read helpful mobility and accessibility insights from Medtrion Canada."
        }
      />

      <main className="min-h-screen bg-[#f8fbff]">
        {/* Hero */}
        <Hero
          badge="Helpful Insights"
          title={blog.title}
          description="Expert guidance on mobility, accessibility, and independent living."
          breadcrumbs={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Our Blog & Resources",
              href: "/blogs",
            },
            {
              label: blog.title,
            },
          ]}
        />

        {/* Blog Content */}
        <section className="relative py-12 sm:py-16 lg:py-20">
          <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">

            {/* Back Button */}
            <Link
              href="/blogs"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#3fa2a3]/20 bg-white px-5 py-3 text-sm font-semibold text-[#0b1f3a] shadow-sm transition-all duration-300 hover:border-[#3fa2a3] hover:bg-[#3fa2a3] hover:text-white"
            >
              <span className="text-lg">
                ←
              </span>

              Back to All Articles
            </Link>

            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">

              {/* Main Article */}
              <article className="overflow-hidden rounded-[28px] border border-[#0b1f3a]/10 bg-white shadow-[0_18px_55px_rgba(11,31,58,0.08)]">

                {/* Featured Image */}
                {imageUrl && (
                  <div className="relative h-[260px] overflow-hidden sm:h-[380px] lg:h-[480px]">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 850px"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f3a]/35 via-transparent to-transparent" />

                    <div className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#0b1f3a] shadow-md backdrop-blur-sm">
                      {formattedDate}
                    </div>
                  </div>
                )}

                {/* Article Body */}
                <div className="p-6 sm:p-10 lg:p-12">

                  <div className="mb-7 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#3fa2a3]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#3fa2a3]">
                      Medtrion Blog
                    </span>

                    <span className="h-1.5 w-1.5 rounded-full bg-[#f7a236]" />

                    <span className="text-sm font-medium text-gray-500">
                      {formattedDate}
                    </span>
                  </div>

                  <h1 className="mb-7 text-2xl font-bold leading-[1.15] text-[#0b1f3a] sm:text-3xl lg:text-4xl">
                    {blog.title}
                  </h1>

                  {blog.excerpt && (
                    <div className="mb-9 rounded-r-[20px] border-l-4 border-[#f7a236] bg-[#fff9f1] px-5 py-5 text-base leading-8 text-gray-700 sm:px-7 sm:text-lg">
                      {blog.excerpt
                        .replace(/<[^>]*>/g, "")
                        .replace(/&#8217;/g, "'")
                        .replace(/&hellip;/g, "...")
                        .replace(/&nbsp;/g, " ")
                        .trim()}
                    </div>
                  )}

                  {/* WordPress Content */}
                  <div
                    className="
                      blog-content
                      text-[16px]
                      leading-8
                      text-[#475569]

                      sm:text-[17px]

                      [&_p]:mb-6

                      [&_h2]:mb-5
                      [&_h2]:mt-11
                      [&_h2]:text-2xl
                      [&_h2]:font-bold
                      [&_h2]:leading-tight
                      [&_h2]:text-[#0b1f3a]

                      sm:[&_h2]:text-3xl

                      [&_h3]:mb-4
                      [&_h3]:mt-8
                      [&_h3]:text-xl
                      [&_h3]:font-bold
                      [&_h3]:text-[#0b1f3a]

                      sm:[&_h3]:text-2xl

                      [&_ul]:mb-7
                      [&_ul]:ml-6
                      [&_ul]:list-disc
                      [&_ul]:space-y-3

                      [&_ol]:mb-7
                      [&_ol]:ml-6
                      [&_ol]:list-decimal
                      [&_ol]:space-y-3

                      [&_a]:font-semibold
                      [&_a]:text-[#3fa2a3]
                      [&_a]:underline
                      [&_a]:decoration-[#3fa2a3]/40
                      [&_a]:underline-offset-4
                      hover:[&_a]:text-[#f7a236]

                      [&_strong]:font-bold
                      [&_strong]:text-[#0b1f3a]

                      [&_blockquote]:my-8
                      [&_blockquote]:rounded-r-2xl
                      [&_blockquote]:border-l-4
                      [&_blockquote]:border-[#3fa2a3]
                      [&_blockquote]:bg-[#f1fafa]
                      [&_blockquote]:px-6
                      [&_blockquote]:py-5
                      [&_blockquote]:text-lg
                      [&_blockquote]:font-medium
                      [&_blockquote]:italic
                      [&_blockquote]:text-[#0b1f3a]

                      [&_img]:my-8
                      [&_img]:h-auto
                      [&_img]:w-full
                      [&_img]:rounded-2xl
                    "
                    dangerouslySetInnerHTML={{
                      __html:
                        blog.content ||
                        "<p>Article content is not available.</p>",
                    }}
                  />
                </div>
              </article>

              {/* Sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-24">

                {/* Article Info */}
                <div className="rounded-[24px] border border-[#0b1f3a]/10 bg-white p-6 shadow-sm">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#3fa2a3]">
                    Article Information
                  </p>

                  <h3 className="mb-5 text-xl font-bold text-[#0b1f3a]">
                    Medtrion Resources
                  </h3>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="mb-1 text-xs text-gray-500">
                      Published
                    </p>

                    <p className="font-semibold text-[#0b1f3a]">
                      {formattedDate}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="overflow-hidden rounded-[24px] bg-[#0b1f3a] p-7 text-white shadow-lg">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#3fa2a3] text-xl">
                    ♿
                  </div>

                  <h3 className="mb-3 text-2xl font-bold">
                    Need Mobility Support?
                  </h3>

                  <p className="mb-6 text-sm leading-6 text-white/75">
                    Our team can help you find the right mobility solution for your home and lifestyle.
                  </p>

                  <Link
                    href="/contact"
                    className="inline-flex w-full items-center justify-center rounded-full bg-[#3fa2a3] px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:bg-[#f7a236]"
                  >
                    Contact Our Team
                  </Link>
                </div>

                {/* Back to Blogs */}
                <Link
                  href="/blogs"
                  className="flex w-full items-center justify-center rounded-full border border-[#0b1f3a]/15 bg-white px-5 py-3.5 text-sm font-bold text-[#0b1f3a] transition-all duration-300 hover:border-[#3fa2a3] hover:text-[#3fa2a3]"
                >
                  View All Articles
                </Link>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  BlogDetailPageProps
> = async ({ params }) => {
  const slug = params?.slug;

  if (!slug || Array.isArray(slug)) {
    return {
      notFound: true,
    };
  }

  try {
    const response = await runClientRequest<{
      post: WordPressPost | null;
    }>(
      GET_BLOG_BY_SLUG,
      {
        slug,
      }
    );

    const post = response?.post;

    if (!post) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        blogDetailData: post,
      },
    };
  } catch (error) {
    console.error(
      "Error fetching WordPress blog:",
      error
    );

    return {
      notFound: true,
    };
  }
};

export default BlogDetailPage;