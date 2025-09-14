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
import { format, differenceInDays, isValid, parseISO } from 'date-fns';

import { MEDDPICCSummary, MEDDPICCModule } from '@/components/meddpicc';
import { MEDDPICCAssessment } from '@/services/meddpicc-service';

// Helper functions (defined outside component to avoid re-creation)
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

// Safe date formatting helper with enhanced error handling
const formatSafeDate = (dateValue: any, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    if (!dateValue) return 'Not set';
    
    let date: Date;
    
    // Handle different input types safely
    if (typeof dateValue === 'string') {
      // Handle empty strings
      if (dateValue.trim() === '' || dateValue === 'null' || dateValue === 'undefined') {
        return 'Not set';
      }
      
      // Handle ISO strings and other common date formats
      if (dateValue.includes('T') || dateValue.includes('-')) {
        date = parseISO(dateValue);
      } else {
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      // Handle timestamp values - reject invalid timestamps
      if (dateValue === 0 || !isFinite(dateValue) || dateValue < 0) {
        return 'Not set';
      }
      date = new Date(dateValue);
    } else {
      // Try to convert to string first, then parse
      const stringValue = String(dateValue);
      if (stringValue === 'null' || stringValue === 'undefined' || stringValue === '') {
        return 'Not set';
      }
      date = new Date(stringValue);
    }
    
    // Comprehensive validation before formatting
    if (!date || 
        !isValid(date) || 
        isNaN(date.getTime()) || 
        date.getTime() === 0 ||
        date.getFullYear() < 1900 || 
        date.getFullYear() > 2100) {
      console.warn('Invalid date value:', dateValue, 'type:', typeof dateValue, 'parsed:', date);
      return 'Not set';
    }
    
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for value:', dateValue, 'type:', typeof dateValue);
    return 'Not set';
  }
};

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
  const [meddpiccAssessment, setMeddpiccAssessment] = useState<MEDDPICCAssessment | null>(null);
  const [showMEDDPICCModal, setShowMEDDPICCModal] = useState(false);

  // Ensure opportunity has default values to prevent undefined errors
  const safeOpportunity = useMemo(() => {
    if (!opportunity) return null;
    
    return {
      ...opportunity,
      name: opportunity.name || opportunity.title || 'Untitled Opportunity',
      tags: Array.isArray(opportunity.tags) ? opportunity.tags : [],
      activities: Array.isArray(opportunity.activities) ? opportunity.activities : [],
      contacts: Array.isArray(opportunity.contacts) ? opportunity.contacts : [],
      peakScores: opportunity.peakScores || {},
      meddpiccScores: opportunity.meddpiccScores || {},
      priority: opportunity.priority || 'medium',
      stage: opportunity.stage || 'prospect',
      value: opportunity.value || 0,
      probability: opportunity.probability || 0
    };
  }, [opportunity]);

  // Load MEDDPICC assessment
  useEffect(() => {
    if (safeOpportunity?.id) {
      // Create mock MEDDPICC assessment for demonstration
      const mockAssessment: MEDDPICCAssessment = {
        id: `assessment-${safeOpportunity.id}`,
        opportunity_id: safeOpportunity.id,
        pillar_scores: [
          { pillar: 'metrics', score: 25, max_score: 40, percentage: 62.5 },
          { pillar: 'economic_buyer', score: 30, max_score: 40, percentage: 75.0 },
          { pillar: 'decision_criteria', score: 20, max_score: 40, percentage: 50.0 },
          { pillar: 'decision_process', score: 15, max_score: 40, percentage: 37.5 },
          { pillar: 'paper_process', score: 10, max_score: 40, percentage: 25.0 },
          { pillar: 'implicate_the_pain', score: 35, max_score: 40, percentage: 87.5 },
          { pillar: 'champion', score: 38, max_score: 40, percentage: 95.0 },
          { pillar: 'competition', score: 28, max_score: 40, percentage: 70.0 }
        ],
        total_score: 201,
        max_total_score: 320,
        completion_percentage: 85.0,
        overall_level: 'moderate' as const,
        coaching_prompts: [
          {
            pillar: 'paper_process',
            prompt: 'Understand the legal and procurement process to avoid last-minute delays',
            priority: 'high' as const
          },
          {
            pillar: 'decision_process',
            prompt: 'Map out the complete decision-making timeline and key stakeholders',
            priority: 'medium' as const
          }
        ],
        last_updated: new Date().toISOString(),
        created_date: new Date().toISOString(),
        updated_by: 'current-user'
      };
      
      setMeddpiccAssessment(mockAssessment);
    }
  }, [safeOpportunity?.id]);

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
  }, [safeOpportunity?.id, isOpen]);

  // Memoized priority badge configuration
  const priorityBadgeConfig = useMemo(() => {
    if (!safeOpportunity?.priority) {
      return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
    return getPriorityBadge(safeOpportunity.priority);
  }, [safeOpportunity?.priority]);

  // Get related data with memoization
  const company = useMemo(() => 
    safeOpportunity ? companies.find(c => c.id === safeOpportunity.companyId) || null : null, 
    [companies, safeOpportunity?.companyId]
  );
  
  const contact = useMemo(() => 
    safeOpportunity ? contacts.find(c => c.id === safeOpportunity.contactId) || null : null, 
    [contacts, safeOpportunity?.contactId]
  );
  
  const stageConfig = useMemo(() => 
    safeOpportunity ? PEAK_STAGES.find(s => s.value === safeOpportunity.stage) || PEAK_STAGES[0] : PEAK_STAGES[0], 
    [safeOpportunity?.stage]
  );
  
  const meddpicScore = useMemo(() => 
    safeOpportunity ? getMEDDPICCScore(safeOpportunity.meddpicc) || 0 : 0, 
    [safeOpportunity?.meddpicc]
  );
  
  const stageProgress = useMemo(() => 
    safeOpportunity ? getStageProgress(safeOpportunity.stage) || 0 : 0, 
    [safeOpportunity?.stage]
  );
  
  // Calculate days in various states with memoization
  const timeCalculations = useMemo(() => {
    if (!safeOpportunity) return { daysInStage: 0, daysInPipeline: 0, daysToClose: 0 };
    
    const now = new Date();
    
    // Safe date parsing with comprehensive validation
    const parseDate = (dateValue: any, fallback: Date = now): Date => {
      try {
        if (!dateValue) return fallback;
        
        let date: Date;
        if (typeof dateValue === 'string') {
          if (dateValue.trim() === '' || dateValue === 'null' || dateValue === 'undefined') {
            return fallback;
          }
          if (dateValue.includes('T') || dateValue.includes('-')) {
            date = parseISO(dateValue);
          } else {
            date = new Date(dateValue);
          }
        } else if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'number') {
          if (dateValue === 0 || !isFinite(dateValue)) {
            return fallback;
          }
          date = new Date(dateValue);
        } else {
          date = new Date(String(dateValue));
        }
        
        // Validate the parsed date
        if (!date || !isValid(date) || isNaN(date.getTime()) || date.getTime() === 0) {
          return fallback;
        }
        
        return date;
      } catch {
        return fallback;
      }
    };
    
    const createdAt = parseDate(safeOpportunity.createdAt);
    const updatedAt = parseDate(safeOpportunity.updatedAt);
    const expectedCloseDate = parseDate(safeOpportunity.expectedCloseDate);
    
    return {
      daysInStage: differenceInDays(now, updatedAt),
      daysInPipeline: differenceInDays(now, createdAt),
      daysToClose: differenceInDays(expectedCloseDate, now)
    };
  }, [safeOpportunity?.createdAt, safeOpportunity?.updatedAt, safeOpportunity?.expectedCloseDate]);



  // Validate opportunity data after all hooks
  if (!safeOpportunity) {
    console.error('ResponsiveOpportunityDetail: No opportunity provided');
    return null;
  }
  
  const { daysInStage, daysInPipeline, daysToClose } = timeCalculations;

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
              <TabsTrigger 
                value="activities" 
                className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
              >
                <ClockCounterClockwise size={14} className="mr-1" />
                Activities
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
                    {formatCurrency(safeOpportunity.value)}
                  </div>
                  <div className="text-xs font-medium text-emerald-700">Deal Value</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-3 text-center">
                  <Trophy size={16} className="text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-blue-900">
                    {safeOpportunity.probability}%
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
                        {formatSafeDate(safeOpportunity.expectedCloseDate)}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Priority</Label>
                      <div className="font-medium capitalize">{safeOpportunity.priority}</div>
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
                        {company?.industry || safeOpportunity.industry || 'Technology'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <User size={14} className="text-green-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {contact ? `${contact.firstName} ${contact.lastName}` : safeOpportunity.primaryContact}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {contact?.title || 'Primary Contact'}
                      </div>
                    </div>
                  </div>
                  
                  {safeOpportunity.tags && Array.isArray(safeOpportunity.tags) && safeOpportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {safeOpportunity.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {safeOpportunity.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          +{safeOpportunity.tags.length - 3}
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
                    const score = safeOpportunity.peakScores?.[stage.id] || 0;
                    const isActive = safeOpportunity.stage === stage.id;
                    
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
            
            {/* MEDDPICC Quick Insights */}
            {meddpiccAssessment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ChartLineUp size={16} className="text-blue-600" />
                      Deal Health Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Score</span>
                      <Badge className={`${
                        meddpiccAssessment.overall_level === 'strong' ? 'bg-green-500' :
                        meddpiccAssessment.overall_level === 'moderate' ? 'bg-yellow-500' : 'bg-red-500'
                      } text-white`}>
                        {meddpiccAssessment.total_score}/{meddpiccAssessment.max_total_score}
                      </Badge>
                    </div>
                    <Progress 
                      value={(meddpiccAssessment.total_score / meddpiccAssessment.max_total_score) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {meddpiccAssessment.completion_percentage.toFixed(1)}% assessment complete
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Trophy size={16} className="text-yellow-600" />
                      Strongest Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {meddpiccAssessment.pillar_scores
                        .sort((a, b) => b.percentage - a.percentage)
                        .slice(0, 3)
                        .map((pillar, index) => (
                          <div key={pillar.pillar} className="flex items-center justify-between">
                            <span className="text-sm capitalize">
                              {pillar.pillar.replace('_', ' ')}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {pillar.percentage.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* MEDDPICC Assessment Modal */}
            <Dialog open={showMEDDPICCModal} onOpenChange={setShowMEDDPICCModal}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>MEDDPICC Assessment</DialogTitle>
                  <DialogDescription>
                    Complete B2B sales qualification for {safeOpportunity.name}
                  </DialogDescription>
                </DialogHeader>
                
                {/* Embedded MEDDPICC Module */}
                <div className="max-h-[70vh] overflow-y-auto">
                  <MEDDPICCModule />
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

          <TabsContent value="activities" className="mt-0 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ClockCounterClockwise size={16} className="text-purple-600" />
                    Recent Activities
                  </CardTitle>
                  <Button size="sm" disabled>
                    <Plus size={14} className="mr-1" />
                    Add Activity
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {safeOpportunity.activities && Array.isArray(safeOpportunity.activities) && safeOpportunity.activities.length > 0 ? (
                  <div className="space-y-4">
                    {safeOpportunity.activities.slice(0, 5).map((activity, index) => (
                      <div key={activity.id || index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.outcome === 'positive' ? 'bg-green-500' :
                          activity.outcome === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatSafeDate(activity.date, 'MMM dd')}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{activity.notes}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                activity.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                                activity.outcome === 'negative' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {activity.outcome}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {Array.isArray(safeOpportunity.activities) && safeOpportunity.activities.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="ghost" size="sm" disabled>
                          View All Activities ({Array.isArray(safeOpportunity.activities) ? safeOpportunity.activities.length : 0})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <ClockCounterClockwise size={32} className="text-muted-foreground mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No Activities Recorded</p>
                      <p className="text-xs text-muted-foreground">
                        Track meetings, calls, and interactions to build opportunity context
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" disabled>
                      <Plus size={14} className="mr-1" />
                      Add First Activity
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
                    {safeOpportunity.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {safeOpportunity.company} • {formatCurrency(safeOpportunity.value)}
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
            Opportunity Details - {safeOpportunity.name}
          </DialogTitle>
          <DialogDescription>
            Detailed view of opportunity {safeOpportunity.name} including PEAK methodology progress, MEDDPICC qualification, and contact information.
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
                    {safeOpportunity.name}
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
                    <TabsTrigger 
                      value="activities" 
                      className="h-10 px-3 text-sm whitespace-nowrap shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent border-0"
                    >
                      <ClockCounterClockwise size={14} className="mr-1" />
                      Activities
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
                            {formatCurrency(safeOpportunity.value)}
                          </div>
                          <div className="text-xs font-medium text-emerald-700">Deal Value</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                        <CardContent className="p-3 text-center">
                          <Target size={16} className="text-blue-600 mx-auto mb-2" />
                          <div className="text-sm font-bold text-blue-900">
                            {safeOpportunity.probability}%
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
                            {/* Priority and Stage */}
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="space-y-1">
                                  <Label className="text-sm font-medium">Priority</Label>
                                  <Badge {...getPriorityBadge(safeOpportunity.priority)} className="text-xs px-2 py-1">
                                    {(safeOpportunity.priority || 'medium').charAt(0).toUpperCase() + (safeOpportunity.priority || 'medium').slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <Label className="text-sm font-medium">Current Stage</Label>
                                <Badge className={`${stageConfig.color} text-xs px-2 py-1`}>
                                  {stageConfig.label}
                                </Badge>
                              </div>
                            </div>

                            {/* Stage and Progress */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Stage Progress</Label>
                                <span className="text-sm font-semibold text-primary">{Math.round(stageProgress)}%</span>
                              </div>
                              <Progress value={stageProgress} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{Math.round(stageProgress)}% complete</span>
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
                                    {formatSafeDate(safeOpportunity.createdAt)}
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
                                    {formatSafeDate(safeOpportunity.expectedCloseDate)}
                                  </div>
                                  <div className={`text-xs font-medium ${daysToClose < 0 ? 'text-red-600' : daysToClose < 7 ? 'text-amber-600' : 'text-green-600'}`}>
                                    {daysToClose < 0 ? `${Math.abs(daysToClose)} days overdue` : 
                                     daysToClose === 0 ? 'Due today' :
                                     `${daysToClose} days remaining`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {safeOpportunity.description && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Description</Label>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                      {safeOpportunity.description}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}

                            {safeOpportunity.tags && Array.isArray(safeOpportunity.tags) && safeOpportunity.tags.length > 0 && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">Tags</Label>
                                  <div className="flex flex-wrap gap-1">
                                    {safeOpportunity.tags.map((tag, index) => (
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

                            {/* Quick Actions */}
                            <Separator />
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Quick Actions</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" disabled>
                                  <Envelope size={14} className="mr-1" />
                                  Send Update
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                  <Calendar size={14} className="mr-1" />
                                  Schedule Meeting
                                </Button>
                                <Button variant="outline" size="sm" disabled>
                                  <FileText size={14} className="mr-1" />
                                  Generate Report
                                </Button>
                              </div>
                            </div>
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

                  <TabsContent value="metrics" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Deal Performance Metrics */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-600" />
                            Deal Performance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Deal Value</Label>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(safeOpportunity.value)}
                              </span>
                            </div>
                            <Progress value={Math.min((safeOpportunity.value / 1000000) * 100, 100)} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Win Probability</Label>
                              <span className="text-lg font-bold text-blue-600">
                                {safeOpportunity.probability}%
                              </span>
                            </div>
                            <Progress value={safeOpportunity.probability} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Stage Progress</Label>
                              <span className="text-lg font-bold text-purple-600">
                                {Math.round(stageProgress)}%
                              </span>
                            </div>
                            <Progress value={stageProgress} className="h-2" />
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {daysInPipeline}
                              </div>
                              <div className="text-xs text-muted-foreground">Days in Pipeline</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {daysInStage}
                              </div>
                              <div className="text-xs text-muted-foreground">Days in Stage</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Methodology Scores */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Trophy size={16} className="text-amber-600" />
                            Methodology Scores
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">PEAK Score</Label>
                              <span className="text-lg font-bold text-blue-600">
                                {Math.round(stageProgress)}%
                              </span>
                            </div>
                            <Progress value={stageProgress} className="h-2" />
                            
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">MEDDPICC Score</Label>
                              <span className={`text-lg font-bold ${meddpicScore < 50 ? 'text-red-600' : meddpicScore < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {Math.round(meddpicScore)}%
                              </span>
                            </div>
                            <Progress value={meddpicScore} className="h-2" />
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Risk Assessment</Label>
                            <div className={`p-3 rounded-lg border ${
                              meddpicScore < 50 ? 'bg-red-50 border-red-200' :
                              meddpicScore < 80 ? 'bg-yellow-50 border-yellow-200' :
                              'bg-green-50 border-green-200'
                            }`}>
                              <div className={`flex items-center gap-2 text-sm font-medium ${
                                meddpicScore < 50 ? 'text-red-700' :
                                meddpicScore < 80 ? 'text-yellow-700' :
                                'text-green-700'
                              }`}>
                                {meddpicScore < 50 ? <Warning size={14} /> : <CheckCircle size={14} />}
                                {meddpicScore < 50 ? 'High Risk' :
                                 meddpicScore < 80 ? 'Medium Risk' :
                                 'Low Risk'}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {meddpicScore < 50 ? 'Requires attention on multiple criteria' :
                                 meddpicScore < 80 ? 'Some areas need improvement' :
                                 'Deal is well qualified and positioned'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Activity Metrics */}
                      <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <ChartBar size={16} className="text-purple-600" />
                            Activity Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">
                                {safeOpportunity.activities?.length || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Total Activities</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold text-green-600">
                                {safeOpportunity.activities?.filter(a => a.type === 'meeting').length || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Meetings</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold text-purple-600">
                                {safeOpportunity.activities?.filter(a => a.type === 'call').length || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Calls</div>
                            </div>
                            <div className="text-center p-3 bg-muted/30 rounded-lg">
                              <div className="text-lg font-bold text-orange-600">
                                {safeOpportunity.activities?.filter(a => a.outcome === 'positive').length || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">Positive Outcomes</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                            <span className="text-lg font-bold text-primary">{Math.round(stageProgress)}%</span>
                          </div>
                        </div>
                        <Progress value={stageProgress} className="h-2 mt-3" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {PEAK_STAGES.map((stage, index) => {
                          const isCurrentStage = stage.value === safeOpportunity.stage;
                          const isPastStage = PEAK_STAGES.findIndex(s => s.value === safeOpportunity.stage) > index;
                          const stageScore = safeOpportunity.peakScores?.[stage.value] || 0;
                          
                          return (
                            <Card key={stage.value} className={`border transition-all ${
                              isCurrentStage ? 'border-primary bg-primary/5' : 
                              isPastStage ? 'border-green-200 bg-green-50/50' : 
                              'border-border bg-muted/20'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full shrink-0 ${
                                    isCurrentStage ? 'bg-primary text-primary-foreground' :
                                    isPastStage ? 'bg-green-500 text-white' :
                                    'bg-muted text-muted-foreground'
                                  }`}>
                                    {isPastStage ? <CheckCircle size={16} /> :
                                     isCurrentStage ? <ClockCounterClockwise size={16} /> :
                                     <Circle size={16} />}
                                  </div>
                                  <div className="flex-1 space-y-2 min-w-0">
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
                                    
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>Stage Score</span>
                                        <span className="font-medium">{stageScore}%</span>
                                      </div>
                                      <Progress value={stageScore} className="h-1" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </CardContent>
                    </Card>
                    
                    {/* PEAK Score Breakdown */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <ChartBar size={16} className="text-blue-600" />
                          PEAK Score Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {PEAK_STAGES.map((stage) => {
                            const score = safeOpportunity.peakScores?.[stage.value] || 0;
                            return (
                              <div key={stage.value} className="text-center p-3 bg-muted/30 rounded-lg">
                                <div className={`text-lg font-bold ${
                                  score >= 80 ? 'text-green-600' :
                                  score >= 60 ? 'text-blue-600' :
                                  score >= 40 ? 'text-orange-600' :
                                  'text-red-600'
                                }`}>
                                  {score}%
                                </div>
                                <div className="text-xs text-muted-foreground font-medium">{stage.label}</div>
                              </div>
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
                            Complete B2B sales qualification for {safeOpportunity.name}
                          </DialogDescription>
                        </DialogHeader>
                        {/* TODO: Re-enable when MEDDPICCAssessment component is available */}
                        <div className="text-center py-8">
                          <ChartLineUp size={48} className="text-blue-600 mx-auto mb-4" />
                          <p className="text-muted-foreground">MEDDPICC Assessment component coming soon</p>
                        </div>
                        {/* 
                        <MEDDPICCAssessment
                          opportunityId={safeOpportunity.id}
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
                    {/* Primary Contact */}
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

                    {/* All Opportunity Contacts */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Users size={16} className="text-purple-600" />
                            All Contacts ({safeOpportunity.contacts?.length || 0})
                          </CardTitle>
                          <Button variant="outline" size="sm" disabled>
                            <Plus size={14} className="mr-1" />
                            Add Contact
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {safeOpportunity.contacts && Array.isArray(safeOpportunity.contacts) && safeOpportunity.contacts.length > 0 ? (
                          <div className="space-y-3">
                            {safeOpportunity.contacts.map((contact, index) => (
                              <div key={contact.id || index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                                <Avatar className="h-10 w-10 border border-gray-200 shrink-0">
                                  <AvatarImage src={contact.avatarUrl} />
                                  <AvatarFallback className="bg-gray-100 text-gray-600 font-medium text-xs">
                                    {contact.name ? contact.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UN'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <div className="font-medium text-sm truncate">
                                      {contact.name || 'Unknown Contact'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Badge variant={
                                        contact.influence === 'high' ? 'default' :
                                        contact.influence === 'medium' ? 'secondary' :
                                        'outline'
                                      } className="text-xs px-2 py-0">
                                        {contact.influence || 'low'} influence
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground truncate">
                                      {contact.role || 'No role specified'}
                                    </div>
                                    <Badge variant={
                                      contact.sentiment === 'champion' ? 'default' :
                                      contact.sentiment === 'neutral' ? 'secondary' :
                                      'destructive'
                                    } className="text-xs px-2 py-0">
                                      {contact.sentiment || 'neutral'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users size={24} className="text-purple-600 mx-auto mb-2" />
                            <div className="space-y-1">
                              <div className="font-medium text-sm">No Contacts Added</div>
                              <div className="text-xs text-muted-foreground">
                                Add stakeholders to track decision makers and influencers
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3" disabled>
                              <Plus size={14} className="mr-1" />
                              Add First Contact
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Contact Analytics */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <ChartBar size={16} className="text-green-600" />
                          Contact Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {safeOpportunity.contacts?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Total Contacts</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {safeOpportunity.contacts?.filter(c => c.sentiment === 'champion').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Champions</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">
                              {safeOpportunity.contacts?.filter(c => c.influence === 'high').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">High Influence</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-red-600">
                              {safeOpportunity.contacts?.filter(c => c.sentiment === 'detractor').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Detractors</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activities" className="mt-0 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <ClockCounterClockwise size={16} className="text-purple-600" />
                            Activity Timeline ({safeOpportunity.activities?.length || 0})
                          </CardTitle>
                          <Button variant="outline" size="sm" disabled>
                            <Plus size={14} className="mr-1" />
                            Add Activity
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {safeOpportunity.activities && Array.isArray(safeOpportunity.activities) && safeOpportunity.activities.length > 0 ? (
                          <div className="space-y-4">
                            {safeOpportunity.activities.map((activity, index) => (
                              <div key={activity.id || index} className="flex gap-3 p-3 rounded-lg bg-muted/30 border">
                                <div className={`p-2 rounded-full shrink-0 ${
                                  activity.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                                  activity.type === 'call' ? 'bg-green-100 text-green-600' :
                                  activity.type === 'email' ? 'bg-purple-100 text-purple-600' :
                                  activity.type === 'demo' ? 'bg-orange-100 text-orange-600' :
                                  activity.type === 'proposal' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {activity.type === 'meeting' ? <Users size={14} /> :
                                   activity.type === 'call' ? <Phone size={14} /> :
                                   activity.type === 'email' ? <Envelope size={14} /> :
                                   activity.type === 'demo' ? <ChartBar size={14} /> :
                                   activity.type === 'proposal' ? <FileText size={14} /> :
                                   <ClockCounterClockwise size={14} />}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm capitalize">
                                        {activity.type || 'Activity'}
                                      </span>
                                      <Badge variant={
                                        activity.outcome === 'positive' ? 'default' :
                                        activity.outcome === 'negative' ? 'destructive' :
                                        'secondary'
                                      } className="text-xs px-2 py-0">
                                        {activity.outcome || 'neutral'}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {formatSafeDate(activity.date, 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                  {activity.notes && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                      {activity.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            <div className="text-center py-4 border-t">
                              <Button variant="ghost" size="sm" disabled>
                                Load More Activities
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <ClockCounterClockwise size={24} className="text-purple-600 mx-auto mb-2" />
                            <div className="space-y-1">
                              <div className="font-medium text-sm">No Activities Yet</div>
                              <div className="text-xs text-muted-foreground">
                                Track meetings, calls, and interactions with your prospect
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="mt-3" disabled>
                              <Plus size={14} className="mr-1" />
                              Add First Activity
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Activity Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <ChartBar size={16} className="text-green-600" />
                          Activity Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {safeOpportunity.activities?.filter(a => a.type === 'meeting').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Meetings</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {safeOpportunity.activities?.filter(a => a.type === 'call').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Calls</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">
                              {safeOpportunity.activities?.filter(a => a.type === 'email').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Emails</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">
                              {safeOpportunity.activities?.filter(a => a.outcome === 'positive').length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Positive Outcomes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Last Activity */}
                    {safeOpportunity.activities && safeOpportunity.activities.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <ClockCounterClockwise size={16} className="text-amber-600" />
                            Last Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const lastActivity = safeOpportunity.activities[safeOpportunity.activities.length - 1];
                            return (
                              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <div className={`p-2 rounded-full shrink-0 ${
                                  lastActivity.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                                  lastActivity.type === 'call' ? 'bg-green-100 text-green-600' :
                                  lastActivity.type === 'email' ? 'bg-purple-100 text-purple-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {lastActivity.type === 'meeting' ? <Users size={14} /> :
                                   lastActivity.type === 'call' ? <Phone size={14} /> :
                                   lastActivity.type === 'email' ? <Envelope size={14} /> :
                                   <ClockCounterClockwise size={14} />}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm capitalize text-amber-900">
                                      {lastActivity.type || 'Activity'}
                                    </span>
                                    <span className="text-xs text-amber-700">
                                      {formatSafeDate(lastActivity.date, 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                  {lastActivity.notes && (
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                      {lastActivity.notes}
                                    </p>
                                  )}
                                  <Badge 
                                    variant="secondary" 
                                    className={`mt-2 text-xs ${
                                      lastActivity.outcome === 'positive' ? 'bg-green-100 text-green-700' :
                                      lastActivity.outcome === 'negative' ? 'bg-red-100 text-red-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {lastActivity.outcome || 'neutral'} outcome
                                  </Badge>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}
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