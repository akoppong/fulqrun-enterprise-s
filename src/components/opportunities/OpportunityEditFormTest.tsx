import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OpportunityEditForm } from './OpportunityEditForm';
import { Opportunity } from '@/lib/types';

/**
 * Test component for OpportunityEditForm vertical scrolling
 * Tests the form's ability to handle long content with proper scrolling
 */
export function OpportunityEditFormTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Mock opportunity data for edit mode testing
  const mockOpportunity: Partial<Opportunity> = {
    id: 'test-opp-1',
    title: 'Enterprise Software Implementation',
    description: 'Large-scale enterprise software implementation for a Fortune 500 company. This is a complex project involving multiple departments, extensive customization requirements, and a multi-phase rollout plan spanning 18 months.',
    value: 750000,
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    companyId: 'test-company-1',
    contactId: 'test-contact-1',
    priority: 'high' as const,
    industry: 'technology',
    leadSource: 'referral',
    tags: ['enterprise', 'high-value', 'strategic', 'multi-phase', 'custom-implementation'],
    meddpicc: {
      metrics: 'ROI analysis shows 300% return within 2 years, cost savings of $2M annually',
      economicBuyer: 'CFO Sarah Williams, final decision maker for purchases over $500k',
      decisionCriteria: 'Security compliance, scalability, integration capabilities, vendor support',
      decisionProcess: 'Technical evaluation -> Security review -> Executive approval -> Legal review',
      paperProcess: 'MSA in place, SOW draft ready, procurement team engaged',
      implicatePain: 'Current system causing $50k monthly losses due to inefficiencies',
      champion: 'IT Director Michael Chen, strong advocate for our solution',
      score: 85
    }
  };

  const handleFormSubmit = (opportunityData: Partial<Opportunity>) => {
    console.log('Form submitted:', opportunityData);
    setIsOpen(false);
  };

  const openCreateForm = () => {
    setIsEditMode(false);
    setIsOpen(true);
  };

  const openEditForm = () => {
    setIsEditMode(true);
    setIsOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OpportunityEditForm Scrolling Test</CardTitle>
          <CardDescription>
            Test the vertical scrolling functionality of the opportunity edit form.
            The form should allow smooth scrolling through all sections regardless of content length.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={openCreateForm} className="w-full">
              Test Create New Opportunity
            </Button>
            <Button onClick={openEditForm} variant="outline" className="w-full">
              Test Edit Existing Opportunity
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Test Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click either button to open the form</li>
              <li>Verify that you can scroll through all form sections</li>
              <li>Check that the header stays fixed at the top</li>
              <li>Ensure the action buttons remain fixed at the bottom</li>
              <li>Test scrolling behavior on different screen sizes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <OpportunityEditForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleFormSubmit}
        opportunity={isEditMode ? mockOpportunity : null}
      />
    </div>
  );
}