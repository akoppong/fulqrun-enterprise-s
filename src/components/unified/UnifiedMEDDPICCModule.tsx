import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Brain,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Users,
  Shield,
  Download,
  Share
} from '@phosphor-icons/react';
import { MEDDPICC } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface UnifiedMEDDPICCModuleProps {
  meddpicc: MEDDPICC;
  onChange: (meddpicc: MEDDPICC) => void;
  opportunityValue?: number;
  companyName?: string;
  readonly?: boolean;
  source?: 'pipeline' | 'opportunities' | 'standalone';
}

interface MEDDPICCQuestion {
  id: string;
  text: string;
  type: 'single-select';
  options: {
    label: string;
    value: string;
    score: number;
  }[];
  tooltip: string;
}

interface MEDDPICCPillar {
  id: keyof MEDDPICC;
  title: string;
  description: string;
  questions: MEDDPICCQuestion[];
  tips: string[];
  redFlags: string[];
  examples: {
    poor: string;
    good: string;
    excellent: string;
  };
}

const MEDDPICC_PILLARS: MEDDPICCPillar[] = [
  {
    id: 'metrics',
    title: 'Metrics',
    description: 'Quantifiable business impact and success criteria',
    questions: [
      {
        id: 'metrics_1',
        text: 'Do you understand the customer\'s key metrics driving this project?',
        type: 'single-select',
        options: [
          { label: 'No understanding', value: 'no', score: 0 },
          { label: 'Basic understanding', value: 'partial', score: 15 },
          { label: 'Clear understanding', value: 'yes', score: 30 }
        ],
        tooltip: 'Understanding customer metrics is crucial for demonstrating ROI'
      },
      {
        id: 'metrics_2',
        text: 'Can you quantify the business impact of your solution?',
        type: 'single-select',
        options: [
          { label: 'Cannot quantify', value: 'no', score: 0 },
          { label: 'Rough estimates', value: 'partial', score: 10 },
          { label: 'Detailed ROI model', value: 'yes', score: 20 }
        ],
        tooltip: 'Quantified business impact strengthens your value proposition'
      }
    ],
    tips: [
      'Focus on quantifiable business outcomes',
      'Connect your solution to measurable improvements',
      'Use customer data to build ROI models',
      'Understand both cost savings and revenue impact'
    ],
    redFlags: [
      'Customer cannot articulate success metrics',
      'No budget allocated for measuring ROI',
      'Stakeholders disagree on success criteria'
    ],
    examples: {
      poor: 'Customer wants to "improve efficiency" but cannot specify how it will be measured',
      good: 'Customer wants to reduce processing time by 50% within 6 months',
      excellent: 'Customer has detailed ROI model showing $2M annual savings with clear measurement criteria'
    }
  },
  {
    id: 'economicBuyer',
    title: 'Economic Buyer',
    description: 'Person with budget authority and final decision power',
    questions: [
      {
        id: 'economic_buyer_1',
        text: 'Have you identified the economic buyer?',
        type: 'single-select',
        options: [
          { label: 'Not identified', value: 'no', score: 0 },
          { label: 'Partially identified', value: 'partial', score: 15 },
          { label: 'Clearly identified', value: 'yes', score: 30 }
        ],
        tooltip: 'The economic buyer has the final authority to approve the purchase'
      },
      {
        id: 'economic_buyer_2',
        text: 'Do you have access to the economic buyer?',
        type: 'single-select',
        options: [
          { label: 'No access', value: 'no', score: 0 },
          { label: 'Indirect access', value: 'partial', score: 10 },
          { label: 'Direct access', value: 'yes', score: 20 }
        ],
        tooltip: 'Direct access to the economic buyer significantly improves win probability'
      }
    ],
    tips: [
      'Identify who controls the budget',
      'Understand their priorities and concerns',
      'Build relationships early in the sales cycle',
      'Confirm decision-making authority'
    ],
    redFlags: [
      'Multiple people claim to be the decision maker',
      'Budget ownership is unclear',
      'Economic buyer is unavailable or unengaged'
    ],
    examples: {
      poor: 'Working only with technical contacts, economic buyer unknown',
      good: 'Economic buyer identified through champion, some indirect contact',
      excellent: 'Regular direct meetings with economic buyer, understands their priorities'
    }
  },
  {
    id: 'decisionCriteria',
    title: 'Decision Criteria',
    description: 'Formal and informal criteria used to evaluate solutions',
    questions: [
      {
        id: 'decision_criteria_1',
        text: 'Do you understand the customer\'s formal decision criteria?',
        type: 'single-select',
        options: [
          { label: 'No understanding', value: 'no', score: 0 },
          { label: 'Partial understanding', value: 'partial', score: 15 },
          { label: 'Full understanding', value: 'yes', score: 30 }
        ],
        tooltip: 'Understanding decision criteria helps position your solution effectively'
      },
      {
        id: 'decision_criteria_2',
        text: 'Have you influenced the decision criteria?',
        type: 'single-select',
        options: [
          { label: 'No influence', value: 'no', score: 0 },
          { label: 'Some influence', value: 'partial', score: 10 },
          { label: 'Strong influence', value: 'yes', score: 20 }
        ],
        tooltip: 'Influencing decision criteria early gives you a competitive advantage'
      }
    ],
    tips: [
      'Understand both technical and business criteria',
      'Identify weighted importance of each criterion',
      'Influence criteria during early sales stages',
      'Map your strengths to their priorities'
    ],
    redFlags: [
      'Decision criteria heavily favor competitors',
      'Criteria change frequently during evaluation',
      'Your solution doesn\'t meet key criteria'
    ],
    examples: {
      poor: 'Customer evaluating on price alone, criteria favor competitor',
      good: 'Multiple criteria identified, some favor your solution',
      excellent: 'You helped shape criteria that highlight your unique strengths'
    }
  },
  {
    id: 'decisionProcess',
    title: 'Decision Process',
    description: 'Steps and timeline for making the purchase decision',
    questions: [
      {
        id: 'decision_process_1',
        text: 'Do you understand the customer\'s decision-making process?',
        type: 'single-select',
        options: [
          { label: 'No understanding', value: 'no', score: 0 },
          { label: 'Basic understanding', value: 'partial', score: 15 },
          { label: 'Detailed understanding', value: 'yes', score: 30 }
        ],
        tooltip: 'Understanding the process helps you navigate through each step'
      },
      {
        id: 'decision_process_2',
        text: 'Are you aligned with their timeline?',
        type: 'single-select',
        options: [
          { label: 'Timeline unclear', value: 'no', score: 0 },
          { label: 'Rough timeline', value: 'partial', score: 10 },
          { label: 'Detailed timeline', value: 'yes', score: 20 }
        ],
        tooltip: 'Timeline alignment helps with resource planning and urgency'
      }
    ],
    tips: [
      'Map out all decision-making steps',
      'Identify all stakeholders involved',
      'Understand approval processes',
      'Align your sales process with their buying process'
    ],
    redFlags: [
      'Process is unclear or constantly changing',
      'Key stakeholders are not engaged',
      'Timeline keeps getting pushed out'
    ],
    examples: {
      poor: 'Customer says "we\'ll make a decision soon" with no specific process',
      good: 'Multi-step evaluation process with defined timeline',
      excellent: 'Detailed decision roadmap with specific dates and stakeholder involvement'
    }
  },
  {
    id: 'paperProcess',
    title: 'Paper Process',
    description: 'Legal, procurement, and contract approval requirements',
    questions: [
      {
        id: 'paper_process_1',
        text: 'Do you understand the customer\'s procurement process?',
        type: 'single-select',
        options: [
          { label: 'No understanding', value: 'no', score: 0 },
          { label: 'Basic understanding', value: 'partial', score: 15 },
          { label: 'Detailed understanding', value: 'yes', score: 30 }
        ],
        tooltip: 'Understanding procurement requirements prevents delays at contract time'
      },
      {
        id: 'paper_process_2',
        text: 'Have you identified potential contract obstacles?',
        type: 'single-select',
        options: [
          { label: 'Not identified', value: 'no', score: 0 },
          { label: 'Some identified', value: 'partial', score: 10 },
          { label: 'All identified', value: 'yes', score: 20 }
        ],
        tooltip: 'Early identification of contract issues allows time to resolve them'
      }
    ],
    tips: [
      'Understand legal and compliance requirements',
      'Identify all approval steps',
      'Prepare required documentation early',
      'Build relationships with procurement team'
    ],
    redFlags: [
      'Complex procurement process not understood',
      'Legal issues that could block the deal',
      'Procurement team not engaged'
    ],
    examples: {
      poor: 'No understanding of procurement process, legal issues discovered late',
      good: 'Basic procurement process mapped, some legal requirements known',
      excellent: 'Complete understanding of all approval steps and documentation requirements'
    }
  },
  {
    id: 'identifyPain',
    title: 'Identify Pain',
    description: 'Business problems and consequences of not solving them',
    questions: [
      {
        id: 'identify_pain_1',
        text: 'Have you identified the customer\'s business pain?',
        type: 'single-select',
        options: [
          { label: 'No clear pain', value: 'no', score: 0 },
          { label: 'Some pain identified', value: 'partial', score: 15 },
          { label: 'Clear pain identified', value: 'yes', score: 30 }
        ],
        tooltip: 'Understanding business pain helps create urgency and justification'
      },
      {
        id: 'identify_pain_2',
        text: 'Do stakeholders agree on the pain and consequences?',
        type: 'single-select',
        options: [
          { label: 'No consensus', value: 'no', score: 0 },
          { label: 'Partial consensus', value: 'partial', score: 10 },
          { label: 'Strong consensus', value: 'yes', score: 20 }
        ],
        tooltip: 'Stakeholder alignment on pain creates momentum for change'
      }
    ],
    tips: [
      'Quantify the cost of doing nothing',
      'Connect pain to business outcomes',
      'Understand impact on different stakeholders',
      'Create urgency around solving the problem'
    ],
    redFlags: [
      'Customer is comfortable with status quo',
      'Pain is not quantified or urgent',
      'Stakeholders disagree on problem severity'
    ],
    examples: {
      poor: 'Customer says they "should probably upgrade" with no urgent pain',
      good: 'Clear business problems identified with some quantified impact',
      excellent: 'Urgent, quantified business pain with clear consequences of inaction'
    }
  },
  {
    id: 'champion',
    title: 'Champion',
    description: 'Internal advocate who actively sells for you',
    questions: [
      {
        id: 'champion_1',
        text: 'Do you have a champion within the customer organization?',
        type: 'single-select',
        options: [
          { label: 'No champion', value: 'no', score: 0 },
          { label: 'Potential champion', value: 'partial', score: 15 },
          { label: 'Strong champion', value: 'yes', score: 30 }
        ],
        tooltip: 'A champion advocates for your solution when you\'re not in the room'
      },
      {
        id: 'champion_2',
        text: 'Does your champion have influence and credibility?',
        type: 'single-select',
        options: [
          { label: 'Limited influence', value: 'no', score: 0 },
          { label: 'Some influence', value: 'partial', score: 10 },
          { label: 'High influence', value: 'yes', score: 20 }
        ],
        tooltip: 'Champion influence and credibility directly impact their effectiveness'
      }
    ],
    tips: [
      'Identify potential champions early',
      'Understand their personal motivations',
      'Provide them with tools to sell internally',
      'Build trust through value delivery'
    ],
    redFlags: [
      'No one is actively promoting your solution',
      'Potential champions lack influence',
      'Champion leaves or changes roles'
    ],
    examples: {
      poor: 'Friendly contacts but no one actively advocating for your solution',
      good: 'Enthusiastic supporter who speaks positively about your solution',
      excellent: 'Influential champion who actively sells your solution to other stakeholders'
    }
  },
  {
    id: 'competition',
    title: 'Competition',
    description: 'Understanding competitive landscape and positioning',
    questions: [
      {
        id: 'competition_1',
        text: 'Do you understand the competitive landscape?',
        type: 'single-select',
        options: [
          { label: 'No understanding', value: 'no', score: 0 },
          { label: 'Basic understanding', value: 'partial', score: 15 },
          { label: 'Detailed understanding', value: 'yes', score: 30 }
        ],
        tooltip: 'Understanding competition helps you position your unique value'
      },
      {
        id: 'competition_2',
        text: 'Are you positioned favorably against competition?',
        type: 'single-select',
        options: [
          { label: 'Unfavorable position', value: 'no', score: 0 },
          { label: 'Neutral position', value: 'partial', score: 10 },
          { label: 'Favorable position', value: 'yes', score: 20 }
        ],
        tooltip: 'Favorable positioning based on customer priorities improves win probability'
      }
    ],
    tips: [
      'Identify all competitors (including status quo)',
      'Understand their strengths and weaknesses',
      'Position your unique differentiators',
      'Gather competitive intelligence through champion'
    ],
    redFlags: [
      'Competitor has strong relationships',
      'Competitor\'s solution better fits criteria',
      'Price competition without differentiation'
    ],
    examples: {
      poor: 'Unaware of competitors, customer evaluating multiple vendors',
      good: 'Competitors identified, some differentiation established',
      excellent: 'Clear competitive advantage with strong positioning against alternatives'
    }
  }
];

export function UnifiedMEDDPICCModule({
  meddpicc,
  onChange,
  opportunityValue,
  companyName,
  readonly = false,
  source = 'standalone'
}: UnifiedMEDDPICCModuleProps) {
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useKV<Record<string, string>>('meddpicc-answers', {});
  const [notes, setNotes] = useKV<Record<string, string>>('meddpicc-notes', {});
  const [activeTab, setActiveTab] = useState('assessment');

  // Calculate total score
  const totalScore = Object.values(meddpicc).reduce((sum, score) => sum + (score || 0), 0);
  const maxScore = 400; // 8 pillars * 50 max score each
  const scorePercentage = (totalScore / maxScore) * 100;

  // Score thresholds
  const getScoreLevel = (score: number) => {
    if (score >= 320) return { level: 'Strong', color: 'green', description: 'Well qualified opportunity' };
    if (score >= 240) return { level: 'Moderate', color: 'yellow', description: 'Some qualification gaps' };
    return { level: 'Weak', color: 'red', description: 'Significant qualification needed' };
  };

  const scoreLevel = getScoreLevel(totalScore);

  const togglePillar = (pillarId: string) => {
    const newExpanded = new Set(expandedPillars);
    if (newExpanded.has(pillarId)) {
      newExpanded.delete(pillarId);
    } else {
      newExpanded.add(pillarId);
    }
    setExpandedPillars(newExpanded);
  };

  const handleAnswerChange = (questionId: string, answerValue: string, score: number, pillarId: keyof MEDDPICC) => {
    if (readonly) return;

    // Update answers
    const newAnswers = { ...answers, [questionId]: answerValue };
    setAnswers(newAnswers);

    // Calculate pillar score based on all answers for this pillar
    const pillar = MEDDPICC_PILLARS.find(p => p.id === pillarId);
    if (pillar) {
      let pillarScore = 0;
      pillar.questions.forEach(question => {
        const answer = newAnswers[question.id];
        if (answer) {
          const option = question.options.find(opt => opt.value === answer);
          if (option) {
            pillarScore += option.score;
          }
        }
      });

      // Update MEDDPICC scores
      const newMeddpicc = { ...meddpicc, [pillarId]: pillarScore };
      onChange(newMeddpicc);
    }
  };

  const handleNotesChange = (pillarId: string, noteText: string) => {
    if (readonly) return;
    const newNotes = { ...notes, [pillarId]: noteText };
    setNotes(newNotes);
  };

  const generateCoachingPrompts = () => {
    const prompts: string[] = [];
    
    MEDDPICC_PILLARS.forEach(pillar => {
      const score = meddpicc[pillar.id] || 0;
      const maxPillarScore = 50; // Assuming max 50 per pillar
      
      if (score < maxPillarScore * 0.6) { // Less than 60% of max score
        switch (pillar.id) {
          case 'metrics':
            prompts.push('📊 Schedule a workshop to quantify business impact and ROI metrics');
            break;
          case 'economicBuyer':
            prompts.push('🎯 Request introduction to economic buyer through your champion');
            break;
          case 'decisionCriteria':
            prompts.push('📋 Conduct discovery session to understand decision criteria');
            break;
          case 'decisionProcess':
            prompts.push('🗺️ Map out the complete decision-making process and timeline');
            break;
          case 'paperProcess':
            prompts.push('📄 Engage with procurement early to understand approval process');
            break;
          case 'identifyPain':
            prompts.push('🔍 Conduct pain discovery workshop to quantify business impact');
            break;
          case 'champion':
            prompts.push('🤝 Identify and develop champions within the organization');
            break;
          case 'competition':
            prompts.push('⚔️ Conduct competitive analysis and positioning strategy');
            break;
        }
      }
    });

    return prompts;
  };

  const renderPillarAssessment = (pillar: MEDDPICCPillar) => {
    const pillarScore = meddpicc[pillar.id] || 0;
    const maxPillarScore = 50;
    const pillarPercentage = (pillarScore / maxPillarScore) * 100;

    return (
      <Card key={pillar.id} className="mb-4">
        <Collapsible
          open={expandedPillars.has(pillar.id)}
          onOpenChange={() => togglePillar(pillar.id)}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedPillars.has(pillar.id) ? 
                    <ChevronDown className="h-5 w-5" /> : 
                    <ChevronRight className="h-5 w-5" />
                  }
                  <div>
                    <CardTitle className="text-lg">{pillar.title}</CardTitle>
                    <CardDescription>{pillar.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {pillarScore}/{maxPillarScore}
                    </div>
                    <Progress value={pillarPercentage} className="w-20" />
                  </div>
                  <Badge 
                    variant={pillarPercentage >= 80 ? 'default' : pillarPercentage >= 60 ? 'secondary' : 'destructive'}
                  >
                    {pillarPercentage >= 80 ? 'Strong' : pillarPercentage >= 60 ? 'Moderate' : 'Weak'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Questions */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Assessment Questions
                </h4>
                {pillar.questions.map((question) => (
                  <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                    <Label className="text-sm font-medium">{question.text}</Label>
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => {
                        const option = question.options.find(opt => opt.value === value);
                        if (option) {
                          handleAnswerChange(question.id, value, option.score, pillar.id);
                        }
                      }}
                      disabled={readonly}
                    >
                      {question.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                          <Label htmlFor={`${question.id}-${option.value}`} className="text-sm">
                            {option.label} ({option.score} pts)
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {question.tooltip && (
                      <p className="text-xs text-muted-foreground italic">
                        💡 {question.tooltip}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor={`notes-${pillar.id}`}>Notes and Action Items</Label>
                <Textarea
                  id={`notes-${pillar.id}`}
                  value={notes[pillar.id] || ''}
                  onChange={(e) => handleNotesChange(pillar.id, e.target.value)}
                  placeholder={`Add notes and action items for ${pillar.title}...`}
                  rows={3}
                  disabled={readonly}
                />
              </div>

              {/* Tips and Examples */}
              <Tabs defaultValue="tips" className="w-full">
                <TabsList>
                  <TabsTrigger value="tips">Tips</TabsTrigger>
                  <TabsTrigger value="flags">Red Flags</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                </TabsList>

                <TabsContent value="tips" className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {pillar.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="flags" className="space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                    {pillar.redFlags.map((flag, index) => (
                      <li key={index}>{flag}</li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="examples" className="space-y-3">
                  <div className="grid gap-3">
                    <div className="p-3 border border-red-200 rounded bg-red-50">
                      <div className="font-semibold text-red-800 mb-1">Poor Example</div>
                      <div className="text-sm text-red-700">{pillar.examples.poor}</div>
                    </div>
                    <div className="p-3 border border-yellow-200 rounded bg-yellow-50">
                      <div className="font-semibold text-yellow-800 mb-1">Good Example</div>
                      <div className="text-sm text-yellow-700">{pillar.examples.good}</div>
                    </div>
                    <div className="p-3 border border-green-200 rounded bg-green-50">
                      <div className="font-semibold text-green-800 mb-1">Excellent Example</div>
                      <div className="text-sm text-green-700">{pillar.examples.excellent}</div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Score Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                MEDDPICC Qualification
                {source !== 'standalone' && (
                  <Badge variant="outline">{source === 'pipeline' ? 'Pipeline' : 'Opportunities'}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {companyName && `${companyName} • `}
                {opportunityValue && `$${opportunityValue.toLocaleString()} • `}
                Comprehensive sales qualification assessment
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {totalScore}/{maxScore}
              </div>
              <Progress value={scorePercentage} className="w-32 mt-1" />
              <Badge 
                variant={scoreLevel.color === 'green' ? 'default' : scoreLevel.color === 'yellow' ? 'secondary' : 'destructive'}
                className="mt-2"
              >
                {scoreLevel.level}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Alert className={cn(
            "mb-4",
            scoreLevel.color === 'green' && "border-green-500 bg-green-50",
            scoreLevel.color === 'yellow' && "border-yellow-500 bg-yellow-50",
            scoreLevel.color === 'red' && "border-red-500 bg-red-50"
          )}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{scoreLevel.level} Qualification:</strong> {scoreLevel.description}
            </AlertDescription>
          </Alert>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MEDDPICC_PILLARS.map(pillar => {
              const score = meddpicc[pillar.id] || 0;
              const percentage = (score / 50) * 100;
              return (
                <div key={pillar.id} className="text-center p-3 border rounded">
                  <div className="text-lg font-semibold">{score}/50</div>
                  <div className="text-xs text-muted-foreground">{pillar.title}</div>
                  <Progress value={percentage} className="w-full mt-1 h-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Qualification Assessment</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedPillars(new Set(MEDDPICC_PILLARS.map(p => p.id)))}
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedPillars(new Set())}
              >
                Collapse All
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {MEDDPICC_PILLARS.map(renderPillarAssessment)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="coaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Coaching Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generateCoachingPrompts().length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Suggested Next Actions:</h4>
                    <ul className="space-y-2">
                      {generateCoachingPrompts().map((prompt, index) => (
                        <li key={index} className="flex items-start gap-2 p-3 border rounded bg-blue-50">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">{prompt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h4 className="text-lg font-semibold text-green-700">Excellent Qualification!</h4>
                    <p className="text-sm text-muted-foreground">
                      This opportunity is well qualified across all MEDDPICC criteria.
                    </p>
                  </div>
                )}

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Strengths
                    </h4>
                    <div className="space-y-2">
                      {MEDDPICC_PILLARS
                        .filter(pillar => (meddpicc[pillar.id] || 0) >= 30)
                        .map(pillar => (
                          <div key={pillar.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>{pillar.title}</span>
                            <Badge variant="secondary" className="ml-auto">
                              {meddpicc[pillar.id]}/50
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Areas for Focus
                    </h4>
                    <div className="space-y-2">
                      {MEDDPICC_PILLARS
                        .filter(pillar => (meddpicc[pillar.id] || 0) < 30)
                        .map(pillar => (
                          <div key={pillar.id} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span>{pillar.title}</span>
                            <Badge variant="destructive" className="ml-auto">
                              {meddpicc[pillar.id] || 0}/50
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Qualification Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 border rounded-lg">
                  <div className="text-4xl font-bold mb-2">{totalScore}/{maxScore}</div>
                  <div className="text-lg text-muted-foreground mb-4">Overall MEDDPICC Score</div>
                  <Progress value={scorePercentage} className="w-full max-w-md mx-auto mb-4" />
                  <Badge 
                    size="lg"
                    variant={scoreLevel.color === 'green' ? 'default' : scoreLevel.color === 'yellow' ? 'secondary' : 'destructive'}
                  >
                    {scoreLevel.level} Qualification
                  </Badge>
                </div>

                {/* Pillar Breakdown */}
                <div className="grid gap-3">
                  <h4 className="font-semibold">Pillar Breakdown</h4>
                  {MEDDPICC_PILLARS.map(pillar => {
                    const score = meddpicc[pillar.id] || 0;
                    const percentage = (score / 50) * 100;
                    return (
                      <div key={pillar.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{pillar.title}</div>
                          <div className="text-sm text-muted-foreground">{pillar.description}</div>
                          <Progress value={percentage} className="w-full mt-2" />
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-semibold">{score}/50</div>
                          <Badge 
                            variant={percentage >= 80 ? 'default' : percentage >= 60 ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {percentage >= 80 ? 'Strong' : percentage >= 60 ? 'Fair' : 'Weak'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Export Options */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    Share Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}