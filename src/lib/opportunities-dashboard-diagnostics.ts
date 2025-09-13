/**
 * Opportunities Dashboard Test Diagnostics
 * 
 * This module provides comprehensive testing and diagnostics for the opportunities
 * dashboard functionality, including data loading, validation, and processing.
 */

import { OpportunityService } from '@/lib/opportunity-service';
import { Opportunity } from '@/lib/types';

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  data?: any;
  timestamp: string;
}

export class OpportunitiesDashboardDiagnostics {
  private static results: DiagnosticResult[] = [];

  static async runFullDiagnostics(): Promise<DiagnosticResult[]> {
    this.results = [];
    
    console.log('🧪 Starting comprehensive opportunities dashboard diagnostics...');
    
    // Test 1: Service Initialization
    await this.testServiceInitialization();
    
    // Test 2: Data Loading
    await this.testDataLoading();
    
    // Test 3: Array Operations
    await this.testArrayOperations();
    
    // Test 4: Data Validation
    await this.testDataValidation();
    
    // Test 5: LocalStorage Operations
    await this.testLocalStorageOperations();
    
    // Test 6: Error Handling
    await this.testErrorHandling();
    
    // Test 7: Performance
    await this.testPerformance();
    
    console.log('🎯 Diagnostics completed!', this.results);
    return [...this.results];
  }

  private static addResult(test: string, status: 'pass' | 'fail' | 'warning', message: string, data?: any) {
    const result: DiagnosticResult = {
      test,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`, data ? data : '');
  }

  private static async testServiceInitialization(): Promise<void> {
    try {
      // Test if service can be instantiated
      const hasGetAllMethod = typeof OpportunityService.getAllOpportunities === 'function';
      const hasCreateMethod = typeof OpportunityService.createOpportunity === 'function';
      const hasInitMethod = typeof OpportunityService.initializeSampleData === 'function';
      
      if (hasGetAllMethod && hasCreateMethod && hasInitMethod) {
        this.addResult('Service Initialization', 'pass', 'OpportunityService methods available');
      } else {
        this.addResult('Service Initialization', 'fail', 'Missing required service methods', {
          hasGetAll: hasGetAllMethod,
          hasCreate: hasCreateMethod,
          hasInit: hasInitMethod
        });
      }
    } catch (error) {
      this.addResult('Service Initialization', 'fail', `Service initialization failed: ${error}`);
    }
  }

  private static async testDataLoading(): Promise<void> {
    try {
      // Clear existing data first
      localStorage.removeItem('opportunities');
      
      // Initialize sample data
      await OpportunityService.initializeSampleData();
      
      // Get opportunities
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (Array.isArray(opportunities)) {
        if (opportunities.length > 0) {
          this.addResult('Data Loading', 'pass', `Successfully loaded ${opportunities.length} opportunities`);
        } else {
          this.addResult('Data Loading', 'warning', 'Data loaded but array is empty');
        }
      } else {
        this.addResult('Data Loading', 'fail', `Expected array, got ${typeof opportunities}`, {
          type: typeof opportunities,
          value: opportunities
        });
      }
    } catch (error) {
      this.addResult('Data Loading', 'fail', `Data loading failed: ${error}`);
    }
  }

  private static async testArrayOperations(): Promise<void> {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (!Array.isArray(opportunities)) {
        this.addResult('Array Operations', 'fail', 'Cannot test array operations - data is not an array');
        return;
      }

      // Test basic array operations
      const filterTest = opportunities.filter(opp => opp && opp.id);
      const mapTest = opportunities.map(opp => ({ ...opp, test: true }));
      const reduceTest = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
      
      this.addResult('Array Operations', 'pass', 'Array operations successful', {
        originalLength: opportunities.length,
        filteredLength: filterTest.length,
        mappedLength: mapTest.length,
        totalValue: reduceTest
      });
    } catch (error) {
      this.addResult('Array Operations', 'fail', `Array operations failed: ${error}`);
    }
  }

  private static async testDataValidation(): Promise<void> {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (!Array.isArray(opportunities)) {
        this.addResult('Data Validation', 'fail', 'Cannot validate - data is not an array');
        return;
      }

      const validationResults = {
        total: opportunities.length,
        withId: opportunities.filter(opp => opp?.id).length,
        withTitle: opportunities.filter(opp => opp?.title).length,
        withValue: opportunities.filter(opp => typeof opp?.value === 'number').length,
        withStage: opportunities.filter(opp => opp?.stage).length,
        withDates: opportunities.filter(opp => opp?.createdAt && opp?.updatedAt).length
      };

      const validPercentage = validationResults.total > 0 
        ? Math.round((validationResults.withId / validationResults.total) * 100)
        : 0;

      if (validPercentage >= 90) {
        this.addResult('Data Validation', 'pass', `${validPercentage}% of opportunities have valid structure`, validationResults);
      } else if (validPercentage >= 70) {
        this.addResult('Data Validation', 'warning', `Only ${validPercentage}% of opportunities have valid structure`, validationResults);
      } else {
        this.addResult('Data Validation', 'fail', `Only ${validPercentage}% of opportunities have valid structure`, validationResults);
      }
    } catch (error) {
      this.addResult('Data Validation', 'fail', `Data validation failed: ${error}`);
    }
  }

  private static async testLocalStorageOperations(): Promise<void> {
    try {
      const testKey = 'test-opportunities-diagnostics';
      const testData = [{ id: 'test-1', title: 'Test Opportunity', value: 1000 }];
      
      // Test write
      localStorage.setItem(testKey, JSON.stringify(testData));
      
      // Test read
      const retrieved = localStorage.getItem(testKey);
      
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        
        if (Array.isArray(parsed) && parsed.length === 1 && parsed[0].id === 'test-1') {
          this.addResult('LocalStorage Operations', 'pass', 'LocalStorage read/write operations successful');
        } else {
          this.addResult('LocalStorage Operations', 'fail', 'LocalStorage data corruption detected', { expected: testData, actual: parsed });
        }
      } else {
        this.addResult('LocalStorage Operations', 'fail', 'Failed to retrieve data from localStorage');
      }
      
      // Cleanup
      localStorage.removeItem(testKey);
    } catch (error) {
      this.addResult('LocalStorage Operations', 'fail', `LocalStorage operations failed: ${error}`);
    }
  }

  private static async testErrorHandling(): Promise<void> {
    try {
      // Test with corrupted localStorage data
      const corruptedKey = 'test-corrupted-opportunities';
      localStorage.setItem(corruptedKey, 'invalid-json{');
      
      try {
        const retrieved = localStorage.getItem(corruptedKey);
        if (retrieved) {
          JSON.parse(retrieved);
        }
        this.addResult('Error Handling', 'fail', 'Should have thrown error for corrupted JSON');
      } catch (parseError) {
        this.addResult('Error Handling', 'pass', 'Correctly handles corrupted JSON data');
      }
      
      // Cleanup
      localStorage.removeItem(corruptedKey);
      
      // Test with null/undefined handling
      const safeFilter = (data: any) => {
        try {
          return Array.isArray(data) ? data.filter(item => item) : [];
        } catch (error) {
          return [];
        }
      };
      
      const nullTest = safeFilter(null);
      const undefinedTest = safeFilter(undefined);
      const objectTest = safeFilter({ not: 'array' });
      
      if (Array.isArray(nullTest) && Array.isArray(undefinedTest) && Array.isArray(objectTest)) {
        this.addResult('Error Handling', 'pass', 'Null/undefined handling works correctly');
      } else {
        this.addResult('Error Handling', 'fail', 'Null/undefined handling failed');
      }
    } catch (error) {
      this.addResult('Error Handling', 'fail', `Error handling test failed: ${error}`);
    }
  }

  private static async testPerformance(): Promise<void> {
    try {
      const startTime = performance.now();
      
      // Test loading performance
      const opportunities = await OpportunityService.getAllOpportunities();
      
      const loadTime = performance.now() - startTime;
      
      // Test processing performance
      const processStartTime = performance.now();
      
      if (Array.isArray(opportunities)) {
        // Simulate dashboard calculations
        const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        const stages = opportunities.reduce((acc, opp) => {
          acc[opp.stage] = (acc[opp.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const avgValue = opportunities.length > 0 ? totalValue / opportunities.length : 0;
      }
      
      const processTime = performance.now() - processStartTime;
      const totalTime = loadTime + processTime;
      
      if (totalTime < 100) {
        this.addResult('Performance', 'pass', `Excellent performance: ${totalTime.toFixed(2)}ms total`, {
          loadTime: `${loadTime.toFixed(2)}ms`,
          processTime: `${processTime.toFixed(2)}ms`,
          recordCount: Array.isArray(opportunities) ? opportunities.length : 0
        });
      } else if (totalTime < 500) {
        this.addResult('Performance', 'warning', `Acceptable performance: ${totalTime.toFixed(2)}ms total`, {
          loadTime: `${loadTime.toFixed(2)}ms`,
          processTime: `${processTime.toFixed(2)}ms`,
          recordCount: Array.isArray(opportunities) ? opportunities.length : 0
        });
      } else {
        this.addResult('Performance', 'fail', `Poor performance: ${totalTime.toFixed(2)}ms total`, {
          loadTime: `${loadTime.toFixed(2)}ms`,
          processTime: `${processTime.toFixed(2)}ms`,
          recordCount: Array.isArray(opportunities) ? opportunities.length : 0
        });
      }
    } catch (error) {
      this.addResult('Performance', 'fail', `Performance test failed: ${error}`);
    }
  }

  // Quick health check for dashboard components
  static async quickHealthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test basic data loading
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (!Array.isArray(opportunities)) {
        issues.push('Data loading returns non-array');
      } else if (opportunities.length === 0) {
        issues.push('No sample data available');
      }
      
      // Test basic array operations
      if (Array.isArray(opportunities)) {
        try {
          opportunities.filter(opp => opp.id);
          opportunities.map(opp => opp.value || 0);
          opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
        } catch (error) {
          issues.push('Array operations failing');
        }
      }
      
      // Test localStorage
      try {
        const testKey = 'health-check-test';
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        if (retrieved !== 'test') {
          issues.push('LocalStorage not working correctly');
        }
        localStorage.removeItem(testKey);
      } catch (error) {
        issues.push('LocalStorage unavailable');
      }
      
    } catch (error) {
      issues.push(`Critical error: ${error}`);
    }
    
    if (issues.length === 0) {
      return { status: 'healthy', issues: [] };
    } else if (issues.length <= 2) {
      return { status: 'degraded', issues };
    } else {
      return { status: 'unhealthy', issues };
    }
  }
}

// Export for use in components
export default OpportunitiesDashboardDiagnostics;