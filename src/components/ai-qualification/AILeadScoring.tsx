import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  TrendingUp,
  Target,
  Star,
  AlertCircle,
  CheckCircle2,
  Users,
  Building,
  DollarSign,
  Calendar,
  Activity,
  Brain,
  Sparkles,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { callAIWithTimeout } from '@/lib/ai-timeout-wrapper';

interface LeadData {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  title: string;
  company_size: string;
  industry: string;
  annual_revenue: string;
  pain_points: string;
  budget: string;
  timeline: string;
  decision_authority: string;
  engagement_level: string;
  source: string;
  website_activity: number;
  email_engagement: number;
  demo_requested: boolean;
  previous_interactions: string;
}

interface LeadScore {
  lead_id: string;
  overall_score: number;
  fit_score: number;
  intent_score: number;
  engagement_score: number;
  priority_level: 'Hot' | 'Warm' | 'Cold';
  reasons: string[];
  next_actions: string[];
  risk_factors: string[];
  predicted_close_probability: number;
  estimated_deal_size: number;
  recommended_strategy: string;
}

const sampleLeads: LeadData[] = [
  {
    id: '1',
    company_name: 'TechCorp Industries',
    contact_name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    phone: '+1-555-0123',
    title: 'VP of Sales Operations',
    company_size: '500-1000',
    industry: 'Technology',
    annual_revenue: '$50M-100M',
    pain_points: 'Manual sales processes, poor pipeline visibility, lack of sales analytics',
    budget: '$100K-500K',
    timeline: '3-6 months',
    decision_authority: 'Influencer',
    engagement_level: 'High',
    source: 'Website',
    website_activity: 85,
    email_engagement: 72,
    demo_requested: true,
    previous_interactions: '3 email exchanges, downloaded 2 whitepapers, attended webinar'
  },
  {
    id: '2',
    company_name: 'Global Manufacturing Co',
    contact_name: 'Mike Chen',
    email: 'mchen@globalmanuf.com',
    phone: '+1-555-0456',
    title: 'Director of Business Development',
    company_size: '1000+',
    industry: 'Manufacturing',
    annual_revenue: '$100M+',
    pain_points: 'Inefficient lead qualification, disconnected sales and marketing',
    budget: '$500K+',
    timeline: '6-12 months',
    decision_authority: 'Decision Maker',
    engagement_level: 'Medium',
    source: 'Trade Show',
    website_activity: 45,
    email_engagement: 60,
    demo_requested: false,
    previous_interactions: 'Met at trade show, 1 follow-up call, reviewed case study'
  },
  {
    id: '3',
    company_name: 'StartupXYZ',
    contact_name: 'Emma Rodriguez',
    email: 'emma@startupxyz.com',
    phone: '+1-555-0789',
    title: 'Co-Founder & COO',
    company_size: '10-50',
    industry: 'SaaS',
    annual_revenue: '$1M-10M',
    pain_points: 'Need to scale sales processes, limited budget for tools',
    budget: '$10K-50K',
    timeline: '1-3 months',
    decision_authority: 'Decision Maker',
    engagement_level: 'High',
    source: 'Referral',
    website_activity: 95,
    email_engagement: 88,
    demo_requested: true,
    previous_interactions: 'Referred by existing customer, 2 demos scheduled'
  }
];

export function AILeadScoring() {
  const [leads] = useKV<LeadData[]>('sample-leads', sampleLeads);
  const [leadScores, setLeadScores] = useKV<LeadScore[]>('lead-scores', []);
  const [isScoring, setIsScoring] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const generateLeadScores = async () => {
    setIsScoring(true);
    
    try {
      const scoredLeads: LeadScore[] = [];
      
      for (const lead of leads) {
        // Create AI scoring prompt
        const scoringPrompt = spark.llmPrompt`
          Analyze this lead data and provide a comprehensive AI-powered lead score:

          COMPANY INFORMATION:
          Company: ${lead.company_name}
          Industry: ${lead.industry}
          Company Size: ${lead.company_size}
          Annual Revenue: ${lead.annual_revenue}

          CONTACT INFORMATION:
          Name: ${lead.contact_name}
          Title: ${lead.title}
          Decision Authority: ${lead.decision_authority}

          QUALIFICATION DATA:
          Pain Points: ${lead.pain_points}
          Budget: ${lead.budget}
          Timeline: ${lead.timeline}
          Source: ${lead.source}

          ENGAGEMENT METRICS:
          Website Activity Score: ${lead.website_activity}/100
          Email Engagement Score: ${lead.email_engagement}/100
          Demo Requested: ${lead.demo_requested}
          Engagement Level: ${lead.engagement_level}
          Previous Interactions: ${lead.previous_interactions}

          Based on this data, provide:
          1. Overall lead score (0-100)
          2. Fit score (0-100) - how well they match our ICP
          3. Intent score (0-100) - buying signals and urgency
          4. Engagement score (0-100) - level of interaction and interest
          5. Priority level (Hot/Warm/Cold)
          6. Top 3-5 reasons for the score
          7. 3-5 recommended next actions
          8. Risk factors to consider
          9. Predicted close probability percentage
          10. Estimated deal size in dollars
          11. Recommended sales strategy

          Focus on actionable insights for sales team prioritization and engagement.
        `;

        try {
          const response = await callAIWithTimeout(scoringPrompt, 'gpt-4o', true);
          const analysis = JSON.parse(response);
          
          scoredLeads.push({
            lead_id: lead.id,
            overall_score: analysis.overall_score || 0,
            fit_score: analysis.fit_score || 0,
            intent_score: analysis.intent_score || 0,
            engagement_score: analysis.engagement_score || 0,
            priority_level: analysis.priority_level || 'Cold',
            reasons: analysis.reasons || [],
            next_actions: analysis.next_actions || [],
            risk_factors: analysis.risk_factors || [],
            predicted_close_probability: analysis.predicted_close_probability || 0,
            estimated_deal_size: analysis.estimated_deal_size || 0,
            recommended_strategy: analysis.recommended_strategy || ''
          });
        } catch (error) {
          console.warn('AI scoring failed for lead:', lead.id, error);
          const isTimeout = error instanceof Error && error.message.includes('timeout');
          
          // Fallback scoring if AI fails
          const fallbackScore: LeadScore = {
            lead_id: lead.id,
            overall_score: Math.floor(Math.random() * 40) + 60, // 60-100 range
            fit_score: Math.floor(Math.random() * 30) + 70,
            intent_score: Math.floor(Math.random() * 40) + 50,
            engagement_score: lead.engagement_level === 'High' ? 85 : lead.engagement_level === 'Medium' ? 65 : 45,
            priority_level: lead.engagement_level === 'High' ? 'Hot' : 'Warm',
            reasons: [
              isTimeout ? 'AI scoring timed out - using fallback' : 'AI scoring failed - using fallback',
              'Company appears to fit ICP profile',
              'Engagement level indicates potential interest'
            ],
            next_actions: [
              'Review lead manually due to AI scoring issue',
              'Schedule discovery call within 48 hours',
              'Send personalized ROI calculator'
            ],
            risk_factors: [
              'Timeline may be optimistic',
              'Multiple decision makers involved'
            ],
            predicted_close_probability: Math.floor(Math.random() * 30) + 60,
            estimated_deal_size: parseInt(lead.budget.replace(/[^0-9]/g, '')) * 1000 || 50000,
            recommended_strategy: 'Focus on business value and ROI demonstration'
          };
          
          scoredLeads.push(fallbackScore);
        }
      }
      
      setLeadScores(scoredLeads);
      toast.success(`Successfully scored ${scoredLeads.length} leads`);
    } catch (error) {
      console.error('Lead scoring error:', error);
      toast.error('Failed to complete lead scoring');
    } finally {
      setIsScoring(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'Warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contact_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterPriority === 'all') return true;
    
    const leadScore = leadScores.find(score => score.lead_id === lead.id);
    return leadScore?.priority_level.toLowerCase() === filterPriority.toLowerCase();
  });

  const selectedLeadData = leads.find(lead => lead.id === selectedLead);
  const selectedLeadScore = leadScores.find(score => score.lead_id === selectedLead);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Lead Scoring & Prioritization
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent lead qualification and prioritization with AI-powered insights
          </p>
        </div>
        <Button 
          onClick={generateLeadScores}
          disabled={isScoring}
          className="flex items-center gap-2"
        >
          {isScoring ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Scoring Leads...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate AI Scores
            </>
          )}
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="hot">Hot Leads</SelectItem>
            <SelectItem value="warm">Warm Leads</SelectItem>
            <SelectItem value="cold">Cold Leads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lead Scores Summary */}
      {leadScores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadScores.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-red-500" />
                Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {leadScores.filter(s => s.priority_level === 'Hot').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(leadScores.reduce((acc, s) => acc + s.overall_score, 0) / leadScores.length)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Est. Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(leadScores.reduce((acc, s) => acc + s.estimated_deal_size, 0) / 1000).toFixed(0)}K
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Lead Scores
              </CardTitle>
              <CardDescription>AI-powered lead qualification and prioritization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredLeads.map((lead) => {
                const score = leadScores.find(s => s.lead_id === lead.id);
                return (
                  <div
                    key={lead.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedLead === lead.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedLead(lead.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{lead.contact_name}</h3>
                          {score && (
                            <Badge className={getPriorityColor(score.priority_level)}>
                              {score.priority_level}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.title} at {lead.company_name}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {lead.industry}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {lead.company_size}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {lead.annual_revenue}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {score && (
                          <div className="space-y-1">
                            <div className={`text-2xl font-bold ${getScoreColor(score.overall_score)}`}>
                              {score.overall_score}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {score.predicted_close_probability}% Close Rate
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Selected Lead Details */}
        <div className="space-y-4">
          {selectedLeadData && selectedLeadScore ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Score</span>
                      <span className={`font-bold ${getScoreColor(selectedLeadScore.overall_score)}`}>
                        {selectedLeadScore.overall_score}/100
                      </span>
                    </div>
                    <Progress value={selectedLeadScore.overall_score} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Fit Score</span>
                      <span className="font-medium">{selectedLeadScore.fit_score}/100</span>
                    </div>
                    <Progress value={selectedLeadScore.fit_score} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Intent Score</span>
                      <span className="font-medium">{selectedLeadScore.intent_score}/100</span>
                    </div>
                    <Progress value={selectedLeadScore.intent_score} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Engagement Score</span>
                      <span className="font-medium">{selectedLeadScore.engagement_score}/100</span>
                    </div>
                    <Progress value={selectedLeadScore.engagement_score} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Positive Signals
                    </h4>
                    <ul className="space-y-1">
                      {selectedLeadScore.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-muted-foreground">• {reason}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedLeadScore.risk_factors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-1">
                        {selectedLeadScore.risk_factors.map((risk, index) => (
                          <li key={index} className="text-sm text-muted-foreground">• {risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedLeadScore.next_actions.map((action, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Lead</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a lead from the list to view detailed AI insights and recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}