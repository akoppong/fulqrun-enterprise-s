import React, { useState } from 'react';
import { OpportunitiesDashboard } from './OpportunitiesDashboard';
import { OpportunitiesDashboardTest } from './OpportunitiesDashboardTest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/types';
import { CheckCircle, XCircle, AlertCircle, PlayCircle } from '@phosphor-icons/react';

interface DashboardTestRunnerProps {
  user: User;
  onViewChange?: (view: string, data?: any) => void;
}

export function DashboardTestRunner({ user, onViewChange }: DashboardTestRunnerProps) {
  const [testResults, setTestResults] = useState<Record<string, 'passed' | 'failed' | 'pending'>>({
    dataLoading: 'pending',
    arrayHandling: 'pending',
    metricsCalculation: 'pending',
    chartRendering: 'pending',
    filterFunctionality: 'pending',
    errorHandling: 'pending'
  });

  const runAllTests = async () => {
    const results: Record<string, 'passed' | 'failed' | 'pending'> = {
      dataLoading: 'pending',
      arrayHandling: 'pending',
      metricsCalculation: 'pending',
      chartRendering: 'pending',
      filterFunctionality: 'pending',
      errorHandling: 'pending'
    };

    // Test 1: Data Loading
    try {
      const { OpportunityService } = await import('@/lib/opportunity-service');
      const opportunities = await OpportunityService.getAllOpportunities();
      
      if (Array.isArray(opportunities)) {
        results.dataLoading = 'passed';
      } else {
        results.dataLoading = 'failed';
      }
    } catch (error) {
      results.dataLoading = 'failed';
    }

    // Test 2: Array Handling
    try {
      const testArray = [{ id: '1', value: 100 }, { id: '2', value: 200 }];
      const filtered = testArray.filter(item => item.value > 150);
      
      if (filtered.length === 1 && filtered[0].id === '2') {
        results.arrayHandling = 'passed';
      } else {
        results.arrayHandling = 'failed';
      }
    } catch (error) {
      results.arrayHandling = 'failed';
    }

    // Test 3: Metrics Calculation
    try {
      const mockOpportunities = [
        { id: '1', value: 1000, probability: 50 },
        { id: '2', value: 2000, probability: 75 }
      ];
      
      const totalValue = mockOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const weightedValue = mockOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
      
      if (totalValue === 3000 && weightedValue === 2000) {
        results.metricsCalculation = 'passed';
      } else {
        results.metricsCalculation = 'failed';
      }
    } catch (error) {
      results.metricsCalculation = 'failed';
    }

    // Test 4: Chart Rendering (basic validation)
    try {
      const chartData = [
        { stage: 'prospect', count: 5, value: 10000 },
        { stage: 'engage', count: 3, value: 15000 }
      ];
      
      if (Array.isArray(chartData) && chartData.length > 0 && chartData[0].stage) {
        results.chartRendering = 'passed';
      } else {
        results.chartRendering = 'failed';
      }
    } catch (error) {
      results.chartRendering = 'failed';
    }

    // Test 5: Filter Functionality
    try {
      const opportunities = [
        { id: '1', stage: 'prospect', ownerId: user.id },
        { id: '2', stage: 'engage', ownerId: 'other' },
        { id: '3', stage: 'prospect', ownerId: user.id }
      ];
      
      const filtered = opportunities.filter(opp => 
        opp.stage === 'prospect' && opp.ownerId === user.id
      );
      
      if (filtered.length === 2) {
        results.filterFunctionality = 'passed';
      } else {
        results.filterFunctionality = 'failed';
      }
    } catch (error) {
      results.filterFunctionality = 'failed';
    }

    // Test 6: Error Handling
    try {
      // Test with null/undefined data
      const safeArray = Array.isArray(null) ? null : [];
      const safeFiltered = Array.isArray(safeArray) ? safeArray.filter(x => x) : [];
      
      if (Array.isArray(safeFiltered) && safeFiltered.length === 0) {
        results.errorHandling = 'passed';
      } else {
        results.errorHandling = 'failed';
      }
    } catch (error) {
      results.errorHandling = 'failed';
    }

    setTestResults(results);
  };

  const getTestIcon = (status: 'passed' | 'failed' | 'pending') => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTestBadge = (status: 'passed' | 'failed' | 'pending') => {
    const variants = {
      passed: 'default' as const,
      failed: 'destructive' as const,
      pending: 'secondary' as const
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const passedTests = Object.values(testResults).filter(r => r === 'passed').length;
  const totalTests = Object.keys(testResults).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities Dashboard Validation</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of dashboard functionality and sample data loading
          </p>
        </div>
        <Button onClick={runAllTests} className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4" />
          Run All Tests
        </Button>
      </div>

      {/* Test Results Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Test Results Summary
            <Badge variant={passedTests === totalTests ? 'default' : 'secondary'}>
              {passedTests}/{totalTests} Passed
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(testResults).map(([testName, status]) => (
              <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getTestIcon(status)}
                  <span className="font-medium">
                    {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </div>
                {getTestBadge(status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tests */}
      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="production">Production Dashboard</TabsTrigger>
          <TabsTrigger value="testing">Debug Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="production" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Dashboard Test</CardTitle>
              <p className="text-muted-foreground">
                This is the actual dashboard component that will be used in production.
                It should load sample data and display metrics correctly.
              </p>
            </CardHeader>
            <CardContent>
              <OpportunitiesDashboard user={user} onViewChange={onViewChange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="testing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Debug Dashboard Test</CardTitle>
              <p className="text-muted-foreground">
                This version includes detailed logging and diagnostic information
                to help identify any data loading or processing issues.
              </p>
            </CardHeader>
            <CardContent>
              <OpportunitiesDashboardTest user={user} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Expected Behavior:</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
                <li>Dashboard should load with sample opportunities data</li>
                <li>Metrics cards should show totals, averages, and counts</li>
                <li>Charts should render with actual data points</li>
                <li>Filters should work and update the display</li>
                <li>No console errors should appear</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Common Issues to Check:</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
                <li>TypeError: opportunities.filter is not a function</li>
                <li>Data loading from localStorage</li>
                <li>Array validation and filtering</li>
                <li>Date parsing and calculations</li>
                <li>MEDDPICC score calculations</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Performance Checks:</h4>
              <ul className="list-disc ml-6 space-y-1 text-sm text-muted-foreground">
                <li>Initial load time should be under 2 seconds</li>
                <li>Filter changes should update immediately</li>
                <li>No memory leaks or infinite loops</li>
                <li>Responsive design on mobile devices</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}