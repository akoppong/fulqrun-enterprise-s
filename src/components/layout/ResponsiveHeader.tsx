import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SignOut, Bell, Settings, User as UserIcon } from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ResponsiveStatusIndicator } from '@/components/ui/responsive-status-indicator';
import { cn } from '@/lib/utils';

interface ResponsiveHeaderProps {
  user: User;
  onLogout: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
  showNotifications?: boolean;
}

export function ResponsiveHeader({ 
  user, 
  onLogout, 
  title = "FulQrun CRM",
  subtitle = "Professional Enterprise Sales Platform",
  className,
  showNotifications = true
}: ResponsiveHeaderProps) {
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      rep: { label: 'Sales Rep', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      manager: { label: 'Manager', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      admin: { label: 'Admin', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.rep;
  };

  const roleBadge = getRoleBadge(user.role);

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-header",
      className
    )}>
      <div className="flex h-16 items-center px-4 lg:px-6">
        {/* Title Section - Responsive */}
        <div className="flex-1 min-w-0 ml-12 lg:ml-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block lg:text-sm">
              {subtitle}
            </p>
          </div>
          
          {/* Mobile subtitle */}
          <p className="text-xs text-muted-foreground truncate sm:hidden">
            {subtitle}
          </p>
        </div>

        {/* Action Items */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-4">
          {/* Responsive Status Indicator */}
          <ResponsiveStatusIndicator />

          {/* Notifications - Desktop only initially, mobile in dropdown */}
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {/* Notification badge example */}
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </div>
            </Button>
          )}

          {/* User Menu - Responsive */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 p-2 h-auto hover:bg-muted/50"
                aria-label="User menu"
              >
                {/* Desktop: Full user info */}
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-foreground truncate max-w-32">
                    {user.name}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <Badge className={cn("text-xs h-4 px-1.5", roleBadge.color)}>
                      {roleBadge.label}
                    </Badge>
                  </div>
                </div>
                
                {/* Tablet: Name + badge side by side */}
                <div className="hidden md:flex lg:hidden items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium truncate max-w-24">
                      {user.name.split(' ')[0]}
                    </p>
                  </div>
                  <Badge className={cn("text-xs h-4 px-1.5", roleBadge.color)}>
                    {user.role.charAt(0).toUpperCase()}
                  </Badge>
                </div>
                
                {/* Mobile: Just badge */}
                <div className="block md:hidden">
                  <Badge className={cn("text-xs h-5 px-2", roleBadge.color)}>
                    {user.role}
                  </Badge>
                </div>
                
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email || `${user.role}@fulqrun.com`}
                  </p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="flex items-center gap-2 p-3">
                <UserIcon size={16} />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="flex items-center gap-2 p-3">
                <Settings size={16} />
                <span>Preferences</span>
              </DropdownMenuItem>
              
              {/* Mobile notifications */}
              {showNotifications && (
                <DropdownMenuItem className="flex items-center gap-2 p-3 sm:hidden">
                  <Bell size={16} />
                  <span>Notifications</span>
                  <Badge className="ml-auto bg-red-100 text-red-800 text-xs">3</Badge>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="flex items-center gap-2 p-3 text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={onLogout}
              >
                <SignOut size={16} />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}