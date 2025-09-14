import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useKV } from '@github/spark/hooks';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Award,
  AlertCircle,
  Zap,
  Eye,
  Edit,
  Users,
  BarChart3
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { QuickQualification } from './QuickQualification';

interface Opportunity {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: Date;
  primaryContact: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: Date;
}

interface QualificationStatus {
  opportunity_id: string;
  assessment_score: number;
  completion_percentage: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_assessment_date: Date;
  stage_readiness: {
    current_stage_ready: boolean;
    next_stage_ready: boolean;
    recommended_stage: string;
  };
  top_gaps: string[];
  confidence_score: number;
  assessment_type: 'none' | 'quick' | 'full';
}

interface PipelineMetrics {
  total_opportunities: number;
  total_value: number;
  qualified_value: number;
  qualification_rate: number;
  avg_score: number;
  high_risk_count: number;
  overdue_assessments: number;
}

export function PipelineQualificationTracker() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [qualificationStatuses, setQualificationStatuses] = useKV<QualificationStatus[]>('qualification-statuses', []);
  
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterAssessment, setFilterAssessment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'score' | 'risk' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [showQuickAssessment, setShowQuickAssessment] = useState(false);

  // Create safe opportunities array
  const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];

  // Initialize sample data
  useEffect(() => {
    if (safeOpportunities.length === 0) {
      const sampleOpportunities: Opportunity[] = [
        {
          id: 'opp-1',
          name: 'Enterprise Software License',
          company: 'TechCorp Solutions',
          value: 250000,
          stage: 'engage',
          probability: 75,
          expectedCloseDate: new Date('2024-03-15'),
          primaryContact: 'John Smith',
          assignedTo: 'current-user',
          priority: 'high',
          lastActivity: new Date('2024-01-10')
        },
        {
          id: 'opp-2',
          name: 'Marketing Automation Platform',
          company: 'GrowthCo Inc',
          value: 75000,
          stage: 'prospect',
          probability: 45,
          expectedCloseDate: new Date('2024-02-28'),
          primaryContact: 'Sarah Johnson',
          assignedTo: 'current-user',
          priority: 'medium',
          lastActivity: new Date('2024-01-08')
        },
        {
          id: 'opp-3',
          name: 'CRM Integration Project',
          company: 'DataFlow Systems',
          value: 150000,
          stage: 'acquire',
          probability: 85,
          expectedCloseDate: new Date('2024-02-15'),
          primaryContact: 'Mike Davis',
          assignedTo: 'current-user',
          priority: 'critical',
          lastActivity: new Date('2024-01-12')
        },
        {
          id: 'opp-4',
          name: 'Digital Transformation Initiative',
          company: 'InnovateFirst Corp',
          value: 420000,
          stage: 'engage',
          probability: 60,
          expectedCloseDate: new Date('2024-04-30'),
          primaryContact: 'Lisa Chen',
          assignedTo: 'current-user',
          priority: 'high',
          lastActivity: new Date('2024-01-09')
        },
        {
          id: 'opp-5',
          name: 'Cloud Migration Services',
          company: 'Legacy Systems Inc',
          value: 95000,
          stage: 'prospect',
          probability: 30,
          expectedCloseDate: new Date('2024-03-31'),
          primaryContact: 'Robert Taylor',
          assignedTo: 'current-user',
          priority: 'low',
          lastActivity: new Date('2024-01-05')
        }
      ];
      setOpportunities(sampleOpportunities);
    }

    if (qualificationStatuses.length === 0) {
      const sampleStatuses: QualificationStatus[] = [
        {
          opportunity_id: 'opp-1',
          assessment_score: 195,
          completion_percentage: 85,
          risk_level: 'medium',
          last_assessment_date: new Date('2024-01-10'),
          stage_readiness: {
            current_stage_ready: true,
            next_stage_ready: false,
            recommended_stage: 'engage'
          },
          top_gaps: ['Economic Buyer Access', 'Decision Timeline'],
          confidence_score: 78,
          assessment_type: 'full'
        },
        {
          opportunity_id: 'opp-2',
          assessment_score: 85,
          completion_percentage: 60,
          risk_level: 'high',
          last_assessment_date: new Date('2024-01-08'),
          stage_readiness: {
            current_stage_ready: true,
            next_stage_ready: false,
            recommended_stage: 'prospect'
          },
          top_gaps: ['Champion Development', 'Pain Quantification', 'Competitive Position'],
          confidence_score: 45,
          assessment_type: 'quick'
        },
        {
          opportunity_id: 'opp-3',
          assessment_score: 275,
          completion_percentage: 95,
          risk_level: 'low',
          last_assessment_date: new Date('2024-01-12'),
          stage_readiness: {
            current_stage_ready: true,
            next_stage_ready: true,
            recommended_stage: 'acquire'
          },
          top_gaps: [],
          confidence_score: 92,
          assessment_type: 'full'
        },
        {
          opportunity_id: 'opp-4',
          assessment_score: 0,
          completion_percentage: 0,
          risk_level: 'critical',
          last_assessment_date: new Date('2024-01-01'),
          stage_readiness: {
            current_stage_ready: false,
            next_stage_ready: false,
            recommended_stage: 'prospect'
          },
          top_gaps: ['Assessment Required'],
          confidence_score: 0,
          assessment_type: 'none'
        },
        {
          opportunity_id: 'opp-5',
          assessment_score: 45,
          completion_percentage: 40,
          risk_level: 'high',
          last_assessment_date: new Date('2024-01-05'),
          stage_readiness: {
            current_stage_ready: false,
            next_stage_ready: false,
            recommended_stage: 'prospect'
          },
          top_gaps: ['Urgency/Pain', 'Champion', 'Economic Buyer'],
          confidence_score: 35,
          assessment_type: 'quick'
        }
      ];
      setQualificationStatuses(sampleStatuses);
    }
  }, []);

  const calculatePipelineMetrics = (): PipelineMetrics => {
    const totalValue = safeOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const qualifiedOpportunities = safeOpportunities.filter(opp => {
      const status = qualificationStatuses.find(s => s.opportunity_id === opp.id);
      return status && status.assessment_score >= 160; // Moderate qualification threshold
    });
    const qualifiedValue = qualifiedOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    
    const avgScore = qualificationStatuses.length > 0 
      ? qualificationStatuses.reduce((sum, s) => sum + s.assessment_score, 0) / qualificationStatuses.length 
      : 0;
    
    const highRiskCount = qualificationStatuses.filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const overdueAssessments = qualificationStatuses.filter(s => s.last_assessment_date < thirtyDaysAgo).length;

    return {
      total_opportunities: safeOpportunities.length,
      total_value: totalValue,
      qualified_value: qualifiedValue,
      qualification_rate: totalValue > 0 ? Math.round((qualifiedValue / totalValue) * 100) : 0,
      avg_score: Math.round(avgScore),
      high_risk_count: highRiskCount,
      overdue_assessments: overdueAssessments
    };
  };

  const getFilteredAndSortedOpportunities = () => {
    let filtered = safeOpportunities.filter(opp => {
      const status = qualificationStatuses.find(s => s.opportunity_id === opp.id);
      
      const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           opp.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = filterStage === 'all' || opp.stage === filterStage;
      const matchesRisk = filterRisk === 'all' || (status && status.risk_level === filterRisk);
      const matchesAssessment = filterAssessment === 'all' || (status && status.assessment_type === filterAssessment);
      
      return matchesSearch && matchesStage && matchesRisk && matchesAssessment;
    });

    // Sort opportunities
    filtered.sort((a, b) => {
      const statusA = qualificationStatuses.find(s => s.opportunity_id === a.id);
      const statusB = qualificationStatuses.find(s => s.opportunity_id === b.id);
      
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'score':
          comparison = (statusA?.assessment_score || 0) - (statusB?.assessment_score || 0);
          break;
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          comparison = (riskOrder[statusA?.risk_level || 'critical']) - (riskOrder[statusB?.risk_level || 'critical']);
          break;
        case 'date':
          comparison = (statusA?.last_assessment_date || new Date(0)).getTime() - (statusB?.last_assessment_date || new Date(0)).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getRiskBadgeColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageBadgeColor = (stage: string): string => {
    switch (stage) {
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'engage': return 'bg-purple-100 text-purple-800';
      case 'acquire': return 'bg-green-100 text-green-800';
      case 'keep': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <CheckCircle size={16} className="text-green-600" />;
      case 'quick': return <Zap size={16} className="text-blue-600" />;
      case 'none': return <AlertCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const handleStartQuickAssessment = (opportunityId: string) => {
    setSelectedOpportunity(opportunityId);
    setShowQuickAssessment(true);
  };

  const handleSaveAssessment = () => {
    setShowQuickAssessment(false);
    setSelectedOpportunity(null);
    toast.success('Assessment saved successfully');
    // Refresh data logic would go here
  };

  const pipelineMetrics = calculatePipelineMetrics();
  const filteredOpportunities = getFilteredAndSortedOpportunities();

  if (showQuickAssessment && selectedOpportunity) {
    const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
    const opportunity = safeOpportunities.find(opp => opp.id === selectedOpportunity);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quick Qualification Assessment</h1>
            <p className="text-muted-foreground">Pipeline Qualification Tracker</p>
          </div>
          <Button variant="outline" onClick={() => setShowQuickAssessment(false)}>
            Back to Pipeline
          </Button>
        </div>
        
        <QuickQualification
          opportunityId={selectedOpportunity}
          opportunityName={opportunity ? `${opportunity.name} - ${opportunity.company}` : 'Opportunity'}
          onSave={handleSaveAssessment}
          onCancel={() => setShowQuickAssessment(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target size={32} className="text-primary" />
            Pipeline Qualification Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and track MEDDPICC qualification status across your entire sales pipeline
          </p>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Pipeline</p>
                <p className="text-lg font-bold">${(pipelineMetrics.total_value / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Qualified %</p>
                <p className="text-lg font-bold text-green-600">{pipelineMetrics.qualification_rate}%</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-lg font-bold">{pipelineMetrics.avg_score}/320</p>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">High Risk</p>
                <p className="text-lg font-bold text-orange-600">{pipelineMetrics.high_risk_count}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-lg font-bold text-red-600">{pipelineMetrics.overdue_assessments}</p>
              </div>
              <Clock className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Opps</p>
                <p className="text-lg font-bold">{pipelineMetrics.total_opportunities}</p>
              </div>
              <Users className="h-5 w-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Filter size={20} />
            Filter & Search Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stage-filter">Stage</Label>
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="engage">Engage</SelectItem>
                  <SelectItem value="acquire">Acquire</SelectItem>
                  <SelectItem value="keep">Keep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="risk-filter">Risk Level</Label>
              <Select value={filterRisk} onValueChange={setFilterRisk}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assessment-filter">Assessment</Label>
              <Select value={filterAssessment} onValueChange={setFilterAssessment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full">Full Assessment</SelectItem>
                  <SelectItem value="quick">Quick Assessment</SelectItem>
                  <SelectItem value="none">No Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="risk">Risk Level</SelectItem>
                  <SelectItem value="date">Last Updated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={20} />
              Pipeline Opportunities ({filteredOpportunities.length})
            </div>
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'} Sort Order
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => {
              const status = qualificationStatuses.find(s => s.opportunity_id === opportunity.id);
              
              return (
                <div key={opportunity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Opportunity Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{opportunity.name}</h3>
                          <p className="text-sm text-muted-foreground">{opportunity.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(opportunity.value / 1000).toFixed(0)}K</p>
                          <p className="text-sm text-muted-foreground">{opportunity.probability}%</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getStageBadgeColor(opportunity.stage)}>
                          {opportunity.stage}
                        </Badge>
                        <Badge variant={opportunity.priority === 'critical' ? 'destructive' : 'outline'}>
                          {opportunity.priority}
                        </Badge>
                        {status && (
                          <Badge className={getRiskBadgeColor(status.risk_level)}>
                            {status.risk_level} risk
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Assessment Status */}
                    <div className="space-y-2">
                      {status ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span>Score: {status.assessment_score}/320</span>
                            {getAssessmentTypeIcon(status.assessment_type)}
                          </div>
                          <Progress value={(status.assessment_score / 320) * 100} className="h-2" />
                          
                          <div className="flex items-center justify-between text-sm">
                            <span>Complete: {status.completion_percentage}%</span>
                            <span className="text-muted-foreground">
                              {status.confidence_score}% confident
                            </span>
                          </div>
                          <Progress value={status.completion_percentage} className="h-2" />

                          {status.top_gaps.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Gaps: {status.top_gaps.slice(0, 2).join(', ')}
                              {status.top_gaps.length > 2 && ` +${status.top_gaps.length - 2} more`}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <AlertCircle size={24} className="mx-auto text-red-600 mb-2" />
                          <p className="text-sm font-medium text-red-600">No Assessment</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {status && status.assessment_type !== 'none' ? (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartQuickAssessment(opportunity.id)}
                            className="w-full"
                          >
                            <Edit size={14} className="mr-2" />
                            Update
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Eye size={14} className="mr-2" />
                            View Details
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            onClick={() => handleStartQuickAssessment(opportunity.id)}
                            className="w-full"
                          >
                            <Zap size={14} className="mr-2" />
                            Quick Assessment
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            <CheckCircle size={14} className="mr-2" />
                            Full Assessment
                          </Button>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground text-center">
                        Last: {status?.last_assessment_date.toLocaleDateString() || 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-8">
                <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No opportunities found</p>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}