/**
 * Predictive Analytics Engine
 * 
 * Uses machine learning algorithms and statistical models to predict
 * sales outcomes, identify risks, and provide actionable insights
 */

import { db } from '../database';
import type { Opportunity, Activity, MEDDPICC, PEAKProcess, User, Company } from '../database/schema';

export interface PredictionResult {
  probability: number;
  confidence: number;
  factors: Array<{ factor: string; impact: number; description: string }>;
  recommendations: string[];
}

export interface DealPrediction extends PredictionResult {
  opportunityId: string;
  winProbability: number;
  expectedCloseDate: string;
  riskFactors: string[];
  nextBestActions: string[];
}

export interface ChurnPrediction extends PredictionResult {
  companyId: string;
  churnRisk: 'low' | 'medium' | 'high';
  keyIndicators: string[];
  retentionStrategies: string[];
}

export interface ForecastPrediction {
  period: string;
  predictedRevenue: number;
  confidenceInterval: { low: number; high: number };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  keyDrivers: string[];
}

export class PredictiveAnalytics {
  /**
   * Predict win probability for an opportunity
   */
  async predictDealOutcome(opportunityId: string): Promise<DealPrediction> {
    const opportunity = await db.opportunities.findById(opportunityId);
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    // Get related data
    const [meddpicc, peak, activities, company, contact] = await Promise.all([
      db.meddpicc.findByOpportunityId(opportunityId),
      db.peakProcess.findByOpportunityId(opportunityId),
      db.activities.findAll({ filters: { opportunity_id: opportunityId } }),
      db.companies.findById(opportunity.company_id),
      opportunity.primary_contact_id ? db.contacts.findById(opportunity.primary_contact_id) : null
    ]);

    // Calculate base probability using multiple factors
    let baseScore = 0;
    const factors: Array<{ factor: string; impact: number; description: string }> = [];

    // MEDDPICC scoring factor (40% weight)
    if (meddpicc) {
      const meddpiccScore = meddpicc.total_score / 80; // Normalize to 0-1
      baseScore += meddpiccScore * 0.4;
      factors.push({
        factor: 'MEDDPICC Score',
        impact: meddpiccScore * 0.4,
        description: `MEDDPICC qualification score: ${meddpicc.total_score}/80`
      });
    }

    // PEAK process factor (20% weight)
    if (peak) {
      const peakScore = (peak.prospect_score + peak.engage_score + peak.acquire_score + peak.keep_score) / 400;
      baseScore += peakScore * 0.2;
      factors.push({
        factor: 'PEAK Process',
        impact: peakScore * 0.2,
        description: `PEAK methodology progress across all stages`
      });
    }

    // Deal size factor (15% weight)
    const averageDealSize = await this.getAverageDealSize();
    const sizeScore = Math.min(opportunity.value / averageDealSize, 2) / 2; // Cap at 2x average
    baseScore += sizeScore * 0.15;
    factors.push({
      factor: 'Deal Size',
      impact: sizeScore * 0.15,
      description: `Deal value relative to average: ${(opportunity.value / averageDealSize * 100).toFixed(0)}%`
    });

    // Activity engagement factor (10% weight)
    const activityScore = await this.calculateActivityEngagement(activities.data);
    baseScore += activityScore * 0.1;
    factors.push({
      factor: 'Activity Engagement',
      impact: activityScore * 0.1,
      description: `Recent engagement level based on activities`
    });

    // Time in stage factor (10% weight)
    const stageTimeScore = this.calculateStageTimeScore(opportunity, peak);
    baseScore += stageTimeScore * 0.1;
    factors.push({
      factor: 'Stage Progression',
      impact: stageTimeScore * 0.1,
      description: `Time spent in current stage vs. benchmarks`
    });

    // Company fit factor (5% weight)
    const companyScore = company ? this.calculateCompanyFitScore(company) : 0.5;
    baseScore += companyScore * 0.05;
    factors.push({
      factor: 'Company Fit',
      impact: companyScore * 0.05,
      description: `Company profile match with ideal customer`
    });

    const winProbability = Math.max(0, Math.min(1, baseScore)) * 100;

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(opportunity, meddpicc, peak, activities.data);

    // Generate recommendations
    const recommendations = this.generateRecommendations(opportunity, meddpicc, peak, riskFactors);

    // Predict expected close date
    const expectedCloseDate = this.predictCloseDate(opportunity, peak);

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(opportunity, meddpicc, peak, activities.data);

    return {
      opportunityId,
      winProbability,
      expectedCloseDate,
      probability: winProbability / 100,
      confidence,
      factors,
      recommendations,
      riskFactors,
      nextBestActions: recommendations.slice(0, 3) // Top 3 actions
    };
  }

  /**
   * Predict customer churn risk
   */
  async predictChurnRisk(companyId: string): Promise<ChurnPrediction> {
    const company = await db.companies.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }

    // Get company's opportunities and activities
    const { data: opportunities } = await db.opportunities.findAll({
      filters: { company_id: companyId }
    });

    const { data: activities } = await db.activities.findAll({
      filters: { 
        opportunity_id: { $in: opportunities.map(opp => opp.id) }
      }
    });

    let riskScore = 0;
    const factors: Array<{ factor: string; impact: number; description: string }> = [];
    const keyIndicators: string[] = [];

    // Engagement drop factor
    const engagementScore = this.calculateEngagementTrend(activities);
    riskScore += engagementScore;
    if (engagementScore > 0.3) {
      keyIndicators.push('Declining engagement in recent activities');
    }

    // Support ticket analysis (placeholder - would integrate with support system)
    const supportScore = 0.2; // Placeholder
    riskScore += supportScore;

    // Contract renewal proximity
    const renewalScore = this.calculateRenewalRisk(opportunities);
    riskScore += renewalScore;
    if (renewalScore > 0.2) {
      keyIndicators.push('Contract renewal approaching without engagement');
    }

    // Usage pattern analysis (placeholder - would integrate with product usage)
    const usageScore = 0.1; // Placeholder
    riskScore += usageScore;

    // Determine risk level
    let churnRisk: 'low' | 'medium' | 'high';
    if (riskScore < 0.3) churnRisk = 'low';
    else if (riskScore < 0.6) churnRisk = 'medium';
    else churnRisk = 'high';

    factors.push(
      { factor: 'Engagement Trend', impact: engagementScore, description: 'Recent activity and communication patterns' },
      { factor: 'Support Metrics', impact: supportScore, description: 'Support ticket volume and sentiment' },
      { factor: 'Renewal Risk', impact: renewalScore, description: 'Contract renewal timeline and preparation' },
      { factor: 'Usage Patterns', impact: usageScore, description: 'Product usage and adoption metrics' }
    );

    const retentionStrategies = this.generateRetentionStrategies(churnRisk, keyIndicators);

    return {
      companyId,
      churnRisk,
      probability: riskScore,
      confidence: 0.75, // Would calculate based on data availability
      factors,
      recommendations: retentionStrategies,
      keyIndicators,
      retentionStrategies
    };
  }

  /**
   * Generate revenue forecast
   */
  async generateForecast(
    period: 'month' | 'quarter' | 'year',
    includeNewBusiness: boolean = true
  ): Promise<ForecastPrediction> {
    const { data: opportunities } = await db.opportunities.findAll({
      filters: { stage: { $ne: 'closed-lost' } }
    });

    const activeOpportunities = opportunities.filter(opp => 
      !['closed-won', 'closed-lost'].includes(opp.stage)
    );

    // Calculate weighted pipeline value
    const weightedValue = activeOpportunities.reduce((sum, opp) => {
      return sum + (opp.value * (opp.probability / 100));
    }, 0);

    // Get historical win rates by stage
    const stageWinRates = await this.calculateHistoricalWinRates();

    // Adjust probabilities based on historical data
    let adjustedValue = 0;
    const keyDrivers: string[] = [];

    for (const opportunity of activeOpportunities) {
      const historicalRate = stageWinRates[opportunity.stage] || opportunity.probability;
      const adjustedProbability = (opportunity.probability + historicalRate) / 2;
      adjustedValue += opportunity.value * (adjustedProbability / 100);
    }

    // Add seasonal adjustments
    const seasonalMultiplier = this.getSeasonalMultiplier(period);
    const seasonalAdjustedValue = adjustedValue * seasonalMultiplier;

    // Calculate confidence intervals
    const variance = this.calculateForecastVariance(activeOpportunities);
    const standardDeviation = Math.sqrt(variance);
    
    const confidenceInterval = {
      low: seasonalAdjustedValue - (1.96 * standardDeviation),
      high: seasonalAdjustedValue + (1.96 * standardDeviation)
    };

    // Generate scenarios
    const scenarios = {
      pessimistic: seasonalAdjustedValue * 0.7,
      realistic: seasonalAdjustedValue,
      optimistic: seasonalAdjustedValue * 1.3
    };

    // Identify key drivers
    if (seasonalMultiplier > 1.1) keyDrivers.push('Seasonal uptick expected');
    if (activeOpportunities.length > 50) keyDrivers.push('High pipeline volume');
    
    const highValueDeals = activeOpportunities.filter(opp => opp.value > 100000);
    if (highValueDeals.length > 0) {
      keyDrivers.push(`${highValueDeals.length} high-value opportunities`);
    }

    return {
      period: this.getPeriodString(period),
      predictedRevenue: seasonalAdjustedValue,
      confidenceInterval,
      scenarios,
      keyDrivers
    };
  }

  /**
   * Identify at-risk deals
   */
  async identifyAtRiskDeals(): Promise<Array<{
    opportunity: Opportunity;
    riskLevel: 'low' | 'medium' | 'high';
    riskFactors: string[];
    recommendations: string[];
  }>> {
    const { data: opportunities } = await db.opportunities.findAll({
      filters: { 
        stage: { $nin: ['closed-won', 'closed-lost'] }
      }
    });

    const results = [];

    for (const opportunity of opportunities) {
      const prediction = await this.predictDealOutcome(opportunity.id);
      
      let riskLevel: 'low' | 'medium' | 'high';
      if (prediction.winProbability > 70) riskLevel = 'low';
      else if (prediction.winProbability > 40) riskLevel = 'medium';
      else riskLevel = 'high';

      if (riskLevel !== 'low') { // Only include medium and high risk deals
        results.push({
          opportunity,
          riskLevel,
          riskFactors: prediction.riskFactors,
          recommendations: prediction.recommendations
        });
      }
    }

    return results.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    });
  }

  // Private helper methods

  private async getAverageDealSize(): Promise<number> {
    const { data: closedWonOpportunities } = await db.opportunities.findAll({
      filters: { stage: 'closed-won' }
    });

    if (closedWonOpportunities.length === 0) return 50000; // Default

    return closedWonOpportunities.reduce((sum, opp) => sum + opp.value, 0) / closedWonOpportunities.length;
  }

  private async calculateActivityEngagement(activities: Activity[]): Promise<number> {
    if (activities.length === 0) return 0;

    const recentActivities = activities
      .filter(activity => {
        const activityDate = new Date(activity.created_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= thirtyDaysAgo;
      })
      .length;

    const positiveOutcomes = activities
      .filter(activity => activity.outcome === 'positive')
      .length;

    const engagementScore = (recentActivities / 10) + (positiveOutcomes / activities.length);
    return Math.min(engagementScore, 1);
  }

  private calculateStageTimeScore(opportunity: Opportunity, peak: PEAKProcess | null): number {
    if (!peak) return 0.5;

    const benchmarkDays = {
      prospect: 14,
      engage: 21,
      acquire: 30,
      keep: 7
    };

    const benchmark = benchmarkDays[opportunity.stage as keyof typeof benchmarkDays] || 21;
    const actualDays = peak.days_in_stage;

    // Score decreases as time in stage increases beyond benchmark
    const score = Math.max(0, (benchmark - actualDays + benchmark) / (2 * benchmark));
    return Math.min(score, 1);
  }

  private calculateCompanyFitScore(company: Company): number {
    let score = 0.5; // Base score

    // Industry alignment (placeholder logic)
    const targetIndustries = ['Technology', 'Healthcare', 'Finance'];
    if (targetIndustries.includes(company.industry)) {
      score += 0.2;
    }

    // Company size alignment
    if (company.size === 'Large' || company.size === 'Enterprise') {
      score += 0.2;
    }

    // Revenue alignment
    if (company.revenue && company.revenue > 10000000) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  private identifyRiskFactors(
    opportunity: Opportunity,
    meddpicc: MEDDPICC | null,
    peak: PEAKProcess | null,
    activities: Activity[]
  ): string[] {
    const risks: string[] = [];

    // MEDDPICC-based risks
    if (!meddpicc || meddpicc.total_score < 40) {
      risks.push('Low MEDDPICC qualification score');
    }
    if (meddpicc && meddpicc.economic_buyer < 5) {
      risks.push('Economic buyer not identified or engaged');
    }
    if (meddpicc && meddpicc.champion < 6) {
      risks.push('Weak champion support');
    }

    // Stage progression risks
    if (peak && peak.days_in_stage > 30) {
      risks.push('Deal stalled in current stage');
    }

    // Activity risks
    const recentActivities = activities.filter(activity => {
      const activityDate = new Date(activity.created_at);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return activityDate >= twoWeeksAgo;
    });

    if (recentActivities.length === 0) {
      risks.push('No recent activity or engagement');
    }

    const negativeActivities = activities.filter(activity => activity.outcome === 'negative');
    if (negativeActivities.length > activities.length * 0.3) {
      risks.push('High percentage of negative interactions');
    }

    // Timeline risks
    const daysToClose = (new Date(opportunity.expected_close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysToClose < 7 && opportunity.stage !== 'acquire') {
      risks.push('Close date approaching but deal not in final stage');
    }

    return risks;
  }

  private generateRecommendations(
    opportunity: Opportunity,
    meddpicc: MEDDPICC | null,
    peak: PEAKProcess | null,
    riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    // MEDDPICC-based recommendations
    if (!meddpicc || meddpicc.economic_buyer < 5) {
      recommendations.push('Identify and engage the economic buyer');
    }
    if (meddpicc && meddpicc.metrics < 6) {
      recommendations.push('Quantify business impact with specific metrics');
    }
    if (meddpicc && meddpicc.champion < 6) {
      recommendations.push('Strengthen champion relationship and support');
    }

    // Stage-specific recommendations
    switch (opportunity.stage) {
      case 'prospect':
        recommendations.push('Schedule discovery call to understand pain points');
        break;
      case 'engage':
        recommendations.push('Provide detailed demo and value proposition');
        break;
      case 'acquire':
        recommendations.push('Present final proposal and negotiate terms');
        break;
      case 'keep':
        recommendations.push('Ensure smooth implementation and early value realization');
        break;
    }

    // Risk-based recommendations
    if (riskFactors.includes('No recent activity or engagement')) {
      recommendations.push('Schedule immediate follow-up meeting');
    }
    if (riskFactors.includes('Deal stalled in current stage')) {
      recommendations.push('Review and address blockers preventing stage progression');
    }

    return recommendations;
  }

  private predictCloseDate(opportunity: Opportunity, peak: PEAKProcess | null): string {
    const currentDate = new Date();
    const currentStage = opportunity.stage;
    
    // Average days to close from each stage
    const averageDaysToClose = {
      prospect: 60,
      engage: 40,
      acquire: 20,
      keep: 10
    };

    const estimatedDays = averageDaysToClose[currentStage as keyof typeof averageDaysToClose] || 30;
    const predictedDate = new Date(currentDate.getTime() + estimatedDays * 24 * 60 * 60 * 1000);

    return predictedDate.toISOString();
  }

  private calculatePredictionConfidence(
    opportunity: Opportunity,
    meddpicc: MEDDPICC | null,
    peak: PEAKProcess | null,
    activities: Activity[]
  ): number {
    let confidence = 0.3; // Base confidence

    if (meddpicc) confidence += 0.3;
    if (peak) confidence += 0.2;
    if (activities.length > 0) confidence += 0.1;
    if (activities.length > 5) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  private calculateEngagementTrend(activities: Activity[]): number {
    // Calculate if engagement is declining over time
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const recentActivities = activities.filter(activity => 
      new Date(activity.created_at) >= thirtyDaysAgo
    ).length;

    const previousActivities = activities.filter(activity => {
      const date = new Date(activity.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;

    if (previousActivities === 0) return 0;

    const trendRatio = recentActivities / previousActivities;
    return Math.max(0, (1 - trendRatio) * 0.5); // Higher score = more risk
  }

  private calculateRenewalRisk(opportunities: Opportunity[]): number {
    // Check for upcoming renewals without recent engagement
    const activeOpportunities = opportunities.filter(opp => 
      !['closed-won', 'closed-lost'].includes(opp.stage)
    );

    const nearTermRenewals = opportunities.filter(opp => {
      const closeDate = new Date(opp.expected_close_date);
      const sixtyDaysFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      return closeDate <= sixtyDaysFromNow;
    });

    if (nearTermRenewals.length === 0) return 0;
    if (activeOpportunities.length === 0) return 0.4; // High risk if renewals but no active opps

    return Math.min(nearTermRenewals.length / (activeOpportunities.length + 1) * 0.3, 0.3);
  }

  private generateRetentionStrategies(
    riskLevel: 'low' | 'medium' | 'high',
    indicators: string[]
  ): string[] {
    const strategies: string[] = [];

    if (riskLevel === 'high') {
      strategies.push('Schedule immediate executive review meeting');
      strategies.push('Conduct satisfaction survey and address concerns');
      strategies.push('Develop customized retention offer');
    }

    if (riskLevel === 'medium' || riskLevel === 'high') {
      strategies.push('Increase check-in frequency with key stakeholders');
      strategies.push('Provide additional training and support resources');
    }

    strategies.push('Monitor usage patterns and provide proactive support');
    strategies.push('Share success stories and ROI metrics');

    return strategies;
  }

  private async calculateHistoricalWinRates(): Promise<Record<string, number>> {
    const { data: allOpportunities } = await db.opportunities.findAll();
    
    const stages = ['prospect', 'engage', 'acquire', 'keep'];
    const winRates: Record<string, number> = {};

    for (const stage of stages) {
      const stageOpportunities = allOpportunities.filter(opp => opp.stage === stage);
      const wonOpportunities = allOpportunities.filter(opp => 
        opp.stage === 'closed-won' // Assuming they moved through this stage
      );

      winRates[stage] = stageOpportunities.length > 0 ? 
        (wonOpportunities.length / (stageOpportunities.length + wonOpportunities.length)) * 100 : 50;
    }

    return winRates;
  }

  private getSeasonalMultiplier(period: 'month' | 'quarter' | 'year'): number {
    const currentMonth = new Date().getMonth();
    
    // Seasonal patterns (placeholder - would be based on historical data)
    const monthlyMultipliers = [
      0.9, 0.95, 1.1, 1.0, 1.05, 1.15, // Jan-Jun
      0.95, 0.9, 1.0, 1.1, 1.2, 1.25   // Jul-Dec
    ];

    return monthlyMultipliers[currentMonth] || 1.0;
  }

  private calculateForecastVariance(opportunities: Opportunity[]): number {
    const values = opportunities.map(opp => opp.value * (opp.probability / 100));
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private getPeriodString(period: 'month' | 'quarter' | 'year'): string {
    const now = new Date();
    
    switch (period) {
      case 'month':
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter}-${now.getFullYear()}`;
      case 'year':
        return now.getFullYear().toString();
    }
  }
}

export const predictiveAnalytics = new PredictiveAnalytics();