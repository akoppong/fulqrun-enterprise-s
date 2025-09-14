import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  CheckCircle, 
  TrendingUp,
  Users,
  Clock,
  Star,
  Award,
  Zap,
  Eye,
  Play
} from '@phosphor-icons/react';
import { QualificationAssessmentHub } from './QualificationAssessmentHub';
import { PipelineQualificationTracker } from './PipelineQualificationTracker';

export function QualificationDemo() {
  const [currentView, setCurrentView] = useState<'overview' | 'hub' | 'tracker'>('overview');

  const features = [
    {
      icon: Target,
      title: 'Complete MEDDPICC Assessments',
      description: 'Guided qualification process covering all 8 MEDDPICC pillars with intelligent scoring',
      benefits: ['Standardized qualification', 'Risk assessment', 'Coaching recommendations']
    },
    {
      icon: TrendingUp,
      title: 'Pipeline Health Tracking',
      description: 'Monitor qualification status across your entire sales pipeline',
      benefits: ['Portfolio overview', 'Risk identification', 'Performance metrics']
    },
    {
      icon: CheckCircle,
      title: 'Quick Qualification',
      description: 'Rapid 8-question assessment for fast opportunity evaluation',
      benefits: ['5-minute assessment', 'Instant scoring', 'Priority actions']
    },
    {
      icon: Star,
      title: 'AI-Powered Insights',
      description: 'Intelligent recommendations based on qualification patterns',
      benefits: ['Smart coaching', 'Competitive insights', 'Stage readiness']
    }
  ];

  const stats = [
    { label: 'Qualification Pillars', value: '8', icon: Target },
    { label: 'Assessment Types', value: '2', icon: CheckCircle },
    { label: 'Risk Levels', value: '4', icon: TrendingUp },
    { label: 'Coaching Actions', value: '25+', icon: Star }
  ];

  if (currentView === 'hub') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Qualification Assessment Demo</h1>
            <p className="text-muted-foreground">Experience the complete qualification hub</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('overview')}>
            Back to Overview
          </Button>
        </div>
        <QualificationAssessmentHub />
      </div>
    );
  }

  if (currentView === 'tracker') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline Qualification Demo</h1>
            <p className="text-muted-foreground">Experience the pipeline tracking system</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('overview')}>
            Back to Overview
          </Button>
        </div>
        <PipelineQualificationTracker />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Target size={48} className="text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Sales Qualification System</h1>
            <p className="text-xl text-muted-foreground">Complete MEDDPICC assessment and pipeline tracking</p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground">
            Standardize your sales qualification process with comprehensive MEDDPICC assessments, 
            real-time pipeline health monitoring, and AI-powered coaching recommendations.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <stat.icon size={32} className="mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <feature.icon size={24} className="text-primary" />
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{feature.description}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Key Benefits:</p>
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Demo Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target size={24} className="text-blue-600" />
              Qualification Assessment Hub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Experience the complete qualification assessment system with pipeline overview, 
              filtering, and guided MEDDPICC evaluations.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50">
                <Users size={12} className="mr-1" />
                Pipeline Overview
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle size={12} className="mr-1" />
                MEDDPICC Assessment
              </Badge>
              <Badge variant="outline" className="bg-purple-50">
                <Star size={12} className="mr-1" />
                AI Insights
              </Badge>
            </div>
            <Button onClick={() => setCurrentView('hub')} className="w-full">
              <Play size={16} className="mr-2" />
              Launch Qualification Hub
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp size={24} className="text-green-600" />
              Pipeline Qualification Tracker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Monitor qualification status across your entire pipeline with health metrics, 
              risk assessment, and quick assessment tools.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-orange-50">
                <TrendingUp size={12} className="mr-1" />
                Health Metrics
              </Badge>
              <Badge variant="outline" className="bg-red-50">
                <Clock size={12} className="mr-1" />
                Risk Tracking
              </Badge>
              <Badge variant="outline" className="bg-yellow-50">
                <Zap size={12} className="mr-1" />
                Quick Assessment
              </Badge>
            </div>
            <Button onClick={() => setCurrentView('tracker')} className="w-full">
              <Eye size={16} className="mr-2" />
              View Pipeline Tracker
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Process Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Award size={24} className="text-yellow-600" />
            Qualification Process Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-medium">Select Opportunity</h3>
              <p className="text-sm text-muted-foreground">Choose from pipeline or start new assessment</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-medium">Complete Assessment</h3>
              <p className="text-sm text-muted-foreground">Answer guided MEDDPICC questions with confidence levels</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-medium">Review Insights</h3>
              <p className="text-sm text-muted-foreground">Get AI-powered recommendations and risk analysis</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-medium">Take Action</h3>
              <p className="text-sm text-muted-foreground">Execute coaching recommendations and track progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}