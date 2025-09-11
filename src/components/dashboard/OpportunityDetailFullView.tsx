import { Opportunity, Contact, Company, PEAK_STAGES } from '@/lib/types';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, getMEDDPICCScore } from '@/lib/crm-utils';
import { safeFormatDate } from '@/lib/utils';
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  TrendUp,
  Users,
  Building,
  PencilSimple,
  Trash,
  Phone,
  Envelope,
  Target,
  ChartBar,
  Clock,
  User,
  MapPin,
  Globe,
  Star,
  CheckCircle,
  AlertTriangle
} from '@phosphor-icons/react';

interface OpportunityDetailFullViewProps {
  opportunity: Opportunity;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function OpportunityDetailFullView({ 
  opportunity, 
  onBack, 
  onEdit, 
  onDelete 
}: OpportunityDetailFullViewProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);

  const company = companies.find(c => c.id === opportunity.companyId);
  const contact = contacts.find(c => c.id === opportunity.contactId);
  const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0];
  const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 70) return 'default' as const;
    if (score >= 40) return 'secondary' as const;
    return 'destructive' as const;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Opportunities
          </Button>
          <div className="h-8 w-px bg-border" />
          <div>
            <h1 className="text-2xl font-bold">{opportunity.title}</h1>
            <p className="text-muted-foreground">{company?.name || 'Unknown Company'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={stageConfig.color} variant="secondary">
            {stageConfig.label}
          </Badge>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <PencilSimple size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatCurrency(opportunity.value)}</div>
                <div className="text-sm text-muted-foreground">Deal Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendUp size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{opportunity.probability}%</div>
                <div className="text-sm text-muted-foreground">Win Probability</div>
                <Progress value={opportunity.probability} className="mt-1 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target size={20} className="text-purple-600" />
              </div>
              <div>
                <div className={`text-2xl font-bold ${getScoreColor(meddpicScore)}`}>
                  {meddpicScore}%
                </div>
                <div className="text-sm text-muted-foreground">MEDDPICC Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-bold">
                  {safeFormatDate(opportunity.expectedCloseDate, 'No date')}
                </div>
                <div className="text-sm text-muted-foreground">Expected Close</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="peak">PEAK</TabsTrigger>
              <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="mt-1">{opportunity.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Owner</label>
                      <p className="mt-1 flex items-center gap-2">
                        <User size={16} />
                        {opportunity.ownerId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="mt-1">{safeFormatDate(opportunity.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="mt-1">{safeFormatDate(opportunity.updatedAt)}</p>
                    </div>
                  </div>
                  
                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {opportunity.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="peak" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>PEAK Methodology Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  {opportunity.peak && (
                    <div className="space-y-4">
                      {Object.entries(opportunity.peak).map(([stage, score]) => (
                        <div key={stage} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium capitalize">{stage}</span>
                            <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meddpicc" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MEDDPICC Qualification</CardTitle>
                </CardHeader>
                <CardContent>
                  {opportunity.meddpicc && (
                    <div className="space-y-4">
                      {Object.entries(opportunity.meddpicc).map(([criteria, score]) => (
                        <div key={criteria} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                            </span>
                            <Badge variant={getScoreBadgeVariant(score)}>
                              {score}%
                            </Badge>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {opportunity.activities && opportunity.activities.length > 0 ? (
                    <div className="space-y-4">
                      {opportunity.activities.map((activity, index) => (
                        <div key={index} className="flex gap-3 pb-4 border-b last:border-b-0">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {activity.type === 'call' && <Phone size={14} />}
                            {activity.type === 'email' && <Envelope size={14} />}
                            {activity.type === 'meeting' && <Users size={14} />}
                            {!['call', 'email', 'meeting'].includes(activity.type) && <Clock size={14} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium capitalize">{activity.type}</span>
                              <Badge 
                                variant={
                                  activity.outcome === 'positive' ? 'default' :
                                  activity.outcome === 'negative' ? 'destructive' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {activity.outcome}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {activity.notes || 'No notes provided'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {safeFormatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No activities recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Company Information */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  Company
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                </div>
                
                {company.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe size={14} />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                
                {company.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin size={14} className="mt-0.5" />
                    <span>{company.address}</span>
                  </div>
                )}
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Employees: </span>
                  <span>{company.employees || 'Unknown'}</span>
                </div>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Annual Revenue: </span>
                  <span>{company.annualRevenue ? formatCurrency(company.annualRevenue) : 'Unknown'}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Primary Contact */}
          {contact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{contact.firstName} {contact.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                </div>
                
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Envelope size={14} />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                
                {contact.department && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Department: </span>
                    <span>{contact.department}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stage Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar size={20} />
                Stage Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {PEAK_STAGES.map((stage, index) => {
                  const isCompleted = PEAK_STAGES.findIndex(s => s.value === opportunity.stage) > index;
                  const isCurrent = stage.value === opportunity.stage;
                  
                  return (
                    <div 
                      key={stage.value} 
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        isCurrent ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-primary text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle size={14} weight="fill" />
                        ) : isCurrent ? (
                          <AlertTriangle size={14} weight="fill" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <span className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}