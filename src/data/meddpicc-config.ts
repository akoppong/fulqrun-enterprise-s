/**
 * MEDDPICC Configuration Data
 * Complete question sets and scoring logic for B2B sales qualification
 */

import { MEDDPICCConfiguration } from '../services/meddpicc-service';

export const MEDDPICC_CONFIG: MEDDPICCConfiguration = {
  version: "1.0.0",
  last_updated: new Date(),
  pillars: [
    {
      id: "metrics",
      title: "Metrics", 
      description: "Questions related to Metrics",
      primer: "Understanding the measurable business impact and quantifiable outcomes that drive the customer's decision-making process.",
      maxScore: 40,
      questions: [
        {
          id: "q_1_2",
          text: "No customer metric identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0"
        },
        {
          id: "q_1_3", 
          text: "Assumption of the Metrics based on outside information or initial conversations.",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10"
        },
        {
          id: "q_1_4",
          text: "Reasonably good understanding of the Metrics based on conversations",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20"
        },
        {
          id: "q_1_5",
          text: "We strongly understand the Metrics driving the project",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30"
        },
        {
          id: "q_1_6",
          text: "We have influenced the metrics",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40"
        }
      ]
    },
    {
      id: "economic_buyer",
      title: "Economic Buyer",
      description: "Questions related to Economic Buyer",
      primer: "Identifying and engaging with the person who has the ultimate budget authority and decision-making power for this purchase.",
      maxScore: 40,
      questions: [
        {
          id: "q_11_3",
          text: "No economic buyer is identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0"
        },
        {
          id: "q_11_4",
          text: "We have an assumption of who the Economic Buyer",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10"
        },
        {
          id: "q_11_5",
          text: "We have confirmation of the Economic Buyer is from our Champion/Coach",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20"
        },
        {
          id: "q_11_6",
          text: "The EB  are aware of our organization and our core value propositions.",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30"
        },
        {
          id: "q_11_7",
          text: "We have had direct engagement with the Economic Buyer",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40"
        }
      ]
    },
    {
      id: "competition",
      title: "Competition",
      description: "Questions related to Competition",
      primer: "Identifying all competitors (direct, indirect, status quo) and understanding how you're positioned against them.",
      maxScore: 40,
      questions: [
        {
          id: "q_1_2",
          text: "No customer metric identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0"
        },
        {
          id: "q_1_3",
          text: "Assumption of the Metrics based on outside information or initial conversations.",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10"
        },
        {
          id: "q_1_4",
          text: "Reasonably good understanding of the Metrics based on conversations",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20"
        },
        {
          id: "q_1_5",
          text: "We strongly understand the Metrics driving the project",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30"
        },
        {
          id: "q_1_6",
          text: "We have influenced the metrics",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40"
        }
      ]
    },
    {
      id: "decision_criteria",
      title: "Decision Criteria",
      description: "Questions related to Decision Criteria",
      primer: "Understanding both the formal RFP criteria and informal decision factors that will influence the final choice.",
      maxScore: 40,
      questions: [
        {
          id: "q_11_3",
          text: "No economic buyer is identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0"
        },
        {
          id: "q_11_4",
          text: "We have an assumption of who the Economic Buyer",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10"
        },
        {
          id: "q_11_5",
          text: "We have confirmation of the Economic Buyer is from our Champion/Coach",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20"
        },
        {
          id: "q_11_6",
          text: "The EB  are aware of our organization and our core value propositions.",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30"
        },
        {
          id: "q_11_7",
          text: "We have had direct engagement with the Economic Buyer",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40"
        }
      ]
    },
    {
      id: "champion",
      title: "Champion",
      description: "Questions related to Champion",
      primer: "Identifying and developing a strong internal champion who will advocate for your solution throughout the decision process.",
      maxScore: 40,
      questions: [
        {
          id: "q_1_2",
          text: "No customer metric identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0"
        },
        {
          id: "q_1_3",
          text: "Assumption of the Metrics based on outside information or initial conversations.",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10"
        },
        {
          id: "q_1_4",
          text: "Reasonably good understanding of the Metrics based on conversations",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20"
        },
        {
          id: "q_1_5",
          text: "We strongly understand the Metrics driving the project",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30"
        },
        {
          id: "q_1_6",
          text: "We have influenced the metrics",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40"
        }
      ]
    },
    {
      id: "implicate_the_pain",
      title: "Implicate The Pain",
      description: "Questions related to Implicate The Pain",
      primer: "Identifying and quantifying the business pain, urgency, and consequences of not solving the problem.",
      maxScore: 40,
      questions: []
    },
    {
      id: "decision_process",
      title: "Decision Process",
      description: "Questions related to Decision Process",
      primer: "Understanding the step-by-step process, timeline, and stakeholders involved in making the final decision.",
      maxScore: 40,
      questions: []
    },
    {
      id: "paper_process",
      title: "Paper Process",
      description: "Questions related to Paper Process",
      primer: "Understanding the procurement process, legal requirements, contract terms, and administrative steps needed to complete the deal.",
      maxScore: 40,
      questions: []
    }
  ],
  scoring: {
    max_score: 40,
    thresholds: {
      strong: {
        min: 32,
        label: "Strong",
        color: "#10b981",
        description: "Deal is well-qualified with high probability of success"
      },
      moderate: {
        min: 24,
        max: 31,
        label: "Moderate",
        color: "#f59e0b",
        description: "Deal has potential but requires attention to gaps"
      },
      weak: {
        max: 23,
        label: "Weak",
        color: "#ef4444",
        description: "Deal has significant gaps that need immediate attention"
      }
    }
  },
  coaching_prompts: [
    {
      id: "eb_no_contact",
      pillar: "economic_buyer",
      condition: { pillar: "economic_buyer", value: "no" },
      prompt: "Identify Economic Buyer; request introduction via Champion this week",
      priority: "high",
      action_items: [
        "Ask Champion to identify Economic Buyer",
        "Request introduction meeting",
        "Prepare EB-specific value proposition"
      ]
    },
    {
      id: "pain_not_quantified",
      pillar: "implicate_the_pain",
      condition: { pillar: "implicate_the_pain", value: "no" },
      prompt: "Run a 30-min ROI workshop; attach cost-of-inaction calc to notes.",
      priority: "high",
      action_items: [
        "Schedule ROI discovery workshop",
        "Prepare cost-of-inaction calculator", 
        "Document quantified business impact"
      ]
    },
    {
      id: "no_champion",
      pillar: "champion",
      condition: { pillar: "champion", value: "no" },
      prompt: "Identify and develop internal champion who can provide insider information",
      priority: "high",
      action_items: [
        "Map stakeholder relationships",
        "Identify potential champions",
        "Begin champion development strategy"
      ]
    },
    {
      id: "weak_metrics",
      pillar: "metrics",
      condition: { pillar: "metrics", value: "partial" },
      prompt: "Conduct deeper discovery to understand and quantify business metrics",
      priority: "medium",
      action_items: [
        "Schedule metrics discovery session",
        "Prepare business case template",
        "Validate assumptions with stakeholders"
      ]
    },
    {
      id: "unknown_competition",
      pillar: "competition",
      condition: { pillar: "competition", value: "no" },
      prompt: "Research competitive landscape and develop differentiation strategy",
      priority: "medium",
      action_items: [
        "Conduct competitive analysis",
        "Identify key differentiators",
        "Prepare competitive positioning"
      ]
    },
    {
      id: "unclear_criteria",
      pillar: "decision_criteria",
      condition: { pillar: "decision_criteria", value: "partial" },
      prompt: "Clarify both formal and informal decision criteria with stakeholders",
      priority: "medium",
      action_items: [
        "Review formal RFP criteria",
        "Discover informal decision factors",
        "Align solution to criteria"
      ]
    }
  ]
};

// Helper functions for MEDDPICC scoring
export const calculatePillarScore = (pillar: string, answers: Record<string, any>): number => {
  const pillarConfig = MEDDPICC_CONFIG.pillars.find(p => p.id === pillar);
  if (!pillarConfig) return 0;

  const scores = pillarConfig.questions.map(question => {
    const answer = answers[question.id];
    if (!answer) return 0;
    
    const option = question.options.find(opt => opt.value === answer);
    return option ? option.score : 0;
  });

  // Return the highest score from all questions (user picks the best applicable level)
  return Math.max(...scores, 0);
};

export const calculateTotalScore = (answers: Record<string, any>): number => {
  return MEDDPICC_CONFIG.pillars.reduce((total, pillar) => {
    return total + calculatePillarScore(pillar.id, answers);
  }, 0);
};

export const getScoreLevel = (score: number): 'strong' | 'moderate' | 'weak' => {
  const { thresholds } = MEDDPICC_CONFIG.scoring;
  
  if (score >= thresholds.strong.min!) return 'strong';
  if (score >= thresholds.moderate.min!) return 'moderate';
  return 'weak';
};

export const getCoachingPrompts = (answers: Record<string, any>): any[] => {
  return MEDDPICC_CONFIG.coaching_prompts.filter(prompt => {
    // Check if any question for this pillar has the condition value
    const pillarQuestions = MEDDPICC_CONFIG.pillars
      .find(p => p.id === prompt.pillar)?.questions || [];
    
    // If no answers for this pillar, show the prompt
    const hasAnswers = pillarQuestions.some(q => answers[q.id]);
    if (!hasAnswers) return true;
    
    // Check if condition matches any answer
    return pillarQuestions.some(q => answers[q.id] === prompt.condition.value);
  });
};