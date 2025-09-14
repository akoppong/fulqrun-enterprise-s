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
        address: '123 Tech Street, San Francisco, CA',
        revenue: 50000000,
        employees: 500,
        geography: 'North America',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-2',
        name: 'GrowthCo Inc',
        industry: 'Marketing',
        size: 'Medium',
        website: 'https://growthco.com',
        address: '456 Growth Ave, Austin, TX',
        revenue: 15000000,
        employees: 150,
        geography: 'North America',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-3',
        name: 'MedDevice Corp',
        industry: 'Healthcare',
        size: 'Large',
        website: 'https://meddevice.com',
        address: '789 Medical Dr, Boston, MA',
        revenue: 75000000,
        employees: 800,
        geography: 'North America',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-4',
        name: 'EcoEnergy Ltd',
        industry: 'Energy',
        size: 'Medium',
        website: 'https://ecoenergy.com',
        address: '321 Green Way, Denver, CO',
        revenue: 25000000,
        employees: 250,
        geography: 'North America',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'comp-5',
        name: 'RetailMax Systems',
        industry: 'Retail',
        size: 'Large',
        website: 'https://retailmax.com',
        address: '654 Commerce St, Chicago, IL',
        revenue: 100000000,
        employees: 1200,
        geography: 'North America',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        companyId: 'comp-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1-555-0101',
        title: 'CTO',
        role: 'decision-maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-2',
        companyId: 'comp-1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1-555-0102',
        title: 'Procurement Manager',
        role: 'influencer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-3',
        companyId: 'comp-1',
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@techcorp.com',
        phone: '+1-555-0103',
        title: 'VP Engineering',
        role: 'champion',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // GrowthCo Inc contacts
      {
        id: 'contact-4',
        companyId: 'comp-2',
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@growthco.com',
        phone: '+1-555-0201',
        title: 'Marketing Director',
        role: 'champion',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-5',
        companyId: 'comp-2',
        firstName: 'Lisa',
        lastName: 'Wilson',
        email: 'lisa.wilson@growthco.com',
        phone: '+1-555-0202',
        title: 'COO',
        role: 'decision-maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // MedDevice Corp contacts
      {
        id: 'contact-6',
        companyId: 'comp-3',
        firstName: 'Robert',
        lastName: 'Taylor',
        email: 'robert.taylor@meddevice.com',
        phone: '+1-555-0301',
        title: 'Chief Medical Officer',
        role: 'decision-maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-7',
        companyId: 'comp-3',
        firstName: 'Jennifer',
        lastName: 'Lee',
        email: 'jennifer.lee@meddevice.com',
        phone: '+1-555-0302',
        title: 'VP Regulatory Affairs',
        role: 'influencer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // EcoEnergy Ltd contacts
      {
        id: 'contact-8',
        companyId: 'comp-4',
        firstName: 'Mark',
        lastName: 'Rodriguez',
        email: 'mark.rodriguez@ecoenergy.com',
        phone: '+1-555-0401',
        title: 'CEO',
        role: 'decision-maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-9',
        companyId: 'comp-4',
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.brown@ecoenergy.com',
        phone: '+1-555-0402',
        title: 'CFO',
        role: 'decision-maker',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },

      // RetailMax Systems contacts
      {
        id: 'contact-10',
        companyId: 'comp-5',
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex.thompson@retailmax.com',
        phone: '+1-555-0501',
        title: 'CIO',
        role: 'champion',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'contact-11',
        companyId: 'comp-5',
        firstName: 'Rachel',
        lastName: 'Green',
        email: 'rachel.green@retailmax.com',
        phone: '+1-555-0502',
        title: 'VP Operations',
        role: 'influencer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      updatedAt: new Date().toISOString()
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
      updatedAt: new Date().toISOString()
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