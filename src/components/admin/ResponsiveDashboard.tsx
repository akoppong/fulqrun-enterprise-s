import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ResponsiveIssue, 
  ResponsiveMetrics, 
  ViewportInfo 
} from '@/lib/responsive-auto-fix';
import { useResponsiveAutoFix } from '@/hooks/useResponsiveAutoFix';
import {
  DeviceMobile,
  DeviceTablet,
  Desktop,
  Television,
  CheckCircle,
  Warning,
  X,
  ArrowRight,
  Eye,
  Wrench,
  ChartBar,
  Target,
  Lightning,
  Bug,
  Palette,
  Hand,
  TextAa,
  Layout,
  Shield
} from '@phosphor-icons/react';

interface ResponsiveDashboardProps {
  onClose?: () => void;
}

export function ResponsiveDashboard({ onClose }: ResponsiveDashboardProps) {
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);
  const [autoFixCritical, setAutoFixCritical] = useState(true);
  const [autoFixHigh, setAutoFixHigh] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ResponsiveIssue | null>(null);

  const {
    viewport,
    metrics,
    issues,
    isAnalyzing,
    lastAnalysis,
    analyzeResponsiveness,
    autoFixAll,
    autoFixByType,
    autoFixBySeverity,
    getIssuesByType,
    getIssuesBySeverity,
    generateReport,
    stats
  } = useResponsiveAutoFix({
    enabled: autoFixEnabled,
    autoFixCritical,
    autoFixHigh,
    watchForChanges: true,
    performanceMode: true
  });

  const getDeviceIcon = (deviceType: ViewportInfo['deviceType']) => {
    const iconProps = { size: 20, weight: 'regular' as const };
    switch (deviceType) {
      case 'mobile': return <DeviceMobile {...iconProps} />;
      case 'tablet': return <DeviceTablet {...iconProps} />;
      case 'desktop': return <Desktop {...iconProps} />;
      case 'tv': return <Television {...iconProps} />;
      default: return <Desktop {...iconProps} />;
    }
  };

  const getSeverityColor = (severity: ResponsiveIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: ResponsiveIssue['type']) => {
    const iconProps = { size: 16, weight: 'regular' as const };
    switch (type) {
      case 'overflow': return <ArrowRight {...iconProps} />;
      case 'touch': return <Hand {...iconProps} />;
      case 'text': return <TextAa {...iconProps} />;
      case 'layout': return <Layout {...iconProps} />;
      case 'accessibility': return <Shield {...iconProps} />;
      case 'performance': return <Lightning {...iconProps} />;
      default: return <Bug {...iconProps} />;
    }
  };

  const getTypeColor = (type: ResponsiveIssue['type']) => {
    switch (type) {
      case 'overflow': return 'text-red-600';
      case 'touch': return 'text-blue-600';
      case 'text': return 'text-green-600';
      case 'layout': return 'text-purple-600';
      case 'accessibility': return 'text-orange-600';
      case 'performance': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const handleAutoFix = async (type?: ResponsiveIssue['type'], severity?: ResponsiveIssue['severity']) => {
    let fixedCount = 0;
    
    if (type) {
      fixedCount = autoFixByType(type);
    } else if (severity) {
      fixedCount = autoFixBySeverity(severity);
    } else {
      fixedCount = autoFixAll();
    }
    
    // Re-analyze after auto-fix
    setTimeout(() => {
      analyzeResponsiveness();
    }, 500);
    
    return fixedCount;
  };

  const issuesByType = {
    overflow: getIssuesByType('overflow'),
    touch: getIssuesByType('touch'),
    text: getIssuesByType('text'),
    layout: getIssuesByType('layout'),
    accessibility: getIssuesByType('accessibility'),
    performance: getIssuesByType('performance')
  };

  const performanceScore = metrics?.performanceScore || 0;
  const accessibilityScore = metrics?.accessibilityScore || 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Responsive Design Auto-Fix</h1>
            <p className="text-muted-foreground">
              Automatically detect and fix responsive design issues
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => analyzeResponsiveness()}
            disabled={isAnalyzing}
            variant="outline"
          >
            {isAnalyzing ? 'Analyzing...' : 'Re-scan'}
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Auto-Fix Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-fix-enabled" className="text-sm font-medium">
                Enable Auto-Fix
              </Label>
              <Switch
                id="auto-fix-enabled"
                checked={autoFixEnabled}
                onCheckedChange={setAutoFixEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-fix-critical" className="text-sm font-medium">
                Auto-fix Critical
              </Label>
              <Switch
                id="auto-fix-critical"
                checked={autoFixCritical}
                onCheckedChange={setAutoFixCritical}
                disabled={!autoFixEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-fix-high" className="text-sm font-medium">
                Auto-fix High Priority
              </Label>
              <Switch
                id="auto-fix-high"
                checked={autoFixHigh}
                onCheckedChange={setAutoFixHigh}
                disabled={!autoFixEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewport Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {getDeviceIcon(viewport.deviceType)}
              <div>
                <div className="text-sm font-medium">Device Type</div>
                <div className="text-lg font-bold capitalize">{viewport.deviceType}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Viewport</div>
                <div className="text-lg font-bold">
                  {viewport.width} × {viewport.height}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ChartBar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Performance</div>
                <div className="text-lg font-bold">{performanceScore}%</div>
                <Progress value={performanceScore} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium">Accessibility</div>
                <div className="text-lg font-bold">{accessibilityScore}%</div>
                <Progress value={accessibilityScore} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{stats.criticalIssues}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.highIssues}</div>
            <div className="text-sm text-muted-foreground">High</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <div className="text-sm text-muted-foreground">Total Issues</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.autoFixableIssues}</div>
            <div className="text-sm text-muted-foreground">Auto-fixable</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overflowIssues}</div>
            <div className="text-sm text-muted-foreground">Overflow</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.touchIssues}</div>
            <div className="text-sm text-muted-foreground">Touch</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <Button 
              onClick={() => handleAutoFix()}
              disabled={stats.autoFixableIssues === 0}
              className="w-full"
            >
              Fix All ({stats.autoFixableIssues})
            </Button>
            <Button 
              onClick={() => handleAutoFix(undefined, 'critical')}
              disabled={stats.criticalIssues === 0}
              variant="destructive"
              className="w-full"
            >
              Fix Critical
            </Button>
            <Button 
              onClick={() => handleAutoFix('overflow')}
              disabled={stats.overflowIssues === 0}
              variant="outline"
              className="w-full"
            >
              Fix Overflow
            </Button>
            <Button 
              onClick={() => handleAutoFix('touch')}
              disabled={stats.touchIssues === 0}
              variant="outline"
              className="w-full"
            >
              Fix Touch
            </Button>
            <Button 
              onClick={() => handleAutoFix('text')}
              disabled={getIssuesByType('text').length === 0}
              variant="outline"
              className="w-full"
            >
              Fix Text
            </Button>
            <Button 
              onClick={() => handleAutoFix('accessibility')}
              disabled={stats.accessibilityIssues === 0}
              variant="outline"
              className="w-full"
            >
              Fix A11y
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Issues Details */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({stats.totalIssues})</TabsTrigger>
          <TabsTrigger value="overflow">Overflow ({stats.overflowIssues})</TabsTrigger>
          <TabsTrigger value="touch">Touch ({stats.touchIssues})</TabsTrigger>
          <TabsTrigger value="text">Text ({getIssuesByType('text').length})</TabsTrigger>
          <TabsTrigger value="layout">Layout ({getIssuesByType('layout').length})</TabsTrigger>
          <TabsTrigger value="accessibility">A11y ({stats.accessibilityIssues})</TabsTrigger>
          <TabsTrigger value="performance">Performance ({getIssuesByType('performance').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <IssuesList issues={issues} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>

        <TabsContent value="overflow" className="mt-6">
          <IssuesList issues={issuesByType.overflow} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>

        <TabsContent value="touch" className="mt-6">
          <IssuesList issues={issuesByType.touch} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>

        <TabsContent value="text" className="mt-6">
          <IssuesList issues={issuesByType.text} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>

        <TabsContent value="layout" className="mt-6">
          <IssuesList issues={issuesByType.layout} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>

        <TabsContent value="accessibility" className="mt-6">
          <IssuesList issues={issuesByType.accessibility} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <IssuesList issues={issuesByType.performance} onSelectIssue={setSelectedIssue} onAutoFix={handleAutoFix} />
        </TabsContent>
      </Tabs>

      {/* Analysis Info */}
      {lastAnalysis && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Analysis Complete</AlertTitle>
          <AlertDescription>
            Last analysis completed at {lastAnalysis.toLocaleTimeString()}. 
            Found {stats.totalIssues} issues ({stats.autoFixableIssues} auto-fixable).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface IssuesListProps {
  issues: ResponsiveIssue[];
  onSelectIssue: (issue: ResponsiveIssue) => void;
  onAutoFix: (type?: ResponsiveIssue['type'], severity?: ResponsiveIssue['severity']) => Promise<number>;
}

function IssuesList({ issues, onSelectIssue, onAutoFix }: IssuesListProps) {
  const getSeverityColor = (severity: ResponsiveIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: ResponsiveIssue['type']) => {
    const iconProps = { size: 16, weight: 'regular' as const };
    switch (type) {
      case 'overflow': return <ArrowRight {...iconProps} />;
      case 'touch': return <Hand {...iconProps} />;
      case 'text': return <TextAa {...iconProps} />;
      case 'layout': return <Layout {...iconProps} />;
      case 'accessibility': return <Shield {...iconProps} />;
      case 'performance': return <Lightning {...iconProps} />;
      default: return <Bug {...iconProps} />;
    }
  };

  const getTypeColor = (type: ResponsiveIssue['type']) => {
    switch (type) {
      case 'overflow': return 'text-red-600';
      case 'touch': return 'text-blue-600';
      case 'text': return 'text-green-600';
      case 'layout': return 'text-purple-600';
      case 'accessibility': return 'text-orange-600';
      case 'performance': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
          <p className="text-muted-foreground">
            Great! No responsive design issues detected in this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-2 p-4">
            {issues.map((issue, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onSelectIssue(issue)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={getTypeColor(issue.type)}>
                    {getTypeIcon(issue.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {issue.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {issue.autoFixAvailable && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (issue.fix) {
                          issue.fix();
                        }
                      }}
                    >
                      <Wrench className="w-3 h-3 mr-1" />
                      Fix
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}