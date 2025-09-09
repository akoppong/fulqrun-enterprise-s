import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'p-2 sm:p-4',
  md: 'p-3 sm:p-4 lg:p-6',
  lg: 'p-4 sm:p-6 lg:p-8',
};

export function ResponsiveLayout({ 
  children, 
  className,
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveLayoutProps) {
  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-6', 
  lg: 'gap-4 sm:gap-6 lg:gap-8',
};

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gridClasses = [
    cols.default ? `grid-cols-${cols.default}` : 'grid-cols-1',
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '', 
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'grid',
      gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const cardPaddingClasses = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',  
  lg: 'p-6 sm:p-8',
};

export function ResponsiveCard({ 
  children, 
  className,
  padding = 'md'
}: ResponsiveCardProps) {
  return (
    <div className={cn(
      'bg-card border rounded-lg',
      cardPaddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}