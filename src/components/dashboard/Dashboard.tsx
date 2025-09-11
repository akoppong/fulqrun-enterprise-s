import { Button } from '@/components/ui/button';
import { AutoSaveDemo } from './AutoSaveDemo';
import { AutoSaveTestRunner } from './AutoSaveTestRunner';
import { AutoSaveTesting } from './AutoSaveTesting';
import { AutoSaveInteractiveDemo } from './AutoSaveInteractiveDemo';
import { FieldTypeTestingLab } from './FieldTypeTestingLab';
import { ComprehensiveValidationTestSuite } from './ComprehensiveValidationTestSuite';
import { ValidationTestingDemo } from './ValidationTestingDemo';
import { DateValidationDemo } from './DateValidationDemo';
import { useState, useEffect } from 'react';
import { User, Opportunity, Contact, Company, KPITarget } from '@/lib/types';
import { DemoDataGenerator } from '@/lib/demo-data';
import { useKV } from '@github/spark/hooks';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RoleBasedDashboard } from './RoleBasedDashboard';
import { CustomizableDashboard } from './CustomizableDashboard';
import { CustomKPILayoutDashboard } from './CustomKPILayoutDashboard';
import { PipelineView } from './PipelineView';
import { OpportunityList } from './OpportunityList';
import { OpportunitiesView } from '../opportunities/OpportunitiesView';
import { OpportunityTestSuite } from '../opportunities/OpportunityTestSuite';
import { EnhancedOpportunityTester } from '../opportunities/EnhancedOpportunityTester';
import { ContactsView } from './ContactsView';
import { AnalyticsView } from './AnalyticsView';
import { CSTPVDashboard } from './CSTPVDashboard';
import { FinancialManagement } from './FinancialManagement';
import { KPITargetsView } from './KPITargetsView';
import { LearningPlatform } from './LearningPlatform';
import { KPIDashboardGallery } from './widgets/KPIDashboardGallery';
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
import { AdministrationModule } from '../administration/AdministrationModule';
import { PersonalizedKPIManager } from './PersonalizedKPIManager';
import { PersonalizedKPIDashboard } from './PersonalizedKPIDashboard';
import { KPIDashboardBuilder } from './KPIDashboardBuilder';
import { AdvancedKPIAnalytics } from './AdvancedKPIAnalytics';
import { PharmaceuticalKPITemplates } from './PharmaceuticalKPITemplates';
import { RoleTestingDashboard } from './RoleTestingDashboard';
import { RoleShowcase } from './RoleShowcase';

interface DashboardProps {
  user: User;
  originalUser?: User | null;
  onLogout?: () => void;
  onRoleSwitch?: (user: User) => void;
  initialView?: string;
}

export type DashboardView = 'dashboard' | 'role-testing' | 'pipeline' | 'opportunities' | 'contacts' | 'companies' | 'analytics' | 'advanced-analytics' | 'cstpv' | 'financial' | 'kpi-targets' | 'kpi-builder' | 'kpi-gallery' | 'kpi-manager' | 'kpi-layout' | 'pharma-kpi-templates' | 'learning' | 'integrations' | 'workflows' | 'ai-insights' | 'lead-scoring' | 'deal-risk' | 'segments' | 'autosave-demo' | 'autosave-test' | 'autosave-manual' | 'autosave-interactive' | 'field-testing' | 'comprehensive-testing' | 'validation-demo' | 'date-validation' | 'admin-users' | 'admin-system' | 'admin-security' | 'admin-monitoring' | 'admin-data' | 'admin-audit' | 'administration' | 'enhanced-opportunity-testing';

export function Dashboard({ user, originalUser, onLogout, onRoleSwitch, initialView }: DashboardProps) {
  // Safety check for user object and role
  if (!user || !user.role) {
    console.error('Dashboard: Invalid user object provided:', user);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Invalid User State</h2>
          <p className="text-muted-foreground">Please log in again to continue.</p>
          {onLogout && (
            <Button onClick={onLogout} className="mt-4">
              Return to Login
            </Button>
          )}
        </div>
      </div>
    );
  }

  const [currentView, setCurrentView] = useState<DashboardView>(
    (initialView as DashboardView) || 'dashboard'
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
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b069?w=150',
          teamId: 'team-1',
          managerId: 'user-4',
          territory: 'West Coast',
          quota: 150000,
          targets: { monthly: 12500, quarterly: 37500, annual: 150000 }
        },
        {
          id: 'user-3',
          name: 'Mike Chen',
          email: 'mike.chen@company.com',
          role: 'rep',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          teamId: 'team-1',
          managerId: 'user-4',
          territory: 'East Coast',
          quota: 155000,
          targets: { monthly: 12900, quarterly: 38750, annual: 155000 }
        },
        {
          id: 'user-4',
          name: 'Jennifer Williams',
          email: 'jennifer.williams@company.com',
          role: 'manager',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          teamId: 'team-1',
          territory: 'North America',
          quota: 1350000,
          targets: { monthly: 112500, quarterly: 337500, annual: 1350000 }
        },
        {
          id: 'user-5',
          name: 'Robert Anderson',
          email: 'robert.anderson@company.com',
          role: 'bu_head',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          territory: 'Global',
          quota: 18000000,
          targets: { monthly: 1500000, quarterly: 4500000, annual: 18000000 }
        },
        {
          id: 'user-6',
          name: 'Patricia Liu',
          email: 'patricia.liu@company.com',
          role: 'executive',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
          territory: 'Worldwide',
          quota: 75000000,
          targets: { monthly: 6250000, quarterly: 18750000, annual: 75000000 }
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
      case 'dashboard':
        return <RoleBasedDashboard user={user} />;
      case 'role-testing':
        return (
          <RoleShowcase 
            currentUser={originalUser || user} 
            onRoleSwitch={onRoleSwitch || (() => {})}
          />
        );
      case 'pipeline':
        return <PipelineView />;
      case 'opportunities':
        return <OpportunitiesView />;
      case 'contacts':
        return <ContactsView />;
      case 'companies':
        return <CompaniesView />;
      case 'analytics':
        return <AnalyticsView userRole={user.role} />;
      case 'advanced-analytics':
        return <AdvancedKPIAnalytics />;
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
      case 'kpi-gallery':
        return <KPIDashboardGallery />;
      case 'kpi-manager':
        return <PersonalizedKPIDashboard />;
      case 'kpi-layout':
        return <CustomKPILayoutDashboard user={user} />;
      case 'pharma-kpi-templates':
        return <PharmaceuticalKPITemplates 
          onApplyTemplate={(templateData) => {
            // This could integrate with the KPI manager if needed
            console.log('Template applied:', templateData);
          }}
          onCreateKPI={(kpiData) => {
            // This could integrate with the KPI manager if needed
            console.log('KPI created:', kpiData);
          }}
        />;
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
      
      case 'administration':
        return (
          <AdministrationModule 
            userRole={user.role} 
            isOwner={user.role === 'admin' || user.email === originalUser?.email}
          />
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
      case 'date-validation':
        return <DateValidationDemo />;
      case 'enhanced-opportunity-testing':
        return <EnhancedOpportunityTester />;
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
        <Header 
          user={user} 
          originalUser={originalUser}
          onLogout={onLogout} 
        />
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