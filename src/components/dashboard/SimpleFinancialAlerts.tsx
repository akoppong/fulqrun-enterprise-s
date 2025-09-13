import React from 'react';
import { Opportunity } from '@/lib/types';

interface FinancialAlertsProps {
  opportunities: Opportunity[];
  isLoading?: boolean;
}

// Simplified FinancialAlerts component that doesn't use KV storage
// This prevents the KV errors while maintaining the interface
export function SimpleFinancialAlerts({ opportunities, isLoading }: FinancialAlertsProps) {
  // Don't do anything if loading or no opportunities
  if (isLoading || !Array.isArray(opportunities) || opportunities.length === 0) {
    return null;
  }

  // This component is now just a placeholder to prevent errors
  // It doesn't generate alerts to avoid KV storage issues
  return null;
}

export { SimpleFinancialAlerts as FinancialAlerts };