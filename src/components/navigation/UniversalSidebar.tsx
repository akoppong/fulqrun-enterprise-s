import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { 
  Home,
  BarChart3,
  Building2,
  Brain,
  Star,
  Shield,
  CheckCircle,
  GraduationCap,
  Bot,
  Wrench,
  Target,
  TrendingUp,
  Workflow,
  Plug,
  ChevronRight,
  ChevronDown,
  HardDrives,
  Users
} from '@phosphor-icons/react';

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  description?: string;
  isNew?: boolean;
  badge?: string;
}

interface UniversalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userRole: string;
  isCollapsed?: boolean;
}

export function UniversalSidebar({ 
  activeTab, 
  onTabChange, 
  userName, 
  userRole, 
  isCollapsed = false 
}: UniversalSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core', 'ai-tools']));

  const navigationSections: { 
    id: string; 
    title: string; 
    items: NavigationItem[]; 
  }[] = [
    {
      id: 'core',
      title: 'Core Platform',
      items: [
        {
          id: 'overview',
          label: 'Dashboard',
          icon: Home,
          description: 'Overview and key metrics'
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
        }
      ]
    },
    {
      id: 'ai-tools',
      title: 'AI-Powered Tools',
      items: [
        {
          id: 'ai-demo',
          label: 'AI Demo Center',
          icon: Bot,
          description: 'Interactive AI demonstrations',
          isNew: true
        },
        {
          id: 'meddpicc',
          label: 'MEDDPICC Enhanced',
          icon: CheckCircle,
          description: 'AI-powered deal qualification'
        },
        {
          id: 'ai-qualification',
          label: 'AI Qualification',
          icon: Brain,
          description: 'Intelligent deal analysis'
        },
        {
          id: 'ai-scoring',
          label: 'AI Lead Scoring',
          icon: Star,
          description: 'Predictive lead prioritization'
        },
        {
          id: 'ai-risk',
          label: 'Deal Risk Analysis',
          icon: Shield,
          description: 'AI risk assessment'
        }
      ]
    },
    {
      id: 'growth',
      title: 'Growth & Learning',
      items: [
        {
          id: 'learning',
          label: 'Learning Platform',
          icon: GraduationCap,
          description: 'Training and certification'
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Data & Integrations',
      items: [
        {
          id: 'data-hub',
          label: 'Real-Time Data Hub',
          icon: HardDrives,
          description: 'Live CRM & BI connections'
        }
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      items: [
        {
          id: 'administration',
          label: 'Administration',
          icon: Wrench,
          description: 'Enterprise system configuration & management'
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleItemClick = (itemId: string) => {
    onTabChange(itemId);
  };

  return (
    <div className={cn(
      'h-full bg-card border-r flex flex-col transition-all duration-300 ease-in-out sidebar-container',
      isCollapsed ? 'w-16' : 'w-72'
    )}>
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate">FulQrun</h2>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Enterprise CRM</p>
                <Badge className="text-xs bg-accent/20 text-accent-foreground">
                  v2.0
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
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
      )}

      <Separator />

      {/* Navigation */}
      <div className="sidebar-navigation-area">
        <ScrollArea className="h-full sidebar-scroll-area">
          <div className="p-3">
            <nav className="space-y-2">
              {navigationSections.map((section) => (
                <div key={section.id} className="nav-section">
                  {!isCollapsed && (
                    <Collapsible
                      open={expandedSections.has(section.id)}
                      onOpenChange={() => toggleSection(section.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between h-8 px-2 py-1 nav-section-trigger"
                        >
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider nav-section-title">
                            {section.title}
                          </span>
                          {expandedSections.has(section.id) ? (
                            <ChevronDown size={12} className="text-muted-foreground" />
                          ) : (
                            <ChevronRight size={12} className="text-muted-foreground" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="collapsible-content">
                        <div className="space-y-1 mt-2">
                          {section.items.map((item) => {
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
                                onClick={() => handleItemClick(item.id)}
                              >
                                <div className="flex items-center gap-3 w-full min-w-0">
                                  <Icon size={18} className={cn(
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
                                      {item.badge && (
                                        <Badge className="text-xs h-4 px-1.5 nav-section-count">
                                          {item.badge}
                                        </Badge>
                                      )}
                                    </div>
                                    {item.description && (
                                      <div className={cn(
                                        "text-xs leading-tight mt-0.5 nav-item-description",
                                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                      )}>
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Button>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                  
                  {/* Collapsed view */}
                  {isCollapsed && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        
                        return (
                          <Button
                            key={item.id}
                            variant={isActive ? 'default' : 'ghost'}
                            size="icon"
                            className={cn(
                              'w-10 h-10 nav-item',
                              isActive && 'bg-primary text-primary-foreground',
                              !isActive && 'hover:bg-muted/50'
                            )}
                            onClick={() => handleItemClick(item.id)}
                            title={item.label}
                          >
                            <Icon size={18} />
                            {item.isNew && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t bg-muted/30 flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium mb-1 flex items-center gap-2">
              <Target size={12} />
              PEAK Methodology
            </div>
            <div className="text-xs">Prospect → Engage → Acquire → Keep</div>
          </div>
        </div>
      )}
    </div>
  );
}