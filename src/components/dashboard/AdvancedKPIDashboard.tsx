import { useState, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gear, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Save,
  Trash
} from '@phosphor-icons/react';
import { KPITarget, DashboardLayout } from '@/lib/types';
import { KPIWidgetRenderer } from './KPIWidgetRenderer';
import { toast } from 'sonner';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface AdvancedKPIDashboardProps {
  kpiTargets: KPITarget[];
  layout: DashboardLayout[];
  onLayoutChange: (newLayout: DashboardLayout[]) => void;
  isEditMode: boolean;
}

export function AdvancedKPIDashboard({ 
  kpiTargets, 
  layout, 
  onLayoutChange,
  isEditMode 
}: AdvancedKPIDashboardProps) {
  const [currentLayout, setCurrentLayout] = useState<Layout[]>(() =>
    layout.map(item => ({
      i: item.kpiId,
      x: item.position.x,
      y: item.position.y,
      w: item.position.width,
      h: item.position.height,
    }))
  );

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setCurrentLayout(newLayout);
    
    if (isEditMode) {
      const updatedDashboardLayout = newLayout.map(layoutItem => {
        const existingItem = layout.find(item => item.kpiId === layoutItem.i);
        return {
          kpiId: layoutItem.i,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
          },
          chartType: existingItem?.chartType || 'number',
          displayOptions: existingItem?.displayOptions || {},
        } as DashboardLayout;
      });
      
      onLayoutChange(updatedDashboardLayout);
    }
  }, [isEditMode, layout, onLayoutChange]);

  const updateWidgetChartType = useCallback((kpiId: string, chartType: DashboardLayout['chartType']) => {
    const updatedLayout = layout.map(item =>
      item.kpiId === kpiId ? { ...item, chartType } : item
    );
    onLayoutChange(updatedLayout);
    toast.success('Widget type updated');
  }, [layout, onLayoutChange]);

  const removeWidget = useCallback((kpiId: string) => {
    const updatedLayout = layout.filter(item => item.kpiId !== kpiId);
    const updatedGridLayout = currentLayout.filter(item => item.i !== kpiId);
    
    setCurrentLayout(updatedGridLayout);
    onLayoutChange(updatedLayout);
    toast.success('Widget removed');
  }, [layout, currentLayout, onLayoutChange]);

  const resetLayout = useCallback(() => {
    const resetGridLayout = layout.map((item, index) => ({
      i: item.kpiId,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 3,
      w: 4,
      h: 3,
    }));
    
    setCurrentLayout(resetGridLayout);
    
    const resetDashboardLayout = layout.map((item, index) => ({
      ...item,
      position: {
        x: (index % 3) * 4,
        y: Math.floor(index / 3) * 3,
        width: 4,
        height: 3,
      },
    }));
    
    onLayoutChange(resetDashboardLayout);
    toast.success('Layout reset to default');
  }, [layout, onLayoutChange]);

  const saveLayout = useCallback(() => {
    toast.success('Dashboard layout saved');
  }, []);

  // Breakpoints for responsive design
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  return (
    <div className="space-y-4">
      {/* Dashboard Controls */}
      {isEditMode && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard Edit Mode</span>
            <Badge variant="outline">Drag to reorder • Resize handles on corners</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetLayout}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button size="sm" onClick={saveLayout}>
              <Save className="h-4 w-4 mr-2" />
              Save Layout
            </Button>
          </div>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{
          lg: currentLayout,
          md: currentLayout,
          sm: currentLayout,
          xs: currentLayout,
          xxs: currentLayout,
        }}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        useCSSTransforms={true}
        preventCollision={false}
        autoSize={true}
        draggableHandle=".drag-handle"
        resizeHandle={
          <div className="react-resizable-handle react-resizable-handle-se">
            <Maximize2 className="h-3 w-3" />
          </div>
        }
      >
        {layout.map(layoutItem => {
          const kpi = kpiTargets.find(k => k.id === layoutItem.kpiId);
          if (!kpi) return null;

          return (
            <div key={layoutItem.kpiId} className="relative">
              <Card className="h-full border-2 border-dashed border-transparent hover:border-primary/50 transition-all duration-200">
                {isEditMode && (
                  <>
                    {/* Drag Handle */}
                    <div className="drag-handle absolute top-2 left-2 cursor-move opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                        <div className="w-2 h-2 grid grid-cols-2 gap-px">
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                          <div className="w-1 h-1 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Widget Controls */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                      <Select
                        value={layoutItem.chartType}
                        onValueChange={(value: DashboardLayout['chartType']) => 
                          updateWidgetChartType(kpi.id, value)
                        }
                      >
                        <SelectTrigger className="w-20 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="progress">Progress</SelectItem>
                          <SelectItem value="gauge">Gauge</SelectItem>
                          <SelectItem value="trend">Trend</SelectItem>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="line">Line</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeWidget(kpi.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}

                {/* Widget Content */}
                <div className={`h-full ${isEditMode ? 'pt-8' : ''}`}>
                  <KPIWidgetRenderer kpi={kpi} layoutItem={layoutItem} />
                </div>
              </Card>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {layout.length === 0 && (
        <Card className="h-64">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Maximize2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Widgets Added</h3>
              <p className="text-muted-foreground">
                Add KPI widgets to customize your dashboard layout
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}