import { Opportunity, MEDDPICC, Contact, Company, LeadScore, DealRiskAssessment, ScoringFactor, RiskFactor, RiskRecommendation } from './types';

/**
 * AI Service for FulQrun CRM Phase 2 Features
 * Provides AI-driven insights, MEDDPICC analysis, and next best actions
 */

export class AIService {
  /**
   * Analyze an opportunity and generate AI insights
   */
  static async analyzeOpportunity(opportunity: Opportunity, contact: Contact, company: Company) {
    const prompt = spark.llmPrompt`
    Analyze this sales opportunity and provide insights:
    
    Opportunity: ${opportunity.title}
    Company: ${company.name} (${company.industry}, ${company.size})
    Contact: ${contact.firstName} ${contact.lastName} (${contact.title})
    Value: $${opportunity.value}
    Stage: ${opportunity.stage}
    Current Probability: ${opportunity.probability}%
    Expected Close: ${opportunity.expectedCloseDate.toISOString()}
    
    MEDDPICC Qualification:
    - Metrics: ${opportunity.meddpicc.metrics}
    - Economic Buyer: ${opportunity.meddpicc.economicBuyer}
    - Decision Criteria: ${opportunity.meddpicc.decisionCriteria}
    - Decision Process: ${opportunity.meddpicc.decisionProcess}
    - Paper Process: ${opportunity.meddpicc.paperProcess}
    - Implicate Pain: ${opportunity.meddpicc.implicatePain}
    - Champion: ${opportunity.meddpicc.champion}
    
    Please provide:
    1. Risk score (0-100, higher = more risk)
    2. 3 specific next best actions
    3. Confidence level (low/medium/high)
    4. Predicted close date adjustment if needed
    5. Key risk factors identified
    
    Return as JSON with structure: {riskScore, nextBestActions, confidenceLevel, predictedCloseDate, riskFactors}
    `;
    
    try {
      const response = await spark.llm(prompt, 'gpt-4o', true);
      const insights = JSON.parse(response);
      
      return {
        riskScore: insights.riskScore || 50,
        nextBestActions: insights.nextBestActions || [],
        predictedCloseDate: insights.predictedCloseDate ? new Date(insights.predictedCloseDate) : undefined,
        confidenceLevel: insights.confidenceLevel || 'medium',
        competitorAnalysis: insights.competitorAnalysis,
        lastAiUpdate: new Date()
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        riskScore: 50,
        nextBestActions: ['Review MEDDPICC qualification', 'Schedule follow-up meeting', 'Validate decision timeline'],
        confidenceLevel: 'low' as const,
        lastAiUpdate: new Date()
      };
    }
  }

  /**
   * Generate MEDDPICC hints based on opportunity context
   */
  static async generateMEDDPICCHints(opportunity: Opportunity, company: Company) {
    const prompt = spark.llmPrompt`
    Generate MEDDPICC qualification hints for this opportunity:
    
    Company: ${company.name}
    Industry: ${company.industry}
    Company Size: ${company.size}
    Opportunity: ${opportunity.title}
    Description: ${opportunity.description}
    Value: $${opportunity.value}
    
    Provide specific, actionable hints for:
    1. Metrics questions to ask (3 suggestions)
    2. Champion identification strategies (3 suggestions) 
    3. Risk factors to investigate (3 suggestions)
    
    Return as JSON: {metricsHints, championHints, riskFactors}
    `;

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true);
      const hints = JSON.parse(response);
      
      return {
        metricsHints: hints.metricsHints || [],
        championHints: hints.championHints || [],
        riskFactors: hints.riskFactors || []
      };
    } catch (error) {
      console.error('MEDDPICC hints error:', error);
      return {
        metricsHints: ['What ROI metrics matter most to your organization?', 'How do you currently measure success in this area?', 'What cost savings or revenue impact would make this a priority?'],
        championHints: ['Who has advocated for similar initiatives in the past?', 'Who would benefit most from solving this problem?', 'Who has influence with the decision makers?'],
        riskFactors: ['Unclear decision timeline', 'Multiple vendors being evaluated', 'Budget not formally allocated']
      };
    }
  }

  /**
   * Generate performance insights for CSTPV metrics
   */
  static async analyzePerformance(opportunities: Opportunity[], userId: string) {
    const totalOpps = opportunities.length;
    const closedWon = opportunities.filter(o => o.stage === 'keep').length;
    const avgDealSize = opportunities.reduce((sum, o) => sum + o.value, 0) / totalOpps;
    
    const prompt = spark.llmPrompt`
    Analyze sales performance metrics:
    
    Total Opportunities: ${totalOpps}
    Closed Won: ${closedWon}
    Win Rate: ${((closedWon / totalOpps) * 100).toFixed(1)}%
    Average Deal Size: $${avgDealSize.toFixed(0)}
    
    Pipeline by Stage:
    ${opportunities.reduce((acc, o) => {
      acc[o.stage] = (acc[o.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)}
    
    Provide insights on:
    1. Performance strengths (return as array of strings)
    2. Areas for improvement (return as array of strings)
    3. Specific recommendations (return as array of strings)
    4. Benchmarking context (return as string)
    
    Return as JSON: {strengths: ["strength1", "strength2"], improvements: ["improvement1", "improvement2"], recommendations: ["rec1", "rec2"], benchmark: "benchmark text"}
    `;

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true);
      const parsed = JSON.parse(response);
      
      // Ensure all fields are properly formatted
      return {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [parsed.strengths].filter(Boolean),
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [parsed.improvements].filter(Boolean),
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [parsed.recommendations].filter(Boolean),
        benchmark: parsed.benchmark || 'Review industry standards for your sector'
      };
    } catch (error) {
      console.error('Performance analysis error:', error);
      return {
        strengths: ['Active pipeline management', 'Consistent follow-up practices'],
        improvements: ['Qualification consistency', 'Deal size optimization'],
        recommendations: ['Focus on MEDDPICC completion', 'Improve champion development', 'Accelerate decision processes'],
        benchmark: 'Review industry standards for your sector'
      };
    }
  }

  /**
   * Generate next best action recommendations
   */
  static getNextBestActions(opportunity: Opportunity): string[] {
    const actions: string[] = [];
    
    // MEDDPICC completeness check
    const medd = opportunity.meddpicc;
    if (!medd.metrics || medd.metrics.length < 10) {
      actions.push('Complete Metrics qualification - quantify the business impact');
    }
    if (!medd.economicBuyer || medd.economicBuyer.length < 5) {
      actions.push('Identify and engage the Economic Buyer');
    }
    if (!medd.champion || medd.champion.length < 5) {
      actions.push('Develop a Champion within the organization');
    }
    
    // Stage-specific recommendations
    switch (opportunity.stage) {
      case 'prospect':
        actions.push('Schedule discovery call to understand pain points');
        actions.push('Research company background and recent news');
        break;
      case 'engage':
        actions.push('Prepare and deliver value proposition presentation');
        actions.push('Map decision-making process and stakeholders');
        break;
      case 'acquire':
        actions.push('Submit proposal based on decision criteria');
        actions.push('Navigate paper process and procurement requirements');
        break;
      case 'keep':
        actions.push('Monitor customer success and expansion opportunities');
        actions.push('Gather case study and reference opportunities');
        break;
    }
    
    // Risk-based recommendations
    if (opportunity.probability < 50) {
      actions.push('Address key objections and concerns');
      actions.push('Validate decision timeline and budget authority');
    }
    
    return actions.slice(0, 4); // Return top 4 actions
  }

  /**
   * Advanced AI-Powered Lead Scoring
   */
  static async calculateLeadScore(contact: Contact, company: Company, engagementData?: any): Promise<LeadScore> {
    const prompt = spark.llmPrompt`
    Calculate comprehensive lead score for this prospect:
    
    Contact Information:
    - Name: ${contact.firstName} ${contact.lastName}
    - Title: ${contact.title}
    - Role: ${contact.role}
    - Email: ${contact.email}
    - Phone: ${contact.phone || 'Not provided'}
    
    Company Profile:
    - Name: ${company.name}
    - Industry: ${company.industry}
    - Size: ${company.size}
    - Website: ${company.website || 'Not provided'}
    
    Engagement Data: ${JSON.stringify(engagementData || {})}
    
    Analyze and score this lead on a 0-100 scale considering:
    1. Company fit (industry, size, growth potential)
    2. Contact authority and influence
    3. Engagement level and buying signals
    4. Budget and timing indicators
    5. Competition and market factors
    
    Provide detailed scoring factors with:
    - Factor name and score (0-100)
    - Weight importance (0-1)
    - Category (demographic/behavioral/engagement/firmographic/intent)
    - Impact (positive/negative/neutral)
    - Description
    
    Also include:
    - Overall letter grade (A/B/C/D/F)
    - Conversion probability (0-100)
    - Estimated deal value
    - Time to conversion (days)
    - AI insights with strengths, weaknesses, recommendations
    - Competitor risk level
    - Urgency score (1-10)
    
    Return as JSON: {
      score: number,
      grade: string,
      factors: [{name, value, weight, category, description, impact}],
      predictedConversionProbability: number,
      estimatedValue: number,
      timeToConversion: number,
      aiInsights: {
        strengths: string[],
        weaknesses: string[],
        recommendations: string[],
        competitorRisk: string,
        urgencyScore: number
      }
    }
    `;

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true);
      const result = JSON.parse(response);
      
      return {
        id: `score_${contact.id}_${Date.now()}`,
        contactId: contact.id,
        score: result.score || 50,
        grade: (result.grade as 'A' | 'B' | 'C' | 'D' | 'F') || 'C',
        factors: result.factors?.map((f: any) => ({
          name: f.name,
          value: f.value || 0,
          weight: f.weight || 1,
          category: f.category || 'demographic',
          description: f.description || '',
          impact: f.impact || 'neutral'
        })) || [],
        predictedConversionProbability: result.predictedConversionProbability || 25,
        estimatedValue: result.estimatedValue || 50000,
        timeToConversion: result.timeToConversion || 90,
        lastUpdated: new Date(),
        aiInsights: {
          strengths: result.aiInsights?.strengths || ['Company profile matches target market'],
          weaknesses: result.aiInsights?.weaknesses || ['Limited engagement data'],
          recommendations: result.aiInsights?.recommendations || ['Schedule discovery call'],
          competitorRisk: result.aiInsights?.competitorRisk || 'medium',
          urgencyScore: result.aiInsights?.urgencyScore || 5
        }
      };
    } catch (error) {
      console.error('Lead scoring error:', error);
      return this.getDefaultLeadScore(contact);
    }
  }

  /**
   * Comprehensive Deal Risk Assessment
   */
  static async assessDealRisk(opportunity: Opportunity, contact: Contact, company: Company): Promise<DealRiskAssessment> {
    const prompt = spark.llmPrompt`
    Perform comprehensive risk assessment for this sales opportunity:
    
    Opportunity Details:
    - Title: ${opportunity.title}
    - Value: $${opportunity.value}
    - Stage: ${opportunity.stage}
    - Probability: ${opportunity.probability}%
    - Expected Close: ${opportunity.expectedCloseDate.toISOString()}
    - Description: ${opportunity.description}
    
    MEDDPICC Analysis:
    - Metrics: ${opportunity.meddpicc.metrics}
    - Economic Buyer: ${opportunity.meddpicc.economicBuyer}
    - Decision Criteria: ${opportunity.meddpicc.decisionCriteria}
    - Decision Process: ${opportunity.meddpicc.decisionProcess}
    - Paper Process: ${opportunity.meddpicc.paperProcess}
    - Pain: ${opportunity.meddpicc.implicatePain}
    - Champion: ${opportunity.meddpicc.champion}
    - Current Score: ${opportunity.meddpicc.score}
    
    Contact & Company:
    - Contact: ${contact.firstName} ${contact.lastName} (${contact.title})
    - Role: ${contact.role}
    - Company: ${company.name} (${company.industry}, ${company.size})
    
    Analyze risk factors in these categories:
    1. MEDDPICC completeness and quality
    2. Timeline and urgency factors
    3. Budget and financial risks
    4. Competitive threats
    5. Stakeholder and champion strength
    6. Technical and implementation risks
    
    For each risk factor identified, provide:
    - Severity level (low/medium/high/critical)
    - Impact score (0-100)
    - Category
    - Description
    - Whether it's been mitigated
    
    Also predict:
    - Realistic close date
    - Actual close probability
    - Potential timeline slippage
    - Churn risk post-close
    - Competitive threat level
    
    Provide prioritized recommendations with:
    - Priority level
    - Specific action
    - Reasoning
    - Estimated impact
    - Timeframe
    - Required stakeholders
    
    Return as JSON: {
      overallRisk: string,
      riskScore: number,
      factors: [{name, severity, impact, category, description, mitigated}],
      predictions: {closeDate, closeProbability, potentialSlippage, churnRisk, competitiveThreat},
      recommendations: [{priority, action, reasoning, estimatedImpact, timeframe, stakeholders}],
      trendDirection: string
    }
    `;

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true);
      const result = JSON.parse(response);
      
      return {
        id: `risk_${opportunity.id}_${Date.now()}`,
        opportunityId: opportunity.id,
        overallRisk: result.overallRisk || 'medium',
        riskScore: result.riskScore || 50,
        factors: result.factors?.map((f: any) => ({
          name: f.name,
          severity: f.severity || 'medium',
          impact: f.impact || 50,
          category: f.category || 'meddpicc',
          description: f.description || '',
          detectedAt: new Date(),
          mitigated: f.mitigated || false,
          mitigationActions: f.mitigationActions
        })) || [],
        predictions: {
          closeDate: result.predictions?.closeDate ? new Date(result.predictions.closeDate) : opportunity.expectedCloseDate,
          closeProbability: result.predictions?.closeProbability || opportunity.probability,
          potentialSlippage: result.predictions?.potentialSlippage || 0,
          churnRisk: result.predictions?.churnRisk || 20,
          competitiveThreat: result.predictions?.competitiveThreat || 30
        },
        recommendations: result.recommendations?.map((r: any) => ({
          priority: r.priority || 'medium',
          action: r.action || '',
          reasoning: r.reasoning || '',
          estimatedImpact: r.estimatedImpact || 50,
          timeframe: r.timeframe || 'short_term',
          stakeholders: r.stakeholders || [],
          resources: r.resources || []
        })) || [],
        lastAssessment: new Date(),
        trendDirection: result.trendDirection || 'stable'
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      return this.getDefaultRiskAssessment(opportunity);
    }
  }

  /**
   * Predictive Pipeline Analysis
   */
  static async analyzePipelineForecast(opportunities: Opportunity[]) {
    const prompt = spark.llmPrompt`
    Analyze this sales pipeline and provide predictive insights:
    
    Pipeline Data:
    ${opportunities.map(opp => `
    - ${opp.title}: $${opp.value} (${opp.stage}, ${opp.probability}%, close: ${opp.expectedCloseDate.toISOString().split('T')[0]})
      MEDDPICC Score: ${opp.meddpicc.score}
    `).join('')}
    
    Provide analysis including:
    1. Pipeline health assessment
    2. Forecast accuracy predictions
    3. At-risk deals identification
    4. Revenue predictions by quarter
    5. Recommended actions for pipeline improvement
    6. Early warning indicators
    
    Return as JSON: {
      healthScore: number,
      forecastAccuracy: number,
      atRiskDeals: string[],
      quarterlyForecast: {q1: number, q2: number, q3: number, q4: number},
      recommendations: string[],
      earlyWarnings: string[]
    }
    `;

    try {
      const response = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Pipeline forecast error:', error);
      return {
        healthScore: 75,
        forecastAccuracy: 85,
        atRiskDeals: [],
        quarterlyForecast: { q1: 0, q2: 0, q3: 0, q4: 0 },
        recommendations: ['Improve MEDDPICC qualification', 'Focus on champion development'],
        earlyWarnings: ['Monitor deal velocity changes']
      };
    }
  }

  /**
   * Default lead score for fallback
   */
  private static getDefaultLeadScore(contact: Contact): LeadScore {
    return {
      id: `score_${contact.id}_${Date.now()}`,
      contactId: contact.id,
      score: 60,
      grade: 'C',
      factors: [
        {
          name: 'Contact Title Authority',
          value: 70,
          weight: 0.8,
          category: 'demographic',
          description: 'Decision-making authority based on title',
          impact: 'positive'
        }
      ],
      predictedConversionProbability: 30,
      estimatedValue: 75000,
      timeToConversion: 120,
      lastUpdated: new Date(),
      aiInsights: {
        strengths: ['Strong contact profile'],
        weaknesses: ['Limited engagement data'],
        recommendations: ['Schedule discovery call', 'Research company needs'],
        competitorRisk: 'medium',
        urgencyScore: 5
      }
    };
  }

  /**
   * Default risk assessment for fallback
   */
  private static getDefaultRiskAssessment(opportunity: Opportunity): DealRiskAssessment {
    return {
      id: `risk_${opportunity.id}_${Date.now()}`,
      opportunityId: opportunity.id,
      overallRisk: 'medium',
      riskScore: 40,
      factors: [
        {
          name: 'MEDDPICC Completeness',
          severity: 'medium',
          impact: 60,
          category: 'meddpicc',
          description: 'Some MEDDPICC elements need strengthening',
          detectedAt: new Date(),
          mitigated: false
        }
      ],
      predictions: {
        closeDate: opportunity.expectedCloseDate,
        closeProbability: opportunity.probability * 0.9,
        potentialSlippage: 15,
        churnRisk: 25,
        competitiveThreat: 35
      },
      recommendations: [
        {
          priority: 'high',
          action: 'Complete MEDDPICC qualification',
          reasoning: 'Incomplete qualification increases risk',
          estimatedImpact: 70,
          timeframe: 'short_term',
          stakeholders: ['Sales Rep', 'Sales Manager'],
          resources: ['MEDDPICC Framework', 'Qualification Checklist']
        }
      ],
      lastAssessment: new Date(),
      trendDirection: 'stable'
    };
  }
}