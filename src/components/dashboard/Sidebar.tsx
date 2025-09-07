import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardView } from './Dashboard';
import { 
  FunnelSimple, 
  Target, 
  AddressBook, 
  ChartLine,
  Building2,
  TrendingUp,
  DollarSign,
  GraduationCap,
  Plugs,
  Brain,
  Crosshair,
  GridNine,
  Workflow,
  Shield,
  Star
} from '@phosphor-icons/react';

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole: 'rep' | 'manager' | 'admin';
}

export function Sidebar({ currentView, onViewChange, userRole }: SidebarProps) {
  const navigationItems = [
    {
      id: 'pipeline' as DashboardView,
      label: 'Pipeline',
      icon: FunnelSimple,
      description: 'PEAK methodology pipeline',
      roles: ['rep', 'manager', 'admin'],
      category: 'core'
    },
    {
      id: 'opportunities' as DashboardView,
      label: 'Opportunities',
      icon: Target,
      description: 'MEDDPICC qualification',
      roles: ['rep', 'manager', 'admin'],
      category: 'core'
    },
    {
      id: 'contacts' as DashboardView,
      label: 'Contacts',
      icon: AddressBook,
      description: 'Customer relationships',
      roles: ['rep', 'manager', 'admin'],
      category: 'core'
    },
    {
      id: 'analytics' as DashboardView,
      label: 'Analytics',
      icon: ChartLine,
      description: 'Performance insights',
      roles: ['manager', 'admin'],
      category: 'core'
    },
    {
      id: 'cstpv' as DashboardView,
      label: 'CSTPV Dashboard',
      icon: TrendingUp,
      description: 'AI-powered metrics',
      roles: ['rep', 'manager', 'admin'],
      category: 'advanced',
      isNew: true
    },
    {
      id: 'financial' as DashboardView,
      label: 'Financial',
      icon: DollarSign,
      description: 'Revenue & POS tracking',
      roles: ['rep', 'manager', 'admin'],
      category: 'advanced',
      isNew: true
    },
    {
      id: 'kpi-targets' as DashboardView,
      label: 'KPI Targets',
      icon: Crosshair,
      description: 'Goal tracking & KPIs',
      roles: ['rep', 'manager', 'admin'],
      category: 'advanced',
      isNew: true
    },
    {
      id: 'kpi-builder' as DashboardView,
      label: 'Dashboard Builder',
      icon: GridNine,
      description: 'Custom KPI dashboards',
      roles: ['rep', 'manager', 'admin'],
      category: 'advanced',
      isNew: true
    },
    {
      id: 'learning' as DashboardView,
      label: 'Learning',
      icon: GraduationCap,
      description: 'Certifications & training',
      roles: ['rep', 'manager', 'admin'],
      category: 'advanced',
      isNew: true
    },
    {
      id: 'workflows' as DashboardView,
      label: 'Workflows',
      icon: Workflow,
      description: 'Pipeline automation',
      roles: ['manager', 'admin'],
      category: 'advanced',
      isNew: true
    },
    {
      id: 'ai-insights' as DashboardView,
      label: 'AI Insights',
      icon: Brain,
      description: 'AI-powered analytics',
      roles: ['rep', 'manager', 'admin'],
      category: 'ai',
      isNew: true,
      isAI: true
    },
    {
      id: 'lead-scoring' as DashboardView,
      label: 'Lead Scoring',
      icon: Star,
      description: 'AI lead qualification',
      roles: ['rep', 'manager', 'admin'],
      category: 'ai',
      isNew: true,
      isAI: true
    },
    {
      id: 'deal-risk' as DashboardView,
      label: 'Risk Assessment',
      icon: Shield,
      description: 'AI risk analysis',
      roles: ['rep', 'manager', 'admin'],
      category: 'ai',
      isNew: true,
      isAI: true
    },
    {
      id: 'integrations' as DashboardView,
      label: 'Integrations',
      icon: Plugs,
      description: 'Connect external tools',
      roles: ['manager', 'admin'],
      category: 'advanced',
      isNew: true
    }
  ];

  const availableItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const coreItems = availableItems.filter(item => item.category === 'core');
  const advancedItems = availableItems.filter(item => item.category === 'advanced');
  const aiItems = availableItems.filter(item => item.category === 'ai');

  const renderNavSection = (items: typeof availableItems, title: string) => (
    <div className="space-y-2">
      <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        
        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start h-auto p-3',
              isActive && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onViewChange(item.id)}
          >
            <div className="flex items-center gap-3 w-full">
              <Icon size={20} />
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.label}</span>
                  {item.isNew && (
                    <Badge className="text-xs bg-accent text-accent-foreground">
                      New
                    </Badge>
                  )}
                  {(item as any).isAI && (
                    <Badge className="text-xs bg-purple-100 text-purple-800">
                      AI
                    </Badge>
                  )}
                </div>
                <div className="text-xs opacity-75">{item.description}</div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="w-64 bg-card border-r flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">FulQrun</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">Enterprise CRM</p>
              <Badge className="text-xs bg-accent/20 text-accent-foreground">
                v2.0
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {renderNavSection(coreItems, 'Core Features')}
        {aiItems.length > 0 && renderNavSection(aiItems, 'AI-Powered Features')}
        {advancedItems.length > 0 && renderNavSection(advancedItems, 'Advanced Features')}
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1 flex items-center gap-2">
            <Brain size={12} />
            PEAK + AI-Powered
          </div>
          <div>Prospect → Engage → Acquire → Keep</div>
        </div>
      </div>
    </div>
  );
}