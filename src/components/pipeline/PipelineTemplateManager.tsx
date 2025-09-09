import React, { useState } from 'react';
import { usePipelineConfigurations } from '@/hooks/usePipelineConfigurations';
import { PipelineConfiguration } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Copy, 
  Edit, 
  Trash, 
  Target,
  Settings,
  Users,
  Building,
  Zap,
  ShoppingCart,
  Heart,
  CheckCircle,
  Clock,
  TrendUp
} from '@phosphor-icons/react';

interface PipelineTemplateManagerProps {
  onPipelineSelect?: (pipeline: PipelineConfiguration) => void;
}

export function PipelineTemplateManager({ onPipelineSelect }: PipelineTemplateManagerProps) {
  const {
    allPipelines,
    customPipelines,
    activePipeline,
    templates,
    clonePipeline,
    deleteCustomPipeline,
    setActivePipeline
  } = usePipelineConfigurations();
  
  const [activeTab, setActiveTab] = useState('templates');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreatePipeline = (templateId?: string) => {
    if (templateId) {
      clonePipeline(templateId);
    }
  };

  const handleEditPipeline = (pipeline: PipelineConfiguration) => {
    // TODO: Implement edit dialog
    console.log('Edit pipeline:', pipeline);
  };

  const handleDeletePipeline = (pipelineId: string) => {
    deleteCustomPipeline(pipelineId);
  };

  const handleUsePipeline = (pipeline: PipelineConfiguration) => {
    setActivePipeline(pipeline.id);
    onPipelineSelect?.(pipeline);
  };

  const getPipelineIcon = (pipelineId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'enterprise-b2b': <Building size={20} />,
      'smb-transactional': <Users size={20} />,
      'saas-subscription': <Zap size={20} />,
      'retail-ecommerce': <ShoppingCart size={20} />,
      'customer-expansion': <Heart size={20} />
    };
    return iconMap[pipelineId] || <Target size={20} />;
  };

  const getSalesCycleDays = (pipeline: PipelineConfiguration) => {
    return Object.values(pipeline.salesCycleTargets).reduce((sum, days) => sum + days, 0);
  };

  const getAverageConversion = (pipeline: PipelineConfiguration) => {
    const conversions = Object.values(pipeline.conversionTargets);
    return conversions.length > 0 ? conversions.reduce((sum, rate) => sum + rate, 0) / conversions.length : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Pipeline Template Manager</h2>
          <p className="text-muted-foreground">
            Choose from pre-built pipeline templates or create custom sales processes
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create Custom Pipeline
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="templates">Pre-built Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Pipelines ({customPipelines.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((pipeline) => (
              <Card key={pipeline.id} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {getPipelineIcon(pipeline.id)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {pipeline.stages.length} stages
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {pipeline.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Sales Cycle:</span>
                      <span className="font-medium">{getSalesCycleDays(pipeline)} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg. Conversion:</span>
                      <span className="font-medium">{getAverageConversion(pipeline).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {pipeline.stages.slice(0, 3).map((stage) => (
                      <Badge key={stage.id} variant="secondary" className="text-xs">
                        {stage.name}
                      </Badge>
                    ))}
                    {pipeline.stages.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{pipeline.stages.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleUsePipeline(pipeline)}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Use Template
                    </Button>
                    <Button 
                      onClick={() => handleCreatePipeline(pipeline.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {customPipelines.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Custom Pipelines Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a custom pipeline by copying a template or building from scratch
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Create Your First Pipeline
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customPipelines.map((pipeline) => (
                <Card key={pipeline.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg text-accent">
                          <Settings size={20} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {pipeline.stages.length} stages
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditPipeline(pipeline)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePipeline(pipeline.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {pipeline.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Average Sales Cycle:</span>
                        <span className="font-medium">{getSalesCycleDays(pipeline)} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg. Conversion:</span>
                        <span className="font-medium">{getAverageConversion(pipeline).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {pipeline.stages.slice(0, 3).map((stage) => (
                        <Badge key={stage.id} variant="secondary" className="text-xs">
                          {stage.name}
                        </Badge>
                      ))}
                      {pipeline.stages.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pipeline.stages.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleUsePipeline(pipeline)}
                        className="flex-1"
                        size="sm"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Use Pipeline
                      </Button>
                      <Button 
                        onClick={() => handleCreatePipeline()}
                        variant="outline"
                        size="sm"
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {activePipeline && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <CheckCircle size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">Active Pipeline: {activePipeline.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  This pipeline is currently active for new opportunities
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activePipeline.stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <Badge className={stage.color}>
                    {stage.name}
                  </Badge>
                  {index < activePipeline.stages.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}