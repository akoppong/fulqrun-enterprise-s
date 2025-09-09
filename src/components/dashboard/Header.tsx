import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SignOut, Bell } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      rep: { label: 'Sales Rep', variant: 'secondary' as const },
      manager: { label: 'Manager', variant: 'default' as const },
      admin: { label: 'Admin', variant: 'destructive' as const }
    };
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.rep;
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-3 sm:px-4 lg:px-6 py-4 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        {/* Title - hidden on mobile when sidebar is present */}
        <div className="ml-16 lg:ml-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
            FulQrun CRM
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Professional Enterprise Sales Platform
          </p>
        </div>
        
        {/* User controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <Bell size={18} />
            <span className="sr-only">Notifications</span>
          </Button>
          
          {/* User info - responsive */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium truncate max-w-32 lg:max-w-none">
                {user.name}
              </p>
              <Badge variant={roleBadge.variant} className="text-xs">
                {roleBadge.label}
              </Badge>
            </div>
            
            {/* Mobile user info - just badge */}
            <div className="block md:hidden">
              <Badge variant={roleBadge.variant} className="text-xs">
                {roleBadge.label}
              </Badge>
            </div>
            
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
            >
              <SignOut size={16} className="sm:hidden" />
              <SignOut size={18} className="hidden sm:block" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}