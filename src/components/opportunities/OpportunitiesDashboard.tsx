import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User, PipelineMetrics } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { OpportunityService } from '@/lib/opportunity-service';
import { 
  Target, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Building,
  GridFour,
  ChartLine,
  Warning,
  CheckCircle,
  Plus
} from '@phosphor-icons/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface OpportunitiesDashboardProps {
  user: User;
  onViewChange?: (view: string, data?: any) => void;
  opportunities?: Opportunity[]; // Optional prop to pass in opportunities data
}

export function OpportunitiesDashboard({ user, onViewChange, opportunities: propOpportunities }: OpportunitiesDashboardProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [rawCompanies, setRawCompanies] = useKV<Company[]>('companies', []);
  const [rawContacts, setRawContacts] = useKV<Contact[]>('contacts', []);
  const [rawAllUsers, setRawAllUsers] = useKV<User[]>('all-users', []);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure all data is always arrays with validation
  const companies = Array.isArray(rawCompanies) ? rawCompanies : [];
  const contacts = Array.isArray(rawContacts) ? rawContacts : [];
  const allUsers = Array.isArray(rawAllUsers) ? rawAllUsers : [];
  
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('current-quarter');

  // Function to refresh opportunities data
  const refreshOpportunities = async () => {
    try {
      const fresh = await OpportunityService.getAllOpportunities();
      console.log('OpportunitiesDashboard: Refreshed opportunities:', {
        type: typeof fresh,
        isArray: Array.isArray(fresh),
        length: Array.isArray(fresh) ? fresh.length : 'N/A'
      });
      if (Array.isArray(fresh)) {
        setOpportunities(fresh);
      } else {
        console.error('Refresh returned non-array data:', fresh);
        setOpportunities([]);
      }
    } catch (error) {
      console.error('Failed to refresh opportunities:', error);
    }
  };

  // Initialize demo data or use prop data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // If opportunities are provided as props, use them
        if (propOpportunities && Array.isArray(propOpportunities)) {
          console.log('OpportunitiesDashboard: Using prop opportunities:', propOpportunities.length);
          setOpportunities(propOpportunities);
          setIsLoading(false);
          return;
        }
        
        console.log('OpportunitiesDashboard: Initializing opportunity data...');
        
        // Clear any corrupted data and force fresh initialization
        try {
          const currentData = localStorage.getItem('opportunities');
          if (currentData) {
            const parsed = JSON.parse(currentData);
            if (!Array.isArray(parsed)) {
              console.warn('Clearing corrupted opportunities data:', typeof parsed);
              localStorage.removeItem('opportunities');
            }
          }
        } catch (error) {
          console.warn('Clearing corrupted localStorage:', error);
          localStorage.removeItem('opportunities');
        }
        
        // Always get fresh data from service
        const stored = await OpportunityService.getAllOpportunities();
        
        console.log('OpportunitiesDashboard: Received data from service:', {
          type: typeof stored,
          isArray: Array.isArray(stored),
          length: Array.isArray(stored) ? stored.length : 'N/A',
          firstItem: Array.isArray(stored) && stored.length > 0 ? stored[0]?.id : null
        });
        
        // Validate and ensure we have an array
        if (Array.isArray(stored)) {
          setOpportunities(stored);
          console.log('OpportunitiesDashboard: Successfully set opportunities array with', stored.length, 'items');
        } else {
          console.error('OpportunitiesDashboard: Service returned non-array data, setting empty array');
          setOpportunities([]);
        }
      } catch (error) {
        console.error('OpportunitiesDashboard: Failed to initialize opportunity data:', error);
        // Set empty array as fallback
        setOpportunities([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [propOpportunities]); // Re-run when prop opportunities change

  // Ensure all data arrays are safe and handle any non-array values
  const safeOpportunities = (() => {
    try {
      console.log('OpportunitiesDashboard: Processing opportunities data:', {
        type: typeof opportunities,
        isArray: Array.isArray(opportunities),
        length: Array.isArray(opportunities) ? opportunities.length : 'N/A',
        keys: typeof opportunities === 'object' && opportunities !== null ? Object.keys(opportunities) : 'N/A'
      });
      
      // Ensure we always return an array, no matter what
      if (Array.isArray(opportunities)) {
        const filtered = opportunities.filter(opp => {
          try {
            return opp && typeof opp === 'object' && (opp.id || opp._id);
          } catch (error) {
            console.warn('Error filtering opportunity:', error);
            return false;
          }
        });
        console.log('OpportunitiesDashboard: Filtered opportunities:', filtered.length, 'valid items from', opportunities.length, 'total');
        return filtered;
      } 
      
      // Handle various object structures that might contain array data
      if (opportunities && typeof opportunities === 'object') {
        // Check for data property (common in API responses)
        if (Array.isArray(opportunities.data)) {
          const filtered = opportunities.data.filter(opp => opp && typeof opp === 'object' && (opp.id || opp._id));
          console.log('OpportunitiesDashboard: Extracted from .data property:', filtered.length, 'valid items');
          return filtered;
        }
        
        // Check for items property (another common pattern)
        if (Array.isArray(opportunities.items)) {
          const filtered = opportunities.items.filter(opp => opp && typeof opp === 'object' && (opp.id || opp._id));
          console.log('OpportunitiesDashboard: Extracted from .items property:', filtered.length, 'valid items');
          return filtered;
        }
        
        // Check for results property
        if (Array.isArray(opportunities.results)) {
          const filtered = opportunities.results.filter(opp => opp && typeof opp === 'object' && (opp.id || opp._id));
          console.log('OpportunitiesDashboard: Extracted from .results property:', filtered.length, 'valid items');
          return filtered;
        }
        
        // Handle case where it's a single opportunity object
        if (opportunities.id || opportunities._id) {
          console.log('OpportunitiesDashboard: Converting single opportunity to array');
          return [opportunities];
        }
      }
      
      // Handle null or undefined cases
      if (opportunities === null || opportunities === undefined) {
        console.log('OpportunitiesDashboard: Null/undefined opportunities, returning empty array');
        return [];
      }
      
      console.warn('OpportunitiesDashboard: Unhandled opportunities data structure:', {
        type: typeof opportunities,
        value: opportunities,
        constructor: opportunities?.constructor?.name
      });
      return [];
    } catch (error) {
      console.error('OpportunitiesDashboard: Error processing opportunities data:', error);
      return [];
    }
  })();
  
  const safeCompanies = companies;
  const safeContacts = contacts;
  const safeAllUsers = allUsers;

  // Calculate filtered opportunities based on user role and filters
  const filteredOpportunities = (() => {
    try {
      // Ensure we start with a valid array - multiple levels of validation
      if (!Array.isArray(safeOpportunities)) {
        console.error('safeOpportunities is not an array:', typeof safeOpportunities);
        return [];
      }

      if (safeOpportunities.length === 0) {
        console.log('OpportunitiesDashboard: No opportunities available for filtering');
        return [];
      }

      const filtered = safeOpportunities.filter(opp => {
        try {
          // Ensure opportunity has required fields
          if (!opp || typeof opp !== 'object') {
            console.warn('Invalid opportunity object:', opp);
            return false;
          }
          
          // Ensure basic required fields exist
          if (!opp.id && !opp._id) {
            console.warn('Opportunity missing ID:', opp);
            return false;
          }
          
          // Role-based filtering with safe defaults
          const ownerId = opp.ownerId || opp.assignedTo || opp.owner?.id;
          if (user.role === 'rep' && ownerId !== user.id) return false;
          
          if (user.role === 'manager' && ownerId !== user.id) {
            // Check if opportunity owner reports to this manager
            const owner = safeAllUsers.find(u => u.id === ownerId);
            if (!owner || owner.managerId !== user.id) return false;
          }
          
          // Filter by region with safe access
          if (selectedRegion !== 'all') {
            const owner = safeAllUsers.find(u => u.id === ownerId);
            if (!owner || owner.territory !== selectedRegion) return false;
          }
          
          // Filter by owner
          if (selectedOwner !== 'all' && ownerId !== selectedOwner) return false;
          
          // Filter by stage
          if (selectedStage !== 'all' && opp.stage !== selectedStage) return false;
          
          return true;
        } catch (error) {
          console.warn('Error filtering opportunity:', opp?.id || opp?._id, error);
          return false;
        }
      });

      console.log('OpportunitiesDashboard: Successfully filtered', filtered.length, 'opportunities from', safeOpportunities.length, 'total');
      return filtered;
    } catch (error) {
      console.error('OpportunitiesDashboard: Critical error in filteredOpportunities:', error);
      return [];
    }
  })();

  // Calculate metrics with safe array handling
  const metrics = (() => {
    try {
      // Ensure we have a valid array for metrics calculation
      const validOpportunities = Array.isArray(filteredOpportunities) ? filteredOpportunities : [];
      
      if (validOpportunities.length === 0) {
        return {
          totalValue: 0,
          totalOpportunities: 0,
          averageDealSize: 0,
          weightedValue: 0,
          topOpportunities: [],
          upcomingCloses: [],
          staleOpportunities: []
        };
      }

      const totalValue = validOpportunities.reduce((sum, opp) => {
        const value = Number(opp.value) || 0;
        return sum + value;
      }, 0);

      const weightedValue = validOpportunities.reduce((sum, opp) => {
        const value = Number(opp.value) || 0;
        const probability = Number(opp.probability) || 0;
        return sum + (value * probability / 100);
      }, 0);

      const topOpportunities = [...validOpportunities]
        .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
        .slice(0, 5);

      const upcomingCloses = validOpportunities
        .filter(opp => {
          try {
            if (!opp.expectedCloseDate) return false;
            const closeDate = new Date(opp.expectedCloseDate);
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            return closeDate <= thirtyDaysFromNow && closeDate >= now;
          } catch (error) {
            console.warn('Error parsing close date for opportunity:', opp.id, error);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            return new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime();
          } catch (error) {
            return 0;
          }
        })
        .slice(0, 5);

      const staleOpportunities = validOpportunities
        .filter(opp => {
          try {
            if (!opp.updatedAt) return false;
            const lastUpdate = new Date(opp.updatedAt);
            const now = new Date();
            const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff > 14;
          } catch (error) {
            console.warn('Error parsing update date for opportunity:', opp.id, error);
            return false;
          }
        })
        .slice(0, 5);

      return {
        totalValue,
        totalOpportunities: validOpportunities.length,
        averageDealSize: validOpportunities.length > 0 ? totalValue / validOpportunities.length : 0,
        weightedValue,
        topOpportunities,
        upcomingCloses,
        staleOpportunities
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return {
        totalValue: 0,
        totalOpportunities: 0,
        averageDealSize: 0,
        weightedValue: 0,
        topOpportunities: [],
        upcomingCloses: [],
        staleOpportunities: []
      };
    }
  })();

  // Prepare chart data with safe array handling
  const stageData = (() => {
    try {
      const validOpportunities = Array.isArray(filteredOpportunities) ? filteredOpportunities : [];
      
      return validOpportunities.reduce((acc, opp) => {
        try {
          const stage = opp.stage || 'unknown';
          if (!acc[stage]) {
            acc[stage] = { stage, count: 0, value: 0 };
          }
          acc[stage].count++;
          acc[stage].value += Number(opp.value) || 0;
          return acc;
        } catch (error) {
          console.warn('Error processing opportunity for stage data:', opp?.id, error);
          return acc;
        }
      }, {} as Record<string, { stage: string; count: number; value: number }>);
    } catch (error) {
      console.error('Error preparing stage data:', error);
      return {};
    }
  })();

  const stageChartData = Object.values(stageData);

  const meddpiccData = (() => {
    try {
      const validOpportunities = Array.isArray(filteredOpportunities) ? filteredOpportunities : [];
      
      return validOpportunities.map(opp => {
        try {
          return {
            name: ((opp.title || opp.name || 'Untitled').substring(0, 20)) + '...',
            score: opp.meddpicc ? getMEDDPICCScore(opp.meddpicc) : 0,
            value: Number(opp.value) || 0
          };
        } catch (error) {
          console.warn('Error processing opportunity for MEDDPICC data:', opp?.id, error);
          return {
            name: 'Error',
            score: 0,
            value: 0
          };
        }
      }).filter(item => item.score > 0 || item.value > 0); // Only include meaningful data
    } catch (error) {
      console.error('Error preparing MEDDPICC data:', error);
      return [];
    }
  })();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const regions = [...new Set(safeAllUsers.map(u => u.territory).filter(Boolean))];
  const stages = ['prospect', 'engage', 'acquire', 'closed-won', 'closed-lost'];

  // Show loading state while data is being initialized
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Opportunities Dashboard</h1>
            <p className="text-muted-foreground">Loading your sales pipeline and opportunities...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive view of your sales pipeline and opportunities
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onViewChange?.('create')}
            className="w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Opportunity
          </Button>
          
          <Button 
            onClick={() => onViewChange?.('opportunities-list')}
            variant="outline"
            className="w-fit"
          >
            <GridFour className="w-4 h-4 mr-2" />
            View All Opportunities
          </Button>
          
          <Button 
            onClick={refreshOpportunities}
            variant="outline"
            className="w-fit"
            disabled={isLoading}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Owner</label>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {safeAllUsers
                    .filter(u => user.role === 'admin' || user.role === 'executive' || 
                      (user.role === 'manager' && u.managerId === user.id) || 
                      u.id === user.id)
                    .map(owner => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Stage</label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="next-quarter">Next Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weighted Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.weightedValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Deal Size</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.averageDealSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{metrics.totalOpportunities}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'value' ? formatCurrency(value as number) : value,
                    name === 'value' ? 'Pipeline Value' : 'Opportunity Count'
                  ]}
                />
                <Bar dataKey="count" fill="#8884d8" name="count" />
                <Bar dataKey="value" fill="#82ca9d" name="value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MEDDPICC Scores */}
        <Card>
          <CardHeader>
            <CardTitle>MEDDPICC Qualification Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={meddpiccData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, score }) => `${name}: ${score}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="score"
                >
                  {meddpiccData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'MEDDPICC Score']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Tabs defaultValue="top-deals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="top-deals">Top Opportunities</TabsTrigger>
          <TabsTrigger value="upcoming-closes">Upcoming Closes</TabsTrigger>
          <TabsTrigger value="stale-deals">Needs Attention</TabsTrigger>
        </TabsList>
        
        <TabsContent value="top-deals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Largest Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topOpportunities.map((opp) => {
                  const company = safeCompanies.find(c => c.id === opp.companyId);
                  const owner = safeAllUsers.find(u => u.id === opp.ownerId);
                  
                  return (
                    <div 
                      key={opp.id} 
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewChange?.('opportunity-detail', { opportunityId: opp.id })}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{opp.title}</h4>
                          <Badge variant="outline">{opp.stage}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {company?.name || 'Unknown Company'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {owner?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(opp.value || 0)}</p>
                        <p className="text-sm text-muted-foreground">{opp.probability || 0}% probability</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming-closes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Closing This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.upcomingCloses.map((opp) => {
                  const company = safeCompanies.find(c => c.id === opp.companyId);
                  let daysUntilClose = 0;
                  
                  try {
                    daysUntilClose = Math.ceil(
                      (new Date(opp.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                  } catch (error) {
                    console.warn('Error calculating days until close for opportunity:', opp.id, error);
                  }
                  
                  return (
                    <div 
                      key={opp.id} 
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewChange?.('opportunity-detail', { opportunityId: opp.id })}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{opp.title}</h4>
                          <Badge 
                            variant={daysUntilClose <= 7 ? "destructive" : "default"}
                          >
                            {daysUntilClose <= 0 ? 'Overdue' : `${daysUntilClose} days`}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {company?.name || 'Unknown Company'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toLocaleDateString() : 'No date set'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(opp.value || 0)}</p>
                        <Progress value={opp.probability || 0} className="w-20 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stale-deals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.staleOpportunities.map((opp) => {
                  const company = safeCompanies.find(c => c.id === opp.companyId);
                  let daysSinceUpdate = 0;
                  
                  try {
                    daysSinceUpdate = Math.ceil(
                      (new Date().getTime() - new Date(opp.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                    );
                  } catch (error) {
                    console.warn('Error calculating days since update for opportunity:', opp.id, error);
                  }
                  
                  return (
                    <div 
                      key={opp.id} 
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => onViewChange?.('opportunity-detail', { opportunityId: opp.id })}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Warning className="w-4 h-4 text-orange-500" />
                          <h4 className="font-medium">{opp.title}</h4>
                          <Badge variant="secondary">{opp.stage}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {company?.name || 'Unknown Company'}
                          </span>
                          <span className="text-orange-600">
                            No activity for {daysSinceUpdate} days
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(opp.value || 0)}</p>
                        <Button size="sm" variant="outline" className="mt-1">
                          Update
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}