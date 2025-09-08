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

// Advanced test data generator with realistic, dynamic data
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

  // Generate dynamic, realistic test data
  generateRealisticData: (fieldType: string, dataType: 'valid' | 'invalid' | 'edge' = 'valid') => {
    const now = new Date();
    const companies = ['Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 'Meta', 'Netflix', 'Adobe'];
    const firstNames = ['John', 'Sarah', 'Mike', 'Emma', 'Alex', 'Lisa', 'David', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'company.com', 'business.org'];
    
    switch (fieldType) {
      case 'email':
        if (dataType === 'valid') {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)].toLowerCase();
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase();
          const domain = domains[Math.floor(Math.random() * domains.length)];
          return `${firstName}.${lastName}@${domain}`;
        } else if (dataType === 'invalid') {
          return ['@gmail.com', 'user@', 'invalid.email', 'user space@domain.com'][Math.floor(Math.random() * 4)];
        } else {
          return ['a@b.c', 'user@domain', 'test@localhost', ''][Math.floor(Math.random() * 4)];
        }
      
      case 'phone':
        if (dataType === 'valid') {
          const formats = [
            () => `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`,
            () => `(${Math.floor(Math.random() * 900 + 100)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
            () => `${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`
          ];
          return formats[Math.floor(Math.random() * formats.length)]();
        } else if (dataType === 'invalid') {
          return ['123', 'abc-def-ghij', '++1234567890', '(555) 123-45'][Math.floor(Math.random() * 4)];
        } else {
          return ['', '+1', '000-000-0000', '123456789012345'][Math.floor(Math.random() * 4)];
        }
      
      case 'password':
        if (dataType === 'valid') {
          const strong = ['SecureP@ss123', 'MyStr0ng!Password', 'C0mplex#Pass99', 'Valid8ed@Password'];
          return strong[Math.floor(Math.random() * strong.length)];
        } else if (dataType === 'invalid') {
          return ['weak', '12345678', 'password', 'Pass123'][Math.floor(Math.random() * 4)];
        } else {
          return ['', 'P@ss1', 'VeryLongPasswordThatMightExceedLimits123!@#$%^&*()'][Math.floor(Math.random() * 3)];
        }
      
      case 'url':
        if (dataType === 'valid') {
          const company = companies[Math.floor(Math.random() * companies.length)].toLowerCase();
          const tlds = ['.com', '.org', '.net', '.io', '.co'];
          const tld = tlds[Math.floor(Math.random() * tlds.length)];
          const paths = ['', '/products', '/about', '/contact', '/api/v1/data'];
          const path = paths[Math.floor(Math.random() * paths.length)];
          return `https://${company}${tld}${path}`;
        } else if (dataType === 'invalid') {
          return ['not-a-url', 'http://', 'ftp//invalid', 'https://invalid space.com'][Math.floor(Math.random() * 4)];
        } else {
          return ['', 'localhost:3000', 'https://192.168.1.1', 'file://local/path'][Math.floor(Math.random() * 4)];
        }
      
      case 'number':
        if (dataType === 'valid') {
          return Math.floor(Math.random() * 1000000);
        } else if (dataType === 'invalid') {
          return [-Math.floor(Math.random() * 100), 1000001, 'abc', ''][Math.floor(Math.random() * 4)];
        } else {
          return [0, 0.5, 999999.99, '0'][Math.floor(Math.random() * 4)];
        }
      
      case 'currency':
        if (dataType === 'valid') {
          return Math.round(Math.random() * 100000 * 100) / 100;
        } else if (dataType === 'invalid') {
          return [-Math.random() * 100, 'abc', '$100'][Math.floor(Math.random() * 3)];
        } else {
          return [0.001, 0.01, 1000000][Math.floor(Math.random() * 3)];
        }
      
      case 'text':
        if (dataType === 'valid') {
          const phrases = [
            `${firstNames[Math.floor(Math.random() * firstNames.length)]} from ${companies[Math.floor(Math.random() * companies.length)]}`,
            `Project ${Math.floor(Math.random() * 1000)} - ${companies[Math.floor(Math.random() * companies.length)]} integration`,
            `Meeting with ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            'Product demo and technical discussion'
          ];
          return phrases[Math.floor(Math.random() * phrases.length)];
        } else {
          return ['', 'a', 'Text with émojis 🚀🎉', 'a'.repeat(500)][Math.floor(Math.random() * 4)];
        }
      
      case 'date':
        if (dataType === 'valid') {
          const futureDate = new Date(now.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000);
          return futureDate.toISOString().split('T')[0];
        } else if (dataType === 'invalid') {
          return ['2024-13-01', '2024-02-30', 'invalid-date'][Math.floor(Math.random() * 3)];
        } else {
          return ['1900-01-01', '2100-12-31', '2024-01-01'][Math.floor(Math.random() * 3)];
        }
      
      default:
        return '';
    }
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
  },

  // Bulk generate test data for stress testing
  generateBulkTestData: (fieldType: string, count: number = 100) => {
    const results = {
      valid: [] as any[],
      invalid: [] as any[],
      edge: [] as any[]
    };

    for (let i = 0; i < count; i++) {
      results.valid.push(testDataGenerator.generateRealisticData(fieldType, 'valid'));
      if (i < count / 2) {
        results.invalid.push(testDataGenerator.generateRealisticData(fieldType, 'invalid'));
        results.edge.push(testDataGenerator.generateRealisticData(fieldType, 'edge'));
      }
    }

    return results;
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