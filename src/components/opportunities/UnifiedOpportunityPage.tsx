import { UnifiedOpportunityForm } from './UnifiedOpportunityForm';
import { Opportunity, User } from '@/lib/types';

interface UnifiedOpportunityPageProps {
  user: User;
  onSave: (opportunity: Opportunity) => void;
  onCancel: () => void;
  editingOpportunity?: Opportunity | null;
  isEditing?: boolean;
}

export function UnifiedOpportunityPage({ 
  user, 
  onSave, 
  onCancel, 
  editingOpportunity,
  isEditing = false 
}: UnifiedOpportunityPageProps) {
  return (
    <UnifiedOpportunityForm
      isOpen={true} // Always open in page mode
      onClose={onCancel}
      onSave={onSave}
      editingOpportunity={editingOpportunity}
      user={user}
      mode="page"
    />
  );
}