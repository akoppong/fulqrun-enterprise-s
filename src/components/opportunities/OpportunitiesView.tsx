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
import { OpportunityDetailTest } from './OpportunityDetailTest';
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
  const [isTestViewOpen, setIsTestViewOpen] = useState(false);
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
    <div className={`w-full max-w-none overflow-x-auto ${className}`}>
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 lg:px-6 py-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full min-w-0">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Sales Opportunities
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground">
              Track and manage your sales pipeline with PEAK methodology and MEDDPICC qualification
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0 shrink-0">
            <Button 
              onClick={() => setIsTestViewOpen(true)}
              variant="outline"
              className="h-11 px-4 lg:px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
              size="lg"
            >
              🧪 Test Detail View
            </Button>
            <Button 
              onClick={handleCreateOpportunity} 
              className="h-11 px-4 lg:px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
              size="lg"
            >
              <Plus size={18} className="mr-2" />
              New Opportunity
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 space-y-6 lg:space-y-8 w-full min-w-0 overflow-x-auto">
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
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4 lg:gap-6">
              {/* Search Bar */}
              <div className="flex-1 max-w-full xl:max-w-md">
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
              <div className="flex flex-wrap items-center gap-3">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-44 lg:w-52 h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm">
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
                  <SelectTrigger className="w-40 lg:w-44 h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm">
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
                  <SelectTrigger className="w-40 lg:w-44 h-12 border-0 bg-background/80 backdrop-blur-sm shadow-sm">
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
                    className="h-10 px-3 lg:px-4"
                  >
                    <List size={16} className="mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">List</span>
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-10 px-3 lg:px-4"
                  >
                    <GridFour size={16} className="mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Opportunities Table */}
        <Card className="border-0 shadow-xl bg-card/70 backdrop-blur-sm overflow-hidden">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 backdrop-blur-sm">
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[300px] lg:min-w-[350px]">
                      Opportunity Details
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[160px] lg:min-w-[180px]">
                      Company & Contact
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[120px] lg:min-w-[140px]">
                      Stage & Progress
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[120px] lg:min-w-[140px] text-right">
                      Deal Value
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[140px] lg:min-w-[160px]">
                      Win Probability
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[100px] lg:min-w-[120px]">
                      Priority
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[120px] lg:min-w-[140px]">
                      Timeline
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-4 px-4 lg:px-6 min-w-[100px] lg:min-w-[120px] text-center">
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
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <div className="space-y-2">
                            <div className="font-semibold text-sm lg:text-base text-foreground group-hover:text-primary transition-colors">
                              {opportunity.title}
                            </div>
                            <div className="text-xs lg:text-sm text-muted-foreground line-clamp-2 max-w-sm lg:max-w-md">
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
                                    +{opportunity.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <Building size={16} className="text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-xs lg:text-sm text-foreground">{company?.name || 'Unknown Company'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {company?.industry || 'Industry not specified'}
                                </div>
                              </div>
                            </div>
                            {contact && (
                              <div className="flex items-center gap-3 pl-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-muted">
                                    {contact.firstName[0]}{contact.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                  <div className="text-xs lg:text-sm text-foreground">{contact.firstName} {contact.lastName}</div>
                                  <div className="text-xs text-muted-foreground">{contact.title || 'Contact'}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <div className="space-y-3">
                            <Badge 
                              variant="secondary" 
                              className={`${stageConfig.color} font-medium px-2 lg:px-3 py-1 text-xs`}
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
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6 text-right">
                          <div className="space-y-1">
                            <div className="text-lg lg:text-xl font-bold text-foreground">
                              {formatCurrency(opportunity.value)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Deal value
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Win Rate</span>
                                  <span className="font-semibold text-foreground">{opportunity.probability}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
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
                               opportunity.probability >= 50 ? 'Moderate confidence' :
                               'Needs attention'}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <Badge 
                            variant="secondary" 
                            className={`${priorityBadge.className} font-medium px-2 lg:px-3 py-1 text-xs`}
                          >
                            {(opportunity.priority || 'medium').charAt(0).toUpperCase() + 
                             (opportunity.priority || 'medium').slice(1)}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs lg:text-sm">
                              <Calendar size={14} className="text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Expected close
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="py-4 lg:py-6 px-4 lg:px-6">
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOpportunity(opportunity);
                              }}
                              className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpportunity(opportunity);
                              }}
                              className="h-9 w-9 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <PencilSimple size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOpportunity(opportunity);
                              }}
                              className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
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
        <OpportunityDetailDialog
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

      {/* Test View Dialog */}
      <Dialog open={isTestViewOpen} onOpenChange={setIsTestViewOpen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-0 gap-0">
          <div className="h-full overflow-hidden">
            <OpportunityDetailTest />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple detail view dialog for viewing opportunity details
interface OpportunityDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  onEdit: () => void;
  onDelete: () => void;
}

function OpportunityDetailDialog({ isOpen, onClose, opportunity, onEdit, onDelete }: OpportunityDetailDialogProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  const [activeTab, setActiveTab] = useState('overview');
  
  const company = companies.find(c => c.id === opportunity.companyId);
  const contact = contacts.find(c => c.id === opportunity.contactId);
  const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0];
  const priorityBadge = getPriorityBadge(opportunity.priority);
  const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
  const stageProgress = getStageProgress(opportunity.stage);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-0 gap-0">
        {/* Modern Header with Gradient */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl border-b border-border/50 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 lg:space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-9 px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  ← Back to Opportunities
                </Button>
              </div>
              
              <div className="space-y-2 lg:space-y-3">
                <h1 className="text-2xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {opportunity.title}
                </h1>
                
                <div className="flex items-center gap-4 lg:gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building size={16} className="text-blue-600 lg:w-5 lg:h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm lg:text-base text-foreground">{company?.name || 'Unknown Company'}</div>
                      <div className="text-xs lg:text-sm">{company?.industry || 'Industry not specified'}</div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={`${stageConfig.color} px-3 py-1 font-medium text-xs lg:text-sm`}
                  >
                    {stageConfig.label}
                  </Badge>
                  
                  <div className="flex items-center gap-2 text-xs lg:text-sm">
                    <Calendar size={12} className="lg:w-4 lg:h-4" />
                    <span>Created {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={onEdit} 
                className="h-10 lg:h-11 px-4 lg:px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PencilSimple size={16} className="mr-2 lg:w-5 lg:h-5" />
                Edit Opportunity
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="px-4 lg:px-6 py-6 lg:py-8 space-y-6 lg:space-y-8">
            {/* Enhanced Key Metrics - Full Width */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="p-4 bg-emerald-200/50 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                      <CurrencyDollar size={32} className="text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-emerald-900">
                      {formatCurrency(opportunity.value)}
                    </div>
                    <div className="text-sm font-medium text-emerald-700">Deal Value</div>
                    <div className="text-xs text-emerald-600">Total opportunity size</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="p-4 bg-blue-200/50 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                      <Target size={32} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-900">
                      {opportunity.probability}%
                    </div>
                    <div className="text-sm font-medium text-blue-700">Win Probability</div>
                    <div className="text-xs text-blue-600">
                      {opportunity.probability >= 75 ? 'High confidence' :
                       opportunity.probability >= 50 ? 'Moderate confidence' :
                       'Needs attention'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="p-4 bg-purple-200/50 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                      <TrendingUp size={32} className={`${meddpicScore < 50 ? 'text-red-500' : meddpicScore < 80 ? 'text-yellow-500' : 'text-green-500'}`} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className={`text-3xl font-bold ${meddpicScore < 50 ? 'text-red-600' : meddpicScore < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {meddpicScore}%
                    </div>
                    <div className="text-sm font-medium text-purple-700">MEDDPICC Score</div>
                    <div className="text-xs text-purple-600">Qualification health</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <div className="p-4 bg-amber-200/50 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                      <Calendar size={32} className="text-amber-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-amber-900">
                      {format(new Date(opportunity.expectedCloseDate), 'MMM dd')}
                    </div>
                    <div className="text-sm font-medium text-amber-700">Expected Close</div>
                    <div className="text-xs text-amber-600">Target completion</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Interactive Tabs - Full Width */}
            <Card className="border-0 shadow-xl bg-card/70 backdrop-blur-sm">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b border-border/50 bg-muted/20 px-6">
                  <TabsList className="h-14 bg-transparent w-full justify-start gap-1 p-1">
                    <TabsTrigger 
                      value="overview" 
                      className="h-12 px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="peak" 
                      className="h-12 px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Target size={16} className="mr-2" />
                      PEAK Methodology
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meddpicc" 
                      className="h-12 px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <ChartLineUp size={16} className="mr-2" />
                      MEDDPICC Scoring
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activities" 
                      className="h-12 px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <ClockCounterClockwise size={16} className="mr-2" />
                      Activities
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contacts" 
                      className="h-12 px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <Users size={16} className="mr-2" />
                      Contacts
                    </TabsTrigger>
                    <TabsTrigger 
                      value="analytics" 
                      className="h-12 px-6 font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <ChartBar size={16} className="mr-2" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-8">
                  <TabsContent value="overview" className="mt-0 space-y-8">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      {/* Opportunity Details - Enhanced */}
                      <div className="xl:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                          <CardHeader className="pb-6">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                              <FileText size={20} className="text-primary" />
                              Opportunity Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Current Stage</Label>
                                <div className="flex items-center gap-3">
                                  <Badge className={`${stageConfig.color} text-sm px-3 py-1 font-medium`}>
                                    {stageConfig.label}
                                  </Badge>
                                  <div className="text-sm text-muted-foreground">
                                    ({getStageProgress(opportunity.stage)}% complete)
                                  </div>
                                </div>
                                <Progress value={getStageProgress(opportunity.stage)} className="mt-2" />
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Priority Level</Label>
                                <Badge variant="secondary" className={`${priorityBadge.className} text-sm px-3 py-1 font-medium w-fit`}>
                                  {(opportunity.priority || 'medium').charAt(0).toUpperCase() + (opportunity.priority || 'medium').slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Lead Source</Label>
                                <div className="text-sm font-medium text-foreground">
                                  {opportunity.leadSource || 'Not specified'}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Industry Vertical</Label>
                                <div className="text-sm font-medium text-foreground">
                                  {opportunity.industry || 'Not specified'}
                                </div>
                              </div>
                            </div>

                            {opportunity.description && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <p className="text-sm text-foreground leading-relaxed">
                                    {opportunity.description}
                                  </p>
                                </div>
                              </div>
                            )}

                            {opportunity.tags && opportunity.tags.length > 0 && (
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-muted-foreground">Tags & Categories</Label>
                                <div className="flex flex-wrap gap-2">
                                  {opportunity.tags.map((tag, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="secondary" 
                                      className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Primary Contact - Enhanced */}
                      <div className="xl:col-span-1">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/30">
                          <CardHeader className="pb-6">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                              <User size={20} className="text-blue-600" />
                              Primary Contact
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {contact ? (
                              <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16 border-2 border-blue-100">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                                      {contact.firstName[0]}{contact.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <div className="font-semibold text-lg text-foreground">
                                      {contact.firstName} {contact.lastName}
                                    </div>
                                    <div className="text-sm text-blue-600 font-medium">
                                      {contact.title || 'Contact'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {company?.name || 'Unknown Company'}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Envelope size={16} className="text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-xs text-muted-foreground">Email</div>
                                      <div className="text-sm font-medium">{contact.email}</div>
                                    </div>
                                  </div>
                                  
                                  {contact.phone && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                      <div className="p-2 bg-green-100 rounded-lg">
                                        <Phone size={16} className="text-green-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs text-muted-foreground">Phone</div>
                                        <div className="text-sm font-medium">{contact.phone}</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" className="flex-1">
                                    View Details
                                  </Button>
                                  <Button variant="outline" size="sm" className="flex-1">
                                    Contact
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <div className="mb-6">
                                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                                    <Users size={24} className="text-blue-600" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="font-medium text-foreground">No Primary Contact</div>
                                  <div className="text-sm text-muted-foreground">
                                    Assign a contact to improve tracking
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="mt-4">
                                  <Plus size={14} className="mr-2" />
                                  Add Contact
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="peak" className="mt-0 space-y-8">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <Target size={20} className="text-primary" />
                            PEAK Methodology Progress
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Overall Progress:</span>
                            <span className="text-lg font-bold text-primary">{stageProgress}%</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Progress value={stageProgress} className="h-3" />
                          <div className="mt-2 text-sm text-muted-foreground">
                            {stageProgress === 100 ? 'All stages completed' : 
                             stageProgress >= 75 ? 'Near completion' :
                             stageProgress >= 50 ? 'Good progress' :
                             stageProgress >= 25 ? 'Early stages' : 'Getting started'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-6">
                          {PEAK_STAGES.map((stage, index) => {
                            const isCurrentStage = stage.value === opportunity.stage;
                            const isPastStage = PEAK_STAGES.findIndex(s => s.value === opportunity.stage) > index;
                            
                            return (
                              <Card key={stage.value} className={`border-2 transition-all duration-300 ${
                                isCurrentStage ? 'border-primary bg-primary/5 shadow-lg' : 
                                isPastStage ? 'border-green-200 bg-green-50/50' : 
                                'border-border bg-muted/20'
                              }`}>
                                <CardContent className="p-6">
                                  <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${
                                      isCurrentStage ? 'bg-primary text-primary-foreground shadow-lg' :
                                      isPastStage ? 'bg-green-500 text-white' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {isPastStage ? <CheckCircle size={24} /> :
                                       isCurrentStage ? <ClockCounterClockwise size={24} /> :
                                       <Circle size={24} />}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h3 className={`text-xl font-semibold ${
                                          isCurrentStage ? 'text-primary' :
                                          isPastStage ? 'text-green-700' :
                                          'text-muted-foreground'
                                        }`}>
                                          {stage.label}
                                        </h3>
                                        <Badge variant={
                                          isCurrentStage ? 'default' :
                                          isPastStage ? 'secondary' :
                                          'outline'
                                        } className={
                                          isCurrentStage ? 'bg-primary' :
                                          isPastStage ? 'bg-green-100 text-green-700' :
                                          'text-muted-foreground'
                                        }>
                                          {isPastStage ? 'Completed' :
                                           isCurrentStage ? 'In Progress' :
                                           'Pending'}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-muted-foreground leading-relaxed">
                                        {stage.description}
                                      </p>
                                      
                                      {/* Enhanced Stage-specific content */}
                                      <div className="bg-background/50 rounded-lg p-4 space-y-3">
                                        {stage.value === 'prospect' && (
                                          <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Key Activities</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Lead qualification assessment</li>
                                                  <li>• Initial contact establishment</li>
                                                  <li>• Basic needs identification</li>
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Success Criteria</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Qualified lead confirmed</li>
                                                  <li>• Decision maker contacted</li>
                                                  <li>• Pain points identified</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                        
                                        {stage.value === 'engage' && (
                                          <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Key Activities</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Discovery calls conducted</li>
                                                  <li>• Stakeholder mapping</li>
                                                  <li>• Solution presentation</li>
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Success Criteria</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Requirements understood</li>
                                                  <li>• Decision makers identified</li>
                                                  <li>• Proposal requested</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                        
                                        {stage.value === 'acquire' && (
                                          <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Key Activities</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Proposal development</li>
                                                  <li>• Negotiation sessions</li>
                                                  <li>• Contract finalization</li>
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Success Criteria</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Proposal accepted</li>
                                                  <li>• Terms agreed upon</li>
                                                  <li>• Contract signed</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                        
                                        {stage.value === 'keep' && (
                                          <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Key Activities</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Customer onboarding</li>
                                                  <li>• Relationship management</li>
                                                  <li>• Expansion opportunities</li>
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="font-medium text-sm text-foreground mb-1">Success Criteria</div>
                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                  <li>• Successful implementation</li>
                                                  <li>• Customer satisfaction</li>
                                                  <li>• Renewal secured</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="meddpicc" className="mt-0 space-y-8">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-purple/5">
                      <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <ChartLineUp size={20} className="text-purple-600" />
                            MEDDPICC Qualification Assessment
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Qualification Score:</span>
                            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                              meddpicScore < 50 ? 'text-red-600 bg-red-50' : 
                              meddpicScore < 80 ? 'text-yellow-600 bg-yellow-50' : 
                              'text-green-600 bg-green-50'
                            }`}>{meddpicScore}%</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={meddpicScore} className="h-3" />
                          <div className="flex justify-between text-sm">
                            <span className={meddpicScore < 50 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                              Poor (0-49%)
                            </span>
                            <span className={meddpicScore >= 50 && meddpicScore < 80 ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
                              Good (50-79%)
                            </span>
                            <span className={meddpicScore >= 80 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                              Excellent (80-100%)
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Enhanced MEDDPICC Components */}
                          <Card className="border-border/50 bg-gradient-to-br from-background to-blue-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                  <ChartLineUp size={20} className="text-blue-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Metrics</h3>
                                    {opportunity.meddpicc.metrics ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    What economic impact can we measure and quantify?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.metrics || 'Economic metrics not yet defined'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-gradient-to-br from-background to-emerald-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-emerald-100 rounded-lg">
                                  <User size={20} className="text-emerald-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Economic Buyer</h3>
                                    {opportunity.meddpicc.economicBuyer ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Who has the economic authority to make this purchase decision?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.economicBuyer || 'Economic buyer not yet identified'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-gradient-to-br from-background to-purple-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                  <FileText size={20} className="text-purple-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Decision Criteria</h3>
                                    {opportunity.meddpicc.decisionCriteria ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    What specific criteria will they use to evaluate solutions?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.decisionCriteria || 'Decision criteria not yet defined'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-gradient-to-br from-background to-indigo-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                  <Target size={20} className="text-indigo-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Decision Process</h3>
                                    {opportunity.meddpicc.decisionProcess ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    How will they make the final decision? What's the process?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.decisionProcess || 'Decision process not yet mapped'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-gradient-to-br from-background to-rose-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-rose-100 rounded-lg">
                                  <FileText size={20} className="text-rose-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Paper Process</h3>
                                    {opportunity.meddpicc.paperProcess ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    What's the procurement and approval process they follow?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.paperProcess || 'Procurement process not yet understood'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-gradient-to-br from-background to-amber-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                  <Warning size={20} className="text-amber-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Implicate Pain</h3>
                                    {opportunity.meddpicc.implicatePain ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    What specific pain points are we addressing for them?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.implicatePain || 'Pain points not yet clearly identified'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-gradient-to-br from-background to-green-50/20">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-start gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                  <Trophy size={20} className="text-green-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg">Champion</h3>
                                    {opportunity.meddpicc.champion ? (
                                      <CheckCircle size={20} className="text-green-500" />
                                    ) : (
                                      <Warning size={20} className="text-amber-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    Who is actively selling our solution internally for us?
                                  </p>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-foreground">
                                      {opportunity.meddpicc.champion || 'Champion not yet identified or engaged'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Qualification Health Summary */}
                        <Card className={`border-2 ${
                          meddpicScore >= 80 ? 'border-green-200 bg-green-50/30' :
                          meddpicScore >= 50 ? 'border-yellow-200 bg-yellow-50/30' :
                          'border-red-200 bg-red-50/30'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${
                                meddpicScore >= 80 ? 'bg-green-100' :
                                meddpicScore >= 50 ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}>
                                {meddpicScore >= 80 ? 
                                  <CheckCircle size={24} className="text-green-600" /> :
                                  <Warning size={24} className={meddpicScore >= 50 ? 'text-yellow-600' : 'text-red-600'} />
                                }
                              </div>
                              <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">
                                  Qualification Health Assessment
                                </h3>
                                <div className="space-y-2">
                                  {meddpicScore >= 80 && (
                                    <div className="p-4 bg-green-100/50 rounded-lg">
                                      <div className="font-medium text-green-800 mb-2">🎯 Excellent Qualification</div>
                                      <p className="text-sm text-green-700">
                                        This opportunity is well-qualified across all MEDDPICC criteria. 
                                        High probability of successful close. Continue executing your sales strategy.
                                      </p>
                                    </div>
                                  )}
                                  {meddpicScore >= 50 && meddpicScore < 80 && (
                                    <div className="p-4 bg-yellow-100/50 rounded-lg">
                                      <div className="font-medium text-yellow-800 mb-2">⚠️ Good Qualification - Areas for Improvement</div>
                                      <p className="text-sm text-yellow-700">
                                        This opportunity shows promise but has gaps that need attention. 
                                        Focus on completing missing MEDDPICC elements to improve win probability.
                                      </p>
                                    </div>
                                  )}
                                  {meddpicScore < 50 && (
                                    <div className="p-4 bg-red-100/50 rounded-lg">
                                      <div className="font-medium text-red-800 mb-2">🚨 Poor Qualification - Immediate Action Required</div>
                                      <p className="text-sm text-red-700">
                                        This opportunity has significant qualification gaps. 
                                        Prioritize discovery activities to gather missing information before investing further resources.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activities" className="mt-0">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/10">
                      <CardContent className="p-12">
                        <div className="text-center space-y-6">
                          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                            <ClockCounterClockwise size={32} className="text-blue-600" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-2xl font-semibold text-foreground">Activity Timeline Coming Soon</h3>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                              Track all interactions, calls, meetings, and follow-ups for this opportunity in one organized timeline.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="outline" size="lg" disabled>
                              <Plus size={16} className="mr-2" />
                              Log Activity
                            </Button>
                            <Button variant="outline" size="lg" disabled>
                              <Calendar size={16} className="mr-2" />
                              Schedule Meeting
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contacts" className="mt-0">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/10">
                      <CardContent className="p-12">
                        <div className="text-center space-y-6">
                          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center">
                            <Users size={32} className="text-emerald-600" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-2xl font-semibold text-foreground">Deal Contact Management</h3>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                              Manage all stakeholders involved in this opportunity including decision makers, influencers, and champions.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="outline" size="lg" disabled>
                              <Plus size={16} className="mr-2" />
                              Add Contact
                            </Button>
                            <Button variant="outline" size="lg" disabled>
                              <Building size={16} className="mr-2" />
                              Map Stakeholders
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-0">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/10">
                      <CardContent className="p-12">
                        <div className="text-center space-y-6">
                          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center">
                            <ChartBar size={32} className="text-purple-600" />
                          </div>
                          <div className="space-y-3">
                            <h3 className="text-2xl font-semibold text-foreground">Advanced Deal Analytics</h3>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto">
                              Get insights into deal velocity, engagement patterns, competitive positioning, and predictive win/loss analysis.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="outline" size="lg" disabled>
                              <ChartLineUp size={16} className="mr-2" />
                              View Trends
                            </Button>
                            <Button variant="outline" size="lg" disabled>
                              <TrendingUp size={16} className="mr-2" />
                              Predictive Analysis
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        </ScrollArea>

      </DialogContent>
    </Dialog>
  );

  function getPriorityBadge(priority: string) {
    switch (priority) {
      case 'low':
        return { className: 'bg-gray-100 text-gray-800' };
      case 'medium':
        return { className: 'bg-yellow-100 text-yellow-800' };
      case 'high':
        return { className: 'bg-orange-100 text-orange-800' };
      case 'critical':
        return { className: 'bg-red-100 text-red-800' };
      default:
        return { className: 'bg-gray-100 text-gray-800' };
    }
  }
}