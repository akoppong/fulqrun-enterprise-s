import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { 
  useUIConsistencyChecker, 
  type UIIssue, 
  type UIFixResult 
} from '@/lib/ui-consistency-checker';
import { 
  CheckCircle, 
  Warning, 
  XCircle, 
  Wrench, 
  Eye, 
  Scan,
  Lightbulb,
  Target,
  Palette,
  MobilePhone,
  Users
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface UIConsistencyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UIConsistencyDashboard({ isOpen, onClose }: UIConsistencyDashboardProps) {
  const { runCheck, autoFix, getIssues, clearIssues } = useUIConsistencyChecker();
  const [issues, setIssues] = useState<UIIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [fixResults, setFixResults] = useState<UIFixResult | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      handleRunCheck();
    }
  }, [isOpen]);

  const handleRunCheck = async () => {
    setIsChecking(true);
    setFixResults(null);
    
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundIssues = runCheck();
      setIssues(foundIssues);
      setLastCheckTime(new Date());
      
      toast.success(`UI check complete: ${foundIssues.length} issue${foundIssues.length !== 1 ? 's' : ''} found`);
    } catch (error) {
      toast.error('Failed to run UI consistency check');
      console.error('UI check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAutoFix = async () => {
    setIsFixing(true);
    
    try {
      const autoFixableIssues = issues.filter(issue => issue.autoFixable);
      
      if (autoFixableIssues.length === 0) {
        toast.info('No auto-fixable issues found');
        return;
      }
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = autoFix();
      setFixResults(result);
      
      // Update issues list to remove fixed issues
      const fixedIds = result.fixed.map(issue => issue.id);
      setIssues(prev => prev.filter(issue => !fixedIds.includes(issue.id)));
      
    } catch (error) {
      toast.error('Failed to auto-fix issues');
      console.error('Auto-fix error:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const handleClearResults = () => {
    setIssues([]);
    setFixResults(null);
    clearIssues();
    setLastCheckTime(null);
    toast.success('Results cleared');
  };

  const getSeverityIcon = (severity: UIIssue['severity']) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'high': return <Warning className="w-4 h-4 text-red-500" />;
      case 'medium': return <Warning className="w-4 h-4 text-orange-500" />;
      case 'low': return <Warning className="w-4 h-4 text-yellow-500" />;
      default: return <Warning className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: UIIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: UIIssue['type']) => {
    switch (type) {
      case 'overlap': return <Target className="w-4 h-4" />;
      case 'spacing': return <Lightbulb className="w-4 h-4" />;
      case 'accessibility': return <Users className="w-4 h-4" />;
      case 'touch-target': return <MobilePhone className="w-4 h-4" />;
      case 'form': return <CheckCircle className="w-4 h-4" />;
      case 'contrast': return <Palette className="w-4 h-4" />;
      case 'responsive': return <MobilePhone className="w-4 h-4" />;
      default: return <Warning className="w-4 h-4" />;
    }
  };

  const filteredIssues = issues.filter(issue => {
    const severityMatch = selectedSeverity === 'all' || issue.severity === selectedSeverity;
    const typeMatch = selectedType === 'all' || issue.type === selectedType;
    return severityMatch && typeMatch;
  });

  const issueStats = {
    total: issues.length,
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
    autoFixable: issues.filter(i => i.autoFixable).length,
  };

  const issueTypeStats = {
    overlap: issues.filter(i => i.type === 'overlap').length,
    spacing: issues.filter(i => i.type === 'spacing').length,
    accessibility: issues.filter(i => i.type === 'accessibility').length,
    touchTarget: issues.filter(i => i.type === 'touch-target').length,
    form: issues.filter(i => i.type === 'form').length,
    contrast: issues.filter(i => i.type === 'contrast').length,
    responsive: issues.filter(i => i.type === 'responsive').length,
  };

  const highlightElement = (element: Element) => {
    // Remove existing highlights
    document.querySelectorAll('.ui-issue-highlight').forEach(el => {
      el.classList.remove('ui-issue-highlight');
    });
    
    // Add highlight to current element
    element.classList.add('ui-issue-highlight');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.classList.remove('ui-issue-highlight');
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <EnhancedErrorBoundary context="UIConsistencyDashboard">
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg border shadow-lg w-full max-w-7xl h-[95vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Eye className="w-6 h-6" />
                  UI Consistency Dashboard
                </h2>
                <p className="text-muted-foreground">
                  Automatically detect and fix UI/UX issues across your application
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClearResults}>
                  Clear Results
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 border-b bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{issueStats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Issues</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{issueStats.critical + issueStats.high}</div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{issueStats.autoFixable}</div>
                  <div className="text-sm text-muted-foreground">Auto-fixable</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{issueTypeStats.accessibility}</div>
                  <div className="text-sm text-muted-foreground">Accessibility</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{issueTypeStats.responsive}</div>
                  <div className="text-sm text-muted-foreground">Responsive</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-hidden">
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button 
                onClick={handleRunCheck}
                disabled={isChecking}
                className="flex items-center gap-2"
              >
                <Scan className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Run UI Check'}
              </Button>
              
              <Button 
                onClick={handleAutoFix}
                disabled={isFixing || issueStats.autoFixable === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Wrench className={`w-4 h-4 ${isFixing ? 'animate-spin' : ''}`} />
                {isFixing ? 'Fixing...' : `Auto-Fix (${issueStats.autoFixable})`}
              </Button>

              {lastCheckTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                  <CheckCircle className="w-4 h-4" />
                  Last check: {lastCheckTime.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Fix Results */}
            {fixResults && (
              <Alert className="mb-6">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Auto-fix Results:</p>
                    <p>✅ Fixed: {fixResults.fixed.length} issues</p>
                    {fixResults.failed.length > 0 && (
                      <p>❌ Failed: {fixResults.failed.length} issues</p>
                    )}
                    {fixResults.warnings.length > 0 && (
                      <p>⚠️ Warnings: {fixResults.warnings.length}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="issues" className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="issues">Issues ({filteredIssues.length})</TabsTrigger>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="issues" className="flex-1 mt-4">
                {/* Filters */}
                <div className="flex gap-4 mb-4">
                  <div className="flex gap-2">
                    <span className="text-sm font-medium">Severity:</span>
                    {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                      <Button
                        key={severity}
                        variant={selectedSeverity === severity ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedSeverity(severity)}
                      >
                        {severity === 'all' ? 'All' : severity}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    {['all', 'overlap', 'spacing', 'accessibility', 'touch-target', 'form', 'contrast', 'responsive'].map(type => (
                      <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                      >
                        {type === 'all' ? 'All' : type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Issues List */}
                <ScrollArea className="h-[calc(100%-8rem)]">
                  <div className="space-y-4">
                    {filteredIssues.map((issue) => (
                      <Card key={issue.id} className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(issue.severity)}
                              {getTypeIcon(issue.type)}
                              <CardTitle className="text-base">{issue.description}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getSeverityColor(issue.severity) as any}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline">
                                {issue.type}
                              </Badge>
                              {issue.autoFixable && (
                                <Badge variant="secondary">
                                  Auto-fixable
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {issue.suggestions.map((suggestion, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => highlightElement(issue.element)}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Highlight Element
                              </Button>
                              
                              {issue.autoFixable && (
                                <Button 
                                  size="sm"
                                  onClick={() => autoFix([issue])}
                                >
                                  <Wrench className="w-3 h-3 mr-1" />
                                  Fix This Issue
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredIssues.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Issues Found</h3>
                        <p className="text-muted-foreground">
                          {issues.length === 0 
                            ? "Run a UI check to scan for issues"
                            : "All issues matching your filters have been resolved"
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="overview" className="flex-1 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Issue Distribution by Severity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Critical</span>
                          <span className="text-sm font-medium">{issueStats.critical}</span>
                        </div>
                        <Progress value={(issueStats.critical / Math.max(issueStats.total, 1)) * 100} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">High</span>
                          <span className="text-sm font-medium">{issueStats.high}</span>
                        </div>
                        <Progress value={(issueStats.high / Math.max(issueStats.total, 1)) * 100} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Medium</span>
                          <span className="text-sm font-medium">{issueStats.medium}</span>
                        </div>
                        <Progress value={(issueStats.medium / Math.max(issueStats.total, 1)) * 100} className="h-2" />
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Low</span>
                          <span className="text-sm font-medium">{issueStats.low}</span>
                        </div>
                        <Progress value={(issueStats.low / Math.max(issueStats.total, 1)) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Issue Types</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(issueTypeStats).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(type as UIIssue['type'])}
                            <span className="text-sm capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="flex-1 mt-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Wins</CardTitle>
                      <CardDescription>High-impact issues that can be fixed quickly</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Auto-fixable Issues</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {issueStats.autoFixable} issues can be automatically fixed with one click.
                          </p>
                          <Button size="sm" onClick={handleAutoFix} disabled={issueStats.autoFixable === 0}>
                            Fix All Auto-fixable Issues
                          </Button>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Accessibility Improvements</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {issueTypeStats.accessibility} accessibility issues found. These affect user experience for everyone.
                          </p>
                          <ul className="text-sm space-y-1">
                            <li>• Add alt text to images</li>
                            <li>• Ensure proper focus states</li>
                            <li>• Add labels to form fields</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Best Practices</CardTitle>
                      <CardDescription>General recommendations for better UI consistency</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Spacing & Layout</h4>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>• Use consistent spacing units (8px, 16px, 24px)</li>
                            <li>• Maintain proper margins between elements</li>
                            <li>• Use CSS Grid or Flexbox for layouts</li>
                            <li>• Ensure adequate white space</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Touch & Mobile</h4>
                          <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>• Minimum 44px touch targets</li>
                            <li>• Responsive typography (16px+ on mobile)</li>
                            <li>• Prevent horizontal scroll</li>
                            <li>• Test on various screen sizes</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* CSS for highlighting elements */}
      <style>{`
        .ui-issue-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          background-color: rgba(59, 130, 246, 0.1) !important;
          transition: all 0.3s ease !important;
        }
      `}</style>
    </EnhancedErrorBoundary>
  );
}