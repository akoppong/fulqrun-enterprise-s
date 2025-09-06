import { useKV } from '@github/spark/hooks';
import { Opportunity, PEAK_STAGES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/crm-utils';
import { Plus, TrendUp } from '@phosphor-icons/react';
import { useState } from 'react';
import { OpportunityDialog } from './OpportunityDialog';

export function PipelineView() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

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

  const handleSaveOpportunity = (opportunityData: Partial<Opportunity>) => {
    if (selectedOpportunity) {
      // Update existing
      setOpportunities(current => 
        current.map(opp => 
          opp.id === selectedOpportunity.id 
            ? { ...opp, ...opportunityData, updatedAt: new Date() }
            : opp
        )
      );
    } else {
      // Create new
      const newOpportunity: Opportunity = {
        id: `opp-${Date.now()}`,
        companyId: 'company-1',
        contactId: 'contact-1',
        title: opportunityData.title || 'New Opportunity',
        description: opportunityData.description || '',
        value: opportunityData.value || 0,
        stage: opportunityData.stage || 'prospect',
        probability: opportunityData.probability || 25,
        expectedCloseDate: opportunityData.expectedCloseDate || new Date(),
        ownerId: 'user-1',
        meddpicc: opportunityData.meddpicc || {
          metrics: '',
          economicBuyer: '',
          decisionCriteria: '',
          decisionProcess: '',
          paperProcess: '',
          'implicate Pain': '',
          champion: '',
          score: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setOpportunities(current => [...current, newOpportunity]);
    }
    setIsDialogOpen(false);
  };

  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);

  return (
    <div className="space-y-6">
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
                        <h4 className="font-medium text-sm">{opportunity.title}</h4>
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

      <OpportunityDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveOpportunity}
        opportunity={selectedOpportunity}
      />
    </div>
  );
}