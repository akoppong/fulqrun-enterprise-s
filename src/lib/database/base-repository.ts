/**
 * Base Repository Class
 * 
 * Provides common database operations with validation, caching, and error handling
 */

import { z } from 'zod';
import { DatabaseSchema, TableConfig, DATABASE_CONFIG } from './schema';

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class DatabaseError extends Error {
  constructor(
    public operation: string,
    public table: string,
    public originalError?: Error,
    public validationErrors?: ValidationError[]
  ) {
    super(`Database ${operation} failed for table ${table}: ${originalError?.message || 'Unknown error'}`);
    this.name = 'DatabaseError';
  }
}

export abstract class BaseRepository<T extends Record<string, any>> {
  protected abstract tableName: keyof DatabaseSchema;
  protected abstract schema: z.ZodSchema<T>;
  
  protected get tableConfig(): TableConfig {
    return DATABASE_CONFIG[this.tableName];
  }

  protected get storagePrefix(): string {
    return `fulqrun_db_${this.tableName}`;
  }

  protected get indexPrefix(): string {
    return `${this.storagePrefix}_idx`;
  }

  protected get metaKey(): string {
    return `${this.storagePrefix}_meta`;
  }

  /**
   * Generate storage key for a record
   */
  protected getRecordKey(id: string): string {
    return `${this.storagePrefix}:${id}`;
  }

  /**
   * Generate index key
   */
  protected getIndexKey(field: string, value: any): string {
    return `${this.indexPrefix}:${field}:${this.normalizeIndexValue(value)}`;
  }

  /**
   * Normalize index values for consistent storage
   */
  protected normalizeIndexValue(value: any): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value.toLowerCase();
    if (value instanceof Date) return value.toISOString();
    return JSON.stringify(value);
  }

  /**
   * Validate record against schema
   */
  protected validateRecord(data: Partial<T>): { isValid: boolean; errors: ValidationError[] } {
    try {
      this.schema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
      }
      return {
        isValid: false,
        errors: [{ field: 'unknown', message: 'Validation failed' }]
      };
    }
  }

  /**
   * Validate foreign key constraints
   */
  protected async validateForeignKeys(data: Partial<T>): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const foreignKeys = this.tableConfig.foreignKeys;

    for (const fk of foreignKeys) {
      const value = data[fk.field as keyof T];
      if (value && typeof value === 'string') {
        const exists = await this.foreignKeyExists(fk.references.table, fk.references.field, value);
        if (!exists) {
          errors.push({
            field: fk.field,
            message: `Referenced ${fk.references.table}.${fk.references.field} '${value}' does not exist`
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check if foreign key reference exists
   */
  protected async foreignKeyExists(table: string, field: string, value: string): Promise<boolean> {
    try {
      const key = `fulqrun_db_${table}:${value}`;
      const result = await spark.kv.get(key);
      return result !== undefined && result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Add current timestamps to record
   */
  protected addTimestamps(data: Partial<T>, isUpdate: boolean = false): Partial<T> {
    const now = new Date().toISOString();
    
    if (!isUpdate) {
      (data as any).created_at = now;
    }
    (data as any).updated_at = now;
    
    return data;
  }

  /**
   * Generate UUID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update indexes for a record
   */
  protected async updateIndexes(record: T, oldRecord?: T): Promise<void> {
    const indexes = this.tableConfig.indexes;
    
    // Remove old indexes if updating
    if (oldRecord) {
      for (const field of indexes) {
        const oldValue = oldRecord[field as keyof T];
        if (oldValue !== undefined) {
          const oldIndexKey = this.getIndexKey(field, oldValue);
          await this.removeFromIndex(oldIndexKey, record.id);
        }
      }
    }

    // Add new indexes
    for (const field of indexes) {
      const value = record[field as keyof T];
      if (value !== undefined) {
        const indexKey = this.getIndexKey(field, value);
        await this.addToIndex(indexKey, record.id);
      }
    }
  }

  /**
   * Add record ID to index
   */
  protected async addToIndex(indexKey: string, recordId: string): Promise<void> {
    try {
      const existing = await spark.kv.get<string[]>(indexKey) || [];
      if (!existing.includes(recordId)) {
        existing.push(recordId);
        await spark.kv.set(indexKey, existing);
      }
    } catch (error) {
      console.warn(`Failed to update index ${indexKey}:`, error);
    }
  }

  /**
   * Remove record ID from index
   */
  protected async removeFromIndex(indexKey: string, recordId: string): Promise<void> {
    try {
      const existing = await spark.kv.get<string[]>(indexKey) || [];
      const filtered = existing.filter(id => id !== recordId);
      
      if (filtered.length > 0) {
        await spark.kv.set(indexKey, filtered);
      } else {
        await spark.kv.delete(indexKey);
      }
    } catch (error) {
      console.warn(`Failed to remove from index ${indexKey}:`, error);
    }
  }

  /**
   * Get record IDs from index
   */
  protected async getFromIndex(field: string, value: any): Promise<string[]> {
    try {
      const indexKey = this.getIndexKey(field, value);
      return await spark.kv.get<string[]>(indexKey) || [];
    } catch {
      return [];
    }
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const id = this.generateId();
      const recordData = {
        ...data,
        id,
      } as T;

      // Add timestamps
      const timestampedData = this.addTimestamps(recordData) as T;

      // Validate schema
      const schemaValidation = this.validateRecord(timestampedData);
      if (!schemaValidation.isValid) {
        throw new DatabaseError('create', this.tableName, undefined, schemaValidation.errors);
      }

      // Validate foreign keys
      const fkErrors = await this.validateForeignKeys(timestampedData);
      if (fkErrors.length > 0) {
        throw new DatabaseError('create', this.tableName, undefined, fkErrors);
      }

      // Store record
      const recordKey = this.getRecordKey(id);
      await spark.kv.set(recordKey, timestampedData);

      // Update indexes
      await this.updateIndexes(timestampedData);

      return timestampedData;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('create', this.tableName, error as Error);
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const recordKey = this.getRecordKey(id);
      const record = await spark.kv.get<T>(recordKey);
      return record || null;
    } catch (error) {
      throw new DatabaseError('findById', this.tableName, error as Error);
    }
  }

  /**
   * Find records by field value using index
   */
  async findBy(field: keyof T, value: any): Promise<T[]> {
    try {
      const recordIds = await this.getFromIndex(field as string, value);
      const records: T[] = [];

      for (const id of recordIds) {
        const record = await this.findById(id);
        if (record) {
          records.push(record);
        }
      }

      return records;
    } catch (error) {
      throw new DatabaseError('findBy', this.tableName, error as Error);
    }
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(options: QueryOptions = {}): Promise<{ data: T[]; total: number }> {
    try {
      let recordIds: string[] = [];

      // If we have a where clause with indexed fields, use indexes
      if (options.where) {
        const indexedFields = this.tableConfig.indexes;
        const whereField = Object.keys(options.where).find(field => indexedFields.includes(field));
        
        if (whereField) {
          recordIds = await this.getFromIndex(whereField, options.where[whereField]);
        }
      }

      // If no indexed query, get all records (expensive!)
      if (recordIds.length === 0 && !options.where) {
        const allKeys = await spark.kv.keys();
        recordIds = allKeys
          .filter(key => key.startsWith(this.storagePrefix + ':'))
          .map(key => key.replace(this.storagePrefix + ':', ''));
      }

      // Fetch records
      const allRecords: T[] = [];
      for (const id of recordIds) {
        const record = await this.findById(id);
        if (record) {
          allRecords.push(record);
        }
      }

      // Apply filtering
      let filteredRecords = allRecords;
      if (options.where) {
        filteredRecords = allRecords.filter(record => {
          return Object.entries(options.where!).every(([field, value]) => {
            return record[field as keyof T] === value;
          });
        });
      }

      // Apply sorting
      if (options.orderBy) {
        filteredRecords.sort((a, b) => {
          const aVal = a[options.orderBy as keyof T];
          const bVal = b[options.orderBy as keyof T];
          
          if (aVal < bVal) return options.orderDirection === 'desc' ? 1 : -1;
          if (aVal > bVal) return options.orderDirection === 'desc' ? -1 : 1;
          return 0;
        });
      }

      const total = filteredRecords.length;

      // Apply pagination
      const offset = options.offset || 0;
      const limit = options.limit || total;
      const paginatedRecords = filteredRecords.slice(offset, offset + limit);

      return { data: paginatedRecords, total };
    } catch (error) {
      throw new DatabaseError('findAll', this.tableName, error as Error);
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T | null> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        return null;
      }

      const updatedData = {
        ...existing,
        ...data,
        id, // Ensure ID doesn't change
      } as T;

      // Add update timestamp
      const timestampedData = this.addTimestamps(updatedData, true) as T;

      // Validate schema
      const schemaValidation = this.validateRecord(timestampedData);
      if (!schemaValidation.isValid) {
        throw new DatabaseError('update', this.tableName, undefined, schemaValidation.errors);
      }

      // Validate foreign keys
      const fkErrors = await this.validateForeignKeys(timestampedData);
      if (fkErrors.length > 0) {
        throw new DatabaseError('update', this.tableName, undefined, fkErrors);
      }

      // Store updated record
      const recordKey = this.getRecordKey(id);
      await spark.kv.set(recordKey, timestampedData);

      // Update indexes
      await this.updateIndexes(timestampedData, existing);

      return timestampedData;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      throw new DatabaseError('update', this.tableName, error as Error);
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    try {
      const existing = await this.findById(id);
      if (!existing) {
        return false;
      }

      // Remove from storage
      const recordKey = this.getRecordKey(id);
      await spark.kv.delete(recordKey);

      // Remove from indexes
      const indexes = this.tableConfig.indexes;
      for (const field of indexes) {
        const value = existing[field as keyof T];
        if (value !== undefined) {
          const indexKey = this.getIndexKey(field, value);
          await this.removeFromIndex(indexKey, id);
        }
      }

      return true;
    } catch (error) {
      throw new DatabaseError('delete', this.tableName, error as Error);
    }
  }

  /**
   * Count records with optional filtering
   */
  async count(where?: Record<string, any>): Promise<number> {
    const result = await this.findAll({ where });
    return result.total;
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    const record = await this.findById(id);
    return record !== null;
  }

  /**
   * Batch operations
   */
  async batchCreate(records: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T[]> {
    const results: T[] = [];
    for (const record of records) {
      const created = await this.create(record);
      results.push(created);
    }
    return results;
  }

  async batchUpdate(updates: Array<{ id: string; data: Partial<Omit<T, 'id' | 'created_at'>> }>): Promise<T[]> {
    const results: T[] = [];
    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      if (updated) {
        results.push(updated);
      }
    }
    return results;
  }

  async batchDelete(ids: string[]): Promise<number> {
    let deletedCount = 0;
    for (const id of ids) {
      const deleted = await this.delete(id);
      if (deleted) {
        deletedCount++;
      }
    }
    return deletedCount;
  }
}