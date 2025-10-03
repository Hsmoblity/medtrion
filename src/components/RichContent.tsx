"use client";

import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Document } from '@contentful/rich-text-types';

interface Props {
    content?: any;
    options?: any;
    className?: string;
}

export default function RichContent({ content, options, className }: Props) {
    if (!content) return null;

    // Contentful rich text Document
    if (typeof content === 'object' && Array.isArray(content?.content)) {
        try {
            return (
                <div 
                    className={className}
                    suppressHydrationWarning={true}
                >
                    {documentToReactComponents(content as Document, options)}
                </div>
            );
        } catch (e) {
            return null;
        }
    }

    // HTML string
    if (typeof content === 'string') {
        return (
            <div 
                className={className} 
                dangerouslySetInnerHTML={{ __html: content }}
                suppressHydrationWarning={true}
            />
        );
    }

    return null;
}
