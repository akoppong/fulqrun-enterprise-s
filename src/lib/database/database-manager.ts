/**
 * Database Manager
 * 
 * Main interface for database operations with transaction support
 */

import { 
  UserRepository, 
  CompanyRepository, 
  ContactRepository,
  OpportunityRepository,
  MEDDPICCRepository,
  PEAKProcessRepository,
  ActivityRepository,
  NoteRepository,
  CustomerSegmentRepository,
  PipelineConfigRepository,
  KPIMetricRepository
} from './repositories';

import { withTransaction, getCurrentTransaction } from './transaction-manager';
import { initializeDatabase, migrationManager } from './migration-manager';

/**
 * Main database manager providing access to all repositories
 * and transaction management
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  
  // Repository instances
  public readonly users: UserRepository;
  public readonly companies: CompanyRepository;
  public readonly contacts: ContactRepository;
  public readonly opportunities: OpportunityRepository;
  public readonly meddpicc: MEDDPICCRepository;
  public readonly peakProcess: PEAKProcessRepository;
  public readonly activities: ActivityRepository;
  public readonly notes: NoteRepository;
  public readonly customerSegments: CustomerSegmentRepository;
  public readonly pipelineConfigs: PipelineConfigRepository;
  public readonly kpiMetrics: KPIMetricRepository;

  private constructor() {
    this.users = new UserRepository();
    this.companies = new CompanyRepository();
    this.contacts = new ContactRepository();
    this.opportunities = new OpportunityRepository();
    this.meddpicc = new MEDDPICCRepository();
    this.peakProcess = new PEAKProcessRepository();
    this.activities = new ActivityRepository();
    this.notes = new NoteRepository();
    this.customerSegments = new CustomerSegmentRepository();
    this.pipelineConfigs = new PipelineConfigRepository();
    this.kpiMetrics = new KPIMetricRepository();
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database with migrations and sample data
   */
  async initialize(): Promise<void> {
    console.log('Initializing FulQrun database...');
    
    try {
      // Run database migrations
      await initializeDatabase();
      
      // Create sample data if needed
      await this.createSampleDataIfNeeded();
      
      console.log('✅ Database initialization completed successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create sample data if tables are empty
   */
  private async createSampleDataIfNeeded(): Promise<void> {
    try {
      // Check if we already have data
      const userCount = await this.users.count();
      if (userCount > 0) {
        console.log('Database already contains data, skipping sample data creation');
        return;
      }

      console.log('Creating sample data...');

      await withTransaction(async () => {
        // Create sample users
        const adminUser = await this.users.create({
          email: 'admin@fulqrun.com',
          name: 'System Administrator',
          role: 'admin',
          is_active: true
        });

        const salesManager = await this.users.create({
          email: 'manager@fulqrun.com',
          name: 'Sales Manager',
          role: 'manager',
          is_active: true
        });

        const salesRep = await this.users.create({
          email: 'rep@fulqrun.com',
          name: 'Sales Representative',
          role: 'sales_rep',
          is_active: true
        });

        // Create sample customer segments (if not created by migration)
        const strategicSegment = await this.customerSegments.findByName('Strategic Partner');
        let segmentId = strategicSegment?.id;
        
        if (!strategicSegment) {
          const newSegment = await this.customerSegments.create({
            name: 'Strategic Partner',
            description: 'Large corporate clients with influential brands',
            is_active: true,
            created_by: adminUser.id
          });
          segmentId = newSegment.id;
        }

        // Create sample companies
        const company1 = await this.companies.create({
          name: 'TechCorp Solutions',
          industry: 'Technology',
          size: 'Large',
          website: 'https://techcorp.com',
          address: '123 Tech Street, San Francisco, CA 94105',
          revenue: 50000000,
          employees: 500,
          region: 'North America',
          country: 'United States',
          segment_id: segmentId,
          created_by: adminUser.id
        });

        const company2 = await this.companies.create({
          name: 'GrowthCo Inc',
          industry: 'Marketing',
          size: 'Medium',
          website: 'https://growthco.com',
          address: '456 Growth Ave, Austin, TX 78701',
          revenue: 15000000,
          employees: 150,
          region: 'North America',
          country: 'United States',
          segment_id: segmentId,
          created_by: adminUser.id
        });

        // Create sample contacts
        const contact1 = await this.contacts.create({
          company_id: company1.id,
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@techcorp.com',
          phone: '+1 (555) 123-4567',
          job_title: 'CTO',
          department: 'Technology',
          region: 'North America',
          country: 'United States',
          is_primary: true,
          created_by: salesRep.id
        });

        const contact2 = await this.contacts.create({
          company_id: company2.id,
          first_name: 'Mike',
          last_name: 'Davis',
          email: 'mike.davis@growthco.com',
          phone: '+1 (555) 987-6543',
          job_title: 'Marketing Director',
          department: 'Marketing',
          region: 'North America',
          country: 'United States',
          is_primary: true,
          created_by: salesRep.id
        });

        // Create sample opportunities
        const opportunity1 = await this.opportunities.create({
          title: 'Enterprise Software License',
          company_id: company1.id,
          primary_contact_id: contact1.id,
          assigned_to: salesRep.id,
          value: 250000,
          currency: 'USD',
          stage: 'engage',
          probability: 75,
          expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'referral',
          description: 'Large enterprise looking to upgrade their software infrastructure',
          tags: ['enterprise', 'high-value', 'referral'],
          priority: 'high',
          created_by: salesRep.id
        });

        const opportunity2 = await this.opportunities.create({
          title: 'Marketing Automation Platform',
          company_id: company2.id,
          primary_contact_id: contact2.id,
          assigned_to: salesRep.id,
          value: 75000,
          currency: 'USD',
          stage: 'prospect',
          probability: 45,
          expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'website',
          description: 'Mid-size company looking to automate their marketing processes',
          tags: ['marketing', 'automation', 'mid-market'],
          priority: 'medium',
          created_by: salesRep.id
        });

        // Create MEDDPICC data for opportunities
        await this.meddpicc.create({
          opportunity_id: opportunity1.id,
          metrics: 8,
          economic_buyer: 7,
          decision_criteria: 7,
          decision_process: 6,
          paper_process: 5,
          identify_pain: 8,
          champion: 9,
          competition: 6,
          total_score: 56,
          confidence_level: 'high',
          notes: 'Strong opportunity with good champion support',
          last_updated_by: salesRep.id
        });

        await this.meddpicc.create({
          opportunity_id: opportunity2.id,
          metrics: 6,
          economic_buyer: 4,
          decision_criteria: 5,
          decision_process: 3,
          paper_process: 2,
          identify_pain: 7,
          champion: 6,
          competition: 4,
          total_score: 37,
          confidence_level: 'medium',
          notes: 'Early stage opportunity, need to identify economic buyer',
          last_updated_by: salesRep.id
        });

        // Create PEAK process data
        await this.peakProcess.create({
          opportunity_id: opportunity1.id,
          prospect_score: 85,
          engage_score: 70,
          acquire_score: 60,
          keep_score: 40,
          current_stage: 'engage',
          stage_entry_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          days_in_stage: 12,
          total_days_in_pipeline: 45,
          last_updated_by: salesRep.id
        });

        await this.peakProcess.create({
          opportunity_id: opportunity2.id,
          prospect_score: 75,
          engage_score: 30,
          acquire_score: 20,
          keep_score: 10,
          current_stage: 'prospect',
          stage_entry_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          days_in_stage: 8,
          total_days_in_pipeline: 8,
          last_updated_by: salesRep.id
        });

        // Create sample activities
        await this.activities.create({
          opportunity_id: opportunity1.id,
          contact_id: contact1.id,
          type: 'meeting',
          subject: 'Product Demo Session',
          description: 'Comprehensive demo of enterprise features',
          outcome: 'positive',
          status: 'completed',
          scheduled_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          created_by: salesRep.id
        });

        await this.activities.create({
          opportunity_id: opportunity1.id,
          contact_id: contact1.id,
          type: 'call',
          subject: 'Follow-up on Pricing',
          description: 'Discuss pricing options and next steps',
          status: 'planned',
          scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 30,
          created_by: salesRep.id
        });

        // Create sample notes
        await this.notes.create({
          opportunity_id: opportunity1.id,
          content: 'Client is very interested in the advanced analytics features. Need to prepare ROI calculation.',
          type: 'general',
          is_private: false,
          created_by: salesRep.id
        });

        // Create sample KPI metrics
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        await this.kpiMetrics.create({
          name: 'Monthly Revenue',
          category: 'Sales',
          value: 450000,
          target: 500000,
          unit: 'USD',
          trend: 'up',
          period: currentMonth,
          user_id: salesRep.id
        });

        await this.kpiMetrics.create({
          name: 'Opportunities Created',
          category: 'Pipeline',
          value: 25,
          target: 30,
          unit: 'count',
          trend: 'up',
          period: currentMonth,
          user_id: salesRep.id
        });

        await this.kpiMetrics.create({
          name: 'Win Rate',
          category: 'Performance',
          value: 68,
          target: 70,
          unit: 'percent',
          trend: 'stable',
          period: currentMonth,
          user_id: salesRep.id
        });

        console.log('✅ Sample data created successfully');
      });

    } catch (error) {
      console.error('❌ Failed to create sample data:', error);
      throw error;
    }
  }

  /**
   * Execute operations within a transaction
   */
  async withTransaction<T>(operations: () => Promise<T>): Promise<T> {
    return withTransaction(operations);
  }

  /**
   * Get database health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    tables: Record<string, { count: number; lastUpdated?: string }>;
    migrations: { current: number; latest: number; pending: number };
    errors: string[];
  }> {
    const errors: string[] = [];
    const tables: Record<string, { count: number; lastUpdated?: string }> = {};
    
    try {
      // Check each table
      const tableChecks = [
        { name: 'users', repo: this.users },
        { name: 'companies', repo: this.companies },
        { name: 'contacts', repo: this.contacts },
        { name: 'opportunities', repo: this.opportunities },
        { name: 'meddpicc', repo: this.meddpicc },
        { name: 'peak_process', repo: this.peakProcess },
        { name: 'activities', repo: this.activities },
        { name: 'notes', repo: this.notes },
        { name: 'customer_segments', repo: this.customerSegments },
        { name: 'pipeline_configs', repo: this.pipelineConfigs },
        { name: 'kpi_metrics', repo: this.kpiMetrics }
      ];

      for (const { name, repo } of tableChecks) {
        try {
          const count = await repo.count();
          const { data } = await repo.findAll({ limit: 1, orderBy: 'updated_at', orderDirection: 'desc' });
          
          tables[name] = {
            count,
            lastUpdated: data[0]?.updated_at
          };
        } catch (error) {
          errors.push(`Failed to check table ${name}: ${(error as Error).message}`);
        }
      }

      // Check migration status
      const migrationStatus = await migrationManager.getStatus();

      // Determine overall health
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      
      if (errors.length > 0) {
        status = 'critical';
      } else if (migrationStatus.needsMigration) {
        status = 'warning';
      }

      return {
        status,
        tables,
        migrations: migrationStatus,
        errors
      };

    } catch (error) {
      return {
        status: 'critical',
        tables: {},
        migrations: { current: 0, latest: 0, pending: 0, needsMigration: false },
        errors: [`Database health check failed: ${(error as Error).message}`]
      };
    }
  }

  /**
   * Backup database to a JSON export
   */
  async exportData(): Promise<{
    version: string;
    timestamp: string;
    data: Record<string, any[]>;
  }> {
    const data: Record<string, any[]> = {};

    // Export all tables
    data.users = (await this.users.findAll()).data;
    data.companies = (await this.companies.findAll()).data;
    data.contacts = (await this.contacts.findAll()).data;
    data.opportunities = (await this.opportunities.findAll()).data;
    data.meddpicc = (await this.meddpicc.findAll()).data;
    data.peak_process = (await this.peakProcess.findAll()).data;
    data.activities = (await this.activities.findAll()).data;
    data.notes = (await this.notes.findAll()).data;
    data.customer_segments = (await this.customerSegments.findAll()).data;
    data.pipeline_configs = (await this.pipelineConfigs.findAll()).data;
    data.kpi_metrics = (await this.kpiMetrics.findAll()).data;

    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data
    };
  }

  /**
   * Import data from a JSON backup
   */
  async importData(backup: {
    version: string;
    timestamp: string;
    data: Record<string, any[]>;
  }): Promise<{ success: boolean; imported: Record<string, number>; errors: string[] }> {
    const imported: Record<string, number> = {};
    const errors: string[] = [];

    try {
      await withTransaction(async () => {
        // Import in dependency order
        const importOrder = [
          'users', 'customer_segments', 'companies', 'contacts', 
          'opportunities', 'meddpicc', 'peak_process', 'activities', 
          'notes', 'pipeline_configs', 'kpi_metrics'
        ];

        for (const tableName of importOrder) {
          if (backup.data[tableName]) {
            let count = 0;
            
            for (const record of backup.data[tableName]) {
              try {
                // Remove computed fields that shouldn't be imported
                const { created_at, updated_at, ...importData } = record;
                
                switch (tableName) {
                  case 'users':
                    await this.users.create(importData);
                    break;
                  case 'companies':
                    await this.companies.create(importData);
                    break;
                  case 'contacts':
                    await this.contacts.create(importData);
                    break;
                  case 'opportunities':
                    await this.opportunities.create(importData);
                    break;
                  case 'meddpicc':
                    await this.meddpicc.create(importData);
                    break;
                  case 'peak_process':
                    await this.peakProcess.create(importData);
                    break;
                  case 'activities':
                    await this.activities.create(importData);
                    break;
                  case 'notes':
                    await this.notes.create(importData);
                    break;
                  case 'customer_segments':
                    await this.customerSegments.create(importData);
                    break;
                  case 'pipeline_configs':
                    await this.pipelineConfigs.create(importData);
                    break;
                  case 'kpi_metrics':
                    await this.kpiMetrics.create(importData);
                    break;
                }
                
                count++;
              } catch (error) {
                errors.push(`Failed to import ${tableName} record: ${(error as Error).message}`);
              }
            }
            
            imported[tableName] = count;
          }
        }
      });

      return {
        success: errors.length === 0,
        imported,
        errors
      };

    } catch (error) {
      return {
        success: false,
        imported,
        errors: [`Import failed: ${(error as Error).message}`]
      };
    }
  }
}

// Create and export singleton instance
export const db = DatabaseManager.getInstance();

// Auto-initialize database on first access
let initialized = false;

export async function ensureDatabaseInitialized(): Promise<void> {
  if (!initialized) {
    await db.initialize();
    initialized = true;
  }
}