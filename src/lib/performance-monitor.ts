/**
 * Advanced Performance Monitoring System
 * 
 * This module provides comprehensive performance monitoring capabilities including:
 * - Real-time performance metrics collection
 * - Component render time tracking
 * - Memory usage monitoring
 * - Network performance analysis
 * - User interaction latency measurement
 * - Performance bottleneck identification
 * - Automated optimization suggestions
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

// Performance metric types
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, any>;
  severity: 'info' | 'warning' | 'error';
  category: 'render' | 'network' | 'memory' | 'interaction' | 'bundle';
}

export interface ComponentPerformanceData {
  componentName: string;
  renderTime: number;
  propsCount: number;
  reRenderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  slowRenders: number;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface NetworkMetrics {
  requestCount: number;
  totalTransferSize: number;
  averageResponseTime: number;
  slowRequests: number;
  failedRequests: number;
}

export interface UserInteractionMetrics {
  totalInteractions: number;
  averageResponseTime: number;
  slowInteractions: number;
  inputLatency: number;
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 16, // 16ms for 60fps
  RENDER_TIME_ERROR: 50,   // 50ms is very slow
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
  MEMORY_ERROR: 100 * 1024 * 1024,  // 100MB
  NETWORK_SLOW: 2000, // 2 seconds
  INPUT_LATENCY_WARNING: 100, // 100ms
  INPUT_LATENCY_ERROR: 200,   // 200ms
};

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentPerformanceData>();
  private memoryMetrics: MemoryMetrics[] = [];
  private networkMetrics: NetworkMetrics = {
    requestCount: 0,
    totalTransferSize: 0,
    averageResponseTime: 0,
    slowRequests: 0,
    failedRequests: 0,
  };
  private userInteractionMetrics: UserInteractionMetrics = {
    totalInteractions: 0,
    averageResponseTime: 0,
    slowInteractions: 0,
    inputLatency: 0,
  };

  private observers: {
    performanceObserver?: PerformanceObserver;
    mutationObserver?: MutationObserver;
    resizeObserver?: ResizeObserver;
  } = {};

  private callbacks: {
    onMetric?: (metric: PerformanceMetric) => void;
    onOptimizationOpportunity?: (opportunity: OptimizationOpportunity) => void;
  } = {};

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Initialize all performance monitoring systems
   */
  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.setupUserInteractionMonitoring();
    this.setupAutomaticOptimizationDetection();
  }

  /**
   * Set up performance observer for various web vitals
   */
  private setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      this.observers.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          this.processPerformanceEntry(entry);
        }
      });

      // Observe different types of performance entries
      const entryTypes = ['measure', 'navigation', 'resource', 'paint', 'largest-contentful-paint'];
      for (const entryType of entryTypes) {
        try {
          this.observers.performanceObserver.observe({ entryTypes: [entryType] });
        } catch {
          // Some entry types might not be supported
        }
      }
    } catch (error) {
      console.warn('Performance Observer not available:', error);
    }
  }

  /**
   * Process individual performance entries
   */
  private processPerformanceEntry(entry: PerformanceEntry) {
    let metric: PerformanceMetric | null = null;

    switch (entry.entryType) {
      case 'measure':
        metric = {
          id: `measure-${Date.now()}`,
          name: entry.name,
          value: entry.duration,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'render',
          severity: entry.duration > PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR ? 'error' :
                   entry.duration > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING ? 'warning' : 'info',
        };
        break;

      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        metric = {
          id: `navigation-${Date.now()}`,
          name: 'Page Load Time',
          value: navEntry.loadEventEnd - navEntry.fetchStart,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'network',
          severity: 'info',
          context: {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
            firstPaint: navEntry.responseEnd - navEntry.fetchStart,
          },
        };
        break;

      case 'resource':
        const resourceEntry = entry as PerformanceResourceTiming;
        this.updateNetworkMetrics(resourceEntry);
        break;

      case 'largest-contentful-paint':
        metric = {
          id: `lcp-${Date.now()}`,
          name: 'Largest Contentful Paint',
          value: entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'render',
          severity: entry.startTime > 4000 ? 'error' : entry.startTime > 2500 ? 'warning' : 'info',
        };
        break;
    }

    if (metric) {
      this.addMetric(metric);
    }
  }

  /**
   * Set up memory monitoring
   */
  private setupMemoryMonitoring() {
    if (!window.performance || !('memory' in window.performance)) return;

    const checkMemory = () => {
      const memory = (window.performance as any).memory;
      const memoryMetric: MemoryMetrics = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        timestamp: Date.now(),
      };

      this.memoryMetrics.push(memoryMetric);
      
      // Keep only last 100 measurements
      if (this.memoryMetrics.length > 100) {
        this.memoryMetrics.shift();
      }

      // Create performance metric
      const metric: PerformanceMetric = {
        id: `memory-${Date.now()}`,
        name: 'Memory Usage',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        timestamp: Date.now(),
        category: 'memory',
        severity: memory.usedJSHeapSize > PERFORMANCE_THRESHOLDS.MEMORY_ERROR ? 'error' :
                 memory.usedJSHeapSize > PERFORMANCE_THRESHOLDS.MEMORY_WARNING ? 'warning' : 'info',
        context: memoryMetric,
      };

      this.addMetric(metric);
    };

    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  }

  /**
   * Set up network monitoring
   */
  private setupNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Track network metric
        this.networkMetrics.requestCount++;
        this.networkMetrics.averageResponseTime = 
          (this.networkMetrics.averageResponseTime * (this.networkMetrics.requestCount - 1) + duration) / 
          this.networkMetrics.requestCount;

        if (duration > PERFORMANCE_THRESHOLDS.NETWORK_SLOW) {
          this.networkMetrics.slowRequests++;
        }

        if (!response.ok) {
          this.networkMetrics.failedRequests++;
        }

        // Create performance metric for slow requests
        if (duration > PERFORMANCE_THRESHOLDS.NETWORK_SLOW / 2) {
          const metric: PerformanceMetric = {
            id: `network-${Date.now()}`,
            name: 'Network Request',
            value: duration,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'network',
            severity: duration > PERFORMANCE_THRESHOLDS.NETWORK_SLOW ? 'warning' : 'info',
            context: {
              url: typeof args[0] === 'string' ? args[0] : args[0]?.url,
              status: response.status,
              ok: response.ok,
            },
          };
          this.addMetric(metric);
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.networkMetrics.failedRequests++;
        
        const metric: PerformanceMetric = {
          id: `network-error-${Date.now()}`,
          name: 'Network Request Failed',
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'network',
          severity: 'error',
          context: {
            url: typeof args[0] === 'string' ? args[0] : args[0]?.url,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
        this.addMetric(metric);
        
        throw error;
      }
    };
  }

  /**
   * Update network metrics based on resource timing
   */
  private updateNetworkMetrics(entry: PerformanceResourceTiming) {
    this.networkMetrics.requestCount++;
    this.networkMetrics.totalTransferSize += entry.transferSize || 0;
    
    const responseTime = entry.responseEnd - entry.requestStart;
    this.networkMetrics.averageResponseTime = 
      (this.networkMetrics.averageResponseTime * (this.networkMetrics.requestCount - 1) + responseTime) / 
      this.networkMetrics.requestCount;

    if (responseTime > PERFORMANCE_THRESHOLDS.NETWORK_SLOW) {
      this.networkMetrics.slowRequests++;
    }

    // Check for failed requests (status codes in name often indicate errors)
    if (entry.name.includes('404') || entry.name.includes('500') || entry.transferSize === 0) {
      this.networkMetrics.failedRequests++;
    }
  }

  /**
   * Set up user interaction monitoring
   */
  private setupUserInteractionMonitoring() {
    if (typeof window === 'undefined') return;

    let interactionStart = 0;

    // Monitor click interactions
    window.addEventListener('click', () => {
      interactionStart = performance.now();
      this.userInteractionMetrics.totalInteractions++;
    });

    // Monitor after interaction completes (using RAF to measure render time)
    window.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const responseTime = performance.now() - interactionStart;
        
        this.userInteractionMetrics.averageResponseTime = 
          (this.userInteractionMetrics.averageResponseTime * (this.userInteractionMetrics.totalInteractions - 1) + responseTime) / 
          this.userInteractionMetrics.totalInteractions;

        if (responseTime > PERFORMANCE_THRESHOLDS.INPUT_LATENCY_WARNING) {
          this.userInteractionMetrics.slowInteractions++;
        }

        const metric: PerformanceMetric = {
          id: `interaction-${Date.now()}`,
          name: 'User Interaction Response',
          value: responseTime,
          unit: 'ms',
          timestamp: Date.now(),
          category: 'interaction',
          severity: responseTime > PERFORMANCE_THRESHOLDS.INPUT_LATENCY_ERROR ? 'error' :
                   responseTime > PERFORMANCE_THRESHOLDS.INPUT_LATENCY_WARNING ? 'warning' : 'info',
        };

        this.addMetric(metric);
      });
    });

    // Monitor input latency
    const inputs = ['input', 'keydown', 'mousemove'];
    inputs.forEach(eventType => {
      window.addEventListener(eventType, () => {
        const latency = performance.now() - interactionStart;
        this.userInteractionMetrics.inputLatency = latency;
      }, { passive: true });
    });
  }

  /**
   * Set up automatic optimization opportunity detection
   */
  private setupAutomaticOptimizationDetection() {
    // Analyze metrics every minute for optimization opportunities
    setInterval(() => {
      this.analyzeOptimizationOpportunities();
    }, 60000);
  }

  /**
   * Add a performance metric
   */
  public addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 500 metrics
    if (this.metrics.length > 500) {
      this.metrics.shift();
    }

    // Notify callback if registered
    if (this.callbacks.onMetric) {
      this.callbacks.onMetric(metric);
    }

    // Show warning for severe performance issues
    if (metric.severity === 'error') {
      this.showPerformanceWarning(metric);
    }
  }

  /**
   * Track component performance
   */
  public trackComponentRender(componentName: string, renderTime: number, propsCount: number = 0) {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.reRenderCount++;
      existing.lastRenderTime = renderTime;
      existing.averageRenderTime = 
        (existing.averageRenderTime * (existing.reRenderCount - 1) + renderTime) / existing.reRenderCount;
      
      if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
        existing.slowRenders++;
      }
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        propsCount,
        reRenderCount: 1,
        lastRenderTime: renderTime,
        averageRenderTime: renderTime,
        slowRenders: renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING ? 1 : 0,
      });
    }

    // Create metric
    const metric: PerformanceMetric = {
      id: `component-${componentName}-${Date.now()}`,
      name: `${componentName} Render`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'render',
      severity: renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR ? 'error' :
               renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING ? 'warning' : 'info',
      context: { componentName, propsCount },
    };

    this.addMetric(metric);
  }

  /**
   * Show performance warning to user
   */
  private showPerformanceWarning(metric: PerformanceMetric) {
    const message = this.getPerformanceWarningMessage(metric);
    
    toast.warning('Performance Issue Detected', {
      description: message,
      duration: 5000,
    });
  }

  /**
   * Generate user-friendly warning message
   */
  private getPerformanceWarningMessage(metric: PerformanceMetric): string {
    switch (metric.category) {
      case 'render':
        return `Slow rendering detected in ${metric.name}. Consider optimizing this component.`;
      case 'memory':
        return 'High memory usage detected. Some features may become slow.';
      case 'network':
        return 'Slow network requests detected. Check your internet connection.';
      case 'interaction':
        return 'Slow user interaction response. The interface may feel sluggish.';
      default:
        return 'Performance issue detected. The application may feel slow.';
    }
  }

  /**
   * Analyze current metrics for optimization opportunities
   */
  private analyzeOptimizationOpportunities() {
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 60000); // Last minute
    const opportunities: OptimizationOpportunity[] = [];

    // Analyze slow components
    for (const [name, data] of this.componentMetrics.entries()) {
      if (data.slowRenders > 3 && data.averageRenderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_WARNING) {
        opportunities.push({
          type: 'component-optimization',
          severity: data.averageRenderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME_ERROR ? 'high' : 'medium',
          description: `Component "${name}" has slow render times`,
          suggestions: [
            'Consider using React.memo() to prevent unnecessary re-renders',
            'Optimize props passed to this component',
            'Check for expensive computations in render method',
            'Consider code splitting or lazy loading'
          ],
          component: name,
          impact: 'render-performance',
        });
      }
    }

    // Analyze memory issues
    const latestMemory = this.memoryMetrics[this.memoryMetrics.length - 1];
    if (latestMemory && latestMemory.usedJSHeapSize > PERFORMANCE_THRESHOLDS.MEMORY_WARNING) {
      opportunities.push({
        type: 'memory-optimization',
        severity: latestMemory.usedJSHeapSize > PERFORMANCE_THRESHOLDS.MEMORY_ERROR ? 'high' : 'medium',
        description: 'High memory usage detected',
        suggestions: [
          'Check for memory leaks in event listeners',
          'Optimize large data structures',
          'Consider virtualizing long lists',
          'Review image and asset optimization'
        ],
        impact: 'memory-usage',
      });
    }

    // Analyze network performance
    if (this.networkMetrics.slowRequests > 5) {
      opportunities.push({
        type: 'network-optimization',
        severity: this.networkMetrics.averageResponseTime > 5000 ? 'high' : 'medium',
        description: 'Multiple slow network requests detected',
        suggestions: [
          'Implement request caching',
          'Consider API response compression',
          'Optimize bundle size',
          'Use CDN for static assets'
        ],
        impact: 'network-performance',
      });
    }

    // Notify about opportunities
    opportunities.forEach(opportunity => {
      if (this.callbacks.onOptimizationOpportunity) {
        this.callbacks.onOptimizationOpportunity(opportunity);
      }
    });
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary() {
    const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp < 300000); // Last 5 minutes
    
    return {
      totalMetrics: this.metrics.length,
      recentIssues: recentMetrics.filter(m => m.severity === 'error').length,
      recentWarnings: recentMetrics.filter(m => m.severity === 'warning').length,
      componentMetrics: Array.from(this.componentMetrics.values()),
      memoryMetrics: this.memoryMetrics,
      networkMetrics: this.networkMetrics,
      userInteractionMetrics: this.userInteractionMetrics,
    };
  }

  /**
   * Register callbacks for performance events
   */
  public onMetric(callback: (metric: PerformanceMetric) => void) {
    this.callbacks.onMetric = callback;
  }

  public onOptimizationOpportunity(callback: (opportunity: OptimizationOpportunity) => void) {
    this.callbacks.onOptimizationOpportunity = callback;
  }

  /**
   * Clear all metrics
   */
  public clearMetrics() {
    this.metrics = [];
    this.componentMetrics.clear();
    this.memoryMetrics = [];
    this.networkMetrics = {
      requestCount: 0,
      totalTransferSize: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      failedRequests: 0,
    };
    this.userInteractionMetrics = {
      totalInteractions: 0,
      averageResponseTime: 0,
      slowInteractions: 0,
      inputLatency: 0,
    };
  }

  /**
   * Cleanup monitoring
   */
  public destroy() {
    Object.values(this.observers).forEach(observer => {
      if (observer && 'disconnect' in observer) {
        observer.disconnect();
      }
    });
  }
}

// Optimization opportunity interface
export interface OptimizationOpportunity {
  type: 'component-optimization' | 'memory-optimization' | 'network-optimization' | 'bundle-optimization';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestions: string[];
  component?: string;
  impact: string;
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Mark render start
  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current++;
  });

  // Mark render end
  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    performanceMonitor.trackComponentRender(componentName, renderTime);
  });

  return {
    renderCount: renderCount.current,
    trackCustomMetric: (name: string, value: number, unit: string = 'ms') => {
      performanceMonitor.addMetric({
        id: `${componentName}-${name}-${Date.now()}`,
        name: `${componentName}: ${name}`,
        value,
        unit,
        timestamp: Date.now(),
        category: 'render',
        severity: 'info',
        context: { componentName },
      });
    }
  };
}

// React hook for monitoring specific operations
export function useOperationTiming(operationName: string) {
  const startTime = useRef<number>(0);

  const startTiming = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endTiming = useCallback(() => {
    const duration = performance.now() - startTime.current;
    performanceMonitor.addMetric({
      id: `operation-${operationName}-${Date.now()}`,
      name: operationName,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'interaction',
      severity: duration > 100 ? 'warning' : 'info',
    });
    return duration;
  }, [operationName]);

  return { startTiming, endTiming };
}

export default performanceMonitor;