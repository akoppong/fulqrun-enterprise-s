import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Brain,
  Target,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Shield,
  Clock,
  Award,
  Plus,
  Trash2
} from '@phosphor-icons/react';

interface MEDDPICCData {
  metrics: {
    value: string;
    measurableOutcome: string;
    roi: number;
    paybackPeriod: number;
    confidence: number;
    aiInsights: string[];
  };
  economicBuyer: {
    identified: boolean;
    name: string;
    role: string;
    influence: number;
    accessibility: number;
    buyingPower: number;
    aiInsights: string[];
  };
  decisionCriteria: {
    technical: string[];
    business: string[];
    financial: string[];
    strategic: string[];
    weightings: { [key: string]: number };
    aiInsights: string[];
  };
  decisionProcess: {
    steps: Array<{
      step: string;
      owner: string;
      duration: number;
      status: 'pending' | 'in-progress' | 'complete';
    }>;
    timeline: string;
    risks: string[];
    aiInsights: string[];
  };
  paperProcess: {
    legal: boolean;
    procurement: boolean;
    security: boolean;
    compliance: boolean;
    requirements: string[];
    risks: string[];
    aiInsights: string[];
  };
  implictedNeed: {
    currentState: string;
    desiredState: string;
    gap: string;
    impact: string;
    urgency: number;
    aiInsights: string[];
  };
  champion: {
    identified: boolean;
    name: string;
    role: string;
    influence: number;
    commitment: number;
    credibility: number;
    coaching: string[];
    aiInsights: string[];
  };
  competition: {
    competitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      differentiation: string;
    }>;
    positioning: string;
    winStrategy: string;
    aiInsights: string[];
  };
}

interface AIInsight {
  category: 'warning' | 'opportunity' | 'recommendation' | 'risk';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

const defaultMEDDPICCData: MEDDPICCData = {
  metrics: {
    value: '',
    measurableOutcome: '',
    roi: 0,
    paybackPeriod: 0,
    confidence: 0,
    aiInsights: []
  },
  economicBuyer: {
    identified: false,
    name: '',
    role: '',
    influence: 0,
    accessibility: 0,
    buyingPower: 0,
    aiInsights: []
  },
  decisionCriteria: {
    technical: [],
    business: [],
    financial: [],
    strategic: [],
    weightings: {},
    aiInsights: []
  },
  decisionProcess: {
    steps: [],
    timeline: '',
    risks: [],
    aiInsights: []
  },
  paperProcess: {
    legal: false,
    procurement: false,
    security: false,
    compliance: false,
    requirements: [],
    risks: [],
    aiInsights: []
  },
  implictedNeed: {
    currentState: '',
    desiredState: '',
    gap: '',
    impact: '',
    urgency: 0,
    aiInsights: []
  },
  champion: {
    identified: false,
    name: '',
    role: '',
    influence: 0,
    commitment: 0,
    credibility: 0,
    coaching: [],
    aiInsights: []
  },
  competition: {
    competitors: [],
    positioning: '',
    winStrategy: '',
    aiInsights: []
  }
};

export function EnhancedMEDDPICCQualification({ 
  opportunityId, 
  onSave 
}: { 
  opportunityId: string; 
  onSave?: (data: MEDDPICCData) => void; 
}) {
  const [meddpiccData, setMeddpiccData] = useKV<MEDDPICCData>(
    `meddpicc-${opportunityId}`, 
    defaultMEDDPICCData
  );
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics');

  // Calculate overall qualification score
  const calculateQualificationScore = (): number => {
    const scores = [
      meddpiccData.metrics.confidence,
      meddpiccData.economicBuyer.identified ? 85 : 20,
      (meddpiccData.decisionCriteria.technical.length + 
       meddpiccData.decisionCriteria.business.length + 
       meddpiccData.decisionCriteria.financial.length) * 10,
      meddpiccData.decisionProcess.steps.length * 15,
      (meddpiccData.paperProcess.legal ? 25 : 0) + 
      (meddpiccData.paperProcess.procurement ? 25 : 0) + 
      (meddpiccData.paperProcess.security ? 25 : 0) + 
      (meddpiccData.paperProcess.compliance ? 25 : 0),
      meddpiccData.implictedNeed.urgency * 10,
      meddpiccData.champion.identified ? meddpiccData.champion.influence : 10,
      meddpiccData.competition.competitors.length > 0 ? 70 : 30
    ];
    
    return Math.min(100, scores.reduce((acc, score) => acc + score, 0) / 8);
  };

  // Generate AI insights based on current data
  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      const prompt = spark.llmPrompt`
        Analyze this MEDDPICC qualification data and provide specific insights and recommendations:
        
        Current Data:
        - Metrics: ${JSON.stringify(meddpiccData.metrics)}
        - Economic Buyer: ${JSON.stringify(meddpiccData.economicBuyer)}
        - Decision Criteria: ${JSON.stringify(meddpiccData.decisionCriteria)}
        - Decision Process: ${JSON.stringify(meddpiccData.decisionProcess)}
        - Champion: ${JSON.stringify(meddpiccData.champion)}
        - Competition: ${JSON.stringify(meddpiccData.competition)}
        
        Provide insights for gaps, risks, opportunities, and specific actionable recommendations.
      `;
      
      const insights = await spark.llm(prompt, 'gpt-4o', true);
      const parsedInsights = JSON.parse(insights);
      
      // Update each section with AI insights
      setMeddpiccData(current => ({
        ...current,
        metrics: { ...current.metrics, aiInsights: parsedInsights.metrics || [] },
        economicBuyer: { ...current.economicBuyer, aiInsights: parsedInsights.economicBuyer || [] },
        decisionCriteria: { ...current.decisionCriteria, aiInsights: parsedInsights.decisionCriteria || [] },
        decisionProcess: { ...current.decisionProcess, aiInsights: parsedInsights.decisionProcess || [] },
        champion: { ...current.champion, aiInsights: parsedInsights.champion || [] },
        competition: { ...current.competition, aiInsights: parsedInsights.competition || [] }
      }));
      
      toast.success('AI insights generated successfully');
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const qualificationScore = calculateQualificationScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced MEDDPICC Qualification</h2>
          <p className="text-muted-foreground">AI-powered deal qualification with intelligent insights</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(qualificationScore)}`}>
              {Math.round(qualificationScore)}%
            </div>
            <p className="text-sm text-muted-foreground">Qualification Score</p>
          </div>
          <Button 
            onClick={generateAIInsights} 
            disabled={isGeneratingInsights}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            {isGeneratingInsights ? 'Generating...' : 'AI Insights'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Qualification Completeness</span>
              <span className={getScoreColor(qualificationScore)}>
                {Math.round(qualificationScore)}%
              </span>
            </div>
            <Progress value={qualificationScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* MEDDPICC Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="economic">Economic</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="paper">Paper</TabsTrigger>
          <TabsTrigger value="need">Need</TabsTrigger>
          <TabsTrigger value="champion">Champion</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6 mt-6">
          <MetricsSection data={meddpiccData.metrics} onUpdate={(metrics) => 
            setMeddpiccData(current => ({ ...current, metrics }))
          } />
        </TabsContent>

        <TabsContent value="economic" className="space-y-6 mt-6">
          <EconomicBuyerSection data={meddpiccData.economicBuyer} onUpdate={(economicBuyer) => 
            setMeddpiccData(current => ({ ...current, economicBuyer }))
          } />
        </TabsContent>

        <TabsContent value="decision" className="space-y-6 mt-6">
          <DecisionCriteriaSection data={meddpiccData.decisionCriteria} onUpdate={(decisionCriteria) => 
            setMeddpiccData(current => ({ ...current, decisionCriteria }))
          } />
        </TabsContent>

        <TabsContent value="process" className="space-y-6 mt-6">
          <DecisionProcessSection data={meddpiccData.decisionProcess} onUpdate={(decisionProcess) => 
            setMeddpiccData(current => ({ ...current, decisionProcess }))
          } />
        </TabsContent>

        <TabsContent value="paper" className="space-y-6 mt-6">
          <PaperProcessSection data={meddpiccData.paperProcess} onUpdate={(paperProcess) => 
            setMeddpiccData(current => ({ ...current, paperProcess }))
          } />
        </TabsContent>

        <TabsContent value="need" className="space-y-6 mt-6">
          <ImplictedNeedSection data={meddpiccData.implictedNeed} onUpdate={(implictedNeed) => 
            setMeddpiccData(current => ({ ...current, implictedNeed }))
          } />
        </TabsContent>

        <TabsContent value="champion" className="space-y-6 mt-6">
          <ChampionSection data={meddpiccData.champion} onUpdate={(champion) => 
            setMeddpiccData(current => ({ ...current, champion }))
          } />
        </TabsContent>

        <TabsContent value="competition" className="space-y-6 mt-6">
          <CompetitionSection data={meddpiccData.competition} onUpdate={(competition) => 
            setMeddpiccData(current => ({ ...current, competition }))
          } />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricsSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['metrics']; 
  onUpdate: (data: MEDDPICCData['metrics']) => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Metrics - Quantifiable Business Impact
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="measurable-value">Measurable Value</Label>
            <Input
              id="measurable-value"
              placeholder="e.g., Increase revenue by $2M annually"
              value={data.value}
              onChange={(e) => onUpdate({ ...data, value: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="roi">Expected ROI (%)</Label>
            <Input
              id="roi"
              type="number"
              placeholder="150"
              value={data.roi}
              onChange={(e) => onUpdate({ ...data, roi: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="measurable-outcome">Specific Measurable Outcome</Label>
          <Textarea
            id="measurable-outcome"
            placeholder="Describe the specific, quantifiable outcomes the customer expects..."
            value={data.measurableOutcome}
            onChange={(e) => onUpdate({ ...data, measurableOutcome: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="payback-period">Payback Period (months)</Label>
            <Input
              id="payback-period"
              type="number"
              placeholder="18"
              value={data.paybackPeriod}
              onChange={(e) => onUpdate({ ...data, paybackPeriod: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="confidence">Confidence Level (%)</Label>
            <Input
              id="confidence"
              type="range"
              min="0"
              max="100"
              value={data.confidence}
              onChange={(e) => onUpdate({ ...data, confidence: parseInt(e.target.value) || 0 })}
            />
            <div className="text-center text-sm text-muted-foreground mt-1">
              {data.confidence}% confident
            </div>
          </div>
        </div>

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function EconomicBuyerSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['economicBuyer']; 
  onUpdate: (data: MEDDPICCData['economicBuyer']) => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Economic Buyer - Decision Maker with Budget Authority
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="eb-identified" className="flex items-center gap-2 cursor-pointer">
            <input
              id="eb-identified"
              type="checkbox"
              checked={data.identified}
              onChange={(e) => onUpdate({ ...data, identified: e.target.checked })}
              className="rounded"
            />
            Economic Buyer Identified
          </Label>
        </div>

        {data.identified && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eb-name">Name</Label>
                <Input
                  id="eb-name"
                  placeholder="Full name"
                  value={data.name}
                  onChange={(e) => onUpdate({ ...data, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="eb-role">Role/Title</Label>
                <Input
                  id="eb-role"
                  placeholder="VP Finance, CFO, etc."
                  value={data.role}
                  onChange={(e) => onUpdate({ ...data, role: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eb-influence">Influence (1-10)</Label>
                <Input
                  id="eb-influence"
                  type="range"
                  min="1"
                  max="10"
                  value={data.influence}
                  onChange={(e) => onUpdate({ ...data, influence: parseInt(e.target.value) || 1 })}
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {data.influence}/10
                </div>
              </div>
              <div>
                <Label htmlFor="eb-accessibility">Accessibility (1-10)</Label>
                <Input
                  id="eb-accessibility"
                  type="range"
                  min="1"
                  max="10"
                  value={data.accessibility}
                  onChange={(e) => onUpdate({ ...data, accessibility: parseInt(e.target.value) || 1 })}
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {data.accessibility}/10
                </div>
              </div>
              <div>
                <Label htmlFor="eb-buying-power">Buying Power (1-10)</Label>
                <Input
                  id="eb-buying-power"
                  type="range"
                  min="1"
                  max="10"
                  value={data.buyingPower}
                  onChange={(e) => onUpdate({ ...data, buyingPower: parseInt(e.target.value) || 1 })}
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {data.buyingPower}/10
                </div>
              </div>
            </div>
          </>
        )}

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function DecisionCriteriaSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['decisionCriteria']; 
  onUpdate: (data: MEDDPICCData['decisionCriteria']) => void; 
}) {
  const [newCriterion, setNewCriterion] = useState('');
  const [criterionType, setCriterionType] = useState<'technical' | 'business' | 'financial' | 'strategic'>('business');

  const addCriterion = () => {
    if (newCriterion.trim()) {
      onUpdate({
        ...data,
        [criterionType]: [...data[criterionType], newCriterion.trim()]
      });
      setNewCriterion('');
    }
  };

  const removeCriterion = (type: string, index: number) => {
    onUpdate({
      ...data,
      [type]: (data as any)[type].filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Decision Criteria - How They Will Choose
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Select value={criterionType} onValueChange={(value: any) => setCriterionType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="strategic">Strategic</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Add decision criterion"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
            className="flex-1"
          />
          <Button onClick={addCriterion}>Add</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Badge variant="secondary">Technical</Badge>
              ({data.technical.length})
            </h4>
            <div className="space-y-2">
              {data.technical.map((criterion, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{criterion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion('technical', index)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Badge variant="secondary">Business</Badge>
              ({data.business.length})
            </h4>
            <div className="space-y-2">
              {data.business.map((criterion, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{criterion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion('business', index)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Badge variant="secondary">Financial</Badge>
              ({data.financial.length})
            </h4>
            <div className="space-y-2">
              {data.financial.map((criterion, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{criterion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion('financial', index)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Badge variant="secondary">Strategic</Badge>
              ({data.strategic.length})
            </h4>
            <div className="space-y-2">
              {data.strategic.map((criterion, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <span className="text-sm">{criterion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCriterion('strategic', index)}
                    className="h-6 w-6 p-0 text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function DecisionProcessSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['decisionProcess']; 
  onUpdate: (data: MEDDPICCData['decisionProcess']) => void; 
}) {
  const addStep = () => {
    const newStep = {
      step: 'New Step',
      owner: '',
      duration: 7,
      status: 'pending' as const
    };
    onUpdate({
      ...data,
      steps: [...data.steps, newStep]
    });
  };

  const updateStep = (index: number, updatedStep: any) => {
    const updatedSteps = data.steps.map((step, i) => i === index ? updatedStep : step);
    onUpdate({ ...data, steps: updatedSteps });
  };

  const removeStep = (index: number) => {
    onUpdate({
      ...data,
      steps: data.steps.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Decision Process - How They Will Decide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="timeline">Overall Timeline</Label>
          <Input
            id="timeline"
            placeholder="e.g., Q1 2024 decision expected"
            value={data.timeline}
            onChange={(e) => onUpdate({ ...data, timeline: e.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Decision Steps</h4>
            <Button onClick={addStep} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
          
          <div className="space-y-3">
            {data.steps.map((step, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Step name"
                    value={step.step}
                    onChange={(e) => updateStep(index, { ...step, step: e.target.value })}
                  />
                  <Input
                    placeholder="Owner/Stakeholder"
                    value={step.owner}
                    onChange={(e) => updateStep(index, { ...step, owner: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Days"
                    value={step.duration}
                    onChange={(e) => updateStep(index, { ...step, duration: parseInt(e.target.value) || 0 })}
                  />
                  <div className="flex gap-2">
                    <Select value={step.status} onValueChange={(value: any) => updateStep(index, { ...step, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="complete">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function PaperProcessSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['paperProcess']; 
  onUpdate: (data: MEDDPICCData['paperProcess']) => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Paper Process - Legal and Procurement Requirements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Process Requirements</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.legal}
                  onChange={(e) => onUpdate({ ...data, legal: e.target.checked })}
                  className="rounded"
                />
                Legal Review Required
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.procurement}
                  onChange={(e) => onUpdate({ ...data, procurement: e.target.checked })}
                  className="rounded"
                />
                Procurement Process Required
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.security}
                  onChange={(e) => onUpdate({ ...data, security: e.target.checked })}
                  className="rounded"
                />
                Security Review Required
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.compliance}
                  onChange={(e) => onUpdate({ ...data, compliance: e.target.checked })}
                  className="rounded"
                />
                Compliance Review Required
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Additional Requirements</h4>
            <Textarea
              placeholder="List any additional paper process requirements..."
              value={data.requirements.join('\n')}
              onChange={(e) => onUpdate({ 
                ...data, 
                requirements: e.target.value.split('\n').filter(req => req.trim()) 
              })}
              rows={4}
            />
          </div>
        </div>

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function ImplictedNeedSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['implictedNeed']; 
  onUpdate: (data: MEDDPICCData['implictedNeed']) => void; 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Implicated Need - Pain Points and Desired Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="current-state">Current State</Label>
          <Textarea
            id="current-state"
            placeholder="Describe their current situation and challenges..."
            value={data.currentState}
            onChange={(e) => onUpdate({ ...data, currentState: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="desired-state">Desired Future State</Label>
          <Textarea
            id="desired-state"
            placeholder="Describe their desired future state and goals..."
            value={data.desiredState}
            onChange={(e) => onUpdate({ ...data, desiredState: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="gap-analysis">Gap Analysis</Label>
          <Textarea
            id="gap-analysis"
            placeholder="Identify the specific gaps between current and desired state..."
            value={data.gap}
            onChange={(e) => onUpdate({ ...data, gap: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="business-impact">Business Impact</Label>
          <Textarea
            id="business-impact"
            placeholder="What's the impact of not solving this problem?"
            value={data.impact}
            onChange={(e) => onUpdate({ ...data, impact: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="urgency">Urgency Level (1-10)</Label>
          <Input
            id="urgency"
            type="range"
            min="1"
            max="10"
            value={data.urgency}
            onChange={(e) => onUpdate({ ...data, urgency: parseInt(e.target.value) || 1 })}
          />
          <div className="text-center text-sm text-muted-foreground mt-1">
            {data.urgency}/10 - {data.urgency <= 3 ? 'Low' : data.urgency <= 7 ? 'Medium' : 'High'} urgency
          </div>
        </div>

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function ChampionSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['champion']; 
  onUpdate: (data: MEDDPICCData['champion']) => void; 
}) {
  const [newCoaching, setNewCoaching] = useState('');

  const addCoaching = () => {
    if (newCoaching.trim()) {
      onUpdate({
        ...data,
        coaching: [...data.coaching, newCoaching.trim()]
      });
      setNewCoaching('');
    }
  };

  const removeCoaching = (index: number) => {
    onUpdate({
      ...data,
      coaching: data.coaching.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Champion - Internal Advocate and Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.identified}
              onChange={(e) => onUpdate({ ...data, identified: e.target.checked })}
              className="rounded"
            />
            Champion Identified
          </label>
        </div>

        {data.identified && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="champion-name">Champion Name</Label>
                <Input
                  id="champion-name"
                  placeholder="Full name"
                  value={data.name}
                  onChange={(e) => onUpdate({ ...data, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="champion-role">Role/Title</Label>
                <Input
                  id="champion-role"
                  placeholder="Role within the organization"
                  value={data.role}
                  onChange={(e) => onUpdate({ ...data, role: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="champion-influence">Influence (1-10)</Label>
                <Input
                  id="champion-influence"
                  type="range"
                  min="1"
                  max="10"
                  value={data.influence}
                  onChange={(e) => onUpdate({ ...data, influence: parseInt(e.target.value) || 1 })}
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {data.influence}/10
                </div>
              </div>
              <div>
                <Label htmlFor="champion-commitment">Commitment (1-10)</Label>
                <Input
                  id="champion-commitment"
                  type="range"
                  min="1"
                  max="10"
                  value={data.commitment}
                  onChange={(e) => onUpdate({ ...data, commitment: parseInt(e.target.value) || 1 })}
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {data.commitment}/10
                </div>
              </div>
              <div>
                <Label htmlFor="champion-credibility">Credibility (1-10)</Label>
                <Input
                  id="champion-credibility"
                  type="range"
                  min="1"
                  max="10"
                  value={data.credibility}
                  onChange={(e) => onUpdate({ ...data, credibility: parseInt(e.target.value) || 1 })}
                />
                <div className="text-center text-sm text-muted-foreground mt-1">
                  {data.credibility}/10
                </div>
              </div>
            </div>

            <div>
              <Label>Champion Coaching & Intelligence</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add coaching note or intelligence"
                  value={newCoaching}
                  onChange={(e) => setNewCoaching(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCoaching()}
                />
                <Button onClick={addCoaching}>Add</Button>
              </div>
              <div className="space-y-2 mt-3">
                {data.coaching.map((note, index) => (
                  <div key={index} className="flex items-start justify-between p-3 bg-muted/50 rounded">
                    <span className="text-sm flex-1">{note}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoaching(index)}
                      className="h-6 w-6 p-0 text-destructive ml-2"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function CompetitionSection({ 
  data, 
  onUpdate 
}: { 
  data: MEDDPICCData['competition']; 
  onUpdate: (data: MEDDPICCData['competition']) => void; 
}) {
  const addCompetitor = () => {
    const newCompetitor = {
      name: 'New Competitor',
      strengths: [],
      weaknesses: [],
      differentiation: ''
    };
    onUpdate({
      ...data,
      competitors: [...data.competitors, newCompetitor]
    });
  };

  const updateCompetitor = (index: number, updatedCompetitor: any) => {
    const updatedCompetitors = data.competitors.map((comp, i) => 
      i === index ? updatedCompetitor : comp
    );
    onUpdate({ ...data, competitors: updatedCompetitors });
  };

  const removeCompetitor = (index: number) => {
    onUpdate({
      ...data,
      competitors: data.competitors.filter((_, i) => i !== index)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Competition - Competitive Landscape Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Identified Competitors</h4>
            <Button onClick={addCompetitor} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Competitor
            </Button>
          </div>

          <div className="space-y-4">
            {data.competitors.map((competitor, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Input
                    placeholder="Competitor name"
                    value={competitor.name}
                    onChange={(e) => updateCompetitor(index, { ...competitor, name: e.target.value })}
                    className="font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCompetitor(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Strengths</Label>
                    <Textarea
                      placeholder="List competitor strengths..."
                      value={competitor.strengths.join('\n')}
                      onChange={(e) => updateCompetitor(index, {
                        ...competitor,
                        strengths: e.target.value.split('\n').filter(s => s.trim())
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Weaknesses</Label>
                    <Textarea
                      placeholder="List competitor weaknesses..."
                      value={competitor.weaknesses.join('\n')}
                      onChange={(e) => updateCompetitor(index, {
                        ...competitor,
                        weaknesses: e.target.value.split('\n').filter(w => w.trim())
                      })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label>Our Differentiation</Label>
                  <Textarea
                    placeholder="How do we differentiate against this competitor?"
                    value={competitor.differentiation}
                    onChange={(e) => updateCompetitor(index, {
                      ...competitor,
                      differentiation: e.target.value
                    })}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="positioning">Overall Positioning</Label>
            <Textarea
              id="positioning"
              placeholder="How are we positioned against the competition?"
              value={data.positioning}
              onChange={(e) => onUpdate({ ...data, positioning: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="win-strategy">Win Strategy</Label>
            <Textarea
              id="win-strategy"
              placeholder="What's our strategy to win this deal?"
              value={data.winStrategy}
              onChange={(e) => onUpdate({ ...data, winStrategy: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {data.aiInsights.length > 0 && <AIInsightsDisplay insights={data.aiInsights} />}
      </CardContent>
    </Card>
  );
}

function AIInsightsDisplay({ insights }: { insights: string[] }) {
  if (!insights.length) return null;

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-900">AI Insights & Recommendations</span>
      </div>
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <div key={index} className="text-sm text-blue-800">
            • {insight}
          </div>
        ))}
      </div>
    </div>
  );
}