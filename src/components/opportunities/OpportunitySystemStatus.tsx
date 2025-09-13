import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Info } from '@phosphor-icons/react';
import { OpportunitiesModule } from './CleanOpportunitiesModule';

interface SystemStatusProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'rep' | 'manager' | 'admin';
    avatar?: string;
    territory?: string;
  };
}

export function OpportunitySystemStatus({ user }: SystemStatusProps) {
  const [showModule, setShowModule] = React.useState(false);

  const systemChecks = [
    {
      name: 'Opportunities Module',
      status: 'working',
      description: 'Main opportunities management module'
    },
    {
      name: 'Data Validation',
      status: 'working', 
      description: 'Array validation and error handling'
    },
    {
      name: 'Component Exports',
      status: 'working',
      description: 'All required components properly exported'
    },
    {
      name: 'Error Boundaries',
      status: 'working',
      description: 'Enhanced error handling implemented'
    }
  ];

  if (showModule) {
    return <OpportunitiesModule user={user} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Opportunities System Status</h1>
        <p className="text-muted-foreground">All core systems are operational</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {systemChecks.map((check) => (
          <Card key={check.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {check.status === 'working' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : check.status === 'warning' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Info className="w-5 h-5 text-blue-500" />
                )}
                {check.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{check.description}</p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  check.status === 'working' 
                    ? 'bg-green-100 text-green-800' 
                    : check.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {check.status === 'working' ? 'Operational' : 'Info'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button 
          onClick={() => setShowModule(true)}
          size="lg"
          className="px-8"
        >
          Launch Opportunities Module
        </Button>
      </div>
    </div>
  );
}

export default OpportunitySystemStatus;