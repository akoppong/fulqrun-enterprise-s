// Comprehensive opportunities list view component
import { useState, useEffect, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { OpportunityService } from '@/lib/opportunity-service';
import { 
  Search, 
  Plus, 
  Eye, 
  PencilSimple, 
  Trash, 
  Users,
  Building,
  Calendar,
  TrendingUp,
  Target,
  SortAscending,
  SortDescending,
  Filter,
  Download,
  ChartLine
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

interface OpportunitiesListProps {
  user: User;
  onViewChange?: (view: string, data?: any) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onCreateNew?: () => void;
  opportunities?: Opportunity[]; // Optional prop to pass in opportunities data
}

type SortField = 'title' | 'value' | 'probability' | 'expectedCloseDate' | 'stage' | 'meddpiccScore';
type SortDirection = 'asc' | 'desc';

export function OpportunitiesListView({ user, onViewChange, onEdit, onCreateNew, opportunities: propOpportunities }: OpportunitiesListProps) {
  const [rawOpportunities, setRawOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [rawCompanies, setRawCompanies] = useKV<Company[]>('companies', []);
  const [rawContacts, setRawContacts] = useKV<Contact[]>('contacts', []);
  const [rawAllUsers, setRawAllUsers] = useKV<User[]>('all-users', []);
  
  // Use prop opportunities or fallback to KV store
  const opportunities = propOpportunities && Array.isArray(propOpportunities) 
    ? propOpportunities 
    : Array.isArray(rawOpportunities) ? rawOpportunities : [];
  const companies = Array.isArray(rawCompanies) ? rawCompanies : [];
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];
  const allUsers = Array.isArray(rawAllUsers) ? rawAllUsers : [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize demo data only if no prop opportunities provided
  useEffect(() => {
    if (!propOpportunities && opportunities.length === 0) {
      const initializeData = async () => {
        try {
          setIsLoading(true);
          await OpportunityService.initializeSampleData();
          const stored = await OpportunityService.getAllOpportunities();
          if (Array.isArray(stored)) {
            setRawOpportunities(stored);
          } else {
            console.error('OpportunityService returned non-array data:', stored);
            setRawOpportunities([]);
          }
        } catch (error) {
          console.error('Failed to initialize opportunity data:', error);
          setRawOpportunities([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      initializeData();
    }
  }, [propOpportunities, setRawOpportunities, opportunities.length]);

  // Filter and sort opportunities
  const filteredAndSortedOpportunities = useMemo(() => {
    // opportunities is already guaranteed to be an array due to validation above
    let filtered = opportunities.filter(opp => {
      // Role-based access control
      if (user.role === 'rep' && opp.ownerId !== user.id) return false;
      if (user.role === 'manager') {
        const owner = allUsers.find(u => u.id === opp.ownerId);
        if (opp.ownerId !== user.id && (!owner || owner.managerId !== user.id)) return false;
      }
      
      // Search filter
      if (searchTerm) {
        const company = companies.find(c => c.id === opp.companyId);
        const contact = contacts.find(c => c.id === opp.contactId);
        const searchLower = searchTerm.toLowerCase();
        
        const matches = opp.title.toLowerCase().includes(searchLower) ||
          company?.name.toLowerCase().includes(searchLower) ||
          contact?.name.toLowerCase().includes(searchLower) ||
          opp.description.toLowerCase().includes(searchLower) ||
          opp.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matches) return false;
      }
      
      // Stage filter
      if (selectedStage !== 'all' && opp.stage !== selectedStage) return false;
      
      // Owner filter
      if (selectedOwner !== 'all' && opp.ownerId !== selectedOwner) return false;
      
      // Priority filter
      if (selectedPriority !== 'all' && opp.priority !== selectedPriority) return false;
      
      return true;
    });

    // Sort opportunities
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'probability':
          aValue = a.probability;
          bValue = b.probability;
          break;
        case 'expectedCloseDate':
          aValue = new Date(a.expectedCloseDate);
          bValue = new Date(b.expectedCloseDate);
          break;
        case 'stage':
          aValue = a.stage;
          bValue = b.stage;
          break;
        case 'meddpiccScore':
          aValue = getMEDDPICCScore(a.meddpicc);
          bValue = getMEDDPICCScore(b.meddpicc);
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [opportunities, companies, contacts, allUsers, searchTerm, selectedStage, selectedOwner, selectedPriority, sortField, sortDirection, user]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOpportunities.length / itemsPerPage);
  const paginatedOpportunities = filteredAndSortedOpportunities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await OpportunityService.deleteOpportunity(id);
      if (success) {
        setRawOpportunities(opportunities.filter(opp => opp.id !== id));
        toast.success('Opportunity deleted successfully');
      } else {
        toast.error('Failed to delete opportunity');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Failed to delete opportunity');
    }
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'prospect': 'bg-yellow-100 text-yellow-800',
      'engage': 'bg-blue-100 text-blue-800',
      'acquire': 'bg-purple-100 text-purple-800',
      'closed-won': 'bg-green-100 text-green-800',
      'closed-lost': 'bg-red-100 text-red-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'medium': 'bg-yellow-100 text-yellow-600',
      'high': 'bg-orange-100 text-orange-600',
      'critical': 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const stages = ['prospect', 'engage', 'acquire', 'closed-won', 'closed-lost'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const availableOwners = allUsers.filter(u => 
    user.role === 'admin' || user.role === 'executive' || 
    (user.role === 'manager' && (u.managerId === user.id || u.id === user.id)) ||
    u.id === user.id
  );

  // Calculate summary metrics
  const summaryMetrics = {
    totalValue: filteredAndSortedOpportunities.reduce((sum, opp) => sum + opp.value, 0),
    weightedValue: filteredAndSortedOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0),
    averageMEDDPICC: filteredAndSortedOpportunities.length > 0 
      ? filteredAndSortedOpportunities.reduce((sum, opp) => sum + getMEDDPICCScore(opp.meddpicc), 0) / filteredAndSortedOpportunities.length
      : 0,
    totalOpportunities: filteredAndSortedOpportunities.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Manage and track your sales opportunities
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onViewChange?.('opportunities-dashboard')}
            variant="outline"
          >
            <ChartLine className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Opportunity
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading opportunities...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Loaded */}
      {!isLoading && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-xl font-bold">{formatCurrency(summaryMetrics.totalValue)}</p>
              </div>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weighted Pipeline</p>
                <p className="text-xl font-bold">{formatCurrency(summaryMetrics.weightedValue)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg MEDDPICC</p>
                <p className="text-xl font-bold">{summaryMetrics.averageMEDDPICC.toFixed(0)}%</p>
              </div>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-xl font-bold">{summaryMetrics.totalOpportunities}</p>
              </div>
              <Building className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger>
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owners</SelectItem>
                {availableOwners.map(owner => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedOpportunities.length)} of{' '}
              {filteredAndSortedOpportunities.length} opportunities
            </p>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              >
                <Filter className="w-4 h-4 mr-2" />
                {viewMode === 'table' ? 'Card View' : 'Table View'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardContent className="p-0">
          <div className="opportunities-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 col-opportunity-details"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      Opportunity
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <SortAscending className="w-4 h-4" /> : <SortDescending className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="col-company-contact">Company & Contact</TableHead>
                  <TableHead className="col-stage-progress">Stage & Progress</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 col-deal-value"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center gap-2">
                      Value
                      {sortField === 'value' && (
                        sortDirection === 'asc' ? <SortAscending className="w-4 h-4" /> : <SortDescending className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 col-win-probability"
                    onClick={() => handleSort('probability')}
                  >
                    <div className="flex items-center gap-2">
                      Win Probability
                      {sortField === 'probability' && (
                        sortDirection === 'asc' ? <SortAscending className="w-4 h-4" /> : <SortDescending className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="col-priority">Priority</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 col-timeline"
                    onClick={() => handleSort('expectedCloseDate')}
                  >
                    <div className="flex items-center gap-2">
                      Close Date
                      {sortField === 'expectedCloseDate' && (
                        sortDirection === 'asc' ? <SortAscending className="w-4 h-4" /> : <SortDescending className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="col-actions">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOpportunities.map((opportunity) => {
                  const company = companies.find(c => c.id === opportunity.companyId);
                  const contact = contacts.find(c => c.id === opportunity.contactId);
                  const owner = allUsers.find(u => u.id === opportunity.ownerId);
                  const meddpiccScore = getMEDDPICCScore(opportunity.meddpicc);
                  const stageProgress = getStageProgress(opportunity.stage);
                  const daysUntilClose = differenceInDays(new Date(opportunity.expectedCloseDate), new Date());

                  return (
                    <TableRow 
                      key={opportunity.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewChange?.('opportunity-detail', { opportunityId: opportunity.id })}
                    >
                      <TableCell className="col-opportunity-details">
                        <div className="cell-content">
                          <div className="font-medium text-sm mb-1 truncate-content">
                            {opportunity.title}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={owner?.avatar} />
                              <AvatarFallback className="text-xs">
                                {owner?.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate-content">
                              {owner?.name || 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="col-company-contact">
                        <div className="cell-content">
                          <div className="flex items-center gap-1 text-sm mb-1">
                            <Building className="w-3 h-3" />
                            <span className="truncate-content">
                              {company?.name || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span className="truncate-content">
                              {contact?.name || 'No contact'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="col-stage-progress">
                        <div className="cell-content space-y-2">
                          <Badge className={getStageColor(opportunity.stage)}>
                            {opportunity.stage}
                          </Badge>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>MEDDPICC</span>
                              <span>{meddpiccScore}%</span>
                            </div>
                            <Progress value={meddpiccScore} className="h-1" />
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="col-deal-value">
                        <div className="cell-content">
                          <div className="font-medium text-sm">
                            {formatCurrency(opportunity.value)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Weighted: {formatCurrency(opportunity.value * opportunity.probability / 100)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="col-win-probability">
                        <div className="cell-content space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Probability</span>
                            <span className="font-medium">{opportunity.probability}%</span>
                          </div>
                          <Progress value={opportunity.probability} className="h-2" />
                        </div>
                      </TableCell>
                      
                      <TableCell className="col-priority">
                        <Badge className={getPriorityColor(opportunity.priority)}>
                          {opportunity.priority || 'medium'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="col-timeline">
                        <div className="cell-content">
                          <div className="text-sm">
                            {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                          </div>
                          <div className={`text-xs ${daysUntilClose < 0 ? 'text-red-600' : daysUntilClose <= 7 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                            {daysUntilClose < 0 ? `${Math.abs(daysUntilClose)} days overdue` : `${daysUntilClose} days left`}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="col-actions">
                        <div className="cell-content flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewChange?.('opportunity-detail', { opportunityId: opportunity.id });
                            }}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(opportunity);
                            }}
                          >
                            <PencilSimple className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this opportunity?')) {
                                handleDelete(opportunity.id);
                              }
                            }}
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}