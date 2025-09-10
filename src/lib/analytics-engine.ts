import { Opportunity } from './types';

export interface DealData {
  id: string;
  name?: string;
  value: number;
  stage: string;
  probability: number;
  daysInStage?: number;
  totalDaysInPipeline?: number;
  lastActivity?: Date;
  activities?: Array<{
    id: string;
    type: string;
    outcome: string;
    notes: string;
    date: Date;
  }>;
  contacts?: Array<{
    id: string;
    name: string;
    role: string;
    influence: string;
    sentiment: string;
  }>;
  peakScores?: Record<string, number>;
  meddpiccScores?: Record<string, number>;
  closeDate?: Date;
  createdDate?: Date;
  competitor?: string;
}

export interface AnalyticsResult {
  dealHealth: 'healthy' | 'at-risk' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  score: number;
  trends: {
    velocity: 'accelerating' | 'stable' | 'slowing';
    engagement: 'increasing' | 'stable' | 'decreasing';
    competitive: 'strong' | 'moderate' | 'weak';
  };
  predictedCloseDate?: Date;
  confidenceLevel: number;
}

export class DealAnalyticsEngine {
  static analyzeDeal(deal: DealData): AnalyticsResult {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Stage analysis
    const daysInStage = deal.daysInStage || 0;
    if (daysInStage > 30) {
      riskFactors.push('Deal has been in current stage for over 30 days');
      recommendations.push('Review stage advancement criteria and take action to move forward');
      score -= 15;
    }

    // Activity analysis
    if (deal.lastActivity) {
      const daysSinceActivity = Math.floor((Date.now() - deal.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity > 14) {
        riskFactors.push('No recent activity (14+ days)');
        recommendations.push('Schedule follow-up meeting or call immediately');
        score -= 20;
      }
    }

    // Value analysis
    if (deal.value < 10000) {
      recommendations.push('Consider qualifying deal size and expansion opportunities');
    } else if (deal.value > 500000) {
      recommendations.push('Ensure senior stakeholder engagement for high-value deal');
    }

    // MEDDPICC analysis
    if (deal.meddpiccScores) {
      const avgMeddpicc = Object.values(deal.meddpiccScores).reduce((a, b) => a + b, 0) / Object.keys(deal.meddpiccScores).length;
      if (avgMeddpicc < 60) {
        riskFactors.push('Low MEDDPICC qualification score');
        recommendations.push('Focus on strengthening MEDDPICC qualification');
        score -= 10;
      }
    }

    // Determine health status
    let dealHealth: 'healthy' | 'at-risk' | 'critical';
    if (score >= 80) dealHealth = 'healthy';
    else if (score >= 60) dealHealth = 'at-risk';
    else dealHealth = 'critical';

    return {
      dealHealth,
      riskFactors,
      recommendations,
      score: Math.max(0, score),
      trends: {
        velocity: daysInStage > 30 ? 'slowing' : 'stable',
        engagement: deal.lastActivity && (Date.now() - deal.lastActivity.getTime()) < 7 * 24 * 60 * 60 * 1000 ? 'increasing' : 'decreasing',
        competitive: deal.competitor ? 'moderate' : 'strong'
      },
      confidenceLevel: Math.max(0, score)
    };
  }

  static analyzePortfolio(deals: DealData[]) {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const averageValue = deals.length > 0 ? totalValue / deals.length : 0;
    
    const stageDistribution = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const healthDistribution = deals.reduce((acc, deal) => {
      const analysis = this.analyzeDeal(deal);
      acc[analysis.dealHealth] = (acc[analysis.dealHealth] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDeals: deals.length,
      totalValue,
      averageValue,
      stageDistribution,
      healthDistribution,
      riskDeals: deals.filter(deal => this.analyzeDeal(deal).dealHealth !== 'healthy').length
    };
  }
}