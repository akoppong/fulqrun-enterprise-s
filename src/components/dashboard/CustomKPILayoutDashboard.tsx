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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Gear,
  Edit,
  Eye,
  EyeSlash,
  Save,
  RotateCcw,
  Trash,
  Grid,
  Target,
  Palette,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  Download,
  Upload,
  Star,
  Layout as LayoutIcon,
  Move,
  Maximize,
  Minimize,
  Settings2,
  Sparkles,
  Zap,
  Award,
  Warning
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { User } from '@/lib/types';
import { PersonalizedKPICard, PersonalizedKPIData } from './widgets/PersonalizedKPICard';
import { KPIDashboardGallery } from './widgets/KPIDashboardGallery';
import { WidgetResizeControls, WidgetDragHandle, WidgetInfoBadge } from './widgets/WidgetResizeControls';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Pre-defined layout templates
const LAYOUT_TEMPLATES = {
  'executive-overview': {
    name: 'Executive Overview',
    description: 'High-level KPIs for executives',
    icon: <Award className="h-4 w-4" />,
    grid: { lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 80,
    layouts: {
      'revenue': { x: 0, y: 0, w: 4, h: 2 },
      'growth': { x: 4, y: 0, w: 4, h: 2 },
      'customers': { x: 8, y: 0, w: 4, h: 2 },
      'pipeline': { x: 0, y: 2, w: 6, h: 3 },
      'forecast': { x: 6, y: 2, w: 6, h: 3 },
    }
  },
  'sales-dashboard': {
    name: 'Sales Dashboard',
    description: 'KPIs focused on sales performance',
    icon: <TrendingUp className="h-4 w-4" />,
    grid: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 60,
    layouts: {
      'deals': { x: 0, y: 0, w: 3, h: 2 },
      'conversion': { x: 3, y: 0, w: 3, h: 2 },
      'quota': { x: 6, y: 0, w: 3, h: 2 },
      'activity': { x: 9, y: 0, w: 3, h: 2 },
      'leaderboard': { x: 0, y: 2, w: 6, h: 4 },
      'trends': { x: 6, y: 2, w: 6, h: 4 },
    }
  },
  'operations-center': {
    name: 'Operations Center',
    description: 'Operational metrics and KPIs',
    icon: <Gear className="h-4 w-4" />,
    grid: { lg: 16, md: 12, sm: 8, xs: 4, xxs: 2 },
    rowHeight: 50,
    layouts: {
      'efficiency': { x: 0, y: 0, w: 4, h: 2 },
      'quality': { x: 4, y: 0, w: 4, h: 2 },
      'capacity': { x: 8, y: 0, w: 4, h: 2 },
      'costs': { x: 12, y: 0, w: 4, h: 2 },
      'performance-chart': { x: 0, y: 2, w: 8, h: 4 },
      'alerts': { x: 8, y: 2, w: 8, h: 4 },
    }
  },
  'compact-mobile': {
    name: 'Mobile Compact',
    description: 'Optimized for mobile devices',
    icon: <Grid className="h-4 w-4" />,
    grid: { lg: 4, md: 4, sm: 2, xs: 2, xxs: 1 },
    rowHeight: 100,
    layouts: {
      'primary-kpi': { x: 0, y: 0, w: 4, h: 2 },
      'secondary-1': { x: 0, y: 2, w: 2, h: 1 },
      'secondary-2': { x: 2, y: 2, w: 2, h: 1 },
      'chart': { x: 0, y: 3, w: 4, h: 3 },
    }
  },
  'detailed-analytics': {
    name: 'Detailed Analytics',
    description: 'In-depth KPI analysis',
    icon: <BarChart3 className="h-4 w-4" />,
    grid: { lg: 20, md: 16, sm: 10, xs: 6, xxs: 2 },
    rowHeight: 40,
    layouts: {
      'primary': { x: 0, y: 0, w: 6, h: 3 },
      'comparison': { x: 6, y: 0, w: 6, h: 3 },
      'trend': { x: 12, y: 0, w: 8, h: 3 },
      'breakdown-1': { x: 0, y: 3, w: 5, h: 4 },
      'breakdown-2': { x: 5, y: 3, w: 5, h: 4 },
      'breakdown-3': { x: 10, y: 3, w: 5, h: 4 },
      'breakdown-4': { x: 15, y: 3, w: 5, h: 4 },
    }
  }
};

// Sample KPI data
const SAMPLE_KPIS: PersonalizedKPIData[] = [
  {
    id: 'revenue-kpi',
    title: 'Monthly Revenue',
    subtitle: 'This Month',
    value: 284500,
    format: 'currency',
    icon: 'currency-dollar',
    color: '#10b981',
    showTrend: true,
    trendValue: 12.5,
    trendDirection: 'up',
    target: 300000,
    previousValue: 253000,
    unit: 'USD',
    lastUpdated: new Date(),
    description: 'Total monthly recurring revenue'
  },
  {
    id: 'growth-kpi',
    title: 'Growth Rate',
    subtitle: 'Month over Month',
    value: 18.7,
    format: 'percentage',
    icon: 'trending-up',
    color: '#3b82f6',
    showTrend: true,
    trendValue: 3.2,
    trendDirection: 'up',
    target: 20,
    previousValue: 15.5,
    lastUpdated: new Date(),
    description: 'Monthly growth percentage'
  },
  {
    id: 'customers-kpi',
    title: 'Active Customers',
    subtitle: 'Total Count',
    value: 1247,
    format: 'number',
    icon: 'users',
    color: '#8b5cf6',
    showTrend: true,
    trendValue: 5.8,
    trendDirection: 'up',
    target: 1500,
    previousValue: 1178,
    lastUpdated: new Date(),
    description: 'Total active customer count'
  },
  {
    id: 'pipeline-kpi',
    title: 'Sales Pipeline',
    subtitle: 'Total Value',
    value: 892000,
    format: 'currency',
    icon: 'funnel',
    color: '#f59e0b',
    showTrend: true,
    trendValue: -2.1,
    trendDirection: 'down',
    target: 1000000,
    previousValue: 910000,
    unit: 'USD',
    lastUpdated: new Date(),
    description: 'Total pipeline opportunity value'
  },
  {
    id: 'conversion-kpi',
    title: 'Conversion Rate',
    subtitle: 'Lead to Customer',
    value: 23.4,
    format: 'percentage',
    icon: 'target',
    color: '#ef4444',
    showTrend: true,
    trendValue: 1.8,
    trendDirection: 'up',
    target: 25,
    previousValue: 21.6,
    lastUpdated: new Date(),
    description: 'Lead to customer conversion rate'
  },
  {
    id: 'deals-kpi',
    title: 'Active Deals',
    subtitle: 'In Progress',
    value: 47,
    format: 'number',
    icon: 'handshake',
    color: '#06b6d4',
    showTrend: true,
    trendValue: 8.0,
    trendDirection: 'up',
    target: 50,
    previousValue: 43,
    lastUpdated: new Date(),
    description: 'Number of deals in progress'
  },
  {
    id: 'quota-kpi',
    title: 'Quota Attainment',
    subtitle: 'This Quarter',
    value: 87.3,
    format: 'percentage',
    icon: 'chart-bar',
    color: '#84cc16',
    showTrend: true,
    trendValue: 5.2,
    trendDirection: 'up',
    target: 100,
    previousValue: 82.1,
    lastUpdated: new Date(),
    description: 'Sales quota achievement percentage'
  },
  {
    id: 'forecast-kpi',
    title: 'Revenue Forecast',
    subtitle: 'End of Quarter',
    value: 950000,
    format: 'currency',
    icon: 'crystal-ball',
    color: '#a855f7',
    showTrend: true,
    trendValue: 7.8,
    trendDirection: 'up',
    target: 1000000,
    previousValue: 880000,
    unit: 'USD',
    lastUpdated: new Date(),
    description: 'Projected end-of-quarter revenue'
  }
];

interface KPILayoutItem {
  id: string;
  kpiId: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  visible: boolean;
  customizations?: {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'compact' | 'detailed' | 'minimal';
    showDetails?: boolean;
  };
}

interface CustomDashboardLayout {
  id: string;
  name: string;
  description?: string;
  template: keyof typeof LAYOUT_TEMPLATES;
  kpiItems: KPILayoutItem[];
  gridSettings: {
    cols: { lg: number; md: number; sm: number; xs: number; xxs: number };
    rowHeight: number;
    margin: [number, number];
    containerPadding: [number, number];
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomKPILayoutDashboardProps {
  user: User;
  className?: string;
}

export function CustomKPILayoutDashboard({ user, className = '' }: CustomKPILayoutDashboardProps) {
  const [dashboardLayouts, setDashboardLayouts] = useKV<CustomDashboardLayout[]>('kpi-dashboard-layouts', []);
  const [currentLayoutId, setCurrentLayoutId] = useKV<string>('current-kpi-layout', '');
  const [availableKPIs, setAvailableKPIs] = useKV<PersonalizedKPIData[]>('available-kpis', SAMPLE_KPIS);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isKPIPickerOpen, setIsKPIPickerOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof LAYOUT_TEMPLATES>('sales-dashboard');
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutDescription, setNewLayoutDescription] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ itemId: string; itemName: string } | null>(null);

  const currentLayout = useMemo(() => {
    return dashboardLayouts.find(layout => layout.id === currentLayoutId) || 
           dashboardLayouts.find(layout => layout.isDefault);
  }, [dashboardLayouts, currentLayoutId]);

  const currentTemplate = currentLayout ? LAYOUT_TEMPLATES[currentLayout.template] : LAYOUT_TEMPLATES[selectedTemplate];

  // Initialize with default layout if none exists
  if (dashboardLayouts.length === 0) {
    const defaultLayout: CustomDashboardLayout = {
      id: 'default-sales-layout',
      name: 'Sales Dashboard',
      description: 'Default sales performance dashboard',
      template: 'sales-dashboard',
      kpiItems: [
        { id: 'item-1', kpiId: 'revenue-kpi', layout: { x: 0, y: 0, w: 3, h: 2 }, visible: true },
        { id: 'item-2', kpiId: 'growth-kpi', layout: { x: 3, y: 0, w: 3, h: 2 }, visible: true },
        { id: 'item-3', kpiId: 'conversion-kpi', layout: { x: 6, y: 0, w: 3, h: 2 }, visible: true },
        { id: 'item-4', kpiId: 'deals-kpi', layout: { x: 9, y: 0, w: 3, h: 2 }, visible: true },
        { id: 'item-5', kpiId: 'pipeline-kpi', layout: { x: 0, y: 2, w: 6, h: 3 }, visible: true },
        { id: 'item-6', kpiId: 'quota-kpi', layout: { x: 6, y: 2, w: 6, h: 3 }, visible: true },
      ],
      gridSettings: {
        cols: currentTemplate.grid,
        rowHeight: currentTemplate.rowHeight,
        margin: [16, 16],
        containerPadding: [0, 0],
      },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDashboardLayouts([defaultLayout]);
    setCurrentLayoutId(defaultLayout.id);
  }

  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!currentLayout || !isEditMode) return;

    const updatedKPIItems = currentLayout.kpiItems.map(item => {
      const layoutItem = newLayout.find(l => l.i === item.id);
      if (layoutItem) {
        return {
          ...item,
          layout: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          }
        };
      }
      return item;
    });

    const updatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      kpiItems: updatedKPIItems,
      updatedAt: new Date(),
    };

    setDashboardLayouts(current =>
      current.map(layout =>
        layout.id === currentLayout.id ? updatedLayout : layout
      )
    );
  }, [currentLayout, isEditMode, setDashboardLayouts]);

  const createNewLayout = useCallback(() => {
    if (!newLayoutName.trim()) {
      toast.error('Layout name is required');
      return;
    }

    const template = LAYOUT_TEMPLATES[selectedTemplate];
    const newLayout: CustomDashboardLayout = {
      id: `layout-${Date.now()}`,
      name: newLayoutName,
      description: newLayoutDescription,
      template: selectedTemplate,
      kpiItems: [],
      gridSettings: {
        cols: template.grid,
        rowHeight: template.rowHeight,
        margin: [16, 16],
        containerPadding: [0, 0],
      },
      isDefault: dashboardLayouts.length === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDashboardLayouts(current => [...current, newLayout]);
    setCurrentLayoutId(newLayout.id);
    setNewLayoutName('');
    setNewLayoutDescription('');
    setIsCreateDialogOpen(false);
    toast.success('Layout created successfully');
  }, [newLayoutName, newLayoutDescription, selectedTemplate, dashboardLayouts.length, setDashboardLayouts, setCurrentLayoutId]);

  const addKPIToLayout = useCallback((kpi: PersonalizedKPIData) => {
    if (!currentLayout) return;

    // Find next available position
    const maxY = currentLayout.kpiItems.reduce((max, item) => 
      Math.max(max, item.layout.y + item.layout.h), 0
    );

    const newItem: KPILayoutItem = {
      id: `item-${Date.now()}`,
      kpiId: kpi.id,
      layout: { x: 0, y: maxY, w: 3, h: 2 },
      visible: true,
      customizations: {
        size: 'md',
        variant: 'default',
        showDetails: true,
      }
    };

    const updatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      kpiItems: [...currentLayout.kpiItems, newItem],
      updatedAt: new Date(),
    };

    setDashboardLayouts(current =>
      current.map(layout =>
        layout.id === currentLayout.id ? updatedLayout : layout
      )
    );

    setIsKPIPickerOpen(false);
    toast.success(`Added "${kpi.title}" to layout`);
  }, [currentLayout, setDashboardLayouts]);

  const toggleWidgetVisibility = useCallback((itemId: string, visible: boolean) => {
    if (!currentLayout) return;

    const updatedKPIItems = currentLayout.kpiItems.map(item =>
      item.id === itemId ? { ...item, visible } : item
    );

    const updatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      kpiItems: updatedKPIItems,
      updatedAt: new Date(),
    };

    setDashboardLayouts(current =>
      current.map(layout =>
        layout.id === currentLayout.id ? updatedLayout : layout
      )
    );

    toast.success(`Widget ${visible ? 'shown' : 'hidden'}`);
  }, [currentLayout, setDashboardLayouts]);

  const confirmDeleteWidget = useCallback(() => {
    if (!deleteConfirmation || !currentLayout) return;

    const updatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      kpiItems: currentLayout.kpiItems.filter(item => item.id !== deleteConfirmation.itemId),
      updatedAt: new Date(),
    };

    setDashboardLayouts(current =>
      current.map(layout =>
        layout.id === currentLayout.id ? updatedLayout : layout
      )
    );

    toast.success(`"${deleteConfirmation.itemName}" removed from layout`);
    setDeleteConfirmation(null);
  }, [deleteConfirmation, currentLayout, setDashboardLayouts]);

  const requestDeleteWidget = useCallback((itemId: string, itemName: string) => {
    setDeleteConfirmation({ itemId, itemName });
  }, []);

  const removeKPIFromLayout = useCallback((itemId: string, itemName?: string) => {
    if (!currentLayout) return;

    const kpiItem = currentLayout.kpiItems.find(item => item.id === itemId);
    const kpiData = kpiItem ? availableKPIs.find(kpi => kpi.id === kpiItem.kpiId) : null;
    const displayName = itemName || kpiData?.title || 'KPI';

    // Show confirmation dialog for better UX
    requestDeleteWidget(itemId, displayName);
  }, [currentLayout, availableKPIs, requestDeleteWidget]);

  const resizeWidget = useCallback((itemId: string, sizeChange: 'increase' | 'decrease' | 'custom', customSize?: { w: number; h: number; minW?: number; minH?: number; maxW?: number; maxH?: number }) => {
    if (!currentLayout) return;

    const updatedKPIItems = currentLayout.kpiItems.map(item => {
      if (item.id === itemId) {
        let newWidth = item.layout.w;
        let newHeight = item.layout.h;

        if (sizeChange === 'custom' && customSize) {
          newWidth = customSize.w;
          newHeight = customSize.h;
        } else if (sizeChange === 'increase') {
          newWidth = Math.min(item.layout.w + 1, 12);
          newHeight = Math.min(item.layout.h + 1, 8);
        } else {
          newWidth = Math.max(item.layout.w - 1, 2);
          newHeight = Math.max(item.layout.h - 1, 1);
        }

        return {
          ...item,
          layout: {
            ...item.layout,
            w: newWidth,
            h: newHeight,
          }
        };
      }
      return item;
    });

    const updatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      kpiItems: updatedKPIItems,
      updatedAt: new Date(),
    };

    setDashboardLayouts(current =>
      current.map(layout =>
        layout.id === currentLayout.id ? updatedLayout : layout
      )
    );

    const actionText = sizeChange === 'custom' ? 'resized' : (sizeChange === 'increase' ? 'enlarged' : 'shrunk');
    toast.success(`Widget ${actionText}`);
  }, [currentLayout, setDashboardLayouts]);

  const duplicateLayout = useCallback(() => {
    if (!currentLayout) return;

    const duplicatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      id: `layout-${Date.now()}`,
      name: `${currentLayout.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDashboardLayouts(current => [...current, duplicatedLayout]);
    setCurrentLayoutId(duplicatedLayout.id);
    toast.success('Layout duplicated successfully');
  }, [currentLayout, setDashboardLayouts, setCurrentLayoutId]);

  const resetLayoutToTemplate = useCallback(() => {
    if (!currentLayout) return;

    const template = LAYOUT_TEMPLATES[currentLayout.template];
    const templateLayouts = Object.entries(template.layouts);

    const resetItems: KPILayoutItem[] = templateLayouts.map(([key, layout], index) => ({
      id: `item-${Date.now()}-${index}`,
      kpiId: availableKPIs[index % availableKPIs.length]?.id || 'revenue-kpi',
      layout,
      visible: true,
      customizations: {
        size: 'md',
        variant: 'default',
        showDetails: true,
      }
    }));

    const updatedLayout: CustomDashboardLayout = {
      ...currentLayout,
      kpiItems: resetItems,
      gridSettings: {
        cols: template.grid,
        rowHeight: template.rowHeight,
        margin: [16, 16],
        containerPadding: [0, 0],
      },
      updatedAt: new Date(),
    };

    setDashboardLayouts(current =>
      current.map(layout =>
        layout.id === currentLayout.id ? updatedLayout : layout
      )
    );

    toast.success('Layout reset to template');
  }, [currentLayout, availableKPIs, setDashboardLayouts]);

  if (!currentLayout) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="text-center py-12">
            <LayoutIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Custom KPI Layout Found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first custom KPI dashboard layout to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create KPI Layout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gridLayout = currentLayout.kpiItems.map(item => ({
    i: item.id,
    x: item.layout.x,
    y: item.layout.y,
    w: item.layout.w,
    h: item.layout.h,
    minW: 2,
    minH: 1,
    maxW: 12,
    maxH: 8,
    isResizable: isEditMode,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {currentLayout.name}
            </h2>
            {currentLayout.description && (
              <p className="text-muted-foreground">{currentLayout.description}</p>
            )}
          </div>
          
          {dashboardLayouts.length > 1 && (
            <Select value={currentLayoutId} onValueChange={setCurrentLayoutId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dashboardLayouts.map(layout => (
                  <SelectItem key={layout.id} value={layout.id}>
                    <div className="flex items-center gap-2">
                      {LAYOUT_TEMPLATES[layout.template].icon}
                      {layout.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Badge variant="outline" className="flex items-center gap-1">
            {LAYOUT_TEMPLATES[currentLayout.template].icon}
            {LAYOUT_TEMPLATES[currentLayout.template].name}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Template Picker Dialog */}
          <Dialog open={isTemplatePickerOpen} onOpenChange={setIsTemplatePickerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <LayoutIcon className="h-4 w-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Choose Layout Template</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => (
                  <Card 
                    key={key} 
                    className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                      selectedTemplate === key ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTemplate(key as keyof typeof LAYOUT_TEMPLATES)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        {template.icon}
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                      <div className="text-xs space-y-1">
                        <div>Grid: {template.grid.lg} columns</div>
                        <div>Row Height: {template.rowHeight}px</div>
                        <div>Positions: {Object.keys(template.layouts).length}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsTemplatePickerOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  resetLayoutToTemplate();
                  setIsTemplatePickerOpen(false);
                }}>
                  Apply Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* KPI Picker Dialog */}
          <Dialog open={isKPIPickerOpen} onOpenChange={setIsKPIPickerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add KPI to Layout</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {availableKPIs.map(kpi => {
                  const isAlreadyAdded = currentLayout.kpiItems.some(item => item.kpiId === kpi.id);
                  return (
                    <div key={kpi.id} className="relative">
                      <PersonalizedKPICard
                        data={kpi}
                        size="sm"
                        className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                          isAlreadyAdded ? 'opacity-50' : ''
                        }`}
                        onClick={() => !isAlreadyAdded && addKPIToLayout(kpi)}
                      />
                      {isAlreadyAdded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                          <Badge variant="secondary">Already Added</Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Layout Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Layout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom KPI Layout</DialogTitle>
              </DialogHeader>
              <Tabs value="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="template">Choose Template</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="layout-name">Layout Name</Label>
                    <Input
                      id="layout-name"
                      value={newLayoutName}
                      onChange={(e) => setNewLayoutName(e.target.value)}
                      placeholder="Enter layout name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="layout-description">Description (Optional)</Label>
                    <Textarea
                      id="layout-description"
                      value={newLayoutDescription}
                      onChange={(e) => setNewLayoutDescription(e.target.value)}
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="template" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(LAYOUT_TEMPLATES).map(([key, template]) => (
                      <Card 
                        key={key} 
                        className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${
                          selectedTemplate === key ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTemplate(key as keyof typeof LAYOUT_TEMPLATES)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            {template.icon}
                            {template.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewLayout}>Create Layout</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditMode ? 'Preview' : 'Edit'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={duplicateLayout}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Mode Controls */}
      {isEditMode && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Edit Mode Active</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    Drag to move • Resize handles • Click gear to configure
                  </Badge>
                  <div>Grid: {currentLayout.gridSettings.cols.lg} cols</div>
                  <div>Row Height: {currentLayout.gridSettings.rowHeight}px</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={resetLayoutToTemplate}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Template
                </Button>
                <Button size="sm" onClick={() => toast.success('Layout saved automatically')}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {currentLayout.kpiItems.length}
            </div>
            <div className="text-sm text-muted-foreground">Active KPIs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentLayout.gridSettings.cols.lg}
            </div>
            <div className="text-sm text-muted-foreground">Grid Columns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentLayout.gridSettings.rowHeight}px
            </div>
            <div className="text-sm text-muted-foreground">Row Height</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {availableKPIs.length}
            </div>
            <div className="text-sm text-muted-foreground">Available KPIs</div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Grid */}
      {currentLayout.kpiItems.length > 0 ? (
        <div className="min-h-[600px]">
          <ResponsiveGridLayout
            className="layout"
            layouts={{
              lg: gridLayout,
              md: gridLayout,
              sm: gridLayout,
              xs: gridLayout,
              xxs: gridLayout,
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={currentLayout.gridSettings.cols}
            rowHeight={currentLayout.gridSettings.rowHeight}
            onLayoutChange={handleLayoutChange}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            margin={currentLayout.gridSettings.margin}
            containerPadding={currentLayout.gridSettings.containerPadding}
            useCSSTransforms={true}
            preventCollision={false}
            autoSize={true}
            draggableHandle=".drag-handle"
          >
            {currentLayout.kpiItems.filter(item => item.visible).map(item => {
              const kpiData = availableKPIs.find(kpi => kpi.id === item.kpiId);
              if (!kpiData) return null;

              return (
                <div key={item.id} className="relative group">
                  <Card className={`h-full transition-all duration-200 relative overflow-hidden ${
                    isEditMode 
                      ? 'ring-2 ring-transparent hover:ring-primary/50 cursor-move group' 
                      : 'hover:shadow-lg'
                  } ${!item.visible ? 'opacity-50' : ''}`}>
                    {isEditMode && (
                      <>
                        {/* Widget Controls Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[5]" />
                        
                        {/* Top Controls */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <WidgetResizeControls
                            itemId={item.id}
                            itemName={kpiData?.title || 'Widget'}
                            currentSize={{
                              w: item.layout.w,
                              h: item.layout.h,
                              minW: 2,
                              minH: 1,
                              maxW: 12,
                              maxH: 8
                            }}
                            visible={item.visible}
                            onResize={resizeWidget}
                            onDelete={removeKPIFromLayout}
                            onVisibilityToggle={toggleWidgetVisibility}
                          />
                        </div>

                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <WidgetDragHandle />
                        </div>

                        {/* Size Indicator */}
                        <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <WidgetInfoBadge 
                            width={item.layout.w} 
                            height={item.layout.h} 
                          />
                        </div>

                        {/* Enhanced Resize Handle */}
                        <div className="absolute bottom-0 right-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-full h-full bg-gradient-to-tl from-primary/30 to-transparent rounded-tl-lg flex items-center justify-center">
                            <div className="w-3 h-3 border-r-2 border-b-2 border-primary/80 transform rotate-45" />
                          </div>
                        </div>

                        {/* Visibility Indicator */}
                        {!item.visible && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[6]">
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                              <EyeSlash className="h-3 w-3 mr-1" />
                              Hidden
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                    <PersonalizedKPICard
                      data={kpiData}
                      size={item.customizations?.size || 'md'}
                      variant={item.customizations?.variant || 'default'}
                      className="h-full border-0 shadow-none"
                    />
                  </Card>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </div>
      ) : (
        <Card className="h-80">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KPIs in Layout</h3>
              <p className="text-muted-foreground mb-4">
                Add KPIs to your custom dashboard layout to get started
              </p>
              <Button onClick={() => setIsKPIPickerOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First KPI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmation} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warning className="h-5 w-5 text-destructive" />
              Remove Widget
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to remove "{deleteConfirmation?.itemName}" from your dashboard layout?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone, but you can always add the widget back later.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteWidget}
            >
              <Trash className="h-4 w-4 mr-2" />
              Remove Widget
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}