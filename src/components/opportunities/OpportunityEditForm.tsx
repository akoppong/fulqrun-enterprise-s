import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedSelect } from '@/components/ui/validated-select';
import { FormErrorBoundary } from '@/components/ui/form-error-boundary';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X, Warning, Info, CheckCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { toast } from 'sonner';
import { FormValidator, ValidationSchema } from '@/lib/validation';
import { errorHandler, withErrorHandling } from '@/lib/error-handling';

// Enhanced validation schema for opportunity form
const opportunityValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    custom: (value: string) => {
      if (value && /^\s+|\s+$/.test(value)) {
        return 'Title cannot start or end with spaces';
      }
      if (value && /\s{2,}/.test(value)) {
        return 'Title cannot contain consecutive spaces';
      }
      if (value && /^[0-9]+$/.test(value)) {
        return 'Title cannot be only numbers';
      }
      return null;
    }
  },
  description: {
    maxLength: 2000,
    custom: (value: string) => {
      if (value && value.length > 0 && value.length < 10) {
        return 'Description should be at least 10 characters for meaningful context';
      }
      return null;
    }
  },
  value: {
    required: true,
    min: 0,
    max: 1000000000,
    custom: (value: number, data?: any) => {
      if (value !== undefined && value > 0 && value < 100) {
        return 'Deal value seems unusually low. Please verify the amount.';
      }
      if (value !== undefined && value > 50000000) {
        return 'Deal value is very high. Please confirm this is correct.';
      }
      return null;
    }
  },
  probability: {
    required: true,
    min: 0,
    max: 100,
    custom: (value: number, data?: any) => {
      if (value !== undefined && data?.stage) {
        // Stage-based probability validation
        const stage = data.stage;
        if (stage === 'prospect' && value > 50) {
          return 'Probability seems high for Prospect stage (typically 0-25%)';
        }
        if (stage === 'qualification' && (value < 20 || value > 60)) {
          return 'Probability for Qualification stage typically ranges 20-50%';
        }
        if (stage === 'proposal' && (value < 40 || value > 80)) {
          return 'Probability for Proposal stage typically ranges 40-75%';
        }
        if (stage === 'negotiation' && value < 60) {
          return 'Probability for Negotiation stage typically 60%+';
        }
        if (stage === 'closing' && value < 80) {
          return 'Probability for Closing stage typically 80%+';
        }
      }
      return null;
    }
  },
  expectedCloseDate: {
    required: true,
    date: {
      allowPast: false,
      allowFuture: true,
      required: true,
      maxDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years from now
      custom: (value: Date) => {
        const now = new Date();
        const daysDiff = Math.ceil((value.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff < 7) {
          return 'Close date is very soon. Consider if this timeline is realistic.';
        }
        if (daysDiff > 730) {
          return 'Close date is more than 2 years away. Consider shorter milestones.';
        }
        return null;
      }
    }
  },
  companyId: {
    required: true,
    custom: (value: string) => {
      if (!value || value.trim() === '') {
        return 'Please select a company for this opportunity';
      }
      return null;
    }
  },
  stage: {
    required: true,
    custom: (value: string) => {
      const validStages = PEAK_STAGES.map(s => s.value);
      if (!validStages.includes(value)) {
        return 'Please select a valid PEAK stage';
      }
      return null;
    }
  },
  priority: {
    required: true,
    custom: (value: string) => {
      if (!['low', 'medium', 'high', 'critical'].includes(value)) {
        return 'Please select a valid priority level';
      }
      return null;
    }
  }
};

interface ValidationErrors {
  [key: string]: string;
}

interface FormValidationState {
  errors: ValidationErrors;
  touched: Set<string>;
  isValid: boolean;
  isValidating: boolean;
}
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  onSubmit?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
}

interface OpportunityEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  onSubmit?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
}

export function OpportunityEditForm({ isOpen, onClose, onSave, onSubmit, opportunity }: OpportunityEditFormProps) {
  return (
    <FormErrorBoundary
      context="OpportunityEditForm"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      resetOnPropsChange={true}
    >
      <OpportunityEditFormInner
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
        onSubmit={onSubmit}
        opportunity={opportunity}
      />
    </FormErrorBoundary>
  );
}

function OpportunityEditFormInner({ isOpen, onClose, onSave, onSubmit, opportunity }: OpportunityEditFormProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    value: 0,
    stage: 'prospect',
    probability: 25,
    expectedCloseDate: new Date().toISOString(),
    companyId: '',
    contactId: '',
    priority: 'medium',
    industry: '',
    leadSource: '',
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
  });
  
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced validation state
  const [validationState, setValidationState] = useState<FormValidationState>({
    errors: {},
    touched: new Set(),
    isValid: false,
    isValidating: false
  });
  
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [validator] = useState(() => new FormValidator(opportunityValidationSchema));

  // Options
  const industryOptions = [
    'Technology',
    'Healthcare',
    'Manufacturing',
    'Financial Services',
    'Retail',
    'Education',
    'Government',
    'Non-profit',
    'Other'
  ];

  const leadSourceOptions = [
    'Website',
    'Referral',
    'Cold Call',
    'Email Campaign',
    'Social Media',
    'Trade Show',
    'Partner',
    'Advertisement',
    'Other'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  // Enhanced validation functions
  const validateForm = useCallback((data: Partial<Opportunity>, showAllErrors = false) => {
    const result = validator.validate(data);
    
    setValidationState(prev => ({
      ...prev,
      errors: result.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as ValidationErrors),
      isValid: result.isValid,
      isValidating: false
    }));
    
    if (showAllErrors) {
      setShowValidationSummary(true);
      // Mark all fields as touched to show errors
      const allFields = Object.keys(opportunityValidationSchema);
      setValidationState(prev => ({
        ...prev,
        touched: new Set([...prev.touched, ...allFields])
      }));
    }
    
    return result;
  }, [validator]);

  const validateField = useCallback((fieldName: string, value: any, allData?: Partial<Opportunity>) => {
    const dataToValidate = allData || { ...formData, [fieldName]: value };
    const fieldSchema = { [fieldName]: opportunityValidationSchema[fieldName] };
    
    if (!fieldSchema[fieldName]) return;
    
    const fieldValidator = new FormValidator(fieldSchema);
    const result = fieldValidator.validate(dataToValidate);
    
    setValidationState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: result.errors[0]?.message || ''
      },
      touched: new Set([...prev.touched, fieldName])
    }));
    
    return result.isValid;
  }, [formData]);

  const getFieldError = useCallback((fieldName: string) => {
    const hasError = validationState.errors[fieldName];
    const isTouched = validationState.touched.has(fieldName);
    return (hasError && isTouched) ? validationState.errors[fieldName] : null;
  }, [validationState]);

  const hasFieldError = useCallback((fieldName: string) => {
    return validationState.touched.has(fieldName) && !!validationState.errors[fieldName];
  }, [validationState]);

  // Business logic validations
  const performBusinessValidations = useCallback((data: Partial<Opportunity>) => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for duplicate opportunities
    if (data.title && data.companyId) {
      // In a real app, you'd check against existing opportunities
      // For now, just a placeholder validation
    }

    // Value and probability correlation
    if (data.value && data.probability) {
      const expectedValue = data.value * (data.probability / 100);
      if (expectedValue < 1000 && data.priority === 'high') {
        warnings.push('High priority opportunity with low expected value');
      }
    }

    // Close date and stage alignment
    if (data.expectedCloseDate && data.stage) {
      const closeDate = new Date(data.expectedCloseDate);
      const daysDiff = Math.ceil((closeDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      
      if (data.stage === 'closing' && daysDiff > 30) {
        warnings.push('Closing stage opportunities typically close within 30 days');
      }
      
      if (data.stage === 'prospect' && daysDiff < 30) {
        warnings.push('Prospect stage opportunities typically have longer timelines');
      }
    }

    return { warnings, errors };
  }, []);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        expectedCloseDate: opportunity.expectedCloseDate
      });
      setTags(opportunity.tags || []);
      // Reset validation state for edit mode
      setValidationState({
        errors: {},
        touched: new Set(),
        isValid: false,
        isValidating: false
      });
      setShowValidationSummary(false);
    } else {
      // Reset form for new opportunity
      setFormData({
        title: '',
        description: '',
        value: 0,
        stage: 'prospect',
        probability: 25,
        expectedCloseDate: new Date().toISOString(),
        companyId: '',
        contactId: '',
        priority: 'medium',
        industry: '',
        leadSource: '',
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
      });
      setTags([]);
      setValidationState({
        errors: {},
        touched: new Set(),
        isValid: false,
        isValidating: false
      });
      setShowValidationSummary(false);
    }
  }, [opportunity, isOpen]);

  // Validate form whenever data changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      validateForm(formData);
    }
  }, [formData, validateForm]);

  const handleInputChange = useCallback((field: string, value: any) => {
    const newData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newData);
    
    // Validate field if it's been touched
    if (validationState.touched.has(field)) {
      validateField(field, value, newData);
    }
    
    // Auto-adjust probability based on stage
    if (field === 'stage' && value) {
      let newProbability = formData.probability;
      switch (value) {
        case 'prospect':
          newProbability = Math.min(newProbability || 25, 25);
          break;
        case 'qualification':
          newProbability = Math.max(Math.min(newProbability || 40, 50), 20);
          break;
        case 'proposal':
          newProbability = Math.max(Math.min(newProbability || 60, 75), 40);
          break;
        case 'negotiation':
          newProbability = Math.max(newProbability || 70, 60);
          break;
        case 'closing':
          newProbability = Math.max(newProbability || 85, 80);
          break;
      }
      
      if (newProbability !== formData.probability) {
        setFormData(prev => ({ ...prev, probability: newProbability }));
        toast.info('Probability adjusted', {
          description: `Probability updated to ${newProbability}% to align with ${value} stage`
        });
      }
    }
  }, [formData, validationState.touched, validateField]);

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error('Please enter a tag name');
      return;
    }
    
    if (newTag.trim().length < 2) {
      toast.error('Tag must be at least 2 characters long');
      return;
    }
    
    if (newTag.trim().length > 30) {
      toast.error('Tag cannot exceed 30 characters');
      return;
    }
    
    if (tags.includes(newTag.trim())) {
      toast.warning('This tag already exists');
      return;
    }
    
    if (tags.length >= 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }
    
    setTags(prev => [...prev, newTag.trim()]);
    setNewTag('');
    toast.success('Tag added successfully');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = withErrorHandling(async () => {
    // Mark all fields as touched for validation display
    setValidationState(prev => ({
      ...prev,
      touched: new Set(Object.keys(opportunityValidationSchema))
    }));

    // Perform comprehensive validation
    const validationResult = validateForm(formData, true);
    
    if (!validationResult.isValid) {
      setShowValidationSummary(true);
      
      // Focus on first error field
      const firstError = validationResult.errors[0];
      if (firstError) {
        const element = document.getElementById(firstError.field);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      toast.error('Please fix validation errors', {
        description: `Found ${validationResult.errors.length} error${validationResult.errors.length !== 1 ? 's' : ''} that need to be addressed`
      });
      return;
    }

    // Perform business logic validations
    const businessValidation = performBusinessValidations(formData);
    
    // Show warnings but don't block submission
    if (businessValidation.warnings.length > 0) {
      businessValidation.warnings.forEach(warning => {
        toast.warning('Business Logic Warning', {
          description: warning,
          duration: 5000
        });
      });
    }
    
    // Block submission on business errors
    if (businessValidation.errors.length > 0) {
      businessValidation.errors.forEach(error => {
        toast.error('Business Rule Violation', {
          description: error
        });
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const opportunityData = {
        ...formData,
        tags,
        updatedAt: new Date().toISOString()
      };

      if (!opportunity) {
        opportunityData.id = `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        opportunityData.createdAt = new Date().toISOString();
      }

      const callback = onSave || onSubmit;
      if (callback) {
        await callback(opportunityData);
      }
      
      onClose();
      setShowValidationSummary(false);
      
      toast.success(
        opportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully',
        {
          description: `"${formData.title}" has been ${opportunity ? 'updated' : 'added to your pipeline'}`,
          action: {
            label: 'View Pipeline',
            onClick: () => console.log('Navigate to pipeline')
          }
        }
      );
    } catch (error) {
      console.error('Error saving opportunity:', error);
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to save opportunity'),
        'high',
        { 
          context: 'OpportunityEditForm.handleSave',
          formData,
          isEdit: !!opportunity
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, { context: 'OpportunityEditForm.handleSave' });

  // Get filtered contacts based on selected company
  const availableContacts = formData.companyId 
    ? contacts.filter(contact => contact.companyId === formData.companyId)
    : contacts;

  const selectedCompany = companies.find(company => company.id === formData.companyId);
  const selectedContact = contacts.find(contact => contact.id === formData.contactId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
            {validationState.isValid && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {opportunity 
              ? `Update the details for ${formData.title || 'this opportunity'}`
              : 'Create a new sales opportunity and track it through the PEAK methodology'
            }
          </p>
        </DialogHeader>

        {/* Validation Summary */}
        {showValidationSummary && Object.keys(validationState.errors).length > 0 && (
          <div className="px-6 py-3 bg-destructive/5 border-b">
            <Alert variant="destructive">
              <Warning className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {Object.entries(validationState.errors)
                      .filter(([_, error]) => error)
                      .slice(0, 5) // Show only first 5 errors
                      .map(([field, error]) => (
                        <li key={field}>
                          <button
                            type="button"
                            className="text-left hover:underline"
                            onClick={() => {
                              const element = document.getElementById(field);
                              element?.focus();
                              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                          >
                            {error}
                          </button>
                        </li>
                      ))}
                  </ul>
                  {Object.keys(validationState.errors).length > 5 && (
                    <p className="text-sm">
                      And {Object.keys(validationState.errors).length - 5} more error{Object.keys(validationState.errors).length - 5 !== 1 ? 's' : ''}...
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0 dialog-scroll-area">
          <div className="px-6 py-6 space-y-8">
            {/* Opportunity Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Opportunity Details
                  <Badge variant={validationState.isValid ? "default" : "destructive"}>
                    {validationState.isValid ? "Valid" : "Needs Attention"}
                  </Badge>
                </CardTitle>
                <CardDescription>Core opportunity information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Basic Information Row */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ValidatedInput
                        id="title"
                        label="Opportunity Name"
                        type="text"
                        placeholder="Enter opportunity name"
                        value={formData.title || ''}
                        onChange={(value) => handleInputChange('title', value)}
                        error={getFieldError('title')}
                        validation={{
                          required: true,
                          minLength: 3,
                          maxLength: 200
                        }}
                        validateOn="blur"
                        onValidation={(isValid, error) => {
                          if (!isValid && error) {
                            setValidationState(prev => ({
                              ...prev,
                              errors: { ...prev.errors, title: error },
                              touched: new Set([...prev.touched, 'title'])
                            }));
                          }
                        }}
                      />

                      <ValidatedSelect
                        id="companyId"
                        label="Company"
                        placeholder="Select company"
                        value={formData.companyId || ''}
                        onChange={(value) => {
                          handleInputChange('companyId', value);
                          handleInputChange('contactId', ''); // Reset contact when company changes
                        }}
                        options={companies.map(company => ({
                          value: company.id,
                          label: company.name,
                          description: company.industry
                        }))}
                        validation={{
                          required: true
                        }}
                        error={getFieldError('companyId')}
                        validateOn="blur"
                        onValidation={(isValid, error) => {
                          if (!isValid && error) {
                            setValidationState(prev => ({
                              ...prev,
                              errors: { ...prev.errors, companyId: error },
                              touched: new Set([...prev.touched, 'companyId'])
                            }));
                          }
                        }}
                      />

                      <ValidatedInput
                        id="value"
                        label="Deal Value ($)"
                        type="number"
                        placeholder="750000"
                        value={formData.value?.toString() || ''}
                        onChange={(value) => handleInputChange('value', parseFloat(value) || 0)}
                        error={getFieldError('value')}
                        validation={{
                          required: true,
                          min: 0,
                          max: 1000000000,
                          custom: (value: string) => {
                            const numValue = parseFloat(value);
                            if (numValue > 0 && numValue < 100) {
                              return 'Deal value seems unusually low. Please verify the amount.';
                            }
                            if (numValue > 50000000) {
                              return 'Deal value is very high. Please confirm this is correct.';
                            }
                            return null;
                          }
                        }}
                        validateOn="blur"
                        onValidation={(isValid, error) => {
                          if (!isValid && error) {
                            setValidationState(prev => ({
                              ...prev,
                              errors: { ...prev.errors, value: error },
                              touched: new Set([...prev.touched, 'value'])
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Sales Information Row */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Sales Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <ValidatedInput
                        id="probability"
                        label="Win Probability (%)"
                        type="number"
                        placeholder="75"
                        value={formData.probability?.toString() || ''}
                        onChange={(value) => handleInputChange('probability', parseInt(value) || 0)}
                        error={getFieldError('probability')}
                        validation={{
                          required: true,
                          min: 0,
                          max: 100
                        }}
                        validateOn="blur"
                        onValidation={(isValid, error) => {
                          if (!isValid && error) {
                            setValidationState(prev => ({
                              ...prev,
                              errors: { ...prev.errors, probability: error },
                              touched: new Set([...prev.touched, 'probability'])
                            }));
                          }
                        }}
                      />

                      <ValidatedSelect
                        id="stage"
                        label="PEAK Stage"
                        placeholder="Select stage"
                        value={formData.stage || ''}
                        onChange={(value) => handleInputChange('stage', value)}
                        options={PEAK_STAGES.map(stage => ({
                          value: stage.value,
                          label: stage.label,
                          description: `Typical probability: ${stage.value === 'prospect' ? '0-25%' : 
                            stage.value === 'qualification' ? '20-50%' :
                            stage.value === 'proposal' ? '40-75%' :
                            stage.value === 'negotiation' ? '60-85%' : '80-95%'}`
                        }))}
                        validation={{
                          required: true
                        }}
                        error={getFieldError('stage')}
                        validateOn="blur"
                        onValidation={(isValid, error) => {
                          if (!isValid && error) {
                            setValidationState(prev => ({
                              ...prev,
                              errors: { ...prev.errors, stage: error },
                              touched: new Set([...prev.touched, 'stage'])
                            }));
                          }
                        }}
                      />

                      <ValidatedSelect
                        id="priority"
                        label="Priority"
                        placeholder="Select priority"
                        value={formData.priority || 'medium'}
                        onChange={(value) => handleInputChange('priority', value)}
                        options={priorityOptions.map(priority => ({
                          value: priority.value,
                          label: priority.label,
                          description: `${priority.value === 'low' ? 'Standard follow-up' :
                            priority.value === 'medium' ? 'Regular attention' :
                            priority.value === 'high' ? 'Close monitoring' : 'Immediate action required'}`
                        }))}
                        validation={{
                          required: true
                        }}
                        error={getFieldError('priority')}
                        validateOn="blur"
                        onValidation={(isValid, error) => {
                          if (!isValid && error) {
                            setValidationState(prev => ({
                              ...prev,
                              errors: { ...prev.errors, priority: error },
                              touched: new Set([...prev.touched, 'priority'])
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Contact & Status Details Row */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Contact & Status Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="primary-contact" className="text-sm font-medium">
                          Primary Contact
                        </Label>
                        <Select 
                          value={formData.contactId} 
                          onValueChange={(value) => handleInputChange('contactId', value)}
                          disabled={!formData.companyId}
                        >
                          <SelectTrigger id="primary-contact" className="w-full">
                            <SelectValue placeholder={formData.companyId ? "Select contact" : "Select company first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableContacts.map((contact) => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {contact.firstName} {contact.lastName} - {contact.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-sm font-medium">
                          Contact Email
                        </Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="john.anderson@techflow.com"
                          value={selectedContact?.email || ''}
                          disabled
                          className="w-full bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-phone" className="text-sm font-medium">
                          Contact Phone
                        </Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          placeholder="+1-555-0101"
                          value={selectedContact?.phone || ''}
                          disabled
                          className="w-full bg-muted"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business & Market Details Row */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Business & Market Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-sm font-medium">
                          Industry
                        </Label>
                        <Select value={formData.industry || selectedCompany?.industry || ''} onValueChange={(value) => handleInputChange('industry', value)}>
                          <SelectTrigger id="industry" className="w-full">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {industryOptions.map((industry) => (
                              <SelectItem key={industry} value={industry.toLowerCase()}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lead-source" className="text-sm font-medium">
                          Lead Source
                        </Label>
                        <Select value={formData.leadSource || ''} onValueChange={(value) => handleInputChange('leadSource', value)}>
                          <SelectTrigger id="lead-source" className="w-full">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {leadSourceOptions.map((source) => (
                              <SelectItem key={source} value={source.toLowerCase()}>
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expected-close-date" className="text-sm font-medium">
                          Expected Close Date <span className="text-destructive">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !formData.expectedCloseDate && 'text-muted-foreground',
                                hasFieldError('expectedCloseDate') && 'border-destructive'
                              )}
                              id="expected-close-date"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.expectedCloseDate ? (
                                format(new Date(formData.expectedCloseDate), 'MM/dd/yyyy')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined}
                              onSelect={(date) => {
                                handleInputChange('expectedCloseDate', date?.toISOString());
                                setValidationState(prev => ({
                                  ...prev,
                                  touched: new Set([...prev.touched, 'expectedCloseDate'])
                                }));
                              }}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        {hasFieldError('expectedCloseDate') && (
                          <Alert variant="destructive" className="py-2">
                            <Warning className="w-4 h-4" />
                            <AlertDescription className="text-sm">
                              {getFieldError('expectedCloseDate')}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags Section */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Tags</h4>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md bg-background">
                        {tags.length > 0 ? (
                          tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                <X size={12} />
                              </Button>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No tags added</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opportunity Description</CardTitle>
                <CardDescription>Detailed description, requirements, and notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the opportunity, key requirements, decision factors, timeline, and any important notes..."
                    value={formData.description || ''}
                    onChange={(e) => {
                      handleInputChange('description', e.target.value);
                      if (validationState.touched.has('description')) {
                        validateField('description', e.target.value);
                      }
                    }}
                    onBlur={() => {
                      setValidationState(prev => ({
                        ...prev,
                        touched: new Set([...prev.touched, 'description'])
                      }));
                      validateField('description', formData.description || '');
                    }}
                    className={cn(
                      "min-h-[120px] w-full resize-none",
                      hasFieldError('description') && "border-destructive"
                    )}
                  />
                  {hasFieldError('description') && (
                    <Alert variant="destructive" className="py-2">
                      <Warning className="w-4 h-4" />
                      <AlertDescription className="text-sm">
                        {getFieldError('description')}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="text-xs text-muted-foreground text-right">
                    {(formData.description || '').length}/2000 characters
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-background shrink-0">
          <div className="flex items-center gap-2">
            {validationState.isValid ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Ready to save</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                <span className="text-sm">
                  {Object.keys(validationState.errors).filter(key => validationState.errors[key]).length} error{Object.keys(validationState.errors).filter(key => validationState.errors[key]).length !== 1 ? 's' : ''} to fix
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !validationState.isValid}
              className="min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                opportunity ? 'Update Opportunity' : 'Create Opportunity'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}