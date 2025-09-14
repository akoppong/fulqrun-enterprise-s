import { useState, useEffect, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, PEAK_STAGES, MEDDPICC } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Building,
  User,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  ChartBar,
  ChartLineUp,
  ClockCounterClockwise,
  Users,
  FileText,
  Phone,
  Envelope,
  MapPin,
  Globe,
  CheckCircle,
  Warning,
  Circle,
  ArrowLeft,
  PencilSimple,
  Trash,
  Plus,
  Trophy
} from '@phosphor-icons/react';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { format, differenceInDays } from 'date-fns';

// MEDDPICC Integration
import { MEDDPICCSummary } from '@/components/meddpicc';


interface ResponsiveOpportunityDetailProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showInMainContent?: boolean;
}

export function ResponsiveOpportunityDetail({ 
  opportunity, 
  isOpen, 
  onClose,
  onEdit,
  onDelete,
  showInMainContent = false
}: ResponsiveOpportunityDetailProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  const [activeTab, setActiveTab] = useState('overview');
  const [meddpiccAssessment, setMeddpiccAssessment] = useState<any | null>(null);
  const [showMEDDPICCModal, setShowMEDDPICCModal] = useState(false);

  // Load MEDDPICC assessment
  useEffect(() => {
    if (opportunity?.id) {
      // TODO: Re-enable when MEDDPICCService is available
      // const assessment = MEDDPICCService.getLatestAssessment(opportunity.id);
      const assessment = null;
      setMeddpiccAssessment(assessment);
    }
  }, [opportunity?.id]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'e':
          if ((event.ctrlKey || event.metaKey) && onEdit) {
            event.preventDefault();
            onEdit();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, onEdit]);

  // Reset tab when opportunity changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [opportunity?.id, isOpen]);

  // Get related data with memoization (move before validation)
  const company = useMemo(() => 
    opportunity ? companies.find(c => c.id === opportunity.companyId) : null, 
    [companies, opportunity?.companyId]
  );
  
  const contact = useMemo(() => 
    opportunity ? contacts.find(c => c.id === opportunity.contactId) : null, 
    [contacts, opportunity?.contactId]
  );
  
  const stageConfig = useMemo(() => 
    opportunity ? PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0] : PEAK_STAGES[0], 
    [opportunity?.stage]
  );
  
  const meddpicScore = useMemo(() => 
    opportunity ? getMEDDPICCScore(opportunity.meddpicc) : 0, 
    [opportunity?.meddpicc]
  );
  
  const stageProgress = useMemo(() => 
    opportunity ? getStageProgress(opportunity.stage) : 0, 
    [opportunity?.stage]
  );
  
  // Calculate days in various states with memoization
  const timeCalculations = useMemo(() => {
    if (!opportunity) return { daysInStage: 0, daysInPipeline: 0, daysToClose: 0 };
    
    const now = new Date();
    const createdAt = new Date(opportunity.createdAt);
    const updatedAt = new Date(opportunity.updatedAt);
    const expectedCloseDate = new Date(opportunity.expectedCloseDate);
    
    return {
      daysInStage: differenceInDays(now, updatedAt),
      daysInPipeline: differenceInDays(now, createdAt),
      daysToClose: differenceInDays(expectedCloseDate, now)
    };
  }, [opportunity?.createdAt, opportunity?.updatedAt, opportunity?.expectedCloseDate]);

  const priorityBadge = useMemo(() => 
    opportunity ? getPriorityBadge(opportunity.priority) : { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-300' }, 
    [opportunity?.priority]
  );

  // Validate opportunity data after all hooks
  if (!opportunity) {
    console.error('ResponsiveOpportunityDetail: No opportunity provided');
    return null;
  }
  
  const { daysInStage, daysInPipeline, daysToClose } = timeCalculations;

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'medium':
        return { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'high':
        return { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'critical':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const renderOpportunityContent = () => {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border bg-background mb-6">
          <TabsList className="h-10 bg-transparent p-0 w-full justify-start">
            <div className="flex overflow-x-auto scrollbar-hide w-full">
              <TabsTrigger 
                value="overview" 
                className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
              >
                <FileText size={14} className="mr-1" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
              >
                <ChartBar size={14} className="mr-1" />
                Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="peak" 
                className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
              >
                <Target size={14} className="mr-1" />
                PEAK
              </TabsTrigger>
              <TabsTrigger 
                value="meddpicc" 
                className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
              >
                <ChartLineUp size={14} className="mr-1" />
                MEDDPICC
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
              >
                <Users size={14} className="mr-1" />
                Contact
              </TabsTrigger>
            </div>
          </TabsList>
        </div>
        
        <div className="space-y-6">
          <TabsContent value="overview" className="mt-0 space-y-4">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                <CardContent className="p-3 text-center">
                  <DollarSign size={16} className="text-emerald-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-emerald-900">
                    {formatCurrency(opportunity.value)}
                  </div>
                  <div className="text-xs font-medium text-emerald-700">Deal Value</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-3 text-center">
                  <Trophy size={16} className="text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-blue-900">
                    {opportunity.probability}%
                  </div>
                  <div className="text-xs font-medium text-blue-700">Win Probability</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardContent className="p-3 text-center">
                  <Calendar size={16} className="text-amber-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-amber-900">
                    {daysToClose > 0 ? `${daysToClose}` : 'Overdue'}
                  </div>
                  <div className="text-xs font-medium text-amber-700">Days to Close</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-3 text-center">
                  <ClockCounterClockwise size={16} className="text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-purple-900">
                    {daysInPipeline}
                  </div>
                  <div className="text-xs font-medium text-purple-700">Days Active</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Progress and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Deal Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Current Stage</span>
                      <Badge variant="secondary" className={stageConfig.color}>
                        {stageConfig.label}
                      </Badge>
                    </div>
                    <Progress value={stageProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {stageProgress}% through {stageConfig.label} stage
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Expected Close</Label>
                      <div className="font-medium">
                        {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <div className="font-medium capitalize">{opportunity.priority}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building size={14} className="text-blue-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {company?.name || 'Unknown Company'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {company?.industry || opportunity.industry || 'Technology'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User size={14} className="text-green-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {contact ? `${contact.firstName} ${contact.lastName}` : opportunity.primaryContact}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contact?.title || 'Primary Contact'}
                      </div>
                    </div>
                  </div>
                  
                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {opportunity.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {opportunity.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          +{opportunity.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="mt-0">
            <div className="text-center py-12 space-y-4">
              <ChartBar size={48} className="text-purple-600 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Advanced Metrics Dashboard</h3>
                <p className="text-muted-foreground text-sm">
                  Detailed performance analytics and predictive insights will be available here.
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                <ChartLineUp size={16} className="mr-2" />
                Coming Soon
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="peak" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    PEAK Methodology Progress
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <span className="text-lg font-bold text-primary">{stageProgress}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PEAK_STAGES.map((stage, index) => {
                    const score = opportunity.peakScores?.[stage.id] || 0;
                    const isActive = opportunity.stage === stage.id;
                    
                    return (
                      <Card 
                        key={stage.id} 
                        className={`relative transition-all duration-200 border ${
                          isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                            <span className="text-sm font-medium">{stage.name}</span>
                          </div>
                          <div className="space-y-2">
                            <Progress value={score} className="h-1.5" />
                            <div className="text-xs text-muted-foreground text-center">
                              {score}% Complete
                            </div>
                          </div>
                        </CardContent>
                        {isActive && (
                          <div className="absolute -top-1 -right-1">
                            <CheckCircle size={16} className="text-primary bg-background rounded-full" />
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meddpicc" className="mt-0 space-y-4">
            {/* MEDDPICC Summary */}
            <MEDDPICCSummary 
              assessment={meddpiccAssessment}
              onOpenAssessment={() => setShowMEDDPICCModal(true)}
              showActions={true}
            />
            
            {/* MEDDPICC Assessment Modal */}
            <Dialog open={showMEDDPICCModal} onOpenChange={setShowMEDDPICCModal}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>MEDDPICC Assessment</DialogTitle>
                  <DialogDescription>
                    Complete B2B sales qualification for {opportunity.name}
                  </DialogDescription>
                </DialogHeader>
                {/* Assessment component would go here */}
                <div className="text-center py-8">
                  <ChartLineUp size={48} className="text-blue-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">MEDDPICC Assessment component coming soon</p>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="contact" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border-2 border-blue-100 shrink-0">
                        <AvatarImage src={contact.avatarUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {(contact.firstName || 'U')[0]}{(contact.lastName || 'U')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="font-semibold text-sm">
                          {contact.firstName} {contact.lastName}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {contact.title || 'Contact'}
                        </div>
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Envelope size={12} />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone size={12} />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" disabled>
                      <Plus size={14} className="mr-1" />
                      Add Contact
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <User size={32} className="text-muted-foreground mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No Primary Contact</p>
                      <p className="text-xs text-muted-foreground">
                        Add a primary contact to track stakeholder relationships
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" disabled>
                      <Plus size={14} className="mr-1" />
                      Add Contact
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    );
  };

  if (showInMainContent) {
    // Render directly in main content without dialog wrapper
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-none bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {opportunity.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.company} • {formatCurrency(opportunity.value)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <PencilSimple size={16} className="mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <Trash size={16} className="mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {renderOpportunityContent()}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none border-0 bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Opportunity Details - {opportunity.name}
          </DialogTitle>
          <DialogDescription>
            Detailed view of opportunity {opportunity.name} including PEAK methodology progress, MEDDPICC qualification, and contact information.
          </DialogDescription>
        </DialogHeader>

        <div className="h-full flex flex-col">
          {/* Fixed Header - Compact */}
          <div className="flex-shrink-0 bg-background border-b border-border px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
                <div className="hidden md:block w-px h-6 bg-border" />
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
                    {opportunity.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building size={12} className="text-blue-600 shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {company?.name || 'Unknown Company'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${stageConfig.color} text-xs px-2 py-1`}
                >
                  {stageConfig.label}
                </Badge>
                {onEdit && (
                  <Button 
                    size="sm"
                    onClick={onEdit}
                    className="hidden md:flex"
                  >
                    <PencilSimple size={14} className="mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation - Horizontal Scroll */}
          <div className="flex-shrink-0 border-b border-border bg-background">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 md:px-6">
                <TabsList className="h-10 bg-transparent p-0 w-full justify-start">
                  <div className="flex overflow-x-auto scrollbar-hide w-full">
                    <TabsTrigger 
                      value="overview" 
                      className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
                    >
                      <FileText size={14} className="mr-1" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="metrics" 
                      className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
                    >
                      <ChartBar size={14} className="mr-1" />
                      Metrics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="peak" 
                      className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
                    >
                      <Target size={14} className="mr-1" />
                      PEAK
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meddpicc" 
                      className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
                    >
                      <ChartLineUp size={14} className="mr-1" />
                      MEDDPICC
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
                    >
                      <Users size={14} className="mr-1" />
                      Contact
                    </TabsTrigger>
                  </div>
                </TabsList>
              </div>
              
              {/* Main Content - Single Scroll Area */}
              <div className="h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden">
                <div className="p-4 md:p-6 space-y-6">
                  <TabsContent value="overview" className="mt-0 space-y-4">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                        <CardContent className="p-3 text-center">
                          <DollarSign size={16} className="text-emerald-600 mx-auto mb-2" />
                          <div className="text-sm font-bold text-emerald-900">
                            {formatCurrency(opportunity.value)}
                          </div>
                          <div className="text-xs font-medium text-emerald-700">Deal Value</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                        <CardContent className="p-3 text-center">
                          <Target size={16} className="text-blue-600 mx-auto mb-2" />
                          <div className="text-sm font-bold text-blue-900">
                            {opportunity.probability}%
                          </div>
                          <div className="text-xs font-medium text-blue-700">Win Rate</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                        <CardContent className="p-3 text-center">
                          <TrendingUp size={16} className={`mx-auto mb-2 ${meddpicScore < 50 ? 'text-red-500' : meddpicScore < 80 ? 'text-yellow-500' : 'text-green-500'}`} />
                          <div className={`text-sm font-bold ${meddpicScore < 50 ? 'text-red-600' : meddpicScore < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {Math.round(meddpicScore)}%
                          </div>
                          <div className="text-xs font-medium text-purple-700">MEDDPICC</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 bg-gradient-to-br from-amber-50 to-amber-100/50">
                        <CardContent className="p-3 text-center">
                          <Calendar size={16} className="text-amber-600 mx-auto mb-2" />
                          <div className="text-xs font-bold text-amber-900">
                            {daysToClose > 0 ? `${daysToClose} days` : daysToClose === 0 ? 'Today' : `${Math.abs(daysToClose)}d overdue`}
                          </div>
                          <div className="text-xs font-medium text-amber-700">To Close</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Main Details */}
                      <div className="lg:col-span-2">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <FileText size={16} className="text-primary" />
                              Opportunity Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Stage and Progress */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Current Stage</Label>
                                <Badge className={`${stageConfig.color} text-xs px-2 py-1`}>
                                  {stageConfig.label}
                                </Badge>
                              </div>
                              <Progress value={stageProgress} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{stageProgress}% complete</span>
                                <span>{daysInStage} days in stage</span>
                              </div>
                            </div>

                            <Separator />

                            {/* Timeline Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Created</Label>
                              <div className="p-3 bg-muted/50 rounded-lg">
                                <div className="text-sm font-medium">
                                  {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {daysInPipeline} days in pipeline
                                </div>
                              </div>
                            </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Expected Close</Label>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <div className="text-sm font-medium">
                                    {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                                  </div>
                                  <div className={`text-xs font-medium ${daysToClose < 0 ? 'text-red-600' : daysToClose < 7 ? 'text-amber-600' : 'text-green-600'}`}>
                                    {daysToClose < 0 ? `${Math.abs(daysToClose)} days overdue` : 
                                     daysToClose === 0 ? 'Due today' :
                                     `${daysToClose} days remaining`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {opportunity.description && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Description</Label>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                      {opportunity.description}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}

                            {opportunity.tags && opportunity.tags.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Tags</Label>
                                  <div className="flex flex-wrap gap-1">
                                    {opportunity.tags.map((tag, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="text-xs px-2 py-1"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Company Information */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <Building size={16} className="text-blue-600" />
                              Company
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {company ? (
                              <div className="space-y-3">
                                <div className="text-center pb-3 border-b">
                                  <div className="font-semibold text-sm">
                                    {company.name}
                                  </div>
                                  <div className="text-xs text-blue-600 font-medium">
                                    {company.industry}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {company.website && (
                                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                      <Globe size={12} className="text-blue-600 shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs text-muted-foreground">Website</div>
                                        <a 
                                          href={company.website} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-xs font-medium text-blue-600 hover:underline truncate block"
                                        >
                                          {company.website}
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {company.address && (
                                    <div className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                                      <MapPin size={12} className="text-green-600 shrink-0 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="text-xs text-muted-foreground">Address</div>
                                        <div className="text-xs font-medium leading-relaxed">{company.address}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="p-2 bg-muted/30 rounded text-center">
                                      <div className="text-xs font-bold">
                                        {company.employees ? company.employees.toLocaleString() : 'N/A'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Employees</div>
                                    </div>
                                    <div className="p-2 bg-muted/30 rounded text-center">
                                      <div className="text-xs font-bold">
                                        {company.revenue ? formatCurrency(company.revenue) : 'N/A'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">Revenue</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <Building size={24} className="text-blue-600 mx-auto mb-2" />
                                <div className="text-sm font-medium">No Company Info</div>
                                <div className="text-xs text-muted-foreground">
                                  Details not available
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="mt-0">
                    <div className="text-center py-12 space-y-4">
                      <ChartBar size={48} className="text-purple-600 mx-auto" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">Advanced Metrics Dashboard</h3>
                        <p className="text-muted-foreground text-sm">
                          Detailed performance analytics and predictive insights will be available here.
                        </p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        <ChartLineUp size={16} className="mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="peak" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Target size={16} className="text-primary" />
                            PEAK Methodology Progress
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Progress:</span>
                            <span className="text-lg font-bold text-primary">{stageProgress}%</span>
                          </div>
                        </div>
                        <Progress value={stageProgress} className="h-2 mt-3" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {PEAK_STAGES.map((stage, index) => {
                          const isCurrentStage = stage.value === opportunity.stage;
                          const isPastStage = PEAK_STAGES.findIndex(s => s.value === opportunity.stage) > index;
                          
                          return (
                            <Card key={stage.value} className={`border transition-all ${
                              isCurrentStage ? 'border-primary bg-primary/5' : 
                              isPastStage ? 'border-green-200 bg-green-50/50' : 
                              'border-border bg-muted/20'
                            }`}>
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  <div className={`p-1.5 rounded-full shrink-0 ${
                                    isCurrentStage ? 'bg-primary text-primary-foreground' :
                                    isPastStage ? 'bg-green-500 text-white' :
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {isPastStage ? <CheckCircle size={14} /> :
                                     isCurrentStage ? <ClockCounterClockwise size={14} /> :
                                     <Circle size={14} />}
                                  </div>
                                  <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h3 className={`text-sm font-semibold ${
                                        isCurrentStage ? 'text-primary' :
                                        isPastStage ? 'text-green-700' :
                                        'text-muted-foreground'
                                      }`}>
                                        {stage.label}
                                      </h3>
                                      <Badge variant={
                                        isCurrentStage ? 'default' :
                                        isPastStage ? 'secondary' :
                                        'outline'
                                      } className="text-xs px-2 py-0">
                                        {isPastStage ? 'Completed' :
                                         isCurrentStage ? 'In Progress' :
                                         'Pending'}
                                      </Badge>
                                    </div>
                                    
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {stage.description}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="meddpicc" className="mt-0 space-y-4">
                    {/* MEDDPICC Summary */}
                    <MEDDPICCSummary 
                      assessment={meddpiccAssessment}
                      onOpenAssessment={() => setShowMEDDPICCModal(true)}
                      showActions={true}
                    />
                    
                    {/* MEDDPICC Assessment Modal */}
                    <Dialog open={showMEDDPICCModal} onOpenChange={setShowMEDDPICCModal}>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>MEDDPICC Assessment</DialogTitle>
                          <DialogDescription>
                            Complete B2B sales qualification for {opportunity.name}
                          </DialogDescription>
                        </DialogHeader>
                        {/* TODO: Re-enable when MEDDPICCAssessment component is available */}
                        <div className="text-center py-8">
                          <ChartLineUp size={48} className="text-blue-600 mx-auto mb-4" />
                          <p className="text-muted-foreground">MEDDPICC Assessment component coming soon</p>
                        </div>
                        {/* 
                        <MEDDPICCAssessment
                          opportunityId={opportunity.id}
                          userId="current-user"
                          onAssessmentComplete={(assessment) => {
                            setMeddpiccAssessment(assessment);
                            setShowMEDDPICCModal(false);
                          }}
                          onSave={() => {
                            // Refresh assessment data
                          }}
                        />
                        */}
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  <TabsContent value="contact" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <User size={16} className="text-blue-600" />
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {contact ? (
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12 border-2 border-blue-100 shrink-0">
                                <AvatarImage src={contact.avatarUrl} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                  {(contact.firstName || 'U')[0]}{(contact.lastName || 'U')[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1 min-w-0">
                                <div className="font-semibold text-sm">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-sm text-blue-600 font-medium">
                                  {contact.title || 'Contact'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {company?.name || 'Unknown Company'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                                <Envelope size={14} className="text-blue-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-muted-foreground">Email</div>
                                  <a 
                                    href={`mailto:${contact.email}`}
                                    className="text-sm font-medium text-foreground hover:text-blue-600 truncate block"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              </div>
                              
                              {contact.phone && (
                                <div className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                                  <Phone size={14} className="text-green-600 shrink-0" />
                                  <div className="flex-1">
                                    <div className="text-xs text-muted-foreground">Phone</div>
                                    <a 
                                      href={`tel:${contact.phone}`}
                                      className="text-sm font-medium text-foreground hover:text-green-600"
                                    >
                                      {contact.phone}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Envelope size={14} className="mr-1" />
                                Email
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Phone size={14} className="mr-1" />
                                Call
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users size={24} className="text-blue-600 mx-auto mb-2" />
                            <div className="space-y-1">
                              <div className="font-medium text-sm">No Primary Contact</div>
                              <div className="text-xs text-muted-foreground">
                                Assign a contact to improve tracking
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3" disabled>
                              <Plus size={14} className="mr-1" />
                              Add Contact
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}