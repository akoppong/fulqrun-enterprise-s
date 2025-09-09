import { Opportunity, Contact, Company, MEDDPICC } from './types';

/**
 * Generate demo data for testing AI features
 */
export class DemoDataGenerator {
  
  static generateCompanies(): Company[] {
    return [
      {
        id: 'company-1',
        name: 'TechFlow Solutions',
        industry: 'Technology',
        size: '100-500',
        website: 'https://techflow.com',
        address: '123 Tech Street, San Francisco, CA',
        revenue: 750000000, // $750M - Strategic Partner range
        employees: 300,
        geography: 'North America',
        customFields: {
          brand_influence: 8,
          industry_expertise: 9
        },
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: 'company-2',
        name: 'DataCorp Industries',
        industry: 'Technology',
        size: '50-100',
        website: 'https://datacorp.com',
        address: '456 Data Ave, Austin, TX',
        revenue: 150000000, // $150M - Reference Customer range
        employees: 75,
        geography: 'North America',
        customFields: {
          industry_expertise: 8,
          reference_willingness: 'high'
        },
        createdAt: '2024-02-01',
        updatedAt: '2024-02-10'
      },
      {
        id: 'company-3',
        name: 'CloudFirst Enterprise',
        industry: 'Technology',
        size: '500-1000',
        website: 'https://cloudfirst.com',
        address: '789 Cloud Blvd, Seattle, WA',
        revenue: 1200000000, // $1.2B - Strategic Partner range
        employees: 750,
        geography: 'North America',
        customFields: {
          brand_influence: 9,
          market_leadership: 'high'
        },
        createdAt: '2024-01-25',
        updatedAt: '2024-02-05'
      },
      {
        id: 'company-4',
        name: 'FinanceStream LLC',
        industry: 'Financial Services',
        size: '200-500',
        website: 'https://financestream.com',
        address: '321 Finance Way, New York, NY',
        revenue: 400000000, // $400M - Reference Customer range
        employees: 350,
        geography: 'North America',
        customFields: {
          industry_expertise: 7,
          reference_willingness: 'medium'
        },
        createdAt: '2024-02-10',
        updatedAt: '2024-02-15'
      },
      {
        id: 'company-5',
        name: 'DefenseCore Systems',
        industry: 'Defense',
        size: '1000+',
        website: 'https://defensecore.gov',
        address: '555 Defense Plaza, Arlington, VA',
        revenue: 250000000, // $250M - Vector Control range
        employees: 1200,
        geography: 'North America',
        customFields: {
          outdoor_operations: 'high',
          health_safety_priority: 9,
          government_sector: true
        },
        createdAt: '2024-01-05',
        updatedAt: '2024-01-30'
      },
      {
        id: 'company-6',
        name: 'Hospitality Plus Group',
        industry: 'Hospitality',
        size: '200-500',
        website: 'https://hospitalityplus.com',
        address: '777 Resort Drive, Miami, FL',
        revenue: 85000000, // $85M - Vector Control range
        employees: 450,
        geography: 'North America',
        customFields: {
          outdoor_operations: 'medium',
          health_safety_priority: 8,
          guest_safety: 'critical'
        },
        createdAt: '2024-02-20',
        updatedAt: '2024-02-25'
      },
      {
        id: 'company-7',
        name: 'MedTech Innovations',
        industry: 'Healthcare',
        size: '100-200',
        website: 'https://medtech-innovations.com',
        address: '654 Health Plaza, Boston, MA',
        revenue: 120000000, // $120M - Reference Customer range
        employees: 180,
        geography: 'North America',
        customFields: {
          industry_expertise: 8,
          reference_willingness: 'high',
          innovation_focus: 'high'
        },
        createdAt: '2024-01-30',
        updatedAt: '2024-02-12'
      },
      {
        id: 'company-8',
        name: 'RetailMax Group',
        industry: 'Retail',
        size: '1000+',
        website: 'https://retailmax.com',
        address: '987 Retail Park, Chicago, IL',
        revenue: 850000000, // $850M - Strategic Partner range
        employees: 1500,
        geography: 'North America',
        customFields: {
          brand_influence: 9,
          market_reach: 'national'
        },
        createdAt: '2024-02-05',
        updatedAt: '2024-02-18'
      }
    ];
  }

  static generateContacts(): Contact[] {
    return [
      {
        id: 'contact-1',
        companyId: 'company-1',
        firstName: 'John',
        lastName: 'Anderson',
        email: 'john.anderson@techflow.com',
        phone: '+1-555-0101',
        title: 'Chief Technology Officer',
        role: 'decision-maker',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: 'contact-2',
        companyId: 'company-1',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@techflow.com',
        phone: '+1-555-0102',
        title: 'VP of Engineering',
        role: 'champion',
        createdAt: '2024-01-16',
        updatedAt: '2024-01-22'
      },
      {
        id: 'contact-3',
        companyId: 'company-2',
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@datacorp.com',
        phone: '+1-555-0201',
        title: 'Chief Data Officer',
        role: 'decision-maker',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-10'
      },
      {
        id: 'contact-4',
        companyId: 'company-3',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@cloudfirst.com',
        phone: '+1-555-0301',
        title: 'Head of Infrastructure',
        role: 'influencer',
        createdAt: '2024-01-25',
        updatedAt: '2024-02-05'
      },
      {
        id: 'contact-5',
        companyId: 'company-4',
        firstName: 'Michael',
        lastName: 'Thompson',
        email: 'michael.thompson@financestream.com',
        phone: '+1-555-0401',
        title: 'Chief Financial Officer',
        role: 'decision-maker',
        createdAt: '2024-02-10',
        updatedAt: '2024-02-15'
      },
      {
        id: 'contact-6',
        companyId: 'company-5',
        firstName: 'Lisa',
        lastName: 'Wang',
        email: 'lisa.wang@medtech-innovations.com',
        phone: '+1-555-0501',
        title: 'VP of Product',
        role: 'champion',
        createdAt: '2024-01-30',
        updatedAt: '2024-02-12'
      },
      {
        id: 'contact-7',
        companyId: 'company-6',
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'robert.johnson@retailmax.com',
        phone: '+1-555-0601',
        title: 'Chief Operating Officer',
        role: 'decision-maker',
        createdAt: '2024-02-05',
        updatedAt: '2024-02-18'
      }
    ];
  }

  static generateMEDDPICCData(stage: string): MEDDPICC {
    const baseData = {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      lastAiAnalysis: new Date().toISOString()
    };

    switch (stage) {
      case 'prospect':
        return {
          ...baseData,
          metrics: 'Reduce infrastructure costs by 30%, improve deployment speed by 50%',
          economicBuyer: 'CTO John Anderson has budget authority for $500K+ technology investments',
          decisionCriteria: 'Cost savings, security, scalability, ease of integration with existing systems',
          decisionProcess: 'Technical evaluation → Security review → Budget approval → Procurement',
          paperProcess: 'Standard vendor agreement, security compliance review, 30-day payment terms',
          implicatePain: 'Current system causing 2-3 hours daily maintenance overhead, security vulnerabilities',
          champion: 'Sarah Mitchell (VP Engineering) actively advocating for solution',
          score: 75,
          aiHints: {
            metricsHints: ['Quantify current maintenance costs', 'Measure security incident frequency'],
            championHints: ['Strengthen relationship with Sarah', 'Identify additional supporters'],
            riskFactors: ['Budget approval timeline unclear', 'Competing priorities this quarter']
          }
        };
      case 'engage':
        return {
          ...baseData,
          metrics: 'Projected $2M annual savings, 75% faster product deployment cycles',
          economicBuyer: 'CFO Michael Thompson confirmed as final approver, has allocated $1.2M budget',
          decisionCriteria: 'ROI > 200% within 12 months, enterprise security standards, 24/7 support',
          decisionProcess: 'POC completion → Executive review → Legal review → Contract signing',
          paperProcess: 'MSA negotiation in progress, procurement team engaged, Q2 budget approved',
          implicatePain: 'Lost $500K revenue due to system downtime, competitive disadvantage growing',
          champion: 'Multiple champions: CTO, VP Engineering, Lead DevOps Engineer',
          score: 85,
          aiHints: {
            metricsHints: ['Document POC results thoroughly', 'Calculate total cost of ownership'],
            championHints: ['Champions are well-positioned', 'Consider executive sponsor'],
            riskFactors: ['Legal review may extend timeline', 'New vendor evaluation policy']
          }
        };
      case 'acquire':
        return {
          ...baseData,
          metrics: 'Business case approved: $2.5M savings, 60% efficiency gain, 99.9% uptime SLA',
          economicBuyer: 'Board-level approval secured, CEO signed off on investment',
          decisionCriteria: 'All technical and financial criteria met, reference calls completed',
          decisionProcess: 'Final contract review → Implementation planning → Go-live schedule',
          paperProcess: 'Contract 95% complete, waiting on final MSA terms, purchase order ready',
          implicatePain: 'Critical business impact: $1M/month risk if not implemented before Q4',
          champion: 'Executive sponsor assigned, dedicated project team formed',
          score: 92,
          aiHints: {
            metricsHints: ['All metrics validated and documented'],
            championHints: ['Strong champion network established'],
            riskFactors: ['Implementation timeline aggressive', 'Change management requirements']
          }
        };
      default:
        return {
          ...baseData,
          metrics: 'Post-implementation: Achieved 35% cost reduction, 80% faster deployments',
          economicBuyer: 'Relationship established with procurement for expansion opportunities',
          decisionCriteria: 'Success criteria met, exploring additional use cases',
          decisionProcess: 'Quarterly review → Expansion planning → Additional budget approval',
          paperProcess: 'Renewal terms agreed, expansion SOW in development',
          implicatePain: 'Growing needs: additional teams want to adopt platform',
          champion: 'Champions now advocates for vendor, providing references',
          score: 88,
          aiHints: {
            metricsHints: ['Document success metrics for expansion'],
            championHints: ['Leverage success for referrals'],
            riskFactors: ['Budget constraints for expansion', 'Competing vendor approaches']
          }
        };
    }
  }

  static generateOpportunities(contacts: Contact[]): Opportunity[] {
    const opportunities: Opportunity[] = [
      {
        id: 'opp-1',
        companyId: 'company-1',
        contactId: 'contact-1',
        title: 'Enterprise Cloud Migration Platform',
        description: 'Implementation of comprehensive cloud migration and management platform',
        value: 750000,
        stage: 'engage',
        probability: 75,
        expectedCloseDate: '2024-05-15',
        ownerId: 'user-1',
        meddpicc: this.generateMEDDPICCData('engage'),
        createdAt: '2024-01-15',
        updatedAt: '2024-02-20'
      },
      {
        id: 'opp-2',
        companyId: 'company-2',
        contactId: 'contact-3',
        title: 'Advanced Analytics Platform',
        description: 'Real-time data analytics and business intelligence solution',
        value: 450000,
        stage: 'prospect',
        probability: 35,
        expectedCloseDate: '2024-06-30',
        ownerId: 'user-2',
        meddpicc: this.generateMEDDPICCData('prospect'),
        createdAt: '2024-02-01',
        updatedAt: '2024-02-18'
      },
      {
        id: 'opp-3',
        companyId: 'company-3',
        contactId: 'contact-4',
        title: 'Multi-Cloud Security Suite',
        description: 'Enterprise security management across multiple cloud providers',
        value: 1200000,
        stage: 'acquire',
        probability: 90,
        expectedCloseDate: '2024-04-10',
        ownerId: 'user-1',
        meddpicc: this.generateMEDDPICCData('acquire'),
        createdAt: '2024-01-25',
        updatedAt: '2024-02-22'
      },
      {
        id: 'opp-4',
        companyId: 'company-4',
        contactId: 'contact-5',
        title: 'Financial Compliance Automation',
        description: 'Automated compliance reporting and risk management system',
        value: 320000,
        stage: 'engage',
        probability: 65,
        expectedCloseDate: '2024-07-20',
        ownerId: 'user-3',
        meddpicc: this.generateMEDDPICCData('engage'),
        createdAt: '2024-02-10',
        updatedAt: '2024-02-20'
      },
      {
        id: 'opp-5',
        companyId: 'company-5',
        contactId: 'contact-6',
        title: 'Healthcare Data Platform',
        description: 'HIPAA-compliant patient data management and analytics platform',
        value: 890000,
        stage: 'prospect',
        probability: 25,
        expectedCloseDate: '2024-08-15',
        ownerId: 'user-2',
        meddpicc: this.generateMEDDPICCData('prospect'),
        createdAt: '2024-01-30',
        updatedAt: '2024-02-15'
      },
      {
        id: 'opp-6',
        companyId: 'company-6',
        contactId: 'contact-7',
        title: 'Retail Operations Optimization',
        description: 'AI-powered retail inventory and supply chain optimization',
        value: 1500000,
        stage: 'keep',
        probability: 95,
        expectedCloseDate: '2024-03-30',
        ownerId: 'user-1',
        meddpicc: this.generateMEDDPICCData('keep'),
        createdAt: '2024-02-05',
        updatedAt: '2024-02-25'
      }
    ];

    return opportunities;
  }

  static async initializeDemoData() {
    const companies = this.generateCompanies();
    const contacts = this.generateContacts();
    const opportunities = this.generateOpportunities(contacts);

    return {
      companies,
      contacts,
      opportunities
    };
  }
}