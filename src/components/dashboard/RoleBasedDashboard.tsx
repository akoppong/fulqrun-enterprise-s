import React from 'react';
import { User } from '@/lib/types';
import { SalesRepDashboard } from './role-dashboards/SalesRepDashboard';
import { ManagerDashboard } from './role-dashboards/ManagerDashboard';
import { BusinessUnitHeadDashboard } from './role-dashboards/BusinessUnitHeadDashboard';
import { ExecutiveDashboard } from './role-dashboards/ExecutiveDashboard';
import { AdminDashboard } from './role-dashboards/AdminDashboard';

interface RoleBasedDashboardProps {
  user: User;
}

export function RoleBasedDashboard({ user }: RoleBasedDashboardProps) {
  switch (user.role) {
    case 'rep':
      return <SalesRepDashboard user={user} />;
    case 'manager':
      return <ManagerDashboard user={user} />;
    case 'bu_head':
      return <BusinessUnitHeadDashboard user={user} />;
    case 'executive':
      return <ExecutiveDashboard user={user} />;
    case 'admin':
      return <AdminDashboard user={user} />;
    default:
      return <SalesRepDashboard user={user} />;
  }
}