/**
 * Enhanced useKV hook with rate limiting and better error handling
 * 
 * This hook wraps the standard useKV hook to provide:
 * - Rate limiting to prevent 429 errors
 * - Better error handling and fallback values
 * - Automatic retry mechanisms
 * - Debounced updates to reduce KV operations
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { kvStorage, KVOptions } from '@/lib/kv-storage-manager';

interface UseKVWithRateLimitOptions extends KVOptions {
  debounceMs?: number;
  enableFallback?: boolean;
  syncInterval?: number;
}

const DEFAULT_OPTIONS: Required<UseKVWithRateLimitOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  validateData: true,
  debounceMs: 1000,
  enableFallback: true,
  syncInterval: 30000, // Sync every 30 seconds
  errorHandler: {
    onError: (key, error, operation) => {
      console.warn(`Rate-limited KV ${operation} for "${key}":`, error.message);
    },
    onRetry: () => {}, // Silent retries
    onFallback: (key) => {
      console.info(`Using fallback for key "${key}"`);
    }
  }
};

export function useKVWithRateLimit<T>(
  key: string, 
  initialValue: T,
  options: UseKVWithRateLimitOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Use standard useKV as backup
  const [kvValue, setKVValue, deleteKVValue] = useKV<T>(key, initialValue);
  
  // Local state for immediate updates
  const [localValue, setLocalValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Track pending updates
  const pendingUpdateRef = useRef<T | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  
  // Initialize with KV value when available
  useEffect(() => {
    if (kvValue !== undefined && !isInitialized) {
      setLocalValue(kvValue);
      setIsInitialized(true);
    }
  }, [kvValue, isInitialized]);

  // Debounced sync function
  const syncToKV = useCallback(async (value: T) => {
    const now = Date.now();
    
    // Check if we're within rate limit window
    if (now - lastUpdateRef.current < opts.debounceMs) {
      return;
    }
    
    try {
      // Try using our rate-limited storage manager first
      const success = await kvStorage.safeSet(key, value, opts);
      
      if (success) {
        lastSyncRef.current = now;
        lastUpdateRef.current = now;
        pendingUpdateRef.current = null;
      } else if (opts.enableFallback) {
        // Fallback to standard useKV
        setKVValue(value);
        lastUpdateRef.current = now;
      }
    } catch (error) {
      console.warn(`Failed to sync "${key}" to KV:`, error);
      
      if (opts.enableFallback) {
        try {
          setKVValue(value);
          lastUpdateRef.current = now;
        } catch (fallbackError) {
          console.error(`Fallback KV update failed for "${key}":`, fallbackError);
        }
      }
    }
  }, [key, opts, setKVValue]);

  // Enhanced setter with rate limiting
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' 
      ? (value as (prev: T) => T)(localValue)
      : value;
    
    // Update local state immediately for responsive UI
    setLocalValue(newValue);
    pendingUpdateRef.current = newValue;
    
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      if (pendingUpdateRef.current !== null) {
        syncToKV(pendingUpdateRef.current);
      }
    }, opts.debounceMs);
  }, [localValue, syncToKV, opts.debounceMs]);

  // Enhanced delete function
  const deleteValue = useCallback(() => {
    setLocalValue(initialValue);
    pendingUpdateRef.current = null;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Try rate-limited delete first
    kvStorage.safeDelete(key, opts).catch(() => {
      // Fallback to standard delete
      if (opts.enableFallback) {
        deleteKVValue();
      }
    });
  }, [key, initialValue, opts, deleteKVValue]);

  // Periodic sync for pending changes
  useEffect(() => {
    if (!opts.syncInterval) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      
      // Sync if there are pending changes and enough time has passed
      if (pendingUpdateRef.current !== null && 
          now - lastSyncRef.current > opts.syncInterval) {
        syncToKV(pendingUpdateRef.current);
      }
    }, opts.syncInterval);

    return () => clearInterval(intervalId);
  }, [opts.syncInterval, syncToKV]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Sync any pending changes on unmount
      if (pendingUpdateRef.current !== null) {
        syncToKV(pendingUpdateRef.current);
      }
    };
  }, [syncToKV]);

  return [localValue, setValue, deleteValue];
}

// Convenience hook for frequently updated data
export function useKVRealtime<T>(
  key: string, 
  initialValue: T,
  updateIntervalMs: number = 5000
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useKVWithRateLimit(key, initialValue, {
    debounceMs: Math.max(updateIntervalMs / 2, 1000), // Debounce for half the update interval
    syncInterval: updateIntervalMs * 2, // Sync less frequently than updates
    enableFallback: true,
    maxRetries: 2, // Fewer retries for realtime data
    retryDelay: 500
  });
}

// Hook for non-critical data that can tolerate delays
export function useKVCached<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  return useKVWithRateLimit(key, initialValue, {
    debounceMs: 5000, // Long debounce for non-critical data
    syncInterval: 60000, // Sync every minute
    enableFallback: true,
    maxRetries: 5,
    retryDelay: 2000
  });
}