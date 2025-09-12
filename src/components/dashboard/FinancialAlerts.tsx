import React, { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Opportunity } from '@/lib/types';

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
  const [alerts, setAlerts] = useKV<FinancialAlert[]>('financial-alerts', []);
  const [lastAlertCheck, setLastAlertCheck] = useKV('last-alert-check', 0);

  const checkForAlerts = useCallback(() => {
    try {
      const now = Date.now();
      
      // Only check for alerts every 30 seconds to avoid spam and KV issues
      if (now - lastAlertCheck < 30000) return;
      
      // Safely calculate totals with fallbacks
      const validOpportunities = opportunities.filter(opp => 
        opp && typeof opp.value === 'number' && !isNaN(opp.value)
      );
      
      if (validOpportunities.length === 0) return;
      
      const closedDeals = validOpportunities.filter(opp => opp.stage === 'closed-won' || opp.stage === 'keep');
      const closedRevenue = closedDeals.reduce((sum, opp) => sum + (opp.value || 0), 0);
      
      const newAlerts: FinancialAlert[] = [];
      
      // Revenue milestone alerts - less frequent
      const milestones = [100000, 500000, 1000000];
      milestones.forEach(milestone => {
        if (closedRevenue >= milestone && !alerts.some(alert => 
          alert.type === 'revenue_milestone' && 
          alert.message.includes(milestone.toString())
        )) {
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
      
      // Deal risk alerts for high-value opportunities
      validOpportunities
        .filter(opp => opp.value > 50000 && (opp.stage === 'acquire' || opp.stage === 'proposal'))
        .forEach(opp => {
          try {
            const expectedCloseDate = new Date(opp.expectedCloseDate);
            if (isNaN(expectedCloseDate.getTime())) return;
            
            const daysUntilClose = Math.ceil((expectedCloseDate.getTime() - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilClose <= 7 && daysUntilClose > 0 && !alerts.some(alert => 
              alert.type === 'deal_risk' && 
              alert.message.includes(opp.id)
            )) {
              newAlerts.push({
                id: `risk-${opp.id}-${now}`,
                type: 'deal_risk',
                title: 'High-Value Deal Closing Soon',
                message: `"${opp.title || opp.name || 'Untitled Opportunity'}" ($${opp.value.toLocaleString()}) closes in ${daysUntilClose} days.`,
                timestamp: new Date().toISOString(),
                severity: 'warning',
                acknowledged: false
              });
            }
          } catch (error) {
            console.warn('Error processing opportunity date:', error);
          }
        });
      
      // Only add alerts if we have new ones and update state once
      if (newAlerts.length > 0) {
        // Update alerts state
        setAlerts(prevAlerts => {
          const updatedAlerts = [...prevAlerts, ...newAlerts];
          
          // Show toast notifications for new alerts
          newAlerts.forEach(alert => {
            const toastFunction = alert.severity === 'success' ? toast.success : 
                                alert.severity === 'warning' ? toast.warning : 
                                toast.info;
            
            toastFunction(alert.title, {
              description: alert.message,
              duration: 5000
            });
          });
          
          return updatedAlerts;
        });
      }
      
      // Update last check time
      setLastAlertCheck(now);
      
    } catch (error) {
      console.error('Error in financial alerts check:', error);
    }
  }, [opportunities, alerts, lastAlertCheck, setAlerts, setLastAlertCheck]);

  useEffect(() => {
    // Only run if we have opportunities
    if (!opportunities || opportunities.length === 0) return;
    
    // Initial check after a short delay
    const initialTimeout = setTimeout(checkForAlerts, 2000);
    
    // Set up interval for ongoing checks - less frequent
    const interval = setInterval(checkForAlerts, 45000); // Check every 45 seconds
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkForAlerts, opportunities.length]);

  // This component doesn't render anything visible - it just manages alerts
  return null;
}