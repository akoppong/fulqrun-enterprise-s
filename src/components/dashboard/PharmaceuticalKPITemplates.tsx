import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PHARMA_SALES_KPI_TEMPLATES, PHARMA_DASHBOARD_TEMPLATES } from '@/data/pharma-kpi-templates';
import { 
  DollarSign, 
  Target, 
  Activity, 
  Shield, 
  MapPin,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle
} from '@phosphor-icons/react';

interface PharmaceuticalKPITemplatesProps {
  onApplyTemplate: (templateData: any) => void;
  onCreateKPI: (kpiData: any) => void;
}

export function PharmaceuticalKPITemplates({ onApplyTemplate, onCreateKPI }: PharmaceuticalKPITemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('revenue');
  const [selectedDashboard, setSelectedDashboard] = useState('territory_manager');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="w-5 h-5" />;
      case 'market_access': return <Target className="w-5 h-5" />;
      case 'clinical': return <Activity className="w-5 h-5" />;
      case 'compliance': return <Shield className="w-5 h-5" />;
      case 'territory': return <MapPin className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue': return 'text-green-600 bg-green-100';
      case 'market_access': return 'text-blue-600 bg-blue-100';
      case 'clinical': return 'text-purple-600 bg-purple-100';
      case 'compliance': return 'text-red-600 bg-red-100';
      case 'territory': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBenchmark = (value: number, unit: string) => {
    return unit === '$' ? `$${value.toLocaleString()}` : `${value}${unit}`;
  };

  const getKPIPerformanceStatus = (current: number, target: number, unit: string) => {
    const ratio = current / target;
    if (ratio >= 1.1) return { status: 'excellent', color: 'text-green-600', icon: <TrendingUp /> };
    if (ratio >= 1.0) return { status: 'good', color: 'text-blue-600', icon: <CheckCircle /> };
    if (ratio >= 0.9) return { status: 'warning', color: 'text-yellow-600', icon: <AlertTriangle /> };
    return { status: 'poor', color: 'text-red-600', icon: <TrendingDown /> };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pharmaceutical Sales KPI Templates</h1>
          <p className="text-muted-foreground">
            Industry-specific KPI templates optimized for pharmaceutical B2B sales operations
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Activity className="w-4 h-4 mr-1" />
          Pharma Optimized
        </Badge>
      </div>

      <Tabs defaultValue="kpi-library" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kpi-library">KPI Library</TabsTrigger>
          <TabsTrigger value="dashboard-templates">Dashboard Templates</TabsTrigger>
          <TabsTrigger value="performance-simulator">Performance Simulator</TabsTrigger>
        </TabsList>

        <TabsContent value="kpi-library" className="space-y-6">
          {/* Category Selection */}
          <div className="flex flex-wrap gap-3">
            {PHARMA_SALES_KPI_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedCategory(template.category)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  selectedCategory === template.category
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className={`p-1 rounded ${getCategoryColor(template.category)}`}>
                  {getCategoryIcon(template.category)}
                </div>
                <span className="font-medium capitalize">
                  {template.category.replace('_', ' ')}
                </span>
                <Badge variant="outline" className="ml-2">
                  {template.kpis.length}
                </Badge>
              </button>
            ))}
          </div>

          {/* KPI Details */}
          {PHARMA_SALES_KPI_TEMPLATES.filter(t => t.category === selectedCategory).map((template) => (
            <div key={template.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                  {getCategoryIcon(template.category)}
                </div>
                <div>
                  <h3 className="text-xl font-bold capitalize">
                    {template.category.replace('_', ' ')} KPIs
                  </h3>
                  <p className="text-muted-foreground">
                    {template.kpis.length} key performance indicators
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {template.kpis.map((kpi, index) => (
                  <Card key={index} className="border-2 hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{kpi.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {kpi.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {kpi.frequency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Target and Benchmarks */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm text-muted-foreground">Target</div>
                          <div className="font-bold">
                            {formatBenchmark(kpi.target, kpi.unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Industry Avg</div>
                          <div className="font-medium">
                            {formatBenchmark(kpi.benchmark.industry, kpi.unit)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Top Quartile</div>
                          <div className="font-medium text-green-600">
                            {formatBenchmark(kpi.benchmark.topQuartile, kpi.unit)}
                          </div>
                        </div>
                      </div>

                      {/* Formula */}
                      <div>
                        <div className="text-sm font-medium mb-1">Calculation Method:</div>
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {kpi.formula}
                        </div>
                      </div>

                      {/* Drill-downs */}
                      <div>
                        <div className="text-sm font-medium mb-2">Available Drill-downs:</div>
                        <div className="flex flex-wrap gap-1">
                          {kpi.drillDowns.map((drillDown, drillIndex) => (
                            <Badge key={drillIndex} variant="secondary" className="text-xs">
                              {drillDown}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => onCreateKPI({
                            name: kpi.name,
                            target: kpi.target,
                            unit: kpi.unit,
                            frequency: kpi.frequency,
                            formula: kpi.formula,
                            category: template.category
                          })}
                          className="flex-1"
                        >
                          <Target className="w-4 h-4 mr-1" />
                          Add to Dashboard
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="dashboard-templates" className="space-y-6">
          {/* Dashboard Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PHARMA_DASHBOARD_TEMPLATES).map(([key, template]) => (
              <Card 
                key={key}
                className={`cursor-pointer border-2 transition-all ${
                  selectedDashboard === key 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => setSelectedDashboard(key)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">
                      {template.kpis.length} KPIs
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Key Metrics:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.kpis.slice(0, 3).map((kpi, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {kpi}
                        </Badge>
                      ))}
                      {template.kpis.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.kpis.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedDashboard === key && (
                    <Button 
                      className="w-full mt-4"
                      onClick={() => onApplyTemplate({
                        templateKey: key,
                        template: template
                      })}
                    >
                      Apply Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Template Details */}
          {selectedDashboard && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {PHARMA_DASHBOARD_TEMPLATES[selectedDashboard as keyof typeof PHARMA_DASHBOARD_TEMPLATES].name}
                </CardTitle>
                <p className="text-muted-foreground">
                  Complete KPI breakdown for this role
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PHARMA_DASHBOARD_TEMPLATES[selectedDashboard as keyof typeof PHARMA_DASHBOARD_TEMPLATES].kpis.map((kpiName, index) => {
                    // Find the KPI details from the templates
                    let kpiDetails = null;
                    for (const template of PHARMA_SALES_KPI_TEMPLATES) {
                      kpiDetails = template.kpis.find(k => k.name === kpiName);
                      if (kpiDetails) break;
                    }

                    if (!kpiDetails) return null;

                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{kpiDetails.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Target: {formatBenchmark(kpiDetails.target, kpiDetails.unit)} • {kpiDetails.frequency}
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {kpiDetails.frequency}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance-simulator" className="space-y-6">
          {/* Performance Simulator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Pharmaceutical Sales Performance Simulator
              </CardTitle>
              <p className="text-muted-foreground">
                Simulate different performance scenarios to understand KPI relationships
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sample Performance Cards */}
                <div className="space-y-4">
                  <h4 className="font-medium">Territory Performance</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Monthly Prescription Revenue</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold">$2.3M</div>
                      <Progress value={92} className="h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        92% of $2.5M target
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">HCP Coverage Rate</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold">89%</div>
                      <Progress value={89} className="h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Above 88% target
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Market Access</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Formulary Win Rate</span>
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="text-lg font-bold">72%</div>
                      <Progress value={72} className="h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        72% vs 78% target
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Market Access Coverage</span>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold">87%</div>
                      <Progress value={87} className="h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Above 85% target
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Compliance</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Training Completion</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold">100%</div>
                      <Progress value={100} className="h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Meets 100% requirement
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">AE Reporting</span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-lg font-bold">99%</div>
                      <Progress value={99} className="h-2 mt-1" />
                      <div className="text-xs text-muted-foreground mt-1">
                        Above 98% target
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Performance Insights</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on current performance, focus on improving formulary win rate through enhanced
                      payer engagement strategies. Your strong HCP coverage provides a solid foundation for
                      market access improvements.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}