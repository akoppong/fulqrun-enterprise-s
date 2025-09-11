import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, MEDDPICC } from '@/lib/types';
import { ResponsiveOpportunityDetail } from './ResponsiveOpportunityDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Target, 
  ChartLineUp, 
  Building, 
  User, 
  DollarSign,
  Calendar,
  Eye,
  RefreshCw,
  TestTube,
  CheckCircle,
  Warning,
  Info
} from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/crm-utils';

// Comprehensive test data with rich information for all sections
const createTestOpportunity = (id: string, variant: 'minimal' | 'complete' | 'enterprise'): Opportunity => {
  const baseDate = new Date();
  const createdAt = new Date(baseDate.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const expectedCloseDate = new Date(baseDate.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);

  const variants = {
    minimal: {
      title: 'Basic Software License',
      value: 25000,
      stage: 'prospect' as const,
      probability: 30,
      priority: 'medium' as const,
      description: 'Simple software licensing opportunity.',
      tags: ['software'],
      meddpicc: {
        score: 25,
        metrics: '',
        economicBuyer: '',
        decisionCriteria: '',
        decisionProcess: '',
        paperProcess: '',
        implicatePain: 'Limited pain identified',
        champion: ''
      }
    },
    complete: {
      title: 'Enterprise CRM Platform Implementation',
      value: 250000,
      stage: 'engage' as const,
      probability: 75,
      priority: 'high' as const,
      description: 'Complete CRM platform replacement for mid-size enterprise. Includes data migration, training, and 2-year support package. Customer is looking to modernize their sales operations and improve pipeline visibility.',
      tags: ['enterprise', 'crm', 'implementation', 'high-value', 'transformation'],
      meddpicc: {
        score: 85,
        metrics: 'ROI target of 300% within 18 months. Current system costs $150K annually in maintenance and lost productivity. Expected to increase sales efficiency by 40% and reduce sales cycle by 25%.',
        economicBuyer: 'Sarah Chen, Chief Revenue Officer - final decision maker with $500K annual technology budget authority.',
        decisionCriteria: '1) Seamless integration with existing ERP system 2) Mobile-first design for field sales team 3) Advanced analytics and reporting 4) Data security compliance (SOC2, GDPR) 5) Proven implementation track record.',
        decisionProcess: 'Technical evaluation (completed), business case review (in progress), board approval required for >$200K, final decision by end of Q2.',
        paperProcess: 'Standard procurement process: 3 vendor RFP, legal review (4-6 weeks), security assessment, MSA negotiation. Preferred vendor program allows expedited contracting.',
        implicatePain: 'Current CRM is 8 years old, lacks mobile access, poor reporting capabilities. Sales team spends 3 hours daily on administrative tasks. Lost 2 major deals due to poor pipeline visibility.',
        champion: 'Marcus Rodriguez, VP Sales Operations - strong advocate, previously successful CRM implementation at former company. Actively promoting our solution internally.'
      }
    },
    enterprise: {
      title: 'Global Digital Transformation Initiative',
      value: 1250000,
      stage: 'acquire' as const,
      probability: 90,
      priority: 'critical' as const,
      description: 'Multi-year digital transformation program spanning 15 countries. Includes platform modernization, process automation, and change management. This is a strategic initiative directly tied to the company\'s 5-year growth plan and market expansion goals.',
      tags: ['enterprise', 'global', 'transformation', 'strategic', 'multi-year', 'automation'],
      meddpicc: {
        score: 95,
        metrics: 'Target: $10M annual cost savings, 50% reduction in processing time, 99.9% uptime SLA. Current manual processes cost $25M annually. ROI projection of 400% over 3 years with break-even at 18 months.',
        economicBuyer: 'Dr. James Patterson, CEO - personally championing digital initiative as key to competitive advantage. Board approved $15M technology budget for transformation.',
        decisionCriteria: '1) Global scalability across 15 countries 2) Enterprise-grade security and compliance 3) Integration with 50+ existing systems 4) 24/7 multilingual support 5) Proven track record with Fortune 500 companies 6) Change management expertise.',
        decisionProcess: 'Phase 1: Technology selection (nearly complete), Phase 2: Pilot implementation in 3 countries, Phase 3: Global rollout. Executive steering committee meets monthly. Final vendor selection by CEO with CTO recommendation.',
        paperProcess: 'Enterprise procurement process: Legal review (8-10 weeks), security audit, compliance certification, master service agreement, country-specific amendments. Procurement team assigned dedicated project manager.',
        implicatePain: 'Competitor gaining market share due to operational inefficiencies. Manual processes causing compliance issues in EU. Customer satisfaction declining due to slow response times. Board pressure to modernize or risk market position.',
        champion: 'Lisa Wang, Chief Digital Officer - hired specifically to lead transformation. Previously led similar initiative at competitor. Executive sponsor for our solution with direct CEO access.'
      }
    }
  };

  return {
    id,
    ...variants[variant],
    companyId: `company-${variant}`,
    contactId: `contact-${variant}`,
    ownerId: 'current-user',
    leadSource: variant === 'enterprise' ? 'partner' : variant === 'complete' ? 'referral' : 'website',
    industry: variant === 'enterprise' ? 'Financial Services' : variant === 'complete' ? 'Manufacturing' : 'Technology',
    createdAt: createdAt.toISOString(),
    updatedAt: new Date(baseDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    expectedCloseDate: expectedCloseDate.toISOString(),
  };
};

const createTestCompany = (id: string, variant: 'minimal' | 'complete' | 'enterprise'): Company => {
  const variants = {
    minimal: {
      id,
      name: 'TechStart Solutions',
      industry: 'Technology',
      employees: 50,
      revenue: 5000000,
      website: 'https://techstart.com',
      address: '123 Tech Street, San Francisco, CA 94102',
      description: 'Early-stage technology company'
    },
    complete: {
      id,
      name: 'Innovate Corp',
      industry: 'Manufacturing',
      employees: 1200,
      revenue: 150000000,
      website: 'https://innovatecorp.com',
      address: '456 Industrial Blvd, Chicago, IL 60601',
      description: 'Mid-size manufacturing company specializing in automotive components'
    },
    enterprise: {
      id,
      name: 'Global Enterprises Inc.',
      industry: 'Financial Services',
      employees: 25000,
      revenue: 2500000000,
      website: 'https://globalenterprises.com',
      address: '789 Financial District, New York, NY 10005',
      description: 'Fortune 500 financial services company with global operations'
    }
  };

  return variants[variant];
};

const createTestContact = (id: string, variant: 'minimal' | 'complete' | 'enterprise'): Contact => {
  const variants = {
    minimal: {
      id,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@techstart.com',
      phone: '+1 (555) 123-4567',
      title: 'IT Manager',
      companyId: `company-${variant}`
    },
    complete: {
      id,
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@innovatecorp.com',
      phone: '+1 (555) 987-6543',
      title: 'Chief Revenue Officer',
      companyId: `company-${variant}`,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
    },
    enterprise: {
      id,
      firstName: 'Dr. James',
      lastName: 'Patterson',
      email: 'j.patterson@globalenterprises.com',
      phone: '+1 (555) 234-5678',
      title: 'Chief Executive Officer',
      companyId: `company-${variant}`,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  };

  return variants[variant];
};

interface TestScenario {
  id: string;
  name: string;
  description: string;
  variant: 'minimal' | 'complete' | 'enterprise';
  color: string;
  icon: React.ElementType;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'minimal',
    name: 'Minimal Data Test',
    description: 'Tests basic functionality with minimal required information',
    variant: 'minimal',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info
  },
  {
    id: 'complete',
    name: 'Complete Information Test',
    description: 'Tests all features with comprehensive opportunity data',
    variant: 'complete', 
    color: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle
  },
  {
    id: 'enterprise',
    name: 'Enterprise Scenario Test',
    description: 'Tests complex enterprise deal with full MEDDPICC qualification',
    variant: 'enterprise',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    icon: Target
  }
];

export function FullScreenOpportunityTest() {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // Initialize test data
  useEffect(() => {
    const initTestData = () => {
      const testOpportunities: Opportunity[] = [];
      const testCompanies: Company[] = [];
      const testContacts: Contact[] = [];

      TEST_SCENARIOS.forEach((scenario, index) => {
        const opportunityId = `test-opp-${scenario.variant}`;
        const companyId = `company-${scenario.variant}`;
        const contactId = `contact-${scenario.variant}`;

        testOpportunities.push(createTestOpportunity(opportunityId, scenario.variant));
        testCompanies.push(createTestCompany(companyId, scenario.variant));
        testContacts.push(createTestContact(contactId, scenario.variant));
      });

      // Merge with existing data
      setOpportunities(prev => {
        const existing = prev.filter(opp => !opp.id.startsWith('test-opp-'));
        return [...existing, ...testOpportunities];
      });

      setCompanies(prev => {
        const existing = prev.filter(comp => !comp.id.startsWith('company-'));
        return [...existing, ...testCompanies];
      });

      setContacts(prev => {
        const existing = prev.filter(cont => !cont.id.startsWith('contact-'));
        return [...existing, ...testContacts];
      });

      toast.success('Test data initialized successfully');
    };

    initTestData();
  }, [setOpportunities, setCompanies, setContacts]);

  const runTest = (scenario: TestScenario) => {
    const opportunity = opportunities.find(opp => opp.id === `test-opp-${scenario.variant}`);
    
    if (!opportunity) {
      toast.error(`Test opportunity not found for ${scenario.name}`);
      return;
    }

    // Validate test data completeness
    const company = companies.find(c => c.id === opportunity.companyId);
    const contact = contacts.find(c => c.id === opportunity.contactId);

    const isComplete = Boolean(
      opportunity.title &&
      opportunity.value > 0 &&
      opportunity.stage &&
      opportunity.meddpicc &&
      company &&
      contact
    );

    if (!isComplete) {
      toast.warning(`Test data incomplete for ${scenario.name}`);
      setTestResults(prev => ({ ...prev, [scenario.id]: false }));
      return;
    }

    // Open detail view for testing
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
    setTestResults(prev => ({ ...prev, [scenario.id]: true }));
    
    toast.success(`Testing ${scenario.name} - Detail view opened`);
  };

  const resetTestData = () => {
    // Remove test data
    setOpportunities(prev => prev.filter(opp => !opp.id.startsWith('test-opp-')));
    setCompanies(prev => prev.filter(comp => !comp.id.startsWith('company-')));
    setContacts(prev => prev.filter(cont => !cont.id.startsWith('contact-')));
    setTestResults({});
    setSelectedOpportunity(null);
    setIsDetailOpen(false);
    
    toast.success('Test data reset');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TestTube size={24} className="text-purple-600" />
            Full-Screen Opportunity Detail Test Suite
          </h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive testing of the opportunity detail view with various data scenarios
          </p>
        </div>
        <Button 
          onClick={resetTestData} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Reset Test Data
        </Button>
      </div>

      {/* Test Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {TEST_SCENARIOS.map((scenario) => {
          const IconComponent = scenario.icon;
          const isSuccess = testResults[scenario.id] === true;
          const hasRun = scenario.id in testResults;

          return (
            <Card key={scenario.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${scenario.color}`}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {scenario.name}
                      </CardTitle>
                      {hasRun && (
                        <div className="flex items-center gap-1 mt-1">
                          {isSuccess ? (
                            <CheckCircle size={12} className="text-green-600" />
                          ) : (
                            <Warning size={12} className="text-red-600" />
                          )}
                          <span className={`text-xs font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                            {isSuccess ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {scenario.description}
                </p>

                {/* Test Data Preview */}
                <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Test Data Preview
                  </div>
                  {(() => {
                    const opp = createTestOpportunity(`test-opp-${scenario.variant}`, scenario.variant);
                    const comp = createTestCompany(`company-${scenario.variant}`, scenario.variant);
                    
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Deal Value:</span>
                          <span className="font-medium">{formatCurrency(opp.value)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Stage:</span>
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {opp.stage}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Company:</span>
                          <span className="font-medium truncate max-w-32">{comp.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">MEDDPICC Score:</span>
                          <span className={`font-medium ${opp.meddpicc.score > 80 ? 'text-green-600' : opp.meddpicc.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {opp.meddpicc.score}%
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <Button 
                  onClick={() => runTest(scenario)}
                  className="w-full"
                  size="sm"
                  variant={hasRun && isSuccess ? "secondary" : "default"}
                >
                  <Eye size={14} className="mr-2" />
                  {hasRun ? 'Test Again' : 'Run Test'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Test Results Summary */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ChartLineUp size={18} className="text-green-600" />
              Test Results Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter(Boolean).length}
                </div>
                <div className="text-sm font-medium text-green-700">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter(r => r === false).length}
                </div>
                <div className="text-sm font-medium text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(testResults).length}
                </div>
                <div className="text-sm font-medium text-blue-700">Total Tests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Features Being Tested */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Key Features Being Tested</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center gap-2">
                <Target size={14} className="text-blue-600" />
                PEAK Methodology
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Stage progression tracking</li>
                <li>• Visual progress indicators</li>
                <li>• Completion status</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center gap-2">
                <ChartLineUp size={14} className="text-purple-600" />
                MEDDPICC Qualification
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• All 7 components</li>
                <li>• Scoring algorithms</li>
                <li>• Health assessment</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center gap-2">
                <Building size={14} className="text-green-600" />
                Company Integration
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Company details display</li>
                <li>• Industry information</li>
                <li>• Contact relationships</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-600" />
                Deal Analytics
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Value calculations</li>
                <li>• Timeline tracking</li>
                <li>• Priority assessment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full-Screen Detail View */}
      {selectedOpportunity && (
        <ResponsiveOpportunityDetail
          opportunity={selectedOpportunity}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedOpportunity(null);
            toast.success('Test completed - Detail view closed');
          }}
          onEdit={() => {
            toast.info('Edit functionality would open here');
          }}
        />
      )}
    </div>
  );
}