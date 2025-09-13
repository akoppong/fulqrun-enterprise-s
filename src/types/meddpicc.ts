/**
 * MEDDPICC Qualification System Types
 * Defines data structures for B2B sales qualification methodology
 */

export interface MEDDPICCOption {
  label: string;
  value: string;
  score: number;
}

export interface MEDDPICCQuestion {
  id: string;
  text: string;
  type: 'single-select' | 'multi-select' | 'likert' | 'boolean';
  options: MEDDPICCOption[];
  tooltip?: string;
  weight?: number;
}

export interface MEDDPICCPillar {
  id: string;
  title: string;
  description: string;
  questions: MEDDPICCQuestion[];
  primer?: string;
  maxScore?: number;
}

export interface MEDDPICCAnswer {
  opportunity_id: string;
  pillar: string;
  question_id: string;
  answer_value: string;
  pillar_score: number;
  total_score: number;
  last_updated_by: string;
  timestamp: Date;
}

export interface MEDDPICCScore {
  pillar: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'strong' | 'moderate' | 'weak';
}

export interface MEDDPICCAssessment {
  opportunity_id: string;
  pillar_scores: MEDDPICCScore[];
  total_score: number;
  max_total_score: number;
  overall_level: 'strong' | 'moderate' | 'weak';
  completion_percentage: number;
  last_updated: Date;
  coaching_prompts: CoachingPrompt[];
}

export interface CoachingPrompt {
  id: string;
  pillar: string;
  condition: {
    pillar: string;
    value: string;
    operator?: 'equals' | 'less_than' | 'greater_than';
  };
  prompt: string;
  priority: 'high' | 'medium' | 'low';
  action_items?: string[];
}

export interface MEDDPICCThreshold {
  min?: number;
  max?: number;
  label: string;
  color?: string;
  description?: string;
}

export interface MEDDPICCConfiguration {
  pillars: MEDDPICCPillar[];
  scoring: {
    max_score: number;
    thresholds: {
      strong: MEDDPICCThreshold;
      moderate: MEDDPICCThreshold;
      weak: MEDDPICCThreshold;
    };
  };
  coaching_prompts: CoachingPrompt[];
  version: string;
  last_updated: Date;
}

export interface MEDDPICCSession {
  id: string;
  opportunity_id: string;
  user_id: string;
  started_at: Date;
  completed_at?: Date;
  current_pillar?: string;
  answers: Record<string, string>;
  assessment?: MEDDPICCAssessment;
  notes?: string;
}

// Analytics interfaces
export interface MEDDPICCAnalytics {
  score_distribution: {
    strong: number;
    moderate: number;
    weak: number;
  };
  pillar_analysis: {
    pillar: string;
    average_score: number;
    common_gaps: string[];
    improvement_rate: number;
  }[];
  win_rate_by_score: {
    score_range: string;
    win_rate: number;
    deal_count: number;
  }[];
  completion_rate: number;
  average_time_to_complete: number;
}

// UI State interfaces
export interface MEDDPICCUIState {
  current_pillar: string | null;
  expanded_pillars: Set<string>;
  is_loading: boolean;
  is_saving: boolean;
  has_unsaved_changes: boolean;
  validation_errors: Record<string, string>;
  show_coaching: boolean;
  show_analytics: boolean;
}

export type MEDDPICCAction = 
  | { type: 'SET_CURRENT_PILLAR'; payload: string }
  | { type: 'TOGGLE_PILLAR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_VALIDATION_ERROR'; payload: { field: string; error: string } }
  | { type: 'CLEAR_VALIDATION_ERRORS' }
  | { type: 'TOGGLE_COACHING' }
  | { type: 'TOGGLE_ANALYTICS' };