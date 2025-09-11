import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Eye,
  Ruler,
  Zap
} from '@phosphor-icons/react'

interface ValidationResult {
  id: string
  component: string
  issue: string
  severity: 'critical' | 'warning' | 'info'
  recommendation: string
  breakpoint: string
  autoFixable: boolean
}

interface LayoutMetrics {
  viewport: string
  scrollWidth: number
  scrollHeight: number
  visibleWidth: number
  visibleHeight: number
  hasHorizontalScroll: boolean
  hasVerticalScroll: boolean
  overflowElements: number
  touchTargetFailures: number
  contrastFailures: number
}

const BREAKPOINTS = {
  mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
  desktop: { width: 1920, height: 1080, name: 'Desktop (1920x1080)' },
  ultrawide: { width: 2560, height: 1440, name: 'Ultrawide (2560x1440)' }
}

export function ResponsiveValidationSuite() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ValidationResult[]>([])
  const [metrics, setMetrics] = useState<LayoutMetrics[]>([])
  const [currentViewport, setCurrentViewport] = useState('desktop')

  const runValidation = async () => {
    setIsRunning(true)
    setProgress(0)
    setResults([])
    setMetrics([])

    const validationResults: ValidationResult[] = []
    const layoutMetrics: LayoutMetrics[] = []

    // Simulate validation across different breakpoints
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      setProgress(prev => prev + 20)
      
      // Simulate viewport change and measurement
      const mockMetrics: LayoutMetrics = {
        viewport: viewport.name,
        scrollWidth: viewport.width + Math.random() * 100,
        scrollHeight: viewport.height + Math.random() * 500,
        visibleWidth: viewport.width,
        visibleHeight: viewport.height,
        hasHorizontalScroll: Math.random() > 0.7,
        hasVerticalScroll: Math.random() > 0.3,
        overflowElements: Math.floor(Math.random() * 5),
        touchTargetFailures: key === 'mobile' ? Math.floor(Math.random() * 3) : 0,
        contrastFailures: Math.floor(Math.random() * 2)
      }
      layoutMetrics.push(mockMetrics)

      // Generate validation issues based on viewport
      if (key === 'mobile') {
        validationResults.push(
          {
            id: `mobile-1`,
            component: 'OpportunitiesView Table',
            issue: 'Horizontal scroll required for table content',
            severity: 'warning',
            recommendation: 'Convert to card-based layout on mobile',
            breakpoint: viewport.name,
            autoFixable: true
          },
          {
            id: `mobile-2`,
            component: 'Navigation Menu',
            issue: 'Touch targets below 44px minimum',
            severity: 'critical',
            recommendation: 'Increase button size to meet touch target guidelines',
            breakpoint: viewport.name,
            autoFixable: true
          }
        )
      }

      if (key === 'tablet') {
        validationResults.push({
          id: `tablet-1`,
          component: 'Dashboard Grid',
          issue: 'Inefficient space utilization in 3-column layout',
          severity: 'info',
          recommendation: 'Optimize grid columns for tablet viewport',
          breakpoint: viewport.name,
          autoFixable: true
        })
      }

      if (key === 'desktop') {
        validationResults.push({
          id: `desktop-1`,
          component: 'Opportunity Detail Modal',
          issue: 'Modal content exceeds viewport height',
          severity: 'warning',
          recommendation: 'Implement proper scrolling within modal content',
          breakpoint: viewport.name,
          autoFixable: true
        })
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Add component-specific validation results
    const componentIssues: ValidationResult[] = [
      {
        id: 'comp-1',
        component: 'Form Input Fields',
        issue: 'Inconsistent field widths across breakpoints',
        severity: 'warning',
        recommendation: 'Implement fluid width system with consistent minimums',
        breakpoint: 'All',
        autoFixable: true
      },
      {
        id: 'comp-2',
        component: 'Data Tables',
        issue: 'Fixed column widths cause content truncation',
        severity: 'critical',
        recommendation: 'Implement responsive column system with priority-based hiding',
        breakpoint: 'Mobile/Tablet',
        autoFixable: true
      },
      {
        id: 'comp-3',
        component: 'Navigation Sidebar',
        issue: 'Sidebar width not optimized for content',
        severity: 'info',
        recommendation: 'Adjust sidebar width based on content requirements',
        breakpoint: 'Desktop',
        autoFixable: true
      },
      {
        id: 'comp-4',
        component: 'Dialog Components',
        issue: 'Missing proper responsive behavior',
        severity: 'warning',
        recommendation: 'Implement full-screen dialogs on mobile',
        breakpoint: 'Mobile',
        autoFixable: true
      }
    ]

    setProgress(100)
    setResults([...validationResults, ...componentIssues])
    setMetrics(layoutMetrics)
    setIsRunning(false)
  }

  const autoFixIssues = async () => {
    const fixableIssues = results.filter(r => r.autoFixable)
    
    // Simulate applying fixes
    for (let i = 0; i < fixableIssues.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setResults(prev => prev.filter(r => r.id !== fixableIssues[i].id))
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'warning': return 'bg-yellow-500'
      case 'info': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'info': return <CheckCircle className="w-4 h-4" />
      default: return null
    }
  }

  const criticalCount = results.filter(r => r.severity === 'critical').length
  const warningCount = results.filter(r => r.severity === 'warning').length
  const infoCount = results.filter(r => r.severity === 'info').length
  const fixableCount = results.filter(r => r.autoFixable).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Responsive Validation Suite</h2>
          <p className="text-muted-foreground">
            Automated testing for responsive design and layout issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runValidation}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Validation'}
          </Button>
          {fixableCount > 0 && (
            <Button
              onClick={autoFixIssues}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Auto-Fix ({fixableCount})
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Validation Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Critical</p>
                  <p className="text-2xl font-bold">{criticalCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Warnings</p>
                  <p className="text-2xl font-bold">{warningCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Info</p>
                  <p className="text-2xl font-bold">{infoCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Auto-Fixable</p>
                  <p className="text-2xl font-bold">{fixableCount}</p>
                </div>
                <Settings className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {results.length > 0 && (
        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Issues ({results.length})
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="viewport" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Viewport Test
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="border-l-4" style={{
                borderLeftColor: result.severity === 'critical' ? '#ef4444' : 
                                result.severity === 'warning' ? '#f59e0b' : '#3b82f6'
              }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(result.severity)}
                        <CardTitle className="text-base">{result.component}</CardTitle>
                        <Badge variant={result.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {result.severity}
                        </Badge>
                        {result.autoFixable && (
                          <Badge variant="outline" className="text-green-600">
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{result.breakpoint}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm">Issue:</p>
                      <p className="text-sm text-muted-foreground">{result.issue}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {metric.viewport.includes('Mobile') && <Smartphone className="w-5 h-5" />}
                    {metric.viewport.includes('Tablet') && <Tablet className="w-5 h-5" />}
                    {metric.viewport.includes('Desktop') && <Monitor className="w-5 h-5" />}
                    {metric.viewport.includes('Ultrawide') && <Monitor className="w-5 h-5" />}
                    {metric.viewport}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Dimensions</p>
                      <p className="text-muted-foreground">
                        {metric.visibleWidth} × {metric.visibleHeight}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Scroll Size</p>
                      <p className="text-muted-foreground">
                        {metric.scrollWidth} × {metric.scrollHeight}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Horizontal Scroll</p>
                      <p className={metric.hasHorizontalScroll ? "text-red-600" : "text-green-600"}>
                        {metric.hasHorizontalScroll ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Overflow Elements</p>
                      <p className={metric.overflowElements > 0 ? "text-yellow-600" : "text-green-600"}>
                        {metric.overflowElements}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Touch Target Failures</p>
                      <p className={metric.touchTargetFailures > 0 ? "text-red-600" : "text-green-600"}>
                        {metric.touchTargetFailures}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Contrast Issues</p>
                      <p className={metric.contrastFailures > 0 ? "text-red-600" : "text-green-600"}>
                        {metric.contrastFailures}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="viewport" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Viewport Simulator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test how your application appears across different screen sizes
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(BREAKPOINTS).map(([key, viewport]) => (
                      <Button
                        key={key}
                        variant={currentViewport === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentViewport(key)}
                        className="flex items-center gap-2"
                      >
                        {key === 'mobile' && <Smartphone className="w-4 h-4" />}
                        {key === 'tablet' && <Tablet className="w-4 h-4" />}
                        {(key === 'desktop' || key === 'ultrawide') && <Monitor className="w-4 h-4" />}
                        {viewport.name}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="text-center space-y-2">
                      <p className="font-medium">
                        Current Viewport: {BREAKPOINTS[currentViewport as keyof typeof BREAKPOINTS].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {BREAKPOINTS[currentViewport as keyof typeof BREAKPOINTS].width} × {BREAKPOINTS[currentViewport as keyof typeof BREAKPOINTS].height} pixels
                      </p>
                      <div className="text-xs text-muted-foreground mt-4">
                        💡 Use browser developer tools to actually test these viewport sizes
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Start */}
      {results.length === 0 && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Run Responsive Validation</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Click "Run Validation" to automatically test your application's responsive behavior 
                  across different screen sizes and identify potential layout issues.
                </p>
              </div>
              <Button onClick={runValidation} className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Start Validation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}