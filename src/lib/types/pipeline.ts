/**
 * Pipeline management and automation types
 */

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
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
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

export interface AutomationAction {
  type: 'email' | 'task' | 'notification' | 'field_update' | 'integration' | 'webhook' | 'delay' | 'conditional';
  parameters: Record<string, any>;
  delay?: number; // minutes
  condition?: string;
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
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
}

export interface DealMovement {
  id: string;
  opportunityId: string;
  fromStage: string;
  toStage: string;
  reason?: string;
  timestamp: string; // ISO date string for reliable serialization
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
  generatedAt: string; // ISO date string for reliable serialization
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