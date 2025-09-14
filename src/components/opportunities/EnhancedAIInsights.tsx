import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Lightbulb, 
  TrendUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Clock,
  Shield,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkle
} from '@phosphor-icons/react';
import { Opportunity, Company, Contact } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnhancedAIInsightsProps {
  opportunity: Partial<Opportunity>;
  company?: Company;
  contact?: Contact;
  onInsightsGenerated?: (insights: any) => void;
  className?: string;
}

interface AIInsights {
  riskScore: number;
  nextBestActions: string[];
  predictedCloseDate?: Date;
  confidenceLevel: 'low' | 'medium' | 'high';
  competitorAnalysis?: any;
  lastAiUpdate: Date;
  dealHealth?: {
    score: number;
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative' | 'neutral';
      score: number;
      description: string;
    }>;
  };
  recommendations?: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    reasoning: string;
    expectedImpact: number;
    timeframe: string;
  }>;
}

interface PredictiveAnalysis {
  probabilityAdjustment: number;
  timelineRisk: 'low' | 'medium' | 'high';
  budgetRisk: 'low' | 'medium' | 'high';
  competitorThreat: 'low' | 'medium' | 'high';
  stakeholderEngagement: 'low' | 'medium' | 'high';
  keyRisks: string[];
  opportunities: string[];
}

export function EnhancedAIInsights({ 
  opportunity, 
  company, 
  contact, 
  onInsightsGenerated,
  className 
}: EnhancedAIInsightsProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const generateComprehensiveInsights = async () => {
    if (!company || !contact || !opportunity.title) {
      toast.error('Please complete basic opportunity, company, and contact information first');
      return;
    }

    setGenerating(true);
    try {
      // Generate AI insights
      const aiInsights = await AIService.analyzeOpportunity(
        opportunity as Opportunity, 
        contact, 
        company
      );

      // Enhanced insights with additional analysis
      const enhancedInsights: AIInsights = {
        ...aiInsights,
        dealHealth: await generateDealHealthScore(),
        recommendations: await generatePrioritizedRecommendations()
      };

      // Generate predictive analysis
      const predictive = await generatePredictiveAnalysis();

      setInsights(enhancedInsights);
      setPredictiveAnalysis(predictive);
      setLastGenerated(new Date());

      if (onInsightsGenerated) {
        onInsightsGenerated(enhancedInsights);
      }

      toast.success('AI insights generated successfully');
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setGenerating(false);
    }
  };

  const generateDealHealthScore = async (): Promise<AIInsights['dealHealth']> => {
    // Mock implementation - in real app, this would call AI service
    const meddpicScore = opportunity.meddpicc?.score || 0;
    const stageProgress = getStageProgress(opportunity.stage || 'prospect');
    
    return {
      score: Math.round((meddpicScore * 0.6 + stageProgress * 0.4)),
      factors: [
        {
          name: 'MEDDPICC Qualification',
          impact: meddpicScore > 70 ? 'positive' : meddpicScore > 40 ? 'neutral' : 'negative',
          score: meddpicScore,
          description: `Qualification completeness at ${meddpicScore}%`
        },
        {
          name: 'Stage Progression',
          impact: stageProgress > 60 ? 'positive' : 'neutral',
          score: stageProgress,
          description: `Deal is progressing through sales stages`
        },
        {
          name: 'Timeline Alignment',
          impact: isTimelineRealistic() ? 'positive' : 'negative',
          score: isTimelineRealistic() ? 80 : 40,
          description: isTimelineRealistic() ? 'Close date appears realistic' : 'Close date may be aggressive'
        }
      ]
    };
  };

  const generatePrioritizedRecommendations = async (): Promise<AIInsights['recommendations']> => {
    const recommendations: AIInsights['recommendations'] = [];
    
    // Analyze MEDDPICC gaps
    if (!opportunity.meddpicc?.champion || opportunity.meddpicc.champion.length < 10) {
      recommendations.push({
        priority: 'high',
        action: 'Identify and develop a strong internal champion',
        reasoning: 'No clear champion identified - critical for deal success',
        expectedImpact: 85,
        timeframe: '1-2 weeks'
      });
    }

    if (!opportunity.meddpicc?.metrics || opportunity.meddpicc.metrics.length < 20) {
      recommendations.push({
        priority: 'high',
        action: 'Quantify business metrics and ROI',
        reasoning: 'Clear metrics needed to justify investment',
        expectedImpact: 75,
        timeframe: '1 week'
      });
    }

    if (!opportunity.meddpicc?.economicBuyer || opportunity.meddpicc.economicBuyer.length < 10) {
      recommendations.push({
        priority: 'medium',
        action: 'Identify and engage the economic buyer',
        reasoning: 'Need access to final decision maker',
        expectedImpact: 70,
        timeframe: '2-3 weeks'
      });
    }

    return recommendations;
  };

  const generatePredictiveAnalysis = async (): Promise<PredictiveAnalysis> => {
    const currentProb = opportunity.probability || 50;
    const meddpicScore = opportunity.meddpicc?.score || 0;
    
    // Calculate probability adjustment based on qualification
    const probabilityAdjustment = meddpicScore > 70 ? 15 : meddpicScore < 40 ? -20 : 0;
    
    return {
      probabilityAdjustment,
      timelineRisk: getTimelineRisk(),
      budgetRisk: getBudgetRisk(),
      competitorThreat: getCompetitorThreat(),
      stakeholderEngagement: getStakeholderEngagement(),
      keyRisks: identifyKeyRisks(),
      opportunities: identifyOpportunities()
    };
  };

  const getStageProgress = (stage: string): number => {
    const stageMap: Record<string, number> = {
      'prospect': 25,
      'engage': 50,
      'acquire': 75,
      'keep': 100
    };
    return stageMap[stage] || 25;
  };

  const isTimelineRealistic = (): boolean => {
    if (!opportunity.expectedCloseDate) return false;
    const daysUntilClose = Math.ceil((new Date(opportunity.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const stage = opportunity.stage || 'prospect';
    
    // Minimum realistic timelines by stage
    const minDays: Record<string, number> = {
      'prospect': 60,
      'engage': 30,
      'acquire': 15,
      'keep': 0
    };
    
    return daysUntilClose >= (minDays[stage] || 60);
  };

  const getTimelineRisk = (): 'low' | 'medium' | 'high' => {
    return isTimelineRealistic() ? 'low' : 'high';
  };

  const getBudgetRisk = (): 'low' | 'medium' | 'high' => {
    const hasMetrics = opportunity.meddpicc?.metrics && opportunity.meddpicc.metrics.length > 20;
    const hasEconomicBuyer = opportunity.meddpicc?.economicBuyer && opportunity.meddpicc.economicBuyer.length > 10;
    
    if (hasMetrics && hasEconomicBuyer) return 'low';
    if (hasMetrics || hasEconomicBuyer) return 'medium';
    return 'high';
  };

  const getCompetitorThreat = (): 'low' | 'medium' | 'high' => {
    // Simple heuristic - in real app, this would be based on competitive intelligence
    const dealSize = opportunity.value || 0;
    if (dealSize > 100000) return 'high';
    if (dealSize > 50000) return 'medium';
    return 'low';
  };

  const getStakeholderEngagement = (): 'low' | 'medium' | 'high' => {
    const hasChampion = opportunity.meddpicc?.champion && opportunity.meddpicc.champion.length > 10;
    const hasDecisionProcess = opportunity.meddpicc?.decisionProcess && opportunity.meddpicc.decisionProcess.length > 20;
    
    if (hasChampion && hasDecisionProcess) return 'high';
    if (hasChampion || hasDecisionProcess) return 'medium';
    return 'low';
  };

  const identifyKeyRisks = (): string[] => {
    const risks: string[] = [];
    
    if (!opportunity.meddpicc?.champion || opportunity.meddpicc.champion.length < 10) {
      risks.push('No identified internal champion');
    }
    
    if (!isTimelineRealistic()) {
      risks.push('Aggressive timeline for close date');
    }
    
    if (!opportunity.meddpicc?.economicBuyer || opportunity.meddpicc.economicBuyer.length < 10) {
      risks.push('Economic buyer not identified');
    }
    
    if (getBudgetRisk() === 'high') {
      risks.push('Budget authority unclear');
    }
    
    return risks;
  };

  const identifyOpportunities = (): string[] => {
    const opportunities: string[] = [];
    
    if (company?.size === 'Large') {
      opportunities.push('Enterprise expansion potential');
    }
    
    if (opportunity.value && opportunity.value > 75000) {
      opportunities.push('High-value deal with strategic importance');
    }
    
    if (opportunity.stage === 'engage') {
      opportunities.push('Active engagement phase - prime for advancement');
    }
    
    opportunities.push('Cross-sell and upsell potential post-close');
    
    return opportunities;
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return CheckCircle;
      case 'medium': return Minus;
      case 'high': return AlertTriangle;
      default: return Minus;
    }
  };

  const canGenerate = company && contact && opportunity.title;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Generate Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-primary" />
              <CardTitle>AI-Powered Deal Analysis</CardTitle>
            </div>
            <Button 
              onClick={generateComprehensiveInsights}
              disabled={generating || !canGenerate}
              className="flex items-center gap-2"
            >
              <Sparkle size={16} />
              {generating ? 'Analyzing...' : 'Generate AI Insights'}
            </Button>
          </div>
          <CardDescription>
            Get comprehensive AI analysis with risk assessment and strategic recommendations
          </CardDescription>
          {!canGenerate && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete opportunity title, company, and contact information to generate AI insights
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      {/* Insights Display */}
      {insights && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Deal Health</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield size={16} />
                    Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "text-2xl font-bold",
                    insights.riskScore > 70 ? 'text-red-600' : 
                    insights.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                  )}>
                    {insights.riskScore}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {insights.riskScore > 70 ? 'High Risk' : 
                     insights.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendUp size={16} />
                    Confidence Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={
                      insights.confidenceLevel === 'high' ? 'default' :
                      insights.confidenceLevel === 'medium' ? 'secondary' : 'outline'
                    }
                    className="text-sm"
                  >
                    {insights.confidenceLevel.toUpperCase()}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-2">
                    AI Prediction Confidence
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock size={16} />
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    {lastGenerated?.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {lastGenerated?.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={16} />
                  Immediate Next Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.nextBestActions.slice(0, 4).map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-6 space-y-6">
            {insights.dealHealth && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={20} />
                        Deal Health Score
                      </div>
                      <Badge variant={insights.dealHealth.score >= 70 ? 'default' : 'secondary'}>
                        {insights.dealHealth.score}%
                      </Badge>
                    </CardTitle>
                    <Progress value={insights.dealHealth.score} className="mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.dealHealth.factors.map((factor, index) => {
                        const Icon = factor.impact === 'positive' ? CheckCircle : 
                                   factor.impact === 'negative' ? AlertTriangle : Minus;
                        const colorClass = factor.impact === 'positive' ? 'text-green-600' : 
                                          factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600';
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon size={18} className={colorClass} />
                              <div>
                                <div className="font-medium">{factor.name}</div>
                                <div className="text-sm text-muted-foreground">{factor.description}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn("font-medium", colorClass)}>
                                {factor.score}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="predictive" className="mt-6 space-y-6">
            {predictiveAnalysis && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Timeline Risk', value: predictiveAnalysis.timelineRisk, icon: Clock },
                    { label: 'Budget Risk', value: predictiveAnalysis.budgetRisk, icon: DollarSign },
                    { label: 'Competitor Threat', value: predictiveAnalysis.competitorThreat, icon: Shield },
                    { label: 'Stakeholder Engagement', value: predictiveAnalysis.stakeholderEngagement, icon: Users }
                  ].map((item, index) => {
                    const Icon = getRiskIcon(item.value);
                    const colorClass = getRiskColor(item.value);
                    
                    return (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <item.icon size={16} />
                            {item.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Icon size={16} className={colorClass} />
                            <span className={cn("font-medium capitalize", colorClass)}>
                              {item.value}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {predictiveAnalysis.probabilityAdjustment !== 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendUp size={16} />
                        Probability Adjustment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {predictiveAnalysis.probabilityAdjustment > 0 ? (
                          <ArrowUp className="text-green-600" size={20} />
                        ) : (
                          <ArrowDown className="text-red-600" size={20} />
                        )}
                        <span className={cn(
                          "text-lg font-medium",
                          predictiveAnalysis.probabilityAdjustment > 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                          {predictiveAnalysis.probabilityAdjustment > 0 ? '+' : ''}{predictiveAnalysis.probabilityAdjustment}%
                        </span>
                        <span className="text-muted-foreground">
                          Suggested probability adjustment based on qualification
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-600" />
                        Key Risks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {predictiveAnalysis.keyRisks.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <AlertTriangle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                            {risk}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600" />
                        Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {predictiveAnalysis.opportunities.map((opportunity, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                            {opportunity}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="actions" className="mt-6 space-y-6">
            {insights.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target size={16} />
                    Prioritized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Strategic actions ranked by impact and urgency
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              rec.priority === 'high' ? 'destructive' :
                              rec.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <span className="font-medium">{rec.action}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rec.timeframe}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <TrendUp size={12} />
                            Expected Impact: {rec.expectedImpact}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}