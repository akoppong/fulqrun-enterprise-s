import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  Gear, 
  Users, 
  Bot, 
  CheckCircle, 
  FileText,
  Mail,
  Bell,
  HardDrives,
  Webhook,
  Timer,
  GitBranch,
  Link,
  Save,
  X
} from '@phosphor-icons/react';
import { WorkflowTemplate, WorkflowStep, AutomationRule, AutomationAction, WorkflowResource, PeakStage, PEAK_STAGES } from '@/lib/types';

interface WorkflowBuilderProps {
  template?: WorkflowTemplate;
  onSave: (template: WorkflowTemplate) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface StepFormData {
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'approval';
  assignedRole: string;
  dueInDays: number;
  completionCriteria: string;
}

interface ActionFormData {
  type: 'email' | 'task' | 'notification' | 'field_update' | 'integration' | 'webhook' | 'delay' | 'conditional';
  parameters: Record<string, any>;
  delay?: number;
  condition?: string;
}

export function WorkflowBuilder({ template, onSave, onCancel, isOpen }: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState(template?.name || '');
  const [workflowDescription, setWorkflowDescription] = useState(template?.description || '');
  const [workflowStage, setWorkflowStage] = useState<PeakStage>(template?.stage || 'prospect');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [steps, setSteps] = useState<WorkflowStep[]>(template?.steps || []);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(template?.automationRules || []);
  
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(null);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStep | null>(null);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  const [stepForm, setStepForm] = useState<StepFormData>({
    name: '',
    description: '',
    type: 'manual',
    assignedRole: '',
    dueInDays: 1,
    completionCriteria: ''
  });

  const [actionForm, setActionForm] = useState<ActionFormData>({
    type: 'email',
    parameters: {},
    delay: 0
  });

  const handleSave = () => {
    const newTemplate: WorkflowTemplate = {
      id: template?.id || `wf_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      stage: workflowStage,
      steps,
      automationRules,
      createdBy: template?.createdBy || 'current-user',
      createdAt: template?.createdAt || new Date(),
      isActive
    };

    onSave(newTemplate);
  };

  const addStep = () => {
    setEditingStep(null);
    setStepForm({
      name: '',
      description: '',
      type: 'manual',
      assignedRole: '',
      dueInDays: 1,
      completionCriteria: ''
    });
    setIsStepDialogOpen(true);
  };

  const editStep = (index: number) => {
    const step = steps[index];
    setEditingStep(step);
    setStepForm({
      name: step.name,
      description: step.description,
      type: step.type,
      assignedRole: step.assignedRole || '',
      dueInDays: step.dueInDays,
      completionCriteria: step.completionCriteria
    });
    setSelectedStepIndex(index);
    setIsStepDialogOpen(true);
  };

  const saveStep = () => {
    const newStep: WorkflowStep = {
      id: editingStep?.id || `step_${Date.now()}`,
      name: stepForm.name,
      description: stepForm.description,
      type: stepForm.type,
      assignedRole: stepForm.assignedRole,
      dueInDays: stepForm.dueInDays,
      dependencies: editingStep?.dependencies || [],
      completionCriteria: stepForm.completionCriteria,
      resources: editingStep?.resources || []
    };

    if (selectedStepIndex !== null) {
      const updatedSteps = [...steps];
      updatedSteps[selectedStepIndex] = newStep;
      setSteps(updatedSteps);
    } else {
      setSteps([...steps, newStep]);
    }

    setIsStepDialogOpen(false);
    setSelectedStepIndex(null);
  };

  const deleteStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const updatedSteps = [...steps];
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    setSteps(updatedSteps);
  };

  const addAutomationRule = () => {
    setEditingRule(null);
    setIsRuleDialogOpen(true);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Users className="h-4 w-4" />;
      case 'automated': return <Bot className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'notification': return <Bell className="h-4 w-4" />;
      case 'field_update': return <HardDrives className="h-4 w-4" />;
      case 'integration': return <Webhook className="h-4 w-4" />;
      case 'delay': return <Timer className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Workflow' : 'Create New Workflow'}
          </DialogTitle>
          <DialogDescription>
            Build automated workflows for your sales pipeline stages
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="general" className="w-full h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="steps">Steps ({steps.length})</TabsTrigger>
              <TabsTrigger value="automation">Automation ({automationRules.length})</TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[500px]">
              <TabsContent value="general" className="h-full">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workflow-name">Workflow Name</Label>
                      <Input
                        id="workflow-name"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Enter workflow name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workflow-stage">Pipeline Stage</Label>
                      <Select value={workflowStage} onValueChange={(value) => setWorkflowStage(value as PeakStage)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PEAK_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={stage.color}>{stage.label}</Badge>
                                <span>{stage.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Textarea
                      id="workflow-description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Describe what this workflow does"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="workflow-active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="workflow-active">Active</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="steps" className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Workflow Steps</h3>
                    <Button onClick={addStep}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    {steps.length === 0 ? (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No steps added yet</p>
                          <Button variant="link" onClick={addStep}>Add your first step</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <Card key={step.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="flex flex-col items-center gap-1">
                                    {getStepIcon(step.type)}
                                    <div className="text-xs text-muted-foreground">#{index + 1}</div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                      <Badge variant="outline">{step.type}</Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Due: {step.dueInDays} day{step.dueInDays !== 1 ? 's' : ''}
                                      </span>
                                      {step.assignedRole && (
                                        <span className="text-xs text-muted-foreground">
                                          Assigned: {step.assignedRole}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => moveStep(index, 'up')}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => moveStep(index, 'down')}
                                    disabled={index === steps.length - 1}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => editStep(index)}>
                                    <Gear className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => deleteStep(index)}>
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="automation" className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Automation Rules</h3>
                    <Button onClick={addAutomationRule}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    {automationRules.length === 0 ? (
                      <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                          <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No automation rules configured</p>
                          <Button variant="link" onClick={addAutomationRule}>Add your first rule</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {automationRules.map((rule, index) => (
                          <Card key={rule.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">Trigger: {rule.trigger}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {rule.conditions.length > 0 && `Conditions: ${rule.conditions.join(', ')}`}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs font-medium">Actions:</span>
                                    {rule.actions.map((action, actionIndex) => (
                                      <div key={actionIndex} className="flex items-center gap-1">
                                        {getActionIcon(action.type)}
                                        <Badge variant="outline" className="text-xs">
                                          {action.type}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch checked={rule.isActive} />
                                  <Button size="sm" variant="ghost">
                                    <Gear className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!workflowName || steps.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </DialogFooter>

        {/* Step Dialog */}
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStep ? 'Edit Step' : 'Add Step'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="step-name">Step Name</Label>
                <Input
                  id="step-name"
                  value={stepForm.name}
                  onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="step-description">Description</Label>
                <Textarea
                  id="step-description"
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="step-type">Step Type</Label>
                  <Select 
                    value={stepForm.type} 
                    onValueChange={(value) => setStepForm({ ...stepForm, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual Task</SelectItem>
                      <SelectItem value="automated">Automated</SelectItem>
                      <SelectItem value="approval">Approval Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="step-due">Due In (Days)</Label>
                  <Input
                    id="step-due"
                    type="number"
                    value={stepForm.dueInDays}
                    onChange={(e) => setStepForm({ ...stepForm, dueInDays: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="step-assigned">Assigned Role</Label>
                <Input
                  id="step-assigned"
                  value={stepForm.assignedRole}
                  onChange={(e) => setStepForm({ ...stepForm, assignedRole: e.target.value })}
                  placeholder="e.g., rep, manager, legal"
                />
              </div>
              <div>
                <Label htmlFor="step-criteria">Completion Criteria</Label>
                <Textarea
                  id="step-criteria"
                  value={stepForm.completionCriteria}
                  onChange={(e) => setStepForm({ ...stepForm, completionCriteria: e.target.value })}
                  placeholder="What needs to be completed for this step?"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveStep} disabled={!stepForm.name}>
                {editingStep ? 'Update' : 'Add'} Step
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}