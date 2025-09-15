/**
 * Application Validation and Health Check
 * 
 * Comprehensive validation to ensure all systems are working correctly
 */

import { db } from './database';
import { dataIntegration } from './data-integration';

export interface ValidationResult {
  success: boolean;
  component: string;
  message: string;
  details?: any;
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export class AppValidator {
  /**
   * Run comprehensive application validation
   */
  async validateSystem(): Promise<SystemHealth> {
    console.log('🔍 Starting comprehensive system validation...');
    
    const components: ValidationResult[] = [];
    
    // Database validation
    try {
      await db.initialize();
      const healthStatus = await db.getHealthStatus();
      
      components.push({
        success: healthStatus.status !== 'critical',
        component: 'Database',
        message: `Status: ${healthStatus.status}`,
        details: healthStatus
      });
    } catch (error) {
      components.push({
        success: false,
        component: 'Database',
        message: `Failed to validate database: ${(error as Error).message}`
      });
    }

    // Data Integration validation
    try {
      await dataIntegration.initialize();
      const syncResult = await dataIntegration.syncAllData();
      
      components.push({
        success: syncResult.success,
        component: 'Data Integration',
        message: `Sync status: ${syncResult.success ? 'OK' : 'Failed'}`,
        details: syncResult
      });
    } catch (error) {
      components.push({
        success: false,
        component: 'Data Integration',
        message: `Failed to validate data integration: ${(error as Error).message}`
      });
    }

    // KV Storage validation
    try {
      if (typeof window !== 'undefined' && window.spark?.kv) {
        await window.spark.kv.set('health_check', { timestamp: new Date().toISOString() });
        const retrieved = await window.spark.kv.get('health_check');
        
        components.push({
          success: !!retrieved,
          component: 'KV Storage',
          message: retrieved ? 'KV storage operational' : 'KV storage not responding'
        });
        
        // Clean up test data
        await window.spark.kv.delete('health_check');
      } else {
        components.push({
          success: false,
          component: 'KV Storage',
          message: 'Spark KV API not available'
        });
      }
    } catch (error) {
      components.push({
        success: false,
        component: 'KV Storage',
        message: `KV storage error: ${(error as Error).message}`
      });
    }

    // User Authentication validation
    try {
      if (typeof window !== 'undefined' && window.spark?.user) {
        const user = await window.spark.user();
        
        components.push({
          success: !!user,
          component: 'Authentication',
          message: user ? `Authenticated as ${user.login}` : 'No user authenticated',
          details: user
        });
      } else {
        components.push({
          success: false,
          component: 'Authentication',
          message: 'Spark user API not available'
        });
      }
    } catch (error) {
      components.push({
        success: false,
        component: 'Authentication',
        message: `Authentication error: ${(error as Error).message}`
      });
    }

    // Repository validation
    const repositories = [
      { name: 'Users', repo: db.users },
      { name: 'Companies', repo: db.companies },
      { name: 'Contacts', repo: db.contacts },
      { name: 'Opportunities', repo: db.opportunities },
      { name: 'MEDDPICC', repo: db.meddpicc },
      { name: 'PEAK Process', repo: db.peakProcess }
    ];

    for (const { name, repo } of repositories) {
      try {
        const count = await repo.count();
        
        components.push({
          success: true,
          component: `Repository: ${name}`,
          message: `${count} records found`,
          details: { count }
        });
      } catch (error) {
        components.push({
          success: false,
          component: `Repository: ${name}`,
          message: `Repository error: ${(error as Error).message}`
        });
      }
    }

    // Calculate summary
    const passed = components.filter(c => c.success).length;
    const failed = components.filter(c => !c.success).length;
    const warnings = components.filter(c => 
      c.success && (c.message.includes('warning') || c.message.includes('Warning'))
    ).length;

    let overall: 'healthy' | 'warning' | 'critical';
    if (failed > 0) {
      overall = 'critical';
    } else if (warnings > 0) {
      overall = 'warning';
    } else {
      overall = 'healthy';
    }

    const health: SystemHealth = {
      overall,
      components,
      summary: {
        total: components.length,
        passed,
        failed,
        warnings
      }
    };

    console.log(`✅ System validation complete. Status: ${overall}`);
    console.log(`📊 Results: ${passed}/${components.length} components healthy`);

    return health;
  }

  /**
   * Quick health check for essential components
   */
  async quickHealthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      // Check database connection
      await db.users.count();
      
      // Check KV storage
      if (typeof window !== 'undefined' && window.spark?.kv) {
        await window.spark.kv.set('quick_check', Date.now());
        await window.spark.kv.delete('quick_check');
      }

      return {
        healthy: true,
        message: 'All essential systems operational'
      };
    } catch (error) {
      return {
        healthy: false,
        message: `System health check failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Validate data consistency across related entities
   */
  async validateDataConsistency(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      // Check opportunity-contact relationships
      const { data: opportunities } = await db.opportunities.findAll();
      let orphanedOpportunities = 0;

      for (const opportunity of opportunities) {
        if (opportunity.primary_contact_id) {
          const contact = await db.contacts.findById(opportunity.primary_contact_id);
          if (!contact) {
            orphanedOpportunities++;
          }
        }
      }

      results.push({
        success: orphanedOpportunities === 0,
        component: 'Data Consistency: Opportunities-Contacts',
        message: orphanedOpportunities > 0 ? 
          `${orphanedOpportunities} opportunities have invalid contact references` :
          'All opportunity-contact relationships are valid'
      });

      // Check contact-company relationships
      const { data: contacts } = await db.contacts.findAll();
      let orphanedContacts = 0;

      for (const contact of contacts) {
        const company = await db.companies.findById(contact.company_id);
        if (!company) {
          orphanedContacts++;
        }
      }

      results.push({
        success: orphanedContacts === 0,
        component: 'Data Consistency: Contacts-Companies',
        message: orphanedContacts > 0 ? 
          `${orphanedContacts} contacts have invalid company references` :
          'All contact-company relationships are valid'
      });

      // Check MEDDPICC-opportunity relationships
      const { data: meddpiccRecords } = await db.meddpicc.findAll();
      let orphanedMEDDPICC = 0;

      for (const record of meddpiccRecords) {
        const opportunity = await db.opportunities.findById(record.opportunity_id);
        if (!opportunity) {
          orphanedMEDDPICC++;
        }
      }

      results.push({
        success: orphanedMEDDPICC === 0,
        component: 'Data Consistency: MEDDPICC-Opportunities',
        message: orphanedMEDDPICC > 0 ? 
          `${orphanedMEDDPICC} MEDDPICC records have invalid opportunity references` :
          'All MEDDPICC-opportunity relationships are valid'
      });

    } catch (error) {
      results.push({
        success: false,
        component: 'Data Consistency Check',
        message: `Failed to validate data consistency: ${(error as Error).message}`
      });
    }

    return results;
  }

  /**
   * Generate system health report
   */
  async generateHealthReport(): Promise<{
    timestamp: string;
    system: SystemHealth;
    dataConsistency: ValidationResult[];
    recommendations: string[];
  }> {
    console.log('📋 Generating comprehensive health report...');

    const system = await this.validateSystem();
    const dataConsistency = await this.validateDataConsistency();

    // Generate recommendations
    const recommendations: string[] = [];

    if (system.overall === 'critical') {
      recommendations.push('Immediate attention required - critical system failures detected');
    }

    if (system.summary.failed > 0) {
      recommendations.push('Review and fix failed components before proceeding');
    }

    const failedDataChecks = dataConsistency.filter(check => !check.success);
    if (failedDataChecks.length > 0) {
      recommendations.push('Data consistency issues detected - run data cleanup');
    }

    if (system.overall === 'healthy' && failedDataChecks.length === 0) {
      recommendations.push('System is healthy - continue normal operations');
    }

    const report = {
      timestamp: new Date().toISOString(),
      system,
      dataConsistency,
      recommendations
    };

    console.log('✅ Health report generated successfully');
    return report;
  }
}

// Export singleton instance
export const appValidator = new AppValidator();

// Auto-validate on load in development
if (process.env.NODE_ENV === 'development') {
  // Run a quick health check when the module loads
  setTimeout(async () => {
    try {
      const health = await appValidator.quickHealthCheck();
      if (!health.healthy) {
        console.warn('⚠️ Quick health check failed:', health.message);
      } else {
        console.log('💚 Quick health check passed');
      }
    } catch (error) {
      console.warn('⚠️ Health check error:', error);
    }
  }, 2000);
}