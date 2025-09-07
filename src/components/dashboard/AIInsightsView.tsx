import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, TrendingUp, AlertTriangle, Target, Users, DollarSign, Clock, Shield } from '@phosphor-icons/react';
import { LeadScore, DealRiskAssessment, Opportunity, Contact, Company } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface AIInsightsViewProps {
  opportunities: Opportunity[];
  contacts: Contact[];
  companies: Company[];
  onRefresh?: () => void;
}

export function AIInsightsView({ opportunities, contacts, companies, onRefresh }: AIInsightsViewProps) {
  const [leadScores, setLeadScores] = useKV<LeadScore[]>('ai-lead-scores', []);
  const [riskAssessments, setRiskAssessments] = useKV<DealRiskAssessment[]>('ai-risk-assessments', []);
  const [pipelineForecast, setPipelineForecast] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('lead-scoring');

  useEffect(() => {
    if (opportunities.length > 0 && !pipelineForecast) {
      analyzePipeline();
    }
  }, [opportunities]);

  const analyzePipeline = async () => {
    try {
      const forecast = await AIService.analyzePipelineForecast(opportunities);
      setPipelineForecast(forecast);
    } catch (error) {
      console.error('Pipeline analysis failed:', error);
    }
  };

  const handleLeadScoring = async () => {
    if (contacts.length === 0) {
      toast.error('No contacts available for scoring');
      return;
    }

    setIsAnalyzing(true);
    try {
      const newScores: LeadScore[] = [];
      
      for (const contact of contacts.slice(0, 5)) { // Limit for demo
        const company = companies.find(c => c.id === contact.companyId);
        if (company) {
          const score = await AIService.calculateLeadScore(contact, company);
          newScores.push(score);
        }
      }
      
      setLeadScores(newScores);
      toast.success(`Generated AI scores for ${newScores.length} leads`);
    } catch (error) {
      toast.error('Lead scoring failed');
      console.error(error);
    }
    setIsAnalyzing(false);
  };

  const handleRiskAssessment = async () => {
    if (opportunities.length === 0) {
      toast.error('No opportunities available for assessment');
      return;
    }

    setIsAnalyzing(true);
    try {
      const assessments: DealRiskAssessment[] = [];
      
      for (const opp of opportunities.slice(0, 5)) { // Limit for demo
        const contact = contacts.find(c => c.id === opp.contactId);
        const company = companies.find(c => c.id === opp.companyId);
        
        if (contact && company) {
          const assessment = await AIService.assessDealRisk(opp, contact, company);
          assessments.push(assessment);
        }
      }
      
      setRiskAssessments(assessments);
      toast.success(`Generated risk assessments for ${assessments.length} deals`);
    } catch (error) {
      toast.error('Risk assessment failed');
      console.error(error);
    }
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const topLeads = leadScores.sort((a, b) => b.score - a.score).slice(0, 3);
  const highRiskDeals = riskAssessments.filter(r => r.overallRisk === 'high' || r.overallRisk === 'critical');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Insights</h2>
            <p className="text-gray-600">Predictive analytics and intelligent recommendations</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleLeadScoring}
            disabled={isAnalyzing}
            variant="outline"
          >
            <Target className="h-4 w-4 mr-2" />
            Score Leads
          </Button>
          <Button 
            onClick={handleRiskAssessment}
            disabled={isAnalyzing}
          >
            <Shield className="h-4 w-4 mr-2" />
            Assess Risk
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Health</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pipelineForecast?.healthScore || 75}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High-Quality Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leadScores.filter(s => s.grade === 'A' || s.grade === 'B').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At-Risk Deals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {highRiskDeals.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pipelineForecast?.forecastAccuracy || 85}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lead-scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="pipeline-forecast">Pipeline Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="lead-scoring" className="space-y-6">
          {leadScores.length > 0 ? (
            <>
              {/* Top Leads */}
              {topLeads.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Top Scoring Leads
                    </CardTitle>
                    <CardDescription>Highest quality prospects based on AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topLeads.map((lead) => {
                        const contact = contacts.find(c => c.id === lead.contactId);
                        const company = companies.find(c => c.id === contact?.companyId);
                        
                        return (
                          <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                                  {lead.score}
                                </div>
                                <Badge variant={lead.grade === 'A' ? 'default' : 'secondary'}>
                                  Grade {lead.grade}
                                </Badge>
                                <div>
                                  <p className="font-semibold">
                                    {contact?.firstName} {contact?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {contact?.title} at {company?.name}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Conversion:</span>
                                  <span className="ml-1 font-medium">{lead.predictedConversionProbability}%</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Est. Value:</span>
                                  <span className="ml-1 font-medium">${lead.estimatedValue.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Timeline:</span>
                                  <span className="ml-1 font-medium">{lead.timeToConversion} days</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lead Scoring Details */}
              <div className="grid gap-6">
                {leadScores.map((lead) => {
                  const contact = contacts.find(c => c.id === lead.contactId);
                  const company = companies.find(c => c.id === contact?.companyId);
                  
                  return (
                    <Card key={lead.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>
                            {contact?.firstName} {contact?.lastName} - {company?.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>
                              {lead.score}
                            </div>
                            <Badge variant={lead.grade === 'A' ? 'default' : 'secondary'}>
                              Grade {lead.grade}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Scoring Factors */}
                          <div>
                            <h4 className="font-semibold mb-3">Scoring Factors</h4>
                            <div className="space-y-2">
                              {lead.factors.map((factor, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{factor.name}</span>
                                      <span className="text-sm text-gray-600">{factor.value}/100</span>
                                    </div>
                                    <Progress value={factor.value} className="h-2 mt-1" />
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={`ml-3 ${
                                      factor.impact === 'positive' ? 'text-green-600' : 
                                      factor.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                                    }`}
                                  >
                                    {factor.impact}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* AI Insights */}
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-semibold text-green-600 mb-2">Strengths</h4>
                              <ul className="text-sm space-y-1">
                                {lead.aiInsights.strengths.map((strength, i) => (
                                  <li key={i} className="text-gray-600">• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-orange-600 mb-2">Weaknesses</h4>
                              <ul className="text-sm space-y-1">
                                {lead.aiInsights.weaknesses.map((weakness, i) => (
                                  <li key={i} className="text-gray-600">• {weakness}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-600 mb-2">Recommendations</h4>
                              <ul className="text-sm space-y-1">
                                {lead.aiInsights.recommendations.map((rec, i) => (
                                  <li key={i} className="text-gray-600">• {rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lead Scores Yet</h3>
                <p className="text-gray-600 mb-4">Click "Score Leads" to generate AI-powered lead scoring</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-6">
          {riskAssessments.length > 0 ? (
            <>
              {/* High-Risk Deals Alert */}
              {highRiskDeals.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{highRiskDeals.length} high-risk deals</strong> require immediate attention to prevent loss.
                  </AlertDescription>
                </Alert>
              )}

              {/* Risk Assessments */}
              <div className="grid gap-6">
                {riskAssessments.map((assessment) => {
                  const opp = opportunities.find(o => o.id === assessment.opportunityId);
                  const contact = contacts.find(c => c.id === opp?.contactId);
                  const company = companies.find(c => c.id === opp?.companyId);

                  return (
                    <Card key={assessment.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>
                            {opp?.title} - {company?.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getRiskColor(assessment.overallRisk)}>
                              {assessment.overallRisk.toUpperCase()} RISK
                            </Badge>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Risk Score</div>
                              <div className="text-xl font-bold">{assessment.riskScore}/100</div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Predictions */}
                          <div>
                            <h4 className="font-semibold mb-3">AI Predictions</h4>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="font-semibold">Close Probability</div>
                                <div className="text-lg font-bold text-blue-600">
                                  {assessment.predictions.closeProbability}%
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="font-semibold">Potential Slippage</div>
                                <div className="text-lg font-bold text-orange-600">
                                  {assessment.predictions.potentialSlippage} days
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="font-semibold">Churn Risk</div>
                                <div className="text-lg font-bold text-red-600">
                                  {assessment.predictions.churnRisk}%
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 rounded">
                                <div className="font-semibold">Competitive Threat</div>
                                <div className="text-lg font-bold text-purple-600">
                                  {assessment.predictions.competitiveThreat}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Risk Factors */}
                          <div>
                            <h4 className="font-semibold mb-3">Risk Factors</h4>
                            <div className="space-y-2">
                              {assessment.factors.map((factor, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <Badge 
                                        variant="outline" 
                                        className={getRiskColor(factor.severity)}
                                      >
                                        {factor.severity}
                                      </Badge>
                                      <span className="font-medium">{factor.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{factor.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">Impact</div>
                                    <div className="font-bold">{factor.impact}/100</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className="font-semibold mb-3">Priority Actions</h4>
                            <div className="space-y-2">
                              {assessment.recommendations.slice(0, 3).map((rec, index) => (
                                <div key={index} className="p-3 border rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge 
                                      variant={rec.priority === 'urgent' ? 'destructive' : 'outline'}
                                    >
                                      {rec.priority}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      Impact: {rec.estimatedImpact}%
                                    </span>
                                  </div>
                                  <p className="font-medium">{rec.action}</p>
                                  <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Risk Assessments Yet</h3>
                <p className="text-gray-600 mb-4">Click "Assess Risk" to generate AI-powered deal risk analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pipeline-forecast" className="space-y-6">
          {pipelineForecast ? (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Pipeline Health Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Overall Health Score</span>
                          <span className="font-bold">{pipelineForecast.healthScore}%</span>
                        </div>
                        <Progress value={pipelineForecast.healthScore} />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Forecast Accuracy</span>
                          <span className="font-bold">{pipelineForecast.forecastAccuracy}%</span>
                        </div>
                        <Progress value={pipelineForecast.forecastAccuracy} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Early Warning Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pipelineForecast.earlyWarnings?.map((warning: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                          <span className="text-sm">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Strategic Recommendations</CardTitle>
                  <CardDescription>AI-generated insights to improve pipeline performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pipelineForecast.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Pipeline...</h3>
                <p className="text-gray-600">Pipeline forecast will be generated automatically</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}