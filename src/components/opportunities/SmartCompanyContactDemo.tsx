import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Users, Filter, Zap, TrendingUp, Target, Star, Clock, TestTube } from '@phosphor-icons/react';
import { toast } from 'sonner';
import SmartCompanyContactManager from './SmartCompanyContactManager';
import SmartRelationshipTestSuite from './SmartRelationshipTestSuite';

interface Company {
  id: string;
  name: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  status: 'prospect' | 'customer' | 'partner' | 'inactive';
  tier: 'strategic' | 'growth' | 'transactional';
  metrics: {
    totalRevenue: number;
    openOpportunities: number;
    wonOpportunities: number;
    engagementScore: number;
  };
  tags: string[];
}

interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  role: 'decision-maker' | 'influencer' | 'champion' | 'gatekeeper' | 'end-user';
  seniority: 'junior' | 'mid' | 'senior' | 'executive' | 'c-level';
  metrics: {
    responseRate: number;
    engagementScore: number;
    influenceLevel: number;
    opportunitiesInvolved: number;
  };
}

const SmartCompanyContactDemo: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'basic' | 'filtering' | 'relationships' | 'opportunity'>('basic');

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    toast.success(`Selected company: ${company.name}`);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    toast.success(`Selected contact: ${contact.firstName} ${contact.lastName}`);
  };

  const handleRelationshipCreate = (companyId: string, contactId: string) => {
    toast.success('New relationship created successfully!');
  };

  const createOpportunityWithSelection = () => {
    if (selectedCompany && selectedContact) {
      setShowOpportunityForm(true);
      toast.success('Creating opportunity with selected company and contact');
    } else {
      toast.error('Please select both a company and contact first');
    }
  };

  const demoScenarios = [
    {
      id: 'basic',
      title: 'Basic Company & Contact Management',
      description: 'Browse companies and contacts with intuitive search and selection',
      icon: <Building2 className="w-5 h-5" />,
      features: [
        'Smart search across companies and contacts',
        'Visual engagement scoring',
        'Role-based contact classification',
        'Company relationship mapping'
      ]
    },
    {
      id: 'filtering',
      title: 'Advanced Smart Filtering',
      description: 'Use intelligent filters to find the right prospects quickly',
      icon: <Filter className="w-5 h-5" />,
      features: [
        'Industry and company size filters',
        'Contact role and seniority filtering',
        'Engagement score thresholds',
        'Recent activity filters'
      ]
    },
    {
      id: 'relationships',
      title: 'Relationship Intelligence',
      description: 'Map and manage complex company-contact relationships',
      icon: <Users className="w-5 h-5" />,
      features: [
        'Automatic relationship detection',
        'Primary vs. secondary contact classification',
        'Influence mapping and scoring',
        'Communication preference tracking'
      ]
    },
    {
      id: 'opportunity',
      title: 'Opportunity Integration',
      description: 'Seamlessly create opportunities from company-contact selections',
      icon: <Target className="w-5 h-5" />,
      features: [
        'Pre-populate opportunity forms',
        'Automatic stakeholder mapping',
        'MEDDPICC contact assignment',
        'Pipeline stage recommendations'
      ]
    }
  ];

  const metrics = [
    {
      label: 'Total Companies',
      value: '2,847',
      change: '+12%',
      icon: <Building2 className="w-4 h-4" />
    },
    {
      label: 'Active Contacts',
      value: '8,923',
      change: '+8%',
      icon: <Users className="w-4 h-4" />
    },
    {
      label: 'Avg Engagement',
      value: '87%',
      change: '+5%',
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      label: 'Response Rate',
      value: '73%',
      change: '+3%',
      icon: <Star className="w-4 h-4" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Smart Company-Contact Relationship Management</h2>
            <p className="text-muted-foreground">
              Intelligent filtering and relationship mapping for enterprise sales teams
            </p>
          </div>
          <Button onClick={() => setActiveDemo('opportunity')} className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Try Live Demo
          </Button>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-green-600">{metric.change} from last month</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {metric.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Company-Contact Management System</CardTitle>
          <CardDescription>
            Comprehensive relationship management with intelligent filtering and AI-powered insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="demo">Live Demo</TabsTrigger>
              <TabsTrigger value="testing">Testing Suite</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Intelligent Relationship Management</h3>
                <p className="text-muted-foreground">
                  Advanced filtering, relationship mapping, and opportunity integration for enterprise sales teams
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {demoScenarios[0].features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Selection</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedCompany ? (
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">{selectedCompany.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedCompany.industry} • {selectedCompany.size}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {selectedCompany.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                        No company selected
                      </div>
                    )}

                    {selectedContact ? (
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {selectedContact.firstName} {selectedContact.lastName}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {selectedContact.jobTitle}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {selectedContact.role}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selectedContact.seniority}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                        No contact selected
                      </div>
                    )}

                    {selectedCompany && selectedContact && (
                      <Button 
                        onClick={createOpportunityWithSelection}
                        className="w-full flex items-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Create Opportunity
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="h-[600px] border rounded-lg">
                <SmartCompanyContactManager
                  selectedCompanyId={selectedCompany?.id}
                  selectedContactId={selectedContact?.id}
                  onCompanySelect={handleCompanySelect}
                  onContactSelect={handleContactSelect}
                  onRelationshipCreate={handleRelationshipCreate}
                  filterByOpportunity={false}
                  showMetrics={true}
                  allowCreation={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <SmartRelationshipTestSuite />
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoScenarios.map((scenario) => (
                  <Card key={scenario.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        {scenario.icon}
                        {scenario.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {scenario.description}
                      </p>
                      <div className="space-y-2 text-xs">
                        {scenario.features.map((feature, index) => (
                          <div key={index}>• {feature}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Smart Filtering Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Smart Filtering Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Search Intelligence</h4>
              <p className="text-sm text-muted-foreground">
                Search across company names, contact names, job titles, industries, and tags simultaneously
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Engagement Scoring</h4>
              <p className="text-sm text-muted-foreground">
                Filter by engagement scores to prioritize the most responsive prospects
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Relationship Mapping</h4>
              <p className="text-sm text-muted-foreground">
                Automatically detect and classify relationships between companies and contacts
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Activity-Based Filtering</h4>
              <p className="text-sm text-muted-foreground">
                Find prospects based on recent activity and interaction history
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Role Intelligence</h4>
              <p className="text-sm text-muted-foreground">
                Filter contacts by decision-making authority and influence level
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Opportunity Integration</h4>
              <p className="text-sm text-muted-foreground">
                Seamlessly create opportunities from selected company-contact pairs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Creation Dialog */}
      <Dialog open={showOpportunityForm} onOpenChange={setShowOpportunityForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Opportunity</DialogTitle>
            <DialogDescription>
              Creating opportunity with pre-populated company and contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCompany && selectedContact && (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Selected Company</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="font-medium">{selectedCompany.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedCompany.industry} • {selectedCompany.size}
                      </div>
                      <div className="text-sm">
                        Engagement Score: {selectedCompany.metrics.engagementScore}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Selected Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {selectedContact.firstName} {selectedContact.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedContact.jobTitle}
                      </div>
                      <div className="text-sm">
                        Influence Level: {selectedContact.metrics.influenceLevel}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Auto-populated Fields</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Company: {selectedCompany?.name}</li>
                <li>• Primary Contact: {selectedContact?.firstName} {selectedContact?.lastName}</li>
                <li>• Contact Email: {selectedContact?.email}</li>
                <li>• Industry: {selectedCompany?.industry}</li>
                <li>• Recommended Stage: Prospect</li>
                <li>• MEDDPICC Champion: {selectedContact?.role === 'champion' ? 'Yes' : 'To be identified'}</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOpportunityForm(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast.success('Opportunity created successfully!');
                setShowOpportunityForm(false);
              }}>
                Create Opportunity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SmartCompanyContactDemo;