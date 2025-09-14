import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, User } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { ResponsiveOpportunityDetail } from './ResponsiveOpportunityDetail';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from '@phosphor-icons/react';

interface OpportunityDetailViewProps {
  opportunityId: string;
  user: User;
  onBack?: () => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunityId: string) => void;
}

export function OpportunityDetailView({ 
  opportunityId, 
  user, 
  onBack, 
  onEdit, 
  onDelete 
}: OpportunityDetailViewProps) {
  const [opportunities] = useKV<Opportunity[]>('opportunities', []);
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    const loadOpportunity = async () => {
      try {
        setLoading(true);
        
        // Ensure opportunities is an array before calling find
        const opportunitiesArray = Array.isArray(opportunities) ? opportunities : [];
        const found = opportunitiesArray.find((opp) => opp.id === opportunityId);
        
        if (found) {
          setOpportunity(found);
        } else {
          // Try to load from service as fallback
          const serviceOpportunity = OpportunityService.getOpportunity(opportunityId);
          setOpportunity(serviceOpportunity);
        }
      } catch (error) {
        console.error('Error loading opportunity:', error);
        setOpportunity(null);
      } finally {
        setLoading(false);
      }
    };

    if (opportunityId) {
      loadOpportunity();
    }
  }, [opportunityId, opportunities]);

  const handleEdit = () => {
    if (opportunity && onEdit) {
      onEdit(opportunity);
    }
  };

  const handleDelete = async () => {
    if (opportunity && onDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to delete the opportunity "${opportunity.name}"? This action cannot be undone.`
      );
      
      if (confirmed) {
        onDelete(opportunity.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Opportunity Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The opportunity you're looking for could not be found. It may have been deleted or moved.
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Opportunities
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <EnhancedErrorBoundary context="OpportunityDetailView">
      <div className="w-full h-full">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={handleEdit}>
                Edit Opportunity
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Use the existing ResponsiveOpportunityDetail component */}
        <ResponsiveOpportunityDetail
          opportunity={opportunity}
          isOpen={true}
          onClose={() => {
            // No-op since we're not using this as a modal
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showInMainContent={true}
        />
      </div>
    </EnhancedErrorBoundary>
  );
}

export default OpportunityDetailView;