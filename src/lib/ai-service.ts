import { Opportunity, MEDDPICC, Contact, Company, LeadScore, DealRiskAssessment, ScoringFactor, RiskFactor, RiskRecommendation, CustomerSegment } from './types/index';
import { SegmentUtils } from './segment-utils';

/**
 * AI Service for FulQrun CRM Phase 2 Features
 * Provides AI-driven insights, MEDDPICC analysis, and next best actions
 */

export class AIService {
  private static readonly TIMEOUT_MS = 30000; // 30 seconds
  private static readonly RETRY_ATTEMPTS = 2;

  /**
   * Execute LLM call with timeout and retry logic
   */
  private static async callLLMWithTimeout(prompt: string, model = 'gpt-4o', jsonMode = true): Promise<string> {
    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT_MS);
        });

        const llmPromise = spark.llm(prompt, model, jsonMode);
        const response = await Promise.race([llmPromise, timeoutPromise]);
        return response;
      } catch (error) {
        console.warn(`LLM call attempt ${attempt} failed:`, error);
        if (attempt === this.RETRY_ATTEMPTS) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('All retry attempts failed');
  }

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
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
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
      
      // Check if it's a timeout error and provide specific feedback
      const errorMessage = error instanceof Error && error.message.includes('timeout') 
        ? 'AI service temporarily unavailable (timeout)'
        : 'AI analysis unavailable';
      
      return {
        riskScore: 50,
        nextBestActions: [`Service issue: ${errorMessage}`, 'Review MEDDPICC qualification', 'Schedule follow-up meeting'],
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
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
      const hints = JSON.parse(response);
      
      return {
        metricsHints: hints.metricsHints || [],
        championHints: hints.championHints || [],
        riskFactors: hints.riskFactors || []
      };
    } catch (error) {
      console.error('MEDDPICC hints error:', error);
      
      const errorMessage = error instanceof Error && error.message.includes('timeout') 
        ? 'AI hints unavailable (timeout)' 
        : 'AI hints unavailable';
      
      return {
        metricsHints: [errorMessage, 'What ROI metrics matter most to your organization?', 'How do you currently measure success in this area?'],
        championHints: [errorMessage, 'Who has advocated for similar initiatives in the past?', 'Who would benefit most from solving this problem?'],
        riskFactors: [errorMessage, 'Unclear decision timeline', 'Multiple vendors being evaluated']
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
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
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
      const errorMessage = error instanceof Error && error.message.includes('timeout') 
        ? 'Performance analysis timed out' 
        : 'Performance analysis failed';
      
      return {
        strengths: [errorMessage, 'Active pipeline management', 'Consistent follow-up practices'],
        improvements: ['AI analysis unavailable - manual review needed', 'Qualification consistency'],
        recommendations: ['Retry performance analysis when service is available', 'Focus on MEDDPICC completion'],
        benchmark: 'AI benchmark analysis currently unavailable'
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
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
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
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      const defaultScore = this.getDefaultLeadScore(contact);
      
      // Add timeout context to the default score
      if (isTimeout) {
        defaultScore.factors.unshift({
          name: 'AI Service',
          value: 0,
          weight: 10,
          impact: 'Scoring timed out - using fallback analysis'
        });
        defaultScore.recommendations = [`AI scoring timed out - manual review recommended`, ...defaultScore.recommendations.slice(0, 2)];
      }
      
      return defaultScore;
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
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
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
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      const defaultAssessment = this.getDefaultRiskAssessment(opportunity);
      
      // Add timeout context to the default assessment
      if (isTimeout) {
        defaultAssessment.factors.unshift({
          category: 'System',
          risk: 'AI risk assessment timed out',
          impact: 'Medium',
          probability: 100,
          mitigation: 'Complete manual risk assessment'
        });
        defaultAssessment.recommendations.unshift('AI assessment failed - conduct manual review');
        defaultAssessment.confidence = 30;
      }
      
      return defaultAssessment;
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
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Pipeline forecast error:', error);
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      
      return {
        healthScore: isTimeout ? 50 : 75,
        forecastAccuracy: isTimeout ? 60 : 85,
        atRiskDeals: isTimeout ? ['AI analysis timed out - manual review required'] : [],
        quarterlyForecast: { q1: 0, q2: 0, q3: 0, q4: 0 },
        recommendations: [
          isTimeout ? 'AI forecast timed out - conduct manual analysis' : 'Improve MEDDPICC qualification', 
          'Focus on champion development'
        ],
        earlyWarnings: [isTimeout ? 'AI forecasting service unavailable' : 'Monitor deal velocity changes']
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
   * AI-Powered Customer Segment Assignment
   */
  static async assignCustomerSegment(company: Company, segments: CustomerSegment[]): Promise<{
    segmentId: string;
    confidence: number;
    reasoning: string;
    strategicInsights: string[];
    alternativeSegments: { segmentId: string; confidence: number; reason: string }[];
  }> {
    const prompt = spark.llmPrompt`
    Analyze this company profile and determine the best customer segment assignment:
    
    Company Profile:
    - Name: ${company.name}
    - Industry: ${company.industry}
    - Size: ${company.size}
    - Revenue: ${company.revenue ? `$${company.revenue.toLocaleString()}` : 'Not provided'}
    - Employees: ${company.employees ? company.employees.toLocaleString() : 'Not provided'}
    - Geography: ${company.geography || 'Not specified'}
    - Website: ${company.website || 'Not provided'}
    - Custom Fields: ${JSON.stringify(company.customFields || {})}
    
    Available Customer Segments:
    ${segments.map((segment, index) => `
    ${index + 1}. ${segment.name} (ID: ${segment.id})
       Description: ${segment.description}
       Revenue Criteria: $${segment.criteria.revenue.min?.toLocaleString() || 0} - $${segment.criteria.revenue.max?.toLocaleString() || 'unlimited'}
       Industries: ${segment.criteria.industry.join(', ')}
       Company Size: ${segment.criteria.companySize.min || 0} - ${segment.criteria.companySize.max || 'unlimited'} employees
       Geography: ${segment.criteria.geography.join(', ')}
       Characteristics:
       - Avg Deal Size: $${segment.characteristics.avgDealSize.toLocaleString()}
       - Sales Cycle: ${segment.characteristics.avgSalesCycle} days
       - Common Pain Points: ${segment.characteristics.commonPainPoints.join(', ')}
       - Decision Makers: ${segment.characteristics.decisionMakers.join(', ')}
       Strategy:
       - Messaging: ${segment.strategy.messaging.join(', ')}
       - Channels: ${segment.strategy.channels.join(', ')}
       - Touchpoints: ${segment.strategy.touchpoints}
    `).join('')}
    
    Please analyze the company and provide:
    1. Primary segment assignment with confidence score (0-100)
    2. Detailed reasoning for the assignment
    3. Strategic insights about how to approach this customer
    4. Top 2 alternative segment options with confidence scores
    5. Key factors that influenced the decision
    
    Consider:
    - Exact matches vs. strategic potential
    - Growth trajectory and market position
    - Buying behavior patterns
    - Value alignment with segment characteristics
    - Competitive landscape in their industry
    
    Return as JSON: {
      primarySegment: {
        segmentId: string,
        confidence: number,
        reasoning: string
      },
      strategicInsights: string[],
      alternativeSegments: [
        {segmentId: string, confidence: number, reason: string}
      ],
      keyFactors: string[]
    }
    `;

    try {
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
      const result = JSON.parse(response);
      
      return {
        segmentId: result.primarySegment?.segmentId || segments[0]?.id,
        confidence: result.primarySegment?.confidence || 50,
        reasoning: result.primarySegment?.reasoning || 'AI analysis completed with limited data',
        strategicInsights: result.strategicInsights || [
          'Consider company growth trajectory',
          'Evaluate decision-making process',
          'Assess competitive landscape'
        ],
        alternativeSegments: result.alternativeSegments?.slice(0, 2) || []
      };
    } catch (error) {
      console.error('AI segment assignment error:', error);
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      
      // Fallback to rule-based assignment
      const fallback = SegmentUtils.findBestSegmentMatch(company, segments);
      return {
        segmentId: fallback?.segment.id || segments[0]?.id,
        confidence: isTimeout ? 30 : (fallback?.confidence || 50),
        reasoning: isTimeout 
          ? 'AI assignment timed out - using rule-based fallback' 
          : (fallback?.reason || 'Fallback assignment based on basic criteria'),
        strategicInsights: [
          isTimeout ? 'AI insights unavailable due to timeout' : 'Review company profile for additional strategic context',
          'Validate segment fit through direct engagement'
        ],
        alternativeSegments: []
      };
    }
  }

  /**
   * Generate Strategic Segment Insights
   */
  static async generateSegmentInsights(segment: CustomerSegment, companies: Company[]): Promise<{
    performance: string;
    trends: string[];
    opportunities: string[];
    recommendations: string[];
    competitivePosition: string;
  }> {
    const segmentCompanies = companies.filter(c => c.segmentId === segment.id);
    const totalRevenue = segmentCompanies.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const avgRevenue = segmentCompanies.length > 0 ? totalRevenue / segmentCompanies.length : 0;
    
    const industriesDistribution = segmentCompanies.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prompt = spark.llmPrompt`
    Generate strategic insights for this customer segment:
    
    Segment: ${segment.name}
    Description: ${segment.description}
    
    Current Performance:
    - Total Companies: ${segmentCompanies.length}
    - Total Revenue: $${totalRevenue.toLocaleString()}
    - Average Revenue: $${avgRevenue.toLocaleString()}
    - Industries: ${Object.entries(industriesDistribution).map(([industry, count]) => `${industry} (${count})`).join(', ')}
    
    Segment Characteristics:
    - Target Deal Size: $${segment.characteristics.avgDealSize.toLocaleString()}
    - Target Sales Cycle: ${segment.characteristics.avgSalesCycle} days
    - Decision Makers: ${segment.characteristics.decisionMakers.join(', ')}
    - Common Pain Points: ${segment.characteristics.commonPainPoints.join(', ')}
    - Buying Process: ${segment.characteristics.buyingProcess}
    
    Strategy Framework:
    - Messaging: ${segment.strategy.messaging.join(', ')}
    - Channels: ${segment.strategy.channels.join(', ')}
    - Target Touchpoints: ${segment.strategy.touchpoints}
    - Cadence: ${segment.strategy.cadence}
    
    Provide strategic analysis including:
    1. Performance assessment of this segment
    2. Market trends affecting this segment (3-4 trends)
    3. Growth opportunities within this segment (3-4 opportunities)
    4. Strategic recommendations for optimization (4-5 recommendations)
    5. Competitive positioning analysis
    
    Return as JSON: {
      performance: string,
      trends: string[],
      opportunities: string[],
      recommendations: string[],
      competitivePosition: string
    }
    `;

    try {
      const response = await this.callLLMWithTimeout(prompt, 'gpt-4o', true);
      const result = JSON.parse(response);
      
      return {
        performance: result.performance || 'Segment performance analysis in progress',
        trends: result.trends || ['Market evolution', 'Technology adoption', 'Buyer behavior shifts'],
        opportunities: result.opportunities || ['Segment expansion', 'Value proposition enhancement'],
        recommendations: result.recommendations || ['Strengthen positioning', 'Optimize approach'],
        competitivePosition: result.competitivePosition || 'Competitive analysis pending'
      };
    } catch (error) {
      console.error('Segment insights error:', error);
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      
      return {
        performance: isTimeout 
          ? `AI analysis timed out - ${segmentCompanies.length} companies, avg revenue ${avgRevenue.toLocaleString()}`
          : `Segment contains ${segmentCompanies.length} companies with average revenue of ${avgRevenue.toLocaleString()}`,
        trends: [
          isTimeout ? 'AI trend analysis unavailable' : 'Digital transformation acceleration', 
          'Cost optimization focus', 
          'Remote work adaptation'
        ],
        opportunities: [
          isTimeout ? 'AI opportunities analysis failed' : 'Expand into adjacent markets', 
          'Develop partnership channels'
        ],
        recommendations: [
          isTimeout ? 'Retry AI analysis when service available' : 'Refine targeting criteria', 
          'Enhance value proposition'
        ],
        competitivePosition: isTimeout ? 'AI competitive analysis timed out' : 'Market position assessment needed'
      };
    }
  }

  /**
   * Bulk AI-Powered Segment Assignment
   */
  static async bulkAssignSegments(companies: Company[], segments: CustomerSegment[]): Promise<{
    assignments: { companyId: string; segmentId: string; confidence: number; reasoning: string }[];
    insights: { totalAssigned: number; highConfidence: number; requiresReview: number };
    recommendations: string[];
  }> {
    const assignments: { companyId: string; segmentId: string; confidence: number; reasoning: string }[] = [];
    let highConfidence = 0;
    let requiresReview = 0;

    // Process companies in smaller batches to avoid overwhelming the AI
    const batchSize = 5;
    const unassignedCompanies = companies.filter(c => !c.segmentId);
    
    for (let i = 0; i < unassignedCompanies.length; i += batchSize) {
      const batch = unassignedCompanies.slice(i, i + batchSize);
      
      for (const company of batch) {
        try {
          const assignment = await this.assignCustomerSegment(company, segments);
          assignments.push({
            companyId: company.id,
            segmentId: assignment.segmentId,
            confidence: assignment.confidence,
            reasoning: assignment.reasoning
          });
          
          if (assignment.confidence >= 80) {
            highConfidence++;
          } else if (assignment.confidence < 60) {
            requiresReview++;
          }
        } catch (error) {
          console.error(`Error assigning segment for company ${company.id}:`, error);
          // Use fallback logic
          const fallback = SegmentUtils.findBestSegmentMatch(company, segments);
          if (fallback) {
            assignments.push({
              companyId: company.id,
              segmentId: fallback.segment.id,
              confidence: fallback.confidence,
              reasoning: fallback.reason
            });
            if (fallback.confidence < 60) requiresReview++;
          }
        }
      }
      
      // Add small delay between batches to avoid rate limits
      if (i + batchSize < unassignedCompanies.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const recommendations = [
      `Assigned ${assignments.length} companies to segments`,
      `${highConfidence} assignments have high confidence (≥80%)`,
      requiresReview > 0 ? `${requiresReview} assignments need manual review (<60% confidence)` : 'All assignments above 60% confidence',
      'Review strategic fit for low-confidence assignments',
      'Consider creating new segments for unmatched company profiles'
    ].filter(Boolean);

    return {
      assignments,
      insights: {
        totalAssigned: assignments.length,
        highConfidence,
        requiresReview
      },
      recommendations
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