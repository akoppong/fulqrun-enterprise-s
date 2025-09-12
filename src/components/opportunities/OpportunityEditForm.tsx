/**
 * OpportunityEditForm.tsx
 * 
 * Legacy wrapper for backward compatibility.
 * This component redirects to the ModernOpportunityEditForm for improved functionality.
 */

import { ModernOpportunityEditForm } from './ModernOpportunityEditForm';
import { Opportunity } from '@/lib/types';

interface OpportunityEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  onSubmit?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
  mode?: 'create' | 'edit';
}

/**
 * Legacy OpportunityEditForm component
 * @deprecated Use ModernOpportunityEditForm directly for new implementations
 */
export function OpportunityEditForm(props: OpportunityEditFormProps) {
  // Forward all props to the modern implementation
  return <ModernOpportunityEditForm {...props} />;
}