import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { KPITarget, DashboardLayout } from '@/lib/types';
import { TrendUp, TrendDown, Target, AlertTriangle } from '@phosphor-icons/react';

interface KPIWidgetRendererProps {
  kpi: KPITarget;
  layoutItem: DashboardLayout;
}

export function KPIWidgetRenderer({ kpi, layoutItem }: KPIWidgetRendererProps) {
  const getProgressPercentage = () => {
    if (kpi.targetValue === 0) return 0;
    return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
  };

  const getStatusColor = () => {
    switch (kpi.status) {
      case 'achieved': return 'bg-green-100 text-green-800 border-green-200';
      case 'exceeded': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'at_risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = () => {
    switch (kpi.priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-gray-300';
    }
  };

  const renderNumberWidget = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold">
            {kpi.currentValue.toLocaleString()}{kpi.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Target: {kpi.targetValue.toLocaleString()}{kpi.unit}
          </p>
        </div>
        <div className="text-right">
          <Badge className={getStatusColor()}>
            {kpi.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {kpi.priority} priority
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getProgressPercentage() >= 100 ? (
          <TrendUp className="h-4 w-4 text-green-600" />
        ) : getProgressPercentage() < 50 ? (
          <TrendDown className="h-4 w-4 text-red-600" />
        ) : (
          <Target className="h-4 w-4 text-blue-600" />
        )}
        <span className="text-sm text-muted-foreground">
          {getProgressPercentage().toFixed(1)}% of target
        </span>
      </div>
    </div>
  );

  const renderProgressWidget = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{getProgressPercentage().toFixed(1)}% Complete</p>
        <Badge className={getStatusColor()}>
          {kpi.status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      <Progress value={getProgressPercentage()} className="h-3" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{kpi.currentValue.toLocaleString()}{kpi.unit}</span>
        <span>{kpi.targetValue.toLocaleString()}{kpi.unit}</span>
      </div>
    </div>
  );

  const renderGaugeWidget = () => {
    const percentage = getProgressPercentage();
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={
                percentage >= 100 
                  ? 'text-green-500' 
                  : percentage >= 80 
                  ? 'text-blue-500' 
                  : percentage >= 60 
                  ? 'text-yellow-500' 
                  : 'text-red-500'
              }
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percentage.toFixed(0)}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">
            {kpi.currentValue.toLocaleString()}{kpi.unit} / {kpi.targetValue.toLocaleString()}{kpi.unit}
          </p>
          <Badge className={getStatusColor() + ' mt-2'}>
            {kpi.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  };

  const renderTrendWidget = () => {
    // Generate sample trend data (in a real app, this would come from historical data)
    const trendData = Array.from({ length: 7 }, (_, i) => ({
      value: kpi.currentValue * (0.7 + Math.random() * 0.6),
      day: i + 1
    }));

    const maxValue = Math.max(...trendData.map(d => d.value));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold">
              {kpi.currentValue.toLocaleString()}{kpi.unit}
            </p>
            <p className="text-xs text-muted-foreground">Current Value</p>
          </div>
          <Badge className={getStatusColor()}>
            {kpi.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        {/* Mini trend chart */}
        <div className="h-16 flex items-end gap-1">
          {trendData.map((point, index) => (
            <div
              key={index}
              className="flex-1 bg-primary/20 rounded-t min-h-1 transition-all duration-500"
              style={{
                height: `${(point.value / maxValue) * 100}%`,
                minHeight: '4px',
              }}
            />
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          7-day trend • Target: {kpi.targetValue.toLocaleString()}{kpi.unit}
        </div>
      </div>
    );
  };

  const renderBarWidget = () => {
    const data = [
      { label: 'Current', value: kpi.currentValue, color: 'bg-primary' },
      { label: 'Target', value: kpi.targetValue, color: 'bg-muted' },
    ];
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {kpi.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-medium">
                  {item.value.toLocaleString()}{kpi.unit}
                </span>
              </div>
              <div className="h-6 bg-muted rounded">
                <div
                  className={`h-full rounded ${item.color} transition-all duration-500`}
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          Achievement: {getProgressPercentage().toFixed(1)}%
        </div>
      </div>
    );
  };

  const renderLineWidget = () => {
    // Generate sample line chart data
    const lineData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      value: kpi.currentValue * (0.3 + Math.random() * 1.4),
    }));

    const maxValue = Math.max(...lineData.map(d => d.value));
    const points = lineData.map((point, index) => {
      const x = (index / (lineData.length - 1)) * 200;
      const y = 50 - (point.value / maxValue) * 40;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">
              {kpi.currentValue.toLocaleString()}{kpi.unit}
            </p>
            <p className="text-xs text-muted-foreground">12-month view</p>
          </div>
          <Badge className={getStatusColor()}>
            {kpi.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <div className="h-12 flex items-center">
          <svg viewBox="0 0 200 50" className="w-full h-full">
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary"
            />
            {lineData.map((point, index) => {
              const x = (index / (lineData.length - 1)) * 200;
              const y = 50 - (point.value / maxValue) * 40;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="currentColor"
                  className="text-primary"
                />
              );
            })}
          </svg>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Target: {kpi.targetValue.toLocaleString()}{kpi.unit}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (layoutItem.chartType) {
      case 'progress': return renderProgressWidget();
      case 'gauge': return renderGaugeWidget();
      case 'trend': return renderTrendWidget();
      case 'bar': return renderBarWidget();
      case 'line': return renderLineWidget();
      default: return renderNumberWidget();
    }
  };

  return (
    <Card className={`border-l-4 ${getPriorityColor()} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-start justify-between">
          <span className="line-clamp-2">{kpi.name}</span>
          {kpi.priority === 'critical' && (
            <AlertTriangle className="h-4 w-4 text-red-500 ml-2 flex-shrink-0" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {renderContent()}
        {kpi.description && (
          <p className="text-xs text-muted-foreground mt-3 line-clamp-2">
            {kpi.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}