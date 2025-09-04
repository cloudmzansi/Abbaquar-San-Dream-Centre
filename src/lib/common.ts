import { errorHandler } from './errorHandler';

// Common constants
export const CONSTANTS = {
  // Cache durations (in milliseconds)
  CACHE_DURATIONS: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword'],
  },
  
  // API endpoints
  ENDPOINTS: {
    PAYFAST_ITN: '/api/payfast-itn',
    HEALTH_CHECK: '/api/health',
  },
  
  // Storage bucket names
  STORAGE_BUCKETS: {
    EVENTS: 'events',
    GALLERY: 'gallery',
    ACTIVITIES: 'activities',
    TEAM: 'team',
    VOLUNTEERS: 'volunteers',
  },
} as const;

// Common validation functions
export const validators = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format (basic)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate file type
   */
  isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  },

  /**
   * Validate file size
   */
  isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  },

  /**
   * Validate required fields
   */
  hasRequiredFields(obj: Record<string, unknown>, requiredFields: string[]): boolean {
    return requiredFields.every(field => {
      const value = obj[field];
      return value !== null && value !== undefined && value !== '';
    });
  },
} as const;

// Common utility functions
export const utils = {
  /**
   * Debounce function to limit function calls
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function to limit function calls
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Deep clone object (simple implementation)
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array) return obj.map(item => utils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as T;
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = utils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  },

  /**
   * Generate a random string
   */
  generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Format date to readable string
   */
  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return dateObj.toLocaleDateString(undefined, { ...defaultOptions, ...options });
  },

  /**
   * Format file size to human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Safe JSON parse with error handling
   */
  safeJsonParse<T>(jsonString: string, fallback: T): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      errorHandler.handleError(error, { 
        operation: 'JSON parsing', 
        component: 'utils.safeJsonParse' 
      });
      return fallback;
    }
  },

  /**
   * Safe JSON stringify with error handling
   */
  safeJsonStringify(obj: unknown, fallback: string = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      errorHandler.handleError(error, { 
        operation: 'JSON stringify', 
        component: 'utils.safeJsonStringify' 
      });
      return fallback;
    }
  },

  /**
   * Wait for a specified amount of time
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Retry function with exponential backoff
   */
  async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await utils.sleep(delay);
      }
    }
    
    throw lastError!;
  },
} as const;

// Common type guards
export const typeGuards = {
  /**
   * Check if value is a valid object
   */
  isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  },

  /**
   * Check if value is a valid array
   */
  isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
  },

  /**
   * Check if value is a valid string
   */
  isString(value: unknown): value is string {
    return typeof value === 'string';
  },

  /**
   * Check if value is a valid number
   */
  isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
  },

  /**
   * Check if value is a valid boolean
   */
  isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
  },

  /**
   * Check if value is a valid function
   */
  isFunction(value: unknown): value is Function {
    return typeof value === 'function';
  },
} as const;

// Export everything as a single object for convenience
export default {
  CONSTANTS,
  validators,
  utils,
  typeGuards,
};
