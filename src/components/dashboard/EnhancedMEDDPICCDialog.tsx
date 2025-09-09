import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  TrendingUp,
  Clock
} from '@phosphor-icons/react';
import { MEDDPICC, Opportunity, Company } from '@/lib/types';
import { callAIWithTimeout } from '@/lib/ai-timeout-wrapper';
import { toast } from 'sonner';

interface EnhancedMEDDPICCDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity;
  company: Company;
  onSave: (meddpicc: MEDDPICC) => void;
}

export function EnhancedMEDDPICCDialog({ 
  open, 
  onOpenChange, 
  opportunity, 
  company, 
  onSave 
}: EnhancedMEDDPICCDialogProps) {
  const [meddpicc, setMeddpicc] = useState<MEDDPICC>(opportunity.meddpicc);
  const [aiHints, setAiHints] = useState<{
    metricsHints: string[];
    championHints: string[];
    riskFactors: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('metrics');

  useEffect(() => {
    if (open) {
      loadAIHints();
    }
  }, [open, opportunity.id]);

  const loadAIHints = async () => {
    setLoading(true);
    try {
      const hints = await AIService.generateMEDDPICCHints(opportunity, company);
      setAiHints(hints);
      setMeddpicc(prev => ({
        ...prev,
        aiHints: hints,
        lastAiAnalysis: new Date()
      }));
    } catch (error) {
      console.error('Failed to load AI hints:', error);
      toast.error('Failed to load AI hints');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionScore = () => {
    const fields = [
      meddpicc.metrics,
      meddpicc.economicBuyer,
      meddpicc.decisionCriteria,
      meddpicc.decisionProcess,
      meddpicc.paperProcess,
      meddpicc.implicatePain,
      meddpicc.champion
    ];
    
    const completed = fields.filter(field => field && field.length > 10).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSave = () => {
    const completionScore = calculateCompletionScore();
    const updatedMeddpicc = {
      ...meddpicc,
      score: completionScore,
      aiHints
    };
    
    onSave(updatedMeddpicc);
    onOpenChange(false);
    toast.success('MEDDPICC qualification updated');
  };

  const runAIAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      // This would integrate with the AI service to analyze the current qualification
      const prompt = spark.llmPrompt`
      Analyze this MEDDPICC qualification and provide a score with recommendations:
      
      Metrics: ${meddpicc.metrics}
      Economic Buyer: ${meddpicc.economicBuyer}
      Decision Criteria: ${meddpicc.decisionCriteria}
      Decision Process: ${meddpicc.decisionProcess}
      Paper Process: ${meddpicc.paperProcess}
      Implicate Pain: ${meddpicc.implicatePain}
      Champion: ${meddpicc.champion}
      
      Provide a qualification score (0-100) and specific recommendations for improvement.
      Return as JSON: {score, recommendations, strengths, gaps}
      `;
      
      const response = await callAIWithTimeout(prompt, 'gpt-4o', true);
      const analysis = JSON.parse(response);
      
      setMeddpicc(prev => ({
        ...prev,
        score: analysis.score
      }));
      
      toast.success(`AI Analysis Complete - Score: ${analysis.score}/100`);
    } catch (error) {
      console.error('AI analysis failed:', error);
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      toast.error(isTimeout ? 'AI analysis timed out - please try again' : 'AI analysis failed');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const renderHintCard = (title: string, hints: string[], icon: React.ReactNode) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hints.map((hint, index) => (
            <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md text-xs">
              <Lightbulb size={12} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>{hint}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const completionScore = calculateCompletionScore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Enhanced MEDDPICC Qualification
          </DialogTitle>
          <DialogDescription>
            Complete qualification with AI-powered insights and recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score and Analysis Header */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Completion Score</Label>
                <div className={`text-2xl font-bold ${getScoreColor(completionScore)}`}>
                  {completionScore}%
                </div>
              </div>
              <Progress value={completionScore} className="w-32" />
            </div>
            <Button 
              onClick={runAIAnalysis} 
              disabled={analysisLoading}
              variant="outline"
              size="sm"
            >
              <Brain className="mr-2 h-4 w-4" />
              {analysisLoading ? 'Analyzing...' : 'AI Analysis'}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="economic">Economic</TabsTrigger>
              <TabsTrigger value="criteria">Criteria</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
              <TabsTrigger value="paper">Paper</TabsTrigger>
              <TabsTrigger value="pain">Pain</TabsTrigger>
              <TabsTrigger value="champion">Champion</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="metrics">Metrics - What economic impact can we measure?</Label>
                    <Textarea
                      id="metrics"
                      value={meddpicc.metrics}
                      onChange={(e) => setMeddpicc(prev => ({ ...prev, metrics: e.target.value }))}
                      placeholder="ROI, cost savings, revenue increase, efficiency gains..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                  {meddpicc.metrics.length < 10 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Add specific, quantifiable metrics to strengthen your qualification
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Metrics Questions',
                    aiHints.metricsHints,
                    <Target size={16} className="text-blue-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="economic" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="economicBuyer">Economic Buyer - Who has the economic authority?</Label>
                  <Textarea
                    id="economicBuyer"
                    value={meddpicc.economicBuyer}
                    onChange={(e) => setMeddpicc(prev => ({ ...prev, economicBuyer: e.target.value }))}
                    placeholder="Name, title, authority level, budget control..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Economic Buyer Hints',
                    ['Identify budget holder', 'Understand approval process', 'Map financial decision tree'],
                    <Users size={16} className="text-green-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="decisionCriteria">Decision Criteria - What criteria will they use to decide?</Label>
                  <Textarea
                    id="decisionCriteria"
                    value={meddpicc.decisionCriteria}
                    onChange={(e) => setMeddpicc(prev => ({ ...prev, decisionCriteria: e.target.value }))}
                    placeholder="Technical requirements, budget constraints, timeline, vendor criteria..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Criteria Discovery',
                    ['Technical requirements', 'Budget parameters', 'Vendor evaluation criteria'],
                    <CheckCircle size={16} className="text-purple-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="process" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="decisionProcess">Decision Process - How will they make the decision?</Label>
                  <Textarea
                    id="decisionProcess"
                    value={meddpicc.decisionProcess}
                    onChange={(e) => setMeddpicc(prev => ({ ...prev, decisionProcess: e.target.value }))}
                    placeholder="Steps, stakeholders involved, timeline, evaluation process..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Process Mapping',
                    ['Map decision steps', 'Identify all stakeholders', 'Understand timeline'],
                    <TrendingUp size={16} className="text-indigo-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paper" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="paperProcess">Paper Process - What's the approval/procurement process?</Label>
                  <Textarea
                    id="paperProcess"
                    value={meddpicc.paperProcess}
                    onChange={(e) => setMeddpicc(prev => ({ ...prev, paperProcess: e.target.value }))}
                    placeholder="Legal review, procurement steps, contract process, approvals..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Paper Process Guide',
                    ['Legal requirements', 'Procurement steps', 'Approval chain'],
                    <Clock size={16} className="text-orange-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pain" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="implicatePain">Implicate Pain - What pain are we addressing?</Label>
                  <Textarea
                    id="implicatePain"
                    value={meddpicc.implicatePain}
                    onChange={(e) => setMeddpicc(prev => ({ ...prev, implicatePain: e.target.value }))}
                    placeholder="Current problems, impact on business, urgency, consequences of inaction..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Pain Discovery',
                    ['Quantify current problems', 'Identify impact on business', 'Understand urgency'],
                    <AlertTriangle size={16} className="text-red-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="champion" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="champion">Champion - Who is actively selling for us?</Label>
                    <Textarea
                      id="champion"
                      value={meddpicc.champion}
                      onChange={(e) => setMeddpicc(prev => ({ ...prev, champion: e.target.value }))}
                      placeholder="Name, role, influence level, motivation, coaching notes..."
                      rows={6}
                      className="mt-2"
                    />
                  </div>
                  {meddpicc.champion.length < 10 && (
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        Identify and develop a strong internal champion to improve your win probability
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div>
                  {aiHints && renderHintCard(
                    'Champion Development',
                    aiHints.championHints,
                    <Users size={16} className="text-blue-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Qualification Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meddpicc.metrics && meddpicc.metrics.length > 10 && (
                        <Badge variant="secondary" className="mr-2">✓ Metrics Defined</Badge>
                      )}
                      {meddpicc.economicBuyer && meddpicc.economicBuyer.length > 10 && (
                        <Badge variant="secondary" className="mr-2">✓ Economic Buyer Identified</Badge>
                      )}
                      {meddpicc.champion && meddpicc.champion.length > 10 && (
                        <Badge variant="secondary" className="mr-2">✓ Champion Engaged</Badge>
                      )}
                      {meddpicc.decisionProcess && meddpicc.decisionProcess.length > 10 && (
                        <Badge variant="secondary" className="mr-2">✓ Process Mapped</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Risk Factors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiHints?.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{risk}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadAIHints} disabled={loading}>
                <Brain className="mr-2 h-4 w-4" />
                Refresh AI Hints
              </Button>
              <Button onClick={handleSave}>
                Save Qualification
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}