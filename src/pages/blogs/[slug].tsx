import Head from "next/head";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { client } from "lib/contentful/contentful";
import TableOfContents from "components/toc";
import Footer from "components/PageLayout/Footer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import FAQ from "components/faq";
import Banner from "components/banner";
import Form from "components/step-form";
import { Reviews } from "components/reviews";

export async function getServerSideProps(context: any) {
    const { slug } = context.params;

    const response = await client.getEntries({
        content_type: "blog",
        "fields.url[in]": slug,
        limit: 1,
    });

    if (response.items.length === 0) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            blogDetailData: response.items[0],
        },
    };
}

const BlogDetailPage = ({ blogDetailData }: any) => {
    const title = blogDetailData.fields.title || "Blog Post | Health & Supply Mobility";
    const description = blogDetailData.fields.excerpt || "Discover our latest blog post at Health & Supply Mobility.";
    const imageUrl = `https:${blogDetailData.fields.mainImage.fields.file.url}`;
    const publishedTime = new Date(blogDetailData.sys.createdAt).toISOString();
    const renderOptions = {
        renderNode: {
            [BLOCKS.HEADING_1]: (node: any, children: any) => {
                const headingText = children
                    .toString()
                    .replace(/\[.*?\]|\(.*?\)/g, '')
                    .replace(/[^a-z0-9\s-]/gi, '')
                    .replace(/[\s-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase();
                return (
                    <h1 id={headingText} className="text-4xl font-bold font-inknut p-6 text-black">
                        {children}
                    </h1>
                );
            },
            [BLOCKS.HEADING_2]: (node: any, children: any) => {
                const headingText = children
                    .toString()
                    .replace(/\[.*?\]|\(.*?\)/g, '')
                    .replace(/[^a-z0-9\s-]/gi, '')
                    .replace(/[\s-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase();
                return (
                    <h2 id={headingText} className="text-3xl font-semibold font-inknut p-4 text-center text-black">
                        {children}
                    </h2>
                );
            },
            [BLOCKS.HEADING_3]: (node: any, children: any) => {
                const headingText = children
                    .toString()
                    .replace(/\[.*?\]|\(.*?\)/g, '')
                    .replace(/[^a-z0-9\s-]/gi, '')
                    .replace(/[\s-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase();
                return (
                    <h3 id={headingText} className="text-2xl font-medium font-inknut p-2 text-black">
                        {children}
                    </h3>
                );
            },
            [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => (
                <p className="mb-4 text-black">{children}</p>
            ),
            [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => (
                <ul className="list-disc pl-5 text-black">{children}</ul>
            ),
            [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => (
                <ol className="list-decimal pl-5 text-black">{children}</ol>
            ),
            [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => (
                <li className="text-black">{children}</li>
            ),
            [BLOCKS.QUOTE]: (node: any, children: React.ReactNode) => (
                <blockquote className="border-l-4 pl-4 italic text-black">{children}</blockquote>
            ),
            [BLOCKS.EMBEDDED_ASSET]: (_node: any) => {
                const { title, file } = _node.data.target.fields;
                return (
                    <div className="mb-4">
                        <img src={`https:${file.url}`} alt={title} className="rounded-lg" />
                        <p>{title}</p>
                    </div>
                );
            },
            [BLOCKS.HR]: () => <hr className="my-4 border-gray-300" />,
            [BLOCKS.TABLE]: (node: any, children: React.ReactNode) => (
                <table className="min-w-full">{children}</table>
            ),
            [BLOCKS.TABLE_ROW]: (node: any, children: React.ReactNode) => (
                <tr>{children}</tr>
            ),
            [BLOCKS.TABLE_CELL]: (node: any, children: React.ReactNode) => (
                <td className="border px-4 py-2">{children}</td>
            ),

            // Inline nodes
            [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => (
                <a href={node.data.uri} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ),
        },
        renderMark: {
            [MARKS.BOLD]: (text: React.ReactNode) => <strong className="text-black font-bold">{text}</strong>,
            [MARKS.ITALIC]: (text: React.ReactNode) => <em className="text-black">{text}</em>,
            [MARKS.UNDERLINE]: (text: React.ReactNode) => <u className="text-black underline">{text}</u>,
            [MARKS.CODE]: (text: React.ReactNode) => <code className="bg-gray-700 rounded px-1">{text}</code>,
        },
    };

    // Format the creation date
    const createdAt = new Date(blogDetailData.sys.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:image" content={imageUrl} />
                <meta property="og:url" content={`https://hsmobility.ca/blogs/${blogDetailData.fields.slug}`} />
                <meta property="article:published_time" content={publishedTime} />
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content={title} />
                <meta property="twitter:description" content={description} />
                <meta property="twitter:image" content={imageUrl} />
                <link rel="canonical" href={`https://hsmobility.ca/blogs/${blogDetailData.fields.slug}`} />
            </Head>

            <section className="bg-dot-slate-50/10">
                <div className="absolute -top-2 justify-center w-full bg-[url('/nnnoise.svg')] bg-cover bg-repeat md:h-[75vh] h-[50vh] -z-40"> </div>
                <div className="max-w-5xl mt-20 mx-auto px-5 overflow-x-hidden scroll-smooth">
                    <div className="flex">
                        <Link
                            href="/"
                            className="flex items-center gap-2 mt-10 hover:text-[#719b8f] text-sm md:text-base text-red-800"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="md:size-5 size-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 19.5 8.25 12l7.5-7.5"
                                />
                            </svg>{" "}
                            Back to home
                        </Link>
                    </div>

                    <div className="flex justify-between md:mt-10 mt-8">
                        <div className="text-gray-500">{createdAt}</div>
                        {/* <div className="flex gap-5">
                            <a href="https://www.linkedin.com/company/harbourfrontwebdesigns/" target="_blank" rel="noopener noreferrer">
                                <FaLinkedinIn className="h-6 w-6 text-amber-500" title="LinkedIn" />
                            </a>
                            <a href="https://www.instagram.com/harbourfrontwebdesigns/" target="_blank" rel="noopener noreferrer">
                                <FaInstagram className="h-6 w-6 text-amber-500" title="Instagram" />
                            </a>
                        </div> */}
                    </div>

                    <div className="flex flex-col items-center">
                        <h1 className="text-center md:text-4xl font-inknut text-xl font-bold md:mt-10 mt-8 mb-4">
                            {blogDetailData.fields.title}
                        </h1>
                    </div>

                    <div className="border-b-2 pb-10 border-slate-800 border-dashed">
                        <Image
                            src={`https:${blogDetailData.fields.mainImage.fields.file.url}`}
                            width={blogDetailData.fields.mainImage.fields.file.details.image.width}
                            height={blogDetailData.fields.mainImage.fields.file.details.image.height}
                            alt={blogDetailData.fields.mainImage.fields.title || "Blog Image"}
                            title={blogDetailData.fields.mainImage.fields.title || "Blog Image"}
                            className="h-full w-full rounded-xl flex justify-center"
                            loading="lazy"
                        />
                    </div>

                    <div className="max-w-6xl flex md:flex-row flex-col mx-auto overflow-x-hidden scroll-smooth">
                        <div className="md:w-1/4">
                            <TableOfContents content={blogDetailData.fields.body} />
                        </div>
                        <div className="prose md:w-3/4 w-full text-black max-w-full mb-10 text-left lg:px-5 md:mt-10 mt-5">
                            {documentToReactComponents(blogDetailData.fields.body, renderOptions)}
                        </div>
                    </div>
                </div>

                <Banner />
                <div className="py-8">

                    <Form />
                </div>

                {/* <Specs /> */}

            </section>
        </>
    );
};

export default BlogDetailPage;
