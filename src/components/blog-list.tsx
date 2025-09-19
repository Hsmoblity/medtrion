"use client"
import { BlogsPre, BlogsPreProps } from "./blog-preview";

const BlogsList = ({ blogs }: BlogsPreProps) => {
    const fadeInVariant = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } }
    };


    return (
        <div >
            <div className="max-w-7xl mt-20 text-4xl text-red-500 font-poppins font-medium pt-20 md:ml-10 mx-4 w-full">
                Latest Blogs
            </div>
            <BlogsPre blogs={blogs} />
        </div>
    );
}

export default BlogsList;
