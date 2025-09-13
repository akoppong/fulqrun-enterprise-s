/**
 * MEDDPICC Configuration Data
 * Complete question sets and scoring logic for B2B sales qualification
 */

import { MEDDPICCConfiguration } from '../types/meddpicc';

export const MEDDPICC_CONFIG: MEDDPICCConfiguration = {
  version: "1.0.0",
  last_updated: new Date(),
  pillars: [
    {
      id: "metrics",
      title: "Metrics",
      description: "Economic impact and quantifiable business value",
      primer: "Understanding the measurable business impact and quantifiable outcomes that drive the customer's decision-making process.",
      maxScore: 40,
      questions: [
        {
          id: "q_metrics_1",
          text: "No customer metric identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - This indicates no metrics baseline"
        },
        {
          id: "q_metrics_2",
          text: "Assumption of the Metrics based on outside information or initial conversations",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic understanding from external sources"
        },
        {
          id: "q_metrics_3",
          text: "Reasonably good understanding of the Metrics based on conversations",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Good grasp through direct conversations"
        },
        {
          id: "q_metrics_4",
          text: "We strongly understand the Metrics driving the project",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Deep understanding of key metrics"
        },
        {
          id: "q_metrics_5",
          text: "We have influenced the metrics",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Highest level: influenced metric definition"
        }
      ]
    },
    {
      id: "economic_buyer",
      title: "Economic Buyer",
      description: "The person with budget authority and final decision power",
      primer: "Identifying and engaging with the person who has the ultimate budget authority and decision-making power for this purchase.",
      maxScore: 40,
      questions: [
        {
          id: "q_eb_1",
          text: "No economic buyer is identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No EB identified yet"
        },
        {
          id: "q_eb_2",
          text: "We have an assumption of who the Economic Buyer is",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic assumption about EB identity"
        },
        {
          id: "q_eb_3",
          text: "We have confirmation of the Economic Buyer from our Champion/Coach",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - EB confirmed by internal champion"
        },
        {
          id: "q_eb_4",
          text: "The EB is aware of our organization and our core value propositions",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - EB knows our value proposition"
        },
        {
          id: "q_eb_5",
          text: "We have had direct engagement with the Economic Buyer",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Direct EB engagement achieved"
        }
      ]
    },
    {
      id: "decision_criteria",
      title: "Decision Criteria",
      description: "The formal and informal criteria used to make the decision",
      primer: "Understanding both the formal RFP criteria and informal decision factors that will influence the final choice.",
      maxScore: 40,
      questions: [
        {
          id: "q_dc_1",
          text: "No decision criteria identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No criteria identified"
        },
        {
          id: "q_dc_2",
          text: "Basic understanding of decision criteria from public sources",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic criteria from RFP/public info"
        },
        {
          id: "q_dc_3",
          text: "Good understanding of decision criteria from stakeholder conversations",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Criteria confirmed through conversations"
        },
        {
          id: "q_dc_4",
          text: "We understand both formal and informal decision criteria",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Formal and informal criteria understood"
        },
        {
          id: "q_dc_5",
          text: "We have influenced the decision criteria in our favor",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Successfully influenced criteria"
        }
      ]
    },
    {
      id: "decision_process",
      title: "Decision Process",
      description: "The formal process and timeline for making the decision",
      primer: "Understanding the step-by-step process, timeline, and stakeholders involved in making the final decision.",
      maxScore: 40,
      questions: [
        {
          id: "q_dp_1",
          text: "No decision process identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No process understanding"
        },
        {
          id: "q_dp_2",
          text: "Basic assumptions about the decision process",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic process assumptions"
        },
        {
          id: "q_dp_3",
          text: "Good understanding of decision process from stakeholders",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Process confirmed by stakeholders"
        },
        {
          id: "q_dp_4",
          text: "We understand timeline, steps, and all stakeholders involved",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Complete process understanding"
        },
        {
          id: "q_dp_5",
          text: "We have influenced or optimized the decision process",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Successfully influenced process"
        }
      ]
    },
    {
      id: "paper_process",
      title: "Paper Process",
      description: "The procurement, legal, and administrative requirements",
      primer: "Understanding the procurement process, legal requirements, contract terms, and administrative steps needed to complete the deal.",
      maxScore: 40,
      questions: [
        {
          id: "q_pp_1",
          text: "No paper process identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No paper process understanding"
        },
        {
          id: "q_pp_2",
          text: "Basic understanding of procurement requirements",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic procurement understanding"
        },
        {
          id: "q_pp_3",
          text: "Good understanding of legal, procurement, and approval requirements",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Good process understanding"
        },
        {
          id: "q_pp_4",
          text: "We understand timeline and have contacts in procurement/legal",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Timeline and contacts established"
        },
        {
          id: "q_pp_5",
          text: "We have pre-qualified terms and accelerated the paper process",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Optimized paper process"
        }
      ]
    },
    {
      id: "implicate_the_pain",
      title: "Implicate the Pain",
      description: "Understanding and quantifying the cost of inaction",
      primer: "Identifying and quantifying the business pain, urgency, and consequences of not solving the problem.",
      maxScore: 40,
      questions: [
        {
          id: "q_ip_1",
          text: "No pain or business impact identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No pain identified"
        },
        {
          id: "q_ip_2",
          text: "Basic understanding of business challenges",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic pain understanding"
        },
        {
          id: "q_ip_3",
          text: "Good understanding of pain and some quantification",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Pain understood and partially quantified"
        },
        {
          id: "q_ip_4",
          text: "Strong understanding of pain with cost of inaction quantified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Pain quantified with cost of inaction"
        },
        {
          id: "q_ip_5",
          text: "Customer actively articulates urgency and cost of delay",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Customer urgency established"
        }
      ]
    },
    {
      id: "champion",
      title: "Champion",
      description: "Internal advocate who sells for you when you're not there",
      primer: "Identifying and developing a strong internal champion who will advocate for your solution throughout the decision process.",
      maxScore: 40,
      questions: [
        {
          id: "q_ch_1",
          text: "No champion identified",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No champion identified"
        },
        {
          id: "q_ch_2",
          text: "Potential champion identified but relationship not developed",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Champion identified but not developed"
        },
        {
          id: "q_ch_3",
          text: "Champion relationship developing, provides some insider information",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Champion provides information"
        },
        {
          id: "q_ch_4",
          text: "Strong champion who actively advocates and coaches us",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Strong champion advocate"
        },
        {
          id: "q_ch_5",
          text: "Champion has influence with EB and actively sells for us",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Champion with EB influence"
        }
      ]
    },
    {
      id: "competition",
      title: "Competition",
      description: "Understanding competitive landscape and positioning",
      primer: "Identifying all competitors (direct, indirect, status quo) and understanding how you're positioned against them.",
      maxScore: 40,
      questions: [
        {
          id: "q_co_1",
          text: "No competition identified or understood",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 0 },
            { label: "Yes", value: "yes", score: 0 }
          ],
          tooltip: "Expected score: 0 - No competition analysis"
        },
        {
          id: "q_co_2",
          text: "Basic awareness of potential competitors",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 5 },
            { label: "Yes", value: "yes", score: 10 }
          ],
          tooltip: "Expected score: 10 - Basic competitive awareness"
        },
        {
          id: "q_co_3",
          text: "Good understanding of competitive landscape and positioning",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 10 },
            { label: "Yes", value: "yes", score: 20 }
          ],
          tooltip: "Expected score: 20 - Good competitive understanding"
        },
        {
          id: "q_co_4",
          text: "Strong competitive intelligence and differentiation strategy",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 15 },
            { label: "Yes", value: "yes", score: 30 }
          ],
          tooltip: "Expected score: 30 - Strong competitive strategy"
        },
        {
          id: "q_co_5",
          text: "We have competitive advantage and customer acknowledges our superiority",
          type: "single-select",
          options: [
            { label: "No", value: "no", score: 0 },
            { label: "Partial", value: "partial", score: 20 },
            { label: "Yes", value: "yes", score: 40 }
          ],
          tooltip: "Expected score: 40 - Acknowledged competitive advantage"
        }
      ]
    }
  ],
  scoring: {
    max_score: 320, // 8 pillars × 40 max score each
    thresholds: {
      strong: {
        min: 256, // 80% of max (32/40 average per pillar)
        label: "Strong",
        color: "#10b981",
        description: "Deal is well-qualified with high probability of success"
      },
      moderate: {
        min: 192, // 60% of max (24/40 average per pillar)
        max: 255,
        label: "Moderate",
        color: "#f59e0b",
        description: "Deal has potential but requires attention to gaps"
      },
      weak: {
        max: 191, // Below 60%
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
      prompt: "Run a 30-min ROI workshop; attach cost-of-inaction calculation to notes",
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
    const pillarAnswers = Object.entries(answers).filter(([key]) => 
      key.startsWith(`q_${prompt.pillar.substring(0, 2)}`)
    );
    
    // If no answers for this pillar, show the prompt
    if (pillarAnswers.length === 0) return true;
    
    // Check if condition matches
    return pillarAnswers.some(([_, value]) => value === prompt.condition.value);
  });
};