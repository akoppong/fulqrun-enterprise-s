import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
import { Separator } from '@/components/ui/separator';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X, Warning, Info, CheckCircle, Save, XCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { toast } from 'sonner';
import { FormValidator, ValidationSchema } from '@/lib/validation';
import { errorHandler, withErrorHandling } from '@/lib/error-handling';
import { usePerformanceMonitoring } from '@/lib/performance-monitor';

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
  companyId: {
    required: true,
    custom: (value: string) => {
      if (!value || value === 'no-companies-available') {
        return 'Please select a company for this opportunity';
      }
      return null;
    }
  },
  contactId: {
    required: false, // Contact is optional if no contacts available for company
    custom: (value: string, data?: any) => {
      // If a company is selected and contacts are available, contact should be selected
      if (data?.companyId && !value) {
        return 'Please select a primary contact if available, or add contacts for this company';
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
    custom: (value: number) => {
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
    custom: (value: any): string | null => {
      if (!value) return 'Expected close date is required';
      
      let date: Date;
      try {
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue === '') return 'Expected close date is required';
          date = new Date(trimmedValue);
        } else if (value instanceof Date) {
          date = value;
        } else if (typeof value === 'object' && value !== null) {
          try {
            if ('getTime' in value && typeof value.getTime === 'function') {
              date = new Date(value.getTime());
            } else if ('toISOString' in value && typeof value.toISOString === 'function') {
              date = new Date(value.toISOString());
            } else {
              date = new Date(String(value));
            }
          } catch {
            return 'Please enter a valid date';
          }
        } else {
          try {
            date = new Date(value);
          } catch {
            return 'Please enter a valid date';
          }
        }
        
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
          return 'Please enter a valid date';
        }
        
        // Additional date validation
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000));
        
        if (date < threeDaysAgo) {
          return 'Expected close date cannot be more than 3 days in the past';
        }
        
        const daysDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff > 730) {
          return 'Close date is more than 2 years away. Consider shorter milestones.';
        }
        
      } catch (error) {
        return 'Please enter a valid date';
      }
      
      return null;
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

interface OpportunityEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  onSubmit?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
}

function OpportunityEditFormInner({ isOpen, onClose, onSave, onSubmit, opportunity }: OpportunityEditFormProps) {
  // Performance monitoring
  usePerformanceMonitoring('OpportunityEditForm');

  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  
  // Form state with proper defaults
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
    tags: [],
    ownerId: 'current-user',
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Enhanced validation state
  const [validationState, setValidationState] = useState<FormValidationState>({
    errors: {},
    touched: new Set(),
    isValid: true,
    isValidating: false
  });
  
  const [validator] = useState(() => new FormValidator(opportunityValidationSchema));

  // Initialize sample data if needed
  useEffect(() => {
    const initializeSampleData = async () => {
      if (companies.length === 0 || contacts.length === 0) {
        try {
          const { initializeSampleData } = await import('@/data/sample-opportunities');
          const sampleData = await initializeSampleData();
          
          if (companies.length === 0 && sampleData.companies.length > 0) {
            setCompanies(sampleData.companies);
          }
          
          if (contacts.length === 0 && sampleData.contacts.length > 0) {
            setContacts(sampleData.contacts);
          }
        } catch (error) {
          console.error('Failed to initialize sample data:', error);
        }
      }
    };

    initializeSampleData();
  }, [companies.length, contacts.length, setCompanies, setContacts]);

  // Options
  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical Priority', color: 'bg-red-100 text-red-800' }
  ];

  const industryOptions = [
    'Technology', 'Healthcare', 'Manufacturing', 'Financial Services',
    'Retail', 'Education', 'Government', 'Non-profit', 'Other'
  ];

  const leadSourceOptions = [
    'Website', 'Referral', 'Cold Call', 'Email Campaign',
    'Social Media', 'Trade Show', 'Partner', 'Advertisement', 'Other'
  ];

  // Validation functions
  const validateField = useCallback((field: string, value: any, allData?: any) => {
    try {
      const result = validator.validateField(field, value, allData || formData);
      
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: result.error || ''
        },
        touched: new Set([...prev.touched, field])
      }));
      
      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      setValidationState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: 'Validation error occurred'
        },
        touched: new Set([...prev.touched, field])
      }));
      return false;
    }
  }, [formData, validator]);

  const validateForm = useCallback(withErrorHandling(async (data: Partial<Opportunity>) => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = validator.validate(data);
      
      // Convert ValidationError[] to ValidationErrors object
      const errorMap: ValidationErrors = {};
      if (result.errors && Array.isArray(result.errors)) {
        result.errors.forEach(error => {
          if (error && typeof error === 'object' && 'field' in error && 'message' in error) {
            errorMap[error.field] = String(error.message);
          }
        });
      }
      
      setValidationState(prev => ({
        ...prev,
        errors: errorMap,
        isValid: result.isValid,
        isValidating: false
      }));
      
      return result.isValid;
    } catch (error) {
      console.error('Form validation error:', error);
      setValidationState(prev => ({
        ...prev,
        errors: { general: 'Validation error occurred' },
        isValid: false,
        isValidating: false
      }));
      return false;
    }
  }, { context: 'OpportunityEditForm.validateForm' }), [validator]);

  // Initialize form data when opportunity changes
  useEffect(() => {
    if (opportunity) {
      setFormData({
        title: opportunity.title || '',
        description: opportunity.description || '',
        value: opportunity.value || 0,
        stage: opportunity.stage || 'prospect',
        probability: opportunity.probability || 25,
        expectedCloseDate: opportunity.expectedCloseDate || new Date().toISOString(),
        companyId: opportunity.companyId || '',
        contactId: opportunity.contactId || '',
        priority: opportunity.priority || 'medium',
        industry: opportunity.industry || '',
        leadSource: opportunity.leadSource || '',
        tags: opportunity.tags || [],
        ownerId: opportunity.ownerId || 'current-user',
        meddpicc: opportunity.meddpicc || {
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
      
      setSelectedDate(new Date(opportunity.expectedCloseDate || new Date().toISOString()));
    } else if (isOpen) {
      // Reset form for new opportunity
      const defaultData = {
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
        tags: [],
        ownerId: 'current-user',
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
      setFormData(defaultData);
      setSelectedDate(new Date());
      setValidationState({
        errors: {},
        touched: new Set(),
        isValid: true,
        isValidating: false
      });
    }
  }, [opportunity, isOpen]);

  // Validate form whenever data changes (but prevent validation loops)
  useEffect(() => {
    if (Object.keys(formData).length > 0 && !validationState.isValidating) {
      // Debounce validation to prevent excessive calls
      const timeoutId = setTimeout(() => {
        validateForm(formData);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [formData, validationState.isValidating, validateForm]);

  const handleInputChange = useCallback((field: string, value: any) => {
    console.log(`Field "${field}" changed to:`, value); // Debug log
    
    const newData = {
      ...formData,
      [field]: value
    };
    
    console.log('Setting new form data:', newData); // Debug log
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

  // Specialized handler for company selection
  const handleCompanyChange = useCallback((companyId: string) => {
    console.log('Company selection:', companyId);
    
    if (!companyId || companyId === 'no-companies-available') {
      return;
    }

    // Get the company details for auto-filling
    const selectedCompany = companies.find(company => company.id === companyId);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        companyId,
        // Clear contact if switching to a different company
        contactId: companyId !== prev.companyId ? '' : prev.contactId,
        // Auto-fill industry if available and not already set
        industry: prev.industry || (selectedCompany?.industry) || '',
      };
      
      console.log('Updated form data with company:', newData);
      return newData;
    });

    // Show toast if contact was cleared
    if (companyId !== formData.companyId && formData.contactId) {
      toast.info('Contact cleared', {
        description: 'Contact selection cleared due to company change'
      });
    }
    
    // Show information about available contacts
    const availableContactsForCompany = contacts.filter(contact => contact.companyId === companyId);
    if (availableContactsForCompany.length > 0) {
      toast.success(`Company selected`, {
        description: `${availableContactsForCompany.length} contact${availableContactsForCompany.length === 1 ? '' : 's'} available for this company`
      });
    } else {
      toast.warning('No contacts available', {
        description: 'No contacts found for this company. You may need to add contacts first.'
      });
    }
    
    // Validate the company selection
    validateField('companyId', companyId);
  }, [formData.companyId, formData.contactId, companies, contacts, validateField]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      handleInputChange('expectedCloseDate', date.toISOString());
      setShowCalendar(false);
    }
  };

  const handleSave = useCallback(withErrorHandling(async () => {
    // Validate form before proceeding
    const isValid = await validateForm(formData);
    
    if (!isValid) {
      toast.error('Please fix form errors before saving');
      return;
    }

    // Additional business validation
    if (!formData.companyId) {
      toast.error('Please select a company');
      return;
    }

    if (formData.companyId && availableContacts.length === 0 && !formData.contactId) {
      // Show a warning but allow saving without contact if none are available
      toast.warning('No contacts available', {
        description: 'Saving opportunity without primary contact. Add contacts for this company later.'
      });
    }

    setIsLoading(true);
    
    try {
      const opportunityData: Partial<Opportunity> = {
        ...formData,
        expectedCloseDate: selectedDate?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: opportunity?.createdAt || new Date().toISOString(),
        id: opportunity?.id || Date.now().toString(),
      };

      if (onSave) {
        await onSave(opportunityData);
      } else if (onSubmit) {
        await onSubmit(opportunityData);
      }

      toast.success(
        opportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully'
      );
      onClose();
    } catch (error) {
      errorHandler.handleError(
        error instanceof Error ? error : new Error('Failed to save opportunity'),
        { 
          context: 'OpportunityEditForm.handleSave',
          formData,
          isEdit: !!opportunity
        },
        'high'
      );
    } finally {
      setIsLoading(false);
    }
  }, { context: 'OpportunityEditForm.handleSave' }), [
    formData, selectedDate, opportunity, onSave, onSubmit, onClose, validateForm, availableContacts
  ]);

  // Get filtered contacts based on selected company
  const availableContacts = formData.companyId 
    ? contacts.filter(contact => contact.companyId === formData.companyId)
    : [];

  const selectedCompany = companies.find(company => company.id === formData.companyId);
  const selectedContact = contacts.find(contact => contact.id === formData.contactId);
  const shouldShowNoContactsAlert = formData.companyId && availableContacts.length === 0;

  // Helper function to get contact display name
  const getContactDisplayName = (contact: Contact): string => {
    return `${contact.firstName} ${contact.lastName}`.trim() || contact.email || 'Unknown Contact';
  };

  const getFieldError = (field: string): string => {
    if (!validationState.touched.has(field)) return '';
    const error = validationState.errors[field];
    if (typeof error === 'string') return error;
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String(error.message);
    }
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="opportunity-edit-form-dialog max-w-[98vw] w-[98vw] h-[98vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-8 py-6 border-b shrink-0 bg-muted/30">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
            {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
            {validationState.isValid ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-muted-foreground" />
            )}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            {opportunity 
              ? `Update the details for "${formData.title || 'this opportunity'}"`
              : 'Create a new sales opportunity and track it through the PEAK methodology'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Validation Summary */}
        {validationState.errors && Object.keys(validationState.errors).length > 0 && (
          <div className="px-8 py-4 bg-destructive/5 border-b border-destructive/20">
            <Alert variant="destructive" className="border-destructive/30">
              <Warning className="w-5 h-5" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Please fix the following errors:</p>
                  <ul className="list-disc list-inside text-sm space-y-1 max-h-20 overflow-y-auto">
                    {Object.entries(validationState.errors)
                      .map(([field, error]) => {
                        // Convert error to string safely
                        let errorText = '';
                        if (typeof error === 'string') {
                          errorText = error.trim();
                        } else if (typeof error === 'object' && error && 'message' in error) {
                          errorText = String(error.message).trim();
                        } else if (error) {
                          errorText = String(error).trim();
                        }
                        
                        // Only return if we have a valid error text
                        if (!errorText) return null;
                        
                        return (
                          <li key={field} className="text-destructive">
                            <span className="font-medium">{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {errorText}
                          </li>
                        );
                      })
                      .filter(Boolean) // Remove null entries
                      .slice(0, 5)}
                  </ul>
                  {(() => {
                    const validErrorCount = Object.entries(validationState.errors)
                      .filter(([_, error]) => {
                        if (typeof error === 'string') return error.trim().length > 0;
                        if (typeof error === 'object' && error && 'message' in error) return String(error.message).trim().length > 0;
                        return error && String(error).trim().length > 0;
                      }).length;
                    
                    return validErrorCount > 5 && (
                      <p className="text-sm text-destructive">
                        And {validErrorCount - 5} more error(s)...
                      </p>
                    );
                  })()}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-8 py-8 space-y-8 max-w-none">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  Basic Information
                  <Badge variant={formData.title && formData.companyId ? "default" : "secondary"}>
                    {formData.title && formData.companyId ? "Complete" : "Required"}
                  </Badge>
                </CardTitle>
                <CardDescription>Core opportunity details and company selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Opportunity Name */}
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Opportunity Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Enterprise Software License"
                      value={formData.title || ''}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      onBlur={() => validateField('title', formData.title)}
                      className={cn(
                        "h-12 text-base",
                        getFieldError('title') && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {getFieldError('title') && (
                      <p className="text-sm text-destructive">{getFieldError('title')}</p>
                    )}
                  </div>

                  {/* Company Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="company" className="text-sm font-medium">
                      Company <span className="text-destructive">*</span>
                    </Label>
                    
                    {/* Debug info (remove in production) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-muted-foreground border p-2 rounded">
                        <p>Companies loaded: {companies.length}</p>
                        <p>Current companyId: {formData.companyId || 'none'}</p>
                        <p>Selected company: {selectedCompany?.name || 'none'}</p>
                        <p>Available contacts: {availableContacts.length}</p>
                        <p>Current contactId: {formData.contactId || 'none'}</p>
                        <p>Selected contact: {selectedContact ? getContactDisplayName(selectedContact) : 'none'}</p>
                      </div>
                    )}
                    
                    <Select 
                      key={`company-select-${companies.length}-${formData.companyId}-refresh`}
                      value={formData.companyId || ''} 
                      onValueChange={handleCompanyChange}
                    >
                      <SelectTrigger 
                        id="company" 
                        className={cn(
                          "h-12 text-base",
                          getFieldError('companyId') && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        <SelectValue 
                          placeholder={companies.length === 0 ? "Loading companies..." : "Select a company"}
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {companies.length > 0 ? (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{company.name}</span>
                                {company.industry && (
                                  <span className="text-xs text-muted-foreground">{company.industry}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-companies-available" disabled>
                            Loading companies...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {getFieldError('companyId') && (
                      <p className="text-sm text-destructive">{getFieldError('companyId')}</p>
                    )}
                  </div>

                  {/* Primary Contact */}
                  <div className="space-y-3">
                    <Label htmlFor="contact" className="text-sm font-medium">
                      Primary Contact <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      key={`contact-select-${availableContacts.length}-${formData.contactId}-${formData.companyId}`}
                      value={formData.contactId || ''} 
                      onValueChange={(value) => handleInputChange('contactId', value)}
                      disabled={!selectedCompany}
                    >
                      <SelectTrigger 
                        id="contact" 
                        className={cn(
                          "h-12 text-base",
                          getFieldError('contactId') && "border-destructive focus-visible:ring-destructive",
                          !selectedCompany && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <SelectValue 
                          placeholder={
                            !selectedCompany 
                              ? "Select company first" 
                              : availableContacts.length === 0
                                ? "No contacts for this company"
                                : "Select a contact"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCompany && availableContacts.length > 0 ? (
                          availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{getContactDisplayName(contact)}</span>
                                {contact.title && (
                                  <span className="text-xs text-muted-foreground">{contact.title}</span>
                                )}
                                {contact.email && (
                                  <span className="text-xs text-muted-foreground">{contact.email}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-contacts" disabled>
                            {!selectedCompany ? "Select company first" : "No contacts available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {getFieldError('contactId') && (
                      <p className="text-sm text-destructive">{getFieldError('contactId')}</p>
                    )}
                  </div>
                </div>
                
                {/* No contacts alert */}
                {shouldShowNoContactsAlert && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Info className="w-4 h-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <div className="flex flex-col gap-2">
                        <p>
                          <strong>No contacts available for {selectedCompany?.name}</strong>
                        </p>
                        <p className="text-sm">
                          You can proceed without a primary contact and add one later, or you can add a contact for this company first.
                        </p>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          className="w-fit mt-2"
                          onClick={() => {
                            toast.info('Contact Management', {
                              description: 'Contact management feature will be available in the next update'
                            });
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Contact for {selectedCompany?.name}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Description - Full width */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the opportunity, key requirements, and expected outcomes..."
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    onBlur={() => validateField('description', formData.description)}
                    className={cn(
                      "min-h-[100px] text-base resize-y",
                      getFieldError('description') && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {getFieldError('description') && (
                    <p className="text-sm text-destructive">{getFieldError('description')}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {(formData.description || '').length}/2000 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sales Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Sales Information</CardTitle>
                <CardDescription>Deal value, stage, and probability settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Deal Value */}
                  <div className="space-y-3">
                    <Label htmlFor="value" className="text-sm font-medium">
                      Deal Value ($) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="750000"
                      value={formData.value?.toString() || ''}
                      onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                      onBlur={() => validateField('value', formData.value)}
                      className={cn(
                        "h-12 text-base",
                        getFieldError('value') && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {getFieldError('value') && (
                      <p className="text-sm text-destructive">{getFieldError('value')}</p>
                    )}
                  </div>

                  {/* Win Probability */}
                  <div className="space-y-3">
                    <Label htmlFor="probability" className="text-sm font-medium">
                      Win Probability (%) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="75"
                      value={formData.probability?.toString() || ''}
                      onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                      onBlur={() => validateField('probability', formData.probability)}
                      className={cn(
                        "h-12 text-base",
                        getFieldError('probability') && "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {getFieldError('probability') && (
                      <p className="text-sm text-destructive">{getFieldError('probability')}</p>
                    )}
                  </div>

                  {/* PEAK Stage */}
                  <div className="space-y-3">
                    <Label htmlFor="stage" className="text-sm font-medium">
                      PEAK Stage <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.stage || ''} 
                      onValueChange={(value) => handleInputChange('stage', value)}
                    >
                      <SelectTrigger 
                        id="stage" 
                        className={cn(
                          "h-12 text-base",
                          getFieldError('stage') && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {PEAK_STAGES.map(stage => (
                          <SelectItem key={stage.value} value={stage.value}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{stage.label}</span>
                              <span className="text-xs text-muted-foreground">
                                Typical probability: {
                                  stage.value === 'prospect' ? '0-25%' : 
                                  stage.value === 'qualification' ? '20-50%' :
                                  stage.value === 'proposal' ? '40-75%' :
                                  stage.value === 'negotiation' ? '60-85%' : '80-95%'
                                }
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError('stage') && (
                      <p className="text-sm text-destructive">{getFieldError('stage')}</p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="space-y-3">
                    <Label htmlFor="priority" className="text-sm font-medium">
                      Priority <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.priority || 'medium'} 
                      onValueChange={(value) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger 
                        id="priority" 
                        className={cn(
                          "h-12 text-base",
                          getFieldError('priority') && "border-destructive focus-visible:ring-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-3">
                              <Badge className={priority.color}>{priority.label}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {priority.value === 'low' ? 'Standard follow-up' :
                                 priority.value === 'medium' ? 'Regular attention' :
                                 priority.value === 'high' ? 'Close monitoring' : 'Immediate action required'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError('priority') && (
                      <p className="text-sm text-destructive">{getFieldError('priority')}</p>
                    )}
                  </div>

                  {/* Expected Close Date */}
                  <div className="space-y-3">
                    <Label htmlFor="close-date" className="text-sm font-medium">
                      Expected Close Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          id="close-date"
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left text-base font-normal",
                            !selectedDate && "text-muted-foreground",
                            getFieldError('expectedCloseDate') && "border-destructive focus-visible:ring-destructive"
                          )}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {getFieldError('expectedCloseDate') && (
                      <p className="text-sm text-destructive">{getFieldError('expectedCloseDate')}</p>
                    )}
                  </div>

                  {/* Owner Assignment - New field for better organization */}
                  <div className="space-y-3">
                    <Label htmlFor="owner" className="text-sm font-medium">
                      Opportunity Owner
                    </Label>
                    <Select 
                      value={formData.ownerId || 'current-user'} 
                      onValueChange={(value) => handleInputChange('ownerId', value)}
                    >
                      <SelectTrigger id="owner" className="h-12 text-base">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current-user">Current User</SelectItem>
                        <SelectItem value="team-lead">Team Lead</SelectItem>
                        <SelectItem value="sales-manager">Sales Manager</SelectItem>
                        <SelectItem value="account-manager">Account Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Additional Information */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Additional Information</CardTitle>
                <CardDescription>Industry classification and lead source tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* No contacts alert */}
                {shouldShowNoContactsAlert && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Warning className="w-4 h-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      The selected company ({selectedCompany?.name}) has no contacts in the system. 
                      Consider adding a contact for this company first to ensure proper opportunity tracking.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Industry */}
                  <div className="space-y-3">
                    <Label htmlFor="industry" className="text-sm font-medium">
                      Industry
                    </Label>
                    <Select 
                      value={formData.industry || ''} 
                      onValueChange={(value) => handleInputChange('industry', value)}
                    >
                      <SelectTrigger id="industry" className="h-12 text-base">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.filter(industry => industry && industry.trim()).map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lead Source */}
                  <div className="space-y-3">
                    <Label htmlFor="lead-source" className="text-sm font-medium">
                      Lead Source
                    </Label>
                    <Select 
                      value={formData.leadSource || ''} 
                      onValueChange={(value) => handleInputChange('leadSource', value)}
                    >
                      <SelectTrigger id="lead-source" className="h-12 text-base">
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadSourceOptions.filter(source => source && source.trim()).map(source => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>
              {validationState.isValid ? 
                "Form is valid and ready to submit" : 
                `${Object.keys(validationState.errors).length} field(s) need attention`
              }
            </span>
          </div>
          
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!validationState.isValid || isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function OpportunityEditForm(props: OpportunityEditFormProps) {
  return (
    <EnhancedErrorBoundary
      context="OpportunityEditForm"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      resetOnPropsChange={true}
      monitorPerformance={true}
    >
      <OpportunityEditFormInner {...props} />
    </EnhancedErrorBoundary>
  );
}

// Export as ModernOpportunityEditForm for compatibility
export const ModernOpportunityEditForm = OpportunityEditForm;