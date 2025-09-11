import { PipelineMetrics, Opportunity } from './types/index';
import { safeGetTime } from './date-helpers';

export const calculatePipelineMetrics = (opportunities: Opportunity[]): PipelineMetrics => {
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const totalOpportunities = opportunities.length;
  
  const stageDistribution = opportunities.reduce((acc, opp) => {
    acc[opp.stage] = (acc[opp.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average sales cycle (mock implementation)
  const averageSalesCycle = opportunities.length > 0 
    ? opportunities.reduce((sum, opp) => {
        const createdTime = safeGetTime(opp.createdAt);
        if (createdTime === 0) {
          return sum; // Skip invalid dates
        }
        const daysSinceCreated = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
        return sum + daysSinceCreated;
      }, 0) / opportunities.length
    : 0;

  // Calculate conversion rate based on closed deals
  const closedWonDeals = opportunities.filter(opp => opp.stage === 'keep').length;
  const conversionRate = totalOpportunities > 0 ? (closedWonDeals / totalOpportunities) * 100 : 0;

  return {
    totalValue,
    totalOpportunities,
    averageDealSize: totalOpportunities > 0 ? totalValue / totalOpportunities : 0,
    averageSalesCycle,
    conversionRate,
    stageDistribution: {
      prospect: stageDistribution.prospect || 0,
      engage: stageDistribution.engage || 0,
      acquire: stageDistribution.acquire || 0,
      keep: stageDistribution.keep || 0,
    }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const getMEDDPICCScore = (meddpicc: any): number => {
  // If a score is explicitly provided, use it
  if (meddpicc.score !== undefined && typeof meddpicc.score === 'number') {
    return Math.min(100, Math.max(0, meddpicc.score));
  }
  
  // Otherwise calculate based on completed fields
  const fields = [
    meddpicc.metrics,
    meddpicc.economicBuyer,
    meddpicc.decisionCriteria,
    meddpicc.decisionProcess,
    meddpicc.paperProcess,
    meddpicc.implicatePain,
    meddpicc.champion
  ];
  
  const completedFields = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((completedFields / fields.length) * 100);
};

export const getStageProgress = (stage: string): number => {
  const stageMap = {
    prospect: 25,
    engage: 50,
    acquire: 75,
    keep: 100
  };
  return stageMap[stage as keyof typeof stageMap] || 0;
};