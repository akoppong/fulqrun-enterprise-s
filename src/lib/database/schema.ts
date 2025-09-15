/**
 * Database Schema Definitions
 * 
 * Defines the normalized database schema for the FulQrun CRM system
 * with proper relationships and constraints.
 */

import { z } from 'zod';

// ========================================
// CORE ENTITY SCHEMAS
// ========================================

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'sales_rep', 'viewer']),
  avatar_url: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
  last_login_at: z.string().optional(),
});

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  size: z.enum(['Small', 'Medium', 'Large', 'Enterprise']),
  website: z.string().url().optional(),
  address: z.string().optional(),
  revenue: z.number().optional(),
  employees: z.number().optional(),
  region: z.string(),
  country: z.string(),
  segment_id: z.string().optional(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ContactSchema = z.object({
  id: z.string(),
  company_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  region: z.string(),
  country: z.string(),
  is_primary: z.boolean().default(false),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  company_id: z.string(),
  primary_contact_id: z.string().optional(),
  assigned_to: z.string(),
  value: z.number(),
  currency: z.string().default('USD'),
  stage: z.enum(['prospect', 'engage', 'acquire', 'keep', 'closed-won', 'closed-lost']),
  probability: z.number().min(0).max(100),
  expected_close_date: z.string(),
  actual_close_date: z.string().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  is_active: z.boolean().default(true),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ========================================
// SALES METHODOLOGY SCHEMAS
// ========================================

export const MEDDPICCSchema = z.object({
  id: z.string(),
  opportunity_id: z.string(),
  metrics: z.number().min(0).max(10).default(0),
  economic_buyer: z.number().min(0).max(10).default(0),
  decision_criteria: z.number().min(0).max(10).default(0),
  decision_process: z.number().min(0).max(10).default(0),
  paper_process: z.number().min(0).max(10).default(0),
  identify_pain: z.number().min(0).max(10).default(0),
  champion: z.number().min(0).max(10).default(0),
  competition: z.number().min(0).max(10).default(0),
  total_score: z.number().min(0).max(80),
  confidence_level: z.enum(['low', 'medium', 'high']).default('medium'),
  notes: z.string().optional(),
  last_updated_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PEAKProcessSchema = z.object({
  id: z.string(),
  opportunity_id: z.string(),
  prospect_score: z.number().min(0).max(100).default(0),
  engage_score: z.number().min(0).max(100).default(0),
  acquire_score: z.number().min(0).max(100).default(0),
  keep_score: z.number().min(0).max(100).default(0),
  current_stage: z.enum(['prospect', 'engage', 'acquire', 'keep']),
  stage_entry_date: z.string(),
  days_in_stage: z.number().default(0),
  total_days_in_pipeline: z.number().default(0),
  notes: z.string().optional(),
  last_updated_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ========================================
// ACTIVITY & TRACKING SCHEMAS
// ========================================

export const ActivitySchema = z.object({
  id: z.string(),
  opportunity_id: z.string(),
  contact_id: z.string().optional(),
  type: z.enum(['call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'negotiation']),
  subject: z.string(),
  description: z.string().optional(),
  outcome: z.enum(['positive', 'neutral', 'negative']).optional(),
  status: z.enum(['planned', 'completed', 'cancelled']).default('planned'),
  scheduled_date: z.string().optional(),
  completed_date: z.string().optional(),
  duration_minutes: z.number().optional(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const NoteSchema = z.object({
  id: z.string(),
  opportunity_id: z.string(),
  activity_id: z.string().optional(),
  content: z.string(),
  type: z.enum(['general', 'call_note', 'meeting_note', 'internal', 'customer_feedback']),
  is_private: z.boolean().default(false),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ========================================
// CONFIGURATION SCHEMAS
// ========================================

export const CustomerSegmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  criteria: z.record(z.any()).optional(),
  is_active: z.boolean().default(true),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PipelineConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  stages: z.array(z.object({
    id: z.string(),
    name: z.string(),
    order: z.number(),
    probability_default: z.number().min(0).max(100),
    color: z.string().optional(),
  })),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ========================================
// ANALYTICS & REPORTING SCHEMAS
// ========================================

export const KPIMetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  value: z.number(),
  target: z.number().optional(),
  unit: z.string().optional(),
  trend: z.enum(['up', 'down', 'stable']).optional(),
  period: z.string(), // e.g., '2024-01', 'Q1-2024'
  user_id: z.string().optional(), // For user-specific metrics
  created_at: z.string(),
});

// ========================================
// TYPE EXPORTS
// ========================================

export type User = z.infer<typeof UserSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type MEDDPICC = z.infer<typeof MEDDPICCSchema>;
export type PEAKProcess = z.infer<typeof PEAKProcessSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Note = z.infer<typeof NoteSchema>;
export type CustomerSegment = z.infer<typeof CustomerSegmentSchema>;
export type PipelineConfig = z.infer<typeof PipelineConfigSchema>;
export type KPIMetric = z.infer<typeof KPIMetricSchema>;

// ========================================
// DATABASE METADATA
// ========================================

export interface DatabaseSchema {
  users: User;
  companies: Company;
  contacts: Contact;
  opportunities: Opportunity;
  meddpicc: MEDDPICC;
  peak_process: PEAKProcess;
  activities: Activity;
  notes: Note;
  customer_segments: CustomerSegment;
  pipeline_configs: PipelineConfig;
  kpi_metrics: KPIMetric;
}

export interface TableConfig {
  schema: z.ZodSchema;
  indexes: string[];
  foreignKeys: { field: string; references: { table: string; field: string } }[];
  defaultValues?: Record<string, any>;
}

export const DATABASE_CONFIG: Record<keyof DatabaseSchema, TableConfig> = {
  users: {
    schema: UserSchema,
    indexes: ['email', 'role', 'is_active'],
    foreignKeys: [],
  },
  companies: {
    schema: CompanySchema,
    indexes: ['name', 'industry', 'region', 'segment_id', 'created_by'],
    foreignKeys: [
      { field: 'segment_id', references: { table: 'customer_segments', field: 'id' } },
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  contacts: {
    schema: ContactSchema,
    indexes: ['company_id', 'email', 'is_primary', 'created_by'],
    foreignKeys: [
      { field: 'company_id', references: { table: 'companies', field: 'id' } },
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  opportunities: {
    schema: OpportunitySchema,
    indexes: ['company_id', 'primary_contact_id', 'assigned_to', 'stage', 'created_by', 'is_active'],
    foreignKeys: [
      { field: 'company_id', references: { table: 'companies', field: 'id' } },
      { field: 'primary_contact_id', references: { table: 'contacts', field: 'id' } },
      { field: 'assigned_to', references: { table: 'users', field: 'id' } },
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  meddpicc: {
    schema: MEDDPICCSchema,
    indexes: ['opportunity_id', 'confidence_level', 'last_updated_by'],
    foreignKeys: [
      { field: 'opportunity_id', references: { table: 'opportunities', field: 'id' } },
      { field: 'last_updated_by', references: { table: 'users', field: 'id' } },
    ],
  },
  peak_process: {
    schema: PEAKProcessSchema,
    indexes: ['opportunity_id', 'current_stage', 'last_updated_by'],
    foreignKeys: [
      { field: 'opportunity_id', references: { table: 'opportunities', field: 'id' } },
      { field: 'last_updated_by', references: { table: 'users', field: 'id' } },
    ],
  },
  activities: {
    schema: ActivitySchema,
    indexes: ['opportunity_id', 'contact_id', 'type', 'status', 'created_by'],
    foreignKeys: [
      { field: 'opportunity_id', references: { table: 'opportunities', field: 'id' } },
      { field: 'contact_id', references: { table: 'contacts', field: 'id' } },
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  notes: {
    schema: NoteSchema,
    indexes: ['opportunity_id', 'activity_id', 'type', 'created_by'],
    foreignKeys: [
      { field: 'opportunity_id', references: { table: 'opportunities', field: 'id' } },
      { field: 'activity_id', references: { table: 'activities', field: 'id' } },
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  customer_segments: {
    schema: CustomerSegmentSchema,
    indexes: ['name', 'is_active', 'created_by'],
    foreignKeys: [
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  pipeline_configs: {
    schema: PipelineConfigSchema,
    indexes: ['name', 'is_default', 'is_active', 'created_by'],
    foreignKeys: [
      { field: 'created_by', references: { table: 'users', field: 'id' } },
    ],
  },
  kpi_metrics: {
    schema: KPIMetricSchema,
    indexes: ['name', 'category', 'period', 'user_id'],
    foreignKeys: [
      { field: 'user_id', references: { table: 'users', field: 'id' } },
    ],
  },
};

// ========================================
// DATABASE VERSION SCHEMA
// ========================================

export const DatabaseVersionSchema = z.object({
  version: z.number(),
  applied_at: z.string(),
  description: z.string(),
});

export type DatabaseVersion = z.infer<typeof DatabaseVersionSchema>;