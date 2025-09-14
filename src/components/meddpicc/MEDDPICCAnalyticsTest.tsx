/**
 * MEDDPICC Analytics Test Component
 * Test component to verify MEDDPICC Analytics functionality
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MEDDPICCService } from '../../services/meddpicc-service';
import { MEDDPICCAnalyticsDashboard } from './MEDDPICCAnalytics';
import { 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  TrendingUp,
  Target
} from 'lucide-react';

export function MEDDPICCAnalyticsTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runTests = async () => {
    setIsRunningTests(true);
    const results = {
      dataInitialization: false,
      analyticsGeneration: false,
      sampleDataCount: 0,
      analyticsData: null,
      errors: []
    };

    try {
      // Test 1: Data Initialization
      console.log('Testing MEDDPICC data initialization...');
      await MEDDPICCService.initializeSampleData();
      results.dataInitialization = true;

      // Test 2: Analytics Generation
      console.log('Testing analytics generation...');
      const analytics = await MEDDPICCService.generateAnalytics();
      results.analyticsGeneration = true;
      results.analyticsData = analytics;
      
      // Test 3: Sample Data Count
      const assessments = await MEDDPICCService.getAllAssessments();
      results.sampleDataCount = assessments.length;

      console.log('All tests passed successfully!');
    } catch (error) {
      console.error('Test failed:', error);
      results.errors.push(error instanceof Error ? error.message : String(error));
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  const clearData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('meddpicc_assessments');
      localStorage.removeItem('meddpicc_sessions');
      setTestResults(null);
      console.log('MEDDPICC data cleared');
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">MEDDPICC Analytics Test Suite</h2>
          <p className="text-muted-foreground">
            Test and validate MEDDPICC analytics functionality
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          Test Environment
        </Badge>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Test Controls
          </CardTitle>
          <CardDescription>
            Initialize sample data and run tests to verify MEDDPICC analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runTests}
              disabled={isRunningTests}
              className="flex items-center gap-2"
            >
              {isRunningTests ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              {isRunningTests ? 'Running Tests...' : 'Run Analytics Tests'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={clearData}
              disabled={isRunningTests}
            >
              Clear Sample Data
            </Button>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="space-y-3">
              <h4 className="font-medium">Test Results:</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {testResults.dataInitialization ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Data Initialization</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.analyticsGeneration ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Analytics Generation</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults.sampleDataCount > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">Sample Data ({testResults.sampleDataCount} assessments)</span>
                </div>
              </div>

              {testResults.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Errors:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {testResults.errors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {testResults.analyticsData && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Analytics Summary:</strong>
                    <ul className="mt-1 text-sm space-y-1">
                      <li>• Strong Deals: {testResults.analyticsData.score_distribution.strong}</li>
                      <li>• Moderate Deals: {testResults.analyticsData.score_distribution.moderate}</li>
                      <li>• Weak Deals: {testResults.analyticsData.score_distribution.weak}</li>
                      <li>• Completion Rate: {testResults.analyticsData.completion_rate.toFixed(1)}%</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Analytics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Live MEDDPICC Analytics Dashboard
          </CardTitle>
          <CardDescription>
            This is the actual MEDDPICC Analytics component being tested
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MEDDPICCAnalyticsDashboard />
        </CardContent>
      </Card>
    </div>
  );
}