import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { 
  Users, 
  Crown, 
  Target, 
  Shield,
  Eye,
  Globe,
  ChartBar,
  ArrowRight,
  TrendingUp,
  Briefcase
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface RoleShowcaseProps {
  currentUser: User;
  onRoleSwitch: (user: User) => void;
}

export function RoleShowcase({ currentUser, onRoleSwitch }: RoleShowcaseProps) {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Safety check for currentUser
  if (!currentUser || !currentUser.role) {
    console.error('RoleShowcase: Invalid currentUser provided:', currentUser);
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Invalid User State</h2>
          <p className="text-muted-foreground">Cannot display role showcase without valid user information.</p>
        </div>
      </div>
    );
  }

  // Define test users for each role with realistic data
  const demoUsers: User[] = [
    {
      id: 'demo-rep-1',
      name: 'Alex Johnson',
      email: 'alex.johnson@fulqrun.com',
      role: 'rep',
      teamId: 'team-west',
      managerId: 'manager-west-1',
      territory: 'West Coast Territory',
      quota: 150000,
      targets: { monthly: 12500, quarterly: 37500, annual: 150000 }
    },
    {
      id: 'demo-manager-1',
      name: 'Sarah Martinez',
      email: 'sarah.martinez@fulqrun.com',
      role: 'manager',
      teamId: 'team-west',
      territory: 'Western Region',
      quota: 1350000,
      targets: { monthly: 112500, quarterly: 337500, annual: 1350000 }
    },
    {
      id: 'demo-bu-head-1',
      name: 'Michael Chen',
      email: 'michael.chen@fulqrun.com',
      role: 'bu_head',
      territory: 'Global Operations',
      quota: 18000000,
      targets: { monthly: 1500000, quarterly: 4500000, annual: 18000000 }
    },
    {
      id: 'demo-executive-1',
      name: 'Dr. Jennifer Liu',
      email: 'jennifer.liu@fulqrun.com',
      role: 'executive',
      territory: 'Worldwide Operations',
      quota: 75000000,
      targets: { monthly: 6250000, quarterly: 18750000, annual: 75000000 }
    }
  ];

  const roleInfo = {
    rep: {
      title: 'Sales Representative',
      description: 'Individual performance tracking with personal metrics, activity management, and opportunity pipeline',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200',
      highlights: ['Personal quotas & targets', 'Daily activity tracking', 'Hot opportunities', 'Performance metrics']
    },
    manager: {
      title: 'Sales Manager',
      description: 'Team oversight with individual rep performance, coaching insights, and personal sales responsibilities',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      highlights: ['Team performance overview', 'Rep coaching insights', 'Personal sales metrics', 'Underperformer alerts']
    },
    bu_head: {
      title: 'Business Unit Head',
      description: 'Strategic overview of global operations, regional performance, and customer segment analysis',
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200',
      highlights: ['Global revenue tracking', 'Regional performance', 'Customer segments', 'Strategic risks']
    },
    executive: {
      title: 'C-Level Executive',
      description: 'Executive command center with board-level metrics, market position, and strategic initiatives',
      icon: Crown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      highlights: ['Executive summary', 'Board metrics', 'Market position', 'Strategic initiatives']
    }
  };

  const handleDemoUser = (user: User) => {
    setSelectedDemo(user.id);
    const roleData = roleInfo[user.role];
    if (roleData) {
      toast.success(`Switching to ${roleData.title}`, {
        description: `Experience the dashboard as ${user.name}`
      });
    }
    onRoleSwitch(user);
  };

  const handleBackToCurrent = () => {
    setSelectedDemo(null);
    const roleData = roleInfo[currentUser.role];
    if (roleData) {
      toast.info(`Back to your ${roleData.title} dashboard`);
    }
    onRoleSwitch(currentUser);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Eye className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Role-Based Dashboard Experience</h1>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Experience how FulQrun CRM adapts to different user roles. Each dashboard is tailored with role-specific 
          metrics, features, and insights that matter most to that user's responsibilities and decision-making needs.
        </p>
      </div>

      {/* Current User Display */}
      {selectedDemo ? (
        <Card className="max-w-2xl mx-auto border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                Demo Mode Active
              </div>
              <Button variant="outline" onClick={handleBackToCurrent} size="sm">
                ← Return to Your Dashboard
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                (() => {
                  const demoUser = demoUsers.find(u => u.id === selectedDemo);
                  const role = demoUser?.role || 'rep';
                  return roleInfo[role]?.bgColor || 'bg-gray-50';
                })()
              }`}>
                {(() => {
                  const demoUser = demoUsers.find(u => u.id === selectedDemo);
                  const role = demoUser?.role || 'rep';
                  const roleData = roleInfo[role];
                  return roleData ? React.createElement(roleData.icon, {
                    className: `w-6 h-6 ${roleData.color}`
                  }) : null;
                })()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{demoUsers.find(u => u.id === selectedDemo)?.name || 'Demo User'}</p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const demoUser = demoUsers.find(u => u.id === selectedDemo);
                    const role = demoUser?.role || 'rep';
                    const roleData = roleInfo[role];
                    return roleData ? `${roleData.title} • ${demoUser?.territory || 'Unknown Territory'}` : 'Demo User';
                  })()}
                </p>
              </div>
              <Badge variant="secondary">Demo User</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Your Current Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${roleInfo[currentUser.role]?.bgColor || 'bg-gray-50'}`}>
                {roleInfo[currentUser.role] && React.createElement(roleInfo[currentUser.role].icon, {
                  className: `w-6 h-6 ${roleInfo[currentUser.role].color}`
                })}
              </div>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {roleInfo[currentUser.role]?.title || 'User'}
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {demoUsers.map((user) => {
          const info = roleInfo[user.role];
          
          // Skip rendering if role info is missing
          if (!info) {
            console.warn(`Role info missing for user role: ${user.role}`);
            return null;
          }
          
          const isCurrentDemo = selectedDemo === user.id;
          const isCurrentUser = currentUser.role === user.role && !selectedDemo;
          
          return (
            <Card 
              key={user.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isCurrentDemo ? 'ring-2 ring-primary shadow-lg' : 
                isCurrentUser ? 'ring-2 ring-secondary' : ''
              }`}
              onClick={() => handleDemoUser(user)}
            >
              <CardHeader className={`border-b-2 ${info.bgColor || 'bg-gray-50'}`}>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-background shadow-sm`}>
                      {info.icon && React.createElement(info.icon, {
                        className: `w-5 h-5 ${info.color || 'text-muted-foreground'}`
                      })}
                    </div>
                    <div>
                      <h3 className="font-medium">{info.title || 'Role'}</h3>
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">Your Role</Badge>
                    )}
                    {isCurrentDemo && (
                      <Badge variant="default" className="text-xs">Active Demo</Badge>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {info.description}
                </p>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Key Features
                  </p>
                  <div className="space-y-1">
                    {info.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <TrendingUp className={`w-3 h-3 ${info.color}`} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {user.quota && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Annual Quota:</span>
                      <span className="font-medium">${user.quota.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Territory:</span>
                      <span className="font-medium">{user.territory}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <ChartBar className="w-8 h-8 mx-auto mb-3 text-blue-600" />
          <h3 className="font-medium mb-2 text-blue-900">How to Experience Different Roles</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>Click any role card above to instantly switch to that user's dashboard experience</p>
            <p>Navigate through different tabs and features to see role-specific content and metrics</p>
            <p>Use the "Return to Your Dashboard" button to switch back to your actual role</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}