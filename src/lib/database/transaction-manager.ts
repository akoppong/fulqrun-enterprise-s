/**
 * Transaction Manager
 * 
 * Provides transactional support for database operations to ensure data consistency
 */

import { DatabaseError } from './base-repository';

export interface TransactionOperation {
  type: 'create' | 'update' | 'delete';
  table: string;
  id?: string;
  data?: any;
  rollback?: () => Promise<void>;
}

export interface TransactionResult {
  success: boolean;
  operations: number;
  error?: Error;
  rolledBack?: boolean;
}

export class TransactionManager {
  private operations: TransactionOperation[] = [];
  private rollbackStack: Array<() => Promise<void>> = [];
  private isActive = false;

  /**
   * Start a new transaction
   */
  begin(): void {
    if (this.isActive) {
      throw new Error('Transaction already active');
    }
    
    this.isActive = true;
    this.operations = [];
    this.rollbackStack = [];
  }

  /**
   * Add an operation to the transaction
   */
  addOperation(operation: TransactionOperation): void {
    if (!this.isActive) {
      throw new Error('No active transaction');
    }
    
    this.operations.push(operation);
    
    if (operation.rollback) {
      this.rollbackStack.unshift(operation.rollback); // Add to front for reverse order
    }
  }

  /**
   * Commit the transaction
   */
  async commit(): Promise<TransactionResult> {
    if (!this.isActive) {
      throw new Error('No active transaction');
    }

    try {
      // All operations have already been executed and logged
      // In a real database, this would actually commit the transaction
      const operationCount = this.operations.length;
      
      this.cleanup();
      
      return {
        success: true,
        operations: operationCount
      };
    } catch (error) {
      // Rollback on commit failure
      await this.rollback();
      
      return {
        success: false,
        operations: this.operations.length,
        error: error as Error,
        rolledBack: true
      };
    }
  }

  /**
   * Rollback the transaction
   */
  async rollback(): Promise<TransactionResult> {
    if (!this.isActive) {
      throw new Error('No active transaction');
    }

    const operationCount = this.operations.length;
    let rollbackError: Error | undefined;

    try {
      // Execute rollback operations in reverse order
      for (const rollbackOp of this.rollbackStack) {
        await rollbackOp();
      }
    } catch (error) {
      rollbackError = error as Error;
      console.error('Rollback failed:', error);
    }

    this.cleanup();

    return {
      success: !rollbackError,
      operations: operationCount,
      error: rollbackError,
      rolledBack: true
    };
  }

  /**
   * Clean up transaction state
   */
  private cleanup(): void {
    this.isActive = false;
    this.operations = [];
    this.rollbackStack = [];
  }

  /**
   * Check if transaction is active
   */
  isTransactionActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current operations
   */
  getOperations(): readonly TransactionOperation[] {
    return this.operations;
  }
}

// Global transaction manager instance
let globalTransaction: TransactionManager | null = null;

/**
 * Execute operations within a transaction
 */
export async function withTransaction<T>(
  operations: () => Promise<T>
): Promise<T> {
  const transaction = new TransactionManager();
  globalTransaction = transaction;
  
  try {
    transaction.begin();
    const result = await operations();
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    globalTransaction = null;
  }
}

/**
 * Get current transaction (if any)
 */
export function getCurrentTransaction(): TransactionManager | null {
  return globalTransaction;
}

/**
 * Create a rollback operation for KV storage
 */
export function createKVRollback(
  operation: 'create' | 'update' | 'delete',
  key: string,
  originalValue?: any
): () => Promise<void> {
  return async () => {
    try {
      switch (operation) {
        case 'create':
          // Rollback create by deleting
          await spark.kv.delete(key);
          break;
          
        case 'update':
          // Rollback update by restoring original value
          if (originalValue !== undefined) {
            await spark.kv.set(key, originalValue);
          } else {
            await spark.kv.delete(key);
          }
          break;
          
        case 'delete':
          // Rollback delete by recreating
          if (originalValue !== undefined) {
            await spark.kv.set(key, originalValue);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to rollback ${operation} for key ${key}:`, error);
      throw error;
    }
  };
}

/**
 * Enhanced repository operations with transaction support
 */
export class TransactionalRepository {
  /**
   * Execute a repository operation with transaction logging
   */
  static async executeWithLogging<T>(
    table: string,
    operation: 'create' | 'update' | 'delete',
    id: string | undefined,
    data: any | undefined,
    executor: () => Promise<T>,
    createRollback?: () => () => Promise<void>
  ): Promise<T> {
    const transaction = getCurrentTransaction();
    
    try {
      const result = await executor();
      
      // Log operation to transaction if active
      if (transaction) {
        transaction.addOperation({
          type: operation,
          table,
          id,
          data,
          rollback: createRollback?.()
        });
      }
      
      return result;
    } catch (error) {
      // If we're in a transaction, the error will be handled by the transaction manager
      throw error;
    }
  }

  /**
   * Safe KV operation with transaction support
   */
  static async safeKVOperation<T>(
    operation: 'get' | 'set' | 'delete',
    key: string,
    value?: T
  ): Promise<T | undefined> {
    const transaction = getCurrentTransaction();
    
    try {
      let originalValue: T | undefined;
      
      // Get original value for rollback purposes
      if (transaction && (operation === 'set' || operation === 'delete')) {
        try {
          originalValue = await spark.kv.get<T>(key);
        } catch {
          // Ignore errors when getting original value
        }
      }
      
      let result: T | undefined;
      
      switch (operation) {
        case 'get':
          result = await spark.kv.get<T>(key);
          break;
          
        case 'set':
          if (value === undefined) {
            throw new Error('Value required for set operation');
          }
          await spark.kv.set(key, value);
          result = value;
          
          // Log rollback operation
          if (transaction) {
            const rollback = createKVRollback(
              originalValue === undefined ? 'create' : 'update',
              key,
              originalValue
            );
            
            transaction.addOperation({
              type: originalValue === undefined ? 'create' : 'update',
              table: 'kv',
              id: key,
              data: value,
              rollback
            });
          }
          break;
          
        case 'delete':
          await spark.kv.delete(key);
          result = undefined;
          
          // Log rollback operation
          if (transaction && originalValue !== undefined) {
            const rollback = createKVRollback('delete', key, originalValue);
            
            transaction.addOperation({
              type: 'delete',
              table: 'kv',
              id: key,
              data: undefined,
              rollback
            });
          }
          break;
      }
      
      return result;
    } catch (error) {
      throw new DatabaseError(operation, 'kv', error as Error);
    }
  }
}