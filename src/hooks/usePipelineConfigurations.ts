import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { PipelineConfiguration, Opportunity, DealMovement } from '@/lib/types';
import { PIPELINE_TEMPLATES, getAllPipelineConfigurations, getPipelineConfiguration } from '@/lib/pipeline-utils';
import { toast } from 'sonner';

export function usePipelineConfigurations() {
  const [customPipelines, setCustomPipelines] = useKV<PipelineConfiguration[]>('custom-pipelines', []);
  const [activePipelineId, setActivePipelineId] = useKV<string>('active-pipeline-id', 'enterprise-b2b');
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [dealMovements, setDealMovements] = useKV<DealMovement[]>('deal-movements', []);

  // Get all available pipelines (templates + custom)
  const allPipelines = getAllPipelineConfigurations(customPipelines);
  
  // Get the currently active pipeline
  const activePipeline = getPipelineConfiguration(activePipelineId, customPipelines) || PIPELINE_TEMPLATES[0];

  // Create a new custom pipeline
  const createCustomPipeline = (pipeline: Omit<PipelineConfiguration, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPipeline: PipelineConfiguration = {
      ...pipeline,
      id: `custom-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCustomPipelines(current => [...current, newPipeline]);
    toast.success(`Created custom pipeline: ${newPipeline.name}`);
    return newPipeline;
  };

  // Update an existing custom pipeline
  const updateCustomPipeline = (id: string, updates: Partial<PipelineConfiguration>) => {
    setCustomPipelines(current => 
      current.map(pipeline => 
        pipeline.id === id 
          ? { ...pipeline, ...updates, updatedAt: new Date() }
          : pipeline
      )
    );
    toast.success('Pipeline updated successfully');
  };

  // Delete a custom pipeline
  const deleteCustomPipeline = (id: string) => {
    const pipelineToDelete = customPipelines.find(p => p.id === id);
    if (!pipelineToDelete) return;

    setCustomPipelines(current => current.filter(p => p.id !== id));
    
    // If this was the active pipeline, switch to default
    if (id === activePipelineId) {
      setActivePipelineId(PIPELINE_TEMPLATES[0].id);
    }

    toast.success(`Deleted pipeline: ${pipelineToDelete.name}`);
  };

  // Clone a pipeline (template or custom) to create a new custom one
  const clonePipeline = (sourceId: string, newName?: string) => {
    const sourcePipeline = getPipelineConfiguration(sourceId, customPipelines);
    if (!sourcePipeline) return;

    const clonedPipeline = createCustomPipeline({
      ...sourcePipeline,
      name: newName || `${sourcePipeline.name} (Copy)`,
      createdBy: 'user',
      stages: sourcePipeline.stages.map(stage => ({
        ...stage,
        id: `${stage.id}-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    });

    return clonedPipeline;
  };

  // Set the active pipeline
  const setActivePipeline = (pipelineId: string) => {
    const pipeline = getPipelineConfiguration(pipelineId, customPipelines);
    if (pipeline) {
      setActivePipelineId(pipelineId);
      toast.success(`Activated pipeline: ${pipeline.name}`);
    }
  };

  // Get opportunities for a specific pipeline
  const getOpportunitiesForPipeline = (pipelineId?: string) => {
    const targetPipelineId = pipelineId || activePipelineId;
    return opportunities.filter(opp => opp.pipelineId === targetPipelineId);
  };

  // Get deal movements for a specific pipeline
  const getDealMovementsForPipeline = (pipelineId?: string) => {
    const targetPipelineId = pipelineId || activePipelineId;
    const pipelineOpportunities = getOpportunitiesForPipeline(targetPipelineId);
    const opportunityIds = pipelineOpportunities.map(opp => opp.id);
    return dealMovements.filter(movement => opportunityIds.includes(movement.opportunityId));
  };

  // Create an opportunity in a specific pipeline
  const createOpportunity = (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>, pipelineId?: string) => {
    const targetPipelineId = pipelineId || activePipelineId;
    const pipeline = getPipelineConfiguration(targetPipelineId, customPipelines);
    
    if (!pipeline) {
      toast.error('Invalid pipeline configuration');
      return;
    }

    const newOpportunity: Opportunity = {
      ...opportunity,
      id: `opp-${Date.now()}`,
      pipelineId: targetPipelineId,
      stage: pipeline.stages[0].id, // Start in the first stage
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOpportunities(current => [...current, newOpportunity]);
    
    // Record the initial stage entry
    const initialMovement: DealMovement = {
      id: `movement-${Date.now()}`,
      opportunityId: newOpportunity.id,
      fromStage: '',
      toStage: pipeline.stages[0].id,
      timestamp: new Date(),
      userId: 'current-user', // This should be the current user ID
      automatedMove: false,
      probability: pipeline.stages[0].probability,
      value: newOpportunity.value
    };

    setDealMovements(current => [...current, initialMovement]);
    toast.success('Opportunity created successfully');
    return newOpportunity;
  };

  // Move an opportunity to a different stage
  const moveOpportunityStage = (opportunityId: string, newStageId: string, reason?: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const pipeline = getPipelineConfiguration(opportunity.pipelineId || activePipelineId, customPipelines);
    if (!pipeline) return;

    const newStage = pipeline.stages.find(stage => stage.id === newStageId);
    if (!newStage) return;

    const oldStageId = opportunity.stage;
    
    // Update the opportunity
    setOpportunities(current => 
      current.map(opp => 
        opp.id === opportunityId 
          ? { 
              ...opp, 
              stage: newStageId,
              probability: newStage.probability,
              updatedAt: new Date().toISOString()
            }
          : opp
      )
    );

    // Record the stage movement
    const movement: DealMovement = {
      id: `movement-${Date.now()}`,
      opportunityId,
      fromStage: oldStageId,
      toStage: newStageId,
      reason,
      timestamp: new Date(),
      userId: 'current-user', // This should be the current user ID
      automatedMove: false,
      probability: newStage.probability,
      value: opportunity.value
    };

    setDealMovements(current => [...current, movement]);
    toast.success(`Opportunity moved to ${newStage.name}`);
  };

  // Get pipeline statistics
  const getPipelineStats = (pipelineId?: string) => {
    const targetPipelineId = pipelineId || activePipelineId;
    const pipelineOpportunities = getOpportunitiesForPipeline(targetPipelineId);
    const totalValue = pipelineOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const totalCount = pipelineOpportunities.length;
    
    const stageDistribution = pipelineOpportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalValue,
      totalCount,
      averageDealSize: totalCount > 0 ? totalValue / totalCount : 0,
      stageDistribution
    };
  };

  return {
    // Pipeline configurations
    allPipelines,
    customPipelines,
    activePipeline,
    activePipelineId,

    // Pipeline management
    createCustomPipeline,
    updateCustomPipeline,
    deleteCustomPipeline,
    clonePipeline,
    setActivePipeline,

    // Opportunities
    opportunities,
    getOpportunitiesForPipeline,
    createOpportunity,
    moveOpportunityStage,

    // Deal movements
    dealMovements,
    getDealMovementsForPipeline,

    // Analytics
    getPipelineStats,

    // Templates
    templates: PIPELINE_TEMPLATES
  };
}