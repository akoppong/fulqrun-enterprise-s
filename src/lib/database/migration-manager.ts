/**
 * Database Migration Manager
 * 
 * Handles database schema migrations and data transformations
 */

import { DatabaseVersion, DatabaseVersionSchema } from './schema';

export interface Migration {
  version: number;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export interface MigrationResult {
  success: boolean;
  version: number;
  description: string;
  error?: Error;
  duration?: number;
}

export class MigrationManager {
  private static VERSIONS_KEY = 'fulqrun_db_versions';
  private migrations: Migration[] = [];

  /**
   * Register a migration
   */
  addMigration(migration: Migration): void {
    // Insert in version order
    const index = this.migrations.findIndex(m => m.version > migration.version);
    if (index === -1) {
      this.migrations.push(migration);
    } else {
      this.migrations.splice(index, 0, migration);
    }
  }

  /**
   * Get current database version
   */
  async getCurrentVersion(): Promise<number> {
    try {
      const versions = await spark.kv.get<DatabaseVersion[]>(MigrationManager.VERSIONS_KEY) || [];
      return versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get migration history
   */
  async getMigrationHistory(): Promise<DatabaseVersion[]> {
    try {
      return await spark.kv.get<DatabaseVersion[]>(MigrationManager.VERSIONS_KEY) || [];
    } catch {
      return [];
    }
  }

  /**
   * Run pending migrations
   */
  async migrate(): Promise<MigrationResult[]> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(m => m.version > currentVersion);
    
    if (pendingMigrations.length === 0) {
      return [];
    }

    console.log(`Running ${pendingMigrations.length} pending migrations...`);
    
    const results: MigrationResult[] = [];
    const versions = await this.getMigrationHistory();

    for (const migration of pendingMigrations) {
      const startTime = Date.now();
      
      try {
        console.log(`Running migration ${migration.version}: ${migration.description}`);
        
        await migration.up();
        
        // Record successful migration
        const version: DatabaseVersion = {
          version: migration.version,
          applied_at: new Date().toISOString(),
          description: migration.description
        };
        
        versions.push(version);
        await spark.kv.set(MigrationManager.VERSIONS_KEY, versions);
        
        const duration = Date.now() - startTime;
        
        results.push({
          success: true,
          version: migration.version,
          description: migration.description,
          duration
        });
        
        console.log(`✓ Migration ${migration.version} completed in ${duration}ms`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        results.push({
          success: false,
          version: migration.version,
          description: migration.description,
          error: error as Error,
          duration
        });
        
        console.error(`✗ Migration ${migration.version} failed:`, error);
        break; // Stop on first failure
      }
    }

    return results;
  }

  /**
   * Rollback to a specific version
   */
  async rollback(targetVersion: number): Promise<MigrationResult[]> {
    const currentVersion = await this.getCurrentVersion();
    
    if (targetVersion >= currentVersion) {
      throw new Error(`Target version ${targetVersion} is not lower than current version ${currentVersion}`);
    }

    const migrationsToRollback = this.migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .reverse(); // Rollback in reverse order

    console.log(`Rolling back ${migrationsToRollback.length} migrations to version ${targetVersion}...`);
    
    const results: MigrationResult[] = [];
    const versions = await this.getMigrationHistory();

    for (const migration of migrationsToRollback) {
      const startTime = Date.now();
      
      try {
        console.log(`Rolling back migration ${migration.version}: ${migration.description}`);
        
        await migration.down();
        
        // Remove from version history
        const versionIndex = versions.findIndex(v => v.version === migration.version);
        if (versionIndex !== -1) {
          versions.splice(versionIndex, 1);
          await spark.kv.set(MigrationManager.VERSIONS_KEY, versions);
        }
        
        const duration = Date.now() - startTime;
        
        results.push({
          success: true,
          version: migration.version,
          description: migration.description,
          duration
        });
        
        console.log(`✓ Migration ${migration.version} rolled back in ${duration}ms`);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        
        results.push({
          success: false,
          version: migration.version,
          description: migration.description,
          error: error as Error,
          duration
        });
        
        console.error(`✗ Rollback of migration ${migration.version} failed:`, error);
        break; // Stop on first failure
      }
    }

    return results;
  }

  /**
   * Check if database needs migration
   */
  async needsMigration(): Promise<boolean> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = this.migrations.length > 0 
      ? Math.max(...this.migrations.map(m => m.version))
      : 0;
    
    return currentVersion < latestVersion;
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    currentVersion: number;
    latestVersion: number;
    pendingMigrations: number;
    needsMigration: boolean;
  }> {
    const currentVersion = await this.getCurrentVersion();
    const latestVersion = this.migrations.length > 0 
      ? Math.max(...this.migrations.map(m => m.version))
      : 0;
    const pendingMigrations = this.migrations.filter(m => m.version > currentVersion).length;
    
    return {
      currentVersion,
      latestVersion,
      pendingMigrations,
      needsMigration: currentVersion < latestVersion
    };
  }
}

// Create global migration manager instance
export const migrationManager = new MigrationManager();

// ========================================
// BUILT-IN MIGRATIONS
// ========================================

// Migration 1: Initialize database structure
migrationManager.addMigration({
  version: 1,
  description: 'Initialize database structure and indexes',
  up: async () => {
    console.log('Initializing database structure...');
    
    // Create metadata for each table
    const tables = [
      'users', 'companies', 'contacts', 'opportunities', 
      'meddpicc', 'peak_process', 'activities', 'notes',
      'customer_segments', 'pipeline_configs', 'kpi_metrics'
    ];
    
    for (const table of tables) {
      const metaKey = `fulqrun_db_${table}_meta`;
      await spark.kv.set(metaKey, {
        table,
        created_at: new Date().toISOString(),
        version: 1,
        record_count: 0
      });
    }
  },
  down: async () => {
    console.log('Removing database structure...');
    
    const tables = [
      'users', 'companies', 'contacts', 'opportunities', 
      'meddpicc', 'peak_process', 'activities', 'notes',
      'customer_segments', 'pipeline_configs', 'kpi_metrics'
    ];
    
    for (const table of tables) {
      const metaKey = `fulqrun_db_${table}_meta`;
      await spark.kv.delete(metaKey);
    }
  }
});

// Migration 2: Create default customer segments
migrationManager.addMigration({
  version: 2,
  description: 'Create default customer segments',
  up: async () => {
    console.log('Creating default customer segments...');
    
    const defaultSegments = [
      {
        id: 'segment-strategic-partner',
        name: 'Strategic Partner',
        description: 'Large corporate clients with influential brands ($500M - $2B revenue)',
        criteria: {
          revenue_min: 500000000,
          revenue_max: 2000000000,
          industry: ['Technology', 'Finance', 'Healthcare']
        },
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'segment-reference-customer',
        name: 'Reference Customer',
        description: 'Companies with expertise to drive high volumes in specific channels',
        criteria: {
          industry: ['Manufacturing', 'Retail', 'Technology'],
          employees_min: 1000
        },
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'segment-vector-control',
        name: 'Vector Control',
        description: 'Military, Government, NGOs, Outdoor Workforce, Hospitality',
        criteria: {
          industry: ['Government', 'Defense', 'Hospitality', 'Non-Profit']
        },
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const segment of defaultSegments) {
      const key = `fulqrun_db_customer_segments:${segment.id}`;
      await spark.kv.set(key, segment);
      
      // Update indexes
      const nameIndexKey = `fulqrun_db_customer_segments_idx:name:${segment.name.toLowerCase()}`;
      await spark.kv.set(nameIndexKey, [segment.id]);
      
      const activeIndexKey = `fulqrun_db_customer_segments_idx:is_active:true`;
      const activeIds = await spark.kv.get<string[]>(activeIndexKey) || [];
      activeIds.push(segment.id);
      await spark.kv.set(activeIndexKey, activeIds);
    }
  },
  down: async () => {
    console.log('Removing default customer segments...');
    
    const segmentIds = ['segment-strategic-partner', 'segment-reference-customer', 'segment-vector-control'];
    
    for (const id of segmentIds) {
      const key = `fulqrun_db_customer_segments:${id}`;
      await spark.kv.delete(key);
    }
    
    // Clean up indexes
    const indexKeys = await spark.kv.keys();
    const segmentIndexKeys = indexKeys.filter(key => key.startsWith('fulqrun_db_customer_segments_idx:'));
    
    for (const indexKey of segmentIndexKeys) {
      await spark.kv.delete(indexKey);
    }
  }
});

// Migration 3: Create default pipeline configuration
migrationManager.addMigration({
  version: 3,
  description: 'Create default pipeline configurations',
  up: async () => {
    console.log('Creating default pipeline configurations...');
    
    const defaultPipelines = [
      {
        id: 'pipeline-enterprise-b2b',
        name: 'Enterprise B2B Sales',
        description: 'Standard enterprise sales pipeline with PEAK methodology integration',
        stages: [
          { id: 'prospect', name: 'Prospect', order: 1, probability_default: 10, color: '#ef4444' },
          { id: 'engage', name: 'Engage', order: 2, probability_default: 30, color: '#f97316' },
          { id: 'acquire', name: 'Acquire', order: 3, probability_default: 60, color: '#eab308' },
          { id: 'keep', name: 'Keep', order: 4, probability_default: 90, color: '#22c55e' }
        ],
        is_default: true,
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'pipeline-smb-transactional',
        name: 'SMB Transactional Sales',
        description: 'Simplified pipeline for smaller, transactional deals',
        stages: [
          { id: 'lead', name: 'Lead', order: 1, probability_default: 5, color: '#ef4444' },
          { id: 'qualified', name: 'Qualified', order: 2, probability_default: 25, color: '#f97316' },
          { id: 'proposal', name: 'Proposal', order: 3, probability_default: 50, color: '#eab308' },
          { id: 'negotiation', name: 'Negotiation', order: 4, probability_default: 75, color: '#22c55e' },
          { id: 'closed-won', name: 'Closed Won', order: 5, probability_default: 100, color: '#16a34a' },
          { id: 'closed-lost', name: 'Closed Lost', order: 6, probability_default: 0, color: '#dc2626' }
        ],
        is_default: false,
        is_active: true,
        created_by: 'system',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    for (const pipeline of defaultPipelines) {
      const key = `fulqrun_db_pipeline_configs:${pipeline.id}`;
      await spark.kv.set(key, pipeline);
      
      // Update indexes
      const nameIndexKey = `fulqrun_db_pipeline_configs_idx:name:${pipeline.name.toLowerCase()}`;
      await spark.kv.set(nameIndexKey, [pipeline.id]);
      
      if (pipeline.is_default) {
        const defaultIndexKey = `fulqrun_db_pipeline_configs_idx:is_default:true`;
        await spark.kv.set(defaultIndexKey, [pipeline.id]);
      }
    }
  },
  down: async () => {
    console.log('Removing default pipeline configurations...');
    
    const pipelineIds = ['pipeline-enterprise-b2b', 'pipeline-smb-transactional'];
    
    for (const id of pipelineIds) {
      const key = `fulqrun_db_pipeline_configs:${id}`;
      await spark.kv.delete(key);
    }
    
    // Clean up indexes
    const indexKeys = await spark.kv.keys();
    const pipelineIndexKeys = indexKeys.filter(key => key.startsWith('fulqrun_db_pipeline_configs_idx:'));
    
    for (const indexKey of pipelineIndexKeys) {
      await spark.kv.delete(indexKey);
    }
  }
});

/**
 * Initialize database with migrations
 */
export async function initializeDatabase(): Promise<void> {
  console.log('Initializing FulQrun database...');
  
  const status = await migrationManager.getStatus();
  console.log('Database status:', status);
  
  if (status.needsMigration) {
    console.log(`Running ${status.pendingMigrations} pending migrations...`);
    const results = await migrationManager.migrate();
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Migration completed: ${successful} successful, ${failed} failed`);
    
    if (failed > 0) {
      console.error('Some migrations failed. Database may be in an inconsistent state.');
      throw new Error('Database migration failed');
    }
  } else {
    console.log('Database is up to date');
  }
}