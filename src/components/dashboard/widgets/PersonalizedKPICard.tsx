import { useState, useEffect, useMemo } from 'react';
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
  ArrowRight,
  Gauge,
  Lightning,
  Fire,
  Sparkle
} from '@phosphor-icons/react';

// Enhanced KPI data structure with advanced customization
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
  // Enhanced styling options
  style?: 'modern' | 'classic' | 'minimal' | 'gradient' | 'glassmorphic';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  shadow?: 'none' | 'small' | 'medium' | 'large' | 'glow';
  animation?: 'none' | 'pulse' | 'bounce' | 'slide' | 'fade';
  // Advanced trend visualization
  trendChart?: {
    type: 'line' | 'bar' | 'area' | 'gauge' | 'donut';
    data: number[];
    color?: string;
    gradient?: string;
    height?: number;
  };
  // Goal tracking
  goals?: {
    current: number;
    target: number;
    deadline?: Date;
    milestones?: { value: number; label: string; reached: boolean }[];
  };
  // Time series data for advanced charts
  timeSeriesData?: {
    timestamp: Date;
    value: number;
  }[];
}

// Icon mapping with more options
const ICON_MAP = {
  target: Target,
  dollar: DollarSign,
  'currency-dollar': DollarSign,
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
  'chart-bar': BarChart3,
  zap: Zap,
  star: Star,
  heart: Heart,
  shield: Shield,
  trending_up: TrendingUp,
  'trending-up': TrendingUp,
  trending_down: TrendingDown,
  'trending-down': TrendingDown,
  arrow_up: ArrowUp,
  arrow_down: ArrowDown,
  arrow_right: ArrowRight,
  gauge: Gauge,
  lightning: Lightning,
  fire: Fire,
  sparkle: Sparkle,
  funnel: Target, // Using Target as placeholder for funnel
  handshake: Award, // Using Award as placeholder for handshake
  'crystal-ball': Sparkle, // Using Sparkle as placeholder for crystal-ball
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
  const [isHovered, setIsHovered] = useState(false);

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

  // Calculate dynamic styling based on data
  const dynamicStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {};

    // Only set styles if properties exist
    if (data.backgroundColor) {
      baseStyles.backgroundColor = data.backgroundColor;
    }
    if (data.color) {
      baseStyles.borderColor = data.color;
    }
    if (data.textColor) {
      baseStyles.color = data.textColor;
    }

    // Apply gradient backgrounds
    if (data.style === 'gradient' && data.backgroundColor?.includes?.('gradient')) {
      baseStyles.background = data.backgroundColor;
    }

    // Glassmorphic effect
    if (data.style === 'glassmorphic') {
      baseStyles.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      baseStyles.backdropFilter = 'blur(20px)';
      baseStyles.border = '1px solid rgba(255, 255, 255, 0.2)';
    }

    // Glow effect
    if (data.shadow === 'glow' && data.color) {
      baseStyles.boxShadow = `0 0 20px ${data.color}33`;
    }

    return baseStyles;
  }, [data.backgroundColor, data.color, data.textColor, data.style, data.shadow]);

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
    if (data.style === 'glassmorphic') return '';
    
    switch (data.status) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/50';
      case 'warning':
        return 'border-amber-200 bg-amber-50/50';
      case 'danger':
        return 'border-red-200 bg-red-50/50';
      case 'info':
        return 'border-blue-200 bg-blue-50/50';
      default:
        return '';
    }
  };

  const getBorderRadiusClass = () => {
    switch (data.borderRadius) {
      case 'none':
        return 'rounded-none';
      case 'small':
        return 'rounded-sm';
      case 'large':
        return 'rounded-xl';
      case 'full':
        return 'rounded-3xl';
      default:
        return 'rounded-lg';
    }
  };

  const getShadowClass = () => {
    switch (data.shadow) {
      case 'none':
        return '';
      case 'small':
        return 'shadow-sm';
      case 'medium':
        return 'shadow-md';
      case 'large':
        return 'shadow-lg';
      case 'glow':
        return 'shadow-xl';
      default:
        return 'shadow';
    }
  };

  const getAnimationClass = () => {
    if (!data.animation || data.animation === 'none') return '';
    
    switch (data.animation) {
      case 'pulse':
        return isHovered ? 'animate-pulse' : '';
      case 'bounce':
        return isHovered ? 'animate-bounce' : '';
      case 'slide':
        return 'transform transition-transform hover:translate-y-[-2px]';
      case 'fade':
        return 'transition-opacity hover:opacity-80';
      default:
        return '';
    }
  };

  const IconComponent = data.icon ? ICON_MAP[data.icon as keyof typeof ICON_MAP] : null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'min-h-[120px]';
      case 'lg':
        return 'min-h-[240px]';
      default:
        return 'min-h-[180px]';
    }
  };

  const renderAdvancedChart = () => {
    if (!data.trendChart?.data?.length) return null;

    const { type, data: chartData, color, height = 60 } = data.trendChart;
    const chartColor = color || data.color || '#3b82f6';

    // Safety check for chart data
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return null;
    }

    switch (type) {
      case 'gauge':
        return renderGaugeChart(chartData[chartData.length - 1] || 0, 100, chartColor, height);
      case 'donut':
        return renderDonutChart(chartData[chartData.length - 1] || 0, 100, chartColor, height);
      case 'area':
        return renderAreaChart(chartData, chartColor, height);
      case 'bar':
        return renderBarChart(chartData, chartColor, height);
      default:
        return renderLineChart(chartData, chartColor, height);
    }
  };

  const renderGaugeChart = (value: number, max: number, color: string, height: number) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <svg width="80" height="80" className="transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="opacity-20"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-in-out"
          />
          <text
            x="40"
            y="45"
            textAnchor="middle"
            className="text-xs font-bold transform rotate-90"
            fill="currentColor"
          >
            {Math.round(percentage)}%
          </text>
        </svg>
      </div>
    );
  };

  const renderDonutChart = (value: number, max: number, color: string, height: number) => {
    const percentage = Math.min((value / max) * 100, 100);
    const circumference = 2 * Math.PI * 25;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <svg width="60" height="60" className="transform -rotate-90">
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="opacity-10"
          />
          <circle
            cx="30"
            cy="30"
            r="25"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
      </div>
    );
  };

  const renderAreaChart = (chartData: number[], color: string, height: number) => {
    if (!chartData || chartData.length === 0) return null;
    
    const validData = chartData.filter(val => typeof val === 'number' && !isNaN(val));
    if (validData.length === 0) return null;
    
    const max = Math.max(...validData);
    const min = Math.min(...validData);
    const range = max - min || 1;
    const width = 120;

    const points = validData.map((value, index) => {
      const x = (index / (validData.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 10);
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,${height} ${points} ${width},${height}`;

    return (
      <div className="mt-2">
        <svg width={width} height={height} className="opacity-80">
          <defs>
            <linearGradient id={`gradient-${data.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={areaPoints}
            fill={`url(#gradient-${data.id})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className="opacity-80"
          />
        </svg>
      </div>
    );
  };

  const renderBarChart = (chartData: number[], color: string, height: number) => {
    if (!chartData || chartData.length === 0) return null;
    
    const validData = chartData.filter(val => typeof val === 'number' && !isNaN(val));
    if (validData.length === 0) return null;
    
    const max = Math.max(...validData);
    const barWidth = 100 / validData.length - 2;

    return (
      <div className="mt-2 flex items-end gap-1" style={{ height: `${height}px` }}>
        {validData.map((value, index) => (
          <div
            key={index}
            className="transition-all duration-500 ease-in-out rounded-sm"
            style={{
              width: `${barWidth}%`,
              height: `${max > 0 ? (value / max) * height : 0}px`,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        ))}
      </div>
    );
  };

  const renderLineChart = (chartData: number[], color: string, height: number) => {
    if (!chartData || chartData.length === 0) return null;
    
    const validData = chartData.filter(val => typeof val === 'number' && !isNaN(val));
    if (validData.length === 0) return null;
    
    const max = Math.max(...validData);
    const min = Math.min(...validData);
    const range = max - min || 1;
    const width = 120;

    const points = validData.map((value, index) => {
      const x = (index / (validData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-2">
        <svg width={width} height={height} className="opacity-80">
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
          />
          {/* Data points */}
          {validData.map((value, index) => {
            const x = (index / (validData.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="opacity-60"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderSparkline = () => {
    if (!data.showSparkline || !data.sparklineData?.length) return null;

    const sparkData = data.sparklineData.filter(val => typeof val === 'number' && !isNaN(val));
    if (sparkData.length === 0) return null;
    
    const max = Math.max(...sparkData);
    const min = Math.min(...sparkData);
    const range = max - min || 1;
    const width = 100;
    const height = 30;

    const points = sparkData.map((value, index) => {
      const x = (index / (sparkData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-2">
        <svg width={width} height={height} className="opacity-70">
          <polyline
            points={points}
            fill="none"
            stroke={data.color || '#3b82f6'}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>
    );
  };

  const renderGoalProgress = () => {
    if (!data.goals) return null;

    const { current, target, milestones } = data.goals;
    const percentage = Math.min((current / target) * 100, 100);

    return (
      <div className="mt-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span>Goal Progress</span>
          <span>{Math.round(percentage)}% of {formatValue(target)}</span>
        </div>
        <div className="relative">
          <Progress value={percentage} className="h-3" />
          {milestones?.map((milestone, index) => {
            const milestonePosition = (milestone.value / target) * 100;
            return (
              <div
                key={index}
                className="absolute top-0 transform -translate-x-1/2"
                style={{ left: `${milestonePosition}%` }}
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    milestone.reached
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'bg-white border-gray-300'
                  }`}
                />
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
                  {milestone.label}
                </div>
              </div>
            );
          })}
        </div>
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
        className={`${className} ${getSizeClasses()} ${getStatusColor()} ${getBorderRadiusClass()} ${getShadowClass()} ${getAnimationClass()} cursor-pointer hover:shadow-lg transition-all duration-300`}
        style={dynamicStyles}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground truncate">{data.title}</div>
            <div className={`text-xl font-bold ${isAnimating ? 'animate-pulse' : ''} ${data.animation === 'pulse' && isHovered ? 'animate-pulse' : ''}`}>
              {data.prefix}{formatValue(currentValue)}{data.suffix}
            </div>
            {data.showTrend && data.trendValue && (
              <div className={`text-xs flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{data.trendValue}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            {IconComponent && (
              <IconComponent 
                className="h-6 w-6 text-muted-foreground" 
                style={{ color: data.color }} 
              />
            )}
            {data.trendChart && renderAdvancedChart()}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={`${className} ${getSizeClasses()} ${getStatusColor()} ${getBorderRadiusClass()} ${getShadowClass()} ${getAnimationClass()} cursor-pointer hover:shadow-lg transition-all duration-300`}
        style={dynamicStyles}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              {IconComponent && (
                <IconComponent className="h-5 w-5 flex-shrink-0" style={{ color: data.color }} />
              )}
              <div className="text-sm font-medium truncate">{data.title}</div>
            </div>
            {data.showTrend && getTrendIcon()}
          </div>
          
          <div className={`text-2xl font-bold mb-2 ${isAnimating ? 'animate-pulse' : ''}`}>
            {data.prefix}{formatValue(currentValue)}{data.suffix}
            {data.unit && <span className="text-sm text-muted-foreground ml-1">{data.unit}</span>}
          </div>
          
          {data.showTrend && data.trendValue && (
            <div className={`text-sm flex items-center gap-1 ${getTrendColor()} mb-2`}>
              <span>{data.trendValue}</span>
              {data.trendLabel && <span className="text-muted-foreground">({data.trendLabel})</span>}
            </div>
          )}

          <div className="flex justify-between items-end">
            <div className="flex-1">
              {renderSparkline()}
              {renderProgressBar()}
            </div>
            {data.trendChart && (
              <div className="ml-2">
                {renderAdvancedChart()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default and detailed variants
  return (
    <Card
      className={`${className} ${getSizeClasses()} ${getStatusColor()} ${getBorderRadiusClass()} ${getShadowClass()} ${getAnimationClass()} cursor-pointer hover:shadow-lg transition-all duration-300`}
      style={dynamicStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {IconComponent && (
              <IconComponent className="h-5 w-5 flex-shrink-0" style={{ color: data.color }} />
            )}
            <CardTitle className="text-sm font-medium truncate">{data.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {data.status && data.status !== 'neutral' && (
              <Badge 
                variant={data.status === 'success' ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {data.status}
              </Badge>
            )}
            {data.showTrend && getTrendIcon()}
          </div>
        </div>
        {data.subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{data.subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex-1">
            <div className={`text-3xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
              {data.prefix}{formatValue(currentValue)}{data.suffix}
              {data.unit && <span className="text-sm text-muted-foreground ml-1">{data.unit}</span>}
            </div>
            {data.showTrend && data.trendValue && (
              <div className="flex items-center gap-2 mt-1">
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
          </div>
          
          {data.trendChart ? renderAdvancedChart() : (data.showSparkline && renderSparkline())}
        </div>

        {renderProgressBar()}
        {renderGoalProgress()}
        {renderCustomFields()}
        {renderAlerts()}

        {data.lastUpdated && (
          <div className="pt-2 border-t border-border/30">
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

// Enhanced KPI Template presets with advanced styling
export const KPI_TEMPLATES = {
  // === PHARMACEUTICAL B2B SALES OPERATIONS TEMPLATES ===
  
  // Market Access & Formulary Performance
  formularyAccess: {
    title: 'Formulary Access Rate',
    subtitle: 'Products covered by health plans',
    format: 'percentage' as const,
    icon: 'shield',
    color: '#059669',
    style: 'modern' as const,
    borderRadius: 'large' as const,
    shadow: 'medium' as const,
    animation: 'slide' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'area' as const,
      data: [78, 82, 85, 88, 90, 92],
      color: '#059669',
      height: 60,
    },
    goals: {
      current: 92,
      target: 95,
      milestones: [
        { value: 85, label: 'Baseline', reached: true },
        { value: 90, label: 'Target', reached: true },
        { value: 95, label: 'Excellence', reached: false },
      ],
    },
    customFields: [
      { label: 'Tier 1 Plans', value: '95%', icon: 'star' },
      { label: 'Tier 2 Plans', value: '88%', icon: 'award' },
    ],
  },

  // Hospital System Penetration
  hospitalPenetration: {
    title: 'Hospital System Penetration',
    subtitle: 'Key accounts with active products',
    format: 'percentage' as const,
    icon: 'building',
    color: '#0ea5e9',
    style: 'glassmorphic' as const,
    borderRadius: 'large' as const,
    shadow: 'glow' as const,
    animation: 'fade' as const,
    showTrend: true,
    showProgress: true,
    backgroundColor: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1))',
    trendChart: {
      type: 'bar' as const,
      data: [65, 68, 72, 75, 78, 82],
      color: '#0ea5e9',
      height: 60,
    },
    customFields: [
      { label: 'Tier 1 Systems', value: '24/30', icon: 'building' },
      { label: 'New Accounts', value: '3', icon: 'target' },
    ],
  },

  // Prescription Volume Growth
  prescriptionVolume: {
    title: 'Prescription Volume',
    subtitle: 'Monthly total Rx volume',
    format: 'number' as const,
    unit: 'TRx',
    icon: 'chart',
    color: '#7c3aed',
    style: 'gradient' as const,
    borderRadius: 'large' as const,
    shadow: 'large' as const,
    animation: 'slide' as const,
    backgroundColor: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    textColor: '#ffffff',
    showTrend: true,
    showSparkline: true,
    sparklineData: [145000, 152000, 148000, 163000, 170000, 175000],
    trendChart: {
      type: 'area' as const,
      data: [145000, 152000, 148000, 163000, 170000, 175000],
      color: '#ffffff',
      height: 60,
    },
    customFields: [
      { label: 'New Rx', value: '28,500', icon: 'sparkle' },
      { label: 'Refills', value: '146,500', icon: 'activity' },
    ],
  },

  // Market Share
  marketShare: {
    title: 'Market Share',
    subtitle: 'Therapeutic area dominance',
    format: 'percentage' as const,
    icon: 'target',
    color: '#dc2626',
    style: 'modern' as const,
    borderRadius: 'medium' as const,
    shadow: 'medium' as const,
    animation: 'pulse' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'donut' as const,
      data: [24.5],
      color: '#dc2626',
      height: 80,
    },
    alerts: [
      {
        threshold: 22,
        type: 'below' as const,
        message: 'Market share below competitive threshold',
      },
    ],
    customFields: [
      { label: 'vs Competitor A', value: '+2.3%', icon: 'trending-up' },
      { label: 'vs Competitor B', value: '-0.8%', icon: 'trending-down' },
    ],
  },

  // Payer Coverage
  payerCoverage: {
    title: 'Payer Coverage',
    subtitle: 'Lives covered across plans',
    format: 'number' as const,
    unit: 'M Lives',
    icon: 'users',
    color: '#059669',
    style: 'classic' as const,
    borderRadius: 'medium' as const,
    shadow: 'medium' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'gauge' as const,
      data: [78],
      color: '#059669',
      height: 80,
    },
    goals: {
      current: 78,
      target: 85,
      milestones: [
        { value: 70, label: 'Baseline', reached: true },
        { value: 80, label: 'Growth', reached: false },
        { value: 85, label: 'Target', reached: false },
      ],
    },
    customFields: [
      { label: 'Commercial', value: '45.2M', icon: 'building' },
      { label: 'Medicare', value: '32.8M', icon: 'shield' },
    ],
  },

  // Clinical Trial Enrollment
  clinicalEnrollment: {
    title: 'Clinical Trial Enrollment',
    subtitle: 'Patient recruitment rate',
    format: 'number' as const,
    icon: 'activity',
    color: '#0891b2',
    style: 'modern' as const,
    borderRadius: 'large' as const,
    shadow: 'medium' as const,
    animation: 'slide' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'bar' as const,
      data: [145, 162, 158, 174, 189, 195],
      color: '#0891b2',
      height: 60,
    },
    customFields: [
      { label: 'Phase III', value: '123', icon: 'star' },
      { label: 'Phase II', value: '72', icon: 'award' },
    ],
    alerts: [
      {
        threshold: 150,
        type: 'below' as const,
        message: 'Enrollment below monthly target',
      },
    ],
  },

  // Regulatory Compliance
  regulatoryCompliance: {
    title: 'Regulatory Compliance',
    subtitle: 'Audit readiness score',
    format: 'percentage' as const,
    icon: 'shield',
    color: '#16a34a',
    style: 'glassmorphic' as const,
    borderRadius: 'large' as const,
    shadow: 'glow' as const,
    animation: 'fade' as const,
    backgroundColor: 'linear-gradient(135deg, rgba(22, 163, 74, 0.1), rgba(21, 128, 61, 0.1))',
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'gauge' as const,
      data: [98],
      color: '#16a34a',
      height: 80,
    },
    customFields: [
      { label: 'FDA Ready', value: '✓', icon: 'check' },
      { label: 'EMA Ready', value: '✓', icon: 'check' },
    ],
  },

  // Key Opinion Leader Engagement
  kolEngagement: {
    title: 'KOL Engagement Score',
    subtitle: 'Key opinion leader relationships',
    format: 'number' as const,
    suffix: '/100',
    icon: 'users',
    color: '#ea580c',
    style: 'gradient' as const,
    borderRadius: 'full' as const,
    shadow: 'large' as const,
    animation: 'slide' as const,
    backgroundColor: 'linear-gradient(135deg, #ea580c, #f97316)',
    textColor: '#ffffff',
    showTrend: true,
    showSparkline: true,
    sparklineData: [82, 85, 88, 86, 91, 94],
    customFields: [
      { label: 'Tier 1 KOLs', value: '15/18', icon: 'star' },
      { label: 'Advisory Boards', value: '4', icon: 'users' },
    ],
  },

  // Launch Performance
  launchPerformance: {
    title: 'Product Launch Velocity',
    subtitle: 'New product market uptake',
    format: 'currency' as const,
    icon: 'zap',
    color: '#dc2626',
    style: 'modern' as const,
    borderRadius: 'medium' as const,
    shadow: 'glow' as const,
    animation: 'pulse' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'area' as const,
      data: [0, 125000, 285000, 450000, 685000, 890000],
      color: '#dc2626',
      height: 60,
    },
    goals: {
      current: 890000,
      target: 1200000,
      milestones: [
        { value: 500000, label: 'Month 3', reached: true },
        { value: 800000, label: 'Month 6', reached: true },
        { value: 1200000, label: 'Month 9', reached: false },
      ],
    },
    customFields: [
      { label: 'Uptake Rate', value: '74%', icon: 'trending-up' },
      { label: 'Target Met', value: '89%', icon: 'target' },
    ],
  },

  // Medical Affairs Engagement
  medicalEngagement: {
    title: 'Medical Affairs Impact',
    subtitle: 'Scientific engagement activities',
    format: 'number' as const,
    icon: 'award',
    color: '#7c2d12',
    style: 'classic' as const,
    borderRadius: 'medium' as const,
    shadow: 'medium' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'bar' as const,
      data: [28, 32, 35, 38, 42, 45],
      color: '#7c2d12',
      height: 60,
    },
    customFields: [
      { label: 'Publications', value: '12', icon: 'star' },
      { label: 'Conferences', value: '8', icon: 'calendar' },
      { label: 'MSL Contacts', value: '156', icon: 'users' },
    ],
  },

  // Patient Support Programs
  patientSupport: {
    title: 'Patient Support Enrollment',
    subtitle: 'Hub services utilization',
    format: 'number' as const,
    icon: 'heart',
    color: '#be185d',
    style: 'gradient' as const,
    borderRadius: 'large' as const,
    shadow: 'large' as const,
    animation: 'fade' as const,
    backgroundColor: 'linear-gradient(135deg, #be185d, #ec4899)',
    textColor: '#ffffff',
    showTrend: true,
    showSparkline: true,
    sparklineData: [1250, 1385, 1420, 1580, 1650, 1720],
    customFields: [
      { label: 'Copay Cards', value: '1,234', icon: 'dollar' },
      { label: 'Prior Auth', value: '486', icon: 'shield' },
    ],
  },

  // Competitive Intelligence
  competitiveIntel: {
    title: 'Competitive Position',
    subtitle: 'Market position strength',
    format: 'number' as const,
    suffix: '/10',
    icon: 'gauge',
    color: '#7c3aed',
    style: 'modern' as const,
    borderRadius: 'large' as const,
    shadow: 'medium' as const,
    animation: 'slide' as const,
    showTrend: true,
    trendChart: {
      type: 'gauge' as const,
      data: [8.4],
      color: '#7c3aed',
      height: 80,
    },
    customFields: [
      { label: 'Price Advantage', value: '+15%', icon: 'dollar' },
      { label: 'Efficacy Score', value: '9.2/10', icon: 'star' },
      { label: 'Safety Profile', value: 'Superior', icon: 'shield' },
    ],
  },

  // === GENERAL B2B SALES TEMPLATES ===
  
  modernSales: {
    title: 'Sales Performance',
    format: 'currency' as const,
    icon: 'dollar',
    color: '#10b981',
    style: 'modern' as const,
    borderRadius: 'large' as const,
    shadow: 'medium' as const,
    animation: 'slide' as const,
    showTrend: true,
    showProgress: true,
    trendChart: {
      type: 'area' as const,
      data: [45000, 52000, 48000, 61000, 58000, 67000],
      color: '#10b981',
      height: 60,
    },
  },
  glassmorphicRevenue: {
    title: 'Monthly Revenue',
    format: 'currency' as const,
    icon: 'dollar',
    color: '#3b82f6',
    style: 'glassmorphic' as const,
    borderRadius: 'large' as const,
    shadow: 'glow' as const,
    animation: 'fade' as const,
    showTrend: true,
    showSparkline: true,
    backgroundColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
  },
  performanceGauge: {
    title: 'Performance Score',
    format: 'percentage' as const,
    icon: 'gauge',
    color: '#8b5cf6',
    style: 'modern' as const,
    borderRadius: 'medium' as const,
    shadow: 'medium' as const,
    animation: 'pulse' as const,
    showTrend: true,
    trendChart: {
      type: 'gauge' as const,
      data: [85],
      color: '#8b5cf6',
      height: 80,
    },
    goals: {
      current: 85,
      target: 100,
      milestones: [
        { value: 75, label: 'Good', reached: true },
        { value: 90, label: 'Great', reached: false },
        { value: 100, label: 'Perfect', reached: false },
      ],
    },
  },
  minimalistCount: {
    title: 'Active Users',
    format: 'number' as const,
    icon: 'users',
    color: '#06b6d4',
    style: 'minimal' as const,
    borderRadius: 'small' as const,
    shadow: 'small' as const,
    animation: 'bounce' as const,
    showTrend: true,
    trendChart: {
      type: 'bar' as const,
      data: [120, 135, 142, 158, 163, 171],
      color: '#06b6d4',
      height: 50,
    },
  },
  gradientSatisfaction: {
    title: 'Customer Satisfaction',
    format: 'number' as const,
    suffix: '/5.0',
    icon: 'heart',
    color: '#ef4444',
    style: 'gradient' as const,
    borderRadius: 'full' as const,
    shadow: 'large' as const,
    animation: 'slide' as const,
    backgroundColor: 'linear-gradient(135deg, #ef4444, #f97316)',
    textColor: '#ffffff',
    showTrend: true,
    trendChart: {
      type: 'donut' as const,
      data: [4.8],
      color: '#ffffff',
      height: 60,
    },
  },
  classicTargets: {
    title: 'Targets Met',
    format: 'number' as const,
    icon: 'target',
    color: '#84cc16',
    style: 'classic' as const,
    borderRadius: 'medium' as const,
    shadow: 'medium' as const,
    showProgress: true,
    showTrend: true,
    goals: {
      current: 23,
      target: 30,
      milestones: [
        { value: 15, label: 'Q1', reached: true },
        { value: 25, label: 'Q2', reached: false },
        { value: 30, label: 'Q3', reached: false },
      ],
    },
  },
  sparklineActivityAnalytics: {
    title: 'Activity Analytics',
    format: 'number' as const,
    icon: 'activity',
    color: '#f59e0b',
    style: 'modern' as const,
    borderRadius: 'large' as const,
    shadow: 'medium' as const,
    animation: 'fade' as const,
    showTrend: true,
    showSparkline: true,
    sparklineData: [120, 145, 135, 162, 158, 175, 182, 195],
    customFields: [
      { label: 'Peak Hour', value: '2-3 PM', icon: 'clock' },
      { label: 'Avg/Hour', value: '156', icon: 'activity' },
    ],
  },
  alertingRevenue: {
    title: 'Revenue Alerts',
    format: 'currency' as const,
    icon: 'lightning',
    color: '#dc2626',
    style: 'modern' as const,
    borderRadius: 'medium' as const,
    shadow: 'glow' as const,
    animation: 'pulse' as const,
    showTrend: true,
    alerts: [
      {
        threshold: 50000,
        type: 'below' as const,
        message: 'Revenue below monthly target',
      },
    ],
    trendChart: {
      type: 'area' as const,
      data: [45000, 42000, 38000, 41000, 44000, 47000],
      color: '#dc2626',
      height: 50,
    },
  },
};