import { DealData } from './analytics-engine';

export interface DealProgression {
  dealId: string;
  currentStage: string;
  stageHistory: Array<{
    stage: string;
    enteredDate: Date;
    exitedDate?: Date;
    daysInStage: number;
    advancementReason?: string;
  }>;
  gateResults: Record<string, boolean>;
  lastEvaluation: Date;
  nextEvaluationDue: Date;
}

export interface ProgressionResult {
  canAdvance: boolean;
  requiredActions: string[];
  gatesPassed: Record<string, boolean>;
  nextStage?: string;
  confidence: number;
}

export class DealProgressionEngine {
  // Standard B2B sales stages and their criteria
  private static readonly STAGE_GATES = {
    prospect: {
      nextStage: 'engage',
      gates: ['qualified_need', 'budget_confirmed', 'timeline_defined']
    },
    engage: {
      nextStage: 'acquire',
      gates: ['decision_maker_identified', 'champion_established', 'solution_presented']
    },
    acquire: {
      nextStage: 'keep',
      gates: ['proposal_submitted', 'terms_negotiated', 'legal_approved']
    },
    keep: {
      nextStage: 'closed-won',
      gates: ['contract_signed', 'payment_terms_agreed', 'implementation_planned']
    }
  };

  static evaluateDealProgression(deal: DealData): Record<string, ProgressionResult> {
    const results: Record<string, ProgressionResult> = {};
    
    // Evaluate current stage
    const currentStageConfig = this.STAGE_GATES[deal.stage as keyof typeof this.STAGE_GATES];
    if (currentStageConfig) {
      results[deal.stage] = this.evaluateStageGates(deal, deal.stage);
    }

    return results;
  }

  static canAutoAdvance(deal: DealData): { canAdvance: boolean; nextStage?: string; confidence: number } {
    const currentStageConfig = this.STAGE_GATES[deal.stage as keyof typeof this.STAGE_GATES];
    if (!currentStageConfig) {
      return { canAdvance: false, confidence: 0 };
    }

    const stageResult = this.evaluateStageGates(deal, deal.stage);
    const allGatesPassed = Object.values(stageResult.gatesPassed).every(passed => passed);
    
    return {
      canAdvance: allGatesPassed && stageResult.confidence > 80,
      nextStage: currentStageConfig.nextStage,
      confidence: stageResult.confidence
    };
  }

  private static evaluateStageGates(deal: DealData, stage: string): ProgressionResult {
    const stageConfig = this.STAGE_GATES[stage as keyof typeof this.STAGE_GATES];
    if (!stageConfig) {
      return {
        canAdvance: false,
        requiredActions: ['Stage configuration not found'],
        gatesPassed: {},
        confidence: 0
      };
    }

    const gatesPassed: Record<string, boolean> = {};
    const requiredActions: string[] = [];
    let confidence = 0;

    // Evaluate each gate for the stage
    stageConfig.gates.forEach(gate => {
      const passed = this.evaluateGate(deal, gate);
      gatesPassed[gate] = passed;
      
      if (passed) {
        confidence += (100 / stageConfig.gates.length);
      } else {
        requiredActions.push(this.getGateAction(gate));
      }
    });

    return {
      canAdvance: Object.values(gatesPassed).every(passed => passed),
      requiredActions,
      gatesPassed,
      nextStage: stageConfig.nextStage,
      confidence: Math.round(confidence)
    };
  }

  private static evaluateGate(deal: DealData, gate: string): boolean {
    switch (gate) {
      case 'qualified_need':
        return deal.meddpiccScores?.identifyPain && deal.meddpiccScores.identifyPain > 60;
      
      case 'budget_confirmed':
        return deal.meddpiccScores?.economicBuyer && deal.meddpiccScores.economicBuyer > 60;
      
      case 'timeline_defined':
        return deal.closeDate ? true : false;
      
      case 'decision_maker_identified':
        return deal.contacts?.some(contact => contact.role === 'decision-maker') || false;
      
      case 'champion_established':
        return deal.meddpiccScores?.champion && deal.meddpiccScores.champion > 70;
      
      case 'solution_presented':
        return deal.activities?.some(activity => 
          activity.type === 'demo' || activity.type === 'proposal'
        ) || false;
      
      case 'proposal_submitted':
        return deal.activities?.some(activity => activity.type === 'proposal') || false;
      
      case 'terms_negotiated':
        return deal.probability > 80;
      
      case 'legal_approved':
        return deal.meddpiccScores?.paperProcess && deal.meddpiccScores.paperProcess > 70;
      
      case 'contract_signed':
        return deal.probability >= 95;
      
      case 'payment_terms_agreed':
        return deal.meddpiccScores?.metrics && deal.meddpiccScores.metrics > 80;
      
      case 'implementation_planned':
        return deal.activities?.some(activity => 
          activity.notes?.toLowerCase().includes('implementation')
        ) || false;
      
      default:
        return false;
    }
  }

  private static getGateAction(gate: string): string {
    const actions = {
      qualified_need: 'Conduct discovery to identify and qualify customer pain points',
      budget_confirmed: 'Identify economic buyer and confirm budget availability',
      timeline_defined: 'Establish clear timeline and close date expectations',
      decision_maker_identified: 'Map decision-making unit and identify key stakeholders',
      champion_established: 'Develop internal champion who will advocate for your solution',
      solution_presented: 'Present solution through demo or detailed proposal',
      proposal_submitted: 'Submit formal proposal with pricing and terms',
      terms_negotiated: 'Negotiate terms and address any objections',
      legal_approved: 'Complete legal review and procurement processes',
      contract_signed: 'Finalize and execute contract',
      payment_terms_agreed: 'Agree on payment terms and schedule',
      implementation_planned: 'Plan implementation and onboarding process'
    };

    return actions[gate as keyof typeof actions] || `Complete ${gate} requirements`;
  }

  static getStageRequirements(stage: string): string[] {
    const stageConfig = this.STAGE_GATES[stage as keyof typeof this.STAGE_GATES];
    return stageConfig ? stageConfig.gates.map(gate => this.getGateAction(gate)) : [];
  }

  static getNextStage(currentStage: string): string | undefined {
    const stageConfig = this.STAGE_GATES[currentStage as keyof typeof this.STAGE_GATES];
    return stageConfig?.nextStage;
  }
}