// Core business entity types
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

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website?: string;
  address?: string;
  revenue?: number;
  employees?: number;
  geography?: string;
  segmentId?: string;
  segmentAssignment?: SegmentAssignment;
  customFields?: Record<string, any>;
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

// Forward declarations for circular references
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