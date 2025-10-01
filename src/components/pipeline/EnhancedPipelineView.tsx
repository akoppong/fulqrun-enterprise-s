import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { 
  Opportunity, 
  PipelineConfiguration, 
  DealMovement, 
  StageMetrics,
  PEAK_STAGES 
} from '@/lib/types';
import { 
  createDefaultPipelineConfiguration, 
  calculateStageMetrics,
  generatePipelineAnalytics 
} from '@/lib/pipeline-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import { formatCurrency } from '@/lib/crm-utils';
import { 
  Plus, 
  TrendUp, 
  Clock, 
  Target, 
  Warning,
  CheckCircle,
  CurrencyDollar,
  Calendar,
  User,
  ChartBar
} from '@phosphor-icons/react';
import { UnifiedOpportunityForm } from '@/components/unified/UnifiedOpportunityForm';
import { toast } from 'sonner';

export function EnhancedPipelineView() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [dealMovements, setDealMovements] = useKV<DealMovement[]>('deal-movements', []);
  const [pipelineConfig] = useKV<PipelineConfiguration>('active-pipeline', createDefaultPipelineConfiguration());
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stageMetrics, setStageMetrics] = useState<Record<string, StageMetrics>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  // Ensure we have safe arrays
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate stage metrics
  useEffect(() => {
    const metrics: Record<string, StageMetrics> = {};
    pipelineConfig?.stages.forEach(stage => {
      const stageValue = getStageValue(stage.id);
      metrics[stage.id] = calculateStageMetrics(opportunities || [], dealMovements || [], stage.id);
    });
    setStageMetrics(metrics);
  }, [opportunities, dealMovements, pipelineConfig]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    
    // If dropped on a stage container, move the deal
    if (overId.startsWith('stage-')) {
      const opportunity = safeOpportunities.find(opp => opp.id === activeId);
      if (!opportunity) return;

      const targetStageValue = getStageValue(overId);
      const sourceStageValue = opportunity.stage;

      if (sourceStageValue !== targetStageValue) {
        // Update opportunity stage
        const updatedOpportunity = {
          ...opportunity,
          stage: targetStageValue as any,
          updatedAt: new Date().toISOString()
        };

        // Update opportunities
        setOpportunities(current => 
          current?.map(opp => opp.id === activeId ? updatedOpportunity : opp) || []
        );

        // Record deal movement
        const movement: DealMovement = {
          id: `movement-${Date.now()}`,
          opportunityId: activeId,
          fromStage: sourceStageValue,
          toStage: targetStageValue,
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          automatedMove: false,
          probability: updatedOpportunity.probability,
          value: updatedOpportunity.value
        };

        setDealMovements(current => [...(current || []), movement]);

        // Show success message
        const sourceStageConfig = pipelineConfig?.stages.find(s => getStageValue(s.id) === sourceStageValue);
        const targetStageConfig = pipelineConfig?.stages.find(s => getStageValue(s.id) === targetStageValue);
        
        toast.success(`Deal moved from ${sourceStageConfig?.name} to ${targetStageConfig?.name}`);
      }
    }

    setActiveId(null);
  };

  const getOpportunitiesByStage = (stageValue: string) => {
    return opportunities?.filter(opp => opp.stage === stageValue) || [];
  };

  const getStageValue = (stageId: string): string => {
    const stageMap: Record<string, string> = {
      'stage-prospect': 'prospect',
      'stage-engage': 'engage',
      'stage-acquire': 'acquire',
      'stage-keep': 'keep'
    };
    return stageMap[stageId] || stageId.replace('stage-', '');
  };

  const getTotalPipelineValue = () => {
    return opportunities?.reduce((sum, opp) => sum + opp.value, 0) || 0;
  };

  const getWeightedPipelineValue = () => {
    return opportunities?.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0) || 0;
  };

  const handleCreateOpportunity = (stageValue?: string) => {
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
        current?.map(opp => 
          opp.id === selectedOpportunity.id 
            ? { ...opp, ...opportunityData, updatedAt: new Date().toISOString() }
            : opp
        ) || []
      );
    } else {
      // Create new
            const newOpportunity: Opportunity = {
        id: Math.random().toString(36).substr(2, 9),
        companyId: opportunityData.company || '',
        contactId: opportunityData.primaryContact || '',
        title: opportunityData.title || 'New Opportunity',
        name: opportunityData.title || 'New Opportunity',
        description: opportunityData.description || '',
        value: opportunityData.value || 0,
        stage: 'prospect',
        probability: opportunityData.probability || 0,
        expectedCloseDate: opportunityData.expectedCloseDate || new Date().toISOString(),
        ownerId: opportunityData.assignedTo || '',
        meddpicc: opportunityData.meddpicc || {
          metrics: 0,
          economicBuyer: 0,
          decisionCriteria: 0,
          decisionProcess: 0,
          paperProcess: 0,
          identifyPain: 0,
          champion: 0,
          competition: 0,
          score: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setOpportunities(current => [...(current || []), newOpportunity]);
    }
    setIsDialogOpen(false);
  };

  const getDealRiskColor = (opportunity: Opportunity): string => {
    const riskScore = opportunity.aiInsights?.riskScore || 0;
    if (riskScore >= 80) return 'text-red-600';
    if (riskScore >= 60) return 'text-yellow-600';
    if (riskScore >= 40) return 'text-blue-600';
    return 'text-green-600';
  };

  const getDaysUntilClose = (opportunity: Opportunity): number => {
    const closeDate = new Date(opportunity.expectedCloseDate);
    // Validate the date before calling getTime()
    if (isNaN(closeDate.getTime())) {
      return 0; // Return 0 for invalid dates
    }
    
    const today = new Date();
    const diffTime = closeDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {isDialogOpen ? (
        // Show form as full page when creating/editing
        <UnifiedOpportunityForm
          isOpen={false}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveOpportunity}
          editingOpportunity={selectedOpportunity}
          user={{ id: 'user-1', name: 'Default User', email: 'user@example.com', role: 'rep' }}
          mode="page"
          source="pipeline"
        />
      ) : (
        <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pipeline Management</h2>
          <p className="text-muted-foreground">Visual drag-and-drop deal management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(getTotalPipelineValue())}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Weighted Value</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(getWeightedPipelineValue())}</p>
          </div>
          <Button onClick={() => handleCreateOpportunity()}>
            <Plus size={20} className="mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pipelineConfig?.stages.map((stage) => {
          const stageValue = getStageValue(stage.id);
          const stageOpportunities = getOpportunitiesByStage(stageValue);
          const stageTotal = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
          const metrics = stageMetrics[stage.id];

          return (
            <Card key={stage.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={stage.color}>{stage.name}</Badge>
                  <span className="text-sm text-muted-foreground">{stageOpportunities.length}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Value</span>
                    <span className="text-sm font-bold">{formatCurrency(stageTotal)}</span>
                  </div>
                  {metrics && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Avg. Time</span>
                        <span className="text-xs">{Math.round(metrics.averageTimeInStage)}d</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Conversion</span>
                        <span className="text-xs">{Math.round(metrics.conversionRate)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Drag and Drop Pipeline */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {pipelineConfig?.stages.map((stage) => {
            const stageValue = getStageValue(stage.id);
            const stageOpportunities = getOpportunitiesByStage(stageValue);

            return (
              <StageColumn
                key={stage.id}
                stage={stage}
                stageValue={stageValue}
                opportunities={stageOpportunities}
                onCreateOpportunity={() => handleCreateOpportunity(stageValue)}
                onEditOpportunity={handleEditOpportunity}
                getDaysUntilClose={getDaysUntilClose}
                getDealRiskColor={getDealRiskColor}
              />
            );
          })}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <DealCard 
              opportunity={safeOpportunities.find(opp => opp.id === activeId)!}
              onEdit={() => {}}
              getDaysUntilClose={getDaysUntilClose}
              getDealRiskColor={getDealRiskColor}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
        </>
      )}
    </div>
  );
}

interface StageColumnProps {
  stage: any;
  stageValue: string;
  opportunities: Opportunity[];
  onCreateOpportunity: () => void;
  onEditOpportunity: (opportunity: Opportunity) => void;
  getDaysUntilClose: (opportunity: Opportunity) => number;
  getDealRiskColor: (opportunity: Opportunity) => string;
}

function StageColumn({ 
  stage, 
  stageValue, 
  opportunities, 
  onCreateOpportunity, 
  onEditOpportunity,
  getDaysUntilClose,
  getDealRiskColor
}: StageColumnProps) {
  const { setNodeRef, isOver } = useSortable({ id: stage.id });

  return (
    <Card className="h-fit min-h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Badge className={stage.color}>{stage.name}</Badge>
            <span className="text-sm text-muted-foreground">({opportunities.length})</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateOpportunity}
          >
            <Plus size={16} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{stage.description}</p>
        <div className="flex items-center gap-2">
          <CurrencyDollar size={16} className="text-primary" />
          <span className="font-medium text-primary">
            {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.value, 0))}
          </span>
        </div>
      </CardHeader>

      <CardContent
        ref={setNodeRef}
        className={`space-y-3 min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        <SortableContext items={opportunities.map(opp => opp.id)} strategy={rectSortingStrategy}>
          {opportunities.map((opportunity) => (
            <DealCard
              key={opportunity.id}
              opportunity={opportunity}
              onEdit={onEditOpportunity}
              getDaysUntilClose={getDaysUntilClose}
              getDealRiskColor={getDealRiskColor}
            />
          ))}
        </SortableContext>

        {opportunities.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Target size={32} className="mb-3" />
            <p className="text-sm">No deals in this stage</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={onCreateOpportunity}
            >
              <Plus size={16} className="mr-1" />
              Add Deal
            </Button>
          </div>
        )}

        {isOver && opportunities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-blue-500 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
            <Target size={32} className="mb-3" />
            <p className="text-sm font-medium">Drop deal here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DealCardProps {
  opportunity: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
  getDaysUntilClose: (opportunity: Opportunity) => number;
  getDealRiskColor: (opportunity: Opportunity) => string;
  isDragOverlay?: boolean;
}

function DealCard({ 
  opportunity, 
  onEdit, 
  getDaysUntilClose, 
  getDealRiskColor,
  isDragOverlay = false
}: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: opportunity.id,
    disabled: isDragOverlay
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 cursor-pointer transition-all ${
        isDragging || isDragOverlay
          ? 'shadow-lg rotate-2 opacity-50' 
          : 'hover:shadow-md'
      }`}
      onClick={() => !isDragging && onEdit(opportunity)}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm line-clamp-2">{opportunity.title}</h4>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">
            {opportunity.probability}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary text-sm">
              {formatCurrency(opportunity.value)}
            </span>
            <div className="flex items-center gap-1">
              <Calendar size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {getDaysUntilClose(opportunity)}d
              </span>
            </div>
          </div>

          <Progress value={opportunity.probability} className="h-1" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">
                  {opportunity.ownerId.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">Owner</span>
            </div>
            
            {opportunity.aiInsights && (
              <div className="flex items-center gap-1">
                {opportunity.aiInsights.riskScore >= 70 ? (
                  <Warning size={12} className="text-red-500" />
                ) : opportunity.aiInsights.riskScore >= 40 ? (
                  <Clock size={12} className="text-yellow-500" />
                ) : (
                  <CheckCircle size={12} className="text-green-500" />
                )}
                <span className={`text-xs ${getDealRiskColor(opportunity)}`}>
                  Risk: {opportunity.aiInsights.riskScore}
                </span>
              </div>
            )}
          </div>

          {opportunity.meddpicc.score > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">MEDDPICC:</span>
              <Progress value={opportunity.meddpicc.score} className="h-1 flex-1" />
              <span className="text-xs font-medium">{opportunity.meddpicc.score}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}