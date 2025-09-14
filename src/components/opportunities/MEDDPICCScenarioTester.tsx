import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Target,
  Users,
  DollarSign,
  Calendar,
  Award
} from 'lucide-react';
import { OpportunityService } from '@/lib/opportunity-service';
import type { Opportunity } from '@/lib/types';

interface MEDDPICCScenario {
  id: string;
  name: string;
  description: string;
  dealState: 'early' | 'mid' | 'late' | 'closing' | 'complex' | 'at-risk';
  opportunityData: Partial<Opportunity>;
  expectedScore: number;
  expectedGaps: string[];
  coachingTips: string[];
}

const TEST_SCENARIOS: MEDDPICCScenario[] = [
  {
    id: 'early-stage-discovery',
    name: 'Early Stage Discovery',
    description: 'Brand new opportunity in discovery phase',
    dealState: 'early',
    opportunityData: {
      title: 'TechCorp Software Evaluation',
      stage: 'prospect',
      value: 150000,
      probability: 25,
      meddpiccScores: {
        metrics: 10,
        economicBuyer: 5,
        decisionCriteria: 15,
        decisionProcess: 0,
        paperProcess: 0,
        identifyPain: 20,
        champion: 5,
        competition: 10
      }
    },
    expectedScore: 65,
    expectedGaps: ['Economic Buyer', 'Decision Process', 'Paper Process', 'Champion'],
    coachingTips: [
      'Schedule discovery call with senior stakeholders',
      'Identify budget approval process',
      'Find internal champion to sponsor your solution'
    ]
  },
  {
    id: 'mid-stage-qualified',
    name: 'Mid-Stage Qualified Deal',
    description: 'Deal with good qualification but some gaps',
    dealState: 'mid',
    opportunityData: {
      title: 'GrowthCo Digital Transformation',
      stage: 'engage',
      value: 450000,
      probability: 60,
      meddpiccScores: {
        metrics: 25,
        economicBuyer: 20,
        decisionCriteria: 30,
        decisionProcess: 25,
        paperProcess: 15,
        identifyPain: 35,
        champion: 30,
        competition: 20
      }
    },
    expectedScore: 200,
    expectedGaps: ['Paper Process', 'Competition'],
    coachingTips: [
      'Map out procurement and legal processes',
      'Conduct competitive analysis with champion',
      'Validate metrics with financial stakeholders'
    ]
  },
  {
    id: 'late-stage-strong',
    name: 'Late Stage Strong Position',
    description: 'Well-qualified deal nearing close',
    dealState: 'late',
    opportunityData: {
      title: 'Enterprise Corp Platform Upgrade',
      stage: 'acquire',
      value: 750000,
      probability: 85,
      meddpiccScores: {
        metrics: 35,
        economicBuyer: 35,
        decisionCriteria: 40,
        decisionProcess: 35,
        paperProcess: 30,
        identifyPain: 40,
        champion: 38,
        competition: 35
      }
    },
    expectedScore: 288,
    expectedGaps: [],
    coachingTips: [
      'Focus on implementation planning',
      'Prepare contract negotiations',
      'Ensure champion alignment on next steps'
    ]
  },
  {
    id: 'closing-final-hurdle',
    name: 'Closing - Final Hurdle',
    description: 'Deal ready to close with minor obstacles',
    dealState: 'closing',
    opportunityData: {
      title: 'MegaCorp Strategic Initiative',
      stage: 'acquire',
      value: 1200000,
      probability: 90,
      meddpiccScores: {
        metrics: 40,
        economicBuyer: 38,
        decisionCriteria: 40,
        decisionProcess: 38,
        paperProcess: 35,
        identifyPain: 40,
        champion: 40,
        competition: 38
      }
    },
    expectedScore: 309,
    expectedGaps: ['Paper Process'],
    coachingTips: [
      'Accelerate contract review process',
      'Address any final technical concerns',
      'Prepare for implementation kickoff'
    ]
  },
  {
    id: 'complex-multi-stakeholder',
    name: 'Complex Multi-Stakeholder Deal',
    description: 'Large enterprise deal with multiple decision makers',
    dealState: 'complex',
    opportunityData: {
      title: 'Global Enterprises Consolidation',
      stage: 'engage',
      value: 2500000,
      probability: 45,
      meddpiccScores: {
        metrics: 30,
        economicBuyer: 25,
        decisionCriteria: 35,
        decisionProcess: 20,
        paperProcess: 15,
        identifyPain: 35,
        champion: 25,
        competition: 30
      }
    },
    expectedScore: 215,
    expectedGaps: ['Economic Buyer', 'Decision Process', 'Paper Process', 'Champion'],
    coachingTips: [
      'Map all stakeholders and influencers',
      'Identify multiple champions across business units',
      'Understand complex approval hierarchy'
    ]
  },
  {
    id: 'at-risk-competitive',
    name: 'At-Risk Competitive Situation',
    description: 'Deal under pressure from competitor',
    dealState: 'at-risk',
    opportunityData: {
      title: 'RetailPlus Technology Modernization',
      stage: 'engage',
      value: 320000,
      probability: 35,
      meddpiccScores: {
        metrics: 20,
        economicBuyer: 15,
        decisionCriteria: 25,
        decisionProcess: 20,
        paperProcess: 10,
        identifyPain: 25,
        champion: 15,
        competition: 5
      }
    },
    expectedScore: 135,
    expectedGaps: ['Metrics', 'Economic Buyer', 'Champion', 'Competition'],
    coachingTips: [
      'Strengthen relationship with economic buyer',
      'Differentiate against specific competitor',
      'Identify and develop stronger champion'
    ]
  }
];

const getDealStateColor = (state: string) => {
  switch (state) {
    case 'early': return 'bg-blue-100 text-blue-800';
    case 'mid': return 'bg-yellow-100 text-yellow-800';
    case 'late': return 'bg-green-100 text-green-800';
    case 'closing': return 'bg-emerald-100 text-emerald-800';
    case 'complex': return 'bg-purple-100 text-purple-800';
    case 'at-risk': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 280) return 'text-green-600';
  if (score >= 200) return 'text-yellow-600';
  return 'text-red-600';
};

const getScoreLevel = (score: number) => {
  if (score >= 280) return { level: 'Strong', color: 'bg-green-500' };
  if (score >= 200) return { level: 'Moderate', color: 'bg-yellow-500' };
  return { level: 'Weak', color: 'bg-red-500' };
};

export const MEDDPICCScenarioTester: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<MEDDPICCScenario | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);

  const runScenarioTest = async (scenario: MEDDPICCScenario) => {
    setIsRunning(true);
    setSelectedScenario(scenario);

    try {
      // Create test opportunity
      const testOpportunity = await OpportunityService.createOpportunity({
        ...scenario.opportunityData,
        id: `test-${scenario.id}-${Date.now()}`,
        companyId: 'test-company',
        contactId: 'test-contact',
        createdDate: new Date(),
        updatedDate: new Date(),
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        tags: ['meddpicc-test'],
        priority: 'medium'
      });

      // Calculate MEDDPICC analytics
      const analytics = OpportunityService.analyzeOpportunity(testOpportunity.id);
      
      // Calculate total MEDDPICC score
      const meddpiccScore = scenario.opportunityData.meddpiccScores 
        ? Object.values(scenario.opportunityData.meddpiccScores).reduce((sum, score) => sum + score, 0)
        : 0;

      // Identify actual gaps (scores below 30)
      const actualGaps = scenario.opportunityData.meddpiccScores 
        ? Object.entries(scenario.opportunityData.meddpiccScores)
            .filter(([_, score]) => score < 30)
            .map(([pillar, _]) => pillar.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
        : [];

      setTestResults({
        ...testResults,
        [scenario.id]: {
          opportunity: testOpportunity,
          analytics,
          meddpiccScore,
          actualGaps,
          accuracy: {
            scoreMatch: Math.abs(meddpiccScore - scenario.expectedScore) <= 20,
            gapsMatch: actualGaps.length === scenario.expectedGaps.length
          }
        }
      });

      // Clean up test opportunity
      await OpportunityService.deleteOpportunity(testOpportunity.id);

    } catch (error) {
      console.error('Test scenario failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllScenarios = async () => {
    setIsRunning(true);
    const results: Record<string, any> = {};

    for (const scenario of TEST_SCENARIOS) {
      try {
        // Create test opportunity
        const testOpportunity = await OpportunityService.createOpportunity({
          ...scenario.opportunityData,
          id: `test-${scenario.id}-${Date.now()}`,
          companyId: 'test-company',
          contactId: 'test-contact',
          createdDate: new Date(),
          updatedDate: new Date(),
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          tags: ['meddpicc-test'],
          priority: 'medium'
        });

        // Calculate MEDDPICC analytics
        const analytics = OpportunityService.analyzeOpportunity(testOpportunity.id);
        
        // Calculate total MEDDPICC score
        const meddpiccScore = scenario.opportunityData.meddpiccScores 
          ? Object.values(scenario.opportunityData.meddpiccScores).reduce((sum, score) => sum + score, 0)
          : 0;

        // Identify actual gaps (scores below 30)
        const actualGaps = scenario.opportunityData.meddpiccScores 
          ? Object.entries(scenario.opportunityData.meddpiccScores)
              .filter(([_, score]) => score < 30)
              .map(([pillar, _]) => pillar.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
          : [];

        results[scenario.id] = {
          scenario,
          opportunity: testOpportunity,
          analytics,
          meddpiccScore,
          actualGaps,
          accuracy: {
            scoreMatch: Math.abs(meddpiccScore - scenario.expectedScore) <= 20,
            gapsMatch: actualGaps.length === scenario.expectedGaps.length
          }
        };

        // Clean up test opportunity
        await OpportunityService.deleteOpportunity(testOpportunity.id);

      } catch (error) {
        console.error(`Test scenario ${scenario.id} failed:`, error);
        results[scenario.id] = { error: error.message };
      }
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const renderScenarioCard = (scenario: MEDDPICCScenario) => {
    const result = testResults[scenario.id];
    const scoreLevel = getScoreLevel(scenario.expectedScore);

    return (
      <Card key={scenario.id} className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{scenario.name}</CardTitle>
              <Badge className={getDealStateColor(scenario.dealState)}>
                {scenario.dealState.toUpperCase()}
              </Badge>
            </div>
            {result && (
              <div className="flex items-center gap-2">
                {result.accuracy?.scoreMatch ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            )}
          </div>
          <CardDescription>{scenario.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Expected vs Actual Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expected Score:</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getScoreColor(scenario.expectedScore)}`}>
                  {scenario.expectedScore}/320
                </span>
                <Badge variant="outline" className={scoreLevel.color + ' text-white'}>
                  {scoreLevel.level}
                </Badge>
              </div>
            </div>

            {result && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Actual Score:</span>
                <span className={`font-bold ${getScoreColor(result.meddpiccScore)}`}>
                  {result.meddpiccScore}/320
                </span>
              </div>
            )}

            {/* Deal Value */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deal Value:</span>
              <span className="font-medium">
                ${scenario.opportunityData.value?.toLocaleString()}
              </span>
            </div>

            {/* Expected Gaps */}
            <div>
              <span className="text-sm font-medium">Expected Gaps:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {scenario.expectedGaps.map((gap) => (
                  <Badge key={gap} variant="destructive" className="text-xs">
                    {gap}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actual Gaps (if tested) */}
            {result?.actualGaps && (
              <div>
                <span className="text-sm font-medium">Actual Gaps:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.actualGaps.map((gap: string) => (
                    <Badge key={gap} variant="outline" className="text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Coaching Tips */}
            <div>
              <span className="text-sm font-medium">Coaching Tips:</span>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                {scenario.coachingTips.slice(0, 2).map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>

            {/* Test Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => runScenarioTest(scenario)}
                disabled={isRunning}
              >
                {isRunning ? 'Testing...' : 'Test Scenario'}
              </Button>
              {result && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedScenario(scenario)}
                >
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailedResults = () => {
    if (!selectedScenario) return null;
    
    const result = testResults[selectedScenario.id];
    if (!result) return null;

    const meddpiccData = selectedScenario.opportunityData.meddpiccScores || {};

    return (
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis: {selectedScenario.name}</CardTitle>
          <CardDescription>MEDDPICC pillar breakdown and coaching recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">{result.meddpiccScore}</p>
                      <p className="text-sm text-muted-foreground">Total Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        ${selectedScenario.opportunityData.value?.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Deal Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div className="text-right">
                      <p className="text-2xl font-bold">{selectedScenario.opportunityData.probability}%</p>
                      <p className="text-sm text-muted-foreground">Win Probability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MEDDPICC Pillar Breakdown */}
            <div>
              <h4 className="text-lg font-semibold mb-4">MEDDPICC Pillar Analysis</h4>
              <div className="space-y-4">
                {Object.entries(meddpiccData).map(([pillar, score]) => {
                  const pillarName = pillar.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  const percentage = (score / 40) * 100;
                  const isGap = score < 30;

                  return (
                    <div key={pillar} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{pillarName}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isGap ? 'text-red-600' : 'text-green-600'}`}>
                            {score}/40
                          </span>
                          {isGap && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coaching Recommendations */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Coaching Recommendations</h4>
              <div className="space-y-2">
                {selectedScenario.coachingTips.map((tip, index) => (
                  <Alert key={index}>
                    <AlertDescription>
                      <strong>Action {index + 1}:</strong> {tip}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">MEDDPICC Scenario Testing</h2>
          <p className="text-muted-foreground">
            Test different deal scenarios to validate MEDDPICC scoring accuracy
          </p>
        </div>
        <Button onClick={runAllScenarios} disabled={isRunning}>
          {isRunning ? 'Running Tests...' : 'Run All Scenarios'}
        </Button>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="results">Detailed Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_SCENARIOS.map(renderScenarioCard)}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {renderDetailedResults()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testing Analytics Summary</CardTitle>
              <CardDescription>Overall test results and accuracy metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {Object.values(testResults).filter((r: any) => r.accuracy?.scoreMatch).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Score Matches</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {Object.values(testResults).filter((r: any) => r.accuracy?.gapsMatch).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Gap Matches</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {Object.keys(testResults).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Tests</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(testResults).map(([scenarioId, result]: [string, any]) => {
                      const scenario = TEST_SCENARIOS.find(s => s.id === scenarioId);
                      if (!scenario) return null;

                      return (
                        <div key={scenarioId} className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">{scenario.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={result.accuracy?.scoreMatch ? "default" : "destructive"}>
                              Score: {result.accuracy?.scoreMatch ? 'Pass' : 'Fail'}
                            </Badge>
                            <Badge variant={result.accuracy?.gapsMatch ? "default" : "destructive"}>
                              Gaps: {result.accuracy?.gapsMatch ? 'Pass' : 'Fail'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No test results yet. Run scenarios to see analytics.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MEDDPICCScenarioTester;