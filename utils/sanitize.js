/**
 * XSS Protection Utilities for QueryNest
 * Provides comprehensive sanitization for user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for different content types
 */
const SANITIZE_CONFIGS = {
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
 * @param {string} content - The content to sanitize
 * @param {string} type - The type of content ('RICH_TEXT', 'PLAIN_TEXT', 'SEARCH')
 * @returns {string} - Sanitized content
 */
export const sanitizeContent = (content, type = 'RICH_TEXT') => {
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
 * @param {string} content - Rich text content
 * @returns {string} - Sanitized content
 */
export const sanitizeRichText = (content) => {
  return sanitizeContent(content, 'RICH_TEXT');
};

/**
 * Sanitizes plain text content (titles, tags, names)
 * @param {string} content - Plain text content
 * @returns {string} - Sanitized content
 */
export const sanitizePlainText = (content) => {
  return sanitizeContent(content, 'PLAIN_TEXT');
};

/**
 * Sanitizes search queries
 * @param {string} query - Search query
 * @returns {string} - Sanitized query
 */
export const sanitizeSearchQuery = (query) => {
  return sanitizeContent(query, 'SEARCH');
};

/**
 * Escapes HTML entities for display in plain text contexts
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map = {
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
 * @param {string} url - URL to validate
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
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
 * @param {Object} data - Form data object
 * @param {Object} schema - Validation schema
 * @returns {Object} - Sanitized data
 */
export const sanitizeFormData = (data, schema = {}) => {
  const sanitized = {};

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
export const CSP_HEADERS = {
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
