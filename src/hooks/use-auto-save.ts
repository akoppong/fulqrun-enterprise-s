import { useEffect, useRef, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface AutoSaveOptions {
  /** Unique key for storing the draft */
  key: string;
  /** Form data to save */
  data: any;
  /** Auto-save delay in milliseconds (default: 2000ms) */
  delay?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Callback when draft is saved */
  onSave?: (data: any) => void;
  /** Callback when draft is loaded */
  onLoad?: (data: any) => void;
  /** Fields to exclude from auto-save */
  excludeFields?: string[];
}

/**
 * Custom hook for auto-saving form drafts
 * Automatically saves form data to persistent storage and provides recovery functionality
 */
export function useAutoSave<T = any>({
  key,
  data,
  delay = 2000,
  enabled = true,
  onSave,
  onLoad,
  excludeFields = []
}: AutoSaveOptions) {
  const [savedDraft, setSavedDraft, deleteDraft] = useKV<T | null>(`draft_${key}`, null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const initialLoadRef = useRef(false);

  // Filter out excluded fields
  const filterData = useCallback((obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const filtered = { ...obj };
    excludeFields.forEach(field => {
      delete filtered[field];
    });
    
    return filtered;
  }, [excludeFields]);

  // Load saved draft on initialization
  useEffect(() => {
    if (!initialLoadRef.current && savedDraft && onLoad) {
      onLoad(savedDraft);
      initialLoadRef.current = true;
    }
  }, [savedDraft, onLoad]);

  // Auto-save functionality
  useEffect(() => {
    if (!enabled || !data) return;

    const filteredData = filterData(data);
    const dataString = JSON.stringify(filteredData);
    
    // Only save if data has actually changed
    if (dataString === lastSavedRef.current) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      setSavedDraft(filteredData);
      lastSavedRef.current = dataString;
      onSave?.(filteredData);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, onSave, setSavedDraft, filterData]);

  // Save immediately (for manual saves)
  const saveNow = useCallback(() => {
    if (!data) return;
    
    const filteredData = filterData(data);
    setSavedDraft(filteredData);
    lastSavedRef.current = JSON.stringify(filteredData);
    onSave?.(filteredData);
    toast.success('Draft saved', { duration: 1500 });
  }, [data, setSavedDraft, onSave, filterData]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    deleteDraft();
    lastSavedRef.current = '';
    toast.success('Draft cleared', { duration: 1500 });
  }, [deleteDraft]);

  // Check if there's a saved draft
  const hasDraft = Boolean(savedDraft);

  // Get the last saved time (approximate)
  const lastSaved = useRef<Date | null>(null);
  
  useEffect(() => {
    if (savedDraft) {
      lastSaved.current = new Date();
    }
  }, [savedDraft]);

  return {
    /** The currently saved draft */
    savedDraft,
    /** Whether there's a saved draft available */
    hasDraft,
    /** Save the current data immediately */
    saveNow,
    /** Clear the saved draft */
    clearDraft,
    /** Approximate time when draft was last saved */
    lastSaved: lastSaved.current
  };
}

/**
 * Hook for managing form auto-save with enhanced UX
 * Provides visual feedback and recovery options
 */
export function useFormAutoSave<T = any>(options: AutoSaveOptions & {
  /** Show toast notifications for auto-save actions */
  showNotifications?: boolean;
}) {
  const { showNotifications = false, ...autoSaveOptions } = options;
  
  const autoSave = useAutoSave({
    ...autoSaveOptions,
    onSave: (data) => {
      if (showNotifications) {
        toast.success('Draft saved automatically', { 
          duration: 1500,
          description: `Last saved at ${new Date().toLocaleTimeString()}`
        });
      }
      autoSaveOptions.onSave?.(data);
    }
  });

  // Restore draft with user confirmation
  const restoreDraft = useCallback(() => {
    if (!autoSave.hasDraft) return;

    const shouldRestore = window.confirm(
      'A saved draft was found. Would you like to restore it and continue where you left off?'
    );

    if (shouldRestore && autoSave.savedDraft) {
      autoSaveOptions.onLoad?.(autoSave.savedDraft);
      toast.success('Draft restored successfully');
      return true;
    }
    return false;
  }, [autoSave.hasDraft, autoSave.savedDraft, autoSaveOptions]);

  return {
    ...autoSave,
    /** Restore draft with user confirmation */
    restoreDraft
  };
}