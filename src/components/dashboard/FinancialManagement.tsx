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
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Receipt,
  Package,
  ShoppingCart,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Target,
  BarChart,
  TrendUp,
  Eye,
  Zap
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { FinancialData, InventoryItem, POSTransaction, Opportunity } from '@/lib/types';
import { toast } from 'sonner';

interface FinancialManagementProps {
  opportunities: Opportunity[];
  currentUserId: string;
}

// Real-time financial metrics interface
interface RealtimeMetrics {
  currentRevenue: number;
  dailyGrowth: number;
  monthlyRecurring: number;
  conversionRate: number;
  averageDealSize: number;
  forecastAccuracy: number;
  revenueTarget: number;
  timeToClose: number; // in days
}

// Enhanced financial data with real-time tracking
interface EnhancedFinancialData extends FinancialData {
  lastUpdated: Date;
  revenueGrowth: number;
  dealVelocity: number;
  riskScore: number;
}

// Utility functions to convert stored data back to proper Date objects
const convertInventoryDates = (items: InventoryItem[]): InventoryItem[] => {
  return items.map(item => ({
    ...item,
    lastRestocked: new Date(item.lastRestocked)
  }));
};

const convertTransactionDates = (transactions: POSTransaction[]): POSTransaction[] => {
  return transactions.map(transaction => ({
    ...transaction,
    timestamp: new Date(transaction.timestamp)
  }));
};

export function FinancialManagement({ opportunities, currentUserId }: FinancialManagementProps) {
  const [financialData, setFinancialData] = useKV<FinancialData[]>('financial-data', []);
  const [rawInventory, setRawInventory] = useKV<InventoryItem[]>('inventory-items', []);
  const [rawPosTransactions, setRawPosTransactions] = useKV<POSTransaction[]>('pos-transactions', []);
  const [realtimeMetrics, setRealtimeMetrics] = useKV<RealtimeMetrics>('realtime-metrics', {
    currentRevenue: 0,
    dailyGrowth: 0,
    monthlyRecurring: 0,
    conversionRate: 0,
    averageDealSize: 0,
    forecastAccuracy: 0,
    revenueTarget: 1000000,
    timeToClose: 45
  });
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useKV('realtime-enabled', true);
  
  // Convert stored data to ensure proper Date objects
  const inventory = convertInventoryDates(rawInventory);
  const posTransactions = convertTransactionDates(rawPosTransactions);
  const setInventory = (items: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => {
    if (typeof items === 'function') {
      setRawInventory(prev => items(convertInventoryDates(prev)));
    } else {
      setRawInventory(items);
    }
  };
  const setPosTransactions = (transactions: POSTransaction[] | ((prev: POSTransaction[]) => POSTransaction[])) => {
    if (typeof transactions === 'function') {
      setRawPosTransactions(prev => transactions(convertTransactionDates(prev)));
    } else {
      setRawPosTransactions(transactions);
    }
  };
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [newInventoryDialog, setNewInventoryDialog] = useState(false);
  const [newPOSDialog, setNewPOSDialog] = useState(false);

  // Real-time metrics update effect
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const updateRealtimeMetrics = () => {
      const totalRevenue = calculateTotalRevenue();
      const closedOpportunities = opportunities.filter(opp => opp.stage === 'keep');
      const totalOpportunities = opportunities.length;
      const avgDealSize = totalOpportunities > 0 ? totalRevenue / totalOpportunities : 0;
      const conversionRate = totalOpportunities > 0 ? (closedOpportunities.length / totalOpportunities) * 100 : 0;
      
      // Simulate real-time growth calculation
      const currentTime = Date.now();
      const dailyGrowthRate = Math.sin(currentTime / 10000000) * 5 + 3; // Simulated growth between -2% and 8%
      
      setRealtimeMetrics(prev => ({
        ...prev,
        currentRevenue: totalRevenue,
        dailyGrowth: dailyGrowthRate,
        monthlyRecurring: calculateRecurringRevenue(),
        conversionRate,
        averageDealSize: avgDealSize,
        forecastAccuracy: 85 + Math.random() * 10, // Simulated accuracy between 85-95%
        timeToClose: 30 + Math.random() * 30 // Simulated time to close between 30-60 days
      }));
    };

    // Update metrics immediately
    updateRealtimeMetrics();

    // Set up real-time updates every 5 seconds
    const interval = setInterval(updateRealtimeMetrics, 5000);

    return () => clearInterval(interval);
  }, [opportunities, financialData, isRealTimeEnabled]);

  // Initialize demo data
  useEffect(() => {
    if (inventory.length === 0) {
      const demoInventory: InventoryItem[] = [
        {
          id: '1',
          sku: 'PROD-001',
          name: 'Enterprise Software License',
          category: 'Software',
          quantity: 100,
          unitPrice: 5000,
          supplier: 'Software Corp',
          lastRestocked: new Date('2024-01-15')
        },
        {
          id: '2',
          sku: 'SERV-001',
          name: 'Professional Services',
          category: 'Services',
          quantity: 50,
          unitPrice: 2500,
          supplier: 'Consulting Group',
          lastRestocked: new Date('2024-01-10')
        },
        {
          id: '3',
          sku: 'SUPP-001',
          name: 'Annual Support',
          category: 'Support',
          quantity: 75,
          unitPrice: 1500,
          supplier: 'Support Team',
          lastRestocked: new Date('2024-01-20')
        }
      ];
      setInventory(demoInventory);
    }

    if (posTransactions.length === 0) {
      const demoTransactions: POSTransaction[] = [
        {
          id: '1',
          transactionId: 'TXN-2024-001',
          amount: 15000,
          paymentMethod: 'Credit Card',
          timestamp: new Date('2024-01-15T14:30:00'),
          items: ['PROD-001', 'SERV-001'],
          customerId: 'cust-1'
        },
        {
          id: '2',
          transactionId: 'TXN-2024-002',
          amount: 7500,
          paymentMethod: 'ACH Transfer',
          timestamp: new Date('2024-01-18T09:15:00'),
          items: ['SUPP-001'],
          customerId: 'cust-2'
        }
      ];
      setPosTransactions(demoTransactions);
    }

    // Generate financial data for opportunities
    if (financialData.length === 0 && opportunities.length > 0) {
      const demoFinancialData: FinancialData[] = opportunities.map(opp => ({
        id: `fin-${opp.id}`,
        opportunityId: opp.id,
        revenue: opp.value,
        costs: opp.value * 0.3, // 30% cost ratio
        margin: opp.value * 0.7, // 70% margin
        recurringRevenue: opp.stage === 'keep' ? opp.value * 0.2 : 0, // 20% recurring if closed
        paymentTerms: 'Net 30',
        invoiceStatus: opp.stage === 'keep' ? 'paid' : 'pending'
      }));
      setFinancialData(demoFinancialData);
    }
  }, [opportunities, financialData, rawInventory, rawPosTransactions, setFinancialData, setRawInventory, setRawPosTransactions]);

  const calculateTotalRevenue = () => {
    return financialData.reduce((sum, fd) => sum + fd.revenue, 0);
  };

  const calculateTotalMargin = () => {
    return financialData.reduce((sum, fd) => sum + fd.margin, 0);
  };

  const calculateRecurringRevenue = () => {
    return financialData.reduce((sum, fd) => sum + fd.recurringRevenue, 0);
  };

  const calculateRevenueGrowth = () => {
    // Calculate growth rate based on closed opportunities over time
    const closedOpportunities = opportunities.filter(opp => opp.stage === 'keep');
    const totalClosed = closedOpportunities.length;
    const avgGrowth = totalClosed > 0 ? realtimeMetrics.dailyGrowth : 0;
    return avgGrowth;
  };

  const getRevenueProgress = () => {
    const current = realtimeMetrics.currentRevenue;
    const target = realtimeMetrics.revenueTarget;
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getInvoiceStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} />;
      case 'sent': return <Clock size={16} />;
      case 'overdue': return <AlertCircle size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString()
    };
    setInventory(prev => [...prev, newItem]);
    setNewInventoryDialog(false);
    toast.success('Inventory item added');
  };

  const addPOSTransaction = (transaction: Omit<POSTransaction, 'id' | 'timestamp'>) => {
    const newTransaction: POSTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setPosTransactions(prev => [...prev, newTransaction]);
    setNewPOSDialog(false);
    toast.success('POS transaction recorded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Financial Management 
            {isRealTimeEnabled && (
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Activity className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </div>
            )}
          </h2>
          <p className="text-muted-foreground">
            Real-time revenue tracking, inventory management, and financial analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isRealTimeEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Real-time {isRealTimeEnabled ? 'ON' : 'OFF'}
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Real-time Revenue Dashboard */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Revenue Target Progress
            </CardTitle>
            <CardDescription>
              Current: {formatCurrency(realtimeMetrics.currentRevenue)} / Target: {formatCurrency(realtimeMetrics.revenueTarget)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={getRevenueProgress()} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{formatPercentage(getRevenueProgress())} complete</span>
                <span className="text-muted-foreground">
                  {formatCurrency(realtimeMetrics.revenueTarget - realtimeMetrics.currentRevenue)} remaining
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Revenue Growth</CardTitle>
            <TrendUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(realtimeMetrics.dailyGrowth)}
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp size={12} />
              Daily growth rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Financial KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realtimeMetrics.currentRevenue)}</div>
            <p className={`text-xs flex items-center gap-1 ${realtimeMetrics.dailyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {realtimeMetrics.dailyGrowth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatPercentage(Math.abs(realtimeMetrics.dailyGrowth))} from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realtimeMetrics.averageDealSize)}</div>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Target size={12} />
              {Math.round(realtimeMetrics.timeToClose)} days to close
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(realtimeMetrics.conversionRate)}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle size={12} />
              {formatPercentage(realtimeMetrics.forecastAccuracy)} forecast accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(realtimeMetrics.monthlyRecurring)}</div>
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Activity size={12} />
              Predictable revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Tracking</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pos">Point of Sale</TabsTrigger>
          <TabsTrigger value="invoicing">Invoicing</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Revenue Pipeline Health
                </CardTitle>
                <CardDescription>Real-time view of your revenue pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Prospect', 'Engage', 'Acquire', 'Keep'].map((stage, index) => {
                    const stageOpportunities = opportunities.filter(opp => {
                      const stageMap = { 'prospect': 0, 'engage': 1, 'acquire': 2, 'keep': 3 };
                      return stageMap[opp.stage as keyof typeof stageMap] === index;
                    });
                    const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
                    const stagePercentage = realtimeMetrics.currentRevenue > 0 ? (stageValue / realtimeMetrics.currentRevenue) * 100 : 0;
                    
                    return (
                      <div key={stage} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{stage}</span>
                          <span>{formatCurrency(stageValue)} ({stageOpportunities.length} deals)</span>
                        </div>
                        <Progress value={Math.min(stagePercentage, 100)} className="h-2" />
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
                  Live Metrics Dashboard
                </CardTitle>
                <CardDescription>Key performance indicators updating in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{formatPercentage(realtimeMetrics.forecastAccuracy)}</div>
                    <div className="text-sm text-green-600">Forecast Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{Math.round(realtimeMetrics.timeToClose)}d</div>
                    <div className="text-sm text-blue-600">Avg. Time to Close</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{formatCurrency(realtimeMetrics.averageDealSize)}</div>
                    <div className="text-sm text-purple-600">Avg. Deal Size</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">{formatPercentage(realtimeMetrics.conversionRate)}</div>
                    <div className="text-sm text-orange-600">Conversion Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Velocity Tracker</CardTitle>
              <CardDescription>Track how quickly revenue is being generated across your pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Daily Revenue Velocity</span>
                  <Badge variant="outline" className="bg-green-50">
                    {formatCurrency(realtimeMetrics.currentRevenue / 30)} per day
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Weekly Projection</span>
                  <span className="text-sm">{formatCurrency(realtimeMetrics.currentRevenue / 30 * 7)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Projection</span>
                  <span className="text-sm font-semibold">{formatCurrency(realtimeMetrics.currentRevenue / 30 * 30)}</span>
                </div>
                {isRealTimeEnabled && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm font-medium">Real-time updates enabled</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Metrics refresh every 5 seconds with live pipeline data
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Opportunity</CardTitle>
              <CardDescription>Financial breakdown of your sales opportunities with real-time tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Costs</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.map((fd) => {
                    const opp = opportunities.find(o => o.id === fd.opportunityId);
                    const growthRate = calculateRevenueGrowth();
                    return (
                      <TableRow key={fd.id}>
                        <TableCell className="font-medium">
                          {opp?.title || 'Unknown Opportunity'}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(fd.revenue)}</TableCell>
                        <TableCell>{formatCurrency(fd.costs)}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {formatCurrency(fd.margin)}
                        </TableCell>
                        <TableCell>
                          {fd.recurringRevenue > 0 ? formatCurrency(fd.recurringRevenue) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {growthRate >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {formatPercentage(Math.abs(growthRate))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getInvoiceStatusColor(fd.invoiceStatus)}>
                            {fd.invoiceStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Inventory Overview</CardTitle>
                <CardDescription>Stock levels and product management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{inventory.length}</div>
                    <div className="text-xs text-muted-foreground">Total Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {inventory.reduce((sum, item) => sum + item.quantity, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Quantity</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Dialog open={newInventoryDialog} onOpenChange={setNewInventoryDialog}>
              <DialogTrigger asChild>
                <Button className="ml-4">
                  <Package className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inventory Item</DialogTitle>
                  <DialogDescription>Add a new product or service to inventory</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addInventoryItem({
                    sku: formData.get('sku') as string,
                    name: formData.get('name') as string,
                    category: formData.get('category') as string,
                    quantity: parseInt(formData.get('quantity') as string),
                    unitPrice: parseFloat(formData.get('unitPrice') as string),
                    supplier: formData.get('supplier') as string,
                    lastRestocked: new Date()
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" name="sku" required />
                    </div>
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input id="name" name="name" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Services">Services</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Hardware">Hardware</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Input id="supplier" name="supplier" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input id="quantity" name="quantity" type="number" required />
                    </div>
                    <div>
                      <Label htmlFor="unitPrice">Unit Price</Label>
                      <Input id="unitPrice" name="unitPrice" type="number" step="0.01" required />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setNewInventoryDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Item</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={item.quantity < 10 ? 'text-red-600 font-medium' : ''}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pos" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Point of Sale Transactions</h3>
              <p className="text-muted-foreground">Recent sales transactions and payments</p>
            </div>
            
            <Dialog open={newPOSDialog} onOpenChange={setNewPOSDialog}>
              <DialogTrigger asChild>
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  New Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record POS Transaction</DialogTitle>
                  <DialogDescription>Record a new point of sale transaction</DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addPOSTransaction({
                    transactionId: formData.get('transactionId') as string,
                    amount: parseFloat(formData.get('amount') as string),
                    paymentMethod: formData.get('paymentMethod') as string,
                    items: (formData.get('items') as string).split(','),
                    customerId: formData.get('customerId') as string
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="transactionId">Transaction ID</Label>
                      <Input id="transactionId" name="transactionId" required />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" name="amount" type="number" step="0.01" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select name="paymentMethod" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="ACH Transfer">ACH Transfer</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customerId">Customer ID</Label>
                      <Input id="customerId" name="customerId" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="items">Items (comma-separated SKUs)</Label>
                    <Input id="items" name="items" placeholder="PROD-001, SERV-001" required />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setNewPOSDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Record Transaction</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Customer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                      <TableCell>{new Date(transaction.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>{transaction.items.join(', ')}</TableCell>
                      <TableCell>{transaction.customerId || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Track invoice status and payment collection</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financialData.map((fd) => {
                    const opp = opportunities.find(o => o.id === fd.opportunityId);
                    return (
                      <TableRow key={fd.id}>
                        <TableCell className="font-medium">
                          {opp?.title || 'Unknown Opportunity'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(fd.revenue)}
                        </TableCell>
                        <TableCell>{fd.paymentTerms}</TableCell>
                        <TableCell>
                          <Badge className={getInvoiceStatusColor(fd.invoiceStatus)}>
                            <span className="flex items-center gap-1">
                              {getInvoiceStatusIcon(fd.invoiceStatus)}
                              {fd.invoiceStatus}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Invoice
                            </Button>
                            {fd.invoiceStatus !== 'paid' && (
                              <Button size="sm">
                                Send Reminder
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}