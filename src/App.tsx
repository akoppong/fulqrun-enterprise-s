import { useState } from 'react';
import { User } from './lib/types';
import { LoginForm } from './components/auth/LoginForm';
import { SimpleDashboard } from './components/dashboard/SimpleDashboard';
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
    <div className="min-h-screen bg-background">
      {!currentUser ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <SimpleDashboard user={currentUser} onLogout={handleLogout} />
      )}
      <Toaster />
    </div>
  );
}

export default App;
