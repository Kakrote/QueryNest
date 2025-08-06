import DOMPurify from 'dompurify';

// For server-side rendering, install isomorphic-dompurify
let serverDOMPurify;
if (typeof window === 'undefined') {
  try {
    // Import server-side DOMPurify
    const createDOMPurify = require('isomorphic-dompurify');
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    serverDOMPurify = createDOMPurify(window);
  } catch (error) {
    console.warn('Server-side DOMPurify not available, falling back to regex sanitization');
  }
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - The HTML content to sanitize
 * @returns {string} - The sanitized HTML content
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  if (typeof window === 'undefined') {
    // Server-side: use server DOMPurify or regex fallback
    if (serverDOMPurify) {
      return serverDOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'a', 'img',
          'hr'
        ],
        ALLOWED_ATTR: [
          'href', 'title', 'target', 'rel',
          'src', 'alt', 'width', 'height',
          'class'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        FORBID_SCRIPT: true,
        FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe', 'form', 'input', 'textarea', 'button'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onmousedown', 'onmouseup', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress'],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false
      });
    } else {
      // Fallback: aggressive regex cleaning for server-side
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed[^>]*>/gi, '')
        .replace(/<link[^>]*>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:(?!image\/)/gi, '');
    }
  }
  
  // Client-side: use DOMPurify to sanitize
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'a', 'img',
      'hr'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onmousedown', 'onmouseup', 'onmousemove', 'onkeydown', 'onkeyup', 'onkeypress'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false
  });
}

/**
 * Strips all HTML tags and returns plain text
 * @param {string} html - The HTML content to strip
 * @returns {string} - Plain text content
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  if (typeof window === 'undefined') {
    // Server-side: use regex to strip tags more thoroughly
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // Client-side: create a temporary element and extract text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(html);
  return tempDiv.textContent || tempDiv.innerText || '';
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return String(text).replace(/[&<>"'/`=]/g, (s) => map[s]);
}

/**
 * Sanitizes user input for safe display in text content
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeUserInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags and escape special characters
  return escapeHtml(stripHtml(input));
}

/**
 * Validates and sanitizes URLs to prevent XSS via href attributes
 * @param {string} url - URL to validate
 * @returns {string} - Safe URL or empty string if invalid
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim();
  
  // Allow only safe protocols
  const allowedProtocols = /^(https?|mailto|tel|sms|ftp):/i;
  const relativeUrl = /^[./]/;
  
  if (trimmedUrl.startsWith('javascript:') || 
      trimmedUrl.startsWith('vbscript:') || 
      trimmedUrl.startsWith('data:') ||
      trimmedUrl.includes('<script') ||
      trimmedUrl.includes('javascript:')) {
    return '';
  }

  if (allowedProtocols.test(trimmedUrl) || relativeUrl.test(trimmedUrl) || trimmedUrl.startsWith('#')) {
    return trimmedUrl;
  }

  // If it doesn't start with a protocol, assume it's a relative URL
  if (!trimmedUrl.includes(':')) {
    return trimmedUrl;
  }

  return '';
}
