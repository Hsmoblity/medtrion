"use client"
import { BlogsPre, BlogsPreProps } from "./blog-preview";

const BlogsList = ({ blogs }: BlogsPreProps) => {
    const fadeInVariant = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } }
    };


    return (
        <section className="py-12 sm:py-14">
            <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#0b1f3a]">
                        Latest Blogs
                    </h2>
                    <div className="mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#f7a236] to-[#3fa2a3]" />
                </div>

                <div className="rounded-[28px] border border-[#0b1f3a]/10 bg-gradient-to-br from-white via-[#f8fbff] to-[#f2fbfa] p-6 shadow-[0_20px_60px_rgba(11,31,58,0.08)] sm:p-8">
                    <BlogsPre blogs={blogs} />
                </div>
            </div>
        </section>
    );
}

export default BlogsList;
