import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User, PEAK_STAGES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  Save
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface NewOpportunityMainViewProps {
  onSave: (opportunity: Opportunity) => void;
  onCancel: () => void;
  editingOpportunity?: Opportunity | null;
  user: User;
  isEditing: boolean;
}

export function NewOpportunityMainView({ 
  onSave, 
  onCancel,
  editingOpportunity, 
  user,
  isEditing
}: NewOpportunityMainViewProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);

  // Ensure all data is always arrays
  const validCompanies = Array.isArray(companies) ? companies : [];
  const validContacts = Array.isArray(contacts) ? contacts : [];
  const validUsers = Array.isArray(allUsers) ? allUsers : [];

  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    contactId: '',
    value: '',
    probability: 50,
    stage: 'prospect' as keyof typeof PEAK_STAGES,
    expectedCloseDate: '',
    ownerId: user.id,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    industry: '',
    leadSource: '',
    description: '',
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with editing data
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        title: editingOpportunity.title || '',
        companyId: editingOpportunity.companyId || '',
        contactId: editingOpportunity.contactId || '',
        value: editingOpportunity.value?.toString() || '',
        probability: editingOpportunity.probability || 50,
        stage: editingOpportunity.stage || 'prospect',
        expectedCloseDate: editingOpportunity.expectedCloseDate || '',
        ownerId: editingOpportunity.ownerId || user.id,
        priority: editingOpportunity.priority || 'medium',
        industry: editingOpportunity.industry || '',
        leadSource: editingOpportunity.leadSource || '',
        description: editingOpportunity.description || '',
        tags: editingOpportunity.tags || []
      });
    }
  }, [editingOpportunity, user.id]);

  // Initialize demo data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Initialize sample companies
        if (validCompanies.length === 0) {
          const sampleCompanies: Company[] = [
            {
              id: 'company-1',
              name: 'TechCorp Solutions',
              industry: 'Technology',
              website: 'https://techcorp.com',
              email: 'contact@techcorp.com',
              phone: '+1 (555) 123-4567',
              address: '123 Tech Street, San Francisco, CA',
              employees: 500,
              revenue: 50000000,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'company-2',
              name: 'GrowthCo Inc',
              industry: 'Marketing',
              website: 'https://growthco.com',
              email: 'hello@growthco.com',
              phone: '+1 (555) 987-6543',
              address: '456 Growth Ave, New York, NY',
              employees: 150,
              revenue: 15000000,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          setCompanies(sampleCompanies);
        }

        // Initialize sample contacts
        if (validContacts.length === 0) {
          const sampleContacts: Contact[] = [
            {
              id: 'contact-1',
              companyId: 'company-1',
              name: 'John Smith',
              email: 'john.smith@techcorp.com',
              phone: '+1 (555) 123-4567',
              title: 'CTO',
              avatar: '',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'contact-2',
              companyId: 'company-1',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@techcorp.com',
              phone: '+1 (555) 123-4568',
              title: 'Procurement Manager',
              avatar: '',
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'contact-3',
              companyId: 'company-2',
              name: 'Mike Davis',
              email: 'mike.davis@growthco.com',
              phone: '+1 (555) 987-6543',
              title: 'Marketing Director',
              avatar: '',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          setContacts(sampleContacts);
        }

        // Initialize sample users
        if (validUsers.length === 0) {
          const sampleUsers: User[] = [
            {
              id: 'user-1',
              name: 'Current User',
              email: 'user@fulqrun.com',
              role: 'rep',
              avatar: '',
              territory: 'North America'
            },
            {
              id: 'user-2',
              name: 'Sales Manager',
              email: 'manager@fulqrun.com',
              role: 'manager',
              avatar: '',
              territory: 'Global'
            }
          ];
          setAllUsers(sampleUsers);
        }
      } catch (error) {
        console.error('Error initializing demo data:', error);
      }
    };

    initializeData();
  }, [validCompanies.length, validContacts.length, validUsers.length, setCompanies, setContacts, setAllUsers]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Opportunity title is required';
    }

    if (!formData.companyId) {
      newErrors.companyId = 'Company is required';
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Primary contact is required';
    }

    if (!formData.value || isNaN(Number(formData.value)) || Number(formData.value) <= 0) {
      newErrors.value = 'Valid deal value is required';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Expected close date is required';
    }

    if (!formData.ownerId) {
      newErrors.ownerId = 'Owner is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const opportunityData: Partial<Opportunity> = {
        title: formData.title,
        companyId: formData.companyId,
        contactId: formData.contactId,
        value: Number(formData.value),
        probability: formData.probability,
        stage: formData.stage,
        expectedCloseDate: formData.expectedCloseDate,
        ownerId: formData.ownerId,
        priority: formData.priority,
        industry: formData.industry,
        leadSource: formData.leadSource,
        description: formData.description,
        tags: formData.tags,
        
        // Default values for new opportunities
        daysInStage: 0,
        totalDaysInPipeline: 0,
        activities: [],
        contacts: [],
        createdDate: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        closeDate: formData.expectedCloseDate
      };

      let savedOpportunity: Opportunity;

      if (isEditing && editingOpportunity) {
        savedOpportunity = await OpportunityService.updateOpportunity(editingOpportunity.id, opportunityData);
      } else {
        savedOpportunity = await OpportunityService.createOpportunity(opportunityData);
      }

      onSave(savedOpportunity);
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getFilteredContacts = () => {
    return validContacts.filter(contact => contact.companyId === formData.companyId);
  };

  const selectedCompany = validCompanies.find(c => c.id === formData.companyId);
  const selectedContact = validContacts.find(c => c.id === formData.contactId);
  const filteredContacts = getFilteredContacts();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Opportunity' : 'Create New Opportunity'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update opportunity details' : 'Fill in the details below to create a new sales opportunity'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Opportunity' : 'Create Opportunity')}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Label htmlFor="title">Opportunity Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter opportunity title..."
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => setFormData({...formData, priority: value})}
                >
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

              <div>
                <Label htmlFor="value">Deal Value *</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  placeholder="0"
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.value}
                  </p>
                )}
                {formData.value && !isNaN(Number(formData.value)) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(Number(formData.value))}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="probability">Win Probability: {formData.probability}%</Label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.probability}
                    onChange={(e) => setFormData({...formData, probability: Number(e.target.value)})}
                    className="w-full"
                  />
                  <Progress value={formData.probability} className="h-2" />
                </div>
              </div>

              <div>
                <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
                <Input
                  id="expectedCloseDate"
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
                  className={errors.expectedCloseDate ? 'border-red-500' : ''}
                />
                {errors.expectedCloseDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.expectedCloseDate}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company & Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company & Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyId">Company *</Label>
                <Select 
                  value={formData.companyId} 
                  onValueChange={(value) => setFormData({...formData, companyId: value, contactId: ''})}
                >
                  <SelectTrigger className={errors.companyId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {validCompanies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-xs text-muted-foreground">{company.industry}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyId && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.companyId}
                  </p>
                )}
                {selectedCompany && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <div className="font-medium">{selectedCompany.name}</div>
                    <div className="text-muted-foreground">{selectedCompany.industry}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedCompany.employees} employees • {formatCurrency(selectedCompany.revenue)} revenue
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="contactId">Primary Contact *</Label>
                <Select 
                  value={formData.contactId} 
                  onValueChange={(value) => setFormData({...formData, contactId: value})}
                  disabled={!formData.companyId}
                >
                  <SelectTrigger className={errors.contactId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={
                      !formData.companyId 
                        ? "Select a company first..." 
                        : filteredContacts.length === 0 
                        ? "No contacts available"
                        : "Select a contact..."
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredContacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{contact.name}</div>
                            <div className="text-xs text-muted-foreground">{contact.title}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contactId && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contactId}
                  </p>
                )}
                {selectedContact && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <div className="font-medium">{selectedContact.name}</div>
                    <div className="text-muted-foreground">{selectedContact.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedContact.email} • {selectedContact.phone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Process Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sales Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="stage">PEAK Stage</Label>
                <Select 
                  value={formData.stage} 
                  onValueChange={(value: any) => setFormData({...formData, stage: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PEAK_STAGES).map(([key, stage]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div>
                            <div className="font-medium">{stage.name}</div>
                            <div className="text-xs text-muted-foreground">{stage.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ownerId">Opportunity Owner *</Label>
                <Select 
                  value={formData.ownerId} 
                  onValueChange={(value) => setFormData({...formData, ownerId: value})}
                >
                  <SelectTrigger className={errors.ownerId ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validUsers.map(usr => (
                      <SelectItem key={usr.id} value={usr.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{usr.name}</div>
                            <div className="text-xs text-muted-foreground">{usr.role}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ownerId && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.ownerId}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="leadSource">Lead Source</Label>
                <Select 
                  value={formData.leadSource} 
                  onValueChange={(value) => setFormData({...formData, leadSource: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="cold-call">Cold Call</SelectItem>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="trade-show">Trade Show</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g., Technology, Healthcare..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the opportunity, key requirements, decision factors..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <div 
                          key={tag} 
                          className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}