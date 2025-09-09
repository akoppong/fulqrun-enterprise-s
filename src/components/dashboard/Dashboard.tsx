import { AutoSaveDemo } from './AutoSaveDemo';
import { AutoSaveTestRunner } from './AutoSaveTestRunner';
import { AutoSaveTesting } from './AutoSaveTesting';
import { AutoSaveInteractiveDemo } from './AutoSaveInteractiveDemo';
import { FieldTypeTestingLab } from './FieldTypeTestingLab';
import { ComprehensiveValidationTestSuite } from './ComprehensiveValidationTestSuite';
import { ValidationTestingDemo } from './ValidationTestingDemo';
import { useState, useEffect } from 'react';
import { User, Opportunity, Contact, Company, KPITarget } from '@/lib/types';
import { DemoDataGenerator } from '@/lib/demo-data';
import { useKV } from '@github/spark/hooks';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PipelineView } from './PipelineView';
import { OpportunityList } from './OpportunityList';
import { ContactsView } from './ContactsView';
import { AnalyticsView } from './AnalyticsView';
import { CSTPVDashboard } from './CSTPVDashboard';
import { FinancialManagement } from './FinancialManagement';
import { KPITargetsView } from './KPITargetsView';
import { LearningPlatform } from './LearningPlatform';
import { KPIDashboardBuilder } from './KPIDashboardBuilder';
import { FinancialAlerts } from './FinancialAlerts';
import { WorkflowAutomation } from '../workflows/WorkflowAutomation';
import { AIInsightsView } from './AIInsightsView';
import { LeadScoringDashboard } from './LeadScoringDashboard';
import { DealRiskDashboard } from './DealRiskDashboard';
import { CustomerSegmentsList } from '../segments/CustomerSegmentsList';
import { CompaniesView } from './CompaniesView';
import { UserManagement } from '../admin/UserManagement';
import { SystemConfiguration } from '../admin/SystemConfiguration';
import { SystemMonitoring } from '../admin/SystemMonitoring';

interface DashboardProps {
  user: User;
  onLogout?: () => void;
  initialView?: string;
}

export type DashboardView = 'pipeline' | 'opportunities' | 'contacts' | 'companies' | 'analytics' | 'cstpv' | 'financial' | 'kpi-targets' | 'kpi-builder' | 'learning' | 'integrations' | 'workflows' | 'ai-insights' | 'lead-scoring' | 'deal-risk' | 'segments' | 'autosave-demo' | 'autosave-test' | 'autosave-manual' | 'autosave-interactive' | 'field-testing' | 'comprehensive-testing' | 'validation-demo' | 'admin-users' | 'admin-system' | 'admin-security' | 'admin-monitoring' | 'admin-data' | 'admin-audit';

export function Dashboard({ user, onLogout, initialView }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>(
    (initialView as DashboardView) || 'pipeline'
  );
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  const [kpiTargets, setKpiTargets] = useKV<KPITarget[]>('kpi-targets', []);

  // Initialize demo users data
  useEffect(() => {
    if (allUsers.length === 0) {
      const demoUsers: User[] = [
        user,
        {
          id: 'user-2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          role: 'rep',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b069?w=150'
        },
        {
          id: 'user-3',
          name: 'Mike Chen',
          email: 'mike.chen@company.com',
          role: 'rep',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        },
        {
          id: 'user-4',
          name: 'Jennifer Williams',
          email: 'jennifer.williams@company.com',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
        }
      ];
      setAllUsers(demoUsers);
    }
  }, [allUsers, user, setAllUsers]);

  // Initialize demo CRM data for AI features
  useEffect(() => {
    const initializeDemoData = async () => {
      if (companies.length === 0 || contacts.length === 0 || opportunities.length === 0) {
        const demoData = await DemoDataGenerator.initializeDemoData();
        
        if (companies.length === 0) setCompanies(demoData.companies);
        if (contacts.length === 0) setContacts(demoData.contacts);
        if (opportunities.length === 0) setOpportunities(demoData.opportunities);
      }
    };
    
    initializeDemoData();
  }, [companies, contacts, opportunities, setCompanies, setContacts, setOpportunities]);

  const renderView = () => {
    switch (currentView) {
      case 'pipeline':
        return <PipelineView />;
      case 'opportunities':
        return <OpportunityList />;
      case 'contacts':
        return <ContactsView />;
      case 'companies':
        return <CompaniesView />;
      case 'analytics':
        return <AnalyticsView userRole={user.role} />;
      case 'cstpv':
        return (
          <CSTPVDashboard 
            opportunities={opportunities} 
            currentUser={user}
            allUsers={allUsers}
          />
        );
      case 'financial':
        return (
          <FinancialManagement 
            opportunities={opportunities}
            currentUserId={user.id}
          />
        );
      case 'kpi-targets':
        return (
          <KPITargetsView
            opportunities={opportunities}
            currentUser={user}
          />
        );
      case 'kpi-builder':
        return (
          <KPIDashboardBuilder
            currentUser={user}
            kpiTargets={kpiTargets}
          />
        );
      case 'learning':
        return (
          <LearningPlatform 
            currentUser={user}
            allUsers={allUsers}
          />
        );
      case 'integrations':
        return (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Integration Hub</h3>
            <p className="text-muted-foreground mb-8">
              Connect with Slack, DocuSign, Gong, Chorus, Stripe, and more
            </p>
            <div className="text-muted-foreground">
              Integration management interface coming in Phase 2...
            </div>
          </div>
        );
      case 'workflows':
        return <WorkflowAutomation className="max-w-7xl" />;
      case 'ai-insights':
        return (
          <AIInsightsView
            opportunities={opportunities}
            contacts={contacts}
            companies={companies}
          />
        );
      case 'lead-scoring':
        return (
          <LeadScoringDashboard
            contacts={contacts}
            companies={companies}
          />
        );
      case 'deal-risk':
        return (
          <DealRiskDashboard
            opportunities={opportunities}
            contacts={contacts}
            companies={companies}
          />
        );
      case 'segments':
        return <CustomerSegmentsList />;
      
      // Admin Components
      case 'admin-users':
        return <UserManagement currentUser={user} />;
      case 'admin-system':
        return <SystemConfiguration />;
      case 'admin-security':
        return (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Security & Compliance</h3>
            <p className="text-muted-foreground mb-8">
              Manage security policies, compliance settings, and audit controls
            </p>
            <div className="text-muted-foreground">
              Security management interface coming soon...
            </div>
          </div>
        );
      case 'admin-monitoring':
        return <SystemMonitoring />;
      case 'admin-data':
        return (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Data Management</h3>
            <p className="text-muted-foreground mb-8">
              Import/export data, manage backups, and data maintenance
            </p>
            <div className="text-muted-foreground">
              Data management interface coming soon...
            </div>
          </div>
        );
      case 'admin-audit':
        return (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4">Audit Logs</h3>
            <p className="text-muted-foreground mb-8">
              View system audit trails and compliance logs
            </p>
            <div className="text-muted-foreground">
              Audit log interface coming soon...
            </div>
          </div>
        );
      
      // Testing Components
      case 'autosave-demo':
        return <AutoSaveDemo />;
      case 'autosave-test':
        return <AutoSaveTestRunner />;
      case 'autosave-manual':
        return <AutoSaveTesting />;
      case 'autosave-interactive':
        return <AutoSaveInteractiveDemo />;
      case 'field-testing':
        return <FieldTypeTestingLab />;
      case 'comprehensive-testing':
        return <ComprehensiveValidationTestSuite />;
      case 'validation-demo':
        return <ValidationTestingDemo />;
      default:
        return <PipelineView />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Enhanced mobile-responsive sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
      />
      
      {/* Main content area with improved mobile layout */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6 w-full">
            {renderView()}
          </div>
        </main>
      </div>
      
      <FinancialAlerts opportunities={opportunities} />
    </div>
  );
}