import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useKV } from '@github/spark/hooks';
import { 
  ClipboardList, 
  CheckCircle, 
  RefreshCw,
  Database,
  Clock,
  AlertCircle,
  Info,
  ArrowRight,
  FloppyDisk
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface TestStep {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  expectedResult: string;
  completed: boolean;
}

export function AutoSaveTesting() {
  // Test form data
  const [testData, setTestData, deleteTestData] = useKV('manual_test_form', {
    name: '',
    email: '',
    message: '',
    priority: 'medium'
  });

  // Test steps state
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  // Form state for testing
  const [formState, setFormState] = useState(testData || {
    name: '',
    email: '',
    message: '',
    priority: 'medium'
  });

  // Auto-save simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setTestData(formState);
    }, 2000); // 2 second delay like real auto-save

    return () => clearTimeout(timer);
  }, [formState, setTestData]);

  const testSteps: TestStep[] = [
    {
      id: 'step1',
      title: 'Initialize Form',
      description: 'Test initial form state and auto-save setup',
      instructions: [
        'Observe the form is empty initially',
        'Check that auto-save indicator shows "Ready to save"',
        'Verify no draft exists yet'
      ],
      expectedResult: 'Form loads empty with auto-save ready',
      completed: false
    },
    {
      id: 'step2', 
      title: 'Enter Data',
      description: 'Test typing and auto-save trigger',
      instructions: [
        'Type your name in the "Name" field',
        'Enter an email address',
        'Add a message in the textarea',
        'Wait 2+ seconds after typing'
      ],
      expectedResult: 'Data appears in form and "Draft saved" notification shows',
      completed: false
    },
    {
      id: 'step3',
      title: 'Verify Persistence',
      description: 'Confirm data is saved to storage',
      instructions: [
        'Look at the "Current Draft State" section below',
        'Confirm your entered data appears in the JSON',
        'Check the timestamp shows recent save time'
      ],
      expectedResult: 'JSON shows your form data with recent timestamp',
      completed: false
    },
    {
      id: 'step4',
      title: 'Simulate Page Refresh',
      description: 'Test draft recovery after browser refresh',
      instructions: [
        'Click "Simulate Refresh" button below',
        'This will reset form state but keep saved draft',
        'Observe if form data is restored from draft'
      ],
      expectedResult: 'Form data restored from saved draft automatically',
      completed: false
    },
    {
      id: 'step5',
      title: 'Clear Draft',
      description: 'Test draft removal functionality',
      instructions: [
        'Click "Clear Draft" button',
        'Check that form becomes empty',
        'Verify draft state shows "null"'
      ],
      expectedResult: 'Form cleared and draft removed from storage',
      completed: false
    }
  ];

  const updateFormField = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const simulateRefresh = () => {
    // Reset form state but keep the saved draft
    setFormState({
      name: '',
      email: '',
      message: '',
      priority: 'medium'
    });

    // Then restore from saved draft after a short delay
    setTimeout(() => {
      if (testData) {
        setFormState(testData);
        toast.success('Draft restored after refresh simulation!');
      }
    }, 1000);

    toast.info('Simulating page refresh...');
  };

  const clearDraft = () => {
    deleteTestData();
    setFormState({
      name: '',
      email: '',
      message: '', 
      priority: 'medium'
    });
    toast.success('Draft cleared successfully');
  };

  const markStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex < testSteps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const resetTest = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    clearDraft();
    toast.info('Test reset - ready to start over');
  };

  const hasFormData = Object.values(formState).some(value => 
    value !== '' && value !== 'medium'
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList size={24} className="text-primary" />
            Auto-Save Manual Testing Guide
          </CardTitle>
          <CardDescription>
            Follow these steps to manually test and verify auto-save functionality.
            Each step validates different aspects of draft persistence.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {testSteps.length} • {completedSteps.size} completed
            </div>
            <Button onClick={resetTest} variant="outline" size="sm">
              <RefreshCw size={14} className="mr-1" />
              Reset Test
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {testSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`p-3 rounded border text-center transition-colors ${
                  completedSteps.has(index) 
                    ? 'bg-green-50 border-green-200'
                    : currentStep === index 
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-muted border-border'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {completedSteps.has(index) ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      currentStep === index ? 'border-blue-500' : 'border-muted-foreground'
                    }`} />
                  )}
                </div>
                <div className="text-xs font-medium">{step.title}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
              {currentStep + 1}
            </div>
            {testSteps[currentStep]?.title}
          </CardTitle>
          <CardDescription>
            {testSteps[currentStep]?.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Info size={16} />
            <AlertDescription className="space-y-2">
              <div className="font-medium">Instructions:</div>
              <ul className="list-decimal list-inside space-y-1 ml-4">
                {testSteps[currentStep]?.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle size={16} />
            <AlertDescription>
              <div className="font-medium">Expected Result:</div>
              <div>{testSteps[currentStep]?.expectedResult}</div>
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button 
              onClick={() => markStepComplete(currentStep)}
              disabled={completedSteps.has(currentStep)}
              size="sm"
            >
              {completedSteps.has(currentStep) ? (
                <>
                  <CheckCircle size={14} className="mr-1" />
                  Completed
                </>
              ) : (
                <>
                  Mark Complete
                  <ArrowRight size={14} className="ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FloppyDisk size={20} />
            Test Form
            {hasFormData && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Has Data
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Use this form to test auto-save functionality. Changes are automatically saved after 2 seconds.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Name</Label>
              <Input
                id="test-name"
                value={formState.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                value={formState.email}
                onChange={(e) => updateFormField('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="test-message">Message</Label>
            <Textarea
              id="test-message"
              value={formState.message}
              onChange={(e) => updateFormField('message', e.target.value)}
              placeholder="Type a message to test auto-save..."
              rows={4}
            />
          </div>

          <Separator />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {hasFormData ? (
                <span className="text-green-600">
                  ✓ Form has data - auto-save will trigger
                </span>
              ) : (
                <span>Form is empty - no auto-save needed</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={simulateRefresh} variant="outline" size="sm">
                <RefreshCw size={14} className="mr-1" />
                Simulate Refresh
              </Button>
              
              <Button onClick={clearDraft} variant="outline" size="sm">
                Clear Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Draft State Inspector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            Current Draft State
          </CardTitle>
          <CardDescription>
            Real-time view of saved draft data in persistent storage
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">Saved Draft Data:</h4>
                {testData ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Draft Exists
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    No Draft
                  </Badge>
                )}
              </div>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {testData ? JSON.stringify(testData, null, 2) : 'null'}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Current Form State:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                {JSON.stringify(formState, null, 2)}
              </pre>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                Last Updated: {new Date().toLocaleTimeString()}
              </div>
              
              <div className="flex items-center gap-1">
                <Database size={14} />
                Storage: useKV persistent
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {completedSteps.size === testSteps.length && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle size={24} />
              All Tests Completed! 
            </CardTitle>
            <CardDescription className="text-green-700">
              Congratulations! You have successfully validated all auto-save functionality. 
              The system properly saves, persists, and recovers form drafts.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}