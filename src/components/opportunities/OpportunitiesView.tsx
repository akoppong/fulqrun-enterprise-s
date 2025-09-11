import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Opportunity, Company, Contact, PEAK_STAGES } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Star,
  Trophy,
  Shield,
  Lightbulb,
  Flag
} from '@phosphor-icons/react';
import { formatCurrency, getMEDDPICCScore, getStageProgress } from '@/lib/crm-utils';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

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
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get related data
  const company = companies.find(c => c.id === opportunity.companyId);
  const contact = contacts.find(c => c.id === opportunity.contactId);
  const stageConfig = PEAK_STAGES.find(s => s.value === opportunity.stage) || PEAK_STAGES[0];
  const meddpicScore = getMEDDPICCScore(opportunity.meddpicc);
  const stageProgress = getStageProgress(opportunity.stage);
  
  // Calculate days in various states
  const daysInStage = differenceInDays(new Date(), new Date(opportunity.updatedAt));
  const daysInPipeline = differenceInDays(new Date(), new Date(opportunity.createdAt));
  const daysToClose = differenceInDays(new Date(opportunity.expectedCloseDate), new Date());

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
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

  const priorityBadge = getPriorityBadge(opportunity.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 gap-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Modern Header - Responsive */}
          <div className="shrink-0 bg-gradient-to-r from-background via-background/95 to-background/90 backdrop-blur-xl border-b border-border/30 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Top Row - Back button and Actions */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  {isMobile ? 'Back' : 'Back to Opportunities'}
                </Button>
                
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button 
                      size="sm"
                      onClick={onEdit}
                      className="h-9 px-3 sm:px-4 font-medium"
                    >
                      <PencilSimple size={16} className="mr-1 sm:mr-2" />
                      {!isMobile && 'Edit'}
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={onDelete}
                      className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash size={16} className={!isMobile ? 'mr-2' : ''} />
                      {!isMobile && 'Delete'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Title and Company Info */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  {opportunity.title}
                </h1>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Building size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-foreground text-sm">
                        {company?.name || 'Unknown Company'}
                      </span>
                      {company?.industry && (
                        <span className="block sm:inline sm:ml-1 text-xs text-muted-foreground">
                          {!isMobile && '•'} {company.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Badge 
                      variant="secondary" 
                      className={`${stageConfig.color} text-xs px-2 py-1 font-medium`}
                    >
                      {stageConfig.label}
                    </Badge>
                    
                    <Badge 
                      variant="secondary" 
                      className={`${priorityBadge.className} text-xs px-2 py-1 font-medium border`}
                    >
                      {(opportunity.priority || 'medium').charAt(0).toUpperCase() + (opportunity.priority || 'medium').slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area with Tabs - Scrollable */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Tab Navigation - Horizontal scrollable on mobile */}
              <div className="shrink-0 border-b border-border/30 bg-muted/20">
                <div className="px-3 sm:px-4 lg:px-6">
                  <TabsList className={`h-12 bg-transparent w-full ${isMobile ? 'justify-start' : 'justify-center'} gap-1 p-1`}>
                    <div className={`flex ${isMobile ? 'overflow-x-auto scrollbar-hide' : 'flex-wrap justify-center'} gap-1 min-w-0`}>
                      <TabsTrigger 
                        value="overview" 
                        className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <FileText size={14} className="mr-1 sm:mr-2" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="metrics" 
                        className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <ChartBar size={14} className="mr-1 sm:mr-2" />
                        Metrics
                      </TabsTrigger>
                      <TabsTrigger 
                        value="peak" 
                        className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <Target size={14} className="mr-1 sm:mr-2" />
                        PEAK
                      </TabsTrigger>
                      <TabsTrigger 
                        value="meddpicc" 
                        className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <ChartLineUp size={14} className="mr-1 sm:mr-2" />
                        MEDDPICC
                      </TabsTrigger>
                      <TabsTrigger 
                        value="contact" 
                        className="h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        <Users size={14} className="mr-1 sm:mr-2" />
                        Contact
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </div>
              </div>

              {/* Tab Content - Scrollable */}
              <ScrollArea className="flex-1">
                <div className="p-3 sm:p-4 lg:p-6">
                  <TabsContent value="overview" className="mt-0 space-y-4 sm:space-y-6">
                    {/* Key Metrics Cards - Responsive Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                          <div className="mb-2 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-emerald-200/50 rounded-xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                              <DollarSign size={isMobile ? 20 : 24} className="text-emerald-600" />
                            </div>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">
                              {formatCurrency(opportunity.value)}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-emerald-700">Deal Value</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                          <div className="mb-2 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-blue-200/50 rounded-xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                              <Target size={isMobile ? 20 : 24} className="text-blue-600" />
                            </div>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">
                              {opportunity.probability}%
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-blue-700">Win Rate</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                          <div className="mb-2 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-purple-200/50 rounded-xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                              <TrendingUp size={isMobile ? 20 : 24} className={`${meddpicScore < 50 ? 'text-red-500' : meddpicScore < 80 ? 'text-yellow-500' : 'text-green-500'}`} />
                            </div>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${meddpicScore < 50 ? 'text-red-600' : meddpicScore < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {meddpicScore}%
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-purple-700">MEDDPICC</div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                          <div className="mb-2 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-amber-200/50 rounded-xl w-fit mx-auto group-hover:scale-110 transition-transform duration-200">
                              <Calendar size={isMobile ? 20 : 24} className="text-amber-600" />
                            </div>
                          </div>
                          <div className="space-y-1 sm:space-y-2">
                            <div className="text-sm sm:text-base lg:text-lg font-bold text-amber-900">
                              {daysToClose > 0 ? `${daysToClose} days` : 'Overdue'}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-amber-700">To Close</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details Section - Responsive Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      {/* Main Details */}
                      <div className="lg:col-span-2">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                          <CardHeader>
                            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                              <FileText size={18} className="text-primary" />
                              Opportunity Details
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 sm:space-y-6">
                            {/* Stage and Progress */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-muted-foreground">Current Stage</Label>
                                <Badge className={`${stageConfig.color} text-sm px-3 py-1 font-medium`}>
                                  {stageConfig.label}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <Progress value={stageProgress} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{stageProgress}% complete</span>
                                  <span>{daysInStage} days in stage</span>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Timeline Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                                <div className="text-sm font-medium text-foreground">
                                  {format(new Date(opportunity.createdAt), 'MMM dd, yyyy')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {daysInPipeline} days in pipeline
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">Expected Close</Label>
                                <div className="text-sm font-medium text-foreground">
                                  {format(new Date(opportunity.expectedCloseDate), 'MMM dd, yyyy')}
                                </div>
                                <div className={`text-xs font-medium ${daysToClose < 0 ? 'text-red-600' : daysToClose < 7 ? 'text-amber-600' : 'text-green-600'}`}>
                                  {daysToClose < 0 ? `${Math.abs(daysToClose)} days overdue` : 
                                   daysToClose === 0 ? 'Due today' :
                                   `${daysToClose} days remaining`}
                                </div>
                              </div>
                            </div>

                            {opportunity.description && (
                              <>
                                <Separator />
                                <div className="space-y-2">
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
                                        className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20"
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
                      <div>
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/30">
                          <CardHeader>
                            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                              <Building size={18} className="text-blue-600" />
                              Company Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {company ? (
                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <div>
                                    <div className="font-semibold text-lg text-foreground">
                                      {company.name}
                                    </div>
                                    <div className="text-sm text-blue-600 font-medium">
                                      {company.industry}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {company.size}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    {company.website && (
                                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                          <Globe size={14} className="text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-xs text-muted-foreground">Website</div>
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
                                        <div className="p-2 bg-green-100 rounded-lg">
                                          <MapPin size={14} className="text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="text-xs text-muted-foreground">Address</div>
                                          <div className="text-sm font-medium leading-relaxed">{company.address}</div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-muted/30 rounded-lg text-center">
                                        <div className="text-lg font-bold text-foreground">
                                          {company.employees ? company.employees.toLocaleString() : 'N/A'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Employees</div>
                                      </div>
                                      <div className="p-3 bg-muted/30 rounded-lg text-center">
                                        <div className="text-sm font-bold text-foreground">
                                          {company.revenue ? formatCurrency(company.revenue) : 'N/A'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Revenue</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="mb-4">
                                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                                    <Building size={24} className="text-blue-600" />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="font-medium text-foreground">No Company Information</div>
                                  <div className="text-sm text-muted-foreground">
                                    Company details not available
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="mt-0 space-y-4 sm:space-y-6">
                    <div className="text-center py-12 space-y-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center">
                        <ChartBar size={32} className="text-purple-600" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground">Advanced Metrics Dashboard</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Detailed performance analytics, trend analysis, and predictive insights will be available here.
                        </p>
                      </div>
                      <Button variant="outline" size="lg" disabled>
                        <ChartLineUp size={16} className="mr-2" />
                        Coming Soon
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="peak" className="mt-0 space-y-4 sm:space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-primary/5">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                            <Target size={18} className="text-primary" />
                            PEAK Methodology Progress
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Overall Progress:</span>
                            <span className="text-lg font-bold text-primary">{stageProgress}%</span>
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
                      <CardContent className="space-y-4 sm:space-y-6">
                        <div className="space-y-4 sm:space-y-6">
                          {PEAK_STAGES.map((stage, index) => {
                            const isCurrentStage = stage.value === opportunity.stage;
                            const isPastStage = PEAK_STAGES.findIndex(s => s.value === opportunity.stage) > index;
                            
                            return (
                              <Card key={stage.value} className={`border-2 transition-all duration-300 ${
                                isCurrentStage ? 'border-primary bg-primary/5 shadow-lg' : 
                                isPastStage ? 'border-green-200 bg-green-50/50' : 
                                'border-border bg-muted/20'
                              }`}>
                                <CardContent className="p-4 sm:p-6">
                                  <div className="flex items-start gap-3 sm:gap-4">
                                    <div className={`p-2 sm:p-3 rounded-full shrink-0 ${
                                      isCurrentStage ? 'bg-primary text-primary-foreground shadow-lg' :
                                      isPastStage ? 'bg-green-500 text-white' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                      {isPastStage ? <CheckCircle size={isMobile ? 18 : 20} /> :
                                       isCurrentStage ? <ClockCounterClockwise size={isMobile ? 18 : 20} /> :
                                       <Circle size={isMobile ? 18 : 20} />}
                                    </div>
                                    <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <h3 className={`text-lg sm:text-xl font-semibold ${
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
                                        } className={`shrink-0 ${
                                          isCurrentStage ? 'bg-primary' :
                                          isPastStage ? 'bg-green-100 text-green-700' :
                                          'text-muted-foreground'
                                        }`}>
                                          {isPastStage ? 'Completed' :
                                           isCurrentStage ? 'In Progress' :
                                           'Pending'}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
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

                  <TabsContent value="meddpicc" className="mt-0 space-y-4 sm:space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-purple/5">
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                            <ChartLineUp size={18} className="text-purple-600" />
                            MEDDPICC Qualification
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">Score:</span>
                            <div className={`text-xl font-bold px-3 py-1 rounded-lg ${
                              meddpicScore < 50 ? 'text-red-600 bg-red-50' : 
                              meddpicScore < 80 ? 'text-yellow-600 bg-yellow-50' : 
                              'text-green-600 bg-green-50'
                            }`}>{meddpicScore}%</div>
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
                            const hasContent = opportunity.meddpicc[component.key as keyof typeof opportunity.meddpicc];
                            
                            return (
                              <Card key={component.key} className="border-border/50 bg-gradient-to-br from-background to-muted/10">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 sm:p-3 bg-${component.color}-100 rounded-lg shrink-0`}>
                                      <IconComponent size={isMobile ? 16 : 18} className={`text-${component.color}-600`} />
                                    </div>
                                    <div className="flex-1 space-y-2 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm sm:text-base">{component.title}</h3>
                                        {hasContent ? (
                                          <CheckCircle size={16} className="text-green-500 shrink-0" />
                                        ) : (
                                          <Warning size={16} className="text-amber-500 shrink-0" />
                                        )}
                                      </div>
                                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                        {component.description}
                                      </p>
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-xs sm:text-sm font-medium text-foreground">
                                          {hasContent || 'Not yet defined'}
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
                          <CardContent className="p-4 sm:p-6">
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
                                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
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

                  <TabsContent value="contact" className="mt-0 space-y-4 sm:space-y-6">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-blue-50/30">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                          <User size={18} className="text-blue-600" />
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {contact ? (
                          <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                              <Avatar className="h-16 w-16 border-2 border-blue-100 shrink-0">
                                <AvatarImage src={contact.avatarUrl} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                                  {contact.firstName[0]}{contact.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1 min-w-0">
                                <div className="font-semibold text-lg text-foreground">
                                  {contact.firstName} {contact.lastName}
                                </div>
                                <div className="text-sm text-blue-600 font-medium">
                                  {contact.title || 'Contact'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {company?.name || 'Unknown Company'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                  <Envelope size={16} className="text-blue-600" />
                                </div>
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
                                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                                    <Phone size={16} className="text-green-600" />
                                  </div>
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
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Envelope size={14} className="mr-2" />
                                Send Email
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1" disabled>
                                <Phone size={14} className="mr-2" />
                                Call Contact
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="mb-6">
                              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
                                <Users size={24} className="text-blue-600" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="font-medium text-foreground">No Primary Contact</div>
                              <div className="text-sm text-muted-foreground">
                                Assign a contact to improve tracking
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-4" disabled>
                              <Plus size={14} className="mr-2" />
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