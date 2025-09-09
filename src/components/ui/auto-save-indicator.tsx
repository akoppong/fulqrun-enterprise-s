import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FloppyDisk, CheckCircle, Warning, Clock } from '@phosphor-icons/react';

interface AutoSaveIndicatorProps {
  /** Whether auto-save is enabled */
  enabled?: boolean;
  /** Last saved time */
  lastSaved?: Date | null;
  /** Whether there are unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Whether currently saving */
  isSaving?: boolean;
  /** Callback to save immediately */
  onSaveNow?: () => void;
  /** Callback to clear draft */
  onClearDraft?: () => void;
  /** Whether there's a saved draft */
  hasDraft?: boolean;
  /** Custom className */
  className?: string;
}

export function AutoSaveIndicator({
  enabled = true,
  lastSaved,
  hasUnsavedChanges = false,
  isSaving = false,
  onSaveNow,
  onClearDraft,
  hasDraft = false,
  className
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved || !(lastSaved instanceof Date) || isNaN(lastSaved.getTime())) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        setTimeAgo('just now');
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else if (hours < 24) {
        setTimeAgo(`${hours}h ago`);
      } else {
        setTimeAgo(lastSaved.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (!enabled) return null;

  const getStatus = () => {
    if (isSaving) {
      return {
        icon: <Clock className="animate-spin" size={14} />,
        text: 'Saving...',
        variant: 'secondary' as const,
        className: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: <Warning size={14} />,
        text: 'Unsaved changes',
        variant: 'outline' as const,
        className: 'text-orange-600 bg-orange-50 border-orange-200'
      };
    }

    if (lastSaved && lastSaved instanceof Date && !isNaN(lastSaved.getTime())) {
      return {
        icon: <CheckCircle size={14} />,
        text: `Saved ${timeAgo}`,
        variant: 'secondary' as const,
        className: 'text-green-600 bg-green-50 border-green-200'
      };
    }

    return {
      icon: <FloppyDisk size={14} />,
      text: 'Ready to save',
      variant: 'outline' as const,
      className: 'text-gray-600 bg-gray-50 border-gray-200'
    };
  };

  const status = getStatus();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        variant={status.variant}
        className={cn('flex items-center gap-1.5 px-2 py-1', status.className)}
      >
        {status.icon}
        <span className="text-xs font-medium">{status.text}</span>
      </Badge>

      {(hasUnsavedChanges || hasDraft) && (
        <div className="flex items-center gap-1">
          {hasUnsavedChanges && onSaveNow && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSaveNow}
              className="h-6 px-2 text-xs"
            >
              <FloppyDisk size={12} className="mr-1" />
              Save now
            </Button>
          )}
          
          {hasDraft && onClearDraft && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearDraft}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Clear draft
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of AutoSaveIndicator for use in smaller spaces
 */
export function AutoSaveStatus({
  enabled = true,
  lastSaved,
  isSaving = false,
  className
}: Pick<AutoSaveIndicatorProps, 'enabled' | 'lastSaved' | 'isSaving' | 'className'>) {
  if (!enabled) return null;

  if (isSaving) {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-blue-600', className)}>
        <Clock className="animate-spin" size={12} />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved && lastSaved instanceof Date && !isNaN(lastSaved.getTime())) {
    return (
      <div className={cn('flex items-center gap-1 text-xs text-green-600', className)}>
        <CheckCircle size={12} />
        <span>Saved</span>
      </div>
    );
  }

  return null;
}