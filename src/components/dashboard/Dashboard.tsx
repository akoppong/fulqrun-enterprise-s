import { useState, useEffect } from 'react';
import { User, Opportunity, Contact, Company } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PipelineView } from './PipelineView';
import { OpportunityList } from './OpportunityList';
import { ContactsView } from './ContactsView';
import { AnalyticsView } from './AnalyticsView';
import { CSTPVDashboard } from './CSTPVDashboard';
import { FinancialManagement } from './FinancialManagement';
import { LearningPlatform } from './LearningPlatform';
import { FinancialAlerts } from './FinancialAlerts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export type DashboardView = 'pipeline' | 'opportunities' | 'contacts' | 'analytics' | 'cstpv' | 'financial' | 'learning' | 'integrations';

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('pipeline');
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);

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

  const renderView = () => {
    switch (currentView) {
      case 'pipeline':
        return <PipelineView />;
      case 'opportunities':
        return <OpportunityList />;
      case 'contacts':
        return <ContactsView />;
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
      default:
        return <PipelineView />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        userRole={user.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={onLogout} />
        <main className="flex-1 overflow-auto p-6">
          {renderView()}
        </main>
      </div>
      <FinancialAlerts opportunities={opportunities} />
    </div>
  );
}