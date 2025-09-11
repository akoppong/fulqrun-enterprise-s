import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/lib/types';
import { Building } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface SimpleLoginFormProps {
  onLogin: (user: User) => void;
}

export function SimpleLoginForm({ onLogin }: SimpleLoginFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'rep' | 'manager' | 'bu_head' | 'executive' | 'admin'>('rep');
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = async () => {
    if (!email || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user object with role-specific details
      const user: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        email: email,
        role: role,
        teamId: role === 'rep' ? 'team-1' : undefined,
        managerId: role === 'rep' ? 'manager-1' : undefined,
        territory: role === 'rep' ? 'Demo Territory' : 
                  role === 'manager' ? 'Regional Territory' :
                  role === 'bu_head' ? 'Global Territory' :
                  role === 'executive' ? 'Worldwide' : undefined,
        quota: role === 'rep' ? 150000 :
               role === 'manager' ? 1350000 :
               role === 'bu_head' ? 18000000 :
               role === 'executive' ? 75000000 : undefined,
        targets: role === 'rep' ? { monthly: 12500, quarterly: 37500, annual: 150000 } :
                role === 'manager' ? { monthly: 112500, quarterly: 337500, annual: 1350000 } :
                role === 'bu_head' ? { monthly: 1500000, quarterly: 4500000, annual: 18000000 } :
                role === 'executive' ? { monthly: 6250000, quarterly: 18750000, annual: 75000000 } : undefined
      };
      
      // Show success message
      toast.success('Login successful!', {
        description: `Welcome back, ${user.name}!`
      });
      
      onLogin(user);
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin();
  };

  const handleQuickLogin = async (quickEmail: string, quickRole: typeof role) => {
    setEmail(quickEmail);
    setRole(quickRole);
    // Perform login with updated values
    if (!quickEmail || !quickRole) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!quickEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user object with role-specific details
      const user: User = {
        id: `user-${Date.now()}`,
        name: quickEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        email: quickEmail,
        role: quickRole,
        teamId: quickRole === 'rep' ? 'team-1' : undefined,
        managerId: quickRole === 'rep' ? 'manager-1' : undefined,
        territory: quickRole === 'rep' ? 'Demo Territory' : 
                  quickRole === 'manager' ? 'Regional Territory' :
                  quickRole === 'bu_head' ? 'Global Territory' :
                  quickRole === 'executive' ? 'Worldwide' : undefined,
        quota: quickRole === 'rep' ? 150000 :
               quickRole === 'manager' ? 1350000 :
               quickRole === 'bu_head' ? 18000000 :
               quickRole === 'executive' ? 75000000 : undefined,
        targets: quickRole === 'rep' ? { monthly: 12500, quarterly: 37500, annual: 150000 } :
                quickRole === 'manager' ? { monthly: 112500, quarterly: 337500, annual: 1350000 } :
                quickRole === 'bu_head' ? { monthly: 1500000, quarterly: 4500000, annual: 18000000 } :
                quickRole === 'executive' ? { monthly: 6250000, quarterly: 18750000, annual: 75000000 } : undefined
      };
      
      // Show success message
      toast.success('Login successful!', {
        description: `Welcome back, ${user.name}!`
      });
      
      onLogin(user);
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Building size={24} className="text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to FulQrun</CardTitle>
            <CardDescription>Professional Enterprise Sales Platform</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select value={role} onValueChange={(value: 'rep' | 'manager' | 'bu_head' | 'executive' | 'admin') => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rep">Sales Representative</SelectItem>
                  <SelectItem value="manager">Sales Manager</SelectItem>
                  <SelectItem value="bu_head">Business Unit Head</SelectItem>
                  <SelectItem value="executive">C-Level Executive</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email || !role}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Quick Demo Access */}
            <div className="pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground mb-3">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                                    onClick={() => handleQuickLogin('demo@fulqrun.com', 'rep')}
                  disabled={isLoading}
                >
                  Sales Rep Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                                    onClick={() => handleQuickLogin('manager@fulqrun.com', 'manager')}
                  disabled={isLoading}
                >
                  Manager Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                                    onClick={() => handleQuickLogin('bu.head@fulqrun.com', 'bu_head')}
                  disabled={isLoading}
                >
                  BU Head Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                                    onClick={() => handleQuickLogin('ceo@fulqrun.com', 'executive')}
                  disabled={isLoading}
                >
                  Executive Demo
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}