import React from "react";
import { GetServerSideProps } from "next";

import MetaHead from "../../components/MetaHead";
import BlogsList from "../../components/blog-list";
import { Blog } from "../../components/blog-preview";
import Hero from "@/components/common/Hero";

import { runClientRequest } from "../../lib/woocommerce";
import { GET_ALL_BLOGS } from "../../lib/graphql/queries";

interface WordPressPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    };
  };
}

interface GraphQLResponse {
  posts?: {
    nodes?: WordPressPost[];
  };
}

interface BlogsPageProps {
  blogs: Blog[];
  error?: string;
}

const BlogsPage: React.FC<BlogsPageProps> = ({
  blogs,
  error,
}) => {
  return (
    <>
      <MetaHead
        title="Mobility & Stairlift Blog | Medtrion Canada"
        description="Guides, tips & advice on stairlifts, lift chairs & mobility equipment for Canadian homes. Expert insights from Medtrion — serving Ontario & the GTA."
      />

      <div className="min-h-screen bg-gray-50">
        <Hero
          badge="Helpful Insights"
          title="Our Blog & Resources"
          description="Read practical guidance on mobility products, home safety, and everyday independence."
          breadcrumbs={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Our Blog & Resources",
            },
          ]}
        />

        {error ? (
          <div className="flex min-h-[50vh] items-center justify-center px-5 py-12">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Blogs Temporarily Unavailable
              </h2>

              <p className="mb-5 text-gray-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-[35px] bg-[#3fa2a3] px-6 py-3 font-primary font-semibold text-white transition-all duration-300 hover:bg-[#f7a236]"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center px-5 py-12">
            <div className="text-center">
              <h2 className="mb-3 text-2xl font-bold text-gray-900">
                No Blogs Found
              </h2>

              <p className="text-gray-600">
                Please check back later for new articles.
              </p>
            </div>
          </div>
        ) : (
          <BlogsList blogs={blogs} />
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  BlogsPageProps
> = async () => {
  try {
    const response = await runClientRequest<
      GraphQLResponse
    >(GET_ALL_BLOGS);

    const wordpressPosts =
      response?.posts?.nodes || [];

    const blogs: Blog[] = wordpressPosts.map(
      (post) => {
        const cleanDescription = post.excerpt
          ? post.excerpt
              .replace(/<[^>]*>/g, "")
              .replace(/&#8217;/g, "'")
              .replace(/&hellip;/g, "...")
              .replace(/&nbsp;/g, " ")
              .trim()
          : "";

        return {
          date: post.date,

          title: post.title,

          description: cleanDescription,

          // Ye URL [slug].tsx ko open karega
          link: `/blogs/${post.slug}`,

          image:
            post.featuredImage?.node?.sourceUrl ||
            "/images/blog-placeholder.jpg",

          alt:
            post.featuredImage?.node?.altText ||
            post.title,
        };
      }
    );

    return {
      props: {
        blogs,
      },
    };
  } catch (error) {
    console.error(
      "Error fetching WordPress blogs:",
      error
    );

    return {
      props: {
        blogs: [],
        error:
          "Unable to load blogs at this time. Please try again later.",
      },
    };
  }
};

export default BlogsPage;