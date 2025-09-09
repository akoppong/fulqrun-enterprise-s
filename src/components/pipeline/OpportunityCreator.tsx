import React, { useState } from 'react';
import { usePipelineConfigurations } from '@/hooks/usePipelineConfigurations';
import { useValidatedForm } from '@/hooks/useFormValidation';
import { opportunityValidationSchema } from '@/lib/validation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { InputField, TextareaField, SelectField, FormGrid } from '@/components/ui/form-fields';
import { MEDDPICC } from '@/lib/types';
import { Plus, Building, DollarSign, Calendar, User, AlertTriangle } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface OpportunityCreatorProps {
  onOpportunityCreated?: () => void;
}

export function OpportunityCreator({ onOpportunityCreated }: OpportunityCreatorProps) {
  const { allPipelines, activePipeline, createOpportunity } = usePipelineConfigurations();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState(activePipeline.id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    expectedCloseDate: '',
    companyId: '',
    contactId: '',
    ownerId: 'current-user'
  });

  const selectedPipeline = allPipelines.find(p => p.id === selectedPipelineId) || activePipeline;

  // Initialize form validation
  const validation = useValidatedForm(opportunityValidationSchema, async (data) => {
    const defaultMEDDPICC: MEDDPICC = {
      metrics: '',
      economicBuyer: '',
      decisionCriteria: '',
      decisionProcess: '',
      paperProcess: '',
      implicatePain: '',
      champion: '',
      score: 0
    };

    const opportunity = {
      title: data.title,
      description: data.description,
      value: parseFloat(data.value) || 0,
      expectedCloseDate: data.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      companyId: data.companyId || `company-${Date.now()}`,
      contactId: data.contactId || `contact-${Date.now()}`,
      ownerId: data.ownerId,
      meddpicc: defaultMEDDPICC,
      probability: selectedPipeline.stages[0]?.probability || 10
    };

    createOpportunity(opportunity, selectedPipelineId);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      value: '',
      expectedCloseDate: '',
      companyId: '',
      contactId: '',
      ownerId: 'current-user'
    });
    
    validation.reset();
    setIsOpen(false);
    
    toast.success('Opportunity created successfully!');
    onOpportunityCreated?.();
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it's been touched
    if (validation.touched[field]) {
      validation.validateField(field, value, { ...formData, [field]: value });
    }
  };

  const handleFieldBlur = (field: string) => {
    validation.setFieldTouched(field, true);
    const value = formData[field as keyof typeof formData];
    validation.validateField(field, value, formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      await validation.handleSubmit(formData, e);
    } catch (error) {
      // Error is already handled by the validation hook
      console.error('Form submission error:', error);
    }
  };

  // Format today's date as default minimum
  const today = new Date().toISOString().split('T')[0];
  // Format one year from now as reasonable maximum
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const generateSampleData = () => {
    const sampleTitles = [
      'Enterprise Software License',
      'Cloud Migration Project',
      'SaaS Subscription - Annual',
      'Professional Services Contract',
      'Hardware Procurement Deal',
      'Digital Transformation Initiative',
      'Customer Success Platform',
      'E-commerce Integration',
      'Marketing Automation Suite',
      'Security Audit Services'
    ];
    
    const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
    const randomValue = Math.floor(Math.random() * 500000) + 10000;
    const randomDays = Math.floor(Math.random() * 90) + 30;
    const closeDate = new Date(Date.now() + randomDays * 24 * 60 * 60 * 1000);

    const newData = {
      ...formData,
      title: randomTitle,
      description: `Potential ${randomTitle.toLowerCase()} opportunity with high strategic value`,
      value: randomValue.toString(),
      expectedCloseDate: closeDate.toISOString().split('T')[0]
    };
    
    setFormData(newData);
    
    // Clear any existing validation errors
    validation.clearErrors();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Create Demo Opportunity
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] form-container">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Opportunity
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pipeline">Pipeline Configuration</Label>
                <SelectField
                  id="pipeline"
                  label=""
                  value={selectedPipelineId}
                  onChange={setSelectedPipelineId}
                  options={allPipelines.map(p => ({
                    value: p.id,
                    label: `${p.name} (${p.stages.length} stages)`
                  }))}
                  containerClassName="mt-0"
                />
                {selectedPipeline && (
                  <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/30 rounded-md">
                    Will start in: <span className="font-medium text-foreground">{selectedPipeline.stages[0]?.name}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span></span>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generateSampleData}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Generate Sample Data
                </Button>
              </div>

              <FormGrid columns={1}>
                <InputField
                  id="opportunity-title"
                  label="Opportunity Title"
                  value={formData.title}
                  onChange={(value) => handleFieldChange('title', value)}
                  onBlur={() => handleFieldBlur('title')}
                  error={validation.getFieldError('title')}
                  placeholder="e.g., Enterprise Software License Deal"
                  required
                  helpText="A clear, descriptive title for this sales opportunity"
                />
              </FormGrid>

              <FormGrid columns={1}>
                <TextareaField
                  id="opportunity-description"
                  label="Description"
                  value={formData.description}
                  onChange={(value) => handleFieldChange('description', value)}
                  onBlur={() => handleFieldBlur('description')}
                  error={validation.getFieldError('description')}
                  placeholder="Describe the opportunity, key stakeholders, and strategic importance..."
                  rows={3}
                  helpText="Provide context about this opportunity and its strategic value"
                />
              </FormGrid>

              <FormGrid columns={2}>
                <div className="relative">
                  <InputField
                    id="opportunity-value"
                    label="Deal Value"
                    type="number"
                    value={formData.value}
                    onChange={(value) => handleFieldChange('value', value)}
                    onBlur={() => handleFieldBlur('value')}
                    error={validation.getFieldError('value')}
                    placeholder="100000"
                    required
                    min={0}
                    helpText="Expected total deal value in USD"
                    className="pl-8"
                  />
                  <DollarSign size={16} className="absolute left-3 top-9 text-muted-foreground" />
                </div>

                <div className="relative">
                  <InputField
                    id="expected-close-date"
                    label="Expected Close Date"
                    type="date"
                    value={formData.expectedCloseDate}
                    onChange={(value) => handleFieldChange('expectedCloseDate', value)}
                    onBlur={() => handleFieldBlur('expectedCloseDate')}
                    error={validation.getFieldError('expectedCloseDate')}
                    required
                    helpText="When do you expect to close this deal?"
                    className="pl-8"
                    min={today}
                    max={maxDateString}
                  />
                  <Calendar size={16} className="absolute left-3 top-9 text-muted-foreground" />
                </div>
              </FormGrid>

              <FormGrid columns={2}>
                <div className="relative">
                  <InputField
                    id="company-id"
                    label="Company ID"
                    value={formData.companyId}
                    onChange={(value) => handleFieldChange('companyId', value)}
                    placeholder="Will auto-generate if empty"
                    helpText="Link to an existing company or leave empty to auto-generate"
                    className="pl-8"
                  />
                  <Building size={16} className="absolute left-3 top-9 text-muted-foreground" />
                </div>

                <div className="relative">
                  <InputField
                    id="contact-id"
                    label="Contact ID"
                    value={formData.contactId}
                    onChange={(value) => handleFieldChange('contactId', value)}
                    placeholder="Will auto-generate if empty"
                    helpText="Link to an existing contact or leave empty to auto-generate"
                    className="pl-8"
                  />
                  <User size={16} className="absolute left-3 top-9 text-muted-foreground" />
                </div>
              </FormGrid>
            </div>
          </form>
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {validation.submitError && (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {validation.submitError}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={handleSubmit}
              disabled={validation.isSubmitting || !validation.isValid}
              className="min-w-[140px]"
            >
              {validation.isSubmitting ? 'Creating...' : 'Create Opportunity'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}