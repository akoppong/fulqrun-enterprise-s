/**
 * Opportunity Service with Database Integration
 * 
 * Provides a compatible interface with the existing opportunity service
 * while using the new normalized database backend
 */

import { db, ensureDatabaseInitialized } from '../database';
import { Opportunity as DBOpportunity, Company as DBCompany, Contact as DBContact } from '../database/schema';

// Legacy types for backward compatibility
export interface Opportunity {
  id: string;
  title: string;
  name?: string; // Alias for title
  company: string;
  companyId?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  description?: string;
  source?: string;
  primaryContact?: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
  assignedTo?: string;
  createdBy?: string;
  meddpicc?: {
    score: number;
    metrics?: number;
    economicBuyer?: number;
    decisionCriteria?: number;
    decisionProcess?: number;
    paperProcess?: number;
    identifyPain?: number;
    champion?: number;
    competition?: number;
  };
  peakScores?: {
    prospect: number;
    engage: number;
    acquire: number;
    keep: number;
  };
  // Additional fields for analytics compatibility
  daysInStage?: number;
  totalDaysInPipeline?: number;
  lastActivity?: Date;
  activities?: any[];
  contacts?: any[];
  closeDate?: Date;
  createdDate?: Date;
  competitor?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address?: string;
  revenue?: number;
  employees?: number;
  region: string;
  country: string;
  geography?: string; // Legacy field
  segment?: string;
  segmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  region: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enhanced Opportunity Service with Database Integration
 */
export class EnhancedOpportunityService {
  private static initialized = false;

  /**
   * Ensure database is initialized before operations
   */
  private static async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await ensureDatabaseInitialized();
      this.initialized = true;
    }
  }

  /**
   * Convert database opportunity to legacy format
   */
  private static convertOpportunityFromDB(
    dbOpp: DBOpportunity,
    company?: DBCompany,
    contact?: DBContact,
    meddpiccData?: any,
    peakData?: any
  ): Opportunity {
    return {
      id: dbOpp.id,
      title: dbOpp.title,
      name: dbOpp.title, // Alias for backward compatibility
      company: company?.name || dbOpp.company_id,
      companyId: dbOpp.company_id,
      value: dbOpp.value,
      stage: dbOpp.stage,
      probability: dbOpp.probability,
      expectedCloseDate: dbOpp.expected_close_date,
      createdAt: dbOpp.created_at,
      updatedAt: dbOpp.updated_at,
      priority: dbOpp.priority,
      tags: dbOpp.tags,
      description: dbOpp.description,
      source: dbOpp.source,
      primaryContact: contact ? `${contact.first_name} ${contact.last_name}` : undefined,
      contactEmail: contact?.email,
      contactPhone: contact?.phone,
      industry: company?.industry,
      assignedTo: dbOpp.assigned_to,
      createdBy: dbOpp.created_by,
      meddpicc: meddpiccData ? {
        score: meddpiccData.total_score / 8, // Convert from 0-80 to 0-10 scale
        metrics: meddpiccData.metrics,
        economicBuyer: meddpiccData.economic_buyer,
        decisionCriteria: meddpiccData.decision_criteria,
        decisionProcess: meddpiccData.decision_process,
        paperProcess: meddpiccData.paper_process,
        identifyPain: meddpiccData.identify_pain,
        champion: meddpiccData.champion,
        competition: meddpiccData.competition,
      } : { score: 0 },
      peakScores: peakData ? {
        prospect: peakData.prospect_score,
        engage: peakData.engage_score,
        acquire: peakData.acquire_score,
        keep: peakData.keep_score,
      } : { prospect: 0, engage: 0, acquire: 0, keep: 0 },
      // Additional fields for analytics
      daysInStage: peakData?.days_in_stage || 0,
      totalDaysInPipeline: peakData?.total_days_in_pipeline || 0,
      lastActivity: new Date(dbOpp.updated_at),
      activities: [],
      contacts: [],
      closeDate: new Date(dbOpp.expected_close_date),
      createdDate: new Date(dbOpp.created_at),
    };
  }

  /**
   * Convert legacy opportunity format to database format
   */
  private static convertOpportunityToDB(opportunity: Partial<Opportunity>): any {
    return {
      title: opportunity.title || opportunity.name,
      company_id: opportunity.companyId || 'unknown-company',
      primary_contact_id: undefined, // Will be resolved from company contacts
      assigned_to: opportunity.assignedTo || 'current-user',
      value: opportunity.value || 0,
      currency: 'USD',
      stage: opportunity.stage || 'prospect',
      probability: opportunity.probability || 0,
      expected_close_date: opportunity.expectedCloseDate ? 
        new Date(opportunity.expectedCloseDate).toISOString() : 
        new Date().toISOString(),
      source: opportunity.source,
      description: opportunity.description,
      tags: opportunity.tags || [],
      priority: opportunity.priority || 'medium',
      created_by: opportunity.createdBy || 'current-user',
    };
  }

  /**
   * Initialize sample data - maintains backward compatibility
   */
  static async initializeSampleData(): Promise<void> {
    await this.ensureInitialized();
    // Sample data is created during database initialization
    console.log('Sample data initialized via database');
  }

  /**
   * Create a new opportunity
   */
  static async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    await this.ensureInitialized();

    try {
      const dbData = this.convertOpportunityToDB(data);
      
      // Create the opportunity in a transaction
      const result = await db.withTransaction(async () => {
        const opportunity = await db.opportunities.create(dbData);
        
        // Create associated MEDDPICC record if provided
        if (data.meddpicc) {
          await db.meddpicc.create({
            opportunity_id: opportunity.id,
            metrics: data.meddpicc.metrics || 0,
            economic_buyer: data.meddpicc.economicBuyer || 0,
            decision_criteria: data.meddpicc.decisionCriteria || 0,
            decision_process: data.meddpicc.decisionProcess || 0,
            paper_process: data.meddpicc.paperProcess || 0,
            identify_pain: data.meddpicc.identifyPain || 0,
            champion: data.meddpicc.champion || 0,
            competition: data.meddpicc.competition || 0,
            total_score: (data.meddpicc.metrics || 0) + (data.meddpicc.economicBuyer || 0) + 
                        (data.meddpicc.decisionCriteria || 0) + (data.meddpicc.decisionProcess || 0) +
                        (data.meddpicc.paperProcess || 0) + (data.meddpicc.identifyPain || 0) +
                        (data.meddpicc.champion || 0) + (data.meddpicc.competition || 0),
            confidence_level: 'medium',
            last_updated_by: opportunity.created_by,
          });
        }

        // Create associated PEAK process record
        await db.peakProcess.create({
          opportunity_id: opportunity.id,
          prospect_score: data.peakScores?.prospect || 0,
          engage_score: data.peakScores?.engage || 0,
          acquire_score: data.peakScores?.acquire || 0,
          keep_score: data.peakScores?.keep || 0,
          current_stage: opportunity.stage as any,
          stage_entry_date: opportunity.created_at,
          days_in_stage: 0,
          total_days_in_pipeline: 0,
          last_updated_by: opportunity.created_by,
        });

        return opportunity;
      });

      // Load related data and convert to legacy format
      const company = await db.companies.findById(result.company_id);
      const contact = result.primary_contact_id ? await db.contacts.findById(result.primary_contact_id) : undefined;
      const meddpicc = (await db.meddpicc.findByOpportunity(result.id))[0];
      const peak = (await db.peakProcess.findByOpportunity(result.id))[0];

      return this.convertOpportunityFromDB(result, company, contact, meddpicc, peak);
    } catch (error) {
      console.error('Failed to create opportunity:', error);
      throw error;
    }
  }

  /**
   * Update an opportunity
   */
  static async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    await this.ensureInitialized();

    try {
      const dbUpdates = this.convertOpportunityToDB(updates);
      
      const result = await db.withTransaction(async () => {
        const opportunity = await db.opportunities.update(id, dbUpdates);
        if (!opportunity) return null;

        // Update MEDDPICC if provided
        if (updates.meddpicc) {
          await db.meddpicc.updateScores(id, {
            metrics: updates.meddpicc.metrics,
            economic_buyer: updates.meddpicc.economicBuyer,
            decision_criteria: updates.meddpicc.decisionCriteria,
            decision_process: updates.meddpicc.decisionProcess,
            paper_process: updates.meddpicc.paperProcess,
            identify_pain: updates.meddpicc.identifyPain,
            champion: updates.meddpicc.champion,
            competition: updates.meddpicc.competition,
          }, opportunity.updated_at);
        }

        // Update PEAK process if stage changed
        if (updates.stage) {
          await db.peakProcess.updateStage(id, updates.stage, opportunity.updated_at);
        }

        return opportunity;
      });

      if (!result) return null;

      // Load related data and convert to legacy format
      const company = await db.companies.findById(result.company_id);
      const contact = result.primary_contact_id ? await db.contacts.findById(result.primary_contact_id) : undefined;
      const meddpicc = (await db.meddpicc.findByOpportunity(result.id))[0];
      const peak = (await db.peakProcess.findByOpportunity(result.id))[0];

      return this.convertOpportunityFromDB(result, company, contact, meddpicc, peak);
    } catch (error) {
      console.error('Failed to update opportunity:', error);
      throw error;
    }
  }

  /**
   * Delete an opportunity
   */
  static async deleteOpportunity(id: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      return await db.withTransaction(async () => {
        // Delete related records first
        const meddpiccRecords = await db.meddpicc.findByOpportunity(id);
        for (const record of meddpiccRecords) {
          await db.meddpicc.delete(record.id);
        }

        const peakRecords = await db.peakProcess.findByOpportunity(id);
        for (const record of peakRecords) {
          await db.peakProcess.delete(record.id);
        }

        const activities = await db.activities.findByOpportunity(id);
        for (const activity of activities) {
          await db.activities.delete(activity.id);
        }

        const notes = await db.notes.findByOpportunity(id);
        for (const note of notes) {
          await db.notes.delete(note.id);
        }

        // Delete the opportunity
        return await db.opportunities.delete(id);
      });
    } catch (error) {
      console.error('Failed to delete opportunity:', error);
      return false;
    }
  }

  /**
   * Get opportunity by ID
   */
  static async getOpportunity(id: string): Promise<Opportunity | null> {
    await this.ensureInitialized();

    try {
      const opportunity = await db.opportunities.findById(id);
      if (!opportunity) return null;

      // Load related data
      const company = await db.companies.findById(opportunity.company_id);
      const contact = opportunity.primary_contact_id ? await db.contacts.findById(opportunity.primary_contact_id) : undefined;
      const meddpicc = (await db.meddpicc.findByOpportunity(opportunity.id))[0];
      const peak = (await db.peakProcess.findByOpportunity(opportunity.id))[0];

      return this.convertOpportunityFromDB(opportunity, company, contact, meddpicc, peak);
    } catch (error) {
      console.error('Failed to get opportunity:', error);
      return null;
    }
  }

  /**
   * Get all opportunities
   */
  static async getAllOpportunities(): Promise<Opportunity[]> {
    await this.ensureInitialized();

    try {
      const { data: opportunities } = await db.opportunities.findAll();
      const results: Opportunity[] = [];

      for (const opportunity of opportunities) {
        // Load related data
        const company = await db.companies.findById(opportunity.company_id);
        const contact = opportunity.primary_contact_id ? await db.contacts.findById(opportunity.primary_contact_id) : undefined;
        const meddpicc = (await db.meddpicc.findByOpportunity(opportunity.id))[0];
        const peak = (await db.peakProcess.findByOpportunity(opportunity.id))[0];

        results.push(this.convertOpportunityFromDB(opportunity, company, contact, meddpicc, peak));
      }

      return results;
    } catch (error) {
      console.error('Failed to get all opportunities:', error);
      return [];
    }
  }

  /**
   * Get opportunities by stage
   */
  static async getOpportunitiesByStage(stage: string): Promise<Opportunity[]> {
    await this.ensureInitialized();

    try {
      const opportunities = await db.opportunities.findByStage(stage);
      const results: Opportunity[] = [];

      for (const opportunity of opportunities) {
        const company = await db.companies.findById(opportunity.company_id);
        const contact = opportunity.primary_contact_id ? await db.contacts.findById(opportunity.primary_contact_id) : undefined;
        const meddpicc = (await db.meddpicc.findByOpportunity(opportunity.id))[0];
        const peak = (await db.peakProcess.findByOpportunity(opportunity.id))[0];

        results.push(this.convertOpportunityFromDB(opportunity, company, contact, meddpicc, peak));
      }

      return results;
    } catch (error) {
      console.error('Failed to get opportunities by stage:', error);
      return [];
    }
  }

  /**
   * Search opportunities
   */
  static async searchOpportunities(query: string): Promise<Opportunity[]> {
    await this.ensureInitialized();

    try {
      const { data: opportunities } = await db.opportunities.findAll();
      const lowerQuery = query.toLowerCase();
      
      const filteredOpportunities = opportunities.filter(opp => 
        opp.title.toLowerCase().includes(lowerQuery) ||
        opp.description?.toLowerCase().includes(lowerQuery) ||
        opp.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );

      const results: Opportunity[] = [];

      for (const opportunity of filteredOpportunities) {
        const company = await db.companies.findById(opportunity.company_id);
        const contact = opportunity.primary_contact_id ? await db.contacts.findById(opportunity.primary_contact_id) : undefined;
        const meddpicc = (await db.meddpicc.findByOpportunity(opportunity.id))[0];
        const peak = (await db.peakProcess.findByOpportunity(opportunity.id))[0];

        results.push(this.convertOpportunityFromDB(opportunity, company, contact, meddpicc, peak));
      }

      return results;
    } catch (error) {
      console.error('Failed to search opportunities:', error);
      return [];
    }
  }

  /**
   * Get opportunity statistics
   */
  static async getOpportunityStats() {
    await this.ensureInitialized();

    try {
      return await db.opportunities.getOpportunityStats();
    } catch (error) {
      console.error('Failed to get opportunity stats:', error);
      return {
        total: 0,
        active: 0,
        totalValue: 0,
        averageValue: 0,
        byStage: {},
        byPriority: {},
        byUser: {}
      };
    }
  }

  /**
   * Update PEAK scores
   */
  static async updatePEAKScores(id: string, scores: Record<string, number>): Promise<Opportunity | null> {
    await this.ensureInitialized();

    try {
      const peakData = (await db.peakProcess.findByOpportunity(id))[0];
      if (peakData) {
        await db.peakProcess.update(peakData.id, {
          prospect_score: scores.prospect || peakData.prospect_score,
          engage_score: scores.engage || peakData.engage_score,
          acquire_score: scores.acquire || peakData.acquire_score,
          keep_score: scores.keep || peakData.keep_score,
        });
      }

      return this.getOpportunity(id);
    } catch (error) {
      console.error('Failed to update PEAK scores:', error);
      return null;
    }
  }

  /**
   * Update MEDDPICC scores
   */
  static async updateMEDDPICCScores(id: string, scores: Record<string, number>): Promise<Opportunity | null> {
    await this.ensureInitialized();

    try {
      await db.meddpicc.updateScores(id, scores as any, 'current-user');
      return this.getOpportunity(id);
    } catch (error) {
      console.error('Failed to update MEDDPICC scores:', error);
      return null;
    }
  }
}

// Export with the same interface as the original service
export const OpportunityService = EnhancedOpportunityService;