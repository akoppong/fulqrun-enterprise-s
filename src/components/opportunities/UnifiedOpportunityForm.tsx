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
import { getMEDDPICCScore } from '@/lib/crm-utils';
import { toMEDDPICCScore } from '@/lib/meddpicc-defaults';
import { AIService } from '@/lib/ai-service';
import { OpportunityService } from '@/lib/opportunity-service';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { OpportunityCloseDateInput } from '@/components/ui/date-input';
import { useDateValidation } from '@/hooks/useDateValidation';
import { Target, TrendUp, Brain, Lightbulb, CalendarCheck, AlertTriangle, Plus, X, Building, Users, DollarSign, Tag } from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { EnhancedMEDDPICCScoring } from './EnhancedMEDDPICCScoring';
import { EnhancedAIInsights } from './EnhancedAIInsights';

interface UnifiedOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: Opportunity) => void;
  editingOpportunity?: Opportunity | null;
  user: User;
  mode?: 'dialog' | 'page'; // New prop to control rendering mode
}

export function UnifiedOpportunityForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingOpportunity,
  user,
  mode = 'dialog'
}: UnifiedOpportunityFormProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateContact, setShowCreateContact] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  // Date validation hook for close date
  const closeDateValidation = useDateValidation({
    required: true,
    minDate: new Date(),
    format: 'MM/dd/yyyy'
  });
  
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    value: 0,
    stage: 'prospect',
    probability: 25,
    expectedCloseDate: new Date(),
    companyId: '',
    contactId: '',
    ownerId: user.id,
    priority: 'medium',
    industry: '',
    leadSource: '',
    tags: [],
    meddpicc: {
      metrics: 0,
      economicBuyer: 0,
      decisionCriteria: 0,
      decisionProcess: 0,
      paperProcess: 0,
      identifyPain: 0,
      champion: 0,
      competition: 0,
      score: 0,
      lastUpdated: new Date()
    }
  });

  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [newContact, setNewContact] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    companyId: ''
  });

  // Auto-save functionality
  const autoSave = useAutoSave({
    key: editingOpportunity?.id ? `opportunity_${editingOpportunity.id}` : 'opportunity_new',
    data: formData,
    enabled: isOpen,
    excludeFields: [],
    onSave: () => {
      setHasUnsavedChanges(false);
    },
    onLoad: (savedData) => {
      if (savedData && !editingOpportunity) {
        setFormData(savedData);
        toast.info('Draft restored from auto-save');
      }
    }
  });

  // Initialize demo data
  useEffect(() => {
    if (companies.length === 0) {
      const demoCompanies: Company[] = [
        {
          id: 'comp-1',
          name: 'TechCorp Solutions',
          industry: 'Technology',
          email: 'contact@techcorp.com',
          phone: '+1 (555) 123-4567',
          address: '123 Tech Street, San Francisco, CA',
          website: 'https://techcorp.com',
          size: 'Large',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'comp-2',
          name: 'GrowthCo Inc',
          industry: 'Marketing',
          email: 'hello@growthco.com',
          phone: '+1 (555) 987-6543',
          address: '456 Growth Ave, Austin, TX',
          website: 'https://growthco.com',
          size: 'Medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setCompanies(demoCompanies);
    }

    if (contacts.length === 0) {
      const demoContacts: Contact[] = [
        {
          id: 'cont-1',
          name: 'John Smith',
          title: 'CTO',
          email: 'john.smith@techcorp.com',
          phone: '+1 (555) 123-4567',
          companyId: 'comp-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cont-2',
          name: 'Sarah Johnson',
          title: 'Procurement Manager',
          email: 'sarah.johnson@techcorp.com',
          phone: '+1 (555) 123-4568',
          companyId: 'comp-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'cont-3',
          name: 'Mike Davis',
          title: 'Marketing Director',
          email: 'mike.davis@growthco.com',
          phone: '+1 (555) 987-6543',
          companyId: 'comp-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setContacts(demoContacts);
    }

    if (allUsers.length === 0) {
      setAllUsers([user]);
    }
  }, [companies.length, contacts.length, setCompanies, setContacts, setAllUsers, user]);

  // Initialize form with editing data
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        ...editingOpportunity,
        expectedCloseDate: new Date(editingOpportunity.expectedCloseDate),
        tags: editingOpportunity.tags || [],
        meddpicc: editingOpportunity.meddpicc ? {
          metrics: toMEDDPICCScore(editingOpportunity.meddpicc.metrics),
          economicBuyer: toMEDDPICCScore(editingOpportunity.meddpicc.economicBuyer),
          decisionCriteria: toMEDDPICCScore(editingOpportunity.meddpicc.decisionCriteria),
          decisionProcess: toMEDDPICCScore(editingOpportunity.meddpicc.decisionProcess),
          paperProcess: toMEDDPICCScore(editingOpportunity.meddpicc.paperProcess),
          identifyPain: toMEDDPICCScore(editingOpportunity.meddpicc.identifyPain),
          champion: toMEDDPICCScore(editingOpportunity.meddpicc.champion),
          competition: toMEDDPICCScore(editingOpportunity.meddpicc.competition),
          score: toMEDDPICCScore(editingOpportunity.meddpicc.score),
          ...editingOpportunity.meddpicc,
          lastUpdated: new Date()
        } : {
          metrics: 0,
          economicBuyer: 0,
          decisionCriteria: 0,
          decisionProcess: 0,
          paperProcess: 0,
          identifyPain: 0,
          champion: 0,
          competition: 0,
          score: 0,
          lastUpdated: new Date()
        }
      });
      setHasUnsavedChanges(false);
    } else {
      if (autoSave.hasDraft && !formData.title) {
        // Draft will be loaded via autoSave.onLoad callback
      } else {
        setFormData({
          title: '',
          description: '',
          value: 0,
          stage: 'prospect',
          probability: 25,
          expectedCloseDate: new Date(),
          companyId: '',
          contactId: '',
          ownerId: user.id,
          priority: 'medium',
          industry: '',
          leadSource: '',
          tags: [],
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
      }
      setHasUnsavedChanges(false);
    }
    setActiveTab('basic');
  }, [editingOpportunity, user.id, isOpen]);

  // Track changes to enable unsaved changes indicator
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  const generateAIInsights = async () => {
    // This functionality is now handled by the EnhancedAIInsights component
    toast.info('Use the AI Insights tab for comprehensive analysis');
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return false;
    }
    
    if (!formData.companyId) {
      toast.error('Company is required');
      return false;
    }
    
    if (!formData.value || formData.value <= 0) {
      toast.error('Valid deal value is required');
      return false;
    }
    
    if (!formData.expectedCloseDate) {
      toast.error('Expected close date is required');
      return false;
    }
    
    if (!closeDateValidation.isValid && formData.expectedCloseDate) {
      toast.error(`Invalid expected close date: ${closeDateValidation.error}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const meddpicScore = getMEDDPICCScore(formData.meddpicc);
    const nextBestActions = AIService.getNextBestActions(formData as Opportunity);
    
    try {
      const opportunityData: Partial<Opportunity> = {
        ...formData,
        meddpicc: {
          ...formData.meddpicc!,
          score: meddpicScore
        },
        aiInsights: aiInsights || {
          riskScore: 50,
          nextBestActions,
          confidenceLevel: 'medium' as const,
          lastAiUpdate: new Date().toISOString()
        },
        expectedCloseDate: formData.expectedCloseDate,
        updatedAt: new Date(),
        createdAt: editingOpportunity?.createdAt || new Date()
      };

      let savedOpportunity: Opportunity;
      
      if (editingOpportunity) {
        savedOpportunity = await OpportunityService.updateOpportunity(editingOpportunity.id, opportunityData) as Opportunity;
        toast.success('Opportunity updated successfully');
      } else {
        savedOpportunity = await OpportunityService.createOpportunity(opportunityData);
        toast.success('Opportunity created successfully');
      }

      onSave(savedOpportunity);
      autoSave.clearDraft();
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity. Please try again.');
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges && (formData.title || formData.description)) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your changes will be auto-saved as a draft.'
      );
      if (!shouldDiscard) return;
    }
    onClose();
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCreateCompany = async () => {
    if (!newCompany.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    const company: Company = {
      id: `comp-${Date.now()}`,
      name: newCompany.name.trim(),
      industry: newCompany.industry.trim() || 'Other',
      email: newCompany.email.trim() || '',
      phone: newCompany.phone.trim() || '',
      address: newCompany.address.trim() || '',
      website: '',
      size: 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCompanies([...companies, company]);
    setFormData({ ...formData, companyId: company.id });
    setNewCompany({ name: '', industry: '', email: '', phone: '', address: '' });
    setShowCreateCompany(false);
    toast.success('Company created successfully');
  };

  const handleCreateContact = async () => {
    if (!newContact.name.trim() || !newContact.email.trim()) {
      toast.error('Contact name and email are required');
      return;
    }

    const contact: Contact = {
      id: `cont-${Date.now()}`,
      name: newContact.name.trim(),
      title: newContact.title.trim() || '',
      email: newContact.email.trim(),
      phone: newContact.phone.trim() || '',
      companyId: newContact.companyId || formData.companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setContacts([...contacts, contact]);
    setFormData({ ...formData, contactId: contact.id });
    setNewContact({ name: '', title: '', email: '', phone: '', companyId: '' });
    setShowCreateContact(false);
    toast.success('Contact created successfully');
  };

  const availableContacts = contacts.filter(contact => 
    !formData.companyId || contact.companyId === formData.companyId
  );

  const availableOwners = allUsers.filter(u => 
    user.role === 'admin' || user.role === 'executive' || 
    (user.role === 'manager' && (u.managerId === user.id || u.id === user.id)) ||
    u.id === user.id
  );

  const selectedCompany = companies.find(c => c.id === formData.companyId);
  const selectedContact = contacts.find(c => c.id === formData.contactId);
  const currentScore = getMEDDPICCScore(formData.meddpicc);

  const priorities = ['low', 'medium', 'high', 'critical'];
  const leadSources = ['Website', 'Referral', 'Cold Call', 'Email Campaign', 'Social Media', 'Trade Show', 'Partner', 'Other'];
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Government', 'Other'];

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Date validation alert */}
        {closeDateValidation.isTouched && closeDateValidation.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Expected close date: {closeDateValidation.error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="meddpicc" className="flex items-center gap-2">
              MEDDPICC
              <Badge variant={currentScore >= 70 ? 'default' : currentScore >= 40 ? 'secondary' : 'destructive'}>
                {currentScore}%
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain size={16} />
              AI Insights
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Opportunity Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="title">Opportunity Title <span className="text-destructive">*</span></Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter opportunity title"
                        required
                        className="h-10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter opportunity description"
                        rows={4}
                        className="resize-none min-h-20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stage">PEAK Stage <span className="text-destructive">*</span></Label>
                      <Select value={formData.stage || 'prospect'} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value as any }))}>
                        <SelectTrigger id="stage" className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {PEAK_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              <div className="flex flex-col items-start py-1">
                                <span className="font-medium">{stage.label}</span>
                                <span className="text-xs text-muted-foreground">{stage.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority as string} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map(priority => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="value">Deal Value <span className="text-destructive">*</span></Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                      placeholder="0"
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="probability">Win Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability || 25}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability: Number(e.target.value) }))}
                      placeholder="25"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <OpportunityCloseDateInput
                      id="closeDate"
                      name="expectedCloseDate"
                      value={formData.expectedCloseDate}
                      onChange={(value, isValid) => {
                        if (isValid && value) {
                          setFormData(prev => ({ 
                            ...prev, 
                            expectedCloseDate: new Date(value)
                          }));
                        }
                      }}
                      onValidationChange={(isValid, error, warnings) => {
                        if (!isValid && error) {
                          console.warn('Date validation error:', error);
                        }
                      }}
                      required={true}
                      showRelativeTime={true}
                      className="w-full h-10"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Company & Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="company">Company <span className="text-destructive">*</span></Label>
                      <Select value={formData.companyId || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, companyId: value, contactId: '' }))}>
                        <SelectTrigger id="company" className="h-10">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name} ({company.industry})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateCompany(true)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="contact">Primary Contact</Label>
                      <Select 
                        value={formData.contactId || ''} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, contactId: value }))}
                        disabled={!formData.companyId}
                      >
                        <SelectTrigger id="contact" className="h-10">
                          <SelectValue placeholder={
                            !formData.companyId 
                              ? "Select company first" 
                              : availableContacts.length === 0 
                                ? "No contacts available" 
                                : "Select contact"
                          } />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} ({contact.title || 'No title'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-6">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowCreateContact(true)}
                        disabled={!formData.companyId}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedCompany && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-start gap-3">
                        <Building className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-medium">{selectedCompany.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedCompany.industry}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="leadSource">Lead Source</Label>
                    <Select value={formData.leadSource || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, leadSource: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        {leadSources.map(source => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="owner">Opportunity Owner <span className="text-destructive">*</span></Label>
                  <Select value={formData.ownerId || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, ownerId: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOwners.map(owner => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.name} ({owner.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
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
          
          <TabsContent value="meddpicc" className="space-y-6 mt-0">
            <EnhancedMEDDPICCScoring
              meddpicc={formData.meddpicc!}
              onChange={(meddpicc) => setFormData(prev => ({ ...prev, meddpicc }))}
              opportunityValue={formData.value}
              companyName={selectedCompany?.name}
            />
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6 mt-0">
            <EnhancedAIInsights
              opportunity={formData}
              company={selectedCompany}
              contact={selectedContact}
              onInsightsGenerated={(insights) => setAiInsights(insights)}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-background/80 backdrop-blur-sm flex-shrink-0">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.title?.trim() || (closeDateValidation.isTouched && !closeDateValidation.isValid)}
          className="flex items-center gap-2"
        >
          <CalendarCheck size={16} />
          {editingOpportunity ? 'Update Opportunity' : 'Create Opportunity'}
        </Button>
      </div>
    </form>
  );

  if (mode === 'page') {
    // Render as a full page
    return (
      <div className="h-full w-full flex flex-col">
        <div className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Target size={24} className="text-primary" />
                {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {editingOpportunity 
                  ? `Modify the details and track progress for "${editingOpportunity.title}"`
                  : 'Create a new sales opportunity and track it through the PEAK methodology'
                }
              </p>
            </div>
            
            {/* Auto-save indicator */}
            <AutoSaveIndicator
              enabled={isOpen}
              lastSaved={autoSave.lastSaved}
              hasUnsavedChanges={hasUnsavedChanges}
              onSaveNow={autoSave.saveNow}
              onClearDraft={autoSave.clearDraft}
              hasDraft={autoSave.hasDraft && !editingOpportunity}
              className="text-sm"
            />
          </div>
        </div>
        
        <FormContent />

        {/* Create Company Modal */}
        <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newCompanyName">Company Name *</Label>
                <Input
                  id="newCompanyName"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Enter company name..."
                />
              </div>
              <div>
                <Label htmlFor="newCompanyIndustry">Industry</Label>
                <Select value={newCompany.industry} onValueChange={(value) => setNewCompany({ ...newCompany, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newCompanyEmail">Email</Label>
                <Input
                  id="newCompanyEmail"
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                  placeholder="company@example.com"
                />
              </div>
              <div>
                <Label htmlFor="newCompanyPhone">Phone</Label>
                <Input
                  id="newCompanyPhone"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateCompany(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCompany}>
                Create Company
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Contact Modal */}
        <Dialog open={showCreateContact} onOpenChange={setShowCreateContact}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newContactName">Contact Name *</Label>
                <Input
                  id="newContactName"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Enter contact name..."
                />
              </div>
              <div>
                <Label htmlFor="newContactTitle">Job Title</Label>
                <Input
                  id="newContactTitle"
                  value={newContact.title}
                  onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                  placeholder="Enter job title..."
                />
              </div>
              <div>
                <Label htmlFor="newContactEmail">Email *</Label>
                <Input
                  id="newContactEmail"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <Label htmlFor="newContactPhone">Phone</Label>
                <Input
                  id="newContactPhone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateContact(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateContact}>
                Create Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Render as dialog
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-7xl w-[96vw] h-[95vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2">
                  <Target size={24} className="text-primary" />
                  {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {editingOpportunity 
                    ? `Modify the details and track progress for "${editingOpportunity.title}"`
                    : 'Create a new sales opportunity and track it through the PEAK methodology'
                  }
                </DialogDescription>
              </div>
              
              {/* Auto-save indicator */}
              <AutoSaveIndicator
                enabled={isOpen}
                lastSaved={autoSave.lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
                onSaveNow={autoSave.saveNow}
                onClearDraft={autoSave.clearDraft}
                hasDraft={autoSave.hasDraft && !editingOpportunity}
                className="text-sm"
              />
            </div>
          </DialogHeader>
          
          <FormContent />
        </DialogContent>
      </Dialog>

      {/* Create Company Modal */}
      <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newCompanyName">Company Name *</Label>
              <Input
                id="newCompanyName"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Enter company name..."
              />
            </div>
            <div>
              <Label htmlFor="newCompanyIndustry">Industry</Label>
              <Select value={newCompany.industry} onValueChange={(value) => setNewCompany({ ...newCompany, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="newCompanyEmail">Email</Label>
              <Input
                id="newCompanyEmail"
                type="email"
                value={newCompany.email}
                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                placeholder="company@example.com"
              />
            </div>
            <div>
              <Label htmlFor="newCompanyPhone">Phone</Label>
              <Input
                id="newCompanyPhone"
                value={newCompany.phone}
                onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateCompany(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCompany}>
              Create Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Contact Modal */}
      <Dialog open={showCreateContact} onOpenChange={setShowCreateContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newContactName">Contact Name *</Label>
              <Input
                id="newContactName"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Enter contact name..."
              />
            </div>
            <div>
              <Label htmlFor="newContactTitle">Job Title</Label>
              <Input
                id="newContactTitle"
                value={newContact.title}
                onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                placeholder="Enter job title..."
              />
            </div>
            <div>
              <Label htmlFor="newContactEmail">Email *</Label>
              <Input
                id="newContactEmail"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div>
              <Label htmlFor="newContactPhone">Phone</Label>
              <Input
                id="newContactPhone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateContact(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateContact}>
              Create Contact
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}