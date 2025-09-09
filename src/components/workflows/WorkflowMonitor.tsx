import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Bot, 
  FileText,
  Eye,
  MessageSquare,
  Calendar,
  User,
  Activity,
  TrendingUp,
  BarChart3,
  RefreshCw
} from '@phosphor-icons/react';
import { WorkflowExecution, WorkflowTemplate, ExecutionResult, WorkflowStep } from '@/lib/types';
import { WorkflowEngine } from '@/lib/workflow-engine';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface WorkflowMonitorProps {
  className?: string;
}

interface ExecutionComment {
  id: string;
  executionId: string;
  stepId?: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'comment' | 'system' | 'action';
}

export function WorkflowMonitor({ className }: WorkflowMonitorProps) {
  const [executions, setExecutions] = useKV<WorkflowExecution[]>('workflow-executions', []);
  const [templates, setTemplates] = useKV<WorkflowTemplate[]>('workflow-templates', []);
  const [comments, setComments] = useKV<ExecutionComment[]>('execution-comments', []);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [workflowEngine] = useState(() => WorkflowEngine.getInstance());
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh active executions from the engine
      const activeExecs = workflowEngine.getActiveExecutions();
      setExecutions(prev => {
        const updated = [...prev];
        activeExecs.forEach(activeExec => {
          const index = updated.findIndex(exec => exec.id === activeExec.id);
          if (index >= 0) {
            updated[index] = activeExec;
          }
        });
        return updated;
      });
    }, 30000);

    setRefreshInterval(interval);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workflowEngine]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pauseExecution = (executionId: string) => {
    workflowEngine.pauseExecution(executionId);
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'paused' } : exec
    ));
    addSystemComment(executionId, 'Workflow execution paused');
    toast.info('Workflow paused');
  };

  const resumeExecution = (executionId: string) => {
    workflowEngine.resumeExecution(executionId);
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'running' } : exec
    ));
    addSystemComment(executionId, 'Workflow execution resumed');
    toast.info('Workflow resumed');
  };

  const cancelExecution = (executionId: string) => {
    workflowEngine.cancelExecution(executionId);
    setExecutions(prev => prev.map(exec => 
      exec.id === executionId ? { ...exec, status: 'failed', completedAt: new Date() } : exec
    ));
    addSystemComment(executionId, 'Workflow execution cancelled by user');
    toast.info('Workflow cancelled');
  };

  const viewDetails = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setIsDetailDialogOpen(true);
  };

  const addComment = () => {
    if (!selectedExecution || !newComment.trim()) return;

    const comment: ExecutionComment = {
      id: `comment_${Date.now()}`,
      executionId: selectedExecution.id,
      userId: 'current-user',
      username: 'Current User',
      message: newComment.trim(),
      timestamp: new Date(),
      type: 'comment'
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    toast.success('Comment added');
  };

  const addSystemComment = (executionId: string, message: string) => {
    const comment: ExecutionComment = {
      id: `system_${Date.now()}`,
      executionId,
      userId: 'system',
      username: 'System',
      message,
      timestamp: new Date(),
      type: 'system'
    };

    setComments(prev => [...prev, comment]);
  };

  const getExecutionComments = (executionId: string) => {
    return comments
      .filter(c => c.executionId === executionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const calculateDuration = (startDate: Date | string, endDate?: Date | string) => {
    // Ensure we have valid Date objects
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    // Validate the dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '0h 0m';
    }
    
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getExecutionStats = () => {
    const total = executions.length;
    const running = executions.filter(e => e.status === 'running').length;
    const completed = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;
    const paused = executions.filter(e => e.status === 'paused').length;

    return { total, running, completed, failed, paused };
  };

  const stats = getExecutionStats();

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Workflow Execution Monitor</h2>
          <p className="text-muted-foreground">Track and manage running workflow executions</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            const activeExecs = workflowEngine.getActiveExecutions();
            setExecutions(prev => {
              const updated = [...prev];
              activeExecs.forEach(activeExec => {
                const index = updated.findIndex(exec => exec.id === activeExec.id);
                if (index >= 0) {
                  updated[index] = activeExec;
                }
              });
              return updated;
            });
            toast.info('Executions refreshed');
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paused</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution List */}
      <div className="space-y-4">
        {executions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No workflow executions found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          executions.map((execution) => {
            const template = templates.find(t => t.id === execution.workflowId);
            const progress = template ? (execution.currentStep / template.steps.length) * 100 : 0;
            const executionComments = getExecutionComments(execution.id);
            
            return (
              <Card key={execution.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <CardTitle className="text-lg">{template?.name || 'Unknown Workflow'}</CardTitle>
                        <CardDescription>
                          Opportunity: {execution.opportunityId} • Started {new Date(execution.startedAt).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => viewDetails(execution)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {execution.currentStep} / {template?.steps.length || 0} steps
                        </span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>

                    {/* Execution Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Duration</p>
                        <p>{calculateDuration(execution.startedAt, execution.completedAt)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Executed By</p>
                        <p>{execution.executedBy}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Comments</p>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{executionComments.length}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Last Updated</p>
                        <p>{execution.completedAt?.toLocaleString() || 'Running...'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
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

      {/* Execution Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Workflow Execution Details</DialogTitle>
            <DialogDescription>
              {selectedExecution && templates.find(t => t.id === selectedExecution.workflowId)?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedExecution && (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="steps" className="w-full h-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>

                <div className="mt-4 h-[400px]">
                  <TabsContent value="steps" className="h-full">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {selectedExecution.results.map((result, index) => {
                          const template = templates.find(t => t.id === selectedExecution.workflowId);
                          const step = template?.steps[index];
                          if (!step) return null;

                          return (
                            <Card key={result.stepId}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex flex-col items-center gap-1">
                                    {getStepIcon(step.type)}
                                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium">{step.name}</h4>
                                      {getStatusIcon(result.status)}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Started:</span>
                                        <span className="ml-2">{new Date(result.startedAt).toLocaleString()}</span>
                                      </div>
                                      {result.completedAt && (
                                        <div>
                                          <span className="font-medium">Completed:</span>
                                          <span className="ml-2">{new Date(result.completedAt).toLocaleString()}</span>
                                        </div>
                                      )}
                                      {result.assignedTo && (
                                        <div>
                                          <span className="font-medium">Assigned to:</span>
                                          <span className="ml-2">{result.assignedTo}</span>
                                        </div>
                                      )}
                                      {result.error && (
                                        <div className="col-span-2">
                                          <span className="font-medium text-red-600">Error:</span>
                                          <span className="ml-2 text-red-600">{result.error}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="timeline" className="h-full">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                          <Play className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Workflow Started</p>
                            <p className="text-sm text-muted-foreground">{new Date(selectedExecution.startedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        {getExecutionComments(selectedExecution.id)
                          .filter(c => c.type === 'system')
                          .map(comment => (
                            <div key={comment.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <div>
                                <p className="font-medium">{comment.message}</p>
                                <p className="text-sm text-muted-foreground">{new Date(comment.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        {selectedExecution.completedAt && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="font-medium">Workflow Completed</p>
                              <p className="text-sm text-muted-foreground">{new Date(selectedExecution.completedAt).toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="comments" className="h-full">
                    <div className="flex flex-col h-full">
                      <ScrollArea className="flex-1 mb-4">
                        <div className="space-y-3">
                          {getExecutionComments(selectedExecution.id)
                            .filter(c => c.type === 'comment')
                            .map(comment => (
                              <div key={comment.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                                <User className="h-4 w-4 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">{comment.username}</span>
                                    <span className="text-xs text-muted-foreground">{comment.timestamp.toLocaleString()}</span>
                                  </div>
                                  <p className="text-sm">{comment.message}</p>
                                </div>
                              </div>
                            ))}
                          {getExecutionComments(selectedExecution.id).filter(c => c.type === 'comment').length === 0 && (
                            <p className="text-center text-muted-foreground py-4">No comments yet</p>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addComment()}
                        />
                        <Button onClick={addComment} disabled={!newComment.trim()}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}