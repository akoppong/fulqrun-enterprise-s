import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  DollarSign,
  Users,
  Activity,
  Calendar,
  Award,
  Building,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Zap,
  Star,
  Heart,
  Shield,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from '@phosphor-icons/react';

// Enhanced KPI data structure
export interface PersonalizedKPIData {
  id: string;
  title: string;
  subtitle?: string;
  value: string | number;
  previousValue?: string | number;
  target?: string | number;
  unit?: string;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  trendLabel?: string;
  progress?: number; // 0-100 for progress bars
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: string;
  color?: string;
  backgroundColor?: string;
  textColor?: string;
  showProgress?: boolean;
  showTrend?: boolean;
  showSparkline?: boolean;
  sparklineData?: number[];
  format?: 'number' | 'currency' | 'percentage' | 'duration' | 'custom';
  comparisonPeriod?: string;
  lastUpdated?: Date;
  alerts?: {
    threshold: number;
    type: 'above' | 'below';
    message: string;
  }[];
  customFields?: {
    label: string;
    value: string;
    icon?: string;
  }[];
}

// Icon mapping
const ICON_MAP = {
  target: Target,
  dollar: DollarSign,
  users: Users,
  activity: Activity,
  calendar: Calendar,
  award: Award,
  building: Building,
  phone: Phone,
  mail: Mail,
  check: CheckCircle,
  alert: AlertTriangle,
  clock: Clock,
  chart: BarChart3,
  zap: Zap,
  star: Star,
  heart: Heart,
  shield: Shield,
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  arrow_up: ArrowUp,
  arrow_down: ArrowDown,
  arrow_right: ArrowRight,
};

interface PersonalizedKPICardProps {
  data: PersonalizedKPIData;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  className?: string;
  onClick?: () => void;
  refreshInterval?: number;
  onRefresh?: () => void;
}

export function PersonalizedKPICard({
  data,
  size = 'md',
  variant = 'default',
  className = '',
  onClick,
  refreshInterval,
  onRefresh
}: PersonalizedKPICardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentValue, setCurrentValue] = useState(data.value);

  // Auto-refresh functionality
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0 && onRefresh) {
      const interval = setInterval(onRefresh, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, onRefresh]);

  // Animate value changes
  useEffect(() => {
    if (data.value !== currentValue) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentValue(data.value);
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [data.value, currentValue]);

  const formatValue = (value: string | number): string => {
    if (typeof value === 'string') return value;
    
    switch (data.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      case 'duration':
        return formatDuration(value);
      default:
        return String(value);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50';
      case 'warning':
        return 'border-amber-200 bg-amber-50';
      case 'danger':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return '';
    }
  };

  const IconComponent = data.icon ? ICON_MAP[data.icon as keyof typeof ICON_MAP] : null;

  const cardStyle = {
    backgroundColor: data.backgroundColor,
    borderColor: data.color,
    color: data.textColor,
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'min-h-[120px]';
      case 'lg':
        return 'min-h-[200px]';
      default:
        return 'min-h-[160px]';
    }
  };

  const renderSparkline = () => {
    if (!data.showSparkline || !data.sparklineData?.length) return null;

    const max = Math.max(...data.sparklineData);
    const min = Math.min(...data.sparklineData);
    const range = max - min || 1;

    const points = data.sparklineData.map((value, index) => {
      const x = (index / (data.sparklineData!.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-2">
        <svg width="60" height="20" className="opacity-60">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="opacity-80"
          />
        </svg>
      </div>
    );
  };

  const renderProgressBar = () => {
    if (!data.showProgress || data.progress === undefined) return null;

    return (
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs">
          <span>Progress</span>
          <span>{data.progress}%</span>
        </div>
        <Progress value={data.progress} className="h-2" />
        {data.target && (
          <div className="text-xs text-muted-foreground">
            Target: {formatValue(data.target)}
          </div>
        )}
      </div>
    );
  };

  const renderCustomFields = () => {
    if (!data.customFields?.length) return null;

    return (
      <div className="mt-3 space-y-1">
        {data.customFields.map((field, index) => {
          const FieldIcon = field.icon ? ICON_MAP[field.icon as keyof typeof ICON_MAP] : null;
          return (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                {FieldIcon && <FieldIcon className="h-3 w-3" />}
                <span className="text-muted-foreground">{field.label}:</span>
              </div>
              <span className="font-medium">{field.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAlerts = () => {
    if (!data.alerts?.length) return null;

    const activeAlerts = data.alerts.filter(alert => {
      const numValue = typeof data.value === 'number' ? data.value : parseFloat(String(data.value));
      return alert.type === 'above' ? numValue > alert.threshold : numValue < alert.threshold;
    });

    if (activeAlerts.length === 0) return null;

    return (
      <div className="mt-2">
        {activeAlerts.map((alert, index) => (
          <Badge key={index} variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {alert.message}
          </Badge>
        ))}
      </div>
    );
  };

  if (variant === 'minimal') {
    return (
      <Card
        className={`${className} ${getSizeClasses()} ${getStatusColor()} cursor-pointer hover:shadow-md transition-all duration-200`}
        style={cardStyle}
        onClick={onClick}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{data.title}</div>
            <div className={`text-xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
              {data.prefix}{formatValue(currentValue)}{data.suffix}
            </div>
          </div>
          {IconComponent && (
            <IconComponent className="h-6 w-6 text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={`${className} ${getSizeClasses()} ${getStatusColor()} cursor-pointer hover:shadow-md transition-all duration-200`}
        style={cardStyle}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {IconComponent && (
                <IconComponent className="h-5 w-5" style={{ color: data.color }} />
              )}
              <div className="text-sm font-medium">{data.title}</div>
            </div>
            {data.showTrend && getTrendIcon()}
          </div>
          
          <div className={`text-2xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
            {data.prefix}{formatValue(currentValue)}{data.suffix}
          </div>
          
          {data.showTrend && data.trendValue && (
            <div className={`text-sm flex items-center gap-1 ${getTrendColor()}`}>
              <span>{data.trendValue}</span>
              {data.trendLabel && <span className="text-muted-foreground">({data.trendLabel})</span>}
            </div>
          )}

          {renderSparkline()}
          {renderProgressBar()}
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card
      className={`${className} ${getSizeClasses()} ${getStatusColor()} cursor-pointer hover:shadow-md transition-all duration-200`}
      style={cardStyle}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {IconComponent && (
              <IconComponent className="h-5 w-5" style={{ color: data.color }} />
            )}
            <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
          </div>
          {data.status && data.status !== 'neutral' && (
            <Badge variant={data.status === 'success' ? 'default' : 'secondary'} className="text-xs">
              {data.status}
            </Badge>
          )}
        </div>
        {data.subtitle && (
          <p className="text-xs text-muted-foreground">{data.subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-baseline justify-between mb-2">
          <div className={`text-2xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
            {data.prefix}{formatValue(currentValue)}{data.suffix}
            {data.unit && <span className="text-sm text-muted-foreground ml-1">{data.unit}</span>}
          </div>
          {data.showSparkline && renderSparkline()}
        </div>

        {data.showTrend && data.trendValue && (
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {data.trendValue}
            </span>
            {data.trendLabel && (
              <span className="text-xs text-muted-foreground">
                vs {data.trendLabel}
              </span>
            )}
          </div>
        )}

        {renderProgressBar()}
        {renderCustomFields()}
        {renderAlerts()}

        {data.lastUpdated && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated {data.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sample KPI data generator
export function generateSampleKPIData(): PersonalizedKPIData[] {
  return [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      subtitle: 'Total revenue this month',
      value: 124500,
      previousValue: 98000,
      target: 150000,
      format: 'currency',
      trend: 'up',
      trendValue: '+27.0%',
      trendLabel: 'vs last month',
      progress: 83,
      status: 'success',
      icon: 'dollar',
      color: '#10b981',
      showProgress: true,
      showTrend: true,
      showSparkline: true,
      sparklineData: [98000, 105000, 108000, 115000, 118000, 124500],
      comparisonPeriod: 'month',
      lastUpdated: new Date(),
    },
    {
      id: 'deals',
      title: 'Active Opportunities',
      value: 23,
      previousValue: 18,
      trend: 'up',
      trendValue: '+5',
      trendLabel: 'new this week',
      status: 'info',
      icon: 'target',
      color: '#3b82f6',
      showTrend: true,
      customFields: [
        { label: 'Qualified', value: '15', icon: 'check' },
        { label: 'In Progress', value: '8', icon: 'clock' },
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      subtitle: 'Lead to customer conversion',
      value: 73,
      target: 80,
      format: 'percentage',
      trend: 'up',
      trendValue: '+2.1%',
      trendLabel: 'vs last quarter',
      progress: 91,
      status: 'warning',
      icon: 'activity',
      color: '#f59e0b',
      showProgress: true,
      showTrend: true,
      alerts: [
        {
          threshold: 75,
          type: 'below',
          message: 'Below target rate'
        }
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'pipeline-value',
      title: 'Pipeline Value',
      value: 2450000,
      previousValue: 2100000,
      format: 'currency',
      trend: 'up',
      trendValue: '+16.7%',
      trendLabel: 'vs last month',
      status: 'success',
      icon: 'chart',
      color: '#8b5cf6',
      showTrend: true,
      showSparkline: true,
      sparklineData: [2100000, 2150000, 2200000, 2300000, 2400000, 2450000],
      customFields: [
        { label: 'Weighted', value: '$1.8M', icon: 'award' },
        { label: 'Best Case', value: '$2.9M', icon: 'star' },
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'team-performance',
      title: 'Team Performance',
      subtitle: 'Average team score',
      value: 87,
      target: 90,
      format: 'number',
      suffix: '/100',
      trend: 'up',
      trendValue: '+3.2',
      trendLabel: 'this week',
      progress: 97,
      status: 'success',
      icon: 'users',
      color: '#06b6d4',
      showProgress: true,
      showTrend: true,
      customFields: [
        { label: 'Top Performer', value: 'Sarah J.', icon: 'star' },
        { label: 'Avg. Calls/Day', value: '45', icon: 'phone' },
      ],
      lastUpdated: new Date(),
    },
    {
      id: 'customer-satisfaction',
      title: 'Customer Satisfaction',
      value: 4.8,
      format: 'number',
      suffix: '/5.0',
      trend: 'up',
      trendValue: '+0.2',
      trendLabel: 'this month',
      status: 'success',
      icon: 'heart',
      color: '#ef4444',
      showTrend: true,
      customFields: [
        { label: 'Reviews', value: '142', icon: 'star' },
        { label: 'Response Rate', value: '98%', icon: 'check' },
      ],
      lastUpdated: new Date(),
    },
  ];
}

// KPI Template presets
export const KPI_TEMPLATES = {
  sales: {
    title: 'Sales KPI',
    format: 'currency' as const,
    icon: 'dollar',
    color: '#10b981',
    showTrend: true,
    showProgress: true,
  },
  performance: {
    title: 'Performance Metric',
    format: 'percentage' as const,
    icon: 'activity',
    color: '#3b82f6',
    showTrend: true,
    showProgress: true,
  },
  count: {
    title: 'Count Metric',
    format: 'number' as const,
    icon: 'target',
    color: '#8b5cf6',
    showTrend: true,
  },
  satisfaction: {
    title: 'Satisfaction Score',
    format: 'number' as const,
    suffix: '/5.0',
    icon: 'heart',
    color: '#ef4444',
    showTrend: true,
  },
};