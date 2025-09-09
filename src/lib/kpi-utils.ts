import { KPITarget, Opportunity, GoalTrackingEntry } from './types';

/**
 * Utility functions for KPI calculations and goal tracking
 */

export function calculateKPIProgress(kpi: KPITarget): number {
  if (kpi.targetValue === 0) return 0;
  return Math.min((kpi.currentValue / kpi.targetValue) * 100, 100);
}

export function determineKPIStatus(kpi: KPITarget): KPITarget['status'] {
  const progress = calculateKPIProgress(kpi);
  const now = new Date();
  const endDate = new Date(kpi.endDate);
  const startDate = new Date(kpi.startDate);
  
  // Check for valid dates
  if (isNaN(endDate.getTime()) || isNaN(startDate.getTime())) {
    return 'at_risk'; // Default status for invalid dates
  }
  
  const timeRemaining = endDate.getTime() - now.getTime();
  const totalTime = endDate.getTime() - startDate.getTime();
  const timeProgress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  // If we've exceeded the target
  if (progress >= 100) {
    return 'exceeded';
  }
  
  // If we've achieved the target (95-99%)
  if (progress >= 95) {
    return 'achieved';
  }
  
  // If we're on track (progress matches or exceeds time progress)
  if (progress >= timeProgress || progress >= 70) {
    return 'in_progress';
  }
  
  // If we're behind schedule
  if (progress < timeProgress * 0.8 || progress < 40) {
    return 'at_risk';
  }
  
  // If the end date has passed and we haven't achieved the target
  if (timeRemaining <= 0 && progress < 95) {
    return 'failed';
  }
  
  return 'in_progress';
}

export function calculateRevenueKPI(opportunities: Opportunity[], period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): number {
  const now = new Date();
  const startOfPeriod = getStartOfPeriod(now, period);
  
  return opportunities
    .filter(opp => {
      const oppDate = new Date(opp.updatedAt);
      return opp.stage === 'keep' && oppDate >= startOfPeriod && oppDate <= now;
    })
    .reduce((sum, opp) => sum + opp.value, 0);
}

export function calculateConversionRate(opportunities: Opportunity[], period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): number {
  const now = new Date();
  const startOfPeriod = getStartOfPeriod(now, period);
  
  const periodOpportunities = opportunities.filter(opp => {
    const oppDate = new Date(opp.createdAt);
    return oppDate >= startOfPeriod && oppDate <= now;
  });
  
  if (periodOpportunities.length === 0) return 0;
  
  const closedOpportunities = periodOpportunities.filter(opp => opp.stage === 'keep');
  return (closedOpportunities.length / periodOpportunities.length) * 100;
}

export function calculateAverageDealSize(opportunities: Opportunity[], period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): number {
  const now = new Date();
  const startOfPeriod = getStartOfPeriod(now, period);
  
  const closedDeals = opportunities.filter(opp => {
    const oppDate = new Date(opp.updatedAt);
    return opp.stage === 'keep' && oppDate >= startOfPeriod && oppDate <= now;
  });
  
  if (closedDeals.length === 0) return 0;
  
  const totalValue = closedDeals.reduce((sum, opp) => sum + opp.value, 0);
  return totalValue / closedDeals.length;
}

export function calculateAverageSalesCycle(opportunities: Opportunity[], period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): number {
  const now = new Date();
  const startOfPeriod = getStartOfPeriod(now, period);
  
  const closedDeals = opportunities.filter(opp => {
    const oppDate = new Date(opp.updatedAt);
    return opp.stage === 'keep' && 
           !isNaN(oppDate.getTime()) && 
           oppDate >= startOfPeriod && 
           oppDate <= now;
  });
  
  if (closedDeals.length === 0) return 0;
  
  const totalCycleDays = closedDeals.reduce((sum, opp) => {
    const createdDate = new Date(opp.createdAt);
    const closedDate = new Date(opp.updatedAt);
    
    // Check for valid dates
    if (isNaN(createdDate.getTime()) || isNaN(closedDate.getTime())) {
      return sum; // Skip invalid dates
    }
    
    const cycleDays = Math.floor((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + (cycleDays > 0 ? cycleDays : 0); // Ensure positive cycle days
  }, 0);
  
  return totalCycleDays / closedDeals.length;
}

export function generateKPIInsights(kpi: KPITarget, trackingEntries: GoalTrackingEntry[]): string[] {
  const insights: string[] = [];
  const progress = calculateKPIProgress(kpi);
  const recentEntries = trackingEntries
    .filter(entry => entry.kpiId === kpi.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  // Progress insights
  if (progress >= 100) {
    insights.push(`🎉 Excellent! You've exceeded your ${kpi.name.toLowerCase()} target by ${(progress - 100).toFixed(1)}%.`);
  } else if (progress >= 90) {
    insights.push(`🎯 You're very close to achieving your ${kpi.name.toLowerCase()} target. Only ${(100 - progress).toFixed(1)}% to go!`);
  } else if (progress >= 70) {
    insights.push(`📈 Good progress on ${kpi.name.toLowerCase()}. You're ${progress.toFixed(1)}% towards your target.`);
  } else if (progress >= 40) {
    insights.push(`⚠️ ${kpi.name} progress is behind. Consider reviewing your strategy to reach the target.`);
  } else {
    insights.push(`🚨 ${kpi.name} needs immediate attention. Current progress is only ${progress.toFixed(1)}%.`);
  }
  
  // Trend insights
  if (recentEntries.length >= 2) {
    const latest = recentEntries[0].value;
    const previous = recentEntries[1].value;
    const change = ((latest - previous) / previous) * 100;
    
    if (Math.abs(change) > 5) {
      const direction = change > 0 ? 'increased' : 'decreased';
      const emoji = change > 0 ? '📈' : '📉';
      insights.push(`${emoji} ${kpi.name} has ${direction} by ${Math.abs(change).toFixed(1)}% since last update.`);
    }
  }
  
  // Priority insights
  if (kpi.priority === 'critical' && progress < 80) {
    insights.push(`🔥 Critical KPI alert: ${kpi.name} requires urgent attention to meet business objectives.`);
  }
  
  // Time-based insights
  const now = new Date();
  const timeRemaining = new Date(kpi.endDate).getTime() - now.getTime();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  
  if (daysRemaining <= 7 && progress < 90) {
    insights.push(`⏰ Only ${daysRemaining} days left to reach your ${kpi.name.toLowerCase()} target.`);
  }
  
  return insights;
}

export function generateRecommendations(kpi: KPITarget, opportunities: Opportunity[]): string[] {
  const recommendations: string[] = [];
  const progress = calculateKPIProgress(kpi);
  
  switch (kpi.type) {
    case 'revenue':
      if (progress < 70) {
        recommendations.push('Focus on closing deals in the "Acquire" stage');
        recommendations.push('Review pricing strategy for upcoming opportunities');
        recommendations.push('Accelerate deal velocity by removing bottlenecks');
      }
      break;
      
    case 'conversion':
      if (progress < 70) {
        recommendations.push('Improve lead qualification using MEDDPICC framework');
        recommendations.push('Enhance prospect engagement strategies');
        recommendations.push('Review and optimize sales process efficiency');
      }
      break;
      
    case 'time':
      if (kpi.name.toLowerCase().includes('cycle') && progress > 100) {
        recommendations.push('Document successful practices for faster deal closure');
        recommendations.push('Share winning strategies with the team');
        recommendations.push('Consider raising efficiency targets');
      } else if (progress < 70) {
        recommendations.push('Streamline approval processes');
        recommendations.push('Improve prospect qualification to reduce cycle time');
        recommendations.push('Use automation tools to speed up repetitive tasks');
      }
      break;
      
    case 'volume':
      if (progress < 70) {
        recommendations.push('Increase prospecting activities');
        recommendations.push('Expand lead generation channels');
        recommendations.push('Focus on referral programs');
      }
      break;
  }
  
  // General recommendations based on status
  if (kpi.status === 'at_risk') {
    recommendations.push('Schedule weekly check-ins to monitor progress');
    recommendations.push('Consider adjusting target or timeline if needed');
    recommendations.push('Identify and remove any blockers');
  }
  
  return recommendations;
}

function getStartOfPeriod(date: Date, period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'): Date {
  const result = new Date(date);
  
  switch (period) {
    case 'daily':
      result.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      const dayOfWeek = result.getDay();
      result.setDate(result.getDate() - dayOfWeek);
      result.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'quarterly':
      const quarterStartMonth = Math.floor(result.getMonth() / 3) * 3;
      result.setMonth(quarterStartMonth, 1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
}

export function formatKPIValue(value: number, unit: string): string {
  if (unit === '$') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  
  if (['days', 'hours'].includes(unit)) {
    return `${Math.round(value)} ${unit}`;
  }
  
  return `${value.toLocaleString()}${unit}`;
}

export function getKPITrendDirection(current: number, target: number, previous?: number): 'up' | 'down' | 'stable' {
  if (!previous) {
    return current >= target * 0.8 ? 'up' : 'down';
  }
  
  const change = ((current - previous) / previous) * 100;
  
  if (Math.abs(change) < 2) return 'stable';
  return change > 0 ? 'up' : 'down';
}

export function calculateKPIVelocity(trackingEntries: GoalTrackingEntry[], kpiId: string, days: number = 7): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentEntries = trackingEntries
    .filter(entry => entry.kpiId === kpiId && new Date(entry.timestamp) >= cutoffDate)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  if (recentEntries.length < 2) return 0;
  
  const firstEntry = recentEntries[0];
  const lastEntry = recentEntries[recentEntries.length - 1];
  const timeDiff = new Date(lastEntry.timestamp).getTime() - new Date(firstEntry.timestamp).getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  if (daysDiff === 0) return 0;
  
  return (lastEntry.value - firstEntry.value) / daysDiff;
}