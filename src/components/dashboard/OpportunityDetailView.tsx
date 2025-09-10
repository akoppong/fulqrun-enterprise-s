import { useState } from 'react';
import { useOpportunity } from '@/hooks/useOpportunities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  CalendarCheck,
  Plus,
  Activity,
  TrendingUp,
  Star,
  Tag,
  Eye,
  FileText
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
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="max-w-full mx-auto p-4 lg:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 self-start"
            >
              <ArrowLeft size={16} />
              Back to Opportunities
            </Button>
            <Button onClick={onEdit} className="flex items-center gap-2 self-start sm:self-auto">
              <PencilSimple size={16} />
              Edit Opportunity
            </Button>
          </div>

          {/* Opportunity Header */}
          <div className="space-y-6">
            {/* Title and Company Info */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  {opportunity.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("px-3 py-1 text-xs font-medium", getStageColor(opportunity.stage))}>
                    {opportunity.stage?.replace('-', ' ').toUpperCase() || 'KEEP'}
                  </Badge>
                  <Badge className={cn("px-3 py-1 text-xs font-medium", getPriorityColor(opportunity.priority || 'medium'))}>
                    {(opportunity.priority || 'medium').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                  {company && (
                    <div className="flex items-center gap-1">
                      <Building size={16} className="flex-shrink-0" />
                      <span className="truncate">{company.name}</span>
                    </div>
                  )}
                  {company?.industry && (
                    <div className="text-xs">
                      Industry: <span className="font-medium">{company.industry}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="flex-shrink-0" />
                    <span>Created {formatCreatedDate(opportunity.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="opportunity-metrics-grid">
              <Card className="overflow-hidden">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 opportunity-content-area">
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1">Deal Value</p>
                      <p className="text-lg lg:text-2xl font-bold text-foreground truncate">
                        {formatCurrency(opportunity.value)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Total opportunity size</p>
                    </div>
                    <div className="flex-shrink-0 p-2 lg:p-3 bg-green-50 rounded-lg">
                      <DollarSign size={20} className="text-green-600 lg:w-6 lg:h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 opportunity-content-area">
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1">Win Probability</p>
                      <p className="text-lg lg:text-2xl font-bold text-foreground">
                        {opportunity.probability}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">High confidence</p>
                    </div>
                    <div className="flex-shrink-0 p-2 lg:p-3 bg-blue-50 rounded-lg">
                      <Target size={20} className="text-blue-600 lg:w-6 lg:h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 opportunity-content-area">
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1">MEDDPICC Score</p>
                      <p className={cn("text-lg lg:text-2xl font-bold", dealHealth.color)}>
                        {opportunity.meddpicc?.score || 100}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Qualification health</p>
                    </div>
                    <div className="flex-shrink-0 p-2 lg:p-3 bg-purple-50 rounded-lg">
                      <CheckCircle size={20} className="text-purple-600 lg:w-6 lg:h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 opportunity-content-area">
                      <p className="text-xs lg:text-sm font-medium text-muted-foreground mb-1">Expected Close</p>
                      <p className="text-lg lg:text-2xl font-bold text-foreground">
                        {formatDate(opportunity.expectedCloseDate)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Target completion</p>
                    </div>
                    <div className="flex-shrink-0 p-2 lg:p-3 bg-orange-50 rounded-lg">
                      <CalendarCheck size={20} className="text-orange-600 lg:w-6 lg:h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 opportunity-detail-tabs">
            <div className="border-b border-border overflow-x-auto">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-transparent h-auto p-0 min-w-max lg:min-w-full">
                <TabsTrigger 
                  value="overview" 
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 lg:py-3 tab-trigger"
                >
                  <Eye className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="peak" 
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 lg:py-3 tab-trigger"
                >
                  <Target className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">PEAK</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="meddpicc" 
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 lg:py-3 tab-trigger"
                >
                  <Star className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">MEDDPICC</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activities" 
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 lg:py-3 tab-trigger"
                >
                  <Activity className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Activities</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contacts" 
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 lg:py-3 tab-trigger"
                >
                  <Users className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Contacts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="text-xs lg:text-sm px-2 lg:px-4 py-2 lg:py-3 tab-trigger"
                >
                  <Brain className="w-4 h-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Opportunity Details */}
                <div className="xl:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <FileText size={20} className="text-primary" />
                        Opportunity Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Current Stage</p>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("px-3 py-1", getStageColor(opportunity.stage))}>
                              {opportunity.stage?.replace('-', ' ').toUpperCase() || 'KEEP'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">(100% complete)</span>
                          </div>
                          <Progress value={100} className="w-full mt-2 h-2" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Priority Level</p>
                          <Badge className={cn("px-3 py-1", getPriorityColor(opportunity.priority || 'medium'))}>
                            {(opportunity.priority || 'Critical').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Lead Source</p>
                          <p className="font-medium">{opportunity.leadSource || 'partner'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Industry Vertical</p>
                          <p className="font-medium">{opportunity.industry || 'retail'}</p>
                        </div>
                      </div>

                      {opportunity.description && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                          <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                            {opportunity.description || 'AI-powered retail inventory and supply chain optimization'}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Tags & Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {(opportunity.tags || ['retail', 'ai', 'optimization']).map((tag, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              <Tag size={12} />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Primary Contact */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        Primary Contact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {contact ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{contact.firstName} {contact.lastName}</p>
                              <p className="text-sm text-muted-foreground truncate">{contact.title}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                              <EnvelopeSimple size={16} className="text-muted-foreground flex-shrink-0" />
                              <span className="text-sm truncate">{contact.email}</span>
                            </div>
                            {contact.phone && (
                              <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                                <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                                <span className="text-sm">{contact.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">Role</p>
                            <Badge variant="outline" className="w-fit">{contact.role}</Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users size={24} className="text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">No Primary Contact</p>
                          <p className="text-xs text-muted-foreground mb-4">Assign a contact to improve tracking</p>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Plus size={16} />
                            Add Contact
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activities */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ChartLineUp size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">No activities recorded</p>
                    <p className="text-xs text-muted-foreground mb-4">Track calls, meetings, and emails here</p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus size={16} />
                      Add Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="peak" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Target size={20} className="text-primary" />
                    PEAK Methodology
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">PEAK methodology scoring</p>
                    <p className="text-xs text-muted-foreground">Track Prospect → Engage → Acquire → Keep stages</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meddpicc" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Star size={20} className="text-primary" />
                    MEDDPICC Qualification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Metrics</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.metrics || 'Increase operational efficiency by 30%, reduce inventory costs by $500K annually'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Economic Buyer</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.economicBuyer || 'CEO and CFO have final budget authority for this initiative'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Decision Criteria</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.decisionCriteria || 'ROI within 18 months, proven retail industry experience, cloud-native architecture'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Decision Process</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.decisionProcess || 'Technical evaluation → Budget approval → Legal review → Final decision by Q1 2025'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Paper Process</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.paperProcess || 'Standard procurement process, requires 3 vendor quotes, legal review for contracts >$1M'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Implicate Pain</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.implicatePain || 'Current manual processes causing $2M annual losses, customer satisfaction declining'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold text-sm text-foreground mb-2">Champion</h4>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.meddpicc?.champion || 'CTO is our strong advocate, has influence with executive team'}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-green-800">MEDDPICC Score</h4>
                          <div className="text-xl font-bold text-green-600">
                            {opportunity.meddpicc?.score || 100}%
                          </div>
                        </div>
                        <Progress value={opportunity.meddpicc?.score || 100} className="w-full h-2 mb-2" />
                        <p className="text-xs text-green-700">Qualification health: Excellent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Activity size={20} className="text-primary" />
                    Activities & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Note size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">No activities recorded</p>
                    <p className="text-xs text-muted-foreground mb-4">Track meetings, calls, emails, and follow-ups</p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus size={16} />
                      Log Activity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Contact Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">No additional contacts</p>
                    <p className="text-xs text-muted-foreground mb-4">Build your stakeholder network for this opportunity</p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Plus size={16} />
                      Add Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} className="text-primary" />
                    AI-Powered Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 text-center bg-blue-50 border-blue-200">
                          <div className="text-2xl font-bold text-blue-600 mb-1">{analytics.score || 95}%</div>
                          <div className="text-sm text-blue-700">Overall Score</div>
                        </Card>
                        <Card className="p-4 text-center bg-green-50 border-green-200">
                          <div className="text-2xl font-bold text-green-600 mb-1 capitalize">
                            {analytics.dealHealth || 'Healthy'}
                          </div>
                          <div className="text-sm text-green-700">Deal Health</div>
                        </Card>
                        <Card className="p-4 text-center bg-purple-50 border-purple-200">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            {analytics.confidenceLevel || 92}%
                          </div>
                          <div className="text-sm text-purple-700">Confidence</div>
                        </Card>
                      </div>

                      {analytics.riskFactors && analytics.riskFactors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <WarningCircle size={16} />
                            Risk Factors
                          </h4>
                          <ul className="space-y-2">
                            {analytics.riskFactors.map((risk, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                {risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analytics.recommendations && analytics.recommendations.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <CheckCircle size={16} />
                            AI Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {analytics.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">Analytics not available</p>
                      <p className="text-xs text-muted-foreground">AI insights will appear here when data is processed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}