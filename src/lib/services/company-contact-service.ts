/**
 * Company and Contact Service with Database Integration
 */

import { db, ensureDatabaseInitialized } from '../database';
import { Company as DBCompany, Contact as DBContact } from '../database/schema';

// Legacy types for backward compatibility
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
 * Enhanced Company and Contact Service with Database Integration
 */
export class EnhancedCompanyContactService {
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
   * Convert database company to legacy format
   */
  private static convertCompanyFromDB(dbCompany: DBCompany): Company {
    return {
      id: dbCompany.id,
      name: dbCompany.name,
      industry: dbCompany.industry,
      size: dbCompany.size,
      website: dbCompany.website,
      address: dbCompany.address,
      revenue: dbCompany.revenue,
      employees: dbCompany.employees,
      region: dbCompany.region,
      country: dbCompany.country,
      geography: dbCompany.region, // Legacy field mapping
      segmentId: dbCompany.segment_id,
      createdAt: dbCompany.created_at,
      updatedAt: dbCompany.updated_at,
    };
  }

  /**
   * Convert database contact to legacy format
   */
  private static convertContactFromDB(dbContact: DBContact): Contact {
    return {
      id: dbContact.id,
      companyId: dbContact.company_id,
      firstName: dbContact.first_name,
      lastName: dbContact.last_name,
      email: dbContact.email,
      phone: dbContact.phone,
      jobTitle: dbContact.job_title,
      department: dbContact.department,
      region: dbContact.region,
      country: dbContact.country,
      isPrimary: dbContact.is_primary,
      createdAt: dbContact.created_at,
      updatedAt: dbContact.updated_at,
    };
  }

  /**
   * Convert legacy company format to database format
   */
  private static convertCompanyToDB(company: Partial<Company>): any {
    return {
      name: company.name,
      industry: company.industry || 'Other',
      size: company.size || 'Medium',
      website: company.website,
      address: company.address,
      revenue: company.revenue,
      employees: company.employees,
      region: company.region || company.geography || 'Unknown',
      country: company.country || 'Unknown',
      segment_id: company.segmentId,
      created_by: 'current-user',
    };
  }

  /**
   * Convert legacy contact format to database format
   */
  private static convertContactToDB(contact: Partial<Contact>): any {
    return {
      company_id: contact.companyId,
      first_name: contact.firstName,
      last_name: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      job_title: contact.jobTitle,
      department: contact.department,
      region: contact.region || 'Unknown',
      country: contact.country || 'Unknown',
      is_primary: contact.isPrimary || false,
      created_by: 'current-user',
    };
  }

  // ========================================
  // COMPANY METHODS
  // ========================================

  /**
   * Initialize sample data
   */
  static async initializeSampleData(): Promise<void> {
    await this.ensureInitialized();
    // Sample data is created during database initialization
    console.log('Sample company/contact data initialized via database');
  }

  /**
   * Create a new company
   */
  static async createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    await this.ensureInitialized();

    try {
      const dbData = this.convertCompanyToDB(data);
      const result = await db.companies.create(dbData);
      return this.convertCompanyFromDB(result);
    } catch (error) {
      console.error('Failed to create company:', error);
      throw error;
    }
  }

  /**
   * Update a company
   */
  static async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    await this.ensureInitialized();

    try {
      const dbUpdates = this.convertCompanyToDB(updates);
      const result = await db.companies.update(id, dbUpdates);
      return result ? this.convertCompanyFromDB(result) : null;
    } catch (error) {
      console.error('Failed to update company:', error);
      throw error;
    }
  }

  /**
   * Delete a company
   */
  static async deleteCompany(id: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      return await db.withTransaction(async () => {
        // Delete all contacts for this company first
        const contacts = await db.contacts.findByCompany(id);
        for (const contact of contacts) {
          await db.contacts.delete(contact.id);
        }

        // Delete all opportunities for this company
        const opportunities = await db.opportunities.findByCompany(id);
        for (const opportunity of opportunities) {
          // This will cascade delete related MEDDPICC, PEAK, activities, notes
          await db.opportunities.delete(opportunity.id);
        }

        // Delete the company
        return await db.companies.delete(id);
      });
    } catch (error) {
      console.error('Failed to delete company:', error);
      return false;
    }
  }

  /**
   * Get company by ID
   */
  static async getCompany(id: string): Promise<Company | null> {
    await this.ensureInitialized();

    try {
      const company = await db.companies.findById(id);
      return company ? this.convertCompanyFromDB(company) : null;
    } catch (error) {
      console.error('Failed to get company:', error);
      return null;
    }
  }

  /**
   * Get all companies
   */
  static async getAllCompanies(): Promise<Company[]> {
    await this.ensureInitialized();

    try {
      const { data: companies } = await db.companies.findAll();
      return companies.map(this.convertCompanyFromDB);
    } catch (error) {
      console.error('Failed to get all companies:', error);
      return [];
    }
  }

  /**
   * Search companies by name
   */
  static async searchCompanies(query: string): Promise<Company[]> {
    await this.ensureInitialized();

    try {
      const companies = await db.companies.searchByName(query);
      return companies.map(this.convertCompanyFromDB);
    } catch (error) {
      console.error('Failed to search companies:', error);
      return [];
    }
  }

  /**
   * Get companies by industry
   */
  static async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    await this.ensureInitialized();

    try {
      const companies = await db.companies.findByIndustry(industry);
      return companies.map(this.convertCompanyFromDB);
    } catch (error) {
      console.error('Failed to get companies by industry:', error);
      return [];
    }
  }

  /**
   * Get companies by region
   */
  static async getCompaniesByRegion(region: string): Promise<Company[]> {
    await this.ensureInitialized();

    try {
      const companies = await db.companies.findByRegion(region);
      return companies.map(this.convertCompanyFromDB);
    } catch (error) {
      console.error('Failed to get companies by region:', error);
      return [];
    }
  }

  // ========================================
  // CONTACT METHODS
  // ========================================

  /**
   * Create a new contact
   */
  static async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    await this.ensureInitialized();

    try {
      const dbData = this.convertContactToDB(data);
      const result = await db.contacts.create(dbData);
      return this.convertContactFromDB(result);
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  }

  /**
   * Update a contact
   */
  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    await this.ensureInitialized();

    try {
      const dbUpdates = this.convertContactToDB(updates);
      const result = await db.contacts.update(id, dbUpdates);
      return result ? this.convertContactFromDB(result) : null;
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  }

  /**
   * Delete a contact
   */
  static async deleteContact(id: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      return await db.contacts.delete(id);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      return false;
    }
  }

  /**
   * Get contact by ID
   */
  static async getContact(id: string): Promise<Contact | null> {
    await this.ensureInitialized();

    try {
      const contact = await db.contacts.findById(id);
      return contact ? this.convertContactFromDB(contact) : null;
    } catch (error) {
      console.error('Failed to get contact:', error);
      return null;
    }
  }

  /**
   * Get all contacts
   */
  static async getAllContacts(): Promise<Contact[]> {
    await this.ensureInitialized();

    try {
      const { data: contacts } = await db.contacts.findAll();
      return contacts.map(this.convertContactFromDB);
    } catch (error) {
      console.error('Failed to get all contacts:', error);
      return [];
    }
  }

  /**
   * Get contacts by company
   */
  static async getContactsByCompany(companyId: string): Promise<Contact[]> {
    await this.ensureInitialized();

    try {
      const contacts = await db.contacts.findByCompany(companyId);
      return contacts.map(this.convertContactFromDB);
    } catch (error) {
      console.error('Failed to get contacts by company:', error);
      return [];
    }
  }

  /**
   * Get primary contact for a company
   */
  static async getPrimaryContact(companyId: string): Promise<Contact | null> {
    await this.ensureInitialized();

    try {
      const contact = await db.contacts.findPrimaryByCompany(companyId);
      return contact ? this.convertContactFromDB(contact) : null;
    } catch (error) {
      console.error('Failed to get primary contact:', error);
      return null;
    }
  }

  /**
   * Set primary contact for a company
   */
  static async setPrimaryContact(companyId: string, contactId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      await db.contacts.setPrimaryContact(companyId, contactId);
    } catch (error) {
      console.error('Failed to set primary contact:', error);
      throw error;
    }
  }

  /**
   * Search contacts
   */
  static async searchContacts(query: string): Promise<Contact[]> {
    await this.ensureInitialized();

    try {
      const contacts = await db.contacts.searchContacts(query);
      return contacts.map(this.convertContactFromDB);
    } catch (error) {
      console.error('Failed to search contacts:', error);
      return [];
    }
  }

  /**
   * Get contact by email
   */
  static async getContactByEmail(email: string): Promise<Contact | null> {
    await this.ensureInitialized();

    try {
      const contact = await db.contacts.findByEmail(email);
      return contact ? this.convertContactFromDB(contact) : null;
    } catch (error) {
      console.error('Failed to get contact by email:', error);
      return null;
    }
  }

  // ========================================
  // STATISTICS AND ANALYTICS
  // ========================================

  /**
   * Get company statistics
   */
  static async getCompanyStats() {
    await this.ensureInitialized();

    try {
      return await db.companies.getCompanyStats();
    } catch (error) {
      console.error('Failed to get company stats:', error);
      return {
        total: 0,
        byIndustry: {},
        byRegion: {},
        bySize: {}
      };
    }
  }

  /**
   * Get contact statistics
   */
  static async getContactStats() {
    await this.ensureInitialized();

    try {
      const { data: contacts } = await db.contacts.findAll();
      const primaryContacts = await db.contacts.findPrimaryContacts();

      const stats = {
        total: contacts.length,
        primary: primaryContacts.length,
        byCompany: {} as Record<string, number>,
        byRegion: {} as Record<string, number>
      };

      contacts.forEach(contact => {
        // Count by company
        stats.byCompany[contact.company_id] = (stats.byCompany[contact.company_id] || 0) + 1;
        
        // Count by region
        stats.byRegion[contact.region] = (stats.byRegion[contact.region] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get contact stats:', error);
      return {
        total: 0,
        primary: 0,
        byCompany: {},
        byRegion: {}
      };
    }
  }

  // ========================================
  // RELATIONSHIP METHODS
  // ========================================

  /**
   * Get company with all its contacts
   */
  static async getCompanyWithContacts(companyId: string): Promise<{
    company: Company | null;
    contacts: Contact[];
    primaryContact: Contact | null;
  }> {
    await this.ensureInitialized();

    try {
      const company = await this.getCompany(companyId);
      const contacts = await this.getContactsByCompany(companyId);
      const primaryContact = await this.getPrimaryContact(companyId);

      return { company, contacts, primaryContact };
    } catch (error) {
      console.error('Failed to get company with contacts:', error);
      return { company: null, contacts: [], primaryContact: null };
    }
  }

  /**
   * Get companies with contact counts
   */
  static async getCompaniesWithContactCounts(): Promise<Array<Company & { contactCount: number }>> {
    await this.ensureInitialized();

    try {
      const companies = await this.getAllCompanies();
      const results = [];

      for (const company of companies) {
        const contacts = await this.getContactsByCompany(company.id);
        results.push({
          ...company,
          contactCount: contacts.length
        });
      }

      return results;
    } catch (error) {
      console.error('Failed to get companies with contact counts:', error);
      return [];
    }
  }
}

// Export with the same interface as the original service
export const CompanyContactService = EnhancedCompanyContactService;