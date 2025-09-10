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
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Manage and track all sales opportunities through the PEAK methodology
          </p>
        </div>
        <Button onClick={handleCreateOpportunity} className="flex items-center gap-2">
          <Plus size={16} />
          New Opportunity
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics.total}</div>
                <div className="text-sm text-muted-foreground">Total Opportunities</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
                <div className="text-sm text-muted-foreground">Pipeline Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBar size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(metrics.averageValue)}</div>
                <div className="text-sm text-muted-foreground">Avg Deal Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(metrics.averageProbability)}%</div>
                <div className="text-sm text-muted-foreground">Avg Probability</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} className="text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-48">
                  <Filter size={16} className="mr-2" />
                  <SelectValue />
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
                <SelectTrigger className="w-40">
                  <Star size={16} className="mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SortAscending size={16} className="mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Recent</SelectItem>
                  <SelectItem value="title">Name</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="probability">Probability</SelectItem>
                  <SelectItem value="expectedCloseDate">Close Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <GridFour size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {sortedOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || stageFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by creating your first opportunity'
                }
              </p>
              {!searchTerm && stageFilter === 'all' && priorityFilter === 'all' && (
                <Button onClick={handleCreateOpportunity} className="flex items-center gap-2">
                  <Plus size={16} />
                  Create First Opportunity
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Opportunity</TableHead>
                    <TableHead className="min-w-[120px]">Company</TableHead>
                    <TableHead className="min-w-[120px]">Stage</TableHead>
                    <TableHead className="min-w-[120px]">Value</TableHead>
                    <TableHead className="min-w-[100px]">Probability</TableHead>
                    <TableHead className="min-w-[120px]">Priority</TableHead>
                    <TableHead className="min-w-[120px]">Close Date</TableHead>
                    <TableHead className="min-w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOpportunities.map((opportunity) => {
                    const stageConfig = getStageConfig(opportunity.stage);
                    const priorityBadge = getPriorityBadge(opportunity.priority);
                    const company = companies.find(c => c.id === opportunity.companyId);
                    const contact = contacts.find(c => c.id === opportunity.contactId);

                    return (
                      <TableRow key={opportunity.id} className="group cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{opportunity.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
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
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building size={12} />
                              <span className="font-medium">{company?.name || 'Unknown'}</span>
                            </div>
                            {contact && (
                              <div className="text-xs text-muted-foreground">
                                {contact.firstName} {contact.lastName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={stageConfig.color} variant="secondary">
                            {stageConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(opportunity.value)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${opportunity.probability}%` }}
                              />
                            </div>
                            <span className="text-sm">{opportunity.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityBadge.variant} className={priorityBadge.className}>
                            {(opportunity.priority || 'medium').charAt(0).toUpperCase() + (opportunity.priority || 'medium').slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(opportunity.expectedCloseDate), 'MM/dd/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewOpportunity(opportunity)}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditOpportunity(opportunity)}
                            >
                              <PencilSimple size={14} />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteOpportunity(opportunity)}
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
          )}
        </CardContent>
      </Card>

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
      <DialogContent className="dialog-content max-w-6xl max-h-[95vh] p-0">
        {/* Header Section */}
        <div className="sticky top-0 bg-background border-b p-6 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back
              </Button>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {opportunity.title}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building size={16} />
                  <span>{company?.name || 'Unknown Company'}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>📊 {stageConfig.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Created {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>
              <Button onClick={onEdit} className="flex items-center gap-2">
                <PencilSimple size={16} />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="mb-2">
                    <DollarSign size={24} className="mx-auto text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatCurrency(opportunity.value)}
                  </div>
                  <div className="text-sm text-muted-foreground">Deal Value</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="mb-2">
                    <Target size={24} className="mx-auto text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {opportunity.probability}%
                  </div>
                  <div className="text-sm text-muted-foreground">Win Probability</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="mb-2">
                    <TrendingUp size={24} className={`mx-auto ${meddpicScore < 50 ? 'text-red-500' : meddpicScore < 80 ? 'text-yellow-500' : 'text-green-500'}`} />
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${meddpicScore < 50 ? 'text-red-600' : meddpicScore < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {meddpicScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">MEDDPICC Score</div>
                </CardContent>
              </Card>
              
              <Card className="bg-card border-border">
                <CardContent className="p-6 text-center">
                  <div className="mb-2">
                    <Calendar size={24} className="mx-auto text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {format(new Date(opportunity.expectedCloseDate), 'MMM dd')}
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Close</div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="peak">PEAK</TabsTrigger>
                <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Opportunity Details */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">Opportunity Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Stage</div>
                          <Badge className={`${stageConfig.color} text-primary bg-primary/10`}>
                            {stageConfig.label.toLowerCase()}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Priority</div>
                          <Badge variant="secondary" className={priorityBadge.className}>
                            {(opportunity.priority || 'medium').toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Source</div>
                          <div className="text-sm">{opportunity.leadSource || 'Not Specified'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Industry</div>
                          <div className="text-sm">{opportunity.industry || 'Not Specified'}</div>
                        </div>
                      </div>

                      {opportunity.description && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                          <p className="text-sm text-foreground">
                            {opportunity.description}
                          </p>
                        </div>
                      )}

                      {opportunity.tags && opportunity.tags.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-2">Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-muted">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Primary Contact */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">Primary Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {contact ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-muted">
                                {contact.firstName[0]}{contact.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-foreground">
                                {contact.firstName} {contact.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {contact.title || 'No title specified'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Envelope size={14} />
                              <span>{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone size={14} />
                                <span>{contact.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full">
                            View Contact Details
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="mb-4">
                            <Users size={48} className="mx-auto text-muted-foreground opacity-40" />
                          </div>
                          <div className="text-muted-foreground mb-4">
                            No primary contact assigned
                          </div>
                          <Button variant="outline" size="sm">
                            Add Contact
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* PEAK Tab */}
              <TabsContent value="peak" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">PEAK Methodology</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Progress:</span>
                        <span className="text-sm font-medium">{stageProgress}%</span>
                      </div>
                    </div>
                    <Progress value={stageProgress} className="w-full" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {PEAK_STAGES.map((stage, index) => {
                      const isCurrentStage = stage.value === opportunity.stage;
                      const isPastStage = PEAK_STAGES.findIndex(s => s.value === opportunity.stage) > index;
                      
                      return (
                        <div key={stage.value} className={`p-4 rounded-lg border ${
                          isCurrentStage ? 'border-primary bg-primary/5' : 
                          isPastStage ? 'border-green-200 bg-green-50' : 
                          'border-border bg-muted/30'
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              isCurrentStage ? 'bg-primary text-primary-foreground' :
                              isPastStage ? 'bg-green-500 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {isPastStage ? <CheckCircle size={20} /> :
                               isCurrentStage ? <ClockCounterClockwise size={20} /> :
                               <Circle size={20} />}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{stage.label}</h3>
                              <p className="text-muted-foreground mb-3">{stage.description}</p>
                              
                              {/* Stage-specific content */}
                              {stage.value === 'prospect' && (
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium">Key Activities:</span> Lead qualification, initial contact, needs assessment
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Success Criteria:</span> Qualified lead, contact established, basic needs identified
                                  </div>
                                </div>
                              )}
                              
                              {stage.value === 'engage' && (
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium">Key Activities:</span> Discovery calls, stakeholder mapping, solution presentation
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Success Criteria:</span> Requirements understood, decision makers identified, proposal requested
                                  </div>
                                </div>
                              )}
                              
                              {stage.value === 'acquire' && (
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium">Key Activities:</span> Proposal development, negotiation, contract finalization
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Success Criteria:</span> Proposal accepted, terms agreed, contract signed
                                  </div>
                                </div>
                              )}
                              
                              {stage.value === 'keep' && (
                                <div className="space-y-2">
                                  <div className="text-sm">
                                    <span className="font-medium">Key Activities:</span> Onboarding, relationship management, expansion opportunities
                                  </div>
                                  <div className="text-sm">
                                    <span className="font-medium">Success Criteria:</span> Successful implementation, satisfied customer, renewal/expansion
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* MEDDPICC Tab */}
              <TabsContent value="meddpicc" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">MEDDPICC Qualification</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className={`text-lg font-bold ${
                          meddpicScore < 50 ? 'text-red-600' : 
                          meddpicScore < 80 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>{meddpicScore}%</span>
                      </div>
                    </div>
                    <Progress value={meddpicScore} className="w-full" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Metrics */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ChartLineUp size={18} className="text-primary" />
                          <h3 className="font-semibold">Metrics</h3>
                          {opportunity.meddpicc.metrics ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">What economic impact can we measure?</p>
                        <p className="text-sm">{opportunity.meddpicc.metrics || 'Not defined'}</p>
                      </div>

                      {/* Economic Buyer */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User size={18} className="text-primary" />
                          <h3 className="font-semibold">Economic Buyer</h3>
                          {opportunity.meddpicc.economicBuyer ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Who has the economic authority?</p>
                        <p className="text-sm">{opportunity.meddpicc.economicBuyer || 'Not identified'}</p>
                      </div>

                      {/* Decision Criteria */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-primary" />
                          <h3 className="font-semibold">Decision Criteria</h3>
                          {opportunity.meddpicc.decisionCriteria ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">What criteria will they use to decide?</p>
                        <p className="text-sm">{opportunity.meddpicc.decisionCriteria || 'Not defined'}</p>
                      </div>

                      {/* Decision Process */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Target size={18} className="text-primary" />
                          <h3 className="font-semibold">Decision Process</h3>
                          {opportunity.meddpicc.decisionProcess ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">How will they make the decision?</p>
                        <p className="text-sm">{opportunity.meddpicc.decisionProcess || 'Not defined'}</p>
                      </div>

                      {/* Paper Process */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-primary" />
                          <h3 className="font-semibold">Paper Process</h3>
                          {opportunity.meddpicc.paperProcess ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">What's the approval/procurement process?</p>
                        <p className="text-sm">{opportunity.meddpicc.paperProcess || 'Not defined'}</p>
                      </div>

                      {/* Implicate Pain */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Warning size={18} className="text-primary" />
                          <h3 className="font-semibold">Implicate Pain</h3>
                          {opportunity.meddpicc.implicatePain ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">What pain are we addressing?</p>
                        <p className="text-sm">{opportunity.meddpicc.implicatePain || 'Not identified'}</p>
                      </div>

                      {/* Champion */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Trophy size={18} className="text-primary" />
                          <h3 className="font-semibold">Champion</h3>
                          {opportunity.meddpicc.champion ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <Warning size={16} className="text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Who is actively selling for us?</p>
                        <p className="text-sm">{opportunity.meddpicc.champion || 'Not identified'}</p>
                      </div>

                      {/* Competition */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-primary" />
                          <h3 className="font-semibold">Competition</h3>
                          <Warning size={16} className="text-yellow-500" />
                        </div>
                        <p className="text-sm text-muted-foreground">What competition are we facing?</p>
                        <p className="text-sm">Not tracked</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-semibold mb-3">Qualification Health</h3>
                      <div className="space-y-2">
                        {meddpicScore >= 80 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm">Excellent qualification - deal is well qualified</span>
                          </div>
                        )}
                        {meddpicScore >= 50 && meddpicScore < 80 && (
                          <div className="flex items-center gap-2 text-yellow-600">
                            <Warning size={16} />
                            <span className="text-sm">Good qualification - some areas need attention</span>
                          </div>
                        )}
                        {meddpicScore < 50 && (
                          <div className="flex items-center gap-2 text-red-600">
                            <Warning size={16} />
                            <span className="text-sm">Poor qualification - significant gaps need to be addressed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <TrendingUp size={48} className="mx-auto text-muted-foreground opacity-40" />
                      </div>
                      <div className="text-muted-foreground mb-4">
                        No activities recorded
                      </div>
                      <Button variant="outline" size="sm">
                        Add Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Deal Contacts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <Users size={48} className="mx-auto text-muted-foreground opacity-40" />
                      </div>
                      <div className="text-muted-foreground mb-4">
                        No additional contacts added
                      </div>
                      <Button variant="outline" size="sm">
                        Add Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Deal Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="mb-4">
                        <ChartBar size={48} className="mx-auto text-muted-foreground opacity-40" />
                      </div>
                      <div className="text-muted-foreground mb-4">
                        Analytics coming soon
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Bottom Actions - Hidden for cleaner look */}
        <div className="sr-only">
          <Button variant="destructive" onClick={onDelete}>
            <Trash size={14} className="mr-2" />
            Delete
          </Button>
        </div>
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