import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  List, 
  X, 
  ChevronDown, 
  ChevronRight,
  Home,
  Users,
  Building,
  Target,
  ChartLine,
  Settings,
  User
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ResponsiveShow } from './EnhancedResponsiveLayout';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string;
  badge?: string;
  children?: NavigationItem[];
  onClick?: () => void;
  isActive?: boolean;
  roles?: string[];
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  currentPath?: string;
  userRole?: string;
  onNavigate?: (item: NavigationItem) => void;
  className?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    isActive: true
  },
  {
    id: 'crm',
    label: 'CRM Suite',
    icon: Users,
    children: [
      { id: 'opportunities', label: 'Opportunities', icon: Target, href: '/opportunities' },
      { id: 'contacts', label: 'Contacts', icon: User, href: '/contacts' },
      { id: 'companies', label: 'Companies', icon: Building, href: '/companies' },
      { id: 'segments', label: 'Customer Segments', icon: Users, href: '/segments' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: ChartLine,
    children: [
      { id: 'pipeline', label: 'Pipeline Analytics', icon: ChartLine, href: '/analytics/pipeline' },
      { id: 'performance', label: 'Performance', icon: Target, href: '/analytics/performance' },
      { id: 'forecasting', label: 'Forecasting', icon: ChartLine, href: '/analytics/forecasting' }
    ]
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    roles: ['admin', 'manager'],
    children: [
      { id: 'users', label: 'User Management', icon: Users, href: '/admin/users' },
      { id: 'settings', label: 'System Settings', icon: Settings, href: '/admin/settings' },
      { id: 'integrations', label: 'Integrations', icon: Building, href: '/admin/integrations' }
    ]
  }
];

function NavigationItemComponent({ 
  item, 
  onNavigate, 
  isCollapsed = false,
  level = 0 
}: { 
  item: NavigationItem; 
  onNavigate?: (item: NavigationItem) => void;
  isCollapsed?: boolean;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (onNavigate) {
      onNavigate(item);
    }
  };

  return (
    <div className="w-full">
      <Button
        variant={item.isActive ? 'default' : 'ghost'}
        className={cn(
          'w-full justify-start h-10 px-3',
          level > 0 && 'ml-4 w-[calc(100%-1rem)]',
          item.isActive && 'bg-primary text-primary-foreground font-medium'
        )}
        onClick={handleClick}
      >
        <Icon size={18} className={cn('flex-shrink-0', !isCollapsed && 'mr-3')} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <div className="ml-2 flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </div>
            )}
          </>
        )}
      </Button>
      
      {hasChildren && isExpanded && !isCollapsed && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopSidebar({ 
  items, 
  onNavigate, 
  isCollapsed, 
  onToggleCollapse 
}: {
  items: NavigationItem[];
  onNavigate?: (item: NavigationItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <div className={cn(
      'hidden lg:flex flex-col h-full bg-card border-r border-border transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-foreground">FulQrun CRM</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0"
        >
          <List size={16} />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-3">
        <nav className="space-y-2">
          {items.map((item) => (
            <NavigationItemComponent
              key={item.id}
              item={item}
              onNavigate={onNavigate}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function MobileNavigation({ 
  items, 
  onNavigate, 
  isOpen, 
  onClose 
}: {
  items: NavigationItem[];
  onNavigate?: (item: NavigationItem) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0 bg-background/95 backdrop-blur-sm border shadow-lg"
        >
          <List size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle>FulQrun CRM</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-80px)] p-4">
          <nav className="space-y-2">
            {items.map((item) => (
              <NavigationItemComponent
                key={item.id}
                item={item}
                onNavigate={(navItem) => {
                  onNavigate?.(navItem);
                  onClose();
                }}
                isCollapsed={false}
              />
            ))}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function TabletNavigation({ 
  items, 
  onNavigate 
}: {
  items: NavigationItem[];
  onNavigate?: (item: NavigationItem) => void;
}) {
  return (
    <div className="hidden md:block lg:hidden">
      <div className="bg-card border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex space-x-1 p-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={item.isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-shrink-0 min-w-0"
                  onClick={() => onNavigate?.(item)}
                >
                  <Icon size={16} className="mr-2" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function ResponsiveNavigation({ 
  items = NAVIGATION_ITEMS, 
  currentPath, 
  userRole, 
  onNavigate,
  className 
}: ResponsiveNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Filter items based on user role
  const filteredItems = items.filter(item => 
    !item.roles || item.roles.includes(userRole || 'user')
  );

  const handleNavigate = (item: NavigationItem) => {
    onNavigate?.(item);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Mobile Navigation */}
      <ResponsiveShow below="lg">
        <MobileNavigation
          items={filteredItems}
          onNavigate={handleNavigate}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </ResponsiveShow>

      {/* Tablet Navigation */}
      <ResponsiveShow only="md">
        <TabletNavigation
          items={filteredItems}
          onNavigate={handleNavigate}
        />
      </ResponsiveShow>

      {/* Desktop Sidebar */}
      <ResponsiveShow above="lg">
        <DesktopSidebar
          items={filteredItems}
          onNavigate={handleNavigate}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
      </ResponsiveShow>
    </div>
  );
}

// Hook for getting current responsive navigation state
export function useResponsiveNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    isCollapsed,
    setIsCollapsed,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentBreakpoint,
    toggleCollapse: () => setIsCollapsed(!isCollapsed),
    toggleMobileMenu: () => setIsMobileMenuOpen(!isMobileMenuOpen),
    closeMobileMenu: () => setIsMobileMenuOpen(false)
  };
}