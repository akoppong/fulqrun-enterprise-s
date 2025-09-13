import { useState } from 'react';
import { User } from '@/lib/types';
import { OpportunitiesModule } from './OpportunitiesModule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OpportunitiesTestProps {
  user: User;
}

export function OpportunitiesTest({ user }: OpportunitiesTestProps) {
  const [currentView, setCurrentView] = useState('dashboard');

  const testUser: User = {
    id: 'test-user-1',
    name: 'Test User',
    email: 'test@fulqrun.com',
    role: 'rep',
    avatar: '',
    territory: 'North America'
  };

  return (
    <div className="h-full">
      <div className="border-b bg-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Opportunities Module Test</h1>
            <p className="text-muted-foreground">
              Testing the opportunities module in main content area
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={currentView === 'dashboard' ? 'default' : 'outline'}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant={currentView === 'list' ? 'default' : 'outline'}
              onClick={() => setCurrentView('list')}
            >
              List
            </Button>
            <Button 
              variant={currentView === 'create' ? 'default' : 'outline'}
              onClick={() => setCurrentView('create')}
            >
              Create New
            </Button>
          </div>
        </div>
      </div>

      <div className="h-full">
        <OpportunitiesModule 
          user={testUser}
          initialView={currentView}
        />
      </div>
    </div>
  );
}