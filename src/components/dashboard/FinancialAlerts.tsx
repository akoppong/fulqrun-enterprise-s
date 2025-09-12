import React, { useEffect } from 'react';
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
  timestamp: string; // ISO string instead of Date
  severity: 'info' | 'warning' | 'success';
  acknowledged: boolean;
}

export function FinancialAlerts({ opportunities }: FinancialAlertsProps) {
  const [alerts, setAlerts] = useKV<FinancialAlert[]>('financial-alerts', []);
  const [lastAlertCheck, setLastAlertCheck] = useKV('last-alert-check', Date.now());

  useEffect(() => {
    const checkForAlerts = () => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastAlertCheck;
      
      // Only check for alerts every 10 seconds to avoid spam
      if (timeSinceLastCheck < 10000) return;
      
      const totalRevenue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
      const closedDeals = opportunities.filter(opp => opp.stage === 'keep');
      const closedRevenue = closedDeals.reduce((sum, opp) => sum + opp.value, 0);
      
      const newAlerts: FinancialAlert[] = [];
      
      // Revenue milestone alerts
      const milestones = [100000, 250000, 500000, 1000000];
      milestones.forEach(milestone => {
        if (closedRevenue >= milestone && !alerts.find(alert => 
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
      opportunities
        .filter(opp => opp.value > 50000 && opp.stage === 'acquire')
        .forEach(opp => {
          const expectedCloseDate = new Date(opp.expectedCloseDate);
          // Validate the date before calling getTime()
          if (isNaN(expectedCloseDate.getTime())) {
            return; // Skip invalid dates
          }
          
          const daysUntilClose = Math.ceil((expectedCloseDate.getTime() - now) / (1000 * 60 * 60 * 24));
          
          if (daysUntilClose <= 7 && daysUntilClose > 0 && !alerts.find(alert => 
            alert.type === 'deal_risk' && 
            alert.message.includes(opp.id)
          )) {
            newAlerts.push({
              id: `risk-${opp.id}-${now}`,
              type: 'deal_risk',
              title: 'High-Value Deal Closing Soon',
              message: `"${opp.title}" ($${opp.value.toLocaleString()}) closes in ${daysUntilClose} days.`,
              timestamp: new Date().toISOString(),
              severity: 'warning',
              acknowledged: false
            });
          }
        });
      
      // Target progress alerts
      const revenueTarget = 1000000; // Could be dynamic
      const progressPercentage = (closedRevenue / revenueTarget) * 100;
      const progressMilestones = [25, 50, 75, 90];
      
      progressMilestones.forEach(milestone => {
        if (progressPercentage >= milestone && !alerts.find(alert => 
          alert.type === 'target_progress' && 
          alert.message.includes(`${milestone}%`)
        )) {
          newAlerts.push({
            id: `progress-${milestone}-${now}`,
            type: 'target_progress',
            title: 'Target Progress Update',
            message: `You're ${milestone}% of the way to your revenue target!`,
            timestamp: new Date().toISOString(),
            severity: 'info',
            acknowledged: false
          });
        }
      });
      
      if (newAlerts.length > 0) {
        setAlerts(prev => [...prev, ...newAlerts]);
        
        // Show toast notifications for new alerts
        newAlerts.forEach(alert => {
          const toastFunction = alert.severity === 'success' ? toast.success : 
                              alert.severity === 'warning' ? toast.warning : 
                              toast.info;
          
          toastFunction(alert.title, {
            description: alert.message
          });
        });
      }
      
      setLastAlertCheck(now);
    };

    // Initial check
    checkForAlerts();
    
    // Set up interval for ongoing checks
    const interval = setInterval(checkForAlerts, 15000); // Check every 15 seconds
    
    return () => clearInterval(interval);
  }, [opportunities, alerts, lastAlertCheck, setAlerts, setLastAlertCheck]);

  // This component doesn't render anything visible - it just manages alerts
  return null;
}