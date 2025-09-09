import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Company, CustomerSegment, SegmentAssignment } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Loader2, CheckCircle, AlertCircle, TrendingUp, Users, Zap, Target } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface AISegmentAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignmentComplete: (assignments: { companyId: string; segmentId: string }[]) => void;
}

export function AISegmentAssignmentDialog({ isOpen, onClose, onAssignmentComplete }: AISegmentAssignmentDialogProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [segments] = useKV<CustomerSegment[]>('customer-segments', []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'preview' | 'processing' | 'results'>('preview');
  const [assignments, setAssignments] = useState<{ companyId: string; segmentId: string; confidence: number; reasoning: string }[]>([]);
  const [insights, setInsights] = useState<{ totalAssigned: number; highConfidence: number; requiresReview: number } | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyAssignment, setCompanyAssignment] = useState<{
    segmentId: string;
    confidence: number;
    reasoning: string;
    strategicInsights: string[];
    alternativeSegments: { segmentId: string; confidence: number; reason: string }[];
  } | null>(null);

  const unassignedCompanies = companies.filter(c => !c.segmentId);
  const activeSegments = segments.filter(s => s.isActive);

  const handleBulkAssignment = async () => {
    if (activeSegments.length === 0) {
      toast.error('No active segments available for assignment');
      return;
    }

    setIsProcessing(true);
    setCurrentStep('processing');

    try {
      const result = await AIService.bulkAssignSegments(unassignedCompanies, activeSegments);
      setAssignments(result.assignments);
      setInsights(result.insights);
      setRecommendations(result.recommendations);
      setCurrentStep('results');
      toast.success(`Successfully analyzed ${result.assignments.length} companies`);
    } catch (error) {
      console.error('Bulk assignment error:', error);
      toast.error('Error during AI assignment. Please try again.');
      setCurrentStep('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSingleCompanyAnalysis = async (company: Company) => {
    if (activeSegments.length === 0) {
      toast.error('No active segments available for analysis');
      return;
    }

    setSelectedCompany(company);
    setIsProcessing(true);

    try {
      const result = await AIService.assignCustomerSegment(company, activeSegments);
      setCompanyAssignment(result);
    } catch (error) {
      console.error('Single company analysis error:', error);
      toast.error('Error analyzing company. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyAssignments = () => {
    const updatedCompanies = companies.map(company => {
      const assignment = assignments.find(a => a.companyId === company.id);
      if (assignment && !company.segmentId) {
        const segmentAssignment: SegmentAssignment = {
          id: crypto.randomUUID(),
          companyId: company.id,
          segmentId: assignment.segmentId,
          confidence: assignment.confidence,
          assignedBy: 'automated',
          assignedAt: new Date().toISOString(),
          reason: assignment.reasoning,
          previousSegments: []
        };

        return {
          ...company,
          segmentId: assignment.segmentId,
          segmentAssignment
        };
      }
      return company;
    });

    setCompanies(updatedCompanies);
    onAssignmentComplete(assignments.map(a => ({ companyId: a.companyId, segmentId: a.segmentId })));
    
    toast.success(`Applied ${assignments.length} segment assignments`);
    onClose();
  };

  const getSegmentName = (segmentId: string) => {
    return segments.find(s => s.id === segmentId)?.name || 'Unknown Segment';
  };

  const getSegmentColor = (segmentId: string) => {
    return segments.find(s => s.id === segmentId)?.color || '#6B7280';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge variant="default" className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (confidence >= 60) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Medium Confidence</Badge>;
    return <Badge variant="destructive" className="bg-red-100 text-red-800">Needs Review</Badge>;
  };

  if (selectedCompany && companyAssignment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Segment Analysis: {selectedCompany.name}
            </DialogTitle>
            <DialogDescription>
              Strategic segment recommendation with AI-powered insights
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Primary Assignment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Recommended Segment
                    </CardTitle>
                    {getConfidenceBadge(companyAssignment.confidence)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${getSegmentColor(companyAssignment.segmentId)}20` }}
                    >
                      <Users className="h-6 w-6" style={{ color: getSegmentColor(companyAssignment.segmentId) }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{getSegmentName(companyAssignment.segmentId)}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`font-medium ${getConfidenceColor(companyAssignment.confidence)}`}>
                          {companyAssignment.confidence}% confidence
                        </span>
                        <Progress value={companyAssignment.confidence} className="flex-1 max-w-32" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{companyAssignment.reasoning}</p>
                </CardContent>
              </Card>

              {/* Strategic Insights */}
              {companyAssignment.strategicInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Strategic Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {companyAssignment.strategicInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Alternative Segments */}
              {companyAssignment.alternativeSegments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Alternative Segments</CardTitle>
                    <CardDescription>
                      Other potential segment fits for consideration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {companyAssignment.alternativeSegments.map((alt, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="h-8 w-8 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: `${getSegmentColor(alt.segmentId)}20` }}
                          >
                            <Users className="h-4 w-4" style={{ color: getSegmentColor(alt.segmentId) }} />
                          </div>
                          <div>
                            <span className="font-medium">{getSegmentName(alt.segmentId)}</span>
                            <p className="text-sm text-muted-foreground">{alt.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`font-medium ${getConfidenceColor(alt.confidence)}`}>
                            {alt.confidence}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCompany(null)}>
              Back
            </Button>
            <Button 
              onClick={() => {
                // Apply this single assignment
                const singleAssignment = [{
                  companyId: selectedCompany.id,
                  segmentId: companyAssignment.segmentId,
                  confidence: companyAssignment.confidence,
                  reasoning: companyAssignment.reasoning
                }];
                setAssignments(singleAssignment);
                applyAssignments();
              }}
            >
              Apply Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Segment Assignment
          </DialogTitle>
          <DialogDescription>
            Automatically assign customer segments using AI analysis of company characteristics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 'preview' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assignment Overview</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{unassignedCompanies.length}</div>
                    <div className="text-sm text-muted-foreground">Unassigned Companies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{activeSegments.length}</div>
                    <div className="text-sm text-muted-foreground">Active Segments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{companies.filter(c => c.segmentId).length}</div>
                    <div className="text-sm text-muted-foreground">Already Assigned</div>
                  </div>
                </CardContent>
              </Card>

              {unassignedCompanies.length > 0 ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Companies Ready for Assignment</h3>
                    <Button onClick={handleBulkAssignment} className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Assign All with AI
                    </Button>
                  </div>

                  <ScrollArea className="max-h-96">
                    <div className="grid gap-3">
                      {unassignedCompanies.map((company) => (
                        <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{company.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span>{company.industry}</span>
                                  <span>{company.size}</span>
                                  {company.revenue && (
                                    <span>${company.revenue.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSingleCompanyAnalysis(company)}
                                disabled={isProcessing}
                              >
                                {isProcessing && selectedCompany?.id === company.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Brain className="h-4 w-4 mr-1" />
                                    Analyze
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">All Companies Assigned</h3>
                    <p className="text-muted-foreground">
                      All your companies are already assigned to customer segments.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {currentStep === 'processing' && (
            <Card>
              <CardContent className="text-center py-12">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
                <p className="text-muted-foreground">
                  Analyzing company profiles and determining optimal segment assignments...
                </p>
              </CardContent>
            </Card>
          )}

          {currentStep === 'results' && (
            <div className="space-y-6">
              {/* Results Summary */}
              {insights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Assignment Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{insights.totalAssigned}</div>
                      <div className="text-sm text-muted-foreground">Companies Assigned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{insights.highConfidence}</div>
                      <div className="text-sm text-muted-foreground">High Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{insights.requiresReview}</div>
                      <div className="text-sm text-muted-foreground">Needs Review</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Assignment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Details</CardTitle>
                  <CardDescription>
                    Review AI-generated segment assignments before applying
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-3">
                      {assignments.map((assignment, index) => {
                        const company = companies.find(c => c.id === assignment.companyId);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div>
                                <span className="font-medium">{company?.name}</span>
                                <div className="text-sm text-muted-foreground">
                                  {company?.industry} • {company?.size}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground max-w-xs">
                                {assignment.reasoning}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-medium">{getSegmentName(assignment.segmentId)}</div>
                                <div className={`text-sm ${getConfidenceColor(assignment.confidence)}`}>
                                  {assignment.confidence}% confidence
                                </div>
                              </div>
                              {getConfidenceBadge(assignment.confidence)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          {currentStep === 'results' ? (
            <>
              <Button variant="outline" onClick={() => setCurrentStep('preview')}>
                Back
              </Button>
              <Button onClick={applyAssignments} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Apply Assignments
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}