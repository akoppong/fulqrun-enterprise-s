import { EnhancedOpportunityCreator } from './EnhancedOpportunityCreator';
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
    <EnhancedOpportunityCreator
      user={user}
      onSave={onSave}
      onCancel={onCancel}
      editingOpportunity={editingOpportunity}
    />
  );
}