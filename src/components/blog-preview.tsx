"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export interface Blog {
  date: string;
  title: string;
  description: string;
  link: string;
  image: string;
  alt: string;
}

export interface BlogsPreProps {
  blogs: Blog[];
}

// Blog Image Component
const BlogImage: React.FC<{
  src: string;
  alt: string;
  index: number;
  className?: string;
}> = ({
  src,
  alt,
  index,
  className = "",
}) => {
  const fallbackImages = [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&q=80",
  ];

  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    const fallbackIndex =
      index % fallbackImages.length;

    const fallbackSrc =
      fallbackImages[fallbackIndex];

    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3fa2a3] border-t-transparent" />
        </div>
      )}

      <Image
        src={imgSrc}
        alt={alt}
        width={800}
        height={600}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
          isLoading
            ? "opacity-0"
            : "opacity-100"
        } ${className}`}
        priority={index < 3}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
      />
    </div>
  );
};

export function BlogsPre({
  blogs,
}: BlogsPreProps) {
  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);

  const [visibleBlogs, setVisibleBlogs] =
    useState<Blog[]>([]);

  const [loading, setLoading] =
    useState(false);

  // WordPress se naye blogs aane par list update hogi
  useEffect(() => {
    setVisibleBlogs(
      blogs.slice(0, 6)
    );
  }, [blogs]);

  // Load more blogs
  const loadMoreBlogs = useCallback(() => {
    if (
      loading ||
      visibleBlogs.length >= blogs.length
    ) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setVisibleBlogs((previousBlogs) => [
        ...previousBlogs,
        ...blogs.slice(
          previousBlogs.length,
          previousBlogs.length + 6
        ),
      ]);

      setLoading(false);
    }, 500);
  }, [
    loading,
    visibleBlogs.length,
    blogs,
  ]);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight +
          window.scrollY >=
        document.documentElement
          .scrollHeight -
          500;

      if (nearBottom) {
        loadMoreBlogs();
      }
    };

    window.addEventListener(
      "scroll",
      onScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );
    };
  }, [loadMoreBlogs]);

  return (
    <>
      <div className="mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
        {visibleBlogs.map(
          (blog, index) => (
            <Link
              key={blog.link}
              href={blog.link}
              className="group relative block h-full w-full overflow-hidden rounded-[24px] border border-[#0b1f3a]/10 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(11,31,58,0.08)]"
              onMouseEnter={() =>
                setHoveredIndex(index)
              }
              onMouseLeave={() =>
                setHoveredIndex(null)
              }
              aria-label={`Read ${blog.title}`}
            >
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.span
                    className="absolute inset-0 block h-full w-full rounded-[24px] bg-[#f7fbfd]"
                    layoutId="hoverBackground"
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                      transition: {
                        duration: 0.15,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.15,
                        delay: 0.2,
                      },
                    }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                className="relative z-10 w-full"
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                }}
              >
                {/* Blog image */}
                <div className="relative h-[240px] overflow-hidden rounded-[18px]">
                  <BlogImage
                    src={blog.image}
                    alt={
                      blog.alt ||
                      blog.title
                    }
                    index={index}
                    className="h-full w-full"
                  />
                </div>

                {/* Blog information */}
                <div className="mt-4 flex min-h-[210px] flex-col rounded-[18px] bg-[#f8fbff] p-5">
                  <p className="mb-2 text-xs font-medium text-[#3fa2a3]">
                    {new Date(
                      blog.date
                    ).toLocaleDateString(
                      "en-CA",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <h2 className="mb-3 line-clamp-2 text-lg font-bold text-[#0b1f3a]">
                    {blog.title}
                  </h2>

                  <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                    {blog.description}
                  </p>

                  <div className="mt-auto pt-4 text-sm font-semibold text-[#3fa2a3] transition-colors duration-300 group-hover:text-[#f7a236]">
                    Read Full Article
                    <span className="ml-2">
                      →
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3fa2a3] border-t-transparent" />
        </div>
      )}
    </>
  );
}