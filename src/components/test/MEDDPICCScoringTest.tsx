/**
 * MEDDPICC Scoring Integration Test Component
 * 
 * This component verifies that MEDDPICC scoring works correctly
 * across the application, including opportunity integration.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Users,
  Shield
} from 'lucide-react';

// Import MEDDPICC services and types
import { type MEDDPICCAssessment } from '../../services/meddpicc-service';
import { calculateTotalScore, getScoreLevel, MEDDPICC_CONFIG } from '../../data/meddpicc-config';
import { MEDDPICCSummary } from '@/components/meddpicc';
import { OpportunityService } from '../../lib/opportunity-service';
import { useKV } from '@github/spark/hooks';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function MEDDPICCScoringTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testAssessment, setTestAssessment] = useState<MEDDPICCAssessment | null>(null);
  const [opportunities] = useKV('opportunities', []);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    try {
      // Test 1: MEDDPICC Configuration Availability
      try {
        if (MEDDPICC_CONFIG && MEDDPICC_CONFIG.pillars) {
          results.push({
            name: 'MEDDPICC Configuration',
            status: 'success',
            message: `Configuration loaded with ${MEDDPICC_CONFIG.pillars.length} pillars`,
            details: { 
              version: MEDDPICC_CONFIG.version,
              pillarCount: MEDDPICC_CONFIG.pillars.length,
              pillars: MEDDPICC_CONFIG.pillars.map(p => p.title)
            }
          });
        } else {
          results.push({
            name: 'MEDDPICC Configuration',
            status: 'error',
            message: 'MEDDPICC configuration not available',
          });
        }
      } catch (error) {
        results.push({
          name: 'MEDDPICC Configuration',
          status: 'error',
          message: `Configuration load failed: ${error}`,
        });
      }

      // Test 2: Score Calculation Functions
      try {
        const mockAnswers = {
          'metrics-q1': { score: 30, pillar: 'metrics' },
          'economic_buyer-q1': { score: 25, pillar: 'economic_buyer' },
          'decision_criteria-q1': { score: 20, pillar: 'decision_criteria' }
        };
        
        const totalScore = calculateTotalScore(mockAnswers);
        const scoreLevel = getScoreLevel(totalScore);
        
        // Verify score is calculated
        if (typeof totalScore === 'number' && totalScore >= 0) {
          results.push({
            name: 'Score Calculation Functions',
            status: 'success',
            message: `Score calculation working: ${totalScore} points, Level: ${scoreLevel}`,
            details: { totalScore, scoreLevel, mockAnswers }
          });
        } else {
          results.push({
            name: 'Score Calculation Functions',
            status: 'error',
            message: `Invalid score result: ${totalScore}`,
            details: { totalScore, scoreLevel }
          });
        }
      } catch (error) {
        results.push({
          name: 'Score Calculation Functions',
          status: 'error',
          message: `Score calculation failed: ${error}`,
        });
      }

      // Test 3: Create Test Assessment
      try {
        const testAssessmentData: MEDDPICCAssessment = {
          id: `test-assessment-${Date.now()}`,
          opportunity_id: 'test-opportunity',
          answers: [
            {
              pillar: 'metrics',
              question_id: 'metrics-q1',
              answer_value: 'yes',
              score: 30,
              timestamp: new Date(),
              confidence_level: 'high'
            },
            {
              pillar: 'economic_buyer',
              question_id: 'economic_buyer-q1',
              answer_value: 'partial',
              score: 15,
              timestamp: new Date(),
              confidence_level: 'medium'
            }
          ],
          pillar_scores: {
            metrics: 30,
            economic_buyer: 15,
            decision_criteria: 0,
            decision_process: 0,
            paper_process: 0,
            implicate_the_pain: 0,
            champion: 0,
            competition: 0
          },
          total_score: 45,
          confidence_score: 75,
          risk_level: 'medium',
          stage_readiness: {
            prospect: true,
            engage: false,
            acquire: false,
            keep: false
          },
          coaching_actions: ['Identify economic buyer', 'Quantify metrics'],
          competitive_strengths: ['Strong technical fit'],
          areas_of_concern: ['Budget authority unclear'],
          last_updated: new Date(),
          created_by: 'test-user',
          version: 1
        };

        setTestAssessment(testAssessmentData);

        results.push({
          name: 'Test Assessment Creation',
          status: 'success',
          message: 'Test MEDDPICC assessment created successfully',
          details: { assessmentId: testAssessmentData.id, totalScore: testAssessmentData.total_score }
        });
      } catch (error) {
        results.push({
          name: 'Test Assessment Creation',
          status: 'error',
          message: `Failed to create test assessment: ${error}`,
        });
      }

      // Test 4: Integration with Opportunities (Enhanced Test)
      try {
        const opportunityList = Array.isArray(opportunities) ? opportunities : [];
        
        if (opportunityList.length > 0) {
          const firstOpp = opportunityList[0];
          const hasMeddpiccField = firstOpp && typeof firstOpp.meddpicc !== 'undefined';
          
          // Test that we can extract MEDDPICC score from opportunity
          let meddpiccScore = 0;
          try {
            if (firstOpp.meddpicc && typeof firstOpp.meddpicc.score === 'number') {
              meddpiccScore = firstOpp.meddpicc.score;
            }
          } catch (scoreError) {
            console.warn('Error extracting MEDDPICC score:', scoreError);
          }
          
          results.push({
            name: 'Opportunity Integration',
            status: hasMeddpiccField ? 'success' : 'warning',
            message: hasMeddpiccField 
              ? `Opportunities have MEDDPICC integration (score: ${meddpiccScore})`
              : 'Opportunities missing MEDDPICC field',
            details: { 
              opportunityCount: opportunityList.length,
              firstOppId: firstOpp?.id,
              hasMeddpiccField,
              meddpiccScore,
              meddpiccStructure: firstOpp?.meddpicc ? Object.keys(firstOpp.meddpicc) : []
            }
          });
        } else {
          results.push({
            name: 'Opportunity Integration',
            status: 'warning',
            message: 'No opportunities found to test integration',
            details: { opportunityCount: 0 }
          });
        }
      } catch (error) {
        results.push({
          name: 'Opportunity Integration',
          status: 'error',
          message: `Integration test failed: ${error}`,
        });
      }

      // Test 5: Component Rendering Test
      try {
        // Test if MEDDPICCSummary component can be used (just check if it exists)
        const ComponentExists = typeof MEDDPICCSummary === 'function' || typeof MEDDPICCSummary === 'object';
        
        if (ComponentExists) {
          results.push({
            name: 'Component Availability',
            status: 'success',
            message: 'MEDDPICCSummary component is available for rendering',
            details: { componentType: typeof MEDDPICCSummary }
          });
        } else {
          results.push({
            name: 'Component Availability',
            status: 'error',
            message: 'MEDDPICCSummary component not available',
          });
        }
      } catch (error) {
        results.push({
          name: 'Component Availability',
          status: 'error',
          message: `Component availability check failed: ${error}`,
        });
      }

    } catch (globalError) {
      results.push({
        name: 'Global Test Error',
        status: 'error',
        message: `Unexpected error during testing: ${globalError}`,
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            MEDDPICC Scoring Integration Test
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Verify that MEDDPICC scoring works correctly across the application
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Tests...' : 'Run MEDDPICC Integration Tests'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results</h3>
              {testResults.map((result, index) => (
                <Alert key={index} className={getStatusColor(result.status)}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <AlertDescription>{result.message}</AlertDescription>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            Show Details
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {testAssessment && (
            <>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">Test Assessment Sample</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Score</span>
                    <Badge variant="outline">{testAssessment.total_score}/320</Badge>
                  </div>
                  <Progress value={(testAssessment.total_score / 320) * 100} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(testAssessment.pillar_scores).map(([pillar, score]) => (
                      <div key={pillar} className="flex justify-between">
                        <span className="capitalize">{pillar.replace('_', ' ')}</span>
                        <span>{score}/40</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-sm">MEDDPICC Summary Component Test</CardTitle>
                  <p className="text-xs text-muted-foreground">Testing the actual MEDDPICC Summary component with test data</p>
                </CardHeader>
                <CardContent>
                  <MEDDPICCSummary assessment={testAssessment} showActions={false} compact={true} />
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}