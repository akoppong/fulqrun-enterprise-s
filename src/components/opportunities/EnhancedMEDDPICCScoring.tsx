import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Target, TrendingUp, AlertTriangle, CheckCircle2, Brain } from '@phosphor-icons/react';
import { MEDDPICC } from '@/lib/types';
import { ensureMEDDPICCComplete, toMEDDPICCScore } from '@/lib/meddpicc-defaults';
import { toast } from 'sonner';

interface EnhancedMEDDPICCScoringProps {
  meddpicc: MEDDPICC;
  onChange: (meddpicc: MEDDPICC) => void;
  opportunityValue?: number;
  companyName?: string;
  readonly?: boolean;
}

interface CriterionData {
  key: keyof MEDDPICC;
  label: string;
  description: string;
  questions: string[];
  tips: string[];
  redFlags: string[];
  greenFlags: string[];
  examples: {
    poor: string;
    good: string;
    excellent: string;
  };
}

const MEDDPICC_CRITERIA: CriterionData[] = [
  {
    key: 'metrics',
    label: 'Metrics',
    description: 'Quantifiable business impact and success criteria',
    questions: [
      'What specific metrics will improve with this solution?',
      'How will success be measured?',
      'What is the current baseline?',
      'What is the target improvement?'
    ],
    tips: [
      'Focus on quantifiable business outcomes',
      'Understand how metrics tie to business goals',
      'Get specific numbers, not generalities'
    ],
    redFlags: [
      'No specific metrics identified',
      'Vague benefits like "efficiency gains"',
      'Customer can\'t quantify current state'
    ],
    greenFlags: [
      'Specific ROI calculations available',
      'Clear before/after scenarios',
      'Metrics tied to business strategy'
    ],
    examples: {
      poor: 'Customer wants to "improve efficiency"',
      good: 'Customer needs to reduce processing time by 30%',
      excellent: 'Customer must achieve 25% cost reduction ($2M annually) to meet board mandate'
    }
  },
  {
    key: 'economicBuyer',
    label: 'Economic Buyer',
    description: 'Person with budget authority who can approve the purchase',
    questions: [
      'Who has the budget for this project?',
      'Who can say "yes" to the full investment?',
      'What is their approval process?',
      'Have we met or presented to them?'
    ],
    tips: [
      'Economic buyer may not be the end user',
      'Understand their priorities and concerns',
      'Ensure they understand the value proposition'
    ],
    redFlags: [
      'Economic buyer not identified',
      'No access to economic buyer',
      'Budget ownership unclear'
    ],
    greenFlags: [
      'Direct access to economic buyer',
      'Economic buyer actively engaged',
      'Budget confirmed and allocated'
    ],
    examples: {
      poor: 'IT manager says they have budget',
      good: 'CFO has allocated budget for this initiative',
      excellent: 'CEO personally championing the project with dedicated budget'
    }
  },
  {
    key: 'decisionCriteria',
    label: 'Decision Criteria',
    description: 'Specific requirements and evaluation factors for vendor selection',
    questions: [
      'What criteria will be used to evaluate solutions?',
      'How will vendors be compared?',
      'What are the must-have vs. nice-to-have features?',
      'Who defines the criteria?'
    ],
    tips: [
      'Influence criteria definition where possible',
      'Understand weighted importance of criteria',
      'Map your strengths to their criteria'
    ],
    redFlags: [
      'Criteria not defined or unclear',
      'Criteria heavily favor competitors',
      'No input into criteria definition'
    ],
    greenFlags: [
      'Criteria align with your strengths',
      'You helped define the criteria',
      'Clear scoring methodology exists'
    ],
    examples: {
      poor: 'Customer will "know it when they see it"',
      good: 'Customer has defined technical and business requirements',
      excellent: 'Detailed RFP criteria that favor your solution capabilities'
    }
  },
  {
    key: 'decisionProcess',
    label: 'Decision Process',
    description: 'How the organization will make the buying decision',
    questions: [
      'What steps are involved in the decision process?',
      'Who is involved at each stage?',
      'What are the timeline and milestones?',
      'What could cause delays or changes?'
    ],
    tips: [
      'Map out the complete process',
      'Identify potential bottlenecks',
      'Understand approval workflows'
    ],
    redFlags: [
      'Process is undefined or unclear',
      'Decision makers keep changing',
      'Timeline is unrealistic'
    ],
    greenFlags: [
      'Clear, documented process',
      'Realistic timeline with milestones',
      'You have visibility into each step'
    ],
    examples: {
      poor: 'Customer will decide when they\'re ready',
      good: 'Customer has outlined evaluation phases and timeline',
      excellent: 'Detailed project plan with defined roles and approval gates'
    }
  },
  {
    key: 'paperProcess',
    label: 'Paper Process',
    description: 'Legal, procurement, and contracting requirements',
    questions: [
      'What is the procurement process?',
      'Who handles legal and contracting?',
      'Are there standard terms and conditions?',
      'What documentation is required?'
    ],
    tips: [
      'Understand procurement workflows',
      'Identify potential legal hurdles early',
      'Know their standard terms'
    ],
    redFlags: [
      'Procurement process unknown',
      'Legal requirements unclear',
      'No understanding of terms'
    ],
    greenFlags: [
      'Clear procurement workflow',
      'Legal requirements understood',
      'Terms and conditions reviewed'
    ],
    examples: {
      poor: 'Customer will handle paperwork when ready',
      good: 'Customer has outlined procurement steps and requirements',
      excellent: 'Master agreement in place with clear SOW process'
    }
  },
  {
    key: 'identifyPain',
    label: 'Identify Pain',
    description: 'Specific business problems and pain points driving the purchase',
    questions: [
      'What specific problems need to be solved?',
      'What is the impact of doing nothing?',
      'How urgent is the pain?',
      'Who is most affected by the pain?'
    ],
    tips: [
      'Quantify the cost of the pain',
      'Understand urgency and timeline',
      'Connect pain to business impact'
    ],
    redFlags: [
      'Pain is not clearly defined',
      'No urgency to solve',
      'Cost of inaction unclear'
    ],
    greenFlags: [
      'Specific, quantified pain points',
      'Urgency to solve identified',
      'Clear cost of inaction'
    ],
    examples: {
      poor: 'Customer thinks current system could be better',
      good: 'Customer has specific operational challenges to address',
      excellent: 'Business-critical pain with quantified impact and deadline'
    }
  },
  {
    key: 'champion',
    label: 'Champion',
    description: 'Internal advocate who will sell on your behalf',
    questions: [
      'Who is advocating for your solution?',
      'What is their influence and credibility?',
      'Are they willing to introduce you to others?',
      'Do they understand your value proposition?'
    ],
    tips: [
      'Develop multiple champions',
      'Ensure they can articulate your value',
      'Provide them with tools to sell internally'
    ],
    redFlags: [
      'No clear champion identified',
      'Champion has limited influence',
      'Champion is not engaged'
    ],
    greenFlags: [
      'Strong, influential champion',
      'Champion actively selling internally',
      'Multiple champions across organization'
    ],
    examples: {
      poor: 'End user likes your solution',
      good: 'Department head is advocating for your solution',
      excellent: 'Senior executive personally driving the initiative'
    }
  },
  {
    key: 'competition',
    label: 'Competition',
    description: 'Competitive landscape and positioning',
    questions: [
      'Who else is being considered?',
      'What are their strengths and weaknesses?',
      'Why might the customer choose them?',
      'What is your competitive advantage?'
    ],
    tips: [
      'Understand the complete competitive set',
      'Know competitors\' likely strategies',
      'Position your unique value clearly'
    ],
    redFlags: [
      'Competitive landscape unknown',
      'Competitors have advantages',
      'Customer prefers competitor'
    ],
    greenFlags: [
      'Clear competitive positioning',
      'Unique advantages identified',
      'Competitor weaknesses known'
    ],
    examples: {
      poor: 'Customer is only looking at your solution',
      good: 'Customer is evaluating 3 vendors with clear differentiation',
      excellent: 'You have clear competitive advantages that matter to the customer'
    }
  }
];

export function EnhancedMEDDPICCScoring({
  meddpicc,
  onChange,
  opportunityValue,
  companyName,
  readonly = false
}: EnhancedMEDDPICCScoringProps) {
  const [activeTab, setActiveTab] = useState<keyof MEDDPICC>('metrics');
  
  // Ensure we always have a complete MEDDPICC object
  const [scores, setScores] = useState<MEDDPICC>(() => ensureMEDDPICCComplete(meddpicc || {}));
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const normalizedMeddpicc = ensureMEDDPICCComplete(meddpicc || {});
    
    // Only update if the scores have actually changed
    const hasChanged = Object.keys(normalizedMeddpicc).some(key => {
      const currentValue = toMEDDPICCScore(scores[key as keyof MEDDPICC]);
      const newValue = toMEDDPICCScore(normalizedMeddpicc[key as keyof MEDDPICC]);
      return currentValue !== newValue;
    });
    
    if (hasChanged) {
      setScores(normalizedMeddpicc);
    }
    
    generateInsights();
  }, [meddpicc]);

  const generateInsights = useCallback(() => {
    const newInsights: string[] = [];
    
    // Get score values safely
    const scoreKeys = ['metrics', 'economicBuyer', 'decisionCriteria', 'decisionProcess', 'paperProcess', 'identifyPain', 'champion', 'competition'] as const;
    const scoreValues = scoreKeys.map(key => toMEDDPICCScore(scores[key]));
    
    const avgScore = scoreValues.length > 0 ? scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length : 0;
    const weakCriteria = scoreValues.filter(score => score < 6).length;
    const strongCriteria = scoreValues.filter(score => score >= 8).length;

    if (avgScore < 5) {
      newInsights.push('🔴 Overall qualification is weak. Focus on strengthening multiple areas.');
    } else if (avgScore >= 7) {
      newInsights.push('🟢 Strong qualification foundation. Focus on maintaining momentum.');
    } else {
      newInsights.push('🟡 Moderate qualification. Identify key areas for improvement.');
    }

    if (weakCriteria > 3) {
      newInsights.push('⚠️ Multiple weak areas detected. Consider deal risk assessment.');
    }

    if (toMEDDPICCScore(scores.economicBuyer) < 5) {
      newInsights.push('💰 Limited Economic Buyer access is a critical risk factor.');
    }

    if (toMEDDPICCScore(scores.champion) < 6) {
      newInsights.push('🤝 Weak champion strength may slow deal progression.');
    }

    if (toMEDDPICCScore(scores.metrics) < 6) {
      newInsights.push('📊 Unclear business metrics reduce deal predictability.');
    }

    if (strongCriteria >= 6) {
      newInsights.push('⭐ Excellent qualification in most areas. High-confidence opportunity.');
    }

    setInsights(newInsights);
  }, [scores, opportunityValue]);

  const handleScoreChange = useCallback((criterion: keyof MEDDPICC, value: number) => {
    const safeValue = toMEDDPICCScore(value);
    
    // Only update if the value actually changed
    if (toMEDDPICCScore(scores[criterion]) === safeValue) {
      return;
    }
    
    const updatedScores = { ...scores, [criterion]: safeValue };
    
    // Ensure the updated scores are complete and valid
    const normalizedScores = ensureMEDDPICCComplete(updatedScores);
    setScores(normalizedScores);
    
    // Update the parent with the normalized scores
    if (onChange) {
      onChange(normalizedScores);
    }
  }, [scores, onChange]);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    if (score >= 4) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const overallScore = toMEDDPICCScore(scores.score);
  const scoreKeys = ['metrics', 'economicBuyer', 'decisionCriteria', 'decisionProcess', 'paperProcess', 'identifyPain', 'champion', 'competition'] as const;
  const completionRate = scoreKeys.filter(key => toMEDDPICCScore(scores[key]) > 0).length / scoreKeys.length * 100;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            MEDDPICC Qualification Scoring
            {companyName && (
              <Badge variant="outline">{companyName}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Comprehensive sales methodology scoring for deal qualification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(overallScore).split(' ')[0]}>
                  {overallScore.toFixed(1)}
                </span>
                <span className="text-muted-foreground text-lg">/10</span>
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <Progress value={overallScore * 10} className="mt-2" />
              <Badge className={`mt-2 ${getScoreColor(overallScore)}`}>
                {getScoreLabel(overallScore)}
              </Badge>
            </div>

            {/* Completion Rate */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round(completionRate)}
                <span className="text-muted-foreground text-lg">%</span>
              </div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <Progress value={completionRate} className="mt-2" />
              <Badge variant="secondary" className="mt-2">
                {scoreKeys.filter(key => toMEDDPICCScore(scores[key]) > 0).length}/8 Criteria
              </Badge>
            </div>

            {/* Risk Level */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                {overallScore >= 7 ? (
                  <span className="text-green-600">Low</span>
                ) : overallScore >= 5 ? (
                  <span className="text-yellow-600">Medium</span>
                ) : (
                  <span className="text-red-600">High</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <div className="mt-2">
                {overallScore >= 7 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                ) : overallScore >= 5 ? (
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600 mx-auto" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Alert>
          <Brain className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-1">
              {insights.map((insight, index) => (
                <div key={index} className="text-sm">
                  {insight}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Scoring */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof MEDDPICC)}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
          {MEDDPICC_CRITERIA.map((criterion) => (
            <TabsTrigger
              key={criterion.key}
              value={criterion.key}
              className="text-xs"
            >
              <div className="flex flex-col items-center">
                <span className="hidden sm:block">{criterion.label}</span>
                <span className="sm:hidden">{criterion.label.slice(0, 3)}</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getScoreColor(toMEDDPICCScore(scores[criterion.key]))}`}
                >
                  {(toMEDDPICCScore(scores[criterion.key]) || 0).toFixed(1)}
                </Badge>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {MEDDPICC_CRITERIA.map((criterion) => (
          <TabsContent key={criterion.key} value={criterion.key} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{criterion.label}</CardTitle>
                <CardDescription>{criterion.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Score */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Current Score</Label>
                    <Badge className={getScoreColor(toMEDDPICCScore(scores[criterion.key]))}>
                      {(toMEDDPICCScore(scores[criterion.key]) || 0).toFixed(1)}/10 - {getScoreLabel(toMEDDPICCScore(scores[criterion.key]))}
                    </Badge>
                  </div>
                  {!readonly && (
                    <div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={toMEDDPICCScore(scores[criterion.key])}
                        onChange={(e) => handleScoreChange(criterion.key, Number(e.target.value))}
                        className="w-full"
                      />
                      <Progress value={toMEDDPICCScore(scores[criterion.key]) * 10} className="mt-2" />
                    </div>
                  )}
                </div>

                {/* Guidance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Questions */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Key Questions
                    </h4>
                    <ul className="space-y-2">
                      {criterion.questions.map((question, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Best Practices
                    </h4>
                    <ul className="space-y-2">
                      {criterion.tips.map((tip, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Red Flags & Green Flags */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Red Flags
                    </h4>
                    <ul className="space-y-2">
                      {criterion.redFlags.map((flag, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-red-600">⚠</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Green Flags
                    </h4>
                    <ul className="space-y-2">
                      {criterion.greenFlags.map((flag, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-green-600">✓</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Examples */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Examples by Score Range</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                      <div className="font-medium text-red-800 mb-2">Poor (0-3)</div>
                      <div className="text-sm text-red-700">{criterion.examples.poor}</div>
                    </div>
                    <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="font-medium text-yellow-800 mb-2">Good (4-7)</div>
                      <div className="text-sm text-yellow-700">{criterion.examples.good}</div>
                    </div>
                    <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-800 mb-2">Excellent (8-10)</div>
                      <div className="text-sm text-green-700">{criterion.examples.excellent}</div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {!readonly && (
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${criterion.key}`}>Notes & Observations</Label>
                    <Textarea
                      id={`notes-${criterion.key}`}
                      placeholder={`Add specific notes about ${criterion.label.toLowerCase()}...`}
                      value={scores.notes || ''}
                      onChange={(e) => onChange({ ...scores, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}