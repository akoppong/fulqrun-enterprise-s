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
  AlertCircle,
  Star,
  Lightbulb,
  Download,
  Share,
  Brain,
  Shield,
  Clock,
  Users
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  MEDDPICCAssessment, 
  MEDDPICCAnswer,
  MEDDPICCScoringService,
  MEDDPICCInsight
} from '../../services/meddpicc-scoring-service';

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

export function MEDDPICCModule() {
  const [assessment, setAssessment] = useKV<MEDDPICCAssessment>('meddpicc-current-assessment', {
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
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>('');
  const [currentView, setCurrentView] = useState<'assessment' | 'insights' | 'analytics'>('assessment');
  const [insights, setInsights] = useState<MEDDPICCInsight[]>([]);

  // Calculate enhanced scores when answers change
  useEffect(() => {
    const enhancedAssessment = MEDDPICCScoringService.calculateAdvancedScoring(assessment);
    const generatedInsights = MEDDPICCScoringService.generateInsights(enhancedAssessment);
    
    setAssessment(enhancedAssessment);
    setInsights(generatedInsights);
  }, [assessment.answers]);

  const handleAnswerChange = (pillar: string, questionId: string, value: string, confidenceLevel: 'low' | 'medium' | 'high' = 'medium', notes?: string) => {
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

  const generateCoachingPrompts = (): string[] => {
    try {
      const prompts: string[] = [];
      
      // Ensure we have valid data
      if (!meddpiccData?.pillars || !Array.isArray(meddpiccData.pillars)) {
        return ['Unable to generate coaching prompts: Invalid MEDDPICC data'];
      }
      
      // Check each pillar's completion status
      meddpiccData.pillars.forEach(pillar => {
        try {
          const pillarScore = assessment?.pillar_scores?.[pillar.id] || 0;
          const pillarQuestions = pillar?.questions?.length || 0;
          const pillarAnswers = assessment?.answers?.filter(a => a.pillar === pillar.id) || [];
          
          // If pillar has low score or no answers, generate coaching prompts
          if (pillarScore === 0 || pillarAnswers.length === 0) {
            // Find relevant coaching prompts for this pillar
            const relevantPrompts = meddpiccData?.coaching_prompts?.filter(cp => 
              cp?.condition?.pillar === pillar.id && cp?.condition?.value === 'no'
            ) || [];
            
            relevantPrompts.forEach(cp => {
              if (cp?.prompt) {
                prompts.push(`${pillar.title}: ${cp.prompt}`);
              }
            });
          }
          
          // Add pillar-specific coaching based on score level
          const maxPossibleScore = pillar?.questions?.reduce((sum, q) => {
            const maxQuestionScore = Math.max(...(q?.options?.map(o => o?.score || 0) || [0]));
            return sum + maxQuestionScore;
          }, 0) || 0;
          
          const completionPercentage = maxPossibleScore > 0 ? (pillarScore / maxPossibleScore) * 100 : 0;
          
          if (completionPercentage < 50) {
            switch (pillar.id) {
              case 'metrics':
                prompts.push(`Metrics: Schedule a metrics discovery session to understand quantifiable business impact`);
                break;
              case 'economic_buyer':
                prompts.push(`Economic Buyer: Identify and secure access to the person with budget authority`);
                break;
              case 'decision_criteria':
                prompts.push(`Decision Criteria: Understand the formal evaluation process and requirements`);
                break;
              case 'decision_process':
                prompts.push(`Decision Process: Map out the complete decision-making workflow`);
                break;
              case 'paper_process':
                prompts.push(`Paper Process: Understand procurement and legal requirements early`);
                break;
              case 'implicate_the_pain':
                prompts.push(`Implicate Pain: Quantify the cost of the current problem and urgency to solve`);
                break;
              case 'champion':
                prompts.push(`Champion: Develop and empower internal advocates who can sell for you`);
                break;
              case 'competition':
                prompts.push(`Competition: Research competitive landscape and develop differentiation strategy`);
                break;
              default:
                prompts.push(`${pillar.title}: Focus on improving qualification in this area`);
            }
          }
        } catch (pillarError) {
          console.warn(`Error processing pillar ${pillar?.id}:`, pillarError);
          prompts.push(`${pillar?.title || 'Unknown'}: Unable to generate specific coaching`);
        }
      });
      
      // If no specific prompts generated, provide general guidance
      if (prompts.length === 0) {
        prompts.push('Continue to strengthen all MEDDPICC criteria for optimal deal qualification');
      }
      
      return prompts;
    } catch (error) {
      console.error('Error generating coaching prompts:', error);
      return ['Unable to generate coaching prompts. Please review your MEDDPICC assessment.'];
    }
  };

  const exportAssessment = () => {
    const exportData = {
      assessment,
      timestamp: new Date(),
      score_level: getScoreLevel(assessment.total_score),
      coaching_prompts: generateCoachingPrompts()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meddpicc-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Assessment exported successfully');
  };

  const shareAssessment = () => {
    const summary = `MEDDPICC Assessment Summary
Total Score: ${assessment.total_score}/${meddpiccData.scoring.max_score} (${getScoreLevel(assessment.total_score).level})

Pillar Scores:
${meddpiccData.pillars.map(pillar => 
  `${pillar.title}: ${assessment.pillar_scores[pillar.id] || 0}`
).join('\n')}

Coaching Recommendations:
${generateCoachingPrompts().join('\n')}
`;

    navigator.clipboard.writeText(summary).then(() => {
      toast.success('Assessment summary copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const getAnswerValue = (pillar: string, questionId: string): string => {
    const answer = assessment.answers.find(a => a.pillar === pillar && a.question_id === questionId);
    return answer?.answer_value || '';
  };

  const overallScoreLevel = getScoreLevel(assessment.total_score);
  const coachingPrompts = generateCoachingPrompts();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckCircle size={32} className="text-primary" />
            MEDDPICC Module
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete B2B qualification assessment using the MEDDPICC methodology
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

      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target size={24} />
            Deal Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
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
            </div>
            <div className="col-span-1 md:col-span-2">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round((assessment.total_score / meddpiccData.scoring.max_score) * 100)}%</span>
                  </div>
                  <Progress value={(assessment.total_score / meddpiccData.scoring.max_score) * 100} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                  <div>Weak: 0-{meddpiccData.scoring.thresholds.weak.max}</div>
                  <div>Moderate: {meddpiccData.scoring.thresholds.moderate.min}-{meddpiccData.scoring.thresholds.moderate.max}</div>
                  <div>Strong: {meddpiccData.scoring.thresholds.strong.min}+</div>
                  <div>Max: {meddpiccData.scoring.max_score}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coaching Prompts */}
      {coachingPrompts.length > 0 && (
        <Alert>
          <Lightbulb size={16} />
          <AlertDescription>
            <div className="font-medium mb-2">Coaching Recommendations:</div>
            <ul className="space-y-1">
              {coachingPrompts.map((prompt, index) => (
                <li key={index} className="text-sm">• {prompt}</li>
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
                        
                        return (
                          <div key={question.id} className="space-y-3">
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
                              onValueChange={(value) => handleAnswerChange(pillar.id, question.id, value)}
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

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp size={24} />
            Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}