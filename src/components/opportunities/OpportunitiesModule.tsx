import { useState, useEffect, useMemo, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, User } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { OpportunitiesDashboard } from './OpportunitiesDashboard';
import { OpportunitiesListView } from './OpportunitiesListView';
import { OpportunityDetailView } from './OpportunityDetailView';
import { UnifiedOpportunityPage } from './UnifiedOpportunityPage';
import { UnifiedOpportunityForm } from '../unified/UnifiedOpportunityForm';
import { UnifiedOpportunityDetail } from '../unified/UnifiedOpportunityDetail';
import { MEDDPICCScenarioTester } from './MEDDPICCScenarioTester';
import { OpportunityTabsTest } from './OpportunityTabsTest';
import { OpportunityDetailTabsValidator } from './OpportunityDetailTabsValidator';
import { EnhancedOpportunityCreatorDemo } from './EnhancedOpportunityCreatorDemo';
import { OpportunitiesModuleTest } from './OpportunitiesModuleTest';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface OpportunitiesModuleProps {
  user: User;
  initialView?: string;
  initialData?: any;
}

type OpportunityView = 'dashboard' | 'list' | 'detail' | 'create' | 'edit' | 'meddpicc-test' | 'tabs-test' | 'tabs-validator' | 'enhanced-demo' | 'diagnostics';

export function OpportunitiesModule({ user, initialView = 'dashboard', initialData }: OpportunitiesModuleProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [currentView, setCurrentView] = useState<OpportunityView>(
    (initialView as OpportunityView) || 'dashboard'
  );
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(
    initialData?.opportunityId || null
  );
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  // Ensure opportunities is always an array with more robust checking
  const safeOpportunities = useMemo(() => {
    if (Array.isArray(opportunities)) {
      return opportunities;
    }
    
    // Handle case where opportunities might be an object with data property
    if (opportunities && typeof opportunities === 'object' && 'data' in opportunities) {
      const data = (opportunities as any).data;
      if (Array.isArray(data)) {
        return data;
      }
    }
    
    // Default to empty array
    return [];
  }, [opportunities]);

  // Add ref to track initialization
  const initializationRef = useRef(false);

  // Initialize demo data
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    const initializeData = async () => {
      try {
        if (safeOpportunities.length === 0) {
          console.log('OpportunitiesModule: Initializing sample data...');
          await OpportunityService.initializeSampleData();
          const stored = await OpportunityService.getAllOpportunities(); // This should be awaited
          console.log('OpportunitiesModule: Setting opportunities:', {
            type: typeof stored,
            isArray: Array.isArray(stored),
            length: Array.isArray(stored) ? stored.length : 'N/A'
          });
          if (Array.isArray(stored) && stored.length > 0) {
            setOpportunities(stored);
            initializationRef.current = true;
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
  }, []); // Empty dependency array to run only once

  const handleViewChange = (view: string, data?: any) => {
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
      
      case 'meddpicc-test':
        setCurrentView('meddpicc-test');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'tabs-test':
        setCurrentView('tabs-test');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'tabs-validator':
        setCurrentView('tabs-validator');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'enhanced-demo':
        setCurrentView('enhanced-demo');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
        break;
      
      case 'diagnostics':
        setCurrentView('diagnostics');
        setSelectedOpportunityId(null);
        setEditingOpportunity(null);
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
      if (Array.isArray(updatedOpportunities)) {
        setOpportunities(updatedOpportunities);
      }
      
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
    // Ensure we always have valid opportunities data
    const validOpportunities = Array.isArray(opportunities) ? opportunities : [];
    
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
        
        // Safe array find operation
        const selectedOpportunity = validOpportunities.find(opp => opp && opp.id === selectedOpportunityId);
        
        if (!selectedOpportunity) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Opportunity not found</h3>
                <p className="text-muted-foreground mb-4">
                  The selected opportunity could not be found.
                </p>
                <button onClick={() => setCurrentView('list')} className="text-primary hover:underline">
                  Browse opportunities
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <EnhancedErrorBoundary context="UnifiedOpportunityDetail">
            <UnifiedOpportunityDetail 
              opportunity={selectedOpportunity}
              onUpdate={(updatedOpportunity) => {
                const currentOpportunities = Array.isArray(opportunities) ? opportunities : [];
                setOpportunities(prev => {
                  const safePrev = Array.isArray(prev) ? prev : [];
                  return safePrev.map(opp => opp.id === updatedOpportunity.id ? updatedOpportunity : opp);
                });
              }}
              onClose={handleBack}
              mode="page"
              source="opportunities"
            />
          </EnhancedErrorBoundary>
        );
      
      case 'create':
        return (
          <EnhancedErrorBoundary context="UnifiedOpportunityForm">
            <UnifiedOpportunityForm
              isOpen={false}
              onClose={handleFormCancel}
              onSave={handleSave}
              editingOpportunity={null}
              user={user}
              mode="page"
              source="opportunities"
            />
          </EnhancedErrorBoundary>
        );
      
      case 'edit':
        return (
          <EnhancedErrorBoundary context="EditUnifiedOpportunityForm">
            <UnifiedOpportunityForm
              isOpen={false}
              onClose={handleFormCancel}
              onSave={handleSave}
              editingOpportunity={editingOpportunity}
              user={user}
              mode="page"
              source="opportunities"
            />
          </EnhancedErrorBoundary>
        );
      
      case 'meddpicc-test':
        return (
          <EnhancedErrorBoundary context="MEDDPICCScenarioTester">
            <MEDDPICCScenarioTester />
          </EnhancedErrorBoundary>
        );
      
      case 'tabs-test':
        return (
          <EnhancedErrorBoundary context="OpportunityTabsTest">
            <OpportunityTabsTest />
          </EnhancedErrorBoundary>
        );
      
      case 'tabs-validator':
        return (
          <EnhancedErrorBoundary context="OpportunityDetailTabsValidator">
            <OpportunityDetailTabsValidator />
          </EnhancedErrorBoundary>
        );
      
      case 'enhanced-demo':
        return (
          <EnhancedErrorBoundary context="EnhancedOpportunityCreatorDemo">
            <EnhancedOpportunityCreatorDemo user={user} />
          </EnhancedErrorBoundary>
        );
      
      case 'diagnostics':
        return (
          <EnhancedErrorBoundary context="OpportunitiesModuleTest">
            <OpportunitiesModuleTest user={user} />
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
      <EnhancedErrorBoundary 
        context="OpportunitiesModule" 
        fallback={
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <h3 className="text-lg font-semibold">Module Error Detected</h3>
            <p className="text-muted-foreground text-center max-w-md">
              There was an error loading the opportunities module. This might be due to data corruption or initialization issues.
            </p>
            <Button 
              onClick={() => {
                // Clear potentially corrupted data and reload
                localStorage.removeItem('opportunities');
                window.location.reload();
              }}
            >
              Reset and Reload
            </Button>
          </div>
        }
      >
        {renderCurrentView()}
      </EnhancedErrorBoundary>
    </div>
  );
}

// Export available components
export {
  OpportunitiesDashboard,
  OpportunitiesListView,
  OpportunityDetailView,
  UnifiedOpportunityPage,
  MEDDPICCScenarioTester,
  OpportunityTabsTest,
  EnhancedOpportunityCreatorDemo
};