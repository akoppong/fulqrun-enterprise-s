/**
 * Data Consistency and Model Validation Utilities
 * 
 * This module provides utilities to ensure data consistency across the application,
 * validate data models, and handle type conversions safely.
 */

import { Opportunity, Company, Contact, MEDDPICC } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataMigrationResult {
  migratedCount: number;
  errors: string[];
  changes: string[];
}

/**
 * Validates and normalizes opportunity data to ensure consistency
 */
export function validateOpportunity(opportunity: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!opportunity?.id || typeof opportunity.id !== 'string') {
    errors.push('Opportunity must have a valid string ID');
  }

  if (!opportunity?.title || typeof opportunity.title !== 'string') {
    errors.push('Opportunity must have a valid title');
  }

  if (!opportunity?.companyId || typeof opportunity.companyId !== 'string') {
    errors.push('Opportunity must have a valid company ID');
  }

  // Value validation
  if (typeof opportunity?.value !== 'number' || isNaN(opportunity.value) || opportunity.value < 0) {
    errors.push('Opportunity value must be a non-negative number');
  }

  // Date validation
  const dateFields = ['expectedCloseDate', 'createdAt', 'updatedAt'];
  dateFields.forEach(field => {
    if (opportunity?.[field]) {
      const date = new Date(opportunity[field]);
      if (isNaN(date.getTime())) {
        errors.push(`${field} must be a valid date`);
      }
    } else if (field === 'expectedCloseDate' || field === 'createdAt') {
      errors.push(`${field} is required`);
    }
  });

  // Probability validation
  if (typeof opportunity?.probability !== 'number' || opportunity.probability < 0 || opportunity.probability > 100) {
    errors.push('Probability must be a number between 0 and 100');
  }

  // MEDDPICC validation
  if (!opportunity?.meddpicc || typeof opportunity.meddpicc !== 'object') {
    errors.push('Opportunity must have valid MEDDPICC qualification data');
  } else {
    const meddpiccFields = ['metrics', 'economicBuyer', 'decisionCriteria', 'decisionProcess', 'paperProcess', 'implicatePain', 'champion'];
    meddpiccFields.forEach(field => {
      if (typeof opportunity.meddpicc[field] !== 'string') {
        warnings.push(`MEDDPICC ${field} should be a string`);
      }
    });

    if (typeof opportunity.meddpicc.score !== 'number' || opportunity.meddpicc.score < 0 || opportunity.meddpicc.score > 100) {
      errors.push('MEDDPICC score must be a number between 0 and 100');
    }
  }

  // Stage validation - support both PEAK stages and deal closure stages
  const validStages = ['prospect', 'engage', 'acquire', 'keep', 'closed-won', 'closed-lost'];
  if (!opportunity?.stage || !validStages.includes(opportunity.stage)) {
    errors.push(`Stage must be one of: ${validStages.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Normalizes opportunity data to ensure consistent format
 */
export function normalizeOpportunity(opportunity: any): Opportunity {
  const now = new Date().toISOString();
  
  return {
    id: String(opportunity?.id || ''),
    companyId: String(opportunity?.companyId || ''),
    contactId: String(opportunity?.contactId || ''),
    title: String(opportunity?.title || opportunity?.name || ''),
    description: String(opportunity?.description || ''),
    value: Number(opportunity?.value) || 0,
    stage: String(opportunity?.stage || 'prospect'),
    pipelineId: String(opportunity?.pipelineId || ''),
    probability: Math.max(0, Math.min(100, Number(opportunity?.probability) || 25)),
    expectedCloseDate: opportunity?.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toISOString() : now,
    ownerId: String(opportunity?.ownerId || 'current-user'),
    priority: ['low', 'medium', 'high', 'critical'].includes(opportunity?.priority) ? opportunity.priority : 'medium',
    industry: String(opportunity?.industry || ''),
    leadSource: String(opportunity?.leadSource || ''),
    tags: Array.isArray(opportunity?.tags) ? opportunity.tags.filter(tag => typeof tag === 'string') : [],
    meddpicc: normalizeMEDDPICC(opportunity?.meddpicc),
    createdAt: opportunity?.createdAt ? new Date(opportunity.createdAt).toISOString() : now,
    updatedAt: opportunity?.updatedAt ? new Date(opportunity.updatedAt).toISOString() : now,
    aiInsights: opportunity?.aiInsights && typeof opportunity.aiInsights === 'object' ? {
      riskScore: Math.max(0, Math.min(100, Number(opportunity.aiInsights.riskScore) || 0)),
      nextBestActions: Array.isArray(opportunity.aiInsights.nextBestActions) ? opportunity.aiInsights.nextBestActions : [],
      predictedCloseDate: opportunity.aiInsights.predictedCloseDate ? new Date(opportunity.aiInsights.predictedCloseDate).toISOString() : undefined,
      confidenceLevel: ['low', 'medium', 'high'].includes(opportunity.aiInsights.confidenceLevel) ? opportunity.aiInsights.confidenceLevel : 'medium',
      competitorAnalysis: String(opportunity.aiInsights.competitorAnalysis || ''),
      lastAiUpdate: opportunity.aiInsights.lastAiUpdate ? new Date(opportunity.aiInsights.lastAiUpdate).toISOString() : undefined
    } : undefined,
    workflowStatus: opportunity?.workflowStatus && typeof opportunity.workflowStatus === 'object' ? {
      currentWorkflow: String(opportunity.workflowStatus.currentWorkflow || ''),
      completedSteps: Array.isArray(opportunity.workflowStatus.completedSteps) ? opportunity.workflowStatus.completedSteps : [],
      nextSteps: Array.isArray(opportunity.workflowStatus.nextSteps) ? opportunity.workflowStatus.nextSteps : [],
      automationTriggers: Array.isArray(opportunity.workflowStatus.automationTriggers) ? opportunity.workflowStatus.automationTriggers : []
    } : undefined
  };
}

/**
 * Normalizes MEDDPICC data to ensure consistent format
 */
export function normalizeMEDDPICC(meddpicc: any): MEDDPICC {
  return {
    metrics: String(meddpicc?.metrics || ''),
    economicBuyer: String(meddpicc?.economicBuyer || ''),
    decisionCriteria: String(meddpicc?.decisionCriteria || ''),
    decisionProcess: String(meddpicc?.decisionProcess || ''),
    paperProcess: String(meddpicc?.paperProcess || ''),
    implicatePain: String(meddpicc?.implicatePain || ''),
    champion: String(meddpicc?.champion || ''),
    score: Math.max(0, Math.min(100, Number(meddpicc?.score) || 0)),
    aiHints: meddpicc?.aiHints && typeof meddpicc.aiHints === 'object' ? {
      metricsHints: Array.isArray(meddpicc.aiHints.metricsHints) ? meddpicc.aiHints.metricsHints : [],
      championHints: Array.isArray(meddpicc.aiHints.championHints) ? meddpicc.aiHints.championHints : [],
      riskFactors: Array.isArray(meddpicc.aiHints.riskFactors) ? meddpicc.aiHints.riskFactors : []
    } : undefined,
    lastAiAnalysis: meddpicc?.lastAiAnalysis ? new Date(meddpicc.lastAiAnalysis).toISOString() : undefined
  };
}

/**
 * Validates and normalizes company data
 */
export function normalizeCompany(company: any): Company {
  return {
    id: String(company?.id || ''),
    name: String(company?.name || ''),
    industry: String(company?.industry || 'Technology'),
    size: String(company?.size || 'Unknown'),
    website: String(company?.website || ''),
    description: String(company?.description || ''),
    address: String(company?.address || ''),
    phone: String(company?.phone || ''),
    email: String(company?.email || ''),
    segment: String(company?.segment || 'General'),
    tags: Array.isArray(company?.tags) ? company.tags.filter(tag => typeof tag === 'string') : [],
    createdAt: company?.createdAt ? new Date(company.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: company?.updatedAt ? new Date(company.updatedAt).toISOString() : new Date().toISOString()
  };
}

/**
 * Validates and normalizes contact data
 */
export function normalizeContact(contact: any): Contact {
  return {
    id: String(contact?.id || ''),
    companyId: String(contact?.companyId || ''),
    firstName: String(contact?.firstName || ''),
    lastName: String(contact?.lastName || ''),
    email: String(contact?.email || ''),
    phone: String(contact?.phone || ''),
    title: String(contact?.title || ''),
    department: String(contact?.department || ''),
    role: ['decision-maker', 'influencer', 'user', 'champion'].includes(contact?.role) ? contact.role : 'user',
    influence: ['high', 'medium', 'low'].includes(contact?.influence) ? contact.influence : 'medium',
    tags: Array.isArray(contact?.tags) ? contact.tags.filter(tag => typeof tag === 'string') : [],
    notes: String(contact?.notes || ''),
    createdAt: contact?.createdAt ? new Date(contact.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: contact?.updatedAt ? new Date(contact.updatedAt).toISOString() : new Date().toISOString()
  };
}

/**
 * Migrates old data formats to new consistent formats
 */
export function migrateOpportunityData(opportunities: any[]): DataMigrationResult {
  const errors: string[] = [];
  const changes: string[] = [];
  let migratedCount = 0;

  const migratedOpportunities = opportunities.map((opp, index) => {
    try {
      const original = JSON.stringify(opp);
      const normalized = normalizeOpportunity(opp);
      const updated = JSON.stringify(normalized);

      if (original !== updated) {
        changes.push(`Opportunity ${opp.id || index}: Data format updated`);
        migratedCount++;
      }

      // Legacy field migrations
      if (opp.name && !opp.title) {
        normalized.title = opp.name;
        changes.push(`Opportunity ${opp.id || index}: Migrated 'name' field to 'title'`);
      }

      if (opp.closeDate && !opp.expectedCloseDate) {
        normalized.expectedCloseDate = new Date(opp.closeDate).toISOString();
        changes.push(`Opportunity ${opp.id || index}: Migrated 'closeDate' field to 'expectedCloseDate'`);
      }

      if (opp.createdDate && !opp.createdAt) {
        normalized.createdAt = new Date(opp.createdDate).toISOString();
        changes.push(`Opportunity ${opp.id || index}: Migrated 'createdDate' field to 'createdAt'`);
      }

      return normalized;
    } catch (error) {
      errors.push(`Failed to migrate opportunity ${opp.id || index}: ${error}`);
      return opp; // Return original if migration fails
    }
  });

  return {
    migratedCount,
    errors,
    changes
  };
}

/**
 * Validates KV storage data for consistency
 */
export function validateKVData(key: string, data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!key || typeof key !== 'string') {
    errors.push('KV key must be a non-empty string');
  }

  if (data === null || data === undefined) {
    warnings.push('KV data is null or undefined');
    return { isValid: true, errors, warnings };
  }

  // Validate based on common key patterns
  if (key.includes('opportunities')) {
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        const validation = validateOpportunity(item);
        validation.errors.forEach(error => {
          errors.push(`Opportunity ${index}: ${error}`);
        });
        validation.warnings.forEach(warning => {
          warnings.push(`Opportunity ${index}: ${warning}`);
        });
      });
    } else {
      errors.push('Opportunities data should be an array');
    }
  }

  if (key.includes('companies')) {
    if (!Array.isArray(data)) {
      errors.push('Companies data should be an array');
    }
  }

  if (key.includes('contacts')) {
    if (!Array.isArray(data)) {
      errors.push('Contacts data should be an array');
    }
  }

  // Check for circular references
  try {
    JSON.stringify(data);
  } catch (error) {
    errors.push('Data contains circular references and cannot be serialized');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Safely parses JSON data with fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Safely converts dates with fallback
 */
export function safeDateConvert(dateValue: any, fallback?: Date): Date {
  if (!dateValue) return fallback || new Date();
  
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? (fallback || new Date()) : date;
}

/**
 * Ensures numeric values are within valid range
 */
export function safeNumericConvert(value: any, min = 0, max = Number.MAX_SAFE_INTEGER, fallback = 0): number {
  const num = Number(value);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}