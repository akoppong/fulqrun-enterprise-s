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

interface ResponsiveOpportunityDetailProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ResponsiveOpportunityDetail({ 
  opportunity, 
  isOpen, 
  onClose,
  onEdit,
  onDelete
}: ResponsiveOpportunityDetailProps) {
  const [companies] = useKV<Company[]>('companies', []);
  const [contacts] = useKV<Contact[]>('contacts', []);
  const [activeTab, setActiveTab] = useState('overview');

  // Validate opportunity data
  if (!opportunity) {
    console.error('ResponsiveOpportunityDetail: No opportunity provided');
    return null;
  }

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
  }, [opportunity.id, isOpen]);

  // Get related data with memoization
  const company = useMemo(() => 
    companies.find(c => c.id === opportunity.companyId), 
    [companies, opportunity.companyId]
  );
  
  const contact = useMemo(() => 
    contacts.find(c => c.id === opportunity.contactId), 
    [contacts, opportunity.contactId]
  );
  
  const stageConfig = useMemo(() => 
    PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0], 
    [opportunity.stage]
  );
  
  const meddpicScore = useMemo(() => 
    getMEDDPICCScore(opportunity.meddpicc), 
    [opportunity.meddpicc]
  );
  
  const stageProgress = useMemo(() => 
    getStageProgress(opportunity.stage), 
    [opportunity.stage]
  );
  
  // Calculate days in various states with memoization
  const timeCalculations = useMemo(() => {
    const now = new Date();
    const createdAt = new Date(opportunity.createdAt);
    const updatedAt = new Date(opportunity.updatedAt);
    const expectedCloseDate = new Date(opportunity.expectedCloseDate);
    
    return {
      daysInStage: differenceInDays(now, updatedAt),
      daysInPipeline: differenceInDays(now, createdAt),
      daysToClose: differenceInDays(expectedCloseDate, now)
    };
  }, [opportunity.createdAt, opportunity.updatedAt, opportunity.expectedCloseDate]);
  
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

  const priorityBadge = useMemo(() => 
    getPriorityBadge(opportunity.priority), 
    [opportunity.priority]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            Opportunity Details - {opportunity.title}
          </DialogTitle>
          <DialogDescription>
            Detailed view of opportunity {opportunity.title} including PEAK methodology progress, MEDDPICC qualification, and contact information.
          </DialogDescription>
        </DialogHeader>
        
        {/* Close Button - The dialog component handles this automatically */}

        <div className="flex flex-col h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-card/50 to-background border-b border-border px-6 py-4">
            <div className="flex flex-col gap-4">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close opportunity details"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  <span className="text-sm">Back to Opportunities</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button 
                      size="sm"
                      onClick={onEdit}
                      className="text-sm"
                      aria-label="Edit opportunity"
                    >
                      <PencilSimple size={14} className="mr-2" />
                      Edit Opportunity
                    </Button>
                  )}
                </div>
              </div>

              {/* Title Section */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-foreground leading-tight">
                    {opportunity.title}
                  </h1>
                  
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Building size={14} className="text-blue-600 shrink-0" />
                    <span className="font-medium text-foreground">
                      {company?.name || 'Unknown Company'}
                    </span>
                    {company?.industry && (
                      <span className="hidden sm:inline">• {company.industry}</span>
                    )}
                    <span className="text-muted-foreground hidden md:inline">
                      Created {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
                
                {/* Badges */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant="secondary" 
                    className={`${stageConfig.color} px-3 py-1 text-sm font-medium`}
                  >
                    {stageConfig.label}
                  </Badge>
                  
                  <Badge 
                    variant="secondary" 
                    className={`${priorityBadge.className} px-3 py-1 text-sm font-medium border`}
                  >
                    {(opportunity.priority || 'medium').charAt(0).toUpperCase() + (opportunity.priority || 'medium').slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex-shrink-0 border-b border-border bg-card/30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6">
                <TabsList className="h-12 bg-transparent w-full justify-start gap-0 p-0">
                  <div className="flex gap-0 overflow-x-auto scrollbar-hide">
                    <TabsTrigger 
                      value="overview" 
                      className="h-12 px-4 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm border-r border-border/50 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary flex-shrink-0"
                    >
                      <FileText size={16} className="mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="metrics" 
                      className="h-12 px-4 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm border-r border-border/50 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary flex-shrink-0"
                    >
                      <ChartBar size={16} className="mr-2" />
                      Metrics
                    </TabsTrigger>
                    <TabsTrigger 
                      value="peak" 
                      className="h-12 px-4 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm border-r border-border/50 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary flex-shrink-0"
                    >
                      <Target size={16} className="mr-2" />
                      PEAK
                    </TabsTrigger>
                    <TabsTrigger 
                      value="meddpicc" 
                      className="h-12 px-4 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm border-r border-border/50 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary flex-shrink-0"
                    >
                      <ChartLineUp size={16} className="mr-2" />
                      MEDDPICC
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="h-12 px-4 text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary flex-shrink-0"
                    >
                      <Users size={16} className="mr-2" />
                      Contact
                    </TabsTrigger>
                  </div>
                </TabsList>
              </div>
              
              {/* Scrollable Content Area */}
              <ScrollArea className="flex-1 h-[calc(95vh-160px)]">
                <div className="p-6">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="group border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <div className="p-2.5 bg-emerald-200/50 rounded-lg w-fit mx-auto group-hover:scale-105 transition-transform">
                              <DollarSign size={20} className="text-emerald-600" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-base lg:text-lg font-bold text-emerald-900">
                              {formatCurrency(opportunity.value)}
                            </div>
                            <div className="text-sm font-medium text-emerald-700">Deal Value</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="group border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <div className="p-2.5 bg-blue-200/50 rounded-lg w-fit mx-auto group-hover:scale-105 transition-transform">
                              <Target size={20} className="text-blue-600" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-base lg:text-lg font-bold text-blue-900">
                              {opportunity.probability}%
                            </div>
                            <div className="text-sm font-medium text-blue-700">Win Rate</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="group border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <div className="p-2.5 bg-purple-200/50 rounded-lg w-fit mx-auto group-hover:scale-105 transition-transform">
                              <TrendingUp size={20} className={`${meddpicScore < 50 ? 'text-red-500' : meddpicScore < 80 ? 'text-yellow-500' : 'text-green-500'}`} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className={`text-base lg:text-lg font-bold ${meddpicScore < 50 ? 'text-red-600' : meddpicScore < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {Math.round(meddpicScore)}%
                            </div>
                            <div className="text-sm font-medium text-purple-700">MEDDPICC</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="group border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4 text-center">
                          <div className="mb-3">
                            <div className="p-2.5 bg-amber-200/50 rounded-lg w-fit mx-auto group-hover:scale-105 transition-transform">
                              <Calendar size={20} className="text-amber-600" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm lg:text-base font-bold text-amber-900">
                              {daysToClose > 0 ? `${daysToClose} days` : daysToClose === 0 ? 'Due today' : `${Math.abs(daysToClose)} days overdue`}
                            </div>
                            <div className="text-sm font-medium text-amber-700">To Close</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Main Details */}
                      <div className="lg:col-span-2">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/10 h-full">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <FileText size={18} className="text-primary" />
                              </div>
                              Opportunity Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Stage and Progress */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-muted-foreground">Current Stage</Label>
                                <Badge className={`${stageConfig.color} text-sm px-3 py-1 font-medium`}>
                                  {stageConfig.label}
                                </Badge>
                              </div>
                              <div className="space-y-3">
                                <Progress value={stageProgress} className="h-3" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>{stageProgress}% complete</span>
                                  <span>{daysInStage} days in stage</span>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Timeline Info */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <div className="text-sm font-medium text-foreground">
                                    {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {daysInPipeline} days in pipeline
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <Label className="text-sm font-medium text-muted-foreground">Expected Close</Label>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                  <div className="text-sm font-medium text-foreground">
                                    {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                                  </div>
                                  <div className={`text-sm font-medium mt-1 ${daysToClose < 0 ? 'text-red-600' : daysToClose < 7 ? 'text-amber-600' : 'text-green-600'}`}>
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
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                  <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-foreground leading-relaxed">
                                      {opportunity.description}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}

                            {opportunity.tags && opportunity.tags.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {opportunity.tags.map((tag, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20"
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

                      {/* Company Information - Sidebar */}
                      <div className="lg:col-span-1">
                        <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-blue-50/30 h-full">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Building size={18} className="text-blue-600" />
                              </div>
                              Company
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {company ? (
                              <div className="space-y-4">
                                <div className="text-center pb-4 border-b border-border/30">
                                  <div className="font-semibold text-base text-foreground">
                                    {company.name}
                                  </div>
                                  <div className="text-sm text-blue-600 font-medium">
                                    {company.industry}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {company.size}
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  {company.website && (
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                      <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                        <Globe size={14} className="text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm text-muted-foreground">Website</div>
                                        <a 
                                          href={company.website} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm font-medium text-blue-600 hover:underline truncate block"
                                        >
                                          {company.website}
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {company.address && (
                                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                                      <div className="p-2 bg-green-100 rounded-lg shrink-0">
                                        <MapPin size={14} className="text-green-600" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm text-muted-foreground">Address</div>
                                        <div className="text-sm font-medium leading-relaxed">{company.address}</div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                                      <div className="text-sm font-bold text-foreground">
                                        {company.employees ? company.employees.toLocaleString() : 'N/A'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Employees</div>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg text-center">
                                      <div className="text-sm font-bold text-foreground">
                                        {company.revenue ? formatCurrency(company.revenue) : 'N/A'}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Revenue</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="mb-4">
                                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                                    <Building size={20} className="text-blue-600" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="font-medium text-foreground text-base">No Company Info</div>
                                  <div className="text-sm text-muted-foreground">
                                    Details not available
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="mt-0 space-y-6">
                    <div className="text-center py-20 space-y-8">
                      <div className="mx-auto w-28 h-28 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center">
                        <ChartBar size={48} className="text-purple-600" />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-semibold text-foreground">Advanced Metrics Dashboard</h3>
                        <p className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed">
                          Detailed performance analytics, trend analysis, and predictive insights will be available here.
                        </p>
                      </div>
                      <Button variant="outline" size="lg" disabled className="px-8 py-3">
                        <ChartLineUp size={20} className="mr-3" />
                        Coming Soon
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="peak" className="mt-0 space-y-6">
                    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-primary/5">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <CardTitle className="text-lg font-semibold flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Target size={18} className="text-primary" />
                            </div>
                            PEAK Methodology Progress
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Progress:</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-bold text-primary">{stageProgress}%</span>
                              <div className="w-16 h-3 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-500" 
                                  style={{ width: `${stageProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Progress value={stageProgress} className="h-3" />
                          <div className="text-sm text-muted-foreground">
                            {stageProgress === 100 ? 'All stages completed' : 
                             stageProgress >= 75 ? 'Near completion' :
                             stageProgress >= 50 ? 'Good progress' :
                             'Early stages'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                          {PEAK_STAGES.map((stage, index) => {
                            const isCurrentStage = stage.value === opportunity.stage;
                            const isPastStage = PEAK_STAGES.findIndex(s => s.value === opportunity.stage) > index;
                            
                            return (
                              <Card key={stage.value} className={`border transition-all duration-300 ${
                                isCurrentStage ? 'border-primary bg-primary/5 shadow-sm' : 
                                isPastStage ? 'border-green-200 bg-green-50/50' : 
                                'border-border bg-muted/20'
                              }`}>
                                <CardContent className="p-5">
                                  <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-full shrink-0 ${
                                      isCurrentStage ? 'bg-primary text-primary-foreground shadow-sm' :
                                      isPastStage ? 'bg-green-500 text-white' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {isPastStage ? <CheckCircle size={18} /> :
                                       isCurrentStage ? <ClockCounterClockwise size={18} /> :
                                       <Circle size={18} />}
                                    </div>
                                    <div className="flex-1 space-y-3 min-w-0">
                                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                                        <h3 className={`text-base font-semibold ${
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
                                        } className={`shrink-0 text-sm px-3 py-1 ${
                                          isCurrentStage ? 'bg-primary' :
                                          isPastStage ? 'bg-green-100 text-green-700' :
                                          'text-muted-foreground'
                                        }`}>
                                          {isPastStage ? 'Completed' :
                                           isCurrentStage ? 'In Progress' :
                                           'Pending'}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {stage.description}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="meddpicc" className="mt-0 space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-purple-50/30">
                      <CardHeader className="pb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <CardTitle className="text-xl font-semibold flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <ChartLineUp size={20} className="text-purple-600" />
                            </div>
                            MEDDPICC Qualification
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Score:</span>
                            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                              meddpicScore < 50 ? 'text-red-600 bg-red-50' : 
                              meddpicScore < 80 ? 'text-yellow-600 bg-yellow-50' : 
                              'text-green-600 bg-green-50'
                            }`}>{Math.round(meddpicScore)}%</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={meddpicScore} className="h-3" />
                          <div className="flex justify-between text-xs">
                            <span className={meddpicScore < 50 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                              Poor (0-49%)
                            </span>
                            <span className={meddpicScore >= 50 && meddpicScore < 80 ? 'text-yellow-600 font-medium' : 'text-muted-foreground'}>
                              Good (50-79%)
                            </span>
                            <span className={meddpicScore >= 80 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                              Excellent (80-100%)
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          {/* MEDDPICC Components */}
                          {[
                            { 
                              key: 'metrics', 
                              title: 'Metrics', 
                              description: 'What economic impact can we measure and quantify?',
                              icon: ChartBar,
                              color: 'blue'
                            },
                            { 
                              key: 'economicBuyer', 
                              title: 'Economic Buyer', 
                              description: 'Who has the economic authority to make this purchase decision?',
                              icon: User,
                              color: 'emerald'
                            },
                            { 
                              key: 'decisionCriteria', 
                              title: 'Decision Criteria', 
                              description: 'What specific criteria will they use to evaluate solutions?',
                              icon: FileText,
                              color: 'purple'
                            },
                            { 
                              key: 'decisionProcess', 
                              title: 'Decision Process', 
                              description: 'How will they make the final decision? What\'s the process?',
                              icon: Target,
                              color: 'indigo'
                            },
                            { 
                              key: 'paperProcess', 
                              title: 'Paper Process', 
                              description: 'What\'s the procurement and approval process they follow?',
                              icon: FileText,
                              color: 'rose'
                            },
                            { 
                              key: 'implicatePain', 
                              title: 'Implicate Pain', 
                              description: 'What specific pain points are we addressing for them?',
                              icon: Warning,
                              color: 'amber'
                            },
                            { 
                              key: 'champion', 
                              title: 'Champion', 
                              description: 'Who is actively selling our solution internally for us?',
                              icon: Trophy,
                              color: 'green'
                            }
                          ].map((component) => {
                            const IconComponent = component.icon;
                            const hasContent = opportunity.meddpicc?.[component.key as keyof MEDDPICC];
                            
                            // Define color classes statically for Tailwind
                            const getColorClasses = (color: string) => {
                              switch(color) {
                                case 'blue': return { bg: 'bg-blue-100', text: 'text-blue-600' };
                                case 'emerald': return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
                                case 'purple': return { bg: 'bg-purple-100', text: 'text-purple-600' };
                                case 'indigo': return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
                                case 'rose': return { bg: 'bg-rose-100', text: 'text-rose-600' };
                                case 'amber': return { bg: 'bg-amber-100', text: 'text-amber-600' };
                                case 'green': return { bg: 'bg-green-100', text: 'text-green-600' };
                                default: return { bg: 'bg-gray-100', text: 'text-gray-600' };
                              }
                            };
                            
                            const colorClasses = getColorClasses(component.color);
                            
                            return (
                              <Card key={component.key} className="border-border/50 bg-gradient-to-br from-background to-muted/10">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className={`p-3 ${colorClasses.bg} rounded-lg shrink-0`}>
                                      <IconComponent size={18} className={colorClasses.text} />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{component.title}</h3>
                                        {hasContent ? (
                                          <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        ) : (
                                          <Warning size={16} className="text-amber-500 shrink-0" />
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground leading-relaxed">
                                        {component.description}
                                      </div>
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm font-medium text-foreground">
                                          {hasContent ? String(hasContent) : 'Not yet defined'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        {/* Qualification Health Summary */}
                        <Card className={`border-2 ${
                          meddpicScore >= 80 ? 'border-green-200 bg-green-50/30' :
                          meddpicScore >= 50 ? 'border-yellow-200 bg-yellow-50/30' :
                          'border-red-200 bg-red-50/30'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${
                                meddpicScore >= 80 ? 'bg-green-100' :
                                meddpicScore >= 50 ? 'bg-yellow-100' :
                                'bg-red-100'
                              }`}>
                                {meddpicScore >= 80 ? 
                                  <CheckCircle size={24} className="text-green-600" /> :
                                  <Warning size={24} className={meddpicScore >= 50 ? 'text-yellow-600' : 'text-red-600'} />
                                }
                              </div>
                              <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-semibold text-foreground">
                                  Qualification Health Assessment
                                </h3>
                                <div className="space-y-2">
                                  {meddpicScore >= 80 && (
                                    <div className="p-4 bg-green-100/50 rounded-lg">
                                      <div className="font-medium text-green-800 mb-2">🎯 Excellent Qualification</div>
                                      <p className="text-sm text-green-700">
                                        This opportunity is well-qualified across all MEDDPICC criteria. 
                                        High probability of successful close.
                                      </p>
                                    </div>
                                  )}
                                  {meddpicScore >= 50 && meddpicScore < 80 && (
                                    <div className="p-4 bg-yellow-100/50 rounded-lg">
                                      <div className="font-medium text-yellow-800 mb-2">⚠️ Good - Areas for Improvement</div>
                                      <p className="text-sm text-yellow-700">
                                        This opportunity shows promise but has gaps. 
                                        Focus on completing missing MEDDPICC elements.
                                      </p>
                                    </div>
                                  )}
                                  {meddpicScore < 50 && (
                                    <div className="p-4 bg-red-100/50 rounded-lg">
                                      <div className="font-medium text-red-800 mb-2">🚨 Poor - Action Required</div>
                                      <p className="text-sm text-red-700">
                                        This opportunity has significant qualification gaps. 
                                        Prioritize discovery activities before investing further resources.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="contact" className="mt-0 space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/30">
                      <CardHeader className="pb-6">
                        <CardTitle className="text-xl font-semibold flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User size={20} className="text-blue-600" />
                          </div>
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {contact ? (
                          <div className="space-y-6">
                            <div className="flex flex-col lg:flex-row items-start gap-6">
                              <Avatar className="h-24 w-24 border-4 border-blue-100 shrink-0">
                                <AvatarImage src={contact.avatarUrl} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-xl">
                                  {(contact.firstName || 'U')[0]}{(contact.lastName || 'U')[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="font-semibold text-xl text-foreground">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-base text-blue-600 font-medium">
                                  {contact.title || 'Contact'}
                                </div>
                                <div className="text-base text-muted-foreground">
                                  {company?.name || 'Unknown Company'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                                  <Envelope size={18} className="text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-muted-foreground font-medium">Email</div>
                                  <a 
                                    href={`mailto:${contact.email}`}
                                    className="text-base font-medium text-foreground hover:text-blue-600 truncate block"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              </div>
                              
                              {contact.phone && (
                                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                                  <div className="p-3 bg-green-100 rounded-lg shrink-0">
                                    <Phone size={18} className="text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm text-muted-foreground font-medium">Phone</div>
                                    <a 
                                      href={`tel:${contact.phone}`}
                                      className="text-base font-medium text-foreground hover:text-green-600"
                                    >
                                      {contact.phone}
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col lg:flex-row gap-3">
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Envelope size={16} className="mr-2" />
                                Send Email
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Phone size={16} className="mr-2" />
                                Call Contact
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-20">
                            <div className="mb-6">
                              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                                <Users size={32} className="text-blue-600" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="font-medium text-foreground text-lg">No Primary Contact</div>
                              <div className="text-base text-muted-foreground">
                                Assign a contact to improve tracking
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-6" disabled>
                              <Plus size={16} className="mr-2" />
                              Add Contact
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}