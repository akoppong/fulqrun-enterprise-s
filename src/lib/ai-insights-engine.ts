import { Opportunity, Company, Contact, User } from '@/lib/types';

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'risk' | 'trend';
  category: 'meddpicc' | 'process' | 'timing' | 'value' | 'relationship' | 'competition';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  impact?: string;
  timeframe?: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface OpportunityScore {
  overall: number;
  meddpicc: number;
  timing: number;
  value: number;
  relationships: number;
  process: number;
  competition: number;
}

export interface PredictiveAnalysis {
  winProbability: number;
  timeToClose: number;
  valueRange: { min: number; max: number };
  riskFactors: string[];
  accelerators: string[];
  competitorThreats: string[];
}

/**
 * AI-powered insights engine for opportunity analysis and recommendations
 * Provides intelligent scoring, risk assessment, and strategic recommendations
 */
export class AIInsightsEngine {
  private static instance: AIInsightsEngine;
  
  public static getInstance(): AIInsightsEngine {
    if (!AIInsightsEngine.instance) {
      AIInsightsEngine.instance = new AIInsightsEngine();
    }
    return AIInsightsEngine.instance;
  }

  /**
   * Generate comprehensive AI insights for an opportunity
   */
  async generateInsights(
    opportunity: Partial<Opportunity>,
    companies: Company[] = [],
    contacts: Contact[] = [],
    user: User,
    historicalData: Opportunity[] = []
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    try {
      // MEDDPICC Analysis
      insights.push(...this.analyzeMEDDPICC(opportunity));
      
      // Value and Sizing Analysis
      insights.push(...this.analyzeValue(opportunity, historicalData));
      
      // Timing Analysis
      insights.push(...this.analyzeTiming(opportunity));
      
      // Relationship Analysis
      insights.push(...this.analyzeRelationships(opportunity, companies, contacts));
      
      // Process and Stage Analysis
      insights.push(...this.analyzeProcess(opportunity));
      
      // Competition Analysis
      insights.push(...this.analyzeCompetition(opportunity));
      
      // Risk Assessment
      insights.push(...this.analyzeRisks(opportunity));

      // Generate AI-powered recommendations using LLM
      if (opportunity.title && opportunity.value && opportunity.companyId) {
        insights.push(...await this.generateLLMInsights(opportunity, companies, contacts));
      }

    } catch (error) {
      console.error('Error generating AI insights:', error);
      insights.push({
        id: 'error-fallback',
        type: 'warning',
        category: 'process',
        title: 'Analysis Unavailable',
        description: 'Unable to generate complete analysis. Please review opportunity manually.',
        confidence: 100,
        priority: 'medium',
        source: 'ai-insights-engine'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate comprehensive opportunity score
   */
  calculateOpportunityScore(
    opportunity: Partial<Opportunity>,
    historicalData: Opportunity[] = []
  ): OpportunityScore {
    const meddpiccScore = this.calculateMEDDPICCScore(opportunity);
    const timingScore = this.calculateTimingScore(opportunity);
    const valueScore = this.calculateValueScore(opportunity, historicalData);
    const relationshipScore = this.calculateRelationshipScore(opportunity);
    const processScore = this.calculateProcessScore(opportunity);
    const competitionScore = this.calculateCompetitionScore(opportunity);

    const overall = (
      meddpiccScore * 0.3 +
      timingScore * 0.15 +
      valueScore * 0.15 +
      relationshipScore * 0.2 +
      processScore * 0.15 +
      competitionScore * 0.05
    );

    return {
      overall,
      meddpicc: meddpiccScore,
      timing: timingScore,
      value: valueScore,
      relationships: relationshipScore,
      process: processScore,
      competition: competitionScore
    };
  }

  /**
   * Generate predictive analysis for opportunity outcomes
   */
  generatePredictiveAnalysis(
    opportunity: Partial<Opportunity>,
    historicalData: Opportunity[] = []
  ): PredictiveAnalysis {
    const score = this.calculateOpportunityScore(opportunity, historicalData);
    
    // Calculate win probability based on multiple factors
    let winProbability = opportunity.probability || 50;
    
    // Adjust based on MEDDPICC completeness
    if (score.meddpicc > 80) winProbability += 15;
    else if (score.meddpicc < 50) winProbability -= 20;
    
    // Adjust based on value characteristics
    if (score.value > 80) winProbability += 10;
    else if (score.value < 40) winProbability -= 15;

    winProbability = Math.max(0, Math.min(100, winProbability));

    // Estimate time to close based on stage and value
    const baseTimeToClose = this.estimateTimeToClose(opportunity);
    
    // Calculate value range based on uncertainty
    const valueRange = this.calculateValueRange(opportunity);

    // Identify risk factors and accelerators
    const riskFactors = this.identifyRiskFactors(opportunity, score);
    const accelerators = this.identifyAccelerators(opportunity, score);
    const competitorThreats = this.identifyCompetitorThreats(opportunity);

    return {
      winProbability,
      timeToClose: baseTimeToClose,
      valueRange,
      riskFactors,
      accelerators,
      competitorThreats
    };
  }

  /**
   * Analyze MEDDPICC qualification completeness and quality
   */
  private analyzeMEDDPICC(opportunity: Partial<Opportunity>): AIInsight[] {
    const insights: AIInsight[] = [];
    const meddpicc = opportunity.meddpicc;

    if (!meddpicc) {
      insights.push({
        id: 'meddpicc-missing',
        type: 'warning',
        category: 'meddpicc',
        title: 'MEDDPICC Assessment Missing',
        description: 'No MEDDPICC qualification data found. This is critical for deal qualification and forecasting accuracy.',
        confidence: 100,
        priority: 'critical',
        action: 'Complete MEDDPICC assessment',
        impact: 'Reduced win probability and forecasting accuracy',
        source: 'meddpicc-analyzer'
      });
      return insights;
    }

    const scores = [
      meddpicc.metrics, meddpicc.economicBuyer, meddpicc.decisionCriteria,
      meddpicc.decisionProcess, meddpicc.paperProcess, meddpicc.identifyPain,
      meddpicc.champion, meddpicc.competition
    ];

    const weakCriteria = scores.filter(score => score < 6).length;
    const strongCriteria = scores.filter(score => score >= 8).length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (weakCriteria > 3) {
      insights.push({
        id: 'meddpicc-weak',
        type: 'warning',
        category: 'meddpicc',
        title: 'Weak MEDDPICC Qualification',
        description: `${weakCriteria}/8 MEDDPICC criteria are poorly qualified (score < 6). This significantly impacts deal predictability.`,
        confidence: 90,
        priority: 'high',
        action: 'Focus on strengthening weak qualification areas',
        impact: 'Higher risk of deal slippage or loss',
        source: 'meddpicc-analyzer'
      });
    }

    if (strongCriteria >= 6) {
      insights.push({
        id: 'meddpicc-strong',
        type: 'opportunity',
        category: 'meddpicc',
        title: 'Strong MEDDPICC Foundation',
        description: `${strongCriteria}/8 MEDDPICC criteria are well qualified. This indicates a high-quality opportunity.`,
        confidence: 85,
        priority: 'medium',
        action: 'Maintain qualification quality and focus on closing activities',
        impact: 'Higher win probability and forecast accuracy',
        source: 'meddpicc-analyzer'
      });
    }

    // Specific criterion analysis
    if (meddpicc.economicBuyer < 5) {
      insights.push({
        id: 'economic-buyer-risk',
        type: 'risk',
        category: 'meddpicc',
        title: 'Economic Buyer Access Critical',
        description: 'Limited access to economic buyer creates significant deal risk. Decisions may be made without your influence.',
        confidence: 85,
        priority: 'high',
        action: 'Identify and establish relationship with economic buyer',
        impact: 'Deal may stall or be decided without input',
        source: 'meddpicc-analyzer'
      });
    }

    if (meddpicc.champion < 6) {
      insights.push({
        id: 'champion-weakness',
        type: 'risk',
        category: 'meddpicc',
        title: 'Champion Strength Questionable',
        description: 'Champion may not have sufficient influence or commitment to drive the deal forward.',
        confidence: 80,
        priority: 'high',
        action: 'Strengthen champion relationship and identify additional supporters',
        impact: 'Deal progression may slow or stall',
        source: 'meddpicc-analyzer'
      });
    }

    return insights;
  }

  /**
   * Analyze deal value characteristics and benchmarks
   */
  private analyzeValue(opportunity: Partial<Opportunity>, historicalData: Opportunity[] = []): AIInsight[] {
    const insights: AIInsight[] = [];
    const value = opportunity.value || 0;

    if (value === 0) {
      insights.push({
        id: 'value-missing',
        type: 'warning',
        category: 'value',
        title: 'Deal Value Not Specified',
        description: 'Opportunity value is not set. This affects prioritization and resource allocation.',
        confidence: 100,
        priority: 'medium',
        action: 'Estimate and set deal value',
        source: 'value-analyzer'
      });
      return insights;
    }

    // High-value deal analysis
    if (value > 500000) {
      insights.push({
        id: 'high-value-opportunity',
        type: 'opportunity',
        category: 'value',
        title: 'High-Value Opportunity',
        description: `This ${value.toLocaleString()} deal represents significant revenue potential. Consider executive involvement and enhanced support.`,
        confidence: 100,
        priority: 'high',
        action: 'Engage senior stakeholders and ensure adequate resources',
        impact: 'Major revenue impact potential',
        source: 'value-analyzer'
      });
    }

    // Benchmark against historical data
    if (historicalData.length > 0) {
      const avgValue = historicalData.reduce((sum, opp) => sum + opp.value, 0) / historicalData.length;
      const isAboveAverage = value > avgValue * 1.5;
      const isBelowAverage = value < avgValue * 0.5;

      if (isAboveAverage) {
        insights.push({
          id: 'above-average-value',
          type: 'opportunity',
          category: 'value',
          title: 'Above Average Deal Size',
          description: `This deal is ${Math.round(value / avgValue * 100)}% of your average deal size. Ensure qualification matches the investment.`,
          confidence: 75,
          priority: 'medium',
          action: 'Validate deal scope and decision-making process',
          source: 'value-analyzer'
        });
      } else if (isBelowAverage) {
        insights.push({
          id: 'below-average-value',
          type: 'recommendation',
          category: 'value',
          title: 'Consider Deal Expansion',
          description: `This deal is below your average size. Explore opportunities to expand scope or identify additional needs.`,
          confidence: 65,
          priority: 'low',
          action: 'Investigate expansion opportunities',
          source: 'value-analyzer'
        });
      }
    }

    return insights;
  }

  /**
   * Analyze timing factors and sales cycle dynamics
   */
  private analyzeTiming(opportunity: Partial<Opportunity>): AIInsight[] {
    const insights: AIInsight[] = [];
    
    if (!opportunity.expectedCloseDate) {
      insights.push({
        id: 'timing-missing',
        type: 'warning',
        category: 'timing',
        title: 'Close Date Not Set',
        description: 'Expected close date is missing. This affects pipeline forecasting and resource planning.',
        confidence: 100,
        priority: 'medium',
        action: 'Set realistic expected close date',
        source: 'timing-analyzer'
      });
      return insights;
    }

    const closeDate = new Date(opportunity.expectedCloseDate);
    const today = new Date();
    const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Analyze urgency
    if (daysUntilClose < 30) {
      const urgencyLevel = daysUntilClose < 14 ? 'critical' : 'high';
      insights.push({
        id: 'close-urgency',
        type: 'warning',
        category: 'timing',
        title: 'Close Date Approaching',
        description: `Only ${daysUntilClose} days until expected close. Ensure all closing activities are on track.`,
        confidence: 100,
        priority: urgencyLevel,
        action: 'Review and accelerate closing activities',
        timeframe: `${daysUntilClose} days`,
        source: 'timing-analyzer'
      });
    }

    // Analyze stage vs timing alignment
    const stage = opportunity.stage || 'prospect';
    const stageIndex = ['prospect', 'qualify', 'engage', 'propose', 'negotiate', 'closed-won', 'closed-lost'].indexOf(stage);
    const expectedDaysToClose = [90, 60, 45, 30, 15, 0, 0][stageIndex] || 90;

    if (daysUntilClose < expectedDaysToClose * 0.5) {
      insights.push({
        id: 'timeline-aggressive',
        type: 'warning',
        category: 'timing',
        title: 'Aggressive Timeline',
        description: `Current stage (${stage}) typically requires ${expectedDaysToClose} days, but close date is ${daysUntilClose} days away.`,
        confidence: 75,
        priority: 'medium',
        action: 'Validate timeline feasibility or adjust expectations',
        source: 'timing-analyzer'
      });
    }

    return insights;
  }

  /**
   * Analyze relationships and stakeholder coverage
   */
  private analyzeRelationships(
    opportunity: Partial<Opportunity>,
    companies: Company[],
    contacts: Contact[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];

    if (!opportunity.contactId) {
      insights.push({
        id: 'no-primary-contact',
        type: 'warning',
        category: 'relationship',
        title: 'No Primary Contact Assigned',
        description: 'No primary contact is assigned to this opportunity. This affects relationship management and communication.',
        confidence: 100,
        priority: 'medium',
        action: 'Assign primary contact',
        source: 'relationship-analyzer'
      });
    }

    // Analyze company characteristics
    if (opportunity.companyId) {
      const company = companies.find(c => c.id === opportunity.companyId);
      if (company) {
        const companyContacts = contacts.filter(c => c.companyId === company.id);
        
        if (companyContacts.length < 2) {
          insights.push({
            id: 'limited-contacts',
            type: 'risk',
            category: 'relationship',
            title: 'Limited Contact Coverage',
            description: `Only ${companyContacts.length} contact(s) at ${company.name}. Single-threaded deals have higher risk.`,
            confidence: 80,
            priority: 'medium',
            action: 'Identify and engage additional stakeholders',
            impact: 'Higher risk if key contact leaves or loses influence',
            source: 'relationship-analyzer'
          });
        }

        // Industry-specific insights
        if (company.industry === 'Technology') {
          insights.push({
            id: 'tech-industry-insight',
            type: 'recommendation',
            category: 'relationship',
            title: 'Technology Sector Considerations',
            description: 'Tech companies often involve technical decision makers. Ensure technical validation and developer relations.',
            confidence: 70,
            priority: 'low',
            action: 'Identify technical stakeholders and plan technical validation',
            source: 'relationship-analyzer'
          });
        }
      }
    }

    return insights;
  }

  /**
   * Analyze sales process and methodology adherence
   */
  private analyzeProcess(opportunity: Partial<Opportunity>): AIInsight[] {
    const insights: AIInsight[] = [];
    
    const stage = opportunity.stage || 'prospect';
    const probability = opportunity.probability || 0;
    
    // Stage-probability alignment analysis
    const expectedProbabilities: Record<string, number> = {
      'prospect': 20,
      'qualify': 35,
      'engage': 50,
      'propose': 65,
      'negotiate': 80,
      'closed-won': 100,
      'closed-lost': 0
    };

    const expectedProb = expectedProbabilities[stage] || 50;
    const deviation = Math.abs(probability - expectedProb);

    if (deviation > 25) {
      insights.push({
        id: 'probability-misalignment',
        type: 'warning',
        category: 'process',
        title: 'Probability-Stage Misalignment',
        description: `Win probability (${probability}%) doesn't align with stage (${stage}, expected ~${expectedProb}%). Review stage criteria.`,
        confidence: 80,
        priority: 'medium',
        action: 'Review stage progression criteria and adjust accordingly',
        source: 'process-analyzer'
      });
    }

    return insights;
  }

  /**
   * Analyze competitive landscape and positioning
   */
  private analyzeCompetition(opportunity: Partial<Opportunity>): AIInsight[] {
    const insights: AIInsight[] = [];

    const competitionScore = opportunity.meddpicc?.competition || 0;
    
    if (competitionScore < 5) {
      insights.push({
        id: 'competition-unknown',
        type: 'risk',
        category: 'competition',
        title: 'Competitive Landscape Unclear',
        description: 'Limited understanding of competitive situation. This creates blind spots in positioning and strategy.',
        confidence: 75,
        priority: 'medium',
        action: 'Research competitive landscape and develop competitive strategy',
        impact: 'May be surprised by competitive moves',
        source: 'competition-analyzer'
      });
    }

    return insights;
  }

  /**
   * Identify and analyze potential deal risks
   */
  private analyzeRisks(opportunity: Partial<Opportunity>): AIInsight[] {
    const insights: AIInsight[] = [];
    const risks: string[] = [];

    // Technical risk indicators
    if (opportunity.meddpicc?.decisionCriteria && opportunity.meddpicc.decisionCriteria < 6) {
      risks.push('Unclear decision criteria may lead to evaluation delays');
    }

    if (opportunity.meddpicc?.decisionProcess && opportunity.meddpicc.decisionProcess < 6) {
      risks.push('Undefined decision process creates timeline uncertainty');
    }

    if (opportunity.meddpicc?.paperProcess && opportunity.meddpicc.paperProcess < 6) {
      risks.push('Unknown procurement process may cause closing delays');
    }

    if (risks.length > 0) {
      insights.push({
        id: 'process-risks',
        type: 'risk',
        category: 'process',
        title: 'Process Risk Factors Identified',
        description: `Multiple process risks detected: ${risks.join('; ')}`,
        confidence: 75,
        priority: 'high',
        action: 'Address process uncertainties with stakeholders',
        impact: 'Deal timeline and closure at risk',
        source: 'risk-analyzer'
      });
    }

    return insights;
  }

  /**
   * Generate LLM-powered insights using AI analysis
   */
  private async generateLLMInsights(
    opportunity: Partial<Opportunity>,
    companies: Company[],
    contacts: Contact[]
  ): Promise<AIInsight[]> {
    try {
      if (!window.spark?.llm) {
        return [];
      }

      const company = companies.find(c => c.id === opportunity.companyId);
      const contact = contacts.find(c => c.id === opportunity.contactId);

      const prompt = spark.llmPrompt`
      Analyze this sales opportunity and provide strategic insights:
      
      Opportunity: ${opportunity.title}
      Company: ${company?.name || 'Unknown'} (Industry: ${company?.industry || 'Unknown'})
      Value: $${opportunity.value?.toLocaleString() || '0'}
      Stage: ${opportunity.stage || 'Unknown'}
      Probability: ${opportunity.probability || 0}%
      
      MEDDPICC Scores:
      - Metrics: ${opportunity.meddpicc?.metrics || 0}/10
      - Economic Buyer: ${opportunity.meddpicc?.economicBuyer || 0}/10
      - Decision Criteria: ${opportunity.meddpicc?.decisionCriteria || 0}/10
      - Decision Process: ${opportunity.meddpicc?.decisionProcess || 0}/10
      - Paper Process: ${opportunity.meddpicc?.paperProcess || 0}/10
      - Identify Pain: ${opportunity.meddpicc?.identifyPain || 0}/10
      - Champion: ${opportunity.meddpicc?.champion || 0}/10
      - Competition: ${opportunity.meddpicc?.competition || 0}/10
      
      Based on this data, provide 2-3 specific, actionable insights about:
      1. The biggest risk factors
      2. Key opportunities to accelerate the deal
      3. Recommended next steps
      
      Format as JSON array with objects containing: title, description, type (recommendation/warning/opportunity), confidence (0-100)
      `;

      const response = await spark.llm(prompt, 'gpt-4o-mini', true);
      const aiInsights = JSON.parse(response);

      return aiInsights.map((insight: any, index: number) => ({
        id: `ai-${index}`,
        type: insight.type || 'recommendation',
        category: 'process',
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence || 70,
        priority: insight.type === 'warning' ? 'high' : 'medium',
        source: 'ai-llm-analysis'
      }));

    } catch (error) {
      console.error('Error generating LLM insights:', error);
      return [];
    }
  }

  // Helper methods for scoring calculations
  private calculateMEDDPICCScore(opportunity: Partial<Opportunity>): number {
    if (!opportunity.meddpicc) return 0;
    
    const scores = [
      opportunity.meddpicc.metrics,
      opportunity.meddpicc.economicBuyer,
      opportunity.meddpicc.decisionCriteria,
      opportunity.meddpicc.decisionProcess,
      opportunity.meddpicc.paperProcess,
      opportunity.meddpicc.identifyPain,
      opportunity.meddpicc.champion,
      opportunity.meddpicc.competition
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length * 10;
  }

  private calculateTimingScore(opportunity: Partial<Opportunity>): number {
    if (!opportunity.expectedCloseDate) return 50;
    
    const closeDate = new Date(opportunity.expectedCloseDate);
    const today = new Date();
    const daysUntilClose = (closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    
    // Score based on reasonable timeline (30-120 days optimal)
    if (daysUntilClose < 0) return 0; // Past due
    if (daysUntilClose < 15) return 40; // Too aggressive
    if (daysUntilClose < 30) return 70; // Urgent but reasonable
    if (daysUntilClose < 120) return 90; // Optimal
    if (daysUntilClose < 365) return 70; // Long term
    return 40; // Too far out
  }

  private calculateValueScore(opportunity: Partial<Opportunity>, historicalData: Opportunity[]): number {
    const value = opportunity.value || 0;
    if (value === 0) return 0;
    
    if (historicalData.length === 0) return 70; // No benchmark
    
    const avgValue = historicalData.reduce((sum, opp) => sum + opp.value, 0) / historicalData.length;
    const ratio = value / avgValue;
    
    if (ratio > 2) return 95; // High value
    if (ratio > 1.5) return 85; // Above average
    if (ratio > 0.8) return 75; // Average range
    if (ratio > 0.5) return 60; // Below average
    return 40; // Low value
  }

  private calculateRelationshipScore(opportunity: Partial<Opportunity>): number {
    let score = 50; // Base score
    
    if (opportunity.contactId) score += 20; // Has primary contact
    if (opportunity.meddpicc?.champion && opportunity.meddpicc.champion > 7) score += 20; // Strong champion
    if (opportunity.meddpicc?.economicBuyer && opportunity.meddpicc.economicBuyer > 7) score += 10; // EB access
    
    return Math.min(100, score);
  }

  private calculateProcessScore(opportunity: Partial<Opportunity>): number {
    if (!opportunity.meddpicc) return 30;
    
    const processScores = [
      opportunity.meddpicc.decisionCriteria,
      opportunity.meddpicc.decisionProcess,
      opportunity.meddpicc.paperProcess
    ];
    
    return processScores.reduce((sum, score) => sum + score, 0) / processScores.length * 10;
  }

  private calculateCompetitionScore(opportunity: Partial<Opportunity>): number {
    return (opportunity.meddpicc?.competition || 5) * 10;
  }

  private estimateTimeToClose(opportunity: Partial<Opportunity>): number {
    const stage = opportunity.stage || 'prospect';
    const stageDays: Record<string, number> = {
      'prospect': 90,
      'qualify': 60,
      'engage': 45,
      'propose': 30,
      'negotiate': 15,
      'closed-won': 0,
      'closed-lost': 0
    };
    
    return stageDays[stage] || 60;
  }

  private calculateValueRange(opportunity: Partial<Opportunity>): { min: number; max: number } {
    const value = opportunity.value || 0;
    const uncertainty = 0.2; // 20% uncertainty
    
    return {
      min: Math.round(value * (1 - uncertainty)),
      max: Math.round(value * (1 + uncertainty))
    };
  }

  private identifyRiskFactors(opportunity: Partial<Opportunity>, score: OpportunityScore): string[] {
    const risks: string[] = [];
    
    if (score.meddpicc < 60) risks.push('Incomplete qualification');
    if (score.relationships < 60) risks.push('Limited stakeholder relationships');
    if (score.process < 60) risks.push('Unclear decision process');
    if (score.competition < 50) risks.push('Unknown competitive landscape');
    if (score.timing < 60) risks.push('Timing concerns');
    
    return risks;
  }

  private identifyAccelerators(opportunity: Partial<Opportunity>, score: OpportunityScore): string[] {
    const accelerators: string[] = [];
    
    if (score.meddpicc > 80) accelerators.push('Strong qualification foundation');
    if (score.relationships > 80) accelerators.push('Excellent stakeholder relationships');
    if (score.value > 80) accelerators.push('High-value opportunity');
    if (score.timing > 80) accelerators.push('Optimal timing');
    
    return accelerators;
  }

  private identifyCompetitorThreats(opportunity: Partial<Opportunity>): string[] {
    const threats: string[] = [];
    
    const competitionScore = opportunity.meddpicc?.competition || 5;
    
    if (competitionScore < 4) {
      threats.push('Unknown competitors may emerge');
    } else if (competitionScore < 7) {
      threats.push('Active competition present');
    }
    
    return threats;
  }
}

export const aiInsightsEngine = AIInsightsEngine.getInstance();