/**
 * AI-powered analytics and predictive features
 */

export interface LeadScore {
  id: string;
  contactId: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: ScoringFactor[];
  predictedConversionProbability: number;
  estimatedValue: number;
  timeToConversion: number; // days
  lastUpdated: string; // ISO date string for reliable serialization
  aiInsights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    competitorRisk: 'low' | 'medium' | 'high';
    urgencyScore: number; // 1-10
  };
}

export interface ScoringFactor {
  name: string;
  value: number;
  weight: number;
  category: 'demographic' | 'behavioral' | 'engagement' | 'firmographic' | 'intent';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface DealRiskAssessment {
  id: string;
  opportunityId: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  factors: RiskFactor[];
  predictions: {
    closeDate: string; // ISO date string for reliable serialization
    closeProbability: number;
    potentialSlippage: number; // days
    churnRisk: number; // 0-100
    competitiveThreat: number; // 0-100
  };
  recommendations: RiskRecommendation[];
  lastAssessment: string; // ISO date string for reliable serialization
  trendDirection: 'improving' | 'stable' | 'deteriorating';
}

export interface RiskFactor {
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0-100
  category: 'meddpicc' | 'timeline' | 'budget' | 'competition' | 'stakeholder' | 'technical';
  description: string;
  detectedAt: string; // ISO date string for reliable serialization
  mitigated: boolean;
  mitigationActions?: string[];
}

export interface RiskRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  reasoning: string;
  estimatedImpact: number; // 0-100
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  stakeholders: string[];
  resources: string[];
}

export interface AIModelConfig {
  id: string;
  name: string;
  type: 'lead_scoring' | 'risk_assessment' | 'conversion_prediction' | 'churn_prediction';
  version: string;
  isActive: boolean;
  accuracy: number;
  lastTrained: string; // ISO date string for reliable serialization
  trainingDataSize: number;
  features: string[];
  parameters: Record<string, any>;
}

export interface PredictiveAnalytics {
  id: string;
  type: 'pipeline_forecast' | 'deal_probability' | 'lead_conversion' | 'churn_prediction';
  predictions: PredictionResult[];
  confidence: number;
  timeHorizon: number; // days
  generatedAt: string; // ISO date string for reliable serialization
  modelUsed: string;
}

export interface PredictionResult {
  entityId: string; // opportunity ID, contact ID, etc.
  entityType: 'opportunity' | 'contact' | 'account';
  prediction: number;
  confidence: number;
  factors: string[];
  recommendation: string;
}