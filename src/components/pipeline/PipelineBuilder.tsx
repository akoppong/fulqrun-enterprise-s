import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { 
  PipelineConfiguration, 
  PipelineStage, 
  Opportunity,
  DealMovement 
} from '@/lib/types';
import { createDefaultPipelineConfiguration } from '@/lib/pipeline-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {
  CSS
} from '@dnd-kit/utilities';
import { 
  Plus, 
  Settings, 
  Trash, 
  GripVertical, 
  Target, 
  Clock, 
  TrendUp,
  Palette
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PipelineBuilderProps {
  onSave?: (pipeline: PipelineConfiguration) => void;
}

export function PipelineBuilder({ onSave }: PipelineBuilderProps) {
  const [pipelines, setPipelines] = useKV<PipelineConfiguration[]>('pipeline-configs', [createDefaultPipelineConfiguration()]);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineConfiguration>(pipelines[0]);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);

  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-orange-100 text-orange-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-red-100 text-red-800'
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const stages = selectedPipeline.stages;
      const oldIndex = stages.findIndex(stage => stage.id === active.id);
      const newIndex = stages.findIndex(stage => stage.id === over?.id);
      
      const reorderedStages = arrayMove(stages, oldIndex, newIndex);
      
      // Update positions
      const updatedStages = reorderedStages.map((stage, index) => ({
        ...stage,
        position: index
      }));

      const updatedPipeline = {
        ...selectedPipeline,
        stages: updatedStages,
        updatedAt: new Date()
      };

      setSelectedPipeline(updatedPipeline);
      updatePipeline(updatedPipeline);
    }
  };

  const updatePipeline = (pipeline: PipelineConfiguration) => {
    setPipelines(current => 
      current.map(p => p.id === pipeline.id ? pipeline : p)
    );
  };

  const handleAddStage = () => {
    setEditingStage({
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      description: '',
      position: selectedPipeline.stages.length,
      color: colors[selectedPipeline.stages.length % colors.length],
      probability: 50,
      isDefault: false,
      automationRules: [],
      requiredFields: [],
      exitCriteria: [],
      workflows: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsStageDialogOpen(true);
  };

  const handleEditStage = (stage: PipelineStage) => {
    setEditingStage(stage);
    setIsStageDialogOpen(true);
  };

  const handleSaveStage = (stageData: Partial<PipelineStage>) => {
    if (!editingStage) return;

    const updatedStage = { ...editingStage, ...stageData, updatedAt: new Date() };
    const isNewStage = !selectedPipeline.stages.find(s => s.id === editingStage.id);

    let updatedStages;
    if (isNewStage) {
      updatedStages = [...selectedPipeline.stages, updatedStage];
    } else {
      updatedStages = selectedPipeline.stages.map(s => 
        s.id === editingStage.id ? updatedStage : s
      );
    }

    const updatedPipeline = {
      ...selectedPipeline,
      stages: updatedStages,
      updatedAt: new Date()
    };

    setSelectedPipeline(updatedPipeline);
    updatePipeline(updatedPipeline);
    setIsStageDialogOpen(false);
    setEditingStage(null);
    
    toast.success(isNewStage ? 'Stage added successfully' : 'Stage updated successfully');
  };

  const handleDeleteStage = (stageId: string) => {
    const updatedStages = selectedPipeline.stages
      .filter(s => s.id !== stageId)
      .map((stage, index) => ({ ...stage, position: index }));

    const updatedPipeline = {
      ...selectedPipeline,
      stages: updatedStages,
      updatedAt: new Date()
    };

    setSelectedPipeline(updatedPipeline);
    updatePipeline(updatedPipeline);
    toast.success('Stage deleted successfully');
  };

  const handleCreateNewPipeline = () => {
    const newPipeline: PipelineConfiguration = {
      id: `pipeline-${Date.now()}`,
      name: 'New Pipeline',
      description: 'Custom sales pipeline',
      stages: [],
      defaultProbabilities: {},
      salesCycleTargets: {},
      conversionTargets: {},
      isActive: false,
      createdBy: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPipelines(current => [...current, newPipeline]);
    setSelectedPipeline(newPipeline);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pipeline Builder</h2>
          <p className="text-muted-foreground">Design and customize your sales pipeline stages</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={selectedPipeline.id} 
            onValueChange={(value) => {
              const pipeline = pipelines.find(p => p.id === value);
              if (pipeline) setSelectedPipeline(pipeline);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select pipeline" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map(pipeline => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleCreateNewPipeline}>
            <Plus size={20} className="mr-2" />
            New Pipeline
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{selectedPipeline.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedPipeline.description}</p>
            </div>
            <Badge variant={selectedPipeline.isActive ? "default" : "secondary"}>
              {selectedPipeline.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stages">
            <TabsList>
              <TabsTrigger value="stages">Stages</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="stages" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Pipeline Stages</h3>
                <Button onClick={handleAddStage}>
                  <Plus size={20} className="mr-2" />
                  Add Stage
                </Button>
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={selectedPipeline.stages.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {selectedPipeline.stages
                      .sort((a, b) => a.position - b.position)
                      .map((stage) => (
                        <SortableStageCard 
                          key={stage.id}
                          stage={stage}
                          onEdit={handleEditStage}
                          onDelete={handleDeleteStage}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              {selectedPipeline.stages.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Target size={48} className="text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No stages defined</h3>
                    <p className="text-muted-foreground mb-4">Add your first pipeline stage to get started</p>
                    <Button onClick={handleAddStage}>
                      <Plus size={20} className="mr-2" />
                      Add First Stage
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="automation" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Automation Rules</h3>
                <Button>
                  <Plus size={20} className="mr-2" />
                  Add Rule
                </Button>
              </div>
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Settings size={48} className="text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No automation rules</h3>
                  <p className="text-muted-foreground mb-4">Create rules to automatically move deals between stages</p>
                  <Button>
                    <Plus size={20} className="mr-2" />
                    Create First Rule
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="pipeline-name">Pipeline Name</Label>
                      <Input
                        id="pipeline-name"
                        value={selectedPipeline.name}
                        onChange={(e) => {
                          const updated = { ...selectedPipeline, name: e.target.value };
                          setSelectedPipeline(updated);
                          updatePipeline(updated);
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pipeline-description">Description</Label>
                      <Textarea
                        id="pipeline-description"
                        value={selectedPipeline.description}
                        onChange={(e) => {
                          const updated = { ...selectedPipeline, description: e.target.value };
                          setSelectedPipeline(updated);
                          updatePipeline(updated);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Targets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={16} />
                        Average sales cycle targets by stage
                      </div>
                      {selectedPipeline.stages.map(stage => (
                        <div key={stage.id} className="flex items-center justify-between">
                          <span className="text-sm">{stage.name}</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              className="w-20 h-8"
                              placeholder="7"
                              defaultValue={selectedPipeline.salesCycleTargets[stage.id] || 7}
                            />
                            <span className="text-sm text-muted-foreground">days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <StageEditDialog
        isOpen={isStageDialogOpen}
        onClose={() => {
          setIsStageDialogOpen(false);
          setEditingStage(null);
        }}
        onSave={handleSaveStage}
        stage={editingStage}
        availableColors={colors}
      />
    </div>
  );
}

  );
}

interface SortableStageCardProps {
  stage: PipelineStage;
  onEdit: (stage: PipelineStage) => void;
  onDelete: (stageId: string) => void;
}

function SortableStageCard({ stage, onEdit, onDelete }: SortableStageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners} className="cursor-move">
              <GripVertical size={20} className="text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <Badge className={stage.color}>{stage.name}</Badge>
              <div className="text-sm text-muted-foreground">
                {stage.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target size={16} />
              {stage.probability}%
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(stage)}
            >
              <Settings size={16} className="mr-1" />
              Edit
            </Button>
            {!stage.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(stage.id)}
              >
                <Trash size={16} className="text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StageEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stage: Partial<PipelineStage>) => void;
  stage: PipelineStage | null;
  availableColors: string[];
}

function StageEditDialog({ isOpen, onClose, onSave, stage, availableColors }: StageEditDialogProps) {
  const [formData, setFormData] = useState<Partial<PipelineStage>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Reset form when stage changes
  if (stage && (!formData.name || formData.id !== stage.id)) {
    setFormData(stage);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stage?.id.startsWith('stage-new') ? 'Add New Stage' : 'Edit Stage'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={formData.name || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Qualified Prospect"
                required
              />
            </div>
            <div>
              <Label htmlFor="stage-probability">Probability (%)</Label>
              <Input
                id="stage-probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability || 0}
                onChange={(e) => updateFormData('probability', parseInt(e.target.value))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stage-description">Description</Label>
            <Textarea
              id="stage-description"
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe what happens in this stage..."
            />
          </div>

          <div>
            <Label>Stage Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {availableColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={`p-3 rounded-lg border-2 ${
                    formData.color === color ? 'border-primary' : 'border-transparent'
                  } ${color}`}
                  onClick={() => updateFormData('color', color)}
                >
                  <Palette size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {stage?.id.startsWith('stage-new') ? 'Add Stage' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}