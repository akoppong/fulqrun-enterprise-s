import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ContentAreaProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: ReactNode;
  tabs?: ReactNode;
  badge?: string;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: ReactNode;
}

export function ContentArea({
  children,
  title,
  subtitle,
  description,
  breadcrumb,
  actions,
  tabs,
  badge,
  className,
  isLoading = false,
  isEmpty = false,
  emptyState
}: ContentAreaProps) {
  return (
    <div className={cn('flex-1 flex flex-col min-h-0', className)}>
      {/* Header Section */}
      {(title || subtitle || description || breadcrumb || actions) && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            {/* Breadcrumb */}
            {breadcrumb && breadcrumb.length > 0 && (
              <nav className="mb-3">
                <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {breadcrumb.map((item, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <span className="mx-2 text-muted-foreground/50">/</span>
                      )}
                      <span className={cn(
                        index === breadcrumb.length - 1 
                          ? 'text-foreground font-medium' 
                          : 'hover:text-foreground cursor-pointer'
                      )}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-foreground truncate responsive-title">
                      {title}
                    </h1>
                    {badge && (
                      <Badge variant="outline" className="flex-shrink-0">
                        {badge}
                      </Badge>
                    )}
                  </div>
                )}
                {subtitle && (
                  <p className="text-lg text-muted-foreground mb-2">{subtitle}</p>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
          
          {/* Tabs Section */}
          {tabs && (
            <>
              <Separator />
              <div className="px-6">
                {tabs}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Content Section */}
      <div className="flex-1 min-h-0 relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="loading-overlay">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </div>
          </div>
        ) : isEmpty && emptyState ? (
          <div className="flex items-center justify-center h-full p-6">
            {emptyState}
          </div>
        ) : (
          <div className="h-full responsive-overflow">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility component for consistent page spacing
export function ContentContainer({ 
  children, 
  className,
  maxWidth = 'max-w-7xl'
}: { 
  children: ReactNode; 
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={cn('content-width', maxWidth, className)}>
      {children}
    </div>
  );
}

// Card-based content layout
export function ContentGrid({
  children,
  className,
  columns = 'md:grid-cols-2 lg:grid-cols-3'
}: {
  children: ReactNode;
  className?: string;
  columns?: string;
}) {
  return (
    <div className={cn('grid gap-6', columns, className)}>
      {children}
    </div>
  );
}

// Enhanced card wrapper with consistent styling
export function ContentCard({
  children,
  title,
  description,
  actions,
  className,
  headerClassName,
  contentClassName,
  ...props
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  [key: string]: any;
}) {
  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      {(title || description || actions) && (
        <div className={cn('px-6 py-4 border-b bg-muted/30', headerClassName)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-semibold text-foreground truncate">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cn('p-6', contentClassName)}>
        {children}
      </div>
    </Card>
  );
}

// Empty state component
export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="flex justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}