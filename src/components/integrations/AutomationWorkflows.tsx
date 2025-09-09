import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  Filter,
  ArrowRight,
  Database,
  Globe,
  Mail,
  Webhook,
  Clock,
  CheckCircle,
  AlertCircle
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'data_change' | 'schedule' | 'webhook' | 'manual';
    config: any;
  };
  conditions: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_empty';
    value: string;
  }>;
  actions: Array<{
    type: 'sync_data' | 'send_notification' | 'update_record' | 'call_webhook';
    config: any;
  }>;
  status: 'active' | 'paused' | 'error';
  lastRun: Date | null;
  runCount: number;
}

const triggerTypes = [
  { value: 'data_change', label: 'Data Change', icon: Database },
  { value: 'schedule', label: 'Schedule', icon: Clock },
  { value: 'webhook', label: 'Webhook', icon: Webhook },
  { value: 'manual', label: 'Manual', icon: Play }
];

const actionTypes = [
  { value: 'sync_data', label: 'Sync Data', icon: Database },
  { value: 'send_notification', label: 'Send Notification', icon: Mail },
  { value: 'update_record', label: 'Update Record', icon: Settings },
  { value: 'call_webhook', label: 'Call Webhook', icon: Globe }
];

const operators = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'not_empty', label: 'Not Empty' }
];

export const AutomationWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useKV<AutomationWorkflow[]>('automation-workflows', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<AutomationWorkflow | null>(null);
  const [newWorkflow, setNewWorkflow] = useState<Partial<AutomationWorkflow>>({
    name: '',
    description: '',
    trigger: { type: 'data_change', config: {} },
    conditions: [],
    actions: [],
    status: 'active'
  });

  // Simulate workflow execution
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflows(current => 
        current.map(workflow => {
          if (workflow.status === 'active' && Math.random() < 0.1) {
            return {
              ...workflow,
              lastRun: new Date(),
              runCount: workflow.runCount + 1
            };
          }
          return workflow;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [setWorkflows]);

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name || !newWorkflow.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const workflow: AutomationWorkflow = {
      id: Date.now().toString(),
      name: newWorkflow.name!,
      description: newWorkflow.description!,
      trigger: newWorkflow.trigger!,
      conditions: newWorkflow.conditions || [],
      actions: newWorkflow.actions || [],
      status: 'active',
      lastRun: null,
      runCount: 0
    };

    setWorkflows(current => [...current, workflow]);
    setIsCreating(false);
    setNewWorkflow({
      name: '',
      description: '',
      trigger: { type: 'data_change', config: {} },
      conditions: [],
      actions: [],
      status: 'active'
    });
    toast.success('Automation workflow created successfully');
  };

  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows(current =>
      current.map(workflow =>
        workflow.id === workflowId
          ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
          : workflow
      )
    );
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(current => current.filter(workflow => workflow.id !== workflowId));
    toast.success('Workflow deleted successfully');
  };

  const addCondition = () => {
    setNewWorkflow(prev => ({
      ...prev,
      conditions: [
        ...(prev.conditions || []),
        { field: '', operator: 'equals', value: '' }
      ]
    }));
  };

  const addAction = () => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: [
        ...(prev.actions || []),
        { type: 'sync_data', config: {} }
      ]
    }));
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setNewWorkflow(prev => ({
      ...prev,
      conditions: prev.conditions?.map((condition, i) =>
        i === index ? { ...condition, [field]: value } : condition
      ) || []
    }));
  };

  const updateAction = (index: number, field: string, value: any) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions?.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      ) || []
    }));
  };

  const removeCondition = (index: number) => {
    setNewWorkflow(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
    }));
  };

  const removeAction = (index: number) => {
    setNewWorkflow(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automation Workflows</h2>
          <p className="text-muted-foreground">
            Create automated workflows to sync data and trigger actions across your integrations
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workflows created yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Create your first automation workflow to start syncing data automatically
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Workflow
              </Button>
            </CardContent>
          </Card>
        ) : (
          workflows.map(workflow => (
            <Card key={workflow.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{workflow.name}</h3>
                      <Badge className={getStatusColor(workflow.status)}>
                        {getStatusIcon(workflow.status)}
                        <span className="ml-1 capitalize">{workflow.status}</span>
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{workflow.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last run: {workflow.lastRun ? workflow.lastRun.toLocaleString() : 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        <span>Executions: {workflow.runCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4" />
                        <span>Conditions: {workflow.conditions.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span>Actions: {workflow.actions.length}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-sm font-medium">Flow:</span>
                      <Badge variant="outline" className="text-xs">
                        {triggerTypes.find(t => t.value === workflow.trigger.type)?.label}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {workflow.conditions.length} Condition{workflow.conditions.length !== 1 ? 's' : ''}
                      </Badge>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {workflow.actions.length} Action{workflow.actions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={workflow.status === 'active'}
                      onCheckedChange={() => handleToggleWorkflow(workflow.id)}
                    />
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create New Automation Workflow</DialogTitle>
            <DialogDescription>
              Set up automated data synchronization and actions between your integrations
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workflow Name</Label>
                    <Input
                      id="name"
                      value={newWorkflow.name || ''}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Sync Salesforce Leads"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger-type">Trigger Type</Label>
                    <Select
                      value={newWorkflow.trigger?.type || 'data_change'}
                      onValueChange={(value) => setNewWorkflow(prev => ({
                        ...prev,
                        trigger: { type: value as any, config: {} }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newWorkflow.description || ''}
                    onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this workflow does..."
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Conditions</h4>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
                {newWorkflow.conditions?.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2 p-4 border rounded-lg">
                    <Input
                      placeholder="Field name"
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                    />
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => updateCondition(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map(op => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )) || []}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Actions</h4>
                  <Button variant="outline" size="sm" onClick={addAction}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                {newWorkflow.actions?.map((action, index) => (
                  <div key={index} className="flex items-center gap-2 p-4 border rounded-lg">
                    <Select
                      value={action.type}
                      onValueChange={(value) => updateAction(index, 'type', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Action configuration"
                      className="flex-1"
                      onChange={(e) => updateAction(index, 'config', { value: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )) || []}
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow}>
              Create Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};