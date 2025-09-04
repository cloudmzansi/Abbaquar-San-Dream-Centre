/**
 * Comprehensive input validation service
 * Provides security and data integrity validation for all user inputs
 */

// Validation patterns
const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  SAFE_TEXT: /^[a-zA-Z0-9\s.,!?-]+$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
};

// Validation error messages
const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PHONE: 'Please enter a valid phone number',
  NAME: 'Please enter a valid name (2-50 characters, letters only)',
  URL: 'Please enter a valid URL',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  INVALID_CHARACTERS: 'Contains invalid characters',
  DATE: 'Please enter a valid date (YYYY-MM-DD)',
  TIME: 'Please enter a valid time (HH:MM)',
  FILE_SIZE: (maxSize: number) => `File size must be less than ${maxSize}MB`,
  FILE_TYPE: 'Invalid file type',
  XSS: 'Invalid content detected',
  SQL_INJECTION: 'Invalid content detected'
};

// Validation functions
export const validators = {
  required: (value: unknown): string | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return ERROR_MESSAGES.REQUIRED;
    }
    return null;
  },

  email: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.EMAIL.test(value)) {
      return ERROR_MESSAGES.EMAIL;
    }
    return null;
  },

  phone: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.PHONE.test(value.replace(/\s/g, ''))) {
      return ERROR_MESSAGES.PHONE;
    }
    return null;
  },

  name: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.NAME.test(value)) {
      return ERROR_MESSAGES.NAME;
    }
    return null;
  },

  url: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.URL.test(value)) {
      return ERROR_MESSAGES.URL;
    }
    return null;
  },

  minLength: (min: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length < min) {
      return ERROR_MESSAGES.MIN_LENGTH(min);
    }
    return null;
  },

  maxLength: (max: number) => (value: string): string | null => {
    if (!value) return null;
    if (value.length > max) {
      return ERROR_MESSAGES.MAX_LENGTH(max);
    }
    return null;
  },

  alphanumeric: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.ALPHANUMERIC.test(value)) {
      return ERROR_MESSAGES.INVALID_CHARACTERS;
    }
    return null;
  },

  safeText: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.SAFE_TEXT.test(value)) {
      return ERROR_MESSAGES.INVALID_CHARACTERS;
    }
    return null;
  },

  date: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.DATE.test(value)) {
      return ERROR_MESSAGES.DATE;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return ERROR_MESSAGES.DATE;
    }
    return null;
  },

  time: (value: string): string | null => {
    if (!value) return null;
    if (!PATTERNS.TIME.test(value)) {
      return ERROR_MESSAGES.TIME;
    }
    return null;
  },

  fileSize: (maxSizeMB: number) => (file: File): string | null => {
    if (!file) return null;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return ERROR_MESSAGES.FILE_SIZE(maxSizeMB);
    }
    return null;
  },

  fileType: (allowedTypes: string[]) => (file: File): string | null => {
    if (!file) return null;
    if (!allowedTypes.includes(file.type)) {
      return ERROR_MESSAGES.FILE_TYPE;
    }
    return null;
  },

  // Security validators
  noXSS: (value: string): string | null => {
    if (!value) return null;
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        return ERROR_MESSAGES.XSS;
      }
    }
    return null;
  },

  noSQLInjection: (value: string): string | null => {
    if (!value) return null;
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
      /(\b(or|and)\b\s+\d+\s*[=<>])/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter)\b\s+.*\bfrom\b)/gi,
      /(--|\/\*|\*\/)/g,
      /(\b(exec|execute)\b)/gi
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        return ERROR_MESSAGES.SQL_INJECTION;
      }
    }
    return null;
  }
};

// Sanitization functions
export const sanitizers = {
  trim: (value: string): string => value.trim(),
  
  toLowerCase: (value: string): string => value.toLowerCase(),
  
  removeSpecialChars: (value: string): string => value.replace(/[^a-zA-Z0-9\s]/g, ''),
  
  escapeHtml: (value: string): string => {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  },
  
  stripTags: (value: string): string => value.replace(/<[^>]*>/g, ''),
  
  normalizeWhitespace: (value: string): string => value.replace(/\s+/g, ' '),
  
  limitLength: (maxLength: number) => (value: string): string => 
    value.length > maxLength ? value.substring(0, maxLength) : value
};

// Validation schema interface
interface ValidationSchema {
  [key: string]: Array<(value: unknown) => string | null>;
}

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Main validation function
export function validate(data: Record<string, unknown>, schema: ValidationSchema): ValidationResult {
  const errors: { [key: string]: string } = {};
  
  for (const [field, validators] of Object.entries(schema)) {
    const value = data[field];
    
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Predefined validation schemas
export const schemas = {
  contactForm: {
    name: [validators.required, validators.name, validators.safeText],
    email: [validators.required, validators.email],
    subject: [validators.required, validators.maxLength(100), validators.safeText, validators.noXSS],
    message: [validators.required, validators.maxLength(1000), validators.safeText, validators.noXSS]
  },
  
  activityForm: {
    title: [validators.required, validators.maxLength(100), validators.safeText, validators.noXSS],
    description: [validators.required, validators.maxLength(500), validators.safeText, validators.noXSS],
    display_on: [validators.required]
  },
  
  eventForm: {
    title: [validators.required, validators.maxLength(100), validators.safeText, validators.noXSS],
    description: [validators.required, validators.maxLength(500), validators.safeText, validators.noXSS],
    date: [validators.required, validators.date],
    time: [validators.time],
    venue: [validators.maxLength(100), validators.safeText],
    display_on: [validators.required]
  },
  
  imageUpload: {
    file: [
      validators.required,
      validators.fileSize(10), // 10MB max
      validators.fileType(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
    ],
    title: [validators.maxLength(100), validators.safeText, validators.noXSS],
    alt_text: [validators.maxLength(200), validators.safeText, validators.noXSS]
  }
};

// Utility function to sanitize data
export function sanitizeData(data: Record<string, unknown>, sanitizers: { [key: string]: Array<(value: unknown) => unknown> }): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [field, fieldSanitizers] of Object.entries(sanitizers)) {
    let value = data[field];
    
    for (const sanitizer of fieldSanitizers) {
      value = sanitizer(value);
    }
    
    sanitized[field] = value;
  }
  
  return sanitized;
}

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(private maxAttempts: number = 5, private windowMs: number = 60000) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
} 