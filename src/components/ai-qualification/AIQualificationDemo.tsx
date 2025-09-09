import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Star,
  Shield,
  Sparkles,
  Bot,
  Lightbulb
} from '@phosphor-icons/react';

export function AIQualificationDemo() {
  const [activeDemo, setActiveDemo] = useState('qualification');

  const demoData = {
    qualification: {
      overall_score: 78,
      risk_level: 'Medium',
      confidence: 85,
      win_probability: 72,
      deal_health: 'Healthy',
      strengths: [
        'Strong champion identified with high internal influence',
        'Clear budget allocation and ROI expectations defined',
        'Compelling event driving urgency for decision',
        'Well-defined technical and business requirements'
      ],
      weaknesses: [
        'Limited engagement with economic buyer',
        'Competitive landscape not fully mapped',
        'Decision process timeline unclear',
        'Pain point impact quantification needed'
      ],
      next_actions: [
        'Schedule executive briefing with economic buyer',
        'Conduct competitive analysis and differentiation mapping',
        'Quantify business impact of current pain points',
        'Develop champion enablement materials',
        'Create detailed ROI business case'
      ]
    },
    leadScoring: {
      totalLeads: 3,
      hotLeads: 1,
      avgScore: 74,
      estimatedPipeline: 1325,
      leads: [
        {
          name: 'Sarah Johnson',
          company: 'TechCorp Industries',
          score: 89,
          priority: 'Hot',
          probability: 85,
          dealSize: 750000
        },
        {
          name: 'Mike Chen',
          company: 'Global Manufacturing Co',
          score: 72,
          priority: 'Warm',
          probability: 65,
          dealSize: 450000
        },
        {
          name: 'Emma Rodriguez',
          company: 'StartupXYZ',
          score: 61,
          priority: 'Warm',
          probability: 45,
          dealSize: 125000
        }
      ]
    },
    riskAssessment: {
      totalDeals: 3,
      highRiskDeals: 1,
      avgRiskScore: 42,
      atRiskValue: 125,
      deals: [
        {
          name: 'Enterprise CRM Implementation - TechCorp',
          value: 750,
          risk: 'Low',
          riskScore: 25,
          probability: 75
        },
        {
          name: 'Sales Automation Platform - GlobalManuf',
          value: 450,
          risk: 'Medium',
          riskScore: 40,
          probability: 65
        },
        {
          name: 'Startup Growth Package - StartupXYZ',
          value: 125,
          risk: 'High',
          riskScore: 65,
          probability: 45
        }
      ]
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI-Powered MEDDPICC System Demo
        </h1>
        <p className="text-muted-foreground">
          Experience the power of AI-driven sales qualification, lead scoring, and risk assessment
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={activeDemo === 'qualification' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('qualification')}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          MEDDPICC Qualification
        </Button>
        <Button
          variant={activeDemo === 'scoring' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('scoring')}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Lead Scoring
        </Button>
        <Button
          variant={activeDemo === 'risk' ? 'default' : 'outline'}
          onClick={() => setActiveDemo('risk')}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Risk Assessment
        </Button>
      </div>

      {/* MEDDPICC Qualification Demo */}
      {activeDemo === 'qualification' && (
        <div className="space-y-6">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              This demo shows AI-powered MEDDPICC analysis for TechCorp Industries deal. 
              The AI has analyzed all qualification data and provided actionable insights.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Qualification Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoData.qualification.overall_score}/100</div>
                <Progress value={demoData.qualification.overall_score} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {demoData.qualification.risk_level}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">
                  Confidence: {demoData.qualification.confidence}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Win Probability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoData.qualification.win_probability}%</div>
                <Progress value={demoData.qualification.win_probability} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Deal Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-green-600">
                  {demoData.qualification.deal_health}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoData.qualification.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {demoData.qualification.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{weakness}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommended Next Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoData.qualification.next_actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lead Scoring Demo */}
      {activeDemo === 'scoring' && (
        <div className="space-y-6">
          <Alert>
            <Bot className="h-4 w-4" />
            <AlertDescription>
              AI Lead Scoring analyzes multiple data points to prioritize your best prospects. 
              Each lead is scored on fit, intent, and engagement metrics.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoData.leadScoring.totalLeads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-red-500" />
                  Hot Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {demoData.leadScoring.hotLeads}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoData.leadScoring.avgScore}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Est. Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${demoData.leadScoring.estimatedPipeline}K</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lead Scores & Prioritization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoData.leadScoring.leads.map((lead, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{lead.name}</h3>
                        <Badge className={getPriorityColor(lead.priority)}>
                          {lead.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                      <div className="text-xs text-muted-foreground">
                        ${(lead.dealSize / 1000).toFixed(0)}K potential • {lead.probability}% close rate
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{lead.score}</div>
                      <div className="text-xs text-muted-foreground">AI Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Assessment Demo */}
      {activeDemo === 'risk' && (
        <div className="space-y-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              AI Deal Risk Assessment analyzes multiple factors to identify potential deal risks 
              and provides mitigation strategies to improve win rates.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoData.riskAssessment.totalDeals}</div>
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
                <div className="text-2xl font-bold text-red-600">{demoData.riskAssessment.highRiskDeals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{demoData.riskAssessment.avgRiskScore}/100</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">At-Risk Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${demoData.riskAssessment.atRiskValue}K</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deal Risk Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {demoData.riskAssessment.deals.map((deal, index) => (
                <div key={index} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{deal.name}</h3>
                        <Badge className={
                          deal.risk === 'Low' ? 'bg-green-100 text-green-800 border-green-200' :
                          deal.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-red-100 text-red-800 border-red-200'
                        }>
                          {deal.risk} Risk
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${deal.value}K • {deal.probability}% probability
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getRiskColor(deal.risk)}`}>
                        {deal.riskScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 2 Complete:</strong> These AI-powered qualification features represent the advanced 
          intelligence layer of FulQrun CRM. The system learns from your data to provide increasingly 
          accurate insights and recommendations.
        </AlertDescription>
      </Alert>
    </div>
  );
}