import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  Plus, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Workflow,
  GitBranch,
  Timer,
  Users,
  FileText,
  Mail,
  Bell,
  HardDrives,
  Webhook,
  Bot
} from '@phosphor-icons/react';
import { WorkflowTemplate, WorkflowExecution, WorkflowStep, PeakStage, PEAK_STAGES, AutomationAction, AutomationRule } from '@/lib/types';
import { WorkflowEngine, defaultWorkflowTemplates } from '@/lib/workflow-engine';
import { WorkflowBuilder } from './WorkflowBuilder';
import { WorkflowMonitor } from './WorkflowMonitor';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface WorkflowAutomationProps {
  className?: string;
}

export function WorkflowAutomation({ className }: WorkflowAutomationProps) {
  const [templates, setTemplates] = useKV<WorkflowTemplate[]>('workflow-templates', defaultWorkflowTemplates);
  const [executions, setExecutions] = useKV<WorkflowExecution[]>('workflow-executions', []);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = useState(false);
  const [workflowEngine] = useState(() => WorkflowEngine.getInstance());

  useEffect(() => {
    // Register all templates with the workflow engine
    templates.forEach(template => {
      workflowEngine.registerTemplate(template);
    });
  }, [templates, workflowEngine]);

  const handleCreateWorkflow = () => {
    setSelectedTemplate(null);
    setIsCreateDialogOpen(true);
  };

  const handleSaveWorkflow = (template: WorkflowTemplate) => {
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // Update existing template
      setTemplates(prev => prev.map((t, index) => 
        index === existingIndex ? template : t
      ));
      toast.success('Workflow template updated');
    } else {
      // Add new template
      setTemplates(prev => [...prev, template]);
      toast.success('Workflow template created');
    }
    
    setIsCreateDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleEditWorkflow = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsCreateDialogOpen(true);
  };

  const handleExecuteWorkflow = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setIsExecuteDialogOpen(true);
  };

  const executeWorkflow = async (templateId: string, opportunityId: string) => {
    try {
      // Mock opportunity data - in real app this would come from your data store
      const mockOpportunity = {
        id: opportunityId,
        title: 'Sample Opportunity',
        stage: 'prospect' as PeakStage,
        value: 50000,
        companyId: 'company1',
        contactId: 'contact1',
        description: 'Sample opportunity for workflow execution',
        probability: 25,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ownerId: 'user1',
        meddpicc: {
          metrics: 'TBD',
          economicBuyer: 'TBD',
          decisionCriteria: 'TBD',
          decisionProcess: 'TBD',
          paperProcess: 'TBD',
          implicatePain: 'TBD',
          champion: 'TBD',
          score: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const execution = await workflowEngine.executeWorkflow(templateId, mockOpportunity, 'current-user');
      
      setExecutions(prev => [...prev, execution]);
      toast.success('Workflow started successfully');
      setIsExecuteDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to start workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const pauseExecution = (executionId: string) => {
    workflowEngine.pauseExecution(executionId);
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'paused' } : exec
    ));
    toast.info('Workflow paused');
  };

  const resumeExecution = (executionId: string) => {
    workflowEngine.resumeExecution(executionId);
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'running' } : exec
    ));
    toast.info('Workflow resumed');
  };

  const cancelExecution = (executionId: string) => {
    workflowEngine.cancelExecution(executionId);
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'failed', completedAt: new Date() } : exec
    ));
    toast.info('Workflow cancelled');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4 text-blue-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
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
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Pipeline Workflow Automation</h2>
          <p className="text-muted-foreground">Create and manage automated workflows for your sales pipeline stages</p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">
            <Workflow className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="executions">
            <GitBranch className="h-4 w-4 mr-2" />
            Active Executions
          </TabsTrigger>
          <TabsTrigger value="monitor">
            <Timer className="h-4 w-4 mr-2" />
            Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className={PEAK_STAGES.find(s => s.value === template.stage)?.color}>
                      {template.stage}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{template.steps.length} steps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{template.automationRules.length} automation rules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={template.isActive} />
                      <span className="text-sm">Active</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleExecuteWorkflow(template)}
                      disabled={!template.isActive}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditWorkflow(template)}>
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="grid gap-4">
            {executions.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No active workflow executions</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              executions.map((execution) => {
                const template = templates.find(t => t.id === execution.workflowId);
                const progress = (execution.currentStep / (template?.steps.length || 1)) * 100;
                
                return (
                  <Card key={execution.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <CardTitle className="text-lg">{template?.name || 'Unknown Workflow'}</CardTitle>
                        </div>
                        <Badge variant={execution.status === 'completed' ? 'default' : execution.status === 'failed' ? 'destructive' : 'secondary'}>
                          {execution.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Started {execution.startedAt.toLocaleString()} by {execution.executedBy}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {execution.currentStep} / {template?.steps.length || 0} steps
                            </span>
                          </div>
                          <Progress value={progress} className="w-full" />
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Current Steps</Label>
                          <ScrollArea className="h-32 mt-2">
                            <div className="space-y-2">
                              {execution.results.map((result, index) => {
                                const step = template?.steps[index];
                                if (!step) return null;
                                
                                return (
                                  <div key={result.stepId} className="flex items-center gap-2 p-2 rounded border">
                                    {getStepIcon(step.type)}
                                    <span className="text-sm flex-1">{step.name}</span>
                                    {getStatusIcon(result.status)}
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>

                        <div className="flex gap-2">
                          {execution.status === 'running' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => pauseExecution(execution.id)}>
                                <Pause className="h-3 w-3 mr-1" />
                                Pause
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => cancelExecution(execution.id)}>
                                <Square className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {execution.status === 'paused' && (
                            <Button size="sm" onClick={() => resumeExecution(execution.id)}>
                              <Play className="h-3 w-3 mr-1" />
                              Resume
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <WorkflowMonitor />
        </TabsContent>
      </Tabs>

      {/* Workflow Builder Dialog */}
      <WorkflowBuilder
        template={selectedTemplate || undefined}
        onSave={handleSaveWorkflow}
        onCancel={() => {
          setIsCreateDialogOpen(false);
          setSelectedTemplate(null);
        }}
        isOpen={isCreateDialogOpen}
      />

      {/* Execute Workflow Dialog */}
      <Dialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Execute Workflow</DialogTitle>
            <DialogDescription>
              Start the "{selectedTemplate?.name}" workflow for an opportunity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="opportunity-id">Opportunity ID</Label>
              <Input 
                id="opportunity-id" 
                placeholder="Enter opportunity ID"
                defaultValue="opp_sample_001"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExecuteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const input = document.getElementById('opportunity-id') as HTMLInputElement;
              if (selectedTemplate && input.value) {
                executeWorkflow(selectedTemplate.id, input.value);
              }
            }}>
              <Play className="h-4 w-4 mr-2" />
              Start Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}