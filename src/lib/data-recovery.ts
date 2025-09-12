/**
 * Enhanced Error Recovery for Data Model Issues
 * 
 * Provides automatic data recovery and consistency fixes for common
 * application data model issues.
 */

import { normalizeOpportunity, validateOpportunity, normalizeCompany, normalizeContact } from './data-consistency';
import { safeKVGet, safeKVSet } from './kv-storage-manager';
import { Opportunity, Company, Contact } from './types';

export interface DataRecoveryResult {
  recovered: boolean;
  issues: string[];
  fixes: string[];
  errors: string[];
}

export class DataRecoveryManager {
  private static instance: DataRecoveryManager;
  
  static getInstance(): DataRecoveryManager {
    if (!DataRecoveryManager.instance) {
      DataRecoveryManager.instance = new DataRecoveryManager();
    }
    return DataRecoveryManager.instance;
  }

  /**
   * Recovers and fixes all application data
   */
  async recoverAllData(): Promise<DataRecoveryResult> {
    const result: DataRecoveryResult = {
      recovered: false,
      issues: [],
      fixes: [],
      errors: []
    };

    try {
      // Recover opportunities data
      const opportunitiesResult = await this.recoverOpportunities();
      result.issues.push(...opportunitiesResult.issues);
      result.fixes.push(...opportunitiesResult.fixes);
      result.errors.push(...opportunitiesResult.errors);

      // Recover companies data
      const companiesResult = await this.recoverCompanies();
      result.issues.push(...companiesResult.issues);
      result.fixes.push(...companiesResult.fixes);
      result.errors.push(...companiesResult.errors);

      // Recover contacts data
      const contactsResult = await this.recoverContacts();
      result.issues.push(...contactsResult.issues);
      result.fixes.push(...contactsResult.fixes);
      result.errors.push(...contactsResult.errors);

      // Check for orphaned relationships
      const relationshipResult = await this.fixOrphanedRelationships();
      result.issues.push(...relationshipResult.issues);
      result.fixes.push(...relationshipResult.fixes);
      result.errors.push(...relationshipResult.errors);

      result.recovered = result.errors.length === 0;

      // Log recovery summary
      if (result.fixes.length > 0) {
        console.log('Data recovery completed with fixes:', result.fixes);
      }
      
      if (result.errors.length > 0) {
        console.error('Data recovery completed with errors:', result.errors);
      }

      return result;
    } catch (error) {
      result.errors.push(`Failed to recover data: ${error}`);
      return result;
    }
  }

  /**
   * Recovers opportunities data with validation and normalization
   */
  private async recoverOpportunities(): Promise<DataRecoveryResult> {
    const result: DataRecoveryResult = {
      recovered: false,
      issues: [],
      fixes: [],
      errors: []
    };

    try {
      const opportunities = await safeKVGet<any[]>('opportunities', []);
      
      if (!Array.isArray(opportunities)) {
        result.issues.push('Opportunities data is not an array');
        await safeKVSet('opportunities', []);
        result.fixes.push('Reset opportunities to empty array');
        return result;
      }

      const recoveredOpportunities: Opportunity[] = [];
      const brokenOpportunities: any[] = [];

      for (let i = 0; i < opportunities.length; i++) {
        const opp = opportunities[i];
        
        try {
          // Validate current opportunity
          const validation = validateOpportunity(opp);
          
          if (!validation.isValid) {
            result.issues.push(`Opportunity ${opp.id || i}: ${validation.errors.join(', ')}`);
            
            // Try to normalize the opportunity
            const normalized = normalizeOpportunity(opp);
            const normalizedValidation = validateOpportunity(normalized);
            
            if (normalizedValidation.isValid) {
              recoveredOpportunities.push(normalized);
              result.fixes.push(`Opportunity ${opp.id || i}: Normalized and recovered`);
            } else {
              brokenOpportunities.push(opp);
              result.errors.push(`Opportunity ${opp.id || i}: Could not recover - ${normalizedValidation.errors.join(', ')}`);
            }
          } else {
            // Opportunity is valid, keep as is
            recoveredOpportunities.push(opp);
          }
        } catch (error) {
          brokenOpportunities.push(opp);
          result.errors.push(`Opportunity ${opp.id || i}: Processing error - ${error}`);
        }
      }

      // Save recovered opportunities
      if (recoveredOpportunities.length !== opportunities.length) {
        await safeKVSet('opportunities', recoveredOpportunities);
        result.fixes.push(`Saved ${recoveredOpportunities.length}/${opportunities.length} valid opportunities`);
      }

      // Save broken opportunities for manual review
      if (brokenOpportunities.length > 0) {
        await safeKVSet('broken-opportunities', brokenOpportunities);
        result.issues.push(`${brokenOpportunities.length} opportunities could not be recovered and were moved to 'broken-opportunities'`);
      }

      result.recovered = result.errors.length === 0;
      return result;
    } catch (error) {
      result.errors.push(`Failed to recover opportunities: ${error}`);
      return result;
    }
  }

  /**
   * Recovers companies data
   */
  private async recoverCompanies(): Promise<DataRecoveryResult> {
    const result: DataRecoveryResult = {
      recovered: false,
      issues: [],
      fixes: [],
      errors: []
    };

    try {
      const companies = await safeKVGet<any[]>('companies', []);
      
      if (!Array.isArray(companies)) {
        result.issues.push('Companies data is not an array');
        await safeKVSet('companies', this.getDefaultCompanies());
        result.fixes.push('Reset companies to default data');
        return result;
      }

      const recoveredCompanies: Company[] = [];

      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        
        try {
          const normalized = normalizeCompany(company);
          recoveredCompanies.push(normalized);
          
          if (JSON.stringify(normalized) !== JSON.stringify(company)) {
            result.fixes.push(`Company ${company.id || i}: Normalized data format`);
          }
        } catch (error) {
          result.errors.push(`Company ${company.id || i}: Could not normalize - ${error}`);
        }
      }

      // Ensure we have at least some default companies
      if (recoveredCompanies.length === 0) {
        const defaultCompanies = this.getDefaultCompanies();
        await safeKVSet('companies', defaultCompanies);
        result.fixes.push('Added default companies data');
      } else {
        await safeKVSet('companies', recoveredCompanies);
      }

      result.recovered = true;
      return result;
    } catch (error) {
      result.errors.push(`Failed to recover companies: ${error}`);
      return result;
    }
  }

  /**
   * Recovers contacts data
   */
  private async recoverContacts(): Promise<DataRecoveryResult> {
    const result: DataRecoveryResult = {
      recovered: false,
      issues: [],
      fixes: [],
      errors: []
    };

    try {
      const contacts = await safeKVGet<any[]>('contacts', []);
      
      if (!Array.isArray(contacts)) {
        result.issues.push('Contacts data is not an array');
        await safeKVSet('contacts', this.getDefaultContacts());
        result.fixes.push('Reset contacts to default data');
        return result;
      }

      const recoveredContacts: Contact[] = [];

      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        
        try {
          const normalized = normalizeContact(contact);
          recoveredContacts.push(normalized);
          
          if (JSON.stringify(normalized) !== JSON.stringify(contact)) {
            result.fixes.push(`Contact ${contact.id || i}: Normalized data format`);
          }
        } catch (error) {
          result.errors.push(`Contact ${contact.id || i}: Could not normalize - ${error}`);
        }
      }

      await safeKVSet('contacts', recoveredContacts);
      result.recovered = true;
      return result;
    } catch (error) {
      result.errors.push(`Failed to recover contacts: ${error}`);
      return result;
    }
  }

  /**
   * Fixes orphaned relationships between opportunities, companies, and contacts
   */
  private async fixOrphanedRelationships(): Promise<DataRecoveryResult> {
    const result: DataRecoveryResult = {
      recovered: false,
      issues: [],
      fixes: [],
      errors: []
    };

    try {
      const [opportunities, companies, contacts] = await Promise.all([
        safeKVGet<Opportunity[]>('opportunities', []),
        safeKVGet<Company[]>('companies', []),
        safeKVGet<Contact[]>('contacts', [])
      ]);

      const companyIds = new Set(companies.map(c => c.id));
      const contactIds = new Set(contacts.map(c => c.id));
      const updatedOpportunities: Opportunity[] = [];

      for (const opp of opportunities) {
        let updated = { ...opp };
        let hasChanges = false;

        // Check if company exists
        if (opp.companyId && !companyIds.has(opp.companyId)) {
          result.issues.push(`Opportunity ${opp.id}: References non-existent company ${opp.companyId}`);
          updated.companyId = '';
          hasChanges = true;
          result.fixes.push(`Opportunity ${opp.id}: Cleared orphaned company reference`);
        }

        // Check if contact exists
        if (opp.contactId && !contactIds.has(opp.contactId)) {
          result.issues.push(`Opportunity ${opp.id}: References non-existent contact ${opp.contactId}`);
          updated.contactId = '';
          hasChanges = true;
          result.fixes.push(`Opportunity ${opp.id}: Cleared orphaned contact reference`);
        }

        // Check if contact belongs to the company
        if (opp.contactId && opp.companyId) {
          const contact = contacts.find(c => c.id === opp.contactId);
          if (contact && contact.companyId !== opp.companyId) {
            result.issues.push(`Opportunity ${opp.id}: Contact ${opp.contactId} does not belong to company ${opp.companyId}`);
            updated.contactId = '';
            hasChanges = true;
            result.fixes.push(`Opportunity ${opp.id}: Cleared mismatched contact reference`);
          }
        }

        if (hasChanges) {
          updatedOpportunities.push(updated);
        } else {
          updatedOpportunities.push(opp);
        }
      }

      if (updatedOpportunities.some((opp, i) => JSON.stringify(opp) !== JSON.stringify(opportunities[i]))) {
        await safeKVSet('opportunities', updatedOpportunities);
        result.fixes.push('Fixed orphaned relationships in opportunities');
      }

      result.recovered = true;
      return result;
    } catch (error) {
      result.errors.push(`Failed to fix orphaned relationships: ${error}`);
      return result;
    }
  }

  /**
   * Gets default companies data
   */
  private getDefaultCompanies(): Company[] {
    return [
      {
        id: 'default-company-1',
        name: 'TechCorp Solutions',
        industry: 'Technology',
        size: 'Large',
        website: 'https://techcorp.example.com',
        description: 'Leading technology solutions provider',
        address: '123 Tech Street, Silicon Valley, CA',
        phone: '+1 (555) 123-4567',
        email: 'contact@techcorp.example.com',
        segment: 'Enterprise',
        tags: ['technology', 'enterprise', 'b2b'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default-company-2',
        name: 'GrowthCo Inc',
        industry: 'Marketing',
        size: 'Medium',
        website: 'https://growthco.example.com',
        description: 'Digital marketing and growth solutions',
        address: '456 Marketing Ave, New York, NY',
        phone: '+1 (555) 987-6543',
        email: 'hello@growthco.example.com',
        segment: 'Mid-Market',
        tags: ['marketing', 'digital', 'growth'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * Gets default contacts data
   */
  private getDefaultContacts(): Contact[] {
    return [
      {
        id: 'default-contact-1',
        companyId: 'default-company-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.example.com',
        phone: '+1 (555) 123-4567',
        title: 'Chief Technology Officer',
        department: 'Technology',
        role: 'decision-maker',
        influence: 'high',
        tags: ['executive', 'tech-lead'],
        notes: 'Primary technical decision maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default-contact-2',
        companyId: 'default-company-2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@growthco.example.com',
        phone: '+1 (555) 987-6543',
        title: 'Marketing Director',
        department: 'Marketing',
        role: 'decision-maker',
        influence: 'high',
        tags: ['marketing', 'director'],
        notes: 'Leads marketing initiatives',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  /**
   * Runs health check on application data
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check opportunities
      const opportunities = await safeKVGet<any[]>('opportunities', []);
      if (!Array.isArray(opportunities)) {
        issues.push('Opportunities data is corrupted');
      } else {
        const invalidOpportunities = opportunities.filter(opp => {
          const validation = validateOpportunity(opp);
          return !validation.isValid;
        });
        
        if (invalidOpportunities.length > 0) {
          issues.push(`${invalidOpportunities.length} opportunities have data issues`);
          recommendations.push('Run data recovery to fix opportunity data issues');
        }
      }

      // Check companies
      const companies = await safeKVGet<any[]>('companies', []);
      if (!Array.isArray(companies) || companies.length === 0) {
        issues.push('No companies data available');
        recommendations.push('Initialize default companies data');
      }

      // Check contacts
      const contacts = await safeKVGet<any[]>('contacts', []);
      if (!Array.isArray(contacts)) {
        issues.push('Contacts data is corrupted');
      }

      const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 2 ? 'warning' : 'critical';

      return { status, issues, recommendations };
    } catch (error) {
      return {
        status: 'critical',
        issues: [`Health check failed: ${error}`],
        recommendations: ['Contact support for assistance']
      };
    }
  }
}

// Export singleton instance
export const dataRecovery = DataRecoveryManager.getInstance();