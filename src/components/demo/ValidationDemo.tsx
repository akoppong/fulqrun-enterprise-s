import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreateOpportunityForm } from '@/components/forms/CreateOpportunityForm';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedForm } from '@/components/ui/validated-form';
import { ValidationSchema } from '@/lib/validation';
import { errorHandler } from '@/lib/error-handling';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Code,
  Lightbulb,
  Target,
  ShieldCheck
} from '@phosphor-icons/react';
import { toast } from 'sonner';

// Simple validation schema for testing
const testValidationSchema: ValidationSchema = {
  email: {
    required: true,
    email: true
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return 'Password must contain uppercase, lowercase, and number';
      }
      return null;
    }
  },
  age: {
    required: true,
    min: 18,
    max: 120,
    custom: (value: number) => {
      if (value > 65) {
        return 'Please verify age for senior eligibility';
      }
      return null;
    }
  },
  website: {
    url: true
  }
};

export function ValidationDemo() {
  const [validationResults, setValidationResults] = useState<string[]>([]);

  const handleTestFormSubmit = async (data: Record<string, any>, { setSubmitting, setError }: any) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different outcomes based on email
    if (data.email === 'error@test.com') {
      setError('Simulated server error for testing');
      return;
    }
    
    if (data.email === 'network@test.com') {
      const networkError = new Error('Network connection failed');
      errorHandler.handleNetworkError(networkError, { form: 'test' });
      setError('Network error occurred');
      return;
    }

    toast.success('Test form submitted successfully!', {
      description: 'All validations passed and data was processed.'
    });

    setValidationResults([
      `✓ Email: ${data.email}`,
      `✓ Password: ${data.password?.length} characters`,
      `✓ Age: ${data.age}`,
      `✓ Website: ${data.website || 'Not provided'}`
    ]);
  };

  const handleOpportunitySubmit = async (opportunity: any) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Log opportunity creation for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Opportunity created:', opportunity);
    }
    toast.success('Demo opportunity created!', {
      description: 'This is a demonstration - no data was actually saved.'
    });
  };

  const testErrorHandling = () => {
    const errorTypes = [
      { type: 'low', message: 'This is a low severity info message' },
      { type: 'medium', message: 'This is a medium severity warning' },
      { type: 'high', message: 'This is a high severity error' },
      { type: 'validation', message: 'Test validation error' },
      { type: 'network', message: 'Test network error' },
      { type: 'permission', message: 'Test permission error' }
    ];

    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    switch (randomError.type) {
      case 'low':
        errorHandler.handleError(randomError.message, 'low');
        break;
      case 'medium':
        errorHandler.handleError(randomError.message, 'medium');
        break;
      case 'high':
        errorHandler.handleError(randomError.message, 'high');
        break;
      case 'validation':
        errorHandler.handleValidationErrors([
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too weak' }
        ]);
        break;
      case 'network':
        errorHandler.handleNetworkError(new Error('Connection timeout'));
        break;
      case 'permission':
        errorHandler.handlePermissionError('delete this resource', 'customer data');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Form Validation & Error Handling Demo
            </CardTitle>
            <p className="text-muted-foreground">
              Comprehensive validation system with real-time feedback and robust error handling
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="simple">Simple Form</TabsTrigger>
            <TabsTrigger value="complex">Complex Form</TabsTrigger>
            <TabsTrigger value="errors">Error Handling</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real-time Validation</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Instant feedback as users type with debounced validation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Recovery</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Graceful error handling with user-friendly messages
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    WCAG compliant with proper ARIA labels and keyboard navigation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Type Safe</CardTitle>
                  <Code className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Full TypeScript support with type-safe validation schemas
                  </p>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Try it out:</strong> Use the forms below to test validation, error handling, 
                and see real-time feedback. Try invalid inputs, network simulation, and form submission.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="simple" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  Simple Validation Test
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ValidatedForm
                  schema={testValidationSchema}
                  initialData={{ email: '', password: '', age: '', website: '' }}
                  onSubmit={handleTestFormSubmit}
                  submitText="Test Validation"
                  validateOnChange={false}
                >
                  {({ data, setData, getFieldError }) => (
                    <div className="space-y-4">
                      <ValidatedInput
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="test@example.com (try 'error@test.com' or 'network@test.com')"
                        value={data.email || ''}
                        onChange={(value) => setData('email', value)}
                        error={getFieldError('email')}
                        validation={{ required: true, email: true }}
                      />

                      <ValidatedInput
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Must have uppercase, lowercase, and number"
                        value={data.password || ''}
                        onChange={(value) => setData('password', value)}
                        error={getFieldError('password')}
                        validation={{
                          required: true,
                          minLength: 8,
                          custom: (value: string) => {
                            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                              return 'Password must contain uppercase, lowercase, and number';
                            }
                            return null;
                          }
                        }}
                      />

                      <ValidatedInput
                        id="age"
                        label="Age"
                        type="number"
                        placeholder="18-120 (try >65 for warning)"
                        value={data.age || ''}
                        onChange={(value) => setData('age', value)}
                        error={getFieldError('age')}
                        validation={{
                          required: true,
                          min: 18,
                          max: 120
                        }}
                      />

                      <ValidatedInput
                        id="website"
                        label="Website (Optional)"
                        type="url"
                        placeholder="https://example.com"
                        value={data.website || ''}
                        onChange={(value) => setData('website', value)}
                        error={getFieldError('website')}
                        validation={{ url: true }}
                      />
                    </div>
                  )}
                </ValidatedForm>

                {validationResults.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-sm">Validation Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {validationResults.map((result, index) => (
                          <p key={index} className="text-sm font-mono text-green-600">{result}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complex" className="space-y-6">
            <CreateOpportunityForm
              onSubmit={handleOpportunitySubmit}
              initialData={{
                title: 'Demo Opportunity',
                stage: 'qualification',
                priority: 'medium'
              }}
            />
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Handling Testing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Test different error scenarios and see how the system handles them.
                    Errors will be logged to the console and displayed to users appropriately.
                  </AlertDescription>
                </Alert>

                <Button onClick={testErrorHandling} className="w-full">
                  Trigger Random Error
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => errorHandler.handleValidationErrors([
                      { field: 'email', message: 'Invalid email format' },
                      { field: 'name', message: 'Name is required' },
                      { field: 'phone', message: 'Phone number is invalid' }
                    ])}
                  >
                    Test Validation Errors
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => errorHandler.handlePermissionError('delete', 'customer data')}
                  >
                    Test Permission Error
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Error History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        const history = errorHandler.getErrorHistory();
                        if (process.env.NODE_ENV === 'development') {
                          console.log('Error History:', history);
                        }
                        toast.info(`${history.length} errors logged. Check console for details.`);
                      }}
                    >
                      View Error History ({errorHandler.getErrorHistory().length})
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Validation Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Real-time validation with debouncing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Custom validation rules and messages
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Field-level and form-level validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Visual validation state indicators
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Date, email, URL, and pattern validation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Nested object validation support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Error Handling Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Severity-based error classification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      User-friendly error messages
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Network and API error handling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Global error boundary integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Error logging and reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Toast notifications with actions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}