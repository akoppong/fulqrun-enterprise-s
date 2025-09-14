import { useKV } from '@github/spark/hooks';

export interface MEDDPICCAnswer {
  pillar: string;
  question_id: string;
  answer_value: string;
  score: number;
  timestamp: Date;
  confidence_level: 'low' | 'medium' | 'high';
  evidence_notes?: string;
}

export interface MEDDPICCAssessment {
  id: string;
  opportunity_id: string;
  answers: MEDDPICCAnswer[];
  pillar_scores: Record<string, number>;
  total_score: number;
  confidence_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  stage_readiness: Record<string, boolean>;
  coaching_actions: string[];
  competitive_strengths: string[];
  areas_of_concern: string[];
  last_updated: Date;
  created_by: string;
  version: number;
}

export interface MEDDPICCTrend {
  date: Date;
  total_score: number;
  pillar_scores: Record<string, number>;
  stage: string;
  probability: number;
}

export interface MEDDPICCBenchmark {
  stage: string;
  industry: string;
  deal_size_range: string;
  average_scores: Record<string, number>;
  success_thresholds: Record<string, number>;
  typical_weaknesses: string[];
}

export interface MEDDPICCInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'risk';
  pillar: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
}

export class MEDDPICCScoringService {
  private static ASSESSMENTS_KEY = "meddpicc-assessments";
  private static TRENDS_KEY = "meddpicc-trends";
  private static BENCHMARKS_KEY = "meddpicc-benchmarks";

  // Enhanced scoring weights for different sales scenarios
  private static PILLAR_WEIGHTS = {
    metrics: 1.2, // Higher weight for quantified business impact
    economic_buyer: 1.3, // Critical for deal closure
    decision_criteria: 1.1,
    decision_process: 1.0,
    paper_process: 0.9,
    implicate_the_pain: 1.2, // High weight for urgency
    champion: 1.1,
    competition: 1.0
  };

  // Stage readiness requirements
  private static STAGE_REQUIREMENTS = {
    'prospect': { min_score: 80, required_pillars: ['implicate_the_pain', 'metrics'] },
    'engage': { min_score: 160, required_pillars: ['champion', 'economic_buyer', 'implicate_the_pain'] },
    'acquire': { min_score: 240, required_pillars: ['decision_criteria', 'decision_process', 'paper_process'] },
    'keep': { min_score: 280, required_pillars: ['metrics', 'champion'] }
  };

  static calculateAdvancedScoring(assessment: Partial<MEDDPICCAssessment>): MEDDPICCAssessment {
    const answers = assessment.answers || [];
    const pillarScores: Record<string, number> = {};
    let totalScore = 0;
    let confidenceScore = 0;

    // Calculate pillar scores with weights
    Object.keys(this.PILLAR_WEIGHTS).forEach(pillar => {
      const pillarAnswers = answers.filter(a => a.pillar === pillar);
      let pillarRawScore = pillarAnswers.reduce((sum, answer) => sum + answer.score, 0);
      let pillarConfidence = pillarAnswers.reduce((sum, answer) => {
        const confWeight = answer.confidence_level === 'high' ? 1.0 : 
                          answer.confidence_level === 'medium' ? 0.8 : 0.6;
        return sum + confWeight;
      }, 0) / Math.max(pillarAnswers.length, 1);

      // Apply pillar weight
      const weightedScore = pillarRawScore * this.PILLAR_WEIGHTS[pillar as keyof typeof this.PILLAR_WEIGHTS];
      pillarScores[pillar] = Math.round(weightedScore);
      totalScore += weightedScore;
      confidenceScore += pillarConfidence;
    });

    confidenceScore = confidenceScore / Object.keys(this.PILLAR_WEIGHTS).length;

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(pillarScores, totalScore, confidenceScore);

    // Calculate stage readiness
    const stageReadiness = this.calculateStageReadiness(pillarScores, totalScore);

    // Generate coaching actions
    const coachingActions = this.generateCoachingActions(pillarScores, answers);

    // Identify competitive strengths and concerns
    const { competitiveStrengths, areasOfConcern } = this.analyzeCompetitivePosition(pillarScores, answers);

    return {
      id: assessment.id || Date.now().toString(),
      opportunity_id: assessment.opportunity_id || '',
      answers,
      pillar_scores: pillarScores,
      total_score: Math.round(totalScore),
      confidence_score: Math.round(confidenceScore * 100),
      risk_level: riskLevel,
      stage_readiness: stageReadiness,
      coaching_actions: coachingActions,
      competitive_strengths: competitiveStrengths,
      areas_of_concern: areasOfConcern,
      last_updated: new Date(),
      created_by: assessment.created_by || 'current-user',
      version: (assessment.version || 0) + 1
    };
  }

  private static calculateRiskLevel(
    pillarScores: Record<string, number>, 
    totalScore: number, 
    confidenceScore: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const criticalPillars = ['economic_buyer', 'champion', 'implicate_the_pain'];
    const criticalScore = criticalPillars.reduce((sum, pillar) => sum + (pillarScores[pillar] || 0), 0);
    const maxCriticalScore = criticalPillars.length * 40; // Assuming max 40 per pillar

    if (totalScore < 100 || criticalScore / maxCriticalScore < 0.3 || confidenceScore < 50) {
      return 'critical';
    } else if (totalScore < 180 || criticalScore / maxCriticalScore < 0.5 || confidenceScore < 65) {
      return 'high';
    } else if (totalScore < 240 || criticalScore / maxCriticalScore < 0.7 || confidenceScore < 80) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private static calculateStageReadiness(
    pillarScores: Record<string, number>, 
    totalScore: number
  ): Record<string, boolean> {
    const readiness: Record<string, boolean> = {};

    Object.entries(this.STAGE_REQUIREMENTS).forEach(([stage, requirements]) => {
      const meetsScoreThreshold = totalScore >= requirements.min_score;
      const hasRequiredPillars = requirements.required_pillars.every(pillar => 
        (pillarScores[pillar] || 0) >= 20 // Minimum threshold per pillar
      );
      
      readiness[stage] = meetsScoreThreshold && hasRequiredPillars;
    });

    return readiness;
  }

  private static generateCoachingActions(
    pillarScores: Record<string, number>,
    answers: MEDDPICCAnswer[]
  ): string[] {
    const actions: string[] = [];
    const maxPillarScore = 40; // Assuming max score per pillar

    // Check each pillar for coaching opportunities
    Object.entries(pillarScores).forEach(([pillar, score]) => {
      const pillarPercentage = score / maxPillarScore;
      
      if (pillarPercentage < 0.3) {
        actions.push(...this.getCriticalActions(pillar));
      } else if (pillarPercentage < 0.6) {
        actions.push(...this.getImprovementActions(pillar));
      }
    });

    // Check for low confidence answers
    const lowConfidenceAnswers = answers.filter(a => a.confidence_level === 'low');
    if (lowConfidenceAnswers.length > 3) {
      actions.push('Schedule discovery sessions to validate assumptions and increase confidence');
    }

    return actions.slice(0, 5); // Return top 5 priority actions
  }

  private static getCriticalActions(pillar: string): string[] {
    const actionMap: Record<string, string[]> = {
      'metrics': [
        'Schedule business case development session with economic buyer',
        'Request access to current performance metrics and KPIs',
        'Prepare ROI calculator with finance team'
      ],
      'economic_buyer': [
        'Identify and map all budget decision makers',
        'Request champion to facilitate economic buyer introduction',
        'Prepare executive summary for C-level presentation'
      ],
      'champion': [
        'Identify potential internal advocates in each department',
        'Schedule relationship building meetings with influencers',
        'Develop champion enablement materials and talking points'
      ],
      'implicate_the_pain': [
        'Conduct cost of inaction analysis workshop',
        'Document business impact of current state problems',
        'Quantify opportunity cost with stakeholders'
      ],
      'decision_criteria': [
        'Request formal evaluation criteria and requirements',
        'Understand technical and business evaluation process',
        'Align solution positioning with stated criteria'
      ],
      'decision_process': [
        'Map complete decision-making committee and timeline',
        'Understand approval workflows and sign-off requirements',
        'Schedule meetings with all decision stakeholders'
      ],
      'paper_process': [
        'Connect with procurement and legal teams early',
        'Review contracting requirements and potential blockers',
        'Prepare necessary compliance and security documentation'
      ],
      'competition': [
        'Conduct comprehensive competitive landscape analysis',
        'Develop differentiation strategy and proof points',
        'Prepare competitive battle cards for sales team'
      ]
    };

    return actionMap[pillar] || [`Address critical gaps in ${pillar} pillar`];
  }

  private static getImprovementActions(pillar: string): string[] {
    const actionMap: Record<string, string[]> = {
      'metrics': [
        'Validate business case assumptions with stakeholders',
        'Refine ROI calculations with more precise data'
      ],
      'economic_buyer': [
        'Strengthen relationship with economic buyer',
        'Present tailored value proposition to budget holder'
      ],
      'champion': [
        'Enhance champion enablement and support',
        'Expand champion network within organization'
      ],
      'implicate_the_pain': [
        'Strengthen urgency messaging with additional stakeholders',
        'Gather more compelling pain point evidence'
      ],
      'decision_criteria': [
        'Influence evaluation criteria in our favor',
        'Provide additional proof points for key requirements'
      ],
      'decision_process': [
        'Optimize engagement strategy for decision timeline',
        'Ensure all stakeholders are properly engaged'
      ],
      'paper_process': [
        'Accelerate procurement discussions',
        'Address any outstanding legal or compliance issues'
      ],
      'competition': [
        'Reinforce competitive advantages with new proof points',
        'Address any emerging competitive threats'
      ]
    };

    return actionMap[pillar] || [`Strengthen ${pillar} pillar positioning`];
  }

  private static analyzeCompetitivePosition(
    pillarScores: Record<string, number>,
    answers: MEDDPICCAnswer[]
  ): { competitiveStrengths: string[]; areasOfConcern: string[] } {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const maxPillarScore = 40;

    Object.entries(pillarScores).forEach(([pillar, score]) => {
      const percentage = score / maxPillarScore;
      
      if (percentage >= 0.8) {
        strengths.push(this.getStrengthMessage(pillar, percentage));
      } else if (percentage < 0.4) {
        concerns.push(this.getConcernMessage(pillar, percentage));
      }
    });

    // Analyze confidence patterns
    const lowConfidencePillars = answers
      .filter(a => a.confidence_level === 'low')
      .map(a => a.pillar);
    
    if (lowConfidencePillars.length > 0) {
      concerns.push(`Low confidence in: ${[...new Set(lowConfidencePillars)].join(', ')}`);
    }

    return { competitiveStrengths: strengths, areasOfConcern: concerns };
  }

  private static getStrengthMessage(pillar: string, percentage: number): string {
    const strengthMap: Record<string, string> = {
      'metrics': 'Strong business case with quantified ROI',
      'economic_buyer': 'Excellent access to decision makers',
      'champion': 'Powerful internal advocacy network',
      'implicate_the_pain': 'Clear urgency and compelling event',
      'decision_criteria': 'Strong alignment with evaluation criteria',
      'decision_process': 'Well-mapped decision process',
      'paper_process': 'Smooth procurement and legal path',
      'competition': 'Clear competitive differentiation'
    };

    return strengthMap[pillar] || `Strong ${pillar} positioning`;
  }

  private static getConcernMessage(pillar: string, percentage: number): string {
    const concernMap: Record<string, string> = {
      'metrics': 'Weak business case - needs quantification',
      'economic_buyer': 'Limited access to budget decision makers',
      'champion': 'Insufficient internal support network',
      'implicate_the_pain': 'Low urgency - no compelling event',
      'decision_criteria': 'Poor fit with evaluation requirements',
      'decision_process': 'Unclear decision-making process',
      'paper_process': 'Potential procurement/legal obstacles',
      'competition': 'Weak competitive position'
    };

    return concernMap[pillar] || `Concerns in ${pillar} area`;
  }

  static generateInsights(assessment: MEDDPICCAssessment): MEDDPICCInsight[] {
    const insights: MEDDPICCInsight[] = [];

    // Analyze pillar performance
    Object.entries(assessment.pillar_scores).forEach(([pillar, score]) => {
      const maxScore = 40;
      const percentage = score / maxScore;

      if (percentage >= 0.8) {
        insights.push({
          type: 'strength',
          pillar,
          description: `Excellent ${pillar} qualification`,
          recommendation: `Leverage strong ${pillar} position in proposal`,
          priority: 'medium',
          impact: 'Competitive advantage in this area'
        });
      } else if (percentage < 0.3) {
        insights.push({
          type: 'risk',
          pillar,
          description: `Critical gap in ${pillar}`,
          recommendation: this.getCriticalActions(pillar)[0],
          priority: 'critical',
          impact: 'Deal at risk without immediate action'
        });
      }
    });

    // Overall assessment insights
    if (assessment.risk_level === 'critical') {
      insights.push({
        type: 'risk',
        pillar: 'overall',
        description: 'Deal at critical risk',
        recommendation: 'Immediate intervention required across multiple pillars',
        priority: 'critical',
        impact: 'High probability of deal loss'
      });
    }

    if (assessment.confidence_score < 60) {
      insights.push({
        type: 'weakness',
        pillar: 'confidence',
        description: 'Low confidence in assessment data',
        recommendation: 'Conduct validation sessions to verify assumptions',
        priority: 'high',
        impact: 'Forecasting accuracy at risk'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static trackTrend(assessment: MEDDPICCAssessment, stage: string, probability: number): MEDDPICCTrend {
    return {
      date: new Date(),
      total_score: assessment.total_score,
      pillar_scores: assessment.pillar_scores,
      stage,
      probability
    };
  }

  static generateBenchmarkComparison(
    assessment: MEDDPICCAssessment,
    industry: string,
    dealSize: string
  ): { vs_benchmark: Record<string, number>; recommendations: string[] } {
    // This would typically pull from a database of industry benchmarks
    const mockBenchmarks: Record<string, number> = {
      'metrics': 32,
      'economic_buyer': 28,
      'decision_criteria': 30,
      'decision_process': 26,
      'paper_process': 24,
      'implicate_the_pain': 35,
      'champion': 30,
      'competition': 28
    };

    const comparison: Record<string, number> = {};
    const recommendations: string[] = [];

    Object.entries(assessment.pillar_scores).forEach(([pillar, score]) => {
      const benchmark = mockBenchmarks[pillar] || 25;
      const variance = ((score - benchmark) / benchmark) * 100;
      comparison[pillar] = Math.round(variance);

      if (variance < -20) {
        recommendations.push(`${pillar}: Significantly below industry average - immediate attention needed`);
      } else if (variance > 20) {
        recommendations.push(`${pillar}: Above industry average - leverage this strength`);
      }
    });

    return { vs_benchmark: comparison, recommendations };
  }

  static exportDetailedAssessment(assessment: MEDDPICCAssessment): string {
    const insights = this.generateInsights(assessment);
    
    return JSON.stringify({
      assessment,
      insights,
      generated_at: new Date(),
      metadata: {
        version: '2.0',
        methodology: 'Enhanced MEDDPICC',
        confidence_scoring: true,
        risk_assessment: true
      }
    }, null, 2);
  }
}