import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft,
  ChevronRight,
  Keyboard
} from '@phosphor-icons/react';

interface AccessibleNavigationItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<any>;
  badge?: string;
  onClick: () => void;
  shortcut?: string;
}

interface AccessibleNavigationProps {
  items: AccessibleNavigationItem[];
  activeItemId?: string;
  title?: string;
  showShortcuts?: boolean;
  onBack?: () => void;
  className?: string;
}

export function AccessibleNavigation({ 
  items, 
  activeItemId, 
  title,
  showShortcuts = true,
  onBack,
  className 
}: AccessibleNavigationProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [shortcutsVisible, setShortcutsVisible] = useState(false);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev < items.length - 1 ? prev + 1 : 0;
          itemRefs.current[newIndex]?.focus();
          return newIndex;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : items.length - 1;
          itemRefs.current[newIndex]?.focus();
          return newIndex;
        });
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          event.preventDefault();
          items[focusedIndex]?.onClick();
        }
        break;
      case 'Escape':
        if (onBack) {
          event.preventDefault();
          onBack();
        }
        break;
      case '?':
        if (showShortcuts) {
          event.preventDefault();
          setShortcutsVisible(!shortcutsVisible);
        }
        break;
      default:
        // Handle number shortcuts (1-9)
        if (showShortcuts && /^[1-9]$/.test(event.key)) {
          const index = parseInt(event.key) - 1;
          if (index < items.length) {
            event.preventDefault();
            items[index]?.onClick();
          }
        }
        // Handle letter shortcuts
        else if (showShortcuts && /^[a-zA-Z]$/.test(event.key.toLowerCase())) {
          const item = items.find(item => 
            item.shortcut?.toLowerCase() === event.key.toLowerCase()
          );
          if (item) {
            event.preventDefault();
            item.onClick();
          }
        }
        break;
    }
  };

  // Set up keyboard listeners
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      // Only handle if this navigation is visible and focused
      if (document.activeElement?.closest('[data-accessible-nav]')) {
        handleKeyDown(event as any);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [focusedIndex, items, showShortcuts, shortcutsVisible, onBack]);

  return (
    <div 
      className={cn("relative", className)}
      data-accessible-nav
      role="navigation"
      aria-label={title || "Navigation menu"}
    >
      {/* Header */}
      {(title || onBack) && (
        <div className="flex items-center justify-between p-4 border-b">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-2"
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </Button>
          )}
          {title && (
            <h2 className="text-lg font-semibold flex-1">{title}</h2>
          )}
          {showShortcuts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShortcutsVisible(!shortcutsVisible)}
              aria-label="Toggle keyboard shortcuts"
              className="ml-2"
            >
              <Keyboard size={16} />
            </Button>
          )}
        </div>
      )}

      {/* Shortcuts Panel */}
      {showShortcuts && shortcutsVisible && (
        <div className="p-4 bg-muted/50 border-b">
          <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Navigate</span>
              <span className="font-mono">↑↓ or Tab</span>
            </div>
            <div className="flex justify-between">
              <span>Select</span>
              <span className="font-mono">Enter or Space</span>
            </div>
            <div className="flex justify-between">
              <span>Quick access</span>
              <span className="font-mono">1-9 or letters</span>
            </div>
            {onBack && (
              <div className="flex justify-between">
                <span>Go back</span>
                <span className="font-mono">Esc</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Toggle help</span>
              <span className="font-mono">?</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="space-y-1 p-2" role="menu">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.id === activeItemId;
          const shortcutDisplay = item.shortcut || (index < 9 ? (index + 1).toString() : undefined);
          
          return (
            <Button
              key={item.id}
              ref={(el) => (itemRefs.current[index] = el)}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start h-auto p-3 text-left group',
                isActive && 'bg-primary text-primary-foreground',
                focusedIndex === index && 'ring-2 ring-ring ring-offset-2'
              )}
              onClick={item.onClick}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(-1)}
              role="menuitem"
              tabIndex={index === 0 ? 0 : -1}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                {Icon && (
                  <Icon 
                    size={20} 
                    className={cn(
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )} 
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge className="text-xs h-4 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <div className={cn(
                      "text-xs leading-tight mt-0.5 truncate",
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground group-hover:text-foreground/80'
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>

                {shortcutDisplay && showShortcuts && (
                  <div className={cn(
                    "text-xs font-mono px-1.5 py-0.5 rounded border opacity-60 group-hover:opacity-100",
                    isActive ? 'border-primary-foreground/20 text-primary-foreground' : 'border-muted-foreground/20 text-muted-foreground'
                  )}>
                    {shortcutDisplay}
                  </div>
                )}
                
                <ChevronRight 
                  size={16} 
                  className={cn(
                    "opacity-0 group-hover:opacity-60 transition-opacity",
                    isActive && 'text-primary-foreground'
                  )}
                />
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer hint */}
      {showShortcuts && !shortcutsVisible && (
        <div className="p-2 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 bg-muted border rounded font-mono">?</kbd> for keyboard shortcuts
          </div>
        </div>
      )}
    </div>
  );
}