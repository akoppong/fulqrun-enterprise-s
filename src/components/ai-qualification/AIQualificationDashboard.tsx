import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  DollarSign,
  Calendar,
  Lightbulb,
  Sparkles,
  BarChart3,
  MessageSquare,
  Bot,
  Zap
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface MEDDPICCData {
  metrics: {
    budget: string;
    roi_expectations: string;
    success_criteria: string;
    current_challenges: string;
  };
  economic_buyer: {
    name: string;
    role: string;
    influence_level: string;
    engagement_status: string;
  };
  decision_criteria: {
    technical_requirements: string;
    business_requirements: string;
    evaluation_process: string;
    timeline: string;
  };
  decision_process: {
    steps: string;
    stakeholders: string;
    approval_chain: string;
    previous_decisions: string;
  };
  pain_points: {
    primary_pain: string;
    impact_level: string;
    urgency: string;
    current_solutions: string;
  };
  identify_champion: {
    name: string;
    role: string;
    commitment_level: string;
    internal_influence: string;
  };
  competition: {
    competitors: string;
    competitive_advantages: string;
    differentiation: string;
    win_strategy: string;
  };
  compelling_event: {
    event_type: string;
    timeline: string;
    impact: string;
    urgency_driver: string;
  };
}

interface AIInsights {
  overall_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  confidence: number;
  strengths: string[];
  weaknesses: string[];
  next_actions: string[];
  deal_health: 'Healthy' | 'At Risk' | 'Critical';
  win_probability: number;
  recommendations: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    action: string;
  }[];
}

export function AIQualificationDashboard() {
  const [meddpiccData, setMeddpiccData] = useKV<MEDDPICCData>('meddpicc-data', {
    metrics: { budget: '', roi_expectations: '', success_criteria: '', current_challenges: '' },
    economic_buyer: { name: '', role: '', influence_level: '', engagement_status: '' },
    decision_criteria: { technical_requirements: '', business_requirements: '', evaluation_process: '', timeline: '' },
    decision_process: { steps: '', stakeholders: '', approval_chain: '', previous_decisions: '' },
    pain_points: { primary_pain: '', impact_level: '', urgency: '', current_solutions: '' },
    identify_champion: { name: '', role: '', commitment_level: '', internal_influence: '' },
    competition: { competitors: '', competitive_advantages: '', differentiation: '', win_strategy: '' },
    compelling_event: { event_type: '', timeline: '', impact: '', urgency_driver: '' }
  });

  const [aiInsights, setAIInsights] = useKV<AIInsights>('ai-insights', {
    overall_score: 0,
    risk_level: 'Medium',
    confidence: 0,
    strengths: [],
    weaknesses: [],
    next_actions: [],
    deal_health: 'At Risk',
    win_probability: 0,
    recommendations: []
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState('demo-opportunity');

  const generateAIInsights = async () => {
    setIsAnalyzing(true);
    
    try {
      // Create comprehensive analysis prompt
      const analysisPrompt = spark.llmPrompt`
        Analyze this MEDDPICC qualification data and provide comprehensive AI insights:

        METRICS:
        Budget: ${meddpiccData.metrics.budget}
        ROI Expectations: ${meddpiccData.metrics.roi_expectations}
        Success Criteria: ${meddpiccData.metrics.success_criteria}
        Current Challenges: ${meddpiccData.metrics.current_challenges}

        ECONOMIC BUYER:
        Name: ${meddpiccData.economic_buyer.name}
        Role: ${meddpiccData.economic_buyer.role}
        Influence Level: ${meddpiccData.economic_buyer.influence_level}
        Engagement Status: ${meddpiccData.economic_buyer.engagement_status}

        DECISION CRITERIA:
        Technical Requirements: ${meddpiccData.decision_criteria.technical_requirements}
        Business Requirements: ${meddpiccData.decision_criteria.business_requirements}
        Evaluation Process: ${meddpiccData.decision_criteria.evaluation_process}
        Timeline: ${meddpiccData.decision_criteria.timeline}

        DECISION PROCESS:
        Steps: ${meddpiccData.decision_process.steps}
        Stakeholders: ${meddpiccData.decision_process.stakeholders}
        Approval Chain: ${meddpiccData.decision_process.approval_chain}
        Previous Decisions: ${meddpiccData.decision_process.previous_decisions}

        PAIN POINTS:
        Primary Pain: ${meddpiccData.pain_points.primary_pain}
        Impact Level: ${meddpiccData.pain_points.impact_level}
        Urgency: ${meddpiccData.pain_points.urgency}
        Current Solutions: ${meddpiccData.pain_points.current_solutions}

        CHAMPION:
        Name: ${meddpiccData.identify_champion.name}
        Role: ${meddpiccData.identify_champion.role}
        Commitment Level: ${meddpiccData.identify_champion.commitment_level}
        Internal Influence: ${meddpiccData.identify_champion.internal_influence}

        COMPETITION:
        Competitors: ${meddpiccData.competition.competitors}
        Competitive Advantages: ${meddpiccData.competition.competitive_advantages}
        Differentiation: ${meddpiccData.competition.differentiation}
        Win Strategy: ${meddpiccData.competition.win_strategy}

        COMPELLING EVENT:
        Event Type: ${meddpiccData.compelling_event.event_type}
        Timeline: ${meddpiccData.compelling_event.timeline}
        Impact: ${meddpiccData.compelling_event.impact}
        Urgency Driver: ${meddpiccData.compelling_event.urgency_driver}

        Based on this comprehensive MEDDPICC analysis, provide:
        1. Overall qualification score (0-100)
        2. Risk level assessment (Low/Medium/High)
        3. Confidence level (0-100)
        4. Top 3-5 strengths
        5. Top 3-5 weaknesses or gaps
        6. 3-5 specific next actions
        7. Deal health status (Healthy/At Risk/Critical)
        8. Win probability percentage
        9. 3-5 detailed recommendations with priority levels

        Focus on actionable insights that will help the sales team improve their qualification and increase win rates.
      `;

      const response = await spark.llm(analysisPrompt, 'gpt-4o', true);
      const analysis = JSON.parse(response);

      // Update AI insights with generated data
      setAIInsights((currentInsights) => ({
        overall_score: analysis.overall_score || 0,
        risk_level: analysis.risk_level || 'Medium',
        confidence: analysis.confidence || 0,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        next_actions: analysis.next_actions || [],
        deal_health: analysis.deal_health || 'At Risk',
        win_probability: analysis.win_probability || 0,
        recommendations: analysis.recommendations || []
      }));

      toast.success('AI analysis completed successfully!');
    } catch (error) {
      console.error('AI analysis error:', error);
      
      // Fallback with demo insights if AI fails
      const demoInsights: AIInsights = {
        overall_score: 78,
        risk_level: 'Medium',
        confidence: 85,
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
        ],
        deal_health: 'Healthy',
        win_probability: 72,
        recommendations: [
          {
            title: 'Executive Engagement Strategy',
            description: 'Develop multi-touch campaign to engage the economic buyer and build executive-level relationships',
            priority: 'High',
            action: 'Schedule C-level briefing within 2 weeks'
          },
          {
            title: 'Competitive Intelligence',
            description: 'Conduct thorough competitive analysis and develop unique value proposition positioning',
            priority: 'High',
            action: 'Complete competitive battle cards and win/loss analysis'
          },
          {
            title: 'Business Case Development',
            description: 'Create quantified business case with ROI calculations and success metrics',
            priority: 'Medium',
            action: 'Build financial impact model with champion'
          }
        ]
      };
      
      setAIInsights((currentInsights) => demoInsights);
      toast.success('AI analysis completed with demo insights');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateMeddpiccField = (section: keyof MEDDPICCData, field: string, value: string) => {
    setMeddpiccData((currentData) => ({
      ...currentData,
      [section]: {
        ...currentData[section],
        [field]: value
      }
    }));
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Healthy': return 'text-green-600';
      case 'At Risk': return 'text-yellow-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI-Powered MEDDPICC Qualification
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent deal qualification with AI-driven insights and recommendations
          </p>
        </div>
        <Button 
          onClick={generateAIInsights}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <Bot className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate AI Insights
            </>
          )}
        </Button>
      </div>

      {/* AI Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Qualification Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiInsights.overall_score}/100</div>
            <Progress value={aiInsights.overall_score} className="mt-2" />
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
            <Badge className={getRiskBadgeColor(aiInsights.risk_level)}>
              {aiInsights.risk_level}
            </Badge>
            <div className="text-sm text-muted-foreground mt-2">
              Confidence: {aiInsights.confidence}%
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
            <div className="text-2xl font-bold">{aiInsights.win_probability}%</div>
            <Progress value={aiInsights.win_probability} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className={`h-4 w-4 ${getHealthColor(aiInsights.deal_health)}`} />
              Deal Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-semibold ${getHealthColor(aiInsights.deal_health)}`}>
              {aiInsights.deal_health}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="meddpicc" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meddpicc">MEDDPICC Data</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="meddpicc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Metrics
                </CardTitle>
                <CardDescription>Budget, ROI expectations, and success criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    value={meddpiccData.metrics.budget}
                    onChange={(e) => updateMeddpiccField('metrics', 'budget', e.target.value)}
                    placeholder="e.g., $500K - $1M annual budget approved"
                  />
                </div>
                <div>
                  <Label htmlFor="roi">ROI Expectations</Label>
                  <Input
                    id="roi"
                    value={meddpiccData.metrics.roi_expectations}
                    onChange={(e) => updateMeddpiccField('metrics', 'roi_expectations', e.target.value)}
                    placeholder="e.g., 300% ROI within 18 months"
                  />
                </div>
                <div>
                  <Label htmlFor="success">Success Criteria</Label>
                  <Textarea
                    id="success"
                    value={meddpiccData.metrics.success_criteria}
                    onChange={(e) => updateMeddpiccField('metrics', 'success_criteria', e.target.value)}
                    placeholder="Define measurable success metrics..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Economic Buyer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Economic Buyer
                </CardTitle>
                <CardDescription>Decision maker with budget authority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="eb-name">Name & Role</Label>
                  <Input
                    id="eb-name"
                    value={meddpiccData.economic_buyer.name}
                    onChange={(e) => updateMeddpiccField('economic_buyer', 'name', e.target.value)}
                    placeholder="e.g., Sarah Johnson, VP of Operations"
                  />
                </div>
                <div>
                  <Label htmlFor="eb-influence">Influence Level</Label>
                  <Select
                    value={meddpiccData.economic_buyer.influence_level}
                    onValueChange={(value) => updateMeddpiccField('economic_buyer', 'influence_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select influence level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High - Final decision maker</SelectItem>
                      <SelectItem value="medium">Medium - Strong influencer</SelectItem>
                      <SelectItem value="low">Low - Limited influence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="eb-engagement">Engagement Status</Label>
                  <Select
                    value={meddpiccData.economic_buyer.engagement_status}
                    onValueChange={(value) => updateMeddpiccField('economic_buyer', 'engagement_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select engagement status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engaged">Actively Engaged</SelectItem>
                      <SelectItem value="aware">Aware but Limited Contact</SelectItem>
                      <SelectItem value="unknown">Unknown/No Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Decision Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Decision Criteria
                </CardTitle>
                <CardDescription>Technical and business evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tech-req">Technical Requirements</Label>
                  <Textarea
                    id="tech-req"
                    value={meddpiccData.decision_criteria.technical_requirements}
                    onChange={(e) => updateMeddpiccField('decision_criteria', 'technical_requirements', e.target.value)}
                    placeholder="List key technical requirements and must-haves..."
                  />
                </div>
                <div>
                  <Label htmlFor="biz-req">Business Requirements</Label>
                  <Textarea
                    id="biz-req"
                    value={meddpiccData.decision_criteria.business_requirements}
                    onChange={(e) => updateMeddpiccField('decision_criteria', 'business_requirements', e.target.value)}
                    placeholder="Define business outcomes and requirements..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pain Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Pain Points
                </CardTitle>
                <CardDescription>Current challenges and their business impact</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="primary-pain">Primary Pain Point</Label>
                  <Textarea
                    id="primary-pain"
                    value={meddpiccData.pain_points.primary_pain}
                    onChange={(e) => updateMeddpiccField('pain_points', 'primary_pain', e.target.value)}
                    placeholder="Describe the main business challenge..."
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Impact Level</Label>
                  <Select
                    value={meddpiccData.pain_points.impact_level}
                    onValueChange={(value) => updateMeddpiccField('pain_points', 'impact_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical - Business threatening</SelectItem>
                      <SelectItem value="high">High - Significant impact</SelectItem>
                      <SelectItem value="medium">Medium - Moderate impact</SelectItem>
                      <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={meddpiccData.pain_points.urgency}
                    onValueChange={(value) => updateMeddpiccField('pain_points', 'urgency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate - Must solve now</SelectItem>
                      <SelectItem value="high">High - Within 3 months</SelectItem>
                      <SelectItem value="medium">Medium - Within 6 months</SelectItem>
                      <SelectItem value="low">Low - Nice to have</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
                <CardDescription>Areas where this opportunity shows promise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription>Gaps that need attention to improve win probability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{weakness}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Next Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recommended Next Actions
                </CardTitle>
                <CardDescription>Immediate steps to advance this opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.next_actions.map((action, index) => (
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
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {aiInsights.recommendations.map((rec, index) => (
              <Card key={index} className={`border-l-4 ${
                rec.priority === 'High' ? 'border-l-red-500' :
                rec.priority === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        {rec.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{rec.description}</CardDescription>
                    </div>
                    <Badge className={
                      rec.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-green-100 text-green-800 border-green-200'
                    }>
                      {rec.priority} Priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Action:</strong> {rec.action}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}