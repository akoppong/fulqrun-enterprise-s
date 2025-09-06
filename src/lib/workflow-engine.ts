import { WorkflowTemplate, WorkflowExecution, WorkflowStep, AutomationAction, ExecutionResult, Opportunity } from './types';
import { allWorkflowTemplates } from './industry-workflows';
import { toast } from 'sonner';

/**
 * Workflow Engine - Handles execution and automation of pipeline workflows
 */
export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private executionQueue: Map<string, WorkflowExecution> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Register a workflow template
   */
  registerTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Execute a workflow for an opportunity
   */
  async executeWorkflow(templateId: string, opportunity: Opportunity, userId: string): Promise<WorkflowExecution> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Workflow template ${templateId} not found`);
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId: templateId,
      opportunityId: opportunity.id,
      status: 'running',
      currentStep: 0,
      startedAt: new Date(),
      executedBy: userId,
      results: []
    };

    this.executionQueue.set(execution.id, execution);
    
    // Initialize results for all steps
    template.steps.forEach(step => {
      execution.results.push({
        stepId: step.id,
        status: 'pending',
        startedAt: new Date()
      });
    });

    // Start executing the workflow
    this.processWorkflow(execution, template, opportunity);

    return execution;
  }

  /**
   * Process a workflow execution
   */
  private async processWorkflow(execution: WorkflowExecution, template: WorkflowTemplate, opportunity: Opportunity): Promise<void> {
    try {
      for (let i = execution.currentStep; i < template.steps.length; i++) {
        const step = template.steps[i];
        const result = execution.results[i];
        
        // Check dependencies
        if (!this.checkDependencies(step, execution.results)) {
          result.status = 'skipped';
          result.completedAt = new Date();
          continue;
        }

        result.status = 'in_progress';
        result.startedAt = new Date();

        try {
          const stepResult = await this.executeStep(step, opportunity, execution);
          result.status = 'completed';
          result.completedAt = new Date();
          result.output = stepResult;
          
          execution.currentStep = i + 1;
          
        } catch (error) {
          result.status = 'failed';
          result.completedAt = new Date();
          result.error = error instanceof Error ? error.message : 'Unknown error';
          
          // Stop execution on failure unless step is optional
          if (step.type !== 'manual') {
            execution.status = 'failed';
            break;
          }
        }
      }

      // Mark execution as completed if all steps are done
      if (execution.currentStep >= template.steps.length) {
        execution.status = 'completed';
        execution.completedAt = new Date();
      }

    } catch (error) {
      execution.status = 'failed';
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: WorkflowStep, opportunity: Opportunity, execution: WorkflowExecution): Promise<any> {
    switch (step.type) {
      case 'automated':
        return await this.executeAutomatedStep(step, opportunity);
      
      case 'manual':
        return await this.createManualTask(step, opportunity, execution);
      
      case 'approval':
        return await this.createApprovalTask(step, opportunity, execution);
      
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute an automated step
   */
  private async executeAutomatedStep(step: WorkflowStep, opportunity: Opportunity): Promise<any> {
    const results: any[] = [];
    
    // Process automation rules associated with this step
    for (const resource of step.resources) {
      if (resource.type === 'template' && resource.content) {
        // Execute template-based automation
        const result = await this.processTemplate(resource.content, opportunity);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Create a manual task
   */
  private async createManualTask(step: WorkflowStep, opportunity: Opportunity, execution: WorkflowExecution): Promise<any> {
    const task = {
      id: `task_${Date.now()}`,
      title: step.name,
      description: step.description,
      opportunityId: opportunity.id,
      assignedTo: step.assignedRole || execution.executedBy,
      dueDate: new Date(Date.now() + step.dueInDays * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date()
    };

    // Store task in execution context
    toast.info(`Manual task created: ${step.name}`);
    return task;
  }

  /**
   * Create an approval task
   */
  private async createApprovalTask(step: WorkflowStep, opportunity: Opportunity, execution: WorkflowExecution): Promise<any> {
    const approval = {
      id: `approval_${Date.now()}`,
      title: `Approval Required: ${step.name}`,
      description: step.description,
      opportunityId: opportunity.id,
      requestedBy: execution.executedBy,
      approver: step.assignedRole || 'manager',
      status: 'pending',
      createdAt: new Date()
    };

    toast.info(`Approval requested: ${step.name}`);
    return approval;
  }

  /**
   * Process a template with opportunity data
   */
  private async processTemplate(template: string, opportunity: Opportunity): Promise<string> {
    // Simple template processing - replace variables
    let processed = template;
    processed = processed.replace(/\{opportunity\.title\}/g, opportunity.title);
    processed = processed.replace(/\{opportunity\.value\}/g, opportunity.value.toString());
    processed = processed.replace(/\{opportunity\.stage\}/g, opportunity.stage);
    
    return processed;
  }

  /**
   * Check if step dependencies are satisfied
   */
  private checkDependencies(step: WorkflowStep, results: ExecutionResult[]): boolean {
    if (!step.dependencies.length) return true;
    
    const resultMap = new Map(results.map(r => [r.stepId, r]));
    
    return step.dependencies.every(depId => {
      const depResult = resultMap.get(depId);
      return depResult?.status === 'completed';
    });
  }

  /**
   * Get workflow execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executionQueue.get(executionId);
  }

  /**
   * Get all active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.executionQueue.values()).filter(e => e.status === 'running');
  }

  /**
   * Pause a workflow execution
   */
  pauseExecution(executionId: string): void {
    const execution = this.executionQueue.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
    }
  }

  /**
   * Resume a paused workflow execution
   */
  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.executionQueue.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      const template = this.templates.get(execution.workflowId);
      if (template) {
        // Need to get opportunity data - this would come from your data store
        // For now, we'll just update the status
        toast.info('Workflow execution resumed');
      }
    }
  }

  /**
   * Cancel a workflow execution
   */
  cancelExecution(executionId: string): void {
    const execution = this.executionQueue.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'failed';
      execution.completedAt = new Date();
      toast.info('Workflow execution cancelled');
    }
  }
}

// Default workflow templates - combine built-in and industry-specific
export const defaultWorkflowTemplates: WorkflowTemplate[] = [
  ...allWorkflowTemplates,
  {
    id: 'prospect-qualification',
    name: 'Prospect Qualification Workflow',
    description: 'Complete qualification process for new prospects',
    stage: 'prospect',
    steps: [
      {
        id: 'initial-research',
        name: 'Initial Company Research',
        description: 'Research company background, industry, and key contacts',
        type: 'manual',
        assignedRole: 'rep',
        dueInDays: 1,
        dependencies: [],
        completionCriteria: 'Company profile completed with industry analysis',
        resources: [
          {
            id: 'research-checklist',
            name: 'Company Research Checklist',
            type: 'checklist',
            content: '- Company size and revenue\n- Key decision makers\n- Technology stack\n- Competitors\n- Recent news/events'
          }
        ]
      },
      {
        id: 'meddpicc-assessment',
        name: 'MEDDPICC Qualification',
        description: 'Complete initial MEDDPICC assessment',
        type: 'manual',
        assignedRole: 'rep',
        dueInDays: 2,
        dependencies: ['initial-research'],
        completionCriteria: 'All MEDDPICC fields completed with initial scores',
        resources: [
          {
            id: 'meddpicc-template',
            name: 'MEDDPICC Assessment Template',
            type: 'template',
            content: 'Metrics: {opportunity.value}\nEconomic Buyer: TBD\nDecision Criteria: TBD\nDecision Process: TBD\nPaper Process: TBD\nImplicate Pain: TBD\nChampion: TBD'
          }
        ]
      },
      {
        id: 'approval-to-engage',
        name: 'Manager Approval to Engage',
        description: 'Get manager approval to move to engage stage',
        type: 'approval',
        assignedRole: 'manager',
        dueInDays: 1,
        dependencies: ['meddpicc-assessment'],
        completionCriteria: 'Manager approves opportunity progression',
        resources: []
      }
    ],
    automationRules: [
      {
        id: 'stage-progression',
        trigger: 'all_steps_completed',
        conditions: ['approval_received'],
        actions: [
          {
            type: 'field_update',
            parameters: {
              field: 'stage',
              value: 'engage'
            }
          },
          {
            type: 'notification',
            parameters: {
              message: 'Opportunity {opportunity.title} moved to Engage stage',
              recipients: ['rep', 'manager']
            }
          }
        ],
        isActive: true
      }
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true
  },
  {
    id: 'deal-closing',
    name: 'Deal Closing Workflow',
    description: 'Standard process for closing deals in acquire stage',
    stage: 'acquire',
    steps: [
      {
        id: 'proposal-creation',
        name: 'Create Proposal',
        description: 'Generate and customize proposal document',
        type: 'manual',
        assignedRole: 'rep',
        dueInDays: 3,
        dependencies: [],
        completionCriteria: 'Proposal document created and reviewed',
        resources: [
          {
            id: 'proposal-template',
            name: 'Standard Proposal Template',
            type: 'document',
            sharepointPath: '/templates/proposals/standard-proposal.docx'
          }
        ]
      },
      {
        id: 'legal-review',
        name: 'Legal Review',
        description: 'Legal team review of proposal terms',
        type: 'approval',
        assignedRole: 'legal',
        dueInDays: 2,
        dependencies: ['proposal-creation'],
        completionCriteria: 'Legal approval received',
        resources: []
      },
      {
        id: 'contract-generation',
        name: 'Generate Contract',
        description: 'Create final contract based on approved proposal',
        type: 'automated',
        dueInDays: 1,
        dependencies: ['legal-review'],
        completionCriteria: 'Contract generated and ready for signature',
        resources: [
          {
            id: 'contract-automation',
            name: 'Contract Generation',
            type: 'template',
            content: 'Contract for {opportunity.title} - Value: ${opportunity.value}'
          }
        ]
      }
    ],
    automationRules: [
      {
        id: 'contract-ready',
        trigger: 'step_completed',
        conditions: ['step_id:contract-generation'],
        actions: [
          {
            type: 'integration',
            parameters: {
              service: 'docusign',
              action: 'send_for_signature',
              document: 'contract'
            }
          }
        ],
        isActive: true
      }
    ],
    createdBy: 'system',
    createdAt: new Date(),
    isActive: true
  }
];