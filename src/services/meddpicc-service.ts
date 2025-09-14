import { useKV } from '@github/spark/hooks';
import { 
  MEDDPICCAssessment, 
  MEDDPICCAnswer, 
  MEDDPICCTrend, 
  MEDDPICCBenchmark, 
  MEDDPICCInsight,
  MEDDPICCScoringService 
} from './meddpicc-scoring-service';

export interface MEDDPICCPortfolioAnalytics {
  total_assessments: number;
  average_score: number;
  score_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  pillar_averages: Record<string, number>;
  trend_data: MEDDPICCTrend[];
  top_risks: string[];
  improvement_opportunities: string[];
}

export interface MEDDPICCQuestionData {
  id: string;
  text: string;
  type: 'single-select' | 'multi-select' | 'rating' | 'text';
  options: Array<{
    label: string;
    value: string;
    score: number;
  }>;
  tooltip?: string;
  help_text?: string;
  required?: boolean;
  conditional_logic?: {
    depends_on: string;
    show_when: string[];
  };
}

export interface MEDDPICCPillarData {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: MEDDPICCQuestionData[];
  success_criteria: string[];
  coaching_tips: string[];
}

export interface MEDDPICCConfiguration {
  pillars: MEDDPICCPillarData[];
  scoring: {
    max_score: number;
    thresholds: {
      strong: { min: number; label: string };
      moderate: { min: number; max: number; label: string };
      weak: { max: number; label: string };
    };
  };
  coaching_prompts: Array<{
    condition: {
      pillar: string;
      value: string;
    };
    prompt: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  version: string;
  last_updated: Date;
}

export class MEDDPICCService {
  private static STORAGE_KEYS = {
    ASSESSMENTS: 'meddpicc-assessments',
    CONFIGURATION: 'meddpicc-configuration',
    TRENDS: 'meddpicc-trends',
    BENCHMARKS: 'meddpicc-benchmarks',
    ANALYTICS: 'meddpicc-analytics'
  };

  // Initialize default MEDDPICC configuration
  static async initializeConfiguration(): Promise<MEDDPICCConfiguration> {
    const defaultConfig: MEDDPICCConfiguration = {
      pillars: [
        {
          id: 'metrics',
          title: 'Metrics',
          description: 'Quantifiable business impact and ROI measurements',
          weight: 1.2,
          questions: [
            {
              id: 'metrics_identified',
              text: 'Have you identified specific, measurable business metrics that this solution will impact?',
              type: 'single-select',
              options: [
                { label: 'No metrics identified', value: 'none', score: 0 },
                { label: 'Basic assumptions', value: 'assumptions', score: 10 },
                { label: 'Some validation', value: 'partial', score: 20 },
                { label: 'Fully validated', value: 'validated', score: 30 },
                { label: 'Customer influenced metrics', value: 'influenced', score: 40 }
              ],
              tooltip: 'Metrics provide quantifiable justification for the investment',
              required: true
            }
          ],
          success_criteria: [
            'Clear ROI calculation established',
            'Customer-specific metrics identified',
            'Baseline measurements obtained'
          ],
          coaching_tips: [
            'Focus on business outcomes, not technical features',
            'Quantify cost of inaction',
            'Get metrics from economic buyer level'
          ]
        },
        {
          id: 'economic_buyer',
          title: 'Economic Buyer',
          description: 'Decision maker with budget authority',
          weight: 1.3,
          questions: [
            {
              id: 'eb_identified',
              text: 'Have you identified and engaged with the economic buyer?',
              type: 'single-select',
              options: [
                { label: 'Not identified', value: 'none', score: 0 },
                { label: 'Identified by assumption', value: 'assumed', score: 10 },
                { label: 'Confirmed by champion', value: 'confirmed', score: 20 },
                { label: 'Aware of our solution', value: 'aware', score: 30 },
                { label: 'Direct engagement', value: 'engaged', score: 40 }
              ],
              tooltip: 'The person with budget authority to make the purchase decision',
              required: true
            }
          ],
          success_criteria: [
            'Economic buyer identified and accessible',
            'Budget confirmed and available',
            'Timeline aligned with budget cycle'
          ],
          coaching_tips: [
            'Get introduced through your champion',
            'Prepare executive-level value proposition',
            'Understand their strategic priorities'
          ]
        },
        {
          id: 'decision_criteria',
          title: 'Decision Criteria',
          description: 'Formal and informal evaluation criteria',
          weight: 1.1,
          questions: [
            {
              id: 'criteria_known',
              text: 'Do you understand the decision criteria and evaluation process?',
              type: 'single-select',
              options: [
                { label: 'No criteria known', value: 'none', score: 0 },
                { label: 'Basic understanding', value: 'basic', score: 10 },
                { label: 'Good understanding', value: 'good', score: 20 },
                { label: 'Detailed knowledge', value: 'detailed', score: 30 },
                { label: 'Influenced criteria', value: 'influenced', score: 40 }
              ],
              tooltip: 'Understanding how they will evaluate and compare solutions',
              required: true
            }
          ],
          success_criteria: [
            'Formal evaluation criteria documented',
            'Scoring methodology understood',
            'Proof requirements identified'
          ],
          coaching_tips: [
            'Ask for the RFP or evaluation template',
            'Understand weighting of different criteria',
            'Influence criteria where possible'
          ]
        },
        {
          id: 'decision_process',
          title: 'Decision Process',
          description: 'How the decision will be made and by whom',
          weight: 1.0,
          questions: [
            {
              id: 'process_mapped',
              text: 'Have you mapped the complete decision-making process?',
              type: 'single-select',
              options: [
                { label: 'No process known', value: 'none', score: 0 },
                { label: 'Basic timeline', value: 'basic', score: 10 },
                { label: 'Key stakeholders known', value: 'stakeholders', score: 20 },
                { label: 'Detailed process map', value: 'detailed', score: 30 },
                { label: 'Process optimized', value: 'optimized', score: 40 }
              ],
              tooltip: 'Who is involved in the decision and what steps are required',
              required: true
            }
          ],
          success_criteria: [
            'All decision stakeholders identified',
            'Decision timeline established',
            'Approval workflow understood'
          ],
          coaching_tips: [
            'Map all stakeholders and their influence',
            'Understand the approval workflow',
            'Identify potential bottlenecks'
          ]
        },
        {
          id: 'paper_process',
          title: 'Paper Process',
          description: 'Legal, procurement, and contracting requirements',
          weight: 0.9,
          questions: [
            {
              id: 'paper_understood',
              text: 'Do you understand the procurement and legal requirements?',
              type: 'single-select',
              options: [
                { label: 'No knowledge', value: 'none', score: 0 },
                { label: 'Basic awareness', value: 'basic', score: 10 },
                { label: 'Key requirements known', value: 'requirements', score: 20 },
                { label: 'Process well understood', value: 'understood', score: 30 },
                { label: 'Fully prepared', value: 'prepared', score: 40 }
              ],
              tooltip: 'Legal, procurement, and compliance requirements',
              required: true
            }
          ],
          success_criteria: [
            'Procurement team engaged',
            'Legal requirements understood',
            'Contract terms pre-negotiated'
          ],
          coaching_tips: [
            'Engage procurement early',
            'Understand compliance requirements',
            'Prepare necessary documentation'
          ]
        },
        {
          id: 'implicate_the_pain',
          title: 'Implicate The Pain',
          description: 'Urgency and compelling event driving action',
          weight: 1.2,
          questions: [
            {
              id: 'pain_implicated',
              text: 'Is there a compelling event creating urgency for this decision?',
              type: 'single-select',
              options: [
                { label: 'No urgency', value: 'none', score: 0 },
                { label: 'Some pressure', value: 'some', score: 10 },
                { label: 'Clear pain points', value: 'clear', score: 20 },
                { label: 'Quantified impact', value: 'quantified', score: 30 },
                { label: 'Crisis/compelling event', value: 'crisis', score: 40 }
              ],
              tooltip: 'What is driving the urgency to solve this problem now',
              required: true
            }
          ],
          success_criteria: [
            'Compelling event identified',
            'Cost of inaction quantified',
            'Urgency shared by stakeholders'
          ],
          coaching_tips: [
            'Identify the compelling event',
            'Quantify cost of doing nothing',
            'Create urgency through evidence'
          ]
        },
        {
          id: 'champion',
          title: 'Champion',
          description: 'Internal advocate with influence and access',
          weight: 1.1,
          questions: [
            {
              id: 'champion_identified',
              text: 'Do you have a strong internal champion?',
              type: 'single-select',
              options: [
                { label: 'No champion', value: 'none', score: 0 },
                { label: 'Potential advocate', value: 'potential', score: 10 },
                { label: 'Supportive contact', value: 'supportive', score: 20 },
                { label: 'Active champion', value: 'active', score: 30 },
                { label: 'Multiple champions', value: 'multiple', score: 40 }
              ],
              tooltip: 'Someone inside the organization who advocates for your solution',
              required: true
            }
          ],
          success_criteria: [
            'Champion has organizational credibility',
            'Champion has access to decision makers',
            'Champion actively promotes solution'
          ],
          coaching_tips: [
            'Develop multiple champions',
            'Enable champions with materials',
            'Ensure champion has personal win'
          ]
        },
        {
          id: 'competition',
          title: 'Competition',
          description: 'Competitive landscape and differentiation',
          weight: 1.0,
          questions: [
            {
              id: 'competition_known',
              text: 'Do you understand the competitive landscape?',
              type: 'single-select',
              options: [
                { label: 'No knowledge', value: 'none', score: 0 },
                { label: 'Basic awareness', value: 'basic', score: 10 },
                { label: 'Key competitors known', value: 'known', score: 20 },
                { label: 'Differentiation clear', value: 'differentiated', score: 30 },
                { label: 'Competitive advantage', value: 'advantage', score: 40 }
              ],
              tooltip: 'Who you are competing against and how you differentiate',
              required: true
            }
          ],
          success_criteria: [
            'All competitors identified',
            'Differentiation strategy defined',
            'Competitive weaknesses known'
          ],
          coaching_tips: [
            'Understand all alternatives',
            'Develop clear differentiation',
            'Prepare competitive responses'
          ]
        }
      ],
      scoring: {
        max_score: 320, // 8 pillars × 40 max points each
        thresholds: {
          strong: { min: 256, label: 'Strong' }, // 80%+
          moderate: { min: 192, max: 255, label: 'Moderate' }, // 60-79%
          weak: { max: 191, label: 'Weak' } // <60%
        }
      },
      coaching_prompts: [
        {
          condition: { pillar: 'economic_buyer', value: 'none' },
          prompt: 'Identify economic buyer; request intro via champion this week',
          priority: 'critical'
        },
        {
          condition: { pillar: 'implicate_the_pain', value: 'none' },
          prompt: 'Run 30-min ROI workshop; attach cost-of-inaction calc to notes',
          priority: 'critical'
        },
        {
          condition: { pillar: 'champion', value: 'none' },
          prompt: 'Identify and develop internal champion with organizational credibility',
          priority: 'high'
        },
        {
          condition: { pillar: 'metrics', value: 'none' },
          prompt: 'Schedule business case development session with stakeholders',
          priority: 'high'
        }
      ],
      version: '2.0',
      last_updated: new Date()
    };

    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.STORAGE_KEYS.CONFIGURATION);
        if (stored) {
          return JSON.parse(stored);
        }
        localStorage.setItem(this.STORAGE_KEYS.CONFIGURATION, JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error loading MEDDPICC configuration:', error);
    }

    return defaultConfig;
  }

  // Assessment CRUD operations
  static async createAssessment(opportunityId: string, answers: MEDDPICCAnswer[]): Promise<MEDDPICCAssessment> {
    const partialAssessment: Partial<MEDDPICCAssessment> = {
      id: Date.now().toString(),
      opportunity_id: opportunityId,
      answers,
      created_by: 'current-user'
    };

    const assessment = MEDDPICCScoringService.calculateAdvancedScoring(partialAssessment);
    
    // Store assessment
    try {
      if (typeof window !== 'undefined') {
        const assessments = await this.getAllAssessments();
        assessments.push(assessment);
        localStorage.setItem(this.STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
      }
    } catch (error) {
      console.error('Error saving MEDDPICC assessment:', error);
    }

    return assessment;
  }

  static async updateAssessment(assessmentId: string, answers: MEDDPICCAnswer[]): Promise<MEDDPICCAssessment | null> {
    try {
      const assessments = await this.getAllAssessments();
      const index = assessments.findIndex(a => a.id === assessmentId);
      
      if (index === -1) return null;

      const existing = assessments[index];
      const partialAssessment: Partial<MEDDPICCAssessment> = {
        ...existing,
        answers,
        version: existing.version + 1
      };

      const updatedAssessment = MEDDPICCScoringService.calculateAdvancedScoring(partialAssessment);
      assessments[index] = updatedAssessment;

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
      }

      return updatedAssessment;
    } catch (error) {
      console.error('Error updating MEDDPICC assessment:', error);
      return null;
    }
  }

  static async getAssessment(assessmentId: string): Promise<MEDDPICCAssessment | null> {
    try {
      const assessments = await this.getAllAssessments();
      return assessments.find(a => a.id === assessmentId) || null;
    } catch (error) {
      console.error('Error loading MEDDPICC assessment:', error);
      return null;
    }
  }

  static async getAssessmentByOpportunity(opportunityId: string): Promise<MEDDPICCAssessment | null> {
    try {
      const assessments = await this.getAllAssessments();
      return assessments.find(a => a.opportunity_id === opportunityId) || null;
    } catch (error) {
      console.error('Error loading MEDDPICC assessment for opportunity:', error);
      return null;
    }
  }

  static async getAllAssessments(): Promise<MEDDPICCAssessment[]> {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.STORAGE_KEYS.ASSESSMENTS);
      if (!stored) return [];

      const assessments = JSON.parse(stored);
      return assessments.map((a: any) => ({
        ...a,
        last_updated: new Date(a.last_updated)
      }));
    } catch (error) {
      console.error('Error loading MEDDPICC assessments:', error);
      return [];
    }
  }

  static async deleteAssessment(assessmentId: string): Promise<boolean> {
    try {
      const assessments = await this.getAllAssessments();
      const filtered = assessments.filter(a => a.id !== assessmentId);
      
      if (filtered.length === assessments.length) return false;

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEYS.ASSESSMENTS, JSON.stringify(filtered));
      }

      return true;
    } catch (error) {
      console.error('Error deleting MEDDPICC assessment:', error);
      return false;
    }
  }

  // Analytics and reporting
  static async getPortfolioAnalytics(): Promise<MEDDPICCPortfolioAnalytics> {
    try {
      const assessments = await this.getAllAssessments();
      
      if (assessments.length === 0) {
        return {
          total_assessments: 0,
          average_score: 0,
          score_distribution: {},
          risk_distribution: {},
          pillar_averages: {},
          trend_data: [],
          top_risks: [],
          improvement_opportunities: []
        };
      }

      const totalScore = assessments.reduce((sum, a) => sum + a.total_score, 0);
      const averageScore = Math.round(totalScore / assessments.length);

      // Score distribution
      const scoreDistribution: Record<string, number> = {
        'Strong': 0,
        'Moderate': 0,
        'Weak': 0
      };

      // Risk distribution
      const riskDistribution: Record<string, number> = {
        'low': 0,
        'medium': 0,
        'high': 0,
        'critical': 0
      };

      // Pillar averages
      const pillarTotals: Record<string, number> = {};
      const pillarCounts: Record<string, number> = {};

      assessments.forEach(assessment => {
        // Score distribution
        if (assessment.total_score >= 256) scoreDistribution['Strong']++;
        else if (assessment.total_score >= 192) scoreDistribution['Moderate']++;
        else scoreDistribution['Weak']++;

        // Risk distribution
        riskDistribution[assessment.risk_level]++;

        // Pillar averages
        Object.entries(assessment.pillar_scores).forEach(([pillar, score]) => {
          pillarTotals[pillar] = (pillarTotals[pillar] || 0) + score;
          pillarCounts[pillar] = (pillarCounts[pillar] || 0) + 1;
        });
      });

      const pillarAverages: Record<string, number> = {};
      Object.keys(pillarTotals).forEach(pillar => {
        pillarAverages[pillar] = Math.round(pillarTotals[pillar] / pillarCounts[pillar]);
      });

      // Top risks and opportunities
      const topRisks: string[] = [];
      const improvementOpportunities: string[] = [];

      Object.entries(pillarAverages).forEach(([pillar, average]) => {
        if (average < 16) { // Less than 40% of max score (40)
          topRisks.push(`${pillar}: Average score ${average}/40 - critical attention needed`);
        } else if (average < 24) { // Less than 60% of max score
          improvementOpportunities.push(`${pillar}: Average score ${average}/40 - improvement opportunity`);
        }
      });

      return {
        total_assessments: assessments.length,
        average_score: averageScore,
        score_distribution: scoreDistribution,
        risk_distribution: riskDistribution,
        pillar_averages: pillarAverages,
        trend_data: [], // Would be populated from stored trends
        top_risks: topRisks.slice(0, 5),
        improvement_opportunities: improvementOpportunities.slice(0, 5)
      };
    } catch (error) {
      console.error('Error generating MEDDPICC portfolio analytics:', error);
      throw error;
    }
  }

  // Configuration management
  static async updateConfiguration(config: MEDDPICCConfiguration): Promise<void> {
    try {
      const updatedConfig = {
        ...config,
        last_updated: new Date()
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEYS.CONFIGURATION, JSON.stringify(updatedConfig));
      }
    } catch (error) {
      console.error('Error updating MEDDPICC configuration:', error);
      throw error;
    }
  }

  static async getConfiguration(): Promise<MEDDPICCConfiguration> {
    return await this.initializeConfiguration();
  }

  // Utility methods
  static calculateScorePercentage(score: number, maxScore: number = 320): number {
    return Math.round((score / maxScore) * 100);
  }

  static getScoreLabel(score: number): string {
    if (score >= 256) return 'Strong';
    if (score >= 192) return 'Moderate';
    return 'Weak';
  }

  static getRiskColor(riskLevel: string): string {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[riskLevel as keyof typeof colors] || '#6b7280';
  }

  static getPillarColor(pillar: string): string {
    const colors = {
      metrics: '#3b82f6',
      economic_buyer: '#8b5cf6',
      decision_criteria: '#06b6d4',
      decision_process: '#10b981',
      paper_process: '#f59e0b',
      implicate_the_pain: '#ef4444',
      champion: '#ec4899',
      competition: '#6366f1'
    };
    return colors[pillar as keyof typeof colors] || '#6b7280';
  }

  // Sample data initialization for testing
  static async initializeSampleData(): Promise<void> {
    console.log('Initializing MEDDPICC sample data...');
    
    const sampleAnswers: MEDDPICCAnswer[] = [
      {
        pillar: 'metrics',
        question_id: 'metrics_identified',
        answer_value: 'validated',
        score: 30,
        timestamp: new Date(),
        confidence_level: 'high',
        evidence_notes: 'Customer provided current performance metrics'
      },
      {
        pillar: 'economic_buyer',
        question_id: 'eb_identified',
        answer_value: 'engaged',
        score: 40,
        timestamp: new Date(),
        confidence_level: 'high',
        evidence_notes: 'Direct meeting with CFO scheduled'
      },
      {
        pillar: 'champion',
        question_id: 'champion_identified',
        answer_value: 'active',
        score: 30,
        timestamp: new Date(),
        confidence_level: 'medium',
        evidence_notes: 'IT Director actively promoting solution'
      }
    ];

    try {
      // Create sample assessments for different opportunities
      await this.createAssessment('sample-opp-1', sampleAnswers);
      await this.createAssessment('sample-opp-2', sampleAnswers.map(a => ({...a, score: a.score * 0.8})));
      await this.createAssessment('sample-opp-3', sampleAnswers.map(a => ({...a, score: a.score * 0.6})));
      
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  // Generate analytics (alias for getPortfolioAnalytics)
  static async generateAnalytics(): Promise<MEDDPICCPortfolioAnalytics> {
    return await this.getPortfolioAnalytics();
  }

  // Export functionality
  static async exportAssessments(): Promise<string> {
    const assessments = await this.getAllAssessments();
    const analytics = await this.getPortfolioAnalytics();
    
    return JSON.stringify({
      assessments,
      analytics,
      exported_at: new Date(),
      version: '2.0'
    }, null, 2);
  }

  // Coaching and recommendations
  static getCoachingPrompts(assessment: MEDDPICCAssessment): Array<{prompt: string; priority: string}> {
    const config = this.initializeConfiguration();
    const prompts: Array<{prompt: string; priority: string}> = [];

    // Add assessment-specific coaching actions
    assessment.coaching_actions.forEach(action => {
      prompts.push({ prompt: action, priority: 'high' });
    });

    return prompts.slice(0, 5); // Return top 5 prompts
  }
}

// Export types and service
export {
  MEDDPICCAssessment,
  MEDDPICCAnswer,
  MEDDPICCTrend,
  MEDDPICCBenchmark,
  MEDDPICCInsight,
  MEDDPICCScoringService
};