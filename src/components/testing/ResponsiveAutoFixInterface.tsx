/**
 * Responsive Auto-Fix Interface Component
 * Provides UI for running and managing responsive design auto-fixes
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Zap,
  Settings,
  Eye,
  Wrench,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet
} from '@phosphor-icons/react';

import { 
  responsiveAutoFixer, 
  AutoFixSession, 
  AutoFixRule, 
  AUTO_FIX_RULES,
  type AutoFixResult 
} from '@/lib/responsive-auto-fix';
import { responsiveValidator } from '@/lib/responsive-validator';
import { ResponsiveAnalyzer } from '@/lib/responsive-recommendations';

interface AutoFixInterfaceProps {
  onClose?: () => void;
}

export const ResponsiveAutoFixInterface: React.FC<AutoFixInterfaceProps> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState<AutoFixSession[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<AutoFixRule['category'][]>(['layout', 'interaction']);
  const [selectedPriorities, setSelectedPriorities] = useState<AutoFixRule['priority'][]>(['critical', 'high']);
  const [dryRun, setDryRun] = useState(true);
  const [currentSession, setCurrentSession] = useState<AutoFixSession | null>(null);
  const [progress, setProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<any>(null);

  // Load session history on mount
  useEffect(() => {
    loadSessionHistory();
  }, []);

  const loadSessionHistory = () => {
    const history = responsiveAutoFixer.getSessionHistory();
    setSessions(history);
  };

  const runAutoFix = async (responsive = false) => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    
    try {
      toast.info(dryRun ? 'Running analysis...' : 'Applying auto-fixes...');
      
      let session: AutoFixSession;
      
      if (responsive) {
        // Run across multiple viewports
        const sessions = await responsiveAutoFixer.runResponsiveAutoFix({ dryRun });
        session = Array.from(sessions.values())[0] || sessions.values().next().value;
        setProgress(100);
      } else {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 20, 90));
        }, 200);

        session = await responsiveAutoFixer.runAutoFix({
          categories: selectedCategories,
          priorities: selectedPriorities,
          dryRun
        });

        clearInterval(progressInterval);
        setProgress(100);
      }

      setCurrentSession(session);
      loadSessionHistory();

      if (dryRun) {
        toast.success(`Analysis completed: Found ${session.totalIssuesFound} issues`);
      } else {
        toast.success(`Auto-fix completed: Fixed ${session.totalIssuesFixed}/${session.totalIssuesFound} issues`);
        
        // Validate results if fixes were applied
        if (session.totalIssuesFixed > 0) {
          const validation = await responsiveAutoFixer.validateFixes(session.id);
          setValidationResults(validation);
        }
      }

    } catch (error) {
      console.error('Auto-fix failed:', error);
      toast.error(`Auto-fix failed: ${error}`);
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const toggleCategory = (category: AutoFixRule['category']) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePriority = (priority: AutoFixRule['priority']) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: AutoFixRule['category']) => {
    switch (category) {
      case 'layout': return <Monitor className="h-4 w-4" />;
      case 'interaction': return <Wrench className="h-4 w-4" />;
      case 'typography': return <Type className="h-4 w-4" />;
      case 'accessibility': return <Eye className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const availableRules = AUTO_FIX_RULES.filter(rule => 
    selectedCategories.includes(rule.category) && 
    selectedPriorities.includes(rule.priority)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Responsive Auto-Fix</h2>
          <p className="text-muted-foreground">
            Automatically detect and fix common responsive design issues
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Progress */}
      {progress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Running auto-fix...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="run" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="run">Run Auto-Fix</TabsTrigger>
          <TabsTrigger value="rules">Available Rules</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Run Auto-Fix Tab */}
        <TabsContent value="run" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Select which types of issues to detect and fix
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dry-run" 
                      checked={dryRun} 
                      onCheckedChange={setDryRun}
                    />
                    <label htmlFor="dry-run" className="text-sm">
                      Dry run (analyze only, don't apply fixes)
                    </label>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['layout', 'interaction', 'typography', 'accessibility', 'performance'].map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category as AutoFixRule['category'])}
                          onCheckedChange={() => toggleCategory(category as AutoFixRule['category'])}
                        />
                        <label htmlFor={category} className="text-sm capitalize">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priorities */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['critical', 'high', 'medium', 'low'].map(priority => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={priority}
                          checked={selectedPriorities.includes(priority as AutoFixRule['priority'])}
                          onCheckedChange={() => togglePriority(priority as AutoFixRule['priority'])}
                        />
                        <label htmlFor={priority} className="text-sm capitalize">
                          {priority}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Selected Rules</AlertTitle>
                  <AlertDescription>
                    {availableRules.length} rules will be applied based on your selection
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Actions
                </CardTitle>
                <CardDescription>
                  Run auto-fix with different strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button 
                    onClick={() => runAutoFix(false)}
                    disabled={isRunning || availableRules.length === 0}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {dryRun ? 'Analyze Current View' : 'Fix Current View'}
                  </Button>

                  <Button 
                    onClick={() => runAutoFix(true)}
                    disabled={isRunning}
                    variant="secondary"
                    className="w-full"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    {dryRun ? 'Analyze All Viewports' : 'Fix All Viewports'}
                  </Button>

                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Page
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                      {availableRules.filter(r => r.priority === 'critical').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {availableRules.filter(r => r.priority === 'high').length}
                    </div>
                    <div className="text-xs text-muted-foreground">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {availableRules.filter(r => r.priority === 'medium').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Medium</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Session Results */}
          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Latest Results
                </CardTitle>
                <CardDescription>
                  {currentSession.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{currentSession.totalIssuesFound}</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{currentSession.totalIssuesFixed}</div>
                    <div className="text-sm text-muted-foreground">Issues Fixed</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{currentSession.warnings.length}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                </div>

                {currentSession.warnings.length > 0 && (
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warnings</AlertTitle>
                    <AlertDescription>
                      <ul className="mt-2 space-y-1">
                        {currentSession.warnings.slice(0, 3).map((warning, index) => (
                          <li key={index} className="text-sm">• {warning}</li>
                        ))}
                        {currentSession.warnings.length > 3 && (
                          <li className="text-sm text-muted-foreground">
                            ... and {currentSession.warnings.length - 3} more
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validationResults && (
                  <Alert className="mt-4">
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Validation Results</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-1">
                        <div>Score: {validationResults.validationScore}/100</div>
                        <div>Remaining Issues: {validationResults.remainingIssues.length}</div>
                        <div className="text-sm text-muted-foreground">
                          {validationResults.improvements.join(', ')}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Available Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Auto-Fix Rules</CardTitle>
              <CardDescription>
                {AUTO_FIX_RULES.length} rules available for automatic responsive design fixes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {AUTO_FIX_RULES.map((rule, index) => (
                    <div key={rule.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(rule.category)}
                          <h4 className="font-medium">{rule.name}</h4>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getSeverityColor(rule.priority) as any}>
                            {rule.priority}
                          </Badge>
                          <Badge variant="outline">{rule.category}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {rule.description}
                      </p>
                      {rule.affectedBreakpoints && (
                        <div className="flex gap-1 mt-2">
                          {rule.affectedBreakpoints.slice(0, 3).map((bp, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {bp}
                            </Badge>
                          ))}
                          {rule.affectedBreakpoints.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{rule.affectedBreakpoints.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Session Results</CardTitle>
              <CardDescription>
                Detailed results from the most recent auto-fix session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSession ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="font-bold">{currentSession.totalIssuesFound}</div>
                      <div className="text-xs text-muted-foreground">Found</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="font-bold text-green-600">{currentSession.totalIssuesFixed}</div>
                      <div className="text-xs text-muted-foreground">Fixed</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="font-bold">{currentSession.rulesApplied.length}</div>
                      <div className="text-xs text-muted-foreground">Rules</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded">
                      <div className="font-bold text-orange-600">{currentSession.warnings.length}</div>
                      <div className="text-xs text-muted-foreground">Warnings</div>
                    </div>
                  </div>

                  {currentSession.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Warnings:</h4>
                      <ScrollArea className="h-32 border rounded p-2">
                        <div className="space-y-1">
                          {currentSession.warnings.map((warning, index) => (
                            <div key={index} className="text-sm text-orange-600">
                              • {warning}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No results yet. Run an auto-fix session to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Previous auto-fix sessions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {sessions.map((session, index) => (
                      <div key={session.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">
                            {session.timestamp.toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">{session.totalIssuesFound} found</Badge>
                            <Badge variant={session.totalIssuesFixed > 0 ? 'default' : 'secondary'}>
                              {session.totalIssuesFixed} fixed
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {session.summary}
                        </div>
                        {session.warnings.length > 0 && (
                          <div className="text-xs text-orange-600 mt-1">
                            {session.warnings.length} warnings
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No session history yet. Run your first auto-fix to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for missing icon
const Type = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);