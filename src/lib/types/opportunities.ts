/**
 * Opportunity and MEDDPICC qualification types
 */

export interface MEDDPICC {
  metrics: string; // What economic impact can we measure?
  economicBuyer: string; // Who has the economic authority?
  decisionCriteria: string; // What criteria will they use to decide?
  decisionProcess: string; // How will they make the decision?
  paperProcess: string; // What's the approval/procurement process?
  implicatePain: string; // What pain are we addressing?
  champion: string; // Who is actively selling for us?
  score: number; // 0-100 qualification score
  aiHints?: {
    metricsHints: string[];
    championHints: string[];
    riskFactors: string[];
  };
  lastAiAnalysis?: string; // ISO date string for reliable serialization
}

export interface Opportunity {
  id: string;
  companyId: string;
  contactId: string;
  title: string;
  name: string; // Opportunity name for display
  description: string;
  value: number;
  stage: string; // Changed to string to support custom pipeline stages
  pipelineId?: string; // Pipeline configuration ID
  probability: number;
  expectedCloseDate: string; // ISO date string for reliable serialization
  ownerId: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  industry?: string;
  leadSource?: string;
  source?: string; // Lead source alternative field
  tags?: string[];
  meddpicc: MEDDPICC;
  // Additional fields for enhanced opportunity management
  company?: string; // Company name for display
  primaryContact?: string; // Primary contact name
  contactEmail?: string;
  contactPhone?: string;
  competitor?: string;
  // Activity tracking
  activities?: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal';
    outcome: 'positive' | 'neutral' | 'negative';
    notes: string;
    date: string | Date; // Support both formats for date handling
  }>;
  // Contact relationships  
  contacts?: Array<{
    id: string;
    name: string;
    role: string;
    influence: 'high' | 'medium' | 'low';
    sentiment: 'champion' | 'neutral' | 'detractor';
  }>;
  // PEAK methodology scores
  peakScores?: Record<string, number>;
  // MEDDPICC detailed scores
  meddpiccScores?: Record<string, number>;
  // Additional date fields
  closeDate?: string | Date; // Support both formats
  createdDate?: string | Date; // Support both formats  
  createdBy?: string;
  assignedTo?: string;
  // Timing fields
  daysInStage?: number;
  totalDaysInPipeline?: number;
  lastActivity?: string | Date; // Support both formats
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
  aiInsights?: {
    riskScore: number; // 0-100, higher = more risk
    nextBestActions: string[];
    predictedCloseDate?: string; // ISO date string for reliable serialization
    confidenceLevel: 'low' | 'medium' | 'high';
    competitorAnalysis?: string;
    lastAiUpdate?: string; // ISO date string for reliable serialization
  };
  workflowStatus?: {
    currentWorkflow: string;
    completedSteps: string[];
    nextSteps: string[];
    automationTriggers: string[];
  };
}

export interface PipelineMetrics {
  totalValue: number;
  totalOpportunities: number;
  averageDealSize: number;
  averageSalesCycle: number;
  conversionRate: number;
  stageDistribution: {
    prospect: number;
    engage: number;
    acquire: number;
    keep: number;
  };
}