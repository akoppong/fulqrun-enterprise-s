/**
 * MEDDPICC Assessment Component
 * Guided qualification interface for B2B sales opportunities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  FileText,
  Heart,
  Trophy,
  Eye,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  Save,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { MEDDPICC_CONFIG } from '@/data/meddpicc-config';
import { MEDDPICCService } from '@/services/meddpicc-service';
import { MEDDPICCSession, MEDDPICCAssessment, MEDDPICCPillar } from '@/types/meddpicc';

interface MEDDPICCAssessmentProps {
  opportunityId: string;
  userId: string;
  onAssessmentComplete?: (assessment: MEDDPICCAssessment) => void;
  onSave?: (session: MEDDPICCSession) => void;
}

const PILLAR_ICONS = {
  metrics: Target,
  economic_buyer: Users,
  decision_criteria: Shield,
  decision_process: FileText,
  paper_process: FileText,
  implicate_the_pain: Heart,
  champion: Trophy,
  competition: Eye
};

const LEVEL_COLORS = {
  strong: 'bg-green-500',
  moderate: 'bg-yellow-500',
  weak: 'bg-red-500'
};

const LEVEL_TEXT_COLORS = {
  strong: 'text-green-700',
  moderate: 'text-yellow-700',
  weak: 'text-red-700'
};

export function MEDDPICCAssessment({ 
  opportunityId, 
  userId, 
  onAssessmentComplete,
  onSave 
}: MEDDPICCAssessmentProps) {
  const [session, setSession] = useState<MEDDPICCSession | null>(null);
  const [currentPillar, setCurrentPillar] = useState<string | null>(null);
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<MEDDPICCAssessment | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize or load existing session
  useEffect(() => {
    const initializeSession = async () => {
      setIsLoading(true);
      
      try {
        // Check for existing active session
        let existingSession = MEDDPICCService.getActiveSession(opportunityId, userId);
        
        if (!existingSession) {
          // Check for completed assessment
          const existingAssessment = MEDDPICCService.getLatestAssessment(opportunityId);
          if (existingAssessment) {
            setAssessment(existingAssessment);
            const existingAnswers = MEDDPICCService.getAnswers(opportunityId);
            setAnswers(existingAnswers);
          }
          
          // Create new session
          existingSession = MEDDPICCService.createSession(opportunityId, userId);
        }
        
        setSession(existingSession);
        setAnswers(existingSession.answers);
        setNotes(existingSession.notes || '');
        
        // Expand first incomplete pillar
        const firstIncompletePillar = MEDDPICC_CONFIG.pillars.find(pillar => 
          !pillar.questions.some(q => existingSession!.answers[q.id])
        );
        
        if (firstIncompletePillar) {
          setCurrentPillar(firstIncompletePillar.id);
          setExpandedPillars(new Set([firstIncompletePillar.id]));
        }
        
      } catch (error) {
        console.error('Failed to initialize MEDDPICC session:', error);
        toast.error('Failed to load MEDDPICC assessment');
      } finally {
        setIsLoading(false);
      }
    };

    if (opportunityId && userId) {
      initializeSession();
    }
  }, [opportunityId, userId]);

  // Auto-save answers
  const saveAnswer = useCallback(async (pillar: string, questionId: string, answerValue: string) => {
    if (!session) return;

    try {
      MEDDPICCService.saveAnswer(session.id, pillar, questionId, answerValue, userId);
      
      const newAnswers = { ...answers, [questionId]: answerValue };
      setAnswers(newAnswers);
      
      // Update session
      const updatedSession = { ...session, answers: newAnswers };
      setSession(updatedSession);
      
      // Regenerate assessment
      const newAssessment = MEDDPICCService.generateAssessment(opportunityId, newAnswers);
      setAssessment(newAssessment);
      
      onSave?.(updatedSession);
      
    } catch (error) {
      console.error('Failed to save answer:', error);
      toast.error('Failed to save answer');
    }
  }, [session, answers, opportunityId, userId, onSave]);

  // Save notes
  const saveNotes = useCallback(async () => {
    if (!session) return;

    setIsSaving(true);
    try {
      const updatedSession = { ...session, notes };
      MEDDPICCService.saveSession(updatedSession);
      setSession(updatedSession);
      toast.success('Notes saved');
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  }, [session, notes]);

  // Complete assessment
  const completeAssessment = useCallback(async () => {
    if (!session) return;

    setIsSaving(true);
    try {
      const completedAssessment = MEDDPICCService.completeSession(session.id);
      if (completedAssessment) {
        setAssessment(completedAssessment);
        await MEDDPICCService.updateOpportunityMEDDPICC(opportunityId, completedAssessment);
        onAssessmentComplete?.(completedAssessment);
        toast.success('MEDDPICC assessment completed!');
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      toast.error('Failed to complete assessment');
    } finally {
      setIsSaving(false);
    }
  }, [session, opportunityId, onAssessmentComplete]);

  // Export assessment
  const exportAssessment = useCallback((format: 'json' | 'csv' | 'summary' = 'summary') => {
    const exportData = MEDDPICCService.exportAssessment(opportunityId, format);
    
    const blob = new Blob([exportData], { 
      type: format === 'csv' ? 'text/csv' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meddpicc-assessment-${opportunityId}.${format === 'csv' ? 'csv' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Assessment exported as ${format.toUpperCase()}`);
  }, [opportunityId]);

  // Toggle pillar expansion
  const togglePillar = useCallback((pillarId: string) => {
    setExpandedPillars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pillarId)) {
        newSet.delete(pillarId);
      } else {
        newSet.add(pillarId);
      }
      return newSet;
    });
    setCurrentPillar(pillarId);
  }, []);

  // Reset assessment
  const resetAssessment = useCallback(() => {
    if (session) {
      const resetSession = MEDDPICCService.createSession(opportunityId, userId);
      setSession(resetSession);
      setAnswers({});
      setAssessment(null);
      setNotes('');
      toast.success('Assessment reset');
    }
  }, [session, opportunityId, userId]);

  // Calculate completion percentage
  const completionPercentage = React.useMemo(() => {
    const totalQuestions = MEDDPICC_CONFIG.pillars.reduce((sum, pillar) => sum + pillar.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  }, [answers]);

  // Get pillar score
  const getPillarScore = useCallback((pillarId: string) => {
    return assessment?.pillar_scores.find(ps => ps.pillar === pillarId);
  }, [assessment]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading MEDDPICC assessment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  MEDDPICC Assessment
                </CardTitle>
                <CardDescription>
                  Guided B2B sales qualification for opportunity {opportunityId}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportAssessment('summary')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetAssessment}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion Progress</span>
                  <span>{completionPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              {/* Overall Score */}
              {assessment && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {assessment.total_score}/{assessment.max_total_score}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Score</div>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant="secondary" 
                      className={`${LEVEL_COLORS[assessment.overall_level]} text-white`}
                    >
                      {assessment.overall_level.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Deal Health</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{assessment.completion_percentage.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pillar Assessment */}
        <div className="space-y-4">
          {MEDDPICC_CONFIG.pillars.map((pillar) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              answers={answers}
              score={getPillarScore(pillar.id)}
              isExpanded={expandedPillars.has(pillar.id)}
              onToggle={() => togglePillar(pillar.id)}
              onAnswerChange={(questionId, value) => saveAnswer(pillar.id, questionId, value)}
            />
          ))}
        </div>

        {/* Coaching Prompts */}
        {assessment && assessment.coaching_prompts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Coaching Recommendations
              </CardTitle>
              <CardDescription>
                Areas that need attention to improve deal health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessment.coaching_prompts.map((prompt, index) => (
                  <Alert key={index} className="border-l-4 border-l-orange-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-1">{prompt.pillar.replace('_', ' ').toUpperCase()}</div>
                      <div>{prompt.prompt}</div>
                      {prompt.action_items && prompt.action_items.length > 0 && (
                        <ul className="mt-2 text-sm list-disc list-inside">
                          {prompt.action_items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Notes</CardTitle>
            <CardDescription>
              Additional observations and action items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Add your notes about this MEDDPICC assessment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={saveNotes}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Notes
                </Button>
                <Button
                  onClick={completeAssessment}
                  disabled={isSaving || completionPercentage < 80}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Pillar Card Component
interface PillarCardProps {
  pillar: MEDDPICCPillar;
  answers: Record<string, string>;
  score?: any;
  isExpanded: boolean;
  onToggle: () => void;
  onAnswerChange: (questionId: string, value: string) => void;
}

function PillarCard({ 
  pillar, 
  answers, 
  score, 
  isExpanded, 
  onToggle, 
  onAnswerChange 
}: PillarCardProps) {
  const Icon = PILLAR_ICONS[pillar.id as keyof typeof PILLAR_ICONS] || Target;
  const answeredQuestions = pillar.questions.filter(q => answers[q.id]).length;
  const totalQuestions = pillar.questions.length;
  const pillarCompletion = (answeredQuestions / totalQuestions) * 100;

  return (
    <Card className="w-full">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {score && (
                  <div className="text-right">
                    <div className="font-semibold">{score.score}/{score.maxScore}</div>
                    <Badge 
                      variant="secondary" 
                      className={`${LEVEL_COLORS[score.level]} text-white text-xs`}
                    >
                      {score.level}
                    </Badge>
                  </div>
                )}
                <div className="text-right text-sm text-muted-foreground">
                  <div>{answeredQuestions}/{totalQuestions}</div>
                  <div>{pillarCompletion.toFixed(0)}%</div>
                </div>
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </div>
            {pillarCompletion > 0 && (
              <Progress value={pillarCompletion} className="h-1" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {pillar.primer && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>{pillar.primer}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6">
              {pillar.questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Label className="text-sm font-medium leading-6 flex-1">
                      {question.text}
                    </Label>
                    {question.tooltip && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{question.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  
                  <RadioGroup
                    value={answers[question.id] || ''}
                    onValueChange={(value) => onAnswerChange(question.id, value)}
                    className="ml-4"
                  >
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <Label 
                          htmlFor={`${question.id}-${option.value}`}
                          className="text-sm cursor-pointer flex items-center gap-2"
                        >
                          {option.label}
                          <span className="text-xs text-muted-foreground">
                            ({option.score} pts)
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}