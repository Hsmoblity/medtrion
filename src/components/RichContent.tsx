"use client";

import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Document } from '@contentful/rich-text-types';
import { sanitizeContent } from '../lib/utils/html-sanitizer';

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

    // HTML string - sanitize to prevent HTML tags from showing literally
    if (typeof content === 'string') {
        try {
            const sanitizedContent = sanitizeContent(content);
            return (
                <div 
                    className={className}
                    suppressHydrationWarning={true}
                >
                    {sanitizedContent}
                </div>
            );
        } catch (error) {
            console.warn('RichContent: Error sanitizing HTML content:', error);
            // Fallback to plain text if sanitization fails
            return (
                <div 
                    className={className}
                    suppressHydrationWarning={true}
                >
                    {content}
                </div>
            );
        }
    }

    return null;
}
