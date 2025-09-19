"use client";

import { useEffect, useState } from "react";

type TableOfContentsProps = {
    content: any; // This will be the rich text object from Contentful
};

const TableOfContents = ({ content }: TableOfContentsProps) => {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
        const headingsArray: { id: string; text: string; level: number }[] = [];

        // Iterate through the rich text content to find headings
        content?.content?.forEach((node: any) => {
            if (
                node.nodeType === "heading-1" ||
                node.nodeType === "heading-2" ||
                node.nodeType === "heading-3"
            ) {
                const headingText = node.content[0]?.value || "";
                const id = `${headingText.toLowerCase().replace(/\s+/g, "-")}`;
                const level = parseInt(node.nodeType.split("-")[1]); // Extract level (1, 2, 3)
                headingsArray.push({ id, text: headingText, level });
            }
        });
        console.log(headingsArray);

        setHeadings(headingsArray);
    }, [content]);

    return (
        <div className="mb-8  border-slate-800 border-r-[2px] border-dashed md:border-l-0 border-l-[2px] border-b-[2px] p-4 ">
            {headings.length > 0 && (
                <>
                    <h3 className="text-xl font-bold mb-4 font-inknut text-black text-let">Table of Contents</h3>
                    <ul className="list-disc list-inside text-gray-400">
                        {headings.map(({ id, text, level }, index) => (
                            <li
                                key={index}
                                className={`pl-${level * 4} mb-2`} // Indentation based on heading level
                            >
                                <a
                                    href={`#${id}`}
                                    className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-2"
                                >
                                    {text}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default TableOfContents;
