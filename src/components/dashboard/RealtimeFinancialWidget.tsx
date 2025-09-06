import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Target,
  Zap
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { Opportunity } from '@/lib/types';

interface RealtimeFinancialWidgetProps {
  opportunities: Opportunity[];
  className?: string;
}

interface QuickMetrics {
  todayRevenue: number;
  weeklyGrowth: number;
  pipelineVelocity: number;
  lastUpdated: Date;
}

export function RealtimeFinancialWidget({ opportunities, className }: RealtimeFinancialWidgetProps) {
  const [quickMetrics, setQuickMetrics] = useKV<QuickMetrics>('quick-financial-metrics', {
    todayRevenue: 0,
    weeklyGrowth: 0,
    pipelineVelocity: 0,
    lastUpdated: new Date()
  });
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const updateMetrics = () => {
      const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
      const closedDeals = opportunities.filter(opp => opp.stage === 'keep');
      const todayBase = totalRevenue / 30; // Simulate daily revenue
      const currentTime = Date.now();
      const realtimeVariation = Math.sin(currentTime / 5000000) * 0.1 + 1; // ±10% variation
      
      setQuickMetrics({
        todayRevenue: todayBase * realtimeVariation,
        weeklyGrowth: 5 + Math.sin(currentTime / 8000000) * 3, // 2-8% growth
        pipelineVelocity: closedDeals.length > 0 ? totalRevenue / closedDeals.length * 0.1 : 0,
        lastUpdated: new Date()
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [opportunities, isLive, setQuickMetrics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const progressToTarget = Math.min((quickMetrics.todayRevenue * 30) / (totalPipelineValue || 1) * 100, 100);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Revenue Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
            <button 
              onClick={() => setIsLive(!isLive)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
        <CardDescription>
          Real-time financial metrics • Updated {quickMetrics.lastUpdated.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Today's Revenue</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(quickMetrics.todayRevenue)}</div>
            <div className="text-xs text-green-600">
              Projected: {formatCurrency(quickMetrics.todayRevenue * 30)}/month
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Weekly Growth</span>
              {quickMetrics.weeklyGrowth >= 0 ? 
                <TrendingUp className="h-4 w-4 text-green-600" /> : 
                <TrendingDown className="h-4 w-4 text-red-600" />
              }
            </div>
            <div className={`text-xl font-bold ${getGrowthColor(quickMetrics.weeklyGrowth)}`}>
              {formatPercentage(quickMetrics.weeklyGrowth)}
            </div>
            <div className="text-xs text-muted-foreground">
              vs. last week
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pipeline Progress</span>
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <Progress value={progressToTarget} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatPercentage(progressToTarget)} complete</span>
            <span>Target: {formatCurrency(totalPipelineValue)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pipeline Velocity</span>
            <span className="font-medium">{formatCurrency(quickMetrics.pipelineVelocity)}/week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}