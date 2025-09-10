import { useState } from 'react';
import { OpportunityDetailView } from './OpportunityDetailView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OpportunityTestView() {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

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
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Opportunity Detail View</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Click on any of the sample opportunities below to test the new detail view:
          </p>
          
          <div className="flex gap-2">
            {sampleOpportunityIds.map((id) => (
              <Button
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