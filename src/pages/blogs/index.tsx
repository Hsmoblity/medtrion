import { useEffect, useState } from "react";
import BlogsList from "components/blog-list";
import { Blog } from "components/blog-preview";
import { client } from "lib/contentful/contentful";

const BlogsPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                // Fetch blog entries from Contentful
                const res = await client.getEntries({ content_type: 'blog' });

                // Map the blog data into the required Blog interface structure
                const fetchedBlogs: Blog[] = res.items.map((item: any) => {
                    const imageUrl = `https:${item.fields.mainImage.fields.file.url}`;
                    const altText = item.fields.mainImage.fields.title || item.fields.mainImage.fields.body || 'Blog image';

                    return {
                        date: new Date(item.sys.createdAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        }),
                        title: item.fields.title,
                        description: '',
                        link: `/blogs/${item.fields.url}`,  // Assuming dynamic blog route
                        image: imageUrl,
                        alt: altText,
                    };
                });

                setBlogs(fetchedBlogs);
                console.log(fetchedBlogs);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching blogs:", error);
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <BlogsList blogs={blogs} />;
};

export default BlogsPage;
