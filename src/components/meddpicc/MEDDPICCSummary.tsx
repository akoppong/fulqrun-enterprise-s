/**
 * MEDDPICC Summary Component
 * Compact view of MEDDPICC assessment for opportunity cards and views
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Shield, 
  FileText,
  Heart,
  Trophy,
  Eye,
  ExternalLink,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

import { MEDDPICCAssessment, MEDDPICCScore } from '@/types/meddpicc';

interface MEDDPICCSummaryProps {
  assessment: MEDDPICCAssessment | null;
  onOpenAssessment?: () => void;
  compact?: boolean;
  showActions?: boolean;
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

const PILLAR_LABELS = {
  metrics: 'Metrics',
  economic_buyer: 'Economic Buyer',
  decision_criteria: 'Decision Criteria',
  decision_process: 'Decision Process',
  paper_process: 'Paper Process',
  implicate_the_pain: 'Pain',
  champion: 'Champion',
  competition: 'Competition'
};

const LEVEL_COLORS = {
  strong: 'bg-green-500 text-white',
  moderate: 'bg-yellow-500 text-white',
  weak: 'bg-red-500 text-white'
};

const LEVEL_BORDER_COLORS = {
  strong: 'border-green-200',
  moderate: 'border-yellow-200', 
  weak: 'border-red-200'
};

export function MEDDPICCSummary({ 
  assessment, 
  onOpenAssessment, 
  compact = false,
  showActions = true
}: MEDDPICCSummaryProps) {
  if (!assessment) {
    return (
      <Card className="border-dashed border-muted-foreground/25">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <Target className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No MEDDPICC assessment</p>
            {showActions && onOpenAssessment && (
              <Button variant="outline" size="sm" onClick={onOpenAssessment}>
                Start Assessment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return <CompactMEDDPICCSummary assessment={assessment} onOpenAssessment={onOpenAssessment} />;
  }

  return (
    <TooltipProvider>
      <Card className={`${LEVEL_BORDER_COLORS[assessment.overall_level]} border-2`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              MEDDPICC Assessment
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={LEVEL_COLORS[assessment.overall_level]}>
                {assessment.overall_level.toUpperCase()}
              </Badge>
              {showActions && onOpenAssessment && (
                <Button variant="outline" size="sm" onClick={onOpenAssessment}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-lg font-bold">
                {assessment.total_score}/{assessment.max_total_score}
              </span>
            </div>
            <Progress 
              value={(assessment.total_score / assessment.max_total_score) * 100} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{assessment.completion_percentage.toFixed(1)}% complete</span>
              <span>
                {Math.round((assessment.total_score / assessment.max_total_score) * 100)}% of max
              </span>
            </div>
          </div>

          {/* Pillar Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {assessment.pillar_scores.map((score) => (
              <PillarScoreCard key={score.pillar} score={score} />
            ))}
          </div>

          {/* Coaching Prompts */}
          {assessment.coaching_prompts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Priority Actions</span>
                <Badge variant="secondary">{assessment.coaching_prompts.length}</Badge>
              </div>
              <div className="space-y-1">
                {assessment.coaching_prompts.slice(0, 3).map((prompt, index) => (
                  <div key={index} className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <span className="font-medium">{PILLAR_LABELS[prompt.pillar as keyof typeof PILLAR_LABELS]}:</span> {prompt.prompt}
                  </div>
                ))}
                {assessment.coaching_prompts.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{assessment.coaching_prompts.length - 3} more recommendations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {assessment.last_updated.toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Compact version for table cells and small spaces
function CompactMEDDPICCSummary({ 
  assessment, 
  onOpenAssessment 
}: { 
  assessment: MEDDPICCAssessment;
  onOpenAssessment?: () => void;
}) {
  const scorePercentage = (assessment.total_score / assessment.max_total_score) * 100;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
            onClick={onOpenAssessment}
          >
            <Target className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${LEVEL_COLORS[assessment.overall_level]} text-xs`}
                >
                  {assessment.overall_level.charAt(0).toUpperCase()}
                </Badge>
                <span className="text-sm font-medium">
                  {assessment.total_score}/{assessment.max_total_score}
                </span>
              </div>
              <Progress value={scorePercentage} className="h-1 mt-1" />
            </div>
            {assessment.coaching_prompts.length > 0 && (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-2">
            <div className="font-medium">MEDDPICC Assessment</div>
            <div className="text-sm">
              Score: {assessment.total_score}/{assessment.max_total_score} ({scorePercentage.toFixed(1)}%)
            </div>
            <div className="text-sm">
              Level: <span className="font-medium">{assessment.overall_level.toUpperCase()}</span>
            </div>
            <div className="text-sm">
              Completion: {assessment.completion_percentage.toFixed(1)}%
            </div>
            {assessment.coaching_prompts.length > 0 && (
              <div className="text-sm">
                {assessment.coaching_prompts.length} action item{assessment.coaching_prompts.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Individual pillar score card
function PillarScoreCard({ score }: { score: MEDDPICCScore }) {
  const Icon = PILLAR_ICONS[score.pillar as keyof typeof PILLAR_ICONS] || Target;
  const label = PILLAR_LABELS[score.pillar as keyof typeof PILLAR_LABELS] || score.pillar;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="p-3 bg-muted/30 rounded-lg space-y-2 hover:bg-muted/50 transition-colors cursor-default">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium truncate">{label}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">{score.score}/{score.maxScore}</span>
                <Badge 
                  variant="secondary" 
                  className={`${LEVEL_COLORS[score.level]} text-xs px-1`}
                >
                  {score.level.charAt(0).toUpperCase()}
                </Badge>
              </div>
              <Progress value={score.percentage} className="h-1" />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">{label}</div>
            <div className="text-sm">Score: {score.score}/{score.maxScore}</div>
            <div className="text-sm">Percentage: {score.percentage.toFixed(1)}%</div>
            <div className="text-sm">Level: {score.level.toUpperCase()}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// MEDDPICC Score Badge - for use in tables and lists
export function MEDDPICCScoreBadge({ 
  assessment,
  showTooltip = true 
}: { 
  assessment: MEDDPICCAssessment | null;
  showTooltip?: boolean;
}) {
  if (!assessment) {
    return (
      <Badge variant="outline" className="text-xs">
        No Assessment
      </Badge>
    );
  }

  const badge = (
    <Badge className={`${LEVEL_COLORS[assessment.overall_level]} text-xs`}>
      {assessment.total_score}/{assessment.max_total_score}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="font-medium">MEDDPICC Score</div>
            <div className="text-sm">{assessment.overall_level.toUpperCase()} ({Math.round((assessment.total_score / assessment.max_total_score) * 100)}%)</div>
            <div className="text-sm">{assessment.completion_percentage.toFixed(1)}% complete</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// MEDDPICC Health Indicator - simple traffic light indicator
export function MEDDPICCHealthIndicator({ 
  assessment 
}: { 
  assessment: MEDDPICCAssessment | null 
}) {
  if (!assessment) {
    return <div className="w-3 h-3 rounded-full bg-gray-300" />;
  }

  const colors = {
    strong: 'bg-green-500',
    moderate: 'bg-yellow-500',
    weak: 'bg-red-500'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-3 h-3 rounded-full ${colors[assessment.overall_level]} cursor-default`} />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            Deal Health: {assessment.overall_level.toUpperCase()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}