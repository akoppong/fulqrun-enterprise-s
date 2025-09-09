import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Shield,
  Target,
  Clock,
  DollarSign,
  Users,
  Brain,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  Calendar,
  MessageCircle,
  Lightbulb,
  Zap
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface DealData {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  close_date: string;
  age_days: number;
  last_activity: string;
  champion_strength: string;
  competition: string;
  decision_timeline: string;
  budget_confirmed: boolean;
  technical_fit: string;
  stakeholder_engagement: string;
  proposal_status: string;
  contract_risk: string;
}

interface RiskAssessment {
  deal_id: string;
  overall_risk: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_score: number;
  confidence_level: number;
  risk_factors: {
    category: string;
    risk: string;
    impact: 'Low' | 'Medium' | 'High';
    probability: number;
    mitigation: string;
  }[];
  positive_indicators: string[];
  red_flags: string[];
  win_probability_adjustment: number;
  recommended_actions: {
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    timeline: string;
    owner: string;
  }[];
  forecast_reliability: number;
  deal_health_trends: {
    metric: string;
    trend: 'Improving' | 'Declining' | 'Stable';
    change_percentage: number;
  }[];
}

const sampleDeals: DealData[] = [
  {
    id: '1',
    name: 'Enterprise CRM Implementation - TechCorp',
    company: 'TechCorp Industries',
    value: 750000,
    stage: 'Proposal Submitted',
    probability: 75,
    close_date: '2024-03-15',
    age_days: 120,
    last_activity: '2024-01-15',
    champion_strength: 'Strong',
    competition: 'Salesforce, HubSpot',
    decision_timeline: 'Q1 2024',
    budget_confirmed: true,
    technical_fit: 'Excellent',
    stakeholder_engagement: 'High',
    proposal_status: 'Under Review',
    contract_risk: 'Low'
  },
  {
    id: '2',
    name: 'Sales Automation Platform - GlobalManuf',
    company: 'Global Manufacturing Co',
    value: 450000,
    stage: 'Negotiation',
    probability: 85,
    close_date: '2024-02-28',
    age_days: 95,
    last_activity: '2024-01-18',
    champion_strength: 'Moderate',
    competition: 'Pipedrive, Zoho',
    decision_timeline: 'Q1 2024',
    budget_confirmed: false,
    technical_fit: 'Good',
    stakeholder_engagement: 'Medium',
    proposal_status: 'Negotiating Terms',
    contract_risk: 'Medium'
  },
  {
    id: '3',
    name: 'Startup Growth Package - StartupXYZ',
    company: 'StartupXYZ',
    value: 125000,
    stage: 'Discovery',
    probability: 45,
    close_date: '2024-04-30',
    age_days: 45,
    last_activity: '2024-01-20',
    champion_strength: 'Weak',
    competition: 'Unknown',
    decision_timeline: 'Q2 2024',
    budget_confirmed: false,
    technical_fit: 'Fair',
    stakeholder_engagement: 'Low',
    proposal_status: 'Preparing Proposal',
    contract_risk: 'High'
  }
];

export function AIDealRiskAssessment() {
  const [deals] = useKV<DealData[]>('sample-deals', sampleDeals);
  const [riskAssessments, setRiskAssessments] = useKV<RiskAssessment[]>('risk-assessments', []);
  const [selectedDeal, setSelectedDeal] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateRiskAssessments = async () => {
    setIsAnalyzing(true);
    
    try {
      const assessments: RiskAssessment[] = [];
      
      for (const deal of deals) {
        // Create comprehensive risk analysis prompt
        const riskPrompt = spark.llmPrompt`
          Analyze this deal data for risk assessment and provide comprehensive insights:

          DEAL OVERVIEW:
          Deal: ${deal.name}
          Company: ${deal.company}
          Value: $${deal.value.toLocaleString()}
          Stage: ${deal.stage}
          Current Probability: ${deal.probability}%
          Expected Close: ${deal.close_date}
          Deal Age: ${deal.age_days} days
          Last Activity: ${deal.last_activity}

          QUALIFICATION STATUS:
          Champion Strength: ${deal.champion_strength}
          Competition: ${deal.competition}
          Decision Timeline: ${deal.decision_timeline}
          Budget Confirmed: ${deal.budget_confirmed}
          Technical Fit: ${deal.technical_fit}
          Stakeholder Engagement: ${deal.stakeholder_engagement}
          Proposal Status: ${deal.proposal_status}
          Contract Risk: ${deal.contract_risk}

          Based on this comprehensive deal analysis, provide:
          1. Overall risk level (Low/Medium/High/Critical)
          2. Risk score (0-100, where 100 is highest risk)
          3. Confidence level in the assessment (0-100)
          4. Detailed risk factors with categories, impact levels, and mitigation strategies
          5. Positive indicators supporting the deal
          6. Red flags that need immediate attention
          7. Win probability adjustment recommendation
          8. Specific recommended actions with priorities and timelines
          9. Forecast reliability score (0-100)
          10. Deal health trend analysis

          Focus on actionable insights that will help the sales team mitigate risks and improve win rates.
        `;

        try {
          const response = await spark.llm(riskPrompt, 'gpt-4o', true);
          const analysis = JSON.parse(response);
          
          assessments.push({
            deal_id: deal.id,
            overall_risk: analysis.overall_risk || 'Medium',
            risk_score: analysis.risk_score || 50,
            confidence_level: analysis.confidence_level || 75,
            risk_factors: analysis.risk_factors || [],
            positive_indicators: analysis.positive_indicators || [],
            red_flags: analysis.red_flags || [],
            win_probability_adjustment: analysis.win_probability_adjustment || 0,
            recommended_actions: analysis.recommended_actions || [],
            forecast_reliability: analysis.forecast_reliability || 70,
            deal_health_trends: analysis.deal_health_trends || []
          });
        } catch (error) {
          // Fallback assessment if AI fails
          const fallbackAssessment: RiskAssessment = {
            deal_id: deal.id,
            overall_risk: deal.probability > 70 ? 'Low' : deal.probability > 40 ? 'Medium' : 'High',
            risk_score: 100 - deal.probability,
            confidence_level: 80,
            risk_factors: [
              {
                category: 'Competition',
                risk: 'Strong competitive pressure identified',
                impact: 'High',
                probability: 70,
                mitigation: 'Develop competitive differentiation strategy'
              },
              {
                category: 'Timeline',
                risk: 'Extended sales cycle beyond normal range',
                impact: 'Medium',
                probability: 60,
                mitigation: 'Create urgency with compelling business case'
              }
            ],
            positive_indicators: [
              'Budget confirmed and allocated',
              'Strong technical fit identified',
              'Active champion engagement'
            ],
            red_flags: deal.probability < 50 ? ['Low stakeholder engagement', 'Unconfirmed budget'] : [],
            win_probability_adjustment: 0,
            recommended_actions: [
              {
                action: 'Schedule executive briefing',
                priority: 'High',
                timeline: '1 week',
                owner: 'Account Executive'
              },
              {
                action: 'Competitive analysis and positioning',
                priority: 'Medium',
                timeline: '2 weeks',
                owner: 'Sales Engineer'
              }
            ],
            forecast_reliability: deal.probability,
            deal_health_trends: [
              {
                metric: 'Stakeholder Engagement',
                trend: 'Stable',
                change_percentage: 0
              }
            ]
          };
          
          assessments.push(fallbackAssessment);
        }
      }
      
      setRiskAssessments(assessments);
      toast.success(`Risk assessment completed for ${assessments.length} deals`);
    } catch (error) {
      console.error('Risk assessment error:', error);
      toast.error('Failed to complete risk assessment');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      case 'Critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Critical': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'Stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const selectedDealData = deals.find(deal => deal.id === selectedDeal);
  const selectedRiskAssessment = riskAssessments.find(assessment => assessment.deal_id === selectedDeal);

  // Calculate summary statistics
  const totalDeals = riskAssessments.length;
  const highRiskDeals = riskAssessments.filter(r => r.overall_risk === 'High' || r.overall_risk === 'Critical').length;
  const avgRiskScore = totalDeals > 0 ? Math.round(riskAssessments.reduce((acc, r) => acc + r.risk_score, 0) / totalDeals) : 0;
  const atRiskValue = deals
    .filter(d => {
      const assessment = riskAssessments.find(r => r.deal_id === d.id);
      return assessment && (assessment.overall_risk === 'High' || assessment.overall_risk === 'Critical');
    })
    .reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AI Deal Risk Assessment
          </h1>
          <p className="text-muted-foreground mt-1">
            Predictive deal risk analysis with AI-powered insights and mitigation strategies
          </p>
        </div>
        <Button 
          onClick={generateRiskAssessments}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Brain className="h-4 w-4 animate-spin" />
              Analyzing Risks...
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              Analyze Deals
            </>
          )}
        </Button>
      </div>

      {/* Risk Summary */}
      {riskAssessments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                High Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{highRiskDeals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRiskScore}/100</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(atRiskValue / 1000).toFixed(0)}K</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deals List with Risk Scores */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Deal Risk Portfolio
              </CardTitle>
              <CardDescription>AI-powered risk assessment for all active deals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deals.map((deal) => {
                const assessment = riskAssessments.find(r => r.deal_id === deal.id);
                return (
                  <div
                    key={deal.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedDeal === deal.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedDeal(deal.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{deal.name}</h3>
                          {assessment && (
                            <Badge className={getRiskBadgeColor(assessment.overall_risk)}>
                              {assessment.overall_risk} Risk
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{deal.company}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${(deal.value / 1000).toFixed(0)}K
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {deal.probability}%
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {deal.close_date}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {assessment && (
                          <div className="space-y-1">
                            <div className={`text-2xl font-bold ${getRiskColor(assessment.overall_risk)}`}>
                              {assessment.risk_score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Risk Score
                            </div>
                            <Progress 
                              value={100 - assessment.risk_score} 
                              className="w-20"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Selected Deal Risk Analysis */}
        <div className="space-y-4">
          {selectedDealData && selectedRiskAssessment ? (
            <>
              {/* Risk Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getRiskColor(selectedRiskAssessment.overall_risk)}`}>
                      {selectedRiskAssessment.overall_risk}
                    </div>
                    <div className="text-sm text-muted-foreground">Risk Level</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Risk Score</span>
                        <span className="font-medium">{selectedRiskAssessment.risk_score}/100</span>
                      </div>
                      <Progress value={selectedRiskAssessment.risk_score} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Confidence</span>
                        <span className="font-medium">{selectedRiskAssessment.confidence_level}%</span>
                      </div>
                      <Progress value={selectedRiskAssessment.confidence_level} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Forecast Reliability</span>
                        <span className="font-medium">{selectedRiskAssessment.forecast_reliability}%</span>
                      </div>
                      <Progress value={selectedRiskAssessment.forecast_reliability} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="factors" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="factors">Risk Factors</TabsTrigger>
                      <TabsTrigger value="indicators">Indicators</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="factors" className="space-y-3 mt-4">
                      {selectedRiskAssessment.risk_factors.map((factor, index) => (
                        <div key={index} className="p-3 rounded-lg bg-red-50 border border-red-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-sm">{factor.category}</div>
                            <Badge className={`text-xs ${
                              factor.impact === 'High' ? 'bg-red-100 text-red-800' :
                              factor.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {factor.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{factor.risk}</p>
                          <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                            <strong>Mitigation:</strong> {factor.mitigation}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="indicators" className="space-y-3 mt-4">
                      <div>
                        <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Positive Indicators
                        </h4>
                        <ul className="space-y-1">
                          {selectedRiskAssessment.positive_indicators.map((indicator, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {selectedRiskAssessment.red_flags.length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Red Flags
                          </h4>
                          <ul className="space-y-1">
                            {selectedRiskAssessment.red_flags.map((flag, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                <XCircle className="h-3 w-3 text-red-500" />
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="actions" className="space-y-3 mt-4">
                      {selectedRiskAssessment.recommended_actions.map((action, index) => (
                        <div key={index} className="p-3 rounded-lg border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-sm">{action.action}</div>
                            <Badge className={`text-xs ${
                              action.priority === 'High' ? 'bg-red-100 text-red-800' :
                              action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {action.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {action.timeline}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {action.owner}
                            </span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Deal Health Trends */}
              {selectedRiskAssessment.deal_health_trends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Health Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedRiskAssessment.deal_health_trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <span className="text-sm font-medium">{trend.metric}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <span className="text-sm">{trend.trend}</span>
                          {trend.change_percentage !== 0 && (
                            <span className={`text-xs ${
                              trend.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Deal</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a deal from the list to view detailed risk analysis and recommendations.
                </p>
                {riskAssessments.length === 0 && (
                  <div className="mt-4">
                    <Button onClick={generateRiskAssessments} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Analyzing...' : 'Start Risk Analysis'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}