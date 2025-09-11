import { useEffect, useRef, forwardRef } from 'react';
import { useResponsiveAutoFix } from '@/hooks/useResponsiveAutoFix';
import { ResponsiveUtils } from '@/lib/responsive-auto-fix';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  autoFix?: boolean;
  fixOverflow?: boolean;
  fixTouchTargets?: boolean;
  fixTextSize?: boolean;
  className?: string;
  [key: string]: any;
}

/**
 * A container component that automatically applies responsive fixes to its children
 */
export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    children, 
    autoFix = true, 
    fixOverflow = true, 
    fixTouchTargets = true, 
    fixTextSize = true, 
    className = '',
    ...props 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { viewport, autoFixByType } = useResponsiveAutoFix({
      enabled: autoFix,
      autoFixCritical: true,
      performanceMode: true
    });

    useEffect(() => {
      if (!autoFix || !containerRef.current) return;

      const container = containerRef.current;
      
      // Apply data attribute for CSS-based auto-fixes
      container.setAttribute('data-responsive-autofix', 'true');
      
      // Apply specific fixes based on props
      if (fixOverflow) {
        container.classList.add('auto-fix-container');
      }
      
      // Check and fix touch targets
      if (fixTouchTargets && viewport.deviceType === 'mobile') {
        const isValid = ResponsiveUtils.validateTouchTargets(container);
        if (!isValid) {
          autoFixByType('touch');
        }
      }
      
      // Apply optimal spacing
      const elements = container.querySelectorAll('[data-spacing]') as NodeListOf<HTMLElement>;
      elements.forEach(element => {
        const baseSpacing = parseInt(element.dataset.spacing || '16');
        const optimalSpacing = ResponsiveUtils.getOptimalSpacing(baseSpacing);
        element.style.padding = `${optimalSpacing}px`;
      });
      
      // Apply optimal font sizes
      if (fixTextSize) {
        const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6') as NodeListOf<HTMLElement>;
        textElements.forEach(element => {
          const computedStyle = window.getComputedStyle(element);
          const currentSize = parseFloat(computedStyle.fontSize);
          const optimalSize = ResponsiveUtils.getOptimalFontSize(currentSize);
          
          if (optimalSize !== currentSize) {
            element.style.fontSize = `${optimalSize}px`;
          }
        });
      }
      
      return () => {
        container.removeAttribute('data-responsive-autofix');
      };
    }, [autoFix, fixOverflow, fixTouchTargets, fixTextSize, viewport, autoFixByType]);

    const combinedRef = (element: HTMLDivElement) => {
      containerRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div 
        ref={combinedRef}
        className={`responsive-container ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

/**
 * A higher-order component that wraps any component with responsive auto-fix capabilities
 */
export function withResponsiveAutoFix<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    autoFix?: boolean;
    fixOverflow?: boolean;
    fixTouchTargets?: boolean;
    fixTextSize?: boolean;
  } = {}
) {
  const {
    autoFix = true,
    fixOverflow = true,
    fixTouchTargets = true,
    fixTextSize = true
  } = options;

  return forwardRef<any, T>((props, ref) => (
    <ResponsiveContainer 
      autoFix={autoFix}
      fixOverflow={fixOverflow}
      fixTouchTargets={fixTouchTargets}
      fixTextSize={fixTextSize}
    >
      <Component {...props} ref={ref} />
    </ResponsiveContainer>
  ));
}

/**
 * Specific responsive components for common use cases
 */

export const ResponsiveTable = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className = '' }, ref) => (
    <ResponsiveContainer 
      ref={ref}
      className={`auto-fix-table-container ${className}`}
      fixOverflow={true}
    >
      {children}
    </ResponsiveContainer>
  )
);

ResponsiveTable.displayName = 'ResponsiveTable';

export const ResponsiveGrid = forwardRef<HTMLDivElement, { 
  children: React.ReactNode; 
  className?: string;
  minItemWidth?: string;
}>(({ children, className = '', minItemWidth = '250px' }, ref) => (
  <ResponsiveContainer 
    ref={ref}
    className={`auto-fix-grid ${className}`}
    style={{ 
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))` 
    }}
  >
    {children}
  </ResponsiveContainer>
));

ResponsiveGrid.displayName = 'ResponsiveGrid';

export const ResponsiveForm = forwardRef<HTMLFormElement, { 
  children: React.ReactNode; 
  className?: string;
}>(({ children, className = '' }, ref) => (
  <form 
    ref={ref}
    className={`auto-fix-form ${className}`}
    data-responsive-autofix="true"
  >
    {children}
  </form>
));

ResponsiveForm.displayName = 'ResponsiveForm';

export const ResponsiveModal = forwardRef<HTMLDivElement, { 
  children: React.ReactNode; 
  className?: string;
}>(({ children, className = '' }, ref) => (
  <ResponsiveContainer 
    ref={ref}
    className={`auto-fix-modal ${className}`}
    fixOverflow={true}
    fixTouchTargets={true}
  >
    {children}
  </ResponsiveContainer>
));

ResponsiveModal.displayName = 'ResponsiveModal';

export const ResponsiveNavigation = forwardRef<HTMLElement, { 
  children: React.ReactNode; 
  className?: string;
}>(({ children, className = '' }, ref) => (
  <nav 
    ref={ref}
    className={`auto-fix-nav ${className}`}
    data-responsive-autofix="true"
  >
    {children}
  </nav>
));

ResponsiveNavigation.displayName = 'ResponsiveNavigation';