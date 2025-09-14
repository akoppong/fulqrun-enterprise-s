/**
 * Simple debounce utility to reduce excessive function calls
 * This helps prevent rate limiting issues with KV operations
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = function() {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Rate limiting Map to track operations per key
const operationTracker = new Map<string, number[]>();

export function isRateLimited(key: string, maxOperationsPerMinute: number = 10): boolean {
  const now = Date.now();
  const minute = 60 * 1000;
  
  if (!operationTracker.has(key)) {
    operationTracker.set(key, []);
  }
  
  const operations = operationTracker.get(key)!;
  
  // Remove operations older than 1 minute
  const recentOperations = operations.filter(time => now - time < minute);
  
  // Check if we've exceeded the limit
  if (recentOperations.length >= maxOperationsPerMinute) {
    return true;
  }
  
  // Add current operation
  recentOperations.push(now);
  operationTracker.set(key, recentOperations);
  
  return false;
}

// Cleanup old entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    
    for (const [key, operations] of operationTracker.entries()) {
      const recentOperations = operations.filter(time => now - time < hour);
      if (recentOperations.length === 0) {
        operationTracker.delete(key);
      } else {
        operationTracker.set(key, recentOperations);
      }
    }
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}