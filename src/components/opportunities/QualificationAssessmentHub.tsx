import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useKV } from '@github/spark/hooks';
import { 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  Brain,
  FileText,
  BarChart3,
  Award,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Download,
  Share,
  RefreshCw,
  Star,
  Zap
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  MEDDPICCAssessment, 
  MEDDPICCScoringService,
  MEDDPICCInsight
} from '../../services/meddpicc-scoring-service';
import { MEDDPICCModule } from '../meddpicc/MEDDPICCModule';

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

interface QualificationSummary {
  opportunity_id: string;
  total_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: Date;
  completion_percentage: number;
  stage_readiness: Record<string, boolean>;
  next_actions: string[];
}

export function QualificationAssessmentHub() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [assessmentSummaries, setAssessmentSummaries] = useKV<QualificationSummary[]>('qualification-summaries', []);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'assessment' | 'insights' | 'pipeline'>('dashboard');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [insights, setInsights] = useState<MEDDPICCInsight[]>([]);

  // Initialize sample data
  useEffect(() => {
    if (opportunities.length === 0) {
      const sampleOpportunities: Opportunity[] = [
        {
          id: '1',
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
          id: '2',
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
          id: '3',
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
        }
      ];
      setOpportunities(sampleOpportunities);
    }

    if (assessmentSummaries.length === 0) {
      const sampleSummaries: QualificationSummary[] = [
        {
          opportunity_id: '1',
          total_score: 185,
          risk_level: 'medium',
          last_updated: new Date('2024-01-10'),
          completion_percentage: 78,
          stage_readiness: { prospect: true, engage: true, acquire: false, keep: false },
          next_actions: ['Identify Economic Buyer', 'Quantify Business Impact']
        },
        {
          opportunity_id: '2',
          total_score: 95,
          risk_level: 'high',
          last_updated: new Date('2024-01-08'),
          completion_percentage: 45,
          stage_readiness: { prospect: true, engage: false, acquire: false, keep: false },
          next_actions: ['Develop Champion', 'Understand Decision Criteria']
        },
        {
          opportunity_id: '3',
          total_score: 275,
          risk_level: 'low',
          last_updated: new Date('2024-01-12'),
          completion_percentage: 92,
          stage_readiness: { prospect: true, engage: true, acquire: true, keep: false },
          next_actions: ['Finalize Paper Process', 'Prepare for Closing']
        }
      ];
      setAssessmentSummaries(sampleSummaries);
    }
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || opp.stage === filterStage;
    
    let matchesRisk = true;
    if (filterRisk !== 'all') {
      const summary = assessmentSummaries.find(s => s.opportunity_id === opp.id);
      matchesRisk = summary?.risk_level === filterRisk;
    }
    
    return matchesSearch && matchesStage && matchesRisk;
  });

  const getOpportunitySummary = (opportunityId: string): QualificationSummary | undefined => {
    return assessmentSummaries.find(s => s.opportunity_id === opportunityId);
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

  const calculatePipelineHealth = () => {
    const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    const qualifiedValue = opportunities
      .filter(opp => {
        const summary = getOpportunitySummary(opp.id);
        return summary && summary.total_score >= 160; // Moderate qualification threshold
      })
      .reduce((sum, opp) => sum + opp.value, 0);

    const highRiskDeals = assessmentSummaries.filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length;
    const avgCompletionRate = assessmentSummaries.reduce((sum, s) => sum + s.completion_percentage, 0) / Math.max(assessmentSummaries.length, 1);

    return {
      totalValue,
      qualifiedValue,
      qualificationRate: Math.round((qualifiedValue / totalValue) * 100),
      highRiskDeals,
      avgCompletionRate: Math.round(avgCompletionRate)
    };
  };

  const pipelineHealth = calculatePipelineHealth();

  const handleStartAssessment = (opportunityId: string) => {
    setSelectedOpportunity(opportunityId);
    setCurrentView('assessment');
  };

  const exportPipelineReport = () => {
    const report = {
      generated_at: new Date(),
      pipeline_health: pipelineHealth,
      opportunities: filteredOpportunities.map(opp => ({
        ...opp,
        qualification_summary: getOpportunitySummary(opp.id)
      })),
      insights: insights
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-qualification-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Pipeline report exported successfully');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Pipeline Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">${(pipelineHealth.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualified Pipeline</p>
                <p className="text-2xl font-bold text-green-600">{pipelineHealth.qualificationRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Deals</p>
                <p className="text-2xl font-bold text-orange-600">{pipelineHealth.highRiskDeals}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold text-blue-600">{pipelineHealth.avgCompletionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Filter size={24} />
            Filter & Search Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Opportunities</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by opportunity name or company..."
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
                  <SelectValue placeholder="All Stages" />
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
                  <SelectValue placeholder="All Risk Levels" />
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
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3">
              <Users size={24} />
              Pipeline Opportunities ({filteredOpportunities.length})
            </CardTitle>
            <Button onClick={exportPipelineReport} variant="outline">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOpportunities.map((opportunity) => {
              const summary = getOpportunitySummary(opportunity.id);
              
              return (
                <div key={opportunity.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{opportunity.name}</h3>
                      <p className="text-sm text-muted-foreground">{opportunity.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(opportunity.value / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-muted-foreground">{opportunity.probability}% probability</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getStageBadgeColor(opportunity.stage)}>
                      {opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}
                    </Badge>
                    {summary && (
                      <Badge className={getRiskBadgeColor(summary.risk_level)}>
                        {summary.risk_level.charAt(0).toUpperCase() + summary.risk_level.slice(1)} Risk
                      </Badge>
                    )}
                    <Badge variant={opportunity.priority === 'critical' ? 'destructive' : 'outline'}>
                      {opportunity.priority.charAt(0).toUpperCase() + opportunity.priority.slice(1)} Priority
                    </Badge>
                  </div>

                  {summary && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Qualification Score</span>
                        <span className="font-medium">{summary.total_score}/320</span>
                      </div>
                      <Progress value={(summary.total_score / 320) * 100} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Assessment Completion</span>
                        <span className="font-medium">{summary.completion_percentage}%</span>
                      </div>
                      <Progress value={summary.completion_percentage} className="h-2" />
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Last activity: {opportunity.lastActivity.toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      {summary ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartAssessment(opportunity.id)}
                        >
                          <RefreshCw size={16} className="mr-2" />
                          Update Assessment
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleStartAssessment(opportunity.id)}
                        >
                          <Target size={16} className="mr-2" />
                          Start Assessment
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <FileText size={16} />
                      </Button>
                    </div>
                  </div>

                  {summary && summary.next_actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium mb-2">Next Actions:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {summary.next_actions.slice(0, 2).map((action, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Zap size={12} className="text-primary" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOpportunities.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No opportunities found</p>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Brain size={24} />
            Pipeline Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">Strengths</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Award size={20} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">High-Value Pipeline</p>
                    <p className="text-sm text-muted-foreground">Strong deal sizes with good probability scores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp size={20} className="text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Progressive Qualification</p>
                    <p className="text-sm text-muted-foreground">Deals advancing through stages with proper qualification</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-orange-600">Areas for Improvement</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle size={20} className="text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Incomplete Assessments</p>
                    <p className="text-sm text-muted-foreground">Some opportunities need complete qualification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Clock size={20} className="text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Stale Opportunities</p>
                    <p className="text-sm text-muted-foreground">Several deals haven't been updated recently</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recommended Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Immediate (This Week)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-yellow-500" />
                    Complete assessments for high-value opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-yellow-500" />
                    Review and update stale opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-yellow-500" />
                    Schedule champion meetings for weak deals
                  </li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Strategic (This Month)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-blue-500" />
                    Develop systematic qualification process
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-blue-500" />
                    Train team on MEDDPICC best practices
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-blue-500" />
                    Implement regular assessment reviews
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (currentView === 'assessment' && selectedOpportunity) {
    const opportunity = opportunities.find(opp => opp.id === selectedOpportunity);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MEDDPICC Assessment</h1>
            {opportunity && (
              <p className="text-muted-foreground">
                {opportunity.name} - {opportunity.company}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        
        <MEDDPICCModule />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target size={32} className="text-primary" />
            Qualification Assessment Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete and track MEDDPICC qualification assessments for your sales pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportPipelineReport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share size={16} className="mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Health</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {renderDashboard()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {renderInsights()}
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 size={24} />
                Pipeline Health Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Pipeline Analytics</p>
                <p className="text-muted-foreground">Detailed pipeline health metrics and trends</p>
                <Button className="mt-4" variant="outline">
                  <BarChart3 size={16} className="mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}