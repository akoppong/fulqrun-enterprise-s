/**
 * MEDDPICC Module Exports
 * Central export point for all MEDDPICC components and utilities
 */

// Main Components
export { MEDDPICCModule } from './MEDDPICCModule';
export { MEDDPICCLauncher } from './MEDDPICCLauncher';
export { MEDDPICCDemo } from './MEDDPICCDemo';
export { MEDDPICCAssessment } from './MEDDPICCAssessment';
export { MEDDPICCAnalyticsDashboard } from './MEDDPICCAnalytics';
export { MEDDPICCSummary, MEDDPICCScoreBadge, MEDDPICCHealthIndicator } from './MEDDPICCSummary';
export { MEDDPICCAdminConfig } from './MEDDPICCAdminConfig';

// Services
export { MEDDPICCService } from '@/services/meddpicc-service';

// Configuration
export { MEDDPICC_CONFIG, calculatePillarScore, calculateTotalScore, getScoreLevel, getCoachingPrompts } from '@/data/meddpicc-config';

// Types
export type {
  MEDDPICCOption,
  MEDDPICCQuestion,
  MEDDPICCPillar,
  MEDDPICCAnswer,
  MEDDPICCScore,
  MEDDPICCAssessment,
  MEDDPICCSession,
  MEDDPICCAnalytics,
  MEDDPICCConfiguration,
  CoachingPrompt,
  MEDDPICCThreshold,
  MEDDPICCUIState,
  MEDDPICCAction
} from '@/types/meddpicc';