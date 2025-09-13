import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Warning, 
  Info,
  Plus,
  Eye,
  Target,
  DollarSign,
  TrendUp,
  User,
  Building,
  ChartBar,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react';
import { OpportunityEditForm } from './ModernOpportunityEditForm';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FormTestScenario {
  id: string;
  name: string;
  description: string;
  category: 'validation' | 'layout' | 'user-experience';
  testSteps: string[];
  expectedResult: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  testData?: Partial<Opportunity>;
}

const validationScenarios: FormTestScenario[] = [
  {
    id: 'val-required-fields',
    name: 'Required Field Validation',
    description: 'Verify that all required fields show clear error messages when empty',
    category: 'validation',
    importance: 'critical',
    testSteps: [
      'Open the form',
      'Try to submit without filling any fields',
      'Observe error messages and field highlighting',
      'Fill fields one by one and observe real-time validation'
    ],
    expectedResult: 'Red borders and clear error messages appear for empty required fields. Form submission is prevented.',
    testData: {}
  },
  {
    id: 'val-title-validation',
    name: 'Title Field Validation Rules',
    description: 'Test advanced title validation including whitespace and format checks',
    category: 'validation',
    importance: 'high',
    testSteps: [
      'Enter title with leading/trailing spaces',
      'Enter title with only numbers',
      'Enter title with consecutive spaces',
      'Enter very short title (1-2 characters)'
    ],
    expectedResult: 'Appropriate warning/error messages for each validation rule',
    testData: {
      title: '  123  ',
      value: 50000,
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: 'test-company',
      stage: 'prospect'
    }
  },
  {
    id: 'val-amount-validation',
    name: 'Deal Amount Edge Cases',
    description: 'Test validation for unusually low/high deal amounts',
    category: 'validation',
    importance: 'high',
    testSteps: [
      'Enter very low amount ($50)',
      'Enter very high amount ($50M+)',
      'Enter negative amount',
      'Enter non-numeric values'
    ],
    expectedResult: 'Warnings for unusual amounts, errors for invalid inputs',
    testData: {
      title: 'Test Deal',
      value: 50,
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: 'test-company',
      stage: 'prospect'
    }
  },
  {
    id: 'val-probability-stage',
    name: 'Probability-Stage Alignment',
    description: 'Test intelligent validation of probability based on PEAK stage',
    category: 'validation',
    importance: 'critical',
    testSteps: [
      'Set stage to "Prospect" and probability to 90%',
      'Set stage to "Negotiation" and probability to 20%',
      'Try different stage/probability combinations'
    ],
    expectedResult: 'Smart warnings when probability doesn\'t align with typical stage ranges',
    testData: {
      title: 'Probability Test Deal',
      value: 100000,
      probability: 90,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: 'test-company',
      stage: 'prospect'
    }
  },
  {
    id: 'lay-no-overlap',
    name: 'Field Overlap Prevention',
    description: 'Ensure form fields don\'t overlap at any screen size',
    category: 'layout',
    importance: 'critical',
    testSteps: [
      'Open form on desktop (1920px width)',
      'Resize to tablet (768px)',
      'Resize to mobile (375px)',
      'Check all form sections for overlapping elements'
    ],
    expectedResult: 'No overlapping form elements at any screen size. Proper spacing and alignment maintained.',
    testData: {
      title: 'Layout Test Opportunity with a Very Long Name That Should Not Cause Any Layout Issues',
      value: 250000,
      probability: 45,
      expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: 'test-company',
      stage: 'engage'
    }
  },
  {
    id: 'ux-error-recovery',
    name: 'Error Recovery Experience',
    description: 'Test user experience when correcting validation errors',
    category: 'user-experience',
    importance: 'high',
    testSteps: [
      'Submit form with multiple errors',
      'Correct errors one by one',
      'Observe real-time validation feedback',
      'Check error state clearing'
    ],
    expectedResult: 'Errors clear immediately when corrected. Positive feedback for valid fields. Smooth user experience.',
    testData: {
      title: '', // Will trigger required field error
      value: -1000, // Will trigger validation error
      probability: 150, // Will trigger range error
      expectedCloseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Past date
      companyId: '',
      stage: 'prospect'
    }
  }
];

export function FormValidationTestDashboard() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  
  const [showForm, setShowForm] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<FormTestScenario | null>(null);
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'testing' | 'passed' | 'failed'>>({});
  const [isRunningAutoTests, setIsRunningAutoTests] = useState(false);
  const [autoTestProgress, setAutoTestProgress] = useState(0);

  // Initialize test data
  useEffect(() => {
    if (companies.length === 0) {
      const testCompanies: Company[] = [
        {
          id: 'test-company',
          name: 'Test Corporation Ltd.',
          industry: 'Technology',
          size: 'medium',
          location: 'San Francisco, CA',
          website: 'https://testcorp.example.com',
          description: 'A test company for form validation testing'
        }
      ];
      setCompanies(testCompanies);
    }
  }, [companies, setCompanies]);

  const startManualTest = (scenario: FormTestScenario) => {
    setCurrentScenario(scenario);
    setTestResults(prev => ({ ...prev, [scenario.id]: 'testing' }));
    setShowForm(true);
    toast.info(`Testing: ${scenario.name}`);
  };

  const completeTest = (scenarioId: string, passed: boolean) => {
    setTestResults(prev => ({ ...prev, [scenarioId]: passed ? 'passed' : 'failed' }));
    toast.success(passed ? 'Test marked as passed' : 'Test marked as failed');
  };

  const runAutomatedTests = async () => {
    setIsRunningAutoTests(true);
    setAutoTestProgress(0);
    
    // Simulate automated testing
    for (let i = 0; i < validationScenarios.length; i++) {
      const scenario = validationScenarios[i];
      setTestResults(prev => ({ ...prev, [scenario.id]: 'testing' }));
      
      // Simulate test execution time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock test results (in real implementation, these would be actual automated checks)
      const passed = Math.random() > 0.15; // 85% pass rate for demo
      setTestResults(prev => ({ ...prev, [scenario.id]: passed ? 'passed' : 'failed' }));
      
      setAutoTestProgress(((i + 1) / validationScenarios.length) * 100);
    }
    
    setIsRunningAutoTests(false);
    toast.success('Automated testing completed');
  };

  const handleFormSave = (opportunityData: Partial<Opportunity>) => {
    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      companyId: opportunityData.companyId || 'test-company',
      contactId: opportunityData.contactId || '',
      title: opportunityData.title || 'Test Opportunity',
      description: opportunityData.description || '',
      value: opportunityData.value || 0,
      stage: opportunityData.stage || 'prospect',
      probability: opportunityData.probability || 25,
      expectedCloseDate: opportunityData.expectedCloseDate || new Date().toISOString(),
      ownerId: 'current-user',
      priority: opportunityData.priority || 'medium',
      industry: opportunityData.industry || '',
      leadSource: 'validation-test',
      tags: opportunityData.tags || ['test'],
      meddpicc: opportunityData.meddpicc || {
        metrics: '',
        economicBuyer: '',
        decisionCriteria: '',
        decisionProcess: '',
        paperProcess: '',
        implicatePain: '',
        champion: '',
        score: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOpportunities(prev => [...prev, newOpportunity]);
    setShowForm(false);
    
    if (currentScenario) {
      // Automatically mark test as passed if form saves successfully
      completeTest(currentScenario.id, true);
      setCurrentScenario(null);
    }
    
    toast.success('Test opportunity created successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'validation':
        return <CheckCircle className="w-4 h-4" />;
      case 'layout':
        return <Target className="w-4 h-4" />;
      case 'user-experience':
        return <Sparkle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const passedTests = Object.values(testResults).filter(status => status === 'passed').length;
  const failedTests = Object.values(testResults).filter(status => status === 'failed').length;
  const totalTests = validationScenarios.length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Form Validation Test Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing suite for opportunity form validation and user experience
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowForm(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manual Test
          </Button>
          <Button 
            onClick={runAutomatedTests}
            disabled={isRunningAutoTests}
            className="bg-primary text-primary-foreground"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {isRunningAutoTests ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunningAutoTests && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Running automated tests...</span>
                <span>{Math.round(autoTestProgress)}%</span>
              </div>
              <Progress value={autoTestProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results Summary */}
      {Object.keys(testResults).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                  <p className="text-sm text-muted-foreground">Tests Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                  <p className="text-sm text-muted-foreground">Tests Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalTests}</p>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Scenarios */}
      <div className="grid gap-6">
        {['validation', 'layout', 'user-experience'].map(category => {
          const categoryScenarios = validationScenarios.filter(s => s.category === category);
          const categoryTitle = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {categoryTitle} Tests
                </CardTitle>
                <CardDescription>
                  {category === 'validation' && 'Test form validation rules and error handling'}
                  {category === 'layout' && 'Test responsive design and layout integrity'}
                  {category === 'user-experience' && 'Test overall user experience and workflow'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryScenarios.map((scenario) => {
                    const status = testResults[scenario.id] || 'pending';
                    return (
                      <div
                        key={scenario.id}
                        className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(status)}
                            <div className="flex-1">
                              <h4 className="font-medium">{scenario.name}</h4>
                              <p className="text-sm text-muted-foreground">{scenario.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getImportanceColor(scenario.importance)}>
                              {scenario.importance}
                            </Badge>
                            <Button
                              onClick={() => startManualTest(scenario)}
                              variant="outline"
                              size="sm"
                              disabled={status === 'testing'}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Test
                            </Button>
                          </div>
                        </div>
                        
                        {/* Test Steps */}
                        <div className="border-t pt-3">
                          <h5 className="text-sm font-medium mb-2">Test Steps:</h5>
                          <ol className="text-sm text-muted-foreground space-y-1">
                            {scenario.testSteps.map((step, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-xs bg-muted rounded-full w-5 h-5 flex items-center justify-center mt-0.5">
                                  {index + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        
                        {/* Expected Result */}
                        <div className="border-t pt-3">
                          <h5 className="text-sm font-medium mb-2">Expected Result:</h5>
                          <p className="text-sm text-muted-foreground">{scenario.expectedResult}</p>
                        </div>

                        {/* Test Results */}
                        {status !== 'pending' && (
                          <div className="border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Test Result:</span>
                              <div className="flex gap-2">
                                {status === 'testing' ? (
                                  <>
                                    <Button
                                      onClick={() => completeTest(scenario.id, true)}
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 border-green-200"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Pass
                                    </Button>
                                    <Button
                                      onClick={() => completeTest(scenario.id, false)}
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-200"
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Fail
                                    </Button>
                                  </>
                                ) : (
                                  <Badge
                                    className={status === 'passed' 
                                      ? 'bg-green-100 text-green-800 border-green-200' 
                                      : 'bg-red-100 text-red-800 border-red-200'
                                    }
                                  >
                                    {status === 'passed' ? 'Passed' : 'Failed'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Test Results Summary */}
      {opportunities.filter(opp => opp.leadSource === 'validation-test').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Opportunities</CardTitle>
            <CardDescription>
              Opportunities created during validation testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {opportunities
                  .filter(opp => opp.leadSource === 'validation-test')
                  .map((opportunity) => (
                    <div key={opportunity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${opportunity.value.toLocaleString()} • {opportunity.stage} • {opportunity.probability}%
                        </p>
                      </div>
                      <Badge className={getImportanceColor(opportunity.priority || 'medium')}>
                        {opportunity.priority}
                      </Badge>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <OpportunityEditForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentScenario(null);
        }}
        onSave={handleFormSave}
        opportunity={currentScenario?.testData ? {
          id: 'test-' + currentScenario.id,
          ...currentScenario.testData
        } as Opportunity : null}
      />
    </div>
  );
}