export interface TestScenario {
  id: string;
  name: string;
  description: string;
  fieldType: string;
  testData: {
    valid: any[];
    invalid: any[];
    edge: any[];
  };
  expectedBehavior: string;
}

export const fieldTestScenarios: TestScenario[] = [
  {
    id: 'email-validation',
    name: 'Email Validation',
    description: 'Test email field with various input patterns',
    fieldType: 'email',
    testData: {
      valid: [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@test-domain.org',
        'firstname.lastname@company.io'
      ],
      invalid: [
        'invalid-email',
        '@domain.com',
        'user@',
        'user.domain.com',
        'user @domain.com',
        'user@domain',
        'user@.com'
      ],
      edge: [
        '',
        ' ',
        'user@domain.c',
        'a@b.co',
        'verylongemailaddressthatmightcauseissues@verylongdomainname.com'
      ]
    },
    expectedBehavior: 'Should validate email format in real-time and show appropriate feedback'
  },
  {
    id: 'phone-validation',
    name: 'Phone Number Validation',
    description: 'Test phone field with international and domestic formats',
    fieldType: 'phone',
    testData: {
      valid: [
        '+1234567890',
        '(555) 123-4567',
        '555-123-4567',
        '+44 20 7946 0958',
        '1234567890'
      ],
      invalid: [
        'abc-def-ghij',
        '123',
        '+',
        '++1234567890',
        '(555) 123-456'
      ],
      edge: [
        '',
        '+1',
        '123456789012345678901',
        '000-000-0000'
      ]
    },
    expectedBehavior: 'Should accept various phone formats and provide formatting suggestions'
  },
  {
    id: 'password-strength',
    name: 'Password Strength',
    description: 'Test password field with strength requirements',
    fieldType: 'password',
    testData: {
      valid: [
        'SecureP@ss123',
        'MyStr0ng!Password',
        'C0mplex#Pass99',
        'Valid8ed@Password'
      ],
      invalid: [
        'weak',
        '12345678',
        'password',
        'PASSWORD',
        'Pass123'
      ],
      edge: [
        '',
        'P@ss1',
        'VeryLongPasswordWithAllRequirementsButMaybeToooLong123!@#',
        'P@ssw0rd'
      ]
    },
    expectedBehavior: 'Should show strength meter and requirement checklist'
  },
  {
    id: 'numeric-ranges',
    name: 'Numeric Range Validation',
    description: 'Test numeric fields with min/max constraints',
    fieldType: 'number',
    testData: {
      valid: [0, 50, 100, 999999],
      invalid: [-1, 1000001, 'abc', ''],
      edge: [0.5, 999999.99, '0', '100']
    },
    expectedBehavior: 'Should enforce min/max bounds and handle decimal values'
  },
  {
    id: 'currency-formatting',
    name: 'Currency Formatting',
    description: 'Test currency field with proper formatting',
    fieldType: 'currency',
    testData: {
      valid: [0, 10.50, 1000, 999999.99],
      invalid: [-10, 'abc', '$100'],
      edge: [0.001, 0.01, 1000000]
    },
    expectedBehavior: 'Should format as currency and handle decimal precision'
  },
  {
    id: 'url-validation',
    name: 'URL Validation',
    description: 'Test URL field with various protocols and formats',
    fieldType: 'url',
    testData: {
      valid: [
        'https://example.com',
        'http://test.org',
        'https://subdomain.example.co.uk/path?query=value',
        'ftp://files.example.com'
      ],
      invalid: [
        'not-a-url',
        'http://',
        'https://.com',
        'example.com',
        'http://invalid space.com'
      ],
      edge: [
        '',
        'https://localhost:3000',
        'https://192.168.1.1',
        'https://example.com/very/long/path/with/many/segments'
      ]
    },
    expectedBehavior: 'Should validate URL format and suggest protocol if missing'
  },
  {
    id: 'date-validation',
    name: 'Date Validation',
    description: 'Test date fields with various formats and constraints',
    fieldType: 'date',
    testData: {
      valid: [
        '2024-01-15',
        '2024-12-31',
        '2023-02-28',
        '2024-02-29'
      ],
      invalid: [
        '2024-13-01',
        '2024-02-30',
        '2023-02-29',
        'invalid-date'
      ],
      edge: [
        '2024-01-01',
        '2024-12-31',
        '1900-01-01',
        '2100-12-31'
      ]
    },
    expectedBehavior: 'Should validate date format and logical date values'
  },
  {
    id: 'text-length',
    name: 'Text Length Validation',
    description: 'Test text fields with length constraints',
    fieldType: 'text',
    testData: {
      valid: [
        'Valid text',
        'Short',
        'This is a longer text that should still be valid within reasonable limits'
      ],
      invalid: [],
      edge: [
        '',
        'a',
        'a'.repeat(1000),
        'Text with special chars: !@#$%^&*()',
        'Unicode text: 你好世界 🌍'
      ]
    },
    expectedBehavior: 'Should track character count and enforce length limits'
  }
];

export const testDataGenerator = {
  getRandomValidData: (scenario: TestScenario) => {
    const validData = scenario.testData.valid;
    return validData[Math.floor(Math.random() * validData.length)];
  },
  
  getRandomInvalidData: (scenario: TestScenario) => {
    const invalidData = scenario.testData.invalid;
    return invalidData[Math.floor(Math.random() * invalidData.length)];
  },
  
  getRandomEdgeData: (scenario: TestScenario) => {
    const edgeData = scenario.testData.edge;
    return edgeData[Math.floor(Math.random() * edgeData.length)];
  },
  
  generateTestSuite: () => {
    return fieldTestScenarios.map(scenario => ({
      ...scenario,
      tests: [
        ...scenario.testData.valid.map(data => ({ data, expected: 'valid', type: 'valid' as const })),
        ...scenario.testData.invalid.map(data => ({ data, expected: 'invalid', type: 'invalid' as const })),
        ...scenario.testData.edge.map(data => ({ data, expected: 'edge', type: 'edge' as const }))
      ]
    }));
  }
};

export interface ValidationTestResult {
  fieldType: string;
  testData: any;
  expected: 'valid' | 'invalid' | 'edge';
  actual: 'valid' | 'invalid';
  passed: boolean;
  validationMessage: string;
  timestamp: Date;
}

export class ValidationTestRunner {
  private results: ValidationTestResult[] = [];
  
  async runTest(scenario: TestScenario, testData: any, expected: 'valid' | 'invalid' | 'edge'): Promise<ValidationTestResult> {
    // Simulate validation logic
    const isValid = this.validateTestData(scenario.fieldType, testData);
    const actual = isValid ? 'valid' : 'invalid';
    
    let passed = false;
    if (expected === 'valid') {
      passed = actual === 'valid';
    } else if (expected === 'invalid') {
      passed = actual === 'invalid';
    } else {
      // Edge cases can be either valid or invalid
      passed = true;
    }
    
    const result: ValidationTestResult = {
      fieldType: scenario.fieldType,
      testData,
      expected,
      actual,
      passed,
      validationMessage: this.getValidationMessage(scenario.fieldType, testData, isValid),
      timestamp: new Date()
    };
    
    this.results.push(result);
    return result;
  }
  
  private validateTestData(fieldType: string, data: any): boolean {
    switch (fieldType) {
      case 'email':
        if (!data) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data);
      
      case 'phone':
        if (!data) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(data.toString().replace(/[\s\-\(\)]/g, ''));
      
      case 'password':
        if (!data) return true;
        return data.length >= 8 &&
               /[A-Z]/.test(data) &&
               /[a-z]/.test(data) &&
               /\d/.test(data) &&
               /[!@#$%^&*(),.?":{}|<>]/.test(data);
      
      case 'number':
        const num = Number(data);
        return !isNaN(num) && num >= 0 && num <= 1000000;
      
      case 'currency':
        const curr = Number(data);
        return !isNaN(curr) && curr >= 0;
      
      case 'url':
        if (!data) return true;
        try {
          new URL(data);
          return true;
        } catch {
          return false;
        }
      
      case 'date':
        if (!data) return true;
        const date = new Date(data);
        return !isNaN(date.getTime()) && data.match(/^\d{4}-\d{2}-\d{2}$/);
      
      case 'text':
        return true; // Text fields are generally always valid unless empty and required
      
      default:
        return true;
    }
  }
  
  private getValidationMessage(fieldType: string, data: any, isValid: boolean): string {
    if (isValid) {
      return `✓ Valid ${fieldType}`;
    }
    
    switch (fieldType) {
      case 'email':
        return '✗ Invalid email format';
      case 'phone':
        return '✗ Invalid phone number format';
      case 'password':
        return '✗ Password does not meet security requirements';
      case 'number':
        return '✗ Number out of range or invalid';
      case 'currency':
        return '✗ Invalid currency amount';
      case 'url':
        return '✗ Invalid URL format';
      case 'date':
        return '✗ Invalid date format or value';
      default:
        return '✗ Validation failed';
    }
  }
  
  getResults(): ValidationTestResult[] {
    return this.results;
  }
  
  getPassRate(): number {
    if (this.results.length === 0) return 0;
    const passed = this.results.filter(r => r.passed).length;
    return (passed / this.results.length) * 100;
  }
  
  clearResults(): void {
    this.results = [];
  }
}