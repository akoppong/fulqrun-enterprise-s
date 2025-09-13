import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  Network, 
  Search, 
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Target,
  Eye,
  GitBranch,
  User
} from '@phosphor-icons/react';
import { Company, Contact, Opportunity } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { toast } from 'sonner';

interface RelationshipData {
  companies: Company[];
  contacts: Contact[];
  opportunities: Opportunity[];
}

interface CompanyWithRelationships extends Company {
  contacts: Contact[];
  opportunities: Opportunity[];
  totalOpportunityValue: number;
  activeOpportunitiesCount: number;
  primaryContact?: Contact;
  decisionMakers: Contact[];
  champions: Contact[];
}

interface ContactWithRelationships extends Contact {
  company?: Company;
  opportunities: Opportunity[];
  totalInfluence: number;
  opportunityCount: number;
  averageOpportunityValue: number;
}

export const RelationshipMapper: React.FC = () => {
  const [data, setData] = useState<RelationshipData>({
    companies: [],
    contacts: [],
    opportunities: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'companies' | 'contacts'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [view, setView] = useState<'network' | 'list' | 'insights'>('network');

  // Load data on component mount
  useEffect(() => {
    loadRelationshipData();
  }, []);

  const loadRelationshipData = async () => {
    setLoading(true);
    try {
      // Load opportunities (which contain company and contact relationships)
      const opportunities = OpportunityService.getAllOpportunities();
      
      // Extract unique companies and contacts from opportunities
      const companiesMap = new Map<string, Company>();
      const contactsMap = new Map<string, Contact>();

      // Generate sample companies and contacts based on opportunities
      opportunities.forEach(opp => {
        // Create company if not exists
        if (!companiesMap.has(opp.companyId)) {
          companiesMap.set(opp.companyId, {
            id: opp.companyId,
            name: generateCompanyName(opp.companyId),
            industry: opp.industry || 'Technology',
            size: getCompanySize(),
            website: `https://${opp.companyId.toLowerCase()}.com`,
            revenue: Math.floor(Math.random() * 10000000) + 1000000,
            employees: Math.floor(Math.random() * 1000) + 50,
            geography: getRandomGeography(),
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          });
        }

        // Create contact if not exists
        if (!contactsMap.has(opp.contactId)) {
          contactsMap.set(opp.contactId, {
            id: opp.contactId,
            companyId: opp.companyId,
            firstName: generateFirstName(),
            lastName: generateLastName(),
            email: `${opp.contactId.toLowerCase()}@${opp.companyId.toLowerCase()}.com`,
            phone: generatePhoneNumber(),
            title: generateJobTitle(),
            role: getRandomContactRole(),
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          });
        }
      });

      setData({
        companies: Array.from(companiesMap.values()),
        contacts: Array.from(contactsMap.values()),
        opportunities
      });
    } catch (error) {
      console.error('Error loading relationship data:', error);
      toast.error('Failed to load relationship data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for generating sample data
  const generateCompanyName = (id: string): string => {
    const prefixes = ['Tech', 'Global', 'Digital', 'Smart', 'Advanced', 'Future', 'Prime', 'Elite'];
    const suffixes = ['Corp', 'Solutions', 'Systems', 'Dynamics', 'Enterprises', 'Group', 'Labs', 'Works'];
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
  };

  const generateFirstName = (): string => {
    const names = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Lisa', 'William', 'Ashley'];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateLastName = (): string => {
    const names = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateJobTitle = (): string => {
    const titles = ['CEO', 'CTO', 'VP of Sales', 'Director of IT', 'Product Manager', 'Operations Manager', 'Finance Director', 'Marketing Manager'];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generatePhoneNumber = (): string => {
    return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  };

  const getCompanySize = (): string => {
    const sizes = ['Startup (1-10)', 'Small (11-50)', 'Medium (51-200)', 'Large (201-1000)', 'Enterprise (1000+)'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getRandomGeography = (): string => {
    const geos = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
    return geos[Math.floor(Math.random() * geos.length)];
  };

  const getRandomContactRole = (): Contact['role'] => {
    const roles: Contact['role'][] = ['champion', 'decision-maker', 'influencer', 'user', 'blocker'];
    return roles[Math.floor(Math.random() * roles.length)];
  };

  // Enhanced computed data with relationships
  const companiesWithRelationships = useMemo<CompanyWithRelationships[]>(() => {
    return data.companies.map(company => {
      const companyContacts = data.contacts.filter(c => c.companyId === company.id);
      const companyOpportunities = data.opportunities.filter(o => o.companyId === company.id);
      
      const totalValue = companyOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const activeOpportunities = companyOpportunities.filter(
        opp => !['closed-won', 'closed-lost'].includes(opp.stage)
      );

      const decisionMakers = companyContacts.filter(c => c.role === 'decision-maker');
      const champions = companyContacts.filter(c => c.role === 'champion');
      const primaryContact = companyContacts.find(c => c.role === 'champion') || companyContacts[0];

      return {
        ...company,
        contacts: companyContacts,
        opportunities: companyOpportunities,
        totalOpportunityValue: totalValue,
        activeOpportunitiesCount: activeOpportunities.length,
        primaryContact,
        decisionMakers,
        champions
      };
    });
  }, [data]);

  const contactsWithRelationships = useMemo<ContactWithRelationships[]>(() => {
    return data.contacts.map(contact => {
      const company = data.companies.find(c => c.id === contact.companyId);
      const contactOpportunities = data.opportunities.filter(o => o.contactId === contact.id);
      
      const totalValue = contactOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const averageValue = contactOpportunities.length > 0 ? totalValue / contactOpportunities.length : 0;
      
      // Calculate influence based on role and opportunity success
      let influence = 0;
      switch (contact.role) {
        case 'champion': influence = 90; break;
        case 'decision-maker': influence = 95; break;
        case 'influencer': influence = 70; break;
        case 'user': influence = 40; break;
        case 'blocker': influence = 20; break;
      }

      return {
        ...contact,
        company,
        opportunities: contactOpportunities,
        totalInfluence: influence,
        opportunityCount: contactOpportunities.length,
        averageOpportunityValue: averageValue
      };
    });
  }, [data]);

  // Filtered data based on search and filters
  const filteredCompanies = useMemo(() => {
    return companiesWithRelationships.filter(company => {
      const matchesSearch = searchTerm === '' || 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || filterBy === 'companies';
      
      return matchesSearch && matchesFilter;
    });
  }, [companiesWithRelationships, searchTerm, filterBy]);

  const filteredContacts = useMemo(() => {
    return contactsWithRelationships.filter(contact => {
      const matchesSearch = searchTerm === '' || 
        `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || filterBy === 'contacts';
      
      return matchesSearch && matchesFilter;
    });
  }, [contactsWithRelationships, searchTerm, filterBy]);

  // Relationship insights
  const relationshipInsights = useMemo(() => {
    const totalCompanies = data.companies.length;
    const totalContacts = data.contacts.length;
    const totalOpportunities = data.opportunities.length;
    
    const companiesWithMultipleContacts = companiesWithRelationships.filter(c => c.contacts.length > 1).length;
    const contactsWithMultipleOpportunities = contactsWithRelationships.filter(c => c.opportunityCount > 1).length;
    
    const averageContactsPerCompany = totalContacts / totalCompanies;
    const averageOpportunitiesPerContact = totalOpportunities / totalContacts;
    
    const topCompanyByValue = companiesWithRelationships.reduce((max, company) => 
      company.totalOpportunityValue > max.totalOpportunityValue ? company : max, 
      companiesWithRelationships[0]
    );
    
    const topContactByInfluence = contactsWithRelationships.reduce((max, contact) => 
      contact.totalInfluence > max.totalInfluence ? contact : max, 
      contactsWithRelationships[0]
    );

    return {
      totalCompanies,
      totalContacts,
      totalOpportunities,
      companiesWithMultipleContacts,
      contactsWithMultipleOpportunities,
      averageContactsPerCompany,
      averageOpportunitiesPerContact,
      topCompanyByValue,
      topContactByInfluence
    };
  }, [companiesWithRelationships, contactsWithRelationships, data]);

  const handleCompanySelect = useCallback((companyId: string) => {
    setSelectedCompany(companyId === selectedCompany ? null : companyId);
    setSelectedContact(null);
  }, [selectedCompany]);

  const handleContactSelect = useCallback((contactId: string) => {
    setSelectedContact(contactId === selectedContact ? null : contactId);
    setSelectedCompany(null);
  }, [selectedContact]);

  if (loading) {
    return (
      <div className="flex items-center justify-content-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading relationship data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Relationship Mapping</h1>
          <p className="text-muted-foreground">
            Explore and visualize connections between companies, contacts, and opportunities
          </p>
        </div>

        <div className="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies or contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-72"
            />
          </div>
          
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="companies">Companies Only</SelectItem>
              <SelectItem value="contacts">Contacts Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(value: any) => setView(value)}>
        <TabsList>
          <TabsTrigger value="network">
            <Network className="h-4 w-4 mr-2" />
            Network View
          </TabsTrigger>
          <TabsTrigger value="list">
            <Eye className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="insights">
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Network View */}
        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Companies Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Companies ({filteredCompanies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredCompanies.map(company => (
                      <div
                        key={company.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCompany === company.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleCompanySelect(company.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{company.name}</h4>
                            <p className="text-sm text-muted-foreground">{company.industry}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>{company.contacts.length} contacts</span>
                              <span>{company.opportunities.length} opportunities</span>
                            </div>
                          </div>
                          <Badge variant="outline">
                            ${(company.totalOpportunityValue / 1000).toFixed(0)}K
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Contacts Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Contacts ({filteredContacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {filteredContacts.map(contact => (
                      <div
                        key={contact.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedContact === contact.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleContactSelect(contact.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">{contact.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{contact.company?.name}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>{contact.opportunityCount} opportunities</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                contact.role === 'champion' ? 'default' :
                                contact.role === 'decision-maker' ? 'secondary' :
                                'outline'
                              }
                              className="text-xs"
                            >
                              {contact.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Details Column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="h-5 w-5 mr-2" />
                  Relationship Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {selectedCompany ? (
                    <CompanyDetails 
                      company={companiesWithRelationships.find(c => c.id === selectedCompany)!}
                      onContactSelect={handleContactSelect}
                    />
                  ) : selectedContact ? (
                    <ContactDetails 
                      contact={contactsWithRelationships.find(c => c.id === selectedContact)!}
                      onCompanySelect={handleCompanySelect}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a company or contact to view relationship details</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CompanyList companies={filteredCompanies} onSelect={handleCompanySelect} />
            <ContactList contacts={filteredContacts} onSelect={handleContactSelect} />
          </div>
        </TabsContent>

        {/* Insights View */}
        <TabsContent value="insights">
          <RelationshipInsights insights={relationshipInsights} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Company Details Component
const CompanyDetails: React.FC<{
  company: CompanyWithRelationships;
  onContactSelect: (contactId: string) => void;
}> = ({ company, onContactSelect }) => (
  <div className="space-y-4">
    <div>
      <h3 className="font-semibold text-lg">{company.name}</h3>
      <p className="text-sm text-muted-foreground">{company.industry}</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-muted-foreground">Size</p>
        <p className="font-medium">{company.size}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Revenue</p>
        <p className="font-medium">${(company.revenue! / 1000000).toFixed(1)}M</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Geography</p>
        <p className="font-medium">{company.geography}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Employees</p>
        <p className="font-medium">{company.employees?.toLocaleString()}</p>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-2">Opportunity Metrics</h4>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Value</span>
          <span className="font-medium">${(company.totalOpportunityValue / 1000).toFixed(0)}K</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Active Opportunities</span>
          <span className="font-medium">{company.activeOpportunitiesCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Opportunities</span>
          <span className="font-medium">{company.opportunities.length}</span>
        </div>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-2">Key Contacts ({company.contacts.length})</h4>
      <div className="space-y-2">
        {company.contacts.map(contact => (
          <div
            key={contact.id}
            className="p-2 border rounded cursor-pointer hover:bg-muted"
            onClick={() => onContactSelect(contact.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{contact.firstName} {contact.lastName}</p>
                <p className="text-xs text-muted-foreground">{contact.title}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {contact.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Contact Details Component
const ContactDetails: React.FC<{
  contact: ContactWithRelationships;
  onCompanySelect: (companyId: string) => void;
}> = ({ contact, onCompanySelect }) => (
  <div className="space-y-4">
    <div>
      <h3 className="font-semibold text-lg">{contact.firstName} {contact.lastName}</h3>
      <p className="text-sm text-muted-foreground">{contact.title}</p>
    </div>

    <div className="space-y-2">
      <div className="flex items-center">
        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-sm">{contact.email}</span>
      </div>
      {contact.phone && (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{contact.phone}</span>
        </div>
      )}
    </div>

    <div>
      <h4 className="font-medium mb-2">Role & Influence</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Role</span>
          <Badge variant="outline">{contact.role}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Influence Score</span>
          <span className="font-medium">{contact.totalInfluence}/100</span>
        </div>
      </div>
    </div>

    <div>
      <h4 className="font-medium mb-2">Opportunity Metrics</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Opportunities</span>
          <span className="font-medium">{contact.opportunityCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Average Value</span>
          <span className="font-medium">${(contact.averageOpportunityValue / 1000).toFixed(0)}K</span>
        </div>
      </div>
    </div>

    {contact.company && (
      <div>
        <h4 className="font-medium mb-2">Company</h4>
        <div
          className="p-2 border rounded cursor-pointer hover:bg-muted"
          onClick={() => onCompanySelect(contact.company!.id)}
        >
          <p className="font-medium text-sm">{contact.company.name}</p>
          <p className="text-xs text-muted-foreground">{contact.company.industry}</p>
        </div>
      </div>
    )}

    <div>
      <h4 className="font-medium mb-2">Recent Opportunities</h4>
      <div className="space-y-2">
        {contact.opportunities.slice(0, 3).map(opp => (
          <div key={opp.id} className="p-2 border rounded">
            <p className="font-medium text-sm">{opp.title}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{opp.stage}</span>
              <span>${(opp.value / 1000).toFixed(0)}K</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Company List Component
const CompanyList: React.FC<{
  companies: CompanyWithRelationships[];
  onSelect: (companyId: string) => void;
}> = ({ companies, onSelect }) => (
  <Card>
    <CardHeader>
      <CardTitle>Companies Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-96">
        <div className="space-y-4">
          {companies.map(company => (
            <div
              key={company.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
              onClick={() => onSelect(company.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{company.name}</h4>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Contacts</p>
                      <p className="font-medium">{company.contacts.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opportunities</p>
                      <p className="font-medium">{company.opportunities.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-medium">${(company.totalOpportunityValue / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  {company.champions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Champions:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.champions.map(champion => (
                          <Badge key={champion.id} variant="secondary" className="text-xs">
                            {champion.firstName} {champion.lastName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Contact List Component
const ContactList: React.FC<{
  contacts: ContactWithRelationships[];
  onSelect: (contactId: string) => void;
}> = ({ contacts, onSelect }) => (
  <Card>
    <CardHeader>
      <CardTitle>Contacts Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-96">
        <div className="space-y-4">
          {contacts.map(contact => (
            <div
              key={contact.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
              onClick={() => onSelect(contact.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{contact.firstName} {contact.lastName}</h4>
                    <Badge 
                      variant={
                        contact.role === 'champion' ? 'default' :
                        contact.role === 'decision-maker' ? 'secondary' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {contact.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                  <p className="text-xs text-muted-foreground">{contact.company?.name}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Opportunities</p>
                      <p className="font-medium">{contact.opportunityCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Value</p>
                      <p className="font-medium">${(contact.averageOpportunityValue / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Influence</p>
                      <p className="font-medium">{contact.totalInfluence}/100</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

// Relationship Insights Component
const RelationshipInsights: React.FC<{ insights: any }> = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
              <p className="text-2xl font-bold">{insights.totalCompanies}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
              <p className="text-2xl font-bold">{insights.totalContacts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
              <p className="text-2xl font-bold">{insights.totalOpportunities}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Network className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">Avg Contacts/Company</p>
              <p className="text-2xl font-bold">{insights.averageContactsPerCompany.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Relationship Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>Companies with Multiple Contacts</span>
                <span>{insights.companiesWithMultipleContacts} of {insights.totalCompanies}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(insights.companiesWithMultipleContacts / insights.totalCompanies) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>Contacts with Multiple Opportunities</span>
                <span>{insights.contactsWithMultipleOpportunities} of {insights.totalContacts}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(insights.contactsWithMultipleOpportunities / insights.totalContacts) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Average Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contacts per Company</p>
                  <p className="font-bold text-lg">{insights.averageContactsPerCompany.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Opportunities per Contact</p>
                  <p className="font-bold text-lg">{insights.averageOpportunitiesPerContact.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {insights.topCompanyByValue && (
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Highest Value Company
                </h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">{insights.topCompanyByValue.name}</p>
                  <p className="text-sm text-muted-foreground">{insights.topCompanyByValue.industry}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Total Opportunity Value</span>
                    <span className="font-bold text-green-600">
                      ${(insights.topCompanyByValue.totalOpportunityValue / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </div>
            )}

            {insights.topContactByInfluence && (
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Most Influential Contact
                </h4>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-semibold">
                    {insights.topContactByInfluence.firstName} {insights.topContactByInfluence.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{insights.topContactByInfluence.title}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">Influence Score</span>
                    <span className="font-bold text-blue-600">
                      {insights.topContactByInfluence.totalInfluence}/100
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default RelationshipMapper;