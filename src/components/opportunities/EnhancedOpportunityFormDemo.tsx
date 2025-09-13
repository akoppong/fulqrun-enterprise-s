import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedNewOpportunityForm } from './EnhancedNewOpportunityForm';
import { User, Opportunity } from '@/lib/types';
import { Plus, Target, CheckCircle, TrendingUp, DollarSign } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface EnhancedOpportunityFormDemoProps {
  user: User;
}

export function EnhancedOpportunityFormDemo({ user }: EnhancedOpportunityFormDemoProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [createdCount, setCreatedCount] = useState(0);

  // Sample opportunity for editing demo
  const sampleOpportunity: Opportunity = {
    id: 'demo-opportunity-1',
    title: 'Enterprise Software License',
    description: 'Multi-year software licensing deal with enterprise features',
    companyId: 'company-1',
    contactId: 'contact-1',
    value: 250000,
    stage: 'engage',
    probability: 75,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ownerId: user.id,
    priority: 'high',
    industry: 'Technology',
    leadSource: 'Referral',
    tags: ['enterprise', 'high-value', 'multi-year'],
    meddpicc: {
      metrics: 'Cost reduction by 30%',
      economicBuyer: 'John Smith, CTO',
      decisionCriteria: 'Technical capabilities and ROI',
      decisionProcess: 'Technical evaluation followed by executive approval',
      paperProcess: 'Standard procurement process',
      implicatePain: 'Legacy system maintenance costs',
      champion: 'John Smith advocating internally',
      score: 75
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleCreateSuccess = (opportunity: Opportunity) => {
    console.log('✅ Opportunity created:', opportunity);
    setCreatedCount(prev => prev + 1);
    toast.success(`Opportunity "${opportunity.title}" created successfully!`);
  };

  const handleUpdateSuccess = (opportunity: Opportunity) => {
    console.log('✅ Opportunity updated:', opportunity);
    toast.success(`Opportunity "${opportunity.title}" updated successfully!`);
  };

  const handleEditDemo = () => {
    setEditingOpportunity(sampleOpportunity);
    setShowEditForm(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          Enhanced Opportunity Form Demo
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Test the enhanced opportunity creation and editing form with comprehensive validation, 
          real-time feedback, and improved user experience.
        </p>
      </div>

      {/* Demo Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-2xl font-bold">{createdCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enhanced Features</p>
                <p className="text-lg font-semibold">10+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress Tracking</p>
                <p className="text-lg font-semibold">Real-time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sample Value</p>
                <p className="text-lg font-semibold">$250K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create New Opportunity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test the form with comprehensive validation, real-time feedback, and progress tracking.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Features to test:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time validation with error/warning indicators</li>
                <li>• Form completion progress tracking</li>
                <li>• Smart company-contact relationships</li>
                <li>• Duplicate opportunity detection</li>
                <li>• Enhanced field validation (dates, values, etc.)</li>
                <li>• Tag management system</li>
                <li>• Unsaved changes warning</li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Opportunity
            </Button>
          </CardContent>
        </Card>

        {/* Edit Existing Opportunity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Edit Sample Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Test editing with pre-populated data and see how the form handles existing values.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Sample opportunity details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Title: Enterprise Software License</li>
                <li>• Value: $250,000</li>
                <li>• Stage: Engage</li>
                <li>• Probability: 75%</li>
                <li>• Industry: Technology</li>
                <li>• Priority: High</li>
              </ul>
            </div>
            <Button 
              onClick={handleEditDemo}
              variant="outline"
              className="w-full"
            >
              <Target className="h-4 w-4 mr-2" />
              Edit Sample Opportunity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Form Features */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Form Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Validation & Feedback
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Real-time field validation</li>
                <li>• Error and warning differentiation</li>
                <li>• Progress completion tracking</li>
                <li>• Visual validation summary</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Smart Relationships
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Company-contact validation</li>
                <li>• Auto-filter contacts by company</li>
                <li>• Duplicate opportunity detection</li>
                <li>• Business rule enforcement</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Enhanced UX
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Responsive multi-column layout</li>
                <li>• Tag management system</li>
                <li>• Unsaved changes protection</li>
                <li>• Industry and source dropdowns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms */}
      <EnhancedNewOpportunityForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSave={handleCreateSuccess}
        user={user}
      />

      <EnhancedNewOpportunityForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingOpportunity(null);
        }}
        onSave={handleUpdateSuccess}
        editingOpportunity={editingOpportunity}
        user={user}
      />
    </div>
  );
}