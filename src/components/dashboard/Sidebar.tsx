import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DashboardView } from './Dashboard';
import { 
  FunnelSimple, 
  Target, 
  AddressBook, 
  ChartLine,
  Building2
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
      roles: ['rep', 'manager', 'admin']
    },
    {
      id: 'opportunities' as DashboardView,
      label: 'Opportunities',
      icon: Target,
      description: 'MEDDPICC qualification',
      roles: ['rep', 'manager', 'admin']
    },
    {
      id: 'contacts' as DashboardView,
      label: 'Contacts',
      icon: AddressBook,
      description: 'Customer relationships',
      roles: ['rep', 'manager', 'admin']
    },
    {
      id: 'analytics' as DashboardView,
      label: 'Analytics',
      icon: ChartLine,
      description: 'Performance insights',
      roles: ['manager', 'admin']
    }
  ];

  const availableItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
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
            <p className="text-xs text-muted-foreground">Enterprise CRM</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {availableItems.map((item) => {
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
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">PEAK Methodology</div>
          <div>Prospect → Engage → Acquire → Keep</div>
        </div>
      </div>
    </div>
  );
}