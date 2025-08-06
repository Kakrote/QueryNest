import { sanitizePlainText, sanitizeRichText, sanitizeFormData } from './sanitize';

/**
 * Server-side input validation and sanitization utilities
 */

/**
 * Validates and sanitizes question data
 * @param {Object} questionData - The question data to validate
 * @returns {Object} - Validated and sanitized data or error
 */
export const validateQuestionData = (questionData) => {
  const { title, content, tags } = questionData;

  // Required field validation
  if (!title || !content || !tags) {
    return {
      isValid: false,
      error: 'Title, content, and tags are required fields'
    };
  }

  // Length validations
  if (title.length > 200) {
    return {
      isValid: false,
      error: 'Title must be less than 200 characters'
    };
  }

  if (content.length > 10000) {
    return {
      isValid: false,
      error: 'Content must be less than 10,000 characters'
    };
  }

  // Sanitize data
  const sanitizedTitle = sanitizePlainText(title);
  const sanitizedContent = sanitizeRichText(content);
  
  // Handle tags array or string
  let sanitizedTags;
  if (Array.isArray(tags)) {
    sanitizedTags = tags
      .map(tag => sanitizePlainText(tag.trim()))
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .slice(0, 10); // Limit to 10 tags
  } else {
    sanitizedTags = tags
      .split(',')
      .map(tag => sanitizePlainText(tag.trim()))
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .slice(0, 10);
  }

  if (sanitizedTags.length === 0) {
    return {
      isValid: false,
      error: 'At least one valid tag is required'
    };
  }

  return {
    isValid: true,
    data: {
      title: sanitizedTitle,
      content: sanitizedContent,
      tags: sanitizedTags
    }
  };
};

/**
 * Validates and sanitizes answer data
 * @param {Object} answerData - The answer data to validate
 * @returns {Object} - Validated and sanitized data or error
 */
export const validateAnswerData = (answerData) => {
  const { content, questionslug } = answerData;

  // Required field validation
  if (!content || !questionslug) {
    return {
      isValid: false,
      error: 'Content and question slug are required'
    };
  }

  // Length validation
  if (content.length > 10000) {
    return {
      isValid: false,
      error: 'Answer content must be less than 10,000 characters'
    };
  }

  // Sanitize data
  const sanitizedContent = sanitizeRichText(content);
  const sanitizedSlug = sanitizePlainText(questionslug);

  return {
    isValid: true,
    data: {
      content: sanitizedContent,
      questionslug: sanitizedSlug
    }
  };
};

/**
 * Validates and sanitizes user registration data
 * @param {Object} userData - The user data to validate
 * @returns {Object} - Validated and sanitized data or error
 */
export const validateUserData = (userData) => {
  const { name, email, password } = userData;

  // Required field validation
  if (!name || !email || !password) {
    return {
      isValid: false,
      error: 'Name, email, and password are required'
    };
  }

  // Length validations
  if (name.length < 2 || name.length > 50) {
    return {
      isValid: false,
      error: 'Name must be between 2 and 50 characters'
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long'
    };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  // Name format validation (only letters, numbers, spaces, underscores, hyphens)
  const nameRegex = /^[a-zA-Z0-9\s_-]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, numbers, spaces, underscores, and hyphens'
    };
  }

  // Sanitize data
  const sanitizedName = sanitizePlainText(name);
  const sanitizedEmail = sanitizePlainText(email.toLowerCase());

  return {
    isValid: true,
    data: {
      name: sanitizedName,
      email: sanitizedEmail,
      password // Password is not sanitized as it will be hashed
    }
  };
};

/**
 * Validates search query
 * @param {string} query - The search query to validate
 * @returns {Object} - Validated and sanitized query or error
 */
export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      error: 'Search query is required'
    };
  }

  if (query.length > 100) {
    return {
      isValid: false,
      error: 'Search query must be less than 100 characters'
    };
  }

  const sanitizedQuery = sanitizePlainText(query.trim());

  if (sanitizedQuery.length < 2) {
    return {
      isValid: false,
      error: 'Search query must be at least 2 characters long'
    };
  }

  return {
    isValid: true,
    data: sanitizedQuery
  };
};

/**
 * Rate limiting helper
 * @param {string} identifier - Unique identifier (IP, user ID, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether request is allowed
 */
const rateLimitStore = new Map();

export const checkRateLimit = (identifier, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now();
  const key = `${identifier}:${Math.floor(now / windowMs)}`;
  
  const current = rateLimitStore.get(key) || 0;
  
  if (current >= maxRequests) {
    return false;
  }
  
  rateLimitStore.set(key, current + 1);
  
  // Clean up old entries
  for (const [k] of rateLimitStore) {
    const keyTime = parseInt(k.split(':')[1]);
    if ((now - keyTime * windowMs) > windowMs * 2) {
      rateLimitStore.delete(k);
    }
  }
  
  return true;
};

export default {
  validateQuestionData,
  validateAnswerData,
  validateUserData,
  validateSearchQuery,
  checkRateLimit
};
