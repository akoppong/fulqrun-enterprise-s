import { useKV } from '@github/spark/hooks';
import { Opportunity, PEAK_STAGES, Company, Contact } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, getMEDDPICCScore } from '@/lib/crm-utils';
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
  List
} from '@phosphor-icons/react';
import { useState } from 'react';
import { OpportunityDialog } from './OpportunityDialog';
import { OpportunityDetailView } from './OpportunityDetailView';
import { toast } from 'sonner';

export function OpportunityList() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  
  // View state
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detail'>('table');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [valueRangeFilter, setValueRangeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Enhanced filtering logic
  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companies.find(c => c.id === opp.companyId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contacts.find(c => c.id === opp.contactId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contacts.find(c => c.id === opp.contactId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || opp.stage === stageFilter;
    const matchesOwner = ownerFilter === 'all' || opp.ownerId === ownerFilter;
    
    const matchesValueRange = (() => {
      switch (valueRangeFilter) {
        case 'small': return opp.value < 10000;
        case 'medium': return opp.value >= 10000 && opp.value < 100000;
        case 'large': return opp.value >= 100000 && opp.value < 1000000;
        case 'enterprise': return opp.value >= 1000000;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStage && matchesOwner && matchesValueRange;
  });

  // Sort opportunities
  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    let aVal: any, bVal: any;
    
    switch (sortBy) {
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'value':
        aVal = a.value;
        bVal = b.value;
        break;
      case 'stage':
        aVal = PEAK_STAGES.findIndex(s => s.value === a.stage);
        bVal = PEAK_STAGES.findIndex(s => s.value === b.stage);
        break;
      case 'probability':
        aVal = a.probability;
        bVal = b.probability;
        break;
      case 'expectedCloseDate':
        aVal = new Date(a.expectedCloseDate).getTime();
        bVal = new Date(b.expectedCloseDate).getTime();
        break;
      case 'meddpiccScore':
        aVal = getMEDDPICCScore(a.meddpicc);
        bVal = getMEDDPICCScore(b.meddpicc);
        break;
      default:
        aVal = new Date(a.updatedAt).getTime();
        bVal = new Date(b.updatedAt).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const handleCreateOpportunity = () => {
    setSelectedOpportunity(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsEditDialogOpen(true);
  };

  const handleViewOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsDetailViewOpen(true);
  };

  const handleDeleteOpportunity = async (opportunity: Opportunity) => {
    const confirmed = window.confirm(`Are you sure you want to delete the opportunity "${opportunity.title}"?`);
    if (confirmed) {
      setOpportunities(current => current.filter(opp => opp.id !== opportunity.id));
      toast.success('Opportunity deleted successfully');
    }
  };

  const handleSaveOpportunity = (opportunityData: Partial<Opportunity>) => {
    if (selectedOpportunity) {
      // Update existing opportunity
      setOpportunities(current => 
        current.map(opp => 
          opp.id === selectedOpportunity.id 
            ? { ...opp, ...opportunityData, updatedAt: new Date().toISOString() }
            : opp
        )
      );
      toast.success('Opportunity updated successfully');
    } else {
      // Create new opportunity
      const newOpportunity: Opportunity = {
        id: crypto.randomUUID(),
        ownerId: 'current-user', // This should come from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...opportunityData
      } as Opportunity;
      
      setOpportunities(current => [...current, newOpportunity]);
      toast.success('Opportunity created successfully');
    }
    
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const getStageConfig = (stage: string) => {
    return PEAK_STAGES.find(s => s.value === stage) || PEAK_STAGES[0];
  };

  const getMEDDPICCBadge = (score: number) => {
    if (score >= 70) return { variant: 'default' as const, label: 'Strong' };
    if (score >= 40) return { variant: 'secondary' as const, label: 'Moderate' };
    return { variant: 'destructive' as const, label: 'Weak' };
  };

  const getPipelineMetrics = () => {
    const totalValue = sortedOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const averageValue = sortedOpportunities.length > 0 ? totalValue / sortedOpportunities.length : 0;
    const stageDistribution = PEAK_STAGES.map(stage => ({
      stage: stage.label,
      count: sortedOpportunities.filter(opp => opp.stage === stage.value).length,
      value: sortedOpportunities.filter(opp => opp.stage === stage.value).reduce((sum, opp) => sum + opp.value, 0)
    }));

    return {
      totalValue,
      averageValue,
      totalOpportunities: sortedOpportunities.length,
      stageDistribution
    };
  };

  const metrics = getPipelineMetrics();

  const renderOpportunityCard = (opportunity: Opportunity) => {
    const stageConfig = getStageConfig(opportunity.stage);
    const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
    const meddpicBadge = getMEDDPICCBadge(meddpicScore);
    const company = companies.find(c => c.id === opportunity.companyId);
    const contact = contacts.find(c => c.id === opportunity.contactId);

    return (
      <Card key={opportunity.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate mb-1">
                {opportunity.title}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building size={14} />
                <span className="truncate">{company?.name || 'Unknown Company'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={stageConfig.color} variant="secondary">
                {stageConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(opportunity.value)}
              </div>
              <div className="text-sm text-muted-foreground">Deal Value</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${opportunity.probability}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{opportunity.probability}%</span>
              </div>
              <div className="text-sm text-muted-foreground">Win Probability</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-muted-foreground" />
                <span className="text-sm">
                  {safeFormatDate(opportunity.expectedCloseDate, 'No date set')}
                </span>
              </div>
            </div>
            <div>
              <Badge variant={meddpicBadge.variant} className="text-xs">
                MEDDPICC: {meddpicScore}%
              </Badge>
            </div>
          </div>

          {contact && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={14} />
              <span className="truncate">
                {contact.firstName} {contact.lastName} - {contact.title}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewOpportunity(opportunity);
                }}
              >
                <Eye size={14} className="mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditOpportunity(opportunity);
                }}
              >
                <PencilSimple size={14} className="mr-1" />
                Edit
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteOpportunity(opportunity);
              }}
            >
              <Trash size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Sales Opportunities</h2>
            <p className="text-muted-foreground">Manage and track all sales opportunities through the PEAK methodology</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleCreateOpportunity} className="flex items-center gap-2">
              <Plus size={16} />
              New Opportunity
            </Button>
          </div>
        </div>

        {/* Pipeline Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{metrics.totalOpportunities}</div>
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
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ChartBar size={20} className="text-blue-600" />
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
                  <TrendUp size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {sortedOpportunities.length > 0 
                      ? Math.round(sortedOpportunities.reduce((sum, opp) => sum + opp.probability, 0) / sortedOpportunities.length)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Probability</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search size={16} className="text-muted-foreground" />
                <Input
                  placeholder="Search opportunities, companies, contacts..."
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

              <Select value={valueRangeFilter} onValueChange={setValueRangeFilter}>
                <SelectTrigger className="w-40">
                  <DollarSign size={16} className="mr-2" />
                  <SelectValue placeholder="Value Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Values</SelectItem>
                  <SelectItem value="small">&lt; $10K</SelectItem>
                  <SelectItem value="medium">$10K - $100K</SelectItem>
                  <SelectItem value="large">$100K - $1M</SelectItem>
                  <SelectItem value="enterprise">$1M+</SelectItem>
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
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="probability">Probability</SelectItem>
                  <SelectItem value="expectedCloseDate">Close Date</SelectItem>
                  <SelectItem value="meddpiccScore">MEDDPICC Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List size={16} />
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <GridFour size={16} />
              </Button>
            </div>
          </div>
          
          {/* Active filters indicator */}
          {(searchTerm || stageFilter !== 'all' || valueRangeFilter !== 'all') && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {stageFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Stage: {PEAK_STAGES.find(s => s.value === stageFilter)?.label}
                </Badge>
              )}
              {valueRangeFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Value: {valueRangeFilter}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStageFilter('all');
                  setValueRangeFilter('all');
                }}
                className="text-xs h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {sortedOpportunities.length === 0 ? (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || stageFilter !== 'all' || valueRangeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by creating your first opportunity'
                }
              </p>
              {!searchTerm && stageFilter === 'all' && valueRangeFilter === 'all' && (
                <Button onClick={handleCreateOpportunity} className="flex items-center gap-2">
                  <Plus size={16} />
                  Create First Opportunity
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="responsive-overflow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[300px]">Opportunity</TableHead>
                        <TableHead className="min-w-[120px]">Stage</TableHead>
                        <TableHead className="min-w-[120px]">Value</TableHead>
                        <TableHead className="min-w-[120px]">Probability</TableHead>
                        <TableHead className="min-w-[130px]">MEDDPICC</TableHead>
                        <TableHead className="min-w-[120px]">Close Date</TableHead>
                        <TableHead className="min-w-[140px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedOpportunities.map((opportunity) => {
                        const stageConfig = getStageConfig(opportunity.stage);
                        const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
                        const meddpicBadge = getMEDDPICCBadge(meddpicScore);
                        const company = companies.find(c => c.id === opportunity.companyId);
                        const contact = contacts.find(c => c.id === opportunity.contactId);

                        return (
                          <TableRow key={opportunity.id} className="group">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{opportunity.title}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Building size={12} />
                                  <span>{company?.name || 'Unknown Company'}</span>
                                </div>
                                {contact && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Users size={12} />
                                    <span>{contact.firstName} {contact.lastName} - {contact.title}</span>
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
                              <Badge variant={meddpicBadge.variant}>
                                {meddpicScore}% {meddpicBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {safeFormatDate(opportunity.expectedCloseDate, 'No date set')}
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

              {/* Cards View */}
              {viewMode === 'cards' && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedOpportunities.map(renderOpportunityCard)}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <OpportunityDialog
        isOpen={isCreateDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedOpportunity(null);
        }}
        onSave={handleSaveOpportunity}
        opportunity={selectedOpportunity}
      />

      {/* Detail View Modal */}
      {selectedOpportunity && (
        <OpportunityDetailView
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