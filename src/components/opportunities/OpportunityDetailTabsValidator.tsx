import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Users, Target, TrendingUp } from '@phosphor-icons/react';
import { OpportunityService } from '@/lib/opportunity-service';
import { Opportunity } from '@/lib/types';

interface TabValidation {
  tabId: string;
  name: string;
  status: 'loading' | 'success' | 'error' | 'warning';
  issues: string[];
  dataPoints: number;
}

export function OpportunityDetailTabsValidator() {
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [tabValidations, setTabValidations] = useState<TabValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Clock },
    { id: 'metrics', name: 'Metrics', icon: TrendingUp },
    { id: 'peak', name: 'PEAK', icon: Target },
    { id: 'meddpicc', name: 'MEDDPICC', icon: CheckCircle },
    { id: 'contact', name: 'Contact', icon: Users },
    { id: 'activities', name: 'Activities', icon: Clock }
  ];

  useEffect(() => {
    // Load first available opportunity
    const opportunities = OpportunityService.getAllOpportunities();
    if (opportunities.length > 0) {
      setSelectedOpportunity(opportunities[0]);
    }
  }, []);

  const validateTab = async (tabId: string, opportunity: Opportunity): Promise<TabValidation> => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate validation time
    
    const validation: TabValidation = {
      tabId,
      name: tabs.find(t => t.id === tabId)?.name || tabId,
      status: 'success',
      issues: [],
      dataPoints: 0
    };

    try {
      switch (tabId) {
        case 'overview':
          validation.dataPoints = 6; // Basic info fields
          if (!opportunity.name) validation.issues.push('Missing opportunity name');
          if (!opportunity.company) validation.issues.push('Missing company');
          if (!opportunity.value || opportunity.value <= 0) validation.issues.push('Invalid opportunity value');
          if (!opportunity.expectedCloseDate) validation.issues.push('Missing expected close date');
          break;

        case 'metrics':
          validation.dataPoints = 4; // Metrics calculations
          if (!opportunity.probability || opportunity.probability < 0 || opportunity.probability > 100) {
            validation.issues.push('Invalid probability value');
          }
          if (!opportunity.stage) validation.issues.push('Missing stage information');
          break;

        case 'peak':
          validation.dataPoints = 4; // PEAK scores
          const peakScores = opportunity.peakScores;
          if (!peakScores) {
            validation.issues.push('Missing PEAK scores');
          } else {
            if (typeof peakScores.prospect !== 'number') validation.issues.push('Invalid Prospect score');
            if (typeof peakScores.engage !== 'number') validation.issues.push('Invalid Engage score');
            if (typeof peakScores.acquire !== 'number') validation.issues.push('Invalid Acquire score');
            if (typeof peakScores.keep !== 'number') validation.issues.push('Invalid Keep score');
          }
          break;

        case 'meddpicc':
          validation.dataPoints = 8; // MEDDPICC fields
          const meddpiccScores = opportunity.meddpiccScores;
          if (!meddpiccScores) {
            validation.issues.push('Missing MEDDPICC scores');
          } else {
            Object.entries(meddpiccScores).forEach(([key, value]) => {
              if (typeof value !== 'number' || value < 0 || value > 100) {
                validation.issues.push(`Invalid ${key} score`);
              }
            });
          }
          break;

        case 'contact':
          validation.dataPoints = opportunity.contacts?.length || 0;
          if (!opportunity.primaryContact) validation.issues.push('Missing primary contact');
          if (!opportunity.contacts || opportunity.contacts.length === 0) {
            validation.issues.push('No contacts defined');
          }
          break;

        case 'activities':
          validation.dataPoints = opportunity.activities?.length || 0;
          if (!opportunity.activities || opportunity.activities.length === 0) {
            validation.issues.push('No activities recorded');
          } else {
            // Check for recent activity
            const lastActivity = opportunity.lastActivity;
            if (lastActivity) {
              const daysSinceLastActivity = Math.floor(
                (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysSinceLastActivity > 30) {
                validation.issues.push('No recent activity (>30 days)');
              }
            }
            
            // Check activity data integrity
            opportunity.activities.forEach((activity, index) => {
              if (!activity.date) {
                validation.issues.push(`Activity ${index + 1} missing date`);
              }
              if (!activity.type) {
                validation.issues.push(`Activity ${index + 1} missing type`);
              }
            });
          }
          break;
      }

      // Set status based on issues
      if (validation.issues.length === 0) {
        validation.status = 'success';
      } else if (validation.dataPoints > 0) {
        validation.status = 'warning';
      } else {
        validation.status = 'error';
      }

    } catch (error) {
      validation.status = 'error';
      validation.issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return validation;
  };

  const runAllValidations = async () => {
    if (!selectedOpportunity) return;

    setIsValidating(true);
    const validations: TabValidation[] = [];

    for (const tab of tabs) {
      const validation = await validateTab(tab.id, selectedOpportunity);
      validations.push(validation);
      setTabValidations([...validations]); // Update progressively
    }

    setIsValidating(false);
  };

  const getStatusIcon = (status: TabValidation['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TabValidation['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Validating...</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Opportunity Detail Tabs Validator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test all six opportunity detail tabs for consistent functionality and data display
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedOpportunity && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Testing Opportunity:</p>
              <p className="text-sm text-muted-foreground">
                {selectedOpportunity.name} - {selectedOpportunity.company}
              </p>
            </div>
          )}

          <Button 
            onClick={runAllValidations} 
            disabled={isValidating || !selectedOpportunity}
            className="w-full"
          >
            {isValidating ? 'Validating Tabs...' : 'Validate All Tabs'}
          </Button>
        </CardContent>
      </Card>

      {tabValidations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid grid-cols-6 w-full">
                {tabs.map((tab) => {
                  const validation = tabValidations.find(v => v.tabId === tab.id);
                  const IconComponent = tab.icon;
                  
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center gap-1 text-xs"
                    >
                      <IconComponent size={14} />
                      {tab.name}
                      {validation && (
                        <span className="ml-1">
                          {getStatusIcon(validation.status)}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {tabs.map((tab) => {
                const validation = tabValidations.find(v => v.tabId === tab.id);
                
                return (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{tab.name} Tab Validation</h3>
                      {validation && getStatusBadge(validation.status)}
                    </div>

                    {validation && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Data Points:</span>
                            <span className="ml-2 font-medium">{validation.dataPoints}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issues Found:</span>
                            <span className="ml-2 font-medium">{validation.issues.length}</span>
                          </div>
                        </div>

                        {validation.issues.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-destructive">Issues:</h4>
                            <ul className="space-y-1">
                              {validation.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {validation.status === 'success' && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-green-800">
                              <CheckCircle size={16} />
                              <span className="text-sm font-medium">Tab validation passed</span>
                            </div>
                            <p className="text-xs text-green-700 mt-1">
                              All data points are valid and properly formatted.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {!validation && isValidating && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} className="animate-spin" />
                        <span className="text-sm">Validating {tab.name} tab...</span>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!selectedOpportunity && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No opportunities available for testing. Please create an opportunity first.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}