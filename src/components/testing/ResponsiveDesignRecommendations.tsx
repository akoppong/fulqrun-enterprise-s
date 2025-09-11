import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Check,
  X,
  AlertTriangle,
  Info,
  Target,
  Palette,
  Type,
  Layout
} from '@phosphor-icons/react'

interface ResponsiveRecommendation {
  id: string
  category: 'layout' | 'typography' | 'interaction' | 'performance' | 'accessibility'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  breakpoints: string[]
  implemented: boolean
  priority: number
}

const RECOMMENDATIONS: ResponsiveRecommendation[] = [
  {
    id: 'rec-1',
    category: 'layout',
    title: 'Implement Container Queries',
    description: 'Use container queries for component-based responsive design instead of relying solely on viewport queries.',
    impact: 'high',
    effort: 'medium',
    breakpoints: ['All'],
    implemented: false,
    priority: 1
  },
  {
    id: 'rec-2',
    category: 'layout',
    title: 'Optimize Table Layouts for Mobile',
    description: 'Convert data tables to card-based layouts on mobile devices for better usability.',
    impact: 'high',
    effort: 'medium',
    breakpoints: ['Mobile'],
    implemented: true,
    priority: 2
  },
  {
    id: 'rec-3',
    category: 'typography',
    title: 'Implement Fluid Typography',
    description: 'Use clamp() functions for scalable typography that adapts smoothly across screen sizes.',
    impact: 'medium',
    effort: 'low',
    breakpoints: ['All'],
    implemented: true,
    priority: 3
  },
  {
    id: 'rec-4',
    category: 'interaction',
    title: 'Enhance Touch Targets',
    description: 'Ensure all interactive elements meet minimum 44px touch target size on mobile devices.',
    impact: 'high',
    effort: 'low',
    breakpoints: ['Mobile', 'Tablet'],
    implemented: false,
    priority: 4
  },
  {
    id: 'rec-5',
    category: 'layout',
    title: 'Implement Progressive Disclosure',
    description: 'Hide non-essential content on smaller screens using priority-based visibility classes.',
    impact: 'medium',
    effort: 'low',
    breakpoints: ['Mobile'],
    implemented: true,
    priority: 5
  },
  {
    id: 'rec-6',
    category: 'performance',
    title: 'Optimize Image Loading',
    description: 'Implement responsive images with appropriate srcset and sizes attributes.',
    impact: 'medium',
    effort: 'medium',
    breakpoints: ['All'],
    implemented: false,
    priority: 6
  },
  {
    id: 'rec-7',
    category: 'accessibility',
    title: 'Improve Focus Management',
    description: 'Enhance focus indicators and keyboard navigation for better accessibility across devices.',
    impact: 'high',
    effort: 'medium',
    breakpoints: ['All'],
    implemented: false,
    priority: 7
  },
  {
    id: 'rec-8',
    category: 'layout',
    title: 'Implement Sidebar Auto-collapse',
    description: 'Automatically collapse sidebar navigation on smaller screens to maximize content area.',
    impact: 'medium',
    effort: 'low',
    breakpoints: ['Tablet', 'Mobile'],
    implemented: true,
    priority: 8
  },
  {
    id: 'rec-9',
    category: 'interaction',
    title: 'Add Gesture Support',
    description: 'Implement swipe gestures for navigation and content interaction on touch devices.',
    impact: 'low',
    effort: 'high',
    breakpoints: ['Mobile', 'Tablet'],
    implemented: false,
    priority: 9
  },
  {
    id: 'rec-10',
    category: 'layout',
    title: 'Optimize Modal Behavior',
    description: 'Use full-screen modals on mobile devices for better user experience.',
    impact: 'medium',
    effort: 'low',
    breakpoints: ['Mobile'],
    implemented: true,
    priority: 10
  }
]

export function ResponsiveDesignRecommendations() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [recommendations, setRecommendations] = useState(RECOMMENDATIONS)

  const toggleImplementation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, implemented: !rec.implemented } : rec
      )
    )
  }

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'layout': return <Layout className="w-4 h-4" />
      case 'typography': return <Type className="w-4 h-4" />
      case 'interaction': return <Target className="w-4 h-4" />
      case 'performance': return <Monitor className="w-4 h-4" />
      case 'accessibility': return <Palette className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const implementedCount = recommendations.filter(r => r.implemented).length
  const totalCount = recommendations.length
  const completionPercentage = Math.round((implementedCount / totalCount) * 100)

  const categoryStats = {
    layout: recommendations.filter(r => r.category === 'layout'),
    typography: recommendations.filter(r => r.category === 'typography'),
    interaction: recommendations.filter(r => r.category === 'interaction'),
    performance: recommendations.filter(r => r.category === 'performance'),
    accessibility: recommendations.filter(r => r.category === 'accessibility')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Responsive Design Recommendations</h2>
          <p className="text-muted-foreground">
            Best practices and improvements for responsive design implementation
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Implementation Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm font-medium">{implementedCount}/{totalCount} ({completionPercentage}%)</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
              {Object.entries(categoryStats).map(([category, items]) => {
                const implemented = items.filter(i => i.implemented).length
                const percentage = items.length > 0 ? Math.round((implemented / items.length) * 100) : 0
                
                return (
                  <div key={category} className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      {getCategoryIcon(category)}
                      <span className="text-sm font-medium capitalize">{category}</span>
                    </div>
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-xs text-muted-foreground">
                      {implemented}/{items.length} implemented
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All ({recommendations.length})
        </Button>
        {Object.entries(categoryStats).map(([category, items]) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="flex items-center gap-1"
          >
            {getCategoryIcon(category)}
            <span className="capitalize">{category}</span>
            ({items.length})
          </Button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations
          .sort((a, b) => a.priority - b.priority)
          .map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className={`border-l-4 ${recommendation.implemented ? 'border-l-green-500' : 'border-l-blue-500'}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryIcon(recommendation.category)}
                    <CardTitle className="text-base">{recommendation.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {recommendation.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Impact:</span>
                      <div className={`w-2 h-2 rounded-full ${getImpactColor(recommendation.impact)}`} />
                      <span className="text-xs capitalize">{recommendation.impact}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Effort:</span>
                      <span className={`text-xs capitalize ${getEffortColor(recommendation.effort)}`}>
                        {recommendation.effort}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Breakpoints:</span>
                      <span className="text-xs">{recommendation.breakpoints.join(', ')}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant={recommendation.implemented ? "default" : "outline"}
                  onClick={() => toggleImplementation(recommendation.id)}
                  className="flex items-center gap-1 ml-4"
                >
                  {recommendation.implemented ? (
                    <>
                      <Check className="w-4 h-4" />
                      Implemented
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Not Implemented
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground">{recommendation.description}</p>
              
              {recommendation.implemented && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Implementation Complete</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    This recommendation has been successfully implemented and is active in the current design system.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Viewport Testing Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Responsive Testing Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test your responsive design across different devices and screen sizes:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Smartphone className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">Mobile Testing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    320px - 767px widths. Test touch interactions, navigation, and content priority.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Tablet className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">Tablet Testing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    768px - 1023px widths. Verify layout transitions and hybrid interactions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Monitor className="w-6 h-6 text-purple-500 mt-1" />
                <div>
                  <h4 className="font-medium">Desktop Testing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    1024px+ widths. Ensure optimal use of available space and hover states.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Testing Tips</h4>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    <li>• Use browser developer tools device simulation</li>
                    <li>• Test on actual devices when possible</li>
                    <li>• Verify touch target sizes on mobile</li>
                    <li>• Check text readability at all sizes</li>
                    <li>• Ensure critical actions remain accessible</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}