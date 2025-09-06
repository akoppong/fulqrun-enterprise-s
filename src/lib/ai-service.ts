import { Opportunity, MEDDPICC, Contact, Company } from './types';

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
}