import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useKV } from '@github/spark/hooks';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Users,
  DollarSign,
  Clock,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  MEDDPICCAssessment,
  MEDDPICCTrend,
  MEDDPICCInsight,
  MEDDPICCScoringService
} from '../../services/meddpicc-scoring-service';

interface OpportunityData {
  id: string;
  name: string;
  value: number;
  stage: string;
  probability: number;
  industry: string;
  created_date: Date;
}

interface AnalyticsFilter {
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  stage?: string;
  industry?: string;
  dealSize?: string;
  riskLevel?: string;
}

export function EnhancedMEDDPICCAnalytics() {
  const [assessments, setAssessments] = useKV<MEDDPICCAssessment[]>('meddpicc-assessments', []);
  const [opportunities, setOpportunities] = useKV<OpportunityData[]>('opportunities-data', []);
  const [trends, setTrends] = useKV<MEDDPICCTrend[]>('meddpicc-trends', []);
  const [filter, setFilter] = useState<AnalyticsFilter>({ timeRange: 'month' });
  const [selectedMetric, setSelectedMetric] = useState<string>('score-distribution');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize sample data
  useEffect(() => {
    if (assessments.length === 0) {
      initializeSampleData();
    }
  }, []);

  const initializeSampleData = () => {
    // Generate sample assessments and opportunities
    const sampleOpportunities: OpportunityData[] = [
      {
        id: '1',
        name: 'Enterprise Software License',
        value: 250000,
        stage: 'engage',
        probability: 75,
        industry: 'Technology',
        created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Healthcare Platform',
        value: 180000,
        stage: 'acquire',
        probability: 60,
        industry: 'Healthcare',
        created_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Manufacturing Solution',
        value: 320000,
        stage: 'prospect',
        probability: 30,
        industry: 'Manufacturing',
        created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    ];

    const sampleAssessments: MEDDPICCAssessment[] = sampleOpportunities.map((opp, index) => {
      const baseScore = 150 + (index * 50);
      return MEDDPICCScoringService.calculateAdvancedScoring({
        id: `assessment-${opp.id}`,
        opportunity_id: opp.id,
        answers: [],
        pillar_scores: {
          'metrics': baseScore / 8 + Math.random() * 20,
          'economic_buyer': baseScore / 8 + Math.random() * 20,
          'decision_criteria': baseScore / 8 + Math.random() * 20,
          'decision_process': baseScore / 8 + Math.random() * 20,
          'paper_process': baseScore / 8 + Math.random() * 20,
          'implicate_the_pain': baseScore / 8 + Math.random() * 20,
          'champion': baseScore / 8 + Math.random() * 20,
          'competition': baseScore / 8 + Math.random() * 20
        },
        total_score: baseScore,
        confidence_score: 70 + Math.random() * 25,
        created_by: 'demo-user'
      });
    });

    setOpportunities(sampleOpportunities);
    setAssessments(sampleAssessments);
    
    toast.success('Sample MEDDPICC analytics data loaded');
  };

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    const now = new Date();
    const timeRanges = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const cutoffDate = new Date(now.getTime() - timeRanges[filter.timeRange] * 24 * 60 * 60 * 1000);

    return {
      assessments: assessments.filter(assessment => {
        const opportunity = opportunities.find(o => o.id === assessment.opportunity_id);
        if (!opportunity || opportunity.created_date < cutoffDate) return false;
        
        if (filter.stage && opportunity.stage !== filter.stage) return false;
        if (filter.industry && opportunity.industry !== filter.industry) return false;
        if (filter.riskLevel && assessment.risk_level !== filter.riskLevel) return false;
        
        return true;
      }),
      opportunities: opportunities.filter(opp => {
        if (opp.created_date < cutoffDate) return false;
        if (filter.stage && opp.stage !== filter.stage) return false;
        if (filter.industry && opp.industry !== filter.industry) return false;
        
        return true;
      })
    };
  }, [assessments, opportunities, filter]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const { assessments: filteredAssessments, opportunities: filteredOpportunities } = filteredData;
    
    // Score distribution
    const scoreDistribution = {
      strong: filteredAssessments.filter(a => a.total_score >= 256).length,
      moderate: filteredAssessments.filter(a => a.total_score >= 192 && a.total_score < 256).length,
      weak: filteredAssessments.filter(a => a.total_score < 192).length
    };

    // Risk distribution
    const riskDistribution = {
      low: filteredAssessments.filter(a => a.risk_level === 'low').length,
      medium: filteredAssessments.filter(a => a.risk_level === 'medium').length,
      high: filteredAssessments.filter(a => a.risk_level === 'high').length,
      critical: filteredAssessments.filter(a => a.risk_level === 'critical').length
    };

    // Average scores by pillar
    const pillarAverages: Record<string, number> = {};
    const pillars = ['metrics', 'economic_buyer', 'decision_criteria', 'decision_process', 
                    'paper_process', 'implicate_the_pain', 'champion', 'competition'];
    
    pillars.forEach(pillar => {
      const scores = filteredAssessments.map(a => a.pillar_scores[pillar] || 0);
      pillarAverages[pillar] = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    });

    // Stage readiness analysis
    const stageReadiness = {
      prospect: filteredAssessments.filter(a => a.stage_readiness?.prospect).length,
      engage: filteredAssessments.filter(a => a.stage_readiness?.engage).length,
      acquire: filteredAssessments.filter(a => a.stage_readiness?.acquire).length,
      keep: filteredAssessments.filter(a => a.stage_readiness?.keep).length
    };

    // Win rate by score range
    const winRateAnalysis = {
      strong: {
        total: filteredAssessments.filter(a => a.total_score >= 256).length,
        won: filteredOpportunities.filter(o => {
          const assessment = filteredAssessments.find(a => a.opportunity_id === o.id);
          return assessment?.total_score >= 256 && o.probability >= 80;
        }).length
      },
      moderate: {
        total: filteredAssessments.filter(a => a.total_score >= 192 && a.total_score < 256).length,
        won: filteredOpportunities.filter(o => {
          const assessment = filteredAssessments.find(a => a.opportunity_id === o.id);
          return assessment?.total_score >= 192 && assessment?.total_score < 256 && o.probability >= 80;
        }).length
      },
      weak: {
        total: filteredAssessments.filter(a => a.total_score < 192).length,
        won: filteredOpportunities.filter(o => {
          const assessment = filteredAssessments.find(a => a.opportunity_id === o.id);
          return assessment && assessment.total_score < 192 && o.probability >= 80;
        }).length
      }
    };

    // Deal value by qualification strength
    const valueByStrength = {
      strong: filteredOpportunities.filter(o => {
        const assessment = filteredAssessments.find(a => a.opportunity_id === o.id);
        return assessment?.total_score >= 256;
      }).reduce((sum, o) => sum + o.value, 0),
      moderate: filteredOpportunities.filter(o => {
        const assessment = filteredAssessments.find(a => a.opportunity_id === o.id);
        return assessment?.total_score >= 192 && assessment?.total_score < 256;
      }).reduce((sum, o) => sum + o.value, 0),
      weak: filteredOpportunities.filter(o => {
        const assessment = filteredAssessments.find(a => a.opportunity_id === o.id);
        return assessment && assessment.total_score < 192;
      }).reduce((sum, o) => sum + o.value, 0)
    };

    return {
      scoreDistribution,
      riskDistribution,
      pillarAverages,
      stageReadiness,
      winRateAnalysis,
      valueByStrength,
      totalOpportunities: filteredOpportunities.length,
      totalValue: filteredOpportunities.reduce((sum, o) => sum + o.value, 0),
      averageScore: filteredAssessments.length > 0 ? 
        filteredAssessments.reduce((sum, a) => sum + a.total_score, 0) / filteredAssessments.length : 0,
      averageConfidence: filteredAssessments.length > 0 ?
        filteredAssessments.reduce((sum, a) => sum + a.confidence_score, 0) / filteredAssessments.length : 0
    };
  }, [filteredData]);

  // Generate insights for all assessments
  const insights = useMemo(() => {
    const allInsights: MEDDPICCInsight[] = [];
    
    filteredData.assessments.forEach(assessment => {
      const assessmentInsights = MEDDPICCScoringService.generateInsights(assessment);
      allInsights.push(...assessmentInsights);
    });

    // Group and prioritize insights
    return allInsights
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10); // Top 10 insights
  }, [filteredData.assessments]);

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success('Analytics data refreshed');
  };

  const exportAnalytics = () => {
    const exportData = {
      analytics,
      insights,
      filter,
      generated_at: new Date(),
      assessments: filteredData.assessments,
      opportunities: filteredData.opportunities
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meddpicc-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analytics exported successfully');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 size={32} className="text-primary" />
            MEDDPICC Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced sales qualification analytics and performance tracking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <RefreshCw size={16} className={cn("mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={filter.timeRange} onValueChange={(value: any) => setFilter(prev => ({ ...prev, timeRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stage</label>
              <Select value={filter.stage || 'all'} onValueChange={(value) => setFilter(prev => ({ ...prev, stage: value === 'all' ? undefined : value }))}>
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
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={filter.industry || 'all'} onValueChange={(value) => setFilter(prev => ({ ...prev, industry: value === 'all' ? undefined : value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Financial Services">Financial Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Risk Level</label>
              <Select value={filter.riskLevel || 'all'} onValueChange={(value) => setFilter(prev => ({ ...prev, riskLevel: value === 'all' ? undefined : value }))}>
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
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{analytics.totalOpportunities}</p>
              </div>
              <Users size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold">${(analytics.totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average MEDDPICC Score</p>
                <p className="text-2xl font-bold">{Math.round(analytics.averageScore)}</p>
              </div>
              <Target size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Confidence</p>
                <p className="text-2xl font-bold">{Math.round(analytics.averageConfidence)}%</p>
              </div>
              <Award size={24} className="text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="score-distribution">Score Distribution</TabsTrigger>
          <TabsTrigger value="pillar-analysis">Pillar Analysis</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="score-distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Qualification Strength Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Strong (256+)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{analytics.scoreDistribution.strong}</span>
                      <Progress value={(analytics.scoreDistribution.strong / analytics.totalOpportunities) * 100} className="w-20 ml-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Moderate (192-255)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{analytics.scoreDistribution.moderate}</span>
                      <Progress value={(analytics.scoreDistribution.moderate / analytics.totalOpportunities) * 100} className="w-20 ml-2" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Weak (0-191)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold">{analytics.scoreDistribution.weak}</span>
                      <Progress value={(analytics.scoreDistribution.weak / analytics.totalOpportunities) * 100} className="w-20 ml-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Value by Qualification Strength */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Value by Qualification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Strong Qualification</span>
                    <span className="text-sm font-bold">${(analytics.valueByStrength.strong / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={(analytics.valueByStrength.strong / analytics.totalValue) * 100} className="bg-green-100" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Moderate Qualification</span>
                    <span className="text-sm font-bold">${(analytics.valueByStrength.moderate / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={(analytics.valueByStrength.moderate / analytics.totalValue) * 100} className="bg-yellow-100" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weak Qualification</span>
                    <span className="text-sm font-bold">${(analytics.valueByStrength.weak / 1000000).toFixed(1)}M</span>
                  </div>
                  <Progress value={(analytics.valueByStrength.weak / analytics.totalValue) * 100} className="bg-red-100" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pillar-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Pillar Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analytics.pillarAverages).map(([pillar, average]) => (
                  <div key={pillar} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">{pillar.replace('_', ' ')}</span>
                      <span className="text-sm font-bold">{Math.round(average)}/40</span>
                    </div>
                    <Progress value={(average / 40) * 100} />
                    <div className="text-xs text-muted-foreground">
                      {average >= 32 ? 'Excellent' : average >= 24 ? 'Good' : average >= 16 ? 'Needs Improvement' : 'Critical'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.riskDistribution).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          level === 'low' && "bg-green-500",
                          level === 'medium' && "bg-yellow-500",
                          level === 'high' && "bg-orange-500",
                          level === 'critical' && "bg-red-500"
                        )}></div>
                        <span className="text-sm font-medium capitalize">{level} Risk</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">{count}</span>
                        <Progress 
                          value={(count / analytics.totalOpportunities) * 100} 
                          className="w-20 ml-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.stageReadiness).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{stage} Ready</span>
                      <div className="text-right">
                        <span className="text-sm font-bold">{count}</span>
                        <Progress 
                          value={(count / analytics.totalOpportunities) * 100} 
                          className="w-20 ml-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <Alert key={index} className={cn(
                      insight.type === 'risk' && "border-red-200 bg-red-50",
                      insight.type === 'weakness' && "border-orange-200 bg-orange-50",
                      insight.type === 'opportunity' && "border-blue-200 bg-blue-50",
                      insight.type === 'strength' && "border-green-200 bg-green-50"
                    )}>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1 rounded-full",
                          insight.type === 'risk' && "bg-red-100",
                          insight.type === 'weakness' && "bg-orange-100",
                          insight.type === 'opportunity' && "bg-blue-100",
                          insight.type === 'strength' && "bg-green-100"
                        )}>
                          {insight.type === 'risk' && <AlertTriangle size={16} className="text-red-600" />}
                          {insight.type === 'weakness' && <TrendingDown size={16} className="text-orange-600" />}
                          {insight.type === 'opportunity' && <TrendingUp size={16} className="text-blue-600" />}
                          {insight.type === 'strength' && <Award size={16} className="text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{insight.description}</span>
                            <Badge variant={
                              insight.priority === 'critical' ? 'destructive' :
                              insight.priority === 'high' ? 'secondary' :
                              'outline'
                            }>
                              {insight.priority}
                            </Badge>
                          </div>
                          <AlertDescription className="text-xs">
                            <strong>Recommendation:</strong> {insight.recommendation}
                          </AlertDescription>
                          <div className="text-xs text-muted-foreground mt-1">
                            <strong>Impact:</strong> {insight.impact}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}