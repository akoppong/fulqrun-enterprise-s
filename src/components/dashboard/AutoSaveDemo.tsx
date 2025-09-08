import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { FloppyDisk, CheckCircle, Trash } from '@phosphor-icons/react';
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                  <SelectTrigger id="category">
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
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the task in detail..."
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
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
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => updateField('assignee', e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any additional notes or comments..."
                rows={3}
                className="resize-none"
              />
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {autoSave.hasDraft && (
                  <span className="text-blue-600">
                    💾 Draft available - changes saved automatically
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges && !autoSave.hasDraft}
                >
                  <Trash size={16} className="mr-2" />
                  Reset
                </Button>
                
                <Button type="submit" disabled={!formData.title}>
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
          <CardTitle>Auto-Save Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Changes are automatically saved every 2 seconds as you type</li>
            <li>The status indicator shows current save state</li>
            <li>Refresh the page to see draft restoration in action</li>
            <li>Click "Save now" to manually trigger an immediate save</li>
            <li>Click "Clear draft" to remove the saved draft</li>
            <li>Submitting the form automatically clears the draft</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}