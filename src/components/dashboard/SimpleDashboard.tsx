import { useState } from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedPipelineManagement } from '../pipeline/AdvancedPipelineManagement';
import { Dashboard } from './Dashboard';
import { 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp,
  Home,
  Settings
} from '@phosphor-icons/react';

interface SimpleDashboardProps {
  user: User;
  onLogout: () => void;
}

export function SimpleDashboard({ user, onLogout }: SimpleDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">FulQrun CRM</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Professional Enterprise Sales Platform</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium">{user.name}</p>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
            <div className="text-right block sm:hidden">
              <Badge variant="secondary" className="text-xs">{user.role}</Badge>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2 p-3">
              <Home size={16} />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2 p-3">
              <Target size={16} />
              <span className="hidden sm:inline">Advanced Pipeline</span>
              <span className="sm:hidden">Pipeline</span>
            </TabsTrigger>
            <TabsTrigger value="full-crm" className="flex items-center gap-2 p-3">
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Full CRM</span>
              <span className="sm:hidden">CRM</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 lg:space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$124,500</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    +5 new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">73%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Sales Cycle</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28d</div>
                  <p className="text-xs text-muted-foreground">
                    -3 days improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to FulQrun CRM</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Your enterprise sales platform with advanced pipeline management is now ready. 
                    Choose from the powerful features below to get started.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('pipeline')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target size={20} className="text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Advanced Pipeline</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Drag-and-drop deal management with workflow automation and analytics
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setActiveTab('full-crm')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BarChart3 size={20} className="text-green-600" />
                        </div>
                        <h3 className="font-semibold">Full CRM Suite</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Complete CRM with contacts, companies, analytics and AI insights
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75 md:col-span-2 xl:col-span-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Settings size={20} className="text-purple-600" />
                        </div>
                        <h3 className="font-semibold">Enterprise Features</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Advanced reporting, team management, and integrations
                      </p>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-4 lg:space-y-6">
            <AdvancedPipelineManagement />
          </TabsContent>

          <TabsContent value="full-crm" className="space-y-4 lg:space-y-6">
            <Dashboard user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}