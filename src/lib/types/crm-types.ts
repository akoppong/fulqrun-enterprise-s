// CRM-specific types (opportunities, MEDDPICC, pipeline)
import { User, Company, Contact } from './core-types';

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
  lastAiAnalysis?: Date;
}

export interface Opportunity {
  id: string;
  companyId: string;
  contactId: string;
  title: string;
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
  tags?: string[];
  meddpicc: MEDDPICC;
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

export type PeakStage = 'prospect' | 'engage' | 'acquire' | 'keep';

// Financial data types
export interface FinancialData {
  id: string;
  opportunityId: string;
  revenue: number;
  costs: number;
  margin: number;
  recurringRevenue: number;
  paymentTerms: string;
  invoiceStatus: 'pending' | 'sent' | 'paid' | 'overdue';
  inventoryItems?: InventoryItem[];
  posTransactions?: POSTransaction[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string; // ISO date string for reliable serialization
}

export interface POSTransaction {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string; // ISO date string for reliable serialization
  items: string[];
  customerId?: string;
}

export interface PerformanceMetrics {
  userId: string;
  period: string;
  cstpv: {
    close: number; // Win rate percentage
    size: number; // Average deal size
    time: number; // Average sales cycle days
    probability: number; // Pipeline probability
    value: number; // Total pipeline value
  };
  activityMetrics: {
    calls: number;
    emails: number;
    meetings: number;
    demos: number;
  };
  kpis: {
    quota: number;
    achieved: number;
    attainment: number;
    ranking: number;
  };
}