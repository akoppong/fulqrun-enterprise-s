/**
 * Quick Auto-Fix Actions Component
 * Provides one-click fixes for common responsive issues
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Zap, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Layout, 
  Type, 
  MousePointer,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from '@phosphor-icons/react';

import { useResponsiveAutoFix } from '@/hooks/useResponsiveAutoFix';
import { AUTO_FIX_RULES } from '@/lib/responsive-auto-fix';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  categories: string[];
  priorities: string[];
  estimatedTime: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'critical-layout-fixes',
    title: 'Fix Critical Layout Issues',
    description: 'Resolve overflow, positioning, and layout breaking issues',
    icon: <Layout className="h-5 w-5" />,
    categories: ['layout'],
    priorities: ['critical'],
    estimatedTime: '1-2 minutes',
    color: 'red'
  },
  {
    id: 'mobile-optimization',
    title: 'Optimize for Mobile',
    description: 'Fix touch targets, spacing, and mobile-specific issues',
    icon: <Smartphone className="h-5 w-5" />,
    categories: ['interaction', 'layout'],
    priorities: ['critical', 'high'],
    estimatedTime: '2-3 minutes',
    color: 'blue'
  },
  {
    id: 'tablet-improvements',
    title: 'Improve Tablet Experience',
    description: 'Optimize layouts and navigation for tablet devices',
    icon: <Tablet className="h-5 w-5" />,
    categories: ['layout', 'interaction'],
    priorities: ['high', 'medium'],
    estimatedTime: '1-2 minutes',
    color: 'green'
  },
  {
    id: 'typography-scaling',
    title: 'Fix Typography Issues',
    description: 'Improve text readability and scaling across devices',
    icon: <Type className="h-5 w-5" />,
    categories: ['typography'],
    priorities: ['medium', 'high'],
    estimatedTime: '30 seconds',
    color: 'purple'
  },
  {
    id: 'accessibility-fixes',
    title: 'Accessibility Quick Fixes',
    description: 'Improve focus states, touch targets, and screen reader support',
    icon: <Eye className="h-5 w-5" />,
    categories: ['accessibility', 'interaction'],
    priorities: ['critical', 'high'],
    estimatedTime: '1 minute',
    color: 'orange'
  },
  {
    id: 'performance-optimization',
    title: 'Performance Optimization',
    description: 'Optimize images, reduce layout shifts, and improve loading',
    icon: <TrendingUp className="h-5 w-5" />,
    categories: ['performance'],
    priorities: ['medium'],
    estimatedTime: '2-3 minutes',
    color: 'blue'
  }
];

interface QuickAutoFixActionsProps {
  className?: string;
  showProgress?: boolean;
  onComplete?: () => void;
}

export const QuickAutoFixActions: React.FC<QuickAutoFixActionsProps> = ({
  className = '',
  showProgress = true,
  onComplete
}) => {
  const [runningActions, setRunningActions] = useState<Set<string>>(new Set());
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [actionResults, setActionResults] = useState<Map<string, any>>(new Map());

  const autoFix = useResponsiveAutoFix({
    onSuccess: (session) => {
      toast.success(`Fixed ${session.totalIssuesFixed} out of ${session.totalIssuesFound} issues`);
      onComplete?.();
    },
    onError: (error) => {
      toast.error(`Auto-fix failed: ${error.message}`);
    }
  });

  const runQuickAction = async (action: QuickAction) => {
    if (runningActions.has(action.id) || autoFix.isRunning) return;

    setRunningActions(prev => new Set([...prev, action.id]));
    
    try {
      toast.info(`Running ${action.title}...`);

      await autoFix.runAutoFix({
        categories: action.categories as any,
        priorities: action.priorities as any,
        dryRun: false
      });

      setCompletedActions(prev => new Set([...prev, action.id]));
      setActionResults(prev => new Map([...prev, [action.id, autoFix.currentSession]]));

    } catch (error) {
      console.error(`Failed to run ${action.title}:`, error);
      toast.error(`Failed to run ${action.title}`);
    } finally {
      setRunningActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
    }
  };

  const runAllCritical = async () => {
    const criticalActions = QUICK_ACTIONS.filter(action => 
      action.priorities.includes('critical')
    );

    for (const action of criticalActions) {
      await runQuickAction(action);
      // Small delay between actions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getActionColor = (color: QuickAction['color']) => {
    const colors = {
      red: 'border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100',
      blue: 'border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100',
      green: 'border-green-200 hover:border-green-300 bg-green-50 hover:bg-green-100',
      orange: 'border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100',
      purple: 'border-purple-200 hover:border-purple-300 bg-purple-50 hover:bg-purple-100'
    };
    return colors[color];
  };

  const getIconColor = (color: QuickAction['color']) => {
    const colors = {
      red: 'text-red-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600'
    };
    return colors[color];
  };

  const getRuleCount = (action: QuickAction) => {
    return AUTO_FIX_RULES.filter(rule => 
      action.categories.includes(rule.category) && 
      action.priorities.includes(rule.priority)
    ).length;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quick Auto-Fix Actions</h3>
          <p className="text-sm text-muted-foreground">
            One-click fixes for common responsive design issues
          </p>
        </div>
        <Button 
          onClick={runAllCritical}
          disabled={autoFix.isRunning || runningActions.size > 0}
          variant="destructive"
          size="sm"
        >
          <Zap className="h-4 w-4 mr-2" />
          Fix All Critical
        </Button>
      </div>

      {/* Global Progress */}
      {showProgress && autoFix.progress > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running auto-fix...</span>
                <span>{autoFix.progress}%</span>
              </div>
              <Progress value={autoFix.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Results */}
      {autoFix.currentSession && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Latest run: Fixed {autoFix.currentSession.totalIssuesFixed} out of {autoFix.currentSession.totalIssuesFound} issues
            {autoFix.currentSession.warnings.length > 0 && (
              <span className="text-orange-600 ml-2">
                ({autoFix.currentSession.warnings.length} warnings)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => {
          const isRunning = runningActions.has(action.id);
          const isCompleted = completedActions.has(action.id);
          const ruleCount = getRuleCount(action);
          const result = actionResults.get(action.id);

          return (
            <Card 
              key={action.id}
              className={`transition-all duration-200 ${getActionColor(action.color)} ${
                isCompleted ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-white ${getIconColor(action.color)}`}>
                    {action.icon}
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {ruleCount} rules
                    </Badge>
                    {isCompleted && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Done
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Est. time: {action.estimatedTime}</span>
                    <span>{action.categories.join(', ')}</span>
                  </div>

                  {result && (
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Found:</span>
                        <span className="font-medium">{result.totalIssuesFound}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fixed:</span>
                        <span className="font-medium text-green-600">{result.totalIssuesFixed}</span>
                      </div>
                      {result.warnings.length > 0 && (
                        <div className="flex justify-between">
                          <span>Warnings:</span>
                          <span className="font-medium text-orange-600">{result.warnings.length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => runQuickAction(action)}
                    disabled={isRunning || autoFix.isRunning || ruleCount === 0}
                    className="w-full"
                    size="sm"
                    variant={isCompleted ? "outline" : "default"}
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        Running...
                      </>
                    ) : isCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Run Again
                      </>
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-2" />
                        Run Fix
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auto-Fix Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{AUTO_FIX_RULES.length}</div>
              <div className="text-xs text-muted-foreground">Total Rules</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {AUTO_FIX_RULES.filter(r => r.priority === 'critical').length}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {AUTO_FIX_RULES.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{completedActions.size}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {autoFix.currentSession?.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm">
              <div className="font-medium">Recent Warnings:</div>
              <ul className="mt-1 space-y-1">
                {autoFix.currentSession.warnings.slice(0, 3).map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
                {autoFix.currentSession.warnings.length > 3 && (
                  <li className="text-muted-foreground">
                    ... and {autoFix.currentSession.warnings.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};