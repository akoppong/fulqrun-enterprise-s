import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User, PEAK_STAGES } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { OpportunityService } from '@/lib/opportunity-service';
import { 
  Building,
  Users,
  Calendar,
  DollarSign,
  Target,
  Tag,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Warning,
  ArrowRight
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface FormData {
  title: string;
  description: string;
  companyId: string;
  contactId: string;
  value: string;
  stage: string;
  probability: string;
  expectedCloseDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  industry: string;
  leadSource: string;
  tags: string[];
  ownerId: string;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface EnhancedNewOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Opportunity) => void;
  editingOpportunity?: Opportunity | null;
  user: User;
}

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Manufacturing',
  'Retail',
  'Education',
  'Government',
  'Non-Profit',
  'Real Estate',
  'Consulting',
  'Other'
];

const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Cold Call',
  'Email Campaign',
  'Social Media',
  'Trade Show',
  'Partner',
  'Advertisement',
  'Direct Mail',
  'Other'
];

export function EnhancedNewOpportunityForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingOpportunity, 
  user 
}: EnhancedNewOpportunityFormProps) {
  // KV Storage hooks with safe fallbacks
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    companyId: '',
    contactId: '',
    value: '',
    stage: 'prospect',
    probability: '50',
    expectedCloseDate: '',
    priority: 'medium',
    industry: '',
    leadSource: '',
    tags: [],
    ownerId: user.id
  });

  // Validation and UI state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formProgress, setFormProgress] = useState(0);

  // Filtered contacts based on selected company
  const availableContacts = contacts.filter(contact => 
    !formData.companyId || contact.companyId === formData.companyId
  );

  // Initialize form data when editing
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        title: editingOpportunity.title || '',
        description: editingOpportunity.description || '',
        companyId: editingOpportunity.companyId || '',
        contactId: editingOpportunity.contactId || '',
        value: editingOpportunity.value?.toString() || '',
        stage: editingOpportunity.stage || 'prospect',
        probability: editingOpportunity.probability?.toString() || '50',
        expectedCloseDate: editingOpportunity.expectedCloseDate ? 
          format(new Date(editingOpportunity.expectedCloseDate), 'yyyy-MM-dd') : '',
        priority: editingOpportunity.priority || 'medium',
        industry: editingOpportunity.industry || '',
        leadSource: editingOpportunity.leadSource || '',
        tags: editingOpportunity.tags || [],
        ownerId: editingOpportunity.ownerId || user.id
      });
    } else {
      // Reset form for new opportunity
      setFormData({
        title: '',
        description: '',
        companyId: '',
        contactId: '',
        value: '',
        stage: 'prospect',
        probability: '50',
        expectedCloseDate: '',
        priority: 'medium',
        industry: '',
        leadSource: '',
        tags: [],
        ownerId: user.id
      });
    }
    setValidationErrors([]);
    setHasUnsavedChanges(false);
  }, [editingOpportunity, user.id]);

  // Track form completion progress
  useEffect(() => {
    const requiredFields = ['title', 'companyId', 'value', 'expectedCloseDate'];
    const optionalFields = ['description', 'contactId', 'industry', 'leadSource'];
    
    const completedRequired = requiredFields.filter(field => 
      formData[field as keyof FormData] && String(formData[field as keyof FormData]).trim()
    ).length;
    
    const completedOptional = optionalFields.filter(field => 
      formData[field as keyof FormData] && String(formData[field as keyof FormData]).trim()
    ).length;

    const progress = ((completedRequired / requiredFields.length) * 70) + 
                    ((completedOptional / optionalFields.length) * 30);
    
    setFormProgress(Math.round(progress));
  }, [formData]);

  // Comprehensive form validation
  const validateForm = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Required field validation
    if (!formData.title.trim()) {
      errors.push({ field: 'title', message: 'Opportunity title is required', severity: 'error' });
    } else if (formData.title.length < 3) {
      errors.push({ field: 'title', message: 'Title should be at least 3 characters', severity: 'warning' });
    }

    if (!formData.companyId) {
      errors.push({ field: 'companyId', message: 'Company selection is required', severity: 'error' });
    }

    if (!formData.value || isNaN(Number(formData.value))) {
      errors.push({ field: 'value', message: 'Valid deal value is required', severity: 'error' });
    } else {
      const value = Number(formData.value);
      if (value <= 0) {
        errors.push({ field: 'value', message: 'Deal value must be greater than zero', severity: 'error' });
      } else if (value > 10000000) {
        errors.push({ field: 'value', message: 'Deal value seems unusually high. Please verify.', severity: 'warning' });
      }
    }

    if (!formData.expectedCloseDate) {
      errors.push({ field: 'expectedCloseDate', message: 'Expected close date is required', severity: 'error' });
    } else {
      const closeDate = new Date(formData.expectedCloseDate);
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (closeDate < today) {
        errors.push({ field: 'expectedCloseDate', message: 'Close date cannot be in the past', severity: 'error' });
      } else if (closeDate > oneYearFromNow) {
        errors.push({ field: 'expectedCloseDate', message: 'Close date is more than a year away', severity: 'warning' });
      }
    }

    // Probability validation
    const probability = Number(formData.probability);
    if (probability < 0 || probability > 100) {
      errors.push({ field: 'probability', message: 'Probability must be between 0% and 100%', severity: 'error' });
    }

    // Business logic validation
    if (formData.companyId && formData.contactId) {
      const selectedContact = contacts.find(c => c.id === formData.contactId);
      if (selectedContact && selectedContact.companyId !== formData.companyId) {
        errors.push({ 
          field: 'contactId', 
          message: 'Selected contact does not belong to the selected company', 
          severity: 'error' 
        });
      }
    }

    // Duplicate opportunity check
    const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
    const duplicateOpportunity = safeOpportunities.find(opp => 
      opp.id !== editingOpportunity?.id &&
      opp.title.toLowerCase() === formData.title.toLowerCase() &&
      opp.companyId === formData.companyId
    );

    if (duplicateOpportunity) {
      errors.push({ 
        field: 'title', 
        message: 'An opportunity with this title already exists for this company', 
        severity: 'warning' 
      });
    }

    return errors;
  }, [formData, contacts, opportunities, editingOpportunity?.id]);

  // Real-time validation
  useEffect(() => {
    const errors = validateForm();
    setValidationErrors(errors);
  }, [validateForm]);

  // Handle form field changes
  const handleFieldChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    // Clear contact selection if company changes
    if (field === 'companyId' && formData.contactId) {
      const selectedContact = contacts.find(c => c.id === formData.contactId);
      if (selectedContact && selectedContact.companyId !== value) {
        setFormData(prev => ({ ...prev, contactId: '' }));
      }
    }
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleFieldChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFieldChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSave = async () => {
    const errors = validateForm();
    const criticalErrors = errors.filter(e => e.severity === 'error');

    if (criticalErrors.length > 0) {
      toast.error('Please fix all errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      const opportunityData: Partial<Opportunity> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        companyId: formData.companyId,
        contactId: formData.contactId || '',
        value: Number(formData.value),
        stage: formData.stage,
        probability: Number(formData.probability),
        expectedCloseDate: formData.expectedCloseDate,
        priority: formData.priority,
        industry: formData.industry,
        leadSource: formData.leadSource,
        tags: formData.tags,
        ownerId: formData.ownerId,
        meddpicc: {
          metrics: '',
          economicBuyer: '',
          decisionCriteria: '',
          decisionProcess: '',
          paperProcess: '',
          implicatePain: '',
          champion: '',
          score: 0
        }
      };

      let savedOpportunity: Opportunity;

      if (editingOpportunity) {
        savedOpportunity = await OpportunityService.updateOpportunity(editingOpportunity.id, opportunityData);
        if (!savedOpportunity) {
          throw new Error('Failed to update opportunity');
        }
        toast.success('Opportunity updated successfully');
      } else {
        savedOpportunity = await OpportunityService.createOpportunity(opportunityData);
        toast.success('Opportunity created successfully');
      }

      onSave?.(savedOpportunity);
      onClose();
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form closure with unsaved changes warning
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasUnsavedChanges(false);
      }
    } else {
      onClose();
    }
  };

  const hasErrors = validationErrors.some(e => e.severity === 'error');
  const hasWarnings = validationErrors.some(e => e.severity === 'warning');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="opportunity-edit-form-dialog max-w-7xl max-h-[95vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-2xl">
                  {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingOpportunity 
                    ? 'Update opportunity details and track progress'
                    : 'Add a new sales opportunity to your pipeline'
                  }
                </DialogDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">Form Progress</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={formProgress} className="w-20 h-2" />
                    <span className="text-sm text-muted-foreground">{formProgress}%</span>
                  </div>
                </div>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {/* Validation Summary */}
              {validationErrors.length > 0 && (
                <Alert className={hasErrors ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {hasErrors ? 'Please fix the following errors:' : 'Warnings:'}
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className={error.severity === 'error' ? 'text-red-700' : 'text-yellow-700'}>
                            {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      <Label htmlFor="title">Opportunity Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                        placeholder="Enter opportunity title"
                        className={validationErrors.some(e => e.field === 'title' && e.severity === 'error') ? 'border-red-300' : ''}
                      />
                    </div>

                    <div>
                      <Label htmlFor="value">Deal Value * ($)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => handleFieldChange('value', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1000"
                        className={validationErrors.some(e => e.field === 'value' && e.severity === 'error') ? 'border-red-300' : ''}
                      />
                    </div>

                    <div className="xl:col-span-3">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleFieldChange('description', e.target.value)}
                        placeholder="Describe the opportunity..."
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company and Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Select 
                        value={formData.companyId} 
                        onValueChange={(value) => handleFieldChange('companyId', value)}
                      >
                        <SelectTrigger 
                          className={validationErrors.some(e => e.field === 'companyId' && e.severity === 'error') ? 'border-red-300' : ''}
                        >
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="contact">Primary Contact</Label>
                      <Select 
                        value={formData.contactId} 
                        onValueChange={(value) => handleFieldChange('contactId', value)}
                        disabled={!formData.companyId}
                      >
                        <SelectTrigger 
                          className={validationErrors.some(e => e.field === 'contactId' && e.severity === 'error') ? 'border-red-300' : ''}
                        >
                          <SelectValue placeholder={
                            !formData.companyId 
                              ? "Select a company first" 
                              : availableContacts.length === 0 
                                ? "No contacts available"
                                : "Select a contact"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} - {contact.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formData.companyId && availableContacts.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          No contacts found for this company. Consider adding one first.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Sales Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div>
                      <Label htmlFor="stage">PEAK Stage</Label>
                      <Select value={formData.stage} onValueChange={(value) => handleFieldChange('stage', value)}>
                        <SelectTrigger>
                          <SelectValue />
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

                    <div>
                      <Label htmlFor="probability">Win Probability (%)</Label>
                      <Input
                        id="probability"
                        type="number"
                        value={formData.probability}
                        onChange={(e) => handleFieldChange('probability', e.target.value)}
                        min="0"
                        max="100"
                        step="5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleFieldChange('priority', value as any)}>
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

                    <div>
                      <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
                      <Input
                        id="expectedCloseDate"
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) => handleFieldChange('expectedCloseDate', e.target.value)}
                        className={validationErrors.some(e => e.field === 'expectedCloseDate' && e.severity === 'error') ? 'border-red-300' : ''}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleFieldChange('industry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRY_OPTIONS.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="leadSource">Lead Source</Label>
                      <Select value={formData.leadSource} onValueChange={(value) => handleFieldChange('leadSource', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="owner">Opportunity Owner</Label>
                      <Select value={formData.ownerId} onValueChange={(value) => handleFieldChange('ownerId', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="xl:col-span-3">
                      <Label>Tags</Label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          />
                          <Button type="button" onClick={addTag} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="ml-1 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t bg-muted/30">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {hasErrors && <AlertCircle className="h-4 w-4 text-red-500" />}
                {hasWarnings && !hasErrors && <Warning className="h-4 w-4 text-yellow-500" />}
                {!hasErrors && !hasWarnings && <CheckCircle className="h-4 w-4 text-green-500" />}
                <span>
                  {hasErrors 
                    ? `${validationErrors.filter(e => e.severity === 'error').length} errors`
                    : hasWarnings 
                      ? `${validationErrors.filter(e => e.severity === 'warning').length} warnings`
                      : 'Ready to save'
                  }
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={hasErrors || isSaving}
                  className="min-w-32"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingOpportunity ? 'Update' : 'Create'} Opportunity
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}