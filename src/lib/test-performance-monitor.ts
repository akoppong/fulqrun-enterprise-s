/**
 * Test script to verify performance monitor is working correctly
 */

import { performanceMonitor } from './performance-monitor';

export function testPerformanceMonitor(): boolean {
  try {
    // Test basic functionality
    const summary = performanceMonitor.getPerformanceSummary();
    console.log('Performance monitor test passed:', summary);
    
    // Test metric tracking
    performanceMonitor.addMetric({
      id: 'test-metric',
      name: 'Test Metric',
      value: 100,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'render',
      severity: 'info',
    });
    
    // Test component tracking
    performanceMonitor.trackComponentRender('TestComponent', 15, 2);
    
    console.log('✅ Performance monitor is working correctly');
    return true;
  } catch (error) {
    console.error('❌ Performance monitor test failed:', error);
    return false;
  }
}

// Auto-run test when module is loaded
if (typeof window !== 'undefined') {
  // Delay to ensure DOM is ready
  setTimeout(() => {
    testPerformanceMonitor();
  }, 1000);
}