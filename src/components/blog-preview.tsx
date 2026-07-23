"use client";
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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

// Blog Image Component with fallback handling
const BlogImage: React.FC<{ 
    src: string; 
    alt: string; 
    index: number;
    className?: string;
}> = ({ src, alt, index, className = "" }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Fallback images for different types of content
    const fallbackImages = [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&q=80', // Home accessibility
        'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&q=80', // Senior mobility
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80', // Home safety/stairs
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80', // Equipment/tools
        'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=300&fit=crop&q=80', // Maintenance
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&q=80'  // Modern home interior
    ];

    const handleError = () => {
        setHasError(true);
        setIsLoading(false);
        // Use a different fallback image based on index
        const fallbackIndex = index % fallbackImages.length;
        const fallbackSrc = fallbackImages[fallbackIndex];
        
        if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
            setHasError(false);
            setIsLoading(true);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    return (
        <div className="relative w-full h-full">
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#3fa2a3] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            <Image
                className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
                src={imgSrc}
                alt={alt}
                width={400}
                height={300}
                style={{ objectFit: 'cover' }}
                priority={index < 3}
                onLoad={handleLoad}
                onError={handleError}
            />
            
            {hasError && (
                <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Image unavailable
                </div>
            )}
        </div>
    );
};

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
                            <svg className="h-8 w-8 text-[#3fa2a3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                className="px-6 py-3 bg-[#3fa2a3] text-white rounded-[35px] hover:bg-[#f7a236] transition-all duration-300 font-primary font-semibold focus:outline-none focus:ring-2 focus:ring-[#f7a236] focus:ring-offset-2"
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
            <div className="mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {visibleBlogs.map((blog, index) => (
                    <div
                        key={index}
                        className="group relative h-full w-full cursor-pointer overflow-hidden rounded-[24px] border border-[#0b1f3a]/10 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(11,31,58,0.08)]"
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
                                    className="absolute inset-0 block h-full w-full rounded-[24px] bg-[#f7fbfd]"
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
                            <div className="relative h-[240px] overflow-hidden rounded-[18px]">
                                <BlogImage
                                    src={blog.image}
                                    alt={blog.alt || "Blog image"}
                                    index={index}
                                    className="h-full w-full object-cover"
                                />
                                {/* Coming Soon Badge */}
                                <div className="absolute top-4 right-4 bg-[#3fa2a3] text-white px-3 py-1 rounded-full text-xs font-medium">
                                    Coming Soon
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col justify-center rounded-[18px] bg-[#f8fbff] p-4">
                                <h2 className="mb-2 text-lg font-bold text-[#0b1f3a] line-clamp-2">
                                    {blog.title}
                                </h2>
                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                    {blog.description}
                                </p>
                                <div className="mt-3 text-xs font-medium text-[#3fa2a3]">
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
                    <div className="w-12 h-12 border-4 border-t-transparent border-[#3fa2a3] rounded-full animate-spin"></div>
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

