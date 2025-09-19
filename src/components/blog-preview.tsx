"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

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

export function BlogsPre({ blogs }: BlogsPreProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [visibleBlogs, setVisibleBlogs] = useState<Blog[]>(blogs.slice(0, 6));
    const [loading, setLoading] = useState(false);

    // Load more blogs
    const loadMoreBlogs = () => {
        if (loading || visibleBlogs.length >= blogs.length) return;
        setLoading(true);

        setTimeout(() => {
            setVisibleBlogs(prev => [
                ...prev,
                ...blogs.slice(prev.length, prev.length + 6)
            ]);
            setLoading(false);
        }, 1000); // Simulate network delay
    };

    // Scroll event listener
    useEffect(() => {
        const onScroll = () => {
            // Check if the user is near the bottom
            const nearBottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500;

            if (nearBottom) {
                loadMoreBlogs();
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, [loading, visibleBlogs]);

    return (
        <>
            <div className="container mx-auto justify-center grid grid-cols-1 md:grid-cols-3 overflow-hidden gap-8 py-10">
                {visibleBlogs.map((blog, index) => (
                    <Link
                        href={blog.link}
                        key={index}
                        className="relative block p-2 h-full w-full group"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        aria-label={`link to ${blog.title}`}
                    >
                        <AnimatePresence>
                            {hoveredIndex === index && (
                                <motion.span
                                    className="absolute inset-0 h-full w-full bg-neutral-200  block rounded-xl"
                                    layoutId="hoverBackground"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        transition: { duration: 0.15 },
                                    }}
                                    exit={{
                                        opacity: 0,
                                        transition: { duration: 0.15, delay: 0.2 },
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Motion component for fade-in */}
                        <motion.div
                            className="relative w-full z-10 opacity-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.7 }} // Duration of fade-in
                        >
                            {/* Image Container */}
                            <div className="h-[300px] overflow-hidden rounded-t-xl">
                                <img
                                    className="h-full w-full object-fill" // Ensures the image fills the container
                                    src={blog.image} // Directly use the image URL
                                    alt={blog.alt || "Blog image"}
                                    loading='lazy'
                                    height={300}
                                />
                            </div>
                            <div className=" inset-y-0 left-0 w-full bg-[#f0eade]  rounded-b-md  flex flex-col justify-center">

                                <h2 className="text-lg font-bold text-black m-4 line-clamp-3">
                                    {blog.title}
                                </h2>
                                <h2 className="text-lg font-bold text-white m-4 line-clamp-3">
                                    {blog.description}
                                </h2>
                            </div>
                            {/* Clickable Area */}
                            <span className="absolute inset-0 z-10" />
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="flex justify-center py-4">
                    <div className="w-12 h-12 border-4 border-t-transparent border-amber-500 rounded-full animate-spin"></div>
                </div>
            )}
        </>
    );
}
