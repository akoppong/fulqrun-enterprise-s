import React from 'react';
import { OpportunitiesDashboard } from '@/components/opportunities/OpportunitiesDashboard';
import { User } from '@/lib/types';

// Test component to validate the opportunities dashboard
export function TestOpportunitiesDashboard() {
  const testUser: User = {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'rep',
    territory: 'North America',
    permissions: ['view_opportunities', 'edit_opportunities'],
    targets: {
      revenue: 1000000,
      deals: 10,
      activities: 50
    }
  };

  const handleViewChange = (view: string, data?: any) => {
    console.log('View change requested:', { view, data });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Testing Opportunities Dashboard</h1>
      <OpportunitiesDashboard 
        user={testUser} 
        onViewChange={handleViewChange}
      />
    </div>
  );
}

// Test the opportunities service directly
export async function testOpportunitiesService() {
  try {
    console.log('🧪 Testing Opportunities Service...');
    
    // Import the service
    const { OpportunityService } = await import('@/lib/opportunity-service');
    
    // Clear any existing data
    localStorage.removeItem('opportunities');
    
    // Initialize sample data
    console.log('Initializing sample data...');
    await OpportunityService.initializeSampleData();
    
    // Get all opportunities
    console.log('Fetching all opportunities...');
    const opportunities = await OpportunityService.getAllOpportunities();
    
    console.log('✅ Opportunities loaded:', {
      type: typeof opportunities,
      isArray: Array.isArray(opportunities),
      length: Array.isArray(opportunities) ? opportunities.length : 'N/A',
      firstItem: Array.isArray(opportunities) && opportunities.length > 0 ? opportunities[0] : null
    });
    
    if (Array.isArray(opportunities) && opportunities.length > 0) {
      const firstOpp = opportunities[0];
      console.log('First opportunity details:', {
        id: firstOpp.id,
        title: firstOpp.title || firstOpp.name,
        value: firstOpp.value,
        stage: firstOpp.stage,
        companyId: firstOpp.companyId
      });
    }
    
    return { success: true, count: Array.isArray(opportunities) ? opportunities.length : 0 };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run test when component mounts
export function OpportunitiesDashboardTest() {
  React.useEffect(() => {
    const runTest = async () => {
      const result = await testOpportunitiesService();
      if (result.success) {
        console.log(`✅ Test passed! Loaded ${result.count} opportunities`);
      } else {
        console.error(`❌ Test failed: ${result.error}`);
      }
    };
    
    runTest();
  }, []);

  return <TestOpportunitiesDashboard />;
}