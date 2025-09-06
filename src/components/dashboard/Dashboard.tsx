import { useState } from 'react';
import { User } from '@/lib/types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PipelineView } from './PipelineView';
import { OpportunityList } from './OpportunityList';
import { ContactsView } from './ContactsView';
import { AnalyticsView } from './AnalyticsView';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export type DashboardView = 'pipeline' | 'opportunities' | 'contacts' | 'analytics';

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('pipeline');

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
    </div>
  );
}