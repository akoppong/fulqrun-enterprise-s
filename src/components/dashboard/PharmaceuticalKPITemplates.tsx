import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  pharmaceuticalKPITemplates, 
  getPharmaceuticalCategories, 
  getPharmaceuticalTemplatesByCategory,
  searchPharmaceuticalTemplates 
} from '@/data/pharmaceutical-kpi-templates';
import { KPITemplate, KPITemplateMetric } from '@/lib/types';
import { Search, Plus, Target, TrendingUp, BarChart3, Activity, DollarSign, Users, FileText, Zap } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface PharmaceuticalKPITemplatesProps {
  onSelectTemplate: (template: KPITemplate) => void;
}

export function PharmaceuticalKPITemplates({ onSelectTemplate }: PharmaceuticalKPITemplatesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<KPITemplate | null>(null);

  const categories = getPharmaceuticalCategories();
  
  const filteredTemplates = useMemo(() => {
    let templates = pharmaceuticalKPITemplates;
    
    if (searchTerm) {
      templates = searchPharmaceuticalTemplates(searchTerm);
    }
    
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedCategory);
    }
    
    return templates;
  }, [searchTerm, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Revenue & Financial': return <DollarSign className="w-4 h-4" />;
      case 'Pipeline Management': return <BarChart3 className="w-4 h-4" />;
      case 'Lead Management': return <Target className="w-4 h-4" />;
      case 'Customer Success': return <Users className="w-4 h-4" />;
      case 'Sales Performance': return <TrendingUp className="w-4 h-4" />;
      case 'Compliance & Quality': return <FileText className="w-4 h-4" />;
      case 'Product Management': return <Activity className="w-4 h-4" />;
      case 'Digital Marketing': return <Zap className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'currency': return <DollarSign className="w-3 h-3" />;
      case 'percentage': return <TrendingUp className="w-3 h-3" />;
      case 'number': return <BarChart3 className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const formatMetricValue = (metric: KPITemplateMetric) => {
    if (metric.type === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        notation: metric.current >= 1000000 ? 'compact' : 'standard'
      }).format(metric.current);
    }
    if (metric.type === 'percentage') {
      return `${metric.current}%`;
    }
    return new Intl.NumberFormat('en-US', { 
      notation: metric.current >= 1000 ? 'compact' : 'standard' 
    }).format(metric.current);
  };

  const getProgressPercentage = (metric: KPITemplateMetric) => {
    if (metric.trend === 'lower-better') {
      // For metrics where lower is better, flip the calculation
      const efficiency = Math.min((metric.target / metric.current) * 100, 100);
      return Math.max(efficiency, 0);
    }
    return Math.min((metric.current / metric.target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleUseTemplate = (template: KPITemplate) => {
    onSelectTemplate(template);
    toast.success(`Applied "${template.name}" template successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Pharmaceutical B2B Sales KPI Templates
          </h2>
          <p className="text-muted-foreground">
            Pre-configured KPI templates designed for high-performance pharmaceutical sales operations
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="Revenue & Financial" className="text-xs">Revenue</TabsTrigger>
              <TabsTrigger value="Pipeline Management" className="text-xs">Pipeline</TabsTrigger>
              <TabsTrigger value="Lead Management" className="text-xs">Leads</TabsTrigger>
              <TabsTrigger value="Customer Success" className="text-xs">Customer</TabsTrigger>
              <TabsTrigger value="Sales Performance" className="text-xs">Sales</TabsTrigger>
              <TabsTrigger value="Compliance & Quality" className="text-xs">Compliance</TabsTrigger>
              <TabsTrigger value="Product Management" className="text-xs">Product</TabsTrigger>
              <TabsTrigger value="Digital Marketing" className="text-xs">Digital</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                  {template.industry}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Preview Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Key Metrics Preview:</h4>
                {template.metrics.slice(0, 2).map((metric, index) => {
                  const progress = getProgressPercentage(metric);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getMetricIcon(metric.type)}
                          <span className="text-xs font-medium truncate">{metric.name}</span>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {formatMetricValue(metric)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {template.metrics.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{template.metrics.length - 2} more metrics
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getCategoryIcon(template.category)}
                        {template.name}
                      </DialogTitle>
                      <DialogDescription>
                        {template.description}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-6">
                        {/* Template Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {template.metrics.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Metrics</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {template.visualizations.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Chart Types</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <div className="text-2xl font-bold text-primary">
                              {template.tags.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Focus Areas</div>
                          </div>
                        </div>

                        {/* All Metrics */}
                        <div>
                          <h4 className="font-medium mb-3">Complete Metrics Set</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {template.metrics.map((metric, index) => {
                              const progress = getProgressPercentage(metric);
                              return (
                                <Card key={index}>
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {getMetricIcon(metric.type)}
                                          <h5 className="font-medium text-sm">{metric.name}</h5>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                          {metric.timeframe}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="text-lg font-bold text-primary">
                                            {formatMetricValue(metric)}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            Target: {metric.type === 'currency' 
                                              ? new Intl.NumberFormat('en-US', { 
                                                  style: 'currency', 
                                                  currency: 'USD',
                                                  notation: metric.target >= 1000000 ? 'compact' : 'standard'
                                                }).format(metric.target)
                                              : metric.type === 'percentage'
                                              ? `${metric.target}%`
                                              : new Intl.NumberFormat('en-US', { 
                                                  notation: metric.target >= 1000 ? 'compact' : 'standard' 
                                                }).format(metric.target)
                                            }
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">
                                            {progress.toFixed(1)}%
                                          </div>
                                          <div className="w-16 bg-muted rounded-full h-2 mt-1">
                                            <div 
                                              className={`h-2 rounded-full ${getProgressColor(progress)}`}
                                              style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>

                        {/* Visualizations */}
                        <div>
                          <h4 className="font-medium mb-3">Available Visualizations</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.visualizations.map((viz) => (
                              <Badge key={viz} variant="outline" className="capitalize">
                                {viz.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* All Tags */}
                        <div>
                          <h4 className="font-medium mb-3">Focus Areas</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="capitalize">
                                {tag.replace('-', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => handleUseTemplate(template)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Use This Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No templates found matching your criteria.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}