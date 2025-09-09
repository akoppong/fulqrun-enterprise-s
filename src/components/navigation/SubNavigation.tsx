import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SubNavigationItem {
  id: string;
  label: string;
  description?: string;
  isNew?: boolean;
  badge?: string;
  icon?: any;
}

interface SubNavigationProps {
  items: SubNavigationItem[];
  activeItem: string;
  onItemChange: (itemId: string) => void;
  title?: string;
  className?: string;
}

export function SubNavigation({ 
  items, 
  activeItem, 
  onItemChange, 
  title,
  className 
}: SubNavigationProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn('border-b bg-card/50 backdrop-blur-sm', className)}>
      <div className="px-6 py-4">
        {title && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">Choose from the available options below</p>
          </div>
        )}
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex items-center space-x-2 pb-2">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const Icon = item.icon;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'flex-shrink-0 h-auto py-3 px-4 transition-all duration-200',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm border-primary' 
                      : 'hover:bg-muted/80 border-border/50'
                  )}
                  onClick={() => onItemChange(item.id)}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={16} />}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm whitespace-nowrap">
                          {item.label}
                        </span>
                        {item.isNew && (
                          <Badge className="text-xs h-4 px-1.5 bg-green-100 text-green-800">
                            New
                          </Badge>
                        )}
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs h-4 px-1.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <div className={cn(
                          "text-xs leading-tight mt-1 whitespace-nowrap max-w-32 truncate",
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}>
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
}