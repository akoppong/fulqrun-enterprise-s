import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalizedKPICard, PersonalizedKPIData, generateSampleKPIData } from './widgets/PersonalizedKPICard';
import { 
  Eye, 
  Copy, 
  Download, 
  Filter, 
  Grid, 
  List,
  Star,
  TrendingUp,
  Target,
  DollarSign,
  Users,
  Activity,
  Award,
  Heart,
  Shield
} from '@phosphor-icons/react';
import { toast } from 'sonner';

const DEMO_KPI_TEMPLATES: PersonalizedKPIData[] = [
  // Sales Performance KPIs
  {
    id: 'monthly-revenue-gradient',
    title: 'Monthly Revenue',
    subtitle: 'Total revenue performance',
    value: 245800,
    target: 300000,
    format: 'currency',
    trend: 'up',
    trendValue: '+18.4%',
    trendLabel: 'vs last month',
    progress: 82,
    status: 'success',
    icon: 'dollar',
    color: '#10b981',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    showProgress: true,
    showTrend: true,
    showSparkline: true,
    sparklineData: [180000, 195000, 210000, 225000, 235000, 245800],
    lastUpdated: new Date(),
  },
  {
    id: 'sales-pipeline-modern',
    title: 'Pipeline Value',
    value: 1850000,
    previousValue: 1650000,
    format: 'currency',
    trend: 'up',
    trendValue: '+12.1%',
    trendLabel: 'this quarter',
    status: 'success',
    icon: 'target',
    color: '#8b5cf6',
    backgroundColor: '#f8fafc',
    showTrend: true,
    showSparkline: true,
    sparklineData: [1650000, 1700000, 1750000, 1800000, 1825000, 1850000],
    customFields: [
      { label: 'Qualified', value: '$1.2M', icon: 'check' },
      { label: 'Best Case', value: '$2.1M', icon: 'star' },
    ],
    lastUpdated: new Date(),
  },
  {
    id: 'conversion-rate-minimal',
    title: 'Conversion Rate',
    value: 24.8,
    target: 30,
    format: 'percentage',
    trend: 'up',
    trendValue: '+2.3%',
    trendLabel: 'vs last period',
    progress: 83,
    status: 'warning',
    icon: 'activity',
    color: '#f59e0b',
    showProgress: true,
    showTrend: true,
    alerts: [
      {
        threshold: 25,
        type: 'below',
        message: 'Below target conversion rate'
      }
    ],
    lastUpdated: new Date(),
  },

  // Team Performance KPIs
  {
    id: 'team-performance-colorful',
    title: 'Team Performance',
    subtitle: 'Overall team score',
    value: 92,
    target: 95,
    format: 'number',
    suffix: '/100',
    trend: 'up',
    trendValue: '+4.2',
    trendLabel: 'this week',
    progress: 97,
    status: 'success',
    icon: 'users',
    color: '#06b6d4',
    backgroundColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    textColor: '#ffffff',
    showProgress: true,
    showTrend: true,
    customFields: [
      { label: 'Top Rep', value: 'Sarah J.', icon: 'star' },
      { label: 'Avg Score', value: '88.5', icon: 'award' },
    ],
    lastUpdated: new Date(),
  },
  {
    id: 'customer-satisfaction-heart',
    title: 'Customer Satisfaction',
    subtitle: 'Average rating from customers',
    value: 4.7,
    format: 'number',
    suffix: '/5.0',
    trend: 'up',
    trendValue: '+0.3',
    trendLabel: 'this month',
    status: 'success',
    icon: 'heart',
    color: '#ef4444',
    backgroundColor: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: '#ffffff',
    showTrend: true,
    customFields: [
      { label: 'Reviews', value: '284', icon: 'star' },
      { label: 'NPS Score', value: '72', icon: 'award' },
    ],
    lastUpdated: new Date(),
  },

  // Activity KPIs
  {
    id: 'calls-made-simple',
    title: 'Calls Made',
    value: 156,
    target: 200,
    trend: 'up',
    trendValue: '+12',
    trendLabel: 'today',
    progress: 78,
    status: 'info',
    icon: 'phone',
    color: '#3b82f6',
    showProgress: true,
    showTrend: true,
    lastUpdated: new Date(),
  },
  {
    id: 'meetings-scheduled-compact',
    title: 'Meetings',
    subtitle: 'Scheduled this week',
    value: 23,
    previousValue: 19,
    trend: 'up',
    trendValue: '+4',
    status: 'success',
    icon: 'calendar',
    color: '#10b981',
    showTrend: true,
    lastUpdated: new Date(),
  },

  // Financial KPIs
  {
    id: 'quarterly-target-gauge',
    title: 'Quarterly Target',
    subtitle: 'Revenue progress',
    value: 485000,
    target: 750000,
    format: 'currency',
    progress: 65,
    status: 'warning',
    icon: 'target',
    color: '#f59e0b',
    backgroundColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#374151',
    showProgress: true,
    customFields: [
      { label: 'Remaining', value: '$265K', icon: 'clock' },
      { label: 'Days Left', value: '45', icon: 'calendar' },
    ],
    lastUpdated: new Date(),
  },
  {
    id: 'profit-margin-elegant',
    title: 'Profit Margin',
    value: 28.5,
    target: 30,
    format: 'percentage',
    trend: 'down',
    trendValue: '-1.2%',
    trendLabel: 'vs last quarter',
    progress: 95,
    status: 'warning',
    icon: 'dollar',
    color: '#8b5cf6',
    backgroundColor: '#fefefe',
    showProgress: true,
    showTrend: true,
    showSparkline: true,
    sparklineData: [31.2, 30.8, 30.1, 29.4, 28.9, 28.5],
    lastUpdated: new Date(),
  },
];

const KPI_CATEGORIES = [
  { id: 'all', label: 'All KPIs', icon: Grid },
  { id: 'sales', label: 'Sales', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'customer', label: 'Customer', icon: Heart },
  { id: 'activity', label: 'Activity', icon: Activity },
];

interface KPIShowcaseProps {
  onSelectKPI?: (kpi: PersonalizedKPIData) => void;
}

export function KPIShowcase({ onSelectKPI }: KPIShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact' | 'minimal'>('default');

  const filteredKPIs = selectedCategory === 'all' 
    ? DEMO_KPI_TEMPLATES 
    : DEMO_KPI_TEMPLATES.filter(kpi => {
        switch (selectedCategory) {
          case 'sales':
            return kpi.id.includes('revenue') || kpi.id.includes('pipeline') || kpi.id.includes('target');
          case 'performance':
            return kpi.id.includes('conversion') || kpi.id.includes('performance') || kpi.id.includes('profit');
          case 'team':
            return kpi.id.includes('team') || kpi.id.includes('calls') || kpi.id.includes('meetings');
          case 'customer':
            return kpi.id.includes('satisfaction') || kpi.id.includes('customer');
          case 'activity':
            return kpi.id.includes('calls') || kpi.id.includes('meetings') || kpi.id.includes('activity');
          default:
            return true;
        }
      });

  const handleCopyKPI = (kpi: PersonalizedKPIData) => {
    navigator.clipboard.writeText(JSON.stringify(kpi, null, 2));
    toast.success('KPI configuration copied to clipboard');
  };

  const handleUseTemplate = (kpi: PersonalizedKPIData) => {
    if (onSelectKPI) {
      onSelectKPI({ ...kpi, id: `kpi-${Date.now()}` });
      toast.success('KPI template applied');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">KPI Showcase Gallery</h2>
        <p className="text-muted-foreground">
          Explore professionally designed KPI cards with various styles and layouts
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {KPI_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2 items-center">
          <Select
            value={selectedVariant}
            onValueChange={(value: any) => setSelectedVariant(value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Gallery */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredKPIs.map((kpi) => (
          <div key={kpi.id} className="relative group">
            <PersonalizedKPICard
              data={kpi}
              variant={selectedVariant}
              className="transition-all duration-200 hover:shadow-lg"
            />
            
            {/* Action overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleUseTemplate(kpi)}
                className="text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Use
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopyKPI(kpi)}
                className="text-xs"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>

            {/* Style indicators */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              {kpi.showSparkline && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Chart
                </Badge>
              )}
              {kpi.showProgress && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Progress
                </Badge>
              )}
              {kpi.backgroundColor?.includes('gradient') && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Gradient
                </Badge>
              )}
              {kpi.status !== 'neutral' && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Status
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredKPIs.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No KPIs Found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category or clear your filters
          </p>
        </div>
      )}

      {/* Style Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Design Variations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="text-sm font-medium">Gradient Backgrounds</div>
              <div className="text-xs text-muted-foreground">
                Premium look with color gradients and white text for high contrast
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-sm font-medium">Sparkline Charts</div>
              <div className="text-xs text-muted-foreground">
                Mini trend visualizations to show data movement over time
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-sm font-medium">Progress Indicators</div>
              <div className="text-xs text-muted-foreground">
                Visual progress bars showing completion percentage against targets
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}