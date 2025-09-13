/**
 * Quick Browser Console Test for Opportunities Dashboard
 * 
 * Run this in the browser console to quickly test the opportunities dashboard functionality:
 * 
 * 1. Copy and paste this code into the browser console
 * 2. Run: await testOpportunitiesDashboard()
 * 3. Check the results
 */

async function testOpportunitiesDashboard() {
  console.group('🧪 Opportunities Dashboard Quick Test');
  
  try {
    // Test 1: Import the service
    console.log('1️⃣ Testing service import...');
    const { OpportunityService } = await import('/src/lib/opportunity-service.ts');
    console.log('✅ Service imported successfully');
    
    // Test 2: Clear and reinitialize data
    console.log('2️⃣ Clearing and reinitializing data...');
    localStorage.removeItem('opportunities');
    await OpportunityService.initializeSampleData();
    console.log('✅ Sample data initialized');
    
    // Test 3: Load opportunities
    console.log('3️⃣ Loading opportunities...');
    const opportunities = await OpportunityService.getAllOpportunities();
    console.log(`✅ Loaded ${Array.isArray(opportunities) ? opportunities.length : 'INVALID'} opportunities`);
    
    if (!Array.isArray(opportunities)) {
      console.error('❌ CRITICAL: Opportunities is not an array!', typeof opportunities);
      return { success: false, error: 'Data is not an array' };
    }
    
    // Test 4: Basic array operations
    console.log('4️⃣ Testing array operations...');
    const filtered = opportunities.filter(opp => opp && opp.id);
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const stages = opportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {});
    
    console.log('✅ Array operations successful');
    
    // Test 5: Sample calculations (like the dashboard would do)
    console.log('5️⃣ Testing dashboard calculations...');
    const metrics = {
      total: opportunities.length,
      totalValue,
      averageValue: opportunities.length > 0 ? totalValue / opportunities.length : 0,
      stageDistribution: stages,
      validOpportunities: filtered.length
    };
    
    console.log('✅ Dashboard calculations completed');
    console.table(metrics);
    
    // Test 6: Sample opportunity details
    if (opportunities.length > 0) {
      console.log('6️⃣ Sample opportunity:');
      const sample = opportunities[0];
      console.table({
        id: sample.id,
        title: sample.title,
        value: sample.value,
        stage: sample.stage,
        probability: sample.probability
      });
    }
    
    console.log('🎉 All tests passed! Dashboard should work correctly.');
    
    return {
      success: true,
      metrics,
      sampleData: opportunities.slice(0, 2)
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  } finally {
    console.groupEnd();
  }
}

// Quick diagnostic for any ongoing issues
async function quickDashboardDiagnostic() {
  console.group('🔍 Quick Dashboard Diagnostic');
  
  const issues = [];
  
  // Check localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage working');
  } catch (error) {
    issues.push('localStorage not available');
    console.error('❌ localStorage issue:', error);
  }
  
  // Check if opportunities data exists
  const stored = localStorage.getItem('opportunities');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        console.log(`✅ Valid opportunities in localStorage: ${parsed.length} items`);
      } else {
        issues.push('Opportunities data is not an array');
        console.error('❌ Opportunities data is corrupted:', typeof parsed);
      }
    } catch (error) {
      issues.push('Opportunities data is corrupted JSON');
      console.error('❌ JSON parse error:', error);
    }
  } else {
    console.log('ℹ️ No opportunities data in localStorage (will be initialized)');
  }
  
  // Check Array prototype
  if (typeof Array.prototype.filter === 'function') {
    console.log('✅ Array.filter available');
  } else {
    issues.push('Array.filter not available');
    console.error('❌ Array.filter missing');
  }
  
  console.log(`📊 Diagnostic complete: ${issues.length} issues found`);
  if (issues.length > 0) {
    console.warn('Issues:', issues);
  }
  
  console.groupEnd();
  return { issues, status: issues.length === 0 ? 'healthy' : 'issues-detected' };
}

// Export to window for easy access
if (typeof window !== 'undefined') {
  window.testOpportunitiesDashboard = testOpportunitiesDashboard;
  window.quickDashboardDiagnostic = quickDashboardDiagnostic;
  
  console.log('🔧 Dashboard test utilities loaded!');
  console.log('Run: await testOpportunitiesDashboard()');
  console.log('Or: await quickDashboardDiagnostic()');
}

export { testOpportunitiesDashboard, quickDashboardDiagnostic };