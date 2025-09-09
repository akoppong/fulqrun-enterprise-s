import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Menu,
  Home,
  Target,
  BarChart3,
  Building2,
  X,
  Brain,
  Star,
  Shield,
  CheckCircle,
  Workflow,
  Bot,
  Users,
  TrendingUp,
  Wrench,
  GraduationCap,
  HardDrives
} from '@phosphor-icons/react';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userRole: string;
}

export function MobileNavigation({ activeTab, onTabChange, userName, userRole }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      description: 'Dashboard overview and quick stats'
    },
    {
      id: 'ai-demo',
      label: 'AI Demo',
      icon: Bot,
      description: 'Interactive AI qualification system demo',
      isNew: true
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Target,
      description: 'Sales pipeline with PEAK methodology'
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Star,
      description: 'Deal management & MEDDPICC'
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      description: 'Customer relationships'
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building2,
      description: 'Company profiles & data'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Reports & performance insights'
    },
    {
      id: 'dashboard-builder',
      label: 'Dashboard Builder',
      icon: TrendingUp,
      description: 'Customizable dashboards',
      isNew: true
    },
    {
      id: 'meddpicc',
      label: 'MEDDPICC',
      icon: CheckCircle,
      description: 'Enhanced deal qualification framework',
      isNew: true
    },
    {
      id: 'ai-qualification',
      label: 'AI Qualification',
      icon: Brain,
      description: 'Intelligent MEDDPICC analysis with AI insights',
      isNew: true
    },
    {
      id: 'ai-scoring',
      label: 'AI Lead Scoring',
      icon: Star,
      description: 'Predictive lead scoring and prioritization',
      isNew: true
    },
    {
      id: 'ai-risk',
      label: 'Deal Risk Analysis',
      icon: Shield,
      description: 'AI-powered risk assessment and mitigation',
      isNew: true
    },
    {
      id: 'learning',
      label: 'Learning Platform',
      icon: GraduationCap,
      description: 'Training and certification'
    },
    {
      id: 'data-hub',
      label: 'Real-Time Data Hub',
      icon: HardDrives,
      description: 'Live CRM & BI connections'
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: Wrench,
      description: 'Enterprise system configuration & management'
    }
  ];

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border shadow-lg lg:hidden mobile-nav-trigger"
        >
          <Menu size={18} />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="w-80 p-0 bg-background mobile-nav-backdrop">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full mobile-nav-content">
          {/* Header */}
          <div className="p-4 border-b bg-card flex-shrink-0">
            <div className="flex items-center justify-between">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <Badge variant="secondary" className="text-xs">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <div className="mobile-nav-scroll" style={{ height: 'calc(100vh - 250px)' }}>
            <ScrollArea className="h-full sidebar-scroll-area">
              <div className="p-4">
                <nav className="space-y-2 pb-8">
              <div className="px-2 mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider nav-section-header">
                  Navigation
                </h3>
              </div>
              
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-auto p-3 nav-item',
                      isActive && 'bg-primary text-primary-foreground shadow-sm',
                      !isActive && 'hover:bg-muted/50'
                    )}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <div className="flex items-center gap-3 w-full min-w-0">
                      <Icon size={20} className={cn(
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                      )} />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate nav-item-text">
                            {item.label}
                          </span>
                          {item.isNew && (
                            <Badge className="text-xs h-4 px-1.5 bg-green-100 text-green-800 nav-badge">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className={cn(
                          "text-xs leading-tight mt-0.5 nav-item-description",
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </nav>
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-muted/30 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1 flex items-center gap-2">
                <BarChart3 size={12} />
                PEAK Methodology
              </div>
              <div className="text-xs">Prospect → Engage → Acquire → Keep</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}