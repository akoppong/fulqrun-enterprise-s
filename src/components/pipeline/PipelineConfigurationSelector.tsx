import React from 'react';
import { PipelineConfiguration } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target,
  Clock,
  TrendUp,
  Users,
  Building,
  Zap,
  ShoppingCart,
  Heart,
  Settings
} from '@phosphor-icons/react';

interface PipelineConfigurationSelectorProps {
  pipelines: PipelineConfiguration[];
  selectedPipeline: PipelineConfiguration | null;
  onPipelineSelect: (pipeline: PipelineConfiguration) => void;
  showDetails?: boolean;
}

export function PipelineConfigurationSelector({
  pipelines,
  selectedPipeline,
  onPipelineSelect,
  showDetails = true
}: PipelineConfigurationSelectorProps) {
  
  const getPipelineIcon = (pipelineId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'enterprise-b2b': <Building size={16} />,
      'smb-transactional': <Users size={16} />,
      'saas-subscription': <Zap size={16} />,
      'retail-ecommerce': <ShoppingCart size={16} />,
      'customer-expansion': <Heart size={16} />
    };
    return iconMap[pipelineId] || <Settings size={16} />;
  };

  const getSalesCycleDays = (pipeline: PipelineConfiguration) => {
    return Object.values(pipeline.salesCycleTargets).reduce((sum, days) => sum + days, 0);
  };

  const getAverageConversion = (pipeline: PipelineConfiguration) => {
    const conversions = Object.values(pipeline.conversionTargets);
    return conversions.length > 0 ? conversions.reduce((sum, rate) => sum + rate, 0) / conversions.length : 0;
  };

  if (!showDetails) {
    return (
      <Select 
        value={selectedPipeline?.id || ''} 
        onValueChange={(value) => {
          const pipeline = pipelines.find(p => p.id === value);
          if (pipeline) onPipelineSelect(pipeline);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a pipeline configuration" />
        </SelectTrigger>
        <SelectContent>
          {pipelines.map((pipeline) => (
            <SelectItem key={pipeline.id} value={pipeline.id}>
              <div className="flex items-center gap-2">
                {getPipelineIcon(pipeline.id)}
                <span>{pipeline.name}</span>
                <Badge variant="outline" className="ml-auto">
                  {pipeline.stages.length} stages
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pipeline Configuration</h3>
        {selectedPipeline && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target size={12} />
            Active: {selectedPipeline.name}
          </Badge>
        )}
      </div>

      {!selectedPipeline ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Target size={32} className="mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No pipeline configuration selected</p>
              <p className="text-sm text-muted-foreground">
                Choose a pipeline template to get started
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getPipelineIcon(selectedPipeline.id)}
                </div>
                <div>
                  <CardTitle className="text-lg">{selectedPipeline.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedPipeline.description}
                  </p>
                </div>
              </div>
              <Select 
                value={selectedPipeline.id} 
                onValueChange={(value) => {
                  const pipeline = pipelines.find(p => p.id === value);
                  if (pipeline) onPipelineSelect(pipeline);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      <div className="flex items-center gap-2">
                        {getPipelineIcon(pipeline.id)}
                        <span>{pipeline.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Target size={14} />
                  Stages
                </div>
                <div className="text-2xl font-bold">{selectedPipeline.stages.length}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Clock size={14} />
                  Sales Cycle
                </div>
                <div className="text-2xl font-bold">{getSalesCycleDays(selectedPipeline)}d</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <TrendUp size={14} />
                  Avg. Conversion
                </div>
                <div className="text-2xl font-bold">{getAverageConversion(selectedPipeline).toFixed(0)}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Pipeline Stages</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPipeline.stages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    <Badge className={stage.color} variant="secondary">
                      {stage.name}
                      <span className="ml-1 text-xs opacity-70">
                        ({stage.probability}%)
                      </span>
                    </Badge>
                    {index < selectedPipeline.stages.length - 1 && (
                      <span className="text-muted-foreground text-sm">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">Stage Conversion Targets</h5>
                <div className="space-y-1">
                  {Object.entries(selectedPipeline.conversionTargets).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground truncate">
                        {key.split('-to-').join(' → ').replace(/-/g, ' ')}
                      </span>
                      <span className="font-medium">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Time Targets (Days)</h5>
                <div className="space-y-1">
                  {Object.entries(selectedPipeline.salesCycleTargets).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/-/g, ' ')}
                      </span>
                      <span className="font-medium">{value}d</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}