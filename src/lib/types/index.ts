/**
 * Centralized type definitions for FulQrun CRM
 * 
 * This file exports all types from modular domain-specific files
 * to maintain backward compatibility while improving maintainability.
 */

// Core domain types
export * from './core';
export * from './opportunities';
export * from './pipeline';
export * from './workflows';
export * from './segments';
export * from './kpi';
export * from './ai-analytics';
export * from './performance';
export * from './integrations';
export * from './reports';

// Re-export commonly used types for convenience
export type {
  User,
  UserTargets,
  Team,
  Company,
  Contact,
  PeakStage,
} from './core';

export type {
  Opportunity,
  MEDDPICC,
  PipelineMetrics,
} from './opportunities';

export type {
  PipelineConfiguration,
  PipelineStage,
  StageAutomationRule,
  AutomationCondition,
  DealMovement,
  StageMetrics,
  PipelineAnalytics,
  BottleneckAnalysis,
  PipelineRecommendation,
} from './pipeline';

export type {
  WorkflowTemplate,
  WorkflowStep,
  WorkflowResource,
  AutomationRule,
  AutomationAction,
  WorkflowExecution,
  ExecutionResult,
  WorkflowAutomation,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowAction,
} from './workflows';

export type {
  CustomerSegment,
  SegmentAssignment,
  SegmentCriteria,
  SegmentCharacteristics,
} from './segments';

export type {
  KPITarget,
  KPIAnalytics,
  KPIDashboard,
  DashboardWidget,
  RoleDashboardConfig,
  GoalTrackingEntry,
} from './kpi';

export type {
  LeadScore,
  ScoringFactor,
  DealRiskAssessment,
  RiskFactor,
  RiskRecommendation,
  PredictiveAnalytics,
  AIModelConfig,
  PredictionResult,
} from './ai-analytics';

export type {
  FinancialData,
  InventoryItem,
  POSTransaction,
  SalesPerformanceMetrics,
  TeamPerformanceMetrics,
  ExecutiveDashboardMetrics,
  PerformanceMetrics,
  PharmaSalesKPITemplate,
  PharmaSalesKPI,
} from './performance';

export type {
  Integration,
  LearningModule,
  UserProgress,
  ComplianceLog,
} from './integrations';

// Export constants from their correct locations
export { PEAK_STAGES } from './core';
export { CUSTOMER_SEGMENT_TEMPLATES } from './segments';