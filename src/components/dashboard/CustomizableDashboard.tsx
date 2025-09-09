import { useState, useCallback, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus,
  Gear,
  Edit,
  Eye,
  Save,
  RotateCcw,
  Trash,
  Grid,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Mail,
  Phone,
  Building,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  PieChart,
  LineChart,
  AreaChart
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { User } from '@/lib/types';
import { ChartWidget } from './widgets/ChartWidget';
import { WidgetConfigDialog } from './widgets/WidgetConfigDialog';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget Types Configuration
const WIDGET_TYPES = {
  'kpi-card': {
    name: 'KPI Card',
    description: 'Display key performance metrics',
    icon: <Target className="h-4 w-4" />,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 6, h: 4 }
  },
  'chart': {
    name: 'Chart Widget',
    description: 'Various chart types for data visualization',
    icon: <BarChart3 className="h-4 w-4" />,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 3, h: 3 },
    maxSize: { w: 12, h: 8 }
  },
  'progress': {
    name: 'Progress Tracker',
    description: 'Track progress towards goals',
    icon: <Activity className="h-4 w-4" />,
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 1 },
    maxSize: { w: 6, h: 3 }
  },
  'list': {
    name: 'List Widget',
    description: 'Display lists of items',
    icon: <Users className="h-4 w-4" />,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 8, h: 6 }
  },
  'calendar': {
    name: 'Calendar',
    description: 'Calendar events and appointments',
    icon: <Calendar className="h-4 w-4" />,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    maxSize: { w: 8, h: 6 }
  },
  'recent-activity': {
    name: 'Recent Activity',
    description: 'Recent system activities',
    icon: <Clock className="h-4 w-4" />,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    maxSize: { w: 6, h: 5 }
  },
  'quick-actions': {
    name: 'Quick Actions',
    description: 'Frequently used actions',
    icon: <Zap className="h-4 w-4" />,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 4, h: 3 }
  },
  'alerts': {
    name: 'Alerts & Notifications',
    description: 'Important alerts and notifications',
    icon: <AlertTriangle className="h-4 w-4" />,
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 3, h: 1 },
    maxSize: { w: 6, h: 4 }
  }
};

interface DashboardWidget {
  id: string;
  type: keyof typeof WIDGET_TYPES;
  title: string;
  description?: string;
  data?: any;
  config?: {
    chartType?: 'bar' | 'line' | 'pie' | 'area' | 'gauge';
    color?: string;
    refreshRate?: number;
    dataSource?: string;
    filters?: any[];
  };
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: Layout[];
  isDefault: boolean;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomizableDashboardProps {
  user: User;
  onConfigChange?: (config: DashboardConfig) => void;
}

export function CustomizableDashboard({ user, onConfigChange }: CustomizableDashboardProps) {
  const [dashboards, setDashboards] = useKV<DashboardConfig[]>('dashboard-configs', []);
  const [currentDashboard, setCurrentDashboard] = useKV<string>('current-dashboard', '');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedWidgetForConfig, setSelectedWidgetForConfig] = useState<DashboardWidget | null>(null);
  const [selectedWidgetType, setSelectedWidgetType] = useState<keyof typeof WIDGET_TYPES>('kpi-card');

  // Form states
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDescription, setNewDashboardDescription] = useState('');
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetDescription, setNewWidgetDescription] = useState('');

  const activeDashboard = useMemo(() => {
    return dashboards.find(d => d.id === currentDashboard) || dashboards.find(d => d.isDefault);
  }, [dashboards, currentDashboard]);

  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!activeDashboard || !isEditMode) return;

    const updatedDashboard: DashboardConfig = {
      ...activeDashboard,
      layout: newLayout,
      widgets: activeDashboard.widgets.map(widget => {
        const layoutItem = newLayout.find(item => item.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            layout: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
            updatedAt: new Date(),
          };
        }
        return widget;
      }),
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === activeDashboard.id ? updatedDashboard : dashboard
      )
    );

    onConfigChange?.(updatedDashboard);
  }, [activeDashboard, isEditMode, setDashboards, onConfigChange]);

  const createDashboard = useCallback(() => {
    if (!newDashboardName.trim()) {
      toast.error('Dashboard name is required');
      return;
    }

    const newDashboard: DashboardConfig = {
      id: `dashboard-${Date.now()}`,
      name: newDashboardName,
      description: newDashboardDescription,
      widgets: [],
      layout: [],
      isDefault: dashboards.length === 0,
      isPublic: false,
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDashboards(current => [...current, newDashboard]);
    setCurrentDashboard(newDashboard.id);
    setNewDashboardName('');
    setNewDashboardDescription('');
    setIsCreateDialogOpen(false);
    toast.success('Dashboard created successfully');
  }, [newDashboardName, newDashboardDescription, dashboards.length, user.id, setDashboards, setCurrentDashboard]);

  const addWidget = useCallback(() => {
    if (!activeDashboard || !newWidgetTitle.trim()) {
      toast.error('Widget title is required');
      return;
    }

    const widgetType = WIDGET_TYPES[selectedWidgetType];
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: selectedWidgetType,
      title: newWidgetTitle,
      description: newWidgetDescription,
      data: generateSampleData(selectedWidgetType),
      config: {
        chartType: selectedWidgetType === 'chart' ? 'bar' : undefined,
        color: '#3b82f6',
        refreshRate: 30,
      },
      layout: {
        x: 0,
        y: 0,
        w: widgetType.defaultSize.w,
        h: widgetType.defaultSize.h,
      },
      visible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Find empty position
    const maxY = activeDashboard.widgets.reduce((max, widget) => 
      Math.max(max, widget.layout.y + widget.layout.h), 0
    );
    newWidget.layout.y = maxY;

    const updatedDashboard: DashboardConfig = {
      ...activeDashboard,
      widgets: [...activeDashboard.widgets, newWidget],
      layout: [
        ...activeDashboard.layout,
        {
          i: newWidget.id,
          x: newWidget.layout.x,
          y: newWidget.layout.y,
          w: newWidget.layout.w,
          h: newWidget.layout.h,
          ...widgetType.minSize && { minW: widgetType.minSize.w, minH: widgetType.minSize.h },
          ...widgetType.maxSize && { maxW: widgetType.maxSize.w, maxH: widgetType.maxSize.h },
        },
      ],
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === activeDashboard.id ? updatedDashboard : dashboard
      )
    );

    setNewWidgetTitle('');
    setNewWidgetDescription('');
    setIsAddWidgetOpen(false);
    toast.success('Widget added successfully');
  }, [activeDashboard, newWidgetTitle, newWidgetDescription, selectedWidgetType, setDashboards]);

  const updateWidget = useCallback((updatedWidget: DashboardWidget) => {
    if (!activeDashboard) return;

    const updatedDashboard: DashboardConfig = {
      ...activeDashboard,
      widgets: activeDashboard.widgets.map(widget =>
        widget.id === updatedWidget.id ? { ...updatedWidget, updatedAt: new Date() } : widget
      ),
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === activeDashboard.id ? updatedDashboard : dashboard
      )
    );

    toast.success('Widget updated successfully');
  }, [activeDashboard, setDashboards]);

  const openWidgetConfig = useCallback((widget: DashboardWidget) => {
    setSelectedWidgetForConfig(widget);
    setIsConfigDialogOpen(true);
  }, []);

  const removeWidget = useCallback((widgetId: string) => {
    if (!activeDashboard) return;

    const updatedDashboard: DashboardConfig = {
      ...activeDashboard,
      widgets: activeDashboard.widgets.filter(w => w.id !== widgetId),
      layout: activeDashboard.layout.filter(item => item.i !== widgetId),
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === activeDashboard.id ? updatedDashboard : dashboard
      )
    );

    toast.success('Widget removed');
  }, [activeDashboard, setDashboards]);

  const resetLayout = useCallback(() => {
    if (!activeDashboard) return;

    const resetLayout = activeDashboard.widgets.map((widget, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const widgetType = WIDGET_TYPES[widget.type];
      
      return {
        i: widget.id,
        x: col * 4,
        y: row * 3,
        w: widgetType.defaultSize.w,
        h: widgetType.defaultSize.h,
        ...widgetType.minSize && { minW: widgetType.minSize.w, minH: widgetType.minSize.h },
        ...widgetType.maxSize && { maxW: widgetType.maxSize.w, maxH: widgetType.maxSize.h },
      };
    });

    const updatedDashboard: DashboardConfig = {
      ...activeDashboard,
      layout: resetLayout,
      widgets: activeDashboard.widgets.map((widget, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const widgetType = WIDGET_TYPES[widget.type];
        
        return {
          ...widget,
          layout: {
            x: col * 4,
            y: row * 3,
            w: widgetType.defaultSize.w,
            h: widgetType.defaultSize.h,
          },
          updatedAt: new Date(),
        };
      }),
      updatedAt: new Date(),
    };

    setDashboards(current =>
      current.map(dashboard =>
        dashboard.id === activeDashboard.id ? updatedDashboard : dashboard
      )
    );

    toast.success('Layout reset to default');
  }, [activeDashboard, setDashboards]);

  const saveLayout = useCallback(() => {
    toast.success('Dashboard layout saved');
  }, []);

  const deleteDashboard = useCallback((dashboardId: string) => {
    setDashboards(current => {
      const filtered = current.filter(d => d.id !== dashboardId);
      // If we deleted the current dashboard, switch to the first available or create a default
      if (dashboardId === currentDashboard) {
        setCurrentDashboard(filtered.length > 0 ? filtered[0].id : '');
      }
      return filtered;
    });
    toast.success('Dashboard deleted');
  }, [setDashboards, currentDashboard, setCurrentDashboard]);

  // Initialize with default dashboard if none exists
  if (dashboards.length === 0) {
    const defaultDashboard: DashboardConfig = {
      id: 'default-dashboard',
      name: 'My Dashboard',
      description: 'Your personalized dashboard',
      widgets: [
        {
          id: 'default-pipeline-value',
          type: 'kpi-card',
          title: 'Pipeline Value',
          data: { value: '$124,500', change: '+20.1%', trend: 'up' },
          layout: { x: 0, y: 0, w: 3, h: 2 },
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-deals',
          type: 'kpi-card',
          title: 'Active Deals',
          data: { value: '23', change: '+5 new', trend: 'up' },
          layout: { x: 3, y: 0, w: 3, h: 2 },
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-conversion',
          type: 'progress',
          title: 'Conversion Rate',
          data: { value: 73, target: 80, label: '73%' },
          layout: { x: 6, y: 0, w: 3, h: 2 },
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-chart',
          type: 'chart',
          title: 'Sales Performance',
          config: { 
            chartType: 'bar',
            color: '#3b82f6',
            showGrid: true,
            animated: true
          },
          data: { 
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{ 
              name: 'Revenue',
              data: [12000, 19000, 15000, 25000, 22000, 30000] 
            }]
          },
          layout: { x: 0, y: 2, w: 6, h: 4 },
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-activity',
          type: 'recent-activity',
          title: 'Recent Activity',
          data: {
            activities: [
              { type: 'deal', title: 'New deal created', time: '2 hours ago' },
              { type: 'contact', title: 'Contact updated', time: '4 hours ago' },
              { type: 'meeting', title: 'Meeting scheduled', time: '6 hours ago' },
            ]
          },
          layout: { x: 6, y: 2, w: 6, h: 4 },
          visible: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      layout: [
        { i: 'default-pipeline-value', x: 0, y: 0, w: 3, h: 2 },
        { i: 'default-deals', x: 3, y: 0, w: 3, h: 2 },
        { i: 'default-conversion', x: 6, y: 0, w: 3, h: 2 },
        { i: 'default-chart', x: 0, y: 2, w: 6, h: 4 },
        { i: 'default-activity', x: 6, y: 2, w: 6, h: 4 },
      ],
      isDefault: true,
      isPublic: false,
      ownerId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDashboards([defaultDashboard]);
    setCurrentDashboard(defaultDashboard.id);
  }

  if (!activeDashboard) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Dashboard Found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first dashboard to start customizing your experience
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{activeDashboard.name}</h2>
            {activeDashboard.description && (
              <p className="text-muted-foreground">{activeDashboard.description}</p>
            )}
          </div>
          {dashboards.length > 1 && (
            <Select value={currentDashboard} onValueChange={setCurrentDashboard}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select dashboard" />
              </SelectTrigger>
              <SelectContent>
                {dashboards.map(dashboard => (
                  <SelectItem key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Create Dashboard Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dashboard-name">Dashboard Name</Label>
                  <Input
                    id="dashboard-name"
                    value={newDashboardName}
                    onChange={(e) => setNewDashboardName(e.target.value)}
                    placeholder="Enter dashboard name"
                  />
                </div>
                <div>
                  <Label htmlFor="dashboard-description">Description (Optional)</Label>
                  <Textarea
                    id="dashboard-description"
                    value={newDashboardDescription}
                    onChange={(e) => setNewDashboardDescription(e.target.value)}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createDashboard}>Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Widget Dialog */}
          <Dialog open={isAddWidgetOpen} onOpenChange={setIsAddWidgetOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Widget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Widget Type</Label>
                  <Select value={selectedWidgetType} onValueChange={setSelectedWidgetType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WIDGET_TYPES).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            <div>
                              <div className="font-medium">{type.name}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="widget-title">Widget Title</Label>
                  <Input
                    id="widget-title"
                    value={newWidgetTitle}
                    onChange={(e) => setNewWidgetTitle(e.target.value)}
                    placeholder="Enter widget title"
                  />
                </div>
                <div>
                  <Label htmlFor="widget-description">Description (Optional)</Label>
                  <Input
                    id="widget-description"
                    value={newWidgetDescription}
                    onChange={(e) => setNewWidgetDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddWidgetOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addWidget}>Add Widget</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Mode Toggle */}
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditMode ? 'Preview' : 'Edit'}
          </Button>

          {dashboards.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteDashboard(activeDashboard.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Gear className="h-4 w-4" />
            <span className="text-sm font-medium">Edit Mode Active</span>
            <Badge variant="outline">Drag widgets • Resize corners • Configure settings</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetLayout}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Layout
            </Button>
            <Button size="sm" onClick={saveLayout}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      {activeDashboard.widgets.length > 0 ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={{
            lg: activeDashboard.layout,
            md: activeDashboard.layout,
            sm: activeDashboard.layout,
            xs: activeDashboard.layout,
            xxs: activeDashboard.layout,
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
        >
          {activeDashboard.widgets.filter(w => w.visible).map(widget => (
            <div key={widget.id} className="relative">
              <Card className={`h-full transition-all duration-200 ${
                isEditMode ? 'border-2 border-dashed border-transparent hover:border-primary/50' : ''
              }`}>
                {isEditMode && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const widgetData = activeDashboard.widgets.find(w => w.id === widget.id);
                        if (widgetData) openWidgetConfig(widgetData);
                      }}
                      className="h-6 w-6 p-0"
                      title="Configure widget"
                    >
                      <Gear className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeWidget(widget.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      title="Remove widget"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="h-full">
                  <WidgetRenderer widget={widget} isEditMode={isEditMode} />
                </div>
              </Card>
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : (
        <Card className="h-64">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Widgets Added</h3>
              <p className="text-muted-foreground mb-4">
                Add widgets to customize your dashboard layout
              </p>
              <Button onClick={() => setIsAddWidgetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Widget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widget Configuration Dialog */}
      <WidgetConfigDialog
        widget={selectedWidgetForConfig}
        isOpen={isConfigDialogOpen}
        onClose={() => {
          setIsConfigDialogOpen(false);
          setSelectedWidgetForConfig(null);
        }}
        onSave={updateWidget}
      />
    </div>
  );
}

// Widget Renderer Component
function WidgetRenderer({ widget, isEditMode }: { widget: DashboardWidget; isEditMode: boolean }) {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'kpi-card':
        return (
          <div className="p-4 h-full flex flex-col justify-center">
            <div className="text-2xl font-bold mb-1">
              {widget.data?.value || '0'}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {widget.data?.change && (
                <>
                  <TrendingUp className="h-3 w-3" />
                  {widget.data.change}
                </>
              )}
            </div>
          </div>
        );

      case 'progress':
        const progress = widget.data?.value || 0;
        const target = widget.data?.target || 100;
        const percentage = Math.min((progress / target) * 100, 100);
        
        return (
          <div className="p-4 h-full flex flex-col justify-center">
            <div className="text-lg font-semibold mb-2">
              {widget.data?.label || `${progress}%`}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Target: {target}
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="h-full p-2">
            <ChartWidget
              type={widget.config?.chartType || 'bar'}
              data={widget.data}
              config={widget.config}
              height={widget.layout.h * 60 - 80} // Account for header and padding
            />
          </div>
        );

      case 'recent-activity':
        const activities = widget.data?.activities || [];
        return (
          <div className="p-4 h-full">
            <div className="space-y-2 overflow-y-auto h-full">
              {activities.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded text-sm">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        );

      case 'quick-actions':
        return (
          <div className="p-4 h-full flex flex-wrap gap-2 content-center justify-center">
            <Button size="sm" variant="outline" className="flex-1">
              <Plus className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Mail className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Phone className="h-3 w-3" />
            </Button>
          </div>
        );

      default:
        return (
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-muted-foreground text-sm">
                {WIDGET_TYPES[widget.type]?.name || 'Widget'}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {widget.description && (
          <p className="text-xs text-muted-foreground">{widget.description}</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {renderWidgetContent()}
      </CardContent>
    </>
  );
}

// Sample data generator
function generateSampleData(widgetType: keyof typeof WIDGET_TYPES) {
  switch (widgetType) {
    case 'kpi-card':
      return {
        value: '$45,231',
        change: '+12.3%',
        trend: 'up'
      };
    case 'progress':
      return {
        value: 67,
        target: 100,
        label: '67%'
      };
    case 'recent-activity':
      return {
        activities: [
          { type: 'deal', title: 'New opportunity created', time: '1 hour ago' },
          { type: 'contact', title: 'Contact information updated', time: '3 hours ago' },
          { type: 'meeting', title: 'Follow-up call scheduled', time: '5 hours ago' },
        ]
      };
    case 'chart':
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ 
          name: 'Sales',
          data: [12000, 19000, 15000, 25000, 22000, 30000] 
        }]
      };
    default:
      return {};
  }
}