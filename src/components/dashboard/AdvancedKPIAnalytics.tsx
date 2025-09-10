import React, { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { KPIAnalyticsFilters } from './KPIAnalyticsFilters';
import { DrillDownChart } from './DrillDownChart';
import { 
  TrendingUp, TrendingDown, Target, Users, DollarSign, 
  BarChart3, PieChart, Activity, Eye, Filter,
  ArrowUpRight, ArrowDownRight, Minus, ChevronDown,
  Calendar, Clock, MapPin, Star, Award, AlertTriangle,
  Download, Share, Bookmark, RefreshCw
} from '@phosphor-icons/react';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: 'sales' | 'marketing' | 'financial' | 'operational';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  drillDownData: DrillDownData[];
}

interface DrillDownData {
  label: string;
  value: number;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
  subMetrics?: SubMetric[];
  timeData?: TimeSeriesData[];
  segmentData?: SegmentData[];
}

interface SubMetric {
  name: string;
  value: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
}

interface TimeSeriesData {
  period: string;
  value: number;
  target?: number;
}

interface SegmentData {
  segment: string;
  value: number;
  percentage: number;
  performance: 'high' | 'medium' | 'low';
}

const mockKPIData: KPIMetric[] = [
  {
    id: 'revenue',
    name: 'Total Revenue',
    value: 2450000,
    target: 2500000,
    unit: '$',
    trend: 'up',
    trendPercentage: 12.5,
    category: 'financial',
    period: 'monthly',
    drillDownData: [
      {
        label: 'Enterprise Deals',
        value: 1200000,
        percentage: 49,
        trend: 'up',
        subMetrics: [
          { name: 'Avg Deal Size', value: 85000, target: 75000, status: 'good' },
          { name: 'Close Rate', value: 28, target: 25, status: 'good' },
          { name: 'Sales Cycle', value: 45, target: 60, status: 'good' }
        ],
        timeData: [
          { period: 'Jan', value: 850000, target: 800000 },
          { period: 'Feb', value: 920000, target: 850000 },
          { period: 'Mar', value: 1200000, target: 900000 }
        ],
        segmentData: [
          { segment: 'Strategic Partners', value: 600000, percentage: 50, performance: 'high' },
          { segment: 'Reference Customers', value: 360000, percentage: 30, performance: 'medium' },
          { segment: 'Vector Control', value: 240000, percentage: 20, performance: 'high' }
        ]
      },
      {
        label: 'SMB Deals',
        value: 850000,
        percentage: 35,
        trend: 'stable',
        subMetrics: [
          { name: 'Avg Deal Size', value: 15000, target: 12000, status: 'good' },
          { name: 'Close Rate', value: 35, target: 30, status: 'good' },
          { name: 'Sales Cycle', value: 18, target: 21, status: 'good' }
        ],
        timeData: [
          { period: 'Jan', value: 750000, target: 700000 },
          { period: 'Feb', value: 800000, target: 750000 },
          { period: 'Mar', value: 850000, target: 800000 }
        ]
      },
      {
        label: 'Renewals',
        value: 400000,
        percentage: 16,
        trend: 'up',
        subMetrics: [
          { name: 'Renewal Rate', value: 92, target: 85, status: 'good' },
          { name: 'Expansion Rate', value: 18, target: 15, status: 'good' },
          { name: 'Churn Rate', value: 8, target: 15, status: 'good' }
        ]
      }
    ]
  },
  {
    id: 'pipeline',
    name: 'Pipeline Value',
    value: 8750000,
    target: 9000000,
    unit: '$',
    trend: 'up',
    trendPercentage: 8.3,
    category: 'sales',
    period: 'monthly',
    drillDownData: [
      {
        label: 'Qualified Leads',
        value: 3200000,
        percentage: 37,
        subMetrics: [
          { name: 'Lead Score Avg', value: 78, target: 70, status: 'good' },
          { name: 'MQL to SQL Rate', value: 42, target: 35, status: 'good' }
        ]
      },
      {
        label: 'Proposal Stage',
        value: 2800000,
        percentage: 32,
        subMetrics: [
          { name: 'Win Rate', value: 65, target: 60, status: 'good' },
          { name: 'Avg Time in Stage', value: 12, target: 15, status: 'good' }
        ]
      },
      {
        label: 'Negotiation',
        value: 1950000,
        percentage: 22,
        subMetrics: [
          { name: 'Close Rate', value: 78, target: 70, status: 'good' },
          { name: 'Discount Rate', value: 8, target: 12, status: 'good' }
        ]
      },
      {
        label: 'Closed Won',
        value: 800000,
        percentage: 9,
        subMetrics: [
          { name: 'Revenue Recognition', value: 95, target: 90, status: 'good' }
        ]
      }
    ]
  },
  {
    id: 'conversion',
    name: 'Lead Conversion Rate',
    value: 24.5,
    target: 22.0,
    unit: '%',
    trend: 'up',
    trendPercentage: 5.2,
    category: 'marketing',
    period: 'monthly',
    drillDownData: [
      {
        label: 'Inbound Leads',
        value: 28.5,
        percentage: 65,
        subMetrics: [
          { name: 'Website Conversion', value: 3.2, target: 2.8, status: 'good' },
          { name: 'Content Marketing', value: 15.5, target: 12.0, status: 'good' },
          { name: 'Webinar Leads', value: 35.8, target: 30.0, status: 'good' }
        ]
      },
      {
        label: 'Outbound Leads',
        value: 18.2,
        percentage: 35,
        subMetrics: [
          { name: 'Cold Email', value: 12.5, target: 10.0, status: 'good' },
          { name: 'LinkedIn Outreach', value: 22.8, target: 18.0, status: 'good' },
          { name: 'Phone Calls', value: 8.5, target: 12.0, status: 'warning' }
        ]
      }
    ]
  },
  {
    id: 'customer_satisfaction',
    name: 'Customer Satisfaction',
    value: 8.7,
    target: 8.5,
    unit: '/10',
    trend: 'up',
    trendPercentage: 2.4,
    category: 'operational',
    period: 'monthly',
    drillDownData: [
      {
        label: 'Product Experience',
        value: 8.9,
        percentage: 40,
        subMetrics: [
          { name: 'Ease of Use', value: 9.1, target: 8.5, status: 'good' },
          { name: 'Feature Completeness', value: 8.8, target: 8.0, status: 'good' },
          { name: 'Performance', value: 8.7, target: 8.5, status: 'good' }
        ]
      },
      {
        label: 'Support Experience',
        value: 8.4,
        percentage: 35,
        subMetrics: [
          { name: 'Response Time', value: 8.2, target: 8.0, status: 'good' },
          { name: 'Resolution Rate', value: 8.8, target: 8.5, status: 'good' },
          { name: 'Agent Knowledge', value: 8.1, target: 8.0, status: 'good' }
        ]
      },
      {
        label: 'Onboarding Experience',
        value: 8.8,
        percentage: 25,
        subMetrics: [
          { name: 'Time to Value', value: 8.9, target: 8.0, status: 'good' },
          { name: 'Training Quality', value: 8.7, target: 8.5, status: 'good' }
        ]
      }
    ]
  }
];

export function AdvancedKPIAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState<KPIMetric | null>(null);
  const [selectedDrillDown, setSelectedDrillDown] = useState<DrillDownData | null>(null);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('performance');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [analyticsFilters, setAnalyticsFilters] = useKV('analytics_filters', {});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredMetrics = useMemo(() => {
    let filtered = mockKPIData.filter(metric => 
      categoryFilter === 'all' || metric.category === categoryFilter
    );

    // Apply analytics filters
    if (analyticsFilters.customerSegment?.length > 0) {
      // Filter based on customer segments (simulate filtering)
      filtered = filtered.map(metric => ({
        ...metric,
        // Adjust values based on segment filter (simulation)
        value: metric.value * (analyticsFilters.customerSegment.includes('Enterprise') ? 1.2 : 0.9)
      }));
    }

    if (analyticsFilters.performanceLevel?.length > 0) {
      filtered = filtered.filter(metric => {
        const performance = (metric.value / metric.target) * 100;
        return analyticsFilters.performanceLevel.some((level: string) => {
          switch (level) {
            case 'Above Target': return performance > 100;
            case 'At Target': return performance >= 95 && performance <= 105;
            case 'Below Target': return performance < 95 && performance >= 80;
            case 'Critical': return performance < 80;
            default: return true;
          }
        });
      });
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'performance') {
        const aPerf = (a.value / a.target) * 100;
        const bPerf = (b.value / b.target) * 100;
        return bPerf - aPerf;
      }
      return b.value - a.value;
    });
  }, [categoryFilter, sortBy, analyticsFilters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const handleExport = () => {
    // Export functionality - would integrate with real export service
    console.log('Exporting KPI data...', { filteredMetrics, analyticsFilters });
  };

  const handleShare = () => {
    // Share functionality - would integrate with real sharing service
    console.log('Sharing KPI dashboard...', { analyticsFilters, viewMode });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
    }
  };

  const getPerformanceColor = (performance: 'high' | 'medium' | 'low') => {
    switch (performance) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return `${value.toLocaleString()}${unit}`;
  };

  const renderMetricCard = (metric: KPIMetric) => {
    const performance = (metric.value / metric.target) * 100;
    const isAboveTarget = performance >= 100;

    return (
      <Card key={metric.id} className="interactive-card cursor-pointer hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.name}
            </CardTitle>
            <div className="flex items-center space-x-1">
              {getTrendIcon(metric.trend)}
              <span className={`text-xs font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-end space-x-2">
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.unit)}
              </div>
              <div className="text-sm text-muted-foreground">
                / {formatValue(metric.target, metric.unit)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress to Target</span>
                <span className={isAboveTarget ? 'text-green-600' : 'text-gray-600'}>
                  {performance.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(performance, 100)} 
                className={`h-2 ${isAboveTarget ? 'bg-green-100' : ''}`}
              />
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {metric.category}
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedMetric(metric)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Drill Down
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl dialog-content">
                  <DrillDownAnalysis metric={metric} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced KPI Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive performance metrics with drill-down capabilities
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-fit"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" onClick={handleExport} className="w-fit">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" onClick={handleShare} className="w-fit">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <KPIAnalyticsFilters 
            activeFilters={analyticsFilters}
            onFiltersChange={setAnalyticsFilters}
          />
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="trend">Trend</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredMetrics.map(renderMetricCard)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Metric</th>
                    <th className="text-right p-4 font-medium">Current</th>
                    <th className="text-right p-4 font-medium">Target</th>
                    <th className="text-right p-4 font-medium">Performance</th>
                    <th className="text-right p-4 font-medium">Trend</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map((metric) => {
                    const performance = (metric.value / metric.target) * 100;
                    return (
                      <tr key={metric.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {metric.category}
                            </Badge>
                          </div>
                        </td>
                        <td className="text-right p-4 font-mono">
                          {formatValue(metric.value, metric.unit)}
                        </td>
                        <td className="text-right p-4 font-mono text-muted-foreground">
                          {formatValue(metric.target, metric.unit)}
                        </td>
                        <td className="text-right p-4">
                          <div className={`font-medium ${
                            performance >= 100 ? 'text-green-600' : 
                            performance >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {performance.toFixed(1)}%
                          </div>
                        </td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end space-x-1">
                            {getTrendIcon(metric.trend)}
                            <span className={`text-sm ${
                              metric.trend === 'up' ? 'text-green-600' : 
                              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="text-center p-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedMetric(metric)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl dialog-content">
                              <DrillDownAnalysis metric={metric} />
                            </DialogContent>
                          </Dialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DrillDownAnalysis({ metric }: { metric: KPIMetric }) {
  const [selectedDrillDown, setSelectedDrillDown] = useState<DrillDownData | null>(null);
  const [activeTab, setActiveTab] = useState('breakdown');

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>{metric.name} - Detailed Analysis</span>
        </DialogTitle>
        <DialogDescription>
          Deep dive into performance metrics with comprehensive breakdown and insights
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DrillDownChart
              data={metric.drillDownData.map(item => ({
                label: item.label,
                value: item.value,
                target: metric.target * (item.percentage / 100)
              }))}
              title={`${metric.name} Breakdown`}
              subtitle="Distribution across key segments"
              type="bar"
              height={300}
              showTargets={true}
              colorScheme="performance"
            />
            
            <DrillDownChart
              data={metric.drillDownData.map(item => ({
                label: item.label,
                value: item.percentage
              }))}
              title="Contribution Analysis"
              subtitle="Percentage breakdown"
              type="pie"
              height={300}
              colorScheme="category"
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="grid gap-4">
            {metric.drillDownData.map((item, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => setSelectedDrillDown(selectedDrillDown?.label === item.label ? null : item)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatValue(item.value, metric.unit)} ({item.percentage}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.trend && getTrendIcon(item.trend)}
                      <ChevronDown className={`h-4 w-4 transition-transform ${
                        selectedDrillDown?.label === item.label ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>

                  {selectedDrillDown?.label === item.label && item.subMetrics && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <h5 className="font-medium text-sm">Sub-Metrics</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {item.subMetrics.map((subMetric, subIndex) => (
                          <div key={subIndex} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{subMetric.name}</span>
                              <Badge className={getStatusColor(subMetric.status)}>
                                {subMetric.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {subMetric.value.toLocaleString()}
                              </span>
                              {subMetric.target && (
                                <span className="text-xs text-muted-foreground">
                                  / {subMetric.target.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {subMetric.target && (
                              <Progress 
                                value={(subMetric.value / subMetric.target) * 100} 
                                className="h-2"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {metric.drillDownData
              .filter(item => item.timeData)
              .map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.label} - Time Series</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Chart Visualization */}
                      {item.timeData && (
                        <DrillDownChart
                          data={item.timeData.map(tp => ({
                            label: tp.period,
                            value: tp.value,
                            target: tp.target
                          }))}
                          title={`${item.label} Trend Analysis`}
                          type="line"
                          height={250}
                          showTargets={true}
                          colorScheme="performance"
                        />
                      )}
                      
                      {/* Data Grid */}
                      {item.timeData && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {item.timeData.map((timePoint, timeIndex) => (
                            <div key={timeIndex} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{timePoint.period}</span>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-lg">
                                    {formatValue(timePoint.value, metric.unit)}
                                  </span>
                                  {timePoint.target && (
                                    <span className="text-sm text-muted-foreground">
                                      / {formatValue(timePoint.target, metric.unit)}
                                    </span>
                                  )}
                                </div>
                                {timePoint.target && (
                                  <Progress 
                                    value={(timePoint.value / timePoint.target) * 100} 
                                    className="h-2"
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-4">
            {metric.drillDownData
              .filter(item => item.segmentData)
              .map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.label} - Segment Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Chart Visualization */}
                      {item.segmentData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <DrillDownChart
                            data={item.segmentData.map(seg => ({
                              label: seg.segment,
                              value: seg.value,
                              category: seg.performance
                            }))}
                            title="Segment Distribution"
                            type="pie"
                            height={300}
                            colorScheme="category"
                          />
                          
                          <DrillDownChart
                            data={item.segmentData.map(seg => ({
                              label: seg.segment,
                              value: seg.value,
                              category: seg.performance
                            }))}
                            title="Segment Performance"
                            type="bar"
                            height={300}
                            colorScheme="performance"
                          />
                        </div>
                      )}
                      
                      {/* Segment Details */}
                      {item.segmentData && (
                        <div className="space-y-3">
                          {item.segmentData.map((segment, segIndex) => (
                            <div key={segIndex} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <h4 className="font-medium">{segment.segment}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {segment.percentage}% of total
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="font-mono font-medium">
                                    {formatValue(segment.value, metric.unit)}
                                  </div>
                                  <div className={`text-sm font-medium ${getPerformanceColor(segment.performance)}`}>
                                    {segment.performance} performance
                                  </div>
                                </div>
                                <div className="w-16">
                                  <Progress value={segment.percentage} className="h-2" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Performance Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <Star className="h-4 w-4 text-green-600" />
                        <span>Top Performers</span>
                      </h4>
                      <div className="space-y-2">
                        {metric.drillDownData
                          .sort((a, b) => b.value - a.value)
                          .slice(0, 3)
                          .map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                              <span className="text-sm font-medium">{item.label}</span>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                #{index + 1}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Areas for Improvement</span>
                      </h4>
                      <div className="space-y-2">
                        {metric.drillDownData
                          .filter(item => item.subMetrics?.some(sub => sub.status === 'warning' || sub.status === 'critical'))
                          .slice(0, 3)
                          .map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                              <span className="text-sm font-medium">{item.label}</span>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Attention
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Recommended Actions</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Award className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <span className="font-medium">Focus on Enterprise Deals:</span>
                          <span className="text-muted-foreground ml-1">
                            Continue leveraging high-performing enterprise segment with 49% revenue contribution
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <span className="font-medium">Optimize Sales Cycle:</span>
                          <span className="text-muted-foreground ml-1">
                            Enterprise deals are closing 15 days faster than target - apply learnings to other segments
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <span className="font-medium">Expand Successful Programs:</span>
                          <span className="text-muted-foreground ml-1">
                            Webinar leads converting at 35.8% vs 30% target - scale this channel
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}