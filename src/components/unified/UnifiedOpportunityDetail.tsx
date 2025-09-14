import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Users, 
  Calendar, 
  DollarSign, 
  Target, 
  Star,
  Brain,
  TrendingUp,
  Clock,
  Phone,
  Mail,
  MapPin,
  Tag,
  User,
  Activity
} from '@phosphor-icons/react';
import { Opportunity, Contact, Activity as ActivityType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { UnifiedMEDDPICCModule } from './UnifiedMEDDPICCModule';
import { UnifiedAIInsights } from './UnifiedAIInsights';

interface UnifiedOpportunityDetailProps {
  opportunity: Opportunity;
  onUpdate?: (opportunity: Opportunity) => void;
  onClose?: () => void;
  mode?: 'modal' | 'page';
  source?: 'pipeline' | 'opportunities';
}

export function UnifiedOpportunityDetail({
  opportunity,
  onUpdate,
  onClose,
  mode = 'modal',
  source = 'opportunities'
}: UnifiedOpportunityDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-blue-500';
      case 'qualified': return 'bg-purple-500';
      case 'proposal': return 'bg-orange-500';
      case 'negotiation': return 'bg-red-500';
      case 'closed-won': return 'bg-green-500';
      case 'closed-lost': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDaysUntilClose = () => {
    if (!opportunity.expectedCloseDate) return null;
    const today = new Date();
    const closeDate = new Date(opportunity.expectedCloseDate);
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getMEDDPICCTotal = () => {
    if (!opportunity.meddpicc) return 0;
    return Object.values(opportunity.meddpicc).reduce((sum, score) => sum + score, 0);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Building className="h-6 w-6" />
                {opportunity.name}
                <Badge className={cn("text-white", getStageColor(opportunity.stage))}>
                  {opportunity.stage}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base">
                {opportunity.company} • {opportunity.industry}
              </CardDescription>
            </div>
            <div className="text-right space-y-1">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(opportunity.value)}
              </div>
              <div className="text-sm text-muted-foreground">Deal Value</div>
              <Badge 
                variant="secondary" 
                className={cn("text-white", getPriorityColor(opportunity.priority))}
              >
                {opportunity.priority} priority
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-blue-500" />
              <Badge variant="outline">{opportunity.probability}%</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{opportunity.probability}%</div>
              <div className="text-sm text-muted-foreground">Win Probability</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Calendar className="h-5 w-5 text-orange-500" />
              <Badge variant="outline">
                {getDaysUntilClose() !== null ? `${getDaysUntilClose()} days` : 'No date'}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold">
                {opportunity.expectedCloseDate ? 
                  format(opportunity.expectedCloseDate, 'MMM dd, yyyy') : 
                  'Not set'
                }
              </div>
              <div className="text-sm text-muted-foreground">Expected Close</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Brain className="h-5 w-5 text-purple-500" />
              <Badge variant="outline">{getMEDDPICCTotal()}/400</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{getMEDDPICCTotal()}</div>
              <div className="text-sm text-muted-foreground">MEDDPICC Score</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-green-500" />
              <Badge variant="outline">{opportunity.activities?.length || 0}</Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{opportunity.activities?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Activities</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Opportunity Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Opportunity Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Stage</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-3 h-3 rounded-full", getStageColor(opportunity.stage))} />
                  <span className="capitalize">{opportunity.stage}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">PEAK Stage</span>
                <div className="mt-1 capitalize">{opportunity.peakStage || 'Not set'}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Source</span>
                <div className="mt-1 capitalize">{opportunity.source || 'Unknown'}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Industry</span>
                <div className="mt-1">{opportunity.industry || 'Not specified'}</div>
              </div>
            </div>

            {opportunity.tags && opportunity.tags.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {opportunity.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {opportunity.description && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Description</span>
                <p className="mt-1 text-sm">{opportunity.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {opportunity.primaryContact && (
              <div className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Primary Contact</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>{opportunity.primaryContact}</div>
                  {opportunity.contactEmail && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {opportunity.contactEmail}
                    </div>
                  )}
                  {opportunity.contactPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {opportunity.contactPhone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {opportunity.contacts && opportunity.contacts.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Additional Contacts</span>
                <div className="space-y-2 mt-2">
                  {opportunity.contacts.map((contact, index) => (
                    <div key={index} className="p-2 border rounded text-sm">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-muted-foreground">{contact.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Assigned To</span>
                <div className="mt-1">{opportunity.assignedTo || 'Unassigned'}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created By</span>
                <div className="mt-1">{opportunity.createdBy || 'Unknown'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="font-medium">Created:</span>
              <span className="text-muted-foreground">
                {opportunity.createdDate ? format(opportunity.createdDate, 'MMM dd, yyyy') : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="font-medium">Last Updated:</span>
              <span className="text-muted-foreground">
                {opportunity.updatedAt ? format(opportunity.updatedAt, 'MMM dd, yyyy') : 'Unknown'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="font-medium">Expected Close:</span>
              <span className="text-muted-foreground">
                {opportunity.expectedCloseDate ? format(opportunity.expectedCloseDate, 'MMM dd, yyyy') : 'Not set'}
              </span>
              {getDaysUntilClose() !== null && (
                <Badge variant={getDaysUntilClose()! < 7 ? 'destructive' : getDaysUntilClose()! < 30 ? 'secondary' : 'outline'}>
                  {getDaysUntilClose()! < 0 ? 'Overdue' : `${getDaysUntilClose()} days left`}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivitiesTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activities Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {opportunity.activities && opportunity.activities.length > 0 ? (
          <div className="space-y-4">
            {opportunity.activities.map((activity, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium capitalize">{activity.type}</span>
                    <Badge variant={
                      activity.outcome === 'positive' ? 'default' : 
                      activity.outcome === 'negative' ? 'destructive' : 
                      'secondary'
                    }>
                      {activity.outcome}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{activity.notes}</p>
                  <div className="text-xs text-muted-foreground">
                    {activity.date ? format(activity.date, 'MMM dd, yyyy hh:mm a') : 'No date'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Activities Yet</h3>
            <p className="text-muted-foreground">Activities will appear here as they are logged.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderContactsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Stakeholders & Contacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primary Contact */}
          {opportunity.primaryContact && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Primary Contact</span>
              </div>
              <div className="space-y-2">
                <div className="font-medium">{opportunity.primaryContact}</div>
                {opportunity.contactEmail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {opportunity.contactEmail}
                  </div>
                )}
                {opportunity.contactPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {opportunity.contactPhone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Contacts */}
          {opportunity.contacts && opportunity.contacts.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-semibold">Additional Stakeholders</h4>
              {opportunity.contacts.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.role}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={
                        contact.influence === 'high' ? 'default' :
                        contact.influence === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {contact.influence} influence
                      </Badge>
                      <Badge variant={
                        contact.sentiment === 'champion' ? 'default' :
                        contact.sentiment === 'neutral' ? 'secondary' :
                        'destructive'
                      }>
                        {contact.sentiment}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Additional Contacts</h3>
              <p className="text-muted-foreground">Add more stakeholders to track engagement.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="peak">PEAK</TabsTrigger>
          <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px] w-full">
          <div className="p-1">
            <TabsContent value="overview" className="space-y-4">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Deal Metrics & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <div className="text-2xl font-bold">{formatCurrency(opportunity.value)}</div>
                      <div className="text-sm text-muted-foreground">Deal Value</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Target className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                      <div className="text-2xl font-bold">{opportunity.probability}%</div>
                      <div className="text-sm text-muted-foreground">Win Probability</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <div className="text-2xl font-bold">{getMEDDPICCTotal()}</div>
                      <div className="text-sm text-muted-foreground">MEDDPICC Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="peak" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    PEAK Process Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">PEAK Analysis</h3>
                      <p className="text-muted-foreground">Current PEAK stage: {opportunity.peakStage || 'Not set'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meddpicc" className="space-y-4">
              <UnifiedMEDDPICCModule
                meddpicc={opportunity.meddpicc || {
                  metrics: 0,
                  economicBuyer: 0,
                  decisionCriteria: 0,
                  decisionProcess: 0,
                  paperProcess: 0,
                  identifyPain: 0,
                  champion: 0,
                  competition: 0
                }}
                onChange={(meddpicc) => {
                  if (onUpdate) {
                    onUpdate({ ...opportunity, meddpicc });
                  }
                }}
                opportunityValue={opportunity.value}
                companyName={opportunity.company}
                readonly={false}
                source={source}
              />
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              {renderContactsTab()}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              {renderActivitiesTab()}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* AI Insights Section */}
      <UnifiedAIInsights
        opportunity={opportunity}
        onUpdate={(insights) => {
          console.log('AI insights updated:', insights);
        }}
        source={source}
      />
    </div>
  );

  if (mode === 'page') {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Opportunity Details</h1>
            <p className="text-muted-foreground">
              {source === 'pipeline' ? 'Pipeline Module' : 'Opportunities Module'}
            </p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back to List
            </Button>
          )}
        </div>
        {renderContent()}
      </div>
    );
  }

  return renderContent();
}