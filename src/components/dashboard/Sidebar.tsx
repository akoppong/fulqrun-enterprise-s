import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardView } from './Dashboard';
import { hasPermission } from '@/lib/rolePermissions';
import { User } from '@/lib/types';
import { 
  List,
  FunnelSimple, 
  Target, 
  AddressBook, 
  ChartLine,
  Buildings,
  TrendUp,
  CurrencyDollar,
  GraduationCap,
  Brain,
  GridNine,
  GitBranch,
  CaretDown,
  CaretRight,
  CaretLeft,
  X
} from '@phosphor-icons/react';

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  user: User;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  permissionId?: string;
  action?: string;
  isNew?: boolean;
  isAI?: boolean;
  isBeta?: boolean;
}

export function Sidebar({ currentView, onViewChange, user, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    ai: true,
    advanced: false,
    admin: false,
    testing: false
  });

  // Persist collapse state in localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed && onToggleCollapse) {
      const isStoredCollapsed = JSON.parse(savedCollapsed);
      if (isStoredCollapsed !== isCollapsed) {
        onToggleCollapse();
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

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
          id: 'dashboard',
          label: 'Dashboard',
          icon: GridNine,
          description: 'Main overview dashboard',
          permissionId: 'dashboard',
          action: 'read'
        },
        {
          id: 'pipeline',
          label: 'Pipeline',
          icon: FunnelSimple,
          description: 'PEAK methodology pipeline',
          permissionId: 'pipeline',
          action: 'read'
        },
        {
          id: 'opportunities',
          label: 'Opportunities',
          icon: Target,
          description: 'MEDDPICC qualification',
          permissionId: 'opportunities',
          action: 'read'
        },
        {
          id: 'contacts',
          label: 'Contacts',
          icon: AddressBook,
          description: 'Customer relationships',
          permissionId: 'contacts',
          action: 'read'
        },
        {
          id: 'companies',
          label: 'Companies',
          icon: Buildings,
          description: 'Company database',
          permissionId: 'companies',
          action: 'read'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: ChartLine,
          description: 'Performance insights',
          permissionId: 'team-analytics',
          action: 'read'
        }
      ]
    },
    {
      id: 'ai',
      title: 'AI-Powered Features',
      icon: TrendUp,
      defaultOpen: true,
      items: [
        {
          id: 'ai-insights',
          label: 'AI Insights',
          icon: TrendUp,
          description: 'AI-driven sales insights',
          permissionId: 'ai-insights',
          action: 'read',
          isAI: true
        },
        {
          id: 'financial',
          label: 'Financial Management',
          icon: CurrencyDollar,
          description: 'Revenue tracking & forecasting',
          permissionId: 'financial',
          action: 'read'
        },
        {
          id: 'learning',
          label: 'Learning',
          icon: GraduationCap,
          description: 'PEAK & MEDDPICC certification',
          permissionId: 'learning',
          action: 'read',
          isNew: true
        },
        {
          id: 'workflows',
          label: 'Workflows',
          icon: GitBranch,
          description: 'Pipeline automation',
          permissionId: 'workflows',
          action: 'read',
          isNew: true
        }
      ]
    }
  ];

  // Filter sections based on user permissions
  const filteredSections = navigationSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // If no permission specified, show to everyone
      if (!item.permissionId) return true;
      
      // Check if user has the required permission
      return hasPermission(user, item.permissionId, item.action);
    })
  })).filter(section => section.items.length > 0);

  const SidebarContent = () => (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full sidebar-container transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80"
      )}>
        {/* Header */}
        <div className="p-4 lg:p-6 border-b bg-card flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Buildings size={16} className="lg:hidden text-primary-foreground" />
                <Buildings size={20} className="hidden lg:block text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <div className="hidden lg:block">
                  <h2 className="font-bold text-lg">FulQrun</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Enterprise CRM</p>
                    <Badge className="text-xs bg-accent/20 text-accent-foreground">
                      v2.0
                    </Badge>
                    <Badge className={`text-xs ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            
            {/* Desktop collapse button */}
            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex w-8 h-8"
                    onClick={onToggleCollapse}
                  >
                    <CaretLeft 
                      size={16} 
                      className={cn(
                        "transition-transform duration-200",
                        isCollapsed && "rotate-180"
                      )} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                </TooltipContent>
              </Tooltip>
            )}
            
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
          
          {!isCollapsed && (
            <div className="lg:hidden mt-3">
              <h2 className="font-bold text-base">FulQrun CRM</h2>
              <p className="text-xs text-muted-foreground">Enterprise Sales Platform</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="sidebar-navigation-area" style={{ height: 'calc(100vh - 200px)' }}>
          <ScrollArea className="h-full sidebar-scroll-area">
            <div className={cn("p-3 lg:p-4", isCollapsed && "px-2")}>
              <nav className="space-y-2 lg:space-y-4 pb-8">
                {filteredSections.map((section) => {
                  const SectionIcon = section.icon;
                  const isExpanded = expandedSections[section.id];
                  
                  if (isCollapsed) {
                    // Collapsed view - show only icons with tooltips
                    return (
                      <div key={section.id} className="space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentView === item.id;
                          
                          return (
                            <Tooltip key={item.id}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={isActive ? 'default' : 'ghost'}
                                  size="icon"
                                  className={cn(
                                    'w-12 h-12 relative',
                                    isActive && 'bg-primary text-primary-foreground shadow-sm',
                                    !isActive && 'hover:bg-muted/50'
                                  )}
                                  onClick={() => handleNavClick(item.id)}
                                >
                                  <Icon size={20} className={cn(
                                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                                  )} />
                                  {(item.isNew || item.isAI || item.isBeta) && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{item.label}</span>
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
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    );
                  }
                  
                  // Expanded view - show full sections
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
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t bg-muted/30 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1 flex items-center gap-2">
                <Brain size={12} />
                PEAK + AI-Powered
              </div>
              <div className="text-xs">Prospect → Engage → Acquire → Keep</div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
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
            <List size={18} />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 bg-background h-full">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex bg-card border-r flex-col sidebar-container transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}