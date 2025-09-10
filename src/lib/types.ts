export interface User {
  id: string;
  name: string;
  email: string;
  role: 'rep' | 'manager' | 'bu_head' | 'executive' | 'admin';
  avatar?: string;
  teamId?: string;
  managerId?: string;
  territory?: string;
  quota?: number;
  targets?: UserTargets;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address?: string;
  revenue?: number;
  employees?: number;
  geography?: string;
  segmentId?: string;
  segmentAssignment?: SegmentAssignment;
  customFields?: Record<string, any>;
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
  stage: string; // Changed to string to support custom pipeline stages
  pipelineId?: string; // Pipeline configuration ID
  probability: number;
  expectedCloseDate: string; // ISO date string for reliable serialization
  ownerId: string;
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
  lastAccessed: string; // ISO date string for reliable serialization
  completedAt?: string; // ISO date string for reliable serialization
  certificationDate?: string; // ISO date string for reliable serialization
  quizAttempts: number;
  quizScore?: number;
}

export interface ComplianceLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string; // ISO date string for reliable serialization
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
  targetDate: string; // ISO date string for reliable serialization
  achieved: boolean;
  achievedDate?: string; // ISO date string for reliable serialization
  reward?: string;
  description?: string;
}

export interface GoalTrackingEntry {
  id: string;
  kpiId: string;
  value: number;
  timestamp: string; // ISO date string for reliable serialization
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
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
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

// KPI Template Types for Pre-configured Industry Templates
export interface KPITemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  metrics: KPITemplateMetric[];
  visualizations: ('gauge' | 'trend' | 'bar' | 'funnel' | 'progress' | 'map' | 'heatmap' | 'dashboard' | 'leaderboard' | 'alert')[];
  tags: string[];
  industry: string;
}

export interface KPITemplateMetric {
  name: string;
  type: 'currency' | 'percentage' | 'number';
  target: number;
  current: number;
  unit: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  trend?: 'higher-better' | 'lower-better';
}

// AI-Powered Lead Scoring and Risk Assessment Types
export interface LeadScore {
  id: string;
  contactId: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: ScoringFactor[];
  predictedConversionProbability: number;
  estimatedValue: number;
  timeToConversion: number; // days
  lastUpdated: Date;
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
  detectedAt: Date;
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
  lastTrained: Date;
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
  generatedAt: Date;
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

// Advanced Pipeline Management Types
export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  position: number;
  color: string;
  probability: number;
  isDefault: boolean;
  automationRules: StageAutomationRule[];
  requiredFields: string[];
  exitCriteria: string[];
  workflows: string[]; // workflow template IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface StageAutomationRule {
  id: string;
  name: string;
  trigger: 'stage_entry' | 'stage_exit' | 'time_in_stage' | 'field_change' | 'manual';
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  delay?: number; // minutes
  isActive: boolean;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface PipelineConfiguration {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  defaultProbabilities: Record<string, number>;
  salesCycleTargets: Record<string, number>; // days per stage
  conversionTargets: Record<string, number>; // conversion % between stages
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealMovement {
  id: string;
  opportunityId: string;
  fromStage: string;
  toStage: string;
  reason?: string;
  timestamp: Date;
  userId: string;
  automatedMove: boolean;
  probability: number;
  value: number;
}

export interface StageMetrics {
  stageId: string;
  stageName: string;
  totalOpportunities: number;
  totalValue: number;
  averageTimeInStage: number;
  conversionRate: number;
  averageDealSize: number;
  velocityTrend: 'up' | 'down' | 'stable';
  bottleneckScore: number; // 0-100, higher means more bottleneck
  period: string;
}

export interface PipelineAnalytics {
  pipelineId: string;
  period: string;
  totalOpportunities: number;
  totalValue: number;
  averageSalesCycle: number;
  overallConversionRate: number;
  stageMetrics: StageMetrics[];
  bottleneckAnalysis: BottleneckAnalysis[];
  forecastAccuracy: number;
  recommendedActions: PipelineRecommendation[];
  generatedAt: Date;
}

export interface BottleneckAnalysis {
  stageId: string;
  stageName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0-100
  causes: string[];
  recommendations: string[];
  affectedDeals: number;
  potentialRevenueLoss: number;
}

export interface PipelineRecommendation {
  type: 'process' | 'training' | 'automation' | 'resource' | 'structure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedImpact: number;
  implementation: string[];
  metrics: string[];
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface WorkflowTrigger {
  type: 'deal_created' | 'stage_changed' | 'value_changed' | 'date_reached' | 'field_updated' | 'manual' | 'scheduled';
  configuration: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: 'move_stage' | 'update_field' | 'create_task' | 'send_email' | 'notify_user' | 'webhook' | 'create_opportunity' | 'update_probability';
  configuration: Record<string, any>;
  delay?: number; // minutes
  conditions?: WorkflowCondition[];
}

export interface PipelineReport {
  id: string;
  name: string;
  type: 'conversion_funnel' | 'velocity_analysis' | 'bottleneck_report' | 'forecast_accuracy' | 'stage_performance';
  filters: ReportFilter[];
  data: Record<string, any>;
  visualizations: ReportVisualization[];
  generatedAt: Date;
  generatedBy: string;
  period: string;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

export interface ReportVisualization {
  type: 'bar_chart' | 'line_chart' | 'funnel' | 'gauge' | 'table' | 'heatmap';
  title: string;
  data: any;
  configuration: Record<string, any>;
}

// Customer Segments Types
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  characteristics: SegmentCharacteristics;
  strategy: SegmentStrategy;
  metrics: SegmentMetrics;
  isActive: boolean;
  color: string;
  icon: string;
  createdBy: string;
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
}

export interface SegmentCriteria {
  revenue: {
    min?: number;
    max?: number;
  };
  industry: string[];
  companySize: {
    min?: number;
    max?: number;
  };
  geography: string[];
  businessModel: string[];
  customFields: SegmentCustomField[];
}

export interface SegmentCustomField {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  weight: number; // 1-10 for scoring
}

export interface SegmentCharacteristics {
  avgDealSize: number;
  avgSalesCycle: number; // days
  decisionMakers: string[];
  commonPainPoints: string[];
  buyingProcess: string;
  competitiveThreats: string[];
  successFactors: string[];
  churnRisk: 'low' | 'medium' | 'high';
}

export interface SegmentStrategy {
  messaging: string[];
  channels: string[];
  touchpoints: number;
  cadence: string; // e.g., "weekly", "bi-weekly"
  resources: string[];
  playbooks: string[];
  contentLibrary: SegmentContent[];
  kpis: string[];
}

export interface SegmentContent {
  id: string;
  title: string;
  type: 'presentation' | 'case_study' | 'whitepaper' | 'demo' | 'proposal_template' | 'email_template';
  url?: string;
  description: string;
  lastUpdated: string; // ISO date string for reliable serialization
  effectiveness: number; // 1-10 rating
}

export interface SegmentMetrics {
  totalOpportunities: number;
  totalValue: number;
  conversionRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  retention: number;
  expansion: number;
  nps: number;
  lastCalculated: string; // ISO date string for reliable serialization
}

export interface SegmentAssignment {
  id: string;
  companyId: string;
  segmentId: string;
  confidence: number; // 0-100
  assignedBy: 'manual' | 'automated' | 'ml_model';
  assignedAt: string; // ISO date string for reliable serialization
  assignedByUser?: string;
  reason?: string;
  previousSegments: string[];
}

export interface SegmentAnalytics {
  segmentId: string;
  period: string;
  performance: {
    revenue: number;
    deals: number;
    conversionRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  benchmarking: {
    industryAverage: number;
    topPerformer: number;
    ranking: number;
  };
  insights: SegmentInsight[];
  recommendations: SegmentRecommendation[];
  generatedAt: string; // ISO date string for reliable serialization
}

export interface SegmentInsight {
  type: 'performance' | 'opportunity' | 'risk' | 'trend';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: number; // 0-100
  actionRequired: boolean;
}

export interface SegmentRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'strategy' | 'messaging' | 'process' | 'resources' | 'targeting';
  title: string;
  description: string;
  estimatedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
}

// Predefined customer segment templates
export const CUSTOMER_SEGMENT_TEMPLATES: Omit<CustomerSegment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Strategic Partner',
    description: 'Large corporate clients with influential brands ($500M - $2B revenue)',
    criteria: {
      revenue: { min: 500000000, max: 2000000000 },
      industry: ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail'],
      companySize: { min: 1000 },
      geography: ['North America', 'Europe', 'Asia-Pacific'],
      businessModel: ['B2B', 'B2B2C'],
      customFields: [
        {
          field: 'brand_influence',
          operator: 'greater_than',
          value: 8,
          weight: 10
        }
      ]
    },
    characteristics: {
      avgDealSize: 500000,
      avgSalesCycle: 180,
      decisionMakers: ['CEO', 'CTO', 'Chief Strategy Officer', 'VP Strategic Partnerships'],
      commonPainPoints: [
        'Need for strategic differentiation',
        'Market positioning challenges',
        'Innovation acceleration',
        'Partner ecosystem development'
      ],
      buyingProcess: 'Executive committee with board approval for strategic initiatives',
      competitiveThreats: ['Premium consulting firms', 'Internal strategic teams', 'Other strategic tech partners'],
      successFactors: [
        'C-level sponsorship',
        'Clear ROI metrics',
        'Brand alignment',
        'Innovation showcase',
        'Reference value'
      ],
      churnRisk: 'low'
    },
    strategy: {
      messaging: [
        'Strategic partnership value',
        'Brand elevation',
        'Market leadership',
        'Innovation catalyst',
        'Mutual growth opportunity'
      ],
      channels: ['Executive briefings', 'Industry events', 'Strategic account management', 'Board presentations'],
      touchpoints: 15,
      cadence: 'bi-weekly',
      resources: ['Executive team', 'Strategic account manager', 'Solution architects', 'Partnership team'],
      playbooks: ['Executive engagement', 'Strategic partnership development', 'Board-level presentations'],
      contentLibrary: [],
      kpis: ['Partnership revenue', 'Strategic influence score', 'Market position improvement', 'Innovation metrics']
    },
    metrics: {
      totalOpportunities: 0,
      totalValue: 0,
      conversionRate: 0.15,
      averageDealSize: 500000,
      averageSalesCycle: 180,
      customerLifetimeValue: 2500000,
      acquisitionCost: 75000,
      retention: 0.95,
      expansion: 1.8,
      nps: 70,
      lastCalculated: new Date().toISOString()
    },
    isActive: true,
    color: '#7C3AED',
    icon: 'Crown'
  },
  {
    name: 'Reference Customer',
    description: 'Companies with expertise to drive high volumes in specific channels',
    criteria: {
      revenue: { min: 50000000, max: 1000000000 },
      industry: ['Technology', 'Manufacturing', 'Professional Services', 'Media', 'Telecommunications'],
      companySize: { min: 200, max: 2000 },
      geography: ['North America', 'Europe'],
      businessModel: ['B2B', 'B2C'],
      customFields: [
        {
          field: 'industry_expertise',
          operator: 'greater_than',
          value: 7,
          weight: 9
        },
        {
          field: 'reference_willingness',
          operator: 'equals',
          value: 'high',
          weight: 10
        }
      ]
    },
    characteristics: {
      avgDealSize: 150000,
      avgSalesCycle: 90,
      decisionMakers: ['VP Sales', 'Director of Operations', 'Business Unit Leaders'],
      commonPainPoints: [
        'Channel optimization',
        'Volume scaling challenges',
        'Performance measurement',
        'Process standardization'
      ],
      buyingProcess: 'Department-level with finance approval for mid-range investments',
      competitiveThreats: ['Specialized channel solutions', 'In-house development', 'Category competitors'],
      successFactors: [
        'Clear volume metrics',
        'Channel expertise demonstration',
        'Reference case development',
        'Success story creation'
      ],
      churnRisk: 'medium'
    },
    strategy: {
      messaging: [
        'Channel optimization',
        'Volume efficiency',
        'Industry expertise',
        'Scalable solutions',
        'Reference partnership'
      ],
      channels: ['Industry conferences', 'Channel partner programs', 'Case study development', 'Webinars'],
      touchpoints: 10,
      cadence: 'weekly',
      resources: ['Channel specialists', 'Customer success', 'Marketing', 'Product team'],
      playbooks: ['Channel optimization', 'Reference development', 'Volume scaling'],
      contentLibrary: [],
      kpis: ['Channel volume', 'Reference quality', 'Case study production', 'Industry influence']
    },
    metrics: {
      totalOpportunities: 0,
      totalValue: 0,
      conversionRate: 0.25,
      averageDealSize: 150000,
      averageSalesCycle: 90,
      customerLifetimeValue: 750000,
      acquisitionCost: 25000,
      retention: 0.85,
      expansion: 1.4,
      nps: 65,
      lastCalculated: new Date().toISOString()
    },
    isActive: true,
    color: '#059669',
    icon: 'Trophy'
  },
  {
    name: 'Vector Control',
    description: 'Military, Government, NGOs, Outdoor Workforce, Hospitality',
    criteria: {
      revenue: { min: 10000000, max: 500000000 },
      industry: ['Government', 'Defense', 'Non-Profit', 'Hospitality', 'Agriculture', 'Construction'],
      companySize: { min: 50 },
      geography: ['Global'],
      businessModel: ['B2B', 'B2G'],
      customFields: [
        {
          field: 'outdoor_operations',
          operator: 'equals',
          value: 'high',
          weight: 8
        },
        {
          field: 'health_safety_priority',
          operator: 'greater_than',
          value: 8,
          weight: 9
        }
      ]
    },
    characteristics: {
      avgDealSize: 75000,
      avgSalesCycle: 120,
      decisionMakers: ['Safety Officers', 'Operations Directors', 'Procurement', 'Health & Safety Managers'],
      commonPainPoints: [
        'Health and safety compliance',
        'Vector-borne disease prevention',
        'Operational disruption from pests',
        'Regulatory requirements',
        'Cost-effective solutions'
      ],
      buyingProcess: 'Safety committee with procurement and regulatory approval',
      competitiveThreats: ['Traditional pest control', 'In-house solutions', 'Generic safety products'],
      successFactors: [
        'Regulatory compliance',
        'Safety effectiveness',
        'Cost efficiency',
        'Minimal disruption',
        'Documentation and reporting'
      ],
      churnRisk: 'low'
    },
    strategy: {
      messaging: [
        'Health and safety protection',
        'Regulatory compliance',
        'Operational continuity',
        'Cost-effective prevention',
        'Proven effectiveness'
      ],
      channels: ['Safety conferences', 'Government procurement', 'Industry associations', 'Direct sales'],
      touchpoints: 8,
      cadence: 'monthly',
      resources: ['Safety specialists', 'Compliance team', 'Technical support', 'Government relations'],
      playbooks: ['Government sales', 'Safety compliance', 'Procurement processes'],
      contentLibrary: [],
      kpis: ['Safety outcomes', 'Compliance rates', 'Cost per protection', 'Client retention']
    },
    metrics: {
      totalOpportunities: 0,
      totalValue: 0,
      conversionRate: 0.35,
      averageDealSize: 75000,
      averageSalesCycle: 120,
      customerLifetimeValue: 400000,
      acquisitionCost: 15000,
      retention: 0.90,
      expansion: 1.2,
      nps: 55,
      lastCalculated: new Date().toISOString()
    },
    isActive: true,
    color: '#DC2626',
    icon: 'Shield'
  }
];

// User and Team Management Types
export interface UserTargets {
  monthly: number;
  quarterly: number;
  annual: number;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  members: string[];
  targets: UserTargets;
  region: string;
}

// Role-Specific Dashboard Types
export interface RoleDashboardConfig {
  role: User['role'];
  widgets: DashboardWidget[];
  layout: DashboardLayout[];
  permissions: string[];
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge' | 'trend' | 'pipeline' | 'activity' | 'forecast';
  title: string;
  dataSource: string;
  config: Record<string, any>;
  refreshInterval: number;
  permissions: string[];
}

// Sales Performance Types
export interface SalesPerformanceMetrics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  revenue: {
    actual: number;
    target: number;
    percentage: number;
  };
  deals: {
    closed: number;
    target: number;
    percentage: number;
  };
  pipeline: {
    value: number;
    count: number;
    velocity: number;
  };
  activities: {
    calls: number;
    emails: number;
    meetings: number;
    demos: number;
  };
  conversion: {
    leadToOpportunity: number;
    opportunityToClose: number;
    averageDealSize: number;
    salesCycle: number;
  };
  ranking: {
    position: number;
    totalReps: number;
    percentile: number;
  };
}

export interface TeamPerformanceMetrics {
  teamId: string;
  managerId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  team: {
    revenue: {
      actual: number;
      target: number;
      percentage: number;
    };
    deals: {
      closed: number;
      target: number;
      percentage: number;
    };
    pipeline: {
      value: number;
      count: number;
      velocity: number;
    };
  };
  individual: SalesPerformanceMetrics[];
  topPerformers: {
    userId: string;
    name: string;
    achievement: number;
    metric: string;
  }[];
  underperformers: {
    userId: string;
    name: string;
    gap: number;
    riskFactors: string[];
  }[];
}

export interface ExecutiveDashboardMetrics {
  period: 'monthly' | 'quarterly' | 'yearly';
  global: {
    revenue: {
      actual: number;
      target: number;
      forecast: number;
      growth: number;
    };
    deals: {
      closed: number;
      pipeline: number;
      forecast: number;
    };
    performance: {
      attainment: number;
      velocity: number;
      conversion: number;
    };
  };
  regions: {
    id: string;
    name: string;
    revenue: number;
    target: number;
    growth: number;
  }[];
  segments: {
    id: string;
    name: string;
    contribution: number;
    growth: number;
    opportunities: number;
  }[];
  trends: {
    period: string;
    revenue: number;
    deals: number;
    velocity: number;
  }[];
  risks: {
    type: 'pipeline' | 'forecast' | 'competitive' | 'market';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    mitigation: string[];
  }[];
}

// Pharmaceutical Industry KPI Templates
export interface PharmaSalesKPITemplate {
  id: string;
  category: 'revenue' | 'market_access' | 'clinical' | 'compliance' | 'territory';
  kpis: PharmaSalesKPI[];
}

export interface PharmaSalesKPI {
  name: string;
  description: string;
  formula: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  benchmark: {
    industry: number;
    topQuartile: number;
  };
  drillDowns: string[];
}