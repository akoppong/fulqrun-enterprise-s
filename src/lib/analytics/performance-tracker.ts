/**
 * Real-time Performance Tracker
 * 
 * Tracks performance metrics in real-time and provides insights
 * for sales teams and management
 */

import { db } from '../database';
import type { User, Opportunity, Activity, MEDDPICC, PEAKProcess } from '../database/schema';

export interface PerformanceMetrics {
  // Sales Performance
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  revenueGrowth: number;
  
  // Pipeline Performance
  pipelineValue: number;
  averageDealSize: number;
  salesCycleLength: number;
  winRate: number;
  
  // Activity Performance
  activitiesCompleted: number;
  callsToCloseRatio: number;
  meetingsToCloseRatio: number;
  
  // Methodology Performance
  averageMEDDPICCScore: number;
  averagePEAKScore: number;
  
  // Trend Data
  revenueByMonth: Array<{ month: string; revenue: number; target?: number }>;
  opportunitiesByStage: Array<{ stage: string; count: number; value: number }>;
  activitiesByType: Array<{ type: string; count: number; successRate: number }>;
}

export interface TeamPerformance {
  user: User;
  metrics: PerformanceMetrics;
  ranking: number;
  targetAchievement: number;
}

export interface RegionalPerformance {
  region: string;
  metrics: PerformanceMetrics;
  topPerformers: User[];
  opportunities: Opportunity[];
}

export class PerformanceTracker {
  /**
   * Get individual performance metrics for a user
   */
  async getUserPerformance(userId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<PerformanceMetrics> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get user's opportunities
    const { data: opportunities } = await db.opportunities.findAll({
      filters: { assigned_to: userId }
    });

    const closedWonOpportunities = opportunities.filter(opp => 
      opp.stage === 'closed-won' && 
      new Date(opp.actual_close_date || opp.updated_at) >= startDate
    );

    const activeOpportunities = opportunities.filter(opp => 
      !['closed-won', 'closed-lost'].includes(opp.stage)
    );

    // Calculate revenue metrics
    const totalRevenue = closedWonOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const pipelineValue = activeOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const averageDealSize = closedWonOpportunities.length > 0 ? 
      totalRevenue / closedWonOpportunities.length : 0;

    // Get activities for the period
    const { data: activities } = await db.activities.findAll({
      filters: { created_by: userId }
    });

    const periodActivities = activities.filter(activity => 
      new Date(activity.created_at) >= startDate
    );

    const completedActivities = periodActivities.filter(activity => 
      activity.status === 'completed'
    );

    // Calculate win rate
    const closedOpportunities = opportunities.filter(opp => 
      ['closed-won', 'closed-lost'].includes(opp.stage) &&
      new Date(opp.actual_close_date || opp.updated_at) >= startDate
    );
    
    const winRate = closedOpportunities.length > 0 ? 
      (closedWonOpportunities.length / closedOpportunities.length) * 100 : 0;

    // Calculate sales cycle length
    const salesCycleLength = closedWonOpportunities.length > 0 ?
      closedWonOpportunities.reduce((sum, opp) => {
        const created = new Date(opp.created_at);
        const closed = new Date(opp.actual_close_date || opp.updated_at);
        return sum + ((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / closedWonOpportunities.length : 0;

    // Get MEDDPICC and PEAK scores
    const opportunityIds = opportunities.map(opp => opp.id);
    
    const { data: meddpiccScores } = await db.meddpicc.findAll({
      filters: { opportunity_id: { $in: opportunityIds } }
    });

    const { data: peakScores } = await db.peakProcess.findAll({
      filters: { opportunity_id: { $in: opportunityIds } }
    });

    const averageMEDDPICCScore = meddpiccScores.length > 0 ?
      meddpiccScores.reduce((sum, score) => sum + score.total_score, 0) / meddpiccScores.length : 0;

    const averagePEAKScore = peakScores.length > 0 ?
      peakScores.reduce((sum, score) => 
        sum + (score.prospect_score + score.engage_score + score.acquire_score + score.keep_score) / 4, 0
      ) / peakScores.length : 0;

    // Generate trend data
    const revenueByMonth = await this.getMonthlyRevenueTrend(userId, 6);
    const opportunitiesByStage = await this.getOpportunitiesByStage(userId);
    const activitiesByType = await this.getActivitiesByType(userId, startDate);

    return {
      totalRevenue,
      monthlyRevenue: period === 'month' ? totalRevenue : totalRevenue / (period === 'quarter' ? 3 : 12),
      quarterlyRevenue: period === 'quarter' ? totalRevenue : totalRevenue * 3,
      revenueGrowth: await this.calculateRevenueGrowth(userId, period),
      pipelineValue,
      averageDealSize,
      salesCycleLength,
      winRate,
      activitiesCompleted: completedActivities.length,
      callsToCloseRatio: this.calculateCallsToCloseRatio(closedWonOpportunities, activities),
      meetingsToCloseRatio: this.calculateMeetingsToCloseRatio(closedWonOpportunities, activities),
      averageMEDDPICCScore,
      averagePEAKScore,
      revenueByMonth,
      opportunitiesByStage,
      activitiesByType
    };
  }

  /**
   * Get team performance metrics
   */
  async getTeamPerformance(managerId?: string): Promise<TeamPerformance[]> {
    // Get all sales reps or team members under a manager
    const { data: users } = await db.users.findAll({
      filters: managerId ? { manager_id: managerId } : { role: 'sales_rep' }
    });

    const teamPerformance: TeamPerformance[] = [];

    for (const user of users) {
      const metrics = await this.getUserPerformance(user.id);
      
      teamPerformance.push({
        user,
        metrics,
        ranking: 0, // Will be calculated after sorting
        targetAchievement: await this.calculateTargetAchievement(user.id)
      });
    }

    // Sort by total revenue and assign rankings
    teamPerformance.sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue);
    teamPerformance.forEach((member, index) => {
      member.ranking = index + 1;
    });

    return teamPerformance;
  }

  /**
   * Get regional performance breakdown
   */
  async getRegionalPerformance(): Promise<RegionalPerformance[]> {
    const { data: companies } = await db.companies.findAll();
    const regions = [...new Set(companies.map(company => company.region))];

    const regionalPerformance: RegionalPerformance[] = [];

    for (const region of regions) {
      const regionalCompanies = companies.filter(company => company.region === region);
      const companyIds = regionalCompanies.map(company => company.id);

      const { data: opportunities } = await db.opportunities.findAll({
        filters: { company_id: { $in: companyIds } }
      });

      // Get top performers in this region
      const assignedUsers = [...new Set(opportunities.map(opp => opp.assigned_to))];
      const topPerformers: User[] = [];

      for (const userId of assignedUsers) {
        const user = await db.users.findById(userId);
        if (user) {
          const performance = await this.getUserPerformance(userId);
          topPerformers.push({ ...user, performance } as any);
        }
      }

      topPerformers.sort((a: any, b: any) => b.performance.totalRevenue - a.performance.totalRevenue);

      // Calculate regional metrics
      const closedWonOpportunities = opportunities.filter(opp => opp.stage === 'closed-won');
      const totalRevenue = closedWonOpportunities.reduce((sum, opp) => sum + opp.value, 0);
      const pipelineValue = opportunities
        .filter(opp => !['closed-won', 'closed-lost'].includes(opp.stage))
        .reduce((sum, opp) => sum + opp.value, 0);

      regionalPerformance.push({
        region,
        metrics: {
          totalRevenue,
          monthlyRevenue: totalRevenue, // Simplified for now
          quarterlyRevenue: totalRevenue,
          revenueGrowth: 0, // Would calculate based on historical data
          pipelineValue,
          averageDealSize: closedWonOpportunities.length > 0 ? totalRevenue / closedWonOpportunities.length : 0,
          salesCycleLength: 0, // Would calculate from opportunity data
          winRate: 0, // Would calculate from closed opportunities
          activitiesCompleted: 0, // Would get from activities
          callsToCloseRatio: 0,
          meetingsToCloseRatio: 0,
          averageMEDDPICCScore: 0,
          averagePEAKScore: 0,
          revenueByMonth: [],
          opportunitiesByStage: [],
          activitiesByType: []
        },
        topPerformers: topPerformers.slice(0, 5), // Top 5 performers
        opportunities
      });
    }

    return regionalPerformance;
  }

  /**
   * Get real-time dashboard metrics
   */
  async getRealTimeDashboard(): Promise<{
    totalRevenue: number;
    monthlyTarget: number;
    achievement: number;
    pipelineValue: number;
    dealsClosedToday: number;
    activitiesCompletedToday: number;
    topOpportunities: Opportunity[];
    recentActivities: Activity[];
    alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'error' }>;
  }> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Get all opportunities
    const { data: opportunities } = await db.opportunities.findAll();
    
    // Calculate metrics
    const monthlyClosedWon = opportunities.filter(opp => 
      opp.stage === 'closed-won' && 
      new Date(opp.actual_close_date || opp.updated_at) >= startOfMonth
    );

    const totalRevenue = monthlyClosedWon.reduce((sum, opp) => sum + opp.value, 0);
    const monthlyTarget = 1000000; // Would get from targets table
    const achievement = (totalRevenue / monthlyTarget) * 100;

    const pipelineValue = opportunities
      .filter(opp => !['closed-won', 'closed-lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + opp.value, 0);

    const dealsClosedToday = opportunities.filter(opp => 
      opp.stage === 'closed-won' && 
      new Date(opp.actual_close_date || opp.updated_at) >= startOfDay
    ).length;

    // Get activities
    const { data: activities } = await db.activities.findAll({
      orderBy: 'created_at',
      orderDirection: 'desc',
      limit: 100
    });

    const activitiesCompletedToday = activities.filter(activity => 
      activity.status === 'completed' && 
      new Date(activity.completed_date || activity.updated_at) >= startOfDay
    ).length;

    // Top opportunities by value
    const topOpportunities = opportunities
      .filter(opp => !['closed-won', 'closed-lost'].includes(opp.stage))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Recent activities
    const recentActivities = activities.slice(0, 20);

    // Generate alerts
    const alerts: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'error' }> = [];
    
    // Check for stale opportunities
    const staleOpportunities = opportunities.filter(opp => {
      if (['closed-won', 'closed-lost'].includes(opp.stage)) return false;
      const lastUpdate = new Date(opp.updated_at);
      const daysSinceUpdate = (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 14;
    });

    if (staleOpportunities.length > 0) {
      alerts.push({
        type: 'stale_opportunities',
        message: `${staleOpportunities.length} opportunities haven't been updated in 2+ weeks`,
        severity: 'warning'
      });
    }

    // Check for overdue activities
    const overdueActivities = activities.filter(activity => {
      if (activity.status !== 'planned') return false;
      const scheduledDate = new Date(activity.scheduled_date || activity.created_at);
      return scheduledDate < today;
    });

    if (overdueActivities.length > 0) {
      alerts.push({
        type: 'overdue_activities',
        message: `${overdueActivities.length} activities are overdue`,
        severity: 'error'
      });
    }

    // Check target achievement
    if (achievement < 50 && today.getDate() > 15) {
      alerts.push({
        type: 'target_risk',
        message: 'Monthly target achievement is below 50% - action needed',
        severity: 'warning'
      });
    }

    return {
      totalRevenue,
      monthlyTarget,
      achievement,
      pipelineValue,
      dealsClosedToday,
      activitiesCompletedToday,
      topOpportunities,
      recentActivities,
      alerts
    };
  }

  // Private helper methods

  private async getMonthlyRevenueTrend(userId: string, months: number): Promise<Array<{ month: string; revenue: number; target?: number }>> {
    const result = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
      
      const { data: opportunities } = await db.opportunities.findAll({
        filters: { 
          assigned_to: userId,
          stage: 'closed-won'
        }
      });

      const monthlyOpportunities = opportunities.filter(opp => {
        const closeDate = new Date(opp.actual_close_date || opp.updated_at);
        return closeDate >= monthDate && closeDate < nextMonth;
      });

      const revenue = monthlyOpportunities.reduce((sum, opp) => sum + opp.value, 0);

      result.push({
        month: monthDate.toISOString().slice(0, 7),
        revenue,
        target: 100000 // Would get from targets
      });
    }

    return result;
  }

  private async getOpportunitiesByStage(userId: string): Promise<Array<{ stage: string; count: number; value: number }>> {
    const { data: opportunities } = await db.opportunities.findAll({
      filters: { assigned_to: userId }
    });

    const stages = ['prospect', 'engage', 'acquire', 'keep', 'closed-won', 'closed-lost'];
    
    return stages.map(stage => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
      return {
        stage,
        count: stageOpportunities.length,
        value: stageOpportunities.reduce((sum, opp) => sum + opp.value, 0)
      };
    });
  }

  private async getActivitiesByType(userId: string, startDate: Date): Promise<Array<{ type: string; count: number; successRate: number }>> {
    const { data: activities } = await db.activities.findAll({
      filters: { created_by: userId }
    });

    const periodActivities = activities.filter(activity => 
      new Date(activity.created_at) >= startDate
    );

    const types = ['call', 'email', 'meeting', 'demo', 'proposal'];
    
    return types.map(type => {
      const typeActivities = periodActivities.filter(activity => activity.type === type);
      const successfulActivities = typeActivities.filter(activity => 
        activity.outcome === 'positive'
      );
      
      return {
        type,
        count: typeActivities.length,
        successRate: typeActivities.length > 0 ? 
          (successfulActivities.length / typeActivities.length) * 100 : 0
      };
    });
  }

  private calculateCallsToCloseRatio(opportunities: Opportunity[], activities: Activity[]): number {
    const opportunityIds = opportunities.map(opp => opp.id);
    const calls = activities.filter(activity => 
      activity.type === 'call' && opportunityIds.includes(activity.opportunity_id)
    );
    
    return opportunities.length > 0 ? calls.length / opportunities.length : 0;
  }

  private calculateMeetingsToCloseRatio(opportunities: Opportunity[], activities: Activity[]): number {
    const opportunityIds = opportunities.map(opp => opp.id);
    const meetings = activities.filter(activity => 
      activity.type === 'meeting' && opportunityIds.includes(activity.opportunity_id)
    );
    
    return opportunities.length > 0 ? meetings.length / opportunities.length : 0;
  }

  private async calculateRevenueGrowth(userId: string, period: 'month' | 'quarter' | 'year'): Promise<number> {
    // Simplified calculation - would need historical revenue data
    // Return a placeholder growth percentage
    return Math.random() * 20 - 10; // Random number between -10% and +10%
  }

  private async calculateTargetAchievement(userId: string): Promise<number> {
    // Would get user's target from targets table and calculate achievement
    const performance = await this.getUserPerformance(userId);
    const monthlyTarget = 100000; // Placeholder
    
    return (performance.monthlyRevenue / monthlyTarget) * 100;
  }
}

export const performanceTracker = new PerformanceTracker();