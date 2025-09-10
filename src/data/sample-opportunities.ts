import { Opportunity, Company, Contact } from '@/lib/types';

export const sampleCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Technology',
    size: 'Enterprise (1000+ employees)',
    website: 'https://acme.com',
    address: '123 Tech Plaza, San Francisco, CA 94105',
    revenue: 50000000,
    employees: 1200,
    geography: 'North America',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Global Manufacturing Inc.',
    industry: 'Manufacturing',
    size: 'Large (500-999 employees)',
    website: 'https://globalmanufacturing.com',
    address: '456 Industrial Blvd, Detroit, MI 48201',
    revenue: 25000000,
    employees: 750,
    geography: 'North America',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Healthcare Solutions Ltd.',
    industry: 'Healthcare',
    size: 'Medium (100-499 employees)',
    website: 'https://healthcaresolutions.com',
    address: '789 Medical Center Dr, Boston, MA 02101',
    revenue: 15000000,
    employees: 350,
    geography: 'North America',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
  },
];

export const sampleContacts: Contact[] = [
  {
    id: '1',
    companyId: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@acme.com',
    phone: '+1 (555) 123-4567',
    title: 'Chief Technology Officer',
    role: 'decision-maker',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    companyId: '1',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@acme.com',
    phone: '+1 (555) 234-5678',
    title: 'VP of Engineering',
    role: 'champion',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '3',
    companyId: '2',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    email: 'emily.rodriguez@globalmanufacturing.com',
    phone: '+1 (555) 345-6789',
    title: 'Operations Director',
    role: 'influencer',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '4',
    companyId: '3',
    firstName: 'David',
    lastName: 'Thompson',
    email: 'david.thompson@healthcaresolutions.com',
    phone: '+1 (555) 456-7890',
    title: 'Chief Information Officer',
    role: 'decision-maker',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
  },
];

export const sampleOpportunities: Opportunity[] = [
  {
    id: '1',
    companyId: '1',
    contactId: '1',
    title: 'Enterprise Software Implementation',
    description: 'Implementation of comprehensive CRM and analytics platform for Acme Corporation. This project involves migrating from legacy systems and training 200+ users across multiple departments.',
    value: 450000,
    stage: 'engage',
    probability: 75,
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    ownerId: 'user-1',
    priority: 'high',
    industry: 'technology',
    leadSource: 'referral',
    tags: ['enterprise', 'crm', 'migration'],
    meddpicc: {
      metrics: 'Expecting 30% improvement in sales productivity and 25% reduction in customer onboarding time. ROI projected at $1.2M annually.',
      economicBuyer: 'Sarah Johnson (CTO) has budget authority up to $500K. Final approval over $400K requires board consent.',
      decisionCriteria: 'Technical compatibility, scalability, vendor stability, total cost of ownership, implementation timeline (must be complete by Q3).',
      decisionProcess: 'Technical evaluation (completed), vendor presentations (in progress), reference calls, board approval for final decision.',
      paperProcess: 'Legal review, security assessment, procurement approval, board resolution for amounts over $400K.',
      implicatePain: 'Current system crashes frequently, manual processes waste 15 hours/week per user, customer complaints about response times.',
      champion: 'Michael Chen (VP Engineering) is driving the initiative internally and has been advocating for our solution.',
      score: 78
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
    aiInsights: {
      riskScore: 25,
      nextBestActions: [
        'Schedule technical deep-dive session with Michael Chen to address remaining architecture questions',
        'Provide detailed implementation timeline with key milestones to address board concerns',
        'Connect with existing customer reference in similar industry for peer-to-peer validation call'
      ],
      confidenceLevel: 'high',
      competitorAnalysis: 'Competing against Salesforce and Microsoft Dynamics. Our advantage is faster implementation and better customization capabilities.',
      lastAiUpdate: new Date('2024-01-25').toISOString()
    }
  },
  {
    id: '2',
    companyId: '2',
    contactId: '3',
    title: 'Manufacturing Automation System',
    description: 'Digital transformation project to modernize production line monitoring and quality control systems.',
    value: 750000,
    stage: 'acquire',
    probability: 85,
    expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
    ownerId: 'user-1',
    priority: 'critical',
    industry: 'manufacturing',
    leadSource: 'trade show',
    tags: ['automation', 'quality-control', 'production'],
    meddpicc: {
      metrics: 'Target 40% reduction in downtime, 20% increase in production efficiency. Expected payback in 18 months.',
      economicBuyer: 'CFO James Wilson has been identified as final decision maker. Budget approved in current fiscal year.',
      decisionCriteria: 'Integration with existing MES, compliance with industry standards, vendor support capabilities, training requirements.',
      decisionProcess: 'Technical validation complete, contract negotiation in progress, implementation planning underway.',
      paperProcess: 'Legal terms 90% agreed, IT security approval complete, final executive sign-off pending.',
      implicatePain: 'Production line issues cost $50K per hour in downtime. Quality issues resulted in $2M recall last year.',
      champion: 'Emily Rodriguez is project sponsor and has executive support. Strong advocate for our solution.',
      score: 85
    },
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-28').toISOString(),
    aiInsights: {
      riskScore: 15,
      nextBestActions: [
        'Expedite contract finalization to meet implementation deadline',
        'Prepare detailed project kickoff presentation for executive team',
        'Confirm training schedule and resource allocation'
      ],
      confidenceLevel: 'high',
      predictedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // AI predicts earlier close
      lastAiUpdate: new Date('2024-01-28').toISOString()
    }
  },
  {
    id: '3',
    companyId: '3',
    contactId: '4',
    title: 'Healthcare Data Analytics Platform',
    description: 'Implementation of patient data analytics and reporting platform to improve clinical outcomes and operational efficiency.',
    value: 280000,
    stage: 'prospect',
    probability: 35,
    expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    ownerId: 'user-1',
    priority: 'medium',
    industry: 'healthcare',
    leadSource: 'website',
    tags: ['healthcare', 'analytics', 'compliance'],
    meddpicc: {
      metrics: 'Targeting 15% improvement in patient outcomes, 25% reduction in administrative costs. Compliance benefits difficult to quantify.',
      economicBuyer: 'David Thompson (CIO) has budget authority. CEO approval required for strategic initiatives over $250K.',
      decisionCriteria: 'HIPAA compliance, integration capabilities, reporting flexibility, vendor experience in healthcare.',
      decisionProcess: 'Initial evaluation phase, requirements gathering in progress, RFP process to be launched in 30 days.',
      paperProcess: 'HIPAA compliance review, vendor security assessment, board approval process for strategic purchases.',
      implicatePain: 'Manual reporting takes 40 hours/month, regulatory compliance challenges, limited visibility into patient trends.',
      champion: 'Data Analytics Manager Jennifer Liu is supportive but lacks executive influence. Need stronger champion.',
      score: 42
    },
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-26').toISOString(),
    aiInsights: {
      riskScore: 60,
      nextBestActions: [
        'Identify and engage with stronger internal champion at executive level',
        'Develop compelling ROI business case with specific compliance benefits',
        'Request introduction to CEO or other C-level executives through David Thompson'
      ],
      confidenceLevel: 'medium',
      competitorAnalysis: 'Large field of competitors including Epic, Cerner, and smaller specialized vendors. Differentiation needs to be clearer.',
      lastAiUpdate: new Date('2024-01-26').toISOString()
    }
  },
];

export const initializeSampleData = async () => {
  // Initialize sample data and trigger OpportunityService initialization
  if (typeof window !== 'undefined') {
    const { OpportunityService } = await import('../lib/opportunity-service');
    await OpportunityService.initializeSampleData();
  }
  
  // This function can be used to populate sample data for demonstration
  return {
    companies: sampleCompanies,
    contacts: sampleContacts,
    opportunities: sampleOpportunities
  };
};