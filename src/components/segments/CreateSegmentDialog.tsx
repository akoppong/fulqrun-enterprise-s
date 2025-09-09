import { useState, useMemo } from 'react';
import { CustomerSegment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedForm } from '@/components/ui/validated-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { segmentValidationSchema } from '@/lib/validation';
import { errorHandler } from '@/lib/error-handling';
import { Plus, X, AlertTriangle, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
  const [currentTab, setCurrentTab] = useState('basic');
  const [newItem, setNewItem] = useState({ type: '', value: '' });

  const initialFormData = {
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
  };

  const handleFormSubmit = async (data: Record<string, any>, { setSubmitting, setError }: any) => {
    try {
      // Additional business logic validation
      if (data.criteria?.revenue?.min && data.criteria?.revenue?.max && 
          data.criteria.revenue.min >= data.criteria.revenue.max) {
        setError('Minimum revenue must be less than maximum revenue');
        return;
      }

      if (data.criteria?.companySize?.min && data.criteria?.companySize?.max && 
          data.criteria.companySize.min >= data.criteria.companySize.max) {
        setError('Minimum company size must be less than maximum company size');
        return;
      }

      // Prepare segment data
      const segment: Omit<CustomerSegment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
        ...data,
        // Ensure arrays are properly formatted
        criteria: {
          ...data.criteria,
          industry: Array.isArray(data.criteria?.industry) ? data.criteria.industry : [],
          geography: Array.isArray(data.criteria?.geography) ? data.criteria.geography : [],
          businessModel: Array.isArray(data.criteria?.businessModel) ? data.criteria.businessModel : []
        }
      };

      await onSubmit(segment);
      
      toast.success('Customer segment created successfully!', {
        description: `"${data.name}" is now ready for customer assignment.`
      });
      
      onClose();
    } catch (error) {
      errorHandler.handleError(error as Error, 'medium', { context: 'CreateSegment' });
      setError('Failed to create segment. Please try again.');
    }
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
    setValidationErrors({});
    setTouchedFields({});
    setCurrentTab('basic');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Segment name is required');
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Segment description is required');
        return;
      }

      // Submit the segment data
      onSubmit(formData);
      
      toast.success('Customer segment created successfully!', {
        description: `"${formData.name}" has been added to your segments.`
      });
      
      onClose();
    } catch (error) {
      errorHandler.handleError(error as Error, 'medium', { 
        context: 'CreateSegment',
        formData 
      });
      toast.error('Failed to create segment. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Create Customer Segment</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger 
                  value="basic" 
                  className={getTabErrors('basic') ? 'text-destructive' : ''}
                >
                  <span className="flex items-center gap-2">
                    Basic Info
                    {getTabErrors('basic') && <AlertTriangle className="h-3 w-3" />}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="criteria"
                  className={getTabErrors('criteria') ? 'text-destructive' : ''}
                >
                  <span className="flex items-center gap-2">
                    Criteria
                    {getTabErrors('criteria') && <AlertTriangle className="h-3 w-3" />}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="characteristics"
                  className={getTabErrors('characteristics') ? 'text-destructive' : ''}
                >
                  <span className="flex items-center gap-2">
                    Characteristics
                    {getTabErrors('characteristics') && <AlertTriangle className="h-3 w-3" />}
                  </span>
                </TabsTrigger>
                <TabsTrigger 
                  value="strategy"
                  className={getTabErrors('strategy') ? 'text-destructive' : ''}
                >
                  <span className="flex items-center gap-2">
                    Strategy
                    {getTabErrors('strategy') && <AlertTriangle className="h-3 w-3" />}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <FormSection 
                  title="Basic Information" 
                  description="Define the fundamental details of your customer segment"
                >
                  <FormGrid columns={2}>
                    <InputField
                      id="segment-name"
                      label="Segment Name"
                      value={formData.name}
                      onChange={(value) => handleFieldChange('name', value)}
                      onBlur={() => handleFieldBlur('name')}
                      error={validationErrors.name}
                      placeholder="e.g., Strategic Partners"
                      required
                      helpText="A clear, descriptive name for this customer segment"
                    />
                    
                    <SelectField
                      id="segment-icon"
                      label="Icon"
                      value={formData.icon}
                      onChange={(value) => handleFieldChange('icon', value)}
                      options={SEGMENT_ICONS.map(icon => ({ value: icon, label: icon }))}
                      required
                    />
                  </FormGrid>

                  <TextareaField
                    id="segment-description"
                    label="Description"
                    value={formData.description}
                    onChange={(value) => handleFieldChange('description', value)}
                    onBlur={() => handleFieldBlur('description')}
                    error={validationErrors.description}
                    placeholder="Describe this customer segment, their characteristics, and what makes them unique..."
                    rows={4}
                    required
                    helpText="Provide a detailed description of this segment's defining characteristics"
                  />

                  <div className="space-y-2">
                    <Label>Color Theme</Label>
                    <div className="flex gap-3 flex-wrap">
                      {SEGMENT_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                            formData.color === color 
                              ? 'border-foreground shadow-lg' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleFieldChange('color', color)}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </FormSection>
              </TabsContent>

              <TabsContent value="criteria" className="space-y-6">
                <FormSection 
                  title="Targeting Criteria" 
                  description="Define the specific criteria that companies must meet to belong to this segment"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Range</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormGrid columns={2}>
                        <InputField
                          id="min-revenue"
                          label="Minimum Annual Revenue"
                          type="number"
                          value={formData.criteria.revenue.min || ''}
                          onChange={(value) => handleFieldChange('criteria.revenue.min', value ? parseInt(value) : undefined)}
                          onBlur={() => handleFieldBlur('criteria.revenue.min')}
                          error={validationErrors['criteria.revenue.min']}
                          placeholder="500000000"
                          helpText="Minimum annual revenue in USD"
                          min={0}
                        />
                        <InputField
                          id="max-revenue"
                          label="Maximum Annual Revenue"
                          type="number"
                          value={formData.criteria.revenue.max || ''}
                          onChange={(value) => handleFieldChange('criteria.revenue.max', value ? parseInt(value) : undefined)}
                          onBlur={() => handleFieldBlur('criteria.revenue.max')}
                          error={validationErrors['criteria.revenue.max']}
                          placeholder="2000000000"
                          helpText="Maximum annual revenue in USD"
                          min={1}
                        />
                      </FormGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Industries</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formData.criteria.industry.map((industry, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {industry}
                            <button
                              type="button"
                              onClick={() => removeArrayItem('criteria', index, 'industry')}
                              className="hover:text-destructive"
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
                            handleFieldChange('criteria.industry', [...formData.criteria.industry, value]);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select industries to include" />
                        </SelectTrigger>
                        <SelectContent className="max-w-[400px]">
                          {INDUSTRIES.map(industry => (
                            <SelectItem 
                              key={industry} 
                              value={industry}
                              disabled={formData.criteria.industry.includes(industry)}
                            >
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Geography & Business Model</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Geographic Regions</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.criteria.geography.map((geo, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {geo}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('criteria', index, 'geography')}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            if (!formData.criteria.geography.includes(value)) {
                              handleFieldChange('criteria.geography', [...formData.criteria.geography, value]);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Add geographic regions" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[400px]">
                            {GEOGRAPHIES.map(geo => (
                              <SelectItem 
                                key={geo} 
                                value={geo}
                                disabled={formData.criteria.geography.includes(geo)}
                              >
                                {geo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Business Models</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.criteria.businessModel.map((model, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {model}
                              <button
                                type="button"
                                onClick={() => removeArrayItem('criteria', index, 'businessModel')}
                                className="hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select 
                          value="" 
                          onValueChange={(value) => {
                            if (!formData.criteria.businessModel.includes(value)) {
                              handleFieldChange('criteria.businessModel', [...formData.criteria.businessModel, value]);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Add business models" />
                          </SelectTrigger>
                          <SelectContent className="max-w-[400px]">
                            {BUSINESS_MODELS.map(model => (
                              <SelectItem 
                                key={model} 
                                value={model}
                                disabled={formData.criteria.businessModel.includes(model)}
                              >
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </FormSection>
              </TabsContent>

              <TabsContent value="characteristics" className="space-y-6">
                <FormSection 
                  title="Segment Characteristics" 
                  description="Define the typical characteristics and behavior patterns of this segment"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormGrid columns={2}>
                        <InputField
                          id="avg-deal-size"
                          label="Average Deal Size"
                          type="number"
                          value={formData.characteristics.avgDealSize}
                          onChange={(value) => handleFieldChange('characteristics.avgDealSize', parseInt(value) || 0)}
                          onBlur={() => handleFieldBlur('characteristics.avgDealSize')}
                          error={validationErrors['characteristics.avgDealSize']}
                          placeholder="100000"
                          required
                          helpText="Average deal value in USD"
                          min={0}
                        />
                        <InputField
                          id="avg-sales-cycle"
                          label="Average Sales Cycle (days)"
                          type="number"
                          value={formData.characteristics.avgSalesCycle}
                          onChange={(value) => handleFieldChange('characteristics.avgSalesCycle', parseInt(value) || 30)}
                          onBlur={() => handleFieldBlur('characteristics.avgSalesCycle')}
                          error={validationErrors['characteristics.avgSalesCycle']}
                          placeholder="90"
                          required
                          helpText="Typical time from first contact to close"
                          min={1}
                          max={365}
                        />
                      </FormGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Buying Behavior</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <TextareaField
                        id="buying-process"
                        label="Typical Buying Process"
                        value={formData.characteristics.buyingProcess}
                        onChange={(value) => handleFieldChange('characteristics.buyingProcess', value)}
                        placeholder="Describe the typical buying process, decision makers, approval cycles, etc..."
                        rows={3}
                        helpText="Document the typical journey these customers take when making purchasing decisions"
                      />

                      <SelectField
                        id="churn-risk"
                        label="Churn Risk Level"
                        value={formData.characteristics.churnRisk}
                        onChange={(value) => handleFieldChange('characteristics.churnRisk', value)}
                        options={[
                          { value: 'low', label: 'Low - Very loyal customers' },
                          { value: 'medium', label: 'Medium - Standard retention' },
                          { value: 'high', label: 'High - Requires active retention' }
                        ]}
                        required
                      />
                    </CardContent>
                  </Card>
                </FormSection>
              </TabsContent>

              <TabsContent value="strategy" className="space-y-6">
                <FormSection 
                  title="Engagement Strategy" 
                  description="Define how your team should engage with this customer segment"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Communication Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormGrid columns={2}>
                        <InputField
                          id="touchpoints"
                          label="Recommended Touchpoints"
                          type="number"
                          value={formData.strategy.touchpoints}
                          onChange={(value) => handleFieldChange('strategy.touchpoints', parseInt(value) || 5)}
                          onBlur={() => handleFieldBlur('strategy.touchpoints')}
                          error={validationErrors['strategy.touchpoints']}
                          placeholder="5"
                          required
                          helpText="Number of touchpoints in a typical sales cycle"
                          min={1}
                          max={50}
                        />
                        
                        <SelectField
                          id="cadence"
                          label="Follow-up Cadence"
                          value={formData.strategy.cadence}
                          onChange={(value) => handleFieldChange('strategy.cadence', value)}
                          options={[
                            { value: 'daily', label: 'Daily' },
                            { value: 'weekly', label: 'Weekly' },
                            { value: 'bi-weekly', label: 'Bi-weekly' },
                            { value: 'monthly', label: 'Monthly' }
                          ]}
                          required
                        />
                      </FormGrid>
                    </CardContent>
                  </Card>
                </FormSection>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        <div className="flex justify-between items-center pt-6 border-t flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            {Object.keys(validationErrors).filter(key => validationErrors[key]).length > 0 && (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {Object.keys(validationErrors).filter(key => validationErrors[key]).length} validation error(s)
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={isSubmitting || hasFormErrors()}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Creating...' : 'Create Segment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}