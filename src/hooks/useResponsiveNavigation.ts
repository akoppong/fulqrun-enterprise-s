import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';

interface NavigationState {
  isOpen: boolean;
  activeSection?: string;
  previousView?: string;
  breadcrumbs: Array<{ label: string; value: string }>;
}

export function useResponsiveNavigation(initialView?: string) {
  const [navigationState, setNavigationState] = useKV<NavigationState>('nav-state', {
    isOpen: false,
    activeSection: undefined,
    previousView: undefined,
    breadcrumbs: []
  });

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-close navigation on mobile when navigating
  const navigateTo = useCallback((view: string, label?: string) => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: false,
      previousView: prev.activeSection,
      activeSection: view,
      breadcrumbs: label ? [...prev.breadcrumbs.slice(0, 1), { label, value: view }] : prev.breadcrumbs
    }));
  }, [setNavigationState]);

  const toggleNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  }, [setNavigationState]);

  const closeNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, [setNavigationState]);

  const openNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: true
    }));
  }, [setNavigationState]);

  const updateBreadcrumbs = useCallback((breadcrumbs: Array<{ label: string; value: string }>) => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs
    }));
  }, [setNavigationState]);

  const goBack = useCallback(() => {
    if (navigationState.previousView) {
      setNavigationState(prev => ({
        ...prev,
        activeSection: prev.previousView,
        previousView: undefined,
        breadcrumbs: prev.breadcrumbs.slice(0, -1)
      }));
    }
  }, [navigationState.previousView, setNavigationState]);

  // Initialize with default view
  useEffect(() => {
    if (initialView && !navigationState.activeSection) {
      setNavigationState(prev => ({
        ...prev,
        activeSection: initialView,
        breadcrumbs: [{ label: 'Dashboard', value: initialView }]
      }));
    }
  }, [initialView, navigationState.activeSection, setNavigationState]);

  // Close navigation when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !navigationState.isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const navElement = document.querySelector('[data-mobile-nav]');
      const triggerElement = document.querySelector('[data-mobile-nav-trigger]');
      
      if (navElement && !navElement.contains(target) && 
          triggerElement && !triggerElement.contains(target)) {
        closeNavigation();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobile, navigationState.isOpen, closeNavigation]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && navigationState.isOpen) {
        closeNavigation();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [navigationState.isOpen, closeNavigation]);

  return {
    isOpen: navigationState.isOpen,
    activeSection: navigationState.activeSection,
    breadcrumbs: navigationState.breadcrumbs,
    isMobile,
    canGoBack: !!navigationState.previousView,
    navigateTo,
    toggleNavigation,
    closeNavigation,
    openNavigation,
    updateBreadcrumbs,
    goBack
  };
}