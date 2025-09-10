import { useState, useEffect } from 'react';
import { Opportunity } from '@/lib/types';
import { OpportunityService, OpportunityAnalytics, OpportunityWithRelations } from '@/lib/opportunity-service';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OpportunityService.getAllOpportunities();
      setOpportunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOpportunities();
  }, []);

  const createOpportunity = async (data: Partial<Opportunity>) => {
    try {
      const newOpportunity = await OpportunityService.createOpportunity(data);
      setOpportunities(prev => [...prev, newOpportunity]);
      return newOpportunity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create opportunity');
      throw err;
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<Opportunity>) => {
    try {
      const updated = await OpportunityService.updateOpportunity(id, updates);
      if (updated) {
        setOpportunities(prev => 
          prev.map(opp => opp.id === id ? updated : opp)
        );
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update opportunity');
      throw err;
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const success = await OpportunityService.deleteOpportunity(id);
      if (success) {
        setOpportunities(prev => prev.filter(opp => opp.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete opportunity');
      throw err;
    }
  };

  const advanceStage = async (id: string, newStage: string, reason: string) => {
    try {
      const success = await OpportunityService.advanceStage(id, newStage, reason);
      if (success) {
        await refreshOpportunities(); // Refresh to get updated data
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to advance stage');
      throw err;
    }
  };

  return {
    opportunities,
    loading,
    error,
    refreshOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    advanceStage
  };
}

export function useOpportunity(id: string | undefined) {
  const [opportunity, setOpportunity] = useState<OpportunityWithRelations | null>(null);
  const [analytics, setAnalytics] = useState<OpportunityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOpportunity = async () => {
    if (!id) {
      setOpportunity(null);
      setAnalytics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [oppData, analyticsData] = await Promise.all([
        OpportunityService.getOpportunityWithRelations(id),
        OpportunityService.analyzeOpportunity(id)
      ]);
      
      setOpportunity(oppData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOpportunity();
  }, [id]);

  const updateOpportunity = async (updates: Partial<Opportunity>) => {
    if (!id) return null;

    try {
      const updated = await OpportunityService.updateOpportunity(id, updates);
      if (updated) {
        await refreshOpportunity(); // Refresh to get updated relations and analytics
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update opportunity');
      throw err;
    }
  };

  const updateMeddpicc = async (meddpiccUpdates: any) => {
    if (!id) return null;

    try {
      const updated = await OpportunityService.updateMeddpicc(id, meddpiccUpdates);
      if (updated) {
        await refreshOpportunity(); // Refresh to get updated analytics
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update MEDDPICC');
      throw err;
    }
  };

  return {
    opportunity,
    analytics,
    loading,
    error,
    refreshOpportunity,
    updateOpportunity,
    updateMeddpicc
  };
}

export function useOpportunityStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [opportunityStats, portfolioAnalysis] = await Promise.all([
        OpportunityService.getOpportunityStats(),
        OpportunityService.analyzePortfolio()
      ]);
      
      setStats({
        ...opportunityStats,
        portfolio: portfolioAnalysis
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats
  };
}