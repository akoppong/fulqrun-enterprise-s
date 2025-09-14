import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { CustomerSegment, Company, SegmentAssignment } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Target, DollarSign, Users } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { CustomerSegmentsService } from '@/lib/customer-segments-service';

interface SegmentAssignmentDialogProps {
  company: Company;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (updatedCompany: Company) => void;
}

export function SegmentAssignmentDialog({ company, isOpen, onClose, onAssign }: SegmentAssignmentDialogProps) {
  const [segments, setSegments] = useKV<CustomerSegment[]>('customer-segments', []);
  const [selectedSegmentId, setSelectedSegmentId] = useState(company.segmentId || '');
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(85);
  const [isInitializing, setIsInitializing] = useState(false);

  // Auto-initialize segments if none exist
  useEffect(() => {
    if (isOpen && segments.length === 0) {
      setIsInitializing(true);
      const initializedSegments = CustomerSegmentsService.initializeDefaultSegments();
      setSegments(initializedSegments);
      
      toast.success('Customer segments initialized with default templates');
      setIsInitializing(false);
    }
  }, [isOpen, segments.length, setSegments]);

  const activeSegments = CustomerSegmentsService.getActiveSegments(segments);
  const selectedSegment = CustomerSegmentsService.findSegmentById(segments, selectedSegmentId);

  const handleAssign = () => {
    if (!selectedSegmentId) {
      toast.error('Please select a customer segment');
      return;
    }

    const assignment: SegmentAssignment = {
      id: crypto.randomUUID(),
      companyId: company.id,
      segmentId: selectedSegmentId,
      confidence,
      assignedBy: 'manual',
      assignedAt: new Date().toISOString(),
      assignedByUser: 'current-user',
      reason: reason.trim() || undefined,
      previousSegments: company.segmentId ? [company.segmentId] : []
    };

    const updatedCompany: Company = {
      ...company,
      segmentId: selectedSegmentId,
      segmentAssignment: assignment
    };

    onAssign(updatedCompany);
    
    const segmentName = CustomerSegmentsService.getSegmentDisplayName(segments, selectedSegmentId);
    toast.success(`${company.name} assigned to ${segmentName} segment`);
    onClose();
  };

  const handleRemoveAssignment = () => {
    const updatedCompany: Company = {
      ...company,
      segmentId: undefined,
      segmentAssignment: undefined
    };

    onAssign(updatedCompany);
    toast.success(`Removed segment assignment for ${company.name}`);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Crown': return <Target className="h-4 w-4" />;
      case 'Trophy': return <Target className="h-4 w-4" />;
      case 'Shield': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assign Customer Segment - {company.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Industry:</span>
                  <div className="font-medium">{company.industry}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <div className="font-medium">{company.size}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue:</span>
                  <div className="font-medium">
                    {company.revenue ? formatCurrency(company.revenue) : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {company.segmentId && (
            <div className="p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Current Assignment</span>
                <Badge variant="secondary">
                  {CustomerSegmentsService.getSegmentDisplayName(segments, company.segmentId)}
                </Badge>
              </div>
              <p className="text-sm text-blue-700">
                Assigned: {company.segmentAssignment ? new Date(company.segmentAssignment.assignedAt).toLocaleDateString() : 'Unknown'}
              </p>
              {company.segmentAssignment?.reason && (
                <p className="text-sm text-blue-700 mt-1">
                  Reason: {company.segmentAssignment.reason}
                </p>
              )}
            </div>
          )}

          {segments.length > 0 && !isInitializing && activeSegments.length === 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Users className="h-4 w-4" />
                <span className="font-medium">No Active Segments</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                All customer segments are currently inactive. Please activate segments in the Customer Segments module.
              </p>
            </div>
          )}

          {!isInitializing && segments.length > 0 && activeSegments.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Users className="h-4 w-4" />
                <span>
                  {activeSegments.length} customer segment{activeSegments.length !== 1 ? 's' : ''} available for assignment
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer Segment</Label>
              <Select 
                value={selectedSegmentId} 
                onValueChange={setSelectedSegmentId}
                disabled={isInitializing}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      isInitializing 
                        ? "Initializing customer segments..." 
                        : activeSegments.length === 0
                        ? "No segments available"
                        : "Select a customer segment"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {isInitializing ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mx-auto mb-2 animate-spin" />
                      Initializing customer segments...
                    </div>
                  ) : activeSegments.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mx-auto mb-2" />
                      No active segments available
                    </div>
                  ) : (
                    activeSegments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        <div className="flex items-center gap-2">
                          <div style={{ color: segment.color }}>
                            {getIconComponent(segment.icon)}
                          </div>
                          <div>
                            <div className="font-medium">{segment.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {segment.description}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedSegment && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${selectedSegment.color}20` }}
                    >
                      <div style={{ color: selectedSegment.color }}>
                        {getIconComponent(selectedSegment.icon)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedSegment.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedSegment.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Avg Deal: {formatCurrency(selectedSegment.characteristics.avgDealSize)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Cycle: {selectedSegment.characteristics.avgSalesCycle}d</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>Conv: {(selectedSegment.metrics.conversionRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label>Assignment Reason (Optional)</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why does this company fit this segment? (e.g., Revenue fits strategic partner criteria, strong industry presence...)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <div>
              {company.segmentId && (
                <Button
                  variant="outline"
                  onClick={handleRemoveAssignment}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove Assignment
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAssign} 
                disabled={!selectedSegmentId || isInitializing}
              >
                {isInitializing 
                  ? 'Initializing...' 
                  : company.segmentId 
                  ? 'Update Assignment' 
                  : 'Assign Segment'
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}