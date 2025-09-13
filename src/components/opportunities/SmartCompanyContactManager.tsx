import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Building2, Users, Plus, Filter, UserCheck, Mail, Phone, Star, Calendar, TrendingUp } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

// Enhanced types for company-contact relationships
interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  revenue?: number;
  website?: string;
  address?: string;
  description?: string;
  logo?: string;
  status: 'prospect' | 'customer' | 'partner' | 'inactive';
  tier: 'strategic' | 'growth' | 'transactional';
  lastActivity: Date;
  createdAt: Date;
  tags: string[];
  relationships: {
    parentCompany?: string;
    subsidiaries: string[];
    partners: string[];
  };
  metrics: {
    totalRevenue: number;
    openOpportunities: number;
    wonOpportunities: number;
    engagementScore: number;
  };
}

interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department: string;
  role: 'decision-maker' | 'influencer' | 'champion' | 'gatekeeper' | 'end-user';
  seniority: 'junior' | 'mid' | 'senior' | 'executive' | 'c-level';
  linkedin?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'left-company';
  lastContactDate?: Date;
  createdAt: Date;
  notes?: string;
  tags: string[];
  preferences: {
    communication: 'email' | 'phone' | 'linkedin' | 'meeting';
    timezone: string;
    bestTimeToContact: string;
  };
  metrics: {
    responseRate: number;
    engagementScore: number;
    influenceLevel: number;
    opportunitiesInvolved: number;
  };
}

interface CompanyContactRelationship {
  companyId: string;
  contactId: string;
  relationship: 'primary' | 'secondary' | 'stakeholder' | 'technical' | 'procurement';
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

interface SmartFilterOptions {
  industry?: string;
  companySize?: string;
  contactRole?: string;
  contactSeniority?: string;
  engagementScore?: number;
  lastActivityDays?: number;
  hasOpenOpportunities?: boolean;
  tags?: string[];
}

interface SmartCompanyContactManagerProps {
  selectedCompanyId?: string;
  selectedContactId?: string;
  onCompanySelect?: (company: Company) => void;
  onContactSelect?: (contact: Contact) => void;
  onRelationshipCreate?: (companyId: string, contactId: string) => void;
  filterByOpportunity?: boolean;
  showMetrics?: boolean;
  allowCreation?: boolean;
}

const SmartCompanyContactManager: React.FC<SmartCompanyContactManagerProps> = ({
  selectedCompanyId,
  selectedContactId,
  onCompanySelect,
  onContactSelect,
  onRelationshipCreate,
  filterByOpportunity = false,
  showMetrics = true,
  allowCreation = true
}) => {
  // State management
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [relationships, setRelationships] = useKV<CompanyContactRelationship[]>('company-contact-relationships', []);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'companies' | 'contacts'>('companies');
  const [filters, setFilters] = useState<SmartFilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Initialize sample data if none exists
  useEffect(() => {
    if (companies.length === 0) {
      initializeSampleData();
    }
  }, []);

  const initializeSampleData = useCallback(() => {
    const sampleCompanies: Company[] = [
      {
        id: 'comp-1',
        name: 'TechCorp Solutions',
        industry: 'Technology',
        size: 'large',
        revenue: 50000000,
        website: 'techcorp.com',
        status: 'prospect',
        tier: 'strategic',
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        tags: ['enterprise', 'technology', 'software'],
        relationships: { subsidiaries: [], partners: [] },
        metrics: {
          totalRevenue: 250000,
          openOpportunities: 3,
          wonOpportunities: 1,
          engagementScore: 85
        }
      },
      {
        id: 'comp-2',
        name: 'GrowthCo Inc',
        industry: 'Marketing',
        size: 'medium',
        revenue: 15000000,
        status: 'customer',
        tier: 'growth',
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        tags: ['marketing', 'automation', 'mid-market'],
        relationships: { subsidiaries: [], partners: [] },
        metrics: {
          totalRevenue: 75000,
          openOpportunities: 1,
          wonOpportunities: 2,
          engagementScore: 92
        }
      }
    ];

    const sampleContacts: Contact[] = [
      {
        id: 'cont-1',
        companyId: 'comp-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-123-4567',
        jobTitle: 'Chief Technology Officer',
        department: 'Technology',
        role: 'decision-maker',
        seniority: 'c-level',
        status: 'active',
        lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        tags: ['technical', 'decision-maker', 'champion'],
        preferences: {
          communication: 'email',
          timezone: 'PST',
          bestTimeToContact: '10:00-16:00'
        },
        metrics: {
          responseRate: 85,
          engagementScore: 90,
          influenceLevel: 95,
          opportunitiesInvolved: 3
        }
      },
      {
        id: 'cont-2',
        companyId: 'comp-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        jobTitle: 'Procurement Manager',
        department: 'Operations',
        role: 'gatekeeper',
        seniority: 'senior',
        status: 'active',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        tags: ['procurement', 'budget-owner'],
        preferences: {
          communication: 'phone',
          timezone: 'PST',
          bestTimeToContact: '09:00-17:00'
        },
        metrics: {
          responseRate: 70,
          engagementScore: 75,
          influenceLevel: 80,
          opportunitiesInvolved: 2
        }
      },
      {
        id: 'cont-3',
        companyId: 'comp-2',
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@growthco.com',
        jobTitle: 'Marketing Director',
        department: 'Marketing',
        role: 'champion',
        seniority: 'senior',
        status: 'active',
        lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        tags: ['marketing', 'champion', 'advocate'],
        preferences: {
          communication: 'email',
          timezone: 'EST',
          bestTimeToContact: '11:00-15:00'
        },
        metrics: {
          responseRate: 95,
          engagementScore: 88,
          influenceLevel: 85,
          opportunitiesInvolved: 3
        }
      }
    ];

    const sampleRelationships: CompanyContactRelationship[] = [
      {
        companyId: 'comp-1',
        contactId: 'cont-1',
        relationship: 'primary',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        companyId: 'comp-1',
        contactId: 'cont-2',
        relationship: 'procurement',
        startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        companyId: 'comp-2',
        contactId: 'cont-3',
        relationship: 'primary',
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    ];

    setCompanies(sampleCompanies);
    setContacts(sampleContacts);
    setRelationships(sampleRelationships);
  }, [setCompanies, setContacts, setRelationships]);

  // Smart filtering logic
  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      const matchesSearch = searchTerm === '' || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesIndustry = !filters.industry || company.industry === filters.industry;
      const matchesSize = !filters.companySize || company.size === filters.companySize;
      const matchesEngagement = !filters.engagementScore || company.metrics.engagementScore >= filters.engagementScore;
      const matchesActivity = !filters.lastActivityDays || 
        (Date.now() - company.lastActivity.getTime()) / (1000 * 60 * 60 * 24) <= filters.lastActivityDays;
      const matchesOpportunities = filters.hasOpenOpportunities === undefined || 
        (filters.hasOpenOpportunities ? company.metrics.openOpportunities > 0 : true);

      return matchesSearch && matchesIndustry && matchesSize && matchesEngagement && matchesActivity && matchesOpportunities;
    });

    // Sort by engagement score and last activity
    return filtered.sort((a, b) => {
      const scoreA = a.metrics.engagementScore + (a.status === 'customer' ? 10 : 0);
      const scoreB = b.metrics.engagementScore + (b.status === 'customer' ? 10 : 0);
      return scoreB - scoreA;
    });
  }, [companies, searchTerm, filters]);

  const filteredContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const company = companies.find(c => c.id === contact.companyId);
      
      const matchesSearch = searchTerm === '' || 
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company && company.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRole = !filters.contactRole || contact.role === filters.contactRole;
      const matchesSeniority = !filters.contactSeniority || contact.seniority === filters.contactSeniority;
      const matchesEngagement = !filters.engagementScore || contact.metrics.engagementScore >= filters.engagementScore;
      
      // Filter by selected company if one is selected
      const matchesCompany = !selectedCompanyId || contact.companyId === selectedCompanyId;

      return matchesSearch && matchesRole && matchesSeniority && matchesEngagement && matchesCompany;
    });

    // Sort by influence level and engagement
    return filtered.sort((a, b) => {
      const scoreA = a.metrics.influenceLevel + a.metrics.engagementScore + (a.role === 'decision-maker' ? 20 : 0);
      const scoreB = b.metrics.influenceLevel + b.metrics.engagementScore + (b.role === 'decision-maker' ? 20 : 0);
      return scoreB - scoreA;
    });
  }, [contacts, companies, searchTerm, filters, selectedCompanyId]);

  // Get contacts for a specific company
  const getCompanyContacts = useCallback((companyId: string) => {
    return contacts.filter(contact => contact.companyId === companyId);
  }, [contacts]);

  // Get relationship type between company and contact
  const getRelationshipType = useCallback((companyId: string, contactId: string) => {
    const relationship = relationships.find(r => r.companyId === companyId && r.contactId === contactId);
    return relationship?.relationship || 'secondary';
  }, [relationships]);

  // Handle selections
  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company);
    onCompanySelect?.(company);
    if (filterByOpportunity) {
      setActiveTab('contacts');
    }
  }, [onCompanySelect, filterByOpportunity]);

  const handleContactSelect = useCallback((contact: Contact) => {
    onContactSelect?.(contact);
    if (!selectedCompanyId) {
      const company = companies.find(c => c.id === contact.companyId);
      if (company) {
        setSelectedCompany(company);
        onCompanySelect?.(company);
      }
    }
  }, [onContactSelect, onCompanySelect, companies, selectedCompanyId]);

  // Create new relationship
  const createRelationship = useCallback((companyId: string, contactId: string, relationshipType: string) => {
    const newRelationship: CompanyContactRelationship = {
      companyId,
      contactId,
      relationship: relationshipType as any,
      startDate: new Date(),
      notes: 'Created via Smart Company-Contact Manager'
    };

    setRelationships(prev => [...prev, newRelationship]);
    onRelationshipCreate?.(companyId, contactId);
    toast.success('Relationship created successfully');
  }, [setRelationships, onRelationshipCreate]);

  // Render company card
  const renderCompanyCard = (company: Company) => (
    <Card 
      key={company.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedCompanyId === company.id ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => handleCompanySelect(company)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={company.logo} />
              <AvatarFallback>
                <Building2 className="w-6 h-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <CardDescription>{company.industry} • {company.size}</CardDescription>
            </div>
          </div>
          <Badge variant={company.status === 'customer' ? 'default' : 'secondary'}>
            {company.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {showMetrics && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>Score: {company.metrics.engagementScore}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{getCompanyContacts(company.id).length} contacts</span>
            </div>
            <div className="col-span-2 text-muted-foreground">
              {company.metrics.openOpportunities} open opportunities • 
              ${company.metrics.totalRevenue.toLocaleString()} revenue
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {company.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {company.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{company.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render contact card
  const renderContactCard = (contact: Contact) => {
    const company = companies.find(c => c.id === contact.companyId);
    const relationship = getRelationshipType(contact.companyId, contact.id);
    
    return (
      <Card 
        key={contact.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          selectedContactId === contact.id ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => handleContactSelect(contact)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback>
                  {contact.firstName[0]}{contact.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">
                  {contact.firstName} {contact.lastName}
                </CardTitle>
                <CardDescription>{contact.jobTitle}</CardDescription>
                <CardDescription className="text-xs text-muted-foreground">
                  {company?.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge variant={contact.role === 'decision-maker' ? 'default' : 'secondary'}>
                {contact.role}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {relationship}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span className="truncate max-w-[150px]">{contact.email}</span>
            </div>
            {contact.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
          
          {showMetrics && (
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">{contact.metrics.responseRate}%</div>
                <div className="text-muted-foreground">Response</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{contact.metrics.influenceLevel}%</div>
                <div className="text-muted-foreground">Influence</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{contact.metrics.opportunitiesInvolved}</div>
                <div className="text-muted-foreground">Deals</div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Company & Contact Management</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            {allowCreation && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New</DialogTitle>
                    <DialogDescription>
                      Choose what you'd like to create
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Building2 className="w-6 h-6 mb-2" />
                      New Company
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="w-6 h-6 mb-2" />
                      New Contact
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search companies, contacts, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Smart Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={filters.industry || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, industry: value || undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Any industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any industry</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select value={filters.companySize || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, companySize: value || undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any size</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contact Role</Label>
                  <Select value={filters.contactRole || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, contactRole: value || undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Any role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any role</SelectItem>
                      <SelectItem value="decision-maker">Decision Maker</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="champion">Champion</SelectItem>
                      <SelectItem value="gatekeeper">Gatekeeper</SelectItem>
                      <SelectItem value="end-user">End User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Min Engagement Score</Label>
                  <Select value={filters.engagementScore?.toString() || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, engagementScore: value ? parseInt(value) : undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Any score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any score</SelectItem>
                      <SelectItem value="50">50%+</SelectItem>
                      <SelectItem value="70">70%+</SelectItem>
                      <SelectItem value="80">80%+</SelectItem>
                      <SelectItem value="90">90%+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Activity</Label>
                  <Select value={filters.lastActivityDays?.toString() || ''} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, lastActivityDays: value ? parseInt(value) : undefined }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any time</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Companies ({filteredCompanies.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contacts ({filteredContacts.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4">
          <TabsContent value="companies" className="h-full">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                {filteredCompanies.map(renderCompanyCard)}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="h-full">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                {filteredContacts.map(renderContactCard)}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {/* Selected company contacts preview */}
      {selectedCompany && activeTab === 'companies' && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">
              Contacts at {selectedCompany.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getCompanyContacts(selectedCompany.id).map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleContactSelect(contact)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {contact.jobTitle}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {contact.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartCompanyContactManager;