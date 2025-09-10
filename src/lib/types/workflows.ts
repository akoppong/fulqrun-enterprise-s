/**
 * Workflow automation and process management types
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  stage: import('./core').PeakStage;
  steps: WorkflowStep[];
  automationRules: AutomationRule[];
  createdBy: string;
  createdAt: string; // ISO date string for reliable serialization
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
  startedAt: string; // ISO date string for reliable serialization
  completedAt?: string; // ISO date string for reliable serialization
  executedBy: string;
  results: ExecutionResult[];
}

export interface ExecutionResult {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  startedAt: string; // ISO date string for reliable serialization
  completedAt?: string; // ISO date string for reliable serialization
  output?: any;
  error?: string;
  assignedTo?: string;
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
  lastExecuted?: string; // ISO date string for reliable serialization
  createdBy: string;
  createdAt: string; // ISO date string for reliable serialization
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