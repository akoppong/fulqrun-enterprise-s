import { PharmaSalesKPITemplate, PharmaSalesKPI } from '@/lib/types';

export const PHARMA_SALES_KPI_TEMPLATES: PharmaSalesKPITemplate[] = [
  {
    id: 'pharma-revenue',
    category: 'revenue',
    kpis: [
      {
        name: 'Monthly Prescription Revenue',
        description: 'Total revenue from prescription drug sales',
        formula: 'Sum of all prescription drug sales revenue for the month',
        target: 2500000,
        unit: '$',
        frequency: 'monthly',
        benchmark: { industry: 2200000, topQuartile: 2800000 },
        drillDowns: ['Therapeutic Area', 'Product Line', 'Territory', 'Customer Segment']
      },
      {
        name: 'Revenue per Territory',
        description: 'Average revenue generated per sales territory',
        formula: 'Total Territory Revenue / Number of Territories',
        target: 125000,
        unit: '$',
        frequency: 'monthly',
        benchmark: { industry: 110000, topQuartile: 145000 },
        drillDowns: ['Territory Manager', 'Product Mix', 'Account Penetration']
      },
      {
        name: 'Product Portfolio Revenue Mix',
        description: 'Revenue distribution across therapeutic areas',
        formula: 'Revenue by Therapeutic Area / Total Revenue * 100',
        target: 35,
        unit: '%',
        frequency: 'quarterly',
        benchmark: { industry: 30, topQuartile: 40 },
        drillDowns: ['Oncology', 'Cardiology', 'CNS', 'Immunology', 'Rare Diseases']
      },
      {
        name: 'New Product Launch Revenue',
        description: 'Revenue from products launched in the last 12 months',
        formula: 'Sum of revenue from products launched within 12 months',
        target: 450000,
        unit: '$',
        frequency: 'monthly',
        benchmark: { industry: 380000, topQuartile: 520000 },
        drillDowns: ['Launch Timeline', 'Market Uptake', 'Competitive Positioning']
      }
    ]
  },
  {
    id: 'pharma-market-access',
    category: 'market_access',
    kpis: [
      {
        name: 'Formulary Win Rate',
        description: 'Percentage of formulary submissions approved',
        formula: 'Approved Formulary Submissions / Total Submissions * 100',
        target: 78,
        unit: '%',
        frequency: 'quarterly',
        benchmark: { industry: 65, topQuartile: 85 },
        drillDowns: ['Payer Type', 'Therapeutic Area', 'Submission Quality Score']
      },
      {
        name: 'Prior Authorization Rate',
        description: 'Percentage of prescriptions requiring prior authorization',
        formula: 'Prescriptions with PA Required / Total Prescriptions * 100',
        target: 25,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 35, topQuartile: 20 },
        drillDowns: ['Payer', 'Product', 'Indication', 'Patient Profile']
      },
      {
        name: 'Market Access Coverage',
        description: 'Percentage of lives covered by favorable formulary position',
        formula: 'Lives with Preferred/Covered Status / Total Addressable Lives * 100',
        target: 85,
        unit: '%',
        frequency: 'quarterly',
        benchmark: { industry: 75, topQuartile: 90 },
        drillDowns: ['Payer Tier', 'Geography', 'Plan Type']
      },
      {
        name: 'Payer Negotiation Success Rate',
        description: 'Percentage of successful payer contract negotiations',
        formula: 'Successful Negotiations / Total Negotiations * 100',
        target: 72,
        unit: '%',
        frequency: 'quarterly',
        benchmark: { industry: 62, topQuartile: 82 },
        drillDowns: ['Contract Value', 'Negotiation Stage', 'Payer Size']
      }
    ]
  },
  {
    id: 'pharma-clinical',
    category: 'clinical',
    kpis: [
      {
        name: 'Clinical Trial Enrollment Rate',
        description: 'Rate of patient enrollment in clinical trials',
        formula: 'Patients Enrolled / Patient Enrollment Target * 100',
        target: 95,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 85, topQuartile: 98 },
        drillDowns: ['Trial Phase', 'Indication', 'Site Performance', 'Geography']
      },
      {
        name: 'Investigator Engagement Score',
        description: 'Engagement level of key opinion leaders and investigators',
        formula: 'Weighted average of investigator engagement metrics',
        target: 8.2,
        unit: 'score',
        frequency: 'quarterly',
        benchmark: { industry: 7.5, topQuartile: 8.8 },
        drillDowns: ['Therapeutic Area', 'Research Institution', 'Engagement Type']
      },
      {
        name: 'Regulatory Submission Timeline',
        description: 'Average time from study completion to regulatory submission',
        formula: 'Sum of submission timelines / Number of submissions',
        target: 180,
        unit: 'days',
        frequency: 'quarterly',
        benchmark: { industry: 220, topQuartile: 150 },
        drillDowns: ['Submission Type', 'Therapeutic Area', 'Regulatory Authority']
      },
      {
        name: 'Real-World Evidence Generation',
        description: 'Number of real-world studies initiated or completed',
        formula: 'Count of RWE studies with meaningful outcomes',
        target: 12,
        unit: 'studies',
        frequency: 'quarterly',
        benchmark: { industry: 8, topQuartile: 15 },
        drillDowns: ['Study Type', 'Patient Population', 'Data Source']
      }
    ]
  },
  {
    id: 'pharma-compliance',
    category: 'compliance',
    kpis: [
      {
        name: 'Compliance Training Completion',
        description: 'Percentage of required compliance training completed',
        formula: 'Completed Training Modules / Required Training Modules * 100',
        target: 100,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 95, topQuartile: 100 },
        drillDowns: ['Training Type', 'Employee Role', 'Geographic Region']
      },
      {
        name: 'Adverse Event Reporting Timeliness',
        description: 'Percentage of adverse events reported within regulatory timeframes',
        formula: 'On-Time AE Reports / Total AE Reports * 100',
        target: 98,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 92, topQuartile: 99 },
        drillDowns: ['Severity', 'Product', 'Geographic Region', 'Report Type']
      },
      {
        name: 'Promotional Material Compliance',
        description: 'Percentage of promotional materials passing compliance review',
        formula: 'Approved Materials / Total Materials Submitted * 100',
        target: 92,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 85, topQuartile: 95 },
        drillDowns: ['Material Type', 'Therapeutic Area', 'Review Stage']
      },
      {
        name: 'Inspection Readiness Score',
        description: 'Readiness score for regulatory inspections',
        formula: 'Weighted average of inspection readiness criteria',
        target: 9.2,
        unit: 'score',
        frequency: 'quarterly',
        benchmark: { industry: 8.5, topQuartile: 9.5 },
        drillDowns: ['Facility', 'Process Area', 'Audit History']
      }
    ]
  },
  {
    id: 'pharma-territory',
    category: 'territory',
    kpis: [
      {
        name: 'Healthcare Provider Coverage',
        description: 'Percentage of target HCPs contacted within frequency guidelines',
        formula: 'HCPs Contacted per Guidelines / Total Target HCPs * 100',
        target: 88,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 82, topQuartile: 92 },
        drillDowns: ['HCP Tier', 'Specialty', 'Territory', 'Call Frequency']
      },
      {
        name: 'Territory Penetration Rate',
        description: 'Percentage of potential prescribers actively prescribing',
        formula: 'Active Prescribers / Total Potential Prescribers * 100',
        target: 65,
        unit: '%',
        frequency: 'quarterly',
        benchmark: { industry: 58, topQuartile: 72 },
        drillDowns: ['Specialty', 'Institution Type', 'Geographic Density']
      },
      {
        name: 'Market Share by Territory',
        description: 'Product market share within each sales territory',
        formula: 'Territory Product Sales / Total Territory Market Sales * 100',
        target: 28,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 24, topQuartile: 32 },
        drillDowns: ['Product', 'Competitor Analysis', 'Therapeutic Class']
      },
      {
        name: 'New Prescriber Acquisition',
        description: 'Number of new prescribers acquired per territory per month',
        formula: 'New Prescribers This Month - Churn',
        target: 15,
        unit: 'prescribers',
        frequency: 'monthly',
        benchmark: { industry: 12, topQuartile: 18 },
        drillDowns: ['Acquisition Channel', 'Prescriber Profile', 'Onboarding Success']
      },
      {
        name: 'Call Effectiveness Score',
        description: 'Quality and effectiveness rating of sales calls',
        formula: 'Weighted average of call quality metrics',
        target: 8.5,
        unit: 'score',
        frequency: 'monthly',
        benchmark: { industry: 7.8, topQuartile: 9.0 },
        drillDowns: ['Call Type', 'Message Delivery', 'HCP Feedback', 'Follow-up Actions']
      },
      {
        name: 'Digital Engagement Rate',
        description: 'HCP engagement with digital marketing channels',
        formula: 'Digital Interactions / Digital Outreach Attempts * 100',
        target: 42,
        unit: '%',
        frequency: 'monthly',
        benchmark: { industry: 35, topQuartile: 50 },
        drillDowns: ['Channel Type', 'Content Category', 'HCP Preference', 'Device Type']
      }
    ]
  }
];

// Preset dashboard configurations for pharmaceutical sales roles
export const PHARMA_DASHBOARD_TEMPLATES = {
  territory_manager: {
    name: 'Territory Sales Manager Dashboard',
    description: 'Key metrics for pharmaceutical territory management',
    kpis: [
      'Monthly Prescription Revenue',
      'Healthcare Provider Coverage',
      'Territory Penetration Rate',
      'New Prescriber Acquisition',
      'Call Effectiveness Score',
      'Market Share by Territory'
    ]
  },
  regional_manager: {
    name: 'Regional Sales Manager Dashboard', 
    description: 'Regional performance and market access metrics',
    kpis: [
      'Revenue per Territory',
      'Formulary Win Rate',
      'Market Access Coverage',
      'Territory Penetration Rate',
      'Clinical Trial Enrollment Rate',
      'Compliance Training Completion'
    ]
  },
  medical_affairs: {
    name: 'Medical Affairs Dashboard',
    description: 'Clinical and regulatory performance metrics',
    kpis: [
      'Clinical Trial Enrollment Rate',
      'Investigator Engagement Score',
      'Real-World Evidence Generation',
      'Regulatory Submission Timeline',
      'Adverse Event Reporting Timeliness',
      'Inspection Readiness Score'
    ]
  },
  commercial_lead: {
    name: 'Commercial Leadership Dashboard',
    description: 'Strategic commercial metrics and portfolio performance',
    kpis: [
      'Product Portfolio Revenue Mix',
      'New Product Launch Revenue',
      'Formulary Win Rate',
      'Market Access Coverage',
      'Payer Negotiation Success Rate',
      'Overall Market Share by Territory'
    ]
  }
};