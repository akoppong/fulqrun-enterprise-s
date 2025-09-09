import React, { useState } from 'react';
import { usePipelineConfigurations } from '@/hooks/usePipelineConfigurations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { PipelineConfigurationSelector } from './PipelineConfigurationSelector';
import { OpportunityCreator } from './OpportunityCreator';
import { 
  Target,
  TrendUp,
  DollarSign,
  Users,
  Clock,
  BarChart,
  CheckCircle,
  AlertCircle,
  Building,
  Zap,
  ShoppingCart,
  Heart,
  Settings
} from '@phosphor-icons/react';

export function MultiPipelineDashboard() {
  const {
    allPipelines,
    activePipeline,
    templates,
    getPipelineStats,
    getOpportunitiesForPipeline,
    setActivePipeline
  } = usePipelineConfigurations();

  const [selectedPipelineForAnalysis, setSelectedPipelineForAnalysis] = useState(activePipeline);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpportunityCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getPipelineIcon = (pipelineId: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'enterprise-b2b': <Building size={20} />,
      'smb-transactional': <Users size={20} />,
      'saas-subscription': <Zap size={20} />,
      'retail-ecommerce': <ShoppingCart size={20} />,
      'customer-expansion': <Heart size={20} />
    };
    return iconMap[pipelineId] || <Settings size={20} />;
  };

  const getSalesCycleDays = (pipeline: any) => {
    return Object.values(pipeline.salesCycleTargets).reduce((sum: number, days: any) => sum + days, 0);
  };

  const getAverageConversion = (pipeline: any) => {
    const conversions = Object.values(pipeline.conversionTargets);
    return conversions.length > 0 ? conversions.reduce((sum: number, rate: any) => sum + rate, 0) / conversions.length : 0;
  };

  const getStageColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-100 text-green-800';
    if (probability >= 60) return 'bg-blue-100 text-blue-800';
    if (probability >= 40) return 'bg-yellow-100 text-yellow-800';
    if (probability >= 20) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getPipelineHealth = (pipeline: any) => {
    const stats = getPipelineStats(pipeline.id);
    const expectedConversion = getAverageConversion(pipeline);
    const actualOpportunities = stats.totalCount;
    
    if (actualOpportunities === 0) return { status: 'inactive', score: 0 };
    if (actualOpportunities < 5) return { status: 'low', score: 25 };
    if (actualOpportunities < 20) return { status: 'moderate', score: 60 };
    return { status: 'healthy', score: 85 };
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-orange-600';
      case 'inactive': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} className="text-green-600" />;
      case 'moderate': return <Clock size={16} className="text-yellow-600" />;
      case 'low': return <AlertCircle size={16} className="text-orange-600" />;
      case 'inactive': return <AlertCircle size={16} className="text-red-600" />;
      default: return <Target size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Multi-Pipeline Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and compare performance across different sales processes
          </p>
        </div>
        <OpportunityCreator onOpportunityCreated={handleOpportunityCreated} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Pipeline Overview</TabsTrigger>
          <TabsTrigger value="comparison">Pipeline Comparison</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div key={refreshKey} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allPipelines.map((pipeline) => {
              const stats = getPipelineStats(pipeline.id);
              const health = getPipelineHealth(pipeline);
              const isActive = pipeline.id === activePipeline.id;

              return (
                <Card key={pipeline.id} className={isActive ? 'border-primary ring-1 ring-primary/20' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {getPipelineIcon(pipeline.id)}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {pipeline.name}
                            {isActive && (
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {pipeline.stages.length} stages
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {getHealthIcon(health.status)}
                        <span className={`text-sm font-medium ${getHealthColor(health.status)}`}>
                          {health.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{stats.totalCount}</div>
                        <div className="text-xs text-muted-foreground">Opportunities</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          ${(stats.totalValue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-muted-foreground">Total Value</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Sales Cycle:</span>
                        <span className="font-medium">{getSalesCycleDays(pipeline)}d</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg. Deal Size:</span>
                        <span className="font-medium">
                          ${stats.averageDealSize > 0 ? (stats.averageDealSize / 1000).toFixed(0) + 'K' : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expected Conv.:</span>
                        <span className="font-medium">{getAverageConversion(pipeline).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      {!isActive ? (
                        <Button 
                          onClick={() => setActivePipeline(pipeline.id)}
                          variant="outline" 
                          className="w-full"
                          size="sm"
                        >
                          <Target size={14} className="mr-1" />
                          Set as Active
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          size="sm"
                          disabled
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Currently Active
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Active Pipeline Details */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  {getPipelineIcon(activePipeline.id)}
                </div>
                <div>
                  <CardTitle className="text-xl">Active Pipeline: {activePipeline.name}</CardTitle>
                  <p className="text-muted-foreground">
                    {activePipeline.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Pipeline Stages</h4>
                  <div className="space-y-2">
                    {activePipeline.stages.map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between">
                        <Badge className={stage.color} variant="secondary">
                          {stage.name}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {stage.probability}%
                          </span>
                          <Progress 
                            value={stage.probability} 
                            className="w-16 h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {getPipelineStats(activePipeline.id).totalCount} active opportunities
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        ${(getPipelineStats(activePipeline.id).totalValue / 1000).toFixed(0)}K total value
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {getSalesCycleDays(activePipeline)} day sales cycle
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendUp size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {getAverageConversion(activePipeline).toFixed(0)}% expected conversion
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Comparison Table</CardTitle>
              <p className="text-muted-foreground">
                Compare key metrics across all pipeline configurations
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Pipeline</th>
                      <th className="text-center p-2">Stages</th>
                      <th className="text-center p-2">Opportunities</th>
                      <th className="text-center p-2">Total Value</th>
                      <th className="text-center p-2">Avg. Deal Size</th>
                      <th className="text-center p-2">Sales Cycle</th>
                      <th className="text-center p-2">Expected Conv.</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPipelines.map((pipeline) => {
                      const stats = getPipelineStats(pipeline.id);
                      const health = getPipelineHealth(pipeline);
                      const isActive = pipeline.id === activePipeline.id;

                      return (
                        <tr key={pipeline.id} className={`border-b hover:bg-muted/50 ${isActive ? 'bg-primary/5' : ''}`}>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getPipelineIcon(pipeline.id)}
                              <div>
                                <div className="font-medium flex items-center gap-1">
                                  {pipeline.name}
                                  {isActive && (
                                    <Badge variant="secondary" className="text-xs">Active</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {pipeline.createdBy === 'system' ? 'Template' : 'Custom'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center p-2">{pipeline.stages.length}</td>
                          <td className="text-center p-2">{stats.totalCount}</td>
                          <td className="text-center p-2">
                            ${(stats.totalValue / 1000).toFixed(0)}K
                          </td>
                          <td className="text-center p-2">
                            ${stats.averageDealSize > 0 ? (stats.averageDealSize / 1000).toFixed(0) + 'K' : '0'}
                          </td>
                          <td className="text-center p-2">{getSalesCycleDays(pipeline)}d</td>
                          <td className="text-center p-2">{getAverageConversion(pipeline).toFixed(0)}%</td>
                          <td className="text-center p-2">
                            <div className={`flex items-center justify-center gap-1 ${getHealthColor(health.status)}`}>
                              {getHealthIcon(health.status)}
                              <span className="text-xs capitalize">{health.status}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <PipelineConfigurationSelector
                pipelines={allPipelines}
                selectedPipeline={selectedPipelineForAnalysis}
                onPipelineSelect={setSelectedPipelineForAnalysis}
                showDetails={true}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedPipelineForAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Stage Analysis: {selectedPipelineForAnalysis.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedPipelineForAnalysis.stages.map((stage) => {
                        const stageStats = getPipelineStats(selectedPipelineForAnalysis.id);
                        const stageCount = stageStats.stageDistribution[stage.id] || 0;
                        const stagePercentage = stageStats.totalCount > 0 
                          ? (stageCount / stageStats.totalCount) * 100 
                          : 0;

                        return (
                          <div key={stage.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge className={stage.color} variant="secondary">
                                  {stage.name}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {stage.probability}% win probability
                                </span>
                              </div>
                              <div className="text-sm font-medium">
                                {stageCount} opportunities ({stagePercentage.toFixed(0)}%)
                              </div>
                            </div>
                            <Progress value={stagePercentage} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {stage.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}