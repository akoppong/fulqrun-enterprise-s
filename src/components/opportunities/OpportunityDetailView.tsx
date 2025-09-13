import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, User, PEAK_STAGES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { OpportunityService } from '@/lib/opportunity-service';
import { MEDDPICCAssessment } from '@/components/meddpicc/MEDDPICCAssessment';
import { 
  ArrowLeft,
  PencilSimple,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Users,
  Building,
  Phone,
  EnvelopeSimple,
  MapPin,
  CheckCircle,
  Warning,
  Plus,
  Eye,
  Clock,
  ChartBar,
  Lightbulb,
  Star,
  Activity
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

interface OpportunityDetailViewProps {
  opportunityId: string;
  user: User;
  onBack: () => void;
  onEdit?: (opportunity: Opportunity) => void;
}

interface ActivityEntry {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'note';
  title: string;
  description: string;
  date: string;
  userId: string;
  outcome?: 'positive' | 'neutral' | 'negative';
}

export function OpportunityDetailView({ opportunityId, user, onBack, onEdit }: OpportunityDetailViewProps) {
  const [opportunities, setOpportunities] = useKV<Opportunity[]>('opportunities', []);
  const [companies, setCompanies] = useKV<Company[]>('companies', []);
  const [contacts, setContacts] = useKV<Contact[]>('contacts', []);
  const [allUsers, setAllUsers] = useKV<User[]>('all-users', []);
  const [activities, setActivities] = useKV<ActivityEntry[]>(`activities-${opportunityId}`, []);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [newActivity, setNewActivity] = useState({
    type: 'note' as ActivityEntry['type'],
    title: '',
    description: '',
    outcome: 'neutral' as ActivityEntry['outcome']
  });

  const opportunity = opportunities.find(opp => opp.id === opportunityId);
  const company = companies.find(c => c.id === opportunity?.companyId);
  const contact = contacts.find(c => c.id === opportunity?.contactId);
  const owner = allUsers.find(u => u.id === opportunity?.ownerId);

  if (!opportunity) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Opportunity not found</h3>
          <p className="text-muted-foreground mb-4">
            The requested opportunity could not be found.
          </p>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const meddpiccScore = getMEDDPICCScore(opportunity.meddpicc);
  const stageProgress = getStageProgress(opportunity.stage);
  const daysUntilClose = differenceInDays(new Date(opportunity.expectedCloseDate), new Date());
  const weightedValue = opportunity.value * opportunity.probability / 100;

  const handleAddActivity = async () => {
    if (!newActivity.title.trim()) {
      toast.error('Activity title is required');
      return;
    }

    const activity: ActivityEntry = {
      id: Date.now().toString(),
      type: newActivity.type,
      title: newActivity.title,
      description: newActivity.description,
      date: new Date().toISOString(),
      userId: user.id,
      outcome: newActivity.outcome
    };

    setActivities([activity, ...activities]);
    setNewActivity({
      type: 'note',
      title: '',
      description: '',
      outcome: 'neutral'
    });
    toast.success('Activity added successfully');
  };

  const getActivityIcon = (type: ActivityEntry['type']) => {
    const icons = {
      call: Phone,
      email: EnvelopeSimple,
      meeting: Users,
      demo: Eye,
      proposal: CheckCircle,
      note: PencilSimple
    };
    const Icon = icons[type];
    return <Icon className="w-4 h-4" />;
  };

  const getOutcomeColor = (outcome?: ActivityEntry['outcome']) => {
    const colors = {
      positive: 'text-green-600',
      neutral: 'text-gray-600',
      negative: 'text-red-600'
    };
    return colors[outcome || 'neutral'];
  };

  // Calculate PEAK stage scores
  const peakScores = {
    prospect: Math.min(100, meddpiccScore * 0.8 + 20),
    engage: Math.min(100, opportunity.probability * 0.9),
    acquire: opportunity.probability,
    keep: opportunity.stage === 'closed-won' ? 85 : 45
  };

  // AI Insights simulation
  const aiInsights = {
    riskFactors: [
      meddpiccScore < 50 ? 'Low MEDDPICC qualification score' : null,
      daysUntilClose < 7 ? 'Close date approaching rapidly' : null,
      activities.length === 0 ? 'No recent activity logged' : null,
      opportunity.probability < 30 ? 'Low win probability' : null
    ].filter(Boolean),
    recommendations: [
      'Schedule follow-up meeting with economic buyer',
      'Clarify decision criteria and timeline',
      'Identify potential competition',
      'Update opportunity stage based on recent progress'
    ],
    predictedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    confidenceLevel: meddpiccScore > 70 ? 'high' : meddpiccScore > 40 ? 'medium' : 'low'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{opportunity.title}</h1>
              <Badge className={
                opportunity.stage === 'closed-won' ? 'bg-green-100 text-green-800' :
                opportunity.stage === 'closed-lost' ? 'bg-red-100 text-red-800' :
                opportunity.stage === 'acquire' ? 'bg-purple-100 text-purple-800' :
                opportunity.stage === 'engage' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {opportunity.stage}
              </Badge>
              {opportunity.priority && (
                <Badge variant={
                  opportunity.priority === 'critical' ? 'destructive' :
                  opportunity.priority === 'high' ? 'default' :
                  'secondary'
                }>
                  {opportunity.priority} priority
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {company?.name || 'Unknown Company'}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {owner?.name || 'Unassigned'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Expected close: {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => onEdit?.(opportunity)}>
          <PencilSimple className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-bold">{formatCurrency(opportunity.value)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weighted Value</p>
                <p className="text-2xl font-bold">{formatCurrency(weightedValue)}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Probability</p>
                <p className="text-2xl font-bold">{opportunity.probability}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MEDDPICC Score</p>
                <p className="text-2xl font-bold">{meddpiccScore}%</p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="peak">PEAK Process</TabsTrigger>
          <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opportunity Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">
                      {opportunity.description || 'No description provided'}
                    </p>
                  </div>
                  
                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex gap-2 flex-wrap">
                        {opportunity.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Industry</h4>
                      <p className="text-muted-foreground">{opportunity.industry || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Lead Source</h4>
                      <p className="text-muted-foreground">{opportunity.leadSource || 'Not specified'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiInsights.riskFactors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                        <Warning className="w-4 h-4" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-1">
                        {aiInsights.riskFactors.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-red-500 rounded-full" />
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {aiInsights.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-medium mb-1">Predicted Close Date</h4>
                      <p className="text-muted-foreground">{aiInsights.predictedCloseDate}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Confidence Level</h4>
                      <Badge variant={
                        aiInsights.confidenceLevel === 'high' ? 'default' :
                        aiInsights.confidenceLevel === 'medium' ? 'secondary' :
                        'destructive'
                      }>
                        {aiInsights.confidenceLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact & Company Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {company ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">{company.industry}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <EnvelopeSimple className="w-4 h-4" />
                          {company.email || 'No email'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          {company.phone || 'No phone'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" />
                          {company.address || 'No address'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No company information available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Primary Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  {contact ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>
                            {contact.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">{contact.title}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <EnvelopeSimple className="w-4 h-4" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          {contact.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No primary contact assigned</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Owner Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {owner ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={owner.avatar} />
                          <AvatarFallback>
                            {owner.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{owner.name}</h3>
                          <p className="text-sm text-muted-foreground">{owner.role}</p>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <EnvelopeSimple className="w-4 h-4" />
                          {owner.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" />
                          {owner.territory || 'No territory'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No owner assigned</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="peak" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>PEAK Process Assessment</CardTitle>
              <p className="text-muted-foreground">
                Track progress through the PEAK methodology stages
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(peakScores).map(([stage, score]) => (
                  <div key={stage} className="text-center space-y-3">
                    <div className="mx-auto w-16 h-16 relative">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          className="text-muted"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - score / 100)}`}
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{score}%</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">{stage}</h3>
                      <p className="text-sm text-muted-foreground">
                        {stage === 'prospect' && 'Identify & Qualify'}
                        {stage === 'engage' && 'Build Relationships'}
                        {stage === 'acquire' && 'Close the Deal'}
                        {stage === 'keep' && 'Retain & Expand'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="font-medium">PEAK Stage Analysis</h3>
                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Current Stage: {opportunity.stage}</h4>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <Progress value={stageProgress} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {stageProgress < 50 ? 'Early stage activities needed' :
                       stageProgress < 80 ? 'Good progress, continue current activities' :
                       'Stage completion approaching, prepare for advancement'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meddpicc" className="mt-6">
          <MEDDPICCAssessment 
            opportunityId={opportunityId}
            readonly={user.role === 'rep' && opportunity.ownerId !== user.id}
          />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <div className="space-y-6">
            {/* Add New Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Add Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    value={newActivity.type} 
                    onValueChange={(value: ActivityEntry['type']) => 
                      setNewActivity({...newActivity, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={newActivity.outcome} 
                    onValueChange={(value: ActivityEntry['outcome']) => 
                      setNewActivity({...newActivity, outcome: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Input
                  placeholder="Activity title..."
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                />
                
                <Textarea
                  placeholder="Activity description..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  rows={3}
                />
                
                <Button onClick={handleAddActivity}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </CardContent>
            </Card>

            {/* Activities Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const activityUser = allUsers.find(u => u.id === activity.userId);
                      
                      return (
                        <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getOutcomeColor(activity.outcome)} bg-current/10`}>
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{activity.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(new Date(activity.date), 'MMM dd, HH:mm')}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{activity.type}</Badge>
                              <Badge variant={
                                activity.outcome === 'positive' ? 'default' :
                                activity.outcome === 'negative' ? 'destructive' :
                                'secondary'
                              }>
                                {activity.outcome}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                by {activityUser?.name || 'Unknown User'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No activities yet</h3>
                    <p className="text-muted-foreground">
                      Start logging activities to track progress on this opportunity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Related Contacts</CardTitle>
              <p className="text-muted-foreground">
                Key stakeholders involved in this opportunity
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Contact management coming soon</h3>
                <p className="text-muted-foreground">
                  This feature will allow you to manage all contacts related to this opportunity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Analytics</CardTitle>
              <p className="text-muted-foreground">
                Performance insights and progression tracking
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ChartBar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Analytics coming soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and insights for opportunity performance tracking.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}