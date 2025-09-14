import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Target, TrendingUp, AlertTriangle, CheckCircle, Brain, Zap, LineChart } from '@phosphor-icons/react';
import { Opportunity, User, Company, Contact, MEDDPICC } from '@/lib/types';
import { OpportunityService } from '@/lib/opportunity-service';
import { CompanyContactService } from '@/lib/company-contact-service';
import { aiInsightsEngine, AIInsight } from '@/lib/ai-insights-engine';
import { EnhancedMEDDPICCScoring } from './EnhancedMEDDPICCScoring';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';

interface EnhancedOpportunityCreatorProps {
  user: User;
  onSave: (opportunity: Opportunity) => void;
  onCancel: () => void;
  editingOpportunity?: Opportunity | null;
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'risk';
  category: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  impact?: string;
  source: string;
}

const STAGES = [
  'prospect',
  'qualify',
  'engage',
  'propose',
  'negotiate',
  'closed-won',
  'closed-lost'
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' }
];

export function EnhancedOpportunityCreator({ 
  user, 
  onSave, 
  onCancel, 
  editingOpportunity 
}: EnhancedOpportunityCreatorProps) {
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  
  // Initialize sample data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await CompanyContactService.initializeSampleData();
        const loadedCompanies = await CompanyContactService.getAllCompanies();
        const loadedContacts = await CompanyContactService.getAllContacts();
        setCompanies(loadedCompanies);
        setContacts(loadedContacts);
      } catch (error) {
        console.error('Error initializing company/contact data:', error);
      }
    };

    if (companies.length === 0 || contacts.length === 0) {
      initializeData();
    }
  }, [companies.length, contacts.length, setCompanies, setContacts]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    description: '',
    value: 0,
    stage: 'prospect',
    priority: 'medium',
    probability: 50,
    companyId: '',
    contactId: '',
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: [],
    assignedTo: user.id,
    meddpicc: {
      metrics: 0,
      economicBuyer: 0,
      decisionCriteria: 0,
      decisionProcess: 0,
      paperProcess: 0,
      identifyPain: 0,
      champion: 0,
      competition: 0,
      score: 0,
      notes: '',
      lastUpdated: new Date()
    }
  });

  // AI and analytics state
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentTab, setCurrentTab] = useState('basics');

  // Initialize form data for editing
  useEffect(() => {
    if (editingOpportunity) {
      setFormData({
        ...editingOpportunity,
        expectedCloseDate: new Date(editingOpportunity.expectedCloseDate).toISOString().split('T')[0]
      });
    }
  }, [editingOpportunity]);

  // Generate AI insights when form data changes
  const generateAIInsights = useCallback(async () => {
    if (!formData.title || !formData.companyId || !formData.value) return;

    setIsAnalyzing(true);
    try {
      // Get historical data for benchmarking
      const historicalData = OpportunityService.getAllOpportunities();
      
      // Generate comprehensive AI insights
      const insights = await aiInsightsEngine.generateInsights(
        formData,
        companies,
        contacts,
        user,
        historicalData
      );

      setAiInsights(insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fallback to basic insights
      const basicInsights: AIInsight[] = [];
      
      if (formData.value && formData.value > 100000) {
        basicInsights.push({
          id: 'high-value-fallback',
          type: 'opportunity',
          category: 'value',
          title: 'High-Value Deal',
          description: 'This is a high-value opportunity. Consider involving senior stakeholders and ensuring comprehensive qualification.',
          confidence: 85,
          priority: 'high',
          action: 'Schedule executive briefing',
          source: 'fallback-analyzer'
        });
      }

      setAiInsights(basicInsights);
    } finally {
      setIsAnalyzing(false);
    }
  }, [formData, companies, contacts, user]);

  // Generate insights when key data changes
  useEffect(() => {
    const timeoutId = setTimeout(generateAIInsights, 1000);
    return () => clearTimeout(timeoutId);
  }, [generateAIInsights]);

  const handleInputChange = (field: keyof Opportunity, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMeddpiccChange = (meddpicc: MEDDPICC) => {
    setFormData(prev => ({ ...prev, meddpicc }));
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.companyId) {
        toast.error('Please fill in required fields');
        return;
      }

      const opportunityData: Partial<Opportunity> = {
        ...formData,
        id: editingOpportunity?.id || `opp-${Date.now()}`,
        expectedCloseDate: new Date(formData.expectedCloseDate || new Date()),
        createdAt: editingOpportunity?.createdAt || new Date(),
        updatedAt: new Date(),
        createdBy: editingOpportunity?.createdBy || user.id,
        tags: formData.tags || []
      };

      let savedOpportunity: Opportunity;
      if (editingOpportunity) {
        savedOpportunity = await OpportunityService.updateOpportunity(
          editingOpportunity.id,
          opportunityData
        ) as Opportunity;
      } else {
        savedOpportunity = await OpportunityService.createOpportunity(opportunityData) as Opportunity;
      }

      onSave(savedOpportunity);
      toast.success(editingOpportunity ? 'Opportunity updated' : 'Opportunity created');
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast.error('Failed to save opportunity');
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'risk': return <Target className="w-4 h-4" />;
    }
  };

  const getInsightColor = (insight: AIInsight) => {
    const typeColors = {
      recommendation: 'border-blue-200 bg-blue-50',
      warning: 'border-yellow-200 bg-yellow-50',
      opportunity: 'border-green-200 bg-green-50',
      risk: 'border-red-200 bg-red-50'
    };
    
    const priorityColors = {
      critical: 'border-red-300 bg-red-100',
      high: 'border-orange-200 bg-orange-50',
      medium: typeColors[insight.type],
      low: 'border-gray-200 bg-gray-50'
    };
    
    return priorityColors[insight.priority] || typeColors[insight.type];
  };

  const getMeddpiccColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredContacts = contacts.filter(contact => 
    formData.companyId ? contact.companyId === formData.companyId : true
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h1>
          <p className="text-muted-foreground">
            Enhanced with AI insights and MEDDPICC qualification scoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {editingOpportunity ? 'Update' : 'Create'} Opportunity
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Core opportunity details and key stakeholders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Opportunity Title *</Label>
                      <Input
                        id="title"
                        value={formData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Enterprise Software License"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="value">Deal Value *</Label>
                      <Input
                        id="value"
                        type="number"
                        value={formData.value || ''}
                        onChange={(e) => handleInputChange('value', Number(e.target.value))}
                        placeholder="250000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Select
                        value={formData.companyId || ''}
                        onValueChange={(value) => handleInputChange('companyId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact">Primary Contact</Label>
                      <Select
                        value={formData.contactId || ''}
                        onValueChange={(value) => handleInputChange('contactId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.name} - {contact.role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the opportunity, customer needs, and solution..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Details</CardTitle>
                  <CardDescription>
                    Sales process and timeline information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stage">Stage</Label>
                      <Select
                        value={formData.stage || 'prospect'}
                        onValueChange={(value) => handleInputChange('stage', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority || 'medium'}
                        onValueChange={(value) => handleInputChange('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                                {priority.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="probability">
                        Win Probability ({formData.probability || 50}%)
                      </Label>
                      <div className="px-2">
                        <input
                          type="range"
                          id="probability"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.probability || 50}
                          onChange={(e) => handleInputChange('probability', Number(e.target.value))}
                          className="w-full"
                        />
                        <Progress value={formData.probability || 50} className="mt-2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="closeDate">Expected Close Date</Label>
                      <Input
                        id="closeDate"
                        type="date"
                        value={formData.expectedCloseDate || ''}
                        onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meddpicc" className="space-y-6">
              <EnhancedMEDDPICCScoring
                meddpicc={formData.meddpicc!}
                onChange={handleMeddpiccChange}
                opportunityValue={formData.value}
                companyName={companies.find(c => c.id === formData.companyId)?.name}
                readonly={false}
              />
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI-Powered Insights
                    {isAnalyzing && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    Intelligent recommendations based on opportunity data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {aiInsights.length > 0 ? (
                        aiInsights.map((insight, index) => (
                          <Alert key={insight.id || index} className={getInsightColor(insight)}>
                            <div className="flex items-start gap-3">
                              {getInsightIcon(insight.type)}
                              <div className="flex-1">
                                <AlertTitle className="flex items-center justify-between">
                                  {insight.title}
                                  <div className="flex gap-2">
                                    <Badge variant="secondary">
                                      {insight.confidence}% confidence
                                    </Badge>
                                    <Badge 
                                      variant={
                                        insight.priority === 'critical' ? 'destructive' :
                                        insight.priority === 'high' ? 'default' : 'secondary'
                                      }
                                    >
                                      {insight.priority}
                                    </Badge>
                                  </div>
                                </AlertTitle>
                                <AlertDescription className="mt-2">
                                  {insight.description}
                                  {insight.action && (
                                    <div className="mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        <Zap className="w-3 h-3 mr-1" />
                                        {insight.action}
                                      </Badge>
                                    </div>
                                  )}
                                  {insight.impact && (
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      Impact: {insight.impact}
                                    </div>
                                  )}
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    Source: {insight.source}
                                  </div>
                                </AlertDescription>
                              </div>
                            </div>
                          </Alert>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Fill in opportunity details to get AI insights</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Deal Value</span>
                  <span className="font-semibold">
                    ${(formData.value || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Win Probability</span>
                  <span className="font-semibold">{formData.probability || 50}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expected Value</span>
                  <span className="font-semibold">
                    ${Math.round((formData.value || 0) * (formData.probability || 50) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>MEDDPICC Score</span>
                  <span className={`font-semibold ${getMeddpiccColor(formData.meddpicc?.score || 0)}`}>
                    {(formData.meddpicc?.score || 0).toFixed(1)}/10
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations Summary */}
          {aiInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="text-xs p-2 rounded bg-muted">
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-muted-foreground truncate">
                        {insight.description}
                      </div>
                    </div>
                  ))}
                  {aiInsights.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{aiInsights.length - 3} more insights in AI tab
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}