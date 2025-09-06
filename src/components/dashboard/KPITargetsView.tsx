import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  LineChart,
  Activity,
  Award,
  Flag,
  Settings,
  Bell,
  Eye,
  Lightbulb,
  Timer,
  Users,
  DollarSign
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { KPITarget, GoalTrackingEntry, KPIAnalytics, User, Opportunity } from '@/lib/types';
import { 
  calculateKPIProgress, 
  determineKPIStatus, 
  calculateRevenueKPI, 
  calculateConversionRate, 
  calculateAverageDealSize, 
  calculateAverageSalesCycle, 
  generateKPIInsights, 
  generateRecommendations, 
  formatKPIValue 
} from '@/lib/kpi-utils';
import { toast } from 'sonner';

interface KPITargetsViewProps {
  opportunities: Opportunity[];
  currentUser: User;
}

export function KPITargetsView({ opportunities, currentUser }: KPITargetsViewProps) {
  const [kpiTargets, setKpiTargets] = useKV<KPITarget[]>('kpi-targets', []);
  const [trackingEntries, setTrackingEntries] = useKV<GoalTrackingEntry[]>('goal-tracking-entries', []);
  const [kpiAnalytics, setKpiAnalytics] = useKV<KPIAnalytics[]>('kpi-analytics', []);
  const [selectedKPI, setSelectedKPI] = useState<KPITarget | null>(null);
  const [newKPIDialog, setNewKPIDialog] = useState(false);
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Initialize demo data
  useEffect(() => {
    if (kpiTargets.length === 0) {
      const demoKPIs: KPITarget[] = [
        {
          id: '1',
          name: 'Monthly Revenue Target',
          description: 'Total revenue generated from closed opportunities each month',
          type: 'revenue',
          category: 'financial',
          targetValue: 500000,
          currentValue: 325000,
          unit: '$',
          period: 'monthly',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          ownerId: currentUser.id,
          priority: 'critical',
          status: 'in_progress',
          automationRules: [],
          milestones: [
            {
              id: '1',
              name: '25% Target',
              targetValue: 125000,
              targetDate: new Date('2024-01-08'),
              achieved: true,
              achievedDate: new Date('2024-01-07')
            },
            {
              id: '2',
              name: '50% Target',
              targetValue: 250000,
              targetDate: new Date('2024-01-15'),
              achieved: true,
              achievedDate: new Date('2024-01-14')
            },
            {
              id: '3',
              name: '75% Target',
              targetValue: 375000,
              targetDate: new Date('2024-01-23'),
              achieved: false
            }
          ],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          lastCalculated: new Date()
        },
        {
          id: '2',
          name: 'Conversion Rate',
          description: 'Percentage of prospects that convert to closed deals',
          type: 'conversion',
          category: 'sales',
          targetValue: 25,
          currentValue: 22.5,
          unit: '%',
          period: 'monthly',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          ownerId: currentUser.id,
          priority: 'high',
          status: 'at_risk',
          automationRules: [],
          milestones: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          lastCalculated: new Date()
        },
        {
          id: '3',
          name: 'Average Deal Size',
          description: 'Mean value of closed deals',
          type: 'revenue',
          category: 'sales',
          targetValue: 75000,
          currentValue: 82500,
          unit: '$',
          period: 'monthly',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          ownerId: currentUser.id,
          priority: 'medium',
          status: 'exceeded',
          automationRules: [],
          milestones: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          lastCalculated: new Date()
        },
        {
          id: '4',
          name: 'Sales Cycle Time',
          description: 'Average days from prospect to closed deal',
          type: 'time',
          category: 'operational',
          targetValue: 45,
          currentValue: 38,
          unit: 'days',
          period: 'monthly',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          ownerId: currentUser.id,
          priority: 'medium',
          status: 'exceeded',
          automationRules: [],
          milestones: [],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
          lastCalculated: new Date()
        }
      ];
      setKpiTargets(demoKPIs);
    }
  }, [kpiTargets, currentUser.id, setKpiTargets]);

  // Auto-update KPIs based on opportunity data
  useEffect(() => {
    const updateKPIValues = () => {
      setKpiTargets(prevKPIs => prevKPIs.map(kpi => {
        let newCurrentValue = kpi.currentValue;

        switch (kpi.name) {
          case 'Monthly Revenue Target':
            newCurrentValue = calculateRevenueKPI(opportunities, 'monthly');
            break;
          case 'Conversion Rate':
            newCurrentValue = calculateConversionRate(opportunities, 'monthly');
            break;
          case 'Average Deal Size':
            newCurrentValue = calculateAverageDealSize(opportunities, 'monthly');
            break;
          case 'Sales Cycle Time':
            newCurrentValue = calculateAverageSalesCycle(opportunities, 'monthly');
            break;
        }

        // Update status based on progress and timing
        const newStatus = determineKPIStatus({ ...kpi, currentValue: newCurrentValue });

        return {
          ...kpi,
          currentValue: newCurrentValue,
          status: newStatus,
          lastCalculated: new Date()
        };
      }));
    };

    updateKPIValues();
    const interval = setInterval(updateKPIValues, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [opportunities, setKpiTargets]);

  const formatValue = (value: number, unit: string) => {
    return formatKPIValue(value, unit);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-green-100 text-green-800';
      case 'achieved': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <Award size={16} className="text-green-600" />;
      case 'achieved': return <CheckCircle size={16} className="text-blue-600" />;
      case 'in_progress': return <Clock size={16} className="text-yellow-600" />;
      case 'at_risk': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Target size={16} className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgress = (kpi: KPITarget) => {
    return calculateKPIProgress(kpi);
  };

  const addKPITarget = (kpiData: Omit<KPITarget, 'id' | 'createdAt' | 'updatedAt' | 'currentValue' | 'status' | 'lastCalculated'>) => {
    const newKPI: KPITarget = {
      ...kpiData,
      id: Date.now().toString(),
      currentValue: 0,
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setKpiTargets(prev => [...prev, newKPI]);
    setNewKPIDialog(false);
    toast.success('KPI target created successfully');
  };

  const addTrackingEntry = (kpiId: string, value: number, notes?: string) => {
    const entry: GoalTrackingEntry = {
      id: Date.now().toString(),
      kpiId,
      value,
      timestamp: new Date(),
      source: 'manual',
      metadata: {},
      notes,
      updatedBy: currentUser.id
    };
    setTrackingEntries(prev => [...prev, entry]);
    
    // Update KPI current value
    setKpiTargets(prev => prev.map(kpi => 
      kpi.id === kpiId 
        ? { ...kpi, currentValue: value, updatedAt: new Date() }
        : kpi
    ));
    
    setTrackingDialog(false);
    toast.success('Goal progress updated');
  };

  const filteredKPIs = kpiTargets.filter(kpi => 
    selectedCategory === 'all' || kpi.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            KPI Targets & Goal Tracking
          </h2>
          <p className="text-muted-foreground">
            Set targets, track progress, and achieve your financial and operational goals
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={newKPIDialog} onOpenChange={setNewKPIDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New KPI Target
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New KPI Target</DialogTitle>
                <DialogDescription>
                  Define a new key performance indicator with specific targets and tracking
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addKPITarget({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  type: formData.get('type') as any,
                  category: formData.get('category') as any,
                  targetValue: parseFloat(formData.get('targetValue') as string),
                  unit: formData.get('unit') as string,
                  period: formData.get('period') as any,
                  startDate: new Date(formData.get('startDate') as string),
                  endDate: new Date(formData.get('endDate') as string),
                  ownerId: currentUser.id,
                  priority: formData.get('priority') as any,
                  automationRules: [],
                  milestones: []
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">KPI Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="conversion">Conversion</SelectItem>
                        <SelectItem value="volume">Volume</SelectItem>
                        <SelectItem value="time">Time</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select name="period" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input id="targetValue" name="targetValue" type="number" step="0.01" required />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select name="unit" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ (Currency)</SelectItem>
                        <SelectItem value="%">% (Percentage)</SelectItem>
                        <SelectItem value="deals"># (Number)</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <div className="w-full">
                      <Label>Period Dates</Label>
                      <div className="flex gap-2">
                        <Input name="startDate" type="date" required />
                        <Input name="endDate" type="date" required />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setNewKPIDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create KPI Target</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredKPIs.slice(0, 4).map((kpi) => (
          <Card key={kpi.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedKPI(kpi)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium line-clamp-1">{kpi.name}</CardTitle>
              {getStatusIcon(kpi.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {formatValue(kpi.currentValue, kpi.unit)}
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Target: {formatValue(kpi.targetValue, kpi.unit)}
              </div>
              <Progress value={getProgress(kpi)} className="h-1 mb-2" />
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(kpi.status)} variant="outline">
                  {kpi.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(kpi.priority)} variant="outline">
                  {kpi.priority}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracking">Progress Tracking</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                All KPI Targets
              </CardTitle>
              <CardDescription>
                Comprehensive view of all your key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current / Target</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKPIs.map((kpi) => (
                    <TableRow key={kpi.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{kpi.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {kpi.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {kpi.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-semibold">{formatValue(kpi.currentValue, kpi.unit)}</div>
                          <div className="text-muted-foreground">/ {formatValue(kpi.targetValue, kpi.unit)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={getProgress(kpi)} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {getProgress(kpi).toFixed(1)}% complete
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(kpi.priority)} variant="outline">
                          {kpi.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(kpi.status)} variant="outline">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(kpi.status)}
                            {kpi.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedKPI(kpi);
                              setTrackingDialog(true);
                            }}
                          >
                            <Activity className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Progress Tracking</h3>
              <p className="text-muted-foreground">Update and monitor KPI progress manually or automatically</p>
            </div>
            <Button 
              onClick={() => setTrackingDialog(true)}
              disabled={!selectedKPI}
            >
              <Plus className="mr-2 h-4 w-4" />
              Update Progress
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Recent Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trackingEntries
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5)
                    .map((entry) => {
                      const kpi = kpiTargets.find(k => k.id === entry.kpiId);
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <div className="font-medium text-sm">{kpi?.name || 'Unknown KPI'}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">
                              {formatValue(entry.value, kpi?.unit || '')}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {entry.source}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Automated Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Revenue tracking active</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Auto</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Conversion rate sync</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Auto</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Daily alerts enabled</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manual Progress Update Dialog */}
          <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update KPI Progress</DialogTitle>
                <DialogDescription>
                  Manually update the current value for {selectedKPI?.name}
                </DialogDescription>
              </DialogHeader>
              {selectedKPI && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addTrackingEntry(
                    selectedKPI.id,
                    parseFloat(formData.get('value') as string),
                    formData.get('notes') as string || undefined
                  );
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="current-value">Current Value ({selectedKPI.unit})</Label>
                    <Input 
                      id="current-value"
                      name="value"
                      type="number" 
                      step="0.01"
                      defaultValue={selectedKPI.currentValue}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea id="notes" name="notes" placeholder="Add any relevant notes..." />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setTrackingDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Progress</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                KPI Milestones
              </CardTitle>
              <CardDescription>
                Track important milestones and achievements across your KPIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpiTargets.filter(kpi => kpi.milestones.length > 0).map((kpi) => (
                  <div key={kpi.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{kpi.name}</span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {kpi.milestones.map((milestone) => (
                        <div 
                          key={milestone.id} 
                          className={`p-3 rounded border-l-4 ${
                            milestone.achieved 
                              ? 'border-l-green-500 bg-green-50' 
                              : 'border-l-gray-300 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{milestone.name}</span>
                            {milestone.achieved ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <Clock size={16} className="text-gray-400" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Target: {formatValue(milestone.targetValue, kpi.unit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {milestone.achieved 
                              ? `Achieved: ${milestone.achievedDate?.toLocaleDateString()}`
                              : `Due: ${milestone.targetDate.toLocaleDateString()}`
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredKPIs.map((kpi) => {
                    const progress = getProgress(kpi);
                    const trend = progress >= 75 ? 'up' : progress >= 50 ? 'stable' : 'down';
                    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'stable' ? 'text-yellow-600' : 'text-red-600';
                    
                    return (
                      <div key={kpi.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{kpi.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {progress.toFixed(1)}% to target
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 ${trendColor}`}>
                          {trend === 'up' ? <TrendingUp size={16} /> : 
                           trend === 'stable' ? <Activity size={16} /> : 
                           <TrendingDown size={16} />}
                          <span className="text-sm font-medium">
                            {trend === 'up' ? 'On track' : trend === 'stable' ? 'Steady' : 'Behind'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredKPIs.slice(0, 3).map((kpi) => {
                    const insights = generateKPIInsights(kpi, trackingEntries);
                    const recommendations = generateRecommendations(kpi, opportunities);
                    
                    return (
                      <div key={kpi.id} className="space-y-2">
                        {insights.slice(0, 1).map((insight, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-blue-900">{kpi.name}</div>
                                <div className="text-xs text-blue-700">
                                  {insight.replace(/[🎉🎯📈⚠️🚨📉🔥⏰]/g, '').trim()}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {recommendations.slice(0, 1).map((recommendation, index) => (
                          <div key={`rec-${index}`} className="p-3 bg-green-50 rounded">
                            <div className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-green-900">Recommendation</div>
                                <div className="text-xs text-green-700">{recommendation}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}