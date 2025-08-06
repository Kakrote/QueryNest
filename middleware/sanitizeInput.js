/**
 * Input sanitization middleware for API routes
 * Sanitizes request bodies to prevent XSS attacks
 */

/**
 * Recursively sanitizes all string values in an object
 * @param {any} obj - The object to sanitize
 * @returns {any} - The sanitized object
 */
function deepSanitize(obj) {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitizes a string by removing/escaping dangerous characters
 * @param {string} str - The string to sanitize
 * @returns {string} - The sanitized string
 */
function sanitizeString(str) {
  if (!str || typeof str !== 'string') {
    return str;
  }

  return str
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object/embed tags
    .replace(/<(object|embed)[^>]*>/gi, '')
    // Remove link and style tags
    .replace(/<(link|style)[^>]*>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: and vbscript: protocols
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    // Remove data: URLs except for images
    .replace(/data:(?!image\/)/gi, '')
    // Limit certain characters that could be problematic
    .replace(/[<>]/g, (match) => {
      return match === '<' ? '&lt;' : '&gt;';
    });
}

/**
 * Express-like middleware for sanitizing request body
 * @param {object} req - Request object
 * @param {object} res - Response object  
 * @param {function} next - Next function
 */
export function sanitizeInputMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query);
  }
  
  next();
}

/**
 * Sanitize input data for safe storage and display
 * @param {any} data - The data to sanitize
 * @returns {any} - The sanitized data
 */
export function sanitizeInput(data) {
  return deepSanitize(data);
}
