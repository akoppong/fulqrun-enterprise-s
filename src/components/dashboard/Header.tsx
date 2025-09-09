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
    <header className="border-b bg-card px-3 sm:px-4 lg:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">FulQrun CRM</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Professional Enterprise Sales Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <Bell size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant={roleBadge.variant} className="text-xs">
                  {roleBadge.label}
                </Badge>
              </div>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <SignOut size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}