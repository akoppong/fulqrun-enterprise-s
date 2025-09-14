/**
 * MEDDPICC Module Exports
 * Central export point for all MEDDPICC components and utilities
 */

// Main Components
export { MEDDPICCModule } from './MEDDPICCModule';
export { EnhancedMEDDPICCModule } from './EnhancedMEDDPICCModule';
export { EnhancedMEDDPICCAnalytics } from './EnhancedMEDDPICCAnalytics';
export { MEDDPICCLauncher } from './MEDDPICCLauncher';
export { MEDDPICCDemo } from './MEDDPICCDemo';
export { MEDDPICCAssessment } from './MEDDPICCAssessment';
export { MEDDPICCAnalyticsDashboard } from './MEDDPICCAnalytics';
export { MEDDPICCAnalyticsTest } from './MEDDPICCAnalyticsTest';
export { MEDDPICCSummary, MEDDPICCScoreBadge, MEDDPICCHealthIndicator } from './MEDDPICCSummary';
export { MEDDPICCAdminConfig } from './MEDDPICCAdminConfig';

// Enhanced Services
export { MEDDPICCScoringService } from '../../services/meddpicc-scoring-service';

// Legacy Services
export { MEDDPICCService } from '@/services/meddpicc-service';

// Configuration
export { MEDDPICC_CONFIG, calculatePillarScore, calculateTotalScore, getScoreLevel, getCoachingPrompts } from '@/data/meddpicc-config';

// Enhanced Types
export type {
  MEDDPICCAssessment as EnhancedMEDDPICCAssessment,
  MEDDPICCAnswer as EnhancedMEDDPICCAnswer,
  MEDDPICCInsight,
  MEDDPICCTrend,
  MEDDPICCBenchmark
} from '../../services/meddpicc-scoring-service';

// Legacy Types
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