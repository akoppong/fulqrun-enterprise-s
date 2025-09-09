import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidatedInput } from '@/components/ui/validated-input';
import { ValidatedForm } from '@/components/ui/validated-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AutoSaveStatus } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/use-auto-save';
import { User } from '@/lib/types';
import { ValidationSchema } from '@/lib/validation';
import { Building } from '@phosphor-icons/react';
import { toast } from 'sonner';

// Validation schema for login form
const loginValidationSchema: ValidationSchema = {
  email: {
    required: true,
    email: true,
    custom: (value: string) => {
      if (value && value.length > 0 && !value.includes('@')) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  role: {
    required: true,
    custom: (value: string) => {
      if (!['rep', 'manager', 'admin'].includes(value)) {
        return 'Please select a valid role';
      }
      return null;
    }
  }
};

interface LoginFormProps {
  onLogin: (user: User) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [initialData] = useState({ email: '', role: 'rep' as 'rep' | 'manager' | 'admin' });

  // Auto-save form data for convenience (less important for login)
  const autoSave = useAutoSave({
    key: 'login_form_draft',
    data: initialData,
    enabled: true,
    delay: 1000, // Shorter delay for login form
    onLoad: (savedData) => {
      if (savedData && savedData.email) {
        initialData.email = savedData.email;
        initialData.role = savedData.role || 'rep';
      }
    }
  });

  const handleSubmit = async (data: Record<string, any>, { setSubmitting, setError }: any) => {
    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user object
      const user: User = {
        id: `user-${Date.now()}`,
        name: data.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        email: data.email,
        role: data.role
      };
      
      // Clear the draft after successful login
      autoSave.clearDraft();
      
      // Show success message
      toast.success('Login successful!', {
        description: `Welcome back, ${user.name}!`
      });
      
      onLogin(user);
    } catch (error) {
      setError('Login failed. Please try again.');
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.'
      });
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
          <ValidatedForm
            schema={loginValidationSchema}
            initialData={initialData}
            onSubmit={handleSubmit}
            submitText="Sign In"
            showReset={false}
            validateOnChange={false}
            showSuccessMessage={false}
          >
            {({ data, setData, getFieldError, hasFieldError, isSubmitting }) => (
              <>
                <ValidatedInput
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={data.email || ''}
                  onChange={(value) => setData('email', value)}
                  error={getFieldError('email')}
                  validation={{
                    required: true,
                    email: true
                  }}
                  validateOn="blur"
                />

                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={data.role || 'rep'} 
                    onValueChange={(value: 'rep' | 'manager' | 'admin') => setData('role', value)}
                  >
                    <SelectTrigger 
                      id="role" 
                      className={hasFieldError('role') ? 'border-destructive' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rep">Sales Representative</SelectItem>
                      <SelectItem value="manager">Sales Manager</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  {hasFieldError('role') && (
                    <p className="text-sm text-destructive">{getFieldError('role')}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <AutoSaveStatus
                    enabled={true}
                    lastSaved={autoSave.lastSaved}
                    className="text-xs"
                  />
                </div>
              </>
            )}
          </ValidatedForm>
        </CardContent>
      </Card>
    </div>
  );
}