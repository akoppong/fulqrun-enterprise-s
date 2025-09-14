/**
 * Test component for the OpportunityDetailView with MEDDPICC integration
 */

import React from 'react';
import { OpportunityDetailView } from './OpportunityDetailView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';

const testUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'sales-rep',
  avatar: '',
  permissions: []
};

const testOpportunityId = 'enhanced-test-opp-1';

export function OpportunityDetailViewTest() {
  const handleBack = () => {
    console.log('Back clicked');
  };

  const handleEdit = (opportunity: any) => {
    console.log('Edit opportunity:', opportunity);
  };

  const handleDelete = (opportunityId: string) => {
    console.log('Delete opportunity:', opportunityId);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Detail View Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Testing the OpportunityDetailView component with MEDDPICC integration
          </p>
          <Button 
            onClick={() => {
              // This will trigger the component to load
            }}
            variant="outline"
          >
            Test Opportunity Detail View
          </Button>
        </CardContent>
      </Card>

      <div className="w-full">
        <OpportunityDetailView
          opportunityId={testOpportunityId}
          user={testUser}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default OpportunityDetailViewTest;