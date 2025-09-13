import { useState, useEffect } from 'react';
import { Opportunity, User } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { OpportunitiesDashboard } from './OpportunitiesDashboard';
import { OpportunitiesListView } from './OpportunitiesListView';
import { OpportunityDetailView } from './OpportunityDetailView';
import { NewOpportunityMainView } from './NewOpportunityMainView';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { toast } from 'sonner';

interface OpportunitiesModuleProps {
  user: User;
  initialView?: string;
  initialData?: any;
}

type OpportunityView = 'dashboard' | 'list' | 'detail' | 'create' | 'edit';

export function CleanOpportunitiesModule({ user, initialView = 'dashboard', initialData }: OpportunitiesModuleProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentView, setCurrentView] = useState<OpportunityView>(
    (initialView as OpportunityView) || 'dashboard'
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(
    initialData?.opportunityId || null
  );
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize demo data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        console.log('CleanOpportunitiesModule: Initializing sample data...');
        
        // Always initialize sample data for demo purposes
        await OpportunityService.initializeSampleData();
        
        // Load opportunities
        const stored = OpportunityService.getAllOpportunities();
        console.log('CleanOpportunitiesModule: Setting opportunities:', {
          type: typeof stored,
          isArray: Array.isArray(stored),
          length: Array.isArray(stored) ? stored.length : 'N/A'
        });
        
        if (Array.isArray(stored)) {
          setOpportunities(stored);
        } else {
          console.error('CleanOpportunitiesModule: Invalid data from service');
          setOpportunities([]);
        }
      } catch (error) {
        console.error('CleanOpportunitiesModule: Failed to initialize data:', error);
        toast.error('Failed to load opportunities data');
        setOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []); // Only run once on mount

  const handleViewChange = (view: string, data?: any) => {
    console.log('CleanOpportunitiesModule: View change requested:', view, data);
    
    switch (view) {
      case 'opportunities-dashboard':
      case 'dashboard':
        setCurrentView('dashboard');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'opportunities-list':
      case 'list':
        setCurrentView('list');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'opportunity-detail':
      case 'detail':
        if (data?.opportunityId) {
          setCurrentView('detail');
          setSelectedOpportunityId(data.opportunityId);
          setEditingOpportunity(null);
        }
        break;
      
      case 'create':
        setCurrentView('create');
        setEditingOpportunity(null);
        setSelectedOpportunityId(null);
        break;
      
      case 'edit':
        if (data?.opportunity) {
          setCurrentView('edit');
          setEditingOpportunity(data.opportunity);
          setSelectedOpportunityId(null);
        }
        break;
      
      default:
        console.warn('Unknown view:', view);
    }
  };

  const handleCreateNew = () => {
    setEditingOpportunity(null);
    setCurrentView('create');
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setCurrentView('edit');
  };

  const handleSave = async (opportunity: Opportunity) => {
    try {
      // Refresh opportunities from storage
      const updatedOpportunities = OpportunityService.getAllOpportunities();
      setOpportunities(Array.isArray(updatedOpportunities) ? updatedOpportunities : []);
      
      // Navigate to detail view for the saved opportunity
      setSelectedOpportunityId(opportunity.id);
      setCurrentView('detail');
      setEditingOpportunity(null);
      
      toast.success(
        editingOpportunity 
          ? 'Opportunity updated successfully' 
          : 'Opportunity created successfully'
      );
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity');
    }
  };

  const handleFormCancel = () => {
    // Navigate back to previous view
    setEditingOpportunity(null);
    if (currentView === 'edit') {
      // If editing, go back to detail view
      setCurrentView('detail');
    } else {
      // If creating, go back to list view
      setCurrentView('list');
    }
  };

  const handleBack = () => {
    // Navigate back to previous view or default to list
    if (currentView === 'detail') {
      setCurrentView('list');
      setSelectedOpportunityId(null);
    } else {
      setCurrentView('dashboard');
    }
  };

  const renderCurrentView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading opportunities...</p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <EnhancedErrorBoundary context="OpportunitiesDashboard">
            <OpportunitiesDashboard 
              user={user} 
              onViewChange={handleViewChange}
              opportunities={opportunities}
            />
          </EnhancedErrorBoundary>
        );
      
      case 'list':
        return (
          <EnhancedErrorBoundary context="OpportunitiesListView">
            <OpportunitiesListView 
              user={user} 
              onViewChange={handleViewChange}
              onEdit={handleEdit}
              onCreateNew={handleCreateNew}
              opportunities={opportunities}
            />
          </EnhancedErrorBoundary>
        );
      
      case 'detail':
        if (!selectedOpportunityId) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No opportunity selected</h3>
                <p className="text-muted-foreground mb-4">
                  Please select an opportunity to view details.
                </p>
                <button onClick={() => setCurrentView('list')} className="text-primary hover:underline">
                  Browse opportunities
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <EnhancedErrorBoundary context="OpportunityDetailView">
            <OpportunityDetailView 
              opportunityId={selectedOpportunityId}
              user={user}
              onBack={handleBack}
              onEdit={handleEdit}
            />
          </EnhancedErrorBoundary>
        );
      
      case 'create':
        return (
          <EnhancedErrorBoundary context="NewOpportunityMainView">
            <NewOpportunityMainView
              user={user}
              onSave={handleSave}
              onCancel={handleFormCancel}
              editingOpportunity={null}
              isEditing={false}
            />
          </EnhancedErrorBoundary>
        );
      
      case 'edit':
        return (
          <EnhancedErrorBoundary context="EditOpportunityMainView">
            <NewOpportunityMainView
              user={user}
              onSave={handleSave}
              onCancel={handleFormCancel}
              editingOpportunity={editingOpportunity}
              isEditing={true}
            />
          </EnhancedErrorBoundary>
        );
      
      default:
        return (
          <EnhancedErrorBoundary context="OpportunitiesDashboard">
            <OpportunitiesDashboard 
              user={user} 
              onViewChange={handleViewChange}
              opportunities={opportunities}
            />
          </EnhancedErrorBoundary>
        );
    }
  };

  return (
    <div className="h-full">
      {renderCurrentView()}
    </div>
  );
}

// Export the clean module
export {
  CleanOpportunitiesModule as OpportunitiesModule,
  OpportunitiesDashboard,
  OpportunitiesListView,
  OpportunityDetailView,
  NewOpportunityMainView
};