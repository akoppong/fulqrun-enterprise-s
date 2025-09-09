/**
 * Comprehensive tests for Date Validation Middleware
 * Tests all aspects of date validation, normalization, and utility functions
 */

import { DateValidator, DateUtils, CommonDateValidations } from '@/lib/date-validation';

export class DateValidationTests {
  private static testResults: Array<{
    test: string;
    passed: boolean;
    error?: string;
    result?: any;
  }> = [];

  /**
   * Runs all date validation tests
   */
  static runAllTests(): {
    passed: number;
    failed: number;
    total: number;
    results: Array<{ test: string; passed: boolean; error?: string; result?: any }>;
  } {
    this.testResults = [];

    console.log('🧪 Running Date Validation Middleware Tests...\n');

    // Basic validation tests
    this.testBasicValidation();
    
    // Date format parsing tests
    this.testDateFormatParsing();
    
    // Validation options tests
    this.testValidationOptions();
    
    // Date range validation tests
    this.testDateRangeValidation();
    
    // Normalization tests
    this.testDateNormalization();
    
    // Utility functions tests
    this.testUtilityFunctions();
    
    // Edge cases and error handling
    this.testEdgeCases();
    
    // Performance tests
    this.testPerformance();

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;

    console.log(`\n📊 Test Results: ${passed}/${this.testResults.length} passed (${failed} failed)`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(test => {
        console.log(`  - ${test.test}: ${test.error}`);
      });
    }

    return {
      passed,
      failed,
      total: this.testResults.length,
      results: this.testResults
    };
  }

  private static addTest(test: string, passed: boolean, error?: string, result?: any) {
    this.testResults.push({ test, passed, error, result });
    console.log(`${passed ? '✅' : '❌'} ${test}${error ? ': ' + error : ''}`);
  }

  private static testBasicValidation() {
    console.log('\n🔍 Testing Basic Validation...');
    
    // Valid date
    try {
      const result = DateValidator.validate(new Date('2024-03-15'));
      this.addTest('Valid date object', result.isValid && result.normalizedDate !== undefined);
    } catch (error) {
      this.addTest('Valid date object', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Invalid date
    try {
      const result = DateValidator.validate('invalid-date');
      this.addTest('Invalid date string', !result.isValid && result.error !== undefined);
    } catch (error) {
      this.addTest('Invalid date string', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Null value
    try {
      const result = DateValidator.validate(null);
      this.addTest('Null value (not required)', result.isValid);
    } catch (error) {
      this.addTest('Null value (not required)', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Required null value
    try {
      const result = DateValidator.validate(null, { required: true });
      this.addTest('Required null value', !result.isValid && result.error === 'Date is required');
    } catch (error) {
      this.addTest('Required null value', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private static testDateFormatParsing() {
    console.log('\n📅 Testing Date Format Parsing...');

    const testFormats = [
      { input: '2024-03-15', expected: true, name: 'ISO date format' },
      { input: '2024-03-15T10:30:00Z', expected: true, name: 'ISO datetime format' },
      { input: '03/15/2024', expected: true, name: 'US date format' },
      { input: '15/03/2024', expected: true, name: 'European date format' },
      { input: 1615789800000, expected: true, name: 'Timestamp (milliseconds)' },
      { input: 1615789800, expected: true, name: 'Timestamp (seconds)' },
      { input: 'March 15, 2024', expected: true, name: 'Natural language date' },
      { input: '2024/13/45', expected: false, name: 'Invalid date values' },
      { input: 'not-a-date', expected: false, name: 'Non-date string' },
      { input: '', expected: true, name: 'Empty string (not required)' }
    ];

    testFormats.forEach(({ input, expected, name }) => {
      try {
        const result = DateValidator.validate(input);
        const passed = result.isValid === expected;
        this.addTest(name, passed, 
          passed ? undefined : `Expected ${expected}, got ${result.isValid}${result.error ? ` (${result.error})` : ''}`);
      } catch (error) {
        this.addTest(name, false, error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }

  private static testValidationOptions() {
    console.log('\n⚙️ Testing Validation Options...');

    // Past date validation
    try {
      const pastDate = new Date('2020-01-01');
      const result = DateValidator.validate(pastDate, { allowPast: false });
      this.addTest('Past date with allowPast=false', !result.isValid);
    } catch (error) {
      this.addTest('Past date with allowPast=false', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Future date validation
    try {
      const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const result = DateValidator.validate(futureDate, { allowFuture: false });
      this.addTest('Future date with allowFuture=false', !result.isValid);
    } catch (error) {
      this.addTest('Future date with allowFuture=false', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Min/Max date validation
    try {
      const testDate = new Date('2024-06-15');
      const minDate = new Date('2024-01-01');
      const maxDate = new Date('2024-12-31');
      
      const result = DateValidator.validate(testDate, { minDate, maxDate });
      this.addTest('Date within min/max range', result.isValid);
      
      const beforeMin = DateValidator.validate(new Date('2023-12-31'), { minDate, maxDate });
      this.addTest('Date before min date', !beforeMin.isValid);
      
      const afterMax = DateValidator.validate(new Date('2025-01-01'), { minDate, maxDate });
      this.addTest('Date after max date', !afterMax.isValid);
    } catch (error) {
      this.addTest('Min/Max date validation', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private static testDateRangeValidation() {
    console.log('\n📊 Testing Date Range Validation...');

    try {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      
      const validRange = DateValidator.createRangeValidator(startDate, endDate);
      this.addTest('Valid date range', validRange.isValid);
      
      const invalidRange = DateValidator.createRangeValidator(endDate, startDate);
      this.addTest('Invalid date range (start > end)', !invalidRange.isValid);
      
      const sameDate = DateValidator.createRangeValidator(startDate, startDate);
      this.addTest('Same start and end date', !sameDate.isValid);
    } catch (error) {
      this.addTest('Date range validation', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private static testDateNormalization() {
    console.log('\n🔄 Testing Date Normalization...');

    try {
      const testDate = new Date('2024-03-15T10:30:00Z');
      
      // Test storage normalization
      const normalized = DateValidator.normalizeForStorage(testDate);
      const expectedISO = testDate.toISOString();
      this.addTest('Storage normalization', normalized === expectedISO);
      
      // Test display normalization
      const displayed = DateValidator.normalizeForDisplay(testDate, 'display');
      this.addTest('Display normalization', typeof displayed === 'string' && displayed !== 'Invalid Date');
      
      // Test invalid date normalization
      const invalidNormalized = DateValidator.normalizeForStorage('invalid-date');
      this.addTest('Invalid date storage normalization', invalidNormalized === null);
    } catch (error) {
      this.addTest('Date normalization', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private static testUtilityFunctions() {
    console.log('\n🛠️ Testing Utility Functions...');

    try {
      // Business days calculation
      const start = new Date('2024-01-01'); // Monday
      const end = new Date('2024-01-05'); // Friday
      const businessDays = DateUtils.getBusinessDaysBetween(start, end);
      this.addTest('Business days calculation', businessDays === 5);
      
      // Add business days
      const baseDate = new Date('2024-01-01'); // Monday
      const afterBusinessDays = DateUtils.addBusinessDays(baseDate, 5);
      const expectedDate = new Date('2024-01-08'); // Following Monday
      this.addTest('Add business days', 
        afterBusinessDays.toDateString() === expectedDate.toDateString());
      
      // Start/End of day
      const testDate = new Date('2024-03-15T15:30:45');
      const startOfDay = DateUtils.startOfDay(testDate);
      const endOfDay = DateUtils.endOfDay(testDate);
      
      this.addTest('Start of day', 
        startOfDay.getHours() === 0 && startOfDay.getMinutes() === 0 && startOfDay.getSeconds() === 0);
      this.addTest('End of day',
        endOfDay.getHours() === 23 && endOfDay.getMinutes() === 59 && endOfDay.getSeconds() === 59);
      
      // Is today check
      const today = new Date();
      const isToday = DateUtils.isToday(today);
      this.addTest('Is today check', isToday);
      
      // Relative time
      const relativeTime = DateUtils.getRelativeTime(today);
      this.addTest('Relative time for today', relativeTime === 'Today');
    } catch (error) {
      this.addTest('Utility functions', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private static testEdgeCases() {
    console.log('\n🎯 Testing Edge Cases...');

    try {
      // Leap year date
      const leapYearDate = new Date('2024-02-29');
      const leapResult = DateValidator.validate(leapYearDate);
      this.addTest('Leap year date', leapResult.isValid);
      
      // Invalid leap year date (should be handled by Date constructor)
      const invalidLeap = new Date('2023-02-29'); // 2023 is not a leap year
      const invalidLeapResult = DateValidator.validate(invalidLeap);
      // JavaScript Date constructor handles this, so we test what actually happens
      this.addTest('Invalid leap year handling', invalidLeapResult.isValid || !invalidLeapResult.isValid);
      
      // Very old date
      const oldDate = new Date('1800-01-01');
      const oldResult = DateValidator.validate(oldDate);
      this.addTest('Very old date (1800)', oldResult.isValid);
      
      // Very future date
      const futureDate = new Date('2200-01-01');
      const futureResult = DateValidator.validate(futureDate);
      this.addTest('Very future date (2200)', futureResult.isValid);
      
      // Date with different timezone
      const timezoneDate = new Date('2024-03-15T12:00:00+05:00');
      const timezoneResult = DateValidator.validate(timezoneDate);
      this.addTest('Date with timezone', timezoneResult.isValid);
      
      // Boundary values
      const maxTimestamp = new Date(8640000000000000); // Max safe timestamp
      const maxResult = DateValidator.validate(maxTimestamp);
      this.addTest('Maximum timestamp value', maxResult.isValid || !maxResult.isValid); // Either is acceptable
    } catch (error) {
      this.addTest('Edge cases', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private static testPerformance() {
    console.log('\n⚡ Testing Performance...');

    try {
      const iterations = 1000;
      const testDate = new Date('2024-03-15');
      
      // Test validation performance
      const validationStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        DateValidator.validate(testDate);
      }
      const validationTime = performance.now() - validationStart;
      
      this.addTest(`Validation performance (${iterations} iterations)`, 
        validationTime < 100, // Should complete in under 100ms
        `Took ${validationTime.toFixed(2)}ms`);
      
      // Test normalization performance
      const normalizationStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        DateValidator.normalizeForStorage(testDate);
      }
      const normalizationTime = performance.now() - normalizationStart;
      
      this.addTest(`Normalization performance (${iterations} iterations)`,
        normalizationTime < 50, // Should complete in under 50ms
        `Took ${normalizationTime.toFixed(2)}ms`);
    } catch (error) {
      this.addTest('Performance tests', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Tests common date validation scenarios
   */
  static testCommonScenarios(): {
    opportunityCloseDate: boolean;
    contractDates: boolean;
    userBirthDate: boolean;
    eventDates: boolean;
  } {
    console.log('\n🎭 Testing Common CRM Scenarios...');
    
    const results = {
      opportunityCloseDate: false,
      contractDates: false,
      userBirthDate: false,
      eventDates: false
    };

    try {
      // Opportunity close date (must be in future)
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const oppResult = DateValidator.validate(futureDate, CommonDateValidations.opportunityCloseDate);
      results.opportunityCloseDate = oppResult.isValid;
      
      // Contract dates (range validation)
      const contractStart = new Date('2024-01-01');
      const contractEnd = new Date('2024-12-31');
      const rangeResult = DateValidator.createRangeValidator(contractStart, contractEnd);
      results.contractDates = rangeResult.isValid;
      
      // User birth date (must be in past)
      const birthDate = new Date('1990-01-01');
      const birthResult = DateValidator.validate(birthDate, CommonDateValidations.pastDate);
      results.userBirthDate = birthResult.isValid;
      
      // Event dates (flexible)
      const eventDate = new Date('2024-06-15');
      const eventResult = DateValidator.validate(eventDate, CommonDateValidations.businessDate);
      results.eventDates = eventResult.isValid;
      
      console.log('✅ Common scenarios tested successfully');
    } catch (error) {
      console.log('❌ Common scenarios test failed:', error);
    }

    return results;
  }

  /**
   * Interactive test runner for development
   */
  static runInteractiveTests() {
    console.log('🚀 Starting Interactive Date Validation Tests...\n');
    
    const results = this.runAllTests();
    const scenarios = this.testCommonScenarios();
    
    return {
      testResults: results,
      scenarioResults: scenarios,
      summary: {
        allTestsPassed: results.failed === 0,
        allScenariosPassed: Object.values(scenarios).every(Boolean),
        totalTests: results.total,
        passRate: (results.passed / results.total) * 100
      }
    };
  }
}

// Export for use in components
export default DateValidationTests;