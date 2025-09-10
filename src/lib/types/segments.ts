/**
 * Customer segmentation and targeting types
 */

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  characteristics: SegmentCharacteristics;
  strategy: SegmentStrategy;
  metrics: SegmentMetrics;
  isActive: boolean;
  color: string;
  icon: string;
  createdBy: string;
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
}

export interface SegmentCriteria {
  revenue: {
    min?: number;
    max?: number;
  };
  industry: string[];
  companySize: {
    min?: number;
    max?: number;
  };
  geography: string[];
  businessModel: string[];
  customFields: SegmentCustomField[];
}

export interface SegmentCustomField {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  weight: number; // 1-10 for scoring
}

export interface SegmentCharacteristics {
  avgDealSize: number;
  avgSalesCycle: number; // days
  decisionMakers: string[];
  commonPainPoints: string[];
  buyingProcess: string;
  competitiveThreats: string[];
  successFactors: string[];
  churnRisk: 'low' | 'medium' | 'high';
}

export interface SegmentStrategy {
  messaging: string[];
  channels: string[];
  touchpoints: number;
  cadence: string; // e.g., "weekly", "bi-weekly"
  resources: string[];
  playbooks: string[];
  contentLibrary: SegmentContent[];
  kpis: string[];
}

export interface SegmentContent {
  id: string;
  title: string;
  type: 'presentation' | 'case_study' | 'whitepaper' | 'demo' | 'proposal_template' | 'email_template';
  url?: string;
  description: string;
  lastUpdated: string; // ISO date string for reliable serialization
  effectiveness: number; // 1-10 rating
}

export interface SegmentMetrics {
  totalOpportunities: number;
  totalValue: number;
  conversionRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
  customerLifetimeValue: number;
  acquisitionCost: number;
  retention: number;
  expansion: number;
  nps: number;
  lastCalculated: string; // ISO date string for reliable serialization
}

export interface SegmentAssignment {
  id: string;
  companyId: string;
  segmentId: string;
  confidence: number; // 0-100
  assignedBy: 'manual' | 'automated' | 'ml_model';
  assignedAt: string; // ISO date string for reliable serialization
  assignedByUser?: string;
  reason?: string;
  previousSegments: string[];
}

export interface SegmentAnalytics {
  segmentId: string;
  period: string;
  performance: {
    revenue: number;
    deals: number;
    conversionRate: number;
    trend: 'up' | 'down' | 'stable';
  };
  benchmarking: {
    industryAverage: number;
    topPerformer: number;
    ranking: number;
  };
  insights: SegmentInsight[];
  recommendations: SegmentRecommendation[];
  generatedAt: string; // ISO date string for reliable serialization
}

export interface SegmentInsight {
  type: 'performance' | 'opportunity' | 'risk' | 'trend';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: number; // 0-100
  actionRequired: boolean;
}

export interface SegmentRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'strategy' | 'messaging' | 'process' | 'resources' | 'targeting';
  title: string;
  description: string;
  estimatedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
}

// Predefined customer segment templates
export const CUSTOMER_SEGMENT_TEMPLATES: Omit<CustomerSegment, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Strategic Partner',
    description: 'Large corporate clients with influential brands ($500M - $2B revenue)',
    criteria: {
      revenue: { min: 500000000, max: 2000000000 },
      industry: ['Technology', 'Financial Services', 'Healthcare', 'Manufacturing', 'Retail'],
      companySize: { min: 1000 },
      geography: ['North America', 'Europe', 'Asia-Pacific'],
      businessModel: ['B2B', 'B2B2C'],
      customFields: [
        {
          field: 'brand_influence',
          operator: 'greater_than',
          value: 8,
          weight: 10
        }
      ]
    },
    characteristics: {
      avgDealSize: 500000,
      avgSalesCycle: 180,
      decisionMakers: ['CEO', 'CTO', 'Chief Strategy Officer', 'VP Strategic Partnerships'],
      commonPainPoints: [
        'Need for strategic differentiation',
        'Market positioning challenges',
        'Innovation acceleration',
        'Partner ecosystem development'
      ],
      buyingProcess: 'Executive committee with board approval for strategic initiatives',
      competitiveThreats: ['Premium consulting firms', 'Internal strategic teams', 'Other strategic tech partners'],
      successFactors: [
        'C-level sponsorship',
        'Clear ROI metrics',
        'Brand alignment',
        'Innovation showcase',
        'Reference value'
      ],
      churnRisk: 'low'
    },
    strategy: {
      messaging: [
        'Strategic partnership value',
        'Brand elevation',
        'Market leadership',
        'Innovation catalyst',
        'Mutual growth opportunity'
      ],
      channels: ['Executive briefings', 'Industry events', 'Strategic account management', 'Board presentations'],
      touchpoints: 15,
      cadence: 'bi-weekly',
      resources: ['Executive team', 'Strategic account manager', 'Solution architects', 'Partnership team'],
      playbooks: ['Executive engagement', 'Strategic partnership development', 'Board-level presentations'],
      contentLibrary: [],
      kpis: ['Partnership revenue', 'Strategic influence score', 'Market position improvement', 'Innovation metrics']
    },
    metrics: {
      totalOpportunities: 0,
      totalValue: 0,
      conversionRate: 0.15,
      averageDealSize: 500000,
      averageSalesCycle: 180,
      customerLifetimeValue: 2500000,
      acquisitionCost: 75000,
      retention: 0.95,
      expansion: 1.8,
      nps: 70,
      lastCalculated: new Date().toISOString()
    },
    isActive: true,
    color: '#7C3AED',
    icon: 'Crown'
  },
  {
    name: 'Reference Customer',
    description: 'Companies with expertise to drive high volumes in specific channels',
    criteria: {
      revenue: { min: 50000000, max: 1000000000 },
      industry: ['Technology', 'Manufacturing', 'Professional Services', 'Media', 'Telecommunications'],
      companySize: { min: 200, max: 2000 },
      geography: ['North America', 'Europe'],
      businessModel: ['B2B', 'B2C'],
      customFields: [
        {
          field: 'industry_expertise',
          operator: 'greater_than',
          value: 7,
          weight: 9
        },
        {
          field: 'reference_willingness',
          operator: 'equals',
          value: 'high',
          weight: 10
        }
      ]
    },
    characteristics: {
      avgDealSize: 150000,
      avgSalesCycle: 90,
      decisionMakers: ['VP Sales', 'Director of Operations', 'Business Unit Leaders'],
      commonPainPoints: [
        'Channel optimization',
        'Volume scaling challenges',
        'Performance measurement',
        'Process standardization'
      ],
      buyingProcess: 'Department-level with finance approval for mid-range investments',
      competitiveThreats: ['Specialized channel solutions', 'In-house development', 'Category competitors'],
      successFactors: [
        'Clear volume metrics',
        'Channel expertise demonstration',
        'Reference case development',
        'Success story creation'
      ],
      churnRisk: 'medium'
    },
    strategy: {
      messaging: [
        'Channel optimization',
        'Volume efficiency',
        'Industry expertise',
        'Scalable solutions',
        'Reference partnership'
      ],
      channels: ['Industry conferences', 'Channel partner programs', 'Case study development', 'Webinars'],
      touchpoints: 10,
      cadence: 'weekly',
      resources: ['Channel specialists', 'Customer success', 'Marketing', 'Product team'],
      playbooks: ['Channel optimization', 'Reference development', 'Volume scaling'],
      contentLibrary: [],
      kpis: ['Channel volume', 'Reference quality', 'Case study production', 'Industry influence']
    },
    metrics: {
      totalOpportunities: 0,
      totalValue: 0,
      conversionRate: 0.25,
      averageDealSize: 150000,
      averageSalesCycle: 90,
      customerLifetimeValue: 750000,
      acquisitionCost: 25000,
      retention: 0.85,
      expansion: 1.4,
      nps: 65,
      lastCalculated: new Date().toISOString()
    },
    isActive: true,
    color: '#059669',
    icon: 'Trophy'
  },
  {
    name: 'Vector Control',
    description: 'Military, Government, NGOs, Outdoor Workforce, Hospitality',
    criteria: {
      revenue: { min: 10000000, max: 500000000 },
      industry: ['Government', 'Defense', 'Non-Profit', 'Hospitality', 'Agriculture', 'Construction'],
      companySize: { min: 50 },
      geography: ['Global'],
      businessModel: ['B2B', 'B2G'],
      customFields: [
        {
          field: 'outdoor_operations',
          operator: 'equals',
          value: 'high',
          weight: 8
        },
        {
          field: 'health_safety_priority',
          operator: 'greater_than',
          value: 8,
          weight: 9
        }
      ]
    },
    characteristics: {
      avgDealSize: 75000,
      avgSalesCycle: 120,
      decisionMakers: ['Safety Officers', 'Operations Directors', 'Procurement', 'Health & Safety Managers'],
      commonPainPoints: [
        'Health and safety compliance',
        'Vector-borne disease prevention',
        'Operational disruption from pests',
        'Regulatory requirements',
        'Cost-effective solutions'
      ],
      buyingProcess: 'Safety committee with procurement and regulatory approval',
      competitiveThreats: ['Traditional pest control', 'In-house solutions', 'Generic safety products'],
      successFactors: [
        'Regulatory compliance',
        'Safety effectiveness',
        'Cost efficiency',
        'Minimal disruption',
        'Documentation and reporting'
      ],
      churnRisk: 'low'
    },
    strategy: {
      messaging: [
        'Health and safety protection',
        'Regulatory compliance',
        'Operational continuity',
        'Cost-effective prevention',
        'Proven effectiveness'
      ],
      channels: ['Safety conferences', 'Government procurement', 'Industry associations', 'Direct sales'],
      touchpoints: 8,
      cadence: 'monthly',
      resources: ['Safety specialists', 'Compliance team', 'Technical support', 'Government relations'],
      playbooks: ['Government sales', 'Safety compliance', 'Procurement processes'],
      contentLibrary: [],
      kpis: ['Safety outcomes', 'Compliance rates', 'Cost per protection', 'Client retention']
    },
    metrics: {
      totalOpportunities: 0,
      totalValue: 0,
      conversionRate: 0.35,
      averageDealSize: 75000,
      averageSalesCycle: 120,
      customerLifetimeValue: 400000,
      acquisitionCost: 15000,
      retention: 0.90,
      expansion: 1.2,
      nps: 55,
      lastCalculated: new Date().toISOString()
    },
    isActive: true,
    color: '#DC2626',
    icon: 'Shield'
  }
];