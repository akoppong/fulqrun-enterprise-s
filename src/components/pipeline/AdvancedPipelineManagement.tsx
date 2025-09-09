import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PipelineBuilder } from './PipelineBuilder';
import { EnhancedPipelineView } from './EnhancedPipelineView';
import { WorkflowAutomationEngine } from './WorkflowAutomationEngine';
import { PipelineAnalyticsDashboard } from './PipelineAnalyticsDashboard';
import { PipelineTemplateManager } from './PipelineTemplateManager';
import { MultiPipelineDashboard } from './MultiPipelineDashboard';
import { PipelineConfiguration } from '@/lib/types';
import { 
  Gear, 
  BarChart, 
  Zap, 
  Target,
  Template,
  ChartLine
} from '@phosphor-icons/react';

export function AdvancedPipelineManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineConfiguration | null>(null);

  const handlePipelineSelect = (pipeline: PipelineConfiguration) => {
    setSelectedPipeline(pipeline);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Advanced Pipeline Management</h1>
          <p className="text-muted-foreground">
            Comprehensive pipeline management with drag-and-drop deals, workflow automation, and analytics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ChartLine size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Template size={16} />
            Templates
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Target size={16} />
            Pipeline View
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Gear size={16} />
            Pipeline Builder
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap size={16} />
            Automation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart size={16} />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <MultiPipelineDashboard />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <PipelineTemplateManager onPipelineSelect={handlePipelineSelect} />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <EnhancedPipelineView selectedPipeline={selectedPipeline} />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <PipelineBuilder selectedPipeline={selectedPipeline} />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <WorkflowAutomationEngine />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PipelineAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}