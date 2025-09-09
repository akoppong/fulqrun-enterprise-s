import { useState } from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { AdvancedPipelineManagement } from '../pipeline/AdvancedPipelineManagement';
import { AdvancedPipelineBuilder } from '../pipeline/AdvancedPipelineBuilder';
import { EnhancedMEDDPICCQualification } from '../pipeline/EnhancedMEDDPICCQualification';
import { IntegrationHub } from './IntegrationHub';
import { EnhancedLearningPlatform } from './EnhancedLearningPlatform';
import { Dashboard } from './Dashboard';
import { AIQualificationDashboard, AILeadScoring, AIDealRiskAssessment, AIQualificationDemo } from '../ai-qualification';
import { 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp,
  Home,
  Settings,
  Workflow,
  CheckCircle,
  Plug,
  GraduationCap,
  Brain,
  Star,
  Shield,
  Bot
} from '@phosphor-icons/react';

interface SimpleDashboardProps {
  user: User;
  onLogout: () => void;
}

export function SimpleDashboard({ user, onLogout }: SimpleDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userName={user.name}
          userRole={user.role}
        />
      </div>

      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 p-4 mobile-header sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="ml-16 lg:ml-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">FulQrun CRM v2.0</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Phase 2: Advanced Pipeline & AI Integration Platform</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-sm">{user.name}</p>
              <Badge variant="secondary" className="text-xs">{user.role}</Badge>
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
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-10 gap-1 h-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2 p-3">
              <Home size={16} />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-demo" className="flex items-center gap-2 p-3">
              <Bot size={16} />
              <span className="hidden sm:inline">AI Demo</span>
              <span className="sm:hidden">Demo</span>
            </TabsTrigger>
            <TabsTrigger value="pipeline-builder" className="flex items-center gap-2 p-3">
              <Workflow size={16} />
              <span className="hidden sm:inline">Pipeline</span>
              <span className="sm:hidden">Pipe</span>
            </TabsTrigger>
            <TabsTrigger value="meddpicc" className="flex items-center gap-2 p-3">
              <CheckCircle size={16} />
              <span className="hidden sm:inline">MEDDPICC</span>
              <span className="sm:hidden">Qual</span>
            </TabsTrigger>
            <TabsTrigger value="ai-qualification" className="flex items-center gap-2 p-3">
              <Brain size={16} />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="ai-scoring" className="flex items-center gap-2 p-3">
              <Star size={16} />
              <span className="hidden sm:inline">Lead Scoring</span>
              <span className="sm:hidden">Score</span>
            </TabsTrigger>
            <TabsTrigger value="ai-risk" className="flex items-center gap-2 p-3">
              <Shield size={16} />
              <span className="hidden sm:inline">Risk Analysis</span>
              <span className="sm:hidden">Risk</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2 p-3">
              <Plug size={16} />
              <span className="hidden sm:inline">Integrations</span>
              <span className="sm:hidden">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2 p-3">
              <GraduationCap size={16} />
              <span className="hidden sm:inline">Learning</span>
              <span className="sm:hidden">Learn</span>
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
                    FulQrun CRM Phase 2 is now complete! Your enterprise sales platform features advanced 
                    pipeline building, AI-enhanced MEDDPICC qualification, integrated learning platform, 
                    and connections to 10+ external tools. Ready for Phase 3 enterprise scaling.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                      onClick={() => setActiveTab('ai-demo')}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Bot size={20} className="text-emerald-600" />
                        </div>
                        <h3 className="font-semibold">AI Demo (New!)</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Experience AI-powered qualification system with live demo
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('pipeline-builder')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Workflow size={20} className="text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Pipeline Builder</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Design custom sales pipelines with drag-and-drop automation
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('meddpicc')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CheckCircle size={20} className="text-purple-600" />
                        </div>
                        <h3 className="font-semibold">MEDDPICC Enhanced</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-powered deal qualification with intelligent insights
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('ai-qualification')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <Brain size={20} className="text-emerald-600" />
                        </div>
                        <h3 className="font-semibold">AI Qualification</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Intelligent MEDDPICC analysis with AI insights
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('ai-scoring')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Star size={20} className="text-orange-600" />
                        </div>
                        <h3 className="font-semibold">AI Lead Scoring</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Predictive lead scoring and prioritization
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('ai-risk')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Shield size={20} className="text-red-600" />
                        </div>
                        <h3 className="font-semibold">Deal Risk Analysis</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI-powered risk assessment and mitigation
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('integrations')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Plug size={20} className="text-green-600" />
                        </div>
                        <h3 className="font-semibold">Integration Hub</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Connect Slack, DocuSign, Gong, and 10+ tools
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                          onClick={() => setActiveTab('learning')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <GraduationCap size={20} className="text-yellow-600" />
                        </div>
                        <h3 className="font-semibold">Learning Platform</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        PEAK & MEDDPICC certifications with AI coaching
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setActiveTab('full-crm')}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <BarChart3 size={20} className="text-indigo-600" />
                        </div>
                        <h3 className="font-semibold">Full CRM Suite</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Complete CRM with contacts, companies, analytics and AI insights
                      </p>
                    </Card>

                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow opacity-75">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Settings size={20} className="text-red-600" />
                        </div>
                        <h3 className="font-semibold">Enterprise Features</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Advanced reporting, team management (Phase 3)
                      </p>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-demo" className="space-y-4 lg:space-y-6">
            <AIQualificationDemo />
          </TabsContent>

          <TabsContent value="pipeline-builder" className="space-y-4 lg:space-y-6">
            <AdvancedPipelineBuilder />
          </TabsContent>

          <TabsContent value="meddpicc" className="space-y-4 lg:space-y-6">
            <EnhancedMEDDPICCQualification opportunityId="demo-opp-1" />
          </TabsContent>

          <TabsContent value="ai-qualification" className="space-y-4 lg:space-y-6">
            <AIQualificationDashboard />
          </TabsContent>

          <TabsContent value="ai-scoring" className="space-y-4 lg:space-y-6">
            <AILeadScoring />
          </TabsContent>

          <TabsContent value="ai-risk" className="space-y-4 lg:space-y-6">
            <AIDealRiskAssessment />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 lg:space-y-6">
            <IntegrationHub />
          </TabsContent>

          <TabsContent value="learning" className="space-y-4 lg:space-y-6">
            <EnhancedLearningPlatform />
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