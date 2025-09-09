import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoSaveStatus } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { User } from '@/lib/types';
import { Building } from '@phosphor-icons/react';

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'rep' | 'manager' | 'admin'>('rep');
  const [loading, setLoading] = useState(false);

  // Auto-save form data for convenience (less important for login)
  const autoSave = useAutoSave({
    key: 'login_form_draft',
    data: { email, role },
    enabled: true,
    delay: 1000, // Shorter delay for login form
    onLoad: (savedData) => {
      if (savedData && savedData.email) {
        setEmail(savedData.email);
        setRole(savedData.role || 'rep');
      }
    }
  });

  // Load saved data on component mount
  useEffect(() => {
    if (autoSave.savedDraft) {
      setEmail(autoSave.savedDraft.email || '');
      setRole(autoSave.savedDraft.role || 'rep');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      const user: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email,
        role
      };
      
      // Clear the draft after successful login
      autoSave.clearDraft();
      
      onLogin(user);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
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
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: 'rep' | 'manager' | 'admin') => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rep">Sales Representative</SelectItem>
                  <SelectItem value="manager">Sales Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <AutoSaveStatus
                enabled={true}
                lastSaved={autoSave.lastSaved}
                className="text-xs"
              />
              <Button type="submit" className="w-auto" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}