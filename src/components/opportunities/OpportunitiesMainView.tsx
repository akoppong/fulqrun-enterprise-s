import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, PEAK_STAGES, Company, Contact } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { safeFormatDate } from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Target, 
  Plus, 
  Eye, 
  PencilSimple, 
  Trash, 
  SortAscending,
  Calendar,
  DollarSign,
  TrendUp,
  Users,
  Building,
  ChartBar,
  GridFour,
  List,
  ArrowRight
} from '@phosphor-icons/react';
import { OpportunityEditForm } from './OpportunityEditForm';
import { ResponsiveOpportunityDetail } from './OpportunitiesView';
import { FormValidationTestDashboard } from './FormValidationTestDashboard';
import { CompanyContactSelectionTest } from './CompanyContactSelectionTest';
import { ComprehensiveFormTestSuite } from './ComprehensiveFormTestSuite';
import { CreateOpportunityButtonDebugger } from './CreateOpportunityButtonDebugger';
import { CreateOpportunityFunctionalityTester } from './CreateOpportunityFunctionalityTester';
import { CreateOpportunityLiveDemo } from './CreateOpportunityLiveDemo';
import { CreateOpportunityDebugSummary } from './CreateOpportunityDebugSummary';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ErrorBoundary } from 'react-error-boundary';
import { errorHandler, withErrorHandling } from '@/lib/error-handling';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center p-8 bg-destructive/10 border border-destructive/20 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We encountered an error while loading the opportunities view.
        </p>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          Try again
        </Button>
      </div>
    </div>
  );
}

interface OpportunitiesMainViewProps {
  className?: string;
}

function OpportunitiesMainViewInner({ className = '' }: OpportunitiesMainViewProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);

  // Initialize sample data if empty
  useEffect(() => {
    if (companies.length === 0) {
      const sampleCompanies: Company[] = [
        {
          id: 'company-1',
          name: 'TechFlow Solutions',
          industry: 'Technology',
          size: '100-500',
          website: 'https://techflow.com',
          address: '123 Tech Street, San Francisco, CA',
          revenue: 750000000,
          employees: 300,
          geography: 'North America',
          customFields: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'company-2',
          name: 'DataCorp Industries', 
          industry: 'Healthcare',
          size: '50-100',
          website: 'https://datacorp.com',
          address: '456 Data Ave, Austin, TX',
          revenue: 150000000,
          employees: 75,
          geography: 'North America',
          customFields: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setCompanies(sampleCompanies);
    }

    if (contacts.length === 0) {
      const sampleContacts: Contact[] = [
        {
          id: 'contact-1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@techflow.com',
          phone: '+1-555-0123',
          title: 'CTO',
          companyId: 'company-1',
          department: 'Technology',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'contact-2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@datacorp.com',
          phone: '+1-555-0124',
          title: 'VP of Sales',
          companyId: 'company-2',
          department: 'Sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setContacts(sampleContacts);
    }
  }, [companies.length, contacts.length, setCompanies, setContacts]);
  
  // View state
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<'opportunities' | 'validation-test' | 'company-contact-test' | 'comprehensive-test' | 'button-debug'>('opportunities');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  // Debug dialog state changes
  useEffect(() => {
    console.log('Create dialog state changed:', isCreateDialogOpen);
  }, [isCreateDialogOpen]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = !searchTerm || 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      companies.find(c => c.id === opp.companyId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contacts.find(c => c.id === opp.contactId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contacts.find(c => c.id === opp.contactId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    const matchesPriority = priorityFilter === 'all' || opp.priority === priorityFilter;
    
    return matchesSearch && matchesStage && matchesPriority;
  });

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowDetail(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsEditDialogOpen(true);
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      const updatedOpportunities = opportunities.filter(opp => opp.id !== opportunityId);
      setOpportunities(updatedOpportunities);
      toast.success('Opportunity deleted successfully');
    } catch (error) {
      toast.error('Failed to delete opportunity');
    }
  };

  const handleCreateOpportunity = async (data: Partial<Opportunity>) => {
    try {
      const newOpportunity: Opportunity = {
        id: Date.now().toString(),
        title: data.title || '',
        description: data.description || '',
        value: data.value || 0,
        stage: data.stage || 'prospect',
        priority: data.priority || 'medium',
        probability: data.probability || 50,
        expectedCloseDate: data.expectedCloseDate || new Date().toISOString(),
        companyId: data.companyId || '',
        contactId: data.contactId || '',
        ownerId: data.ownerId || 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: data.tags || [],
        meddpicc: data.meddpicc || {
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

      setOpportunities(prev => [...prev, newOpportunity]);
      setIsCreateDialogOpen(false);
      toast.success('Opportunity created successfully');
    } catch (error) {
      toast.error('Failed to create opportunity');
    }
  };

  const handleUpdateOpportunity = async (data: Partial<Opportunity>) => {
    if (!editingOpportunity) return;

    try {
      const updatedOpportunity: Opportunity = {
        ...editingOpportunity,
        ...data,
        updatedAt: new Date().toISOString()
      };

      setOpportunities(prev => prev.map(opp => 
        opp.id === editingOpportunity.id ? updatedOpportunity : opp
      ));
      
      setIsEditDialogOpen(false);
      setEditingOpportunity(null);
      toast.success('Opportunity updated successfully');
    } catch (error) {
      toast.error('Failed to update opportunity');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStageColor = (stage: string) => {
    const stageConfig = PEAK_STAGES.find(s => s.value === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

  if (showDetail && selectedOpportunity) {
    return (
      <ResponsiveOpportunityDetail
        opportunity={selectedOpportunity}
        isOpen={true}
        onClose={() => {
          setShowDetail(false);
          setSelectedOpportunity(null);
        }}
        onEdit={() => handleEditOpportunity(selectedOpportunity)}
        onDelete={() => {
          handleDeleteOpportunity(selectedOpportunity.id);
          setShowDetail(false);
          setSelectedOpportunity(null);
        }}
      />
    );
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'opportunities' | 'validation-test' | 'company-contact-test' | 'comprehensive-test' | 'button-debug')} className="h-full flex flex-col">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Opportunities Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your sales pipeline and test enhanced form validation features
              </p>
            </div>
            <CreateOpportunityButtonDebugger
              onCreateClick={() => {
                console.log('Create button clicked');
                toast.success('Create button clicked!'); // Test to confirm button works
                setIsCreateDialogOpen(true);
              }}
              isDialogOpen={isCreateDialogOpen}
              className="w-full sm:w-auto"
            />
          </div>

          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="validation-test">🧪 Basic Tests</TabsTrigger>
            <TabsTrigger value="company-contact-test">🏢 Company/Contact</TabsTrigger>
            <TabsTrigger value="comprehensive-test">🚀 Enhanced Testing</TabsTrigger>
            <TabsTrigger value="button-debug">🔧 Button Debug</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="opportunities" className="flex-1 min-h-0 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search opportunities, companies, or contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="All Stages" />
                      </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {PEAK_STAGES.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button 
                    variant={viewMode === 'table' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none"
                  >
                    <List size={16} />
                  </Button>
                  <Button 
                    variant={viewMode === 'cards' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="rounded-l-none"
                  >
                    <GridFour size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'table' ? (
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              <div className="opportunities-table-container h-full">
                <div className="opportunities-table-wrapper">
                  <Table className="opportunities-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="col-opportunity-details">Opportunity</TableHead>
                        <TableHead className="col-company-contact">Company & Contact</TableHead>
                        <TableHead className="col-stage-progress">Stage & Progress</TableHead>
                        <TableHead className="col-deal-value">Deal Value</TableHead>
                        <TableHead className="col-win-probability">Win Probability</TableHead>
                        <TableHead className="col-priority">Priority</TableHead>
                        <TableHead className="col-timeline">Timeline</TableHead>
                        <TableHead className="col-actions">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOpportunities.map((opportunity) => {
                        const company = companies.find(c => c.id === opportunity.companyId);
                        const contact = contacts.find(c => c.id === opportunity.contactId);
                        const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage);
                        const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
                        const stageProgress = getStageProgress(opportunity.stage);
                        const daysToClose = differenceInDays(new Date(opportunity.expectedCloseDate), new Date());

                        return (
                          <TableRow key={opportunity.id} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="col-opportunity-details">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground truncate-content">
                                  {opportunity.title}
                                </div>
                                <div className="text-sm text-muted-foreground truncate-content">
                                  {opportunity.description || 'No description'}
                                </div>
                                {opportunity.tags && opportunity.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {opportunity.tags.slice(0, 2).map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {opportunity.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{opportunity.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell className="col-company-contact">
                              <div className="space-y-1">
                                <div className="font-medium text-foreground flex items-center gap-1">
                                  <Building size={14} className="text-blue-600" />
                                  <span className="truncate-content">
                                    {company?.name || 'Unknown Company'}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users size={14} className="text-green-600" />
                                  <span className="truncate-content">
                                    {contact ? `${contact.firstName} ${contact.lastName}` : 'No contact'}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="col-stage-progress">
                              <div className="space-y-2">
                                <Badge className={`${stageConfig?.color || 'bg-gray-100 text-gray-800'} text-xs`}>
                                  {stageConfig?.label || opportunity.stage}
                                </Badge>
                                <div className="space-y-1">
                                  <Progress value={stageProgress} className="h-2" />
                                  <div className="text-xs text-muted-foreground">
                                    {stageProgress}% complete
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="col-deal-value">
                              <div className="space-y-1">
                                <div className="font-semibold text-foreground">
                                  {formatCurrency(opportunity.value)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Deal Value
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="col-win-probability">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{opportunity.probability}%</span>
                                  <Target size={14} className="text-blue-600" />
                                </div>
                                <Progress value={opportunity.probability} className="h-2" />
                                <div className="text-xs text-muted-foreground">
                                  MEDDPICC: {meddpicScore}%
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="col-priority">
                              <Badge 
                                variant="secondary" 
                                className={`${getPriorityBadge(opportunity.priority || 'medium')} text-xs border`}
                              >
                                {(opportunity.priority || 'medium').charAt(0).toUpperCase() + 
                                 (opportunity.priority || 'medium').slice(1)}
                              </Badge>
                            </TableCell>
                            
                            <TableCell className="col-timeline">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">
                                  {format(new Date(opportunity.expectedCloseDate), 'MMM dd')}
                                </div>
                                <div className={`text-xs font-medium ${
                                  daysToClose < 0 ? 'text-red-600' : 
                                  daysToClose < 7 ? 'text-amber-600' : 
                                  'text-green-600'
                                }`}>
                                  {daysToClose < 0 ? `${Math.abs(daysToClose)}d overdue` : 
                                   daysToClose === 0 ? 'Due today' :
                                   `${daysToClose}d left`}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell className="col-actions">
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewOpportunity(opportunity);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditOpportunity(opportunity);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <PencilSimple size={14} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOpportunity(opportunity.id);
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => {
              const company = companies.find(c => c.id === opportunity.companyId);
              const contact = contacts.find(c => c.id === opportunity.contactId);
              const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage);
              const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
              const stageProgress = getStageProgress(opportunity.stage);
              const daysToClose = differenceInDays(new Date(opportunity.expectedCloseDate), new Date());

              return (
                <Card 
                  key={opportunity.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                  onClick={() => handleViewOpportunity(opportunity)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                          {opportunity.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building size={14} className="text-blue-600" />
                          <span className="truncate">{company?.name || 'Unknown Company'}</span>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${getPriorityBadge(opportunity.priority || 'medium')} text-xs border shrink-0`}
                      >
                        {(opportunity.priority || 'medium').charAt(0).toUpperCase() + 
                         (opportunity.priority || 'medium').slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`${stageConfig?.color || 'bg-gray-100 text-gray-800'} text-xs`}>
                          {stageConfig?.label || opportunity.stage}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{stageProgress}%</span>
                      </div>
                      <Progress value={stageProgress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Deal Value</div>
                        <div className="font-semibold text-lg text-foreground">
                          {formatCurrency(opportunity.value)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                        <div className="font-semibold text-lg text-foreground">
                          {opportunity.probability}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Expected Close</div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                        </span>
                        <span className={`text-xs font-medium ${
                          daysToClose < 0 ? 'text-red-600' : 
                          daysToClose < 7 ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {daysToClose < 0 ? `${Math.abs(daysToClose)}d overdue` : 
                           daysToClose === 0 ? 'Due today' :
                           `${daysToClose}d left`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={14} className="text-green-600" />
                        <span className="truncate">
                          {contact ? `${contact.firstName} ${contact.lastName}` : 'No contact'}
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </TabsContent>

      <TabsContent value="validation-test" className="flex-1 min-h-0">
        <FormValidationTestDashboard />
      </TabsContent>

      <TabsContent value="company-contact-test" className="flex-1 min-h-0">
        <CompanyContactSelectionTest />
      </TabsContent>

      <TabsContent value="comprehensive-test" className="flex-1 min-h-0">
        <ComprehensiveFormTestSuite />
      </TabsContent>

      <TabsContent value="button-debug" className="flex-1 min-h-0">
        <div className="space-y-6">
          <CreateOpportunityLiveDemo />
          <CreateOpportunityFunctionalityTester />
          <CreateOpportunityDebugSummary />
        </div>
      </TabsContent>
      </Tabs>

      {/* Create Opportunity Dialog */}
      <OpportunityEditForm
        isOpen={isCreateDialogOpen}
        onClose={() => {
          console.log('Closing create dialog');
          setIsCreateDialogOpen(false);
        }}
        onSubmit={handleCreateOpportunity}
      />

      {/* Edit Opportunity Dialog */}
      <OpportunityEditForm
        isOpen={isEditDialogOpen}
        onClose={() => {
          console.log('Closing edit dialog');
          setIsEditDialogOpen(false);
          setEditingOpportunity(null);
        }}
        onSubmit={handleUpdateOpportunity}
        opportunity={editingOpportunity}
      />
    </div>
  );
}

export function OpportunitiesMainView(props: OpportunitiesMainViewProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        errorHandler.handleError(error, {
          component: 'OpportunitiesMainView',
          errorInfo,
        }, 'high');
      }}
    >
      <OpportunitiesMainViewInner {...props} />
    </ErrorBoundary>
  );
}

// Export alias for backward compatibility
export const OpportunitiesView = OpportunitiesMainView;