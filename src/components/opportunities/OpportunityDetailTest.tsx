import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Database,
  RefreshCw,
  PlayCircle,
  Eye,
  ArrowRight
} from '@phosphor-icons/react';
import { OpportunityService } from '@/lib/opportunity-service';
import { Opportunity, Company, Contact } from '@/lib/types';
import { formatCurrency, getMEDDPICCScore } from '@/lib/crm-utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { QuickOpportunityTest } from './QuickOpportunityTest';
import { ResponsiveOpportunityDetail } from './ResponsiveOpportunityDetail';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function OpportunityDetailTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [sampleData, setSampleData] = useState<{
    opportunities: Opportunity[];
    companies: Company[];
    contacts: Contact[];
  }>({ opportunities: [], companies: [], contacts: [] });
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const results: TestResult[] = [];

    try {
      // Test 1: Initialize and load sample data
      results.push(await testSampleDataInitialization());
      
      // Test 2: Verify opportunity data structure
      results.push(await testOpportunityDataStructure());
      
      // Test 3: Test MEDDPICC calculations
      results.push(await testMEDDPICCCalculations());
      
      // Test 4: Test analytics integration
      results.push(await testAnalyticsIntegration());
      
      // Test 5: Test detailed view data completeness
      results.push(await testDetailViewDataCompleteness());
      
      // Test 6: Test stage progression logic
      results.push(await testStageProgression());
      
      // Test 7: Test relationship data (companies/contacts)
      results.push(await testRelationshipData());

    } catch (error) {
      results.push({
        name: 'Test Suite Execution',
        status: 'fail',
        message: 'Test suite failed to complete',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const testSampleDataInitialization = async (): Promise<TestResult> => {
    try {
      // Initialize sample data
      await OpportunityService.initializeSampleData();
      
      const opportunities = await OpportunityService.getAllOpportunities();
      const companies = await OpportunityService.getAllCompanies();
      const contacts = await OpportunityService.getAllContacts();

      setSampleData({ opportunities, companies, contacts });

      if (opportunities.length === 0) {
        return {
          name: 'Sample Data Initialization',
          status: 'fail',
          message: 'No sample opportunities loaded',
          details: 'Expected at least 1 sample opportunity'
        };
      }

      return {
        name: 'Sample Data Initialization',
        status: 'pass',
        message: `Successfully loaded ${opportunities.length} opportunities, ${companies.length} companies, ${contacts.length} contacts`,
        details: `Opportunities: ${opportunities.map(o => o.title).join(', ')}`
      };
    } catch (error) {
      return {
        name: 'Sample Data Initialization',
        status: 'fail',
        message: 'Failed to initialize sample data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testOpportunityDataStructure = async (): Promise<TestResult> => {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (opportunities.length === 0) {
        return {
          name: 'Opportunity Data Structure',
          status: 'fail',
          message: 'No opportunities to test'
        };
      }

      const opportunity = opportunities[0];
      const requiredFields = [
        'id', 'title', 'description', 'value', 'stage', 'probability',
        'expectedCloseDate', 'companyId', 'contactId', 'meddpicc'
      ];

      const missingFields = requiredFields.filter(field => 
        opportunity[field as keyof Opportunity] === undefined
      );

      if (missingFields.length > 0) {
        return {
          name: 'Opportunity Data Structure',
          status: 'fail',
          message: `Missing required fields: ${missingFields.join(', ')}`,
          details: `Tested opportunity: ${opportunity.title}`
        };
      }

      // Check MEDDPICC structure
      const meddpiccFields = [
        'metrics', 'economicBuyer', 'decisionCriteria', 
        'decisionProcess', 'paperProcess', 'implicatePain', 'champion', 'score'
      ];

      const missingMeddpiccFields = meddpiccFields.filter(field =>
        opportunity.meddpicc[field as keyof typeof opportunity.meddpicc] === undefined
      );

      if (missingMeddpiccFields.length > 0) {
        return {
          name: 'Opportunity Data Structure',
          status: 'warning',
          message: `MEDDPICC missing fields: ${missingMeddpiccFields.join(', ')}`,
          details: 'Some MEDDPICC fields are incomplete but this is expected for demo data'
        };
      }

      return {
        name: 'Opportunity Data Structure',
        status: 'pass',
        message: 'All required fields present',
        details: `Tested opportunity: ${opportunity.title} with ${requiredFields.length} required fields`
      };
    } catch (error) {
      return {
        name: 'Opportunity Data Structure',
        status: 'fail',
        message: 'Failed to validate data structure',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testMEDDPICCCalculations = async (): Promise<TestResult> => {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (opportunities.length === 0) {
        return {
          name: 'MEDDPICC Calculations',
          status: 'fail',
          message: 'No opportunities to test'
        };
      }

      const scores = opportunities.map(opp => {
        const score = getMEDDPICCScore(opp.meddpicc);
        return {
          title: opp.title,
          score,
          valid: score >= 0 && score <= 100
        };
      });

      const invalidScores = scores.filter(s => !s.valid);
      
      if (invalidScores.length > 0) {
        return {
          name: 'MEDDPICC Calculations',
          status: 'fail',
          message: `Invalid MEDDPICC scores for ${invalidScores.length} opportunities`,
          details: invalidScores.map(s => `${s.title}: ${s.score}`).join(', ')
        };
      }

      return {
        name: 'MEDDPICC Calculations',
        status: 'pass',
        message: `All ${scores.length} opportunities have valid MEDDPICC scores`,
        details: scores.map(s => `${s.title}: ${s.score}%`).join(', ')
      };
    } catch (error) {
      return {
        name: 'MEDDPICC Calculations',
        status: 'fail',
        message: 'Failed to calculate MEDDPICC scores',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testAnalyticsIntegration = async (): Promise<TestResult> => {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (opportunities.length === 0) {
        return {
          name: 'Analytics Integration',
          status: 'fail',
          message: 'No opportunities to test'
        };
      }

      const opportunity = opportunities[0];
      const analytics = await OpportunityService.analyzeOpportunity(opportunity.id);

      if (!analytics) {
        return {
          name: 'Analytics Integration',
          status: 'fail',
          message: 'Analytics service returned null',
          details: `Tested opportunity: ${opportunity.title}`
        };
      }

      const requiredAnalyticsFields = [
        'healthScore', 'riskFactors', 'recommendations', 'progressionResults'
      ];

      const missingAnalyticsFields = requiredAnalyticsFields.filter(field =>
        analytics[field as keyof typeof analytics] === undefined
      );

      if (missingAnalyticsFields.length > 0) {
        return {
          name: 'Analytics Integration',
          status: 'warning',
          message: `Analytics missing fields: ${missingAnalyticsFields.join(', ')}`,
          details: 'Some analytics fields are missing but basic analysis works'
        };
      }

      return {
        name: 'Analytics Integration',
        status: 'pass',
        message: 'Analytics integration working correctly',
        details: `Analyzed ${opportunity.title}, can auto-advance: ${analytics.canAutoAdvance}`
      };
    } catch (error) {
      return {
        name: 'Analytics Integration',
        status: 'fail',
        message: 'Analytics integration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testDetailViewDataCompleteness = async (): Promise<TestResult> => {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (opportunities.length === 0) {
        return {
          name: 'Detail View Data Completeness',
          status: 'fail',
          message: 'No opportunities to test'
        };
      }

      const opportunity = opportunities[0];
      const withRelations = await OpportunityService.getOpportunityWithRelations(opportunity.id);

      if (!withRelations) {
        return {
          name: 'Detail View Data Completeness',
          status: 'fail',
          message: 'Failed to load opportunity with relations',
          details: `Tested opportunity: ${opportunity.title}`
        };
      }

      const issues: string[] = [];

      // Check if company data is available
      if (!withRelations.company) {
        issues.push('Company data missing');
      }

      // Check if contact data is available
      if (!withRelations.contact) {
        issues.push('Contact data missing');
      }

      // Check if description is meaningful
      if (!withRelations.description || withRelations.description.length < 10) {
        issues.push('Description too short or missing');
      }

      // Check if MEDDPICC has meaningful content
      const meddpicContent = Object.values(withRelations.meddpicc).filter(value => 
        typeof value === 'string' && value.length > 10
      );
      
      if (meddpicContent.length < 4) {
        issues.push('MEDDPICC content insufficient');
      }

      if (issues.length > 0) {
        return {
          name: 'Detail View Data Completeness',
          status: 'warning',
          message: `Data completeness issues: ${issues.join(', ')}`,
          details: `Some fields may not display properly in detail view`
        };
      }

      return {
        name: 'Detail View Data Completeness',
        status: 'pass',
        message: 'All detail view data is complete',
        details: `Company: ${withRelations.company?.name}, Contact: ${withRelations.contact?.firstName} ${withRelations.contact?.lastName}`
      };
    } catch (error) {
      return {
        name: 'Detail View Data Completeness',
        status: 'fail',
        message: 'Failed to test detail view data',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testStageProgression = async (): Promise<TestResult> => {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (opportunities.length === 0) {
        return {
          name: 'Stage Progression',
          status: 'fail',
          message: 'No opportunities to test'
        };
      }

      // Test with a sample opportunity
      const opportunity = opportunities[0];
      const currentStage = opportunity.stage;
      
      // Test analytics for stage progression
      const analytics = await OpportunityService.analyzeOpportunity(opportunity.id);
      
      if (!analytics) {
        return {
          name: 'Stage Progression',
          status: 'fail',
          message: 'Cannot test stage progression without analytics'
        };
      }

      // Check if progression data exists
      const hasProgressionData = analytics.progressionResults && 
        Object.keys(analytics.progressionResults).length > 0;

      if (!hasProgressionData) {
        return {
          name: 'Stage Progression',
          status: 'warning',
          message: 'No progression data available',
          details: 'Stage progression logic exists but no historical data'
        };
      }

      return {
        name: 'Stage Progression',
        status: 'pass',
        message: `Stage progression working for ${opportunity.title}`,
        details: `Current stage: ${currentStage}, Can auto-advance: ${analytics.canAutoAdvance}`
      };
    } catch (error) {
      return {
        name: 'Stage Progression',
        status: 'fail',
        message: 'Stage progression test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testRelationshipData = async (): Promise<TestResult> => {
    try {
      const opportunities = await OpportunityService.getAllOpportunities();
      const companies = await OpportunityService.getAllCompanies();
      const contacts = await OpportunityService.getAllContacts();

      if (opportunities.length === 0) {
        return {
          name: 'Relationship Data',
          status: 'fail',
          message: 'No data to test relationships'
        };
      }

      const relationshipIssues: string[] = [];

      // Check if opportunities have valid company and contact IDs
      opportunities.forEach(opp => {
        const company = companies.find(c => c.id === opp.companyId);
        const contact = contacts.find(c => c.id === opp.contactId);

        if (!company) {
          relationshipIssues.push(`${opp.title}: Missing company`);
        }

        if (!contact) {
          relationshipIssues.push(`${opp.title}: Missing contact`);
        }

        // Check if contact belongs to the same company
        if (company && contact && contact.companyId !== company.id) {
          relationshipIssues.push(`${opp.title}: Contact-company mismatch`);
        }
      });

      if (relationshipIssues.length > 0) {
        return {
          name: 'Relationship Data',
          status: 'warning',
          message: `Relationship issues found: ${relationshipIssues.length}`,
          details: relationshipIssues.slice(0, 3).join('; ') + (relationshipIssues.length > 3 ? '...' : '')
        };
      }

      return {
        name: 'Relationship Data',
        status: 'pass',
        message: 'All relationships properly linked',
        details: `${opportunities.length} opportunities linked to ${companies.length} companies and ${contacts.length} contacts`
      };
    } catch (error) {
      return {
        name: 'Relationship Data',
        status: 'fail',
        message: 'Relationship data test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-600" />;
      case 'fail':
        return <AlertTriangle size={20} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
    }
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Opportunity Detail View Test Suite
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive testing of the opportunity detail view functionality with sample data verification.
        </p>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <PlayCircle size={16} />
            Quick Test
          </TabsTrigger>
          <TabsTrigger value="responsive" className="flex items-center gap-2">
            <Target size={16} />
            Responsive
          </TabsTrigger>
          <TabsTrigger value="comprehensive" className="flex items-center gap-2">
            <FileText size={16} />
            Tests
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database size={16} />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-6">
          <QuickOpportunityTest />
        </TabsContent>

        <TabsContent value="responsive" className="space-y-6">
          <Card className="border-2 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={24} className="text-blue-600" />
                Responsive Design Testing
              </CardTitle>
              <p className="text-muted-foreground">
                Test the new opportunity detail view across different screen sizes and devices.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screen Size Demo Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border border-green-200 bg-green-50/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-green-600 mb-2">
                      <div className="w-8 h-8 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
                        📱
                      </div>
                    </div>
                    <h3 className="font-semibold text-green-800">Mobile Phones</h3>
                    <p className="text-xs text-green-600 mt-1">&lt; 768px</p>
                    <ul className="text-xs text-green-700 mt-2 space-y-1">
                      <li>• Single column layout</li>
                      <li>• Compact metrics cards</li>
                      <li>• Horizontal scrolling tabs</li>
                      <li>• Touch-friendly controls</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-blue-200 bg-blue-50/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-blue-600 mb-2">
                      <div className="w-8 h-8 mx-auto bg-blue-100 rounded-lg flex items-center justify-center">
                        📱
                      </div>
                    </div>
                    <h3 className="font-semibold text-blue-800">Tablets</h3>
                    <p className="text-xs text-blue-600 mt-1">768px - 1024px</p>
                    <ul className="text-xs text-blue-700 mt-2 space-y-1">
                      <li>• Two column layout</li>
                      <li>• Larger text and icons</li>
                      <li>• Flexible grid system</li>
                      <li>• Balanced spacing</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border border-purple-200 bg-purple-50/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-purple-600 mb-2">
                      <div className="w-8 h-8 mx-auto bg-purple-100 rounded-lg flex items-center justify-center">
                        🖥️
                      </div>
                    </div>
                    <h3 className="font-semibold text-purple-800">Desktop</h3>
                    <p className="text-xs text-purple-600 mt-1">&gt; 1024px</p>
                    <ul className="text-xs text-purple-700 mt-2 space-y-1">
                      <li>• Multi-column layout</li>
                      <li>• Full feature display</li>
                      <li>• Rich interactions</li>
                      <li>• Maximum content</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Test Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interactive Responsive Testing</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Click on any opportunity below to test the responsive detail view. 
                    Try resizing your browser window to see how the layout adapts to different screen sizes.
                  </p>
                  
                  {sampleData.opportunities.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sampleData.opportunities.slice(0, 6).map(opp => (
                        <Card key={opp.id} className="border border-border hover:border-primary/50 transition-colors cursor-pointer group">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                  {opp.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(opp.value)} • {opp.probability}%
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedOpportunity(opp);
                                  setIsDetailViewOpen(true);
                                }}
                                className="shrink-0 ml-2 h-8 px-3"
                              >
                                <Eye size={12} className="mr-1" />
                                Test
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Responsive Features Checklist */}
              <Card className="border border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <CardTitle className="text-lg text-amber-800">Responsive Features Implemented</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-amber-800">Layout Adaptations</h4>
                      <ul className="space-y-2 text-sm text-amber-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Mobile-first responsive design
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Flexible grid systems
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Collapsible navigation tabs
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Adaptive content sections
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-amber-800">Interaction Improvements</h4>
                      <ul className="space-y-2 text-sm text-amber-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Touch-friendly button sizes
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Proper text scaling
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Optimized scrolling areas
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600 shrink-0" />
                          Context-aware content display
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-6">
          {/* Test Controls */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={24} className="text-primary" />
                Comprehensive Test Controls
              </CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Test Status</div>
              <div className="text-sm text-muted-foreground">
                {isRunning ? 'Running tests...' : 
                 testResults.length > 0 ? `Completed ${testResults.length} tests` : 
                 'Ready to run tests'}
              </div>
            </div>
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="px-6"
            >
              {isRunning ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw size={16} className="mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-green-600">{passCount}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center space-y-1">
                <div className="text-2xl font-bold text-red-600">{failCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <Card key={index} className={`${getStatusColor(result.status)} border-2`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">{result.name}</h3>
                            <Badge variant={
                              result.status === 'pass' ? 'default' :
                              result.status === 'warning' ? 'secondary' : 'destructive'
                            }>
                              {result.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground">{result.message}</p>
                          {result.details && (
                            <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                              {result.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {/* Sample Data Overview */}
          {sampleData.opportunities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database size={24} className="text-emerald-600" />
                  Sample Data Overview
                </CardTitle>
              </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Opportunities ({sampleData.opportunities.length})</h3>
                <div className="space-y-2">
                  {sampleData.opportunities.map(opp => (
                    <div key={opp.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{opp.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(opp.value)} • {opp.stage} • {opp.probability}%
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOpportunity(opp);
                            setIsDetailViewOpen(true);
                          }}
                          className="shrink-0 ml-2"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Companies ({sampleData.companies.length})</h3>
                <div className="space-y-2">
                  {sampleData.companies.map(company => (
                    <div key={company.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-sm">{company.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {company.industry} • {company.size}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Contacts ({sampleData.contacts.length})</h3>
                <div className="space-y-2">
                  {sampleData.contacts.map(contact => (
                    <div key={contact.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="font-medium text-sm">{contact.firstName} {contact.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {contact.title} • {contact.role}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      {/* Responsive Detail View Dialog */}
      {selectedOpportunity && (
        <ResponsiveOpportunityDetail
          opportunity={selectedOpportunity}
          isOpen={isDetailViewOpen}
          onClose={() => {
            setIsDetailViewOpen(false);
            setSelectedOpportunity(null);
          }}
          onEdit={() => {
            toast.info('Edit functionality will be integrated with main opportunity form');
          }}
          onDelete={() => {
            toast.info('Delete functionality will be integrated with main opportunity management');
          }}
        />
      )}
    </div>
  );
}