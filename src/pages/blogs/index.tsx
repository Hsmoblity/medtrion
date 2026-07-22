import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import MetaHead from '../../components/MetaHead';
import BlogsList from '../../components/blog-list';
import { Blog } from '../../components/blog-preview';

// Temporary blog data for demonstration
const TEMPORARY_BLOGS: Blog[] = [
  {
    date: '2024-01-15',
    title: 'Understanding Mobility Solutions for Seniors',
    description: 'Learn about the latest mobility solutions designed to help seniors maintain independence and improve quality of life.',
    link: '/blogs/mobility-solutions-seniors',
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop&q=80',
    alt: 'Senior using mobility device'
  },
  {
    date: '2024-01-10',
    title: 'Stairlift Installation: What to Expect',
    description: 'A comprehensive guide to stairlift installation process, timeline, and what homeowners should expect.',
    link: '/blogs/stairlift-installation-guide',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80',
    alt: 'Stairlift installation process'
  },
  {
    date: '2024-01-05',
    title: 'Home Safety Tips for Mobility Challenges',
    description: 'Essential home safety modifications and tips for individuals with mobility challenges.',
    link: '/blogs/home-safety-tips',
    image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=300&fit=crop&q=80',
    alt: 'Home safety modifications'
  },
  {
    date: '2024-01-01',
    title: 'Choosing the Right Mobility Equipment',
    description: 'A guide to selecting the best mobility equipment based on individual needs and home environment.',
    link: '/blogs/choosing-mobility-equipment',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80',
    alt: 'Various mobility equipment options'
  },
  {
    date: '2023-12-28',
    title: 'Maintaining Your Stairlift: A Complete Guide',
    description: 'Learn how to properly maintain your stairlift to ensure optimal performance and longevity.',
    link: '/blogs/stairlift-maintenance-guide',
    image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2f6c5?w=400&h=300&fit=crop&q=80',
    alt: 'Stairlift maintenance'
  },
  {
    date: '2023-12-25',
    title: 'Creating an Accessible Home Environment',
    description: 'Transform your home into a more accessible space with these practical tips and modifications.',
    link: '/blogs/accessible-home-environment',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop&q=80',
    alt: 'Accessible home modifications'
  }
];

interface BlogsPageProps {
  blogs: Blog[];
  error?: string;
}

const BlogsPage: React.FC<BlogsPageProps> = ({ blogs: propBlogs, error: propError }) => {
  const [blogs, setBlogs] = useState<Blog[]>(propBlogs || []);
  const [loading, setLoading] = useState(!propBlogs);
  const [error, setError] = useState<string | null>(propError || null);

  useEffect(() => {
    // If no blogs were provided via props, fetch them
    if (!propBlogs) {
      const fetchBlogs = async () => {
        try {
          setLoading(true);
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Use temporary data for now
          setBlogs(TEMPORARY_BLOGS);
          setError(null);
        } catch (err) {
          console.error("Error fetching blogs:", err);
          setError("Unable to load blogs at this time. Please try again later.");
          // Fallback to temporary data
          setBlogs(TEMPORARY_BLOGS);
        } finally {
          setLoading(false);
        }
      };

      fetchBlogs();
    }
  }, [propBlogs]);

  return (
    <>
      <MetaHead 
        title="Blog - Medtrion" 
        description="Stay informed with the latest insights on mobility solutions, home safety, and independent living tips."
      />
      
      <div className="min-h-screen bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading blogs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Blogs Temporarily Unavailable</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-[#3fa2a3] text-white px-6 py-3 rounded-[35px] font-primary font-semibold hover:bg-[#f7a236] transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <BlogsList blogs={blogs} />
        )}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BlogsPageProps> = async () => {
  try {
    // For now, return temporary blog data
    // In the future, this can be replaced with Contentful integration
    return {
      props: {
        blogs: TEMPORARY_BLOGS,
      },
    };
  } catch (error) {
    console.error('Error in blogs page getServerSideProps:', error);
    
    return {
      props: {
        blogs: TEMPORARY_BLOGS, // Fallback to temporary data
        error: 'Unable to load blogs at this time. Please try again later.'
      },
    };
  }
};

export default BlogsPage;
