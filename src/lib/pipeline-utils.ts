import { 
  PipelineStage, 
  PipelineConfiguration, 
  Opportunity, 
  StageMetrics, 
  BottleneckAnalysis,
  DealMovement,
  PipelineAnalytics,
  WorkflowAutomation,
  PEAK_STAGES
} from './types';

// Pre-defined pipeline templates for different sales processes
export const PIPELINE_TEMPLATES: PipelineConfiguration[] = [
  // Enterprise B2B Sales Pipeline
  {
    id: 'enterprise-b2b',
    name: 'Enterprise B2B Sales',
    description: 'Complex sales process for large enterprise deals with long sales cycles',
    stages: [
      {
        id: 'lead-qualification',
        name: 'Lead Qualification',
        description: 'Initial qualification and BANT assessment',
        position: 0,
        color: 'bg-slate-100 text-slate-800',
        probability: 10,
        isDefault: true,
        automationRules: [],
        requiredFields: ['company', 'contact', 'budget'],
        exitCriteria: ['BANT qualified', 'Decision maker identified'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'discovery',
        name: 'Discovery & Needs Analysis',
        description: 'Deep dive into customer needs and pain points',
        position: 1,
        color: 'bg-blue-100 text-blue-800',
        probability: 25,
        isDefault: false,
        automationRules: [],
        requiredFields: ['pain_points', 'decision_criteria', 'timeline'],
        exitCriteria: ['Needs documented', 'Stakeholders mapped', 'Champion identified'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'solution-design',
        name: 'Solution Design',
        description: 'Custom solution development and presentation',
        position: 2,
        color: 'bg-purple-100 text-purple-800',
        probability: 40,
        isDefault: false,
        automationRules: [],
        requiredFields: ['solution_requirements', 'technical_specs'],
        exitCriteria: ['Solution approved', 'Technical validation complete'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'proposal',
        name: 'Proposal & Negotiation',
        description: 'Formal proposal submission and contract negotiation',
        position: 3,
        color: 'bg-orange-100 text-orange-800',
        probability: 65,
        isDefault: false,
        automationRules: [],
        requiredFields: ['proposal_sent', 'pricing_approved'],
        exitCriteria: ['Proposal reviewed', 'Terms negotiated', 'Legal approval obtained'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contracting',
        name: 'Contracting & Legal',
        description: 'Final contract review and execution',
        position: 4,
        color: 'bg-yellow-100 text-yellow-800',
        probability: 85,
        isDefault: false,
        automationRules: [],
        requiredFields: ['contract_terms', 'legal_review'],
        exitCriteria: ['Contract signed', 'Payment terms agreed'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'closed-won',
        name: 'Closed Won',
        description: 'Deal successfully closed and implementation initiated',
        position: 5,
        color: 'bg-green-100 text-green-800',
        probability: 100,
        isDefault: false,
        automationRules: [],
        requiredFields: ['implementation_plan', 'success_criteria'],
        exitCriteria: ['Deal closed', 'Implementation started'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    defaultProbabilities: {
      'lead-qualification': 10,
      'discovery': 25,
      'solution-design': 40,
      'proposal': 65,
      'contracting': 85,
      'closed-won': 100
    },
    salesCycleTargets: {
      'lead-qualification': 3,
      'discovery': 14,
      'solution-design': 21,
      'proposal': 14,
      'contracting': 7,
      'closed-won': 1
    },
    conversionTargets: {
      'lead-qualification-to-discovery': 40,
      'discovery-to-solution-design': 60,
      'solution-design-to-proposal': 70,
      'proposal-to-contracting': 80,
      'contracting-to-closed-won': 90
    },
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // SMB/Transactional Sales Pipeline
  {
    id: 'smb-transactional',
    name: 'SMB Transactional Sales',
    description: 'Fast-moving sales process for small to medium business deals',
    stages: [
      {
        id: 'inbound-lead',
        name: 'Inbound Lead',
        description: 'New leads from marketing campaigns and referrals',
        position: 0,
        color: 'bg-cyan-100 text-cyan-800',
        probability: 15,
        isDefault: true,
        automationRules: [],
        requiredFields: ['lead_source', 'contact_info'],
        exitCriteria: ['Lead qualified', 'Initial contact made'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'qualification-call',
        name: 'Qualification Call',
        description: 'Quick qualification and needs assessment',
        position: 1,
        color: 'bg-indigo-100 text-indigo-800',
        probability: 35,
        isDefault: false,
        automationRules: [],
        requiredFields: ['budget_range', 'timeline', 'decision_maker'],
        exitCriteria: ['Needs confirmed', 'Budget qualified', 'Timeline established'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'demo-presentation',
        name: 'Demo & Presentation',
        description: 'Product demonstration and value proposition',
        position: 2,
        color: 'bg-violet-100 text-violet-800',
        probability: 55,
        isDefault: false,
        automationRules: [],
        requiredFields: ['demo_completed', 'value_proposition'],
        exitCriteria: ['Demo delivered', 'Value demonstrated', 'Next steps defined'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'proposal-quote',
        name: 'Proposal & Quote',
        description: 'Formal quote and proposal delivery',
        position: 3,
        color: 'bg-amber-100 text-amber-800',
        probability: 75,
        isDefault: false,
        automationRules: [],
        requiredFields: ['quote_sent', 'pricing_confirmed'],
        exitCriteria: ['Quote approved', 'Terms accepted'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'closed-won-smb',
        name: 'Closed Won',
        description: 'Deal closed and onboarding initiated',
        position: 4,
        color: 'bg-green-100 text-green-800',
        probability: 100,
        isDefault: false,
        automationRules: [],
        requiredFields: ['payment_received', 'onboarding_scheduled'],
        exitCriteria: ['Payment processed', 'Customer onboarded'],
        workflows: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    defaultProbabilities: {
      'inbound-lead': 15,
      'qualification-call': 35,
      'demo-presentation': 55,
      'proposal-quote': 75,
      'closed-won-smb': 100
    },
    salesCycleTargets: {
      'inbound-lead': 1,
      'qualification-call': 3,
      'demo-presentation': 7,
      'proposal-quote': 5,
      'closed-won-smb': 1
    },
    conversionTargets: {
      'inbound-lead-to-qualification-call': 70,
      'qualification-call-to-demo-presentation': 65,
      'demo-presentation-to-proposal-quote': 60,
      'proposal-quote-to-closed-won-smb': 85
    },
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all available pipeline configurations (templates + custom)
export function getAllPipelineConfigurations(customPipelines: PipelineConfiguration[] = []): PipelineConfiguration[] {
  return [...PIPELINE_TEMPLATES, ...customPipelines];
}

// Find a specific pipeline configuration by ID
export function getPipelineConfiguration(
  id: string, 
  customPipelines: PipelineConfiguration[] = []
): PipelineConfiguration | undefined {
  const allPipelines = getAllPipelineConfigurations(customPipelines);
  return allPipelines.find(pipeline => pipeline.id === id);
}

// Default pipeline configuration based on PEAK methodology
export function createDefaultPipelineConfiguration(): PipelineConfiguration {
  const stages: PipelineStage[] = PEAK_STAGES.map((stage, index) => ({
    id: `stage-${stage.value}`,
    name: stage.label,
    description: stage.description,
    position: index,
    color: stage.color,
    probability: [25, 50, 75, 90][index], // Default probabilities
    isDefault: true,
    automationRules: [],
    requiredFields: [],
    exitCriteria: [],
    workflows: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  return {
    id: 'default-pipeline',
    name: 'PEAK Sales Pipeline',
    description: 'Default pipeline based on PEAK methodology',
    stages,
    defaultProbabilities: {
      prospect: 25,
      engage: 50,
      acquire: 75,
      keep: 90
    },
    salesCycleTargets: {
      prospect: 7,
      engage: 14,
      acquire: 21,
      keep: 90
    },
    conversionTargets: {
      'prospect-to-engage': 60,
      'engage-to-acquire': 40,
      'acquire-to-keep': 80
    },
    isActive: true,
    createdBy: 'system',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Calculate stage metrics
export function calculateStageMetrics(
  opportunities: Opportunity[],
  dealMovements: DealMovement[],
  stageId: string,
  period: string = 'current'
): StageMetrics {
  const stageOpportunities = opportunities.filter(opp => opp.stage === getStageValue(stageId));
  const totalOpportunities = stageOpportunities.length;
  const totalValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  
  // Calculate average time in stage from movements
  const stageMovements = dealMovements.filter(movement => 
    movement.fromStage === stageId || movement.toStage === stageId
  );
  
  const timeInStage = calculateAverageTimeInStage(stageMovements, stageId);
  const conversionRate = calculateStageConversionRate(dealMovements, stageId);
  const averageDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
  
  return {
    stageId,
    stageName: getStageName(stageId),
    totalOpportunities,
    totalValue,
    averageTimeInStage: timeInStage,
    conversionRate,
    averageDealSize,
    velocityTrend: calculateVelocityTrend(stageMovements),
    bottleneckScore: calculateBottleneckScore(stageMovements, totalOpportunities),
    period
  };
}

// Calculate conversion rate between stages
export function calculateStageConversionRate(movements: DealMovement[], fromStage: string): number {
  const fromMovements = movements.filter(m => m.fromStage === fromStage);
  const toMovements = movements.filter(m => m.toStage === fromStage);
  
  if (toMovements.length === 0) return 0;
  
  return (fromMovements.length / toMovements.length) * 100;
}

// Calculate average time spent in a stage
export function calculateAverageTimeInStage(movements: DealMovement[], stageId: string): number {
  const entryMovements = movements.filter(m => m.toStage === stageId);
  const exitMovements = movements.filter(m => m.fromStage === stageId);
  
  let totalTime = 0;
  let count = 0;
  
  entryMovements.forEach(entry => {
    const exit = exitMovements.find(e => e.opportunityId === entry.opportunityId && e.timestamp > entry.timestamp);
    if (exit) {
      const timeInStage = (exit.timestamp.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      totalTime += timeInStage;
      count++;
    }
  });
  
  return count > 0 ? totalTime / count : 0;
}

// Identify bottlenecks in the pipeline
export function analyzeBottlenecks(
  opportunities: Opportunity[],
  dealMovements: DealMovement[],
  pipeline: PipelineConfiguration
): BottleneckAnalysis[] {
  return pipeline.stages.map(stage => {
    const stageMetrics = calculateStageMetrics(opportunities, dealMovements, stage.id);
    const severity = determineBottleneckSeverity(stageMetrics);
    
    return {
      stageId: stage.id,
      stageName: stage.name,
      severity,
      impact: stageMetrics.bottleneckScore,
      causes: identifyBottleneckCauses(stageMetrics, stage),
      recommendations: generateBottleneckRecommendations(stageMetrics, stage),
      affectedDeals: stageMetrics.totalOpportunities,
      potentialRevenueLoss: calculatePotentialLoss(stageMetrics)
    };
  });
}

// Generate pipeline analytics
export function generatePipelineAnalytics(
  opportunities: Opportunity[],
  dealMovements: DealMovement[],
  pipeline: PipelineConfiguration,
  period: string = 'current'
): PipelineAnalytics {
  const stageMetrics = pipeline.stages.map(stage => 
    calculateStageMetrics(opportunities, dealMovements, stage.id, period)
  );
  
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const averageSalesCycle = calculateAverageSalesCycle(dealMovements);
  const overallConversionRate = calculateOverallConversionRate(dealMovements, pipeline);
  const bottleneckAnalysis = analyzeBottlenecks(opportunities, dealMovements, pipeline);
  
  return {
    pipelineId: pipeline.id,
    period,
    totalOpportunities,
    totalValue,
    averageSalesCycle,
    overallConversionRate,
    stageMetrics,
    bottleneckAnalysis,
    forecastAccuracy: calculateForecastAccuracy(opportunities),
    recommendedActions: generatePipelineRecommendations(stageMetrics, bottleneckAnalysis),
    generatedAt: new Date()
  };
}

// Workflow automation helpers
export function evaluateWorkflowTrigger(
  automation: WorkflowAutomation,
  opportunity: Opportunity,
  context: Record<string, any> = {}
): boolean {
  // Evaluate trigger conditions
  switch (automation.trigger.type) {
    case 'stage_changed':
      return context.previousStage !== opportunity.stage;
    case 'value_changed':
      return context.previousValue !== opportunity.value;
    case 'date_reached':
      const targetDate = new Date(automation.trigger.configuration.date);
      return new Date() >= targetDate;
    default:
      return false;
  }
}

export function executeWorkflowActions(
  automation: WorkflowAutomation,
  opportunity: Opportunity,
  onUpdate: (updates: Partial<Opportunity>) => void
): void {
  automation.actions.forEach(async (action) => {
    // Add delay if specified
    if (action.delay) {
      setTimeout(() => executeAction(action, opportunity, onUpdate), action.delay * 60 * 1000);
    } else {
      executeAction(action, opportunity, onUpdate);
    }
  });
}

function executeAction(
  action: any,
  opportunity: Opportunity,
  onUpdate: (updates: Partial<Opportunity>) => void
): void {
  switch (action.type) {
    case 'move_stage':
      onUpdate({ stage: action.configuration.targetStage });
      break;
    case 'update_field':
      onUpdate({ [action.configuration.field]: action.configuration.value });
      break;
    case 'update_probability':
      onUpdate({ probability: action.configuration.probability });
      break;
    // Add more action types as needed
  }
}

// Helper functions
function getStageValue(stageId: string): string {
  const stageMap: Record<string, string> = {
    'stage-prospect': 'prospect',
    'stage-engage': 'engage',
    'stage-acquire': 'acquire',
    'stage-keep': 'keep'
  };
  return stageMap[stageId] || stageId;
}

function getStageName(stageId: string): string {
  const stage = PEAK_STAGES.find(s => `stage-${s.value}` === stageId);
  return stage?.label || stageId;
}

function calculateVelocityTrend(movements: DealMovement[]): 'up' | 'down' | 'stable' {
  if (movements.length < 2) return 'stable';
  
  const recent = movements.slice(-5);
  const earlier = movements.slice(-10, -5);
  
  const recentAvg = recent.length > 0 ? recent.reduce((sum, m) => sum + m.value, 0) / recent.length : 0;
  const earlierAvg = earlier.length > 0 ? earlier.reduce((sum, m) => sum + m.value, 0) / earlier.length : 0;
  
  if (recentAvg > earlierAvg * 1.1) return 'up';
  if (recentAvg < earlierAvg * 0.9) return 'down';
  return 'stable';
}

function calculateBottleneckScore(movements: DealMovement[], opportunityCount: number): number {
  if (opportunityCount === 0) return 0;
  
  const exitRate = movements.length / opportunityCount;
  const timeScore = movements.reduce((sum, m) => {
    const daysSinceMove = (Date.now() - m.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return sum + Math.min(daysSinceMove / 30, 1); // Normalize to 0-1 over 30 days
  }, 0) / Math.max(movements.length, 1);
  
  return Math.round((1 - exitRate + timeScore) * 50);
}

function calculateAverageSalesCycle(movements: DealMovement[]): number {
  const dealCycles = new Map<string, { start: Date, end?: Date }>();
  
  movements.forEach(movement => {
    if (!dealCycles.has(movement.opportunityId)) {
      dealCycles.set(movement.opportunityId, { start: movement.timestamp });
    } else {
      const cycle = dealCycles.get(movement.opportunityId)!;
      cycle.end = movement.timestamp;
    }
  });
  
  const completedCycles = Array.from(dealCycles.values()).filter(cycle => cycle.end);
  if (completedCycles.length === 0) return 0;
  
  const totalDays = completedCycles.reduce((sum, cycle) => {
    const days = (cycle.end!.getTime() - cycle.start.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  
  return totalDays / completedCycles.length;
}

function calculateOverallConversionRate(
  movements: DealMovement[],
  pipeline: PipelineConfiguration
): number {
  const firstStage = pipeline.stages[0];
  const lastStage = pipeline.stages[pipeline.stages.length - 1];
  
  const entered = movements.filter(m => m.toStage === firstStage.id).length;
  const completed = movements.filter(m => m.toStage === lastStage.id).length;
  
  return entered > 0 ? (completed / entered) * 100 : 0;
}

function calculateForecastAccuracy(opportunities: Opportunity[]): number {
  // Simplified forecast accuracy calculation
  const forecastedRevenue = opportunities
    .filter(opp => opp.stage === 'acquire')
    .reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  
  const actualRevenue = opportunities
    .filter(opp => opp.stage === 'keep')
    .reduce((sum, opp) => sum + opp.value, 0);
  
  if (forecastedRevenue === 0) return 0;
  return Math.min((actualRevenue / forecastedRevenue) * 100, 100);
}

function determineBottleneckSeverity(metrics: StageMetrics): 'low' | 'medium' | 'high' | 'critical' {
  const score = metrics.bottleneckScore;
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function identifyBottleneckCauses(metrics: StageMetrics, stage: PipelineStage): string[] {
  const causes = [];
  
  if (metrics.averageTimeInStage > 30) {
    causes.push('Deals spending too long in stage');
  }
  if (metrics.conversionRate < 20) {
    causes.push('Low conversion rate to next stage');
  }
  if (metrics.totalOpportunities > 50) {
    causes.push('High volume causing congestion');
  }
  
  return causes;
}

function generateBottleneckRecommendations(metrics: StageMetrics, stage: PipelineStage): string[] {
  const recommendations = [];
  
  if (metrics.averageTimeInStage > 30) {
    recommendations.push('Implement time-based automation rules');
    recommendations.push('Review stage exit criteria');
  }
  if (metrics.conversionRate < 20) {
    recommendations.push('Provide additional training for this stage');
    recommendations.push('Review qualification criteria');
  }
  
  return recommendations;
}

function generatePipelineRecommendations(
  stageMetrics: StageMetrics[],
  bottlenecks: BottleneckAnalysis[]
): any[] {
  const recommendations = [];
  
  // Identify the worst bottleneck
  const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'critical');
  if (criticalBottlenecks.length > 0) {
    recommendations.push({
      type: 'process',
      priority: 'critical',
      title: 'Address Critical Pipeline Bottlenecks',
      description: `${criticalBottlenecks.length} stages have critical bottlenecks affecting deal flow`,
      estimatedImpact: 85,
      implementation: ['Review stage definitions', 'Implement automation', 'Provide targeted training'],
      metrics: ['conversion_rate', 'time_in_stage', 'deal_velocity']
    });
  }
  
  return recommendations;
}

function calculatePotentialLoss(metrics: StageMetrics): number {
  // Simplified calculation of potential revenue loss due to bottlenecks
  return metrics.totalValue * (metrics.bottleneckScore / 100) * 0.1;
}