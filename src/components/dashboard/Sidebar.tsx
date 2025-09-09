import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DashboardView } from './Dashboard';
import { 
  Menu,
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
  Star,
  FloppyDisk,
  TestTube,
  ClipboardList,
  MagicWand,
  CaretDown,
  CaretRight,
  X
} from '@phosphor-icons/react';

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  userRole: 'rep' | 'manager' | 'admin';
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  roles: string[];
  isNew?: boolean;
  isAI?: boolean;
  isBeta?: boolean;
}

export function Sidebar({ currentView, onViewChange, userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    ai: true,
    advanced: false,
    testing: false
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleNavClick = (view: DashboardView) => {
    onViewChange(view);
    setIsOpen(false); // Close mobile menu after navigation
  };

  const navigationSections: NavSection[] = [
    {
      id: 'core',
      title: 'Core Features',
      icon: FunnelSimple,
      defaultOpen: true,
      items: [
        {
          id: 'pipeline',
          label: 'Pipeline',
          icon: FunnelSimple,
          description: 'PEAK methodology pipeline',
          roles: ['rep', 'manager', 'admin']
        },
        {
          id: 'opportunities',
          label: 'Opportunities',
          icon: Target,
          description: 'MEDDPICC qualification',
          roles: ['rep', 'manager', 'admin']
        },
        {
          id: 'contacts',
          label: 'Contacts',
          icon: AddressBook,
          description: 'Customer relationships',
          roles: ['rep', 'manager', 'admin']
        },
        {
          id: 'companies',
          label: 'Companies',
          icon: Building2,
          description: 'Company database',
          roles: ['rep', 'manager', 'admin']
        },
        {
          id: 'segments',
          label: 'Customer Segments',
          icon: Building2,
          description: 'Strategic segmentation',
          roles: ['manager', 'admin'],
          isNew: true
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: ChartLine,
          description: 'Performance insights',
          roles: ['manager', 'admin']
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI-Powered Features',
      icon: Brain,
      defaultOpen: true,
      items: [
        {
          id: 'ai-insights',
          label: 'AI Insights',
          icon: Brain,
          description: 'AI-powered analytics',
          roles: ['rep', 'manager', 'admin'],
          isNew: true,
          isAI: true
        },
        {
          id: 'lead-scoring',
          label: 'Lead Scoring',
          icon: Star,
          description: 'AI lead qualification',
          roles: ['rep', 'manager', 'admin'],
          isNew: true,
          isAI: true
        },
        {
          id: 'deal-risk',
          label: 'Risk Assessment',
          icon: Shield,
          description: 'AI risk analysis',
          roles: ['rep', 'manager', 'admin'],
          isNew: true,
          isAI: true
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: TrendingUp,
      defaultOpen: false,
      items: [
        {
          id: 'cstpv',
          label: 'CSTPV Dashboard',
          icon: TrendingUp,
          description: 'AI-powered metrics',
          roles: ['rep', 'manager', 'admin'],
          isNew: true
        },
        {
          id: 'financial',
          label: 'Financial',
          icon: DollarSign,
          description: 'Revenue & POS tracking',
          roles: ['rep', 'manager', 'admin'],
          isNew: true
        },
        {
          id: 'kpi-targets',
          label: 'KPI Targets',
          icon: Crosshair,
          description: 'Goal tracking & KPIs',
          roles: ['rep', 'manager', 'admin'],
          isNew: true
        },
        {
          id: 'kpi-builder',
          label: 'Dashboard Builder',
          icon: GridNine,
          description: 'Custom KPI dashboards',
          roles: ['rep', 'manager', 'admin'],
          isNew: true
        },
        {
          id: 'workflows',
          label: 'Workflows',
          icon: Workflow,
          description: 'Pipeline automation',
          roles: ['manager', 'admin'],
          isNew: true
        },
        {
          id: 'learning',
          label: 'Learning',
          icon: GraduationCap,
          description: 'Certifications & training',
          roles: ['rep', 'manager', 'admin'],
          isNew: true
        },
        {
          id: 'integrations',
          label: 'Integrations',
          icon: Plugs,
          description: 'Connect external tools',
          roles: ['manager', 'admin'],
          isNew: true
        }
      ]
    },
    {
      id: 'testing',
      title: 'Testing & Demos',
      icon: TestTube,
      defaultOpen: false,
      items: [
        {
          id: 'autosave-interactive',
          label: 'Interactive Demo',
          icon: MagicWand,
          description: 'Comprehensive auto-save testing',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        },
        {
          id: 'field-testing',
          label: 'Field Type Lab',
          icon: TestTube,
          description: 'Comprehensive field validation testing',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        },
        {
          id: 'comprehensive-testing',
          label: 'Test Suite',
          icon: Shield,
          description: 'Advanced validation test suite',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        },
        {
          id: 'validation-demo',
          label: 'Validation Demo',
          icon: MagicWand,
          description: 'Interactive validation testing',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        },
        {
          id: 'autosave-demo',
          label: 'Auto-Save Demo',
          icon: FloppyDisk,
          description: 'Form auto-save features',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        },
        {
          id: 'autosave-test',
          label: 'Auto-Save Tests',
          icon: TestTube,
          description: 'Test auto-save functionality',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        },
        {
          id: 'autosave-manual',
          label: 'Manual Testing',
          icon: ClipboardList,
          description: 'Step-by-step auto-save testing',
          roles: ['rep', 'manager', 'admin'],
          isBeta: true
        }
      ]
    }
  ];

  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(userRole))
  })).filter(section => section.items.length > 0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 size={16} className="lg:hidden text-primary-foreground" />
              <Building2 size={20} className="hidden lg:block text-primary-foreground" />
            </div>
            <div className="hidden lg:block">
              <h2 className="font-bold text-lg">FulQrun</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Enterprise CRM</p>
                <Badge className="text-xs bg-accent/20 text-accent-foreground">
                  v2.0
                </Badge>
              </div>
            </div>
          </div>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="lg:hidden mt-3">
          <h2 className="font-bold text-base">FulQrun CRM</h2>
          <p className="text-xs text-muted-foreground">Enterprise Sales Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-3 lg:p-4">
        <nav className="space-y-2 lg:space-y-4">
          {filteredSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections[section.id];
            
            return (
              <Collapsible
                key={section.id}
                open={isExpanded}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto p-3 font-medium text-sm hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <SectionIcon size={18} className="text-muted-foreground" />
                      <span>{section.title}</span>
                      {section.items.some(item => item.isNew || item.isAI) && (
                        <Badge className="text-xs h-4 px-1.5 bg-primary/10 text-primary">
                          {section.items.filter(item => item.isNew || item.isAI).length}
                        </Badge>
                      )}
                    </div>
                    {isExpanded ? (
                      <CaretDown size={16} className="text-muted-foreground" />
                    ) : (
                      <CaretRight size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1 ml-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start h-auto p-2.5 text-left',
                          isActive && 'bg-primary text-primary-foreground shadow-sm',
                          !isActive && 'hover:bg-muted/50'
                        )}
                        onClick={() => handleNavClick(item.id)}
                      >
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <Icon size={18} className={cn(
                            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                          )} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{item.label}</span>
                              {item.isNew && (
                                <Badge className="text-xs h-4 px-1.5 bg-green-100 text-green-800">
                                  New
                                </Badge>
                              )}
                              {item.isAI && (
                                <Badge className="text-xs h-4 px-1.5 bg-purple-100 text-purple-800">
                                  AI
                                </Badge>
                              )}
                              {item.isBeta && (
                                <Badge className="text-xs h-4 px-1.5 bg-orange-100 text-orange-800">
                                  Beta
                                </Badge>
                              )}
                            </div>
                            <div className={cn(
                              "text-xs leading-tight mt-0.5 truncate",
                              isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            )}>
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1 flex items-center gap-2">
            <Brain size={12} />
            PEAK + AI-Powered
          </div>
          <div className="text-xs">Prospect → Engage → Acquire → Keep</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg lg:hidden"
          >
            <Menu size={18} />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-background">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-card border-r flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}