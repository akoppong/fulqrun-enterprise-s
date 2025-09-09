import { Contact, Company, LeadScore } from './types';

/**
 * Advanced Lead Prioritization Engine
 * Provides intelligent prospect ranking and automated action recommendations
 */
export class LeadPrioritizationEngine {
  /**
   * Calculate composite priority score using multiple weighted factors
   */
  static calculatePriorityScore(lead: LeadScore): number {
    const scoreWeight = lead.score * 0.3;
    const urgencyWeight = lead.aiInsights.urgencyScore * 10 * 0.25;
    const conversionWeight = lead.predictedConversionProbability * 0.25;
    const valueWeight = Math.min(lead.estimatedValue / 1000, 200) * 0.2; // Cap at 200K for fair weighting
    
    return Math.round(scoreWeight + urgencyWeight + conversionWeight + valueWeight);
  }

  /**
   * Determine lead priority tier based on composite factors
   */
  static getLeadTier(lead: LeadScore): 'platinum' | 'gold' | 'silver' | 'bronze' | 'nurture' {
    const priorityScore = this.calculatePriorityScore(lead);
    
    if (lead.score >= 85 && lead.aiInsights.urgencyScore >= 8 && lead.predictedConversionProbability >= 70) {
      return 'platinum';
    }
    if (lead.score >= 75 && (lead.aiInsights.urgencyScore >= 7 || lead.predictedConversionProbability >= 60)) {
      return 'gold';
    }
    if (lead.score >= 60 && (lead.aiInsights.urgencyScore >= 5 || lead.predictedConversionProbability >= 40)) {
      return 'silver';
    }
    if (lead.score >= 40) {
      return 'bronze';
    }
    return 'nurture';
  }

  /**
   * Get tier-specific styling
   */
  static getTierStyling(tier: string) {
    switch (tier) {
      case 'platinum':
        return {
          color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
          icon: '💎',
          priority: 1,
          description: 'Ultra-high priority - immediate action required'
        };
      case 'gold':
        return {
          color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
          icon: '🥇',
          priority: 2,
          description: 'High priority - action within 24 hours'
        };
      case 'silver':
        return {
          color: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
          icon: '🥈',
          priority: 3,
          description: 'Medium priority - action within 3 days'
        };
      case 'bronze':
        return {
          color: 'bg-gradient-to-r from-orange-400 to-orange-500 text-white',
          icon: '🥉',
          priority: 4,
          description: 'Standard priority - action within week'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700',
          icon: '🌱',
          priority: 5,
          description: 'Nurture - periodic check-ins'
        };
    }
  }

  /**
   * Generate next best action based on lead characteristics
   */
  static getNextBestAction(lead: LeadScore, contact: Contact, company: Company): {
    action: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    reasoning: string;
    timeframe: string;
  } {
    const tier = this.getLeadTier(lead);
    const lastUpdated = new Date(lead.lastUpdated);
    const hasRecentActivity = !isNaN(lastUpdated.getTime()) && 
      (new Date().getTime() - lastUpdated.getTime()) < 7 * 24 * 60 * 60 * 1000;

    if (tier === 'platinum') {
      return {
        action: `Schedule immediate call with ${contact.firstName}`,
        priority: 'urgent',
        reasoning: `Ultra-high score (${lead.score}) with high urgency (${lead.aiInsights.urgencyScore}/10) and strong conversion probability (${lead.predictedConversionProbability}%)`,
        timeframe: 'Within 2 hours'
      };
    }

    if (tier === 'gold') {
      if (lead.aiInsights.competitorRisk === 'high') {
        return {
          action: 'Address competitive threats immediately',
          priority: 'urgent',
          reasoning: 'High competitor risk detected with strong overall lead quality',
          timeframe: 'Within 4 hours'
        };
      }
      return {
        action: `Send personalized value proposition to ${contact.firstName}`,
        priority: 'high',
        reasoning: `Strong lead quality with ${lead.predictedConversionProbability}% conversion probability`,
        timeframe: 'Within 24 hours'
      };
    }

    if (tier === 'silver') {
      if (lead.predictedConversionProbability < 40 && lead.score >= 60) {
        return {
          action: 'Qualify pain points and decision criteria',
          priority: 'high',
          reasoning: 'Good profile but low conversion probability suggests qualification gaps',
          timeframe: 'Within 48 hours'
        };
      }
      return {
        action: 'Research company initiatives and pain points',
        priority: 'medium',
        reasoning: 'Moderate lead quality requires targeted approach',
        timeframe: 'Within 3 days'
      };
    }

    if (tier === 'bronze') {
      return {
        action: 'Add to nurture sequence with relevant content',
        priority: 'low',
        reasoning: 'Developing lead that needs education and relationship building',
        timeframe: 'Within 1 week'
      };
    }

    return {
      action: 'Monitor for engagement signals and company changes',
      priority: 'low',
      reasoning: 'Early-stage lead requiring nurturing until timing improves',
      timeframe: 'Monthly check-in'
    };
  }

  /**
   * Predict optimal outreach timing based on lead characteristics
   */
  static getOptimalOutreachTime(lead: LeadScore, contact: Contact): {
    preferredDay: string;
    preferredTime: string;
    confidence: number;
    reasoning: string;
  } {
    // Simple heuristics - in real implementation this would use ML models
    const isSeniorTitle = contact.title.toLowerCase().includes('vp') || 
                         contact.title.toLowerCase().includes('director') ||
                         contact.title.toLowerCase().includes('ceo') ||
                         contact.title.toLowerCase().includes('president');

    if (isSeniorTitle) {
      return {
        preferredDay: 'Tuesday or Wednesday',
        preferredTime: '9:00-10:00 AM or 2:00-3:00 PM',
        confidence: 75,
        reasoning: 'Senior executives typically prefer mid-week calls outside of peak meeting times'
      };
    }

    return {
      preferredDay: 'Tuesday through Thursday',
      preferredTime: '10:00-11:00 AM or 3:00-4:00 PM',
      confidence: 65,
      reasoning: 'Standard business hours with higher response rates mid-week'
    };
  }

  /**
   * Generate automated follow-up sequence based on lead tier
   */
  static getFollowUpSequence(lead: LeadScore, contact: Contact, company: Company): {
    day: number;
    channel: 'email' | 'call' | 'linkedin' | 'video';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[] {
    const tier = this.getLeadTier(lead);
    const firstName = contact.firstName;
    const companyName = company.name;

    if (tier === 'platinum' || tier === 'gold') {
      return [
        {
          day: 0,
          channel: 'call',
          message: `Initial outreach call to ${firstName} at ${companyName}`,
          priority: 'high'
        },
        {
          day: 1,
          channel: 'email',
          message: `Follow-up email with relevant case study for ${company.industry} industry`,
          priority: 'high'
        },
        {
          day: 3,
          channel: 'linkedin',
          message: `LinkedIn connection with personalized note referencing ${companyName}'s recent initiatives`,
          priority: 'medium'
        },
        {
          day: 7,
          channel: 'video',
          message: `Personalized video message addressing specific challenges in ${company.industry}`,
          priority: 'high'
        }
      ];
    }

    if (tier === 'silver') {
      return [
        {
          day: 0,
          channel: 'email',
          message: `Initial email with industry insights relevant to ${companyName}`,
          priority: 'medium'
        },
        {
          day: 3,
          channel: 'linkedin',
          message: `LinkedIn connection request with value-focused message`,
          priority: 'medium'
        },
        {
          day: 7,
          channel: 'call',
          message: `Follow-up call to discuss ${firstName}'s priorities`,
          priority: 'medium'
        }
      ];
    }

    return [
      {
        day: 0,
        channel: 'email',
        message: `Add to nurture sequence for ${company.industry} vertical`,
        priority: 'low'
      },
      {
        day: 14,
        channel: 'linkedin',
        message: `Connect and share valuable industry content`,
        priority: 'low'
      }
    ];
  }

  /**
   * Analyze lead portfolio and provide optimization recommendations
   */
  static analyzeLeadPortfolio(leads: LeadScore[]): {
    distribution: Record<string, number>;
    recommendations: string[];
    focusAreas: string[];
    riskAlerts: string[];
  } {
    const distribution = leads.reduce((acc, lead) => {
      const tier = this.getLeadTier(lead);
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recommendations: string[] = [];
    const focusAreas: string[] = [];
    const riskAlerts: string[] = [];

    const total = leads.length;
    const platinumPercent = (distribution.platinum || 0) / total * 100;
    const goldPercent = (distribution.gold || 0) / total * 100;
    const highValuePercent = platinumPercent + goldPercent;

    if (highValuePercent < 20) {
      recommendations.push('Focus on improving lead qualification to increase high-value prospects');
      focusAreas.push('Lead Quality Improvement');
    }

    if (platinumPercent > 30) {
      riskAlerts.push('High number of platinum leads may indicate resource constraints');
      recommendations.push('Consider expanding sales team or implementing lead distribution');
    }

    if (distribution.nurture && distribution.nurture > total * 0.4) {
      recommendations.push('Large nurture pool suggests opportunity for better lead qualification');
      focusAreas.push('Qualification Process');
    }

    const avgScore = leads.reduce((sum, lead) => sum + lead.score, 0) / total;
    if (avgScore < 50) {
      recommendations.push('Overall lead quality is below target - review lead sources');
      focusAreas.push('Lead Source Optimization');
    }

    return {
      distribution,
      recommendations,
      focusAreas,
      riskAlerts
    };
  }
}