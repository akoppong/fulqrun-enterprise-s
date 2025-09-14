/**
 * Default values and initialization utilities for MEDDPICC
 */

import { MEDDPICC } from './types';

/**
 * Creates a default MEDDPICC object with all scores initialized to 0
 */
export function createDefaultMEDDPICC(): MEDDPICC {
  return {
    // Scoring fields (0-10 scale)
    metrics: 0,
    economicBuyer: 0,
    decisionCriteria: 0,
    decisionProcess: 0,
    paperProcess: 0,
    identifyPain: 0,
    champion: 0,
    competition: 0,
    
    // Overall score (calculated from criteria)
    score: 0,
    
    // Text fields for detailed notes
    metricsNotes: '',
    economicBuyerNotes: '',
    decisionCriteriaNotes: '',
    decisionProcessNotes: '',
    paperProcessNotes: '',
    identifyPainNotes: '',
    championNotes: '',
    competitionNotes: '',
    notes: '',
    
    // Metadata
    lastUpdated: new Date()
  };
}

/**
 * Safely converts any value to a valid MEDDPICC score (0-10)
 */
export function toMEDDPICCScore(value: any): number {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(10, num));
}

/**
 * Calculates the overall MEDDPICC score from individual criteria
 */
export function calculateMEDDPICCScore(meddpicc: MEDDPICC): number {
  const scoreKeys = ['metrics', 'economicBuyer', 'decisionCriteria', 'decisionProcess', 'paperProcess', 'identifyPain', 'champion', 'competition'] as const;
  const scores = scoreKeys.map(key => toMEDDPICCScore(meddpicc[key]));
  const validScores = scores.filter(score => score > 0);
  
  if (validScores.length === 0) return 0;
  return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
}

/**
 * Ensures a MEDDPICC object has all required fields with safe defaults
 */
export function ensureMEDDPICCComplete(meddpicc: Partial<MEDDPICC>): MEDDPICC {
  const defaults = createDefaultMEDDPICC();
  const result = { ...defaults, ...meddpicc };
  
  // Ensure all numeric fields are valid
  result.metrics = toMEDDPICCScore(result.metrics);
  result.economicBuyer = toMEDDPICCScore(result.economicBuyer);
  result.decisionCriteria = toMEDDPICCScore(result.decisionCriteria);
  result.decisionProcess = toMEDDPICCScore(result.decisionProcess);
  result.paperProcess = toMEDDPICCScore(result.paperProcess);
  result.identifyPain = toMEDDPICCScore(result.identifyPain);
  result.champion = toMEDDPICCScore(result.champion);
  result.competition = toMEDDPICCScore(result.competition);
  
  // Calculate overall score
  result.score = calculateMEDDPICCScore(result);
  
  // Ensure lastUpdated is a valid Date
  if (!result.lastUpdated || !(result.lastUpdated instanceof Date)) {
    result.lastUpdated = new Date();
  }
  
  return result;
}