/**
 * Floating Auto-Fix Button
 * A floating action button that provides quick access to responsive auto-fixes
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Smartphone,
  Monitor,
  Eye
} from '@phosphor-icons/react';

import { useResponsiveAutoFix } from '@/hooks/useResponsiveAutoFix';
import { AUTO_FIX_RULES } from '@/lib/responsive-auto-fix';

interface FloatingAutoFixProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  showOnIssuesOnly?: boolean;
  autoDetect?: boolean;
}

export const FloatingAutoFix: React.FC<FloatingAutoFixProps> = ({
  className = '',
  position = 'bottom-right',
  size = 'md',
  showOnIssuesOnly = false,
  autoDetect = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasIssues, setHasIssues] = useState(false);
  const [issueCount, setIssueCount] = useState(0);

  const autoFix = useResponsiveAutoFix({
    priorities: ['critical', 'high'],
    categories: ['layout', 'interaction'],
    dryRun: false,
    onSuccess: (session) => {
      toast.success(`Fixed ${session.totalIssuesFixed}/${session.totalIssuesFound} issues`);
      setIsOpen(false);
      checkForIssues();
    },
    onError: (error) => {
      toast.error(`Auto-fix failed: ${error.message}`);
    }
  });

  // Auto-detect issues on mount and page changes
  useEffect(() => {
    if (autoDetect) {
      checkForIssues();
    }
  }, [autoDetect]);

  const checkForIssues = async () => {
    try {
      const validation = await autoFix.validateCurrentPage();
      if (validation) {
        const criticalIssues = validation.criticalIssues.filter(
          issue => issue.severity === 'critical' || issue.severity === 'high'
        );
        setHasIssues(criticalIssues.length > 0);
        setIssueCount(criticalIssues.length);
      }
    } catch (error) {
      console.warn('Failed to check for issues:', error);
    }
  };

  const runQuickFix = async (type: 'critical' | 'mobile' | 'all') => {
    let options = {};
    
    switch (type) {
      case 'critical':
        options = { priorities: ['critical'], categories: ['layout', 'interaction'] };
        break;
      case 'mobile':
        options = { categories: ['interaction'], priorities: ['critical', 'high'] };
        break;
      case 'all':
        options = { priorities: ['critical', 'high', 'medium'], categories: ['layout', 'interaction', 'typography'] };
        break;
    }

    await autoFix.runAutoFix(options);
  };

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    return positions[position];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'h-12 w-12',
      md: 'h-14 w-14',
      lg: 'h-16 w-16'
    };
    return sizes[size];
  };

  // Don't show if configured to only show on issues and there are none
  if (showOnIssuesOnly && !hasIssues) {
    return null;
  }

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`
              fixed z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300
              ${getPositionClasses()}
              ${getSizeClasses()}
              ${hasIssues ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-primary hover:bg-primary/90'}
              ${className}
            `}
            size="icon"
          >
            <Zap className="h-5 w-5" />
            {hasIssues && issueCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {issueCount > 9 ? '9+' : issueCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-80" 
          align={position.includes('right') ? 'end' : 'start'}
          side={position.includes('bottom') ? 'top' : 'bottom'}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Quick Auto-Fix</h4>
                <p className="text-sm text-muted-foreground">
                  Fix responsive design issues
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            {autoFix.progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Running auto-fix...</span>
                  <span>{autoFix.progress}%</span>
                </div>
                <Progress value={autoFix.progress} className="h-2" />
              </div>
            )}

            {/* Issue Status */}
            {hasIssues ? (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div className="text-sm">
                  <div className="font-medium text-red-700">
                    {issueCount} critical issues detected
                  </div>
                  <div className="text-red-600">
                    Auto-fix can resolve these automatically
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium text-green-700">
                    No critical issues detected
                  </div>
                  <div className="text-green-600">
                    Responsive design looks good!
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Quick Actions</div>
              
              <Button
                onClick={() => runQuickFix('critical')}
                disabled={autoFix.isRunning}
                variant={hasIssues ? 'destructive' : 'outline'}
                className="w-full justify-start"
                size="sm"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Fix Critical Issues
                {hasIssues && (
                  <Badge variant="secondary" className="ml-auto">
                    {issueCount}
                  </Badge>
                )}
              </Button>

              <Button
                onClick={() => runQuickFix('mobile')}
                disabled={autoFix.isRunning}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Optimize for Mobile
              </Button>

              <Button
                onClick={() => runQuickFix('all')}
                disabled={autoFix.isRunning}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Monitor className="h-4 w-4 mr-2" />
                Comprehensive Fix
              </Button>

              <Button
                onClick={checkForIssues}
                disabled={autoFix.isRunning}
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Re-scan Issues
              </Button>
            </div>

            {/* Recent Results */}
            {autoFix.currentSession && (
              <div className="border-t pt-3">
                <div className="text-sm font-medium mb-2">Last Run Results</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-bold">{autoFix.currentSession.totalIssuesFound}</div>
                    <div className="text-xs text-muted-foreground">Found</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-bold text-green-600">{autoFix.currentSession.totalIssuesFixed}</div>
                    <div className="text-xs text-muted-foreground">Fixed</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="text-lg font-bold text-orange-600">{autoFix.currentSession.warnings.length}</div>
                    <div className="text-xs text-muted-foreground">Warnings</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-xs text-muted-foreground text-center">
              {AUTO_FIX_RULES.length} auto-fix rules available
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

// Simplified version for specific use cases
export const CriticalIssuesAutoFix: React.FC<{ className?: string }> = ({ className }) => (
  <FloatingAutoFix 
    className={className}
    showOnIssuesOnly={true}
    autoDetect={true}
    size="sm"
  />
);

export const MobileOptimizationFix: React.FC<{ className?: string }> = ({ className }) => {
  const autoFix = useResponsiveAutoFix({
    categories: ['interaction'],
    priorities: ['critical', 'high']
  });

  return (
    <Button 
      onClick={() => autoFix.runAutoFix()}
      disabled={autoFix.isRunning}
      className={className}
    >
      <Smartphone className="h-4 w-4 mr-2" />
      Optimize for Mobile
    </Button>
  );
};