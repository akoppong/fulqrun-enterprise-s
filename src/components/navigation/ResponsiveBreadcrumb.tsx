import { ChevronRight, Home } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  value?: string;
  onClick?: () => void;
}

interface ResponsiveBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function ResponsiveBreadcrumb({ items, className }: ResponsiveBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)} aria-label="Breadcrumb">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 hover:bg-muted/50"
        onClick={items[0]?.onClick}
      >
        <Home size={14} className="mr-1" />
        <span className="hidden sm:inline">{items[0]?.label}</span>
      </Button>
      
      {items.slice(1).map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={14} className="text-muted-foreground mx-1" />
          {item.onClick ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 hover:bg-muted/50"
              onClick={item.onClick}
            >
              <span className={cn(
                "truncate max-w-32 sm:max-w-none",
                index === items.length - 2 && "font-medium text-foreground"
              )}>
                {item.label}
              </span>
            </Button>
          ) : (
            <span className={cn(
              "px-2 py-1 truncate max-w-32 sm:max-w-none",
              index === items.length - 2 && "font-medium text-foreground"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}