import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { User } from './lib/types';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from './components/ui/sonner';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background">
        {!currentUser ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <Dashboard user={currentUser} onLogout={handleLogout} />
        )}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
