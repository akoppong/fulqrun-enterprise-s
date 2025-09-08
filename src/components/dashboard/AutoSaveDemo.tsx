import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { FloppyDisk, CheckCircle, Trash, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface FormData {
  title: string;
  description: string;
  priority: string;
  category: string;
  dueDate: string;
  assignee: string;
  notes: string;
}

export function AutoSaveDemo() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: '',
    assignee: '',
    notes: ''
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const autoSave = useAutoSave({
    key: 'demo_form',
    data: formData,
    enabled: true,
    delay: 2000,
    onSave: (data) => {
      setHasUnsavedChanges(false);
      console.log('Auto-saved:', data);
    },
    onLoad: (savedData) => {
      if (savedData) {
        setFormData(savedData);
        toast.info('Draft restored from auto-save');
      }
    }
  });

  // Track changes
  React.useEffect(() => {
    const hasData = Object.values(formData).some(value => value !== '' && value !== 'medium');
    setHasUnsavedChanges(hasData);
  }, [formData]);

  // Show draft restoration dialog on mount if there's a saved draft
  React.useEffect(() => {
    if (autoSave.hasDraft) {
      setTimeout(() => {
        const shouldRestore = window.confirm(
          'A saved draft was found. Would you like to restore it and continue where you left off?'
        );
        
        if (shouldRestore && autoSave.savedDraft) {
          setFormData(autoSave.savedDraft);
          toast.success('Draft restored successfully');
        }
      }, 1000);
    }
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast.success('Form submitted successfully!');
    
    // Clear the draft after successful submission
    autoSave.clearDraft();
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      dueDate: '',
      assignee: '',
      notes: ''
    });
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    const shouldReset = window.confirm('Are you sure you want to clear all form data? This will also clear the auto-saved draft.');
    
    if (shouldReset) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: '',
        assignee: '',
        notes: ''
      });
      autoSave.clearDraft();
      setHasUnsavedChanges(false);
      toast.success('Form reset successfully');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FloppyDisk size={24} className="text-primary" />
                Auto-Save Demo Form
              </CardTitle>
              <CardDescription>
                This form demonstrates auto-save functionality. Changes are automatically saved every 2 seconds.
              </CardDescription>
            </div>
            
            <AutoSaveIndicator
              enabled={true}
              lastSaved={autoSave.lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveNow={autoSave.saveNow}
              onClearDraft={autoSave.clearDraft}
              hasDraft={autoSave.hasDraft}
              className="text-sm"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Task Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter task title"
                    required
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                    <SelectTrigger id="category" className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Task Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Task Details
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the task in detail..."
                  rows={4}
                  className="resize-none min-h-[100px]"
                />
              </div>
            </div>
            
            {/* Assignment & Scheduling */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Assignment & Scheduling
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateField('priority', value)}>
                    <SelectTrigger id="priority" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low Priority</SelectItem>
                      <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                      <SelectItem value="high">🟠 High Priority</SelectItem>
                      <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateField('dueDate', e.target.value)}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignee" className="text-sm font-medium">Assignee</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => updateField('assignee', e.target.value)}
                    placeholder="Enter assignee name"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            
            {/* Additional Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                Additional Notes
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes & Comments</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Any additional notes or comments..."
                  rows={3}
                  className="resize-none min-h-[80px]"
                />
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {autoSave.hasDraft && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <FloppyDisk size={16} />
                    <span>Draft saved automatically</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges && !autoSave.hasDraft}
                  className="h-11 px-6"
                >
                  <Trash size={16} className="mr-2" />
                  Reset Form
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={!formData.title}
                  className="h-11 px-6"
                >
                  <CheckCircle size={16} className="mr-2" />
                  Submit Task
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={20} />
            How to Test Auto-Save
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">🔄 Auto-Save Features</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Changes are automatically saved every 2 seconds
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Status indicator shows current save state
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Drafts persist between browser sessions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  Manual save option available
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">🧪 Testing Steps</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-mono">1.</span>
                  Fill out some form fields above
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-mono">2.</span>
                  Watch the auto-save indicator change
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-mono">3.</span>
                  Refresh the page to test draft restoration
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-mono">4.</span>
                  Try the "Interactive Demo" for advanced testing
                </li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FloppyDisk size={20} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Pro Tip</p>
                <p className="text-sm text-blue-700">
                  For comprehensive testing with multiple field types, check out the "Interactive Demo" 
                  in the sidebar which includes advanced scenarios and real-time test results.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}