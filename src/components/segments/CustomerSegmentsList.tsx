import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { CustomerSegment, CUSTOMER_SEGMENT_TEMPLATES, Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Settings, TrendingUp, Users, DollarSign, Clock, Zap } from '@phosphor-icons/react';
import { CreateSegmentDialog } from './CreateSegmentDialog';
import { SegmentDetailsDialog } from './SegmentDetailsDialog';
import { SegmentUtils } from '@/lib/segment-utils';
import { toast } from 'sonner';

export function CustomerSegmentsList() {
  const [segments, setSegments] = useKV<CustomerSegment[]>('customer-segments', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);

  // Initialize with templates if no segments exist
  const initializeTemplates = () => {
    const initialSegments = CUSTOMER_SEGMENT_TEMPLATES.map(template => ({
      ...template,
      id: crypto.randomUUID(),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    setSegments(initialSegments);
    toast.success('Customer segments initialized with default templates');
  };

  // Auto-assign companies to segments
  const handleAutoAssign = () => {
    if (segments.length === 0) {
      toast.error('Please initialize segments first');
      return;
    }

    const updatedCompanies = SegmentUtils.autoAssignSegments(companies, segments);
    const assignedCount = updatedCompanies.filter((c, i) => 
      !companies[i]?.segmentId && c.segmentId
    ).length;
    
    setCompanies(updatedCompanies);
    
    if (assignedCount > 0) {
      toast.success(`Successfully assigned ${assignedCount} companies to segments`);
    } else {
      toast.info('No new assignments made - companies may already be assigned');
    }
  };

  const handleCreateSegment = (segmentData: Omit<CustomerSegment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    const newSegment: CustomerSegment = {
      ...segmentData,
      id: crypto.randomUUID(),
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSegments(current => [...current, newSegment]);
    toast.success(`Customer segment "${newSegment.name}" created successfully`);
    setIsCreateOpen(false);
  };

  const handleUpdateSegment = (updatedSegment: CustomerSegment) => {
    setSegments(current => 
      current.map(segment => 
        segment.id === updatedSegment.id 
          ? { ...updatedSegment, updatedAt: new Date().toISOString() }
          : segment
      )
    );
    toast.success(`Customer segment "${updatedSegment.name}" updated successfully`);
    setSelectedSegment(null);
  };

  const handleDeleteSegment = (segmentId: string) => {
    const segment = segments.find(s => s.id === segmentId);
    setSegments(current => current.filter(s => s.id !== segmentId));
    toast.success(`Customer segment "${segment?.name}" deleted successfully`);
    setSelectedSegment(null);
  };

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

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Users className="h-5 w-5" />;
      case 'Trophy': return <TrendingUp className="h-5 w-5" />;
      case 'Shield': return <Settings className="h-5 w-5" />;
      default: return <Users className="h-5 w-5" />;
    }
  };

  if (segments.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Customer Segments</h2>
            <p className="text-muted-foreground mt-1">
              Organize and target your customers with strategic segmentation
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>No Customer Segments Found</CardTitle>
            <CardDescription>
              Get started by initializing default customer segment templates or creating your own custom segments
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex gap-3 justify-center">
              <Button onClick={initializeTemplates} className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Initialize Templates
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Custom
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Templates include Strategic Partner, Reference Customer, and Vector Control segments
            </p>
          </CardContent>
        </Card>

        <CreateSegmentDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateSegment}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Customer Segments</h2>
          <p className="text-muted-foreground mt-1">
            {segments.filter(s => s.isActive).length} active segments • {formatNumber(companies.filter(c => c.segmentId).length)} assigned companies
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {segments.filter(s => s.isActive).length} active segments • {formatNumber(companies.filter(c => c.segmentId).length)} assigned companies
          </Badge>
          <Button 
            variant="outline"
            onClick={handleAutoAssign}
            className="flex items-center gap-2"
            disabled={segments.length === 0}
          >
            <Zap className="h-4 w-4" />
            Auto-Assign
          </Button>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Segment
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => {
          const segmentCompanies = companies.filter(c => c.segmentId === segment.id);
          const totalValue = segmentCompanies.reduce((sum, c) => sum + (c.revenue || 0), 0);
          const avgRevenue = segmentCompanies.length > 0 ? totalValue / segmentCompanies.length : 0;
          
          return (
            <Card 
              key={segment.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSegment(segment)}
            >
              <CardHeader className="pb-3">
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
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                      <Badge variant={segment.isActive ? "default" : "secondary"}>
                        {segment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {segment.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Total Value
                    </div>
                    <div className="font-semibold">
                      {formatCurrency(totalValue)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" />
                      Companies
                    </div>
                    <div className="font-semibold">
                      {formatNumber(segmentCompanies.length)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(avgRevenue)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target Conv. Rate</span>
                      <span className="font-medium">
                        {(segment.metrics.conversionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={segment.metrics.conversionRate * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Avg. Sales Cycle
                  </div>
                  <span className="text-sm font-medium">
                    {segment.metrics.averageSalesCycle} days
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateSegmentDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSegment}
      />

      {selectedSegment && (
        <SegmentDetailsDialog
          segment={selectedSegment}
          onClose={() => setSelectedSegment(null)}
          onUpdate={handleUpdateSegment}
          onDelete={handleDeleteSegment}
        />
      )}
    </div>
  );
}