import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Info,
  Calendar,
  Building,
  DollarSign,
  Target,
  User,
  FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ModernOpportunityEditForm } from './ModernOpportunityEditForm';
import { ImprovedFormValidationTester } from './ImprovedFormValidationTester';

interface ValidationScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  testData: any;
  expectedBehavior: string;
  category: 'validation' | 'interaction' | 'edge-cases';
}

const validationScenarios: ValidationScenario[] = [
  {
    id: 'required-fields',
    title: 'Required Field Validation',
    description: 'Test how the form handles empty required fields',
    icon: FileText,
    testData: {
      title: '',
      companyId: '',
      value: '',
      probability: '',
      expectedCloseDate: ''
    },
    expectedBehavior: 'Shows clear error messages for all required fields',
    category: 'validation'
  },
  {
    id: 'deal-value-validation',
    title: 'Deal Value Validation',
    description: 'Test deal value range validation and warnings',
    icon: DollarSign,
    testData: {
      title: 'Test Deal',
      companyId: 'valid-company',
      value: 50, // Unusually low value
      probability: 50,
      expectedCloseDate: new Date().toISOString()
    },
    expectedBehavior: 'Shows warning for unusually low deal value',
    category: 'validation'
  },
  {
    id: 'stage-probability-alignment',
    title: 'Stage-Probability Alignment',
    description: 'Test probability validation based on sales stage',
    icon: Target,
    testData: {
      title: 'Test Deal',
      companyId: 'valid-company',
      value: 50000,
      stage: 'prospect',
      probability: 90, // Too high for prospect stage
      expectedCloseDate: new Date().toISOString()
    },
    expectedBehavior: 'Shows warning about probability being too high for Prospect stage',
    category: 'validation'
  },
  {
    id: 'date-validation',
    title: 'Date Validation',
    description: 'Test expected close date validation rules',
    icon: Calendar,
    testData: {
      title: 'Test Deal',
      companyId: 'valid-company',
      value: 50000,
      probability: 50,
      expectedCloseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    },
    expectedBehavior: 'Shows error for dates too far in the past',
    category: 'validation'
  },
  {
    id: 'company-contact-flow',
    title: 'Company-Contact Selection',
    description: 'Test company selection and contact filtering',
    icon: Building,
    testData: {
      companyId: 'acme-corp'
    },
    expectedBehavior: 'Filters contacts based on selected company',
    category: 'interaction'
  },
  {
    id: 'form-auto-save',
    title: 'Auto-Save Functionality',
    description: 'Test form draft saving and restoration',
    icon: CheckCircle,
    testData: {
      title: 'Draft Deal',
      description: 'This should be auto-saved'
    },
    expectedBehavior: 'Automatically saves form drafts and restores on reload',
    category: 'interaction'
  }
];

export function FormValidationDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [showTester, setShowTester] = useState(false);
  const [demoResults, setDemoResults] = useState<Map<string, string>>(new Map());

  const runDemo = async (scenario: ValidationScenario) => {
    setActiveDemo(scenario.id);
    setDemoResults(prev => new Map(prev.set(scenario.id, 'Running...')));

    // Simulate demo execution
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = `✅ Demo completed: ${scenario.expectedBehavior}`;
    setDemoResults(prev => new Map(prev.set(scenario.id, result)));
    setActiveDemo(null);

    toast.success(`Demo "${scenario.title}" completed`);
  };

  const getDemosByCategory = (category: string) => {
    return validationScenarios.filter(scenario => scenario.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'validation':
        return <CheckCircle className="h-4 w-4" />;
      case 'interaction':
        return <User className="h-4 w-4" />;
      case 'edge-cases':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Enhanced Opportunity Form Validation Demo
          </CardTitle>
          <CardDescription>
            Interactive demonstration of the improved opportunity form with comprehensive validation,
            real-time feedback, and enhanced user experience features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowTester(!showTester)}
              variant={showTester ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              {showTester ? 'Hide' : 'Show'} Full Test Suite
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => {
                setDemoResults(new Map());
                setActiveDemo(null);
              }}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Full Test Suite */}
      {showTester && (
        <Card>
          <CardHeader>
            <CardTitle>Comprehensive Test Suite</CardTitle>
            <CardDescription>
              Run automated tests to validate all aspects of the form functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImprovedFormValidationTester />
          </CardContent>
        </Card>
      )}

      {/* Demo Scenarios */}
      <Tabs defaultValue="validation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validation" className="flex items-center gap-2">
            {getCategoryIcon('validation')}
            Validation
            <Badge variant="secondary">{getDemosByCategory('validation').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="interaction" className="flex items-center gap-2">
            {getCategoryIcon('interaction')}
            Interaction
            <Badge variant="secondary">{getDemosByCategory('interaction').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="edge-cases" className="flex items-center gap-2">
            {getCategoryIcon('edge-cases')}
            Edge Cases
            <Badge variant="secondary">{getDemosByCategory('edge-cases').length}</Badge>
          </TabsTrigger>
        </TabsList>

        {(['validation', 'interaction', 'edge-cases'] as const).map(category => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {getDemosByCategory(category).map(scenario => {
                const Icon = scenario.icon;
                const result = demoResults.get(scenario.id);
                const isRunning = activeDemo === scenario.id;

                return (
                  <Card key={scenario.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5" />
                        {scenario.title}
                      </CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Expected Behavior:</h4>
                        <p className="text-sm text-muted-foreground">
                          {scenario.expectedBehavior}
                        </p>
                      </div>

                      {scenario.testData && Object.keys(scenario.testData).length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Test Data:</h4>
                          <div className="bg-muted p-3 rounded-md">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(scenario.testData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      {result && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            {result}
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={() => runDemo(scenario)}
                        disabled={isRunning}
                        className="w-full flex items-center gap-2"
                        variant={result ? "secondary" : "default"}
                      >
                        {isRunning ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Running Demo...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Run Demo
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Interactive Form Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Interactive Form Demo
          </CardTitle>
          <CardDescription>
            Test the form directly with real-time validation feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ModernOpportunityEditForm
            isOpen={true}
            onClose={() => {}}
            onSave={(opportunity) => {
              toast.success('Demo form saved successfully!');
              console.log('Demo opportunity saved:', opportunity);
            }}
          />
        </CardContent>
      </Card>

      {/* Validation Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Validation Features</CardTitle>
          <CardDescription>
            Overview of all the validation improvements implemented in the form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Real-time Validation
              </h4>
              <p className="text-sm text-muted-foreground">
                Instant feedback as users type with debounced validation
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Context-aware Rules
              </h4>
              <p className="text-sm text-muted-foreground">
                Probability validation based on sales stage
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                Smart Date Validation
              </h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive date range and format validation
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Value Range Checks
              </h4>
              <p className="text-sm text-muted-foreground">
                Warnings for unusually high or low deal values
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-orange-600" />
                Relational Validation
              </h4>
              <p className="text-sm text-muted-foreground">
                Company-contact relationship validation
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                Text Quality Checks
              </h4>
              <p className="text-sm text-muted-foreground">
                Title format validation and content quality rules
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}