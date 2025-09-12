/**
 * Test component to verify ModernOpportunityEditForm is working correctly
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModernOpportunityEditForm } from './ModernOpportunityEditForm';

export function TestModernForm() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (data: any) => {
    console.log('Form saved:', data);
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Test Modern Opportunity Form</h2>
      <Button onClick={() => setIsOpen(true)}>
        Open Modern Form
      </Button>
      
      <ModernOpportunityEditForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        mode="create"
      />
    </div>
  );
}