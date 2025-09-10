import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { User } from './lib/types';
import { SimpleLoginForm } from './components/auth/SimpleLoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from './components/ui/sonner';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setOriginalUser(user); // Keep track of the original logged-in user
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOriginalUser(null);
  };

  const handleRoleSwitch = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        {!currentUser ? (
          <SimpleLoginForm onLogin={handleLogin} />
        ) : (
          <Dashboard 
            user={currentUser} 
            originalUser={originalUser}
            onLogout={handleLogout}
            onRoleSwitch={handleRoleSwitch}
          />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
