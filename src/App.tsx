import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { User } from './lib/types';
import { SimpleLoginForm } from './components/auth/SimpleLoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { ValidationDemo } from './components/demo/ValidationDemo';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { TestTube, LayoutDashboard } from '@phosphor-icons/react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'demo'>('login');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const renderView = () => {
    if (currentView === 'demo') {
      return <ValidationDemo />;
    }
    
    if (!currentUser) {
      return <SimpleLoginForm onLogin={handleLogin} />;
    }
    
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        {/* Demo Navigation */}
        {currentView !== 'login' && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <Button
              variant={currentView === 'demo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('demo')}
            >
              <TestTube className="w-4 h-4 mr-1" />
              Validation Demo
            </Button>
            {currentUser && (
              <Button
                variant={currentView === 'dashboard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            )}
          </div>
        )}
        
        {renderView()}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
