import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User, PEAK_STAGES } from '@/lib/types';
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
  CheckCircle,
  ArrowLeft,
  Save,
  FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface NewOpportunityFormPageProps {
  onSave: (opportunity: Opportunity) => void;
  onCancel: () => void;
  editingOpportunity?: Opportunity | null;
  user: User;
  isEditing: boolean;
}

export function NewOpportunityFormPage({ 
  onSave, 
  onCancel,
  editingOpportunity, 
  user,
  isEditing
}: NewOpportunityFormPageProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    primaryContact: '',
    contactEmail: '',
    contactPhone: '',
    value: '',
    stage: 'prospect' as const,
    probability: '50',
    peakStage: 'prospect' as const,
    expectedCloseDate: '',
    description: '',
    industry: '',
    source: 'referral',
    tags: [] as string[],
    priority: 'medium' as const,
    assignedTo: user.id
  });

  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data for editing
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        name: editingOpportunity.name || '',
        company: editingOpportunity.company || '',
        primaryContact: editingOpportunity.primaryContact || '',
        contactEmail: editingOpportunity.contactEmail || '',
        contactPhone: editingOpportunity.contactPhone || '',
        value: editingOpportunity.value?.toString() || '',
        stage: editingOpportunity.stage || 'prospect',
        probability: editingOpportunity.probability?.toString() || '50',
        peakStage: editingOpportunity.peakScores ? 
          Object.entries(editingOpportunity.peakScores).reduce((a, b) => 
            editingOpportunity.peakScores![a[0]] > editingOpportunity.peakScores![b[0]] ? a : b
          )[0] as keyof typeof PEAK_STAGES : 'prospect',
        expectedCloseDate: editingOpportunity.expectedCloseDate ? 
          format(editingOpportunity.expectedCloseDate, 'yyyy-MM-dd') : '',
        description: editingOpportunity.description || '',
        industry: editingOpportunity.industry || '',
        source: editingOpportunity.source || 'referral',
        tags: editingOpportunity.tags || [],
        priority: editingOpportunity.priority || 'medium',
        assignedTo: editingOpportunity.assignedTo || user.id
      });
    }
  }, [editingOpportunity, user.id]);

  // Initialize demo data
  useEffect(() => {
    if (companies.length === 0) {
      const demoCompanies: Company[] = [
        { 
          id: 'company-1', 
          name: 'TechCorp Solutions', 
          industry: 'Technology', 
          size: 'large',
          address: '123 Tech Street, San Francisco, CA',
          phone: '+1 (555) 123-0000',
          website: 'https://techcorp.com'
        },
        { 
          id: 'company-2', 
          name: 'GrowthCo Inc', 
          industry: 'Marketing', 
          size: 'medium',
          address: '456 Growth Ave, Austin, TX',
          phone: '+1 (555) 456-0000',
          website: 'https://growthco.com'
        },
        { 
          id: 'company-3', 
          name: 'InnovateLab', 
          industry: 'Research', 
          size: 'small',
          address: '789 Innovation Blvd, Boston, MA',
          phone: '+1 (555) 789-0000',
          website: 'https://innovatelab.com'
        }
      ];
      setCompanies(demoCompanies);
    }

    if (contacts.length === 0) {
      const demoContacts: Contact[] = [
        { 
          id: 'contact-1', 
          name: 'John Smith', 
          role: 'CTO', 
          company: 'TechCorp Solutions',
          companyId: 'company-1',
          email: 'john.smith@techcorp.com', 
          phone: '+1 (555) 123-4567' 
        },
        { 
          id: 'contact-2', 
          name: 'Sarah Johnson', 
          role: 'Procurement Manager', 
          company: 'TechCorp Solutions',
          companyId: 'company-1',
          email: 'sarah.johnson@techcorp.com', 
          phone: '+1 (555) 123-4568' 
        },
        { 
          id: 'contact-3', 
          name: 'Mike Davis', 
          role: 'Marketing Director', 
          company: 'GrowthCo Inc',
          companyId: 'company-2',
          email: 'mike.davis@growthco.com', 
          phone: '+1 (555) 987-6543' 
        },
        { 
          id: 'contact-4', 
          name: 'Emily Chen', 
          role: 'CEO', 
          company: 'InnovateLab',
          companyId: 'company-3',
          email: 'emily.chen@innovatelab.com', 
          phone: '+1 (555) 456-7890' 
        }
      ];
      setContacts(demoContacts);
    }

    if (allUsers.length === 0) {
      setAllUsers([user]);
    }
  }, [companies, contacts, allUsers, setCompanies, setContacts, setAllUsers, user]);

  // Filter contacts by selected company
  useEffect(() => {
    if (formData.company) {
      const filtered = contacts.filter(contact => contact.company === formData.company);
      setAvailableContacts(filtered);
    } else {
      setAvailableContacts([]);
    }
  }, [formData.company, contacts]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCompanyChange = (companyName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      company: companyName,
      primaryContact: '', // Reset contact when company changes
      contactEmail: '',
      contactPhone: ''
    }));
    
    // Auto-fill industry if we have company data
    const company = companies.find(c => c.name === companyName);
    if (company && company.industry) {
      setFormData(prev => ({ ...prev, industry: company.industry || '' }));
    }
  };

  const handleContactChange = (contactName: string) => {
    const contact = availableContacts.find(c => c.name === contactName);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        primaryContact: contactName,
        contactEmail: contact.email || '',
        contactPhone: contact.phone || ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Opportunity name is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.value || isNaN(parseFloat(formData.value)) || parseFloat(formData.value) <= 0) {
      newErrors.value = 'Valid deal value is required';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    if (!formData.primaryContact.trim()) {
      newErrors.primaryContact = 'Primary contact is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the company to get the ID
      const selectedCompany = companies.find(c => c.name === formData.company);
      const selectedContact = availableContacts.find(c => c.name === formData.primaryContact);

      const opportunityData: Partial<Opportunity> = {
        id: editingOpportunity?.id || `opp-${Date.now()}`,
        title: formData.name.trim(),
        companyId: selectedCompany?.id || `company-${formData.company.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        contactId: selectedContact?.id || `contact-${formData.primaryContact.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        description: formData.description.trim(),
        value: parseFloat(formData.value),
        stage: formData.stage,
        probability: parseInt(formData.probability),
        expectedCloseDate: formData.expectedCloseDate,
        ownerId: formData.assignedTo,
        priority: formData.priority,
        industry: formData.industry.trim(),
        leadSource: formData.source,
        tags: formData.tags,
        // Initialize MEDDPICC object as expected by validation
        meddpicc: {
          metrics: '',
          economicBuyer: '',
          decisionCriteria: '',
          decisionProcess: '',
          paperProcess: '',
          implicatePain: '',
          champion: '',
          score: 0
        },
        createdAt: editingOpportunity?.createdAt,
        updatedAt: new Date().toISOString(),
        // Legacy fields for compatibility
        name: formData.name.trim(),
        company: formData.company.trim(),
        primaryContact: formData.primaryContact.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        assignedTo: formData.assignedTo,
        createdBy: user.id,
        // Initialize PEAK scores (legacy compatibility)
        peakScores: {
          prospect: formData.peakStage === 'prospect' ? 50 : 0,
          engage: formData.peakStage === 'engage' ? 50 : 0,
          acquire: formData.peakStage === 'acquire' ? 50 : 0,
          keep: formData.peakStage === 'keep' ? 50 : 0
        },
        // Initialize MEDDPICC scores (legacy compatibility)
        meddpiccScores: {
          metrics: 0,
          economicBuyer: 0,
          decisionCriteria: 0,
          decisionProcess: 0,
          paperProcess: 0,
          identifyPain: 0,
          champion: 0,
          competition: 0
        },
        // Initialize activity tracking (legacy compatibility)
        activities: [],
        contacts: [],
        lastActivity: new Date(),
        daysInStage: 0,
        totalDaysInPipeline: editingOpportunity?.totalDaysInPipeline || 0,
        closeDate: new Date(formData.expectedCloseDate),
        createdDate: editingOpportunity?.createdDate || new Date()
      };

      console.log('Submitting opportunity data:', opportunityData);

      let savedOpportunity: Opportunity;

      if (editingOpportunity) {
        savedOpportunity = await OpportunityService.updateOpportunity(editingOpportunity.id, opportunityData) as Opportunity;
      } else {
        savedOpportunity = await OpportunityService.createOpportunity(opportunityData);
      }

      if (savedOpportunity) {
        toast.success(isEditing ? 'Opportunity updated successfully!' : 'Opportunity created successfully!');
        onSave(savedOpportunity);
      } else {
        throw new Error('Failed to save opportunity - no data returned');
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save opportunity: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FileText size={24} className="text-primary" />
                {isEditing ? 'Edit Opportunity' : 'Create New Opportunity'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing 
                  ? 'Update opportunity details and save changes'
                  : 'Fill in the details below to create a new sales opportunity'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create') + ' Opportunity'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">Deal Details</TabsTrigger>
              <TabsTrigger value="management">Management</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building size={20} />
                    Opportunity Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Opportunity Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={errors.name ? 'border-destructive' : ''}
                        placeholder="e.g., Enterprise Software License"
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Select value={formData.company} onValueChange={handleCompanyChange}>
                        <SelectTrigger className={errors.company ? 'border-destructive' : ''}>
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
                      {errors.company && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        placeholder="e.g., Technology, Healthcare"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primaryContact">Primary Contact *</Label>
                      <Select 
                        value={formData.primaryContact} 
                        onValueChange={handleContactChange}
                        disabled={!formData.company}
                      >
                        <SelectTrigger className={errors.primaryContact ? 'border-destructive' : ''}>
                          <SelectValue placeholder={
                            formData.company 
                              ? "Select contact" 
                              : "Select company first"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.name}>
                              {contact.name} - {contact.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.primaryContact && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.primaryContact}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="contact@company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="description">Opportunity Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the opportunity, customer needs, and solution overview..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Financial Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="value">Deal Value (USD) *</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value}
                        onChange={(e) => handleInputChange('value', e.target.value)}
                        className={errors.value ? 'border-destructive' : ''}
                        placeholder="250000"
                        min="0"
                        step="1000"
                      />
                      {errors.value && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.value}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="probability">Win Probability (%)</Label>
                      <Select value={formData.probability} onValueChange={(value) => handleInputChange('probability', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10% - Very Low</SelectItem>
                          <SelectItem value="25">25% - Low</SelectItem>
                          <SelectItem value="50">50% - Medium</SelectItem>
                          <SelectItem value="75">75% - High</SelectItem>
                          <SelectItem value="90">90% - Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
                      <Input
                        id="expectedCloseDate"
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                        className={errors.expectedCloseDate ? 'border-destructive' : ''}
                      />
                      {errors.expectedCloseDate && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle size={14} />
                          {errors.expectedCloseDate}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target size={20} />
                    Sales Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="stage">Sales Stage</Label>
                      <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="engage">Engage</SelectItem>
                          <SelectItem value="acquire">Acquire</SelectItem>
                          <SelectItem value="keep">Keep</SelectItem>
                          <SelectItem value="closed-won">Closed Won</SelectItem>
                          <SelectItem value="closed-lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="peakStage">PEAK Stage</Label>
                      <Select value={formData.peakStage} onValueChange={(value) => handleInputChange('peakStage', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="engage">Engage</SelectItem>
                          <SelectItem value="acquire">Acquire</SelectItem>
                          <SelectItem value="keep">Keep</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">Lead Source</Label>
                      <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                          <SelectItem value="trade-show">Trade Show</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="management" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Assignment & Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange('assignedTo', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - {user.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag size={20} />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} variant="outline" size="sm">
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-destructive"
                            >
                              <X size={12} />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}