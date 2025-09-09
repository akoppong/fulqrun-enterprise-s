import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Globe, TestTube } from '@phosphor-icons/react';
import { EnhancedDateInput } from '@/components/ui/enhanced-date-input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useDateValidation, useDateRangeValidation } from '@/hooks/useDateValidation';
import { 
  DATE_FORMATS, 
  TIMEZONES,
  parseDate,
  formatDate,
  getRelativeTime,
  calculateAge,
  getBusinessDaysBetween,
  getFiscalYear,
  getQuarter,
  getWeekNumber,
  formatDuration,
  getTimezoneOffset,
  createDatePickerValue
} from '@/lib/date-utils';
import { DateValidator, CommonDateValidations } from '@/lib/date-validation';

export const AdvancedDateDemo: React.FC = () => {
  const [demoDate, setDemoDate] = useState<Date | null>(new Date());
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  
  const [timezone, setTimezone] = useState(TIMEZONES.US_EASTERN);
  const [testDateString, setTestDateString] = useState('2024-06-15T14:30:00Z');

  // Test different validation scenarios
  const birthdateValidation = useDateValidation({
    required: true,
    maxDate: new Date(),
    allowFuture: false,
    format: 'ISO'
  });

  const meetingDateValidation = useDateValidation({
    required: true,
    minDate: new Date(),
    allowWeekends: false,
    format: 'DISPLAY'
  });

  const contractRangeValidation = useDateRangeValidation({
    required: true,
    minDuration: 30,
    maxDuration: 365,
    format: 'ISO'
  });

  // Parse test date
  const parsedTestDate = parseDate(testDateString);

  // Calculate various date information
  const dateInfo = React.useMemo(() => {
    if (!demoDate) return null;

    return {
      iso: demoDate.toISOString(),
      formatted: formatDate(demoDate, DATE_FORMATS.DISPLAY_LONG),
      relative: getRelativeTime(demoDate),
      age: calculateAge('1990-01-01', demoDate),
      fiscalYear: getFiscalYear(demoDate),
      quarter: getQuarter(demoDate),
      weekNumber: getWeekNumber(demoDate),
      timezoneOffset: getTimezoneOffset(timezone, demoDate),
      businessDaysToToday: demoDate ? getBusinessDaysBetween(demoDate, new Date()) : 0
    };
  }, [demoDate, timezone]);

  const rangeInfo = React.useMemo(() => {
    if (!startDate || !endDate) return null;

    return {
      duration: formatDuration(startDate, endDate),
      businessDays: getBusinessDaysBetween(startDate, endDate),
      totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    };
  }, [startDate, endDate]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <TestTube className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Advanced Date Handling Demo</h1>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Usage</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="timezone">Timezone</TabsTrigger>
          <TabsTrigger value="ranges">Date Ranges</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
        </TabsList>

        {/* Basic Usage Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Enhanced Date Input</span>
                </CardTitle>
                <CardDescription>Advanced date input with multiple format support</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedDateInput
                  label="Basic Date"
                  value={demoDate}
                  onChange={(date) => setDemoDate(date)}
                  format="DISPLAY"
                  helpText="Supports multiple input formats"
                />

                <EnhancedDateInput
                  label="Date with Time"
                  value={demoDate}
                  onChange={(date) => setDemoDate(date)}
                  format="DATETIME_ISO"
                  showTimeInput={true}
                  helpText="Include time component"
                />

                <EnhancedDateInput
                  label="Compact Format"
                  value={demoDate}
                  onChange={(date) => setDemoDate(date)}
                  variant="compact"
                  format="ISO"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Date Information</CardTitle>
                <CardDescription>Real-time date analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {dateInfo ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">ISO Format:</div>
                      <div className="font-mono text-xs">{dateInfo.iso}</div>
                      
                      <div className="font-medium">Display:</div>
                      <div>{dateInfo.formatted}</div>
                      
                      <div className="font-medium">Relative:</div>
                      <div>{dateInfo.relative}</div>
                      
                      <div className="font-medium">Fiscal Year:</div>
                      <div>{dateInfo.fiscalYear}</div>
                      
                      <div className="font-medium">Quarter:</div>
                      <div>Q{dateInfo.quarter}</div>
                      
                      <div className="font-medium">Week Number:</div>
                      <div>{dateInfo.weekNumber}</div>
                      
                      <div className="font-medium">Business Days to Today:</div>
                      <div>{Math.abs(dateInfo.businessDaysToToday)}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a date to see information</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Validation Examples</CardTitle>
                <CardDescription>Different validation scenarios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedDateInput
                  label="Birth Date (Past Only)"
                  value={birthdateValidation.rawValue}
                  onChange={(date, formatted) => birthdateValidation.setValue(formatted)}
                  validationOptions={{
                    required: true,
                    maxDate: new Date(),
                    allowFuture: false
                  }}
                  error={birthdateValidation.error}
                  helpText="Must be in the past"
                />

                <EnhancedDateInput
                  label="Meeting Date (Business Days Only)"
                  value={meetingDateValidation.rawValue}
                  onChange={(date, formatted) => meetingDateValidation.setValue(formatted)}
                  validationOptions={{
                    required: true,
                    minDate: new Date(),
                    allowWeekends: false
                  }}
                  error={meetingDateValidation.error}
                  helpText="Weekends not allowed"
                />

                <div className="pt-4">
                  <h4 className="font-medium mb-2">Validation Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={birthdateValidation.isValid ? "default" : "destructive"}>
                        Birth Date: {birthdateValidation.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={meetingDateValidation.isValid ? "default" : "destructive"}>
                        Meeting Date: {meetingDateValidation.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Built-in Validators</CardTitle>
                <CardDescription>Pre-configured validation schemas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(CommonDateValidations).map(([key, validation]) => {
                    const testResult = DateValidator.validate(new Date(), validation);
                    return (
                      <div key={key} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                          <div className="text-sm text-muted-foreground">
                            {validation.allowPast ? 'Past: ✓' : 'Past: ✗'} | 
                            {validation.allowFuture ? ' Future: ✓' : ' Future: ✗'} | 
                            {validation.required ? ' Required: ✓' : ' Required: ✗'}
                          </div>
                        </div>
                        <Badge variant={testResult.isValid ? "default" : "destructive"}>
                          {testResult.isValid ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timezone Tab */}
        <TabsContent value="timezone" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Timezone Handling</span>
                </CardTitle>
                <CardDescription>Date handling across timezones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedDateInput
                  label="Date with Timezone"
                  value={demoDate}
                  onChange={(date) => setDemoDate(date)}
                  format="DATETIME_ISO"
                  timezone={timezone}
                  showTimezone={true}
                  showTimeInput={true}
                  helpText="Timezone-aware date handling"
                />

                <div>
                  <h4 className="font-medium mb-2">Test Date Parsing</h4>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={testDateString}
                      onChange={(e) => setTestDateString(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      placeholder="Enter date string to parse"
                    />
                  </div>
                  {parsedTestDate ? (
                    <div className="text-sm space-y-1">
                      <div><strong>Parsed:</strong> {parsedTestDate.toISOString()}</div>
                      <div><strong>Local:</strong> {parsedTestDate.toLocaleString()}</div>
                      <div><strong>In {timezone}:</strong> {formatDate(parsedTestDate, DATE_FORMATS.DATETIME_LOCAL, timezone)}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-destructive">Invalid date format</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timezone Information</CardTitle>
                <CardDescription>Current timezone details</CardDescription>
              </CardHeader>
              <CardContent>
                {demoDate && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(TIMEZONES).slice(0, 8).map(([key, tz]) => (
                        <div key={key} className="p-3 border rounded">
                          <div className="font-medium text-sm">{key.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(demoDate, DATE_FORMATS.TIME_12, tz)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            UTC{getTimezoneOffset(tz, demoDate) >= 0 ? '+' : ''}{getTimezoneOffset(tz, demoDate)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Date Ranges Tab */}
        <TabsContent value="ranges" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Date Range Picker</CardTitle>
                <CardDescription>Advanced date range selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DateRangePicker
                  label="Project Duration"
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                  showPresets={true}
                  showDuration={true}
                  helpText="Select project start and end dates"
                />

                <Separator />

                <DateRangePicker
                  label="Contract Period (Compact)"
                  startDate={contractRangeValidation.startDate.rawValue}
                  endDate={contractRangeValidation.endDate.rawValue}
                  onChange={(start, end) => {
                    contractRangeValidation.startDate.setValue(start);
                    contractRangeValidation.endDate.setValue(end);
                  }}
                  variant="compact"
                  validationOptions={{
                    minDuration: 30,
                    maxDuration: 365
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Range Analysis</CardTitle>
                <CardDescription>Date range calculations</CardDescription>
              </CardHeader>
              <CardContent>
                {rangeInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded">
                        <div className="text-2xl font-bold">{rangeInfo.totalDays}</div>
                        <div className="text-sm text-muted-foreground">Total Days</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="text-2xl font-bold">{rangeInfo.businessDays}</div>
                        <div className="text-sm text-muted-foreground">Business Days</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div><strong>Duration:</strong> {rangeInfo.duration}</div>
                      <div><strong>Start:</strong> {startDate && formatDate(startDate, DATE_FORMATS.DISPLAY_LONG)}</div>
                      <div><strong>End:</strong> {endDate && formatDate(endDate, DATE_FORMATS.DISPLAY_LONG)}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a date range to see analysis</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Utilities Tab */}
        <TabsContent value="utilities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Format Examples</CardTitle>
                <CardDescription>All available formats</CardDescription>
              </CardHeader>
              <CardContent>
                {demoDate && (
                  <div className="space-y-2 text-sm">
                    {Object.entries(DATE_FORMATS).map(([key, format]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span className="font-mono text-xs">{formatDate(demoDate, format)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Calendar</CardTitle>
                <CardDescription>Business date calculations</CardDescription>
              </CardHeader>
              <CardContent>
                {demoDate && (
                  <div className="space-y-3">
                    <div className="text-sm space-y-1">
                      <div><strong>Is Weekend:</strong> {[0, 6].includes(demoDate.getDay()) ? 'Yes' : 'No'}</div>
                      <div><strong>Day of Week:</strong> {demoDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                      <div><strong>Business Days This Month:</strong> {getBusinessDaysBetween(
                        new Date(demoDate.getFullYear(), demoDate.getMonth(), 1),
                        new Date(demoDate.getFullYear(), demoDate.getMonth() + 1, 0)
                      )}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Age Calculator</CardTitle>
                <CardDescription>Age and duration calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <div><strong>Age from 1990-01-01:</strong> {calculateAge('1990-01-01')} years</div>
                    <div><strong>Age from 2000-06-15:</strong> {calculateAge('2000-06-15')} years</div>
                    <div><strong>Days since Unix epoch:</strong> {Math.floor(Date.now() / (1000 * 60 * 60 * 24))}</div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-1">Sample Calculations:</div>
                    <div className="text-xs space-y-1">
                      <div>Business days this year: {getBusinessDaysBetween(
                        new Date(new Date().getFullYear(), 0, 1),
                        new Date()
                      )}</div>
                      <div>Current fiscal year: FY{getFiscalYear(new Date())}</div>
                      <div>Current quarter: Q{getQuarter(new Date())}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDateDemo;