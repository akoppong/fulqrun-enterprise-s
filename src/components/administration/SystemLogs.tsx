import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useKV } from '@github/spark/hooks';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  AlertTriangle,
  CheckCircle,
  Info,
  X
} from '@phosphor-icons/react';

interface SystemLogsProps {
  hasAdminAccess: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  user?: string;
  ip?: string;
}

export function SystemLogs({ hasAdminAccess }: SystemLogsProps) {
  const [logs] = useKV<LogEntry[]>('system-logs', [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00',
      level: 'info',
      category: 'Authentication',
      message: 'User john@company.com logged in successfully',
      user: 'john@company.com',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:28:00',
      level: 'warning',
      category: 'Security',
      message: 'Failed login attempt detected',
      ip: '203.0.113.45'
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:25:00',
      level: 'success',
      category: 'System',
      message: 'Daily backup completed successfully',
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:20:00',
      level: 'error',
      category: 'Integration',
      message: 'Salesforce API connection timeout',
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:15:00',
      level: 'info',
      category: 'User Management',
      message: 'New user account created for sarah@company.com',
      user: 'admin@company.com'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredLogs = logs.filter((log: LogEntry) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      default:
        return 'outline';
    }
  };

  const handleExportLogs = () => {
    // In a real app, this would trigger a download
    console.log('Exporting logs...');
  };

  if (!hasAdminAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Restricted</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need administrator privileges to view system logs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">System Logs</h3>
          <p className="text-muted-foreground">
            Monitor system events, errors, and user activities
          </p>
        </div>
        <Button onClick={handleExportLogs}>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Log Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log: LogEntry) => log.level === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs.filter((log: LogEntry) => log.level === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">System health</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Event Logs</CardTitle>
          <CardDescription>
            Real-time system events, authentication logs, and error tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Integration">Integration</SelectItem>
                <SelectItem value="User Management">User Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logs Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log: LogEntry) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <Badge variant={getLevelBadgeVariant(log.level)}>
                          {log.level}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate">{log.message}</p>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <span className="text-sm text-muted-foreground">{log.user}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.ip ? (
                        <span className="text-sm font-mono">{log.ip}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No log entries found matching your criteria.</p>
            </div>
          )}

          {/* Log retention info */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <Info className="inline h-4 w-4 mr-1" />
              Log entries are automatically archived after 90 days. Contact support to retrieve older logs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}