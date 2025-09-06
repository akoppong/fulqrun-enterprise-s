import { useKV } from '@github/spark/hooks';
import { Opportunity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculatePipelineMetrics, formatCurrency, formatPercentage } from '@/lib/crm-utils';
import { 
  ChartLine, 
  TrendUp, 
  Target, 
  Clock, 
  DollarSign,
  Users,
  Trophy,
  AlertTriangle
} from '@phosphor-icons/react';
import { Progress } from '@/components/ui/progress';

interface AnalyticsViewProps {
  userRole: 'rep' | 'manager' | 'admin';
}

export function AnalyticsView({ userRole }: AnalyticsViewProps) {
  const [opportunities] = useKV<Opportunity[]>('opportunities', []);
  
  const metrics = calculatePipelineMetrics(opportunities);
  
  const getPerformanceInsights = () => {
    const insights = [];
    
    if (metrics.conversionRate < 20) {
      insights.push({
        type: 'warning',
        title: 'Low Conversion Rate',
        description: `${formatPercentage(metrics.conversionRate)} conversion rate is below industry average`,
        icon: AlertTriangle,
        color: 'text-orange-600'
      });
    }
    
    if (metrics.averageSalesCycle > 90) {
      insights.push({
        type: 'info',
        title: 'Extended Sales Cycle',
        description: `${Math.round(metrics.averageSalesCycle)} day average cycle could be optimized`,
        icon: Clock,
        color: 'text-blue-600'
      });
    }
    
    if (metrics.stageDistribution.prospect > metrics.totalOpportunities * 0.6) {
      insights.push({
        type: 'warning',
        title: 'Pipeline Bottleneck',
        description: 'Too many opportunities stuck in Prospect stage',
        icon: Target,
        color: 'text-orange-600'
      });
    }
    
    return insights;
  };

  const performanceInsights = getPerformanceInsights();

  // Calculate stage conversion rates
  const stageConversions = {
    prospectToEngage: metrics.stageDistribution.prospect > 0 
      ? (metrics.stageDistribution.engage / metrics.stageDistribution.prospect) * 100 
      : 0,
    engageToAcquire: metrics.stageDistribution.engage > 0 
      ? (metrics.stageDistribution.acquire / metrics.stageDistribution.engage) * 100 
      : 0,
    acquireToKeep: metrics.stageDistribution.acquire > 0 
      ? (metrics.stageDistribution.keep / metrics.stageDistribution.acquire) * 100 
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Performance insights and pipeline metrics</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userRole === 'admin' ? 'Global View' : userRole === 'manager' ? 'Team View' : 'Personal View'}
        </Badge>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalValue)}</p>
              </div>
              <DollarSign size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Opportunities</p>
                <p className="text-2xl font-bold">{metrics.totalOpportunities}</p>
              </div>
              <Target size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageDealSize)}</p>
              </div>
              <Trophy size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.conversionRate)}</p>
              </div>
              <TrendUp size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine size={20} />
              PEAK Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Prospect</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.stageDistribution.prospect} deals
                  </span>
                </div>
                <Progress value={(metrics.stageDistribution.prospect / metrics.totalOpportunities) * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Engage</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.stageDistribution.engage} deals
                  </span>
                </div>
                <Progress value={(metrics.stageDistribution.engage / metrics.totalOpportunities) * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Acquire</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.stageDistribution.acquire} deals
                  </span>
                </div>
                <Progress value={(metrics.stageDistribution.acquire / metrics.totalOpportunities) * 100} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Keep</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.stageDistribution.keep} deals
                  </span>
                </div>
                <Progress value={(metrics.stageDistribution.keep / metrics.totalOpportunities) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Conversion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={20} />
              Stage Conversion Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Prospect → Engage</span>
                  <Badge variant={stageConversions.prospectToEngage > 60 ? 'default' : 'secondary'}>
                    {formatPercentage(stageConversions.prospectToEngage)}
                  </Badge>
                </div>
                <Progress value={stageConversions.prospectToEngage} />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Engage → Acquire</span>
                  <Badge variant={stageConversions.engageToAcquire > 40 ? 'default' : 'secondary'}>
                    {formatPercentage(stageConversions.engageToAcquire)}
                  </Badge>
                </div>
                <Progress value={stageConversions.engageToAcquire} />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Acquire → Keep</span>
                  <Badge variant={stageConversions.acquireToKeep > 70 ? 'default' : 'secondary'}>
                    {formatPercentage(stageConversions.acquireToKeep)}
                  </Badge>
                </div>
                <Progress value={stageConversions.acquireToKeep} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {performanceInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} />
              Performance Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Icon size={20} className={insight.color} />
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSTPV Metrics (for managers and admins) */}
      {(userRole === 'manager' || userRole === 'admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              CSTPV Performance Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Close Rate</h4>
                <p className="text-2xl font-bold text-primary">{formatPercentage(metrics.conversionRate)}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Size (Avg)</h4>
                <p className="text-2xl font-bold text-primary">{formatCurrency(metrics.averageDealSize)}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Time (Days)</h4>
                <p className="text-2xl font-bold text-primary">{Math.round(metrics.averageSalesCycle)}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Probability</h4>
                <p className="text-2xl font-bold text-primary">
                  {opportunities.length > 0 
                    ? Math.round(opportunities.reduce((sum, opp) => sum + opp.probability, 0) / opportunities.length)
                    : 0
                  }%
                </p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Value</h4>
                <p className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}