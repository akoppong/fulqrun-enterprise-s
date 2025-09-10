/**
 * @deprecated This file is being refactored into modular types.
 * Use imports from '@/lib/types' instead of direct imports from this file.
 * 
 * The types are being moved to domain-specific files for better maintainability:
 * - Core types: @/lib/types/core
 * - Opportunities: @/lib/types/opportunities  
 * - Pipeline: @/lib/types/pipeline
 * - Segments: @/lib/types/segments
 * - KPIs: @/lib/types/kpi
 * - AI Analytics: @/lib/types/ai-analytics
 * - Performance: @/lib/types/performance
 * - Integrations: @/lib/types/integrations
 * - Reports: @/lib/types/reports
 */

// Re-export all types from the modular structure for backward compatibility
export * from './types/index';
