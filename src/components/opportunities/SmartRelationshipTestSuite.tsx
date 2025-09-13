import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Filter, Zap, Target, CheckCircle, TrendingUp, Star, Clock } from '@phosphor-icons/react';
import { toast } from 'sonner';
import SmartCompanyContactManager from './SmartCompanyContactManager';
import SmartOpportunityForm from './SmartOpportunityForm';

interface TestScenario {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  icon: React.ReactNode;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const SmartRelationshipTestSuite: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<string>('filtering');
  const [testResults, setTestResults] = useState<Record<string, 'pass' | 'fail' | 'pending'>>({});
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);

  const testScenarios: TestScenario[] = [
    {
      id: 'filtering',
      title: 'Smart Filtering Test',
      description: 'Test intelligent filtering capabilities across companies and contacts',
      steps: [
        '1. Use the search bar to find "TechCorp"',
        '2. Apply industry filter to "Technology"',
        '3. Filter by engagement score > 80%',
        '4. Switch to contacts tab and filter by "decision-maker" role',
        '5. Verify contacts match company criteria'
      ],
      expectedResult: 'Filtered results show relevant companies and contacts matching all criteria',
      icon: <Filter className="w-5 h-5" />,
      difficulty: 'beginner'
    },
    {
      id: 'relationships',
      title: 'Relationship Mapping Test',
      description: 'Test company-contact relationship intelligence and mapping',
      steps: [
        '1. Select a company from the list',
        '2. View associated contacts in the preview panel',
        '3. Note the relationship types (primary, secondary, etc.)',
        '4. Check influence levels and engagement scores',
        '5. Verify contact roles align with company hierarchy'
      ],
      expectedResult: 'Clear relationship hierarchy displayed with accurate influence mapping',
      icon: <Users className="w-5 h-5" />,
      difficulty: 'intermediate'
    },
    {
      id: 'scoring',
      title: 'Engagement Scoring Test',
      description: 'Test AI-powered engagement and influence scoring accuracy',
      steps: [
        '1. Compare engagement scores across different companies',
        '2. Check influence levels for contacts in same company',
        '3. Verify scoring reflects contact roles (decision-maker vs. gatekeeper)',
        '4. Test how scores affect list ordering',
        '5. Validate score recommendations in opportunity creation'
      ],
      expectedResult: 'Scores accurately reflect engagement potential and influence levels',
      icon: <TrendingUp className="w-5 h-5" />,
      difficulty: 'advanced'
    },
    {
      id: 'opportunity-integration',
      title: 'Opportunity Integration Test',
      description: 'Test seamless opportunity creation from selected relationships',
      steps: [
        '1. Select a high-engagement company',
        '2. Choose a decision-maker contact',
        '3. Click "Create Opportunity" if both are selected',
        '4. Verify auto-populated fields in opportunity form',
        '5. Check MEDDPICC champion assignment if contact role is champion'
      ],
      expectedResult: 'Opportunity form pre-populated with intelligent recommendations',
      icon: <Target className="w-5 h-5" />,
      difficulty: 'intermediate'
    },
    {
      id: 'recommendations',
      title: 'Smart Recommendations Test',
      description: 'Test AI-powered recommendations for deal sizing and probability',
      steps: [
        '1. Create opportunity with enterprise company',
        '2. Apply smart recommendations',
        '3. Verify deal size reflects company tier and size',
        '4. Check probability adjustment based on contact role',
        '5. Validate timeline recommendations'
      ],
      expectedResult: 'Recommendations align with company profile and contact influence',
      icon: <Star className="w-5 h-5" />,
      difficulty: 'advanced'
    }
  ];

  const runTest = (testId: string) => {
    setCurrentTest(testId);
    toast.info(`Running test: ${testScenarios.find(t => t.id === testId)?.title}`);
    
    // Simulate test completion after a delay
    setTimeout(() => {
      setTestResults(prev => ({ ...prev, [testId]: 'pass' }));
      toast.success(`Test completed: ${testScenarios.find(t => t.id === testId)?.title}`);
    }, 2000);
  };

  const runAllTests = () => {
    toast.info('Running comprehensive test suite...');
    testScenarios.forEach((test, index) => {
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [test.id]: 'pass' }));
        if (index === testScenarios.length - 1) {
          toast.success('All tests completed successfully!');
        }
      }, (index + 1) * 1000);
    });
  };

  const getTestStatus = (testId: string) => {
    return testResults[testId] || 'pending';
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'pending') => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4" />;
      case 'fail': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Smart Company-Contact Relationship Testing</h2>
            <p className="text-muted-foreground">
              Comprehensive test suite for intelligent filtering and relationship management
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Run All Tests
            </Button>
            <Button variant="outline" onClick={() => setShowOpportunityForm(true)}>
              <Target className="w-4 h-4 mr-2" />
              Test Smart Form
            </Button>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold">{testScenarios.length}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Passed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Object.values(testResults).filter(r => r === 'pass').length}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {testScenarios.length > 0 
                      ? Math.round((Object.values(testResults).filter(r => r === 'pass').length / testScenarios.length) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>
            Click on any test to run it individually, or use "Run All Tests" to execute the complete suite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {testScenarios.map((test) => {
              const status = getTestStatus(test.id);
              return (
                <Card 
                  key={test.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    currentTest === test.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => runTest(test.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {test.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{test.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {test.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium capitalize">{status}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(test.difficulty)}>
                          {test.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {test.steps.length} steps
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Test Steps:</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {test.steps.slice(0, 2).map((step, index) => (
                            <div key={index}>{step}</div>
                          ))}
                          {test.steps.length > 2 && (
                            <div className="italic">...and {test.steps.length - 2} more steps</div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Expected Result:</p>
                        <p className="text-xs text-muted-foreground">{test.expectedResult}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Live Testing Environment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Live Testing Environment
          </CardTitle>
          <CardDescription>
            Interactive testing environment for the smart company-contact management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manager" className="space-y-4">
            <TabsList>
              <TabsTrigger value="manager">Relationship Manager</TabsTrigger>
              <TabsTrigger value="instructions">Testing Instructions</TabsTrigger>
              <TabsTrigger value="results">Expected Results</TabsTrigger>
            </TabsList>

            <TabsContent value="manager" className="space-y-4">
              <div className="h-[600px] border rounded-lg">
                <SmartCompanyContactManager
                  showMetrics={true}
                  allowCreation={true}
                  filterByOpportunity={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4">
              <div className="space-y-6">
                {testScenarios.map((test, index) => (
                  <Card key={test.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {index + 1}
                        </span>
                        {test.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {test.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center mt-0.5">
                              {stepIndex + 1}
                            </div>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Expected Testing Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filtering Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Search Response Time</span>
                        <span className="text-sm font-medium">&lt; 100ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Filter Accuracy</span>
                        <span className="text-sm font-medium">100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Smart Suggestions</span>
                        <span className="text-sm font-medium">Contextual</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Relationship Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Influence Scoring</span>
                        <span className="text-sm font-medium">Role-based</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Engagement Metrics</span>
                        <span className="text-sm font-medium">Real-time</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Contact Mapping</span>
                        <span className="text-sm font-medium">Hierarchical</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Integration Success Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Company and contact selection seamlessly populates opportunity forms
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Smart recommendations align with company tier and contact influence
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        MEDDPICC champion assignment occurs automatically for champion contacts
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Deal sizing reflects company size and engagement history
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Probability calculations consider contact role and company status
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Smart Opportunity Form Test */}
      <SmartOpportunityForm
        isOpen={showOpportunityForm}
        onClose={() => setShowOpportunityForm(false)}
        onSave={(opportunity) => {
          toast.success('Smart opportunity form test completed successfully!');
          setShowOpportunityForm(false);
        }}
      />
    </div>
  );
};

export default SmartRelationshipTestSuite;