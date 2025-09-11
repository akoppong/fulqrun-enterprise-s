import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedForm } from '@/components/ui/validated-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ValidationSchema } from '@/lib/validation';
import { errorHandler } from '@/lib/error-handling';
import { Info, DollarSign, Users, Target } from '@phosphor-icons/react';
import { toast } from 'sonner';

// Enhanced validation schema for opportunity creation
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
      return null;
    }
  },
  description: {
    maxLength: 1000
  },
  value: {
    required: true,
    min: 0,
    max: 1000000000,
    custom: (value: number) => {
      if (value !== undefined && value > 0 && value < 100) {
        return 'Deal value seems unusually low. Please verify the amount.';
      }
      return null;
    }
  },
  probability: {
    required: true,
    min: 0,
    max: 100
  },
  expectedCloseDate: {
    required: true,
    date: {
      allowPast: false,
      allowFuture: true,
      required: true,
      maxDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years from now
    }
  },
  stage: {
    required: true,
    custom: (value: string) => {
      const validStages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closing'];
      if (!validStages.includes(value)) {
        return 'Please select a valid stage';
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
  },
  contactName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  contactEmail: {
    email: true
  },
  companyName: {
    required: true,
    minLength: 1,
    maxLength: 200
  },
  companySize: {
    min: 1,
    max: 1000000
  }
};

const STAGES = [
  { value: 'prospecting', label: 'Prospecting', color: 'bg-gray-100' },
  { value: 'qualification', label: 'Qualification', color: 'bg-blue-100' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-100' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { value: 'closing', label: 'Closing', color: 'bg-green-100' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

interface CreateOpportunityFormProps {
  onSubmit: (opportunity: any) => Promise<void>;
  initialData?: Partial<any>;
}

export function CreateOpportunityForm({ onSubmit, initialData = {} }: CreateOpportunityFormProps) {
  const defaultData = {
    title: '',
    description: '',
    value: 0,
    probability: 50,
    expectedCloseDate: '',
    stage: 'prospecting',
    priority: 'medium',
    contactName: '',
    contactEmail: '',
    companyName: '',
    companySize: undefined,
    ...initialData
  };

  const handleFormSubmit = async (data: Record<string, any>, { setSubmitting, setError }: any) => {
    try {
      // Additional business logic validation
      const closeDate = new Date(data.expectedCloseDate);
      const now = new Date();
      const daysDiff = Math.ceil((closeDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysDiff < 7) {
        toast.warning('Close date is very soon', {
          description: 'Consider if this timeline is realistic for the current stage.'
        });
      }

      if (data.probability > 90 && data.stage !== 'closing') {
        toast.warning('High probability with early stage', {
          description: 'High probability typically indicates later stages.'
        });
      }

      // Format the data
      const opportunity = {
        ...data,
        value: parseFloat(data.value),
        probability: parseInt(data.probability),
        companySize: data.companySize ? parseInt(data.companySize) : undefined,
        expectedCloseDate: new Date(data.expectedCloseDate).toISOString(),
        createdAt: new Date().toISOString(),
        id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      await onSubmit(opportunity);
      
      toast.success('Opportunity created successfully!', {
        description: `"${data.title}" has been added to your pipeline.`,
        action: {
          label: 'View Pipeline',
          onClick: () => {
            // TODO: Implement navigation to pipeline view
            if (process.env.NODE_ENV === 'development') {
              console.log('Navigate to pipeline');
            }
          }
        }
      });
    } catch (error) {
      errorHandler.handleError(error as Error, 'medium', { 
        context: 'CreateOpportunity',
        formData: data 
      });
      setError('Failed to create opportunity. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Create New Opportunity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ValidatedForm
          schema={opportunityValidationSchema}
          initialData={defaultData}
          onSubmit={handleFormSubmit}
          submitText="Create Opportunity"
          showReset={true}
          validateOnChange={false}
          showSuccessMessage={true}
          successMessage="Opportunity created and added to your pipeline!"
        >
          {({ data, setData, getFieldError, hasFieldError, isSubmitting, isValid, submitError }) => (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <ValidatedInput
                      id="title"
                      label="Opportunity Title"
                      type="text"
                      placeholder="Enter a descriptive title for this opportunity"
                      value={data.title || ''}
                      onChange={(value) => setData('title', value)}
                      error={getFieldError('title')}
                      validation={{
                        required: true,
                        minLength: 3,
                        maxLength: 200
                      }}
                      validateOn="blur"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the opportunity, key requirements, or notes..."
                        value={data.description || ''}
                        onChange={(e) => setData('description', e.target.value)}
                        className={hasFieldError('description') ? 'border-destructive' : ''}
                        rows={3}
                      />
                      {hasFieldError('description') && (
                        <p className="text-sm text-destructive">{getFieldError('description')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Financial Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ValidatedInput
                    id="value"
                    label="Deal Value"
                    type="number"
                    placeholder="0"
                    value={data.value?.toString() || ''}
                    onChange={(value) => setData('value', value)}
                    error={getFieldError('value')}
                    validation={{
                      required: true,
                      min: 0
                    }}
                    validateOn="blur"
                  />

                  <ValidatedInput
                    id="probability"
                    label="Win Probability (%)"
                    type="number"
                    placeholder="50"
                    value={data.probability?.toString() || ''}
                    onChange={(value) => setData('probability', value)}
                    error={getFieldError('probability')}
                    validation={{
                      required: true,
                      min: 0,
                      max: 100
                    }}
                    validateOn="blur"
                  />

                  <ValidatedInput
                    id="expectedCloseDate"
                    label="Expected Close Date"
                    type="date"
                    value={data.expectedCloseDate || ''}
                    onChange={(value) => setData('expectedCloseDate', value)}
                    error={getFieldError('expectedCloseDate')}
                    validation={{
                      required: true
                    }}
                    validateOn="blur"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="stage">
                      Current Stage <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={data.stage || ''} 
                      onValueChange={(value) => setData('stage', value)}
                    >
                      <SelectTrigger 
                        id="stage" 
                        className={hasFieldError('stage') ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAGES.map((stage) => (
                          <SelectItem key={stage.value} value={stage.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                              {stage.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasFieldError('stage') && (
                      <p className="text-sm text-destructive">{getFieldError('stage')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      Priority <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={data.priority || ''} 
                      onValueChange={(value) => setData('priority', value)}
                    >
                      <SelectTrigger 
                        id="priority" 
                        className={hasFieldError('priority') ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <Badge variant="outline" className={priority.color}>
                              {priority.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasFieldError('priority') && (
                      <p className="text-sm text-destructive">{getFieldError('priority')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Contact & Company</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ValidatedInput
                    id="contactName"
                    label="Primary Contact"
                    type="text"
                    placeholder="Contact person name"
                    value={data.contactName || ''}
                    onChange={(value) => setData('contactName', value)}
                    error={getFieldError('contactName')}
                    validation={{
                      required: true,
                      minLength: 2
                    }}
                    validateOn="blur"
                  />

                  <ValidatedInput
                    id="contactEmail"
                    label="Contact Email"
                    type="email"
                    placeholder="contact@company.com"
                    value={data.contactEmail || ''}
                    onChange={(value) => setData('contactEmail', value)}
                    error={getFieldError('contactEmail')}
                    validation={{
                      email: true
                    }}
                    validateOn="blur"
                  />

                  <ValidatedInput
                    id="companyName"
                    label="Company Name"
                    type="text"
                    placeholder="Company or organization name"
                    value={data.companyName || ''}
                    onChange={(value) => setData('companyName', value)}
                    error={getFieldError('companyName')}
                    validation={{
                      required: true,
                      minLength: 1
                    }}
                    validateOn="blur"
                  />

                  <ValidatedInput
                    id="companySize"
                    label="Company Size (employees)"
                    type="number"
                    placeholder="Number of employees"
                    value={data.companySize?.toString() || ''}
                    onChange={(value) => setData('companySize', value)}
                    error={getFieldError('companySize')}
                    validation={{
                      min: 1
                    }}
                    validateOn="blur"
                  />
                </div>
              </div>

              {/* Form Status */}
              {!isValid && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    Please fill in all required fields to create the opportunity.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </ValidatedForm>
      </CardContent>
    </Card>
  );
}