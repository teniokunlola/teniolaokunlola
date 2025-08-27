/**
 * Security utilities for input validation and sanitization
 * Provides protection against XSS, injection attacks, and malicious input
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s\-_]+$/,
  ALPHABETIC: /^[a-zA-Z\s\-']+$/,
  NUMERIC: /^[0-9]+$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// Input length limits
export const INPUT_LIMITS = {
  NAME: { min: 1, max: 100 },
  EMAIL: { min: 5, max: 254 },
  PHONE: { min: 7, max: 20 },
  MESSAGE: { min: 1, max: 2000 },
  DESCRIPTION: { min: 1, max: 1000 },
  TITLE: { min: 1, max: 200 },
  URL: { min: 5, max: 500 },
  PASSWORD: { min: 8, max: 128 },
  INVITE_CODE: { min: 8, max: 8 },
  COMPANY: { min: 1, max: 100 },
  POSITION: { min: 1, max: 100 },
  INSTITUTION: { min: 1, max: 100 },
  DEGREE: { min: 1, max: 100 },
  JOB_TITLE: { min: 1, max: 100 },
  PLATFORM: { min: 1, max: 50 },
  TAGS: { min: 0, max: 10 }, // Array length
} as const;

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize email address
 */
export function validateAndSanitizeEmail(email: string): { isValid: boolean; value: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, value: '', error: 'Email is required' };
  }

  const sanitized = sanitizeText(email.trim().toLowerCase());
  
  if (sanitized.length < INPUT_LIMITS.EMAIL.min) {
    return { isValid: false, value: sanitized, error: `Email must be at least ${INPUT_LIMITS.EMAIL.min} characters` };
  }
  
  if (sanitized.length > INPUT_LIMITS.EMAIL.max) {
    return { isValid: false, value: sanitized, error: `Email must be no more than ${INPUT_LIMITS.EMAIL.max} characters` };
  }
  
  if (!VALIDATION_PATTERNS.EMAIL.test(sanitized)) {
    return { isValid: false, value: sanitized, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize name input
 */
export function validateAndSanitizeName(name: string): { isValid: boolean; value: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, value: '', error: 'Name is required' };
  }

  const sanitized = sanitizeText(name.trim());
  
  if (sanitized.length < INPUT_LIMITS.NAME.min) {
    return { isValid: false, value: sanitized, error: `Name must be at least ${INPUT_LIMITS.NAME.min} character` };
  }
  
  if (sanitized.length > INPUT_LIMITS.NAME.max) {
    return { isValid: false, value: sanitized, error: `Name must be no more than ${INPUT_LIMITS.NAME.max} characters` };
  }
  
  if (!VALIDATION_PATTERNS.ALPHABETIC.test(sanitized)) {
    return { isValid: false, value: sanitized, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize phone number
 */
export function validateAndSanitizePhone(phone: string): { isValid: boolean; value: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, value: '', error: 'Phone number is required' };
  }

  const sanitized = sanitizeText(phone.replace(/\s+/g, ''));
  
  if (sanitized.length < INPUT_LIMITS.PHONE.min) {
    return { isValid: false, value: sanitized, error: `Phone number must be at least ${INPUT_LIMITS.PHONE.min} digits` };
  }
  
  if (sanitized.length > INPUT_LIMITS.PHONE.max) {
    return { isValid: false, value: sanitized, error: `Phone number must be no more than ${INPUT_LIMITS.PHONE.max} digits` };
  }
  
  if (!VALIDATION_PATTERNS.PHONE.test(sanitized)) {
    return { isValid: false, value: sanitized, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize message content
 */
export function validateAndSanitizeMessage(message: string): { isValid: boolean; value: string; error?: string } {
  if (!message || typeof message !== 'string') {
    return { isValid: false, value: '', error: 'Message is required' };
  }

  const sanitized = sanitizeText(message.trim());
  
  if (sanitized.length < INPUT_LIMITS.MESSAGE.min) {
    return { isValid: false, value: sanitized, error: `Message must be at least ${INPUT_LIMITS.MESSAGE.min} character` };
  }
  
  if (sanitized.length > INPUT_LIMITS.MESSAGE.max) {
    return { isValid: false, value: sanitized, error: `Message must be no more than ${INPUT_LIMITS.MESSAGE.max} characters` };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize URL
 */
export function validateAndSanitizeUrl(url: string): { isValid: boolean; value: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, value: '', error: 'URL is required' };
  }

  const sanitized = sanitizeText(url.trim());
  
  if (sanitized.length < INPUT_LIMITS.URL.min) {
    return { isValid: false, value: sanitized, error: `URL must be at least ${INPUT_LIMITS.URL.min} characters` };
  }
  
  if (sanitized.length > INPUT_LIMITS.URL.max) {
    return { isValid: false, value: sanitized, error: `URL must be no more than ${INPUT_LIMITS.URL.max} characters` };
  }
  
  if (!VALIDATION_PATTERNS.URL.test(sanitized)) {
    return { isValid: false, value: sanitized, error: 'Please enter a valid URL' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize password
 */
export function validateAndSanitizePassword(password: string): { isValid: boolean; value: string; error?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, value: '', error: 'Password is required' };
  }

  const sanitized = password.trim();
  
  if (sanitized.length < INPUT_LIMITS.PASSWORD.min) {
    return { isValid: false, value: sanitized, error: `Password must be at least ${INPUT_LIMITS.PASSWORD.min} characters` };
  }
  
  if (sanitized.length > INPUT_LIMITS.PASSWORD.max) {
    return { isValid: false, value: sanitized, error: `Password must be no more than ${INPUT_LIMITS.PASSWORD.max} characters` };
  }
  
  // Check for common weak password patterns
  if (sanitized.toLowerCase().includes('password') || 
      sanitized.toLowerCase().includes('123') ||
      sanitized.toLowerCase().includes('qwerty')) {
    return { isValid: false, value: sanitized, error: 'Password is too weak. Please choose a stronger password' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize invite code
 */
export function validateAndSanitizeInviteCode(code: string): { isValid: boolean; value: string; error?: string } {
  if (!code || typeof code !== 'string') {
    return { isValid: false, value: '', error: 'Invite code is required' };
  }

  const sanitized = sanitizeText(code.trim().toUpperCase());
  
  if (sanitized.length !== INPUT_LIMITS.INVITE_CODE.max) {
    return { isValid: false, value: sanitized, error: `Invite code must be exactly ${INPUT_LIMITS.INVITE_CODE.max} characters` };
  }
  
  if (!VALIDATION_PATTERNS.ALPHANUMERIC.test(sanitized)) {
    return { isValid: false, value: sanitized, error: 'Invite code can only contain letters and numbers' };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Validate and sanitize numeric input
 */
export function validateAndSanitizeNumber(value: string, min?: number, max?: number): { isValid: boolean; value: number; error?: string } {
  if (!value || typeof value !== 'string') {
    return { isValid: false, value: 0, error: 'Number is required' };
  }

  const sanitized = sanitizeText(value.trim());
  const numValue = parseFloat(sanitized);
  
  if (isNaN(numValue)) {
    return { isValid: false, value: 0, error: 'Please enter a valid number' };
  }
  
  if (min !== undefined && numValue < min) {
    return { isValid: false, value: numValue, error: `Number must be at least ${min}` };
  }
  
  if (max !== undefined && numValue > max) {
    return { isValid: false, value: numValue, error: `Number must be no more than ${max}` };
  }
  
  return { isValid: true, value: numValue };
}

/**
 * Validate and sanitize tags array
 */
export function validateAndSanitizeTags(tags: string[]): { isValid: boolean; value: string[]; error?: string } {
  if (!Array.isArray(tags)) {
    return { isValid: false, value: [], error: 'Tags must be an array' };
  }

  if (tags.length > INPUT_LIMITS.TAGS.max) {
    return { isValid: false, value: tags, error: `Maximum ${INPUT_LIMITS.TAGS.max} tags allowed` };
  }

  const sanitized = tags
    .filter(tag => tag && typeof tag === 'string')
    .map(tag => sanitizeText(tag.trim()))
    .filter(tag => tag.length > 0 && tag.length <= 50);

  return { isValid: true, value: sanitized };
}

/**
 * Generic input validator that can be used for any field
 */
export function validateInput(
  value: string, 
  fieldName: string, 
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternName?: string;
    sanitize?: boolean;
  } = {}
): { isValid: boolean; value: string; error?: string } {
  const { required = true, minLength, maxLength, pattern, patternName, sanitize = true } = options;
  
  // Handle required validation
  if (required && (!value || typeof value !== 'string')) {
    return { isValid: false, value: '', error: `${fieldName} is required` };
  }
  
  // Handle empty string for required fields
  if (required && value.trim() === '') {
    return { isValid: false, value: '', error: `${fieldName} is required` };
  }
  
  // Sanitize if requested
  const sanitized = sanitize ? sanitizeText(value.trim()) : value.trim();
  
  // Handle length validation
  if (minLength !== undefined && sanitized.length < minLength) {
    return { isValid: false, value: sanitized, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (maxLength !== undefined && sanitized.length > maxLength) {
    return { isValid: false, value: sanitized, error: `${fieldName} must be no more than ${maxLength} characters` };
  }
  
  // Handle pattern validation
  if (pattern && !pattern.test(sanitized)) {
    return { isValid: false, value: sanitized, error: `${fieldName} format is invalid${patternName ? ` (${patternName})` : ''}` };
  }
  
  return { isValid: true, value: sanitized };
}

/**
 * Rate limiting utility for form submissions
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

/**
 * CSRF token generator and validator
 */
export class CSRFProtection {
  private static tokens = new Set<string>();

  static generateToken(): string {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    this.tokens.add(token);
    return token;
  }

  static validateToken(token: string): boolean {
    const isValid = this.tokens.has(token);
    if (isValid) {
      this.tokens.delete(token); // Use once
    }
    return isValid;
  }

  static cleanup(): void {
    this.tokens.clear();
  }
}
