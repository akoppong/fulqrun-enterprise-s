import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  BarChart3, 
  LineChart,
  PieChart,
  Activity,
  Zap,
  Settings
} from '@phosphor-icons/react';

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Orange', value: '#f97316' },
];

const REFRESH_INTERVALS = [
  { name: '5 seconds', value: 5 },
  { name: '10 seconds', value: 10 },
  { name: '30 seconds', value: 30 },
  { name: '1 minute', value: 60 },
  { name: '5 minutes', value: 300 },
  { name: 'Manual', value: 0 },
];

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  description?: string;
  config?: {
    chartType?: 'bar' | 'line' | 'pie' | 'area' | 'gauge';
    color?: string;
    refreshRate?: number;
    showGrid?: boolean;
    animated?: boolean;
  };
}

interface WidgetConfigDialogProps {
  widget: DashboardWidget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedWidget: DashboardWidget) => void;
}

export function WidgetConfigDialog({ 
  widget, 
  isOpen, 
  onClose, 
  onSave 
}: WidgetConfigDialogProps) {
  const [config, setConfig] = useState(widget?.config || {});
  const [title, setTitle] = useState(widget?.title || '');
  const [description, setDescription] = useState(widget?.description || '');

  if (!widget) return null;

  const handleSave = () => {
    const updatedWidget: DashboardWidget = {
      ...widget,
      title,
      description,
      config: {
        ...widget.config,
        ...config,
      },
    };
    onSave(updatedWidget);
    onClose();
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Widget: {widget.title}
          </DialogTitle>
          <DialogDescription>
            Customize the appearance, data source, and behavior of your dashboard widget
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="data">Data & Refresh</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="widget-title">Widget Title</Label>
                <Input
                  id="widget-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter widget title"
                />
              </div>

              <div>
                <Label htmlFor="widget-description">Description (Optional)</Label>
                <Input
                  id="widget-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter widget description"
                />
              </div>

              <div>
                <Label>Widget Type</Label>
                <div className="mt-2">
                  <Badge variant="outline">{widget.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Widget type cannot be changed after creation
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-6">
              {/* Chart Type Selection (for chart widgets) */}
              {widget.type === 'chart' && (
                <div>
                  <Label>Chart Type</Label>
                  <Select 
                    value={config.chartType || 'bar'} 
                    onValueChange={(value) => updateConfig('chartType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Bar Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="line">
                        <div className="flex items-center gap-2">
                          <LineChart className="h-4 w-4" />
                          Line Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="area">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Area Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="pie">
                        <div className="flex items-center gap-2">
                          <PieChart className="h-4 w-4" />
                          Pie Chart
                        </div>
                      </SelectItem>
                      <SelectItem value="gauge">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Gauge
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              <div>
                <Label className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color Theme
                </Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLOR_PRESETS.map((color) => (
                    <Button
                      key={color.value}
                      variant={config.color === color.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateConfig('color', color.value)}
                      className="justify-start"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Visual Options */}
              {widget.type === 'chart' && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-grid">Show Grid</Label>
                      <Switch
                        id="show-grid"
                        checked={config.showGrid !== false}
                        onCheckedChange={(checked) => updateConfig('showGrid', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="animated">Animated</Label>
                      <Switch
                        id="animated"
                        checked={config.animated !== false}
                        onCheckedChange={(checked) => updateConfig('animated', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Auto Refresh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="refresh-rate">Refresh Interval</Label>
                      <Select 
                        value={String(config.refreshRate || 30)} 
                        onValueChange={(value) => updateConfig('refreshRate', Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REFRESH_INTERVALS.map((interval) => (
                            <SelectItem key={interval.value} value={String(interval.value)}>
                              <div className="flex items-center gap-2">
                                {interval.value > 0 && <Zap className="h-4 w-4" />}
                                {interval.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        How often the widget data should refresh automatically
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Data Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Data source configuration will be available in a future update. 
                    Currently using sample data for demonstration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}