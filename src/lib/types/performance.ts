/**
 * Performance metrics and reporting types
 */

export interface FinancialData {
  id: string;
  opportunityId: string;
  revenue: number;
  costs: number;
  margin: number;
  recurringRevenue: number;
  paymentTerms: string;
  invoiceStatus: 'pending' | 'sent' | 'paid' | 'overdue';
  inventoryItems?: InventoryItem[];
  posTransactions?: POSTransaction[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string; // ISO date string for reliable serialization
}

export interface POSTransaction {
  id: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  timestamp: string; // ISO date string for reliable serialization
  items: string[];
  customerId?: string;
}

export interface PerformanceMetrics {
  userId: string;
  period: string;
  cstpv: {
    close: number; // Win rate percentage
    size: number; // Average deal size
    time: number; // Average sales cycle days
    probability: number; // Pipeline probability
    value: number; // Total pipeline value
  };
  activityMetrics: {
    calls: number;
    emails: number;
    meetings: number;
    demos: number;
  };
  kpis: {
    quota: number;
    achieved: number;
    attainment: number;
    ranking: number;
  };
}

export interface SalesPerformanceMetrics {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  revenue: {
    actual: number;
    target: number;
    percentage: number;
  };
  deals: {
    closed: number;
    target: number;
    percentage: number;
  };
  pipeline: {
    value: number;
    count: number;
    velocity: number;
  };
  activities: {
    calls: number;
    emails: number;
    meetings: number;
    demos: number;
  };
  conversion: {
    leadToOpportunity: number;
    opportunityToClose: number;
    averageDealSize: number;
    salesCycle: number;
  };
  ranking: {
    position: number;
    totalReps: number;
    percentile: number;
  };
}

export interface TeamPerformanceMetrics {
  teamId: string;
  managerId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  team: {
    revenue: {
      actual: number;
      target: number;
      percentage: number;
    };
    deals: {
      closed: number;
      target: number;
      percentage: number;
    };
    pipeline: {
      value: number;
      count: number;
      velocity: number;
    };
  };
  individual: SalesPerformanceMetrics[];
  topPerformers: {
    userId: string;
    name: string;
    achievement: number;
    metric: string;
  }[];
  underperformers: {
    userId: string;
    name: string;
    gap: number;
    riskFactors: string[];
  }[];
}

export interface ExecutiveDashboardMetrics {
  period: 'monthly' | 'quarterly' | 'yearly';
  global: {
    revenue: {
      actual: number;
      target: number;
      forecast: number;
      growth: number;
    };
    deals: {
      closed: number;
      pipeline: number;
      forecast: number;
    };
    performance: {
      attainment: number;
      velocity: number;
      conversion: number;
    };
  };
  regions: {
    id: string;
    name: string;
    revenue: number;
    target: number;
    growth: number;
  }[];
  segments: {
    id: string;
    name: string;
    contribution: number;
    growth: number;
    opportunities: number;
  }[];
  trends: {
    period: string;
    revenue: number;
    deals: number;
    velocity: number;
  }[];
  risks: {
    type: 'pipeline' | 'forecast' | 'competitive' | 'market';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    mitigation: string[];
  }[];
}

// Pharmaceutical Industry KPI Templates
export interface PharmaSalesKPITemplate {
  id: string;
  category: 'revenue' | 'market_access' | 'clinical' | 'compliance' | 'territory';
  kpis: PharmaSalesKPI[];
}

export interface PharmaSalesKPI {
  name: string;
  description: string;
  formula: string;
  target: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  benchmark: {
    industry: number;
    topQuartile: number;
  };
  drillDowns: string[];
}