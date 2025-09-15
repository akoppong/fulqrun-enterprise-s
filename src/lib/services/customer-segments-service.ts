/**
 * Customer Segments Service with Database Integration
 */

import { db, ensureDatabaseInitialized } from '../database';
import { CustomerSegment as DBCustomerSegment } from '../database/schema';

// Legacy types for backward compatibility
export interface CustomerSegment {
  id: string;
  name: string;
  description?: string;
  criteria?: Record<string, any>;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enhanced Customer Segments Service with Database Integration
 */
export class EnhancedCustomerSegmentsService {
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
   * Convert database segment to legacy format
   */
  private static convertSegmentFromDB(dbSegment: DBCustomerSegment): CustomerSegment {
    return {
      id: dbSegment.id,
      name: dbSegment.name,
      description: dbSegment.description,
      criteria: dbSegment.criteria,
      isActive: dbSegment.is_active,
      createdBy: dbSegment.created_by,
      createdAt: dbSegment.created_at,
      updatedAt: dbSegment.updated_at,
    };
  }

  /**
   * Convert legacy segment format to database format
   */
  private static convertSegmentToDB(segment: Partial<CustomerSegment>): any {
    return {
      name: segment.name,
      description: segment.description,
      criteria: segment.criteria,
      is_active: segment.isActive ?? true,
      created_by: segment.createdBy || 'current-user',
    };
  }

  /**
   * Create a new customer segment
   */
  static async createSegment(data: Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerSegment> {
    await this.ensureInitialized();

    try {
      const dbData = this.convertSegmentToDB(data);
      const result = await db.customerSegments.create(dbData);
      return this.convertSegmentFromDB(result);
    } catch (error) {
      console.error('Failed to create customer segment:', error);
      throw error;
    }
  }

  /**
   * Update a customer segment
   */
  static async updateSegment(id: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment | null> {
    await this.ensureInitialized();

    try {
      const dbUpdates = this.convertSegmentToDB(updates);
      const result = await db.customerSegments.update(id, dbUpdates);
      return result ? this.convertSegmentFromDB(result) : null;
    } catch (error) {
      console.error('Failed to update customer segment:', error);
      throw error;
    }
  }

  /**
   * Delete a customer segment
   */
  static async deleteSegment(id: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      return await db.customerSegments.delete(id);
    } catch (error) {
      console.error('Failed to delete customer segment:', error);
      return false;
    }
  }

  /**
   * Get segment by ID
   */
  static async getSegment(id: string): Promise<CustomerSegment | null> {
    await this.ensureInitialized();

    try {
      const segment = await db.customerSegments.findById(id);
      return segment ? this.convertSegmentFromDB(segment) : null;
    } catch (error) {
      console.error('Failed to get customer segment:', error);
      return null;
    }
  }

  /**
   * Get all customer segments
   */
  static async getAllSegments(): Promise<CustomerSegment[]> {
    await this.ensureInitialized();

    try {
      const { data: segments } = await db.customerSegments.findAll();
      return segments.map(this.convertSegmentFromDB);
    } catch (error) {
      console.error('Failed to get all customer segments:', error);
      return [];
    }
  }

  /**
   * Get active customer segments
   */
  static async getActiveSegments(): Promise<CustomerSegment[]> {
    await this.ensureInitialized();

    try {
      const segments = await db.customerSegments.findActive();
      return segments.map(this.convertSegmentFromDB);
    } catch (error) {
      console.error('Failed to get active customer segments:', error);
      return [];
    }
  }

  /**
   * Get segment by name
   */
  static async getSegmentByName(name: string): Promise<CustomerSegment | null> {
    await this.ensureInitialized();

    try {
      const segment = await db.customerSegments.findByName(name);
      return segment ? this.convertSegmentFromDB(segment) : null;
    } catch (error) {
      console.error('Failed to get customer segment by name:', error);
      return null;
    }
  }

  /**
   * Assign company to segment
   */
  static async assignCompanyToSegment(companyId: string, segmentId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      // Import the company service to avoid circular dependency
      const { CompanyContactService } = await import('./company-contact-service');
      const company = await CompanyContactService.getCompany(companyId);
      
      if (!company) {
        throw new Error('Company not found');
      }

      const segment = await this.getSegment(segmentId);
      if (!segment) {
        throw new Error('Segment not found');
      }

      await CompanyContactService.updateCompany(companyId, {
        ...company,
        segmentId: segmentId
      });

      return true;
    } catch (error) {
      console.error('Failed to assign company to segment:', error);
      return false;
    }
  }

  /**
   * Remove company from segment
   */
  static async removeCompanyFromSegment(companyId: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      // Import the company service to avoid circular dependency
      const { CompanyContactService } = await import('./company-contact-service');
      const company = await CompanyContactService.getCompany(companyId);
      
      if (!company) {
        throw new Error('Company not found');
      }

      await CompanyContactService.updateCompany(companyId, {
        ...company,
        segmentId: undefined
      });

      return true;
    } catch (error) {
      console.error('Failed to remove company from segment:', error);
      return false;
    }
  }

  /**
   * Get companies in a segment
   */
  static async getCompaniesInSegment(segmentId: string): Promise<any[]> {
    await this.ensureInitialized();

    try {
      const companies = await db.companies.findBySegment(segmentId);
      return companies.map(company => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        size: company.size,
        region: company.region,
        country: company.country,
        revenue: company.revenue,
        employees: company.employees,
        segmentId: company.segment_id,
        createdAt: company.created_at,
        updatedAt: company.updated_at,
      }));
    } catch (error) {
      console.error('Failed to get companies in segment:', error);
      return [];
    }
  }

  /**
   * Get segment statistics
   */
  static async getSegmentStats() {
    await this.ensureInitialized();

    try {
      const segments = await this.getAllSegments();
      const stats = {
        total: segments.length,
        active: segments.filter(s => s.isActive).length,
        companies: {} as Record<string, number>
      };

      // Count companies in each segment
      for (const segment of segments) {
        const companies = await this.getCompaniesInSegment(segment.id);
        stats.companies[segment.id] = companies.length;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get segment stats:', error);
      return {
        total: 0,
        active: 0,
        companies: {}
      };
    }
  }

  /**
   * Auto-assign companies to segments based on criteria
   */
  static async autoAssignCompanies(): Promise<{
    assigned: number;
    errors: string[];
  }> {
    await this.ensureInitialized();

    let assigned = 0;
    const errors: string[] = [];

    try {
      const segments = await this.getActiveSegments();
      const { CompanyContactService } = await import('./company-contact-service');
      const companies = await CompanyContactService.getAllCompanies();

      for (const company of companies) {
        // Skip if already assigned to a segment
        if (company.segmentId) {
          continue;
        }

        for (const segment of segments) {
          if (this.companyMatchesSegmentCriteria(company, segment.criteria)) {
            try {
              await this.assignCompanyToSegment(company.id, segment.id);
              assigned++;
              console.log(`Assigned company ${company.name} to segment ${segment.name}`);
              break; // Assign to first matching segment only
            } catch (error) {
              errors.push(`Failed to assign ${company.name} to ${segment.name}: ${(error as Error).message}`);
            }
          }
        }
      }

      return { assigned, errors };
    } catch (error) {
      errors.push(`Auto-assignment failed: ${(error as Error).message}`);
      return { assigned, errors };
    }
  }

  /**
   * Check if a company matches segment criteria
   */
  private static companyMatchesSegmentCriteria(company: any, criteria?: Record<string, any>): boolean {
    if (!criteria) {
      return false;
    }

    // Check revenue range
    if (criteria.revenue_min && company.revenue && company.revenue < criteria.revenue_min) {
      return false;
    }
    if (criteria.revenue_max && company.revenue && company.revenue > criteria.revenue_max) {
      return false;
    }

    // Check employee count
    if (criteria.employees_min && company.employees && company.employees < criteria.employees_min) {
      return false;
    }
    if (criteria.employees_max && company.employees && company.employees > criteria.employees_max) {
      return false;
    }

    // Check industry
    if (criteria.industry && Array.isArray(criteria.industry)) {
      if (!criteria.industry.includes(company.industry)) {
        return false;
      }
    }

    // Check region
    if (criteria.region && Array.isArray(criteria.region)) {
      if (!criteria.region.includes(company.region)) {
        return false;
      }
    }

    // Check company size
    if (criteria.size && Array.isArray(criteria.size)) {
      if (!criteria.size.includes(company.size)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get default segments (created during migration)
   */
  static getDefaultSegments(): Array<Omit<CustomerSegment, 'id' | 'createdAt' | 'updatedAt'>> {
    return [
      {
        name: 'Strategic Partner',
        description: 'Large corporate clients with influential brands ($500M - $2B revenue)',
        criteria: {
          revenue_min: 500000000,
          revenue_max: 2000000000,
          industry: ['Technology', 'Finance', 'Healthcare']
        },
        isActive: true,
        createdBy: 'system'
      },
      {
        name: 'Reference Customer',
        description: 'Companies with expertise to drive high volumes in specific channels',
        criteria: {
          industry: ['Manufacturing', 'Retail', 'Technology'],
          employees_min: 1000
        },
        isActive: true,
        createdBy: 'system'
      },
      {
        name: 'Vector Control',
        description: 'Military, Government, NGOs, Outdoor Workforce, Hospitality',
        criteria: {
          industry: ['Government', 'Defense', 'Hospitality', 'Non-Profit']
        },
        isActive: true,
        createdBy: 'system'
      }
    ];
  }
}

// Export with the same interface as the original service
export const CustomerSegmentsService = EnhancedCustomerSegmentsService;