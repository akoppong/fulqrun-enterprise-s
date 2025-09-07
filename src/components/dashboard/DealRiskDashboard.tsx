import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, TrendingDown, TrendingUp, Clock, DollarSign, Users, Target } from '@phosphor-icons/react';
import { DealRiskAssessment, Opportunity, Contact, Company, RiskFactor } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface DealRiskDashboardProps {
  opportunities: Opportunity[];
  contacts: Contact[];
  companies: Company[];
  onOpportunitySelect?: (opportunity: Opportunity) => void;
}

export function DealRiskDashboard({ opportunities, contacts, companies, onOpportunitySelect }: DealRiskDashboardProps) {
  const [riskAssessments, setRiskAssessments] = useKV<DealRiskAssessment[]>('ai-risk-assessments', []);
  const [isAssessing, setIsAssessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('risk');

  // Filter and sort deals
  const filteredDeals = riskAssessments
    .filter(assessment => {
      const opp = opportunities.find(o => o.id === assessment.opportunityId);
      const company = companies.find(c => c.id === opp?.companyId);
      const matchesSearch = !searchTerm || 
        opp?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || assessment.overallRisk === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      const oppA = opportunities.find(o => o.id === a.opportunityId);
      const oppB = opportunities.find(o => o.id === b.opportunityId);
      
      switch (sortBy) {
        case 'risk': return b.riskScore - a.riskScore;
        case 'value': return (oppB?.value || 0) - (oppA?.value || 0);
        case 'probability': return b.predictions.closeProbability - a.predictions.closeProbability;
        case 'slippage': return b.predictions.potentialSlippage - a.predictions.potentialSlippage;
        default: return b.riskScore - a.riskScore;
      }
    });

  const assessAllDeals = async () => {
    if (opportunities.length === 0) {
      toast.error('No opportunities available for risk assessment');
      return;
    }

    setIsAssessing(true);
    try {
      const assessments: DealRiskAssessment[] = [];
      const dealsToAssess = opportunities.slice(0, 8); // Limit to prevent rate limiting
      
      for (const opp of dealsToAssess) {
        const contact = contacts.find(c => c.id === opp.contactId);
        const company = companies.find(c => c.id === opp.companyId);
        
        if (contact && company) {
          // Check if we already have a recent assessment
          const existingAssessment = riskAssessments.find(r => r.opportunityId === opp.id);
          const isRecentAssessment = existingAssessment && 
            (new Date().getTime() - new Date(existingAssessment.lastAssessment).getTime()) < 24 * 60 * 60 * 1000; // 24 hours
          
          if (!isRecentAssessment) {
            const assessment = await AIService.assessDealRisk(opp, contact, company);
            assessments.push(assessment);
          } else {
            assessments.push(existingAssessment);
          }
        }
      }
      
      // Merge with existing assessments, replacing old ones
      const updatedAssessments = [...riskAssessments.filter(r => !assessments.find(a => a.opportunityId === r.opportunityId)), ...assessments];
      setRiskAssessments(updatedAssessments);
      
      toast.success(`Generated risk assessments for ${assessments.filter(a => !riskAssessments.find(r => r.opportunityId === a.opportunityId)).length} new deals`);
    } catch (error) {
      toast.error('Risk assessment failed');
      console.error(error);
    }
    setIsAssessing(false);
  };

  const assessIndividualDeal = async (opportunity: Opportunity) => {
    const contact = contacts.find(c => c.id === opportunity.contactId);
    const company = companies.find(c => c.id === opportunity.companyId);
    
    if (!contact || !company) {
      toast.error('Contact or company not found for this opportunity');
      return;
    }

    setIsAssessing(true);
    try {
      const assessment = await AIService.assessDealRisk(opportunity, contact, company);
      const updatedAssessments = riskAssessments.filter(r => r.opportunityId !== opportunity.id);
      setRiskAssessments([...updatedAssessments, assessment]);
      toast.success(`Updated risk assessment for ${opportunity.title}`);
    } catch (error) {
      toast.error('Failed to assess individual deal');
      console.error(error);
    }
    setIsAssessing(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Statistics
  const riskDistribution = riskAssessments.reduce((acc, assessment) => {
    acc[assessment.overallRisk] = (acc[assessment.overallRisk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageRiskScore = riskAssessments.length > 0 
    ? riskAssessments.reduce((sum, assessment) => sum + assessment.riskScore, 0) / riskAssessments.length 
    : 0;

  const criticalDeals = riskAssessments.filter(r => r.overallRisk === 'critical' || r.overallRisk === 'high');
  const totalAtRiskValue = criticalDeals.reduce((sum, assessment) => {
    const opp = opportunities.find(o => o.id === assessment.opportunityId);
    return sum + (opp?.value || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Shield className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deal Risk Assessment</h2>
            <p className="text-gray-600">AI-powered deal risk analysis and mitigation strategies</p>
          </div>
        </div>
        <Button 
          onClick={assessAllDeals}
          disabled={isAssessing}
          className="flex items-center space-x-2"
        >
          <Shield className="h-4 w-4" />
          <span>{isAssessing ? 'Assessing...' : 'Assess All Deals'}</span>
        </Button>
      </div>

      {/* Critical Alerts */}
      {criticalDeals.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalDeals.length} deals at critical risk</strong> with combined value of{' '}
            <strong>${totalAtRiskValue.toLocaleString()}</strong> require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assessed</p>
                <p className="text-2xl font-bold text-gray-900">{riskAssessments.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averageRiskScore)}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-gray-900">{criticalDeals.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalAtRiskValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search deals</Label>
              <Input
                id="search"
                placeholder="Search by deal or company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="risk-filter">Risk Level</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger id="risk-filter" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-by">Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="risk">Risk Score</SelectItem>
                  <SelectItem value="value">Deal Value</SelectItem>
                  <SelectItem value="probability">Close Probability</SelectItem>
                  <SelectItem value="slippage">Timeline Slippage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals List */}
      {filteredDeals.length > 0 ? (
        <div className="space-y-4">
          {filteredDeals.map((assessment) => {
            const opp = opportunities.find(o => o.id === assessment.opportunityId);
            const contact = contacts.find(c => c.id === opp?.contactId);
            const company = companies.find(c => c.id === opp?.companyId);
            
            if (!opp || !contact || !company) return null;

            return (
              <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                        <Badge className={getRiskColor(assessment.overallRisk)}>
                          {assessment.overallRisk.toUpperCase()} RISK
                        </Badge>
                        {assessment.trendDirection !== 'stable' && (
                          <div className="flex items-center space-x-1">
                            {assessment.trendDirection === 'improving' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`text-xs font-medium ${
                              assessment.trendDirection === 'improving' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {assessment.trendDirection}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{company.name} • {contact.firstName} {contact.lastName}</p>
                        <p>Value: <span className="font-semibold">${opp.value.toLocaleString()}</span> • Stage: <span className="font-semibold capitalize">{opp.stage}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{assessment.riskScore}</div>
                        <div className="text-xs text-gray-600">Risk Score</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => assessIndividualDeal(opp)}
                        disabled={isAssessing}
                      >
                        Reassess
                      </Button>
                    </div>
                  </div>
                  
                  {/* Predictions Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Close Probability</div>
                      <div className="text-lg font-bold text-blue-600">
                        {assessment.predictions.closeProbability}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-gray-600">Potential Slippage</div>
                      <div className="text-lg font-bold text-orange-600">
                        {assessment.predictions.potentialSlippage} days
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">Churn Risk</div>
                      <div className="text-lg font-bold text-red-600">
                        {assessment.predictions.churnRisk}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Competitive Threat</div>
                      <div className="text-lg font-bold text-purple-600">
                        {assessment.predictions.competitiveThreat}%
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="factors" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="factors">Risk Factors</TabsTrigger>
                      <TabsTrigger value="recommendations">Actions</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="factors" className="mt-4">
                      {assessment.factors.length > 0 ? (
                        <div className="space-y-2">
                          {assessment.factors.slice(0, 3).map((factor, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="outline" 
                                    className={getSeverityColor(factor.severity)}
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
                          {assessment.factors.length > 3 && (
                            <p className="text-sm text-gray-600 text-center">
                              +{assessment.factors.length - 3} more factors...
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 text-center py-4">No risk factors identified</p>
                      )}
                    </TabsContent>

                    <TabsContent value="recommendations" className="mt-4">
                      <div className="space-y-3">
                        {assessment.recommendations.slice(0, 3).map((rec, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Impact: {rec.estimatedImpact}%
                              </span>
                            </div>
                            <p className="font-medium mb-1">{rec.action}</p>
                            <p className="text-sm text-gray-600">{rec.reasoning}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Timeline: {rec.timeframe.replace('_', ' ')}</span>
                              {rec.stakeholders.length > 0 && (
                                <span>Stakeholders: {rec.stakeholders.join(', ')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-600">Original Close Date</span>
                            <p className="font-medium">{opp.expectedCloseDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Predicted Close Date</span>
                            <p className="font-medium">{assessment.predictions.closeDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Last Assessment</span>
                            <p className="font-medium">{assessment.lastAssessment.toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {riskAssessments.length === 0 ? 'No Risk Assessments Yet' : 'No Matching Deals'}
            </h3>
            <p className="text-gray-600 mb-4">
              {riskAssessments.length === 0 
                ? 'Click "Assess All Deals" to generate AI-powered risk analysis'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}