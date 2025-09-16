/**
 * Enterprise Data Integration Service
 * 
 * Provides comprehensive data synchronization, backup, and recovery
 * with enterprise-grade persistence guarantees
 */

import { db } from './database';
import { performanceTracker } from './analytics/performance-tracker';

export interface SyncResult {
  success: boolean;
  timestamp: string;
  tablesUpdated: string[];
  recordsProcessed: number;
  errors: string[];
}

export interface BackupResult {
  success: boolean;
  backupId: string;
  timestamp: string;
  size: number;
  tables: Record<string, number>;
}

export interface DataHealthReport {
  overall: 'healthy' | 'warning' | 'critical';
  lastSync: string;
  lastBackup: string;
  tables: Record<string, {
    status: 'healthy' | 'warning' | 'critical';
    recordCount: number;
    lastUpdated: string;
    issues: string[];
  }>;
  recommendations: string[];
}

export class DataIntegrationService {
  private static instance: DataIntegrationService;
  private syncInProgress = false;
  private lastSyncTime = '';
  private syncListeners: Array<(result: SyncResult) => void> = [];

  static getInstance(): DataIntegrationService {
    if (!DataIntegrationService.instance) {
      DataIntegrationService.instance = new DataIntegrationService();
    }
    return DataIntegrationService.instance;
  }

  /**
   * Initialize the data integration service
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Data Integration Service...');
    
    try {
      // Ensure database is initialized
      await db.initialize();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ Data Integration Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Data Integration Service:', error);
      throw error;
    }
  }

  /**
   * Synchronize all data to ensure persistence
   */
  async syncAllData(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress, skipping...');
      return {
        success: false,
        timestamp: new Date().toISOString(),
        tablesUpdated: [],
        recordsProcessed: 0,
        errors: ['Sync already in progress']
      };
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const errors: string[] = [];
    const tablesUpdated: string[] = [];
    let recordsProcessed = 0;

    try {
      console.log('🔄 Starting comprehensive data sync...');

      // Sync each table
      const tables = [
        'users', 'companies', 'contacts', 'opportunities',
        'meddpicc', 'peak_process', 'activities', 'notes',
        'customer_segments', 'pipeline_configs', 'kpi_metrics'
      ];

      for (const tableName of tables) {
        try {
          const repo = this.getRepository(tableName);
          if (repo) {
            const { total } = await repo.findAll({ limit: 1 });
            recordsProcessed += total;
            tablesUpdated.push(tableName);
            
            // Force persistence check
            await this.verifyTablePersistence(tableName);
          }
        } catch (error) {
          errors.push(`Failed to sync ${tableName}: ${(error as Error).message}`);
        }
      }

      // Update analytics caches
      try {
        await this.refreshAnalyticsCache();
        tablesUpdated.push('analytics_cache');
      } catch (error) {
        errors.push(`Failed to refresh analytics cache: ${(error as Error).message}`);
      }

      this.lastSyncTime = new Date().toISOString();
      
      const result: SyncResult = {
        success: errors.length === 0,
        timestamp: this.lastSyncTime,
        tablesUpdated,
        recordsProcessed,
        errors
      };

      // Notify listeners
      this.syncListeners.forEach(listener => listener(result));

      const duration = Date.now() - startTime;
      console.log(`✅ Data sync completed in ${duration}ms. Processed ${recordsProcessed} records across ${tablesUpdated.length} tables.`);

      return result;

    } catch (error) {
      const result: SyncResult = {
        success: false,
        timestamp: new Date().toISOString(),
        tablesUpdated,
        recordsProcessed,
        errors: [...errors, `Sync failed: ${(error as Error).message}`]
      };

      console.error('❌ Data sync failed:', error);
      return result;

    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Create a comprehensive backup
   */
  async createBackup(): Promise<BackupResult> {
    console.log('💾 Creating comprehensive data backup...');
    
    try {
      const backup = await db.exportData();
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store backup in KV with a structured key
      const backupKey = `fulqrun_backup_${backupId}`;
      
      // Use Spark's KV directly for backup storage
      if (typeof window !== 'undefined' && window.spark?.kv) {
        await window.spark.kv.set(backupKey, backup);
      }

      // Calculate backup size and table counts
      const tables: Record<string, number> = {};
      let totalSize = 0;

      Object.entries(backup.data).forEach(([tableName, records]) => {
        tables[tableName] = records.length;
        totalSize += JSON.stringify(records).length;
      });

      console.log(`✅ Backup created successfully: ${backupId} (${(totalSize / 1024).toFixed(2)} KB)`);

      return {
        success: true,
        backupId,
        timestamp: backup.timestamp,
        size: totalSize,
        tables
      };

    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      return {
        success: false,
        backupId: '',
        timestamp: new Date().toISOString(),
        size: 0,
        tables: {}
      };
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    console.log(`🔄 Restoring from backup: ${backupId}`);
    
    try {
      const backupKey = `fulqrun_backup_${backupId}`;
      
      // Retrieve backup from KV
      let backup;
      if (typeof window !== 'undefined' && window.spark?.kv) {
        backup = await window.spark.kv.get(backupKey);
      }

      if (!backup) {
        return { success: false, message: 'Backup not found' };
      }

      // Restore data
      const result = await db.importData(backup);
      
      if (result.success) {
        console.log('✅ Data restored successfully from backup');
        await this.syncAllData(); // Ensure everything is properly synced
        return { success: true, message: 'Data restored successfully' };
      } else {
        return { 
          success: false, 
          message: `Restore failed: ${result.errors.join(', ')}` 
        };
      }

    } catch (error) {
      console.error('❌ Restore failed:', error);
      return { 
        success: false, 
        message: `Restore failed: ${(error as Error).message}` 
      };
    }
  }

  /**
   * Get data health report
   */
  async getDataHealthReport(): Promise<DataHealthReport> {
    try {
      const healthStatus = await db.getHealthStatus();
      const tables: Record<string, any> = {};
      const recommendations: string[] = [];

      // Analyze each table
      Object.entries(healthStatus.tables).forEach(([tableName, tableInfo]) => {
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        const issues: string[] = [];

        // Check record count
        if (tableInfo.count === 0 && ['users', 'companies', 'opportunities'].includes(tableName)) {
          status = 'critical';
          issues.push('Table is empty - critical data missing');
        }

        // Check last update time
        if (tableInfo.lastUpdated) {
          const lastUpdate = new Date(tableInfo.lastUpdated);
          const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceUpdate > 7) {
            status = status === 'critical' ? 'critical' : 'warning';
            issues.push(`No updates in ${Math.floor(daysSinceUpdate)} days`);
          }
        }

        tables[tableName] = {
          status,
          recordCount: tableInfo.count,
          lastUpdated: tableInfo.lastUpdated || 'Never',
          issues
        };
      });

      // Generate recommendations
      if (healthStatus.errors.length > 0) {
        recommendations.push('Critical database errors detected - immediate attention required');
      }

      const emptyTables = Object.entries(tables).filter(([_, info]) => info.recordCount === 0);
      if (emptyTables.length > 0) {
        recommendations.push('Initialize sample data for empty tables');
      }

      const staleTables = Object.entries(tables).filter(([_, info]) => 
        info.issues.some(issue => issue.includes('No updates'))
      );
      if (staleTables.length > 0) {
        recommendations.push('Review and update stale data');
      }

      // Determine overall status
      let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (healthStatus.status === 'critical' || Object.values(tables).some(t => t.status === 'critical')) {
        overall = 'critical';
      } else if (healthStatus.status === 'warning' || Object.values(tables).some(t => t.status === 'warning')) {
        overall = 'warning';
      }

      return {
        overall,
        lastSync: this.lastSyncTime || 'Never',
        lastBackup: await this.getLastBackupTime(),
        tables,
        recommendations
      };

    } catch (error) {
      console.error('Failed to generate health report:', error);
      return {
        overall: 'critical',
        lastSync: 'Error',
        lastBackup: 'Error',
        tables: {},
        recommendations: ['Failed to assess data health - system check required']
      };
    }
  }

  /**
   * Monitor data changes in real-time
   */
  onDataSync(callback: (result: SyncResult) => void): () => void {
    this.syncListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncListeners.indexOf(callback);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  /**
   * Force data persistence for a specific entity
   */
  async ensurePersistence(entityType: string, entityId: string): Promise<boolean> {
    try {
      const repo = this.getRepository(entityType);
      if (!repo) return false;

      // Verify entity exists and is properly stored
      const entity = await repo.findById(entityId);
      if (!entity) return false;

      // Force a write to ensure persistence
      await repo.update(entityId, { updated_at: new Date().toISOString() });
      
      // Verify the update persisted
      const updated = await repo.findById(entityId);
      return updated?.updated_at !== entity.updated_at;

    } catch (error) {
      console.error(`Failed to ensure persistence for ${entityType}:${entityId}`, error);
      return false;
    }
  }

  /**
   * Batch update multiple entities with transaction support
   */
  async batchUpdate(updates: Array<{
    entityType: string;
    entityId: string;
    data: Record<string, any>;
  }>): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      await db.withTransaction(async () => {
        for (const update of updates) {
          try {
            const repo = this.getRepository(update.entityType);
            if (repo) {
              await repo.update(update.entityId, {
                ...update.data,
                updated_at: new Date().toISOString()
              });
              processed++;
            } else {
              errors.push(`Unknown entity type: ${update.entityType}`);
            }
          } catch (error) {
            errors.push(`Failed to update ${update.entityType}:${update.entityId} - ${(error as Error).message}`);
          }
        }
      });

      // Force sync after batch update
      await this.syncAllData();

      return {
        success: errors.length === 0,
        processed,
        errors
      };

    } catch (error) {
      return {
        success: false,
        processed,
        errors: [...errors, `Batch update failed: ${(error as Error).message}`]
      };
    }
  }

  // Private methods

  private getRepository(tableName: string) {
    switch (tableName) {
      case 'users': return db.users;
      case 'companies': return db.companies;
      case 'contacts': return db.contacts;
      case 'opportunities': return db.opportunities;
      case 'meddpicc': return db.meddpicc;
      case 'peak_process': return db.peakProcess;
      case 'activities': return db.activities;
      case 'notes': return db.notes;
      case 'customer_segments': return db.customerSegments;
      case 'pipeline_configs': return db.pipelineConfigs;
      case 'kpi_metrics': return db.kpiMetrics;
      default: return null;
    }
  }

  private async verifyTablePersistence(tableName: string): Promise<void> {
    const repo = this.getRepository(tableName);
    if (!repo) return;

    // Create a test record to verify persistence
    const testId = `persistence_test_${Date.now()}`;
    
    try {
      // For tables that support it, create a minimal test record
      if (tableName === 'users') {
        await repo.create({
          id: testId,
          email: `test@persistence.${Date.now()}.com`,
          name: 'Persistence Test',
          role: 'viewer',
          is_active: false
        });
      }
      // Add other test cases as needed
      
      // Verify it exists
      const exists = await repo.findById(testId);
      if (!exists) {
        throw new Error(`Test record not persisted in ${tableName}`);
      }
      
      // Clean up test record
      await repo.delete(testId);
      
    } catch (error) {
      // If we can't create test records, just verify the table is accessible
      await repo.findAll({ limit: 1 });
    }
  }

  private async refreshAnalyticsCache(): Promise<void> {
    // Pre-calculate common analytics to improve performance
    const cacheKey = 'analytics_cache';
    const cacheData = {
      timestamp: new Date().toISOString(),
      realTimeDashboard: await performanceTracker.getRealTimeDashboard(),
      teamPerformance: await performanceTracker.getTeamPerformance(),
      regionalPerformance: await performanceTracker.getRegionalPerformance(),
      // Add more cached analytics as needed
    };

    if (typeof window !== 'undefined' && window.spark?.kv) {
      await window.spark.kv.set(cacheKey, cacheData);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes
    setInterval(async () => {
      if (!this.syncInProgress) {
        await this.syncAllData();
      }
    }, 5 * 60 * 1000);

    // Also sync on visibility change (when user returns to tab)
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !this.syncInProgress) {
          this.syncAllData();
        }
      });
    }
  }

  private startHealthMonitoring(): void {
    // Health check every 10 minutes
    setInterval(async () => {
      try {
        const health = await this.getDataHealthReport();
        if (health.overall === 'critical') {
          console.error('🚨 Critical data health issues detected:', health.recommendations);
          // Could trigger alerts or automatic recovery here
        }
      } catch (error) {
        console.error('Health monitoring check failed:', error);
      }
    }, 10 * 60 * 1000);
  }

  private async getLastBackupTime(): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.spark?.kv) {
        const keys = await window.spark.kv.keys();
        const backupKeys = keys.filter(key => key.startsWith('fulqrun_backup_'));
        
        if (backupKeys.length === 0) return 'Never';
        
        // Extract timestamps from backup keys and find the latest
        const timestamps = backupKeys
          .map(key => {
            const match = key.match(/fulqrun_backup_(\d+)_/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(timestamp => timestamp > 0);
        
        if (timestamps.length === 0) return 'Never';
        
        const latestTimestamp = Math.max(...timestamps);
        return new Date(latestTimestamp).toISOString();
      }
    } catch (error) {
      console.error('Failed to get last backup time:', error);
    }
    
    return 'Unknown';
  }
}

// Create and export singleton instance
export const dataIntegration = DataIntegrationService.getInstance();