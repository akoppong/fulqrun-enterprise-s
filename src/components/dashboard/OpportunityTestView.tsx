import { useState } from 'react';
import { OpportunityDetailView } from './OpportunityDetailView';
import { OpportunityDetailTest } from '@/components/opportunities/OpportunityDetailTest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, TestTube, Target } from '@phosphor-icons/react';

export function OpportunityTestView() {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');

  // Sample opportunity IDs from our sample data
  const sampleOpportunityIds = ['1', '2', '3'];

  const handleViewOpportunity = (id: string) => {
    setSelectedOpportunityId(id);
    setShowDetailView(true);
  };

  const handleBack = () => {
    setShowDetailView(false);
    setSelectedOpportunityId(null);
  };

  const handleEdit = () => {
    console.log('Edit opportunity:', selectedOpportunityId);
  };

  if (showDetailView && selectedOpportunityId) {
    return (
      <OpportunityDetailView
        opportunityId={selectedOpportunityId}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <div className="w-full max-w-none p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Opportunity Detail View Testing
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Test the opportunity detail view functionality with manual inspection and automated test suite.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Eye size={16} />
            Manual Testing
          </TabsTrigger>
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <TestTube size={16} />
            Automated Tests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} className="text-primary" />
                Manual Opportunity Detail View Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Click on any of the sample opportunities below to manually test the detail view functionality:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {sampleOpportunityIds.map((id) => (
                    <Card key={id} className="border-2 border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleViewOpportunity(id)}>
                      <CardContent className="p-6 text-center space-y-3">
                        <div className="text-lg font-semibold">
                          {id === '1' ? 'Enterprise Software Implementation' :
                           id === '2' ? 'Manufacturing Automation System' :
                           'Healthcare Data Analytics Platform'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {id === '1' ? '$450,000 • Engage Stage • 75%' :
                           id === '2' ? '$750,000 • Acquire Stage • 85%' :
                           '$280,000 • Prospect Stage • 35%'}
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Eye size={16} className="mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-3">What to Test:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h4 className="font-medium">Overview Tab:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Opportunity details display correctly</li>
                        <li>• Company and contact information shown</li>
                        <li>• Key metrics are formatted properly</li>
                        <li>• Tags and descriptions are readable</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">PEAK & MEDDPICC Tabs:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Stage progression displays correctly</li>
                        <li>• MEDDPICC scores calculate properly</li>
                        <li>• Qualification health is accurate</li>
                        <li>• Progress indicators work</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated" className="space-y-6">
          <OpportunityDetailTest />
        </TabsContent>
      </Tabs>
    </div>
  );
}
                key={id}
                variant="outline"
                onClick={() => handleViewOpportunity(id)}
              >
                View Opportunity {id}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}