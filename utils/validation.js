import { sanitizeUserInput, escapeHtml } from './sanitize';

/**
 * Validation rules for different input types
 */
const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    errorMessage: 'Please enter a valid email address'
  },
  username: {
    pattern: /^[a-zA-Z0-9_-]{3,20}$/,
    maxLength: 20,
    errorMessage: 'Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores'
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    errorMessage: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  title: {
    minLength: 5,
    maxLength: 200,
    errorMessage: 'Title must be between 5 and 200 characters'
  },
  content: {
    minLength: 10,
    maxLength: 10000,
    errorMessage: 'Content must be between 10 and 10,000 characters'
  },
  tags: {
    maxLength: 500,
    pattern: /^[a-zA-Z0-9,-\s]+$/,
    errorMessage: 'Tags can only contain letters, numbers, commas, and spaces'
  }
};

/**
 * Validates and sanitizes form input
 * @param {string} value - The value to validate
 * @param {string} type - The type of validation to apply
 * @returns {object} - {isValid: boolean, sanitizedValue: string, error: string}
 */
export function validateAndSanitizeInput(value, type) {
  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      sanitizedValue: '',
      error: 'Value is required'
    };
  }

  const rule = validationRules[type];
  if (!rule) {
    // Default sanitization for unknown types
    return {
      isValid: true,
      sanitizedValue: sanitizeUserInput(value),
      error: null
    };
  }

  // Check length constraints
  if (rule.minLength && value.length < rule.minLength) {
    return {
      isValid: false,
      sanitizedValue: sanitizeUserInput(value),
      error: rule.errorMessage
    };
  }

  if (rule.maxLength && value.length > rule.maxLength) {
    return {
      isValid: false,
      sanitizedValue: sanitizeUserInput(value.substring(0, rule.maxLength)),
      error: rule.errorMessage
    };
  }

  // Check pattern constraints
  if (rule.pattern && !rule.pattern.test(value)) {
    return {
      isValid: false,
      sanitizedValue: sanitizeUserInput(value),
      error: rule.errorMessage
    };
  }

  return {
    isValid: true,
    sanitizedValue: sanitizeUserInput(value),
    error: null
  };
}

/**
 * Validates and sanitizes a complete form object
 * @param {object} formData - The form data to validate
 * @param {object} schema - Schema defining validation rules for each field
 * @returns {object} - {isValid: boolean, sanitizedData: object, errors: object}
 */
export function validateAndSanitizeForm(formData, schema) {
  const sanitizedData = {};
  const errors = {};
  let isValid = true;

  for (const [field, value] of Object.entries(formData)) {
    const fieldType = schema[field];
    
    if (fieldType) {
      const result = validateAndSanitizeInput(value, fieldType);
      sanitizedData[field] = result.sanitizedValue;
      
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
      }
    } else {
      // Apply default sanitization for fields not in schema
      sanitizedData[field] = sanitizeUserInput(value);
    }
  }

  return {
    isValid,
    sanitizedData,
    errors
  };
}

/**
 * Schema definitions for common forms
 */
export const formSchemas = {
  question: {
    title: 'title',
    content: 'content',
    tags: 'tags'
  },
  user: {
    name: 'username',
    email: 'email',
    password: 'password'
  },
  login: {
    email: 'email',
    password: 'password'
  }
};

/**
 * Rate limiting validation for API endpoints
 * @param {string} identifier - User identifier (IP, userId, etc.)
 * @param {string} action - Action type (login, question, etc.)
 * @returns {boolean} - Whether the action is allowed
 */
export function validateRateLimit(identifier, action) {
  // This is a basic in-memory rate limiter
  // In production, use Redis or similar for persistent storage
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }

  const key = `${identifier}:${action}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  
  // Define limits per action type
  const limits = {
    login: 5,        // 5 attempts per 15 minutes
    question: 10,    // 10 questions per 15 minutes
    answer: 20,      // 20 answers per 15 minutes
    vote: 100,       // 100 votes per 15 minutes
    default: 50      // Default limit
  };

  const maxAttempts = limits[action] || limits.default;
  
  const attempts = global.rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Reset if window has expired
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + windowMs;
  }
  
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  attempts.count++;
  global.rateLimitStore.set(key, attempts);
  
  return true;
}
