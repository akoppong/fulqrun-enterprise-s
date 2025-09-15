/**
 * Comprehensive Database System for FulQrun CRM
 * 
 * Provides a normalized, relational database structure built on top of Spark's KV store
 * with proper schema validation, foreign key constraints, and transactional support.
 */

export * from './schema';
export * from './base-repository';
export * from './transaction-manager';
export * from './migration-manager';
export * from './repositories';
export * from './database-manager';