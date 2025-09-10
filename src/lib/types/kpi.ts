/**
 * KPI management and analytics types
 */

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
  startDate: string; // ISO date string for reliable serialization
  endDate: string; // ISO date string for reliable serialization
  ownerId: string;
  teamId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'at_risk' | 'achieved' | 'exceeded' | 'failed';
  automationRules: KPIAutomationRule[];
  milestones: KPIMilestone[];
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
  lastCalculated?: string; // ISO date string for reliable serialization
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
    projectionDate: string; // ISO date string for reliable serialization
  };
  insights: KPIInsight[];
  recommendations: string[];
  lastAnalyzed: string; // ISO date string for reliable serialization
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

// Role-Specific Dashboard Types
export interface RoleDashboardConfig {
  role: import('./core').User['role'];
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