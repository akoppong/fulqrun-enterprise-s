// Legacy exports (for backward compatibility)
export { ResponsiveOpportunityDetail, OpportunitiesView } from './OpportunitiesView';
export { OpportunitiesMainView } from './OpportunitiesMainView';
export { ModernOpportunityEditForm } from './ModernOpportunityEditForm';

// New comprehensive module exports
export { 
  OpportunitiesModule,
  OpportunitiesDashboard,
  OpportunitiesListView,
  OpportunityDetailView,
  NewOpportunityMainView
} from './CleanOpportunitiesModule';

// System status and testing
export { OpportunitySystemStatus } from './OpportunitySystemStatus';

// Testing and diagnostic exports
export { OpportunitiesDashboardTest } from './OpportunitiesDashboardTest';
export { DashboardTestRunner } from './DashboardTestRunner';