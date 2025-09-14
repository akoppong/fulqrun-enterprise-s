import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendUp, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Users,
  DollarSign,
  Clock,
  Shield,
  ArrowRight
} from '@phosphor-icons/react';
import { MEDDPICC, Opportunity, Company, Contact } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnhancedMEDDPICCScoringProps {
  meddpicc: MEDDPICC;
  onMEDDPICCChange: (field: string, value: string) => void;
  opportunity: Partial<Opportunity>;
  company?: Company;
  contact?: Contact;
  className?: string;
}

interface MEDDPICCHints {
  metricsHints: string[];
  championHints: string[];
  riskFactors: string[];
}

interface ScoringBreakdown {
  metrics: number;
  economicBuyer: number;
  decisionCriteria: number;
  decisionProcess: number;
  paperProcess: number;
  implicatePain: number;
  champion: number;
  competition: number;
}

const MEDDPICC_FIELDS = [
  {
    key: 'metrics',
    label: 'Metrics',
    description: 'What economic impact can we measure?',
    placeholder: 'Quantify ROI, cost savings, revenue impact, efficiency gains...',
    icon: DollarSign,
    weight: 0.15,
    hints: [
      'What ROI metrics matter most to your organization?',
      'How do you currently measure success in this area?',
      'What are the costs of not solving this problem?'
    ]
  },
  {
    key: 'economicBuyer',
    label: 'Economic Buyer',
    description: 'Who has the economic authority to buy?',
    placeholder: 'Identify the person with budget authority and final approval...',
    icon: Users,
    weight: 0.15,
    hints: [
      'Who controls the budget for this initiative?',
      'Who would ultimately approve this purchase?',
      'Who would be held accountable for the results?'
    ]
  },
  {
    key: 'decisionCriteria',
    label: 'Decision Criteria',
    description: 'What criteria will they use to decide?',
    placeholder: 'List the technical, business, and vendor criteria...',
    icon: Target,
    weight: 0.15,
    hints: [
      'What are their must-have requirements?',
      'How do they evaluate different solutions?',
      'What are their selection criteria priorities?'
    ]
  },
  {
    key: 'decisionProcess',
    label: 'Decision Process',
    description: 'How will they make the decision?',
    placeholder: 'Map out steps, stakeholders, timeline, approval gates...',
    icon: ArrowRight,
    weight: 0.15,
    hints: [
      'What steps are involved in their decision process?',
      'Who needs to be involved at each stage?',
      'What is their typical timeline for decisions?'
    ]
  },
  {
    key: 'paperProcess',
    label: 'Paper Process',
    description: 'What\'s the approval/procurement process?',
    placeholder: 'Document legal, compliance, procurement requirements...',
    icon: Shield,
    weight: 0.10,
    hints: [
      'What legal/compliance requirements exist?',
      'Who handles procurement and contracts?',
      'What approval workflows are required?'
    ]
  },
  {
    key: 'implicatePain',
    label: 'Implicate Pain',
    description: 'What pain are we addressing?',
    placeholder: 'Identify the business pain and consequences of inaction...',
    icon: AlertTriangle,
    weight: 0.15,
    hints: [
      'What problems are they trying to solve?',
      'What happens if they don\'t solve this?',
      'How urgent is this pain point?'
    ]
  },
  {
    key: 'champion',
    label: 'Champion',
    description: 'Who is actively selling for us internally?',
    placeholder: 'Identify who advocates for your solution inside the organization...',
    icon: CheckCircle,
    weight: 0.15,
    hints: [
      'Who benefits most from solving this problem?',
      'Who has advocated for similar solutions before?',
      'Who would champion this initiative internally?'
    ]
  }
];

export function EnhancedMEDDPICCScoring({ 
  meddpicc, 
  onMEDDPICCChange, 
  opportunity, 
  company, 
  contact,
  className 
}: EnhancedMEDDPICCScoringProps) {
  const [hints, setHints] = useState<MEDDPICCHints | null>(null);
  const [generatingHints, setGeneratingHints] = useState(false);
  const [scoringBreakdown, setScoringBreakdown] = useState<ScoringBreakdown>({
    metrics: 0,
    economicBuyer: 0,
    decisionCriteria: 0,
    decisionProcess: 0,
    paperProcess: 0,
    implicatePain: 0,
    champion: 0,
    competition: 0
  });
  const [activeField, setActiveField] = useState<string>('metrics');

  // Calculate field scores
  const calculateFieldScore = (field: string, value: string): number => {
    if (!value || value.trim().length === 0) return 0;
    
    const length = value.trim().length;
    if (length < 10) return 20;
    if (length < 30) return 40;
    if (length < 80) return 60;
    if (length < 150) return 80;
    return 100;
  };

  // Calculate total MEDDPICC score
  const calculateTotalScore = (): number => {
    let totalScore = 0;
    MEDDPICC_FIELDS.forEach(field => {
      const fieldValue = meddpicc[field.key as keyof MEDDPICC] as string || '';
      const fieldScore = calculateFieldScore(field.key, fieldValue);
      totalScore += fieldScore * field.weight;
    });
    return Math.round(totalScore);
  };

  // Update scoring breakdown when MEDDPICC changes
  useEffect(() => {
    const breakdown: ScoringBreakdown = {
      metrics: calculateFieldScore('metrics', meddpicc.metrics || ''),
      economicBuyer: calculateFieldScore('economicBuyer', meddpicc.economicBuyer || ''),
      decisionCriteria: calculateFieldScore('decisionCriteria', meddpicc.decisionCriteria || ''),
      decisionProcess: calculateFieldScore('decisionProcess', meddpicc.decisionProcess || ''),
      paperProcess: calculateFieldScore('paperProcess', meddpicc.paperProcess || ''),
      implicatePain: calculateFieldScore('implicatePain', meddpicc.implicatePain || ''),
      champion: calculateFieldScore('champion', meddpicc.champion || ''),
      competition: 0 // Placeholder for competition analysis
    };
    setScoringBreakdown(breakdown);
  }, [meddpicc]);

  const generateAIHints = async () => {
    if (!company || !opportunity) {
      toast.error('Company and opportunity information needed for AI hints');
      return;
    }

    setGeneratingHints(true);
    try {
      const aiHints = await AIService.generateMEDDPICCHints(opportunity as Opportunity, company);
      setHints(aiHints);
      toast.success('AI hints generated successfully');
    } catch (error) {
      console.error('Failed to generate AI hints:', error);
      toast.error('Failed to generate AI hints');
    } finally {
      setGeneratingHints(false);
    }
  };

  const currentScore = calculateTotalScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  const getCompletionLevel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Partial';
    return 'Weak';
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendUp size={20} className="text-primary" />
              <CardTitle>MEDDPICC Qualification Score</CardTitle>
            </div>
            <Button 
              onClick={generateAIHints}
              disabled={generatingHints}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              <Brain size={16} />
              {generatingHints ? 'Generating...' : 'AI Hints'}
            </Button>
          </div>
          <CardDescription>
            Complete each section to improve your qualification confidence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className={cn("text-3xl font-bold", getScoreColor(currentScore))}>
                    {currentScore}%
                  </span>
                  <Badge variant={getScoreBadgeVariant(currentScore)}>
                    {getCompletionLevel(currentScore)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Qualification Confidence Level
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  Target: 80%+ for high confidence
                </div>
                <Progress value={currentScore} className="w-32 mt-1" />
              </div>
            </div>

            {currentScore < 60 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Qualification needs strengthening. Focus on completing {
                    MEDDPICC_FIELDS
                      .filter(field => calculateFieldScore(field.key, meddpicc[field.key as keyof MEDDPICC] as string || '') < 60)
                      .map(field => field.label)
                      .slice(0, 2)
                      .join(' and ')
                  } sections.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MEDDPICC Tabs */}
      <Tabs value={activeField} onValueChange={setActiveField} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          {MEDDPICC_FIELDS.map((field) => {
            const fieldScore = scoringBreakdown[field.key as keyof ScoringBreakdown];
            const Icon = field.icon;
            return (
              <TabsTrigger 
                key={field.key} 
                value={field.key}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Icon size={16} />
                <span className="text-xs hidden sm:inline">{field.label}</span>
                <div className="flex items-center gap-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    fieldScore >= 80 ? "bg-green-500" :
                    fieldScore >= 60 ? "bg-blue-500" :
                    fieldScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                  )} />
                  <span className="text-xs">{fieldScore}%</span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {MEDDPICC_FIELDS.map((field) => (
          <TabsContent key={field.key} value={field.key} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <field.icon size={20} />
                  {field.label}
                  <Badge variant={getScoreBadgeVariant(scoringBreakdown[field.key as keyof ScoringBreakdown])}>
                    {scoringBreakdown[field.key as keyof ScoringBreakdown]}%
                  </Badge>
                </CardTitle>
                <CardDescription>{field.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    Response
                  </Label>
                  <Textarea
                    id={field.key}
                    placeholder={field.placeholder}
                    value={meddpicc[field.key as keyof MEDDPICC] as string || ''}
                    onChange={(e) => onMEDDPICCChange(field.key, e.target.value)}
                    rows={4}
                    className="mt-1 resize-none"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    {(meddpicc[field.key as keyof MEDDPICC] as string || '').length} characters
                  </div>
                </div>

                {/* Field-specific hints */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Lightbulb size={16} />
                    Discovery Questions
                  </h4>
                  <div className="space-y-2">
                    {field.hints.map((hint, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                        <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm">{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI-generated hints */}
                {hints && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Brain size={16} />
                      AI-Generated Insights
                    </h4>
                    <div className="space-y-2">
                      {field.key === 'metrics' && hints.metricsHints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <Brain size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{hint}</span>
                        </div>
                      ))}
                      {field.key === 'champion' && hints.championHints.map((hint, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <Brain size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk factors for relevant fields */}
                {(field.key === 'champion' || field.key === 'decisionProcess') && hints?.riskFactors && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Risk Factors to Investigate
                    </h4>
                    <div className="space-y-2">
                      {hints.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} />
            Scoring Breakdown
          </CardTitle>
          <CardDescription>
            Individual component scores and weights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MEDDPICC_FIELDS.map((field) => {
              const fieldScore = scoringBreakdown[field.key as keyof ScoringBreakdown];
              const weightedScore = fieldScore * field.weight;
              const Icon = field.icon;
              
              return (
                <div key={field.key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="text-muted-foreground" />
                    <div>
                      <div className="font-medium">{field.label}</div>
                      <div className="text-xs text-muted-foreground">
                        Weight: {(field.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={fieldScore} className="w-20" />
                    <div className="text-right min-w-[60px]">
                      <div className={cn("font-medium", getScoreColor(fieldScore))}>
                        {fieldScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        +{weightedScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {currentScore < 80 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Next Actions
            </CardTitle>
            <CardDescription>
              Recommended steps to improve qualification score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MEDDPICC_FIELDS
                .filter(field => calculateFieldScore(field.key, meddpicc[field.key as keyof MEDDPICC] as string || '') < 60)
                .slice(0, 3)
                .map((field, index) => (
                  <div key={field.key} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">Complete {field.label} qualification</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {field.description}
                      </div>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto mt-1"
                        onClick={() => setActiveField(field.key)}
                      >
                        Work on this section →
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}