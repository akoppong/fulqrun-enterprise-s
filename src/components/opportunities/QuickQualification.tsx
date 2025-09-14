import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useKV } from '@github/spark/hooks';
import { 
  CheckCircle, 
  Target, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Star,
  Lightbulb,
  Save,
  RefreshCw,
  Award
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  MEDDPICCAssessment, 
  MEDDPICCAnswer,
  MEDDPICCScoringService
} from '../../services/meddpicc-scoring-service';

interface QuickQualificationProps {
  opportunityId: string;
  opportunityName?: string;
  onSave?: (assessment: MEDDPICCAssessment) => void;
  onCancel?: () => void;
}

interface QuickQuestion {
  id: string;
  pillar: string;
  text: string;
  options: { label: string; value: string; score: number }[];
  weight: number;
}

const quickQualificationQuestions: QuickQuestion[] = [
  // High-impact questions for rapid assessment
  {
    id: 'metrics_quantified',
    pillar: 'metrics',
    text: 'Have you quantified the business impact/ROI with the customer?',
    options: [
      { label: 'No quantification yet', value: 'none', score: 0 },
      { label: 'Basic estimates only', value: 'basic', score: 15 },
      { label: 'Detailed ROI/business case', value: 'detailed', score: 35 }
    ],
    weight: 1.3
  },
  {
    id: 'economic_buyer_access',
    pillar: 'economic_buyer',
    text: 'Do you have access to the economic buyer (budget holder)?',
    options: [
      { label: 'No access or unknown', value: 'no_access', score: 0 },
      { label: 'Identified but not engaged', value: 'identified', score: 10 },
      { label: 'Direct access and engaged', value: 'engaged', score: 40 }
    ],
    weight: 1.4
  },
  {
    id: 'champion_strength',
    pillar: 'champion',
    text: 'How strong is your internal champion?',
    options: [
      { label: 'No champion identified', value: 'none', score: 0 },
      { label: 'Supportive contact', value: 'supportive', score: 20 },
      { label: 'Active champion selling internally', value: 'active', score: 40 }
    ],
    weight: 1.2
  },
  {
    id: 'pain_urgency',
    pillar: 'implicate_the_pain',
    text: 'How urgent is solving this problem for the customer?',
    options: [
      { label: 'Nice to have', value: 'low', score: 5 },
      { label: 'Important but not urgent', value: 'medium', score: 20 },
      { label: 'Critical/compelling event', value: 'urgent', score: 40 }
    ],
    weight: 1.3
  },
  {
    id: 'decision_timeline',
    pillar: 'decision_process',
    text: 'How clear is the decision-making process and timeline?',
    options: [
      { label: 'Unclear or no process', value: 'unclear', score: 0 },
      { label: 'General understanding', value: 'general', score: 15 },
      { label: 'Detailed process mapped', value: 'detailed', score: 35 }
    ],
    weight: 1.1
  },
  {
    id: 'competitive_position',
    pillar: 'competition',
    text: 'What is your competitive position?',
    options: [
      { label: 'Unknown or weak position', value: 'weak', score: 5 },
      { label: 'Competitive but uncertain', value: 'competitive', score: 20 },
      { label: 'Clear advantage/preferred', value: 'preferred', score: 35 }
    ],
    weight: 1.0
  },
  {
    id: 'decision_criteria',
    pillar: 'decision_criteria',
    text: 'How well do you understand their evaluation criteria?',
    options: [
      { label: 'No formal criteria known', value: 'unknown', score: 0 },
      { label: 'Basic understanding', value: 'basic', score: 15 },
      { label: 'Detailed criteria aligned', value: 'aligned', score: 35 }
    ],
    weight: 1.1
  },
  {
    id: 'procurement_risk',
    pillar: 'paper_process',
    text: 'Any known procurement/legal obstacles?',
    options: [
      { label: 'Unknown or major obstacles', value: 'high_risk', score: 5 },
      { label: 'Some challenges identified', value: 'medium_risk', score: 20 },
      { label: 'Clear path to purchase', value: 'low_risk', score: 35 }
    ],
    weight: 0.9
  }
];

export function QuickQualification({ 
  opportunityId, 
  opportunityName = 'Current Opportunity',
  onSave,
  onCancel 
}: QuickQualificationProps) {
  const [assessment, setAssessment] = useKV<MEDDPICCAssessment>(`quick-qualification-${opportunityId}`, {
    id: Date.now().toString(),
    opportunity_id: opportunityId,
    answers: [],
    pillar_scores: {},
    total_score: 0,
    confidence_score: 0,
    risk_level: 'medium' as const,
    stage_readiness: {},
    coaching_actions: [],
    competitive_strengths: [],
    areas_of_concern: [],
    last_updated: new Date(),
    created_by: 'current-user',
    version: 1
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<Record<string, 'low' | 'medium' | 'high'>>({});
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Load existing answers if any
    const existingAnswers: Record<string, string> = {};
    const existingNotes: Record<string, string> = {};
    const existingConfidence: Record<string, 'low' | 'medium' | 'high'> = {};

    assessment.answers.forEach(answer => {
      const questionId = quickQualificationQuestions.find(q => 
        q.pillar === answer.pillar && 
        q.text.toLowerCase().includes(answer.question_id.toLowerCase())
      )?.id;
      
      if (questionId) {
        existingAnswers[questionId] = answer.answer_value;
        existingNotes[questionId] = answer.evidence_notes || '';
        existingConfidence[questionId] = answer.confidence_level;
      }
    });

    setAnswers(existingAnswers);
    setNotes(existingNotes);
    setConfidence(existingConfidence);
  }, [assessment]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNotesChange = (questionId: string, value: string) => {
    setNotes(prev => ({ ...prev, [questionId]: value }));
  };

  const handleConfidenceChange = (questionId: string, value: 'low' | 'medium' | 'high') => {
    setConfidence(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateQuickScore = () => {
    let totalScore = 0;
    let totalWeight = 0;
    const pillarScores: Record<string, number> = {};

    quickQualificationQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(o => o.value === answer);
        if (option) {
          const weightedScore = option.score * question.weight;
          totalScore += weightedScore;
          totalWeight += question.weight;

          // Accumulate pillar scores
          pillarScores[question.pillar] = (pillarScores[question.pillar] || 0) + weightedScore;
        }
      }
    });

    return { totalScore: Math.round(totalScore), pillarScores };
  };

  const getScoreLevel = (score: number): { level: string; color: string; description: string } => {
    if (score >= 240) {
      return { 
        level: 'Excellent', 
        color: 'text-green-600', 
        description: 'Well-qualified opportunity with high success probability' 
      };
    } else if (score >= 180) {
      return { 
        level: 'Good', 
        color: 'text-blue-600', 
        description: 'Solid qualification with minor gaps to address' 
      };
    } else if (score >= 120) {
      return { 
        level: 'Fair', 
        color: 'text-yellow-600', 
        description: 'Moderate qualification needing focused improvement' 
      };
    } else {
      return { 
        level: 'Poor', 
        color: 'text-red-600', 
        description: 'Weak qualification requiring significant development' 
      };
    }
  };

  const getTopPriorities = () => {
    const { pillarScores } = calculateQuickScore();
    const priorities: { pillar: string; action: string; urgency: 'high' | 'medium' | 'low' }[] = [];

    Object.entries(pillarScores).forEach(([pillar, score]) => {
      if (score < 20) {
        switch (pillar) {
          case 'metrics':
            priorities.push({
              pillar: 'Metrics',
              action: 'Develop quantified business case with ROI analysis',
              urgency: 'high'
            });
            break;
          case 'economic_buyer':
            priorities.push({
              pillar: 'Economic Buyer',
              action: 'Secure access to budget decision maker',
              urgency: 'high'
            });
            break;
          case 'champion':
            priorities.push({
              pillar: 'Champion',
              action: 'Identify and develop internal advocate',
              urgency: 'medium'
            });
            break;
          case 'implicate_the_pain':
            priorities.push({
              pillar: 'Pain/Urgency',
              action: 'Establish compelling event and urgency',
              urgency: 'high'
            });
            break;
          case 'decision_process':
            priorities.push({
              pillar: 'Decision Process',
              action: 'Map decision-making process and stakeholders',
              urgency: 'medium'
            });
            break;
          case 'competition':
            priorities.push({
              pillar: 'Competition',
              action: 'Analyze competitive landscape and differentiate',
              urgency: 'low'
            });
            break;
          default:
            priorities.push({
              pillar: pillar.charAt(0).toUpperCase() + pillar.slice(1),
              action: `Strengthen ${pillar} qualification`,
              urgency: 'medium'
            });
        }
      }
    });

    return priorities.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    }).slice(0, 3);
  };

  const saveAssessment = () => {
    const { totalScore, pillarScores } = calculateQuickScore();
    const answersArray: MEDDPICCAnswer[] = [];

    quickQualificationQuestions.forEach(question => {
      const answerValue = answers[question.id];
      if (answerValue) {
        const option = question.options.find(o => o.value === answerValue);
        if (option) {
          answersArray.push({
            pillar: question.pillar,
            question_id: question.id,
            answer_value: answerValue,
            score: option.score * question.weight,
            timestamp: new Date(),
            confidence_level: confidence[question.id] || 'medium',
            evidence_notes: notes[question.id] || ''
          });
        }
      }
    });

    const updatedAssessment = MEDDPICCScoringService.calculateAdvancedScoring({
      ...assessment,
      answers: answersArray,
      pillar_scores: pillarScores,
      total_score: totalScore
    });

    setAssessment(updatedAssessment);
    
    if (onSave) {
      onSave(updatedAssessment);
    }

    toast.success('Quick qualification saved successfully');
    setIsComplete(true);
  };

  const completionPercentage = (Object.keys(answers).length / quickQualificationQuestions.length) * 100;
  const { totalScore, pillarScores } = calculateQuickScore();
  const scoreLevel = getScoreLevel(totalScore);
  const topPriorities = getTopPriorities();

  const currentQuestion = quickQualificationQuestions[currentQuestionIndex];

  if (isComplete) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3">
            <CheckCircle size={32} className="text-green-600" />
            Quick Qualification Complete
          </CardTitle>
          <p className="text-muted-foreground">{opportunityName}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Summary */}
          <div className="text-center space-y-4">
            <div>
              <div className="text-6xl font-bold mb-2">
                <span className={scoreLevel.color}>{totalScore}</span>
                <span className="text-2xl text-muted-foreground">/320</span>
              </div>
              <Badge className={cn(
                "text-lg px-4 py-2",
                scoreLevel.level === 'Excellent' && "bg-green-100 text-green-800",
                scoreLevel.level === 'Good' && "bg-blue-100 text-blue-800",
                scoreLevel.level === 'Fair' && "bg-yellow-100 text-yellow-800",
                scoreLevel.level === 'Poor' && "bg-red-100 text-red-800"
              )}>
                {scoreLevel.level} Qualification
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">{scoreLevel.description}</p>
            </div>
            <Progress value={(totalScore / 320) * 100} className="h-3" />
          </div>

          <Separator />

          {/* Top Priorities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-500" />
              Top Priorities
            </h3>
            {topPriorities.length > 0 ? (
              <div className="space-y-3">
                {topPriorities.map((priority, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge 
                      variant={priority.urgency === 'high' ? 'destructive' : priority.urgency === 'medium' ? 'default' : 'secondary'}
                      className="mt-0.5"
                    >
                      {priority.urgency}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{priority.pillar}</p>
                      <p className="text-sm text-muted-foreground">{priority.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Award size={32} className="mx-auto text-green-600 mb-2" />
                <p className="font-medium text-green-600">Excellent qualification!</p>
                <p className="text-sm text-muted-foreground">No critical gaps identified</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button onClick={() => setIsComplete(false)} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              Review Answers
            </Button>
            <Button onClick={onCancel} variant="outline">
              Return to Opportunity
            </Button>
            <Button>
              <Target size={16} className="mr-2" />
              Complete Full Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Target size={24} className="text-primary" />
              Quick Qualification Assessment
            </CardTitle>
            <p className="text-muted-foreground mt-1">{opportunityName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quickQualificationQuestions.length}
            </p>
            <Progress value={((currentQuestionIndex + 1) / quickQualificationQuestions.length) * 100} className="w-24 h-2" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Completion</p>
            <p className="text-lg font-semibold">{Math.round(completionPercentage)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Score</p>
            <p className="text-lg font-semibold">{totalScore}/320</p>
          </div>
        </div>

        {/* Current Question */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">{currentQuestion.text}</h3>
            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>{option.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(option.score * currentQuestion.weight)} pts
                      </Badge>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Confidence and Notes */}
          {answers[currentQuestion.id] && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="confidence">Confidence Level</Label>
                  <Select 
                    value={confidence[currentQuestion.id] || 'medium'} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => handleConfidenceChange(currentQuestion.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Confidence</SelectItem>
                      <SelectItem value="medium">Medium Confidence</SelectItem>
                      <SelectItem value="high">High Confidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pillar-info">Pillar</Label>
                  <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                    <Badge variant="outline">
                      {currentQuestion.pillar.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes & Evidence (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any supporting details or evidence..."
                  value={notes[currentQuestion.id] || ''}
                  onChange={(e) => handleNotesChange(currentQuestion.id, e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {quickQualificationQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  "w-8 h-8 rounded-full text-xs font-medium transition-colors",
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[quickQualificationQuestions[index].id]
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === quickQualificationQuestions.length - 1 ? (
            <Button
              onClick={saveAssessment}
              disabled={Object.keys(answers).length < quickQualificationQuestions.length * 0.6} // At least 60% complete
              className="bg-green-600 hover:bg-green-700"
            >
              <Save size={16} className="mr-2" />
              Complete Assessment
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(Math.min(quickQualificationQuestions.length - 1, currentQuestionIndex + 1))}
            >
              Next
            </Button>
          )}
        </div>

        {/* Cancel Button */}
        <div className="text-center pt-4 border-t">
          <Button variant="ghost" onClick={onCancel}>
            Cancel Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}