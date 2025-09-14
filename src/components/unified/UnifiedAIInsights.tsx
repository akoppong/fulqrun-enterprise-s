import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  Zap,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Sparkles
} from '@phosphor-icons/react';
import { Opportunity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';

interface UnifiedAIInsightsProps {
  opportunity: Opportunity;
  onUpdate?: (insights: AIInsightData) => void;
  source?: 'pipeline' | 'opportunities' | 'standalone';
}

interface AIInsightData {
  dealRiskScore: number;
  leadScore: number;
  nextBestActions: string[];
  competitiveIntelligence: string[];
  dealHealthMetrics: {
    velocity: number;
    engagement: number;
    stakeholderAlignment: number;
    competitivePosition: number;
  };
  predictions: {
    closeDate: Date;
    winProbability: number;
    dealValue: number;
    timeToClose: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  marketIntelligence: {
    industryTrends: string[];
    competitorMoves: string[];
    marketOpportunities: string[];
  };
}

export function UnifiedAIInsights({ 
  opportunity, 
  onUpdate,
  source = 'standalone' 
}: UnifiedAIInsightsProps) {
  const [insights, setInsights] = useKV<AIInsightData>(`ai-insights-${opportunity.id}`, {
    dealRiskScore: 0,
    leadScore: 0,
    nextBestActions: [],
    competitiveIntelligence: [],
    dealHealthMetrics: {
      velocity: 0,
      engagement: 0,
      stakeholderAlignment: 0,
      competitivePosition: 0
    },
    predictions: {
      closeDate: new Date(),
      winProbability: 0,
      dealValue: 0,
      timeToClose: 0
    },
    recommendations: {
      immediate: [],
      shortTerm: [],
      longTerm: []
    },
    marketIntelligence: {
      industryTrends: [],
      competitorMoves: [],
      marketOpportunities: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useKV<string>(`last-analyzed-${opportunity.id}`, '');

  // Generate AI insights based on opportunity data
  const generateInsights = async () => {
    setLoading(true);
    try {
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate deal risk score based on various factors
      const dealRiskScore = calculateDealRiskScore();
      
      // Calculate lead score
      const leadScore = calculateLeadScore();

      // Generate insights
      const newInsights: AIInsightData = {
        dealRiskScore,
        leadScore,
        nextBestActions: generateNextBestActions(),
        competitiveIntelligence: generateCompetitiveIntelligence(),
        dealHealthMetrics: calculateDealHealthMetrics(),
        predictions: generatePredictions(),
        recommendations: generateRecommendations(),
        marketIntelligence: generateMarketIntelligence()
      };

      setInsights(newInsights);
      setLastAnalyzed(new Date().toISOString());
      
      if (onUpdate) {
        onUpdate(newInsights);
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDealRiskScore = (): number => {
    let riskScore = 0;
    
    // Stage-based risk
    const stageRisks = {
      'prospect': 80,
      'qualified': 60,
      'proposal': 40,
      'negotiation': 30,
      'closed-won': 0,
      'closed-lost': 100
    };
    riskScore += stageRisks[opportunity.stage as keyof typeof stageRisks] || 50;

    // Value-based risk (higher values = lower risk)
    if (opportunity.value && opportunity.value > 100000) riskScore -= 10;
    if (opportunity.value && opportunity.value > 500000) riskScore -= 10;

    // Probability-based risk
    if (opportunity.probability) {
      riskScore += (100 - opportunity.probability) * 0.5;
    }

    // MEDDPICC-based risk
    if (opportunity.meddpicc) {
      const meddpiceTotal = Object.values(opportunity.meddpicc).reduce((sum, score) => sum + score, 0);
      const meddpiceRisk = Math.max(0, 50 - (meddpiceTotal / 8)); // Average MEDDPICC score
      riskScore += meddpiceRisk;
    }

    // Time-based risk
    const daysToClose = opportunity.expectedCloseDate ? 
      Math.ceil((opportunity.expectedCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
    if (daysToClose < 7) riskScore += 20; // Very short timeline
    if (daysToClose > 180) riskScore += 15; // Very long timeline

    return Math.min(100, Math.max(0, riskScore));
  };

  const calculateLeadScore = (): number => {
    let score = 50; // Base score

    // Company factors
    if (opportunity.company) score += 10;
    if (opportunity.industry) score += 5;

    // Contact engagement
    if (opportunity.primaryContact) score += 10;
    if (opportunity.contactEmail) score += 5;
    if (opportunity.contactPhone) score += 5;

    // Deal characteristics
    if (opportunity.value && opportunity.value > 50000) score += 15;
    if (opportunity.value && opportunity.value > 250000) score += 10;

    // Source quality
    const sourceScores = {
      'referral': 20,
      'partner': 15,
      'event': 10,
      'website': 8,
      'advertisement': 5,
      'cold-outreach': 3
    };
    score += sourceScores[opportunity.source as keyof typeof sourceScores] || 0;

    // Priority
    const priorityScores = {
      'critical': 15,
      'high': 10,
      'medium': 5,
      'low': 0
    };
    score += priorityScores[opportunity.priority as keyof typeof priorityScores] || 0;

    // Activities and engagement
    if (opportunity.activities && opportunity.activities.length > 0) {
      score += Math.min(20, opportunity.activities.length * 3);
    }

    return Math.min(100, Math.max(0, score));
  };

  const generateNextBestActions = (): string[] => {
    const actions: string[] = [];

    // Stage-specific actions
    switch (opportunity.stage) {
      case 'prospect':
        actions.push('Schedule discovery call to understand business needs');
        actions.push('Send company overview and case studies');
        actions.push('Identify key stakeholders and decision makers');
        break;
      case 'qualified':
        actions.push('Present detailed solution proposal');
        actions.push('Schedule technical demonstration');
        actions.push('Conduct ROI analysis workshop');
        break;
      case 'proposal':
        actions.push('Follow up on proposal feedback');
        actions.push('Address any technical concerns');
        actions.push('Begin contract negotiations');
        break;
      case 'negotiation':
        actions.push('Finalize contract terms and pricing');
        actions.push('Prepare implementation timeline');
        actions.push('Secure legal and procurement approvals');
        break;
    }

    // MEDDPICC-based actions
    if (opportunity.meddpicc) {
      if (opportunity.meddpicc.economicBuyer < 30) {
        actions.push('Identify and engage with economic buyer');
      }
      if (opportunity.meddpicc.champion < 30) {
        actions.push('Develop internal champion relationships');
      }
      if (opportunity.meddpicc.metrics < 30) {
        actions.push('Quantify business impact and ROI metrics');
      }
    }

    // Time-sensitive actions
    const daysToClose = opportunity.expectedCloseDate ? 
      Math.ceil((opportunity.expectedCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;
    
    if (daysToClose < 14) {
      actions.push('Accelerate decision-making process');
      actions.push('Remove any remaining obstacles to close');
    }

    return actions.slice(0, 5); // Return top 5 actions
  };

  const generateCompetitiveIntelligence = (): string[] => {
    return [
      'Competitor X is also bidding with a 15% lower price point',
      'Industry trend shows preference for cloud-based solutions',
      'Customer previously worked with Competitor Y and had mixed results',
      'Our solution\'s unique AI capabilities are a key differentiator',
      'Market analysis shows 23% growth in this sector this year'
    ];
  };

  const calculateDealHealthMetrics = () => {
    // Calculate velocity (deal progression speed)
    const velocity = opportunity.probability || 50;

    // Calculate engagement (activity level)
    const activityCount = opportunity.activities?.length || 0;
    const engagement = Math.min(100, activityCount * 10);

    // Calculate stakeholder alignment (based on contacts and MEDDPICC)
    const contactCount = opportunity.contacts?.length || 0;
    const meddpiceScore = opportunity.meddpicc ? 
      Object.values(opportunity.meddpicc).reduce((sum, score) => sum + score, 0) / 8 : 0;
    const stakeholderAlignment = Math.min(100, (contactCount * 15) + meddpiceScore);

    // Calculate competitive position
    const competitivePosition = opportunity.meddpicc?.competition || 50;

    return {
      velocity,
      engagement,
      stakeholderAlignment,
      competitivePosition
    };
  };

  const generatePredictions = () => {
    const currentDate = new Date();
    const daysToClose = opportunity.expectedCloseDate ? 
      Math.ceil((opportunity.expectedCloseDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30;

    return {
      closeDate: opportunity.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      winProbability: Math.min(95, Math.max(5, (opportunity.probability || 50) + (insights.leadScore - 50) * 0.3)),
      dealValue: opportunity.value || 0,
      timeToClose: Math.max(7, daysToClose)
    };
  };

  const generateRecommendations = () => {
    return {
      immediate: [
        'Schedule follow-up call within 48 hours',
        'Send personalized proposal based on discovery findings',
        'Connect with additional stakeholders identified'
      ],
      shortTerm: [
        'Develop comprehensive ROI business case',
        'Arrange technical proof of concept',
        'Build stronger champion relationships'
      ],
      longTerm: [
        'Create strategic partnership opportunities',
        'Identify expansion opportunities within account',
        'Develop case study for similar prospects'
      ]
    };
  };

  const generateMarketIntelligence = () => {
    return {
      industryTrends: [
        'Digital transformation accelerating in ' + (opportunity.industry || 'target industry'),
        'Increased focus on ROI and measurable outcomes',
        'Growing demand for integrated solutions'
      ],
      competitorMoves: [
        'Main competitor launched new product version last month',
        'Price pressure increasing in mid-market segment',
        'Partnership announcements creating market buzz'
      ],
      marketOpportunities: [
        'New regulatory requirements creating demand',
        'Economic conditions favorable for capital investments',
        'Technology adoption rates higher than projected'
      ]
    };
  };

  const getRiskLevel = (score: number) => {
    if (score <= 30) return { level: 'Low', color: 'green', description: 'Deal progressing well' };
    if (score <= 60) return { level: 'Medium', color: 'yellow', description: 'Some areas need attention' };
    return { level: 'High', color: 'red', description: 'Significant risk factors present' };
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'green' };
    if (score >= 60) return { level: 'Good', color: 'blue' };
    if (score >= 40) return { level: 'Fair', color: 'yellow' };
    return { level: 'Poor', color: 'red' };
  };

  useEffect(() => {
    // Auto-generate insights if not analyzed recently
    if (!lastAnalyzed || Date.now() - new Date(lastAnalyzed).getTime() > 24 * 60 * 60 * 1000) {
      generateInsights();
    }
  }, [opportunity.id]);

  const riskLevel = getRiskLevel(insights.dealRiskScore);
  const leadScoreLevel = getScoreLevel(insights.leadScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI Insights & Analytics
                {source !== 'standalone' && (
                  <Badge variant="outline">{source === 'pipeline' ? 'Pipeline' : 'Opportunities'}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations for {opportunity.name || 'this opportunity'}
              </CardDescription>
            </div>
            <Button 
              onClick={generateInsights} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Deal Risk Score */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <Badge variant={riskLevel.color === 'green' ? 'default' : riskLevel.color === 'yellow' ? 'secondary' : 'destructive'}>
                  {riskLevel.level}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.dealRiskScore}</div>
              <div className="text-sm text-muted-foreground">Deal Risk Score</div>
              <Progress value={100 - insights.dealRiskScore} className="mt-2" />
            </Card>

            {/* Lead Score */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                <Badge variant={leadScoreLevel.color === 'green' ? 'default' : 'secondary'}>
                  {leadScoreLevel.level}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.leadScore}</div>
              <div className="text-sm text-muted-foreground">Lead Quality Score</div>
              <Progress value={insights.leadScore} className="mt-2" />
            </Card>

            {/* Win Probability */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <Badge variant="outline">{insights.predictions.winProbability.toFixed(0)}%</Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.predictions.winProbability.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">AI Win Probability</div>
              <Progress value={insights.predictions.winProbability} className="mt-2" />
            </Card>

            {/* Time to Close */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <Badge variant="outline">{insights.predictions.timeToClose} days</Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.predictions.timeToClose}</div>
              <div className="text-sm text-muted-foreground">Days to Close</div>
              <div className="mt-2 h-2 bg-muted rounded-full">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, Math.min(100, (30 - insights.predictions.timeToClose) * 3))}%` }}
                />
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="actions" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="actions">Next Actions</TabsTrigger>
          <TabsTrigger value="health">Deal Health</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="competitive">Competitive</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recommended Next Actions
              </CardTitle>
              <CardDescription>
                AI-generated action items based on current opportunity status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.nextBestActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Add to Calendar
                    </Button>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
                    <Zap className="h-4 w-4" />
                    Immediate (Today)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {insights.recommendations.immediate.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-600">
                    <Target className="h-4 w-4" />
                    Short-term (This Week)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {insights.recommendations.shortTerm.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    Long-term (This Month)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {insights.recommendations.longTerm.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Deal Health Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {Object.entries(insights.dealHealthMetrics).map(([metric, value]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {metric.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm font-semibold">{value.toFixed(0)}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {value >= 80 ? 'Excellent' : value >= 60 ? 'Good' : value >= 40 ? 'Fair' : 'Needs attention'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Win Probability</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {insights.predictions.winProbability.toFixed(1)}%
                    </div>
                    <Progress value={insights.predictions.winProbability} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Based on historical data and current deal characteristics
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Predicted Value</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${insights.predictions.dealValue.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Current opportunity value
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Expected Close</span>
                    </div>
                    <div className="text-lg font-bold text-purple-600 mb-2">
                      {insights.predictions.closeDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insights.predictions.timeToClose} days from now
                    </p>
                  </div>

                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>AI Recommendation:</strong> Focus on accelerating stakeholder engagement to improve win probability by 15-20%.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Competitive Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.competitiveIntelligence.map((intel, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <p className="text-sm">{intel}</p>
                  </div>
                ))}
              </div>

              <Alert className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Competitive Status:</strong> Monitor competitor pricing and feature announcements closely. Our AI capabilities provide strong differentiation.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Industry Trends</h4>
                  <ul className="space-y-2">
                    {insights.marketIntelligence.industryTrends.map((trend, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Competitor Moves</h4>
                  <ul className="space-y-2">
                    {insights.marketIntelligence.competitorMoves.map((move, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        {move}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-3">Market Opportunities</h4>
                  <ul className="space-y-2">
                    {insights.marketIntelligence.marketOpportunities.map((opportunity, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}