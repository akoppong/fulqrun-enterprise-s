import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { formatCurrency, getMEDDPICCScore } from '@/lib/crm-utils';
import { safeFormatDate } from '@/lib/utils';
import { 
  Target, 
  Building, 
  User, 
  Calendar, 
  DollarSign, 
  TrendUp, 
  Brain,
  PencilSimple,
  Trash,
  Phone,
  EnvelopeSimple,
  MapPin,
  ChartBar,
  Clock,
  CheckCircle,
  WarningCircle,
  Info,
  Lightbulb,
  X
} from '@phosphor-icons/react';

interface OpportunityDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  onEdit: () => void;
  onDelete: () => void;
}

export function OpportunityDetailView({ 
  isOpen, 
  onClose, 
  opportunity, 
  onEdit, 
  onDelete 
}: OpportunityDetailViewProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  
  const company = companies.find(c => c.id === opportunity.companyId);
  const contact = contacts.find(c => c.id === opportunity.contactId);
  const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0];
  const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
  
  const getMEDDPICCBadge = (score: number) => {
    if (score >= 70) return { variant: 'default' as const, label: 'Strong', color: 'text-green-600' };
    if (score >= 40) return { variant: 'secondary' as const, label: 'Moderate', color: 'text-yellow-600' };
    return { variant: 'destructive' as const, label: 'Weak', color: 'text-red-600' };
  };

  const meddpicBadge = getMEDDPICCBadge(meddpicScore);

  const getRiskLevel = () => {
    if (opportunity.aiInsights?.riskScore) {
      const risk = opportunity.aiInsights.riskScore;
      if (risk > 70) return { level: 'High', color: 'text-red-600', icon: WarningCircle };
      if (risk > 40) return { level: 'Medium', color: 'text-yellow-600', icon: Info };
      return { level: 'Low', color: 'text-green-600', icon: CheckCircle };
    }
    return { level: 'Unknown', color: 'text-muted-foreground', icon: Info };
  };

  const riskLevel = getRiskLevel();

  const formatMEDDPICCField = (value: string) => {
    if (!value || value.trim() === '') return 'Not specified';
    return value;
  };

  const isOverdue = () => {
    const closeDate = new Date(opportunity.expectedCloseDate);
    const today = new Date();
    return closeDate < today && opportunity.stage !== 'closed-won' && opportunity.stage !== 'closed-lost';
  };

  const getDaysUntilClose = () => {
    const closeDate = new Date(opportunity.expectedCloseDate);
    const today = new Date();
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilClose = getDaysUntilClose();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{opportunity.title}</h2>
                <p className="text-muted-foreground font-normal">
                  {company?.name} • {formatCurrency(opportunity.value)}
                </p>
              </div>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
                <PencilSimple size={16} />
                Edit
              </Button>
              <Button variant="outline" onClick={onDelete} className="flex items-center gap-2">
                <Trash size={16} />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChartBar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{meddpicScore}%</span>
                      <Badge variant={meddpicBadge.variant} className="text-xs">
                        {meddpicBadge.label}
                      </Badge>
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
                    <div className={`text-2xl font-bold ${isOverdue() ? 'text-red-600' : ''}`}>
                      {Math.abs(daysUntilClose)} days
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isOverdue() ? 'Overdue' : 'Until close'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status and Stage */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Status</h3>
                <div className="flex items-center gap-4">
                  <Badge className={stageConfig.color} variant="secondary">
                    {stageConfig.label}
                  </Badge>
                  {isOverdue() && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock size={12} />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Progress through PEAK stages</span>
                    <span>{PEAK_STAGES.findIndex(s => s.value === opportunity.stage) + 1} / {PEAK_STAGES.length}</span>
                  </div>
                  <Progress 
                    value={((PEAK_STAGES.findIndex(s => s.value === opportunity.stage) + 1) / PEAK_STAGES.length) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Expected Close Date</label>
                    <div className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : ''}`}>
                      {safeFormatDate(opportunity.expectedCloseDate, 'Not set')}
                      {isOverdue() && ' (Overdue)'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Last Updated</label>
                    <div className="text-sm">
                      {safeFormatDate(opportunity.updatedAt, 'Never')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="meddpicc">MEDDPICC</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building size={20} />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {company ? (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Company Name</label>
                          <div className="font-medium">{company.name}</div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Industry</label>
                          <div>{company.industry}</div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Company Size</label>
                          <div>{company.size}</div>
                        </div>
                        {company.website && (
                          <div>
                            <label className="text-sm text-muted-foreground">Website</label>
                            <div>
                              <a href={company.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-primary hover:underline">
                                {company.website}
                              </a>
                            </div>
                          </div>
                        )}
                        {company.address && (
                          <div>
                            <label className="text-sm text-muted-foreground">Address</label>
                            <div className="flex items-start gap-2">
                              <MapPin size={16} className="text-muted-foreground mt-0.5" />
                              <span>{company.address}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">Company information not available</div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User size={20} />
                      Primary Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contact ? (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Name</label>
                          <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Title</label>
                          <div>{contact.title}</div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Role</label>
                          <Badge variant="outline" className="capitalize">
                            {contact.role.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Email</label>
                          <div className="flex items-center gap-2">
                            <EnvelopeSimple size={16} className="text-muted-foreground" />
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        </div>
                        {contact.phone && (
                          <div>
                            <label className="text-sm text-muted-foreground">Phone</label>
                            <div className="flex items-center gap-2">
                              <Phone size={16} className="text-muted-foreground" />
                              <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-muted-foreground">Contact information not available</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Opportunity Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {opportunity.description ? (
                    <p className="whitespace-pre-wrap">{opportunity.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No description provided</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meddpicc" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendUp size={20} />
                      MEDDPICC Qualification Analysis
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <Progress value={meddpicScore} className="w-32" />
                      <Badge variant={meddpicBadge.variant} className={`${meddpicBadge.color} font-medium`}>
                        {meddpicScore}% {meddpicBadge.label}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    Comprehensive qualification using the MEDDPICC methodology
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Metrics</h4>
                      <p className="text-sm text-muted-foreground mb-1">What economic impact can we measure?</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {formatMEDDPICCField(opportunity.meddpicc.metrics)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Economic Buyer</h4>
                      <p className="text-sm text-muted-foreground mb-1">Who has the economic authority to buy?</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {formatMEDDPICCField(opportunity.meddpicc.economicBuyer)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Decision Criteria</h4>
                      <p className="text-sm text-muted-foreground mb-1">What criteria will they use to decide?</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {formatMEDDPICCField(opportunity.meddpicc.decisionCriteria)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Decision Process</h4>
                      <p className="text-sm text-muted-foreground mb-1">How will they make the decision?</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {formatMEDDPICCField(opportunity.meddpicc.decisionProcess)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Paper Process</h4>
                      <p className="text-sm text-muted-foreground mb-1">What's the approval/procurement process?</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {formatMEDDPICCField(opportunity.meddpicc.paperProcess)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Implicate Pain</h4>
                      <p className="text-sm text-muted-foreground mb-1">What pain are we addressing?</p>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        {formatMEDDPICCField(opportunity.meddpicc.implicatePain)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Champion</h4>
                    <p className="text-sm text-muted-foreground mb-1">Who is actively selling for us internally?</p>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      {formatMEDDPICCField(opportunity.meddpicc.champion)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} />
                    AI-Powered Sales Intelligence
                  </CardTitle>
                  <CardDescription>
                    Machine learning insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {opportunity.aiInsights ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <riskLevel.icon size={16} className={riskLevel.color} />
                              Risk Assessment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${riskLevel.color}`}>
                              {opportunity.aiInsights.riskScore}% {riskLevel.level}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Confidence Level</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge 
                              variant={
                                opportunity.aiInsights.confidenceLevel === 'high' ? 'default' :
                                opportunity.aiInsights.confidenceLevel === 'medium' ? 'secondary' : 'outline'
                              }
                              className="text-sm"
                            >
                              {opportunity.aiInsights.confidenceLevel.charAt(0).toUpperCase() + 
                               opportunity.aiInsights.confidenceLevel.slice(1)}
                            </Badge>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">AI Analysis</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              {opportunity.aiInsights.lastAiUpdate 
                                ? safeFormatDate(opportunity.aiInsights.lastAiUpdate, 'Never')
                                : 'Never updated'
                              }
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Lightbulb size={16} />
                          Next Best Actions
                        </h4>
                        <div className="space-y-3">
                          {Array.isArray(opportunity.aiInsights.nextBestActions) ? 
                            opportunity.aiInsights.nextBestActions.map((action: string, index: number) => (
                              <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <span className="text-sm leading-relaxed">{action}</span>
                              </div>
                            )) : (
                              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                                  1
                                </div>
                                <span className="text-sm leading-relaxed">
                                  {opportunity.aiInsights.nextBestActions || 'No specific actions recommended'}
                                </span>
                              </div>
                            )
                          }
                        </div>
                      </div>

                      {opportunity.aiInsights.competitorAnalysis && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-3">Competitor Analysis</h4>
                            <div className="p-4 bg-muted/50 rounded-lg">
                              <p className="text-sm leading-relaxed">{opportunity.aiInsights.competitorAnalysis}</p>
                            </div>
                          </div>
                        </>
                      )}

                      {opportunity.aiInsights.predictedCloseDate && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-3">AI Predicted Close Date</h4>
                            <div className="flex items-center gap-4">
                              <div>
                                <label className="text-sm text-muted-foreground">Expected Close</label>
                                <div className="font-medium">
                                  {safeFormatDate(opportunity.expectedCloseDate, 'Not set')}
                                </div>
                              </div>
                              <div className="text-muted-foreground">vs</div>
                              <div>
                                <label className="text-sm text-muted-foreground">AI Predicted</label>
                                <div className="font-medium">
                                  {safeFormatDate(opportunity.aiInsights.predictedCloseDate, 'Not predicted')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No AI insights available</h3>
                      <p className="text-sm">AI analysis has not been performed for this opportunity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Timeline of actions and updates for this opportunity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Target size={16} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Opportunity created</div>
                        <div className="text-sm text-muted-foreground">
                          {safeFormatDate(opportunity.createdAt, 'Unknown date')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <PencilSimple size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Last updated</div>
                        <div className="text-sm text-muted-foreground">
                          {safeFormatDate(opportunity.updatedAt, 'Never updated')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">More activity tracking features coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}