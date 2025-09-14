import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Opportunity, PEAK_STAGES, Company, Contact, MEDDPICC, User } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { OpportunityCloseDateInput } from '@/components/ui/date-input';
import { useDateValidation } from '@/hooks/useDateValidation';
import { UnifiedMEDDPICCModule } from './UnifiedMEDDPICCModule';
import { UnifiedAIInsights } from './UnifiedAIInsights';
import { Target, TrendUp, Brain, Lightbulb, CalendarCheck, AlertTriangle, Plus, X, Building, Users, DollarSign, Tag } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UnifiedOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: Opportunity) => void;
  editingOpportunity?: Opportunity | null;
  user: User;
  mode?: 'dialog' | 'page';
  source?: 'pipeline' | 'opportunities'; // Track which module called this form
}

export function UnifiedOpportunityForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingOpportunity,
  user,
  mode = 'dialog',
  source = 'opportunities'
}: UnifiedOpportunityFormProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    id: '',
    name: '',
    company: '',
    value: 0,
    stage: 'prospect',
    probability: 50,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    primaryContact: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
    source: '',
    description: '',
    tags: [],
    priority: 'medium',
    assignedTo: user.id,
    peakStage: 'prospect',
    meddpicc: {
      metrics: 0,
      economicBuyer: 0,
      decisionCriteria: 0,
      decisionProcess: 0,
      paperProcess: 0,
      identifyPain: 0,
      champion: 0,
      competition: 0
    },
    activities: [],
    contacts: [],
    createdBy: user.id,
    createdDate: new Date(),
    updatedAt: new Date()
  });

  // Initialize with editing data
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        ...editingOpportunity,
        expectedCloseDate: editingOpportunity.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } else {
      // Reset form for new opportunity
      setFormData({
        id: '',
        name: '',
        company: '',
        value: 0,
        stage: 'prospect',
        probability: 50,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        primaryContact: '',
        contactEmail: '',
        contactPhone: '',
        industry: '',
        source: '',
        description: '',
        tags: [],
        priority: 'medium',
        assignedTo: user.id,
        peakStage: 'prospect',
        meddpicc: {
          metrics: 0,
          economicBuyer: 0,
          decisionCriteria: 0,
          decisionProcess: 0,
          paperProcess: 0,
          identifyPain: 0,
          champion: 0,
          competition: 0
        },
        activities: [],
        contacts: [],
        createdBy: user.id,
        createdDate: new Date(),
        updatedAt: new Date()
      });
    }
  }, [editingOpportunity, user.id]);

  // Auto-save functionality
  const { hasUnsavedChanges, saveStatus } = useAutoSave(
    formData,
    async (data) => {
      // Auto-save logic here
      console.log('Auto-saving opportunity:', data);
    },
    { interval: 5000, enabled: true }
  );

  // Date validation
  const closeDateValidation = useDateValidation({
    required: true,
    minDate: new Date(),
    format: 'MM/dd/yyyy'
  });

  // Initialize sample data
  useEffect(() => {
    if (companies.length === 0) {
      const sampleCompanies: Company[] = [
        { id: '1', name: 'TechCorp Solutions', industry: 'Technology', size: 'Large', location: 'San Francisco, CA' },
        { id: '2', name: 'GrowthCo Inc', industry: 'Marketing', size: 'Medium', location: 'New York, NY' },
        { id: '3', name: 'InnovateNow LLC', industry: 'Consulting', size: 'Small', location: 'Austin, TX' }
      ];
      setCompanies(sampleCompanies);
    }

    if (contacts.length === 0) {
      const sampleContacts: Contact[] = [
        { id: '1', name: 'John Smith', email: 'john.smith@techcorp.com', phone: '+1 (555) 123-4567', company: 'TechCorp Solutions', role: 'CTO' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@techcorp.com', phone: '+1 (555) 987-6543', company: 'TechCorp Solutions', role: 'Procurement Manager' },
        { id: '3', name: 'Mike Davis', email: 'mike.davis@growthco.com', phone: '+1 (555) 456-7890', company: 'GrowthCo Inc', role: 'Marketing Director' }
      ];
      setContacts(sampleContacts);
    }

    if (allUsers.length === 0) {
      setAllUsers([user]);
    }
  }, [companies.length, contacts.length, allUsers.length, user, setCompanies, setContacts, setAllUsers]);

  const handleInputChange = (field: keyof Opportunity, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Opportunity name is required';
    }

    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Deal value must be greater than 0';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before saving');
      return;
    }

    setLoading(true);
    try {
      const opportunityData: Opportunity = {
        id: formData.id || Date.now().toString(),
        name: formData.name!,
        company: formData.company!,
        value: formData.value!,
        stage: formData.stage || 'prospect',
        probability: formData.probability || 50,
        expectedCloseDate: formData.expectedCloseDate!,
        primaryContact: formData.primaryContact || '',
        contactEmail: formData.contactEmail || '',
        contactPhone: formData.contactPhone || '',
        industry: formData.industry || '',
        source: formData.source || '',
        description: formData.description || '',
        tags: formData.tags || [],
        priority: formData.priority || 'medium',
        assignedTo: formData.assignedTo || user.id,
        peakStage: formData.peakStage || 'prospect',
        meddpicc: formData.meddpicc || {
          metrics: 0,
          economicBuyer: 0,
          decisionCriteria: 0,
          decisionProcess: 0,
          paperProcess: 0,
          identifyPain: 0,
          champion: 0,
          competition: 0
        },
        activities: formData.activities || [],
        contacts: formData.contacts || [],
        createdBy: formData.createdBy || user.id,
        createdDate: formData.createdDate || new Date(),
        updatedAt: new Date()
      };

      // Save through service
      if (editingOpportunity) {
        await OpportunityService.updateOpportunity(opportunityData.id, opportunityData);
      } else {
        await OpportunityService.createOpportunity(opportunityData);
      }

      onSave(opportunityData);
      onClose();
      
      toast.success(editingOpportunity ? 'Opportunity updated successfully' : 'Opportunity created successfully');
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMEDDPICCChange = (meddpicc: MEDDPICC) => {
    handleInputChange('meddpicc', meddpicc);
  };

  const getCompanyContacts = () => {
    return contacts.filter(contact => contact.company === formData.company);
  };

  const renderFormContent = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[500px] w-full">
          <TabsContent value="details" className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Opportunity Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter opportunity name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={formData.company || ''}
                  onValueChange={(value) => handleInputChange('company', value)}
                >
                  <SelectTrigger className={errors.company ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Deal Value ($) *</Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.value || ''}
                  onChange={(e) => handleInputChange('value', Number(e.target.value))}
                  placeholder="Enter deal value"
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Sales Stage</Label>
                <Select
                  value={formData.stage || ''}
                  onValueChange={(value) => handleInputChange('stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="closed-won">Closed Won</SelectItem>
                    <SelectItem value="closed-lost">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="peak-stage">PEAK Stage</Label>
                <Select
                  value={formData.peakStage || ''}
                  onValueChange={(value) => handleInputChange('peakStage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PEAK stage" />
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

              <div className="space-y-2">
                <Label htmlFor="probability">Win Probability (%)</Label>
                <div className="space-y-2">
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability || ''}
                    onChange={(e) => handleInputChange('probability', Number(e.target.value))}
                    placeholder="Enter probability"
                  />
                  <Progress value={formData.probability || 0} className="w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-contact">Primary Contact</Label>
                <Select
                  value={formData.primaryContact || ''}
                  onValueChange={(value) => {
                    const contact = contacts.find(c => c.name === value);
                    handleInputChange('primaryContact', value);
                    if (contact) {
                      handleInputChange('contactEmail', contact.email);
                      handleInputChange('contactPhone', contact.phone);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCompanyContacts().map((contact) => (
                      <SelectItem key={contact.id} value={contact.name}>
                        {contact.name} - {contact.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input
                  id="contact-phone"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Enter contact phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry || ''}
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select
                  value={formData.source || ''}
                  onValueChange={(value) => handleInputChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || ''}
                  onValueChange={(value) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-close-date">Expected Close Date *</Label>
              <OpportunityCloseDateInput
                value={formData.expectedCloseDate}
                onChange={(date) => handleInputChange('expectedCloseDate', date)}
                validation={closeDateValidation}
                className={errors.expectedCloseDate ? 'border-red-500' : ''}
              />
              {errors.expectedCloseDate && <p className="text-sm text-red-500">{errors.expectedCloseDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter opportunity description"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assigned-to">Assigned To</Label>
                <Select
                  value={formData.assignedTo || ''}
                  onValueChange={(value) => handleInputChange('assignedTo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {(formData.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          const newTags = (formData.tags || []).filter((_, i) => i !== index);
                          handleInputChange('tags', newTags);
                        }} 
                      />
                    </Badge>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tag = prompt('Enter tag:');
                      if (tag && tag.trim()) {
                        const newTags = [...(formData.tags || []), tag.trim()];
                        handleInputChange('tags', newTags);
                      }
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Opportunity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${(formData.value || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Deal Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.probability || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Win Probability</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formData.expectedCloseDate ? format(formData.expectedCloseDate, 'MMM dd') : 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Expected Close</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formData.stage || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Stage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meddpicc" className="space-y-6 p-1">
            <UnifiedMEDDPICCModule
              meddpicc={formData.meddpicc || {
                metrics: 0,
                economicBuyer: 0,
                decisionCriteria: 0,
                decisionProcess: 0,
                paperProcess: 0,
                identifyPain: 0,
                champion: 0,
                competition: 0
              }}
              onChange={handleMEDDPICCChange}
              opportunityValue={formData.value}
              companyName={formData.company}
              readonly={false}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 p-1">
            <UnifiedAIInsights
              opportunity={formData as Opportunity}
              onUpdate={(insights) => {
                // Handle AI insights update
                console.log('AI Insights updated:', insights);
              }}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <AutoSaveIndicator status={saveStatus} />
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-yellow-600">
              Unsaved changes
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : (editingOpportunity ? 'Update' : 'Create')} Opportunity
          </Button>
        </div>
      </div>
    </div>
  );

  if (mode === 'page') {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {editingOpportunity ? 'Edit' : 'Create'} Opportunity
          </h1>
          <p className="text-muted-foreground">
            {source === 'pipeline' ? 'Pipeline Module' : 'Opportunities Module'}
          </p>
        </div>
        {renderFormContent()}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] opportunity-edit-form-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {editingOpportunity ? 'Edit' : 'Create'} Opportunity
          </DialogTitle>
          <DialogDescription>
            {source === 'pipeline' ? 'Pipeline Module' : 'Opportunities Module'}
            {editingOpportunity ? ' - Update opportunity details and MEDDPICC scoring' : ' - Create a new opportunity with complete details'}
          </DialogDescription>
        </DialogHeader>
        
        {renderFormContent()}
      </DialogContent>
    </Dialog>
  );
}