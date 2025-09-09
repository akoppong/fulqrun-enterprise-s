import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DotsSixVertical, Gear, Trash } from '@phosphor-icons/react';
import { KPITarget, DashboardLayout } from '@/lib/types';

interface DraggableWidgetProps {
  id: string;
  kpi: KPITarget;
  layoutItem: DashboardLayout;
  onUpdateType: (kpiId: string, chartType: DashboardLayout['chartType']) => void;
  onRemove: (kpiId: string) => void;
}

export function DraggableWidget({ 
  id, 
  kpi, 
  layoutItem, 
  onUpdateType, 
  onRemove 
}: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getProgressPercentage = () => {
    if (kpi.targetValue === 0) return 0;
    return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
  };

  const getStatusColor = () => {
    switch (kpi.status) {
      case 'achieved': return 'text-green-600';
      case 'exceeded': return 'text-emerald-600';
      case 'at_risk': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-muted-foreground';
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

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`border-l-4 ${getPriorityColor()} ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      } transition-all duration-200`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <DotsSixVertical className="h-4 w-4" />
          </button>
          <CardTitle className="text-sm font-medium truncate">
            {kpi.name}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Select
            value={layoutItem.chartType}
            onValueChange={(value: DashboardLayout['chartType']) => 
              onUpdateType(kpi.id, value)
            }
          >
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="gauge">Gauge</SelectItem>
              <SelectItem value="trend">Trend</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(kpi.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Current Value Display */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">
                {layoutItem.chartType === 'progress' || layoutItem.chartType === 'gauge' 
                  ? `${getProgressPercentage().toFixed(1)}%`
                  : `${kpi.currentValue.toLocaleString()}${kpi.unit}`
                }
              </span>
              <span className="text-sm text-muted-foreground">
                / {kpi.targetValue.toLocaleString()}{kpi.unit}
              </span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {kpi.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Progress Bar for Progress Type */}
          {(layoutItem.chartType === 'progress' || layoutItem.chartType === 'gauge') && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  getProgressPercentage() >= 100 
                    ? 'bg-green-500' 
                    : getProgressPercentage() >= 80 
                    ? 'bg-blue-500' 
                    : getProgressPercentage() >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
              />
            </div>
          )}

          {/* Mini Chart Preview for Trend/Chart Types */}
          {(layoutItem.chartType === 'trend' || layoutItem.chartType === 'line' || layoutItem.chartType === 'bar') && (
            <div className="h-16 bg-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground">
              Chart Preview ({layoutItem.chartType})
            </div>
          )}

          {/* KPI Details */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="capitalize">{kpi.period} • {kpi.category}</span>
            <span className="capitalize">{kpi.priority} priority</span>
          </div>
          
          {/* Description */}
          {kpi.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {kpi.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}