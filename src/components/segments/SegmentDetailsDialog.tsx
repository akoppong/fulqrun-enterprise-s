import { useState } from 'react';
import { CustomerSegment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Users, DollarSign, Clock, TrendingUp, Target, Shield, 
  MessageCircle, Calendar, AlertTriangle, CheckCircle,
  Edit, Trash2, BarChart3, Settings
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SegmentDetailsDialogProps {
  segment: CustomerSegment;
  onClose: () => void;
  onUpdate: (segment: CustomerSegment) => void;
  onDelete: (segmentId: string) => void;
}

export function SegmentDetailsDialog({ segment, onClose, onUpdate, onDelete }: SegmentDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Users className="h-5 w-5" />;
      case 'Trophy': return <TrendingUp className="h-5 w-5" />;
      case 'Shield': return <Shield className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${segment.name}" segment? This action cannot be undone.`)) {
      onDelete(segment.id);
    }
  };

  const handleToggleActive = () => {
    const updatedSegment = { ...segment, isActive: !segment.isActive };
    onUpdate(updatedSegment);
    toast.success(`Segment ${updatedSegment.isActive ? 'activated' : 'deactivated'}`);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${segment.color}20` }}
              >
                <div style={{ color: segment.color }}>
                  {getIconComponent(segment.icon)}
                </div>
              </div>
              <div>
                <DialogTitle className="text-xl">{segment.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={segment.isActive ? "default" : "secondary"}>
                    {segment.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {new Date(segment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4" />
                {isEditing ? 'View' : 'Edit'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleToggleActive}>
                {segment.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-muted-foreground">
            {segment.description}
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Total Value</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {formatCurrency(segment.metrics.totalValue)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Opportunities</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {formatNumber(segment.metrics.totalOpportunities)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Conversion</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {formatPercentage(segment.metrics.conversionRate)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-muted-foreground">Avg Cycle</span>
                </div>
                <div className="text-2xl font-bold mt-1">
                  {segment.metrics.averageSalesCycle}d
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="criteria" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="criteria">Criteria</TabsTrigger>
              <TabsTrigger value="characteristics">Profile</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="criteria" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Segment Criteria</CardTitle>
                  <CardDescription>
                    The qualifying characteristics that define this customer segment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {segment.criteria.revenue.min || segment.criteria.revenue.max ? (
                    <div>
                      <h4 className="font-semibold mb-2">Revenue Range</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{segment.criteria.revenue.min ? formatCurrency(segment.criteria.revenue.min) : 'No minimum'}</span>
                        <span>to</span>
                        <span>{segment.criteria.revenue.max ? formatCurrency(segment.criteria.revenue.max) : 'No maximum'}</span>
                      </div>
                    </div>
                  ) : null}

                  {segment.criteria.industry.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Industries</h4>
                      <div className="flex flex-wrap gap-2">
                        {segment.criteria.industry.map((industry, index) => (
                          <Badge key={index} variant="outline">{industry}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {segment.criteria.geography.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Geography</h4>
                      <div className="flex flex-wrap gap-2">
                        {segment.criteria.geography.map((geo, index) => (
                          <Badge key={index} variant="outline">{geo}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {segment.criteria.businessModel.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Business Models</h4>
                      <div className="flex flex-wrap gap-2">
                        {segment.criteria.businessModel.map((model, index) => (
                          <Badge key={index} variant="outline">{model}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="characteristics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deal Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Deal Size</span>
                      <span className="font-semibold">{formatCurrency(segment.characteristics.avgDealSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Sales Cycle</span>
                      <span className="font-semibold">{segment.characteristics.avgSalesCycle} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Churn Risk</span>
                      <Badge className={getChurnRiskColor(segment.characteristics.churnRisk)}>
                        {segment.characteristics.churnRisk.charAt(0).toUpperCase() + segment.characteristics.churnRisk.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Decision Makers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {segment.characteristics.decisionMakers.map((dm, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{dm}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {segment.characteristics.buyingProcess && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Buying Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {segment.characteristics.buyingProcess}
                    </p>
                  </CardContent>
                </Card>
              )}

              {segment.characteristics.commonPainPoints.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Common Pain Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {segment.characteristics.commonPainPoints.map((pain, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <span className="text-sm">{pain}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {segment.characteristics.successFactors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Success Factors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {segment.characteristics.successFactors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Touchpoints</span>
                      <span className="font-semibold">{segment.strategy.touchpoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cadence</span>
                      <span className="font-semibold capitalize">{segment.strategy.cadence}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">KPIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {segment.strategy.kpis.map((kpi, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{kpi}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {segment.strategy.messaging.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Messaging</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {segment.strategy.messaging.map((message, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded border">
                          <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{message}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {segment.strategy.channels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Channels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {segment.strategy.channels.map((channel, index) => (
                        <Badge key={index} variant="outline">{channel}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer Lifetime Value</span>
                      <span className="font-semibold">{formatCurrency(segment.metrics.customerLifetimeValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Acquisition Cost</span>
                      <span className="font-semibold">{formatCurrency(segment.metrics.acquisitionCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LTV/CAC Ratio</span>
                      <span className="font-semibold">
                        {(segment.metrics.customerLifetimeValue / segment.metrics.acquisitionCost).toFixed(1)}x
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retention Rate</span>
                      <span className="font-semibold">{formatPercentage(segment.metrics.retention)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expansion Rate</span>
                      <span className="font-semibold">{segment.metrics.expansion.toFixed(1)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Promoter Score</span>
                      <span className="font-semibold">{segment.metrics.nps}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Conversion Rate</span>
                      <span className="text-sm font-medium">{formatPercentage(segment.metrics.conversionRate)}</span>
                    </div>
                    <Progress value={segment.metrics.conversionRate * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Retention Rate</span>
                      <span className="text-sm font-medium">{formatPercentage(segment.metrics.retention)}</span>
                    </div>
                    <Progress value={segment.metrics.retention * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Overview</CardTitle>
                  <CardDescription>
                    Last calculated: {new Date(segment.metrics.lastCalculated).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                    <p>Detailed performance metrics and analytics will be available once you have active opportunities in this segment.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}