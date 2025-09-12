import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Warning, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { toast } from 'sonner';

interface CleanOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
  mode?: 'create' | 'edit';
}

interface FormData {
  name: string;
  companyId: string;
  contactId: string;
  description: string;
  value: string;
  probability: string;
  stage: string;
  priority: string;
  source: string;
  expectedCloseDate: Date | null;
  industry: string;
  tags: string;
}

interface FormErrors {
  [key: string]: string;
}

const SAMPLE_COMPANIES: Company[] = [
  { id: '1', name: 'TechCorp Solutions', industry: 'Technology', website: 'techcorp.com' },
  { id: '2', name: 'GrowthCo Inc', industry: 'Marketing', website: 'growthco.com' },
  { id: '3', name: 'Innovation Labs', industry: 'R&D', website: 'innovationlabs.com' },
  { id: '4', name: 'Enterprise Systems', industry: 'Software', website: 'enterprise-sys.com' },
  { id: '5', name: 'Digital Dynamics', industry: 'Digital Services', website: 'digitaldynamics.com' }
];

const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'John Smith', email: 'john@techcorp.com', phone: '+1-555-0101', companyId: '1', role: 'CTO' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@techcorp.com', phone: '+1-555-0102', companyId: '1', role: 'Procurement Manager' },
  { id: '3', name: 'Mike Davis', email: 'mike@growthco.com', phone: '+1-555-0201', companyId: '2', role: 'Marketing Director' },
  { id: '4', name: 'Lisa Chen', email: 'lisa@innovationlabs.com', phone: '+1-555-0301', companyId: '3', role: 'VP Innovation' },
  { id: '5', name: 'Robert Wilson', email: 'robert@enterprise-sys.com', phone: '+1-555-0401', companyId: '4', role: 'CEO' }
];

export function CleanOpportunityForm({ 
  isOpen, 
  onClose, 
  onSave, 
  opportunity = null, 
  mode = 'create' 
}: CleanOpportunityFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    companyId: '',
    contactId: '',
    description: '',
    value: '',
    probability: '50',
    stage: 'prospect',
    priority: 'medium',
    source: 'website',
    expectedCloseDate: null,
    industry: '',
    tags: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);

  // Initialize form data when opportunity prop changes
  useEffect(() => {
    if (opportunity && mode === 'edit') {
      setFormData({
        name: opportunity.title || opportunity.name || '', // Handle both field names
        companyId: opportunity.companyId || '',
        contactId: opportunity.contactId || '',
        description: opportunity.description || '',
        value: opportunity.value?.toString() || '',
        probability: opportunity.probability?.toString() || '50',
        stage: opportunity.stage || 'prospect',
        priority: opportunity.priority || 'medium',
        source: opportunity.source || 'website',
        expectedCloseDate: opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate) : null,
        industry: opportunity.industry || '',
        tags: opportunity.tags?.join(', ') || ''
      });
    } else {
      // Reset for create mode
      setFormData({
        name: '',
        companyId: '',
        contactId: '',
        description: '',
        value: '',
        probability: '50',
        stage: 'prospect',
        priority: 'medium',
        source: 'website',
        expectedCloseDate: null,
        industry: '',
        tags: ''
      });
    }
    setErrors({});
  }, [opportunity, mode, isOpen]);

  // Update available contacts when company changes
  useEffect(() => {
    if (formData.companyId) {
      const contacts = SAMPLE_CONTACTS.filter(contact => contact.companyId === formData.companyId);
      setAvailableContacts(contacts);
      
      // Reset contact selection if current contact is not available for selected company
      if (formData.contactId && !contacts.find(c => c.id === formData.contactId)) {
        setFormData(prev => ({ ...prev, contactId: '' }));
      }
    } else {
      setAvailableContacts([]);
      setFormData(prev => ({ ...prev, contactId: '' }));
    }
  }, [formData.companyId]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Opportunity name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Opportunity name must be at least 3 characters';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company selection is required';
    }

    if (!formData.value.trim()) {
      newErrors.value = 'Deal value is required';
    } else {
      const numValue = parseFloat(formData.value);
      if (isNaN(numValue) || numValue < 0) {
        newErrors.value = 'Deal value must be a positive number';
      } else if (numValue > 1000000000) {
        newErrors.value = 'Deal value seems unusually high';
      }
    }

    const probability = parseFloat(formData.probability);
    if (isNaN(probability) || probability < 0 || probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (formData.description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCompany = SAMPLE_COMPANIES.find(c => c.id === formData.companyId);
      const selectedContact = availableContacts.find(c => c.id === formData.contactId);
      
      const opportunityData: Partial<Opportunity> = {
        title: formData.name.trim(), // Use title instead of name
        companyId: formData.companyId,
        contactId: formData.contactId || '',
        description: formData.description.trim(),
        value: parseFloat(formData.value),
        probability: parseFloat(formData.probability),
        stage: formData.stage as any,
        priority: formData.priority as any,
        source: formData.source,
        expectedCloseDate: formData.expectedCloseDate || new Date(),
        industry: formData.industry || selectedCompany?.industry || '',
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        // Additional fields for compatibility
        company: selectedCompany?.name || '',
        primaryContact: selectedContact?.name || '',
        contactEmail: selectedContact?.email || '',
        contactPhone: selectedContact?.phone || ''
      };

      if (mode === 'edit' && opportunity?.id) {
        await OpportunityService.updateOpportunity(opportunity.id, opportunityData);
        toast.success('Opportunity updated successfully');
      } else {
        await OpportunityService.createOpportunity(opportunityData);
        toast.success('Opportunity created successfully');
      }

      if (onSave) {
        onSave(opportunityData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, availableContacts, validateForm, mode, opportunity, onSave, onClose]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="opportunity-edit-form-dialog max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {mode === 'edit' ? 'Edit Opportunity' : 'Create New Opportunity'}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {mode === 'edit' 
                  ? 'Update the opportunity details and track progress through the PEAK methodology'
                  : 'Create a new sales opportunity and track it through the PEAK methodology'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(95vh-180px)]">
          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive" className="mb-6">
                <Warning className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Please fix the following errors:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field} className="text-sm">
                        <span className="font-medium">{field}:</span> {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <Badge variant="secondary">Required</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Opportunity Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Opportunity Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Enterprise Software License"
                    className={cn(errors.name && "border-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
                    <SelectTrigger className={cn(errors.companyId && "border-destructive")}>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_COMPANIES.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} - {company.industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companyId && (
                    <p className="text-sm text-destructive">{errors.companyId}</p>
                  )}
                </div>

                {/* Primary Contact */}
                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-sm font-medium">
                    Primary Contact
                  </Label>
                  <Select 
                    value={formData.contactId} 
                    onValueChange={(value) => handleInputChange('contactId', value)}
                    disabled={!formData.companyId || availableContacts.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !formData.companyId 
                            ? "Select company first" 
                            : availableContacts.length === 0 
                              ? "No contacts available" 
                              : "Select a contact"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableContacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} - {contact.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contactId && (
                    <p className="text-sm text-destructive">{errors.contactId}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the opportunity, key requirements, and expected outcomes..."
                  className={cn("min-h-[100px]", errors.description && "border-destructive")}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formData.description.length}/2000 characters</span>
                  {errors.description && (
                    <span className="text-destructive">{errors.description}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Deal Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-lg font-semibold">Deal Details</h3>
                <Badge variant="secondary">Required</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Deal Value */}
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-sm font-medium">
                    Deal Value (USD) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder="250000"
                    min="0"
                    step="1000"
                    className={cn(errors.value && "border-destructive")}
                  />
                  {errors.value && (
                    <p className="text-sm text-destructive">{errors.value}</p>
                  )}
                </div>

                {/* Win Probability */}
                <div className="space-y-2">
                  <Label htmlFor="probability" className="text-sm font-medium">
                    Win Probability (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="probability"
                    type="number"
                    value={formData.probability}
                    onChange={(e) => handleInputChange('probability', e.target.value)}
                    placeholder="50"
                    min="0"
                    max="100"
                    className={cn(errors.probability && "border-destructive")}
                  />
                  {errors.probability && (
                    <p className="text-sm text-destructive">{errors.probability}</p>
                  )}
                </div>

                {/* PEAK Stage */}
                <div className="space-y-2">
                  <Label htmlFor="stage" className="text-sm font-medium">
                    PEAK Stage
                  </Label>
                  <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PEAK_STAGES.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name} - {stage.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <Badge variant="outline">Optional</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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

                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="source" className="text-sm font-medium">
                    Lead Source
                  </Label>
                  <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="cold-call">Cold Call</SelectItem>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="trade-show">Trade Show</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Expected Close Date */}
                <div className="space-y-2">
                  <Label htmlFor="close-date" className="text-sm font-medium">
                    Expected Close Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expectedCloseDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expectedCloseDate ? format(formData.expectedCloseDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expectedCloseDate || undefined}
                        onSelect={(date) => handleInputChange('expectedCloseDate', date || null)}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="enterprise, high-value, referral (comma-separated)"
                />
                <p className="text-sm text-muted-foreground">
                  Enter tags separated by commas to help categorize this opportunity
                </p>
              </div>
            </div>
          </form>
        </ScrollArea>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {Object.keys(errors).length > 0 && (
              <span className="text-destructive">
                {Object.keys(errors).length} field(s) need attention
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                `${mode === 'edit' ? 'Update' : 'Create'} Opportunity`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}