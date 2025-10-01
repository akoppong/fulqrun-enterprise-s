import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { User } from './lib/types';
import { SimpleLoginForm } from './components/auth/SimpleLoginForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { MinimalTest } from './components/MinimalTest';
import { Toaster } from './components/ui/sonner';
import { EnhancedErrorBoundary } from './components/ui/enhanced-error-boundary';
import './lib/error-handlers'; // Initialize global error handlers
import { setupGlobalErrorHandling } from './lib/error-handling'; // Initialize comprehensive error handling
import { performanceMonitor } from './lib/performance-monitor';
import { dataRecovery } from './lib/data-recovery';
import { ensureDatabaseInitialized } from './lib/database';
import { dataIntegration } from './lib/data-integration';
import { databaseHealthChecker } from './lib/database-health-check';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  // Initialize error handling on app start
  useEffect(() => {
    setupGlobalErrorHandling();
    
    // Initialize performance monitoring
    console.log('Performance monitoring initialized');
    
    // Initialize database and data integration
    const initDatabase = async () => {
      try {
        console.log('🔧 Initializing FulQrun enterprise database...');
        await ensureDatabaseInitialized();
        await dataIntegration.initialize();
        
        // Run database health check after initialization
        setTimeout(async () => {
          try {
            const healthResult = await databaseHealthChecker.performHealthCheck();
            if (healthResult.status === 'critical') {
              console.warn('⚠️ Critical database issues detected:', healthResult.errors);
            } else if (healthResult.status === 'warning') {
              console.info('⚠️ Database warnings:', healthResult.issues);
            }
          } catch (error) {
            console.warn('Health check failed:', error);
          }
        }, 5000); // 5 second delay
        
        console.log('✅ Enterprise database and data integration initialized');
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
      }
    };
    
    initDatabase();
    
    // Optional: Set up performance monitoring callbacks - less verbose
    performanceMonitor.onOptimizationOpportunity((opportunity) => {
      if (opportunity.severity === 'critical') {
        console.warn('Critical optimization opportunity:', opportunity);
      }
    });

    // Run data recovery and health check
    const runDataRecovery = async () => {
      try {
        const healthCheck = await dataRecovery.healthCheck();
        
        if (healthCheck.status === 'critical') {
          console.warn('Critical data issues detected, running recovery...');
          const recovery = await dataRecovery.recoverAllData();
          
          if (recovery.recovered) {
            console.log('Data recovery completed successfully');
          } else {
            console.error('Data recovery failed:', recovery.errors);
          }
        } else if (healthCheck.status === 'warning') {
          console.info('Data warnings detected:', healthCheck.issues);
        }
      } catch (error) {
        console.error('Data recovery check failed:', error);
      }
    };

    // Run data recovery after a brief delay to allow app initialization
    setTimeout(runDataRecovery, 2000);
  }, []);

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
    <EnhancedErrorBoundary
      context="App"
      showErrorDetails={process.env.NODE_ENV === 'development'}
      resetOnPropsChange={true}
      monitorPerformance={true}
      maxRetries={3}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <div className="min-h-screen bg-background">
          {!currentUser ? (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">FulQrun CRM Login</h1>
              <SimpleLoginForm onLogin={handleLogin} />
            </div>
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
    </EnhancedErrorBoundary>
  );
}

export default App;
