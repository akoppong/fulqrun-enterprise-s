import { useState, useEffect } from 'react';
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
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { toast } from 'sonner';

interface OpportunityEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Partial<Opportunity>) => void;
  onSubmit?: (opportunity: Partial<Opportunity>) => void;
  opportunity?: Opportunity | null;
}

export function OpportunityEditForm({ isOpen, onClose, onSave, onSubmit, opportunity }: OpportunityEditFormProps) {
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

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        expectedCloseDate: opportunity.expectedCloseDate
      });
      setTags(opportunity.tags || []);
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
    }
  }, [opportunity, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
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

  const handleSave = async () => {
    // Basic validation
    if (!formData.title?.trim()) {
      toast.error('Opportunity name is required');
      return;
    }
    
    if (!formData.companyId) {
      toast.error('Company is required');
      return;
    }

    if (!formData.value || formData.value <= 0) {
      toast.error('Deal value must be greater than 0');
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
        opportunityData.createdAt = new Date().toISOString();
      }

      const callback = onSave || onSubmit;
      if (callback) {
        callback(opportunityData);
      }
      onClose();
      toast.success(opportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully');
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity');
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered contacts based on selected company
  const availableContacts = formData.companyId 
    ? contacts.filter(contact => contact.companyId === formData.companyId)
    : contacts;

  const selectedCompany = companies.find(company => company.id === formData.companyId);
  const selectedContact = contacts.find(contact => contact.id === formData.contactId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-2xl font-semibold">
            {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {opportunity 
              ? `Update the details for ${formData.title || 'this opportunity'}`
              : 'Create a new sales opportunity and track it through the PEAK methodology'
            }
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-8">
            {/* Opportunity Details Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opportunity Details</CardTitle>
                <CardDescription>Core opportunity information and contact details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Basic Information Row */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="opportunity-name" className="text-sm font-medium">
                          Opportunity Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="opportunity-name"
                          placeholder="Enter opportunity name"
                          value={formData.title || ''}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm font-medium">
                          Company <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.companyId} onValueChange={(value) => {
                          handleInputChange('companyId', value);
                          handleInputChange('contactId', ''); // Reset contact when company changes
                        }}>
                          <SelectTrigger id="company" className="w-full">
                            <SelectValue placeholder="Select company" />
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

                      <div className="space-y-2">
                        <Label htmlFor="deal-value" className="text-sm font-medium">
                          Deal Value ($) <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="deal-value"
                          type="number"
                          placeholder="750000"
                          value={formData.value || ''}
                          onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sales Information Row */}
                  <div>
                    <h4 className="font-semibold text-base mb-4 pb-2 border-b text-foreground">Sales Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="win-probability" className="text-sm font-medium">
                          Win Probability (%)
                        </Label>
                        <Input
                          id="win-probability"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="75"
                          value={formData.probability || ''}
                          onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="peak-stage" className="text-sm font-medium">
                          PEAK Stage
                        </Label>
                        <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                          <SelectTrigger id="peak-stage" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PEAK_STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-medium">
                          Priority
                        </Label>
                        <Select value={formData.priority || 'medium'} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger id="priority" className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={priority.color} variant="secondary">
                                    {priority.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                          Expected Close Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !formData.expectedCloseDate && 'text-muted-foreground'
                              )}
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
                              onSelect={(date) => handleInputChange('expectedCloseDate', date?.toISOString())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[120px] w-full resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-background shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : opportunity ? 'Update Opportunity' : 'Create Opportunity'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}