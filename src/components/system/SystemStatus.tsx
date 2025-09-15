/**
 * System Status Component
 * 
 * Provides real-time system health monitoring and diagnostics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Users, Activity } from '@phosphor-icons/react';
import { appValidator, type SystemHealth, type ValidationResult } from '@/lib/app-validation';
import { dataIntegration } from '@/lib/data-integration';

interface SystemStatusProps {
  onClose?: () => void;
}

export function SystemStatus({ onClose }: SystemStatusProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [dataConsistency, setDataConsistency] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      const health = await appValidator.validateSystem();
      const consistency = await appValidator.validateDataConsistency();
      
      setSystemHealth(health);
      setDataConsistency(consistency);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runDataSync = async () => {
    try {
      const result = await dataIntegration.syncAllData();
      if (result.success) {
        // Refresh health check after sync
        await runHealthCheck();
      }
    } catch (error) {
      console.error('Data sync failed:', error);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runHealthCheck, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthPercentage = () => {
    if (!systemHealth) return 0;
    return Math.round((systemHealth.summary.passed / systemHealth.summary.total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Status</h2>
          {lastChecked && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runDataSync}
            disabled={isLoading}
          >
            <Database className="h-4 w-4 mr-2" />
            Sync Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Overall Health */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getOverallStatusColor(systemHealth.overall)}`} />
              System Health: {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
            </CardTitle>
            <CardDescription>
              {systemHealth.summary.passed} of {systemHealth.summary.total} components operational
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Health Score</span>
                  <span>{getHealthPercentage()}%</span>
                </div>
                <Progress value={getHealthPercentage()} className="h-2" />
              </div>
              
              {systemHealth.overall !== 'healthy' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {systemHealth.summary.failed > 0 && `${systemHealth.summary.failed} component(s) failing. `}
                    {systemHealth.summary.warnings > 0 && `${systemHealth.summary.warnings} warning(s) detected.`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Status */}
      <Tabs defaultValue="components" className="w-full">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="data">Data Consistency</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          {systemHealth?.components.map((component, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(component.success)}
                    <div>
                      <h4 className="font-medium">{component.component}</h4>
                      <p className="text-sm text-muted-foreground">{component.message}</p>
                    </div>
                  </div>
                  <Badge variant={component.success ? 'default' : 'destructive'}>
                    {component.success ? 'OK' : 'FAIL'}
                  </Badge>
                </div>
                {component.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                      View Details
                    </summary>
                    <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                      {JSON.stringify(component.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          {dataConsistency.map((check, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.success)}
                    <div>
                      <h4 className="font-medium">{check.component}</h4>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                  <Badge variant={check.success ? 'default' : 'destructive'}>
                    {check.success ? 'CONSISTENT' : 'INCONSISTENT'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemHealth.summary.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Healthy Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{systemHealth.summary.passed}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Failed Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{systemHealth.summary.failed}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Real-time metrics could go here */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span>{process.env.NODE_ENV || 'development'}</span>
                </div>
                <div className="flex justify-between">
                  <span>User Agent:</span>
                  <span className="text-right max-w-xs truncate">
                    {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span>{new Date().toISOString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export a hook for easy system health access
export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const result = await appValidator.validateSystem();
      setHealth(result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    health,
    isLoading,
    checkHealth
  };
}