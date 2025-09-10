import { useKV } from '@github/spark/hooks';
import { useState, useEffect, useCallback } from 'react';

export interface KPIDataPoint {
  id: string;
  timestamp: Date;
  value: number;
  metadata: Record<string, any>;
}

export interface DrillDownLevel {
  id: string;
  name: string;
  description: string;
  level: number;
  parentId?: string;
  data: KPIDataPoint[];
  aggregations: {
    sum: number;
    average: number;
    min: number;
    max: number;
    count: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  };
  filters: KPIFilter[];
  dimensions: KPIDimension[];
}

export interface KPIFilter {
  id: string;
  name: string;
  type: 'date' | 'category' | 'numeric' | 'boolean';
  values: any[];
  active: boolean;
}

export interface KPIDimension {
  id: string;
  name: string;
  type: 'temporal' | 'categorical' | 'geographic' | 'demographic';
  values: string[];
}

export interface KPIHierarchy {
  root: DrillDownLevel;
  levels: Map<string, DrillDownLevel>;
  maxDepth: number;
}

export class KPIDrillDownService {
  private data: Map<string, KPIHierarchy> = new Map();

  constructor() {
    this.initializeDefaultHierarchies();
  }

  private initializeDefaultHierarchies() {
    // Revenue Hierarchy
    const revenueHierarchy = this.createRevenueHierarchy();
    this.data.set('revenue', revenueHierarchy);

    // Pipeline Hierarchy
    const pipelineHierarchy = this.createPipelineHierarchy();
    this.data.set('pipeline', pipelineHierarchy);

    // Conversion Hierarchy
    const conversionHierarchy = this.createConversionHierarchy();
    this.data.set('conversion', conversionHierarchy);

    // Customer Satisfaction Hierarchy
    const satisfactionHierarchy = this.createSatisfactionHierarchy();
    this.data.set('customer_satisfaction', satisfactionHierarchy);
  }

  private createRevenueHierarchy(): KPIHierarchy {
    const root: DrillDownLevel = {
      id: 'revenue_root',
      name: 'Total Revenue',
      description: 'Complete revenue breakdown across all segments',
      level: 0,
      data: this.generateTimeSeriesData(2450000, 12),
      aggregations: {
        sum: 2450000,
        average: 204166,
        min: 180000,
        max: 250000,
        count: 12,
        trend: 'up',
        trendPercentage: 12.5
      },
      filters: [
        {
          id: 'time_period',
          name: 'Time Period',
          type: 'date',
          values: ['Q1', 'Q2', 'Q3', 'Q4'],
          active: false
        },
        {
          id: 'segment',
          name: 'Customer Segment',
          type: 'category',
          values: ['Enterprise', 'SMB', 'Renewals'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'time',
          name: 'Time',
          type: 'temporal',
          values: ['January', 'February', 'March', 'April', 'May', 'June']
        },
        {
          id: 'geography',
          name: 'Geography',
          type: 'geographic',
          values: ['North America', 'Europe', 'Asia Pacific', 'Latin America']
        }
      ]
    };

    const enterpriseLevel: DrillDownLevel = {
      id: 'revenue_enterprise',
      name: 'Enterprise Revenue',
      description: 'Revenue from enterprise segment deals',
      level: 1,
      parentId: 'revenue_root',
      data: this.generateTimeSeriesData(1200000, 12),
      aggregations: {
        sum: 1200000,
        average: 100000,
        min: 85000,
        max: 125000,
        count: 12,
        trend: 'up',
        trendPercentage: 18.2
      },
      filters: [
        {
          id: 'deal_size',
          name: 'Deal Size',
          type: 'numeric',
          values: ['<50K', '50K-100K', '100K-500K', '500K+'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'industry',
          name: 'Industry',
          type: 'categorical',
          values: ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing']
        }
      ]
    };

    const smbLevel: DrillDownLevel = {
      id: 'revenue_smb',
      name: 'SMB Revenue',
      description: 'Revenue from small and medium business segment',
      level: 1,
      parentId: 'revenue_root',
      data: this.generateTimeSeriesData(850000, 12),
      aggregations: {
        sum: 850000,
        average: 70833,
        min: 62000,
        max: 78000,
        count: 12,
        trend: 'stable',
        trendPercentage: 2.1
      },
      filters: [
        {
          id: 'company_size',
          name: 'Company Size',
          type: 'category',
          values: ['1-10', '11-50', '51-200', '201-500'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'channel',
          name: 'Sales Channel',
          type: 'categorical',
          values: ['Direct Sales', 'Partner Channel', 'Online', 'Referral']
        }
      ]
    };

    const levels = new Map<string, DrillDownLevel>();
    levels.set('revenue_root', root);
    levels.set('revenue_enterprise', enterpriseLevel);
    levels.set('revenue_smb', smbLevel);

    return {
      root,
      levels,
      maxDepth: 2
    };
  }

  private createPipelineHierarchy(): KPIHierarchy {
    const root: DrillDownLevel = {
      id: 'pipeline_root',
      name: 'Total Pipeline Value',
      description: 'Complete sales pipeline analysis',
      level: 0,
      data: this.generateTimeSeriesData(8750000, 12),
      aggregations: {
        sum: 8750000,
        average: 729166,
        min: 650000,
        max: 820000,
        count: 12,
        trend: 'up',
        trendPercentage: 8.3
      },
      filters: [
        {
          id: 'stage',
          name: 'Pipeline Stage',
          type: 'category',
          values: ['Qualified', 'Proposal', 'Negotiation', 'Closed Won'],
          active: false
        },
        {
          id: 'probability',
          name: 'Close Probability',
          type: 'numeric',
          values: ['0-25%', '26-50%', '51-75%', '76-100%'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'sales_rep',
          name: 'Sales Representative',
          type: 'categorical',
          values: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Davis']
        },
        {
          id: 'lead_source',
          name: 'Lead Source',
          type: 'categorical',
          values: ['Inbound', 'Outbound', 'Referral', 'Event']
        }
      ]
    };

    const qualifiedLevel: DrillDownLevel = {
      id: 'pipeline_qualified',
      name: 'Qualified Leads',
      description: 'Leads that have passed initial qualification',
      level: 1,
      parentId: 'pipeline_root',
      data: this.generateTimeSeriesData(3200000, 12),
      aggregations: {
        sum: 3200000,
        average: 266666,
        min: 240000,
        max: 290000,
        count: 12,
        trend: 'up',
        trendPercentage: 15.2
      },
      filters: [
        {
          id: 'lead_score',
          name: 'Lead Score',
          type: 'numeric',
          values: ['60-70', '71-80', '81-90', '91-100'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'meddpicc_score',
          name: 'MEDDPICC Score',
          type: 'categorical',
          values: ['High', 'Medium', 'Low']
        }
      ]
    };

    const levels = new Map<string, DrillDownLevel>();
    levels.set('pipeline_root', root);
    levels.set('pipeline_qualified', qualifiedLevel);

    return {
      root,
      levels,
      maxDepth: 2
    };
  }

  private createConversionHierarchy(): KPIHierarchy {
    const root: DrillDownLevel = {
      id: 'conversion_root',
      name: 'Lead Conversion Rate',
      description: 'Overall lead to customer conversion metrics',
      level: 0,
      data: this.generateTimeSeriesData(24.5, 12, true),
      aggregations: {
        sum: 24.5,
        average: 24.5,
        min: 21.2,
        max: 27.8,
        count: 12,
        trend: 'up',
        trendPercentage: 5.2
      },
      filters: [
        {
          id: 'lead_type',
          name: 'Lead Type',
          type: 'category',
          values: ['Inbound', 'Outbound'],
          active: false
        },
        {
          id: 'channel',
          name: 'Channel',
          type: 'category',
          values: ['Website', 'Email', 'Social', 'Events'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'campaign',
          name: 'Marketing Campaign',
          type: 'categorical',
          values: ['Product Launch', 'Webinar Series', 'Content Marketing', 'Partner Program']
        }
      ]
    };

    const inboundLevel: DrillDownLevel = {
      id: 'conversion_inbound',
      name: 'Inbound Conversion',
      description: 'Conversion rates from inbound marketing efforts',
      level: 1,
      parentId: 'conversion_root',
      data: this.generateTimeSeriesData(28.5, 12, true),
      aggregations: {
        sum: 28.5,
        average: 28.5,
        min: 25.1,
        max: 32.4,
        count: 12,
        trend: 'up',
        trendPercentage: 8.7
      },
      filters: [],
      dimensions: [
        {
          id: 'content_type',
          name: 'Content Type',
          type: 'categorical',
          values: ['Blog Posts', 'Whitepapers', 'Webinars', 'Case Studies']
        }
      ]
    };

    const levels = new Map<string, DrillDownLevel>();
    levels.set('conversion_root', root);
    levels.set('conversion_inbound', inboundLevel);

    return {
      root,
      levels,
      maxDepth: 2
    };
  }

  private createSatisfactionHierarchy(): KPIHierarchy {
    const root: DrillDownLevel = {
      id: 'satisfaction_root',
      name: 'Customer Satisfaction',
      description: 'Overall customer satisfaction metrics and feedback',
      level: 0,
      data: this.generateTimeSeriesData(8.7, 12, true, true),
      aggregations: {
        sum: 8.7,
        average: 8.7,
        min: 8.2,
        max: 9.1,
        count: 12,
        trend: 'up',
        trendPercentage: 2.4
      },
      filters: [
        {
          id: 'survey_type',
          name: 'Survey Type',
          type: 'category',
          values: ['NPS', 'CSAT', 'CES'],
          active: false
        },
        {
          id: 'customer_segment',
          name: 'Customer Segment',
          type: 'category',
          values: ['Enterprise', 'SMB', 'Startup'],
          active: false
        }
      ],
      dimensions: [
        {
          id: 'product_area',
          name: 'Product Area',
          type: 'categorical',
          values: ['Core Platform', 'Integrations', 'Mobile App', 'API']
        },
        {
          id: 'support_tier',
          name: 'Support Tier',
          type: 'categorical',
          values: ['Basic', 'Professional', 'Enterprise', 'Premium']
        }
      ]
    };

    const productLevel: DrillDownLevel = {
      id: 'satisfaction_product',
      name: 'Product Experience',
      description: 'Customer satisfaction with product features and usability',
      level: 1,
      parentId: 'satisfaction_root',
      data: this.generateTimeSeriesData(8.9, 12, true, true),
      aggregations: {
        sum: 8.9,
        average: 8.9,
        min: 8.5,
        max: 9.3,
        count: 12,
        trend: 'up',
        trendPercentage: 3.1
      },
      filters: [],
      dimensions: [
        {
          id: 'feature_category',
          name: 'Feature Category',
          type: 'categorical',
          values: ['Analytics', 'Automation', 'Integrations', 'Reporting']
        }
      ]
    };

    const levels = new Map<string, DrillDownLevel>();
    levels.set('satisfaction_root', root);
    levels.set('satisfaction_product', productLevel);

    return {
      root,
      levels,
      maxDepth: 2
    };
  }

  private generateTimeSeriesData(baseValue: number, count: number, isPercentage: boolean = false, isScore: boolean = false): KPIDataPoint[] {
    const data: KPIDataPoint[] = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (count - i - 1));
      
      let value = baseValue;
      
      if (isScore) {
        // Score values (0-10 scale)
        value = baseValue + (Math.random() - 0.5) * 0.8;
        value = Math.max(0, Math.min(10, value));
      } else if (isPercentage) {
        // Percentage values
        value = baseValue + (Math.random() - 0.5) * 10;
        value = Math.max(0, Math.min(100, value));
      } else {
        // Monetary values
        const variation = baseValue * 0.2;
        value = baseValue + (Math.random() - 0.5) * variation;
        value = Math.max(0, value);
      }
      
      data.push({
        id: `data_${i}`,
        timestamp: date,
        value: Math.round(value * 100) / 100,
        metadata: {
          period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          dayOfWeek: date.getDay(),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        }
      });
    }
    
    return data;
  }

  // Public methods for accessing drill-down data
  getHierarchy(kpiId: string): KPIHierarchy | null {
    return this.data.get(kpiId) || null;
  }

  getLevel(kpiId: string, levelId: string): DrillDownLevel | null {
    const hierarchy = this.data.get(kpiId);
    return hierarchy?.levels.get(levelId) || null;
  }

  getChildren(kpiId: string, levelId: string): DrillDownLevel[] {
    const hierarchy = this.data.get(kpiId);
    if (!hierarchy) return [];
    
    const children: DrillDownLevel[] = [];
    for (const [_, level] of hierarchy.levels) {
      if (level.parentId === levelId) {
        children.push(level);
      }
    }
    
    return children.sort((a, b) => a.level - b.level);
  }

  applyFilters(levelData: DrillDownLevel, activeFilters: Record<string, any>): KPIDataPoint[] {
    let filteredData = [...levelData.data];
    
    Object.entries(activeFilters).forEach(([filterId, filterValue]) => {
      const filter = levelData.filters.find(f => f.id === filterId);
      if (!filter || !filterValue) return;
      
      switch (filter.type) {
        case 'date':
          // Apply date filtering logic
          break;
        case 'category':
          filteredData = filteredData.filter(point => 
            point.metadata[filterId] === filterValue
          );
          break;
        case 'numeric':
          // Apply numeric range filtering
          break;
      }
    });
    
    return filteredData;
  }

  calculateAggregations(data: KPIDataPoint[]): DrillDownLevel['aggregations'] {
    if (data.length === 0) {
      return {
        sum: 0,
        average: 0,
        min: 0,
        max: 0,
        count: 0,
        trend: 'stable',
        trendPercentage: 0
      };
    }
    
    const values = data.map(d => d.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((acc, val) => acc + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, val) => acc + val, 0) / secondHalf.length;
    
    const trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
    const trend = Math.abs(trendPercentage) < 1 ? 'stable' : trendPercentage > 0 ? 'up' : 'down';
    
    return {
      sum,
      average,
      min,
      max,
      count: values.length,
      trend,
      trendPercentage: Math.abs(trendPercentage)
    };
  }
}

// Hook for using KPI drill-down service
export function useKPIDrillDown() {
  const [service] = useState(() => new KPIDrillDownService());
  const [cache, setCache] = useKV('kpi_drill_down_cache', new Map<string, any>());

  const getDrillDownData = useCallback(async (kpiId: string, levelId?: string) => {
    const cacheKey = `${kpiId}_${levelId || 'root'}`;
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const hierarchy = service.getHierarchy(kpiId);
    if (!hierarchy) return null;

    const level = levelId ? service.getLevel(kpiId, levelId) : hierarchy.root;
    const children = levelId ? service.getChildren(kpiId, levelId) : service.getChildren(kpiId, hierarchy.root.id);

    const result = {
      level,
      children,
      hierarchy
    };

    // Update cache
    const newCache = new Map(cache);
    newCache.set(cacheKey, result);
    setCache(newCache);

    return result;
  }, [service, cache, setCache]);

  const applyFiltersToLevel = useCallback((kpiId: string, levelId: string, filters: Record<string, any>) => {
    const level = service.getLevel(kpiId, levelId);
    if (!level) return [];

    return service.applyFilters(level, filters);
  }, [service]);

  const calculateLevelAggregations = useCallback((data: KPIDataPoint[]) => {
    return service.calculateAggregations(data);
  }, [service]);

  return {
    getDrillDownData,
    applyFiltersToLevel,
    calculateLevelAggregations,
    service
  };
}