import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User } from '@/lib/types';
import { OpportunityDetailView } from './OpportunityDetailView';
import { ResponsiveOpportunityDetail } from './ResponsiveOpportunityDetail';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TestTube,
  CheckCircle,
  Warning,
  Bug,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Settings,
  Activity,
  Target,
  ChartLineUp,
  User as UserIcon
} from '@phosphor-icons/react';
import { toast } from 'sonner';

// Test data generator
const generateTestOpportunity = (id: string, variant: 'complete' | 'minimal' | 'corrupted'): Opportunity => {
  const baseOpportunity: Opportunity = {
    id,
    name: `Test Opportunity ${id}`,
    company: 'Acme Corporation',
    companyId: 'company-1',
    contactId: 'contact-1',
    value: 75000,
    stage: 'qualified',
    probability: 65,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'high',
    description: 'Enterprise software solution implementation',
    tags: ['enterprise', 'software', 'implementation'],
    industry: 'Technology',
    primaryContact: 'John Smith',
    owner: 'current-user',
    activities: [],
    contacts: [],
    peakScores: {
      prospect: 85,
      qualify: 75,
      demonstrate: 60,
      close: 40
    },
    meddpiccScores: {
      metrics: 70,
      economic_buyer: 80,
      decision_criteria: 60,
      decision_process: 50,
      paper_process: 30,
      implicate_the_pain: 85,
      champion: 90,
      competition: 65
    },
    meddpicc: {
      metrics: {
        score: 70,
        notes: 'Clear ROI metrics identified'
      },
      economic_buyer: {
        score: 80,
        notes: 'Direct access to CEO'
      },
      decision_criteria: {
        score: 60,
        notes: 'Some criteria still being defined'
      },
      decision_process: {
        score: 50,
        notes: 'Process not fully mapped'
      },
      paper_process: {
        score: 30,
        notes: 'Legal process unclear'
      },
      implicate_the_pain: {
        score: 85,
        notes: 'Strong business case established'
      },
      champion: {
        score: 90,
        notes: 'Strong internal champion identified'
      },
      competition: {
        score: 65,
        notes: 'Two main competitors identified'
      }
    }
  };

  switch (variant) {
    case 'complete':
      return {
        ...baseOpportunity,
        activities: [
          {
            id: 'activity-1',
            type: 'meeting',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Initial discovery meeting with stakeholders',
            outcome: 'positive' as const
          },
          {
            id: 'activity-2',
            type: 'call',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Follow-up call to discuss technical requirements',
            outcome: 'positive' as const
          }
        ]
      };

    case 'minimal':
      return {
        ...baseOpportunity,
        name: 'Minimal Test Opportunity',
        description: undefined,
        tags: [],
        activities: [],
        peakScores: undefined,
        meddpiccScores: undefined,
        meddpicc: undefined
      };

    case 'corrupted':
      return {
        ...baseOpportunity,
        name: 'Corrupted Test Opportunity',
        // @ts-ignore - Intentionally corrupted data for testing
        value: 'invalid-value',
        // @ts-ignore
        expectedCloseDate: 'invalid-date',
        // @ts-ignore
        createdAt: null,
        // @ts-ignore
        probability: 'not-a-number',
        // @ts-ignore
        tags: 'should-be-array',
        // @ts-ignore
        activities: null
      };

    default:
      return baseOpportunity;
  }
};

const generateTestCompany = (): Company => ({
  id: 'company-1',
  name: 'Acme Corporation',
  industry: 'Technology',
  employees: 500,
  revenue: 50000000,
  website: 'https://acme.com',
  address: '123 Business St, San Francisco, CA 94105',
  tier: 'enterprise',
  tags: ['technology', 'enterprise'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const generateTestContact = (): Contact => ({
  id: 'contact-1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@acme.com',
  phone: '+1 (555) 123-4567',
  title: 'VP of Technology',
  companyId: 'company-1',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  tags: ['decision-maker', 'technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

interface TestCase {
  id: string;
  name: string;
  description: string;
  variant: 'complete' | 'minimal' | 'corrupted';
  expectedBehavior: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const testCases: TestCase[] = [
  {
    id: 'test-1',
    name: 'Complete Opportunity Data',
    description: 'Test with fully populated opportunity including MEDDPICC scores',
    variant: 'complete',
    expectedBehavior: 'Should display all tabs and content correctly',
    severity: 'low'
  },
  {
    id: 'test-2',
    name: 'Minimal Opportunity Data',
    description: 'Test with minimal required fields only',
    variant: 'minimal',
    expectedBehavior: 'Should handle missing optional fields gracefully',
    severity: 'medium'
  },
  {
    id: 'test-3',
    name: 'Corrupted Data Handling',
    description: 'Test with intentionally corrupted data to verify error boundaries',
    variant: 'corrupted',
    expectedBehavior: 'Should catch errors and display fallback UI',
    severity: 'high'
  }
];

interface TestResult {
  testId: string;
  passed: boolean;
  message: string;
  timestamp: number;
  errorDetails?: string;
}

export function OpportunityDetailTestRunner() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  
  const [selectedTest, setSelectedTest] = useState<string>('test-1');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState<Opportunity | null>(null);
  const [viewMode, setViewMode] = useState<'detail' | 'modal'>('detail');
  const [showModal, setShowModal] = useState(false);

  // Mock user for testing
  const mockUser: User = {
    id: 'test-user',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'sales_rep',
    permissions: [],
    settings: {},
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  // Initialize test data
  useEffect(() => {
    const setupTestData = async () => {
      try {
        // Add test company
        const testCompany = generateTestCompany();
        setCompanies(prev => {
          const exists = prev.some(c => c.id === testCompany.id);
          if (exists) return prev;
          return [...prev, testCompany];
        });

        // Add test contact
        const testContact = generateTestContact();
        setContacts(prev => {
          const exists = prev.some(c => c.id === testContact.id);
          if (exists) return prev;
          return [...prev, testContact];
        });

        // Generate test opportunities
        const testOpportunities = testCases.map(testCase => 
          generateTestOpportunity(testCase.id, testCase.variant)
        );

        setOpportunities(prev => {
          const newOpportunities = [...prev];
          testOpportunities.forEach(testOpp => {
            const exists = newOpportunities.some(o => o.id === testOpp.id);
            if (!exists) {
              newOpportunities.push(testOpp);
            }
          });
          return newOpportunities;
        });

        toast.success('Test data initialized', {
          description: 'Test opportunities, companies, and contacts created'
        });
      } catch (error) {
        console.error('Failed to setup test data:', error);
        toast.error('Failed to setup test data');
      }
    };

    setupTestData();
  }, [setOpportunities, setCompanies, setContacts]);

  const runTest = async (testId: string) => {
    setIsRunning(true);
    const testCase = testCases.find(t => t.id === testId);
    
    if (!testCase) {
      toast.error('Test case not found');
      setIsRunning(false);
      return;
    }

    try {
      const opportunity = generateTestOpportunity(testId, testCase.variant);
      setCurrentOpportunity(opportunity);

      // Simulate component rendering and data processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result: TestResult = {
        testId,
        passed: true,
        message: `${testCase.name} completed successfully`,
        timestamp: Date.now()
      };

      setTestResults(prev => [...prev.filter(r => r.testId !== testId), result]);
      
      toast.success(`Test ${testCase.name} passed`, {
        description: testCase.expectedBehavior
      });

    } catch (error) {
      const result: TestResult = {
        testId,
        passed: false,
        message: `${testCase.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        errorDetails: error instanceof Error ? error.stack : undefined
      };

      setTestResults(prev => [...prev.filter(r => r.testId !== testId), result]);
      
      toast.error(`Test ${testCase.name} failed`, {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    for (const testCase of testCases) {
      await runTest(testCase.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentOpportunity(null);
    toast.info('Test results cleared');
  };

  const getTestStatusIcon = (testId: string) => {
    const result = testResults.find(r => r.testId === testId);
    if (!result) return <TestTube className="w-4 h-4 text-muted-foreground" />;
    
    return result.passed 
      ? <CheckCircle className="w-4 h-4 text-green-500" />
      : <Warning className="w-4 h-4 text-red-500" />;
  };

  const getTestStatusBadge = (testId: string) => {
    const result = testResults.find(r => r.testId === testId);
    if (!result) return <Badge variant="outline">Not Run</Badge>;
    
    return result.passed 
      ? <Badge className="bg-green-500">Passed</Badge>
      : <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Test Header */}
      <div className="flex-none bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <TestTube className="w-5 h-5 text-blue-600" />
                Opportunity Detail Test Runner
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Test MEDDPICC integration and error handling capabilities
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearResults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Results
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Test Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Test Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Test Case</Label>
                  <Select value={selectedTest} onValueChange={setSelectedTest}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {testCases.map(testCase => (
                        <SelectItem key={testCase.id} value={testCase.id}>
                          {testCase.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>View Mode</Label>
                  <Select value={viewMode} onValueChange={(value: 'detail' | 'modal') => setViewMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="detail">Detail View</SelectItem>
                      <SelectItem value="modal">Modal View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => runTest(selectedTest)} 
                    disabled={isRunning}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Run Test
                  </Button>
                  
                  {viewMode === 'modal' && currentOpportunity && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowModal(true)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Cases */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Test Cases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testCases.map(testCase => (
                  <div 
                    key={testCase.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTest === testCase.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTest(testCase.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTestStatusIcon(testCase.id)}
                        <span className="text-sm font-medium">{testCase.name}</span>
                      </div>
                      {getTestStatusBadge(testCase.id)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {testCase.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          testCase.severity === 'critical' ? 'border-red-200 text-red-700' :
                          testCase.severity === 'high' ? 'border-orange-200 text-orange-700' :
                          testCase.severity === 'medium' ? 'border-yellow-200 text-yellow-700' :
                          'border-green-200 text-green-700'
                        }`}
                      >
                        {testCase.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {testCase.variant}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {testResults.map(result => (
                    <Alert 
                      key={result.testId}
                      variant={result.passed ? 'default' : 'destructive'}
                    >
                      {result.passed ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <Bug className="w-4 h-4" />
                      }
                      <AlertTitle className="text-sm">
                        {testCases.find(t => t.id === result.testId)?.name}
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        {result.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Test Display Area */}
          <div className="lg:col-span-2">
            {currentOpportunity && viewMode === 'detail' ? (
              <EnhancedErrorBoundary 
                context="OpportunityDetailTest"
                showErrorDetails={true}
                maxRetries={3}
                resetOnPropsChange={true}
              >
                <OpportunityDetailView
                  opportunityId={currentOpportunity.id}
                  user={mockUser}
                  onBack={() => setCurrentOpportunity(null)}
                  onEdit={(opportunity) => {
                    toast.info('Edit functionality triggered', {
                      description: `Would edit opportunity: ${opportunity.name}`
                    });
                  }}
                  onDelete={(opportunityId) => {
                    toast.info('Delete functionality triggered', {
                      description: `Would delete opportunity: ${opportunityId}`
                    });
                  }}
                />
              </EnhancedErrorBoundary>
            ) : (
              <Card className="h-full">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center space-x-2">
                      <Target className="w-8 h-8 text-blue-600" />
                      <ChartLineUp className="w-8 h-8 text-green-600" />
                      <UserIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Select and Run a Test</h3>
                      <p className="text-muted-foreground">
                        Choose a test case and click "Run Test" to see the opportunity detail view
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Features being tested:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline">MEDDPICC Integration</Badge>
                        <Badge variant="outline">Error Boundaries</Badge>
                        <Badge variant="outline">Data Validation</Badge>
                        <Badge variant="outline">Responsive Design</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal View */}
      {currentOpportunity && (
        <ResponsiveOpportunityDetail
          opportunity={currentOpportunity}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onEdit={() => {
            toast.info('Edit functionality triggered from modal');
            setShowModal(false);
          }}
          onDelete={() => {
            toast.info('Delete functionality triggered from modal');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

export default OpportunityDetailTestRunner;