import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/lib/types';
import { RoleBasedDashboard } from './RoleBasedDashboard';
import { 
  Users, 
  Crown, 
  Target, 
  Briefcase, 
  Shield,
  Eye,
  Globe,
  ChartBar,
  Handshake
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface RoleTestingDashboardProps {
  currentUser: User;
}

export function RoleTestingDashboard({ currentUser }: RoleTestingDashboardProps) {
  const [selectedRole, setSelectedRole] = useState<'rep' | 'manager' | 'bu_head' | 'executive' | 'admin'>('rep');
  const [previewUser, setPreviewUser] = useState<User | null>(null);

  // Define test users for each role with realistic data
  const testUsers: Record<string, User> = {
    rep: {
      id: 'test-rep-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@fulqrun.com',
      role: 'rep',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      teamId: 'team-west',
      managerId: 'manager-west-1',
      territory: 'West Coast Territory',
      quota: 150000,
      targets: { 
        monthly: 12500, 
        quarterly: 37500, 
        annual: 150000 
      }
    },
    manager: {
      id: 'test-manager-1',
      name: 'Sarah Martinez',
      email: 'sarah.martinez@fulqrun.com',
      role: 'manager',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b069?w=150',
      teamId: 'team-west',
      territory: 'Western Region',
      quota: 1350000,
      targets: { 
        monthly: 112500, 
        quarterly: 337500, 
        annual: 1350000 
      }
    },
    bu_head: {
      id: 'test-bu-head-1',
      name: 'Michael Chen',
      email: 'michael.chen@fulqrun.com',
      role: 'bu_head',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      territory: 'Global Operations',
      quota: 18000000,
      targets: { 
        monthly: 1500000, 
        quarterly: 4500000, 
        annual: 18000000 
      }
    },
    executive: {
      id: 'test-executive-1',
      name: 'Dr. Jennifer Liu',
      email: 'jennifer.liu@fulqrun.com',
      role: 'executive',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      territory: 'Worldwide Operations',
      quota: 75000000,
      targets: { 
        monthly: 6250000, 
        quarterly: 18750000, 
        annual: 75000000 
      }
    },
    admin: {
      id: 'test-admin-1',
      name: 'David Rodriguez',
      email: 'david.rodriguez@fulqrun.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      territory: 'System Administration'
    }
  };

  const roleDescriptions = {
    rep: {
      title: 'Sales Representative',
      description: 'Individual contributor focused on personal performance, daily activities, and hot opportunities',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Personal revenue and quota tracking',
        'Daily activity schedule',
        'Hot opportunities pipeline',
        'Individual performance metrics',
        'Activity summaries (calls, emails, meetings)'
      ]
    },
    manager: {
      title: 'Sales Manager',
      description: 'Team leader managing multiple reps with both personal and team responsibilities',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Team performance overview',
        'Individual rep performance tracking',
        'Top performers and underperformers',
        'Personal sales metrics',
        'Team coaching insights'
      ]
    },
    bu_head: {
      title: 'Business Unit Head',
      description: 'Strategic leader overseeing regional operations and team managers',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Global revenue and pipeline',
        'Regional performance analysis',
        'Customer segment insights',
        'Team manager performance',
        'Strategic risk management'
      ]
    },
    executive: {
      title: 'C-Level Executive',
      description: 'Senior leadership with board-level oversight and strategic decision making',
      icon: Crown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Executive command center',
        'Board-ready financial metrics',
        'Market position analysis',
        'Strategic initiative tracking',
        'Critical business risks'
      ]
    },
    admin: {
      title: 'System Administrator',
      description: 'Technical administrator with system configuration and user management access',
      icon: Shield,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      features: [
        'User management',
        'System configuration',
        'Security settings',
        'Data management',
        'Audit trails'
      ]
    }
  };

  const handleRoleChange = (role: 'rep' | 'manager' | 'bu_head' | 'executive' | 'admin') => {
    setSelectedRole(role);
    setPreviewUser(null);
    toast.success(`Role selected: ${roleDescriptions[role].title}`, {
      description: 'Click "Preview Dashboard" to experience the role-specific view'
    });
  };

  const handlePreviewDashboard = () => {
    const user = testUsers[selectedRole];
    setPreviewUser(user);
    toast.success(`Previewing ${roleDescriptions[selectedRole].title} Dashboard`, {
      description: `Experience the dashboard as ${user.name}`
    });
  };

  const handleBackToRoleSelection = () => {
    setPreviewUser(null);
    toast.info('Back to role selection');
  };

  if (previewUser) {
    return (
      <div className="space-y-4">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              <Eye className="w-4 h-4 mr-1" />
              Preview Mode
            </Badge>
            <div>
              <p className="font-medium">Viewing as: {previewUser.name}</p>
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[previewUser.role].title} • {previewUser.territory}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleBackToRoleSelection}>
            ← Back to Role Selection
          </Button>
        </div>

        {/* Role-Specific Dashboard */}
        <RoleBasedDashboard user={previewUser} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Role-Based Dashboard Testing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience how FulQrun CRM adapts to different user roles. Each role shows personalized data, 
          relevant metrics, and appropriate functionality for their responsibilities.
        </p>
      </div>

      {/* Current User Info */}
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Your Current Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {React.createElement(roleDescriptions[currentUser.role].icon, {
                className: `w-6 h-6 ${roleDescriptions[currentUser.role].color}`
              })}
            </div>
            <div>
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[currentUser.role].title}
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ChartBar className="w-5 h-5 mr-2" />
            Test Different User Roles
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a role below to preview how the dashboard appears for different user types
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selector */}
          <div className="flex items-center space-x-4">
            <label className="font-medium">Select Role:</label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-64">
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
            <Button onClick={handlePreviewDashboard}>
              Preview Dashboard
            </Button>
          </div>

          {/* Selected Role Details */}
          <div className={`p-6 rounded-lg border-2 ${roleDescriptions[selectedRole].bgColor} border-current/20`}>
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${roleDescriptions[selectedRole].bgColor} border-2 border-current/20`}>
                {React.createElement(roleDescriptions[selectedRole].icon, {
                  className: `w-6 h-6 ${roleDescriptions[selectedRole].color}`
                })}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{roleDescriptions[selectedRole].title}</h3>
                <p className="text-muted-foreground mb-4">
                  {roleDescriptions[selectedRole].description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Key Dashboard Features:</h4>
                  <ul className="space-y-1">
                    {roleDescriptions[selectedRole].features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${roleDescriptions[selectedRole].color.replace('text-', 'bg-')}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 p-4 bg-background/50 rounded-lg border">
                  <h4 className="font-medium mb-2">Test User Profile:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{testUsers[selectedRole].name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Territory:</span>
                      <p className="font-medium">{testUsers[selectedRole].territory}</p>
                    </div>
                    {testUsers[selectedRole].quota && (
                      <>
                        <div>
                          <span className="text-muted-foreground">Annual Quota:</span>
                          <p className="font-medium">${testUsers[selectedRole].quota?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Monthly Target:</span>
                          <p className="font-medium">${testUsers[selectedRole].targets?.monthly.toLocaleString()}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {Object.entries(roleDescriptions).map(([role, desc]) => (
          <Card 
            key={role}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === role ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleRoleChange(role as any)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${desc.bgColor}`}>
                  {React.createElement(desc.icon, {
                    className: `w-4 h-4 ${desc.color}`
                  })}
                </div>
                <h3 className="font-medium">{desc.title}</h3>
                {currentUser.role === role && (
                  <Badge variant="secondary" className="text-xs">
                    Your Role
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {desc.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <Handshake className="w-8 h-8 mx-auto mb-3 text-blue-600" />
          <h3 className="font-medium mb-2 text-blue-900">How to Test</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>1. Select any role from the dropdown or click on a role card</p>
            <p>2. Review the role description and key features</p>
            <p>3. Click "Preview Dashboard" to experience the role-specific interface</p>
            <p>4. Navigate through different tabs and features to see role-based content</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}