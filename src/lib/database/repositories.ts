/**
 * Repository Implementations
 * 
 * Concrete repository classes for each entity in the database
 */

import { BaseRepository } from './base-repository';
import { 
  User, UserSchema, 
  Company, CompanySchema,
  Contact, ContactSchema,
  Opportunity, OpportunitySchema,
  MEDDPICC, MEDDPICCSchema,
  PEAKProcess, PEAKProcessSchema,
  Activity, ActivitySchema,
  Note, NoteSchema,
  CustomerSegment, CustomerSegmentSchema,
  PipelineConfig, PipelineConfigSchema,
  KPIMetric, KPIMetricSchema
} from './schema';

// ========================================
// USER REPOSITORY
// ========================================

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users' as const;
  protected schema = UserSchema;

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findBy('email', email);
    return users[0] || null;
  }

  async findByRole(role: string): Promise<User[]> {
    return this.findBy('role', role);
  }

  async findActive(): Promise<User[]> {
    return this.findBy('is_active', true);
  }

  async updateLastLogin(id: string): Promise<User | null> {
    return this.update(id, {
      last_login_at: new Date().toISOString()
    });
  }
}

// ========================================
// COMPANY REPOSITORY
// ========================================

export class CompanyRepository extends BaseRepository<Company> {
  protected tableName = 'companies' as const;
  protected schema = CompanySchema;

  async findByName(name: string): Promise<Company | null> {
    const companies = await this.findBy('name', name);
    return companies[0] || null;
  }

  async findByIndustry(industry: string): Promise<Company[]> {
    return this.findBy('industry', industry);
  }

  async findByRegion(region: string): Promise<Company[]> {
    return this.findBy('region', region);
  }

  async findBySegment(segmentId: string): Promise<Company[]> {
    return this.findBy('segment_id', segmentId);
  }

  async searchByName(query: string): Promise<Company[]> {
    const allCompanies = await this.findAll();
    return allCompanies.data.filter(company => 
      company.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async getCompanyStats(): Promise<{
    total: number;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
    bySize: Record<string, number>;
  }> {
    const { data: companies } = await this.findAll();
    
    const stats = {
      total: companies.length,
      byIndustry: {} as Record<string, number>,
      byRegion: {} as Record<string, number>,
      bySize: {} as Record<string, number>
    };

    companies.forEach(company => {
      // Count by industry
      stats.byIndustry[company.industry] = (stats.byIndustry[company.industry] || 0) + 1;
      
      // Count by region
      stats.byRegion[company.region] = (stats.byRegion[company.region] || 0) + 1;
      
      // Count by size
      stats.bySize[company.size] = (stats.bySize[company.size] || 0) + 1;
    });

    return stats;
  }
}

// ========================================
// CONTACT REPOSITORY
// ========================================

export class ContactRepository extends BaseRepository<Contact> {
  protected tableName = 'contacts' as const;
  protected schema = ContactSchema;

  async findByCompany(companyId: string): Promise<Contact[]> {
    return this.findBy('company_id', companyId);
  }

  async findByEmail(email: string): Promise<Contact | null> {
    const contacts = await this.findBy('email', email);
    return contacts[0] || null;
  }

  async findPrimaryContacts(): Promise<Contact[]> {
    return this.findBy('is_primary', true);
  }

  async findPrimaryByCompany(companyId: string): Promise<Contact | null> {
    const allContacts = await this.findByCompany(companyId);
    return allContacts.find(contact => contact.is_primary) || null;
  }

  async setPrimaryContact(companyId: string, contactId: string): Promise<void> {
    // First, remove primary status from all contacts in the company
    const allContacts = await this.findByCompany(companyId);
    
    for (const contact of allContacts) {
      if (contact.is_primary) {
        await this.update(contact.id, { is_primary: false });
      }
    }

    // Set the new primary contact
    await this.update(contactId, { is_primary: true });
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const { data: contacts } = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return contacts.filter(contact => 
      contact.first_name.toLowerCase().includes(lowerQuery) ||
      contact.last_name.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery) ||
      (contact.job_title && contact.job_title.toLowerCase().includes(lowerQuery))
    );
  }
}

// ========================================
// OPPORTUNITY REPOSITORY
// ========================================

export class OpportunityRepository extends BaseRepository<Opportunity> {
  protected tableName = 'opportunities' as const;
  protected schema = OpportunitySchema;

  async findByCompany(companyId: string): Promise<Opportunity[]> {
    return this.findBy('company_id', companyId);
  }

  async findByStage(stage: string): Promise<Opportunity[]> {
    return this.findBy('stage', stage);
  }

  async findByAssignedUser(userId: string): Promise<Opportunity[]> {
    return this.findBy('assigned_to', userId);
  }

  async findActive(): Promise<Opportunity[]> {
    return this.findBy('is_active', true);
  }

  async findByPriority(priority: string): Promise<Opportunity[]> {
    return this.findBy('priority', priority);
  }

  async findClosingSoon(days: number = 30): Promise<Opportunity[]> {
    const { data: opportunities } = await this.findActive();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return opportunities.filter(opp => {
      const closeDate = new Date(opp.expected_close_date);
      return closeDate <= cutoffDate && !['closed-won', 'closed-lost'].includes(opp.stage);
    });
  }

  async findStale(days: number = 30): Promise<Opportunity[]> {
    const { data: opportunities } = await this.findActive();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return opportunities.filter(opp => {
      const updatedDate = new Date(opp.updated_at);
      return updatedDate < cutoffDate && !['closed-won', 'closed-lost'].includes(opp.stage);
    });
  }

  async getOpportunityStats(): Promise<{
    total: number;
    active: number;
    totalValue: number;
    averageValue: number;
    byStage: Record<string, { count: number; value: number }>;
    byPriority: Record<string, number>;
    byUser: Record<string, { count: number; value: number }>;
  }> {
    const { data: opportunities } = await this.findAll();
    
    const stats = {
      total: opportunities.length,
      active: opportunities.filter(opp => opp.is_active).length,
      totalValue: 0,
      averageValue: 0,
      byStage: {} as Record<string, { count: number; value: number }>,
      byPriority: {} as Record<string, number>,
      byUser: {} as Record<string, { count: number; value: number }>
    };

    let totalValue = 0;

    opportunities.forEach(opp => {
      totalValue += opp.value;
      
      // Count by stage
      if (!stats.byStage[opp.stage]) {
        stats.byStage[opp.stage] = { count: 0, value: 0 };
      }
      stats.byStage[opp.stage].count++;
      stats.byStage[opp.stage].value += opp.value;
      
      // Count by priority
      stats.byPriority[opp.priority] = (stats.byPriority[opp.priority] || 0) + 1;
      
      // Count by user
      if (!stats.byUser[opp.assigned_to]) {
        stats.byUser[opp.assigned_to] = { count: 0, value: 0 };
      }
      stats.byUser[opp.assigned_to].count++;
      stats.byUser[opp.assigned_to].value += opp.value;
    });

    stats.totalValue = totalValue;
    stats.averageValue = opportunities.length > 0 ? totalValue / opportunities.length : 0;

    return stats;
  }

  /**
   * Get opportunities with populated relationships
   */
  async findWithRelations(id?: string): Promise<Array<Opportunity & { 
    company?: Company; 
    primaryContact?: Contact; 
    meddpicc?: MEDDPICC;
    peakProcess?: PEAKProcess;
  }>> {
    const opportunities = id ? [await this.findById(id)].filter(Boolean) as Opportunity[] : (await this.findAll()).data;
    
    // Get repositories for related data
    const companyRepo = new CompanyRepository();
    const contactRepo = new ContactRepository();
    const meddpiccRepo = new MEDDPICCRepository();
    const peakRepo = new PEAKProcessRepository();
    
    const enrichedOpportunities = [];
    
    for (const opp of opportunities) {
      const enriched = { ...opp } as any;
      
      // Load company
      if (opp.company_id) {
        enriched.company = await companyRepo.findById(opp.company_id);
      }
      
      // Load primary contact
      if (opp.primary_contact_id) {
        enriched.primaryContact = await contactRepo.findById(opp.primary_contact_id);
      }
      
      // Load MEDDPICC data
      const meddpiccData = await meddpiccRepo.findByOpportunity(opp.id);
      if (meddpiccData[0]) {
        enriched.meddpicc = meddpiccData[0];
      }
      
      // Load PEAK process data
      const peakData = await peakRepo.findByOpportunity(opp.id);
      if (peakData[0]) {
        enriched.peakProcess = peakData[0];
      }
      
      enrichedOpportunities.push(enriched);
    }
    
    return enrichedOpportunities;
  }
}

// ========================================
// MEDDPICC REPOSITORY
// ========================================

export class MEDDPICCRepository extends BaseRepository<MEDDPICC> {
  protected tableName = 'meddpicc' as const;
  protected schema = MEDDPICCSchema;

  async findByOpportunity(opportunityId: string): Promise<MEDDPICC[]> {
    return this.findBy('opportunity_id', opportunityId);
  }

  async findByConfidenceLevel(level: string): Promise<MEDDPICC[]> {
    return this.findBy('confidence_level', level);
  }

  async updateScores(opportunityId: string, scores: Partial<MEDDPICC>, updatedBy: string): Promise<MEDDPICC | null> {
    const existing = await this.findByOpportunity(opportunityId);
    
    if (existing[0]) {
      // Calculate total score
      const updatedScores = { ...existing[0], ...scores };
      const totalScore = (updatedScores.metrics || 0) + 
                        (updatedScores.economic_buyer || 0) +
                        (updatedScores.decision_criteria || 0) +
                        (updatedScores.decision_process || 0) +
                        (updatedScores.paper_process || 0) +
                        (updatedScores.identify_pain || 0) +
                        (updatedScores.champion || 0) +
                        (updatedScores.competition || 0);
      
      return this.update(existing[0].id, {
        ...scores,
        total_score: totalScore,
        last_updated_by: updatedBy
      });
    } else {
      // Create new MEDDPICC record
      const totalScore = (scores.metrics || 0) + 
                        (scores.economic_buyer || 0) +
                        (scores.decision_criteria || 0) +
                        (scores.decision_process || 0) +
                        (scores.paper_process || 0) +
                        (scores.identify_pain || 0) +
                        (scores.champion || 0) +
                        (scores.competition || 0);
      
      return this.create({
        opportunity_id: opportunityId,
        metrics: 0,
        economic_buyer: 0,
        decision_criteria: 0,
        decision_process: 0,
        paper_process: 0,
        identify_pain: 0,
        champion: 0,
        competition: 0,
        ...scores,
        total_score: totalScore,
        confidence_level: 'medium',
        last_updated_by: updatedBy
      });
    }
  }
}

// ========================================
// PEAK PROCESS REPOSITORY
// ========================================

export class PEAKProcessRepository extends BaseRepository<PEAKProcess> {
  protected tableName = 'peak_process' as const;
  protected schema = PEAKProcessSchema;

  async findByOpportunity(opportunityId: string): Promise<PEAKProcess[]> {
    return this.findBy('opportunity_id', opportunityId);
  }

  async findByStage(stage: string): Promise<PEAKProcess[]> {
    return this.findBy('current_stage', stage);
  }

  async updateStage(opportunityId: string, stage: string, updatedBy: string): Promise<PEAKProcess | null> {
    const existing = await this.findByOpportunity(opportunityId);
    
    if (existing[0]) {
      return this.update(existing[0].id, {
        current_stage: stage as any,
        stage_entry_date: new Date().toISOString(),
        days_in_stage: 0,
        last_updated_by: updatedBy
      });
    } else {
      return this.create({
        opportunity_id: opportunityId,
        prospect_score: stage === 'prospect' ? 10 : 0,
        engage_score: stage === 'engage' ? 10 : 0,
        acquire_score: stage === 'acquire' ? 10 : 0,
        keep_score: stage === 'keep' ? 10 : 0,
        current_stage: stage as any,
        stage_entry_date: new Date().toISOString(),
        days_in_stage: 0,
        total_days_in_pipeline: 0,
        last_updated_by: updatedBy
      });
    }
  }
}

// ========================================
// ACTIVITY REPOSITORY
// ========================================

export class ActivityRepository extends BaseRepository<Activity> {
  protected tableName = 'activities' as const;
  protected schema = ActivitySchema;

  async findByOpportunity(opportunityId: string): Promise<Activity[]> {
    return this.findBy('opportunity_id', opportunityId);
  }

  async findByContact(contactId: string): Promise<Activity[]> {
    return this.findBy('contact_id', contactId);
  }

  async findByType(type: string): Promise<Activity[]> {
    return this.findBy('type', type);
  }

  async findByStatus(status: string): Promise<Activity[]> {
    return this.findBy('status', status);
  }

  async findUpcoming(days: number = 7): Promise<Activity[]> {
    const { data: activities } = await this.findAll();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return activities.filter(activity => {
      if (!activity.scheduled_date) return false;
      const scheduledDate = new Date(activity.scheduled_date);
      return scheduledDate >= new Date() && scheduledDate <= futureDate;
    });
  }

  async completeActivity(id: string, outcome: string, notes?: string): Promise<Activity | null> {
    return this.update(id, {
      status: 'completed',
      completed_date: new Date().toISOString(),
      outcome: outcome as any,
      description: notes ? `${notes}` : undefined
    });
  }
}

// ========================================
// NOTE REPOSITORY
// ========================================

export class NoteRepository extends BaseRepository<Note> {
  protected tableName = 'notes' as const;
  protected schema = NoteSchema;

  async findByOpportunity(opportunityId: string): Promise<Note[]> {
    return this.findBy('opportunity_id', opportunityId);
  }

  async findByActivity(activityId: string): Promise<Note[]> {
    return this.findBy('activity_id', activityId);
  }

  async findByType(type: string): Promise<Note[]> {
    return this.findBy('type', type);
  }

  async findPublicNotes(): Promise<Note[]> {
    const { data: notes } = await this.findAll();
    return notes.filter(note => !note.is_private);
  }
}

// ========================================
// CUSTOMER SEGMENT REPOSITORY
// ========================================

export class CustomerSegmentRepository extends BaseRepository<CustomerSegment> {
  protected tableName = 'customer_segments' as const;
  protected schema = CustomerSegmentSchema;

  async findActive(): Promise<CustomerSegment[]> {
    return this.findBy('is_active', true);
  }

  async findByName(name: string): Promise<CustomerSegment | null> {
    const segments = await this.findBy('name', name);
    return segments[0] || null;
  }
}

// ========================================
// PIPELINE CONFIG REPOSITORY
// ========================================

export class PipelineConfigRepository extends BaseRepository<PipelineConfig> {
  protected tableName = 'pipeline_configs' as const;
  protected schema = PipelineConfigSchema;

  async findActive(): Promise<PipelineConfig[]> {
    return this.findBy('is_active', true);
  }

  async findDefault(): Promise<PipelineConfig | null> {
    const configs = await this.findBy('is_default', true);
    return configs[0] || null;
  }

  async setDefault(id: string): Promise<void> {
    // Remove default status from all configs
    const allConfigs = await this.findAll();
    
    for (const config of allConfigs.data) {
      if (config.is_default) {
        await this.update(config.id, { is_default: false });
      }
    }

    // Set new default
    await this.update(id, { is_default: true });
  }
}

// ========================================
// KPI METRIC REPOSITORY
// ========================================

export class KPIMetricRepository extends BaseRepository<KPIMetric> {
  protected tableName = 'kpi_metrics' as const;
  protected schema = KPIMetricSchema;

  async findByCategory(category: string): Promise<KPIMetric[]> {
    return this.findBy('category', category);
  }

  async findByPeriod(period: string): Promise<KPIMetric[]> {
    return this.findBy('period', period);
  }

  async findByUser(userId: string): Promise<KPIMetric[]> {
    return this.findBy('user_id', userId);
  }

  async getLatestMetrics(category?: string): Promise<KPIMetric[]> {
    const { data: metrics } = await this.findAll();
    
    let filteredMetrics = metrics;
    if (category) {
      filteredMetrics = metrics.filter(m => m.category === category);
    }
    
    // Group by name and get latest for each
    const latestByName = new Map<string, KPIMetric>();
    
    filteredMetrics.forEach(metric => {
      const existing = latestByName.get(metric.name);
      if (!existing || new Date(metric.created_at) > new Date(existing.created_at)) {
        latestByName.set(metric.name, metric);
      }
    });
    
    return Array.from(latestByName.values());
  }
}