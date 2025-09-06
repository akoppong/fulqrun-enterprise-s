import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Calendar,
  Users,
  DollarSign
} from '@phosphor-icons/react';

interface DemoKPICardProps {
  title: string;
  value: string;
  target: string;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'financial' | 'sales' | 'operational';
}

export function DemoKPICard({ 
  title, 
  value, 
  target, 
  progress, 
  trend, 
  priority, 
  type 
}: DemoKPICardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = () => {
    switch (type) {
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'sales': return <Target className="h-4 w-4" />;
      case 'operational': return <BarChart3 className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  return (
    <Card className={`border-l-4 ${getPriorityColor()} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant={priority === 'critical' ? 'destructive' : 'secondary'}>
              {priority}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-sm text-muted-foreground">Target: {target}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-green-500' : 
                  progress >= 80 ? 'bg-blue-500' : 
                  progress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isExpanded ? 'Show Less' : 'AI Insights'}
          </Button>

          {isExpanded && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Trending {trend === 'up' ? 'upward' : trend === 'down' ? 'downward' : 'stable'} this quarter</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-600" />
                <span>3 contributing team members</span>
              </div>
              <p className="text-xs text-muted-foreground">
                AI suggests focusing on lead qualification to improve this metric by 15% next month.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Demo layout showcase
export function KPIDashboardDemo() {
  const demoKPIs = [
    {
      title: 'Monthly Revenue',
      value: '$125K',
      target: '$150K',
      progress: 83,
      trend: 'up' as const,
      priority: 'high' as const,
      type: 'financial' as const
    },
    {
      title: 'Lead Conversion Rate',
      value: '24%',
      target: '30%',
      progress: 80,
      trend: 'up' as const,
      priority: 'medium' as const,
      type: 'sales' as const
    },
    {
      title: 'Pipeline Velocity',
      value: '45 days',
      target: '35 days',
      progress: 65,
      trend: 'down' as const,
      priority: 'critical' as const,
      type: 'operational' as const
    },
    {
      title: 'Customer Satisfaction',
      value: '4.2/5',
      target: '4.5/5',
      progress: 93,
      trend: 'stable' as const,
      priority: 'low' as const,
      type: 'operational' as const
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Dashboard Preview</h3>
        <p className="text-sm text-muted-foreground">
          Interactive KPI widgets with drag-and-drop customization
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {demoKPIs.map((kpi, index) => (
          <DemoKPICard key={index} {...kpi} />
        ))}
      </div>
    </div>
  );
}