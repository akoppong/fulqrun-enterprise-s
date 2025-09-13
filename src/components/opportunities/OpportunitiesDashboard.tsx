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
  CheckCircle
} from '@phosphor-icons/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface OpportunitiesDashboardProps {
  user: User;
  onViewChange?: (view: string, data?: any) => void;
}

export function OpportunitiesDashboard({ user, onViewChange }: OpportunitiesDashboardProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('current-quarter');

  // Initialize demo data
  useEffect(() => {
    if (opportunities.length === 0) {
      OpportunityService.initializeSampleData();
      // Trigger re-read from storage
      const stored = OpportunityService.getAllOpportunities();
      setOpportunities(stored);
    }
  }, [opportunities.length, setOpportunities]);

  // Calculate filtered opportunities based on user role and filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Role-based filtering
    if (user.role === 'rep' && opp.ownerId !== user.id) return false;
    if (user.role === 'manager' && opp.ownerId !== user.id) {
      // Check if opportunity owner reports to this manager
      const owner = allUsers.find(u => u.id === opp.ownerId);
      if (!owner || owner.managerId !== user.id) return false;
    }
    
    // Filter by region
    if (selectedRegion !== 'all') {
      const owner = allUsers.find(u => u.id === opp.ownerId);
      if (!owner || owner.territory !== selectedRegion) return false;
    }
    
    // Filter by owner
    if (selectedOwner !== 'all' && opp.ownerId !== selectedOwner) return false;
    
    // Filter by stage
    if (selectedStage !== 'all' && opp.stage !== selectedStage) return false;
    
    return true;
  });

  // Calculate metrics
  const metrics = {
    totalValue: filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0),
    totalOpportunities: filteredOpportunities.length,
    averageDealSize: filteredOpportunities.length > 0 
      ? filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0) / filteredOpportunities.length 
      : 0,
    weightedValue: filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0),
    topOpportunities: filteredOpportunities
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    upcomingCloses: filteredOpportunities
      .filter(opp => {
        const closeDate = new Date(opp.expectedCloseDate);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return closeDate <= thirtyDaysFromNow && closeDate >= now;
      })
      .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime())
      .slice(0, 5),
    staleOpportunities: filteredOpportunities
      .filter(opp => {
        const lastUpdate = new Date(opp.updatedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff > 14;
      })
      .slice(0, 5)
  };

  // Prepare chart data
  const stageData = filteredOpportunities.reduce((acc, opp) => {
    const stage = opp.stage;
    if (!acc[stage]) {
      acc[stage] = { stage, count: 0, value: 0 };
    }
    acc[stage].count++;
    acc[stage].value += opp.value;
    return acc;
  }, {} as Record<string, { stage: string; count: number; value: number }>);

  const stageChartData = Object.values(stageData);

  const meddpiccData = filteredOpportunities.map(opp => ({
    name: opp.title.substring(0, 20) + '...',
    score: getMEDDPICCScore(opp.meddpicc),
    value: opp.value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const regions = [...new Set(allUsers.map(u => u.territory).filter(Boolean))];
  const stages = ['prospect', 'engage', 'acquire', 'closed-won', 'closed-lost'];

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
        
        <Button 
          onClick={() => onViewChange?.('opportunities-list')}
          className="w-fit"
        >
          <GridFour className="w-4 h-4 mr-2" />
          View All Opportunities
        </Button>
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
                  {allUsers
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
                  const company = companies.find(c => c.id === opp.companyId);
                  const owner = allUsers.find(u => u.id === opp.ownerId);
                  
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
                        <p className="font-semibold">{formatCurrency(opp.value)}</p>
                        <p className="text-sm text-muted-foreground">{opp.probability}% probability</p>
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
                  const company = companies.find(c => c.id === opp.companyId);
                  const daysUntilClose = Math.ceil(
                    (new Date(opp.expectedCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
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
                            {new Date(opp.expectedCloseDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(opp.value)}</p>
                        <Progress value={opp.probability} className="w-20 mt-1" />
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
                  const company = companies.find(c => c.id === opp.companyId);
                  const daysSinceUpdate = Math.ceil(
                    (new Date().getTime() - new Date(opp.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
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
                        <p className="font-semibold">{formatCurrency(opp.value)}</p>
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