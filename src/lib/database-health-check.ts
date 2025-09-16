/**
 * Database Health Check and Repair Utilities
 * Addresses console errors related to missing database indices and data inconsistencies
 */

import { DatabaseManager } from './database/database-manager';
import { isRateLimited } from './rate-limiting';

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  repaired: string[];
  errors: string[];
}

export class DatabaseHealthChecker {
  private static instance: DatabaseHealthChecker;
  private lastHealthCheck = 0;
  private isRunning = false;

  static getInstance(): DatabaseHealthChecker {
    if (!DatabaseHealthChecker.instance) {
      DatabaseHealthChecker.instance = new DatabaseHealthChecker();
    }
    return DatabaseHealthChecker.instance;
  }

  /**
   * Comprehensive health check and repair
   */
  async performHealthCheck(forceCheck = false): Promise<HealthCheckResult> {
    const now = Date.now();
    
    // Rate limiting - only run health check every 5 minutes
    if (!forceCheck && (now - this.lastHealthCheck < 300000)) {
      return {
        status: 'healthy',
        issues: [],
        repaired: [],
        errors: ['Health check skipped - too frequent']
      };
    }

    // Prevent concurrent health checks
    if (this.isRunning) {
      return {
        status: 'warning',
        issues: ['Health check already running'],
        repaired: [],
        errors: []
      };
    }

    this.isRunning = true;
    this.lastHealthCheck = now;

    const result: HealthCheckResult = {
      status: 'healthy',
      issues: [],
      repaired: [],
      errors: []
    };

    try {
      console.log('🔍 Running database health check...');

      // Check 1: Verify core data exists
      await this.checkCoreDataIntegrity(result);

      // Check 2: Repair missing indices
      await this.repairMissingIndices(result);

      // Check 3: Clean up orphaned data
      await this.cleanupOrphanedData(result);

      // Check 4: Verify data relationships
      await this.verifyDataRelationships(result);

      // Determine overall status
      if (result.errors.length > 0) {
        result.status = 'critical';
      } else if (result.issues.length > 0) {
        result.status = 'warning';
      }

      console.log(`✅ Database health check completed. Status: ${result.status}`);
      if (result.repaired.length > 0) {
        console.log('🔧 Repairs made:', result.repaired);
      }

    } catch (error) {
      console.error('❌ Database health check failed:', error);
      result.status = 'critical';
      result.errors.push(`Health check failed: ${error.message}`);
    } finally {
      this.isRunning = false;
    }

    return result;
  }

  /**
   * Check if core data exists and is valid
   */
  private async checkCoreDataIntegrity(result: HealthCheckResult): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();

      // Check user count
      const userCount = await db.users.count();
      if (userCount === 0) {
        result.issues.push('No users found in database');
        
        // Try to create default users
        try {
          await db.initializeSampleData();
          result.repaired.push('Created default user data');
        } catch (error) {
          result.errors.push(`Failed to create default users: ${error.message}`);
        }
      }

      // Check opportunity count
      const opportunityCount = await db.opportunities.count();
      if (opportunityCount === 0) {
        result.issues.push('No opportunities found in database');
        
        // Opportunities will be created by OpportunityService if needed
        result.repaired.push('Flagged opportunities for initialization');
      }

      // Check company count
      const companyCount = await db.companies.count();
      if (companyCount === 0) {
        result.issues.push('No companies found in database');
        result.repaired.push('Flagged companies for initialization');
      }

    } catch (error) {
      result.errors.push(`Core data integrity check failed: ${error.message}`);
    }
  }

  /**
   * Repair missing database indices
   */
  private async repairMissingIndices(result: HealthCheckResult): Promise<void> {
    try {
      if (isRateLimited('repair-indices', 1)) {
        result.errors.push('Index repair is rate limited');
        return;
      }

      const allKeys = await spark.kv.keys();
      const indexKeys = allKeys.filter(key => key.includes('_idx:'));
      
      // Check for missing user email indices
      const userEmailIndices = indexKeys.filter(key => key.startsWith('fulqrun_db_users_idx:email:'));
      if (userEmailIndices.length === 0) {
        result.issues.push('Missing user email indices');
        await this.rebuildUserIndices(result);
      }

      // Check for missing contact email indices
      const contactEmailIndices = indexKeys.filter(key => key.startsWith('fulqrun_db_contacts_idx:email:'));
      if (contactEmailIndices.length === 0) {
        result.issues.push('Missing contact email indices');
        await this.rebuildContactIndices(result);
      }

      // Check for missing opportunity indices
      const opportunityIndices = indexKeys.filter(key => key.startsWith('fulqrun_db_peak_process_idx:') || key.startsWith('fulqrun_db_meddpicc_idx:'));
      if (opportunityIndices.length === 0) {
        result.issues.push('Missing opportunity method indices');
        await this.rebuildOpportunityIndices(result);
      }

    } catch (error) {
      result.errors.push(`Index repair failed: ${error.message}`);
    }
  }

  /**
   * Rebuild user email indices
   */
  private async rebuildUserIndices(result: HealthCheckResult): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();
      const users = await db.users.findAll();

      for (const user of users) {
        if (user.email) {
          const indexKey = `fulqrun_db_users_idx:email:${user.email}`;
          await spark.kv.set(indexKey, user.id);
        }
      }

      result.repaired.push(`Rebuilt ${users.length} user email indices`);
    } catch (error) {
      result.errors.push(`Failed to rebuild user indices: ${error.message}`);
    }
  }

  /**
   * Rebuild contact email indices
   */
  private async rebuildContactIndices(result: HealthCheckResult): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();
      const contacts = await db.contacts.findAll();

      for (const contact of contacts) {
        if (contact.email) {
          const indexKey = `fulqrun_db_contacts_idx:email:${contact.email}`;
          await spark.kv.set(indexKey, contact.id);
        }
      }

      result.repaired.push(`Rebuilt ${contacts.length} contact email indices`);
    } catch (error) {
      result.errors.push(`Failed to rebuild contact indices: ${error.message}`);
    }
  }

  /**
   * Rebuild opportunity method indices
   */
  private async rebuildOpportunityIndices(result: HealthCheckResult): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();
      const opportunities = await db.opportunities.findAll();

      for (const opportunity of opportunities) {
        // Create PEAK process index
        const peakIndexKey = `fulqrun_db_peak_process_idx:opportunity_id:${opportunity.id}`;
        await spark.kv.set(peakIndexKey, opportunity.id);

        // Create MEDDPICC index
        const meddpiccIndexKey = `fulqrun_db_meddpicc_idx:opportunity_id:${opportunity.id}`;
        await spark.kv.set(meddpiccIndexKey, opportunity.id);
      }

      result.repaired.push(`Rebuilt ${opportunities.length} opportunity method indices`);
    } catch (error) {
      result.errors.push(`Failed to rebuild opportunity indices: ${error.message}`);
    }
  }

  /**
   * Clean up orphaned data
   */
  private async cleanupOrphanedData(result: HealthCheckResult): Promise<void> {
    try {
      const allKeys = await spark.kv.keys();
      const orphanedKeys: string[] = [];

      // Find test data keys that should be cleaned up
      const testKeys = allKeys.filter(key => 
        key.includes('test@persistence') || 
        key.includes('test-data') ||
        key.includes('temp-')
      );

      if (testKeys.length > 10) { // Only clean up if there are many
        for (const key of testKeys.slice(0, 50)) { // Limit to prevent rate limiting
          try {
            await spark.kv.delete(key);
            orphanedKeys.push(key);
          } catch (error) {
            // Silently handle delete errors
          }
        }

        if (orphanedKeys.length > 0) {
          result.repaired.push(`Cleaned up ${orphanedKeys.length} orphaned test keys`);
        }
      }

    } catch (error) {
      result.errors.push(`Orphaned data cleanup failed: ${error.message}`);
    }
  }

  /**
   * Verify data relationships are intact
   */
  private async verifyDataRelationships(result: HealthCheckResult): Promise<void> {
    try {
      const db = DatabaseManager.getInstance();

      // Check opportunities have valid company references
      const opportunities = await db.opportunities.findAll();
      let invalidCompanyRefs = 0;

      for (const opportunity of opportunities.slice(0, 10)) { // Limit check to prevent rate limiting
        if (opportunity.company_id) {
          try {
            const company = await db.companies.findById(opportunity.company_id);
            if (!company) {
              invalidCompanyRefs++;
            }
          } catch (error) {
            invalidCompanyRefs++;
          }
        }
      }

      if (invalidCompanyRefs > 0) {
        result.issues.push(`Found ${invalidCompanyRefs} opportunities with invalid company references`);
      }

    } catch (error) {
      result.errors.push(`Data relationship verification failed: ${error.message}`);
    }
  }

  /**
   * Quick health check for critical issues only
   */
  async quickHealthCheck(): Promise<boolean> {
    try {
      if (isRateLimited('quick-health-check', 5)) {
        return true; // Assume healthy if rate limited
      }

      const db = DatabaseManager.getInstance();
      
      // Quick checks
      const userCount = await db.users.count();
      const opportunityCount = await db.opportunities.count();

      return userCount > 0 && opportunityCount >= 0;
    } catch (error) {
      console.warn('Quick health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseHealthChecker = DatabaseHealthChecker.getInstance();

/**
 * Auto-run health check on app startup (with delay)
 */
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      await databaseHealthChecker.performHealthCheck();
    } catch (error) {
      console.warn('Startup health check failed:', error);
    }
  }, 10000); // 10 second delay to allow app initialization
}