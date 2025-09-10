import { KPITemplate } from '@/lib/types';

/**
 * Sample pharmaceutical KPI data for demonstration purposes
 * This shows realistic metrics for a pharmaceutical B2B sales operation
 */

export const samplePharmaceuticalData = {
  // Revenue & Financial Performance
  revenueMetrics: {
    totalRevenue: {
      current: 42500000,
      target: 50000000,
      previousYear: 38200000,
      trend: [35000000, 37500000, 38200000, 40100000, 42500000]
    },
    yoyGrowthRate: {
      current: 12.3,
      target: 15,
      trend: [8.5, 9.2, 10.1, 11.4, 12.3]
    },
    revenuePerRep: {
      current: 2125000,
      target: 2500000,
      trend: [1900000, 1980000, 2050000, 2100000, 2125000]
    }
  },

  // Market Performance
  marketMetrics: {
    marketShare: {
      current: 16.2,
      target: 18.0,
      competitors: {
        'Competitor A': 22.1,
        'Competitor B': 19.8,
        'Our Company': 16.2,
        'Competitor C': 14.3,
        'Others': 27.6
      }
    },
    keyAccountPenetration: {
      current: 78.5,
      target: 85.0,
      bySegment: {
        'Large Hospitals': 85.2,
        'Health Systems': 74.1,
        'Specialty Clinics': 76.8,
        'Academic Medical Centers': 82.3
      }
    }
  },

  // Pipeline Performance
  pipelineMetrics: {
    totalPipelineValue: {
      current: 108000000,
      target: 125000000,
      byStage: {
        'Prospecting': 25000000,
        'Qualification': 32000000,
        'Proposal': 28000000,
        'Negotiation': 15000000,
        'Closing': 8000000
      }
    },
    averageDealSize: {
      current: 720000,
      target: 850000,
      byTherapeuticArea: {
        'Oncology': 1200000,
        'Cardiology': 850000,
        'Neurology': 680000,
        'Diabetes': 520000,
        'Infectious Disease': 440000
      }
    },
    pipelineVelocity: {
      current: 195,
      target: 180,
      byStage: {
        'Prospecting to Qualification': 45,
        'Qualification to Proposal': 62,
        'Proposal to Negotiation': 38,
        'Negotiation to Closing': 28,
        'Closing to Won': 22
      }
    },
    winRate: {
      current: 31.2,
      target: 35.0,
      trend: [28.1, 29.4, 30.2, 30.8, 31.2]
    }
  },

  // Lead Management
  leadMetrics: {
    monthlyQualifiedLeads: {
      current: 142,
      target: 150,
      trend: [128, 135, 138, 140, 142]
    },
    leadToOpportunityRate: {
      current: 24.6,
      target: 28.0,
      bySource: {
        'Digital Marketing': 32.1,
        'Trade Shows': 28.5,
        'Referrals': 41.2,
        'Cold Outreach': 18.3,
        'Webinars': 29.7
      }
    },
    costPerQualifiedLead: {
      current: 2850,
      target: 2500,
      trend: [3200, 3100, 2950, 2900, 2850]
    },
    leadResponseTime: {
      current: 6.2,
      target: 4.0,
      trend: [8.1, 7.5, 6.8, 6.4, 6.2]
    }
  },

  // Customer Success
  customerMetrics: {
    retentionRate: {
      current: 93.2,
      target: 95.0,
      trend: [91.5, 92.1, 92.7, 93.0, 93.2]
    },
    accountExpansionRate: {
      current: 38.7,
      target: 45.0,
      byAccountSize: {
        'Enterprise (>$10M)': 52.3,
        'Mid-Market ($1M-$10M)': 35.8,
        'SMB (<$1M)': 24.1
      }
    },
    customerLifetimeValue: {
      current: 4850000,
      target: 5500000,
      trend: [4200000, 4400000, 4600000, 4720000, 4850000]
    },
    netPromoterScore: {
      current: 65,
      target: 70,
      trend: [58, 61, 63, 64, 65],
      distribution: {
        'Promoters (9-10)': 45,
        'Passives (7-8)': 35,
        'Detractors (0-6)': 20
      }
    }
  },

  // Sales Performance
  salesMetrics: {
    quotaAttainment: {
      current: 87.3,
      target: 100.0,
      byRep: [
        { name: 'Sarah Chen', attainment: 124.5 },
        { name: 'Michael Rodriguez', attainment: 108.2 },
        { name: 'Jennifer Kim', attainment: 95.7 },
        { name: 'David Thompson', attainment: 89.1 },
        { name: 'Lisa Wang', attainment: 76.8 }
      ]
    },
    activityCompletionRate: {
      current: 91.2,
      target: 95.0,
      byActivity: {
        'Calls': 89.5,
        'Emails': 94.2,
        'Meetings': 87.3,
        'Follow-ups': 93.1
      }
    },
    callsPerDay: {
      current: 7.2,
      target: 8.0,
      trend: [6.8, 6.9, 7.1, 7.1, 7.2]
    },
    conversionRate: {
      current: 22.1,
      target: 25.0,
      trend: [19.8, 20.5, 21.2, 21.7, 22.1]
    }
  },

  // Territory Performance
  territoryMetrics: {
    territoryRevenueGrowth: {
      current: 9.8,
      target: 12.0,
      byTerritory: {
        'Northeast': 14.2,
        'Southeast': 8.7,
        'Midwest': 11.3,
        'West': 6.8,
        'International': 15.6
      }
    },
    marketCoverage: {
      current: 84.5,
      target: 90.0,
      byTerritory: {
        'Northeast': 92.1,
        'Southeast': 78.9,
        'Midwest': 87.3,
        'West': 81.2,
        'International': 75.8
      }
    },
    physicianEngagementRate: {
      current: 68.9,
      target: 75.0,
      trend: [62.1, 64.8, 66.5, 67.9, 68.9]
    },
    competitiveWinRate: {
      current: 35.7,
      target: 40.0,
      vsCompetitors: {
        'Competitor A': 28.3,
        'Competitor B': 42.1,
        'Competitor C': 38.9
      }
    }
  },

  // Compliance & Quality
  complianceMetrics: {
    complianceScore: {
      current: 98.5,
      target: 100.0,
      trend: [96.8, 97.2, 97.8, 98.1, 98.5]
    },
    auditFindings: {
      current: 2,
      target: 0,
      trend: [8, 6, 4, 3, 2],
      severity: {
        'Critical': 0,
        'High': 1,
        'Medium': 1,
        'Low': 0
      }
    },
    documentationCompleteness: {
      current: 97.8,
      target: 100.0,
      byDocumentType: {
        'Sales Call Reports': 98.9,
        'Expense Reports': 96.2,
        'Training Certificates': 98.4,
        'Compliance Attestations': 97.1
      }
    },
    trainingCompletionRate: {
      current: 96.4,
      target: 100.0,
      byTrainingType: {
        'Product Training': 98.7,
        'Compliance Training': 94.8,
        'Sales Skills': 95.9,
        'Safety Training': 96.3
      }
    }
  },

  // Product Performance
  productMetrics: {
    productRevenueGrowth: {
      current: 17.2,
      target: 20.0,
      byProduct: {
        'Product Alpha': 23.5,
        'Product Beta': 15.8,
        'Product Gamma': 12.4,
        'Product Delta': 19.7
      }
    },
    marketAdoptionRate: {
      current: 26.8,
      target: 30.0,
      trend: [18.2, 20.1, 23.4, 25.6, 26.8]
    },
    prescriptionVolume: {
      current: 46200,
      target: 50000,
      trend: [38500, 41200, 43800, 45100, 46200]
    },
    formularyCoverage: {
      current: 78.3,
      target: 85.0,
      byPayer: {
        'Commercial': 82.1,
        'Medicare': 75.8,
        'Medicaid': 71.2,
        'Cash Pay': 89.4
      }
    }
  },

  // Digital Engagement
  digitalMetrics: {
    hcpDigitalEngagement: {
      current: 58.7,
      target: 65.0,
      byChannel: {
        'Email': 64.2,
        'Webinars': 52.1,
        'Digital Samples': 61.8,
        'Mobile App': 48.9,
        'Virtual Calls': 69.3
      }
    },
    emailOpenRate: {
      current: 31.4,
      target: 35.0,
      trend: [28.1, 29.2, 30.1, 30.8, 31.4]
    },
    webinarAttendanceRate: {
      current: 68.9,
      target: 75.0,
      byTopic: {
        'Product Updates': 72.3,
        'Clinical Data': 78.1,
        'Treatment Guidelines': 65.4,
        'Case Studies': 60.2
      }
    },
    contentEngagementScore: {
      current: 74,
      target: 80,
      trend: [65, 68, 71, 73, 74],
      topContent: [
        { title: 'Clinical Study Results', score: 89 },
        { title: 'Dosing Guidelines', score: 82 },
        { title: 'Patient Case Studies', score: 78 },
        { title: 'Safety Information', score: 76 }
      ]
    }
  }
};

/**
 * Convert template to demo data for visualization
 */
export const convertTemplateToDemo = (template: KPITemplate) => {
  return template.metrics.map(metric => ({
    ...metric,
    // Add realistic trend data
    trend: generateTrendData(metric.current, metric.target),
    // Add contextual data based on metric type
    context: getMetricContext(metric.name, template.category)
  }));
};

function generateTrendData(current: number, target: number): number[] {
  const steps = 12; // 12 months of data
  const trend: number[] = [];
  const startValue = current * 0.7; // Start at 70% of current
  const step = (current - startValue) / (steps - 1);
  
  for (let i = 0; i < steps; i++) {
    const value = startValue + (step * i);
    // Add some realistic variation
    const variation = value * 0.05 * (Math.random() - 0.5);
    trend.push(Math.round((value + variation) * 100) / 100);
  }
  
  return trend;
}

function getMetricContext(metricName: string, category: string) {
  const contexts: Record<string, any> = {
    'Total Revenue': {
      breakdown: ['Product A: 35%', 'Product B: 28%', 'Product C: 22%', 'Others: 15%'],
      benchmark: 'Industry average: $38M'
    },
    'Win Rate': {
      breakdown: ['Enterprise: 42%', 'Mid-Market: 35%', 'SMB: 28%'],
      benchmark: 'Industry average: 29%'
    },
    'Customer Retention Rate': {
      breakdown: ['Year 1: 89%', 'Year 2: 94%', 'Year 3+: 96%'],
      benchmark: 'Industry average: 91%'
    },
    'Market Share': {
      breakdown: ['Region A: 18.5%', 'Region B: 14.2%', 'Region C: 16.8%'],
      benchmark: 'Top competitor: 22.1%'
    }
  };
  
  return contexts[metricName] || {
    breakdown: ['Growing trend', 'Above target pace', 'Strong performance'],
    benchmark: 'Exceeding industry standards'
  };
}