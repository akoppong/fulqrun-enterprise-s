import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedOpportunityCreator } from './EnhancedOpportunityCreator';
import { Opportunity, User } from '@/lib/types';
import { Sparkles, Target, Brain, TrendingUp, Users, Building2, Zap } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface EnhancedOpportunityCreatorDemoProps {
  user: User;
}

export function EnhancedOpportunityCreatorDemo({ user }: EnhancedOpportunityCreatorDemoProps) {
  const [showCreator, setShowCreator] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const handleSave = (opportunity: Opportunity) => {
    console.log('Saved opportunity:', opportunity);
    toast.success(`Opportunity "${opportunity.title}" saved successfully!`);
    setShowCreator(false);
    setEditingOpportunity(null);
  };

  const handleCancel = () => {
    setShowCreator(false);
    setEditingOpportunity(null);
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'AI-Powered Insights',
      description: 'Real-time analysis and recommendations based on opportunity data',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Enhanced MEDDPICC Scoring',
      description: 'Comprehensive qualification with guided best practices',
      color: 'text-green-600 bg-green-50'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Predictive Analytics',
      description: 'Win probability and risk assessment with historical benchmarking',
      color: 'text-purple-600 bg-purple-50'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Relationship Mapping',
      description: 'Smart stakeholder management and influence tracking',
      color: 'text-orange-600 bg-orange-50'
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Company Intelligence',
      description: 'Industry insights and company-specific recommendations',
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-time Validation',
      description: 'Instant feedback and process optimization suggestions',
      color: 'text-yellow-600 bg-yellow-50'
    }
  ];

  if (showCreator) {
    return (
      <EnhancedOpportunityCreator
        user={user}
        onSave={handleSave}
        onCancel={handleCancel}
        editingOpportunity={editingOpportunity}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Enhanced Opportunity Creator</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Create opportunities with AI-powered insights, comprehensive MEDDPICC qualification, 
          and intelligent recommendations for better sales outcomes.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Brain className="w-4 h-4 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Target className="w-4 h-4 mr-1" />
            MEDDPICC Qualified
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            Predictive Analytics
          </Badge>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Key Benefits
          </CardTitle>
          <CardDescription className="text-base">
            Why choose the Enhanced Opportunity Creator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                Improved Qualification
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Comprehensive MEDDPICC assessment with guidance</li>
                <li>• Real-time scoring and validation</li>
                <li>• Best practice recommendations</li>
                <li>• Risk factor identification</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600 border-blue-600">⚡</Badge>
                AI-Driven Intelligence
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Intelligent insights and recommendations</li>
                <li>• Predictive win probability analysis</li>
                <li>• Industry-specific guidance</li>
                <li>• Competitive positioning advice</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-purple-600 border-purple-600">📊</Badge>
                Enhanced Analytics
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Historical benchmarking</li>
                <li>• Deal risk assessment</li>
                <li>• Timeline optimization</li>
                <li>• Value maximization insights</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline" className="text-orange-600 border-orange-600">🎯</Badge>
                Better Outcomes
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Higher win rates</li>
                <li>• Shorter sales cycles</li>
                <li>• Improved forecast accuracy</li>
                <li>• Reduced deal slippage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => setShowCreator(true)}
            className="text-lg px-8 py-6"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create New Opportunity
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              // Demo opportunity for editing
              const demoOpportunity: Opportunity = {
                id: 'demo-opp',
                title: 'Enterprise Software License Demo',
                description: 'Demo opportunity for testing enhanced creation features',
                value: 250000,
                stage: 'engage',
                priority: 'high',
                probability: 65,
                companyId: 'comp-1',
                contactId: 'contact-1',
                expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                tags: ['enterprise', 'software', 'demo'],
                assignedTo: user.id,
                createdBy: user.id,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(),
                meddpicc: {
                  metrics: 7.5,
                  economicBuyer: 6.0,
                  decisionCriteria: 8.0,
                  decisionProcess: 5.5,
                  paperProcess: 4.0,
                  identifyPain: 8.5,
                  champion: 7.0,
                  competition: 6.5,
                  score: 6.625,
                  notes: 'Demo MEDDPICC data for testing',
                  lastUpdated: new Date()
                }
              };
              setEditingOpportunity(demoOpportunity);
              setShowCreator(true);
            }}
            className="text-lg px-8 py-6"
          >
            <Target className="w-5 h-5 mr-2" />
            Edit Demo Opportunity
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Experience the next generation of opportunity management with AI-powered insights
        </p>
      </div>
    </div>
  );
}