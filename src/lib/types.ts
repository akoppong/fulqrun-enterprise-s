export interface User {
  id: string;
  name: string;
  email: string;
  role: 'rep' | 'manager' | 'admin';
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  role: 'champion' | 'decision-maker' | 'influencer' | 'user' | 'blocker';
  createdAt: Date;
  updatedAt: Date;
}

export interface MEDDPICC {
  metrics: string; // What economic impact can we measure?
  economicBuyer: string; // Who has the economic authority?
  decisionCriteria: string; // What criteria will they use to decide?
  decisionProcess: string; // How will they make the decision?
  paperProcess: string; // What's the approval/procurement process?
  implicate Pain: string; // What pain are we addressing?
  champion: string; // Who is actively selling for us?
  score: number; // 0-100 qualification score
}

export interface Opportunity {
  id: string;
  companyId: string;
  contactId: string;
  title: string;
  description: string;
  value: number;
  stage: 'prospect' | 'engage' | 'acquire' | 'keep';
  probability: number;
  expectedCloseDate: Date;
  ownerId: string;
  meddpicc: MEDDPICC;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineMetrics {
  totalValue: number;
  totalOpportunities: number;
  averageDealSize: number;
  averageSalesCycle: number;
  conversionRate: number;
  stageDistribution: {
    prospect: number;
    engage: number;
    acquire: number;
    keep: number;
  };
}

export type PeakStage = 'prospect' | 'engage' | 'acquire' | 'keep';

export const PEAK_STAGES: { value: PeakStage; label: string; description: string; color: string }[] = [
  {
    value: 'prospect',
    label: 'Prospect',
    description: 'Identifying and qualifying potential customers',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    value: 'engage',
    label: 'Engage',
    description: 'Building relationships and understanding needs',
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'acquire',
    label: 'Acquire',
    description: 'Negotiating and closing the deal',
    color: 'bg-orange-100 text-orange-800'
  },
  {
    value: 'keep',
    label: 'Keep',
    description: 'Retention, expansion, and customer success',
    color: 'bg-green-100 text-green-800'
  }
];