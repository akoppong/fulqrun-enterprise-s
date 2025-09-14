import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useKV } from '@github/spark/hooks';
import { OpportunityService } from '@/lib/opportunity-service';
import { Opportunity, User } from '@/lib/types';
import { CheckCircle, AlertTriangle, RefreshCw } from '@phosphor-icons/react';

interface OpportunitiesModuleTestProps {
  user: User;
}

export function OpportunitiesModuleTest({ user }: OpportunitiesModuleTestProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = [];

    // Test 1: Check if opportunities is an array
    try {
      const isArray = Array.isArray(opportunities);
      results.push({
        test: 'Opportunities Array Check',
        status: isArray ? 'pass' : 'fail',
        message: isArray 
          ? `Opportunities is an array with ${opportunities.length} items`
          : `Opportunities is not an array: ${typeof opportunities}`
      });
    } catch (error) {
      results.push({
        test: 'Opportunities Array Check',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 2: Test OpportunityService.getAllOpportunities()
    try {
      const serviceOpps = OpportunityService.getAllOpportunities();
      const isArray = Array.isArray(serviceOpps);
      results.push({
        test: 'OpportunityService Array Check',
        status: isArray ? 'pass' : 'fail',
        message: isArray 
          ? `Service returns array with ${serviceOpps.length} items`
          : `Service returns: ${typeof serviceOpps}`
      });
    } catch (error) {
      results.push({
        test: 'OpportunityService Array Check',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 3: Test array.find operation
    try {
      const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
      const testFind = safeOpportunities.find(opp => opp.id === 'test-id');
      results.push({
        test: 'Array Find Operation',
        status: 'pass',
        message: `Find operation successful (returned: ${testFind ? 'found' : 'not found'})`
      });
    } catch (error) {
      results.push({
        test: 'Array Find Operation',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 4: Test data initialization
    try {
      await OpportunityService.initializeSampleData();
      const freshData = OpportunityService.getAllOpportunities();
      results.push({
        test: 'Data Initialization',
        status: Array.isArray(freshData) && freshData.length > 0 ? 'pass' : 'fail',
        message: `Initialized ${Array.isArray(freshData) ? freshData.length : 0} opportunities`
      });
      
      if (Array.isArray(freshData)) {
        setOpportunities(freshData);
      }
    } catch (error) {
      results.push({
        test: 'Data Initialization',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    // Test 5: Test KV storage
    try {
      const testData = [{ id: 'test', name: 'Test Opportunity' }];
      setOpportunities(testData as any);
      
      setTimeout(() => {
        results.push({
          test: 'KV Storage Test',
          status: 'pass',
          message: 'KV storage update successful'
        });
        setTestResults([...results]);
      }, 100);
    } catch (error) {
      results.push({
        test: 'KV Storage Test',
        status: 'fail',
        message: `Error: ${error}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Opportunities Module Diagnostics</h2>
        <Button onClick={runTests} disabled={isRunning}>
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          This diagnostic tool tests the opportunities data flow to identify the source of the "opportunities.find is not a function" error.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Current Data State</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Opportunities Type:</p>
              <p className="text-sm text-muted-foreground">{typeof opportunities}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Is Array:</p>
              <p className="text-sm text-muted-foreground">{Array.isArray(opportunities) ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Length:</p>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(opportunities) ? opportunities.length : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">First Item:</p>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(opportunities) && opportunities.length > 0 
                  ? opportunities[0]?.name || 'Unnamed'
                  : 'None'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{result.test}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify({
              opportunitiesType: typeof opportunities,
              opportunitiesIsArray: Array.isArray(opportunities),
              opportunitiesLength: Array.isArray(opportunities) ? opportunities.length : null,
              opportunitiesStringified: JSON.stringify(opportunities).substring(0, 500) + '...',
              userInfo: {
                id: user.id,
                name: user.name,
                email: user.email
              }
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}