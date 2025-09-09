import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateInput, OpportunityCloseDateInput, BusinessDateInput, BirthDateInput, EventDateInput } from '@/components/ui/date-input';
import { useDateValidation, useMultipleDateValidation, CommonDateFieldConfigs } from '@/hooks/useDateValidation';
import { DateValidator, DateUtils } from '@/lib/date-validation';
import { CalendarIcon, CheckCircleIcon, WarningIcon, InfoIcon, TestTubeIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function DateValidationDemo() {
  const [sampleData, setSampleData] = useState({
    opportunityClose: '',
    contractStart: '',
    contractEnd: '',
    lastContact: '',
    birthDate: '',
    projectDeadline: ''
  });

  const [validationResults, setValidationResults] = useState<Record<string, any>>({});

  // Multi-date validation hook
  const {
    validateField,
    validateAllFields,
    clearAllValidations,
    getNormalizedData,
    fieldValidations,
    allFieldsValid,
    hasAnyErrors
  } = useMultipleDateValidation({
    opportunityClose: CommonDateFieldConfigs.opportunityCloseDate,
    contractStart: CommonDateFieldConfigs.eventDate,
    contractEnd: CommonDateFieldConfigs.eventDate,
    lastContact: CommonDateFieldConfigs.createdAt,
    birthDate: CommonDateFieldConfigs.birthDate,
    projectDeadline: CommonDateFieldConfigs.opportunityCloseDate
  });

  const handleDateChange = (field: string, value: string | null, isValid: boolean) => {
    setSampleData(prev => ({ ...prev, [field]: value || '' }));
    validateField(field, value);
  };

  const handleValidateAll = () => {
    const result = validateAllFields(sampleData);
    setValidationResults(result);
    
    if (result.allValid) {
      toast.success('All dates are valid!');
      const normalized = getNormalizedData();
      console.log('Normalized data:', normalized);
    } else {
      toast.error('Some dates have validation errors');
    }
  };

  const handleClearAll = () => {
    setSampleData({
      opportunityClose: '',
      contractStart: '',
      contractEnd: '',
      lastContact: '',
      birthDate: '',
      projectDeadline: ''
    });
    clearAllValidations();
    setValidationResults({});
  };

  const testDateFormats = [
    '2024-03-15',
    '03/15/2024',
    '15/03/2024',
    '2024-03-15T10:30:00Z',
    '1615789800000',
    'March 15, 2024',
    'invalid-date',
    '',
    null,
    undefined
  ];

  const handleTestFormat = (format: any) => {
    const result = DateValidator.validate(format);
    toast.info(
      `Format: ${format} → ${result.isValid ? 'Valid' : 'Invalid'}${result.error ? ` (${result.error})` : ''}`,
      { duration: 3000 }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Date Validation Middleware Demo</h2>
          <p className="text-muted-foreground">
            Test comprehensive date validation and normalization across different input types
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allFieldsValid ? 'default' : hasAnyErrors ? 'destructive' : 'secondary'}>
            {allFieldsValid ? 'All Valid' : hasAnyErrors ? 'Has Errors' : 'Ready to Test'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CalendarIcon size={14} />
            {Object.keys(fieldValidations).length} Fields
          </Badge>
        </div>
      </div>

      {/* Summary Alert */}
      {Object.keys(fieldValidations).length > 0 && (
        <Alert variant={allFieldsValid ? 'default' : hasAnyErrors ? 'destructive' : 'default'}>
          {allFieldsValid ? <CheckCircleIcon className="h-4 w-4" /> : 
           hasAnyErrors ? <WarningIcon className="h-4 w-4" /> : 
           <InfoIcon className="h-4 w-4" />}
          <AlertDescription>
            {allFieldsValid ? 
              'All date fields are valid and properly normalized.' :
              hasAnyErrors ?
                `${Object.values(fieldValidations).filter(v => !v.isValid).length} field(s) have validation errors.` :
                'Enter dates to see validation results.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="specialized" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specialized">Specialized Inputs</TabsTrigger>
          <TabsTrigger value="generic">Generic Testing</TabsTrigger>
          <TabsTrigger value="formats">Format Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="specialized" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specialized Date Input Components</CardTitle>
              <CardDescription>
                Pre-configured date inputs with validation rules for specific use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <OpportunityCloseDateInput
                  label="Opportunity Close Date"
                  value={sampleData.opportunityClose}
                  onChange={(value, isValid) => handleDateChange('opportunityClose', value, isValid)}
                  placeholder="Select expected close date..."
                />

                <EventDateInput
                  label="Contract Start Date"
                  value={sampleData.contractStart}
                  onChange={(value, isValid) => handleDateChange('contractStart', value, isValid)}
                  placeholder="Select contract start..."
                />

                <EventDateInput
                  label="Contract End Date"
                  value={sampleData.contractEnd}
                  onChange={(value, isValid) => handleDateChange('contractEnd', value, isValid)}
                  placeholder="Select contract end..."
                />

                <BusinessDateInput
                  label="Last Contact Date"
                  value={sampleData.lastContact}
                  onChange={(value, isValid) => handleDateChange('lastContact', value, isValid)}
                  placeholder="When did you last contact them?"
                />

                <BirthDateInput
                  label="Contact Birth Date"
                  value={sampleData.birthDate}
                  onChange={(value, isValid) => handleDateChange('birthDate', value, isValid)}
                  placeholder="Optional birth date..."
                  required={false}
                />

                <OpportunityCloseDateInput
                  label="Project Deadline"
                  value={sampleData.projectDeadline}
                  onChange={(value, isValid) => handleDateChange('projectDeadline', value, isValid)}
                  placeholder="Project completion date..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleValidateAll} className="flex items-center gap-2">
                  <CheckCircleIcon size={16} />
                  Validate All Dates
                </Button>
                <Button variant="outline" onClick={handleClearAll}>
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generic Date Input Testing</CardTitle>
              <CardDescription>
                Test various validation options with the generic DateInput component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <DateInput
                  label="Future Only Date"
                  validation={{ allowPast: false, allowFuture: true, required: true }}
                  placeholder="Must be in the future..."
                  showRelativeTime={true}
                />

                <DateInput
                  label="Past Only Date"
                  validation={{ allowPast: true, allowFuture: false, required: true }}
                  placeholder="Must be in the past..."
                />

                <DateInput
                  label="Date Range (2020-2030)"
                  validation={{
                    minDate: new Date('2020-01-01'),
                    maxDate: new Date('2030-12-31'),
                    required: true
                  }}
                  placeholder="Between 2020 and 2030..."
                />

                <DateInput
                  label="Optional Date"
                  validation={{ required: false }}
                  placeholder="Optional date field..."
                  showCalendar={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Date Format Testing</CardTitle>
              <CardDescription>
                Test how different date formats are parsed and validated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {testDateFormats.map((format, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => handleTestFormat(format)}
                    className="text-left justify-start font-mono text-xs"
                  >
                    <TestTubeIcon size={14} className="mr-2" />
                    {format === null ? 'null' : 
                     format === undefined ? 'undefined' :
                     format === '' ? '(empty string)' :
                     String(format)}
                  </Button>
                ))}
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Click any format above to test validation. Results will appear as toast notifications.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date Utility Functions</CardTitle>
              <CardDescription>
                Demonstration of utility functions for date calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Business Days Calculations</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Today → +5 business days: {
                      DateUtils.addBusinessDays(new Date(), 5).toLocaleDateString()
                    }</div>
                    <div>Business days between Jan 1-15, 2024: {
                      DateUtils.getBusinessDaysBetween(
                        new Date('2024-01-01'), 
                        new Date('2024-01-15')
                      )
                    }</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Date Checks</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Is today today? {DateUtils.isToday(new Date()) ? 'Yes' : 'No'}</div>
                    <div>Relative time: {DateUtils.getRelativeTime(new Date())}</div>
                    <div>Tomorrow: {DateUtils.getRelativeTime(
                      new Date(Date.now() + 24 * 60 * 60 * 1000)
                    )}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Validation Results */}
      {Object.keys(fieldValidations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Validation State</CardTitle>
            <CardDescription>
              Real-time validation results for all date fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(fieldValidations).map(([field, validation]) => (
                <div key={field} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{field}</div>
                    <div className="text-sm text-muted-foreground">
                      {validation.normalizedValue ? (
                        <>Normalized: {new Date(validation.normalizedValue).toLocaleDateString()}</>
                      ) : (
                        'No valid date'
                      )}
                    </div>
                    {validation.warnings && validation.warnings.length > 0 && (
                      <div className="text-xs text-orange-600">
                        Warnings: {validation.warnings.join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {validation.isValid ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircleIcon size={12} />
                        Valid
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <WarningIcon size={12} />
                        Invalid
                      </Badge>
                    )}
                    {validation.error && (
                      <div className="text-xs text-destructive max-w-xs truncate">
                        {validation.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}