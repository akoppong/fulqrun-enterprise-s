import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, User } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { OpportunitiesDashboard } from './OpportunitiesDashboard';
import { OpportunitiesListView } from './OpportunitiesListView';
import { OpportunityDetailView } from './OpportunityDetailView';
import { NewOpportunityForm } from './NewOpportunityForm';
import { DashboardTestRunner } from './DashboardTestRunner';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { toast } from 'sonner';

interface OpportunitiesModuleProps {
  user: User;
  initialView?: string;
  initialData?: any;
}

type OpportunityView = 'dashboard' | 'list' | 'detail' | 'create' | 'edit' | 'dashboard-test';

export function OpportunitiesModule({ user, initialView = 'dashboard', initialData }: OpportunitiesModuleProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [currentView, setCurrentView] = useState<OpportunityView>(
    (initialView as OpportunityView) || 'dashboard'
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(
    initialData?.opportunityId || null
  );
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Initialize demo data
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (opportunities.length === 0) {
          console.log('OpportunitiesModule: Initializing sample data...');
          await OpportunityService.initializeSampleData();
          const stored = await OpportunityService.getAllOpportunities();
          console.log('OpportunitiesModule: Setting opportunities:', {
            type: typeof stored,
            isArray: Array.isArray(stored),
            length: Array.isArray(stored) ? stored.length : 'N/A'
          });
          if (Array.isArray(stored)) {
            setOpportunities(stored);
          } else {
            console.error('OpportunitiesModule: Invalid data from service');
            setOpportunities([]);
          }
        }
      } catch (error) {
        console.error('OpportunitiesModule: Failed to initialize data:', error);
        toast.error('Failed to load opportunities data');
        setOpportunities([]);
      }
    };

    initializeData();
  }, [opportunities.length, setOpportunities]);

  const handleViewChange = (view: string, data?: any) => {
    switch (view) {
      case 'opportunities-dashboard':
      case 'dashboard':
        setCurrentView('dashboard');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'dashboard-test':
        setCurrentView('dashboard-test');
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
        setShowCreateForm(true);
        setEditingOpportunity(null);
        break;
      
      case 'edit':
        if (data?.opportunity) {
          setEditingOpportunity(data.opportunity);
          setShowCreateForm(true);
        }
        break;
      
      default:
        console.warn('Unknown view:', view);
    }
  };

  const handleCreateNew = () => {
    setEditingOpportunity(null);
    setShowCreateForm(true);
  };

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setShowCreateForm(true);
  };

  const handleSave = async (opportunity: Opportunity) => {
    try {
      // Refresh opportunities from storage
      const updatedOpportunities = OpportunityService.getAllOpportunities();
      setOpportunities(updatedOpportunities);
      
      // Close form
      setShowCreateForm(false);
      setEditingOpportunity(null);
      
      // Navigate to detail view for the saved opportunity
      setSelectedOpportunityId(opportunity.id);
      setCurrentView('detail');
      
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
    switch (currentView) {
      case 'dashboard':
        return (
          <EnhancedErrorBoundary context="OpportunitiesDashboard">
            <OpportunitiesDashboard 
              user={user} 
              onViewChange={handleViewChange}
            />
          </EnhancedErrorBoundary>
        );
      
      case 'dashboard-test':
        return (
          <EnhancedErrorBoundary context="DashboardTestRunner">
            <DashboardTestRunner 
              user={user} 
              onViewChange={handleViewChange}
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
      
      default:
        return (
          <EnhancedErrorBoundary context="OpportunitiesDashboard">
            <OpportunitiesDashboard 
              user={user} 
              onViewChange={handleViewChange}
            />
          </EnhancedErrorBoundary>
        );
    }
  };

  return (
    <div className="h-full">
      {renderCurrentView()}
      
      {/* Create/Edit Form Modal */}
      <NewOpportunityForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingOpportunity(null);
        }}
        onSave={handleSave}
        editingOpportunity={editingOpportunity}
        user={user}
      />
    </div>
  );
}

// Export individual components for specific use cases
export {
  OpportunitiesDashboard,
  OpportunitiesListView,
  OpportunityDetailView,
  NewOpportunityForm
};