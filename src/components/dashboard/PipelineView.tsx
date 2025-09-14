import { useKV } from '@github/spark/hooks';
import { Opportunity, PEAK_STAGES, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/crm-utils';
import { Plus, TrendUp } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { UnifiedOpportunityForm } from '../opportunities/UnifiedOpportunityForm';
import { RealtimeFinancialWidget } from './RealtimeFinancialWidget';
import { FinancialSummary } from './FinancialSummary';
import { OpportunityService } from '@/lib/opportunity-service';

interface PipelineViewProps {
  user?: User;
}

export function PipelineView({ user }: PipelineViewProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load opportunities from OpportunityService
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setIsLoading(true);
        console.log('PipelineView: Loading opportunities from service...');
        
        // Initialize sample data if needed
        await OpportunityService.initializeSampleData();
        
        // Load opportunities
        const allOpportunities = await OpportunityService.getAllOpportunities();
        console.log('PipelineView: Loaded opportunities:', {
          count: allOpportunities.length,
          opportunities: allOpportunities.map(o => ({ id: o.id, title: o.title, stage: o.stage }))
        });
        
        setOpportunities(allOpportunities);
      } catch (error) {
        console.error('PipelineView: Failed to load opportunities:', error);
        setOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpportunities();
  }, []);

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const getStageValue = (stage: string) => {
    return getOpportunitiesByStage(stage).reduce((sum, opp) => sum + opp.value, 0);
  };

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setIsDialogOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDialogOpen(true);
  };

  const handleSaveOpportunity = async (savedOpportunity: Opportunity) => {
    try {
      if (selectedOpportunity) {
        // Update existing
        console.log('PipelineView: Updating opportunity:', savedOpportunity.id);
        await OpportunityService.updateOpportunity(selectedOpportunity.id, savedOpportunity);
      } else {
        // Create new
        console.log('PipelineView: Creating new opportunity');
        await OpportunityService.createOpportunity(savedOpportunity);
      }
      
      // Reload opportunities from service
      const allOpportunities = await OpportunityService.getAllOpportunities();
      setOpportunities(allOpportunities);
      
      setIsDialogOpen(false);
      console.log('PipelineView: Successfully saved opportunity');
    } catch (error) {
      console.error('PipelineView: Failed to save opportunity:', error);
      // Show error to user but keep dialog open
    }
  };

  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);

  return (
    <div className="w-full h-full space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Loading pipeline data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Sales Pipeline</h2>
              <p className="text-muted-foreground">PEAK methodology-driven opportunity management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <Button onClick={handleCreateOpportunity}>
                <Plus size={20} className="mr-2" />
                New Opportunity
              </Button>
            </div>
          </div>

          {/* Debug info - remove in production */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Debug: {opportunities.length} opportunities loaded
            {opportunities.length > 0 && (
              <div>Stages: {opportunities.map(o => `${o.title || o.name}: ${o.stage}`).join(', ')}</div>
            )}
          </div>

          {/* Financial Dashboard Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RealtimeFinancialWidget opportunities={opportunities} />
            <FinancialSummary opportunities={opportunities} />
          </div>

      {/* Pipeline Stage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>PEAK methodology-driven sales process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PEAK_STAGES.map((stage) => {
              const stageOpportunities = getOpportunitiesByStage(stage.value);
              const stageValue = getStageValue(stage.value);
              return (
                <div key={stage.value} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-1">{stageOpportunities.length}</div>
                  <div className="text-sm text-muted-foreground mb-2">{stage.label}</div>
                  <div className="text-sm font-medium text-primary">{formatCurrency(stageValue)}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {PEAK_STAGES.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.value);
          const stageValue = getStageValue(stage.value);

          return (
            <Card key={stage.value} className="h-fit">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stage.label}</CardTitle>
                  <Badge className={stage.color}>{stageOpportunities.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stage.description}</p>
                <div className="flex items-center gap-2">
                  <TrendUp size={16} className="text-primary" />
                  <span className="font-medium text-primary">{formatCurrency(stageValue)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {stageOpportunities.map((opportunity) => (
                  <Card 
                    key={opportunity.id} 
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleEditOpportunity(opportunity)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{opportunity.title || opportunity.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.probability}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-primary">
                          {formatCurrency(opportunity.value)}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
                {stageOpportunities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No opportunities in this stage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UnifiedOpportunityForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveOpportunity}
        editingOpportunity={selectedOpportunity}
        user={user || { id: 'user-1', name: 'Default User', email: 'user@example.com', role: 'rep' }}
        mode="dialog"
      />
        </>
      )}
    </div>
  );
}