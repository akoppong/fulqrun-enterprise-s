import { Company, Contact } from '@/lib/types';

/**
 * Service for managing company and contact data
 * Provides sample data and CRUD operations
 */
export class CompanyContactService {
  private static COMPANIES_KEY = 'companies';
  private static CONTACTS_KEY = 'contacts';

  /**
   * Initialize sample companies and contacts if none exist
   */
  static async initializeSampleData(): Promise<void> {
    const companies = await this.getAllCompanies();
    const contacts = await this.getAllContacts();

    if (companies.length === 0) {
      await this.createSampleCompanies();
    }

    if (contacts.length === 0) {
      await this.createSampleContacts();
    }
  }

  /**
   * Create sample companies
   */
  private static async createSampleCompanies(): Promise<void> {
    const sampleCompanies: Company[] = [
      {
        id: 'comp-1',
        name: 'TechCorp Solutions',
        industry: 'Technology',
        size: 'Large',
        website: 'https://techcorp.com',
        description: 'Leading software development company',
        location: 'San Francisco, CA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comp-2',
        name: 'GrowthCo Inc',
        industry: 'Marketing',
        size: 'Medium',
        website: 'https://growthco.com',
        description: 'Digital marketing and growth consultancy',
        location: 'Austin, TX',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comp-3',
        name: 'MedDevice Corp',
        industry: 'Healthcare',
        size: 'Large',
        website: 'https://meddevice.com',
        description: 'Medical device manufacturer',
        location: 'Boston, MA',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comp-4',
        name: 'EcoEnergy Ltd',
        industry: 'Energy',
        size: 'Medium',
        website: 'https://ecoenergy.com',
        description: 'Renewable energy solutions provider',
        location: 'Denver, CO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comp-5',
        name: 'RetailMax Systems',
        industry: 'Retail',
        size: 'Large',
        website: 'https://retailmax.com',
        description: 'Retail management software and services',
        location: 'Chicago, IL',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await this.saveCompanies(sampleCompanies);
  }

  /**
   * Create sample contacts
   */
  private static async createSampleContacts(): Promise<void> {
    const sampleContacts: Contact[] = [
      // TechCorp Solutions contacts
      {
        id: 'contact-1',
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0101',
        role: 'CTO',
        companyId: 'comp-1',
        department: 'Technology',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0102',
        role: 'Procurement Manager',
        companyId: 'comp-1',
        department: 'Operations',
        influence: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-3',
        name: 'David Chen',
        email: 'david.chen@techcorp.com',
        phone: '+1-555-0103',
        role: 'VP Engineering',
        companyId: 'comp-1',
        department: 'Technology',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // GrowthCo Inc contacts
      {
        id: 'contact-4',
        name: 'Mike Davis',
        email: 'mike.davis@growthco.com',
        phone: '+1-555-0201',
        role: 'Marketing Director',
        companyId: 'comp-2',
        department: 'Marketing',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-5',
        name: 'Lisa Wilson',
        email: 'lisa.wilson@growthco.com',
        phone: '+1-555-0202',
        role: 'COO',
        companyId: 'comp-2',
        department: 'Operations',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // MedDevice Corp contacts
      {
        id: 'contact-6',
        name: 'Dr. Robert Taylor',
        email: 'robert.taylor@meddevice.com',
        phone: '+1-555-0301',
        role: 'Chief Medical Officer',
        companyId: 'comp-3',
        department: 'Medical Affairs',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-7',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@meddevice.com',
        phone: '+1-555-0302',
        role: 'VP Regulatory Affairs',
        companyId: 'comp-3',
        department: 'Regulatory',
        influence: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // EcoEnergy Ltd contacts
      {
        id: 'contact-8',
        name: 'Mark Rodriguez',
        email: 'mark.rodriguez@ecoenergy.com',
        phone: '+1-555-0401',
        role: 'CEO',
        companyId: 'comp-4',
        department: 'Executive',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-9',
        name: 'Emily Brown',
        email: 'emily.brown@ecoenergy.com',
        phone: '+1-555-0402',
        role: 'CFO',
        companyId: 'comp-4',
        department: 'Finance',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // RetailMax Systems contacts
      {
        id: 'contact-10',
        name: 'Alex Thompson',
        email: 'alex.thompson@retailmax.com',
        phone: '+1-555-0501',
        role: 'CIO',
        companyId: 'comp-5',
        department: 'IT',
        influence: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contact-11',
        name: 'Rachel Green',
        email: 'rachel.green@retailmax.com',
        phone: '+1-555-0502',
        role: 'VP Operations',
        companyId: 'comp-5',
        department: 'Operations',
        influence: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await this.saveContacts(sampleContacts);
  }

  // Company CRUD operations
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

  static async getCompany(id: string): Promise<Company | null> {
    const companies = await this.getAllCompanies();
    return companies.find(company => company.id === id) || null;
  }

  static async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const company: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const companies = await this.getAllCompanies();
    companies.push(company);
    await this.saveCompanies(companies);

    return company;
  }

  static async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    const companies = await this.getAllCompanies();
    const index = companies.findIndex(company => company.id === id);

    if (index === -1) return null;

    const updated = {
      ...companies[index],
      ...updates,
      updatedAt: new Date()
    };

    companies[index] = updated;
    await this.saveCompanies(companies);

    return updated;
  }

  static async deleteCompany(id: string): Promise<boolean> {
    const companies = await this.getAllCompanies();
    const filtered = companies.filter(company => company.id !== id);

    if (filtered.length === companies.length) return false;

    await this.saveCompanies(filtered);
    return true;
  }

  // Contact CRUD operations
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

  static async getContact(id: string): Promise<Contact | null> {
    const contacts = await this.getAllContacts();
    return contacts.find(contact => contact.id === id) || null;
  }

  static async getContactsByCompany(companyId: string): Promise<Contact[]> {
    const contacts = await this.getAllContacts();
    return contacts.filter(contact => contact.companyId === companyId);
  }

  static async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const contact: Contact = {
      ...contactData,
      id: `contact-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const contacts = await this.getAllContacts();
    contacts.push(contact);
    await this.saveContacts(contacts);

    return contact;
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const contacts = await this.getAllContacts();
    const index = contacts.findIndex(contact => contact.id === id);

    if (index === -1) return null;

    const updated = {
      ...contacts[index],
      ...updates,
      updatedAt: new Date()
    };

    contacts[index] = updated;
    await this.saveContacts(contacts);

    return updated;
  }

  static async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getAllContacts();
    const filtered = contacts.filter(contact => contact.id !== id);

    if (filtered.length === contacts.length) return false;

    await this.saveContacts(filtered);
    return true;
  }

  // Utility methods
  private static async saveCompanies(companies: Company[]): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.COMPANIES_KEY, JSON.stringify(companies));
    } catch (error) {
      console.error('Error saving companies:', error);
    }
  }

  private static async saveContacts(contacts: Contact[]): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }

  // Search and filtering
  static async searchCompanies(query: string): Promise<Company[]> {
    const companies = await this.getAllCompanies();
    const lowercaseQuery = query.toLowerCase();

    return companies.filter(company =>
      company.name.toLowerCase().includes(lowercaseQuery) ||
      company.industry.toLowerCase().includes(lowercaseQuery) ||
      company.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  static async searchContacts(query: string): Promise<Contact[]> {
    const contacts = await this.getAllContacts();
    const lowercaseQuery = query.toLowerCase();

    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.role.toLowerCase().includes(lowercaseQuery)
    );
  }

  static async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    const companies = await this.getAllCompanies();
    return companies.filter(company => company.industry === industry);
  }

  static async getContactsByRole(role: string): Promise<Contact[]> {
    const contacts = await this.getAllContacts();
    return contacts.filter(contact => contact.role.toLowerCase().includes(role.toLowerCase()));
  }
}