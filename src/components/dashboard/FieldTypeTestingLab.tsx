import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { fieldTestScenarios, testDataGenerator, ValidationTestRunner, type ValidationTestResult } from '@/lib/field-testing';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Info,
  TestTube,
  Zap,
  Target,
  Clock,
  Save,
  RotateCcw,
  Play,
  Pause,
  SkipForward,
  ChartBar,
  FlaskConical
} from '@phosphor-icons/react';

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface FieldTestData {
  // Text Fields
  textField: string;
  emailField: string;
  phoneField: string;
  urlField: string;
  passwordField: string;
  
  // Numeric Fields
  numberField: number | '';
  currencyField: number | '';
  percentageField: number | '';
  sliderValue: number[];
  
  // Date/Time Fields
  dateField: string;
  timeField: string;
  datetimeField: string;
  
  // Selection Fields
  selectField: string;
  multiSelectField: string[];
  radioField: string;
  
  // Boolean Fields
  checkboxField: boolean;
  switchField: boolean;
  
  // Text Area
  textareaField: string;
  
  // Advanced Fields
  tagsField: string[];
  colorField: string;
  fileField: File | null;
}

export function FieldTypeTestingLab() {
  const [formData, setFormData] = useKV<FieldTestData>('field-test-data', {
    textField: '',
    emailField: '',
    phoneField: '',
    urlField: '',
    passwordField: '',
    numberField: '',
    currencyField: '',
    percentageField: '',
    sliderValue: [50],
    dateField: '',
    timeField: '',
    datetimeField: '',
    selectField: '',
    multiSelectField: [],
    radioField: '',
    checkboxField: false,
    switchField: false,
    textareaField: '',
    tagsField: [],
    colorField: '#3b82f6',
    fileField: null
  });

  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [newTag, setNewTag] = useState('');
  const [validationCount, setValidationCount] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [testRunner] = useState(() => new ValidationTestRunner());
  const [testResults, setTestResults] = useState<ValidationTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTestScenario, setCurrentTestScenario] = useState<string>('');
  const [autoTestMode, setAutoTestMode] = useState(false);

  // Auto-testing functionality
  const runAutomatedTests = useCallback(async () => {
    setIsRunningTests(true);
    testRunner.clearResults();
    
    for (const scenario of fieldTestScenarios) {
      setCurrentTestScenario(scenario.name);
      
      // Test valid data
      for (const validData of scenario.testData.valid) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI
        await testRunner.runTest(scenario, validData, 'valid');
      }
      
      // Test invalid data
      for (const invalidData of scenario.testData.invalid) {
        await new Promise(resolve => setTimeout(resolve, 100));
        await testRunner.runTest(scenario, invalidData, 'invalid');
      }
      
      // Test edge cases
      for (const edgeData of scenario.testData.edge) {
        await new Promise(resolve => setTimeout(resolve, 100));
        await testRunner.runTest(scenario, edgeData, 'edge');
      }
    }
    
    setTestResults(testRunner.getResults());
    setIsRunningTests(false);
    setCurrentTestScenario('');
    
    const passRate = testRunner.getPassRate();
    toast.success(`Testing complete! Pass rate: ${passRate.toFixed(1)}%`);
  }, [testRunner]);

  // Load test data into form
  const loadTestData = (fieldType: string, testType: 'valid' | 'invalid' | 'edge') => {
    // Use enhanced realistic data generator
    const data = testDataGenerator.generateRealisticData(fieldType, testType);

    // Map field types to form fields
    const fieldMapping: Record<string, keyof FieldTestData> = {
      'email': 'emailField',
      'phone': 'phoneField',
      'password': 'passwordField',
      'number': 'numberField',
      'currency': 'currencyField',
      'url': 'urlField',
      'text': 'textField',
      'date': 'dateField'
    };

    const formField = fieldMapping[fieldType];
    if (formField && data !== undefined) {
      updateField(formField, data);
      toast.info(`Loaded ${testType} test data for ${fieldType}: ${JSON.stringify(data).slice(0, 50)}...`);
    }
  };

  // Load all fields with realistic test data
  const loadAllTestData = (testType: 'valid' | 'invalid' | 'edge') => {
    const fieldTypes = ['text', 'email', 'phone', 'password', 'url', 'number', 'currency', 'date'];
    
    fieldTypes.forEach(fieldType => {
      loadTestData(fieldType, testType);
    });
    
    toast.success(`Loaded ${testType} test data for all fields`);
  };

  // Stress test with bulk data generation
  const runStressTest = async () => {
    setIsRunningTests(true);
    const fieldTypes = ['email', 'phone', 'password', 'url', 'number', 'currency', 'text', 'date'];
    let totalTests = 0;
    let passedTests = 0;

    for (const fieldType of fieldTypes) {
      setCurrentTestScenario(`Stress testing ${fieldType}`);
      const bulkData = testDataGenerator.generateBulkTestData(fieldType, 50);
      
      // Test all generated data
      for (const validData of bulkData.valid) {
        const scenario = fieldTestScenarios.find(s => s.fieldType === fieldType);
        if (scenario) {
          const result = await testRunner.runTest(scenario, validData, 'valid');
          totalTests++;
          if (result.passed) passedTests++;
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(testRunner.getResults());
    setIsRunningTests(false);
    setCurrentTestScenario('');
    
    toast.success(`Stress test complete! ${passedTests}/${totalTests} tests passed (${((passedTests/totalTests) * 100).toFixed(1)}%)`);
  };
  const validateEmail = (email: string): ValidationResult => {
    if (!email) return { isValid: true, message: '', type: 'info' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { isValid: true, message: 'Valid email address', type: 'success' };
    }
    return { isValid: false, message: 'Please enter a valid email address', type: 'error' };
  };

  const validatePhone = (phone: string): ValidationResult => {
    if (!phone) return { isValid: true, message: '', type: 'info' };
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return { isValid: true, message: 'Valid phone number', type: 'success' };
    }
    return { isValid: false, message: 'Please enter a valid phone number', type: 'error' };
  };

  const validateUrl = (url: string): ValidationResult => {
    if (!url) return { isValid: true, message: '', type: 'info' };
    try {
      new URL(url);
      return { isValid: true, message: 'Valid URL', type: 'success' };
    } catch {
      return { isValid: false, message: 'Please enter a valid URL', type: 'error' };
    }
  };

  const validatePassword = (password: string): ValidationResult => {
    if (!password) return { isValid: true, message: '', type: 'info' };
    
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    
    if (passedChecks === 5) {
      return { isValid: true, message: 'Strong password', type: 'success' };
    } else if (passedChecks >= 3) {
      return { isValid: true, message: 'Medium strength password', type: 'warning' };
    } else {
      return { isValid: false, message: 'Password too weak', type: 'error' };
    }
  };

  const validateNumber = (value: number | '', min?: number, max?: number): ValidationResult => {
    if (value === '') return { isValid: true, message: '', type: 'info' };
    
    const num = Number(value);
    if (isNaN(num)) {
      return { isValid: false, message: 'Please enter a valid number', type: 'error' };
    }
    
    if (min !== undefined && num < min) {
      return { isValid: false, message: `Value must be at least ${min}`, type: 'error' };
    }
    
    if (max !== undefined && num > max) {
      return { isValid: false, message: `Value must be at most ${max}`, type: 'error' };
    }
    
    return { isValid: true, message: 'Valid number', type: 'success' };
  };

  const validateRequired = (value: any, fieldName: string): ValidationResult => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { isValid: false, message: `${fieldName} is required`, type: 'error' };
    }
    return { isValid: true, message: `${fieldName} is valid`, type: 'success' };
  };

  // Auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      setTimeout(() => setIsAutoSaving(false), 500);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Real-time validation
  useEffect(() => {
    const results: Record<string, ValidationResult> = {};
    
    results.emailField = validateEmail(formData.emailField);
    results.phoneField = validatePhone(formData.phoneField);
    results.urlField = validateUrl(formData.urlField);
    results.passwordField = validatePassword(formData.passwordField);
    results.numberField = validateNumber(formData.numberField, 0, 1000000);
    results.currencyField = validateNumber(formData.currencyField, 0);
    results.percentageField = validateNumber(formData.percentageField, 0, 100);
    
    setValidationResults(results);
    setValidationCount(prev => prev + 1);
  }, [formData]);

  const updateField = (field: keyof FieldTestData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tagsField.includes(newTag.trim())) {
      updateField('tagsField', [...formData.tagsField, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tagsField', formData.tagsField.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setFormData({
      textField: '',
      emailField: '',
      phoneField: '',
      urlField: '',
      passwordField: '',
      numberField: '',
      currencyField: '',
      percentageField: '',
      sliderValue: [50],
      dateField: '',
      timeField: '',
      datetimeField: '',
      selectField: '',
      multiSelectField: [],
      radioField: '',
      checkboxField: false,
      switchField: false,
      textareaField: '',
      tagsField: [],
      colorField: '#3b82f6',
      fileField: null
    });
    toast.success('Form reset successfully');
  };

  const getValidationIcon = (result: ValidationResult) => {
    switch (result.type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const ValidationIndicator = ({ fieldName }: { fieldName: string }) => {
    const result = validationResults[fieldName];
    if (!result || !result.message) return null;

    return (
      <div className="flex items-center gap-2 mt-1">
        {getValidationIcon(result)}
        <span className={`text-xs ${
          result.type === 'success' ? 'text-green-600' :
          result.type === 'warning' ? 'text-yellow-600' :
          result.type === 'error' ? 'text-red-600' :
          'text-blue-600'
        }`}>
          {result.message}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TestTube className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Field Type Testing Lab</h1>
            <p className="text-muted-foreground">
              Comprehensive testing suite for all form field types with real-time validation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-blue-500" />
            <span>Validations: {validationCount}</span>
          </div>
          
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Save className="h-4 w-4 animate-pulse" />
              <span>Auto-saving...</span>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button onClick={() => loadAllTestData('valid')} variant="outline" size="sm" className="text-green-600">
              Load All Valid
            </Button>
            <Button onClick={() => loadAllTestData('invalid')} variant="outline" size="sm" className="text-red-600">
              Load All Invalid
            </Button>
            <Button onClick={() => loadAllTestData('edge')} variant="outline" size="sm" className="text-yellow-600">
              Load All Edge
            </Button>
          </div>
          
          <Button onClick={resetForm} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Form
          </Button>
        </div>
      </div>

      <Tabs defaultValue="text-fields" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="text-fields">Text Fields</TabsTrigger>
          <TabsTrigger value="numeric-fields">Numeric</TabsTrigger>
          <TabsTrigger value="selection-fields">Selection</TabsTrigger>
          <TabsTrigger value="date-time">Date/Time</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="playground">Live Playground</TabsTrigger>
          <TabsTrigger value="testing">Auto Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="text-fields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Text Input Fields</CardTitle>
              <CardDescription>
                Various text input types with validation patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="text-field">Basic Text Input</Label>
                  <Input
                    id="text-field"
                    placeholder="Enter any text..."
                    value={formData.textField}
                    onChange={(e) => updateField('textField', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Length: {formData.textField.length} characters
                  </p>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-field">Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email-field"
                        type="email"
                        placeholder="user@example.com"
                        value={formData.emailField}
                        onChange={(e) => updateField('emailField', e.target.value)}
                        className={validationResults.emailField?.isValid === false ? 'border-red-500' : ''}
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => loadTestData('email', 'valid')}>
                          ✓
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => loadTestData('email', 'invalid')}>
                          ✗
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => loadTestData('email', 'edge')}>
                          ~
                        </Button>
                      </div>
                    </div>
                    <ValidationIndicator fieldName="emailField" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-field">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone-field"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phoneField}
                        onChange={(e) => updateField('phoneField', e.target.value)}
                        className={validationResults.phoneField?.isValid === false ? 'border-red-500' : ''}
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => loadTestData('phone', 'valid')}>
                          ✓
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => loadTestData('phone', 'invalid')}>
                          ✗
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => loadTestData('phone', 'edge')}>
                          ~
                        </Button>
                      </div>
                    </div>
                    <ValidationIndicator fieldName="phoneField" />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="url-field">Website URL</Label>
                  <Input
                    id="url-field"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.urlField}
                    onChange={(e) => updateField('urlField', e.target.value)}
                    className={validationResults.urlField?.isValid === false ? 'border-red-500' : ''}
                  />
                  <ValidationIndicator fieldName="urlField" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password-field">Password</Label>
                  <Input
                    id="password-field"
                    type="password"
                    placeholder="Enter a secure password"
                    value={formData.passwordField}
                    onChange={(e) => updateField('passwordField', e.target.value)}
                    className={validationResults.passwordField?.isValid === false ? 'border-red-500' : ''}
                  />
                  <ValidationIndicator fieldName="passwordField" />
                  {formData.passwordField && (
                    <div className="space-y-1">
                      <div className="flex gap-2 text-xs">
                        <Badge variant={formData.passwordField.length >= 8 ? 'default' : 'secondary'}>
                          8+ chars
                        </Badge>
                        <Badge variant={/[A-Z]/.test(formData.passwordField) ? 'default' : 'secondary'}>
                          Uppercase
                        </Badge>
                        <Badge variant={/[a-z]/.test(formData.passwordField) ? 'default' : 'secondary'}>
                          Lowercase
                        </Badge>
                        <Badge variant={/\d/.test(formData.passwordField) ? 'default' : 'secondary'}>
                          Numbers
                        </Badge>
                        <Badge variant={/[!@#$%^&*(),.?":{}|<>]/.test(formData.passwordField) ? 'default' : 'secondary'}>
                          Special
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="textarea-field">Long Text Area</Label>
                  <Textarea
                    id="textarea-field"
                    placeholder="Enter a longer description..."
                    value={formData.textareaField}
                    onChange={(e) => updateField('textareaField', e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Words: {formData.textareaField.split(' ').filter(w => w.length > 0).length} | 
                    Characters: {formData.textareaField.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="numeric-fields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Numeric Input Fields</CardTitle>
              <CardDescription>
                Number inputs with validation and formatting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="number-field">Basic Number</Label>
                  <Input
                    id="number-field"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="1000000"
                    value={formData.numberField}
                    onChange={(e) => updateField('numberField', e.target.value === '' ? '' : Number(e.target.value))}
                    className={validationResults.numberField?.isValid === false ? 'border-red-500' : ''}
                  />
                  <ValidationIndicator fieldName="numberField" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency-field">Currency Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="currency-field"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className={`pl-8 ${validationResults.currencyField?.isValid === false ? 'border-red-500' : ''}`}
                      value={formData.currencyField}
                      onChange={(e) => updateField('currencyField', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                  </div>
                  <ValidationIndicator fieldName="currencyField" />
                  {typeof formData.currencyField === 'number' && (
                    <p className="text-xs text-muted-foreground">
                      Formatted: ${formData.currencyField.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="percentage-field">Percentage</Label>
                  <div className="relative">
                    <Input
                      id="percentage-field"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      className={`pr-8 ${validationResults.percentageField?.isValid === false ? 'border-red-500' : ''}`}
                      value={formData.percentageField}
                      onChange={(e) => updateField('percentageField', e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                  <ValidationIndicator fieldName="percentageField" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slider-field">Slider Value: {formData.sliderValue[0]}</Label>
                  <Slider
                    id="slider-field"
                    min={0}
                    max={100}
                    step={1}
                    value={formData.sliderValue}
                    onValueChange={(value) => updateField('sliderValue', value)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selection-fields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selection Fields</CardTitle>
              <CardDescription>
                Various selection input types and toggles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="select-field">Dropdown Select</Label>
                  <Select value={formData.selectField} onValueChange={(value) => updateField('selectField', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="option1">Option 1</SelectItem>
                      <SelectItem value="option2">Option 2</SelectItem>
                      <SelectItem value="option3">Option 3</SelectItem>
                      <SelectItem value="option4">Option 4</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.selectField && (
                    <p className="text-xs text-green-600">Selected: {formData.selectField}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Radio Button Group</Label>
                  <RadioGroup value={formData.radioField} onValueChange={(value) => updateField('radioField', value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radio1" id="radio1" />
                      <Label htmlFor="radio1">Radio Option 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radio2" id="radio2" />
                      <Label htmlFor="radio2">Radio Option 2</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="radio3" id="radio3" />
                      <Label htmlFor="radio3">Radio Option 3</Label>
                    </div>
                  </RadioGroup>
                  {formData.radioField && (
                    <p className="text-xs text-green-600">Selected: {formData.radioField}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checkbox-field"
                      checked={formData.checkboxField}
                      onCheckedChange={(checked) => updateField('checkboxField', checked)}
                    />
                    <Label htmlFor="checkbox-field">Checkbox Option</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Status: {formData.checkboxField ? 'Checked' : 'Unchecked'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="switch-field"
                      checked={formData.switchField}
                      onCheckedChange={(checked) => updateField('switchField', checked)}
                    />
                    <Label htmlFor="switch-field">Toggle Switch</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    State: {formData.switchField ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="date-time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Date and Time Fields</CardTitle>
              <CardDescription>
                Date, time, and datetime input controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date-field">Date</Label>
                  <Input
                    id="date-field"
                    type="date"
                    value={formData.dateField}
                    onChange={(e) => updateField('dateField', e.target.value)}
                  />
                  {formData.dateField && (
                    <p className="text-xs text-green-600">
                      Formatted: {new Date(formData.dateField).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-field">Time</Label>
                  <Input
                    id="time-field"
                    type="time"
                    value={formData.timeField}
                    onChange={(e) => updateField('timeField', e.target.value)}
                  />
                  {formData.timeField && (
                    <p className="text-xs text-green-600">
                      12-hour format: {new Date(`2000-01-01T${formData.timeField}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datetime-field">Date & Time</Label>
                  <Input
                    id="datetime-field"
                    type="datetime-local"
                    value={formData.datetimeField}
                    onChange={(e) => updateField('datetimeField', e.target.value)}
                  />
                  {formData.datetimeField && (
                    <p className="text-xs text-green-600">
                      Formatted: {new Date(formData.datetimeField).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Fields</CardTitle>
              <CardDescription>
                Complex input types and custom components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Tags Field</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button onClick={addTag} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tagsField.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total tags: {formData.tagsField.length}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-field">Color Picker</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="color-field"
                      type="color"
                      value={formData.colorField}
                      onChange={(e) => updateField('colorField', e.target.value)}
                      className="w-20 h-10"
                    />
                    <div 
                      className="w-20 h-10 rounded border"
                      style={{ backgroundColor: formData.colorField }}
                    />
                    <span className="text-sm font-mono">{formData.colorField}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Field Statistics</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">Validations</p>
                            <p className="text-2xl font-bold">{validationCount}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">Valid Fields</p>
                            <p className="text-2xl font-bold">
                              {Object.values(validationResults).filter(r => r.isValid).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="text-sm font-medium">Invalid Fields</p>
                            <p className="text-2xl font-bold">
                              {Object.values(validationResults).filter(r => !r.isValid).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <div>
                            <p className="text-sm font-medium">Auto-saves</p>
                            <p className="text-2xl font-bold">∞</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="playground" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Testing Playground</CardTitle>
              <CardDescription>
                Interactive field testing with real-time feedback and instant data generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fieldTestScenarios.map((scenario) => (
                  <Card key={scenario.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{scenario.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {scenario.fieldType}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {scenario.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Input
                          placeholder={`Test ${scenario.fieldType} input...`}
                          onChange={(e) => {
                            const fieldMapping: Record<string, keyof FieldTestData> = {
                              'email': 'emailField',
                              'phone': 'phoneField',
                              'password': 'passwordField',
                              'number': 'numberField',
                              'currency': 'currencyField',
                              'url': 'urlField',
                              'text': 'textField',
                              'date': 'dateField'
                            };
                            const formField = fieldMapping[scenario.fieldType];
                            if (formField) {
                              updateField(formField, e.target.value);
                            }
                          }}
                          className="text-sm"
                        />
                        
                        <div className="grid grid-cols-3 gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7 text-green-600 hover:bg-green-50"
                            onClick={() => {
                              const data = testDataGenerator.generateRealisticData(scenario.fieldType, 'valid');
                              const fieldMapping: Record<string, keyof FieldTestData> = {
                                'email': 'emailField',
                                'phone': 'phoneField',
                                'password': 'passwordField',
                                'number': 'numberField',
                                'currency': 'currencyField',
                                'url': 'urlField',
                                'text': 'textField',
                                'date': 'dateField'
                              };
                              const formField = fieldMapping[scenario.fieldType];
                              if (formField) {
                                updateField(formField, data);
                              }
                            }}
                          >
                            ✓ Valid
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              const data = testDataGenerator.generateRealisticData(scenario.fieldType, 'invalid');
                              const fieldMapping: Record<string, keyof FieldTestData> = {
                                'email': 'emailField',
                                'phone': 'phoneField',
                                'password': 'passwordField',
                                'number': 'numberField',
                                'currency': 'currencyField',
                                'url': 'urlField',
                                'text': 'textField',
                                'date': 'dateField'
                              };
                              const formField = fieldMapping[scenario.fieldType];
                              if (formField) {
                                updateField(formField, data);
                              }
                            }}
                          >
                            ✗ Invalid
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7 text-yellow-600 hover:bg-yellow-50"
                            onClick={() => {
                              const data = testDataGenerator.generateRealisticData(scenario.fieldType, 'edge');
                              const fieldMapping: Record<string, keyof FieldTestData> = {
                                'email': 'emailField',
                                'phone': 'phoneField',
                                'password': 'passwordField',
                                'number': 'numberField',
                                'currency': 'currencyField',
                                'url': 'urlField',
                                'text': 'textField',
                                'date': 'dateField'
                              };
                              const formField = fieldMapping[scenario.fieldType];
                              if (formField) {
                                updateField(formField, data);
                              }
                            }}
                          >
                            ~ Edge
                          </Button>
                        </div>
                      </div>
                      
                      {/* Real-time validation display */}
                      <div className="space-y-1">
                        {(() => {
                          const fieldMapping: Record<string, keyof FieldTestData> = {
                            'email': 'emailField',
                            'phone': 'phoneField',
                            'password': 'passwordField',
                            'number': 'numberField',
                            'currency': 'currencyField',
                            'url': 'urlField',
                            'text': 'textField',
                            'date': 'dateField'
                          };
                          const formField = fieldMapping[scenario.fieldType];
                          const currentValue = formField ? formData[formField] : '';
                          const validation = validationResults[formField || ''];
                          
                          if (validation && currentValue) {
                            return (
                              <div className={`text-xs p-2 rounded border ${
                                validation.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                                validation.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                validation.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                                'bg-blue-50 border-blue-200 text-blue-700'
                              }`}>
                                <div className="flex items-center gap-2">
                                  {getValidationIcon(validation)}
                                  <span className="font-medium">{validation.message}</span>
                                </div>
                                <div className="mt-1 opacity-75">
                                  Current: {JSON.stringify(currentValue).slice(0, 30)}...
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="font-medium text-muted-foreground">Expected Behavior:</div>
                        <div className="text-muted-foreground">{scenario.expectedBehavior}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-semibold">Interactive Tests</div>
                      <div className="text-2xl font-bold">{fieldTestScenarios.length}</div>
                      <div className="text-xs text-muted-foreground">Available scenarios</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-semibold">Valid Fields</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(validationResults).filter(r => r.isValid).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Currently valid</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="font-semibold">Invalid Fields</div>
                      <div className="text-2xl font-bold text-red-600">
                        {Object.values(validationResults).filter(r => !r.isValid).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Need attention</div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-semibold">Real-time</div>
                      <div className="text-2xl font-bold text-purple-600">{validationCount}</div>
                      <div className="text-xs text-muted-foreground">Validations run</div>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automated Field Testing</CardTitle>
              <CardDescription>
                Run comprehensive validation tests across all field types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button 
                      onClick={runAutomatedTests} 
                      disabled={isRunningTests}
                      className="flex items-center gap-2"
                    >
                      {isRunningTests ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Running Tests...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Run All Tests
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={runStressTest} 
                      disabled={isRunningTests}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isRunningTests ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Stress Testing...
                        </>
                      ) : (
                        <>
                          <FlaskConical className="h-4 w-4" />
                          Stress Test (50x each)
                        </>
                      )}
                    </Button>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autoTestMode}
                      onCheckedChange={setAutoTestMode}
                    />
                    <Label>Auto-populate test data</Label>
                  </div>
                </div>
                
                {testResults.length > 0 && (
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="flex items-center gap-2">
                      <ChartBar className="h-3 w-3" />
                      Pass Rate: {testRunner.getPassRate().toFixed(1)}%
                    </Badge>
                    <Badge variant="outline">
                      {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                    </Badge>
                  </div>
                )}
              </div>

              {isRunningTests && currentTestScenario && (
                <Alert>
                  <FlaskConical className="h-4 w-4" />
                  <AlertDescription>
                    Currently testing: {currentTestScenario}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fieldTestScenarios.map((scenario) => (
                  <Card key={scenario.id} className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{scenario.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {scenario.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => loadTestData(scenario.fieldType, 'valid')}
                        >
                          ✓ Valid
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => loadTestData(scenario.fieldType, 'invalid')}
                        >
                          ✗ Invalid
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs"
                          onClick={() => loadTestData(scenario.fieldType, 'edge')}
                        >
                          ~ Edge
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Test Data:</p>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Valid:</span>
                            <Badge variant="secondary" className="h-4 text-xs">
                              {scenario.testData.valid.length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Invalid:</span>
                            <Badge variant="secondary" className="h-4 text-xs">
                              {scenario.testData.invalid.length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Edge:</span>
                            <Badge variant="secondary" className="h-4 text-xs">
                              {scenario.testData.edge.length}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>
                      Detailed results from the latest test run
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {testResults.filter(r => r.passed).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {testResults.filter(r => !r.passed).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {testResults.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {testRunner.getPassRate().toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">Pass Rate</div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2 max-h-64 overflow-auto">
                        {testResults.slice(-20).reverse().map((result, index) => (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between p-2 rounded text-sm border ${
                              result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className="font-medium">{result.fieldType}</span>
                              <Badge variant="outline" className="text-xs">
                                {result.expected}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-white px-1 rounded">
                                {JSON.stringify(result.testData).slice(0, 30)}...
                              </code>
                              <span className="text-xs text-muted-foreground">
                                {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          All form data is automatically saved to persistent storage and will be restored when you return to this page.
          Form validation happens in real-time as you type, providing immediate feedback.
        </AlertDescription>
      </Alert>
    </div>
  );
}