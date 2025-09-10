import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Palette,
  Eye,
  Settings,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Save,
  X,
  RefreshCw,
} from '@phosphor-icons/react';
import { PersonalizedKPIData, PersonalizedKPICard, KPI_TEMPLATES } from './widgets/PersonalizedKPICard';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

// Color palette for KPI customization
const COLOR_PALETTE = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
  '#84cc16', '#ec4899', '#f97316', '#6366f1', '#14b8a6', '#eab308',
  '#64748b', '#71717a', '#374151', '#1f2937'
];

// Gradient options
const GRADIENT_OPTIONS = [
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Aurora', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
];

// Available icons
const ICON_OPTIONS = [
  { value: 'target', label: 'Target' },
  { value: 'dollar', label: 'Dollar' },
  { value: 'users', label: 'Users' },
  { value: 'activity', label: 'Activity' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'award', label: 'Award' },
  { value: 'building', label: 'Building' },
  { value: 'phone', label: 'Phone' },
  { value: 'mail', label: 'Mail' },
  { value: 'check', label: 'Check' },
  { value: 'alert', label: 'Alert' },
  { value: 'clock', label: 'Clock' },
  { value: 'chart', label: 'Chart' },
  { value: 'zap', label: 'Zap' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'shield', label: 'Shield' },
];

interface PersonalizedKPIManagerProps {
  onKPIUpdate?: (kpis: PersonalizedKPIData[]) => void;
}

export function PersonalizedKPIManager({ onKPIUpdate }: PersonalizedKPIManagerProps) {
  const [kpis, setKpis] = useKV<PersonalizedKPIData[]>('personalized-kpis', []);
  const [selectedKPI, setSelectedKPI] = useState<PersonalizedKPIData | null>(null);
  const [editingKPI, setEditingKPI] = useState<PersonalizedKPIData | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [previewKPI, setPreviewKPI] = useState<PersonalizedKPIData | null>(null);

  // Form state for KPI editing
  const [formData, setFormData] = useState<Partial<PersonalizedKPIData>>({});

  useEffect(() => {
    if (onKPIUpdate) {
      onKPIUpdate(kpis);
    }
  }, [kpis, onKPIUpdate]);

  // Initialize with sample KPIs if empty
  useEffect(() => {
    if (kpis.length === 0) {
      const sampleKPIs: PersonalizedKPIData[] = [
        {
          id: 'revenue-kpi',
          title: 'Monthly Revenue',
          subtitle: 'Total revenue this month',
          value: 145200,
          target: 180000,
          format: 'currency',
          trend: 'up',
          trendValue: '+12.5%',
          trendLabel: 'vs last month',
          progress: 81,
          status: 'success',
          icon: 'dollar',
          color: '#10b981',
          showProgress: true,
          showTrend: true,
          showSparkline: true,
          sparklineData: [120000, 128000, 132000, 138000, 142000, 145200],
          lastUpdated: new Date(),
        },
        {
          id: 'deals-kpi',
          title: 'Active Deals',
          value: 34,
          previousValue: 28,
          trend: 'up',
          trendValue: '+6',
          trendLabel: 'new this week',
          status: 'info',
          icon: 'target',
          color: '#3b82f6',
          showTrend: true,
          customFields: [
            { label: 'Qualified', value: '22', icon: 'check' },
            { label: 'In Review', value: '12', icon: 'clock' },
          ],
          lastUpdated: new Date(),
        },
      ];
      setKpis(sampleKPIs);
    }
  }, [kpis, setKpis]);

  const handleCreateKPI = () => {
    const newKPI: PersonalizedKPIData = {
      id: `kpi-${Date.now()}`,
      title: 'New KPI',
      value: 0,
      format: 'number',
      icon: 'target',
      color: '#3b82f6',
      showTrend: false,
      showProgress: false,
      showSparkline: false,
      lastUpdated: new Date(),
      ...formData,
    };

    setKpis((prev) => [...prev, newKPI]);
    setFormData({});
    setIsCreateDialogOpen(false);
    toast.success('KPI created successfully');
  };

  const handleUpdateKPI = () => {
    if (!editingKPI) return;

    setKpis((prev) =>
      prev.map((kpi) =>
        kpi.id === editingKPI.id
          ? { ...editingKPI, ...formData, lastUpdated: new Date() }
          : kpi
      )
    );

    setEditingKPI(null);
    setFormData({});
    toast.success('KPI updated successfully');
  };

  const handleDeleteKPI = (kpiId: string) => {
    setKpis((prev) => prev.filter((kpi) => kpi.id !== kpiId));
    toast.success('KPI deleted successfully');
  };

  const handleDuplicateKPI = (kpi: PersonalizedKPIData) => {
    const duplicatedKPI: PersonalizedKPIData = {
      ...kpi,
      id: `kpi-${Date.now()}`,
      title: `${kpi.title} (Copy)`,
      lastUpdated: new Date(),
    };

    setKpis((prev) => [...prev, duplicatedKPI]);
    toast.success('KPI duplicated successfully');
  };

  const handleApplyTemplate = (templateKey: keyof typeof KPI_TEMPLATES) => {
    const template = KPI_TEMPLATES[templateKey];
    setFormData((prev) => ({
      ...prev,
      ...template,
      id: prev.id || `kpi-${Date.now()}`,
    }));
  };

  const handleExportKPIs = () => {
    const dataStr = JSON.stringify(kpis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personalized-kpis.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportKPIs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedKPIs = JSON.parse(e.target?.result as string);
        setKpis(importedKPIs);
        toast.success('KPIs imported successfully');
      } catch (error) {
        toast.error('Failed to import KPIs. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const renderKPIForm = () => (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="styling">Styling</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter KPI title"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter subtitle (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={formData.value || ''}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                value={formData.target || ''}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
                placeholder="Target value"
              />
            </div>
            <div>
              <Label htmlFor="format">Format</Label>
              <Select
                value={formData.format || 'number'}
                onValueChange={(value) => setFormData({ ...formData, format: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={formData.prefix || ''}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                placeholder="e.g., $"
              />
            </div>
            <div>
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                value={formData.suffix || ''}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                placeholder="e.g., %"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., USD"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="styling" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Select
              value={formData.icon || 'target'}
              onValueChange={(value) => setFormData({ ...formData, icon: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICON_OPTIONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-primary' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Background Style</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                variant={!formData.backgroundColor?.includes('gradient') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, backgroundColor: '#ffffff' })}
              >
                Solid Color
              </Button>
              <Button
                variant={formData.backgroundColor?.includes('gradient') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, backgroundColor: GRADIENT_OPTIONS[0].value })}
              >
                Gradient
              </Button>
            </div>
            
            {formData.backgroundColor?.includes('gradient') && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {GRADIENT_OPTIONS.map((gradient) => (
                  <button
                    key={gradient.name}
                    className={`h-8 rounded border-2 ${
                      formData.backgroundColor === gradient.value ? 'border-primary' : 'border-border'
                    }`}
                    style={{ background: gradient.value }}
                    onClick={() => setFormData({ ...formData, backgroundColor: gradient.value })}
                  >
                    <span className="text-xs text-white font-medium">{gradient.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status Badge</Label>
            <Select
              value={formData.status || 'neutral'}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">None</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="danger">Danger</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 mt-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.showTrend || false}
              onCheckedChange={(checked) => setFormData({ ...formData, showTrend: checked })}
            />
            <Label>Show Trend</Label>
          </div>

          {formData.showTrend && (
            <div className="space-y-4 pl-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trendValue">Trend Value</Label>
                  <Input
                    id="trendValue"
                    value={formData.trendValue || ''}
                    onChange={(e) => setFormData({ ...formData, trendValue: e.target.value })}
                    placeholder="+12.5%"
                  />
                </div>
                <div>
                  <Label htmlFor="trendLabel">Trend Label</Label>
                  <Input
                    id="trendLabel"
                    value={formData.trendLabel || ''}
                    onChange={(e) => setFormData({ ...formData, trendLabel: e.target.value })}
                    placeholder="vs last month"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="trend">Trend Direction</Label>
                <Select
                  value={formData.trend || 'neutral'}
                  onValueChange={(value) => setFormData({ ...formData, trend: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Up</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.showProgress || false}
              onCheckedChange={(checked) => setFormData({ ...formData, showProgress: checked })}
            />
            <Label>Show Progress Bar</Label>
          </div>

          {formData.showProgress && (
            <div className="pl-6">
              <Label>Progress ({formData.progress || 0}%)</Label>
              <Slider
                value={[formData.progress || 0]}
                onValueChange={([value]) => setFormData({ ...formData, progress: value })}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.showSparkline || false}
              onCheckedChange={(checked) => setFormData({ ...formData, showSparkline: checked })}
            />
            <Label>Show Sparkline</Label>
          </div>

          {formData.showSparkline && (
            <div className="pl-6">
              <Label>Sparkline Data (comma-separated)</Label>
              <Input
                value={formData.sparklineData?.join(', ') || ''}
                onChange={(e) => {
                  const values = e.target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
                  setFormData({ ...formData, sparklineData: values });
                }}
                placeholder="10, 20, 15, 30, 25, 35"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <div>
            <Label>Custom Fields</Label>
            <div className="space-y-2 mt-2">
              {(formData.customFields || []).map((field, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => {
                        const fields = [...(formData.customFields || [])];
                        fields[index] = { ...field, label: e.target.value };
                        setFormData({ ...formData, customFields: fields });
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => {
                        const fields = [...(formData.customFields || [])];
                        fields[index] = { ...field, value: e.target.value };
                        setFormData({ ...formData, customFields: fields });
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const fields = [...(formData.customFields || [])];
                      fields.splice(index, 1);
                      setFormData({ ...formData, customFields: fields });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fields = [...(formData.customFields || []), { label: '', value: '', icon: 'target' }];
                  setFormData({ ...formData, customFields: fields });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <Label>Templates</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(KPI_TEMPLATES).map(([key, template]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTemplate(key as keyof typeof KPI_TEMPLATES)}
                >
                  {template.title}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Live Preview */}
      {(formData.title || editingKPI) && (
        <div>
          <Label>Preview</Label>
          <div className="mt-2 max-w-sm">
            <PersonalizedKPICard
              data={{
                id: 'preview',
                title: 'Sample Title',
                value: 1234,
                format: 'number',
                icon: 'target',
                color: '#3b82f6',
                lastUpdated: new Date(),
                ...(editingKPI || {}),
                ...formData,
              }}
              variant="default"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Personalized KPI Manager</h2>
          <p className="text-muted-foreground">Create and customize your KPI cards with advanced styling and metrics</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={handleImportKPIs}
            className="hidden"
            id="import-kpis"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-kpis')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportKPIs}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create KPI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New KPI</DialogTitle>
                <DialogDescription>
                  Design a custom KPI card with personalized metrics and styling
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                {renderKPIForm()}
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKPI}>
                  <Save className="h-4 w-4 mr-2" />
                  Create KPI
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="relative group">
            <PersonalizedKPICard
              data={kpi}
              variant="default"
              className="transition-all duration-200 hover:shadow-lg"
            />
            
            {/* Action overlay */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Dialog open={editingKPI?.id === kpi.id} onOpenChange={(open) => {
                if (!open) {
                  setEditingKPI(null);
                  setFormData({});
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingKPI(kpi);
                      setFormData(kpi);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>Edit KPI: {kpi.title}</DialogTitle>
                    <DialogDescription>
                      Modify the KPI settings and styling
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-4">
                    {renderKPIForm()}
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingKPI(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateKPI}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDuplicateKPI(kpi)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteKPI(kpi.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Empty state */}
        {kpis.length === 0 && (
          <div className="col-span-full text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KPIs Found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first personalized KPI card to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First KPI
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      {kpis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              KPI Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{kpis.length}</div>
                <div className="text-sm text-muted-foreground">Total KPIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {kpis.filter(k => k.status === 'success').length}
                </div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {kpis.filter(k => k.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {kpis.filter(k => k.status === 'danger').length}
                </div>
                <div className="text-sm text-muted-foreground">Danger</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}