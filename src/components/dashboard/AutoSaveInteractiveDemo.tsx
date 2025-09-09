import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { safeGetTime } from '@/lib/utils';
import { 
  FloppyDisk, 
  TestTube, 
  RefreshCw, 
  PlayCircle, 
  CheckCircle, 
  Warning, 
  Info,
  Timer,
  HardDrives,
  Eye,
  Trash
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ComplexFormData {
  // Text inputs
  fullName: string;
  email: string;
  phone: string;
  website: string;
  
  // Textarea
  bio: string;
  comments: string;
  
  // Selections
  country: string;
  department: string;
  priority: string;
  
  // Date and time
  birthDate: string;
  startTime: string;
  
  // Boolean fields
  newsletter: boolean;
  terms: boolean;
  notifications: boolean;
  
  // Radio group
  contactMethod: string;
  
  // Number inputs
  experience: number[];
  salary: number;
  rating: number;
  
  // Special fields
  tags: string[];
  metadata: Record<string, any>;
}

const defaultFormData: ComplexFormData = {
  fullName: '',
  email: '',
  phone: '',
  website: '',
  bio: '',
  comments: '',
  country: '',
  department: '',
  priority: 'medium',
  birthDate: '',
  startTime: '',
  newsletter: false,
  terms: false,
  notifications: true,
  contactMethod: 'email',
  experience: [3],
  salary: 50000,
  rating: 5,
  tags: [],
  metadata: {}
};

export function AutoSaveInteractiveDemo() {
  const [formData, setFormData] = useState<ComplexFormData>(defaultFormData);
  const [currentTag, setCurrentTag] = useState('');
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    test: string;
    status: 'pass' | 'fail' | 'pending';
    timestamp: Date;
    details?: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState('form');

  // Auto-save with detailed tracking
  const autoSave = useAutoSave({
    key: 'interactive_demo_form',
    data: formData,
    enabled: true,
    delay: 1500, // Faster for demo purposes
    onSave: (data) => {
      console.log('🔄 Auto-saved:', data);
      addTestResult('auto-save', 'Auto-save triggered', 'pass', `Saved ${Object.keys(data).length} fields`);
    },
    onLoad: (savedData) => {
      if (savedData) {
        setFormData(savedData);
        addTestResult('auto-load', 'Draft loaded on initialization', 'pass', 'Previous data restored');
        toast.success('Draft restored from auto-save');
      }
    }
  });

  const addTestResult = (id: string, test: string, status: 'pass' | 'fail' | 'pending', details?: string) => {
    setTestResults(prev => [
      ...prev.filter(r => r.id !== id),
      { id, test, status, timestamp: new Date(), details }
    ]);
  };

  // Field update helper
  const updateField = <K extends keyof ComplexFormData>(field: K, value: ComplexFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    addTestResult(`field-${field}`, `Updated ${field}`, 'pass', `New value: ${JSON.stringify(value)}`);
  };

  // Tag management
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateField('tags', [...formData.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Test scenarios
  const runRefreshTest = () => {
    addTestResult('refresh-test', 'Page refresh simulation', 'pending', 'Initiating refresh...');
    toast.info('Refreshing page to test auto-save persistence...', { duration: 2000 });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const testFieldTypes = async () => {
    addTestResult('field-types', 'Testing all field types', 'pending', 'Populating sample data...');
    
    const sampleData: Partial<ComplexFormData> = {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      website: 'https://johndoe.com',
      bio: 'Experienced software developer with 10+ years in the industry.',
      comments: 'Looking forward to contributing to innovative projects.',
      country: 'us',
      department: 'engineering',
      priority: 'high',
      birthDate: '1990-01-15',
      startTime: '09:00',
      newsletter: true,
      terms: true,
      contactMethod: 'phone',
      experience: [7],
      salary: 85000,
      rating: 8,
      tags: ['experienced', 'full-stack', 'leadership']
    };

    // Simulate gradual field population
    for (const [field, value] of Object.entries(sampleData)) {
      await new Promise(resolve => setTimeout(resolve, 200));
      updateField(field as keyof ComplexFormData, value as any);
    }

    addTestResult('field-types', 'All field types populated', 'pass', 'Sample data applied successfully');
    toast.success('Sample data populated - auto-save should trigger');
  };

  const clearAllData = () => {
    setFormData(defaultFormData);
    autoSave.clearDraft();
    setTestResults([]);
    addTestResult('clear-data', 'Form and draft cleared', 'pass', 'All data removed');
    toast.success('Form cleared and draft removed');
  };

  const testManualSave = () => {
    autoSave.saveNow();
    addTestResult('manual-save', 'Manual save triggered', 'pass', 'Immediate save executed');
  };

  const exportFormData = () => {
    const dataBlob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    addTestResult('export-data', 'Form data exported', 'pass', 'JSON file downloaded');
    toast.success('Form data exported to JSON file');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube size={24} className="text-primary" />
                Interactive Auto-Save Testing Lab
              </CardTitle>
              <CardDescription>
                Comprehensive testing environment for auto-save functionality with multiple field types
              </CardDescription>
            </div>
            
            <AutoSaveIndicator
              enabled={true}
              lastSaved={autoSave.lastSaved}
              hasUnsavedChanges={Object.values(formData).some(v => 
                typeof v === 'string' ? v !== '' : 
                typeof v === 'boolean' ? v !== defaultFormData[Object.keys(formData).find(k => formData[k as keyof ComplexFormData] === v) as keyof ComplexFormData] :
                JSON.stringify(v) !== JSON.stringify(defaultFormData[Object.keys(formData).find(k => formData[k as keyof ComplexFormData] === v) as keyof ComplexFormData])
              )}
              onSaveNow={testManualSave}
              onClearDraft={autoSave.clearDraft}
              hasDraft={autoSave.hasDraft}
              className="text-sm"
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Interactive Form</TabsTrigger>
          <TabsTrigger value="tests">Test Runner</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="data">Data Inspector</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Field Type Demo Form</CardTitle>
              <CardDescription>
                Test auto-save with various input types. Changes save automatically every 1.5 seconds.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Text Inputs Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Text Inputs</Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Textarea Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Text Areas</Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Comments</Label>
                    <Textarea
                      id="comments"
                      value={formData.comments}
                      onChange={(e) => updateField('comments', e.target.value)}
                      placeholder="Any additional comments..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Selection Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Selection Controls</Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => updateField('country', value)}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="de">Germany</SelectItem>
                        <SelectItem value="fr">France</SelectItem>
                        <SelectItem value="jp">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => updateField('department', value)}>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Date and Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Date & Time</Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => updateField('birthDate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Preferred Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => updateField('startTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Boolean Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Boolean Controls</Badge>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => updateField('newsletter', !!checked)}
                    />
                    <Label htmlFor="newsletter">Subscribe to newsletter</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms"
                      checked={formData.terms}
                      onCheckedChange={(checked) => updateField('terms', !!checked)}
                    />
                    <Label htmlFor="terms">I agree to the terms and conditions</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked) => updateField('notifications', checked)}
                    />
                    <Label htmlFor="notifications">Enable push notifications</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Radio Group */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Radio Group</Badge>
                </h3>
                
                <div className="space-y-2">
                  <Label>Preferred Contact Method</Label>
                  <RadioGroup 
                    value={formData.contactMethod} 
                    onValueChange={(value) => updateField('contactMethod', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="contact-email" />
                      <Label htmlFor="contact-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="contact-phone" />
                      <Label htmlFor="contact-phone">Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="contact-sms" />
                      <Label htmlFor="contact-sms">SMS</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Separator />

              {/* Number Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Number Controls</Badge>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Years of Experience: {formData.experience[0]}</Label>
                    <Slider
                      value={formData.experience}
                      onValueChange={(value) => updateField('experience', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary">Expected Salary</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => updateField('salary', parseInt(e.target.value) || 0)}
                      placeholder="50000"
                      min="0"
                      step="1000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      value={formData.rating}
                      onChange={(e) => updateField('rating', parseInt(e.target.value) || 5)}
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags System */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="secondary">Dynamic Arrays</Badge>
                </h3>
                
                <div className="space-y-2">
                  <Label>Skills & Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add Tag
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Save Test Scenarios</CardTitle>
              <CardDescription>
                Run specific tests to validate auto-save functionality
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={testFieldTypes} className="h-auto p-4 flex-col gap-2">
                  <PlayCircle size={24} />
                  <div className="text-center">
                    <div className="font-semibold">Populate Sample Data</div>
                    <div className="text-xs text-muted-foreground">Fill all field types with test data</div>
                  </div>
                </Button>
                
                <Button onClick={runRefreshTest} variant="outline" className="h-auto p-4 flex-col gap-2">
                  <RefreshCw size={24} />
                  <div className="text-center">
                    <div className="font-semibold">Refresh Test</div>
                    <div className="text-xs text-muted-foreground">Test draft persistence across page reload</div>
                  </div>
                </Button>
                
                <Button onClick={testManualSave} variant="outline" className="h-auto p-4 flex-col gap-2">
                  <FloppyDisk size={24} />
                  <div className="text-center">
                    <div className="font-semibold">Manual Save</div>
                    <div className="text-xs text-muted-foreground">Trigger immediate save</div>
                  </div>
                </Button>
                
                <Button onClick={clearAllData} variant="destructive" className="h-auto p-4 flex-col gap-2">
                  <Trash size={24} />
                  <div className="text-center">
                    <div className="font-semibold">Clear All Data</div>
                    <div className="text-xs text-muted-foreground">Reset form and clear draft</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Log</CardTitle>
              <CardDescription>
                Real-time tracking of auto-save operations and test results
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Info size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tests run yet. Use the form or run test scenarios to see results.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {testResults.slice().reverse().map((result) => (
                    <div
                      key={`${result.id}-${safeGetTime(result.timestamp)}`}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {result.status === 'pass' && <CheckCircle size={16} className="text-green-600" />}
                        {result.status === 'fail' && <Warning size={16} className="text-red-600" />}
                        {result.status === 'pending' && <Timer size={16} className="text-yellow-600 animate-pulse" />}
                        
                        <div>
                          <div className="font-medium">{result.test}</div>
                          {result.details && (
                            <div className="text-sm text-muted-foreground">{result.details}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Form Data Inspector</CardTitle>
                  <CardDescription>
                    Current form state and auto-save status
                  </CardDescription>
                </div>
                <Button onClick={exportFormData} variant="outline" size="sm">
                  <HardDrives size={16} className="mr-2" />
                  Export Data
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye size={16} />
                    Current Form Data
                  </h4>
                  <div className="bg-muted p-3 rounded-lg text-sm font-mono overflow-auto max-h-64">
                    <pre>{JSON.stringify(formData, null, 2)}</pre>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FloppyDisk size={16} />
                    Auto-Save Status
                  </h4>
                  <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                    <div>Has Draft: <Badge variant={autoSave.hasDraft ? "default" : "secondary"}>
                      {autoSave.hasDraft ? "Yes" : "No"}
                    </Badge></div>
                    <div>Last Saved: {autoSave.lastSaved ? autoSave.lastSaved.toLocaleString() : "Never"}</div>
                    <div>Total Fields: {Object.keys(formData).length}</div>
                    <div>Populated Fields: {Object.values(formData).filter(v => 
                      typeof v === 'string' ? v !== '' : 
                      typeof v === 'boolean' ? true :
                      Array.isArray(v) ? v.length > 0 :
                      typeof v === 'object' ? Object.keys(v).length > 0 :
                      v !== 0
                    ).length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}