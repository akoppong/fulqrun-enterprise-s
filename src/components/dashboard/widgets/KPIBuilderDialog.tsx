import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
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
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Eye,
  Palette,
  Settings
} from '@phosphor-icons/react';
import { PersonalizedKPIData, PersonalizedKPICard, KPI_TEMPLATES } from './PersonalizedKPICard';
import { toast } from 'sonner';

const ICON_OPTIONS = [
  { name: 'Target', value: 'target', icon: Target },
  { name: 'Dollar', value: 'dollar', icon: DollarSign },
  { name: 'Users', value: 'users', icon: Users },
  { name: 'Activity', value: 'activity', icon: Activity },
  { name: 'Calendar', value: 'calendar', icon: Calendar },
  { name: 'Award', value: 'award', icon: Award },
  { name: 'Building', value: 'building', icon: Building },
  { name: 'Phone', value: 'phone', icon: Phone },
  { name: 'Mail', value: 'mail', icon: Mail },
  { name: 'Check', value: 'check', icon: CheckCircle },
  { name: 'Alert', value: 'alert', icon: AlertTriangle },
  { name: 'Clock', value: 'clock', icon: Clock },
  { name: 'Chart', value: 'chart', icon: BarChart3 },
  { name: 'Zap', value: 'zap', icon: Zap },
  { name: 'Star', value: 'star', icon: Star },
  { name: 'Heart', value: 'heart', icon: Heart },
  { name: 'Shield', value: 'shield', icon: Shield },
];

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Gray', value: '#6b7280' },
];

const FORMAT_OPTIONS = [
  { name: 'Number', value: 'number', example: '1,234' },
  { name: 'Currency', value: 'currency', example: '$1,234' },
  { name: 'Percentage', value: 'percentage', example: '12.34%' },
  { name: 'Duration', value: 'duration', example: '2h 15m' },
  { name: 'Custom', value: 'custom', example: 'Custom format' },
];

const STATUS_OPTIONS = [
  { name: 'Neutral', value: 'neutral' },
  { name: 'Success', value: 'success' },
  { name: 'Warning', value: 'warning' },
  { name: 'Danger', value: 'danger' },
  { name: 'Info', value: 'info' },
];

interface CustomField {
  label: string;
  value: string;
  icon: string;
}

interface Alert {
  threshold: number;
  type: 'above' | 'below';
  message: string;
}

interface KPIBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kpiData: PersonalizedKPIData) => void;
  editingKPI?: PersonalizedKPIData | null;
}

export function KPIBuilderDialog({ isOpen, onClose, onSave, editingKPI }: KPIBuilderDialogProps) {
  // Basic settings
  const [title, setTitle] = useState(editingKPI?.title || '');
  const [subtitle, setSubtitle] = useState(editingKPI?.subtitle || '');
  const [value, setValue] = useState(String(editingKPI?.value || '0'));
  const [previousValue, setPreviousValue] = useState(String(editingKPI?.previousValue || ''));
  const [target, setTarget] = useState(String(editingKPI?.target || ''));
  const [unit, setUnit] = useState(editingKPI?.unit || '');
  const [prefix, setPrefix] = useState(editingKPI?.prefix || '');
  const [suffix, setSuffix] = useState(editingKPI?.suffix || '');

  // Format and display
  const [format, setFormat] = useState(editingKPI?.format || 'number');
  const [icon, setIcon] = useState(editingKPI?.icon || 'target');
  const [color, setColor] = useState(editingKPI?.color || '#3b82f6');
  const [status, setStatus] = useState(editingKPI?.status || 'neutral');

  // Features
  const [showTrend, setShowTrend] = useState(editingKPI?.showTrend || false);
  const [showProgress, setShowProgress] = useState(editingKPI?.showProgress || false);
  const [showSparkline, setShowSparkline] = useState(editingKPI?.showSparkline || false);

  // Trend data
  const [trend, setTrend] = useState(editingKPI?.trend || 'neutral');
  const [trendValue, setTrendValue] = useState(editingKPI?.trendValue || '');
  const [trendLabel, setTrendLabel] = useState(editingKPI?.trendLabel || '');

  // Progress data
  const [progress, setProgress] = useState(String(editingKPI?.progress || '0'));

  // Custom fields
  const [customFields, setCustomFields] = useState<CustomField[]>(
    editingKPI?.customFields || []
  );

  // Alerts
  const [alerts, setAlerts] = useState<Alert[]>(editingKPI?.alerts || []);

  // Preview data
  const [activeTab, setActiveTab] = useState('basic');

  const generatePreviewData = (): PersonalizedKPIData => {
    const numValue = parseFloat(value) || 0;
    const numPreviousValue = previousValue ? parseFloat(previousValue) : undefined;
    const numTarget = target ? parseFloat(target) : undefined;
    const numProgress = showProgress ? parseFloat(progress) : undefined;

    return {
      id: editingKPI?.id || `kpi-${Date.now()}`,
      title,
      subtitle: subtitle || undefined,
      value: numValue,
      previousValue: numPreviousValue,
      target: numTarget,
      unit: unit || undefined,
      prefix: prefix || undefined,
      suffix: suffix || undefined,
      trend: showTrend ? trend as any : undefined,
      trendValue: showTrend && trendValue ? trendValue : undefined,
      trendLabel: showTrend && trendLabel ? trendLabel : undefined,
      progress: numProgress,
      status: status as any,
      icon,
      color,
      showProgress,
      showTrend,
      showSparkline,
      format: format as any,
      customFields: customFields.length > 0 ? customFields : undefined,
      alerts: alerts.length > 0 ? alerts : undefined,
      lastUpdated: new Date(),
      sparklineData: showSparkline ? [
        numValue * 0.7, numValue * 0.8, numValue * 0.85, 
        numValue * 0.9, numValue * 0.95, numValue
      ] : undefined,
    };
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('KPI title is required');
      return;
    }

    if (!value.trim() || isNaN(parseFloat(value))) {
      toast.error('Valid KPI value is required');
      return;
    }

    const kpiData = generatePreviewData();
    onSave(kpiData);
    handleClose();
    toast.success(editingKPI ? 'KPI updated successfully' : 'KPI created successfully');
  };

  const handleClose = () => {
    // Reset form
    setTitle('');
    setSubtitle('');
    setValue('0');
    setPreviousValue('');
    setTarget('');
    setUnit('');
    setPrefix('');
    setSuffix('');
    setFormat('number');
    setIcon('target');
    setColor('#3b82f6');
    setStatus('neutral');
    setShowTrend(false);
    setShowProgress(false);
    setShowSparkline(false);
    setTrend('neutral');
    setTrendValue('');
    setTrendLabel('');
    setProgress('0');
    setCustomFields([]);
    setAlerts([]);
    setActiveTab('basic');
    
    onClose();
  };

  const applyTemplate = (templateKey: keyof typeof KPI_TEMPLATES) => {
    const template = KPI_TEMPLATES[templateKey];
    setTitle(template.title);
    setFormat(template.format);
    setIcon(template.icon);
    setColor(template.color);
    setShowTrend(template.showTrend);
    setShowProgress(template.showProgress || false);
    if (template.suffix) setSuffix(template.suffix);
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { label: '', value: '', icon: 'check' }]);
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    setCustomFields(prev => prev.map((f, i) => i === index ? { ...f, ...field } : f));
  };

  const removeCustomField = (index: number) => {
    setCustomFields(prev => prev.filter((_, i) => i !== index));
  };

  const addAlert = () => {
    setAlerts(prev => [...prev, { threshold: 0, type: 'below', message: '' }]);
  };

  const updateAlert = (index: number, alert: Partial<Alert>) => {
    setAlerts(prev => prev.map((a, i) => i === index ? { ...a, ...alert } : a));
  };

  const removeAlert = (index: number) => {
    setAlerts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {editingKPI ? 'Edit KPI Card' : 'Create Custom KPI Card'}
          </DialogTitle>
          <DialogDescription>
            {editingKPI 
              ? 'Modify the configuration and appearance of your KPI card'
              : 'Design and configure a custom KPI card with personalized metrics and styling'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div className="flex gap-2">
              {Object.entries(KPI_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(key as keyof typeof KPI_TEMPLATES)}
                  className="text-xs"
                >
                  {template.title}
                </Button>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kpi-title">Title *</Label>
                    <Input
                      id="kpi-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter KPI title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-subtitle">Subtitle</Label>
                    <Input
                      id="kpi-subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Optional subtitle"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kpi-value">Current Value *</Label>
                    <Input
                      id="kpi-value"
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter current value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-target">Target Value</Label>
                    <Input
                      id="kpi-target"
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      placeholder="Target value (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="kpi-prefix">Prefix</Label>
                    <Input
                      id="kpi-prefix"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="$ or +"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-suffix">Suffix</Label>
                    <Input
                      id="kpi-suffix"
                      value={suffix}
                      onChange={(e) => setSuffix(e.target.value)}
                      placeholder="% or /10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kpi-unit">Unit</Label>
                    <Input
                      id="kpi-unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="hrs, days, etc"
                    />
                  </div>
                </div>

                <div>
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">{option.example}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="display" className="space-y-4">
                <div>
                  <Label>Icon</Label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color
                  </Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {COLOR_PRESETS.map((colorPreset) => (
                      <Button
                        key={colorPreset.value}
                        variant={color === colorPreset.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setColor(colorPreset.value)}
                        className="justify-start"
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: colorPreset.value }}
                        />
                        {colorPreset.name}
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Display Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-trend">Show Trend</Label>
                        <p className="text-xs text-muted-foreground">Display trend comparison</p>
                      </div>
                      <Switch
                        id="show-trend"
                        checked={showTrend}
                        onCheckedChange={setShowTrend}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-progress">Show Progress Bar</Label>
                        <p className="text-xs text-muted-foreground">Display progress towards target</p>
                      </div>
                      <Switch
                        id="show-progress"
                        checked={showProgress}
                        onCheckedChange={setShowProgress}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show-sparkline">Show Sparkline</Label>
                        <p className="text-xs text-muted-foreground">Mini trend chart</p>
                      </div>
                      <Switch
                        id="show-sparkline"
                        checked={showSparkline}
                        onCheckedChange={setShowSparkline}
                      />
                    </div>
                  </CardContent>
                </Card>

                {showTrend && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Trend Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Trend Direction</Label>
                        <Select value={trend} onValueChange={setTrend}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="up">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                Trending Up
                              </div>
                            </SelectItem>
                            <SelectItem value="down">
                              <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                Trending Down
                              </div>
                            </SelectItem>
                            <SelectItem value="neutral">
                              <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-muted-foreground" />
                                Neutral
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="trend-value">Trend Value</Label>
                          <Input
                            id="trend-value"
                            value={trendValue}
                            onChange={(e) => setTrendValue(e.target.value)}
                            placeholder="+12.3%"
                          />
                        </div>
                        <div>
                          <Label htmlFor="trend-label">Comparison Period</Label>
                          <Input
                            id="trend-label"
                            value={trendLabel}
                            onChange={(e) => setTrendLabel(e.target.value)}
                            placeholder="vs last month"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="previous-value">Previous Value</Label>
                        <Input
                          id="previous-value"
                          type="number"
                          value={previousValue}
                          onChange={(e) => setPreviousValue(e.target.value)}
                          placeholder="Previous period value"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {showProgress && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Progress Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="progress-value">Progress Percentage</Label>
                        <Input
                          id="progress-value"
                          type="number"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) => setProgress(e.target.value)}
                          placeholder="0-100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Progress towards target (0-100%)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Custom Fields</CardTitle>
                      <Button size="sm" onClick={addCustomField}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {customFields.length > 0 ? (
                      <div className="space-y-4">
                        {customFields.map((field, index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <div>
                                <Label>Label</Label>
                                <Input
                                  value={field.label}
                                  onChange={(e) => updateCustomField(index, { label: e.target.value })}
                                  placeholder="Field name"
                                />
                              </div>
                              <div>
                                <Label>Value</Label>
                                <Input
                                  value={field.value}
                                  onChange={(e) => updateCustomField(index, { value: e.target.value })}
                                  placeholder="Field value"
                                />
                              </div>
                              <div>
                                <Label>Icon</Label>
                                <Select 
                                  value={field.icon} 
                                  onValueChange={(value) => updateCustomField(index, { icon: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ICON_OPTIONS.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                          <option.icon className="h-4 w-4" />
                                          {option.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomField(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No custom fields added
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Alert Rules</CardTitle>
                      <Button size="sm" onClick={addAlert}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Alert
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {alerts.length > 0 ? (
                      <div className="space-y-4">
                        {alerts.map((alert, index) => (
                          <div key={index} className="flex gap-2 items-end">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <div>
                                <Label>Condition</Label>
                                <Select 
                                  value={alert.type} 
                                  onValueChange={(value: 'above' | 'below') => updateAlert(index, { type: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="above">Above threshold</SelectItem>
                                    <SelectItem value="below">Below threshold</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Threshold</Label>
                                <Input
                                  type="number"
                                  value={alert.threshold}
                                  onChange={(e) => updateAlert(index, { threshold: parseFloat(e.target.value) || 0 })}
                                  placeholder="Alert threshold"
                                />
                              </div>
                              <div>
                                <Label>Message</Label>
                                <Input
                                  value={alert.message}
                                  onChange={(e) => updateAlert(index, { message: e.target.value })}
                                  placeholder="Alert message"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAlert(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No alert rules configured
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <Label className="text-sm font-medium">Live Preview</Label>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Default Size</Label>
                <PersonalizedKPICard data={generatePreviewData()} />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Compact Variant</Label>
                <PersonalizedKPICard 
                  data={generatePreviewData()} 
                  variant="compact"
                  size="sm"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Minimal Variant</Label>
                <PersonalizedKPICard 
                  data={generatePreviewData()} 
                  variant="minimal"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingKPI ? 'Update KPI' : 'Create KPI'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}