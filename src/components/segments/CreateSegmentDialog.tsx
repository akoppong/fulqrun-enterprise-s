import { useState } from 'react';
import { CustomerSegment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from '@phosphor-icons/react';

interface CreateSegmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (segment: Omit<CustomerSegment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => void;
}

const SEGMENT_COLORS = [
  '#7C3AED', '#059669', '#DC2626', '#EA580C', '#0891B2', '#7C2D12', '#BE185D', '#1F2937'
];

const SEGMENT_ICONS = [
  'Crown', 'Trophy', 'Shield', 'Star', 'Target', 'Briefcase', 'Building', 'Globe'
];

const INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail',
  'Government', 'Defense', 'Non-Profit', 'Hospitality', 'Agriculture', 
  'Construction', 'Education', 'Energy', 'Media', 'Telecommunications'
];

const BUSINESS_MODELS = ['B2B', 'B2C', 'B2G', 'B2B2C'];

const GEOGRAPHIES = [
  'North America', 'South America', 'Europe', 'Asia-Pacific', 'Middle East', 
  'Africa', 'Global'
];

export function CreateSegmentDialog({ isOpen, onClose, onSubmit }: CreateSegmentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: SEGMENT_COLORS[0],
    icon: SEGMENT_ICONS[0],
    isActive: true,
    criteria: {
      revenue: { min: undefined as number | undefined, max: undefined as number | undefined },
      industry: [] as string[],
      companySize: { min: undefined as number | undefined, max: undefined as number | undefined },
      geography: [] as string[],
      businessModel: [] as string[],
      customFields: []
    },
    characteristics: {
      avgDealSize: 0,
      avgSalesCycle: 30,
      decisionMakers: [] as string[],
      commonPainPoints: [] as string[],
      buyingProcess: '',
      competitiveThreats: [] as string[],
      successFactors: [] as string[],
      churnRisk: 'medium' as 'low' | 'medium' | 'high'
    },
    strategy: {
      messaging: [] as string[],
      channels: [] as string[],
      touchpoints: 5,
      cadence: 'weekly',
      resources: [] as string[],
      playbooks: [] as string[],
      contentLibrary: [],
      kpis: [] as string[]
    }
  });

  const [newItem, setNewItem] = useState({ type: '', value: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const segment: Omit<CustomerSegment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      metrics: {
        totalOpportunities: 0,
        totalValue: 0,
        conversionRate: 0.2,
        averageDealSize: formData.characteristics.avgDealSize,
        averageSalesCycle: formData.characteristics.avgSalesCycle,
        customerLifetimeValue: formData.characteristics.avgDealSize * 5,
        acquisitionCost: formData.characteristics.avgDealSize * 0.1,
        retention: 0.8,
        expansion: 1.2,
        nps: 50,
        lastCalculated: new Date().toISOString()
      }
    };

    onSubmit(segment);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: SEGMENT_COLORS[0],
      icon: SEGMENT_ICONS[0],
      isActive: true,
      criteria: {
        revenue: { min: undefined, max: undefined },
        industry: [],
        companySize: { min: undefined, max: undefined },
        geography: [],
        businessModel: [],
        customFields: []
      },
      characteristics: {
        avgDealSize: 0,
        avgSalesCycle: 30,
        decisionMakers: [],
        commonPainPoints: [],
        buyingProcess: '',
        competitiveThreats: [],
        successFactors: [],
        churnRisk: 'medium'
      },
      strategy: {
        messaging: [],
        channels: [],
        touchpoints: 5,
        cadence: 'weekly',
        resources: [],
        playbooks: [],
        contentLibrary: [],
        kpis: []
      }
    });
  };

  const addArrayItem = (field: string, subField?: string) => {
    if (!newItem.value.trim()) return;

    if (subField) {
      setFormData(current => ({
        ...current,
        [field]: {
          ...current[field as keyof typeof current],
          [subField]: [...(current[field as keyof typeof current] as any)[subField], newItem.value]
        }
      }));
    } else {
      setFormData(current => ({
        ...current,
        [field]: [...(current[field as keyof typeof current] as string[]), newItem.value]
      }));
    }
    setNewItem({ type: '', value: '' });
  };

  const removeArrayItem = (field: string, index: number, subField?: string) => {
    if (subField) {
      setFormData(current => ({
        ...current,
        [field]: {
          ...current[field as keyof typeof current],
          [subField]: (current[field as keyof typeof current] as any)[subField].filter((_: any, i: number) => i !== index)
        }
      }));
    } else {
      setFormData(current => ({
        ...current,
        [field]: (current[field as keyof typeof current] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Customer Segment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="criteria">Criteria</TabsTrigger>
              <TabsTrigger value="characteristics">Characteristics</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Segment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(current => ({ ...current, name: e.target.value }))}
                    placeholder="e.g., Enterprise Accounts"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData(current => ({ ...current, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENT_ICONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(current => ({ ...current, description: e.target.value }))}
                  placeholder="Describe this customer segment..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {SEGMENT_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(current => ({ ...current, color }))}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Range</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Revenue ($)</Label>
                    <Input
                      type="number"
                      value={formData.criteria.revenue.min || ''}
                      onChange={(e) => setFormData(current => ({
                        ...current,
                        criteria: {
                          ...current.criteria,
                          revenue: { ...current.criteria.revenue, min: e.target.value ? parseInt(e.target.value) : undefined }
                        }
                      }))}
                      placeholder="50000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Revenue ($)</Label>
                    <Input
                      type="number"
                      value={formData.criteria.revenue.max || ''}
                      onChange={(e) => setFormData(current => ({
                        ...current,
                        criteria: {
                          ...current.criteria,
                          revenue: { ...current.criteria.revenue, max: e.target.value ? parseInt(e.target.value) : undefined }
                        }
                      }))}
                      placeholder="500000000"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Industries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.criteria.industry.map((industry, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {industry}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('criteria', index, 'industry')}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (!formData.criteria.industry.includes(value)) {
                        setFormData(current => ({
                          ...current,
                          criteria: {
                            ...current.criteria,
                            industry: [...current.criteria.industry, value]
                          }
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industries" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="characteristics" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Average Deal Size ($)</Label>
                  <Input
                    type="number"
                    value={formData.characteristics.avgDealSize}
                    onChange={(e) => setFormData(current => ({
                      ...current,
                      characteristics: { ...current.characteristics, avgDealSize: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Average Sales Cycle (days)</Label>
                  <Input
                    type="number"
                    value={formData.characteristics.avgSalesCycle}
                    onChange={(e) => setFormData(current => ({
                      ...current,
                      characteristics: { ...current.characteristics, avgSalesCycle: parseInt(e.target.value) || 30 }
                    }))}
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Buying Process</Label>
                <Textarea
                  value={formData.characteristics.buyingProcess}
                  onChange={(e) => setFormData(current => ({
                    ...current,
                    characteristics: { ...current.characteristics, buyingProcess: e.target.value }
                  }))}
                  placeholder="Describe the typical buying process..."
                />
              </div>

              <div className="space-y-2">
                <Label>Churn Risk</Label>
                <Select 
                  value={formData.characteristics.churnRisk} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(current => ({
                    ...current,
                    characteristics: { ...current.characteristics, churnRisk: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Touchpoints</Label>
                  <Input
                    type="number"
                    value={formData.strategy.touchpoints}
                    onChange={(e) => setFormData(current => ({
                      ...current,
                      strategy: { ...current.strategy, touchpoints: parseInt(e.target.value) || 5 }
                    }))}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cadence</Label>
                  <Select 
                    value={formData.strategy.cadence} 
                    onValueChange={(value) => setFormData(current => ({
                      ...current,
                      strategy: { ...current.strategy, cadence: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.description}>
              Create Segment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}