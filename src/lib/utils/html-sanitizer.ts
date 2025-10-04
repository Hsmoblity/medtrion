/**
 * HTML Sanitizer Utility
 * 
 * Provides safe HTML sanitization for user-generated content
 * to prevent XSS attacks and ensure proper text display.
 * 
 * @package HSM
 * @since 1.0.0
 */

/**
 * Sanitize HTML content by removing HTML tags and decoding entities
 * 
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized plain text
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const {
    maxLength = 0,
    preserveLineBreaks = false,
    decodeEntities = true,
    stripTags = true
  } = options;

  let sanitized = html;

  // Decode HTML entities
  if (decodeEntities) {
    sanitized = decodeHtmlEntities(sanitized);
  }

  // Strip HTML tags
  if (stripTags) {
    sanitized = stripHtmlTags(sanitized, preserveLineBreaks);
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length if specified
  if (maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim();
    // Add ellipsis if truncated
    if (sanitized.length === maxLength) {
      sanitized += '...';
    }
  }

  return sanitized;
}

/**
 * Strip HTML tags from string
 * 
 * @param html - HTML string
 * @param preserveLineBreaks - Whether to preserve line breaks
 * @returns Plain text without HTML tags
 */
function stripHtmlTags(html: string, preserveLineBreaks: boolean = false): string {
  if (preserveLineBreaks) {
    // Replace <br>, <br/>, <br /> with line breaks
    html = html.replace(/<br\s*\/?>/gi, '\n');
    // Replace </p>, </div>, </h1-6> with line breaks
    html = html.replace(/<\/(p|div|h[1-6])>/gi, '\n');
  }

  // Remove all HTML tags
  html = html.replace(/<[^>]*>/g, '');

  // Clean up multiple whitespace
  html = html.replace(/\s+/g, ' ');

  // Clean up multiple line breaks if preserving them
  if (preserveLineBreaks) {
    html = html.replace(/\n\s*\n/g, '\n');
  }

  return html;
}

/**
 * Decode HTML entities
 * 
 * @param html - HTML string with entities
 * @returns String with decoded entities
 */
function decodeHtmlEntities(html: string): string {
  const entityMap: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
  };

  let decoded = html;

  // Replace named entities
  for (const [entity, char] of Object.entries(entityMap)) {
    decoded = decoded.replace(new RegExp(entity, 'gi'), char);
  }

  // Replace numeric entities (&#123; and &#x1A;)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });

  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  return decoded;
}

/**
 * Sanitize HTML for display in React components
 * 
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text safe for React rendering
 */
export function sanitizeForReact(html: string, options: SanitizeOptions = {}): string {
  return sanitizeHtml(html, {
    ...options,
    stripTags: true,
    decodeEntities: true
  });
}

/**
 * Sanitize HTML while preserving basic formatting
 * 
 * @param html - HTML string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized text with preserved formatting
 */
export function sanitizeWithFormatting(html: string, options: SanitizeOptions = {}): string {
  return sanitizeHtml(html, {
    ...options,
    preserveLineBreaks: true,
    stripTags: true,
    decodeEntities: true
  });
}

/**
 * Check if string contains HTML tags
 * 
 * @param text - Text to check
 * @returns True if contains HTML tags
 */
export function containsHtmlTags(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  return /<[^>]*>/g.test(text);
}

/**
 * Get plain text length (without HTML tags)
 * 
 * @param html - HTML string
 * @returns Length of plain text content
 */
export function getPlainTextLength(html: string): number {
  if (!html || typeof html !== 'string') {
    return 0;
  }
  
  return sanitizeHtml(html).length;
}

/**
 * Sanitization options interface
 */
export interface SanitizeOptions {
  /** Maximum length of output string (0 = no limit) */
  maxLength?: number;
  /** Whether to preserve line breaks from block elements */
  preserveLineBreaks?: boolean;
  /** Whether to decode HTML entities */
  decodeEntities?: boolean;
  /** Whether to strip HTML tags */
  stripTags?: boolean;
}

/**
 * Sanitize content for RichContent component
 * 
 * @param content - HTML content to sanitize
 * @returns Sanitized content safe for display
 */
export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    maxLength: 0,
    preserveLineBreaks: true,
    decodeEntities: true,
    stripTags: true
  });
}

/**
 * Default sanitization options
 */
export const DEFAULT_SANITIZE_OPTIONS: SanitizeOptions = {
  maxLength: 0,
  preserveLineBreaks: false,
  decodeEntities: true,
  stripTags: true
};