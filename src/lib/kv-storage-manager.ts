/**
 * KV Storage Error Handler and Recovery
 * 
 * Provides robust error handling for KV storage operations to prevent
 * application crashes and provide fallback mechanisms.
 */

import { validateKVData } from './data-consistency';

export interface KVErrorHandler {
  onError?: (key: string, error: Error, operation: 'get' | 'set' | 'delete') => void;
  onRetry?: (key: string, attempt: number, maxAttempts: number) => void;
  onFallback?: (key: string, fallbackValue: any) => void;
}

export interface KVOptions {
  maxRetries?: number;
  retryDelay?: number;
  validateData?: boolean;
  errorHandler?: KVErrorHandler;
}

const DEFAULT_OPTIONS: Required<KVOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  validateData: true,
  errorHandler: {
    onError: (key, error, operation) => {
      console.warn(`KV ${operation} operation failed for key "${key}":`, error.message);
    },
    onRetry: (key, attempt, maxAttempts) => {
      console.info(`Retrying KV operation for key "${key}" (${attempt}/${maxAttempts})`);
    },
    onFallback: (key, fallbackValue) => {
      console.info(`Using fallback value for key "${key}"`);
    }
  }
};

class KVStorageManager {
  private static instance: KVStorageManager;
  private rateLimitMap = new Map<string, number>();
  private errorCountMap = new Map<string, number>();
  private readonly RATE_LIMIT_THRESHOLD = 10; // Max 10 operations per minute per key
  private readonly ERROR_THRESHOLD = 5; // Max 5 consecutive errors before fallback

  static getInstance(): KVStorageManager {
    if (!KVStorageManager.instance) {
      KVStorageManager.instance = new KVStorageManager();
    }
    return KVStorageManager.instance;
  }

  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const lastOperation = this.rateLimitMap.get(key) || 0;
    
    if (now - lastOperation < (60000 / this.RATE_LIMIT_THRESHOLD)) {
      return true;
    }
    
    this.rateLimitMap.set(key, now);
    return false;
  }

  private incrementErrorCount(key: string): boolean {
    const currentCount = this.errorCountMap.get(key) || 0;
    const newCount = currentCount + 1;
    this.errorCountMap.set(key, newCount);
    
    return newCount >= this.ERROR_THRESHOLD;
  }

  private resetErrorCount(key: string): void {
    this.errorCountMap.delete(key);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private sanitizeKey(key: string): string {
    // Remove or replace invalid characters for KV storage
    return key
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace invalid chars with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .toLowerCase(); // Normalize to lowercase
  }

  async safeGet<T>(key: string, fallbackValue: T, options: KVOptions = {}): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const sanitizedKey = this.sanitizeKey(key);
    
    // Check if key is rate limited
    if (this.isRateLimited(sanitizedKey)) {
      opts.errorHandler.onFallback?.(sanitizedKey, fallbackValue);
      return fallbackValue;
    }

    // Check if key has too many consecutive errors
    if (this.errorCountMap.get(sanitizedKey) >= this.ERROR_THRESHOLD) {
      opts.errorHandler.onFallback?.(sanitizedKey, fallbackValue);
      return fallbackValue;
    }

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      try {
        // Use the spark KV API if available, otherwise fallback to localStorage
        if (typeof window !== 'undefined' && window.spark?.kv) {
          const result = await window.spark.kv.get<T>(sanitizedKey);
          
          if (result !== undefined && result !== null) {
            // Validate data if requested
            if (opts.validateData) {
              const validation = validateKVData(sanitizedKey, result);
              if (!validation.isValid) {
                console.warn(`Invalid data for key "${sanitizedKey}":`, validation.errors);
                if (validation.errors.some(error => error.includes('circular reference'))) {
                  throw new Error('Data contains circular references');
                }
              }
            }
            
            this.resetErrorCount(sanitizedKey);
            return result;
          }
          
          return fallbackValue;
        } else {
          // Fallback to localStorage
          const stored = localStorage.getItem(sanitizedKey);
          if (stored) {
            const parsed = JSON.parse(stored);
            this.resetErrorCount(sanitizedKey);
            return parsed;
          }
          return fallbackValue;
        }
      } catch (error) {
        const isLastAttempt = attempt === opts.maxRetries;
        opts.errorHandler.onError?.(sanitizedKey, error as Error, 'get');
        
        if (!isLastAttempt) {
          opts.errorHandler.onRetry?.(sanitizedKey, attempt, opts.maxRetries);
          await this.delay(opts.retryDelay * attempt); // Exponential backoff
        } else {
          this.incrementErrorCount(sanitizedKey);
          opts.errorHandler.onFallback?.(sanitizedKey, fallbackValue);
          return fallbackValue;
        }
      }
    }

    return fallbackValue;
  }

  async safeSet<T>(key: string, value: T, options: KVOptions = {}): Promise<boolean> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const sanitizedKey = this.sanitizeKey(key);
    
    // Check if key is rate limited
    if (this.isRateLimited(sanitizedKey)) {
      opts.errorHandler.onError?.(sanitizedKey, new Error('Rate limited'), 'set');
      return false;
    }

    // Check if key has too many consecutive errors
    if (this.errorCountMap.get(sanitizedKey) >= this.ERROR_THRESHOLD) {
      opts.errorHandler.onError?.(sanitizedKey, new Error('Too many consecutive errors'), 'set');
      return false;
    }

    // Validate data before storing
    if (opts.validateData) {
      const validation = validateKVData(sanitizedKey, value);
      if (!validation.isValid) {
        const error = new Error(`Invalid data: ${validation.errors.join(', ')}`);
        opts.errorHandler.onError?.(sanitizedKey, error, 'set');
        return false;
      }
    }

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      try {
        // Use the spark KV API if available, otherwise fallback to localStorage
        if (typeof window !== 'undefined' && window.spark?.kv) {
          await window.spark.kv.set(sanitizedKey, value);
          this.resetErrorCount(sanitizedKey);
          return true;
        } else {
          // Fallback to localStorage
          localStorage.setItem(sanitizedKey, JSON.stringify(value));
          this.resetErrorCount(sanitizedKey);
          return true;
        }
      } catch (error) {
        const isLastAttempt = attempt === opts.maxRetries;
        opts.errorHandler.onError?.(sanitizedKey, error as Error, 'set');
        
        if (!isLastAttempt) {
          opts.errorHandler.onRetry?.(sanitizedKey, attempt, opts.maxRetries);
          await this.delay(opts.retryDelay * attempt); // Exponential backoff
        } else {
          this.incrementErrorCount(sanitizedKey);
          return false;
        }
      }
    }

    return false;
  }

  async safeDelete(key: string, options: KVOptions = {}): Promise<boolean> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const sanitizedKey = this.sanitizeKey(key);
    
    // Check if key is rate limited
    if (this.isRateLimited(sanitizedKey)) {
      opts.errorHandler.onError?.(sanitizedKey, new Error('Rate limited'), 'delete');
      return false;
    }

    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
      try {
        // Use the spark KV API if available, otherwise fallback to localStorage
        if (typeof window !== 'undefined' && window.spark?.kv) {
          await window.spark.kv.delete(sanitizedKey);
          this.resetErrorCount(sanitizedKey);
          return true;
        } else {
          // Fallback to localStorage
          localStorage.removeItem(sanitizedKey);
          this.resetErrorCount(sanitizedKey);
          return true;
        }
      } catch (error) {
        const isLastAttempt = attempt === opts.maxRetries;
        opts.errorHandler.onError?.(sanitizedKey, error as Error, 'delete');
        
        if (!isLastAttempt) {
          opts.errorHandler.onRetry?.(sanitizedKey, attempt, opts.maxRetries);
          await this.delay(opts.retryDelay * attempt); // Exponential backoff
        } else {
          this.incrementErrorCount(sanitizedKey);
          return false;
        }
      }
    }

    return false;
  }

  // Clean up rate limit and error tracking periodically
  cleanup(): void {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 300000; // 5 minutes
    
    // Clean up old rate limit entries
    for (const [key, timestamp] of this.rateLimitMap.entries()) {
      if (now - timestamp > CLEANUP_THRESHOLD) {
        this.rateLimitMap.delete(key);
      }
    }
    
    // Reset error counts for keys that haven't been accessed recently
    for (const [key] of this.errorCountMap.entries()) {
      const lastOperation = this.rateLimitMap.get(key);
      if (!lastOperation || now - lastOperation > CLEANUP_THRESHOLD) {
        this.errorCountMap.delete(key);
      }
    }
  }

  getStats(): { rateLimitedKeys: number; errorKeys: number } {
    return {
      rateLimitedKeys: this.rateLimitMap.size,
      errorKeys: this.errorCountMap.size
    };
  }
}

// Export singleton instance
export const kvStorage = KVStorageManager.getInstance();

// Start periodic cleanup
if (typeof window !== 'undefined') {
  setInterval(() => {
    kvStorage.cleanup();
  }, 300000); // Cleanup every 5 minutes
}

// Export convenience functions
export const safeKVGet = <T>(key: string, fallbackValue: T, options?: KVOptions): Promise<T> => {
  return kvStorage.safeGet(key, fallbackValue, options);
};

export const safeKVSet = <T>(key: string, value: T, options?: KVOptions): Promise<boolean> => {
  return kvStorage.safeSet(key, value, options);
};

export const safeKVDelete = (key: string, options?: KVOptions): Promise<boolean> => {
  return kvStorage.safeDelete(key, options);
};