/**
 * XSS Protection Utilities for QueryNest
 * Provides comprehensive sanitization for user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

type SanitizeType = 'RICH_TEXT' | 'PLAIN_TEXT' | 'SEARCH';

interface SanitizeConfig {
  ALLOWED_TAGS: string[];
  ALLOWED_ATTR: { [key: string]: string[] };
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
  KEEP_CONTENT: boolean;
}

/**
 * Configuration for different content types
 */
const SANITIZE_CONFIGS: Record<SanitizeType, SanitizeConfig> = {
  // For rich text content (questions, answers) - allows formatting but blocks scripts
  RICH_TEXT: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'hr', 'a'
    ],
    ALLOWED_ATTR: {
      'a': ['href', 'title'],
      '*': ['class'] // Allow class attributes for styling
    },
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onsubmit', 'onfocus', 'onblur'],
    KEEP_CONTENT: true
  },

  // For plain text (titles, tags, user names) - strips all HTML
  PLAIN_TEXT: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: {},
    KEEP_CONTENT: true
  },

  // For search queries - very restrictive
  SEARCH: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: {},
    KEEP_CONTENT: true
  }
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param content - The content to sanitize
 * @param type - The type of content ('RICH_TEXT', 'PLAIN_TEXT', 'SEARCH')
 * @returns Sanitized content
 */
export const sanitizeContent = (content: string, type: SanitizeType = 'RICH_TEXT'): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const config = SANITIZE_CONFIGS[type] || SANITIZE_CONFIGS.RICH_TEXT;
  
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: config.ALLOWED_TAGS,
    ALLOWED_ATTR: config.ALLOWED_ATTR,
    FORBID_TAGS: config.FORBID_TAGS,
    FORBID_ATTR: config.FORBID_ATTR,
    KEEP_CONTENT: config.KEEP_CONTENT,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  });
};

/**
 * Sanitizes rich text content (questions, answers)
 * @param content - Rich text content
 * @returns Sanitized content
 */
export const sanitizeRichText = (content: string): string => {
  return sanitizeContent(content, 'RICH_TEXT');
};

/**
 * Sanitizes plain text content (titles, tags, names)
 * @param content - Plain text content
 * @returns Sanitized content
 */
export const sanitizePlainText = (content: string): string => {
  return sanitizeContent(content, 'PLAIN_TEXT');
};

/**
 * Sanitizes search queries
 * @param query - Search query
 * @returns Sanitized query
 */
export const sanitizeSearchQuery = (query: string): string => {
  return sanitizeContent(query, 'SEARCH');
};

/**
 * Escapes HTML entities for display in plain text contexts
 * @param text - Text to escape
 * @returns Escaped text
 */
export const escapeHtml = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return text.replace(/[&<>"'/]/g, (s) => map[s]);
};

/**
 * Validates and sanitizes URL inputs
 * @param url - URL to validate
 * @returns Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove any whitespace
  url = url.trim();

  // Check for allowed protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:'];
  
  try {
    const urlObj = new URL(url);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch (error) {
    // If not a valid URL, return null
    return null;
  }
};

/**
 * Validates and sanitizes form input data
 * @param data - Form data object
 * @param schema - Validation schema
 * @returns Sanitized data
 */
export const sanitizeFormData = (data: Record<string, any>, schema: Record<string, SanitizeType> = {}): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    const fieldType = schema[key] || 'PLAIN_TEXT';
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeContent(value, fieldType);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeContent(item, fieldType) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Content Security Policy headers helper
 */
export const CSP_HEADERS: { [key: string]: string } = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: Consider removing unsafe-inline and unsafe-eval in production
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
};

export default {
  sanitizeContent,
  sanitizeRichText,
  sanitizePlainText,
  sanitizeSearchQuery,
  escapeHtml,
  sanitizeUrl,
  sanitizeFormData,
  CSP_HEADERS
};
