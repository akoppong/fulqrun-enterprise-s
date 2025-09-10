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
  Envelope
} from '@phosphor-icons/react';
import { OpportunityEditForm } from './OpportunityEditForm';
import { formatCurrency, getMEDDPICCScore } from '@/lib/crm-utils';
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
  
  const company = companies.find(c => c.id === opportunity.companyId);
  const contact = contacts.find(c => c.id === opportunity.contactId);
  const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dialog-content max-w-4xl max-h-[90vh]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-semibold">
            {opportunity.title}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building size={14} />
              <span>{company?.name || 'Unknown Company'}</span>
            </div>
            {contact && (
              <div className="flex items-center gap-2">
                <Users size={14} />
                <span>{contact.firstName} {contact.lastName}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(opportunity.value)}
                    </div>
                    <div className="text-sm text-muted-foreground">Deal Value</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Badge className={stageConfig.color} variant="secondary">
                      {stageConfig.label}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">PEAK Stage</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{opportunity.probability}%</div>
                    <div className="text-sm text-muted-foreground">Win Probability</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opportunity.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Expected Close Date</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(opportunity.expectedCloseDate), 'PPP')}
                    </p>
                  </div>
                  
                  {opportunity.priority && (
                    <div>
                      <Label className="text-sm font-medium">Priority</Label>
                      <div className="mt-1">
                        <Badge variant="secondary" className={getPriorityBadge(opportunity.priority).className}>
                          {opportunity.priority.charAt(0).toUpperCase() + opportunity.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {opportunity.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {contact && (
              <Card>
                <CardHeader>
                  <CardTitle>Primary Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {contact.firstName[0]}{contact.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <div className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {contact.title}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Envelope size={14} />
                          <span>{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit}>
              <PencilSimple size={14} className="mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              <Trash size={14} className="mr-2" />
              Delete
            </Button>
          </div>
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