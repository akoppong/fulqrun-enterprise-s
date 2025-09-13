import { Opportunity, Company, Contact, MEDDPICC } from './types/index';
import { type DealData, DealAnalyticsEngine, type AnalyticsResult } from './analytics-engine';
import { DealProgressionEngine, type ProgressionResult, type DealProgression } from './progression-engine';
import { 
  normalizeOpportunity, 
  validateOpportunity, 
  migrateOpportunityData, 
  validateKVData, 
  safeJsonParse, 
  safeDateConvert 
} from './data-consistency';

/**
 * Extended analytics interface for opportunities that includes progression analysis
 * and auto-advancement capabilities
 */
export interface OpportunityAnalytics extends AnalyticsResult {
  progressionResults: Record<string, ProgressionResult>;
  canAutoAdvance: boolean;
  nextStage?: string;
}

/**
 * Opportunity with populated company and contact relationships
 */
export interface OpportunityWithRelations extends Opportunity {
  company?: Company;
  contact?: Contact;
}

/**
 * Comprehensive service for managing opportunities including CRUD operations,
 * analytics, progression tracking, and business logic validation.
 * 
 * Provides:
 * - CRUD operations for opportunities
 * - Business validation and rules enforcement
 * - PEAK methodology and MEDDPICC qualification tracking
 * - Integration with analytics and progression engines
 * - Local storage persistence with automatic serialization
 * 
 * @example
 * ```typescript
 * // Create a new opportunity
 * const opportunity = await OpportunityService.createOpportunity({
 *   title: 'Enterprise Software Deal',
 *   companyId: 'company-123',
 *   value: 250000,
 *   stage: 'prospect'
 * });
 * 
 * // Analyze opportunity for insights
 * const analytics = OpportunityService.analyzeOpportunity(opportunity.id);
 * if (analytics?.canAutoAdvance) {
 *   await OpportunityService.advanceStage(opportunity.id, analytics.nextStage!);
 * }
 * ```
 */
export class OpportunityService {
  private static STORAGE_KEY = 'opportunities';
  private static PROGRESSION_KEY = 'opportunity_progressions';
  private static COMPANIES_KEY = 'companies';
  private static CONTACTS_KEY = 'contacts';

  /**
   * Converts an Opportunity object to DealData format for analytics processing
   * 
   * @param opportunity - The opportunity to convert
   * @returns DealData object compatible with analytics engine
   * @internal
   */
  private static toDealData(opportunity: Opportunity): DealData {
    return {
      id: opportunity.id,
      name: opportunity.title,
      value: opportunity.value,
      stage: opportunity.stage,
      probability: opportunity.probability,
      daysInStage: this.calculateDaysInStage(opportunity),
      totalDaysInPipeline: this.calculateTotalDaysInPipeline(opportunity),
      lastActivity: new Date(), // Would be calculated from actual activities
      activities: [], // Would be populated from activity tracking
      contacts: [], // Would be populated from contact relationships
      peakScores: this.extractPeakScores(opportunity),
      meddpiccScores: this.extractMeddpiccScores(opportunity),
      closeDate: new Date(opportunity.expectedCloseDate),
      createdDate: new Date(opportunity.createdAt),
      competitor: undefined // Would be stored in opportunity metadata
    };
  }

  private static extractPeakScores(opportunity: Opportunity): Record<string, number> {
    // PEAK methodology scores would be stored in opportunity metadata
    // For now, derive from MEDDPICC and other fields
    return {
      prospect: opportunity.meddpicc.score * 0.8, // Base qualification
      engage: opportunity.probability * 0.8, // Engagement level
      acquire: opportunity.probability, // Close probability
      keep: opportunity.stage === 'closed-won' ? 90 : 50 // Customer success potential
    };
  }

  private static extractMeddpiccScores(opportunity: Opportunity): Record<string, number> {
    // Convert MEDDPICC text fields to scores using AI or keyword analysis
    const baseScore = opportunity.meddpicc.score;
    return {
      metrics: baseScore * 0.9,
      economicBuyer: baseScore * 0.85,
      decisionCriteria: baseScore * 0.8,
      decisionProcess: baseScore * 0.75,
      paperProcess: baseScore * 0.7,
      identifyPain: baseScore * 0.95,
      champion: baseScore * 0.9,
      competition: baseScore * 0.6
    };
  }

  private static calculateDaysInStage(opportunity: Opportunity): number {
    const updatedDate = new Date(opportunity.updatedAt);
    const now = new Date();
    return Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static calculateTotalDaysInPipeline(opportunity: Opportunity): number {
    const createdDate = new Date(opportunity.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Storage methods using localStorage (compatible with useKV pattern)
  static async getAllOpportunities(): Promise<Opportunity[]> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      // Always ensure we have initialized data
      if (!stored) {
        console.log('No stored opportunities found, initializing sample data...');
        await this.initializeSampleData();
        const newStored = localStorage.getItem(this.STORAGE_KEY);
        if (!newStored) {
          console.error('Failed to initialize opportunities data');
          return [];
        }
        
        const parsed = safeJsonParse(newStored, []);
        const result = Array.isArray(parsed) ? this.transformAndValidateOpportunities(parsed) : [];
        console.log('Initialized opportunities:', result.length, 'items');
        return result;
      }
      
      const parsed = safeJsonParse(stored, []);
      if (!Array.isArray(parsed)) {
        console.error('Stored opportunities data is corrupted (not an array):', typeof parsed);
        // Clear corrupted data and reinitialize
        localStorage.removeItem(this.STORAGE_KEY);
        await this.initializeSampleData();
        const newStored = localStorage.getItem(this.STORAGE_KEY);
        if (!newStored) return [];
        const newParsed = safeJsonParse(newStored, []);
        const result = Array.isArray(newParsed) ? this.transformAndValidateOpportunities(newParsed) : [];
        console.log('Recovered from corruption, opportunities:', result.length, 'items');
        return result;
      }
      
      const result = this.transformAndValidateOpportunities(parsed);
      console.log('Loaded opportunities from storage:', result.length, 'items');
      return result;
    } catch (error) {
      console.error('Error loading opportunities, attempting recovery:', error);
      
      // Clear corrupted data and reinitialize as fallback
      try {
        localStorage.removeItem(this.STORAGE_KEY);
        await this.initializeSampleData();
        const newStored = localStorage.getItem(this.STORAGE_KEY);
        if (newStored) {
          const parsed = safeJsonParse(newStored, []);
          const result = Array.isArray(parsed) ? this.transformAndValidateOpportunities(parsed) : [];
          console.log('Recovery successful, opportunities:', result.length, 'items');
          return result;
        }
      } catch (initError) {
        console.error('Recovery failed:', initError);
      }
      
      // Ultimate fallback - return empty array
      console.warn('All recovery attempts failed, returning empty array');
      return [];
    }
  }

  // Transform and validate opportunities to ensure data consistency
  private static transformAndValidateOpportunities(opportunities: any[]): Opportunity[] {
    try {
      if (!Array.isArray(opportunities)) {
        console.error('transformAndValidateOpportunities received non-array:', typeof opportunities);
        return [];
      }
      
      const migrationResult = migrateOpportunityData(opportunities);
      
      if (migrationResult.changes.length > 0) {
        console.log('Data migration applied:', migrationResult.changes);
      }
      
      if (migrationResult.errors.length > 0) {
        console.error('Data migration errors:', migrationResult.errors);
      }

      return opportunities.map(opp => {
        try {
          // Ensure we have a valid opportunity object
          if (!opp || typeof opp !== 'object') {
            console.warn('Invalid opportunity object:', opp);
            return null;
          }
          
          // Normalize the opportunity data
          const normalized = normalizeOpportunity(opp);
          
          // Add computed fields for compatibility
          return {
            ...normalized,
            name: normalized.title, // Map title to name for backward compatibility
            company: this.getCompanyName(normalized.companyId),
            primaryContact: this.getContactName(normalized.contactId),
            expectedCloseDate: safeDateConvert(normalized.expectedCloseDate),
            createdDate: safeDateConvert(normalized.createdAt),
            industry: normalized.industry || this.getCompanyIndustry(normalized.companyId)
          };
        } catch (error) {
          console.warn('Failed to normalize opportunity:', opp?.id, error);
          // Return original data if normalization fails
          if (opp && opp.id) {
            return {
              ...opp,
              name: opp.title || opp.name,
              company: this.getCompanyName(opp.companyId),
              primaryContact: this.getContactName(opp.contactId),
              expectedCloseDate: safeDateConvert(opp.expectedCloseDate),
              createdDate: safeDateConvert(opp.createdAt),
              industry: opp.industry || this.getCompanyIndustry(opp.companyId)
            };
          }
          return null;
        }
      }).filter((opp): opp is Opportunity => opp !== null);
    } catch (error) {
      console.error('Error in transformAndValidateOpportunities:', error);
      return [];
    }
  }

  // Transform opportunities to match the expected format for the view (legacy method)
  private static transformOpportunities(opportunities: any[]): any[] {
    return this.transformAndValidateOpportunities(opportunities);
  }

  private static getCompanyName(companyId: string): string {
    try {
      const companies = safeJsonParse(localStorage.getItem(this.COMPANIES_KEY) || '[]', []);
      const company = companies.find((c: any) => c.id === companyId);
      return company?.name || 'Unknown Company';
    } catch {
      return 'Unknown Company';
    }
  }

  private static getCompanyIndustry(companyId: string): string {
    try {
      const companies = safeJsonParse(localStorage.getItem(this.COMPANIES_KEY) || '[]', []);
      const company = companies.find((c: any) => c.id === companyId);
      return company?.industry || 'Technology';
    } catch {
      return 'Technology';
    }
  }

  private static getContactName(contactId: string): string {
    try {
      const contacts = safeJsonParse(localStorage.getItem(this.CONTACTS_KEY) || '[]', []);
      const contact = contacts.find((c: any) => c.id === contactId);
      return contact ? `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email || 'Unknown Contact' : 'Unknown Contact';
    } catch {
      return 'Unknown Contact';
    }
  }

  static async getOpportunity(id: string): Promise<Opportunity | null> {
    const opportunities = await this.getAllOpportunities();
    return opportunities.find(opp => opp.id === id) || null;
  }

  static async getOpportunityWithRelations(id: string): Promise<OpportunityWithRelations | null> {
    const opportunity = await this.getOpportunity(id);
    if (!opportunity) return null;

    const [company, contact] = await Promise.all([
      this.getCompany(opportunity.companyId),
      this.getContact(opportunity.contactId)
    ]);

    return {
      ...opportunity,
      company: company || undefined,
      contact: contact || undefined
    };
  }

  static async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    try {
      // Validate and normalize input data
      const normalizedData = normalizeOpportunity({
        ...data,
        id: data.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Validate the normalized opportunity
      const validation = validateOpportunity(normalizedData);
      if (!validation.isValid) {
        throw new Error(`Invalid opportunity data: ${validation.errors.join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Opportunity creation warnings:', validation.warnings);
      }

      const opportunities = await this.getAllOpportunities();
      opportunities.push(normalizedData);
      await this.saveOpportunities(opportunities);

      // Initialize progression tracking
      await this.initializeProgression(normalizedData);

      return normalizedData;
    } catch (error) {
      console.error('Failed to create opportunity:', error);
      throw new Error(`Failed to create opportunity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity | null> {
    const opportunities = await this.getAllOpportunities();
    const index = opportunities.findIndex(opp => opp.id === id);

    if (index === -1) return null;

    const existing = opportunities[index];
    
    // Normalize and validate the updated data
    const updated = normalizeOpportunity({
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    });

    // Validate the updated opportunity
    const validation = validateOpportunity(updated);
    if (!validation.isValid) {
      console.error('Invalid opportunity update:', validation.errors);
      throw new Error(`Invalid opportunity data: ${validation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Opportunity update warnings:', validation.warnings);
    }

    // Handle stage changes
    if (updates.stage && updates.stage !== existing.stage) {
      await this.updateProgressionHistory(updated, existing.stage);
    }

    opportunities[index] = updated;
    await this.saveOpportunities(opportunities);

    return updated;
  }

  static async deleteOpportunity(id: string): Promise<boolean> {
    const opportunities = await this.getAllOpportunities();
    const filtered = opportunities.filter(opp => opp.id !== id);

    if (filtered.length === opportunities.length) return false;

    await this.saveOpportunities(filtered);

    // Clean up progression data
    const progressions = await this.getAllProgressions();
    const updatedProgressions = progressions.filter(prog => prog.dealId !== id);
    await this.saveProgressions(updatedProgressions);

    return true;
  }

  // Search and filtering
  static async searchOpportunities(query: string): Promise<Opportunity[]> {
    const opportunities = await this.getAllOpportunities();
    const lowercaseQuery = query.toLowerCase();

    return opportunities.filter(opp =>
      (opp.name || opp.title)?.toLowerCase().includes(lowercaseQuery) ||
      opp.description?.toLowerCase().includes(lowercaseQuery) ||
      opp.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  static async getOpportunitiesByStage(stage: string): Promise<Opportunity[]> {
    const opportunities = await this.getAllOpportunities();
    return opportunities.filter(opp => opp.stage === stage);
  }

  static async getOpportunitiesByPriority(priority: string): Promise<Opportunity[]> {
    const opportunities = await this.getAllOpportunities();
    return opportunities.filter(opp => opp.priority === priority);
  }

  // Analytics integration
  static async analyzeOpportunity(id: string): Promise<OpportunityAnalytics | null> {
    const opportunity = await this.getOpportunity(id);
    if (!opportunity) return null;

    const dealData = this.toDealData(opportunity);
    const baseAnalytics = DealAnalyticsEngine.analyzeDeal(dealData);
    const progressionResults = DealProgressionEngine.evaluateDealProgression(dealData);
    const autoAdvanceResult = DealProgressionEngine.canAutoAdvance(dealData);

    return {
      ...baseAnalytics,
      progressionResults,
      canAutoAdvance: autoAdvanceResult.canAdvance,
      nextStage: autoAdvanceResult.nextStage
    };
  }

  static async analyzePortfolio() {
    const opportunities = await this.getAllOpportunities();
    const dealData = opportunities.map(opp => this.toDealData(opp));
    return DealAnalyticsEngine.analyzePortfolio(dealData);
  }

  // MEDDPICC management
  static async updateMeddpicc(id: string, meddpicc: Partial<MEDDPICC>): Promise<Opportunity | null> {
    const opportunity = await this.getOpportunity(id);
    if (!opportunity) return null;

    const updatedMeddpicc = {
      ...opportunity.meddpicc,
      ...meddpicc,
      lastAiAnalysis: new Date()
    };

    return this.updateOpportunity(id, { meddpicc: updatedMeddpicc });
  }

  // Stage management
  static async advanceStage(opportunityId: string, newStage: string, reason: string): Promise<boolean> {
    const opportunity = await this.getOpportunity(opportunityId);
    if (!opportunity) return false;

    // Check if advancement is allowed
    const analytics = await this.analyzeOpportunity(opportunityId);
    if (!analytics?.canAutoAdvance && newStage !== opportunity.stage) {
      console.log(`Manual stage advancement: ${reason}`);
    }

    const updated = await this.updateOpportunity(opportunityId, {
      stage: newStage
    });

    return updated !== null;
  }

  // Statistics and reporting
  static async getOpportunityStats() {
    const opportunities = await this.getAllOpportunities();

    return {
      total: opportunities.length,
      byStage: opportunities.reduce((acc, opp) => {
        acc[opp.stage] = (acc[opp.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: opportunities.reduce((acc, opp) => {
        acc[opp.priority || 'medium'] = (acc[opp.priority || 'medium'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
      averageValue: opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + opp.value, 0) / opportunities.length 
        : 0
    };
  }

  static async getUpcomingCloses(days = 30): Promise<Opportunity[]> {
    const opportunities = await this.getAllOpportunities();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return opportunities
      .filter(opp => 
        new Date(opp.expectedCloseDate) <= cutoffDate && 
        opp.stage !== 'closed-won' && 
        opp.stage !== 'closed-lost'
      )
      .sort((a, b) => new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime());
  }

  // Helper methods for related entities
  private static async getCompany(id: string): Promise<Company | null> {
    try {
      const stored = localStorage.getItem(this.COMPANIES_KEY);
      if (!stored) return null;
      const companies: Company[] = JSON.parse(stored);
      return companies.find(company => company.id === id) || null;
    } catch (error) {
      console.error('Error loading company:', error);
      return null;
    }
  }

  private static async getContact(id: string): Promise<Contact | null> {
    try {
      const stored = localStorage.getItem(this.CONTACTS_KEY);
      if (!stored) return null;
      const contacts: Contact[] = JSON.parse(stored);
      return contacts.find(contact => contact.id === id) || null;
    } catch (error) {
      console.error('Error loading contact:', error);
      return null;
    }
  }

  static async getAllCompanies(): Promise<Company[]> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.COMPANIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  }

  static async getAllContacts(): Promise<Contact[]> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.CONTACTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  }

  // Progression management
  private static async initializeProgression(opportunity: Opportunity): Promise<void> {
    const progression: DealProgression = {
      dealId: opportunity.id,
      currentStage: opportunity.stage,
      stageHistory: [{
        stage: opportunity.stage,
        enteredDate: new Date(),
        daysInStage: 0,
        advancementReason: 'Initial stage'
      }],
      gateResults: {},
      lastEvaluation: new Date(),
      nextEvaluationDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const progressions = await this.getAllProgressions();
    progressions.push(progression);
    await this.saveProgressions(progressions);
  }

  private static async updateProgressionHistory(
    opportunity: Opportunity,
    previousStage: string,
    reason = 'Stage advancement'
  ): Promise<void> {
    const progressions = await this.getAllProgressions();
    const progressionIndex = progressions.findIndex(prog => prog.dealId === opportunity.id);

    if (progressionIndex === -1) {
      await this.initializeProgression(opportunity);
      return;
    }

    const progression = progressions[progressionIndex];

    // Update previous stage exit date
    const lastHistoryEntry = progression.stageHistory[progression.stageHistory.length - 1];
    if (lastHistoryEntry && !lastHistoryEntry.exitedDate) {
      lastHistoryEntry.exitedDate = new Date();
      lastHistoryEntry.daysInStage = Math.floor(
        (new Date().getTime() - lastHistoryEntry.enteredDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Add new stage entry
    progression.stageHistory.push({
      stage: opportunity.stage,
      enteredDate: new Date(),
      daysInStage: 0,
      advancementReason: reason
    });

    progression.currentStage = opportunity.stage;
    progression.lastEvaluation = new Date();

    progressions[progressionIndex] = progression;
    await this.saveProgressions(progressions);
  }

  private static async getAllProgressions(): Promise<DealProgression[]> {
    try {
      const stored = localStorage.getItem(this.PROGRESSION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading progressions:', error);
      return [];
    }
  }

  private static async saveProgressions(progressions: DealProgression[]): Promise<void> {
    try {
      localStorage.setItem(this.PROGRESSION_KEY, JSON.stringify(progressions));
    } catch (error) {
      console.error('Error saving progressions:', error);
    }
  }

  private static async saveOpportunities(opportunities: Opportunity[]): Promise<void> {
    try {
      if (!Array.isArray(opportunities)) {
        console.error('Attempted to save non-array opportunities data:', typeof opportunities);
        throw new Error('Opportunities must be an array');
      }
      
      // Validate each opportunity has required fields
      const validOpportunities = opportunities.filter(opp => {
        if (!opp || typeof opp !== 'object' || !opp.id) {
          console.warn('Filtering out invalid opportunity:', opp);
          return false;
        }
        return true;
      });
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validOpportunities));
    } catch (error) {
      console.error('Error saving opportunities:', error);
      throw error;
    }
  }

  private static getDefaultMeddpicc(): MEDDPICC {
    return {
      metrics: '',
      economicBuyer: '',
      decisionCriteria: '',
      decisionProcess: '',
      paperProcess: '',
      implicatePain: '',
      champion: '',
      score: 0
    };
  }

  // Initialize sample data for demonstration
  static async initializeSampleData(): Promise<void> {
    // Check if data already exists without calling getAllOpportunities
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && stored !== '[]' && stored !== 'null') {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return;
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    }

    // Sample data would be imported from sample-opportunities.ts
    try {
      const { sampleOpportunities, sampleCompanies, sampleContacts, sampleUsers } = await import('../data/sample-opportunities');
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sampleOpportunities));
      localStorage.setItem(this.COMPANIES_KEY, JSON.stringify(sampleCompanies));
      localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(sampleContacts));
      localStorage.setItem('all-users', JSON.stringify(sampleUsers));

      // Initialize progression data for each opportunity
      for (const opportunity of sampleOpportunities) {
        await this.initializeProgression(opportunity);
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      // Fallback to empty array if sample data fails to load
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }
}