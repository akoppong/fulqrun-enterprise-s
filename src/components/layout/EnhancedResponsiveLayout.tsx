import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Enhanced Responsive Layout System
 * Provides consistent, mobile-first responsive layouts
 */

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
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
  xs: 'p-1 sm:p-2',
  sm: 'p-2 sm:p-4',
  md: 'p-3 sm:p-4 lg:p-6',
  lg: 'p-4 sm:p-6 lg:p-8',
  xl: 'p-6 sm:p-8 lg:p-12',
};

export const ResponsiveContainer = forwardRef<HTMLElement, ResponsiveContainerProps>(
  ({ children, className, maxWidth = 'xl', padding = 'md', as: Component = 'div' }, ref) => {
    return (
      <Component 
        ref={ref}
        className={cn(
          'w-full mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
}

const gapClasses = {
  xs: 'gap-1 sm:gap-2',
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4 lg:gap-6', 
  lg: 'gap-4 sm:gap-6 lg:gap-8',
  xl: 'gap-6 sm:gap-8 lg:gap-12',
};

export const ResponsiveGrid = forwardRef<HTMLElement, ResponsiveGridProps>(
  ({ children, className, cols = { default: 1, sm: 2, lg: 3 }, gap = 'md', as: Component = 'div' }, ref) => {
    const gridClasses = [
      cols.default ? `grid-cols-${cols.default}` : 'grid-cols-1',
      cols.sm ? `sm:grid-cols-${cols.sm}` : '',
      cols.md ? `md:grid-cols-${cols.md}` : '', 
      cols.lg ? `lg:grid-cols-${cols.lg}` : '',
      cols.xl ? `xl:grid-cols-${cols.xl}` : '',
      cols['2xl'] ? `2xl:grid-cols-${cols['2xl']}` : '',
    ].filter(Boolean).join(' ');

    return (
      <Component 
        ref={ref}
        className={cn(
          'grid',
          gridClasses,
          gapClasses[gap],
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

interface ResponsiveFlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  wrap?: boolean;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: Partial<Pick<ResponsiveFlexProps, 'direction' | 'wrap' | 'align' | 'justify'>>;
    md?: Partial<Pick<ResponsiveFlexProps, 'direction' | 'wrap' | 'align' | 'justify'>>;
    lg?: Partial<Pick<ResponsiveFlexProps, 'direction' | 'wrap' | 'align' | 'justify'>>;
  };
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveFlex = forwardRef<HTMLElement, ResponsiveFlexProps>(
  ({ 
    children, 
    className, 
    direction = 'row', 
    wrap = false,
    align = 'start',
    justify = 'start',
    gap = 'md',
    responsive = {},
    as: Component = 'div'
  }, ref) => {
    const flexClasses = cn(
      'flex',
      direction === 'col' ? 'flex-col' : 'flex-row',
      wrap && 'flex-wrap',
      {
        'items-start': align === 'start',
        'items-center': align === 'center',
        'items-end': align === 'end',
        'items-stretch': align === 'stretch',
      },
      {
        'justify-start': justify === 'start',
        'justify-center': justify === 'center',
        'justify-end': justify === 'end',
        'justify-between': justify === 'between',
        'justify-around': justify === 'around',
        'justify-evenly': justify === 'evenly',
      },
      gapClasses[gap],
      // Responsive classes
      responsive.sm?.direction === 'col' && 'sm:flex-col',
      responsive.sm?.direction === 'row' && 'sm:flex-row',
      responsive.md?.direction === 'col' && 'md:flex-col',
      responsive.md?.direction === 'row' && 'md:flex-row',
      responsive.lg?.direction === 'col' && 'lg:flex-col',
      responsive.lg?.direction === 'row' && 'lg:flex-row',
      className
    );

    return (
      <Component ref={ref} className={flexClasses}>
        {children}
      </Component>
    );
  }
);

ResponsiveFlex.displayName = 'ResponsiveFlex';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const cardPaddingClasses = {
  xs: 'p-2 sm:p-3',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',  
  lg: 'p-6 sm:p-8',
  xl: 'p-8 sm:p-10',
};

const cardVariantClasses = {
  default: 'bg-card border border-border',
  elevated: 'bg-card border border-border shadow-lg',
  outlined: 'bg-transparent border-2 border-border',
  ghost: 'bg-transparent',
};

export const ResponsiveCard = forwardRef<HTMLElement, ResponsiveCardProps>(
  ({ 
    children, 
    className,
    padding = 'md',
    variant = 'default',
    interactive = false,
    as: Component = 'div'
  }, ref) => {
    return (
      <Component 
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          cardVariantClasses[variant],
          cardPaddingClasses[padding],
          interactive && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveCard.displayName = 'ResponsiveCard';

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  divide?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

const spaceClasses = {
  xs: 'space-y-1 sm:space-y-2',
  sm: 'space-y-2 sm:space-y-3',
  md: 'space-y-3 sm:space-y-4',
  lg: 'space-y-4 sm:space-y-6',
  xl: 'space-y-6 sm:space-y-8',
};

export const ResponsiveStack = forwardRef<HTMLElement, ResponsiveStackProps>(
  ({ children, className, space = 'md', divide = false, as: Component = 'div' }, ref) => {
    return (
      <Component 
        ref={ref}
        className={cn(
          spaceClasses[space],
          divide && 'divide-y divide-border',
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveStack.displayName = 'ResponsiveStack';

interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
}

const sectionSizeClasses = {
  xs: 'py-4 sm:py-6',
  sm: 'py-6 sm:py-8',
  md: 'py-8 sm:py-12',
  lg: 'py-12 sm:py-16',
  xl: 'py-16 sm:py-24',
};

export const ResponsiveSection = forwardRef<HTMLElement, ResponsiveSectionProps>(
  ({ children, className, size = 'md', as: Component = 'section' }, ref) => {
    return (
      <Component 
        ref={ref}
        className={cn(
          sectionSizeClasses[size],
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveSection.displayName = 'ResponsiveSection';

/**
 * Responsive Text Component with adaptive sizing
 */
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'accent' | 'destructive';
  as?: keyof JSX.IntrinsicElements;
}

const textSizeClasses = {
  xs: 'text-xs sm:text-sm',
  sm: 'text-sm sm:text-base',
  base: 'text-base sm:text-lg',
  lg: 'text-lg sm:text-xl',
  xl: 'text-xl sm:text-2xl',
  '2xl': 'text-2xl sm:text-3xl',
  '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
};

const textWeightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const textColorClasses = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-accent-foreground',
  destructive: 'text-destructive',
};

export const ResponsiveText = forwardRef<HTMLElement, ResponsiveTextProps>(
  ({ 
    children, 
    className, 
    size = 'base', 
    weight = 'normal',
    color = 'default',
    as: Component = 'p'
  }, ref) => {
    return (
      <Component 
        ref={ref}
        className={cn(
          textSizeClasses[size],
          textWeightClasses[weight],
          textColorClasses[color],
          className
        )}
      >
        {children}
      </Component>
    );
  }
);

ResponsiveText.displayName = 'ResponsiveText';

/**
 * Responsive Show/Hide Component
 */
interface ResponsiveShowProps {
  children: ReactNode;
  above?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  below?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  only?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function ResponsiveShow({ children, above, below, only }: ResponsiveShowProps) {
  let classes = '';
  
  if (only) {
    // Show only at specific breakpoint
    switch (only) {
      case 'sm':
        classes = 'hidden sm:block md:hidden';
        break;
      case 'md':
        classes = 'hidden md:block lg:hidden';
        break;
      case 'lg':
        classes = 'hidden lg:block xl:hidden';
        break;
      case 'xl':
        classes = 'hidden xl:block 2xl:hidden';
        break;
      case '2xl':
        classes = 'hidden 2xl:block';
        break;
    }
  } else {
    // Show above/below certain breakpoints
    if (above) {
      switch (above) {
        case 'sm':
          classes = 'hidden sm:block';
          break;
        case 'md':
          classes = 'hidden md:block';
          break;
        case 'lg':
          classes = 'hidden lg:block';
          break;
        case 'xl':
          classes = 'hidden xl:block';
          break;
        case '2xl':
          classes = 'hidden 2xl:block';
          break;
      }
    }
    
    if (below) {
      switch (below) {
        case 'sm':
          classes = cn(classes, 'sm:hidden');
          break;
        case 'md':
          classes = cn(classes, 'md:hidden');
          break;
        case 'lg':
          classes = cn(classes, 'lg:hidden');
          break;
        case 'xl':
          classes = cn(classes, 'xl:hidden');
          break;
        case '2xl':
          classes = cn(classes, '2xl:hidden');
          break;
      }
    }
  }
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
}

/**
 * Responsive Breakpoint Hook
 */
export function useResponsiveBreakpoint() {
  // This would typically use a proper hook like useMediaQuery
  // For now, returning static values as an example
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    currentBreakpoint: 'lg' as const,
    width: 1440,
    height: 900
  };
}