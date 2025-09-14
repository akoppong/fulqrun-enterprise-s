/**
 * MEDDPICC Demo Component
 * Shows guided B2B qualification in action with sample data
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  Users, 
  Eye,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

import { MEDDPICC_CONFIG, calculatePillarScore, calculateTotalScore, getScoreLevel, getCoachingPrompts } from '../../data/meddpicc-config';

export function MEDDPICCDemo() {
  const [currentPillar, setCurrentPillar] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const pillar = MEDDPICC_CONFIG.pillars[currentPillar];
  const totalPillars = MEDDPICC_CONFIG.pillars.length;
  const progress = ((currentPillar + 1) / totalPillars) * 100;

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
  };

  const nextPillar = () => {
    if (currentPillar < totalPillars - 1) {
      setCurrentPillar(currentPillar + 1);
    } else {
      // Show results
      setShowResults(true);
      toast.success('MEDDPICC Demo Assessment Complete!');
    }
  };

  const previousPillar = () => {
    if (currentPillar > 0) {
      setCurrentPillar(currentPillar - 1);
    }
  };

  const resetDemo = () => {
    setCurrentPillar(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const totalScore = calculateTotalScore(answers);
    const scoreLevel = getScoreLevel(totalScore);
    const coachingPrompts = getCoachingPrompts(answers);
    
    const pillarScores = MEDDPICC_CONFIG.pillars.map(p => ({
      pillar: p,
      score: calculatePillarScore(p.id, answers)
    }));

    const levelColors = {
      strong: 'bg-green-500',
      moderate: 'bg-yellow-500', 
      weak: 'bg-red-500'
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              MEDDPICC Assessment Results
            </CardTitle>
            <CardDescription>
              Demo assessment completed - here's your guided B2B qualification analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalScore}/40</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center">
                <Badge className={`${levelColors[scoreLevel]} text-white`}>
                  {scoreLevel.toUpperCase()}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Deal Health</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.keys(answers).length}/{MEDDPICC_CONFIG.pillars.reduce((sum, p) => sum + p.questions.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Questions Answered</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Pillar Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pillarScores.map(({ pillar, score }, index) => (
                  <div key={pillar.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium">{pillar.title}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{score}/40</div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${score >= 32 ? 'text-green-600' : score >= 24 ? 'text-yellow-600' : 'text-red-600'}`}
                      >
                        {score >= 32 ? 'Strong' : score >= 24 ? 'Moderate' : 'Weak'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {coachingPrompts.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  AI Coaching Recommendations
                </h4>
                <div className="space-y-3">
                  {coachingPrompts.map((prompt, index) => (
                    <Alert key={index} className="border-l-4 border-l-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">{prompt.pillar.replace('_', ' ').toUpperCase()}</div>
                        <div>{prompt.prompt}</div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <Button onClick={resetDemo}>
                Try Another Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            MEDDPICC Demo Assessment
          </CardTitle>
          <CardDescription>
            Experience guided B2B qualification with sample questions ({currentPillar + 1}/{totalPillars})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Pillar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {pillar.title}
          </CardTitle>
          <CardDescription>
            {pillar.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pillar.primer && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>{pillar.primer}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-6">
            {pillar.questions.slice(0, 1).map((question) => (
              <div key={question.id} className="space-y-3">
                <Label className="text-sm font-medium">
                  {question.text}
                </Label>
                
                <RadioGroup
                  value={answers[question.id] || ''}
                  onValueChange={(value) => handleAnswer(question.id, value)}
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
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={previousPillar}
              disabled={currentPillar === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={nextPillar}
              disabled={!pillar.questions.slice(0, 1).some(q => answers[q.id])}
            >
              {currentPillar === totalPillars - 1 ? 'Complete Assessment' : 'Next Pillar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}