import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKV } from '@github/spark/hooks';
import { 
  CheckCircle, 
  ChevronDown, 
  ChevronRight, 
  Target, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Star,
  Lightbulb,
  Download,
  Share,
  Brain,
  Shield,
  Clock,
  Users,
  BarChart3,
  Activity
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  MEDDPICCAssessment, 
  MEDDPICCAnswer,
  MEDDPICCScoringService,
  MEDDPICCInsight
} from '../../services/meddpicc-scoring-service';
import { EnhancedMEDDPICCAnalytics } from './EnhancedMEDDPICCAnalytics';

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
  id: string;
  title: string;
  description: string;
  questions: MEDDPICCQuestion[];
}

interface MEDDPICCData {
  pillars: MEDDPICCPillar[];
  scoring: {
    max_score: number;
    thresholds: {
      strong: { min: number; label: string };
      moderate: { min: number; max: number; label: string };
      weak: { max: number; label: string };
    };
  };
  coaching_prompts: {
    condition: { pillar: string; value: string };
    prompt: string;
  }[];
}

const meddpiccData: MEDDPICCData = {
  "pillars": [
    {
      "id": "metrics",
      "title": "Metrics",
      "description": "Understanding the quantifiable business impact and success criteria",
      "questions": [
        {
          "id": "q_1_2",
          "text": "No customer metric identified",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_1_3",
          "text": "Assumption of the Metrics based on outside information or initial conversations",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_1_4",
          "text": "Reasonably good understanding of the Metrics based on conversations",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_1_5",
          "text": "We strongly understand the Metrics driving the project",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_1_6",
          "text": "We have influenced the metrics",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "economic_buyer",
      "title": "Economic Buyer",
      "description": "Identifying the person with budgetary authority to make the purchase decision",
      "questions": [
        {
          "id": "q_11_3",
          "text": "No economic buyer is identified",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_11_4",
          "text": "We have an assumption of who the Economic Buyer is",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_11_5",
          "text": "We have confirmation of the Economic Buyer from our Champion/Coach",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_11_6",
          "text": "The EB are aware of our organization and our core value propositions",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_11_7",
          "text": "We have had direct engagement with the Economic Buyer",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "decision_criteria",
      "title": "Decision Criteria",
      "description": "Understanding the formal and informal criteria used to make the buying decision",
      "questions": [
        {
          "id": "q_3_1",
          "text": "No decision criteria identified",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_3_2",
          "text": "We have assumptions about the decision criteria",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_3_3",
          "text": "We understand the formal decision criteria",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_3_4",
          "text": "We understand both formal and informal decision criteria",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_3_5",
          "text": "We have influenced the decision criteria",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "decision_process",
      "title": "Decision Process",
      "description": "Understanding how the buying decision will be made and who is involved",
      "questions": [
        {
          "id": "q_4_1",
          "text": "No understanding of the decision process",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_4_2",
          "text": "We have basic understanding of the decision process",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_4_3",
          "text": "We understand the formal decision process and stakeholders",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_4_4",
          "text": "We understand both formal and informal decision processes",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_4_5",
          "text": "We have influenced or helped design the decision process",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "paper_process",
      "title": "Paper Process",
      "description": "Understanding the procurement, legal, and administrative processes",
      "questions": [
        {
          "id": "q_5_1",
          "text": "No understanding of the paper process",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_5_2",
          "text": "We have basic understanding of procurement requirements",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_5_3",
          "text": "We understand the complete procurement and legal process",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_5_4",
          "text": "We have identified and engaged with all process stakeholders",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_5_5",
          "text": "We have helped streamline or optimize the paper process",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "implicate_the_pain",
      "title": "Implicate The Pain",
      "description": "Identifying and quantifying the cost of not solving the problem",
      "questions": [
        {
          "id": "q_6_1",
          "text": "No pain points identified",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_6_2",
          "text": "We have identified surface-level pain points",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_6_3",
          "text": "We understand the business impact of the pain",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_6_4",
          "text": "We have quantified the cost of inaction",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_6_5",
          "text": "The customer acknowledges urgent need to solve the pain",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "champion",
      "title": "Champion",
      "description": "Identifying and developing internal advocates who will sell for you",
      "questions": [
        {
          "id": "q_7_1",
          "text": "No champion identified",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_7_2",
          "text": "We have identified a potential champion",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_7_3",
          "text": "Our champion has influence and is willing to help",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_7_4",
          "text": "Our champion actively promotes our solution internally",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_7_5",
          "text": "Our champion has access to and influence with the Economic Buyer",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    },
    {
      "id": "competition",
      "title": "Competition",
      "description": "Understanding competitive landscape and differentiating our solution",
      "questions": [
        {
          "id": "q_8_1",
          "text": "No competitive intelligence gathered",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 0 },
            { "label": "Yes", "value": "yes", "score": 0 }
          ],
          "tooltip": "Expected score: 0"
        },
        {
          "id": "q_8_2",
          "text": "We have basic awareness of competitive alternatives",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 5 },
            { "label": "Yes", "value": "yes", "score": 10 }
          ],
          "tooltip": "Expected score: 10"
        },
        {
          "id": "q_8_3",
          "text": "We understand the competitive landscape and alternatives",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 10 },
            { "label": "Yes", "value": "yes", "score": 20 }
          ],
          "tooltip": "Expected score: 20"
        },
        {
          "id": "q_8_4",
          "text": "We have clear differentiation strategy and proof points",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 15 },
            { "label": "Yes", "value": "yes", "score": 30 }
          ],
          "tooltip": "Expected score: 30"
        },
        {
          "id": "q_8_5",
          "text": "Customer acknowledges our competitive advantages",
          "type": "single-select",
          "options": [
            { "label": "No", "value": "no", "score": 0 },
            { "label": "Partial", "value": "partial", "score": 20 },
            { "label": "Yes", "value": "yes", "score": 40 }
          ],
          "tooltip": "Expected score: 40"
        }
      ]
    }
  ],
  "scoring": {
    "max_score": 320,
    "thresholds": {
      "strong": { "min": 256, "label": "Strong" },
      "moderate": { "min": 192, "max": 255, "label": "Moderate" },
      "weak": { "max": 191, "label": "Weak" }
    }
  },
  "coaching_prompts": [
    {
      "condition": { "pillar": "economic_buyer", "value": "no" },
      "prompt": "Identify EB; request intro via Champion this week."
    },
    {
      "condition": { "pillar": "implicate_the_pain", "value": "no" },
      "prompt": "Run a 30-min ROI workshop; attach cost-of-inaction calc to notes."
    },
    {
      "condition": { "pillar": "champion", "value": "no" },
      "prompt": "Identify potential champions; schedule relationship-building meetings."
    },
    {
      "condition": { "pillar": "metrics", "value": "no" },
      "prompt": "Schedule metrics discovery call; prepare business case template."
    },
    {
      "condition": { "pillar": "decision_criteria", "value": "no" },
      "prompt": "Request formal RFP or evaluation criteria; align solution positioning."
    },
    {
      "condition": { "pillar": "decision_process", "value": "no" },
      "prompt": "Map decision-making stakeholders; create engagement timeline."
    },
    {
      "condition": { "pillar": "paper_process", "value": "no" },
      "prompt": "Connect with procurement; review contracting requirements early."
    },
    {
      "condition": { "pillar": "competition", "value": "no" },
      "prompt": "Conduct competitive analysis; prepare differentiation battle cards."
    }
  ]
};

export function EnhancedMEDDPICCModule() {
  const [assessment, setAssessment] = useKV<MEDDPICCAssessment>('enhanced-meddpicc-assessment', {
    id: Date.now().toString(),
    opportunity_id: '',
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

  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'assessment' | 'insights' | 'analytics'>('assessment');
  const [insights, setInsights] = useState<MEDDPICCInsight[]>([]);

  // Calculate enhanced scores when answers change
  useEffect(() => {
    if (assessment.answers.length > 0) {
      const enhancedAssessment = MEDDPICCScoringService.calculateAdvancedScoring(assessment);
      const generatedInsights = MEDDPICCScoringService.generateInsights(enhancedAssessment);
      
      setAssessment(enhancedAssessment);
      setInsights(generatedInsights);
    }
  }, [assessment.answers.length]); // Only trigger on answer count change to prevent loops

  const handleAnswerChange = (
    pillar: string, 
    questionId: string, 
    value: string, 
    confidenceLevel: 'low' | 'medium' | 'high' = 'medium', 
    notes?: string
  ) => {
    const question = meddpiccData.pillars
      .find(p => p.id === pillar)
      ?.questions.find(q => q.id === questionId);
    
    if (!question) return;

    const option = question.options.find(o => o.value === value);
    if (!option) return;

    const newAnswer: MEDDPICCAnswer = {
      pillar,
      question_id: questionId,
      answer_value: value,
      score: option.score,
      timestamp: new Date(),
      confidence_level: confidenceLevel,
      evidence_notes: notes
    };

    setAssessment(prev => ({
      ...prev,
      answers: [
        ...prev.answers.filter(a => !(a.pillar === pillar && a.question_id === questionId)),
        newAnswer
      ]
    }));
  };

  const togglePillar = (pillarId: string) => {
    setExpandedPillars(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pillarId)) {
        newSet.delete(pillarId);
      } else {
        newSet.add(pillarId);
      }
      return newSet;
    });
  };

  const getScoreLevel = (score: number): { level: string; color: string } => {
    if (score >= meddpiccData.scoring.thresholds.strong.min) {
      return { level: 'Strong', color: 'text-green-600' };
    } else if (score >= meddpiccData.scoring.thresholds.moderate.min) {
      return { level: 'Moderate', color: 'text-yellow-600' };
    } else {
      return { level: 'Weak', color: 'text-red-600' };
    }
  };

  const getRiskLevelColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportAssessment = () => {
    const exportData = MEDDPICCScoringService.exportDetailedAssessment(assessment);
    
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-meddpicc-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Enhanced assessment exported successfully');
  };

  const shareAssessment = () => {
    const summary = `Enhanced MEDDPICC Assessment Summary
Total Score: ${assessment.total_score}/${meddpiccData.scoring.max_score} (${getScoreLevel(assessment.total_score).level})
Confidence Score: ${assessment.confidence_score}%
Risk Level: ${assessment.risk_level.toUpperCase()}

Pillar Scores:
${meddpiccData.pillars.map(pillar => 
  `${pillar.title}: ${assessment.pillar_scores[pillar.id] || 0}/40`
).join('\n')}

Coaching Actions:
${assessment.coaching_actions.slice(0, 5).map(action => `• ${action}`).join('\n')}

Key Insights:
${insights.slice(0, 3).map(insight => `• ${insight.description}`).join('\n')}
`;

    navigator.clipboard.writeText(summary).then(() => {
      toast.success('Enhanced assessment summary copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const getAnswerValue = (pillar: string, questionId: string): string => {
    const answer = assessment.answers.find(a => a.pillar === pillar && a.question_id === questionId);
    return answer?.answer_value || '';
  };

  const getAnswerConfidence = (pillar: string, questionId: string): 'low' | 'medium' | 'high' => {
    const answer = assessment.answers.find(a => a.pillar === pillar && a.question_id === questionId);
    return answer?.confidence_level || 'medium';
  };

  const getAnswerNotes = (pillar: string, questionId: string): string => {
    const answer = assessment.answers.find(a => a.pillar === pillar && a.question_id === questionId);
    return answer?.evidence_notes || '';
  };

  const overallScoreLevel = getScoreLevel(assessment.total_score);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckCircle size={32} className="text-primary" />
            Enhanced MEDDPICC Module
          </h1>
          <p className="text-muted-foreground mt-2">
            Advanced B2B qualification with AI-powered insights and risk assessment
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportAssessment}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={shareAssessment}>
            <Share size={16} className="mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          {/* Enhanced Score Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Target size={24} />
                  Deal Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold">
                    <span className={overallScoreLevel.color}>
                      {assessment.total_score}
                    </span>
                    <span className="text-muted-foreground">
                      /{meddpiccData.scoring.max_score}
                    </span>
                  </div>
                  <Badge className={cn(
                    "text-sm",
                    overallScoreLevel.level === 'Strong' && "bg-green-100 text-green-800",
                    overallScoreLevel.level === 'Moderate' && "bg-yellow-100 text-yellow-800",
                    overallScoreLevel.level === 'Weak' && "bg-red-100 text-red-800"
                  )}>
                    {overallScoreLevel.level}
                  </Badge>
                  <Progress value={(assessment.total_score / meddpiccData.scoring.max_score) * 100} />
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain size={24} />
                  Confidence Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-blue-600">
                    {assessment.confidence_score}%
                  </div>
                  <Badge variant={assessment.confidence_score >= 80 ? 'default' : assessment.confidence_score >= 60 ? 'secondary' : 'destructive'}>
                    {assessment.confidence_score >= 80 ? 'High Confidence' : assessment.confidence_score >= 60 ? 'Medium Confidence' : 'Low Confidence'}
                  </Badge>
                  <Progress value={assessment.confidence_score} />
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield size={24} />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold capitalize">
                    {assessment.risk_level}
                  </div>
                  <Badge className={getRiskLevelColor(assessment.risk_level)}>
                    {assessment.risk_level.toUpperCase()} RISK
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {assessment.risk_level === 'critical' && 'Immediate intervention required'}
                    {assessment.risk_level === 'high' && 'Significant attention needed'}
                    {assessment.risk_level === 'medium' && 'Monitor closely'}
                    {assessment.risk_level === 'low' && 'Well qualified opportunity'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stage Readiness */}
          {Object.keys(assessment.stage_readiness).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Clock size={24} />
                  Stage Readiness Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(assessment.stage_readiness).map(([stage, ready]) => (
                    <div key={stage} className="text-center">
                      <div className={cn(
                        "text-lg font-bold capitalize",
                        ready ? "text-green-600" : "text-red-600"
                      )}>
                        {stage}
                      </div>
                      <Badge variant={ready ? 'default' : 'destructive'}>
                        {ready ? 'Ready' : 'Not Ready'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coaching Actions */}
          {assessment.coaching_actions.length > 0 && (
            <Alert>
              <Lightbulb size={16} />
              <AlertDescription>
                <div className="font-medium mb-2">Priority Coaching Actions:</div>
                <ul className="space-y-1">
                  {assessment.coaching_actions.slice(0, 5).map((action, index) => (
                    <li key={index} className="text-sm">• {action}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Pillar Assessment Cards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assessment Pillars</h2>
            
            {meddpiccData.pillars.map((pillar) => {
              const isExpanded = expandedPillars.has(pillar.id);
              const pillarScore = assessment.pillar_scores[pillar.id] || 0;
              const maxPillarScore = pillar.questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score)), 0);
              const pillarProgress = maxPillarScore > 0 ? (pillarScore / maxPillarScore) * 100 : 0;
              const pillarLevel = getScoreLevel(pillarScore);

              return (
                <Card key={pillar.id}>
                  <Collapsible open={isExpanded} onOpenChange={() => togglePillar(pillar.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                              <CardTitle className="text-lg">{pillar.title}</CardTitle>
                            </div>
                            <Badge className={cn(
                              "text-xs",
                              pillarLevel.level === 'Strong' && "bg-green-100 text-green-800",
                              pillarLevel.level === 'Moderate' && "bg-yellow-100 text-yellow-800",
                              pillarLevel.level === 'Weak' && "bg-red-100 text-red-800"
                            )}>
                              {pillarScore}/{maxPillarScore}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {Math.round(pillarProgress)}%
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground text-left">
                            {pillar.description}
                          </p>
                          <Progress value={pillarProgress} className="w-full" />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <div className="space-y-6">
                          {pillar.questions.map((question) => {
                            const selectedValue = getAnswerValue(pillar.id, question.id);
                            const confidence = getAnswerConfidence(pillar.id, question.id);
                            const notes = getAnswerNotes(pillar.id, question.id);
                            
                            return (
                              <div key={question.id} className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    {question.text}
                                  </Label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {question.tooltip}
                                  </p>
                                </div>
                                
                                <RadioGroup
                                  value={selectedValue}
                                  onValueChange={(value) => handleAnswerChange(pillar.id, question.id, value, confidence, notes)}
                                  className="flex gap-6"
                                >
                                  {question.options.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                      <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                                      <Label 
                                        htmlFor={`${question.id}-${option.value}`}
                                        className="text-sm cursor-pointer"
                                      >
                                        {option.label} ({option.score}pts)
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>

                                {selectedValue && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                                    <div>
                                      <Label className="text-xs font-medium">Confidence Level</Label>
                                      <Select 
                                        value={confidence} 
                                        onValueChange={(value: any) => handleAnswerChange(pillar.id, question.id, selectedValue, value, notes)}
                                      >
                                        <SelectTrigger className="h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="high">High Confidence</SelectItem>
                                          <SelectItem value="medium">Medium Confidence</SelectItem>
                                          <SelectItem value="low">Low Confidence</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium">Evidence Notes</Label>
                                      <Textarea 
                                        placeholder="Add supporting evidence..."
                                        value={notes}
                                        onChange={(e) => handleAnswerChange(pillar.id, question.id, selectedValue, confidence, e.target.value)}
                                        className="h-8 resize-none text-xs"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Competitive Strengths */}
            {assessment.competitive_strengths.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-600">
                    <Star size={24} />
                    Competitive Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessment.competitive_strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Areas of Concern */}
            {assessment.areas_of_concern.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-orange-600">
                    <AlertCircle size={24} />
                    Areas of Concern
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessment.areas_of_concern.map((concern, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <AlertCircle size={16} className="text-orange-600 mt-1 flex-shrink-0" />
                        <span className="text-sm">{concern}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain size={24} />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {insights.length > 0 ? insights.map((insight, index) => (
                    <Alert key={index} className={cn(
                      insight.type === 'risk' && "border-red-200 bg-red-50",
                      insight.type === 'weakness' && "border-orange-200 bg-orange-50",
                      insight.type === 'opportunity' && "border-blue-200 bg-blue-50",
                      insight.type === 'strength' && "border-green-200 bg-green-50"
                    )}>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1 rounded-full",
                          insight.type === 'risk' && "bg-red-100",
                          insight.type === 'weakness' && "bg-orange-100",
                          insight.type === 'opportunity' && "bg-blue-100",
                          insight.type === 'strength' && "bg-green-100"
                        )}>
                          {insight.type === 'risk' && <AlertCircle size={16} className="text-red-600" />}
                          {insight.type === 'weakness' && <TrendingDown size={16} className="text-orange-600" />}
                          {insight.type === 'opportunity' && <TrendingUp size={16} className="text-blue-600" />}
                          {insight.type === 'strength' && <Star size={16} className="text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{insight.description}</span>
                            <Badge variant={
                              insight.priority === 'critical' ? 'destructive' :
                              insight.priority === 'high' ? 'secondary' :
                              'outline'
                            }>
                              {insight.priority}
                            </Badge>
                          </div>
                          <AlertDescription className="text-xs">
                            <strong>Recommendation:</strong> {insight.recommendation}
                          </AlertDescription>
                          <div className="text-xs text-muted-foreground mt-1">
                            <strong>Impact:</strong> {insight.impact}
                          </div>
                        </div>
                      </div>
                    </Alert>
                  )) : (
                    <div className="text-center py-8">
                      <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                      <p className="text-muted-foreground">
                        Complete your MEDDPICC assessment to generate AI-powered insights
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <EnhancedMEDDPICCAnalytics />
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Activity size={24} />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {meddpiccData.pillars.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Pillars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(assessment.pillar_scores).filter(score => score > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {assessment.answers.length}
              </div>
              <div className="text-sm text-muted-foreground">Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((assessment.total_score / meddpiccData.scoring.max_score) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {insights.length}
              </div>
              <div className="text-sm text-muted-foreground">Insights</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}