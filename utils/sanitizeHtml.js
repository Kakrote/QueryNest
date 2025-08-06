/**
 * Simple HTML sanitization utility to prevent XSS attacks
 * Allows basic formatting tags but removes dangerous elements and attributes
 */

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
];

const ALLOWED_ATTRIBUTES = {
  '*': ['class'],
  'a': ['href', 'target'],
  'img': ['src', 'alt', 'width', 'height']
};

export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Function to sanitize a single element
  function sanitizeElement(element) {
    const tagName = element.tagName.toLowerCase();
    
    // Remove script and style tags completely
    if (tagName === 'script' || tagName === 'style') {
      element.remove();
      return;
    }

    // If tag is not allowed, replace with its content
    if (!ALLOWED_TAGS.includes(tagName)) {
      const textNode = document.createTextNode(element.textContent || '');
      element.parentNode?.replaceChild(textNode, element);
      return;
    }

    // Remove dangerous attributes
    const allowedAttrs = [...(ALLOWED_ATTRIBUTES['*'] || []), ...(ALLOWED_ATTRIBUTES[tagName] || [])];
    const attributes = Array.from(element.attributes);
    
    attributes.forEach(attr => {
      const attrName = attr.name.toLowerCase();
      
      // Remove event handlers and dangerous attributes
      if (attrName.startsWith('on') || 
          attrName === 'javascript:' || 
          attrName.includes('script') ||
          !allowedAttrs.includes(attrName)) {
        element.removeAttribute(attr.name);
      }
    });

    // Sanitize href attributes
    if (element.getAttribute('href')) {
      const href = element.getAttribute('href');
      if (href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('vbscript:')) {
        element.removeAttribute('href');
      }
    }

    // Recursively sanitize child elements
    Array.from(element.children).forEach(child => {
      sanitizeElement(child);
    });
  }

  // Sanitize all elements
  Array.from(temp.children).forEach(child => {
    sanitizeElement(child);
  });

  return temp.innerHTML;
}

/**
 * Server-side HTML sanitization (fallback for Node.js environment)
 */
export function sanitizeHtmlServer(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Basic server-side sanitization - removes script tags and dangerous patterns
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+\s*=\s*['""][^'"]*['"]/gi, '')
    .replace(/on\w+\s*=\s*[^'"\s>]+/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
}

/**
 * Safe HTML sanitization that works in both browser and Node.js
 */
export function sanitizeContent(content) {
  if (typeof window !== 'undefined') {
    return sanitizeHtml(content);
  } else {
    return sanitizeHtmlServer(content);
  }
}