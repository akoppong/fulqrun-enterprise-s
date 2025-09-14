import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveOpportunityDetail } from './ResponsiveOpportunityDetail';
import { Opportunity } from '@/lib/types';
import { 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Target, 
  ChartBar,
  ClockCounterClockwise,
  FileText,
  ChartLineUp
} from '@phosphor-icons/react';

// Sample opportunity data for testing
const sampleOpportunity: Opportunity = {
  id: 'test-opportunity-1',
  name: 'Enterprise Software Implementation',
  title: 'Enterprise Software Implementation',
  company: 'TechCorp Solutions',
  value: 250000,
  stage: 'engage',
  probability: 75,
  priority: 'high',
  expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
  updatedAt: new Date(),
  description: 'Large enterprise software implementation project involving multiple departments and stakeholder groups. This is a strategic initiative for the client with significant revenue potential.',
  tags: ['enterprise', 'software', 'strategic', 'high-value'],
  source: 'referral',
  assignedTo: 'current-user',
  createdBy: 'current-user',
  primaryContact: 'John Smith',
  contactEmail: 'john.smith@techcorp.com',
  contactPhone: '+1 (555) 123-4567',
  industry: 'Technology',
  
  // Sample activities
  activities: [
    {
      id: 'activity-1',
      type: 'meeting',
      outcome: 'positive',
      notes: 'Initial discovery meeting with technical team. Great engagement and strong interest in our solution.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'activity-2',
      type: 'call',
      outcome: 'positive',
      notes: 'Follow-up call with CTO to discuss technical requirements and implementation timeline.',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'activity-3',
      type: 'demo',
      outcome: 'positive',
      notes: 'Product demonstration for key stakeholders. Received positive feedback on core features.',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'activity-4',
      type: 'email',
      outcome: 'neutral',
      notes: 'Sent proposal and pricing information to procurement team.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ],

  // Sample contacts
  contacts: [
    {
      id: 'contact-1',
      name: 'John Smith',
      role: 'CTO',
      influence: 'high',
      sentiment: 'champion',
    },
    {
      id: 'contact-2',
      name: 'Sarah Johnson',
      role: 'Procurement Manager',
      influence: 'medium',
      sentiment: 'neutral',
    },
    {
      id: 'contact-3',
      name: 'Mike Davis',
      role: 'IT Director',
      influence: 'high',
      sentiment: 'champion',
    },
    {
      id: 'contact-4',
      name: 'Lisa Wilson',
      role: 'Finance Director',
      influence: 'medium',
      sentiment: 'neutral',
    },
  ],

  // Sample PEAK scores
  peakScores: {
    prospect: 85,
    engage: 70,
    acquire: 45,
    keep: 20,
  },

  // Sample MEDDPICC scores
  meddpiccScores: {
    metrics: 80,
    economicBuyer: 75,
    decisionCriteria: 70,
    decisionProcess: 65,
    paperProcess: 50,
    identifyPain: 85,
    champion: 90,
    competition: 60,
  },

  // Additional fields that might be needed
  daysInStage: 12,
  totalDaysInPipeline: 45,
  lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  competitor: 'CompetitorX'
};

interface TabTestResult {
  tab: string;
  status: 'pending' | 'pass' | 'fail';
  issues: string[];
  notes: string;
}

export function OpportunityTabsTest() {
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<TabTestResult[]>([
    { tab: 'overview', status: 'pending', issues: [], notes: '' },
    { tab: 'metrics', status: 'pending', issues: [], notes: '' },
    { tab: 'peak', status: 'pending', issues: [], notes: '' },
    { tab: 'meddpicc', status: 'pending', issues: [], notes: '' },
    { tab: 'contact', status: 'pending', issues: [], notes: '' },
    { tab: 'activities', status: 'pending', issues: [], notes: '' },
  ]);

  const updateTestResult = (tab: string, status: 'pass' | 'fail', issues: string[] = [], notes = '') => {
    setTestResults(prev => prev.map(result => 
      result.tab === tab ? { ...result, status, issues, notes } : result
    ));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'overview': return <FileText size={16} />;
      case 'metrics': return <ChartBar size={16} />;
      case 'peak': return <Target size={16} />;
      case 'meddpicc': return <ChartLineUp size={16} />;
      case 'contact': return <Users size={16} />;
      case 'activities': return <ClockCounterClockwise size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle size={16} className="text-green-600" />;
      case 'fail': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Eye size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-300';
      case 'fail': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (showDetail) {
    return (
      <div className="h-screen w-full">
        <ResponsiveOpportunityDetail
          opportunity={sampleOpportunity}
          isOpen={true}
          onClose={() => setShowDetail(false)}
          showInMainContent={true}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye size={20} className="text-blue-600" />
            Opportunity Detail View - Tab Testing Suite
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test each tab in the opportunity detail view for functionality and consistency.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Test Opportunity: {sampleOpportunity.name}</h3>
              <p className="text-sm text-muted-foreground">
                Company: {sampleOpportunity.company} • Value: ${sampleOpportunity.value.toLocaleString()}
              </p>
            </div>
            <Button onClick={() => setShowDetail(true)} className="flex items-center gap-2">
              <Eye size={16} />
              Open Detail View
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tab Testing Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mark each tab as tested after reviewing its functionality and content.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.map((result) => (
              <Card key={result.tab} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTabIcon(result.tab)}
                      <span className="font-medium capitalize">{result.tab}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <Badge 
                        variant="secondary"
                        className={`text-xs px-2 py-1 ${getStatusColor(result.status)}`}
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {result.tab === 'overview' && 'Test: Key metrics, details, company info, stage progress'}
                      {result.tab === 'metrics' && 'Test: Performance metrics, methodology scores, activity metrics'}
                      {result.tab === 'peak' && 'Test: PEAK methodology stages, progress indicators, completion status'}
                      {result.tab === 'meddpicc' && 'Test: MEDDPICC assessment, scores, coaching prompts'}
                      {result.tab === 'contact' && 'Test: Primary contact, all contacts, contact analytics'}
                      {result.tab === 'activities' && 'Test: Activity timeline, different activity types, outcomes'}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTestResult(result.tab, 'pass', [], 'Tab tested successfully')}
                        className="flex-1"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Pass
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateTestResult(result.tab, 'fail', ['Issues found'], 'Tab has issues')}
                        className="flex-1"
                      >
                        <AlertTriangle size={14} className="mr-1" />
                        Fail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">For Each Tab, Verify:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Content loads correctly</li>
                <li>• Data displays properly</li>
                <li>• Layout is responsive</li>
                <li>• Interactive elements work</li>
                <li>• Error handling is proper</li>
                <li>• Visual consistency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Specific Checks:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Overview:</strong> Metrics cards, progress bars, company info</li>
                <li>• <strong>Metrics:</strong> Performance charts, methodology scores</li>
                <li>• <strong>PEAK:</strong> Stage progress, completion indicators</li>
                <li>• <strong>MEDDPICC:</strong> Assessment scores, coaching prompts</li>
                <li>• <strong>Contact:</strong> Contact details, analytics</li>
                <li>• <strong>Activities:</strong> Timeline, activity types</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {testResults.filter(r => r.status === 'pass').length}
              </div>
              <div className="text-sm text-green-700">Passed</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">
                {testResults.filter(r => r.status === 'fail').length}
              </div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-bold text-gray-600">
                {testResults.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-700">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OpportunityTabsTest;