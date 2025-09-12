import React, { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Opportunity } from '@/lib/types';
import { safeKVGet, safeKVSet } from '@/lib/kv-storage-manager';

interface FinancialAlertsProps {
  opportunities: Opportunity[];
}

interface FinancialAlert {
  id: string;
  type: 'revenue_milestone' | 'deal_risk' | 'target_progress' | 'growth_spike';
  title: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'success';
  acknowledged: boolean;
}

export function FinancialAlerts({ opportunities }: FinancialAlertsProps) {
  // Use safe KV storage instead of direct useKV to prevent errors
  const [alerts, setAlertsKV] = useKV<FinancialAlert[]>('financial-alerts', []);
  const [lastAlertCheck, setLastAlertCheckKV] = useKV<number>('last-alert-check', 0);

  // Wrapper functions for safer operations
  const setAlerts = useCallback(async (newAlerts: FinancialAlert[]) => {
    try {
      // Validate and limit alerts to prevent storage bloat
      const validAlerts = newAlerts
        .filter(alert => alert && alert.id && alert.type && alert.message)
        .slice(0, 20); // Limit to 20 alerts max
        
      const success = await safeKVSet('financial-alerts', validAlerts, {
        maxRetries: 2,
        validateData: true,
        errorHandler: {
          onError: (key, error) => console.warn(`Failed to save alerts: ${error.message}`),
          onFallback: () => console.info('Using local state for alerts')
        }
      });
      
      if (success) {
        setAlertsKV(validAlerts);
      }
    } catch (error) {
      console.warn('Error updating alerts:', error);
    }
  }, [setAlertsKV]);

  const setLastAlertCheck = useCallback(async (timestamp: number) => {
    try {
      const success = await safeKVSet('last-alert-check', timestamp, {
        maxRetries: 1,
        validateData: true
      });
      
      if (success) {
        setLastAlertCheckKV(timestamp);
      }
    } catch (error) {
      console.warn('Error updating last alert check:', error);
    }
  }, [setLastAlertCheckKV]);

  const checkForAlerts = useCallback(() => {
    try {
      const now = Date.now();
      
      // Only check for alerts every 60 seconds to avoid KV storage overload
      if (now - lastAlertCheck < 60000) return;
      
      // Safely calculate totals with fallbacks
      const validOpportunities = opportunities.filter(opp => 
        opp && typeof opp.value === 'number' && !isNaN(opp.value)
      );
      
      if (validOpportunities.length === 0) {
        setLastAlertCheck(now);
        return;
      }
      
      const closedDeals = validOpportunities.filter(opp => opp.stage === 'closed-won' || opp.stage === 'keep');
      const closedRevenue = closedDeals.reduce((sum, opp) => sum + (opp.value || 0), 0);
      
      const newAlerts: FinancialAlert[] = [];
      
      // Revenue milestone alerts - less frequent and smarter filtering
      const milestones = [100000, 500000, 1000000];
      milestones.forEach(milestone => {
        const existingAlert = alerts.find(alert => 
          alert.type === 'revenue_milestone' && 
          alert.message.includes(milestone.toString()) &&
          !alert.acknowledged
        );
        
        if (closedRevenue >= milestone && !existingAlert) {
          newAlerts.push({
            id: `milestone-${milestone}-${now}`,
            type: 'revenue_milestone',
            title: 'Revenue Milestone Reached!',
            message: `Congratulations! You've reached $${milestone.toLocaleString()} in closed revenue.`,
            timestamp: new Date().toISOString(),
            severity: 'success',
            acknowledged: false
          });
        }
      });
      
      // Deal risk alerts for high-value opportunities - reduced frequency
      const oneWeekFromNow = now + (7 * 24 * 60 * 60 * 1000);
      validOpportunities
        .filter(opp => opp.value > 50000 && (opp.stage === 'acquire' || opp.stage === 'proposal'))
        .slice(0, 5) // Limit to 5 deals to prevent KV storage overload
        .forEach(opp => {
          try {
            const expectedCloseDate = new Date(opp.expectedCloseDate);
            if (isNaN(expectedCloseDate.getTime())) return;
            
            const daysUntilClose = Math.ceil((expectedCloseDate.getTime() - now) / (1000 * 60 * 60 * 24));
            
            const existingAlert = alerts.find(alert => 
              alert.type === 'deal_risk' && 
              alert.message.includes(opp.id) &&
              !alert.acknowledged
            );
            
            if (daysUntilClose <= 7 && daysUntilClose > 0 && !existingAlert) {
              newAlerts.push({
                id: `risk-${opp.id}-${now}`,
                type: 'deal_risk',
                title: 'High-Value Deal Closing Soon',
                message: `"${opp.title || 'Untitled Opportunity'}" ($${opp.value.toLocaleString()}) closes in ${daysUntilClose} days.`,
                timestamp: new Date().toISOString(),
                severity: 'warning',
                acknowledged: false
              });
            }
          } catch (error) {
            console.warn('Error processing opportunity date:', error);
          }
        });
      
      // Batch update to prevent multiple KV calls
      if (newAlerts.length > 0) {
        const combinedAlerts = [...alerts, ...newAlerts];
        // Limit total alerts to prevent storage bloat
        const maxAlerts = 15;
        const limitedAlerts = combinedAlerts
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, maxAlerts);
        
        // Update using safe setter
        await setAlerts(limitedAlerts);
        
        // Show toast notifications for new alerts
        newAlerts.forEach(alert => {
          try {
            const toastFunction = alert.severity === 'success' ? toast.success : 
                                alert.severity === 'warning' ? toast.warning : 
                                toast.info;
            
            toastFunction(alert.title, {
              description: alert.message,
              duration: 5000
            });
          } catch (toastError) {
            console.warn('Error showing toast notification:', toastError);
          }
        });
      }
      
      // Always update last check time using safe setter
      await setLastAlertCheck(now);
      
    } catch (error) {
      console.error('Error in financial alerts check:', error);
      // Still update last check time to prevent infinite retry loops
      try {
        await setLastAlertCheck(Date.now());
      } catch (updateError) {
        console.warn('Failed to update last check time:', updateError);
      }
    }
  }, [opportunities, alerts, lastAlertCheck, setAlerts, setLastAlertCheck]);

  useEffect(() => {
    // Only run if we have opportunities
    if (!opportunities || opportunities.length === 0) return;
    
    // Initial check after a delay to prevent startup KV conflicts
    const initialTimeout = setTimeout(checkForAlerts, 5000);
    
    // Set up interval for ongoing checks - much less frequent to prevent KV overload
    const interval = setInterval(checkForAlerts, 120000); // Check every 2 minutes
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkForAlerts, opportunities.length]);

  // This component doesn't render anything visible - it just manages alerts
  return null;
}