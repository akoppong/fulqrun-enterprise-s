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

        <TabsContent value="overview" className="space-y-8">
          <div key={refreshKey} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allPipelines.map((pipeline) => {
              const stats = getPipelineStats(pipeline.id);
              const health = getPipelineHealth(pipeline);
              const isActive = pipeline.id === activePipeline.id;

              return (
                <Card key={pipeline.id} className={`transition-all hover:shadow-lg ${isActive ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'hover:border-primary/50'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                          {getPipelineIcon(pipeline.id)}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {pipeline.name}
                            {isActive && (
                              <Badge variant="default" className="text-xs bg-primary">
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {pipeline.stages.length} stages • {pipeline.createdBy === 'system' ? 'Template' : 'Custom'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getHealthIcon(health.status)}
                        <span className={`text-sm font-medium ${getHealthColor(health.status)}`}>
                          {health.status}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats.totalCount}</div>
                        <div className="text-xs text-muted-foreground font-medium">Active Deals</div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${(stats.totalValue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">Total Value</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Clock size={14} />
                          Sales Cycle:
                        </span>
                        <span className="font-medium">{getSalesCycleDays(pipeline)} days</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <DollarSign size={14} />
                          Avg. Deal Size:
                        </span>
                        <span className="font-medium">
                          ${stats.averageDealSize > 0 ? (stats.averageDealSize / 1000).toFixed(0) + 'K' : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Target size={14} />
                          Conv. Rate:
                        </span>
                        <span className="font-medium">{getAverageConversion(pipeline).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      {!isActive ? (
                        <Button 
                          onClick={() => setActivePipeline(pipeline.id)}
                          variant="outline" 
                          className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                          size="sm"
                        >
                          <Target size={14} className="mr-2" />
                          Set as Active Pipeline
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

          {/* Active Pipeline Details - Enhanced */}
          <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/15 rounded-xl text-primary">
                  {getPipelineIcon(activePipeline.id)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    {activePipeline.name}
                    <Badge variant="default" className="bg-primary">
                      Active Pipeline
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {activePipeline.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="card-grid-balanced">
                <div className="lg:col-span-1">
                  <h4 className="font-semibold mb-4 text-lg">Pipeline Stages</h4>
                  <div className="space-y-3">
                    {activePipeline.stages.map((stage, index) => (
                      <div key={stage.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <Badge className={stage.color} variant="secondary">
                            {stage.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground font-medium">
                            {stage.probability}%
                          </span>
                          <Progress 
                            value={stage.probability} 
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <h4 className="font-semibold mb-4 text-lg">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {getPipelineStats(activePipeline.id).totalCount}
                        </div>
                        <div className="text-sm text-muted-foreground">Active opportunities</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign size={18} className="text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          ${(getPipelineStats(activePipeline.id).totalValue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-muted-foreground">Total pipeline value</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {getSalesCycleDays(activePipeline)} days
                        </div>
                        <div className="text-sm text-muted-foreground">Average sales cycle</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendUp size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {getAverageConversion(activePipeline).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Expected conversion rate</div>
                      </div>
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
              <CardTitle>Pipeline Performance Comparison</CardTitle>
              <p className="text-muted-foreground">
                Compare key metrics across all pipeline configurations
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 bg-muted/30">
                      <th className="text-left p-4 font-semibold">Pipeline</th>
                      <th className="text-center p-4 font-semibold">Stages</th>
                      <th className="text-center p-4 font-semibold">Active Deals</th>
                      <th className="text-right p-4 font-semibold">Total Value</th>
                      <th className="text-right p-4 font-semibold">Avg. Deal Size</th>
                      <th className="text-center p-4 font-semibold">Sales Cycle</th>
                      <th className="text-center p-4 font-semibold">Conv. Rate</th>
                      <th className="text-center p-4 font-semibold">Health</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPipelines.map((pipeline) => {
                      const stats = getPipelineStats(pipeline.id);
                      const health = getPipelineHealth(pipeline);
                      const isActive = pipeline.id === activePipeline.id;

                      return (
                        <tr key={pipeline.id} className={`border-b hover:bg-muted/30 transition-colors ${isActive ? 'bg-primary/5 border-primary/20' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                {getPipelineIcon(pipeline.id)}
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
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
                          <td className="text-center p-4">
                            <Badge variant="outline" className="text-xs">
                              {pipeline.stages.length}
                            </Badge>
                          </td>
                          <td className="text-center p-4 font-medium">{stats.totalCount}</td>
                          <td className="text-right p-4 font-medium text-green-700">
                            ${(stats.totalValue / 1000).toFixed(0)}K
                          </td>
                          <td className="text-right p-4">
                            ${stats.averageDealSize > 0 ? (stats.averageDealSize / 1000).toFixed(0) + 'K' : '0'}
                          </td>
                          <td className="text-center p-4">
                            <span className="inline-flex items-center gap-1">
                              {getSalesCycleDays(pipeline)}
                              <span className="text-xs text-muted-foreground">days</span>
                            </span>
                          </td>
                          <td className="text-center p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={getAverageConversion(pipeline)} className="w-16 h-2" />
                              <span className="text-sm font-medium min-w-[3ch]">
                                {getAverageConversion(pipeline).toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="text-center p-4">
                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${
                              health.status === 'healthy' ? 'bg-green-100 text-green-700' :
                              health.status === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                              health.status === 'low' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
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
          <div className="card-grid-balanced ratio-3-2">
            <div className="lg:col-span-1">
              <PipelineConfigurationSelector
                pipelines={allPipelines}
                selectedPipeline={selectedPipelineForAnalysis}
                onPipelineSelect={setSelectedPipelineForAnalysis}
                showDetails={true}
              />
            </div>
            <div className="lg:col-span-1">
              {selectedPipelineForAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPipelineForAnalysis.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Detailed stage analysis and performance metrics
                    </p>
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
                          <div key={stage.id} className="space-y-3 p-4 border rounded-lg bg-muted/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge className={stage.color} variant="secondary">
                                  {stage.name}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {stage.probability}% win probability
                                </span>
                              </div>
                              <div className="text-sm font-medium">
                                <span className="text-lg">{stageCount}</span>
                                <span className="text-muted-foreground ml-1">
                                  deals ({stagePercentage.toFixed(0)}%)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <Progress value={stagePercentage} className="flex-1 h-2" />
                              <span className="text-xs font-medium min-w-[3ch]">
                                {stagePercentage.toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
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