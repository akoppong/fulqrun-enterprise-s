export interface User {
  id: string;
  name: string;
  email: string;
  role: 'rep' | 'manager' | 'admin';
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  role: 'champion' | 'decision-maker' | 'influencer' | 'user' | 'blocker';
  createdAt: Date;
  updatedAt: Date;
}

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
  stage: 'prospect' | 'engage' | 'acquire' | 'keep';
  probability: number;
  expectedCloseDate: Date;
  ownerId: string;
  meddpicc: MEDDPICC;
  createdAt: Date;
  updatedAt: Date;
  aiInsights?: {
    riskScore: number; // 0-100, higher = more risk
    nextBestActions: string[];
    predictedCloseDate?: Date;
    confidenceLevel: 'low' | 'medium' | 'high';
    competitorAnalysis?: string;
    lastAiUpdate?: Date;
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

export const PEAK_STAGES: { value: PeakStage; label: string; description: string; color: string }[] = [
  {
    value: 'prospect',
    label: 'Prospect',
    description: 'Identifying and qualifying potential customers',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'engage',
    label: 'Engage',
    description: 'Building relationships and understanding needs',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'acquire',
    label: 'Acquire',
    description: 'Negotiating and closing the deal',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    value: 'keep',
    label: 'Keep',
    description: 'Retention, expansion, and customer success',
    color: 'bg-green-100 text-green-800'
  }
];

// Phase 2 Types - Advanced Features

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  stage: PeakStage;
  steps: WorkflowStep[];
  automationRules: AutomationRule[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'approval';
  assignedRole?: string;
  dueInDays: number;
  dependencies: string[];
  completionCriteria: string;
  resources: WorkflowResource[];
}

export interface WorkflowResource {
  id: string;
  name: string;
  type: 'document' | 'template' | 'checklist' | 'video' | 'link';
  url?: string;
  content?: string;
  sharepointPath?: string;
}

export interface AutomationRule {
  id: string;
  trigger: string;
  conditions: string[];
  actions: AutomationAction[];
  isActive: boolean;
}

export interface AutomationAction {
  type: 'email' | 'task' | 'notification' | 'field_update' | 'integration' | 'webhook' | 'delay' | 'conditional';
  parameters: Record<string, any>;
  delay?: number; // minutes
  condition?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  opportunityId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  executedBy: string;
  results: ExecutionResult[];
}

export interface ExecutionResult {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  output?: any;
  error?: string;
  assignedTo?: string;
}

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
  lastRestocked: Date;
}

export interface POSTransaction {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  timestamp: Date;
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

export interface Integration {
  id: string;
  name: string;
  type: 'slack' | 'docusign' | 'gong' | 'chorus' | 'stripe' | 'quickbooks';
  isActive: boolean;
  credentials: Record<string, string>;
  lastSync?: Date;
  syncStatus: 'connected' | 'error' | 'syncing' | 'disconnected';
  configuration: Record<string, any>;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'peak' | 'meddpicc' | 'product' | 'sales_skills' | 'compliance';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  content: LearningContent[];
  quiz?: Quiz;
  certification?: Certification;
  isRequired: boolean;
}

export interface LearningContent {
  id: string;
  type: 'video' | 'article' | 'interactive' | 'checklist';
  title: string;
  content: string;
  duration?: number;
  resources: string[];
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  validityPeriod: number; // days
  badge: string;
}

export interface UserProgress {
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'certified';
  progress: number; // 0-100
  lastAccessed: Date;
  completedAt?: Date;
  certificationDate?: Date;
  quizAttempts: number;
  quizScore?: number;
}

export interface ComplianceLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  details: Record<string, any>;
  regulation: 'gdpr' | 'hipaa' | 'sox' | 'general';
  level: 'info' | 'warning' | 'critical';
}

// KPI Targets and Goal Tracking Types
export interface KPITarget {
  id: string;
  name: string;
  description: string;
  type: 'revenue' | 'conversion' | 'volume' | 'time' | 'quality' | 'custom';
  category: 'financial' | 'sales' | 'marketing' | 'operational' | 'customer';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., '$', '%', 'deals', 'days', 'score'
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  ownerId: string;
  teamId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'at_risk' | 'achieved' | 'exceeded' | 'failed';
  automationRules: KPIAutomationRule[];
  milestones: KPIMilestone[];
  createdAt: Date;
  updatedAt: Date;
  lastCalculated?: Date;
}

export interface KPIAutomationRule {
  id: string;
  trigger: 'threshold_reached' | 'time_based' | 'manual' | 'opportunity_closed' | 'deal_stage_change';
  conditions: {
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
    value: any;
  }[];
  actions: {
    type: 'update_kpi' | 'send_notification' | 'create_task' | 'trigger_workflow' | 'escalate';
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
}

export interface KPIMilestone {
  id: string;
  name: string;
  targetValue: number;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
  reward?: string;
  description?: string;
}

export interface GoalTrackingEntry {
  id: string;
  kpiId: string;
  value: number;
  timestamp: Date;
  source: 'manual' | 'automated' | 'integration' | 'calculated';
  metadata: Record<string, any>;
  notes?: string;
  updatedBy: string;
}

export interface KPIDashboard {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  kpiIds: string[];
  layout: DashboardLayout[];
  filters: DashboardFilter[];
  refreshInterval: number; // in seconds
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  kpiId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  chartType: 'line' | 'bar' | 'gauge' | 'number' | 'progress' | 'trend';
  displayOptions: Record<string, any>;
}

export interface DashboardFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

export interface KPIAnalytics {
  kpiId: string;
  period: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  variance: number; // difference from target
  forecast: {
    projectedValue: number;
    confidenceLevel: number;
    projectionDate: Date;
  };
  insights: KPIInsight[];
  recommendations: string[];
  lastAnalyzed: Date;
}

export interface KPIInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  message: string;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions?: string[];
}