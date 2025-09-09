import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Globe,
  Database,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Refresh
} from '@phosphor-icons/react';

interface SystemMetrics {
  cpu: { usage: number; cores: number; temperature: number };
  memory: { used: number; total: number; usage: number };
  storage: { used: number; total: number; usage: number };
  network: { inbound: number; outbound: number };
  database: { connections: number; queries_per_second: number; response_time: number };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'warning';
  uptime: string;
  last_check: string;
  response_time?: number;
}

export function SystemMonitoring() {
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data - in real app, this would come from monitoring APIs
  const metrics: SystemMetrics = {
    cpu: { usage: 65, cores: 8, temperature: 72 },
    memory: { used: 12.8, total: 32, usage: 40 },
    storage: { used: 1.2, total: 1.5, usage: 78 },
    network: { inbound: 45.2, outbound: 23.8 },
    database: { connections: 28, queries_per_second: 145, response_time: 12 }
  };

  const services: ServiceStatus[] = [
    {
      name: 'Web Application',
      status: 'online',
      uptime: '15d 6h 23m',
      last_check: '30 seconds ago',
      response_time: 185
    },
    {
      name: 'Database',
      status: 'online',
      uptime: '15d 6h 23m',
      last_check: '45 seconds ago',
      response_time: 12
    },
    {
      name: 'Email Service',
      status: 'online',
      uptime: '15d 6h 23m',
      last_check: '1 minute ago',
      response_time: 320
    },
    {
      name: 'Background Jobs',
      status: 'warning',
      uptime: '12h 15m',
      last_check: '2 minutes ago'
    },
    {
      name: 'File Storage',
      status: 'online',
      uptime: '15d 6h 23m',
      last_check: '30 seconds ago',
      response_time: 89
    },
    {
      name: 'Cache Server',
      status: 'online',
      uptime: '15d 6h 23m',
      last_check: '1 minute ago',
      response_time: 5
    }
  ];

  const recentEvents = [
    {
      id: 1,
      timestamp: '2 minutes ago',
      level: 'warning',
      service: 'Background Jobs',
      message: 'Queue processing slowed down - 150 jobs pending',
      details: 'Email notification queue experiencing delays'
    },
    {
      id: 2,
      timestamp: '15 minutes ago',
      level: 'info',
      service: 'Database',
      message: 'Automatic backup completed successfully',
      details: 'Daily backup created: backup_2024_01_15.sql (2.3GB)'
    },
    {
      id: 3,
      timestamp: '1 hour ago',
      level: 'success',
      service: 'Web Application',
      message: 'Performance optimization deployed',
      details: 'Response time improved by 15% after caching updates'
    },
    {
      id: 4,
      timestamp: '3 hours ago',
      level: 'warning',
      service: 'Storage',
      message: 'Storage usage above 75%',
      details: 'Consider archiving old data or expanding storage capacity'
    }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle size={16} className="text-green-600" />;
      case 'offline': return <XCircle size={16} className="text-red-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-orange-600" />;
      default: return <Eye size={16} className="text-gray-600" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <Refresh size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Activity size={16} className="mr-2" />
            View Logs
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu.usage}%</div>
            <Progress value={metrics.cpu.usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.cpu.cores} cores • {metrics.cpu.temperature}°C
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory</CardTitle>
            <MemoryStick size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory.usage}%</div>
            <Progress value={metrics.memory.usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.memory.used}GB / {metrics.memory.total}GB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.storage.usage}%</div>
            <Progress value={metrics.storage.usage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.storage.used}TB / {metrics.storage.total}TB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database.response_time}ms</div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.database.connections} connections • {metrics.database.queries_per_second} qps
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Current status of all system services and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Last Check</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(service.status)}
                          <span className={`capitalize ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{service.uptime}</TableCell>
                      <TableCell>
                        {service.response_time ? (
                          <Badge variant="secondary">
                            {service.response_time}ms
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {service.last_check}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={16} />
                  Network Traffic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Inbound</span>
                      <span>{metrics.network.inbound} MB/s</span>
                    </div>
                    <Progress value={metrics.network.inbound} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Outbound</span>
                      <span>{metrics.network.outbound} MB/s</span>
                    </div>
                    <Progress value={metrics.network.outbound} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={16} />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Internet Connection</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">DNS Resolution</span>
                    <Badge className="bg-green-100 text-green-800">Working</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">External APIs</span>
                    <Badge className="bg-orange-100 text-orange-800">Degraded</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CDN Status</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                System events and notifications from the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex gap-4 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getLevelColor(event.level).replace('text-', 'bg-').replace(' bg-', ' ')}`} />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge className={`${getLevelColor(event.level)} border-0`}>
                          {event.service}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{event.timestamp}</span>
                      </div>
                      <div className="font-medium">{event.message}</div>
                      <div className="text-sm text-muted-foreground">{event.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle size={16} />
              <AlertDescription>
                Storage usage is above 75%. Consider archiving old data or expanding capacity.
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertTriangle size={16} />
              <AlertDescription>
                Background job queue has 150 pending items. Processing may be delayed.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}