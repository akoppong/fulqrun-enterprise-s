import { KPITemplate } from '../lib/types';

/**
 * Pharmaceutical B2B Sales KPI Templates
 * Based on high-performance sales operations methodology for pharmaceutical industry
 */

export const pharmaceuticalKPITemplates: KPITemplate[] = [
  // === REVENUE & FINANCIAL METRICS ===
  {
    id: 'pharma-revenue-growth',
    name: 'Pharmaceutical Revenue Growth',
    description: 'Track year-over-year and quarter-over-quarter revenue growth across therapeutic areas',
    category: 'Revenue & Financial',
    metrics: [
      {
        name: 'Total Revenue',
        type: 'currency',
        target: 50000000,
        current: 42500000,
        unit: 'USD',
        timeframe: 'quarterly'
      },
      {
        name: 'YoY Growth Rate',
        type: 'percentage',
        target: 15,
        current: 12.3,
        unit: '%',
        timeframe: 'yearly'
      },
      {
        name: 'Revenue per Rep',
        type: 'currency',
        target: 2500000,
        current: 2125000,
        unit: 'USD',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['gauge', 'trend', 'bar'],
    tags: ['revenue', 'growth', 'financial', 'pharma'],
    industry: 'pharmaceutical'
  },

  {
    id: 'pharma-market-share',
    name: 'Market Share & Penetration',
    description: 'Monitor market share across key therapeutic areas and geographic regions',
    category: 'Market Analysis',
    metrics: [
      {
        name: 'Overall Market Share',
        type: 'percentage',
        target: 18,
        current: 16.2,
        unit: '%',
        timeframe: 'quarterly'
      },
      {
        name: 'Key Account Penetration',
        type: 'percentage',
        target: 85,
        current: 78.5,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'New Market Entries',
        type: 'number',
        target: 12,
        current: 9,
        unit: 'markets',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['gauge', 'map', 'progress'],
    tags: ['market-share', 'penetration', 'geographic', 'competition'],
    industry: 'pharmaceutical'
  },

  // === PIPELINE & OPPORTUNITY METRICS ===
  {
    id: 'pharma-pipeline-health',
    name: 'Pipeline Health & Velocity',
    description: 'Track opportunity pipeline health across different therapeutic areas and deal sizes',
    category: 'Pipeline Management',
    metrics: [
      {
        name: 'Total Pipeline Value',
        type: 'currency',
        target: 125000000,
        current: 108000000,
        unit: 'USD',
        timeframe: 'monthly'
      },
      {
        name: 'Average Deal Size',
        type: 'currency',
        target: 850000,
        current: 720000,
        unit: 'USD',
        timeframe: 'quarterly'
      },
      {
        name: 'Pipeline Velocity (Days)',
        type: 'number',
        target: 180,
        current: 195,
        unit: 'days',
        timeframe: 'monthly',
        trend: 'lower-better'
      },
      {
        name: 'Win Rate',
        type: 'percentage',
        target: 35,
        current: 31.2,
        unit: '%',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['funnel', 'trend', 'gauge'],
    tags: ['pipeline', 'velocity', 'deals', 'forecasting'],
    industry: 'pharmaceutical'
  },

  {
    id: 'pharma-lead-generation',
    name: 'Lead Generation & Quality',
    description: 'Monitor lead generation effectiveness across channels and therapeutic areas',
    category: 'Lead Management',
    metrics: [
      {
        name: 'Monthly Qualified Leads',
        type: 'number',
        target: 150,
        current: 142,
        unit: 'leads',
        timeframe: 'monthly'
      },
      {
        name: 'Lead-to-Opportunity Rate',
        type: 'percentage',
        target: 28,
        current: 24.6,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Cost per Qualified Lead',
        type: 'currency',
        target: 2500,
        current: 2850,
        unit: 'USD',
        timeframe: 'monthly',
        trend: 'lower-better'
      },
      {
        name: 'Lead Response Time',
        type: 'number',
        target: 4,
        current: 6.2,
        unit: 'hours',
        timeframe: 'daily',
        trend: 'lower-better'
      }
    ],
    visualizations: ['bar', 'trend', 'gauge'],
    tags: ['leads', 'generation', 'qualification', 'response-time'],
    industry: 'pharmaceutical'
  },

  // === CUSTOMER & ACCOUNT METRICS ===
  {
    id: 'pharma-customer-retention',
    name: 'Customer Retention & Loyalty',
    description: 'Track customer retention, expansion, and satisfaction across key accounts',
    category: 'Customer Success',
    metrics: [
      {
        name: 'Customer Retention Rate',
        type: 'percentage',
        target: 95,
        current: 93.2,
        unit: '%',
        timeframe: 'yearly'
      },
      {
        name: 'Account Expansion Rate',
        type: 'percentage',
        target: 45,
        current: 38.7,
        unit: '%',
        timeframe: 'yearly'
      },
      {
        name: 'Customer Lifetime Value',
        type: 'currency',
        target: 5500000,
        current: 4850000,
        unit: 'USD',
        timeframe: 'yearly'
      },
      {
        name: 'Net Promoter Score',
        type: 'number',
        target: 70,
        current: 65,
        unit: 'NPS',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['gauge', 'trend', 'progress'],
    tags: ['retention', 'expansion', 'loyalty', 'satisfaction'],
    industry: 'pharmaceutical'
  },

  {
    id: 'pharma-key-accounts',
    name: 'Key Account Performance',
    description: 'Monitor performance across top pharmaceutical accounts and hospital systems',
    category: 'Account Management',
    metrics: [
      {
        name: 'Top 10 Account Revenue',
        type: 'currency',
        target: 35000000,
        current: 31500000,
        unit: 'USD',
        timeframe: 'quarterly'
      },
      {
        name: 'Account Penetration Depth',
        type: 'percentage',
        target: 80,
        current: 72.4,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Cross-Selling Success Rate',
        type: 'percentage',
        target: 55,
        current: 48.3,
        unit: '%',
        timeframe: 'quarterly'
      },
      {
        name: 'Account Health Score',
        type: 'number',
        target: 85,
        current: 78,
        unit: 'score',
        timeframe: 'monthly'
      }
    ],
    visualizations: ['dashboard', 'heatmap', 'trend'],
    tags: ['key-accounts', 'penetration', 'health-score', 'cross-selling'],
    industry: 'pharmaceutical'
  },

  // === SALES PERFORMANCE METRICS ===
  {
    id: 'pharma-sales-rep-performance',
    name: 'Sales Rep Performance',
    description: 'Track individual and team sales performance across therapeutic areas',
    category: 'Sales Performance',
    metrics: [
      {
        name: 'Quota Attainment',
        type: 'percentage',
        target: 100,
        current: 87.3,
        unit: '%',
        timeframe: 'quarterly'
      },
      {
        name: 'Activity Completion Rate',
        type: 'percentage',
        target: 95,
        current: 91.2,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Calls per Day',
        type: 'number',
        target: 8,
        current: 7.2,
        unit: 'calls',
        timeframe: 'daily'
      },
      {
        name: 'Conversion Rate',
        type: 'percentage',
        target: 25,
        current: 22.1,
        unit: '%',
        timeframe: 'monthly'
      }
    ],
    visualizations: ['leaderboard', 'gauge', 'bar'],
    tags: ['performance', 'quota', 'activity', 'conversion'],
    industry: 'pharmaceutical'
  },

  {
    id: 'pharma-territory-performance',
    name: 'Territory & Region Performance',
    description: 'Monitor performance across geographic territories and therapeutic specialties',
    category: 'Territory Management',
    metrics: [
      {
        name: 'Territory Revenue Growth',
        type: 'percentage',
        target: 12,
        current: 9.8,
        unit: '%',
        timeframe: 'yearly'
      },
      {
        name: 'Market Coverage',
        type: 'percentage',
        target: 90,
        current: 84.5,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Physician Engagement Rate',
        type: 'percentage',
        target: 75,
        current: 68.9,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Competitive Win Rate',
        type: 'percentage',
        target: 40,
        current: 35.7,
        unit: '%',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['map', 'heatmap', 'trend'],
    tags: ['territory', 'coverage', 'engagement', 'competitive'],
    industry: 'pharmaceutical'
  },

  // === REGULATORY & COMPLIANCE METRICS ===
  {
    id: 'pharma-compliance-tracking',
    name: 'Regulatory Compliance',
    description: 'Monitor compliance with pharmaceutical regulations and quality standards',
    category: 'Compliance & Quality',
    metrics: [
      {
        name: 'Compliance Score',
        type: 'percentage',
        target: 100,
        current: 98.5,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Audit Findings',
        type: 'number',
        target: 0,
        current: 2,
        unit: 'findings',
        timeframe: 'quarterly',
        trend: 'lower-better'
      },
      {
        name: 'Documentation Completeness',
        type: 'percentage',
        target: 100,
        current: 97.8,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Training Completion Rate',
        type: 'percentage',
        target: 100,
        current: 96.4,
        unit: '%',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['gauge', 'progress', 'alert'],
    tags: ['compliance', 'regulatory', 'audit', 'training'],
    industry: 'pharmaceutical'
  },

  // === PRODUCT & LAUNCH METRICS ===
  {
    id: 'pharma-product-performance',
    name: 'Product Performance & Launch',
    description: 'Track product performance across therapeutic areas and launch success metrics',
    category: 'Product Management',
    metrics: [
      {
        name: 'Product Revenue Growth',
        type: 'percentage',
        target: 20,
        current: 17.2,
        unit: '%',
        timeframe: 'quarterly'
      },
      {
        name: 'Market Adoption Rate',
        type: 'percentage',
        target: 30,
        current: 26.8,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Prescription Volume',
        type: 'number',
        target: 50000,
        current: 46200,
        unit: 'prescriptions',
        timeframe: 'monthly'
      },
      {
        name: 'Formulary Coverage',
        type: 'percentage',
        target: 85,
        current: 78.3,
        unit: '%',
        timeframe: 'quarterly'
      }
    ],
    visualizations: ['trend', 'bar', 'gauge'],
    tags: ['product', 'launch', 'adoption', 'formulary'],
    industry: 'pharmaceutical'
  },

  // === DIGITAL & MARKETING METRICS ===
  {
    id: 'pharma-digital-engagement',
    name: 'Digital Engagement & Marketing',
    description: 'Monitor digital marketing effectiveness and healthcare professional engagement',
    category: 'Digital Marketing',
    metrics: [
      {
        name: 'HCP Digital Engagement',
        type: 'percentage',
        target: 65,
        current: 58.7,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Email Open Rate',
        type: 'percentage',
        target: 35,
        current: 31.4,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Webinar Attendance Rate',
        type: 'percentage',
        target: 75,
        current: 68.9,
        unit: '%',
        timeframe: 'monthly'
      },
      {
        name: 'Content Engagement Score',
        type: 'number',
        target: 80,
        current: 74,
        unit: 'score',
        timeframe: 'monthly'
      }
    ],
    visualizations: ['gauge', 'trend', 'funnel'],
    tags: ['digital', 'engagement', 'marketing', 'content'],
    industry: 'pharmaceutical'
  }
];

// Helper function to get templates by category
export const getPharmaceuticalTemplatesByCategory = (category: string) => {
  return pharmaceuticalKPITemplates.filter(template => template.category === category);
};

// Helper function to get all categories
export const getPharmaceuticalCategories = () => {
  return [...new Set(pharmaceuticalKPITemplates.map(template => template.category))];
};

// Helper function to search templates
export const searchPharmaceuticalTemplates = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return pharmaceuticalKPITemplates.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};