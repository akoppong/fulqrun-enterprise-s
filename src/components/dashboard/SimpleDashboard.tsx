import { useState } from 'react';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UniversalSidebar } from '../navigation/UniversalSidebar';
import { SubNavigation } from '../navigation/SubNavigation';
import { ContentArea, ContentContainer, ContentGrid, ContentCard, EmptyState } from '../layout/ContentArea';
import { MobileNavigation } from '../navigation/MobileNavigation';
import { EnhancedMEDDPICCQualification } from '../pipeline/EnhancedMEDDPICCQualification';
import { EnhancedLearningPlatform } from './EnhancedLearningPlatform';
import { Dashboard } from './Dashboard';
import { AIQualificationDashboard, AILeadScoring, AIDealRiskAssessment, AIQualificationDemo } from '../ai-qualification';
import { AdministrationModule } from '../administration/AdministrationModule';
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
  Bot,
  Wrench,
  Menu,
  Plus,
  RefreshCw,
  Filter,
  Download,
  Share,
  MoreHorizontal
} from '@phosphor-icons/react';

interface SimpleDashboardProps {
  user: User;
  onLogout: () => void;
}

export function SimpleDashboard({ user, onLogout }: SimpleDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation mappings for sub-items
  const getSubNavigationItems = (mainTab: string) => {
    const subNavMappings: Record<string, any[]> = {
      'full-crm': [
        { id: 'pipeline', label: 'Pipeline', description: 'Sales pipeline overview' },
        { id: 'opportunities', label: 'Opportunities', description: 'Deal management' },
        { id: 'contacts', label: 'Contacts', description: 'Contact management' },
        { id: 'companies', label: 'Companies', description: 'Company profiles' },
        { id: 'analytics', label: 'Analytics', description: 'Reports & insights' },
      ],
      'meddpicc': [
        { id: 'meddpicc-form', label: 'Qualification Form', description: 'Complete assessment' },
        { id: 'meddpicc-insights', label: 'AI Insights', description: 'Intelligent tips', isNew: true },
      ],
      'ai-qualification': [
        { id: 'qualification-dashboard', label: 'Dashboard', description: 'AI-powered overview' },
        { id: 'insights-engine', label: 'Insights Engine', description: 'Deep AI analysis' },
      ],
      'ai-scoring': [
        { id: 'lead-scores', label: 'Lead Scores', description: 'AI-generated rankings' },
        { id: 'scoring-model', label: 'Scoring Model', description: 'Configure parameters' },
      ],
      'ai-risk': [
        { id: 'risk-dashboard', label: 'Risk Dashboard', description: 'Risk overview' },
        { id: 'mitigation-plans', label: 'Mitigation Plans', description: 'Risk strategies' },
      ],
      'learning': [
        { id: 'courses', label: 'Training Courses', description: 'PEAK & MEDDPICC training' },
        { id: 'certifications', label: 'Certifications', description: 'Professional certs' },
        { id: 'coaching', label: 'AI Coaching', description: 'Personalized coaching' },
      ],
      'administration': [
        { id: 'pipeline-builder', label: 'Pipeline Builder', description: 'Custom design', isNew: true },
        { id: 'integration-hub', label: 'Integration Hub', description: 'Connections', isNew: true },
        { id: 'user-management', label: 'User Management', description: 'User roles' },
        { id: 'system-settings', label: 'System Settings', description: 'Platform config' },
      ],
    };
    
    return subNavMappings[mainTab] || [];
  };

  const currentSubItems = getSubNavigationItems(activeTab);
  const [activeSubTab, setActiveSubTab] = useState(
    currentSubItems.length > 0 ? currentSubItems[0].id : ''
  );

  // Update sub-tab when main tab changes
  const handleMainTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const subItems = getSubNavigationItems(tabId);
    setActiveSubTab(subItems.length > 0 ? subItems[0].id : '');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNavigation
          activeTab={activeTab}
          onTabChange={handleMainTabChange}
          userName={user.name}
          userRole={user.role}
        />
      </div>

      {/* Universal Sidebar */}
      <div className="hidden lg:block">
        <UniversalSidebar
          activeTab={activeTab}
          onTabChange={handleMainTabChange}
          userName={user.name}
          userRole={user.role}
          isCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 p-4 mobile-header sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="ml-16 lg:ml-0 flex items-center gap-4">
                {/* Sidebar Toggle for Desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex"
                >
                  <Menu size={18} />
                </Button>
                
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">FulQrun CRM v2.0</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Phase 2: Advanced Pipeline & AI Integration Platform</p>
                </div>
              </div>
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

        {/* Sub Navigation */}
        {currentSubItems.length > 0 && (
          <SubNavigation
            items={currentSubItems}
            activeItem={activeSubTab}
            onItemChange={setActiveSubTab}
            title={getPageTitle(activeTab)}
          />
        )}

        {/* Content Area */}
        <ContentArea
          title={!currentSubItems.length ? getPageTitle(activeTab) : undefined}
          description={getPageDescription(activeTab, activeSubTab)}
          actions={getPageActions(activeTab, activeSubTab)}
          className="flex-1"
        >
          <ContentContainer className="p-6 space-y-6">
            {renderContent()}
          </ContentContainer>
        </ContentArea>
      </div>
    </div>
  );

  function getPageTitle(tab: string): string {
    const titles: Record<string, string> = {
      'overview': 'Dashboard Overview',
      'ai-demo': 'AI Demonstration Center',
      'full-crm': 'CRM Suite',
      'meddpicc': 'MEDDPICC Qualification',
      'ai-qualification': 'AI Qualification System',
      'ai-scoring': 'AI Lead Scoring',
      'ai-risk': 'Deal Risk Analysis',
      'learning': 'Learning Platform',
      'administration': 'System Administration',
    };
    return titles[tab] || 'FulQrun CRM';
  }

  function getPageDescription(mainTab: string, subTab: string): string {
    const descriptions: Record<string, string> = {
      'overview': 'Monitor your sales performance, pipeline health, and key metrics at a glance.',
      'ai-demo': 'Experience the power of AI-driven sales qualification and insights.',
      'full-crm': 'Complete customer relationship management with AI-enhanced features.',
      'pipeline': 'Track and manage your sales pipeline with visual insights.',
      'opportunities': 'Manage active deals and track progress through your sales process.',
      'contacts': 'Maintain relationships with customers and prospects.',
      'companies': 'Organize and track company information and engagement history.',
      'analytics': 'Gain insights with comprehensive reports and data visualization.',
      'meddpicc': 'Enhanced MEDDPICC qualification with AI-powered insights.',
      'meddpicc-form': 'Complete MEDDPICC qualification assessment for deals.',
      'meddpicc-insights': 'Get AI-generated tips and recommendations for better qualification.',
      'ai-qualification': 'Intelligent analysis and insights for deal qualification.',
      'qualification-dashboard': 'Overview of AI-powered qualification metrics.',
      'insights-engine': 'Deep AI analysis and strategic recommendations.',
      'ai-scoring': 'Predictive scoring to prioritize your highest-value prospects.',
      'lead-scores': 'View and manage AI-generated lead priority rankings.',
      'scoring-model': 'Configure and fine-tune your lead scoring parameters.',
      'ai-risk': 'Identify and mitigate deal risks with AI-powered analysis.',
      'risk-dashboard': 'Monitor deal risks and receive proactive alerts.',
      'mitigation-plans': 'Develop and execute risk reduction strategies.',
      'learning': 'Enhance your sales skills with PEAK and MEDDPICC training.',
      'courses': 'Access comprehensive training courses and materials.',
      'certifications': 'Earn professional certifications in sales methodologies.',
      'coaching': 'Receive personalized AI-powered sales coaching.',
      'administration': 'Enterprise-grade system configuration and management.',
      'pipeline-builder': 'Design and customize sales pipelines with automation.',
      'integration-hub': 'Connect with third-party tools and services.',
      'user-management': 'Manage user accounts, roles, and permissions.',
      'system-settings': 'Configure platform settings and preferences.',
    };
    return descriptions[subTab] || descriptions[mainTab] || '';
  }

  function getPageActions(mainTab: string, subTab: string) {
    const commonActions = (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <RefreshCw size={16} />
          Refresh
        </Button>
        <Button variant="outline" size="sm">
          <Share size={16} />
          Share
        </Button>
        <Button variant="outline" size="sm">
          <MoreHorizontal size={16} />
        </Button>
      </div>
    );

    switch (mainTab) {
      case 'overview':
        return (
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Plus size={16} />
              Quick Add
            </Button>
            {commonActions}
          </div>
        );
      case 'full-crm':
        return (
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Plus size={16} />
              New {subTab === 'opportunities' ? 'Opportunity' : 
                    subTab === 'contacts' ? 'Contact' : 
                    subTab === 'companies' ? 'Company' : 'Record'}
            </Button>
            <Button variant="outline" size="sm">
              <Filter size={16} />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} />
              Export
            </Button>
          </div>
        );
      default:
        return commonActions;
    }
  }

  function renderContent() {
    if (currentSubItems.length > 0) {
      return renderSubContent(activeSubTab);
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'ai-demo':
        return <AIQualificationDemo />;
      case 'full-crm':
        return <Dashboard user={user} />;
      case 'meddpicc':
        return <EnhancedMEDDPICCQualification opportunityId="demo-opp-1" />;
      case 'ai-qualification':
        return <AIQualificationDashboard />;
      case 'ai-scoring':
        return <AILeadScoring />;
      case 'ai-risk':
        return <AIDealRiskAssessment />;
      case 'learning':
        return <EnhancedLearningPlatform />;
      case 'administration':
        return (
          <AdministrationModule 
            userRole={user.role} 
            isOwner={user.email === 'admin@fulqrun.com'} 
          />
        );
      default:
        return <DefaultContent activeTab={activeTab} />;
    }
  }

  function renderSubContent(subTab: string) {
    switch (subTab) {
      // CRM Sub-sections
      case 'pipeline':
      case 'opportunities':
      case 'contacts':
      case 'companies':
      case 'analytics':
        return <Dashboard user={user} initialView={subTab} />;
      
      // MEDDPICC Sub-sections
      case 'meddpicc-form':
        return <EnhancedMEDDPICCQualification opportunityId="demo-opp-1" />;
      case 'meddpicc-insights':
        return <MeddpiccInsightsContent />;
      
      // AI Qualification Sub-sections
      case 'qualification-dashboard':
        return <AIQualificationDashboard />;
      case 'insights-engine':
        return <InsightsEngineContent />;
      
      // AI Scoring Sub-sections
      case 'lead-scores':
        return <AILeadScoring />;
      case 'scoring-model':
        return <ScoringModelContent />;
      
      // AI Risk Sub-sections
      case 'risk-dashboard':
        return <AIDealRiskAssessment />;
      case 'mitigation-plans':
        return <MitigationPlansContent />;
      
      // Learning Sub-sections
      case 'courses':
      case 'certifications':
      case 'coaching':
        return <EnhancedLearningPlatform initialTab={subTab} />;
      
      // Administration Sub-sections
      case 'pipeline-builder':
      case 'integration-hub':
      case 'user-management':
      case 'system-settings':
        return (
          <AdministrationModule 
            userRole={user.role} 
            isOwner={user.email === 'admin@fulqrun.com'}
            initialView={subTab}
          />
        );
      
      default:
        return <DefaultContent activeTab={subTab} />;
    }
  }
}

function OverviewContent() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <ContentGrid columns="md:grid-cols-2 lg:grid-cols-4">
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
      </ContentGrid>

      {/* Welcome Section */}
      <ContentCard
        title="Welcome to FulQrun CRM v2.0"
        description="Your enterprise sales platform with advanced AI capabilities"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            FulQrun CRM Phase 2 is now complete! Your enterprise sales platform features advanced 
            pipeline building, AI-enhanced MEDDPICC qualification, integrated learning platform, 
            and connections to 10+ external tools. Ready for Phase 3 enterprise scaling.
          </p>
          
          <ContentGrid columns="md:grid-cols-2 xl:grid-cols-3">
            <QuickActionCard
              icon={<Bot size={24} className="text-emerald-600" />}
              title="AI Demo (New!)"
              description="Experience AI-powered qualification system with live demo"
              bgColor="bg-emerald-100"
            />
            <QuickActionCard
              icon={<Workflow size={24} className="text-blue-600" />}
              title="Pipeline Builder"
              description="Design custom sales pipelines with drag-and-drop automation"
              bgColor="bg-blue-100"
            />
            <QuickActionCard
              icon={<CheckCircle size={24} className="text-purple-600" />}
              title="MEDDPICC Enhanced"
              description="AI-powered deal qualification with intelligent insights"
              bgColor="bg-purple-100"
            />
            <QuickActionCard
              icon={<Brain size={24} className="text-emerald-600" />}
              title="AI Qualification"
              description="Intelligent MEDDPICC analysis with AI insights"
              bgColor="bg-emerald-100"
            />
            <QuickActionCard
              icon={<Star size={24} className="text-orange-600" />}
              title="AI Lead Scoring"
              description="Predictive lead scoring and prioritization"
              bgColor="bg-orange-100"
            />
            <QuickActionCard
              icon={<Shield size={24} className="text-red-600" />}
              title="Deal Risk Analysis"
              description="AI-powered risk assessment and mitigation"
              bgColor="bg-red-100"
            />
          </ContentGrid>
        </div>
      </ContentCard>
    </div>
  );
}

function QuickActionCard({ icon, title, description, bgColor }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}) {
  return (
    <Card className="p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${bgColor} rounded-lg flex-shrink-0`}>
          {icon}
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

function DefaultContent({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <EmptyState
        icon={<Settings size={48} />}
        title="Feature in Development"
        description={`The ${activeTab} feature is currently being developed. Please check back soon for updates.`}
        action={
          <Button>
            <Home size={16} />
            Return to Dashboard
          </Button>
        }
      />
    </div>
  );
}

// Placeholder components for sub-sections
function MeddpiccInsightsContent() {
  return <DefaultContent activeTab="MEDDPICC Insights" />;
}

function InsightsEngineContent() {
  return <DefaultContent activeTab="Insights Engine" />;
}

function ScoringModelContent() {
  return <DefaultContent activeTab="Scoring Model" />;
}

function MitigationPlansContent() {
  return <DefaultContent activeTab="Mitigation Plans" />;
}