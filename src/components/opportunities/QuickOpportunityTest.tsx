import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, Refresh } from '@phosphor-icons/react';
import { OpportunityService } from '@/lib/opportunity-service';
import { initializeSampleData } from '@/data/sample-opportunities';
import { toast } from 'sonner';

interface TestStep {
  name: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  message?: string;
  error?: string;
}

export function QuickOpportunityTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    { name: 'Initialize Sample Data', status: 'pending' },
    { name: 'Load Opportunities', status: 'pending' },
    { name: 'Load Companies', status: 'pending' },
    { name: 'Load Contacts', status: 'pending' },
    { name: 'Test Opportunity Analytics', status: 'pending' },
    { name: 'Test MEDDPICC Scoring', status: 'pending' },
    { name: 'Test Relationship Links', status: 'pending' }
  ]);

  const updateStepStatus = (index: number, status: TestStep['status'], message?: string, error?: string) => {
    setTestSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message, error } : step
    ));
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    setCurrentStep(0);

    try {
      // Step 1: Initialize Sample Data
      setCurrentStep(0);
      updateStepStatus(0, 'running');
      await new Promise(resolve => setTimeout(resolve, 500)); // Visual delay
      
      try {
        await initializeSampleData();
        updateStepStatus(0, 'pass', 'Sample data initialized successfully');
      } catch (error) {
        updateStepStatus(0, 'fail', 'Failed to initialize sample data', error instanceof Error ? error.message : 'Unknown error');
        setIsRunning(false);
        return;
      }

      // Step 2: Load Opportunities
      setCurrentStep(1);
      updateStepStatus(1, 'running');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const opportunities = await OpportunityService.getAllOpportunities();
        if (opportunities.length > 0) {
          updateStepStatus(1, 'pass', `Loaded ${opportunities.length} opportunities`);
        } else {
          updateStepStatus(1, 'fail', 'No opportunities found');
          setIsRunning(false);
          return;
        }
      } catch (error) {
        updateStepStatus(1, 'fail', 'Failed to load opportunities', error instanceof Error ? error.message : 'Unknown error');
        setIsRunning(false);
        return;
      }

      // Step 3: Load Companies
      setCurrentStep(2);
      updateStepStatus(2, 'running');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const companies = await OpportunityService.getAllCompanies();
        if (companies.length > 0) {
          updateStepStatus(2, 'pass', `Loaded ${companies.length} companies`);
        } else {
          updateStepStatus(2, 'fail', 'No companies found');
        }
      } catch (error) {
        updateStepStatus(2, 'fail', 'Failed to load companies', error instanceof Error ? error.message : 'Unknown error');
      }

      // Step 4: Load Contacts
      setCurrentStep(3);
      updateStepStatus(3, 'running');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const contacts = await OpportunityService.getAllContacts();
        if (contacts.length > 0) {
          updateStepStatus(3, 'pass', `Loaded ${contacts.length} contacts`);
        } else {
          updateStepStatus(3, 'fail', 'No contacts found');
        }
      } catch (error) {
        updateStepStatus(3, 'fail', 'Failed to load contacts', error instanceof Error ? error.message : 'Unknown error');
      }

      // Step 5: Test Opportunity Analytics
      setCurrentStep(4);
      updateStepStatus(4, 'running');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const opportunities = await OpportunityService.getAllOpportunities();
        if (opportunities.length > 0) {
          const analytics = await OpportunityService.analyzeOpportunity(opportunities[0].id);
          if (analytics) {
            updateStepStatus(4, 'pass', 'Analytics working correctly');
          } else {
            updateStepStatus(4, 'fail', 'Analytics returned null');
          }
        } else {
          updateStepStatus(4, 'fail', 'No opportunities to analyze');
        }
      } catch (error) {
        updateStepStatus(4, 'fail', 'Analytics test failed', error instanceof Error ? error.message : 'Unknown error');
      }

      // Step 6: Test MEDDPICC Scoring
      setCurrentStep(5);
      updateStepStatus(5, 'running');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const opportunities = await OpportunityService.getAllOpportunities();
        if (opportunities.length > 0) {
          const opp = opportunities[0];
          const score = opp.meddpicc?.score;
          if (typeof score === 'number' && score >= 0 && score <= 100) {
            updateStepStatus(5, 'pass', `MEDDPICC score: ${score}%`);
          } else {
            updateStepStatus(5, 'fail', `Invalid MEDDPICC score: ${score}`);
          }
        } else {
          updateStepStatus(5, 'fail', 'No opportunities to score');
        }
      } catch (error) {
        updateStepStatus(5, 'fail', 'MEDDPICC scoring failed', error instanceof Error ? error.message : 'Unknown error');
      }

      // Step 7: Test Relationship Links
      setCurrentStep(6);
      updateStepStatus(6, 'running');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      try {
        const opportunities = await OpportunityService.getAllOpportunities();
        if (opportunities.length > 0) {
          const oppWithRelations = await OpportunityService.getOpportunityWithRelations(opportunities[0].id);
          if (oppWithRelations?.company && oppWithRelations?.contact) {
            updateStepStatus(6, 'pass', 'Relationships linked correctly');
          } else {
            updateStepStatus(6, 'fail', 'Missing company or contact relationships');
          }
        } else {
          updateStepStatus(6, 'fail', 'No opportunities to test relationships');
        }
      } catch (error) {
        updateStepStatus(6, 'fail', 'Relationship test failed', error instanceof Error ? error.message : 'Unknown error');
      }

      setIsRunning(false);
      toast.success('Quick test completed!');
      
    } catch (error) {
      setIsRunning(false);
      toast.error('Test suite failed to complete');
      console.error('Test error:', error);
    }
  };

  const getStepIcon = (step: TestStep) => {
    switch (step.status) {
      case 'pending':
        return <Clock size={16} className="text-muted-foreground" />;
      case 'running':
        return <Refresh size={16} className="text-blue-500 animate-spin" />;
      case 'pass':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'fail':
        return <AlertTriangle size={16} className="text-red-500" />;
    }
  };

  const getStepColor = (step: TestStep) => {
    switch (step.status) {
      case 'pending':
        return 'text-muted-foreground';
      case 'running':
        return 'text-blue-600 font-medium';
      case 'pass':
        return 'text-green-600 font-medium';
      case 'fail':
        return 'text-red-600 font-medium';
    }
  };

  const passCount = testSteps.filter(step => step.status === 'pass').length;
  const failCount = testSteps.filter(step => step.status === 'fail').length;
  const totalSteps = testSteps.length;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          Quick Opportunity Test
        </h2>
        <p className="text-muted-foreground">
          Rapid verification of core opportunity functionality
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Test Progress</CardTitle>
            {!isRunning && (passCount + failCount > 0) && (
              <div className="flex items-center gap-2">
                <Badge variant={failCount > 0 ? 'destructive' : 'default'}>
                  {passCount}/{totalSteps} Passed
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {testSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                {getStepIcon(step)}
                <div className="flex-1 space-y-1">
                  <div className={`text-sm font-medium ${getStepColor(step)}`}>
                    {step.name}
                  </div>
                  {step.message && (
                    <div className="text-xs text-muted-foreground">
                      {step.message}
                    </div>
                  )}
                  {step.error && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      {step.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              onClick={runQuickTest} 
              disabled={isRunning}
              className="px-8"
            >
              {isRunning ? (
                <>
                  <Refresh size={16} className="mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Run Quick Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}