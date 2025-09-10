import { useState } from 'react';
import { useOpportunity } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/crm-utils';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft,
  Target, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  TrendUp, 
  Brain,
  PencilSimple,
  Phone,
  EnvelopeSimple,
  ChartLineUp,
  Clock,
  CheckCircle,
  WarningCircle,
  Info,
  Users,
  Note,
  CalendarCheck
} from '@phosphor-icons/react';

interface OpportunityDetailViewProps {
  opportunityId: string;
  onBack: () => void;
  onEdit: () => void;
}

export function OpportunityDetailView({ 
  opportunityId, 
  onBack, 
  onEdit 
}: OpportunityDetailViewProps) {
  const { opportunity, analytics, loading, error } = useOpportunity(opportunityId);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {error || 'Opportunity not found'}
      </div>
    );
  }

  const { company, contact } = opportunity;

  const getStageColor = (stage: string) => {
    const stageColors = {
      'prospect': 'bg-blue-100 text-blue-700',
      'engage': 'bg-yellow-100 text-yellow-700',
      'acquire': 'bg-orange-100 text-orange-700',
      'keep': 'bg-green-100 text-green-700',
      'closed-won': 'bg-green-100 text-green-700',
      'closed-lost': 'bg-red-100 text-red-700'
    };
    return stageColors[stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-blue-100 text-blue-700',
      'high': 'bg-orange-100 text-orange-700',
      'critical': 'bg-red-100 text-red-700'
    };
    return priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-100 text-gray-700';
  };

  const getDealHealth = () => {
    if (analytics?.dealHealth === 'healthy') return { label: '99%', color: 'text-green-600', icon: CheckCircle };
    if (analytics?.dealHealth === 'at-risk') return { label: '45%', color: 'text-yellow-600', icon: WarningCircle };
    if (analytics?.dealHealth === 'critical') return { label: '1%', color: 'text-red-600', icon: WarningCircle };
    return { label: 'N/A', color: 'text-gray-500', icon: Info };
  };

  const dealHealth = getDealHealth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>
      </div>

      {/* Opportunity Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{opportunity.title}</h1>
              <Badge className={cn("px-2 py-1", getStageColor(opportunity.stage))}>
                {opportunity.stage}
              </Badge>
              <Badge className={cn("px-2 py-1", getPriorityColor(opportunity.priority || 'medium'))}>
                {opportunity.priority || 'medium'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              {company && (
                <span className="flex items-center gap-1">
                  <Building size={16} />
                  {company.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Created {formatCreatedDate(opportunity.createdAt)}
              </span>
            </div>
          </div>
          
          <Button onClick={onEdit} className="flex items-center gap-2">
            <PencilSimple size={16} />
            Edit
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deal Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(opportunity.value)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign size={24} className="text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Win Probability</p>
                  <p className="text-2xl font-bold">{opportunity.probability}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Target size={24} className="text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deal Health</p>
                  <p className={cn("text-2xl font-bold", dealHealth.color)}>{dealHealth.label}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <ChartLineUp size={24} className="text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expected Close</p>
                  <p className="text-2xl font-bold">{formatDate(opportunity.expectedCloseDate)}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <CalendarCheck size={24} className="text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="peak">PEAK</TabsTrigger>
          <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opportunity Details */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stage</p>
                    <Badge className={cn("mt-1", getStageColor(opportunity.stage))}>
                      {opportunity.stage}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <Badge className={cn("mt-1", getPriorityColor(opportunity.priority || 'medium'))}>
                      {opportunity.priority || 'medium'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Source</p>
                    <p className="mt-1">{opportunity.leadSource || 'Not Specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Industry</p>
                    <p className="mt-1">{opportunity.industry || 'Not Specified'}</p>
                  </div>
                </div>

                {opportunity.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm">{opportunity.description}</p>
                  </div>
                )}

                {opportunity.tags && opportunity.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {opportunity.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Contact</CardTitle>
              </CardHeader>
              <CardContent>
                {contact ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                        <p className="text-sm text-muted-foreground">{contact.title}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <EnvelopeSimple size={16} className="text-muted-foreground" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-muted-foreground" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Role</p>
                      <Badge variant="outline" className="mt-1">{contact.role}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No primary contact assigned</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ChartLineUp size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No activities recorded</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PEAK Methodology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">PEAK methodology scoring will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meddpicc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MEDDPICC Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Metrics</h4>
                  <p className="text-sm">{opportunity.meddpicc.metrics || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Economic Buyer</h4>
                  <p className="text-sm">{opportunity.meddpicc.economicBuyer || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Decision Criteria</h4>
                  <p className="text-sm">{opportunity.meddpicc.decisionCriteria || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Decision Process</h4>
                  <p className="text-sm">{opportunity.meddpicc.decisionProcess || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Paper Process</h4>
                  <p className="text-sm">{opportunity.meddpicc.paperProcess || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Implicate Pain</h4>
                  <p className="text-sm">{opportunity.meddpicc.implicatePain || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Champion</h4>
                  <p className="text-sm">{opportunity.meddpicc.champion || 'Not specified'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">MEDDPICC Score</h4>
                  <p className="text-sm text-muted-foreground">Overall qualification score</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{opportunity.meddpicc.score}%</div>
                  <Progress value={opportunity.meddpicc.score} className="w-24 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Note size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No activities recorded</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No additional contacts</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold mb-1">{analytics.score}%</div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold mb-1 capitalize">{analytics.dealHealth}</div>
                      <div className="text-sm text-muted-foreground">Deal Health</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold mb-1">{analytics.confidenceLevel}%</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                  </div>

                  {analytics.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Risk Factors</h4>
                      <ul className="space-y-2">
                        {analytics.riskFactors.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <WarningCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analytics.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {analytics.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}