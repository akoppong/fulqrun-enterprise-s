/**
 * MEDDPICC Assessment Launcher
 * Main entry point for guided B2B qualification assessments
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Building,
  Zap, 
  Shield, 
  FileText,
  Heart,
  Trophy,
  Eye,
  CheckCircle,
  Play,
  BookOpen,
  BarChart3,
  Clock,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

import { MEDDPICCAssessment } from './MEDDPICCAssessment';
import { MEDDPICCDemo } from './MEDDPICCDemo';
import { useKV } from '@github/spark/hooks';
import type { Opportunity } from '@/lib/types';
import { MEDDPICCService } from '@/services/meddpicc-service';
import { MEDDPICC_CONFIG } from '@/data/meddpicc-config';

interface MEDDPICCLauncherProps {
  currentUser?: any;
  onComplete?: (assessment: any) => void;
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

export function MEDDPICCLauncher({ currentUser, onComplete }: MEDDPICCLauncherProps) {
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const [opportunities] = useKV<Opportunity[]>('opportunities', []);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load recent assessments (placeholder for future implementation)
    setRecentAssessments([]);
  }, []);

  const startAssessment = () => {
    if (!selectedOpportunity) {
      toast.error('Please select an opportunity first');
      return;
    }
    setShowAssessment(true);
  };

  const handleAssessmentComplete = (assessment: any) => {
    setShowAssessment(false);
    setShowDemo(false);
    setSelectedOpportunity('');
    toast.success('MEDDPICC assessment completed successfully!');
    onComplete?.(assessment);
  };

  if (showDemo) {
    return <MEDDPICCDemo />;
  }

  if (showAssessment && selectedOpportunity) {
    return (
      <MEDDPICCAssessment 
        opportunityId={selectedOpportunity}
        userId={currentUser?.id || 'current-user'}
        onAssessmentComplete={handleAssessmentComplete}
        onSave={() => {}}
      />
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading MEDDPICC...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">MEDDPICC Assessment Center</CardTitle>
              <CardDescription>
                Guided B2B sales qualification using the proven MEDDPICC methodology
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Qualification Pillars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">~15</div>
              <div className="text-sm text-muted-foreground">Minutes to Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">40</div>
              <div className="text-sm text-muted-foreground">Maximum Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">AI</div>
              <div className="text-sm text-muted-foreground">Coaching Prompts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Start New Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Start New Assessment
          </CardTitle>
          <CardDescription>
            Complete your first MEDDPICC assessment to see guided B2B qualification in action
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Opportunity</label>
            <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an opportunity to assess..." />
              </SelectTrigger>
              <SelectContent>
                {opportunities.map((opportunity) => (
                  <SelectItem key={opportunity.id} value={opportunity.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{opportunity.name}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {opportunity.company}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.stage}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={startAssessment} 
            disabled={!selectedOpportunity}
            className="w-full"
            size="lg"
          >
            <Target className="h-4 w-4 mr-2" />
            Start MEDDPICC Assessment
          </Button>

          <Button 
            onClick={() => setShowDemo(true)} 
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Try Interactive Demo
          </Button>

          {opportunities.length === 0 && (
            <Alert>
              <AlertDescription>
                No opportunities found. Create an opportunity first to begin MEDDPICC qualification.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* MEDDPICC Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            MEDDPICC Methodology Overview
          </CardTitle>
          <CardDescription>
            Learn about the 8 qualification pillars that drive successful B2B sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MEDDPICC_CONFIG.pillars.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.id as keyof typeof PILLAR_ICONS] || Target;
              return (
                <div key={pillar.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{pillar.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pillar.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Max: {pillar.maxScore} pts
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {pillar.questions.length} questions
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Assessments
            </CardTitle>
            <CardDescription>
              View and continue recent MEDDPICC assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAssessments.map((assessment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{assessment.opportunityName}</div>
                      <div className="text-sm text-muted-foreground">
                        Score: {assessment.score}/40 • {assessment.level}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${LEVEL_COLORS[assessment.level]} text-white`}>
                      {assessment.level}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Why Use MEDDPICC?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Higher Win Rates</h4>
              <p className="text-sm text-muted-foreground">
                Qualified deals using MEDDPICC show 30%+ higher win rates
              </p>
            </div>
            <div className="text-center p-4">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Shorter Sales Cycles</h4>
              <p className="text-sm text-muted-foreground">
                Better qualification leads to more predictable and faster closes
              </p>
            </div>
            <div className="text-center p-4">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Risk Mitigation</h4>
              <p className="text-sm text-muted-foreground">
                Identify deal risks early and develop mitigation strategies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}