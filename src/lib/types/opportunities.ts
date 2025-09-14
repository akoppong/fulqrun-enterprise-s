/**
 * Opportunity and MEDDPICC qualification types
 */

export interface MEDDPICC {
  // Scoring fields (0-10 scale)
  metrics: number; // What economic impact can we measure?
  economicBuyer: number; // Who has the economic authority?
  decisionCriteria: number; // What criteria will they use to decide?
  decisionProcess: number; // How will they make the decision?
  paperProcess: number; // What's the approval/procurement process?
  identifyPain: number; // What pain are we addressing?
  champion: number; // Who is actively selling for us?
  competition: number; // Competitive landscape understanding
  score: number; // Overall MEDDPICC score (average of all criteria)
  
  // Text fields for detailed notes
  metricsNotes?: string;
  economicBuyerNotes?: string;
  decisionCriteriaNotes?: string;
  decisionProcessNotes?: string;
  paperProcessNotes?: string;
  identifyPainNotes?: string;
  championNotes?: string;
  competitionNotes?: string;
  notes?: string; // General notes
  
  // AI and metadata
  aiHints?: {
    metricsHints: string[];
    championHints: string[];
    riskFactors: string[];
  };
  lastAiAnalysis?: string; // ISO date string for reliable serialization
  lastUpdated?: Date; // When this scoring was last updated
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