import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Plus, 
  Eye, 
  PencilSimple, 
  Trash,
  Filter,
  Star,
  Calendar,
  DollarSign,
  Building,
  Users,
  Target,
  TrendingUp,
  ChartBar,
  GridFour,
  List,
  SortAscending,
  Phone,
  Envelope,
  CheckCircle,
  Circle,
  Warning,
  Trophy,
  ClockCounterClockwise,
  User,
  CurrencyDollar,
  FileText,
  ChartLineUp
} from '@phosphor-icons/react';
import { OpportunityEditForm } from './OpportunityEditForm';
import { ResponsiveOpportunityDetail } from './ResponsiveOpportunityDetail';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OpportunitiesViewProps {
  className?: string;
}

export function OpportunitiesView({ className }: OpportunitiesViewProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);

  // State management
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Initialize with some sample data if empty
  useEffect(() => {
    if (opportunities.length === 0) {
      initializeSampleData();
    }
  }, []);

  const initializeSampleData = async () => {
    // Create sample companies if they don't exist
    if (companies.length === 0) {
      const { sampleCompanies, sampleContacts } = await import('@/data/sample-opportunities');
      
      setCompanies(sampleCompanies);
      setContacts(sampleContacts);
    }
  };

  // Filter and sort opportunities
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = 
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    const matchesPriority = priorityFilter === 'all' || opp.priority === priorityFilter;
    
    return matchesSearch && matchesStage && matchesPriority;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'value':
        comparison = a.value - b.value;
        break;
      case 'probability':
        comparison = a.probability - b.probability;
        break;
      case 'expectedCloseDate':
        comparison = new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime();
        break;
      default:
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Event handlers
  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setIsEditFormOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsEditFormOpen(true);
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailViewOpen(true);
  };

  const handleDeleteOpportunity = async (opportunity: Opportunity) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${opportunity.title}"?`);
    if (confirmed) {
      setOpportunities(current => current.filter(opp => opp.id !== opportunity.id));
      toast.success('Opportunity deleted successfully');
    }
  };

  const handleSaveOpportunity = (opportunityData: Partial<Opportunity>) => {
    if (selectedOpportunity) {
      // Update existing
      setOpportunities(current =>
        current.map(opp =>
          opp.id === selectedOpportunity.id
            ? { ...opp, ...opportunityData, updatedAt: new Date().toISOString() }
            : opp
        )
      );
    } else {
      // Create new
      const newOpportunity: Opportunity = {
        id: crypto.randomUUID(),
        ownerId: 'current-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        ...opportunityData
      } as Opportunity;
      
      setOpportunities(current => [...current, newOpportunity]);
    }
    
    setIsEditFormOpen(false);
  };

  const getStageConfig = (stage: string) => {
    return PEAK_STAGES.find(s => s.value === stage) || PEAK_STAGES[0];
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'low':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' };
      case 'medium':
        return { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' };
      case 'high':
        return { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800' };
      case 'critical':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' };
    }
  };

  // Calculate metrics
  const metrics = {
    total: sortedOpportunities.length,
    totalValue: sortedOpportunities.reduce((sum, opp) => sum + opp.value, 0),
    averageValue: sortedOpportunities.length > 0 ? sortedOpportunities.reduce((sum, opp) => sum + opp.value, 0) / sortedOpportunities.length : 0,
    averageProbability: sortedOpportunities.length > 0 ? sortedOpportunities.reduce((sum, opp) => sum + opp.probability, 0) / sortedOpportunities.length : 0
  };

  return (
    <div className={`w-full min-w-0 flex-1 flex flex-col ${className}`}>
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 lg:px-8 py-6 mb-6">
        <div className="w-full max-w-none">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Sales Opportunities
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground">
                Track and manage your sales pipeline with PEAK methodology and MEDDPICC qualification
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Button 
                onClick={handleCreateOpportunity} 
                className="h-11 px-6 lg:px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                size="lg"
              >
                <Plus size={18} className="mr-2" />
                New Opportunity
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 lg:px-8 space-y-6 lg:space-y-8 w-full">
        <div className="w-full space-y-6 lg:space-y-8">
        {/* Enhanced Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-700">Total Opportunities</p>
                  <p className="text-3xl font-bold text-blue-900">{metrics.total}</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <TrendingUp size={12} className="mr-1" />
                    Active pipeline
                  </div>
                </div>
                <div className="p-3 bg-blue-200/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Target size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-emerald-700">Pipeline Value</p>
                  <p className="text-3xl font-bold text-emerald-900">{formatCurrency(metrics.totalValue)}</p>
                  <div className="flex items-center text-xs text-emerald-600">
                    <DollarSign size={12} className="mr-1" />
                    Total potential
                  </div>
                </div>
                <div className="p-3 bg-emerald-200/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <CurrencyDollar size={24} className="text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-700">Average Deal Size</p>
                  <p className="text-3xl font-bold text-purple-900">{formatCurrency(metrics.averageValue)}</p>
                  <div className="flex items-center text-xs text-purple-600">
                    <ChartBar size={12} className="mr-1" />
                    Per opportunity
                  </div>
                </div>
                <div className="p-3 bg-purple-200/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <ChartBar size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-700">Win Probability</p>
                  <p className="text-3xl font-bold text-amber-900">{Math.round(metrics.averageProbability)}%</p>
                  <div className="flex items-center text-xs text-amber-600">
                    <TrendingUp size={12} className="mr-1" />
                    Average success rate
                  </div>
                </div>
                <div className="p-3 bg-amber-200/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                  <Trophy size={24} className="text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Control Panel */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col xl:flex-row xl:items-center gap-6">
              {/* Search Bar */}
              <div className="flex-1 max-w-full xl:max-w-lg">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search opportunities, companies, or contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base border-0 bg-background/80 backdrop-blur-sm shadow-sm focus:shadow-md transition-shadow"
                  />
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-56 lg:w-60 h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm">
                    <Filter size={16} className="mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent className="max-w-xs">
                    <SelectItem value="all">All Stages</SelectItem>
                    {PEAK_STAGES.map(stage => (
                      <SelectItem key={stage.value} value={stage.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                          {stage.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-52 lg:w-56 h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm">
                    <Star size={16} className="mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-52 lg:w-56 h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm">
                    <SortAscending size={16} className="mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Recently Updated</SelectItem>
                    <SelectItem value="title">Opportunity Name</SelectItem>
                    <SelectItem value="value">Deal Value</SelectItem>
                    <SelectItem value="probability">Win Probability</SelectItem>
                    <SelectItem value="expectedCloseDate">Close Date</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center bg-background/80 backdrop-blur-sm rounded-lg shadow-sm p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-10 px-4 lg:px-5"
                  >
                    <List size={16} className="mr-2" />
                    <span>List</span>
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-10 px-4 lg:px-5"
                  >
                    <GridFour size={16} className="mr-2" />
                    <span>Grid</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Opportunities Table */}
        <Card className="border-0 shadow-xl bg-card/70 backdrop-blur-sm overflow-hidden w-full">
          {sortedOpportunities.length === 0 ? (
            <div className="text-center py-16 lg:py-24">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center">
                  <Target size={28} className="text-muted-foreground lg:w-8 lg:h-8" />
                </div>
              </div>
              <h3 className="text-xl lg:text-2xl font-semibold mb-3">
                {searchTerm || stageFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No matching opportunities'
                  : 'Ready to start your sales journey?'
                }
              </h3>
              <p className="text-muted-foreground text-base lg:text-lg mb-6 lg:mb-8 max-w-md mx-auto">
                {searchTerm || stageFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                  : 'Create your first opportunity and start building your pipeline with our PEAK methodology.'
                }
              </p>
              {!searchTerm && stageFilter === 'all' && priorityFilter === 'all' && (
                <Button 
                  onClick={handleCreateOpportunity} 
                  size="lg"
                  className="h-12 px-6 lg:px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Create Your First Opportunity
                </Button>
              )}
            </div>
          ) : (
            <div className="opportunities-table-container w-full">
              <div className="opportunities-table-wrapper w-full">
                <Table className="opportunities-table w-full">
                  <TableHeader className="bg-muted/30 backdrop-blur-sm">
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-opportunity-details">
                        Opportunity Details
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-company-contact">
                        Company & Contact
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-stage-progress">
                        Stage & Progress
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-deal-value text-right">
                        Deal Value
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-win-probability">
                        Win Probability
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-priority">
                        Priority
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-timeline">
                        Timeline
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-4 px-8 col-actions text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedOpportunities.map((opportunity) => {
                      const stageConfig = getStageConfig(opportunity.stage);
                      const priorityBadge = getPriorityBadge(opportunity.priority);
                      const company = companies.find(c => c.id === opportunity.companyId);
                      const contact = contacts.find(c => c.id === opportunity.contactId);

                      return (
                        <TableRow 
                          key={opportunity.id} 
                          className="group border-border/30 hover:bg-muted/20 cursor-pointer transition-all duration-200"
                          onClick={() => handleViewOpportunity(opportunity)}
                        >
                          <TableCell className="py-6 px-8 col-opportunity-details">
                            <div className="space-y-2">
                              <div className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                                {opportunity.title}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2 max-w-[350px]">
                                {opportunity.description || 'No description provided'}
                              </div>
                              {opportunity.tags && opportunity.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap mt-2">
                                  {opportunity.tags.slice(0, 3).map((tag, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {opportunity.tags.length > 3 && (
                                    <Badge 
                                      variant="secondary" 
                                      className="text-xs px-2 py-1 bg-muted text-muted-foreground"
                                    >
                                      +{opportunity.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-company-contact">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
                                  <Building size={14} className="text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm text-foreground truncate">{company?.name || 'Unknown Company'}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {company?.industry || 'Industry not specified'}
                                  </div>
                                </div>
                              </div>
                              {contact && (
                                <div className="flex items-center gap-2 pl-1">
                                  <Avatar className="h-5 w-5 shrink-0">
                                    <AvatarFallback className="text-xs bg-muted">
                                      {contact.firstName[0]}{contact.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="text-sm min-w-0 flex-1">
                                    <div className="text-sm text-foreground truncate">{contact.firstName} {contact.lastName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{contact.title || 'Contact'}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-stage-progress">
                            <div className="space-y-3">
                              <Badge 
                                variant="secondary" 
                                className={`${stageConfig.color} font-medium px-2 py-1 text-xs whitespace-nowrap`}
                              >
                                {stageConfig.label}
                              </Badge>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{getStageProgress(opportunity.stage)}%</span>
                                </div>
                                <Progress 
                                  value={getStageProgress(opportunity.stage)} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-deal-value text-right">
                            <div className="space-y-1">
                              <div className="text-lg font-bold text-foreground">
                                {formatCurrency(opportunity.value)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Deal value
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-win-probability">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground text-xs">Win Rate</span>
                                    <span className="font-semibold text-foreground text-sm">{opportunity.probability}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        opportunity.probability >= 75 ? 'bg-green-500' :
                                        opportunity.probability >= 50 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${opportunity.probability}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {opportunity.probability >= 75 ? 'High confidence' :
                                 opportunity.probability >= 50 ? 'Moderate' :
                                 'Needs attention'}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-priority">
                            <Badge 
                              variant="secondary" 
                              className={`${priorityBadge.className} font-medium px-2 py-1 text-xs whitespace-nowrap`}
                            >
                              {(opportunity.priority || 'medium').charAt(0).toUpperCase() + 
                               (opportunity.priority || 'medium').slice(1)}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-timeline">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar size={12} className="text-muted-foreground shrink-0" />
                                <span className="font-medium text-xs">
                                  {format(new Date(opportunity.expectedCloseDate), 'MMM dd')}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Expected close
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="py-6 px-8 col-actions">
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOpportunity(opportunity);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Eye size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOpportunity(opportunity);
                                }}
                                className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <PencilSimple size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOpportunity(opportunity);
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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
          )}
        </Card>
        </div>
      </div>

      {/* Edit Form Dialog */}
      <OpportunityEditForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedOpportunity(null);
        }}
        onSave={handleSaveOpportunity}
        opportunity={selectedOpportunity}
      />

      {/* Detail View Dialog */}
      {selectedOpportunity && (
        <ResponsiveOpportunityDetail
          isOpen={isDetailViewOpen}
          onClose={() => {
            setIsDetailViewOpen(false);
            setSelectedOpportunity(null);
          }}
          opportunity={selectedOpportunity}
          onEdit={() => {
            setIsDetailViewOpen(false);
            handleEditOpportunity(selectedOpportunity);
          }}
          onDelete={() => {
            setIsDetailViewOpen(false);
            handleDeleteOpportunity(selectedOpportunity);
          }}
        />
      )}
    </div>
  );
}