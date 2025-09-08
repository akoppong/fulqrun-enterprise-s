import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SimpleDashboardProps {
  user: User;
  onLogout: () => void;
}

export function SimpleDashboard({ user, onLogout }: SimpleDashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">FulQrun CRM</h1>
            <p className="text-sm text-muted-foreground">Professional Enterprise Sales Platform</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
            <Button onClick={onLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$124,500</p>
              <p className="text-sm text-muted-foreground">Total Pipeline Value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$45,200</p>
              <p className="text-sm text-muted-foreground">Closed Won</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Welcome to FulQrun CRM</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your enterprise sales platform is ready. This simplified dashboard is loading successfully.
              The full CRM features are available once all components are properly loaded.
            </p>
            <div className="flex gap-2">
              <Button>View Pipeline</Button>
              <Button variant="outline">Add Opportunity</Button>
              <Button variant="outline">View Reports</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}