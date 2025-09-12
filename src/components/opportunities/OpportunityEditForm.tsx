import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { toast } from 'sonner';

interface OpportunityEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  onSubmit?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
  mode?: 'create' | 'edit';
}

export function OpportunityEditForm({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  opportunity,
  mode = 'create'
}: OpportunityEditFormProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    name: '',
    company: '',
    value: 0,
    stage: 'prospect',
    probability: 50,
    primaryContact: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
    source: '',
    description: '',
    tags: [],
    priority: 'medium',
    expectedCloseDate: new Date(),
    assignedTo: 'current-user',
    ...opportunity
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : new Date()
  );

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        expectedCloseDate: opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate) : new Date()
      });
      setSelectedDate(opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate) : new Date());
    } else {
      setFormData({
        name: '',
        company: '',
        value: 0,
        stage: 'prospect',
        probability: 50,
        primaryContact: '',
        contactEmail: '',
        contactPhone: '',
        industry: '',
        source: '',
        description: '',
        tags: [],
        priority: 'medium',
        expectedCloseDate: new Date(),
        assignedTo: 'current-user'
      });
      setSelectedDate(new Date());
    }
  }, [opportunity, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Opportunity name is required';
    }
    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }
    if (!formData.probability || formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    const submitData = {
      ...formData,
      expectedCloseDate: selectedDate || new Date(),
      updatedAt: new Date()
    };

    if (onSubmit) {
      onSubmit(submitData);
    } else if (onSave) {
      onSave(submitData);
    }

    toast.success(mode === 'create' ? 'Opportunity created successfully' : 'Opportunity updated successfully');
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const getCompanyContacts = () => {
    if (!formData.company) return [];
    return contacts.filter(contact => 
      contact.company?.toLowerCase() === formData.company?.toLowerCase()
    );
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is corrected
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="opportunity-edit-form-dialog max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Create New Opportunity' : 'Edit Opportunity'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-8 p-1">
            {/* Basic Information */}
            <div className="form-section-spacing">
              <h4 className="text-lg font-semibold text-foreground mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="form-field">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Opportunity Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={cn(errors.name && 'border-destructive')}
                    placeholder="Enter opportunity name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="form-field">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company *
                  </Label>
                  <Select
                    value={formData.company || ''}
                    onValueChange={(value) => {
                      handleFieldChange('company', value);
                      // Reset primary contact when company changes
                      handleFieldChange('primaryContact', '');
                    }}
                  >
                    <SelectTrigger className={cn(errors.company && 'border-destructive')}>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.company && (
                    <p className="text-sm text-destructive mt-1">{errors.company}</p>
                  )}
                </div>

                <div className="form-field">
                  <Label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    value={formData.industry || ''}
                    onChange={(e) => handleFieldChange('industry', e.target.value)}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
              </div>
            </div>

            {/* Deal Information */}
            <div className="form-section-spacing">
              <h4 className="text-lg font-semibold text-foreground mb-4">Deal Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="form-field">
                  <Label htmlFor="value" className="text-sm font-medium">
                    Deal Value ($) *
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => handleFieldChange('value', parseFloat(e.target.value) || 0)}
                    className={cn(errors.value && 'border-destructive')}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive mt-1">{errors.value}</p>
                  )}
                </div>

                <div className="form-field">
                  <Label htmlFor="probability" className="text-sm font-medium">
                    Win Probability (%) *
                  </Label>
                  <Input
                    id="probability"
                    type="number"
                    value={formData.probability || ''}
                    onChange={(e) => handleFieldChange('probability', parseInt(e.target.value) || 0)}
                    className={cn(errors.probability && 'border-destructive')}
                    placeholder="50"
                    min="0"
                    max="100"
                  />
                  {errors.probability && (
                    <p className="text-sm text-destructive mt-1">{errors.probability}</p>
                  )}
                </div>

                <div className="form-field">
                  <Label htmlFor="stage" className="text-sm font-medium">
                    PEAK Stage *
                  </Label>
                  <Select
                    value={formData.stage || 'prospect'}
                    onValueChange={(value) => handleFieldChange('stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PEAK_STAGES).map(([key, stage]) => (
                        <SelectItem key={key} value={key}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section-spacing">
              <h4 className="text-lg font-semibold text-foreground mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="form-field">
                  <Label htmlFor="primaryContact" className="text-sm font-medium">
                    Primary Contact
                  </Label>
                  <Select
                    value={formData.primaryContact || ''}
                    onValueChange={(value) => {
                      handleFieldChange('primaryContact', value);
                      const contact = getCompanyContacts().find(c => c.name === value);
                      if (contact) {
                        handleFieldChange('contactEmail', contact.email || '');
                        handleFieldChange('contactPhone', contact.phone || '');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCompanyContacts().map((contact) => (
                        <SelectItem key={contact.id} value={contact.name}>
                          {contact.name} - {contact.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.company && getCompanyContacts().length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      No contacts found for this company. Add contacts first.
                    </p>
                  )}
                </div>

                <div className="form-field">
                  <Label htmlFor="contactEmail" className="text-sm font-medium">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>

                <div className="form-field">
                  <Label htmlFor="contactPhone" className="text-sm font-medium">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="form-section-spacing">
              <h4 className="text-lg font-semibold text-foreground mb-4">Additional Details</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="form-field">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority || 'medium'}
                    onValueChange={(value) => handleFieldChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-field">
                  <Label htmlFor="source" className="text-sm font-medium">
                    Lead Source
                  </Label>
                  <Select
                    value={formData.source || ''}
                    onValueChange={(value) => handleFieldChange('source', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="cold-call">Cold Call</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="trade-show">Trade Show</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-field mt-6">
                <Label htmlFor="expectedCloseDate" className="text-sm font-medium">
                  Expected Close Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        errors.expectedCloseDate && 'border-destructive'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.expectedCloseDate && (
                  <p className="text-sm text-destructive mt-1">{errors.expectedCloseDate}</p>
                )}
              </div>

              <div className="form-field mt-6">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Describe the opportunity, key requirements, decision makers, etc."
                  rows={4}
                />
              </div>

              {/* Tags */}
              <div className="form-field mt-6">
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        size={14}
                        className="cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm" variant="outline">
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-[120px]">
                {mode === 'create' ? 'Create Opportunity' : 'Update Opportunity'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}