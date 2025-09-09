import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBreakpoint } from '@/hooks/useBreakpoint';
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
  const { isMobile, isTablet } = useBreakpoint();

  const handlePipelineSelect = (pipeline: PipelineConfiguration) => {
    setSelectedPipeline(pipeline);
  };

  const getTabsLayout = () => {
    if (isMobile) return "flex flex-wrap gap-1";
    if (isTablet) return "grid w-full grid-cols-3";
    return "grid w-full grid-cols-6";
  };

  const getTabContent = (icon: React.ReactNode, label: string, shortLabel?: string) => (
    <div className="flex items-center gap-2">
      {icon}
      <span className={isMobile ? "text-xs" : ""}>
        {isMobile && shortLabel ? shortLabel : label}
      </span>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Advanced Pipeline Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive pipeline management with drag-and-drop deals, workflow automation, and analytics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
        <TabsList className={getTabsLayout()}>
          <TabsTrigger value="dashboard" className={isMobile ? "flex-1 p-2" : "flex items-center gap-2"}>
            {getTabContent(<ChartLine size={16} />, "Dashboard")}
          </TabsTrigger>
          <TabsTrigger value="templates" className={isMobile ? "flex-1 p-2" : "flex items-center gap-2"}>
            {getTabContent(<Template size={16} />, "Templates")}
          </TabsTrigger>
          <TabsTrigger value="pipeline" className={isMobile ? "flex-1 p-2" : "flex items-center gap-2"}>
            {getTabContent(<Target size={16} />, "Pipeline View", "Pipeline")}
          </TabsTrigger>
          <TabsTrigger value="builder" className={isMobile ? "flex-1 p-2" : "flex items-center gap-2"}>
            {getTabContent(<Gear size={16} />, "Pipeline Builder", "Builder")}
          </TabsTrigger>
          <TabsTrigger value="automation" className={isMobile ? "flex-1 p-2" : "flex items-center gap-2"}>
            {getTabContent(<Zap size={16} />, "Automation", "Auto")}
          </TabsTrigger>
          <TabsTrigger value="analytics" className={isMobile ? "flex-1 p-2" : "flex items-center gap-2"}>
            {getTabContent(<BarChart size={16} />, "Analytics")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4 lg:space-y-6">
          <MultiPipelineDashboard />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 lg:space-y-6">
          <PipelineTemplateManager onPipelineSelect={handlePipelineSelect} />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4 lg:space-y-6">
          <EnhancedPipelineView selectedPipeline={selectedPipeline} />
        </TabsContent>

        <TabsContent value="builder" className="space-y-4 lg:space-y-6">
          <PipelineBuilder selectedPipeline={selectedPipeline} />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4 lg:space-y-6">
          <WorkflowAutomationEngine />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 lg:space-y-6">
          <PipelineAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}