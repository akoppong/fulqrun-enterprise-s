import { Opportunity, Company, Contact } from '@/lib/types';

export const sampleCompanies: Company[] = [
  {
    id: 'test-comp-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    size: 'Enterprise (1000+ employees)',
    revenue: 750000000, // $750M
    address: 'San Francisco, CA',
    website: 'https://techcorp.com',
    employees: 2500,
    geography: 'North America',
    customFields: {
      description: 'Leading technology company specializing in enterprise software solutions',
      founded: 1995,
      status: 'active'
    },
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-comp-2',
    name: 'Global Manufacturing Co',
    industry: 'Manufacturing',
    size: 'Large (500-999 employees)',
    revenue: 300000000, // $300M
    address: 'Detroit, MI',
    website: 'https://globalmanufacturing.com',
    employees: 750,
    geography: 'North America',
    customFields: {
      description: 'International manufacturing company with operations across North America',
      founded: 1987,
      status: 'active'
    },
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-comp-3',
    name: 'Healthcare Innovations Inc',
    industry: 'Healthcare',
    size: 'Medium (100-499 employees)',
    revenue: 85000000, // $85M
    address: 'Boston, MA',
    website: 'https://healthinnovations.com',
    employees: 320,
    geography: 'North America',
    customFields: {
      description: 'Innovative healthcare technology solutions for hospitals and clinics',
      founded: 2010,
      status: 'active'
    },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-comp-4',
    name: 'Financial Services Corp',
    industry: 'Financial Services',
    size: 'Large (500-999 employees)',
    revenue: 450000000, // $450M
    address: 'New York, NY',
    website: 'https://finservicescorp.com',
    employees: 1200,
    geography: 'North America',
    customFields: {
      description: 'Regional financial services provider offering banking and investment solutions',
      founded: 1985,
      status: 'active'
    },
    createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-comp-5',
    name: 'Retail Solutions Ltd',
    industry: 'Retail',
    size: 'Small (1-99 employees)',
    revenue: 25000000, // $25M
    address: 'Austin, TX',
    website: 'https://retailsolutions.com',
    employees: 85,
    geography: 'North America',
    customFields: {
      description: 'E-commerce and retail technology solutions for small and medium businesses',
      founded: 2015,
      status: 'active'
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const sampleContacts: Contact[] = [
  {
    id: 'test-contact-1',
    companyId: 'test-comp-1',
    firstName: 'Michael',
    lastName: 'Johnson',
    title: 'Chief Technology Officer',
    email: 'michael.johnson@techcorp.com',
    phone: '+1 (555) 123-4567',
    role: 'decision-maker',
    createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-contact-2',
    companyId: 'test-comp-1',
    firstName: 'Jennifer',
    lastName: 'Smith',
    title: 'VP of Engineering',
    email: 'jennifer.smith@techcorp.com',
    phone: '+1 (555) 123-4568',
    role: 'influencer',
    createdAt: new Date(Date.now() - 280 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-contact-3',
    companyId: 'test-comp-2',
    firstName: 'Sarah',
    lastName: 'Davis',
    title: 'VP of Operations',
    email: 'sarah.davis@globalmanufacturing.com',
    phone: '+1 (555) 987-6543',
    role: 'influencer',
    createdAt: new Date(Date.now() - 260 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-contact-4',
    companyId: 'test-comp-2',
    firstName: 'Robert',
    lastName: 'Wilson',
    title: 'CEO',
    email: 'robert.wilson@globalmanufacturing.com',
    phone: '+1 (555) 987-6544',
    role: 'champion',
    createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-contact-5',
    companyId: 'test-comp-3',
    firstName: 'Emily',
    lastName: 'Brown',
    title: 'Chief Medical Officer',
    email: 'emily.brown@healthinnovations.com',
    phone: '+1 (555) 234-5678',
    role: 'champion',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-contact-6',
    companyId: 'test-comp-4',
    firstName: 'David',
    lastName: 'Martinez',
    title: 'Chief Financial Officer',
    email: 'david.martinez@finservicescorp.com',
    phone: '+1 (555) 345-6789',
    role: 'decision-maker',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'test-contact-7',
    companyId: 'test-comp-5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    title: 'CTO',
    email: 'lisa.anderson@retailsolutions.com',
    phone: '+1 (555) 456-7890',
    role: 'champion',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const sampleOpportunities: Opportunity[] = [
  {
    id: 'enhanced-test-opp-1',
    title: 'Enterprise Digital Transformation - Global Scale',
    description: 'Comprehensive digital transformation initiative spanning 15 countries with over 12,500 employees. This Fortune 500 manufacturing company seeks to modernize their entire technology infrastructure including ERP systems, IoT sensor networks for predictive maintenance, advanced analytics platforms, and comprehensive employee training programs. The project includes migrating from legacy mainframe systems to cloud-native microservices architecture, implementing real-time data analytics across all manufacturing facilities, and establishing a unified global data governance framework.',
    value: 3500000,
    stage: 'engage',
    probability: 88,
    priority: 'critical',
    ownerId: 'user-1',
    companyId: 'test-comp-1',
    contactId: 'test-contact-1',
    expectedCloseDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    industry: 'Manufacturing',
    leadSource: 'referral',
    tags: ['enterprise', 'digital-transformation', 'high-value', 'manufacturing'],
    meddpicc: {
      metrics: 'ROI: 220% over 3 years with break-even at 18 months. Cost savings: $18M annually through operational efficiency gains. Productivity increase: 42% across all manufacturing lines. Quality improvement: 35% reduction in defects. Compliance automation: 95% reduction in manual compliance reporting. Employee satisfaction: +28 NPS improvement through modern tools.',
      economicBuyer: 'CEO Maria Rodriguez - Ultimate decision maker for strategic technology investments exceeding $1M. Reports directly to board of directors. Has full P&L responsibility and authority to approve multi-year strategic initiatives. Strong track record of technology-driven transformations in previous role.',
      decisionCriteria: 'Must demonstrate scalability across 15 countries with different regulatory requirements. Security compliance mandatory (ISO 27001, SOX, GDPR, local data residency laws). Integration capabilities with existing SAP, Oracle, and custom legacy systems. Vendor financial stability and global support capabilities in all operational regions. Implementation timeline must not disrupt Q4 production schedules.',
      decisionProcess: 'Phase 1: Technical proof of concept and pilot program (Q1 2024). Phase 2: Business case validation and ROI modeling (Q2 2024). Phase 3: Board presentation and final approval (Q3 2024). Phase 4: Contract negotiation and implementation planning (Q4 2024). Go-live planned for Q1 2025 with full rollout by Q4 2025.',
      paperProcess: 'Legal review required in 5 jurisdictions (US, EU, UK, Canada, Mexico). Procurement compliance through established vendor assessment framework. Security audit and penetration testing required. Vendor risk assessment including financial stability analysis. Contract negotiation through corporate legal team with local counsel in each region.',
      implicatePain: 'Current legacy systems causing $12M annual losses through downtime and manual processes. Regulatory compliance gaps creating $2M annual risk exposure. Competitive disadvantage: major competitors have 40% faster time-to-market. Manual processes causing 45% efficiency loss in operations. Employee retention issues due to outdated technology - 23% higher turnover in technical roles.',
      champion: 'CTO James Chen - Strong advocate with direct influence on CEO and board. Budget owner for all technology initiatives over $500K. Successfully championed three previous digital transformation projects. Highly respected internally for technical expertise and business acumen. Committed to project success and willing to stake reputation on outcomes.',
      score: 94
    }
  },
  {
    id: 'enhanced-test-opp-2',
    title: 'AI-Powered Customer Intelligence Platform - Financial Services',
    description: 'Implementation of advanced machine learning and artificial intelligence platform for a regional banking institution serving 2.5 million customers. The platform includes real-time fraud detection using behavioral analytics, personalized product recommendation engines, predictive customer lifetime value modeling, automated underwriting for loans and credit products, and comprehensive customer sentiment analysis. The solution integrates with existing core banking systems and provides explainable AI capabilities for regulatory compliance.',
    value: 1850000,
    stage: 'prospect',
    probability: 72,
    priority: 'high',
    ownerId: 'user-1',
    companyId: 'test-comp-2',
    contactId: 'test-contact-2',
    expectedCloseDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    industry: 'Financial Services',
    leadSource: 'inbound',
    tags: ['ai', 'financial-services', 'automation', 'compliance'],
    meddpicc: {
      metrics: 'Fraud reduction: 55% decrease in false positives and 40% improvement in fraud detection accuracy. Customer satisfaction: +32 NPS improvement through personalized experiences. Revenue increase: $75M annually through improved cross-sell (28% increase) and retention (15% improvement). Operational efficiency: 60% reduction in manual underwriting time and 45% improvement in loan processing speed.',
      economicBuyer: 'CFO David Kim - Final authority on technology investments with ROI accountability to board. Manages $500M annual budget with specific mandate to improve operational efficiency and revenue growth. Previous experience with successful AI implementations at two other financial institutions. Strong advocate for data-driven decision making.',
      decisionCriteria: 'Regulatory compliance is non-negotiable (GDPR, PCI-DSS, Fair Credit Reporting Act, Equal Credit Opportunity Act). Explainable AI capabilities required for audit purposes. Real-time processing capability for fraud detection (sub-100ms response time). Seamless integration with Fiserv core banking platform and existing data warehouse. Model interpretability for risk management and regulatory reporting.',
      decisionProcess: 'Current phase: Pilot program with 10,000 customers for fraud detection module. Next: Risk assessment and model validation by internal data science team. Then: Regulatory review and approval from compliance committee. Finally: Executive committee presentation and budget approval. Implementation to begin within 6 months of approval.',
      paperProcess: 'Regulatory filing with state banking commission required. Data governance review and approval from chief data officer. Vendor security assessment and SOC 2 Type II audit review. Contract terms negotiation including data processing agreements and liability caps. Board risk committee approval for AI implementation.',
      implicatePain: 'Current fraud detection system has 35% false positive rate costing $15M annually in customer service and manual review costs. Missed cross-sell opportunities worth $40M annually due to lack of personalization. Manual underwriting process creates 5-day average loan approval time versus 24-hour competitor standard. Customer complaints about irrelevant product offers damaging brand reputation and NPS scores.',
      champion: 'VP Data Science Lisa Park - Project sponsor with strong technical background and business influence. Direct report to CFO with budget authority for data initiatives. Successfully led previous analytics projects that delivered measurable ROI. Strong relationships with IT, risk management, and business units. Committed to proving AI value across organization.',
      score: 83
    }
  },
  {
    id: 'enhanced-test-opp-3',
    title: 'Cloud-Native Infrastructure Modernization - Healthcare System',
    description: 'Complete infrastructure modernization for a regional healthcare system serving 1.2 million patients across 25 facilities. The project involves migrating from on-premises data centers to HIPAA-compliant cloud infrastructure, implementing containerized microservices architecture, establishing robust disaster recovery capabilities, and creating a unified patient data platform. The solution includes advanced security measures, real-time monitoring, and automated compliance reporting to meet healthcare regulatory requirements.',
    value: 2200000,
    stage: 'acquire',
    probability: 65,
    priority: 'high',
    ownerId: 'user-1',
    companyId: 'test-comp-1',
    contactId: 'test-contact-1',
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    meddpicc: {
      metrics: 'Infrastructure cost reduction: 35% annual savings ($8M) through cloud optimization. System availability: 99.9% uptime SLA with 50% improvement in disaster recovery time. Compliance automation: 90% reduction in manual audit preparation time. Patient data access: 75% faster query response times improving clinical decision-making. Developer productivity: 60% faster application deployment through DevOps automation.',
      economicBuyer: 'Chief Financial Officer Jennifer Martinez - Responsible for $2.8B annual budget and cost optimization initiatives. Board mandate to reduce IT infrastructure costs while improving patient care capabilities. Authority to approve capital expenditures up to $5M without additional board approval. Strong background in healthcare finance and technology ROI analysis.',
      decisionCriteria: 'HIPAA compliance is absolutely critical with zero tolerance for data breaches. High availability requirements (99.9% uptime) for critical patient care systems. Scalability to support 50% patient volume growth over 5 years. Integration with existing Epic EHR system and medical device networks. Disaster recovery capabilities with 4-hour RTO and 15-minute RPO for critical systems.',
      decisionProcess: 'Currently in final vendor selection phase. Technical evaluation completed with successful proof of concept. Security and compliance review by CISO and legal teams in progress. Final presentation to executive committee scheduled for next month. Implementation must begin before end of fiscal year to capture budget allocation.',
      paperProcess: 'Business Associate Agreement (BAA) for HIPAA compliance required. Legal review of cloud service agreements and data processing terms. Risk assessment by internal audit team. Compliance validation by healthcare regulatory consultant. Insurance review for cyber liability coverage adjustments.',
      implicatePain: 'Legacy infrastructure causing 15+ hours monthly downtime affecting patient care and revenue ($2M annual impact). Compliance reporting requires 200+ manual hours monthly creating audit risk exposure. Limited disaster recovery capabilities create significant business continuity risk. Aging hardware requires $5M annual maintenance costs. Inability to scale during patient volume surges causing capacity constraints.',
      champion: 'Chief Information Officer Robert Thompson - Strong technology leader with successful cloud migration experience at previous healthcare organization. Direct relationship with CEO and board. Budget authority for infrastructure initiatives. Passionate advocate for modernization and willing to champion project internally. Track record of successful large-scale technology implementations.',
      score: 78
    }
  }
];

/**
 * Initialize sample data for opportunities, companies, and contacts
 * This function sets up the storage with sample data if it doesn't already exist
 */
export async function initializeSampleData(): Promise<{
  opportunities: Opportunity[];
  companies: Company[];
  contacts: Contact[];
}> {
  if (typeof window === 'undefined') {
    return {
      opportunities: [],
      companies: [],
      contacts: []
    };
  }

  try {
    // Check if data already exists
    const existingOpportunities = localStorage.getItem('opportunities');
    const existingCompanies = localStorage.getItem('companies');
    const existingContacts = localStorage.getItem('contacts');

    // Initialize opportunities if they don't exist
    if (!existingOpportunities) {
      localStorage.setItem('opportunities', JSON.stringify(sampleOpportunities));
    }

    // Initialize companies if they don't exist
    if (!existingCompanies) {
      localStorage.setItem('companies', JSON.stringify(sampleCompanies));
    }

    // Initialize contacts if they don't exist
    if (!existingContacts) {
      localStorage.setItem('contacts', JSON.stringify(sampleContacts));
    }

    return {
      opportunities: sampleOpportunities,
      companies: sampleCompanies,
      contacts: sampleContacts
    };
  } catch (error) {
    console.error('Error initializing sample data:', error);
    return {
      opportunities: [],
      companies: [],
      contacts: []
    };
  }
}

// Export alias for backwards compatibility
export const enhancedSampleOpportunities = sampleOpportunities;