/**
 * Core domain types for the FulQrun CRM system
 * Contains foundational user, company, and contact types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'rep' | 'manager' | 'bu_head' | 'executive' | 'admin';
  avatar?: string;
  teamId?: string;
  managerId?: string;
  territory?: string;
  quota?: number;
  targets?: UserTargets;
}

export interface UserTargets {
  monthly: number;
  quarterly: number;
  annual: number;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  members: string[];
  targets: UserTargets;
  region: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address?: string;
  revenue?: number;
  employees?: number;
  geography?: string; // Legacy field - will be migrated to region/country
  region?: string; // Region code (e.g., 'NA', 'EU', 'AS')
  country?: string; // Country code (e.g., 'US', 'GB', 'DE')
  segmentId?: string;
  segmentAssignment?: import('./segments').SegmentAssignment;
  customFields?: Record<string, any>;
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
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
  region?: string; // Region code (e.g., 'NA', 'EU', 'AS')
  country?: string; // Country code (e.g., 'US', 'GB', 'DE')
  address?: string;
  createdAt: string; // ISO date string for reliable serialization
  updatedAt: string; // ISO date string for reliable serialization
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