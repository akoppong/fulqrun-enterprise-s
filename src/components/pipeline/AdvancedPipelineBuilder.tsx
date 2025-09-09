import { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Plus, 
  Settings2, 
  Trash2, 
  Edit, 
  Move, 
  BarChart3, 
  Clock, 
  Target,
  Workflow,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from '@phosphor-icons/react';

interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  color: string;
  requirements: string[];
  description: string;
  automationRules: AutomationRule[];
  estimatedDuration: number; // in days
  order: number;
}

interface AutomationRule {
  id: string;
  trigger: 'enter_stage' | 'time_based' | 'field_change' | 'deal_value_change';
  condition?: string;
  action: 'move_stage' | 'update_field' | 'send_notification' | 'create_task';
  actionData: any;
  enabled: boolean;
}

interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  category: 'sales' | 'marketing' | 'support' | 'custom';
}

const defaultTemplates: PipelineTemplate[] = [
  {
    id: 'peak-b2b',
    name: 'PEAK B2B Sales',
    description: 'Full PEAK methodology implementation for enterprise B2B sales',
    category: 'sales',
    stages: [
      {
        id: 'prospect',
        name: 'Prospect',
        probability: 10,
        color: '#3B82F6',
        requirements: ['Initial contact made', 'Basic qualification completed'],
        description: 'Identify and research potential customers',
        estimatedDuration: 7,
        order: 0,
        automationRules: []
      },
      {
        id: 'engage',
        name: 'Engage',
        probability: 25,
        color: '#8B5CF6',
        requirements: ['Discovery meeting scheduled', 'Pain points identified'],
        description: 'Build relationships and understand needs',
        estimatedDuration: 14,
        order: 1,
        automationRules: []
      },
      {
        id: 'acquire-proposal',
        name: 'Acquire - Proposal',
        probability: 50,
        color: '#F59E0B',
        requirements: ['Proposal submitted', 'Decision makers engaged'],
        description: 'Present solution and negotiate terms',
        estimatedDuration: 21,
        order: 2,
        automationRules: []
      },
      {
        id: 'acquire-negotiation',
        name: 'Acquire - Negotiation',
        probability: 75,
        color: '#EF4444',
        requirements: ['Contract terms agreed', 'Legal review completed'],
        description: 'Finalize contract and close deal',
        estimatedDuration: 14,
        order: 3,
        automationRules: []
      },
      {
        id: 'closed-won',
        name: 'Closed Won',
        probability: 100,
        color: '#10B981',
        requirements: ['Contract signed', 'Payment received'],
        description: 'Deal successfully closed',
        estimatedDuration: 1,
        order: 4,
        automationRules: []
      }
    ]
  },
  {
    id: 'smb-transactional',
    name: 'SMB Transactional Sales',
    description: 'Fast-moving pipeline for small to medium business sales',
    category: 'sales',
    stages: [
      {
        id: 'lead',
        name: 'Lead',
        probability: 5,
        color: '#6B7280',
        requirements: ['Lead captured', 'Basic info collected'],
        description: 'New leads from various sources',
        estimatedDuration: 1,
        order: 0,
        automationRules: []
      },
      {
        id: 'qualified',
        name: 'Qualified',
        probability: 20,
        color: '#3B82F6',
        requirements: ['BANT qualification', 'Budget confirmed'],
        description: 'Lead meets qualification criteria',
        estimatedDuration: 3,
        order: 1,
        automationRules: []
      },
      {
        id: 'demo',
        name: 'Demo',
        probability: 40,
        color: '#8B5CF6',
        requirements: ['Demo completed', 'Use case confirmed'],
        description: 'Product demonstration scheduled and completed',
        estimatedDuration: 7,
        order: 2,
        automationRules: []
      },
      {
        id: 'proposal',
        name: 'Proposal',
        probability: 65,
        color: '#F59E0B',
        requirements: ['Quote sent', 'Terms discussed'],
        description: 'Formal proposal or quote provided',
        estimatedDuration: 5,
        order: 3,
        automationRules: []
      },
      {
        id: 'closed-won',
        name: 'Closed Won',
        probability: 100,
        color: '#10B981',
        requirements: ['Contract signed', 'Implementation started'],
        description: 'Deal successfully closed',
        estimatedDuration: 1,
        order: 4,
        automationRules: []
      }
    ]
  }
];

export function AdvancedPipelineBuilder() {
  const [pipelines, setPipelines] = useKV<PipelineTemplate[]>('pipeline-templates', defaultTemplates);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);

  const createNewPipeline = useCallback(() => {
    const newPipeline: PipelineTemplate = {
      id: Date.now().toString(),
      name: 'New Pipeline',
      description: 'Custom pipeline template',
      category: 'custom',
      stages: []
    };
    setPipelines(current => [...current, newPipeline]);
    setSelectedPipeline(newPipeline);
    setIsCreating(true);
  }, [setPipelines]);

  const updatePipeline = useCallback((updatedPipeline: PipelineTemplate) => {
    setPipelines(current => 
      current.map(p => p.id === updatedPipeline.id ? updatedPipeline : p)
    );
    setSelectedPipeline(updatedPipeline);
  }, [setPipelines]);

  const deletePipeline = useCallback((pipelineId: string) => {
    setPipelines(current => current.filter(p => p.id !== pipelineId));
    if (selectedPipeline?.id === pipelineId) {
      setSelectedPipeline(null);
    }
    toast.success('Pipeline template deleted');
  }, [setPipelines, selectedPipeline]);

  const addStage = useCallback((pipeline: PipelineTemplate) => {
    const newStage: PipelineStage = {
      id: Date.now().toString(),
      name: 'New Stage',
      probability: 50,
      color: '#3B82F6',
      requirements: [],
      description: '',
      estimatedDuration: 7,
      order: pipeline.stages.length,
      automationRules: []
    };
    
    const updatedPipeline = {
      ...pipeline,
      stages: [...pipeline.stages, newStage]
    };
    
    updatePipeline(updatedPipeline);
    setEditingStage(newStage);
  }, [updatePipeline]);

  const updateStage = useCallback((pipeline: PipelineTemplate, updatedStage: PipelineStage) => {
    const updatedPipeline = {
      ...pipeline,
      stages: pipeline.stages.map(s => s.id === updatedStage.id ? updatedStage : s)
    };
    
    updatePipeline(updatedPipeline);
    toast.success('Stage updated successfully');
  }, [updatePipeline]);

  const deleteStage = useCallback((pipeline: PipelineTemplate, stageId: string) => {
    const updatedPipeline = {
      ...pipeline,
      stages: pipeline.stages.filter(s => s.id !== stageId)
        .map((s, index) => ({ ...s, order: index }))
    };
    
    updatePipeline(updatedPipeline);
    toast.success('Stage deleted');
  }, [updatePipeline]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Pipeline Builder</h2>
          <p className="text-muted-foreground">Create and customize sales pipelines with automation</p>
        </div>
        <Button onClick={createNewPipeline} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Pipeline
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Templates List */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Pipeline Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {pipelines.map(pipeline => (
                    <div 
                      key={pipeline.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPipeline?.id === pipeline.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPipeline(pipeline)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{pipeline.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pipeline.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {pipeline.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {pipeline.stages.length} stages
                            </span>
                          </div>
                        </div>
                        {pipeline.category === 'custom' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePipeline(pipeline.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Builder */}
        <div className="lg:col-span-8">
          {selectedPipeline ? (
            <PipelineBuilderContent
              pipeline={selectedPipeline}
              onUpdate={updatePipeline}
              onAddStage={addStage}
              onUpdateStage={updateStage}
              onDeleteStage={deleteStage}
              editingStage={editingStage}
              setEditingStage={setEditingStage}
            />
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Workflow className="h-12 w-12 mx-auto mb-4" />
                <p>Select a pipeline template to start building</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineBuilderContent({ 
  pipeline, 
  onUpdate, 
  onAddStage, 
  onUpdateStage, 
  onDeleteStage,
  editingStage,
  setEditingStage
}: {
  pipeline: PipelineTemplate;
  onUpdate: (pipeline: PipelineTemplate) => void;
  onAddStage: (pipeline: PipelineTemplate) => void;
  onUpdateStage: (pipeline: PipelineTemplate, stage: PipelineStage) => void;
  onDeleteStage: (pipeline: PipelineTemplate, stageId: string) => void;
  editingStage: PipelineStage | null;
  setEditingStage: (stage: PipelineStage | null) => void;
}) {
  const [pipelineName, setPipelineName] = useState(pipeline.name);
  const [pipelineDescription, setPipelineDescription] = useState(pipeline.description);

  const updatePipelineDetails = useCallback(() => {
    onUpdate({
      ...pipeline,
      name: pipelineName,
      description: pipelineDescription
    });
    toast.success('Pipeline updated');
  }, [pipeline, pipelineName, pipelineDescription, onUpdate]);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Pipeline Configuration</CardTitle>
            <Button onClick={() => onAddStage(pipeline)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Stage
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pipeline-name">Pipeline Name</Label>
              <Input
                id="pipeline-name"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                onBlur={updatePipelineDetails}
              />
            </div>
            <div>
              <Label htmlFor="pipeline-description">Description</Label>
              <Input
                id="pipeline-description"
                value={pipelineDescription}
                onChange={(e) => setPipelineDescription(e.target.value)}
                onBlur={updatePipelineDetails}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="stages" className="space-y-4 mt-6">
            <PipelineStagesView 
              pipeline={pipeline}
              onUpdateStage={onUpdateStage}
              onDeleteStage={onDeleteStage}
              editingStage={editingStage}
              setEditingStage={setEditingStage}
            />
          </TabsContent>

          <TabsContent value="automation" className="space-y-4 mt-6">
            <PipelineAutomationView pipeline={pipeline} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-6">
            <PipelineAnalyticsView pipeline={pipeline} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PipelineStagesView({ 
  pipeline, 
  onUpdateStage, 
  onDeleteStage,
  editingStage,
  setEditingStage
}: {
  pipeline: PipelineTemplate;
  onUpdateStage: (pipeline: PipelineTemplate, stage: PipelineStage) => void;
  onDeleteStage: (pipeline: PipelineTemplate, stageId: string) => void;
  editingStage: PipelineStage | null;
  setEditingStage: (stage: PipelineStage | null) => void;
}) {
  return (
    <div className="space-y-4">
      {pipeline.stages
        .sort((a, b) => a.order - b.order)
        .map((stage, index) => (
          <div key={stage.id} className="relative">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{stage.name}</h4>
                      <p className="text-sm text-muted-foreground">{stage.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{stage.probability}% probability</Badge>
                        <span className="text-xs text-muted-foreground">
                          {stage.estimatedDuration} days avg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStage(stage)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteStage(pipeline, stage.id)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {stage.requirements.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {stage.requirements.map((req, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stage Connector */}
            {index < pipeline.stages.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="w-px h-4 bg-border" />
              </div>
            )}
          </div>
        ))}

      {/* Stage Editor Dialog */}
      {editingStage && (
        <StageEditorDialog
          stage={editingStage}
          pipeline={pipeline}
          onSave={(updatedStage) => {
            onUpdateStage(pipeline, updatedStage);
            setEditingStage(null);
          }}
          onCancel={() => setEditingStage(null)}
        />
      )}
    </div>
  );
}

function StageEditorDialog({ 
  stage, 
  pipeline,
  onSave, 
  onCancel 
}: {
  stage: PipelineStage;
  pipeline: PipelineTemplate;
  onSave: (stage: PipelineStage) => void;
  onCancel: () => void;
}) {
  const [editedStage, setEditedStage] = useState({ ...stage });
  const [newRequirement, setNewRequirement] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setEditedStage(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setEditedStage(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Pipeline Stage</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={editedStage.name}
                onChange={(e) => setEditedStage(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="stage-color">Color</Label>
              <div className="flex gap-2">
                <Input
                  id="stage-color"
                  type="color"
                  value={editedStage.color}
                  onChange={(e) => setEditedStage(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16"
                />
                <Input
                  value={editedStage.color}
                  onChange={(e) => setEditedStage(prev => ({ ...prev, color: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="stage-description">Description</Label>
            <Input
              id="stage-description"
              value={editedStage.description}
              onChange={(e) => setEditedStage(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage-probability">Probability (%)</Label>
              <Input
                id="stage-probability"
                type="number"
                min="0"
                max="100"
                value={editedStage.probability}
                onChange={(e) => setEditedStage(prev => ({ ...prev, probability: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="stage-duration">Estimated Duration (days)</Label>
              <Input
                id="stage-duration"
                type="number"
                min="1"
                value={editedStage.estimatedDuration}
                onChange={(e) => setEditedStage(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div>
            <Label>Stage Requirements</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add requirement"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              />
              <Button onClick={addRequirement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {editedStage.requirements.map((req, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {req}
                  <button 
                    onClick={() => removeRequirement(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(editedStage)}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PipelineAutomationView({ 
  pipeline, 
  onUpdate 
}: {
  pipeline: PipelineTemplate;
  onUpdate: (pipeline: PipelineTemplate) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground py-8">
        <Settings2 className="h-12 w-12 mx-auto mb-4" />
        <p>Pipeline automation rules coming soon...</p>
        <p className="text-sm mt-2">Set up triggers and actions to automate your sales process</p>
      </div>
    </div>
  );
}

function PipelineAnalyticsView({ pipeline }: { pipeline: PipelineTemplate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
          <h3 className="font-medium">Conversion Rate</h3>
          <p className="text-2xl font-bold">24.5%</p>
          <p className="text-sm text-muted-foreground">Overall pipeline</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
          <h3 className="font-medium">Avg. Sales Cycle</h3>
          <p className="text-2xl font-bold">45 days</p>
          <p className="text-sm text-muted-foreground">From lead to close</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
          <h3 className="font-medium">Win Rate</h3>
          <p className="text-2xl font-bold">18.2%</p>
          <p className="text-sm text-muted-foreground">Deals closed won</p>
        </CardContent>
      </Card>
    </div>
  );
}