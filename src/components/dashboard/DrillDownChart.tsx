import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  TrendingUp, TrendingDown, Minus, BarChart3, 
  LineChart, PieChart as PieChartIcon, Activity,
  Target, Calendar, Users, DollarSign
} from '@phosphor-icons/react';

interface ChartDataPoint {
  label: string;
  value: number;
  target?: number;
  category?: string;
  trend?: 'up' | 'down' | 'stable';
  metadata?: Record<string, any>;
}

interface DrillDownChartProps {
  data: ChartDataPoint[];
  title: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'waterfall';
  height?: number;
  showGrid?: boolean;
  showTargets?: boolean;
  interactive?: boolean;
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
  colorScheme?: 'default' | 'performance' | 'trend' | 'category';
}

export function DrillDownChart({ 
  data, 
  title, 
  subtitle, 
  type, 
  height = 300,
  showGrid = true,
  showTargets = true,
  interactive = true,
  onDataPointClick,
  colorScheme = 'default'
}: DrillDownChartProps) {
  
  const chartDimensions = useMemo(() => ({
    width: '100%',
    height: height,
    margin: { top: 20, right: 30, bottom: 40, left: 60 }
  }), [height]);

  const getColorForValue = (value: number, target?: number, index?: number) => {
    switch (colorScheme) {
      case 'performance':
        if (!target) return 'hsl(var(--primary))';
        const performance = (value / target) * 100;
        if (performance >= 100) return 'hsl(142, 76%, 36%)'; // Green
        if (performance >= 80) return 'hsl(45, 93%, 47%)'; // Yellow
        return 'hsl(0, 84%, 60%)'; // Red
        
      case 'trend':
        const dataPoint = data[index || 0];
        if (dataPoint?.trend === 'up') return 'hsl(142, 76%, 36%)';
        if (dataPoint?.trend === 'down') return 'hsl(0, 84%, 60%)';
        return 'hsl(220, 13%, 69%)'; // Gray
        
      case 'category':
        const colors = [
          'hsl(var(--primary))',
          'hsl(var(--accent))',
          'hsl(221, 83%, 53%)',
          'hsl(262, 83%, 58%)',
          'hsl(291, 64%, 42%)',
          'hsl(339, 82%, 52%)'
        ];
        return colors[(index || 0) % colors.length];
        
      default:
        return 'hsl(var(--primary))';
    }
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(d => Math.max(d.value, d.target || 0)));
    const minValue = Math.min(...data.map(d => Math.min(d.value, d.target || Infinity)));
    const range = maxValue - minValue;
    const padding = range * 0.1;
    const adjustedMax = maxValue + padding;
    const adjustedMin = Math.max(0, minValue - padding);

    const chartHeight = height - 80;
    const chartWidth = 400; // Approximate chart area width

    const getY = (value: number) => {
      return chartHeight - ((value - adjustedMin) / (adjustedMax - adjustedMin)) * chartHeight;
    };

    const getX = (index: number) => {
      return (index / (data.length - 1)) * chartWidth;
    };

    const pathData = data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.value)}`).join(' ');
    
    const targetPathData = showTargets && data.some(d => d.target) 
      ? data.map((point, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(point.target || point.value)}`).join(' ')
      : '';

    return (
      <div className="w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth + 100} ${height}`}>
          {showGrid && (
            <g className="grid">
              {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
                <line
                  key={ratio}
                  x1={40}
                  y1={40 + ratio * chartHeight}
                  x2={chartWidth + 40}
                  y2={40 + ratio * chartHeight}
                  stroke="hsl(var(--border))"
                  strokeDasharray="2,2"
                  opacity={0.5}
                />
              ))}
            </g>
          )}
          
          {/* Target line */}
          {targetPathData && (
            <path
              d={`M 40 40 ${targetPathData}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity={0.7}
            />
          )}
          
          {/* Main line */}
          <path
            d={`M 40 40 ${pathData}`}
            fill="none"
            stroke={getColorForValue(data[0]?.value || 0)}
            strokeWidth="3"
            className="transition-all duration-200"
          />
          
          {/* Data points */}
          {data.map((point, index) => (
            <g key={index}>
              <circle
                cx={40 + getX(index)}
                cy={40 + getY(point.value)}
                r="6"
                fill={getColorForValue(point.value, point.target, index)}
                className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:r-8' : ''}`}
                onClick={() => interactive && onDataPointClick?.(point)}
              />
              {point.target && showTargets && (
                <circle
                  cx={40 + getX(index)}
                  cy={40 + getY(point.target)}
                  r="4"
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const value = adjustedMin + (adjustedMax - adjustedMin) * (1 - ratio);
            return (
              <text
                key={ratio}
                x={35}
                y={45 + ratio * chartHeight}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                {value.toLocaleString()}
              </text>
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, index) => (
            <text
              key={index}
              x={40 + getX(index)}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(d => Math.max(d.value, d.target || 0)));
    const chartHeight = height - 80;
    const barWidth = Math.min(60, 300 / data.length);
    const barSpacing = 10;

    return (
      <div className="w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length * (barWidth + barSpacing) + 100} ${height}`}>
          {data.map((point, index) => {
            const barHeight = (point.value / maxValue) * chartHeight;
            const targetHeight = point.target ? (point.target / maxValue) * chartHeight : 0;
            const x = 50 + index * (barWidth + barSpacing);
            
            return (
              <g key={index}>
                {/* Target indicator */}
                {point.target && showTargets && (
                  <line
                    x1={x}
                    y1={40 + chartHeight - targetHeight}
                    x2={x + barWidth}
                    y2={40 + chartHeight - targetHeight}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Bar */}
                <rect
                  x={x}
                  y={40 + chartHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={getColorForValue(point.value, point.target, index)}
                  className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => interactive && onDataPointClick?.(point)}
                />
                
                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={35 + chartHeight - barHeight}
                  textAnchor="middle"
                  className="text-xs font-medium fill-foreground"
                >
                  {point.value.toLocaleString()}
                </text>
                
                {/* Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, point) => sum + point.value, 0);
    let currentAngle = -90; // Start from top
    const radius = Math.min(height, 400) / 3;
    const centerX = 200;
    const centerY = height / 2;

    return (
      <div className="w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 400 ${height}`}>
          {data.map((point, index) => {
            const percentage = (point.value / total) * 100;
            const angle = (point.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              'M', centerX, centerY,
              'L', x1, y1,
              'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
              'Z'
            ].join(' ');

            // Label position
            const labelAngle = startAngle + angle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
            const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

            currentAngle += angle;

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={getColorForValue(point.value, point.target, index)}
                  className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => interactive && onDataPointClick?.(point)}
                />
                {percentage > 5 && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    className="text-xs font-medium fill-white"
                  >
                    {percentage.toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderGaugeChart = () => {
    if (data.length === 0) return null;
    
    const point = data[0]; // Gauge charts typically show single value
    const percentage = point.target ? (point.value / point.target) * 100 : 50;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    const radius = 80;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius * 0.75; // 3/4 circle
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center" style={{ height }}>
        <div className="relative">
          <svg width="200" height="150" viewBox="0 0 200 150">
            {/* Background arc */}
            <path
              d="M 30 120 A 80 80 0 0 1 170 120"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Progress arc */}
            <path
              d="M 30 120 A 80 80 0 0 1 170 120"
              fill="none"
              stroke={getColorForValue(point.value, point.target)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <div className="text-2xl font-bold">
              {point.value.toLocaleString()}
            </div>
            {point.target && (
              <div className="text-sm text-muted-foreground">
                of {point.target.toLocaleString()}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
              {clampedPercentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWaterfallChart = () => {
    let runningTotal = 0;
    const chartHeight = height - 80;
    const barWidth = Math.min(60, 300 / data.length);
    const barSpacing = 10;

    // Calculate positions for waterfall effect
    const waterfallData = data.map((point, index) => {
      const startValue = runningTotal;
      const endValue = runningTotal + point.value;
      runningTotal = endValue;
      
      return {
        ...point,
        startValue,
        endValue,
        isPositive: point.value >= 0
      };
    });

    const maxValue = Math.max(...waterfallData.map(d => d.endValue));
    const minValue = Math.min(...waterfallData.map(d => Math.min(d.startValue, d.endValue)));

    return (
      <div className="w-full" style={{ height }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length * (barWidth + barSpacing) + 100} ${height}`}>
          {waterfallData.map((point, index) => {
            const x = 50 + index * (barWidth + barSpacing);
            const startY = 40 + chartHeight - ((point.startValue - minValue) / (maxValue - minValue)) * chartHeight;
            const endY = 40 + chartHeight - ((point.endValue - minValue) / (maxValue - minValue)) * chartHeight;
            const barHeight = Math.abs(endY - startY);
            const y = Math.min(startY, endY);
            
            return (
              <g key={index}>
                {/* Connector line */}
                {index > 0 && (
                  <line
                    x1={x - barSpacing}
                    y1={waterfallData[index - 1].endValue >= point.startValue 
                      ? 40 + chartHeight - ((waterfallData[index - 1].endValue - minValue) / (maxValue - minValue)) * chartHeight
                      : startY}
                    x2={x}
                    y2={startY}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="2,2"
                    opacity={0.5}
                  />
                )}
                
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={point.isPositive ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'}
                  className={`transition-all duration-200 ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={() => interactive && onDataPointClick?.(point)}
                />
                
                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs font-medium fill-foreground"
                >
                  {point.value > 0 ? '+' : ''}{point.value.toLocaleString()}
                </text>
                
                {/* Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  {point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line': return renderLineChart();
      case 'bar': return renderBarChart();
      case 'pie': return renderPieChart();
      case 'gauge': return renderGaugeChart();
      case 'waterfall': return renderWaterfallChart();
      default: return renderBarChart();
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'pie': return <PieChartIcon className="h-4 w-4" />;
      case 'gauge': return <Target className="h-4 w-4" />;
      case 'waterfall': return <Activity className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              {getChartIcon()}
              <span>{title}</span>
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {type} chart
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}