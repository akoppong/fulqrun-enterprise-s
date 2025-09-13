import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User, PEAK_STAGES } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OpportunityService } from '@/lib/opportunity-service';
import { formatCurrency } from '@/lib/crm-utils';
import { 
  Building,
  Users,
  Calendar,
  DollarSign,
  Target,
  Tag,
  Plus,
  X,
  AlertCircle,
  CheckCircle
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface NewOpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (opportunity: Opportunity) => void;
  editingOpportunity?: Opportunity | null;
  user: User;
}

export function NewOpportunityForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingOpportunity, 
  user 
}: NewOpportunityFormProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyId: '',
    contactId: '',
    value: '',
    stage: 'prospect',
    probability: '50',
    expectedCloseDate: '',
    ownerId: user.id,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    industry: '',
    leadSource: '',
    tags: [] as string[]
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateContact, setShowCreateContact] = useState(false);
  
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

  // Initialize form with editing data
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        title: editingOpportunity.title,
        description: editingOpportunity.description,
        companyId: editingOpportunity.companyId,
        contactId: editingOpportunity.contactId,
        value: editingOpportunity.value.toString(),
        stage: editingOpportunity.stage,
        probability: editingOpportunity.probability.toString(),
        expectedCloseDate: editingOpportunity.expectedCloseDate.split('T')[0], // Convert to date input format
        ownerId: editingOpportunity.ownerId,
        priority: editingOpportunity.priority || 'medium',
        industry: editingOpportunity.industry || '',
        leadSource: editingOpportunity.leadSource || '',
        tags: editingOpportunity.tags || []
      });
    } else {
      // Reset form for new opportunity
      setFormData({
        title: '',
        description: '',
        companyId: '',
        contactId: '',
        value: '',
        stage: 'prospect',
        probability: '50',
        expectedCloseDate: '',
        ownerId: user.id,
        priority: 'medium',
        industry: '',
        leadSource: '',
        tags: []
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [editingOpportunity, user.id, isOpen]);

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
  }, [companies.length, contacts.length, setCompanies, setContacts]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Opportunity title is required';
    }
    
    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
    }
    
    if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      newErrors.value = 'Valid deal value is required';
    }
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    } else {
      const closeDate = new Date(formData.expectedCloseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (closeDate < today) {
        newErrors.expectedCloseDate = 'Close date cannot be in the past';
      }
    }
    
    if (!formData.ownerId) {
      newErrors.ownerId = 'Owner is required';
    }
    
    const probability = Number(formData.probability);
    if (isNaN(probability) || probability < 0 || probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const opportunityData: Partial<Opportunity> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        companyId: formData.companyId,
        contactId: formData.contactId || '',
        value: Number(formData.value),
        stage: formData.stage,
        probability: Number(formData.probability),
        expectedCloseDate: new Date(formData.expectedCloseDate).toISOString(),
        ownerId: formData.ownerId,
        priority: formData.priority,
        industry: formData.industry.trim() || undefined,
        leadSource: formData.leadSource.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        meddpicc: editingOpportunity?.meddpicc || {
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

      let savedOpportunity: Opportunity;
      
      if (editingOpportunity) {
        savedOpportunity = await OpportunityService.updateOpportunity(editingOpportunity.id, opportunityData) as Opportunity;
        toast.success('Opportunity updated successfully');
      } else {
        savedOpportunity = await OpportunityService.createOpportunity(opportunityData);
        toast.success('Opportunity created successfully');
      }

      onSave?.(savedOpportunity);
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
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

  const stages = ['prospect', 'engage', 'acquire', 'closed-won', 'closed-lost'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const leadSources = ['Website', 'Referral', 'Cold Call', 'Email Campaign', 'Social Media', 'Trade Show', 'Partner', 'Other'];
  const industries = ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education', 'Government', 'Other'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="opportunity-edit-form-dialog max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="relationships">Relationships</TabsTrigger>
              <TabsTrigger value="review">Review</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              <div className="space-y-6 pr-4">
                <TabsContent value="basic" className="mt-0">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Opportunity Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <Label htmlFor="title">
                                Opportunity Title *
                              </Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter opportunity title..."
                                className={errors.title ? 'border-destructive' : ''}
                              />
                              {errors.title && (
                                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.title}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="description">
                                Description
                              </Label>
                              <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the opportunity..."
                                rows={4}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="stage">
                                Current Stage *
                              </Label>
                              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {stages.map(stage => (
                                    <SelectItem key={stage} value={stage}>
                                      {stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="priority">
                                Priority
                              </Label>
                              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
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

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Financial Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <Label htmlFor="value">
                              Deal Value * (USD)
                            </Label>
                            <Input
                              id="value"
                              type="number"
                              value={formData.value}
                              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className={errors.value ? 'border-destructive' : ''}
                            />
                            {errors.value && (
                              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.value}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="probability">
                              Win Probability (%)
                            </Label>
                            <Input
                              id="probability"
                              type="number"
                              value={formData.probability}
                              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                              placeholder="50"
                              min="0"
                              max="100"
                              className={errors.probability ? 'border-destructive' : ''}
                            />
                            {errors.probability && (
                              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.probability}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="expectedCloseDate">
                              Expected Close Date *
                            </Label>
                            <Input
                              id="expectedCloseDate"
                              type="date"
                              value={formData.expectedCloseDate}
                              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                              className={errors.expectedCloseDate ? 'border-destructive' : ''}
                            />
                            {errors.expectedCloseDate && (
                              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.expectedCloseDate}
                              </p>
                            )}
                          </div>
                        </div>

                        {formData.value && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Weighted Value:</span>
                              <span className="font-medium">
                                {formatCurrency(Number(formData.value) * Number(formData.probability) / 100)}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
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
                            <Select value={formData.leadSource} onValueChange={(value) => setFormData({ ...formData, leadSource: value })}>
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
                          <Label htmlFor="owner">Opportunity Owner *</Label>
                          <Select value={formData.ownerId} onValueChange={(value) => setFormData({ ...formData, ownerId: value })}>
                            <SelectTrigger className={errors.ownerId ? 'border-destructive' : ''}>
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
                          {errors.ownerId && (
                            <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.ownerId}
                            </p>
                          )}
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
                            {formData.tags.length > 0 && (
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
                  </div>
                </TabsContent>

                <TabsContent value="relationships" className="mt-0">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="w-5 h-5" />
                          Company
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="company">Company *</Label>
                            <Select value={formData.companyId} onValueChange={(value) => {
                              setFormData({ ...formData, companyId: value, contactId: '' });
                            }}>
                              <SelectTrigger className={errors.companyId ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select company" />
                              </SelectTrigger>
                              <SelectContent>
                                {companies.map(company => (
                                  <SelectItem key={company.id} value={company.id}>
                                    {company.name} ({company.industry})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.companyId && (
                              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.companyId}
                              </p>
                            )}
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

                        {selectedCompany && (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start gap-3">
                              <Building className="w-8 h-8 text-blue-600 mt-1" />
                              <div>
                                <h3 className="font-medium">{selectedCompany.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedCompany.industry}</p>
                                <div className="mt-2 space-y-1">
                                  {selectedCompany.email && (
                                    <p className="text-sm">{selectedCompany.email}</p>
                                  )}
                                  {selectedCompany.phone && (
                                    <p className="text-sm">{selectedCompany.phone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Label htmlFor="contact">Primary Contact</Label>
                            <Select 
                              value={formData.contactId} 
                              onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                              disabled={!formData.companyId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !formData.companyId 
                                    ? "Select company first" 
                                    : availableContacts.length === 0 
                                      ? "No contacts available" 
                                      : "Select contact"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {availableContacts.map(contact => (
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

                        {selectedContact && (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start gap-3">
                              <Users className="w-8 h-8 text-green-600 mt-1" />
                              <div>
                                <h3 className="font-medium">{selectedContact.name}</h3>
                                <p className="text-sm text-muted-foreground">{selectedContact.title}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm">{selectedContact.email}</p>
                                  {selectedContact.phone && (
                                    <p className="text-sm">{selectedContact.phone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="review" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Opportunity</CardTitle>
                      <p className="text-muted-foreground">
                        Please review all information before {editingOpportunity ? 'updating' : 'creating'} the opportunity.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-muted-foreground">OPPORTUNITY</h4>
                            <p className="text-lg font-semibold">{formData.title || 'Untitled Opportunity'}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground">DESCRIPTION</h4>
                            <p>{formData.description || 'No description provided'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-muted-foreground">STAGE</h4>
                              <Badge variant="outline">
                                {formData.stage.charAt(0).toUpperCase() + formData.stage.slice(1)}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium text-muted-foreground">PRIORITY</h4>
                              <Badge variant="secondary">
                                {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-muted-foreground">VALUE</h4>
                              <p className="text-lg font-semibold">
                                {formData.value ? formatCurrency(Number(formData.value)) : '$0'}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-muted-foreground">PROBABILITY</h4>
                              <p className="text-lg font-semibold">{formData.probability}%</p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground">WEIGHTED VALUE</h4>
                            <p className="text-lg font-semibold">
                              {formData.value && formData.probability 
                                ? formatCurrency(Number(formData.value) * Number(formData.probability) / 100)
                                : '$0'}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-muted-foreground">EXPECTED CLOSE</h4>
                            <p>
                              {formData.expectedCloseDate 
                                ? format(new Date(formData.expectedCloseDate), 'MMMM dd, yyyy')
                                : 'Not set'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-muted-foreground mb-2">COMPANY</h4>
                          {selectedCompany ? (
                            <div className="p-3 border rounded-lg">
                              <p className="font-medium">{selectedCompany.name}</p>
                              <p className="text-sm text-muted-foreground">{selectedCompany.industry}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No company selected</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-muted-foreground mb-2">PRIMARY CONTACT</h4>
                          {selectedContact ? (
                            <div className="p-3 border rounded-lg">
                              <p className="font-medium">{selectedContact.name}</p>
                              <p className="text-sm text-muted-foreground">{selectedContact.title}</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No contact selected</p>
                          )}
                        </div>
                      </div>

                      {formData.tags.length > 0 && (
                        <div>
                          <h4 className="font-medium text-muted-foreground mb-2">TAGS</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              'Saving...'
            ) : editingOpportunity ? (
              'Update Opportunity'
            ) : (
              'Create Opportunity'
            )}
          </Button>
        </DialogFooter>

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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCompany(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCompany}>
                Create Company
              </Button>
            </DialogFooter>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateContact(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateContact}>
                Create Contact
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}