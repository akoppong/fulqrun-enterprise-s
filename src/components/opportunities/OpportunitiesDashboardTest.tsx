import React, { useState, useEffect } from 'react';
import { OpportunityService } from '@/lib/opportunity-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/crm-utils';
import { Opportunity, User } from '@/lib/types';
import { OpportunitiesDashboardDiagnostics, type DiagnosticResult } from '@/lib/opportunities-dashboard-diagnostics';
import { CheckCircle, XCircle, Warning, PlayCircle, TestTube } from '@phosphor-icons/react';

interface OpportunitiesDashboardTestProps {
  user: User;
}

export function OpportunitiesDashboardTest({ user }: OpportunitiesDashboardTestProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const runComprehensiveDiagnostics = async () => {
    setRunningDiagnostics(true);
    addTestResult('Starting comprehensive diagnostics...');
    
    try {
      const results = await OpportunitiesDashboardDiagnostics.runFullDiagnostics();
      setDiagnosticResults(results);
      
      const passCount = results.filter(r => r.status === 'pass').length;
      const failCount = results.filter(r => r.status === 'fail').length;
      const warnCount = results.filter(r => r.status === 'warning').length;
      
      addTestResult(`Diagnostics completed: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
    } catch (error) {
      addTestResult(`Diagnostics failed: ${error}`);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const quickHealthCheck = async () => {
    addTestResult('Running quick health check...');
    
    try {
      const health = await OpportunitiesDashboardDiagnostics.quickHealthCheck();
      addTestResult(`Health status: ${health.status}`);
      
      if (health.issues.length > 0) {
        health.issues.forEach(issue => addTestResult(`Issue: ${issue}`));
      }
    } catch (error) {
      addTestResult(`Health check failed: ${error}`);
    }
  };

  const testDataLoading = async () => {
    try {
      setLoading(true);
      addTestResult('Starting data loading test...');

      // Clear any existing data
      localStorage.removeItem('opportunities');
      addTestResult('Cleared existing localStorage data');

      // Get opportunities from service
      const result = await OpportunityService.getAllOpportunities();
      addTestResult(`Service returned: ${typeof result} (${Array.isArray(result) ? 'Array' : 'Object'})`);
      
      if (Array.isArray(result)) {
        addTestResult(`Array length: ${result.length}`);
        setOpportunities(result);
        
        if (result.length > 0) {
          addTestResult(`First opportunity: ${JSON.stringify({
            id: result[0].id,
            title: result[0].title,
            value: result[0].value,
            stage: result[0].stage
          })}`);
        }
      } else {
        addTestResult(`Non-array result: ${JSON.stringify(result)}`);
        setOpportunities([]);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      addTestResult(`Error: ${message}`);
    } finally {
      setLoading(false);
      addTestResult('Test completed');
    }
  };

  const testFilterFunction = () => {
    try {
      addTestResult('Testing array filter function...');
      
      const testArray = [
        { id: '1', title: 'Test 1', value: 1000, stage: 'prospect' },
        { id: '2', title: 'Test 2', value: 2000, stage: 'engage' }
      ];
      
      const filtered = testArray.filter(item => item.value > 1500);
      addTestResult(`Filter test successful: ${filtered.length} items`);
      
      // Test with opportunities array
      if (Array.isArray(opportunities)) {
        const oppFiltered = opportunities.filter(opp => opp && opp.id);
        addTestResult(`Opportunities filter test: ${oppFiltered.length} valid opportunities`);
      } else {
        addTestResult(`Opportunities is not an array: ${typeof opportunities}`);
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addTestResult(`Filter test error: ${message}`);
    }
  };

  const calculateMetrics = () => {
    try {
      addTestResult('Calculating metrics...');
      
      if (!Array.isArray(opportunities)) {
        addTestResult(`Cannot calculate metrics: opportunities is ${typeof opportunities}`);
        return { total: 0, count: 0, average: 0 };
      }

      const totalValue = opportunities.reduce((sum, opp) => {
        const value = Number(opp.value) || 0;
        return sum + value;
      }, 0);

      addTestResult(`Total value calculated: ${totalValue}`);
      
      return {
        total: totalValue,
        count: opportunities.length,
        average: opportunities.length > 0 ? totalValue / opportunities.length : 0
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addTestResult(`Metrics calculation error: ${message}`);
      return { total: 0, count: 0, average: 0 };
    }
  };

  useEffect(() => {
    testDataLoading();
    quickHealthCheck();
  }, []);

  const metrics = calculateMetrics();

  const getDiagnosticIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <Warning className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getDiagnosticBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      pass: 'default' as const,
      fail: 'destructive' as const,
      warning: 'secondary' as const
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Opportunities Dashboard Test</h1>
        <div className="flex gap-2">
          <Button onClick={testDataLoading} disabled={loading}>
            {loading ? 'Loading...' : 'Reload Data'}
          </Button>
          <Button onClick={testFilterFunction} variant="outline">
            Test Filters
          </Button>
          <Button 
            onClick={runComprehensiveDiagnostics} 
            disabled={runningDiagnostics}
            className="flex items-center gap-2"
          >
            <TestTube className="w-4 h-4" />
            {runningDiagnostics ? 'Running...' : 'Full Diagnostics'}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Data Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Loading: {loading ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Type: {typeof opportunities}</p>
              <p>Is Array: {Array.isArray(opportunities) ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(metrics.total)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Deal Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(metrics.average)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Results */}
      {diagnosticResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Comprehensive Diagnostic Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnosticResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDiagnosticIcon(result.status)}
                    <div>
                      <h4 className="font-medium">{result.test}</h4>
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-blue-600">Show data</summary>
                          <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  {getDiagnosticBadge(result.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunities List */}
      {Array.isArray(opportunities) && opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.slice(0, 3).map((opp, index) => (
                <div key={opp.id || index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{opp.title || 'No Title'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Stage: {opp.stage || 'Unknown'} | ID: {opp.id || 'No ID'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(opp.value || 0)}</p>
                      <p className="text-sm text-muted-foreground">{opp.probability || 0}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-xs font-mono p-2 bg-muted rounded">
                {result}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}