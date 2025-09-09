import { User } from './types';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  actions: PermissionAction[];
}

export interface PermissionAction {
  action: 'read' | 'write' | 'delete' | 'manage' | 'configure' | 'admin';
  description: string;
}

export interface RolePermissions {
  role: 'rep' | 'manager' | 'admin';
  permissions: Permission[];
  inheritFrom?: 'rep' | 'manager';
}

/**
 * Comprehensive role-based permissions system
 */
export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  rep: {
    role: 'rep',
    permissions: [
      {
        id: 'dashboard',
        name: 'Dashboard Access',
        description: 'Access to main dashboard overview',
        module: 'core',
        actions: [
          { action: 'read', description: 'View dashboard' },
          { action: 'write', description: 'Customize dashboard' }
        ]
      },
      {
        id: 'pipeline',
        name: 'Pipeline Management',
        description: 'View and manage own pipeline',
        module: 'core',
        actions: [
          { action: 'read', description: 'View pipeline data' },
          { action: 'write', description: 'Update opportunities' }
        ]
      },
      {
        id: 'opportunities',
        name: 'Opportunities',
        description: 'Manage own opportunities',
        module: 'core',
        actions: [
          { action: 'read', description: 'View opportunities' },
          { action: 'write', description: 'Create and update opportunities' }
        ]
      },
      {
        id: 'contacts',
        name: 'Contact Management',
        description: 'Manage customer contacts',
        module: 'core',
        actions: [
          { action: 'read', description: 'View contacts' },
          { action: 'write', description: 'Create and update contacts' }
        ]
      },
      {
        id: 'companies',
        name: 'Company Database',
        description: 'Access company information',
        module: 'core',
        actions: [
          { action: 'read', description: 'View company data' },
          { action: 'write', description: 'Update company information' }
        ]
      },
      {
        id: 'ai-insights',
        name: 'AI Insights',
        description: 'Access AI-powered insights',
        module: 'ai',
        actions: [
          { action: 'read', description: 'View AI recommendations' }
        ]
      },
      {
        id: 'lead-scoring',
        name: 'Lead Scoring',
        description: 'View lead scores',
        module: 'ai',
        actions: [
          { action: 'read', description: 'View lead scores' }
        ]
      },
      {
        id: 'deal-risk',
        name: 'Deal Risk Assessment',
        description: 'View risk analysis',
        module: 'ai',
        actions: [
          { action: 'read', description: 'View risk assessments' }
        ]
      },
      {
        id: 'personal-kpis',
        name: 'Personal KPIs',
        description: 'Track personal performance',
        module: 'performance',
        actions: [
          { action: 'read', description: 'View personal KPIs' },
          { action: 'write', description: 'Update personal targets' }
        ]
      },
      {
        id: 'learning',
        name: 'Learning Platform',
        description: 'Access training and certification',
        module: 'learning',
        actions: [
          { action: 'read', description: 'View learning content' },
          { action: 'write', description: 'Track progress' }
        ]
      }
    ]
  },
  manager: {
    role: 'manager',
    inheritFrom: 'rep',
    permissions: [
      {
        id: 'team-analytics',
        name: 'Team Analytics',
        description: 'View team performance analytics',
        module: 'analytics',
        actions: [
          { action: 'read', description: 'View team reports' },
          { action: 'manage', description: 'Configure team metrics' }
        ]
      },
      {
        id: 'segments',
        name: 'Customer Segments',
        description: 'Manage customer segmentation',
        module: 'advanced',
        actions: [
          { action: 'read', description: 'View segments' },
          { action: 'write', description: 'Create and modify segments' }
        ]
      },
      {
        id: 'workflows',
        name: 'Workflow Management',
        description: 'Configure automated workflows',
        module: 'automation',
        actions: [
          { action: 'read', description: 'View workflows' },
          { action: 'write', description: 'Create workflows' },
          { action: 'manage', description: 'Manage automation rules' }
        ]
      },
      {
        id: 'team-kpis',
        name: 'Team KPI Management',
        description: 'Set and track team KPIs',
        module: 'performance',
        actions: [
          { action: 'read', description: 'View team KPIs' },
          { action: 'write', description: 'Set team targets' },
          { action: 'manage', description: 'Configure KPI tracking' }
        ]
      },
      {
        id: 'financial-reporting',
        name: 'Financial Reporting',
        description: 'Access financial reports and forecasts',
        module: 'financial',
        actions: [
          { action: 'read', description: 'View financial reports' },
          { action: 'manage', description: 'Configure financial metrics' }
        ]
      },
      {
        id: 'integrations-view',
        name: 'Integration Overview',
        description: 'View integration status',
        module: 'integrations',
        actions: [
          { action: 'read', description: 'View integration status' }
        ]
      }
    ]
  },
  admin: {
    role: 'admin',
    inheritFrom: 'manager',
    permissions: [
      {
        id: 'system-config',
        name: 'System Configuration',
        description: 'Configure system-wide settings',
        module: 'admin',
        actions: [
          { action: 'read', description: 'View system settings' },
          { action: 'write', description: 'Modify configurations' },
          { action: 'admin', description: 'Full system administration' }
        ]
      },
      {
        id: 'user-management',
        name: 'User Management',
        description: 'Manage users and permissions',
        module: 'admin',
        actions: [
          { action: 'read', description: 'View users' },
          { action: 'write', description: 'Create and modify users' },
          { action: 'manage', description: 'Assign roles and permissions' }
        ]
      },
      {
        id: 'org-structure',
        name: 'Organization Structure',
        description: 'Configure teams and hierarchies',
        module: 'admin',
        actions: [
          { action: 'read', description: 'View organization structure' },
          { action: 'write', description: 'Modify organization' },
          { action: 'admin', description: 'Full organizational control' }
        ]
      },
      {
        id: 'security-compliance',
        name: 'Security & Compliance',
        description: 'Manage security settings and compliance',
        module: 'security',
        actions: [
          { action: 'read', description: 'View security logs' },
          { action: 'manage', description: 'Configure security policies' },
          { action: 'admin', description: 'Full security administration' }
        ]
      },
      {
        id: 'integrations-admin',
        name: 'Integration Management',
        description: 'Configure and manage integrations',
        module: 'integrations',
        actions: [
          { action: 'read', description: 'View all integrations' },
          { action: 'write', description: 'Configure integrations' },
          { action: 'manage', description: 'Manage integration credentials' },
          { action: 'admin', description: 'Full integration administration' }
        ]
      },
      {
        id: 'system-monitoring',
        name: 'System Monitoring',
        description: 'Monitor system performance and health',
        module: 'monitoring',
        actions: [
          { action: 'read', description: 'View system metrics' },
          { action: 'manage', description: 'Configure monitoring' },
          { action: 'admin', description: 'Full system monitoring' }
        ]
      },
      {
        id: 'data-management',
        name: 'Data Management',
        description: 'Manage data imports, exports, and backups',
        module: 'data',
        actions: [
          { action: 'read', description: 'View data status' },
          { action: 'write', description: 'Perform data operations' },
          { action: 'admin', description: 'Full data administration' }
        ]
      },
      {
        id: 'audit-logs',
        name: 'Audit & Logging',
        description: 'Access system audit logs',
        module: 'audit',
        actions: [
          { action: 'read', description: 'View audit logs' },
          { action: 'admin', description: 'Configure audit settings' }
        ]
      }
    ]
  }
};

/**
 * Get all permissions for a role, including inherited permissions
 */
export function getRolePermissions(role: string): Permission[] {
  const roleData = ROLE_PERMISSIONS[role];
  if (!roleData) return [];

  let permissions = [...roleData.permissions];

  // Add inherited permissions
  if (roleData.inheritFrom) {
    const inheritedPermissions = getRolePermissions(roleData.inheritFrom);
    
    // Merge permissions, avoiding duplicates
    inheritedPermissions.forEach(inheritedPerm => {
      const existingPerm = permissions.find(p => p.id === inheritedPerm.id);
      if (!existingPerm) {
        permissions.push(inheritedPerm);
      } else {
        // Merge actions if permission already exists
        inheritedPerm.actions.forEach(action => {
          if (!existingPerm.actions.find(a => a.action === action.action)) {
            existingPerm.actions.push(action);
          }
        });
      }
    });
  }

  return permissions;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User, permissionId: string, action?: string): boolean {
  const permissions = getRolePermissions(user.role);
  const permission = permissions.find(p => p.id === permissionId);
  
  if (!permission) return false;
  if (!action) return true;
  
  return permission.actions.some(a => a.action === action);
}

/**
 * Check if a user can access a specific module
 */
export function canAccessModule(user: User, module: string): boolean {
  const permissions = getRolePermissions(user.role);
  return permissions.some(p => p.module === module);
}

/**
 * Get all accessible modules for a user
 */
export function getAccessibleModules(user: User): string[] {
  const permissions = getRolePermissions(user.role);
  const modules = new Set<string>();
  
  permissions.forEach(p => modules.add(p.module));
  
  return Array.from(modules);
}

/**
 * Get permission summary for a role
 */
export function getPermissionSummary(role: string): { 
  total: number; 
  byModule: Record<string, number>;
  byAction: Record<string, number>;
} {
  const permissions = getRolePermissions(role);
  
  const byModule: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  
  permissions.forEach(permission => {
    byModule[permission.module] = (byModule[permission.module] || 0) + 1;
    
    permission.actions.forEach(action => {
      byAction[action.action] = (byAction[action.action] || 0) + 1;
    });
  });
  
  return {
    total: permissions.length,
    byModule,
    byAction
  };
}

/**
 * Validate if a user can perform a specific action on a resource
 */
export function validateAction(
  user: User, 
  resource: string, 
  action: string,
  context?: Record<string, any>
): { allowed: boolean; reason?: string } {
  // Super admin always allowed
  if (user.role === 'admin' && resource.startsWith('admin')) {
    return { allowed: true };
  }

  const hasAccess = hasPermission(user, resource, action);
  
  if (!hasAccess) {
    return { 
      allowed: false, 
      reason: `User role '${user.role}' does not have '${action}' permission for '${resource}'` 
    };
  }

  // Additional context-based validation could go here
  // e.g., check if user owns the resource, is in same team, etc.

  return { allowed: true };
}

/**
 * Get menu items that a user can access based on their permissions
 */
export function getAccessibleMenuItems(user: User) {
  const permissions = getRolePermissions(user.role);
  const permissionIds = new Set(permissions.map(p => p.id));
  
  return {
    core: permissionIds.has('pipeline') || permissionIds.has('opportunities') || 
          permissionIds.has('contacts') || permissionIds.has('companies'),
    analytics: permissionIds.has('team-analytics'),
    segments: permissionIds.has('segments'),
    ai: permissionIds.has('ai-insights') || permissionIds.has('lead-scoring') || 
        permissionIds.has('deal-risk'),
    workflows: permissionIds.has('workflows'),
    integrations: permissionIds.has('integrations-view') || permissionIds.has('integrations-admin'),
    admin: permissionIds.has('system-config') || permissionIds.has('user-management'),
    security: permissionIds.has('security-compliance'),
    monitoring: permissionIds.has('system-monitoring'),
    learning: permissionIds.has('learning')
  };
}