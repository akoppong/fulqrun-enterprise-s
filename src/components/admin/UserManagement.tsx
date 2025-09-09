import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useKV } from '@github/spark/hooks';
import { User } from '@/lib/types';
import { getRolePermissions, getPermissionSummary } from '@/lib/rolePermissions';
import {
  UserPlus,
  Shield,
  Settings,
  Eye,
  EyeSlash,
  Lock,
  UserCheck,
  Crown,
  Users,
  Search,
  Filter,
  Edit,
  Trash,
  MoreVertical
} from '@phosphor-icons/react';

interface UserManagementProps {
  currentUser: User;
}

interface UserFormData {
  name: string;
  email: string;
  role: 'rep' | 'manager' | 'admin';
  active: boolean;
}

export function UserManagement({ currentUser }: UserManagementProps) {
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'rep',
    active: true
  });

  // Filter users based on search and role
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Role statistics
  const roleStats = {
    rep: allUsers.filter(u => u.role === 'rep').length,
    manager: allUsers.filter(u => u.role === 'manager').length,
    admin: allUsers.filter(u => u.role === 'admin').length,
    total: allUsers.length,
    active: allUsers.filter(u => u.id !== 'inactive').length // Simplified active check
  };

  const handleCreateUser = () => {
    if (!formData.name || !formData.email) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
    };

    setAllUsers(current => [...current, newUser]);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', email: '', role: 'rep', active: true });
  };

  const handleDeleteUser = (userId: string) => {
    setAllUsers(current => current.filter(u => u.id !== userId));
  };

  const handleRoleChange = (userId: string, newRole: 'rep' | 'manager' | 'admin') => {
    setAllUsers(current => 
      current.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'rep': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown size={14} />;
      case 'manager': return <Shield size={14} />;
      case 'rep': return <UserCheck size={14} />;
      default: return <Users size={14} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus size={16} className="mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system and assign their role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter user's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'rep' | 'manager' | 'admin') => 
                  setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rep">Sales Representative</SelectItem>
                    <SelectItem value="manager">Sales Manager</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.total}</div>
                <p className="text-xs text-muted-foreground">{roleStats.active} active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales Reps</CardTitle>
                <UserCheck size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.rep}</div>
                <p className="text-xs text-muted-foreground">Representatives</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Managers</CardTitle>
                <Shield size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.manager}</div>
                <p className="text-xs text-muted-foreground">Team leads</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Crown size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.admin}</div>
                <p className="text-xs text-muted-foreground">Administrators</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <Filter size={16} className="mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="rep">Sales Reps</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} gap-1`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.id === currentUser.id ? 'Current session' : '2 hours ago'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedUser(user)}>
                            <MoreVertical size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage User: {user.name}</DialogTitle>
                            <DialogDescription>
                              Update user role and permissions
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Role</Label>
                              <Select 
                                value={user.role} 
                                onValueChange={(newRole: 'rep' | 'manager' | 'admin') => 
                                  handleRoleChange(user.id, newRole)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="rep">Sales Representative</SelectItem>
                                  <SelectItem value="manager">Sales Manager</SelectItem>
                                  <SelectItem value="admin">Administrator</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-between">
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === currentUser.id}
                              >
                                <Trash size={16} className="mr-2" />
                                Delete User
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['rep', 'manager', 'admin'] as const).map((role) => {
              const permissions = getRolePermissions(role);
              const summary = getPermissionSummary(role);

              return (
                <Card key={role} className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        <CardTitle className="capitalize">{role}</CardTitle>
                      </div>
                      <Badge className={getRoleBadgeColor(role)}>
                        {summary.total} permissions
                      </Badge>
                    </div>
                    <CardDescription>
                      {role === 'rep' && 'Basic sales functionality and personal data access'}
                      {role === 'manager' && 'Team management and analytics access'}
                      {role === 'admin' && 'Full system administration and configuration'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Modules Access:</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(summary.byModule).map(([module, count]) => (
                          <Badge key={module} variant="secondary" className="text-xs">
                            {module} ({count})
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Key Permissions:</div>
                      <div className="space-y-1">
                        {permissions.slice(0, 5).map((permission) => (
                          <div key={permission.id} className="text-sm text-muted-foreground">
                            • {permission.name}
                          </div>
                        ))}
                        {permissions.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {permissions.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent user management and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <UserPlus size={16} className="text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium">New user created</div>
                    <div className="text-sm text-muted-foreground">
                      John Doe was added as Sales Representative
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Shield size={16} className="text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">Role updated</div>
                    <div className="text-sm text-muted-foreground">
                      Jane Smith promoted to Manager
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">1 day ago</div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Lock size={16} className="text-orange-600" />
                  <div className="flex-1">
                    <div className="font-medium">Security update</div>
                    <div className="text-sm text-muted-foreground">
                      Password policy updated for all users
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}