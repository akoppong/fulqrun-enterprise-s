import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  Activity,
  BarChart
} from '@phosphor-icons/react';
import { Opportunity } from '@/lib/types';

interface FinancialSummaryProps {
  opportunities: Opportunity[];
  className?: string;
}

export function FinancialSummary({ opportunities, className = '' }: FinancialSummaryProps) {
  const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const closedDeals = opportunities.filter(opp => opp.stage === 'keep');
  const closedRevenue = closedDeals.reduce((sum, opp) => sum + opp.value, 0);
  const conversionRate = opportunities.length > 0 ? (closedDeals.length / opportunities.length) * 100 : 0;
  const averageDealSize = opportunities.length > 0 ? totalRevenue / opportunities.length : 0;
  
  // Calculate pipeline health
  const stageDistribution = {
    prospect: opportunities.filter(opp => opp.stage === 'prospect').length,
    engage: opportunities.filter(opp => opp.stage === 'engage').length,
    acquire: opportunities.filter(opp => opp.stage === 'acquire').length,
    keep: opportunities.filter(opp => opp.stage === 'keep').length,
  };
  
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Financial Overview
        </CardTitle>
        <CardDescription>
          Key financial metrics across your sales pipeline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Pipeline</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">
              {opportunities.length} opportunities
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Closed Revenue</span>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(closedRevenue)}</div>
            <div className="text-xs text-green-600">
              {closedDeals.length} deals closed
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Conversion Rate</span>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">{formatPercentage(conversionRate)}</div>
              {conversionRate >= 20 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Avg Deal Size</span>
            <div className="text-lg font-semibold">{formatCurrency(averageDealSize)}</div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Pipeline Distribution</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'prospect', label: 'Prospect', color: 'bg-blue-100 text-blue-700' },
              { key: 'engage', label: 'Engage', color: 'bg-yellow-100 text-yellow-700' },
              { key: 'acquire', label: 'Acquire', color: 'bg-orange-100 text-orange-700' },
              { key: 'keep', label: 'Keep', color: 'bg-green-100 text-green-700' },
            ].map((stage) => (
              <div key={stage.key} className="text-center">
                <Badge className={`${stage.color} text-xs mb-1`}>
                  {stageDistribution[stage.key as keyof typeof stageDistribution]}
                </Badge>
                <div className="text-xs text-muted-foreground">{stage.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}