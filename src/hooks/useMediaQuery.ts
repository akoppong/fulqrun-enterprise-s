import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design media queries
 * Provides real-time updates when viewport matches media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use the newer addEventListener if available, fallback to addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook for common responsive breakpoints
 * Returns an object with boolean values for each breakpoint
 */
export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');
  
  // Specific mobile breakpoints
  const isSmallMobile = useMediaQuery('(max-width: 479px)');
  const isLargeMobile = useMediaQuery('(min-width: 480px) and (max-width: 767px)');
  
  // Orientation
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  // High DPI displays
  const isRetina = useMediaQuery('(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)');
  
  // Touch devices
  const isTouch = useMediaQuery('(hover: none) and (pointer: coarse)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isSmallMobile,
    isLargeMobile,
    isPortrait,
    isLandscape,
    isRetina,
    isTouch,
    
    // Utility getters
    get deviceType() {
      if (isMobile) return 'mobile';
      if (isTablet) return 'tablet';
      return 'desktop';
    },
    
    get screenSize() {
      if (isSmallMobile) return 'sm-mobile';
      if (isLargeMobile) return 'lg-mobile';
      if (isTablet) return 'tablet';
      if (isLargeDesktop) return 'lg-desktop';
      return 'desktop';
    }
  };
}

/**
 * Hook for viewport dimensions
 * Returns current window width and height with real-time updates
 */
export function useViewportSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook for responsive grid columns
 * Returns appropriate number of columns based on viewport
 */
export function useResponsiveColumns(
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 3,
  largeDesktopColumns = 4
) {
  const { isMobile, isTablet, isLargeDesktop } = useResponsive();
  
  if (isMobile) return mobileColumns;
  if (isTablet) return tabletColumns;
  if (isLargeDesktop) return largeDesktopColumns;
  return desktopColumns;
}

/**
 * Hook for responsive spacing
 * Returns appropriate spacing values based on viewport
 */
export function useResponsiveSpacing() {
  const { isMobile, isTablet } = useResponsive();
  
  return {
    padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
    margin: isMobile ? '0.5rem' : isTablet ? '1rem' : '1.5rem',
    gap: isMobile ? '0.75rem' : isTablet ? '1rem' : '1.5rem',
  };
}

/**
 * Hook for container queries (experimental)
 * Simulates container queries using element dimensions
 */
export function useContainerQuery(
  elementRef: React.RefObject<HTMLElement>,
  breakpoints: Record<string, number>
) {
  const [matches, setMatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    const updateMatches = () => {
      const rect = element.getBoundingClientRect();
      const newMatches: Record<string, boolean> = {};
      
      Object.entries(breakpoints).forEach(([key, breakpoint]) => {
        newMatches[key] = rect.width >= breakpoint;
      });
      
      setMatches(newMatches);
    };

    // Use ResizeObserver if available, fallback to window resize
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(updateMatches);
      resizeObserver.observe(element);
      
      return () => resizeObserver.disconnect();
    } else {
      updateMatches();
      window.addEventListener('resize', updateMatches);
      
      return () => window.removeEventListener('resize', updateMatches);
    }
  }, [elementRef, breakpoints]);

  return matches;
}

/**
 * Hook for detecting reduced motion preference
 * Respects user's accessibility preferences
 */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for dark mode detection
 * Detects system preference for dark mode
 */
export function useSystemDarkMode() {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook for high contrast mode detection
 * Detects if user has high contrast mode enabled
 */
export function useHighContrast() {
  return useMediaQuery('(prefers-contrast: high)');
}

export default {
  useMediaQuery,
  useResponsive,
  useViewportSize,
  useResponsiveColumns,
  useResponsiveSpacing,
  useContainerQuery,
  useReducedMotion,
  useSystemDarkMode,
  useHighContrast,
};