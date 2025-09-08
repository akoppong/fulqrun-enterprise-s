import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { 
  WorkflowAutomation, 
  WorkflowTrigger, 
  WorkflowCondition, 
  WorkflowAction,
  Opportunity,
  PipelineStage
} from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Trash, 
  Zap,
  ArrowRight,
  Clock,
  Target,
  User,
  Mail,
  Bell,
  CheckCircle,
  AlertTriangle
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export function WorkflowAutomationEngine() {
  const [workflows, setWorkflows] = useKV<WorkflowAutomation[]>('workflow-automations', []);
  const [opportunities] = useKV<Opportunity[]>('opportunities', []);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowAutomation | null>(null);
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);

  const triggerTypes = [
    { value: 'deal_created', label: 'Deal Created', icon: Plus },
    { value: 'stage_changed', label: 'Stage Changed', icon: ArrowRight },
    { value: 'value_changed', label: 'Value Changed', icon: Target },
    { value: 'date_reached', label: 'Date Reached', icon: Clock },
    { value: 'field_updated', label: 'Field Updated', icon: Settings },
    { value: 'manual', label: 'Manual Trigger', icon: Play }
  ];

  const actionTypes = [
    { value: 'move_stage', label: 'Move to Stage', icon: ArrowRight },
    { value: 'update_field', label: 'Update Field', icon: Settings },
    { value: 'create_task', label: 'Create Task', icon: CheckCircle },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'notify_user', label: 'Notify User', icon: Bell },
    { value: 'update_probability', label: 'Update Probability', icon: Target }
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' }
  ];

  const handleCreateWorkflow = () => {
    setEditingWorkflow({
      id: `workflow-${Date.now()}`,
      name: 'New Workflow',
      description: '',
      trigger: {
        type: 'deal_created',
        configuration: {}
      },
      conditions: [],
      actions: [],
      isActive: false,
      executionCount: 0,
      createdBy: 'current-user',
      createdAt: new Date()
    });
    setIsWorkflowDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: WorkflowAutomation) => {
    setEditingWorkflow(workflow);
    setIsWorkflowDialogOpen(true);
  };

  const handleSaveWorkflow = (workflowData: Partial<WorkflowAutomation>) => {
    if (!editingWorkflow) return;

    const updatedWorkflow = { ...editingWorkflow, ...workflowData };
    const isNewWorkflow = !workflows.find(w => w.id === editingWorkflow.id);

    if (isNewWorkflow) {
      setWorkflows(current => [...current, updatedWorkflow]);
      toast.success('Workflow created successfully');
    } else {
      setWorkflows(current => 
        current.map(w => w.id === editingWorkflow.id ? updatedWorkflow : w)
      );
      toast.success('Workflow updated successfully');
    }

    setIsWorkflowDialogOpen(false);
    setEditingWorkflow(null);
  };

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(current => 
      current.map(w => 
        w.id === workflowId 
          ? { ...w, isActive: !w.isActive }
          : w
      )
    );
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(current => current.filter(w => w.id !== workflowId));
    toast.success('Workflow deleted successfully');
  };

  const getWorkflowStatus = (workflow: WorkflowAutomation) => {
    if (!workflow.isActive) return { status: 'inactive', color: 'bg-gray-100 text-gray-800' };
    if (workflow.executionCount > 0) return { status: 'active', color: 'bg-green-100 text-green-800' };
    return { status: 'ready', color: 'bg-blue-100 text-blue-800' };
  };

  const executeWorkflow = async (workflow: WorkflowAutomation, opportunity: Opportunity) => {
    // This would be the actual workflow execution logic
    console.log('Executing workflow:', workflow.name, 'for opportunity:', opportunity.title);
    
    // Update execution count
    setWorkflows(current => 
      current.map(w => 
        w.id === workflow.id 
          ? { ...w, executionCount: w.executionCount + 1, lastExecuted: new Date() }
          : w
      )
    );

    toast.success(`Workflow "${workflow.name}" executed successfully`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Workflow Automation</h2>
          <p className="text-muted-foreground">Automate your sales processes with smart workflows</p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus size={20} className="mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">
                  {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap size={48} className="text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Create your first workflow to automate your sales processes
              </p>
              <Button onClick={handleCreateWorkflow}>
                <Plus size={20} className="mr-2" />
                Create First Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => {
            const status = getWorkflowStatus(workflow);
            const triggerType = triggerTypes.find(t => t.value === workflow.trigger.type);
            const TriggerIcon = triggerType?.icon || Zap;

            return (
              <Card key={workflow.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TriggerIcon size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{workflow.name}</h3>
                          <p className="text-muted-foreground text-sm">{workflow.description}</p>
                        </div>
                      </div>
                      <Badge className={status.color}>{status.status}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={workflow.isActive}
                        onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditWorkflow(workflow)}
                      >
                        <Settings size={16} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Trigger</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TriggerIcon size={16} />
                        {triggerType?.label}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Actions</p>
                      <div className="flex items-center gap-1">
                        {workflow.actions.slice(0, 3).map((action, index) => {
                          const actionType = actionTypes.find(a => a.value === action.type);
                          const ActionIcon = actionType?.icon || Settings;
                          return (
                            <div key={index} className="p-1 bg-gray-100 rounded">
                              <ActionIcon size={12} />
                            </div>
                          );
                        })}
                        {workflow.actions.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{workflow.actions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Performance</p>
                      <div className="text-sm text-muted-foreground">
                        <div>Executed: {workflow.executionCount} times</div>
                        {workflow.lastExecuted && (
                          <div>Last: {workflow.lastExecuted.toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <WorkflowEditDialog
        isOpen={isWorkflowDialogOpen}
        onClose={() => {
          setIsWorkflowDialogOpen(false);
          setEditingWorkflow(null);
        }}
        onSave={handleSaveWorkflow}
        workflow={editingWorkflow}
        triggerTypes={triggerTypes}
        actionTypes={actionTypes}
        operators={operators}
      />
    </div>
  );
}

interface WorkflowEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: Partial<WorkflowAutomation>) => void;
  workflow: WorkflowAutomation | null;
  triggerTypes: any[];
  actionTypes: any[];
  operators: any[];
}

function WorkflowEditDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  workflow, 
  triggerTypes, 
  actionTypes, 
  operators 
}: WorkflowEditDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkflowAutomation>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addCondition = () => {
    const newCondition: WorkflowCondition = {
      field: 'value',
      operator: 'greater_than',
      value: ''
    };
    
    setFormData(prev => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition]
    }));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const conditions = [...(prev.conditions || [])];
      conditions[index] = { ...conditions[index], [field]: value };
      return { ...prev, conditions };
    });
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: (prev.conditions || []).filter((_, i) => i !== index)
    }));
  };

  const addAction = () => {
    const newAction: WorkflowAction = {
      type: 'move_stage',
      configuration: {}
    };
    
    setFormData(prev => ({
      ...prev,
      actions: [...(prev.actions || []), newAction]
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const actions = [...(prev.actions || [])];
      actions[index] = { ...actions[index], [field]: value };
      return { ...prev, actions };
    });
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: (prev.actions || []).filter((_, i) => i !== index)
    }));
  };

  // Reset form when workflow changes
  if (workflow && (!formData.name || formData.id !== workflow.id)) {
    setFormData(workflow);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {workflow?.id.startsWith('workflow-new') ? 'Create Workflow' : 'Edit Workflow'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={formData.name || ''}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g., Auto-move high-value deals"
                required
              />
            </div>
            <div>
              <Label>Status</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  checked={formData.isActive || false}
                  onCheckedChange={(checked) => updateFormData('isActive', checked)}
                />
                <span className="text-sm">{formData.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="workflow-description">Description</Label>
            <Textarea
              id="workflow-description"
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe what this workflow does..."
            />
          </div>

          <Tabs defaultValue="trigger">
            <TabsList>
              <TabsTrigger value="trigger">Trigger</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="trigger" className="space-y-4">
              <div>
                <Label>Trigger Type</Label>
                <Select
                  value={formData.trigger?.type || ''}
                  onValueChange={(value) => updateFormData('trigger', { type: value, configuration: {} })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="flex items-center gap-2">
                          <trigger.icon size={16} />
                          {trigger.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="conditions" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Conditions (All must be true)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  <Plus size={16} className="mr-1" />
                  Add Condition
                </Button>
              </div>

              {formData.conditions?.map((condition, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-3 items-end">
                      <div>
                        <Label>Field</Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) => updateCondition(index, 'field', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="value">Deal Value</SelectItem>
                            <SelectItem value="stage">Stage</SelectItem>
                            <SelectItem value="probability">Probability</SelectItem>
                            <SelectItem value="expectedCloseDate">Close Date</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Operator</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => updateCondition(index, 'operator', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Value</Label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Enter value"
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!formData.conditions || formData.conditions.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle size={32} className="text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No conditions set - workflow will run for all triggers</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Actions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAction}>
                  <Plus size={16} className="mr-1" />
                  Add Action
                </Button>
              </div>

              {formData.actions?.map((action, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-3 items-end">
                      <div className="col-span-2">
                        <Label>Action Type</Label>
                        <Select
                          value={action.type}
                          onValueChange={(value) => updateAction(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((actionType) => (
                              <SelectItem key={actionType.value} value={actionType.value}>
                                <div className="flex items-center gap-2">
                                  <actionType.icon size={16} />
                                  {actionType.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAction(index)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!formData.actions || formData.actions.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Zap size={32} className="text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No actions defined</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {workflow?.id.startsWith('workflow-new') ? 'Create Workflow' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}