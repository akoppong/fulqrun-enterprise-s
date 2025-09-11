import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useResponsiveAutoFix } from '@/hooks/useResponsiveAutoFix';
import {
  DeviceMobile,
  DeviceTablet,
  Desktop,
  Television,
  Warning,
  CheckCircle,
  Wrench,
  Eye,
  Lightning,
  Shield
} from '@phosphor-icons/react';

export function ResponsiveStatusIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    viewport,
    metrics,
    issues,
    isAnalyzing,
    stats,
    autoFixAll,
    analyzeResponsiveness
  } = useResponsiveAutoFix({
    enabled: true,
    autoFixCritical: true,
    watchForChanges: true,
    performanceMode: true
  });

  const getDeviceIcon = () => {
    const iconProps = { size: 16, weight: 'regular' as const };
    switch (viewport.deviceType) {
      case 'mobile': return <DeviceMobile {...iconProps} />;
      case 'tablet': return <DeviceTablet {...iconProps} />;
      case 'desktop': return <Desktop {...iconProps} />;
      case 'tv': return <Television {...iconProps} />;
      default: return <Desktop {...iconProps} />;
    }
  };

  const getStatusColor = () => {
    if (stats.criticalIssues > 0) return 'destructive';
    if (stats.highIssues > 0) return 'secondary';
    if (stats.totalIssues > 0) return 'outline';
    return 'default';
  };

  const getStatusText = () => {
    if (isAnalyzing) return 'Analyzing...';
    if (stats.criticalIssues > 0) return `${stats.criticalIssues} Critical`;
    if (stats.highIssues > 0) return `${stats.highIssues} High`;
    if (stats.totalIssues > 0) return `${stats.totalIssues} Issues`;
    return 'All Good';
  };

  const handleQuickFix = async () => {
    const fixedCount = await autoFixAll();
    setIsOpen(false);
    
    // Show toast notification (you can implement this)
    console.log(`Auto-fixed ${fixedCount} issues`);
  };

  const performanceScore = metrics?.performanceScore || 0;
  const accessibilityScore = metrics?.accessibilityScore || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-xs gap-1.5 relative"
        >
          {getDeviceIcon()}
          <span className="hidden sm:inline">
            {viewport.width}×{viewport.height}
          </span>
          <Badge 
            variant={getStatusColor()}
            className="text-xs px-1.5 py-0.5 min-w-0 scale-90"
          >
            {getStatusText()}
          </Badge>
          {stats.criticalIssues > 0 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <div>
                <h4 className="font-semibold text-sm">Responsive Status</h4>
                <p className="text-xs text-muted-foreground capitalize">
                  {viewport.deviceType} • {viewport.orientation}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => analyzeResponsiveness()}
              disabled={isAnalyzing}
              className="h-7 text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              {isAnalyzing ? 'Scanning...' : 'Scan'}
            </Button>
          </div>

          <Separator />

          {/* Viewport Info */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Viewport
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-1 font-mono">{viewport.width}×{viewport.height}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ratio:</span>
                <span className="ml-1 font-mono">{viewport.aspectRatio.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance Scores */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Performance
            </h5>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Lightning className="w-3 h-3 text-blue-500" />
                  <span>Performance</span>
                </div>
                <span className="font-mono">{performanceScore}%</span>
              </div>
              <Progress value={performanceScore} className="h-1.5" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Accessibility</span>
                </div>
                <span className="font-mono">{accessibilityScore}%</span>
              </div>
              <Progress value={accessibilityScore} className="h-1.5" />
            </div>
          </div>

          <Separator />

          {/* Issues Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Issues
              </h5>
              {stats.autoFixableIssues > 0 && (
                <Button
                  size="sm"
                  onClick={handleQuickFix}
                  className="h-6 text-xs px-2"
                >
                  <Wrench className="w-3 h-3 mr-1" />
                  Fix All ({stats.autoFixableIssues})
                </Button>
              )}
            </div>
            
            {stats.totalIssues === 0 ? (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>No responsive issues detected</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-600">Critical</span>
                  <Badge variant="destructive" className="text-xs px-1.5 py-0">
                    {stats.criticalIssues}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-orange-600">High</span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {stats.highIssues}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-500">Overflow</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {stats.overflowIssues}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-500">Touch</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {stats.touchIssues}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {stats.totalIssues > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      // Navigate to responsive dashboard
                      setIsOpen(false);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => analyzeResponsiveness()}
                    disabled={isAnalyzing}
                  >
                    <Lightning className="w-3 h-3 mr-1" />
                    Re-scan
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SimpleResponsiveIndicator() {
  const { viewport, stats } = useResponsiveAutoFix({
    enabled: true,
    performanceMode: true
  });

  const getDeviceIcon = () => {
    const iconProps = { size: 14, weight: 'regular' as const };
    switch (viewport.deviceType) {
      case 'mobile': return <DeviceMobile {...iconProps} />;
      case 'tablet': return <DeviceTablet {...iconProps} />;
      case 'desktop': return <Desktop {...iconProps} />;
      case 'tv': return <Television {...iconProps} />;
      default: return <Desktop {...iconProps} />;
    }
  };

  const getStatusColor = () => {
    if (stats.criticalIssues > 0) return 'destructive';
    if (stats.highIssues > 0) return 'secondary';
    return 'default';
  };

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {getDeviceIcon()}
      <span className="hidden md:inline">
        {viewport.width}×{viewport.height}
      </span>
      {stats.totalIssues > 0 && (
        <Badge variant={getStatusColor()} className="text-xs px-1 py-0 scale-75">
          {stats.totalIssues}
        </Badge>
      )}
    </div>
  );
}