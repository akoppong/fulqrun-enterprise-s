import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  GridNine,
  CaretLeft,
  Brain
} from '@phosphor-icons/react';

interface CollapsibleSidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  user: User;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  isNew?: boolean;
}

export function CollapsibleSidebar({ 
  currentView, 
  onViewChange, 
  user, 
  isCollapsed = false, 
  onToggleCollapse 
}: CollapsibleSidebarProps) {
  
  // Core navigation items for demo
  const coreNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: GridNine,
      description: 'Main overview dashboard'
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: FunnelSimple,
      description: 'PEAK methodology pipeline'
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      description: 'MEDDPICC qualification'
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: AddressBook,
      description: 'Customer relationships'
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Buildings,
      description: 'Company database'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartLine,
      description: 'Performance insights'
    }
  ];

  const handleNavClick = (view: DashboardView) => {
    onViewChange(view);
  };

  return (
    <TooltipProvider>
      <aside className={cn(
        "hidden lg:flex bg-card border-r flex-col sidebar-container transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b bg-card flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Buildings size={20} className="text-primary-foreground" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h2 className="font-bold text-lg">FulQrun</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">Enterprise CRM</p>
                      <Badge className="text-xs bg-accent/20 text-accent-foreground">
                        v2.0
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Collapse button */}
              {onToggleCollapse && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
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
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className={cn("p-3 lg:p-4", isCollapsed && "px-2")}>
              <nav className="space-y-2">
                {coreNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  if (isCollapsed) {
                    // Collapsed view - show only icons with tooltips
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
                            {item.isNew && (
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
                            </div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  
                  // Expanded view
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'default' : 'ghost'}
                      className={cn(
                        'w-full justify-start h-auto p-3 text-left',
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
              </nav>
            </div>
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
      </aside>
    </TooltipProvider>
  );
}