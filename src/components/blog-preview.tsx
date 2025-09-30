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

// Coming Soon Modal Component
const ComingSoonModal: React.FC<{ isOpen: boolean; onClose: () => void; blogTitle: string }> = ({ 
    isOpen, 
    onClose, 
    blogTitle 
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="text-center">
                        {/* Icon */}
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Coming Soon!
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 mb-2">
                            <strong>"{blogTitle}"</strong>
                        </p>
                        <p className="text-gray-500 text-sm mb-6">
                            This blog post is currently being prepared. Check back soon for valuable insights on mobility solutions and home accessibility.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Got it
                            </button>
                            <button
                                onClick={() => {
                                    // Simple email collection placeholder
                                    const email = prompt('Enter your email to be notified when this blog post is published:');
                                    if (email && email.includes('@')) {
                                        alert('Thank you! We\'ll notify you when this blog post is available.');
                                        onClose();
                                    } else if (email) {
                                        alert('Please enter a valid email address.');
                                    }
                                }}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            >
                                Notify me
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export function BlogsPre({ blogs }: BlogsPreProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [visibleBlogs, setVisibleBlogs] = useState<Blog[]>(blogs.slice(0, 6));
    const [loading, setLoading] = useState(false);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [selectedBlogTitle, setSelectedBlogTitle] = useState('');

    // Handle blog card click
    const handleBlogClick = (e: React.MouseEvent, blog: Blog) => {
        e.preventDefault();
        setSelectedBlogTitle(blog.title);
        setShowComingSoon(true);
    };

    // Load more blogs
    const loadMoreBlogs = React.useCallback(() => {
        if (loading || visibleBlogs.length >= blogs.length) return;
        setLoading(true);

        setTimeout(() => {
            setVisibleBlogs(prev => [
                ...prev,
                ...blogs.slice(prev.length, prev.length + 6)
            ]);
            setLoading(false);
        }, 1000); // Simulate network delay
    }, [loading, visibleBlogs, blogs]);

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
    }, [loadMoreBlogs]);

    return (
        <>
            <div className="container mx-auto justify-center grid grid-cols-1 md:grid-cols-3 overflow-hidden gap-8 py-10">
                {visibleBlogs.map((blog, index) => (
                    <div
                        key={index}
                        className="relative block p-2 h-full w-full group cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={(e) => handleBlogClick(e, blog)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleBlogClick(e as any, blog);
                            }
                        }}
                        aria-label={`View details for ${blog.title} (Coming Soon)`}
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
                            <div className="h-[300px] overflow-hidden rounded-t-xl relative">
                                <img
                                    className="h-full w-full object-fill" // Ensures the image fills the container
                                    src={blog.image} // Directly use the image URL
                                    alt={blog.alt || "Blog image"}
                                    loading='lazy'
                                    height={300}
                                />
                                {/* Coming Soon Badge */}
                                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                    Coming Soon
                                </div>
                            </div>
                            <div className="inset-y-0 left-0 w-full bg-[#f0eade] rounded-b-md flex flex-col justify-center p-4">
                                <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                    {blog.title}
                                </h2>
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                    {blog.description}
                                </p>
                                <div className="mt-3 text-xs text-blue-600 font-medium">
                                    Click to learn more
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="flex justify-center py-4">
                    <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Coming Soon Modal */}
            <ComingSoonModal 
                isOpen={showComingSoon}
                onClose={() => setShowComingSoon(false)}
                blogTitle={selectedBlogTitle}
            />
        </>
    );
}
