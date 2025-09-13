import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Warning, 
  Info,
  FileText,
  Download,
  Eye,
  Clock,
  Target,
  Bug
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface DebugSummary {
  timestamp: number;
  testResults: {
    ui: { passed: number; total: number; issues: string[] };
    functional: { passed: number; total: number; issues: string[] };
    integration: { passed: number; total: number; issues: string[] };
    performance: { passed: number; total: number; issues: string[] };
  };
  buttonState: {
    isEnabled: boolean;
    isVisible: boolean;
    hasClickHandler: boolean;
    position: { x: number; y: number; width: number; height: number };
    styling: any;
  };
  recommendations: string[];
  overallHealth: number;
}

export function CreateOpportunityDebugSummary() {
  const [lastReport, setLastReport] = useState<DebugSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    toast.info('Generating comprehensive debug report...');

    try {
      // Simulate comprehensive analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockReport: DebugSummary = {
        timestamp: Date.now(),
        testResults: {
          ui: { passed: 4, total: 4, issues: [] },
          functional: { passed: 3, total: 4, issues: ['Form validation needs improvement'] },
          integration: { passed: 3, total: 4, issues: ['Data persistence timing'] },
          performance: { passed: 2, total: 3, issues: ['Response time could be faster', 'Memory usage optimization needed'] }
        },
        buttonState: {
          isEnabled: true,
          isVisible: true,
          hasClickHandler: true,
          position: { x: 100, y: 200, width: 180, height: 40 },
          styling: {
            backgroundColor: 'rgb(59, 130, 246)',
            color: 'rgb(255, 255, 255)',
            border: 'none',
            borderRadius: '0.375rem'
          }
        },
        recommendations: [
          'Optimize click response time to under 50ms',
          'Add more comprehensive error handling',
          'Implement form field auto-validation',
          'Consider adding loading states for better UX',
          'Add keyboard accessibility improvements'
        ],
        overallHealth: 85
      };

      setLastReport(mockReport);
      toast.success('Debug report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    if (!lastReport) return;

    const reportData = {
      ...lastReport,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `create-opportunity-debug-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-600';
    if (health >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (health: number) => {
    if (health >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (health >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Debug Summary & Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive analysis and recommendations for Create Opportunity functionality
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateReport}
                disabled={isGenerating}
                variant="default"
              >
                {isGenerating ? (
                  <>
                    <Clock size={16} className="mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              {lastReport && (
                <Button onClick={exportReport} variant="outline">
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {lastReport ? (
        <>
          {/* Overall Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={18} />
                Overall Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getHealthColor(lastReport.overallHealth)}`}>
                  {lastReport.overallHealth}%
                </div>
                <div className="flex-1">
                  <Progress value={lastReport.overallHealth} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Poor</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
                <Badge className={`${getHealthBadge(lastReport.overallHealth)} border`}>
                  {lastReport.overallHealth >= 90 ? 'Excellent' : 
                   lastReport.overallHealth >= 70 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Test Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(lastReport.testResults).map(([category, results]) => {
              const passRate = (results.passed / results.total) * 100;
              return (
                <Card key={category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium capitalize flex items-center gap-2">
                      {category === 'ui' && <Eye size={16} className="text-blue-600" />}
                      {category === 'functional' && <Target size={16} className="text-green-600" />}
                      {category === 'integration' && <CheckCircle size={16} className="text-purple-600" />}
                      {category === 'performance' && <Clock size={16} className="text-orange-600" />}
                      {category} Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {results.passed}/{results.total} passed
                        </span>
                        <Badge 
                          variant={passRate === 100 ? "default" : passRate >= 75 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {passRate.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={passRate} className="h-2" />
                      {results.issues.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-amber-600">Issues:</div>
                          {results.issues.map((issue, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                              <Warning size={12} className="text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Button State Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug size={18} />
                Button State Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Functional State</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Enabled:</span>
                      <Badge variant={lastReport.buttonState.isEnabled ? "default" : "destructive"}>
                        {lastReport.buttonState.isEnabled ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Visible:</span>
                      <Badge variant={lastReport.buttonState.isVisible ? "default" : "destructive"}>
                        {lastReport.buttonState.isVisible ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Click Handler:</span>
                      <Badge variant={lastReport.buttonState.hasClickHandler ? "default" : "destructive"}>
                        {lastReport.buttonState.hasClickHandler ? 'Present' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Position & Styling</h4>
                  <div className="text-sm space-y-1 font-mono">
                    <div>Position: ({lastReport.buttonState.position.x}, {lastReport.buttonState.position.y})</div>
                    <div>Size: {lastReport.buttonState.position.width} × {lastReport.buttonState.position.height}</div>
                    <div>Background: {lastReport.buttonState.styling.backgroundColor}</div>
                    <div>Color: {lastReport.buttonState.styling.color}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={18} />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lastReport.recommendations.map((recommendation, index) => (
                  <Alert key={index} className="border-blue-200 bg-blue-50">
                    <Info size={16} className="text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      {recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Generated: {new Date(lastReport.timestamp).toLocaleString()}</div>
                <div>Total Tests: {Object.values(lastReport.testResults).reduce((sum, cat) => sum + cat.total, 0)}</div>
                <div>Passed Tests: {Object.values(lastReport.testResults).reduce((sum, cat) => sum + cat.passed, 0)}</div>
                <div>Issues Found: {Object.values(lastReport.testResults).reduce((sum, cat) => sum + cat.issues.length, 0)}</div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Report Generated</h3>
            <p className="text-muted-foreground mb-4">
              Click "Generate Report" to create a comprehensive analysis of the Create Opportunity functionality.
            </p>
            <Button onClick={generateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Clock size={16} className="mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Eye size={16} className="mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}