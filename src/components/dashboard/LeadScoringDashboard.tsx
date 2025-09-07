import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, TrendingUp, Users, Filter, Search, Brain, Star, ChartBar, Lightning, Trophy, Clock } from '@phosphor-icons/react';
import { LeadScore, Contact, Company, ScoringFactor } from '@/lib/types';
import { AIService } from '@/lib/ai-service';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface LeadScoringDashboardProps {
  contacts: Contact[];
  companies: Company[];
  onContactSelect?: (contact: Contact) => void;
}

export function LeadScoringDashboard({ contacts, companies, onContactSelect }: LeadScoringDashboardProps) {
  const [leadScores, setLeadScores] = useKV<LeadScore[]>('ai-lead-scores', []);
  const [isScoring, setIsScoring] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score');
  const [selectedLead, setSelectedLead] = useState<LeadScore | null>(null);
  const [bulkScoreCount, setBulkScoreCount] = useState(10);

  // Auto-generate demo scores if none exist and we have contacts
  useEffect(() => {
    if (leadScores.length === 0 && contacts.length > 0 && companies.length > 0) {
      generateDemoScores();
    }
  }, [contacts, companies, leadScores.length]);

  const generateDemoScores = () => {
    const demoScores: LeadScore[] = contacts.slice(0, 8).map((contact, index) => {
      const company = companies.find(c => c.id === contact.companyId);
      if (!company) return null;

      // Generate realistic but varied demo scores
      const baseScore = Math.max(20, Math.min(95, 45 + Math.random() * 40 + (index % 3 === 0 ? 20 : 0)));
      const grade = baseScore >= 80 ? 'A' : baseScore >= 65 ? 'B' : baseScore >= 50 ? 'C' : baseScore >= 35 ? 'D' : 'F';
      
      const scoringFactors: ScoringFactor[] = [
        {
          name: 'Company Fit',
          value: Math.round(baseScore + Math.random() * 20 - 10),
          weight: 0.9,
          category: 'firmographic',
          description: `${company.industry} company with ${company.size} employees matches target profile`,
          impact: 'positive'
        },
        {
          name: 'Contact Authority',
          value: Math.round(baseScore + Math.random() * 15 - 5),
          weight: 0.8,
          category: 'demographic',
          description: `${contact.title} has decision-making influence`,
          impact: contact.role === 'decision-maker' ? 'positive' : 'neutral'
        },
        {
          name: 'Engagement Level',
          value: Math.round(Math.random() * 80 + 20),
          weight: 0.7,
          category: 'behavioral',
          description: 'Recent interaction and response patterns',
          impact: 'positive'
        },
        {
          name: 'Budget Indicators',
          value: Math.round(baseScore + Math.random() * 25 - 10),
          weight: 0.85,
          category: 'intent',
          description: 'Company size and industry suggest adequate budget allocation',
          impact: 'positive'
        },
        {
          name: 'Timing Signals',
          value: Math.round(Math.random() * 70 + 30),
          weight: 0.6,
          category: 'behavioral',
          description: 'Market timing and company growth indicators',
          impact: 'positive'
        }
      ];

      const urgencyScore = Math.min(10, Math.max(1, Math.round(3 + (baseScore / 10) + Math.random() * 3)));
      
      return {
        id: `demo-score-${contact.id}`,
        contactId: contact.id,
        score: Math.round(baseScore),
        grade: grade as 'A' | 'B' | 'C' | 'D' | 'F',
        factors: scoringFactors,
        predictedConversionProbability: Math.round(Math.max(10, Math.min(85, baseScore * 0.8 + Math.random() * 15))),
        estimatedValue: Math.round((50000 + Math.random() * 150000) * (baseScore / 100)),
        timeToConversion: Math.round(30 + Math.random() * 120 + (90 - baseScore) * 0.5),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
        aiInsights: {
          strengths: [
            `Strong fit for ${company.industry} vertical`,
            `${contact.title} role indicates decision authority`,
            'Company size supports adequate budget'
          ].slice(0, 2 + Math.floor(Math.random() * 2)),
          weaknesses: [
            'Limited recent engagement data',
            'Competitive market presence',
            'Timeline uncertainty'
          ].slice(0, 1 + Math.floor(Math.random() * 2)),
          recommendations: [
            `Schedule discovery call with ${contact.firstName}`,
            `Research ${company.name}'s recent initiatives`,
            'Identify additional stakeholders',
            'Prepare industry-specific value proposition'
          ].slice(0, 2 + Math.floor(Math.random() * 2)),
          competitorRisk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
          urgencyScore
        }
      };
    }).filter(Boolean) as LeadScore[];

    setLeadScores(demoScores);
    toast.success(`Generated ${demoScores.length} demo lead scores to showcase AI capabilities`);
  };

  // Filter and sort leads
  const filteredLeads = leadScores
    .filter(lead => {
      const contact = contacts.find(c => c.id === lead.contactId);
      const company = companies.find(c => c.id === contact?.companyId);
      const matchesSearch = !searchTerm || 
        `${contact?.firstName} ${contact?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = gradeFilter === 'all' || lead.grade === gradeFilter;
      return matchesSearch && matchesGrade;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.score - a.score;
        case 'conversion': return b.predictedConversionProbability - a.predictedConversionProbability;
        case 'value': return b.estimatedValue - a.estimatedValue;
        case 'urgency': return b.aiInsights.urgencyScore - a.aiInsights.urgencyScore;
        default: return b.score - a.score;
      }
    });

  const scoreAllContacts = async () => {
    if (contacts.length === 0) {
      toast.error('No contacts available for scoring');
      return;
    }

    setIsScoring(true);
    try {
      const newScores: LeadScore[] = [];
      const contactsToScore = contacts.slice(0, bulkScoreCount); // Use configurable limit
      
      toast.info(`Starting AI analysis for ${contactsToScore.length} contacts...`);
      
      for (const contact of contactsToScore) {
        const company = companies.find(c => c.id === contact.companyId);
        if (company) {
          // Check if we already have a recent score
          const existingScore = leadScores.find(s => s.contactId === contact.id);
          const isRecentScore = existingScore && 
            (new Date().getTime() - new Date(existingScore.lastUpdated).getTime()) < 24 * 60 * 60 * 1000; // 24 hours
          
          if (!isRecentScore) {
            const score = await AIService.calculateLeadScore(contact, company);
            newScores.push(score);
            toast.info(`Scored ${contact.firstName} ${contact.lastName}: Grade ${score.grade}`);
          } else {
            newScores.push(existingScore);
          }
        }
      }
      
      // Merge with existing scores, replacing old ones
      const updatedScores = [...leadScores.filter(s => !newScores.find(ns => ns.contactId === s.contactId)), ...newScores];
      setLeadScores(updatedScores);
      
      const newScoreCount = newScores.filter(s => !leadScores.find(ls => ls.contactId === s.contactId)).length;
      toast.success(`Generated AI scores for ${newScoreCount} new leads`);
    } catch (error) {
      toast.error('Lead scoring failed');
      console.error(error);
    }
    setIsScoring(false);
  };

  const scoreIndividualLead = async (contact: Contact) => {
    const company = companies.find(c => c.id === contact.companyId);
    if (!company) {
      toast.error('Company not found for this contact');
      return;
    }

    try {
      const score = await AIService.calculateLeadScore(contact, company);
      const updatedScores = leadScores.filter(s => s.contactId !== contact.id);
      setLeadScores([...updatedScores, score]);
      toast.success(`Updated score for ${contact.firstName} ${contact.lastName}`);
    } catch (error) {
      toast.error('Failed to score individual lead');
      console.error(error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: number) => {
    if (urgency >= 8) return 'text-red-600';
    if (urgency >= 6) return 'text-orange-600';
    if (urgency >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Advanced Statistics
  const gradeDistribution = leadScores.reduce((acc, lead) => {
    acc[lead.grade] = (acc[lead.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageScore = leadScores.length > 0 
    ? leadScores.reduce((sum, lead) => sum + lead.score, 0) / leadScores.length 
    : 0;

  const highValueLeads = leadScores.filter(lead => lead.estimatedValue > 100000).length;
  const hotLeads = leadScores.filter(lead => lead.aiInsights.urgencyScore >= 8).length;
  const totalPipelineValue = leadScores.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const avgConversionTime = leadScores.length > 0 
    ? leadScores.reduce((sum, lead) => sum + lead.timeToConversion, 0) / leadScores.length 
    : 0;
  const highConversionLeads = leadScores.filter(lead => lead.predictedConversionProbability >= 70).length;

  // Trend analysis
  const topLeads = filteredLeads.slice(0, 10);
  const leadsByIndustry = leadScores.reduce((acc, lead) => {
    const contact = contacts.find(c => c.id === lead.contactId);
    const company = companies.find(c => c.id === contact?.companyId);
    if (company) {
      const industry = company.industry;
      if (!acc[industry]) {
        acc[industry] = { count: 0, avgScore: 0, totalValue: 0 };
      }
      acc[industry].count++;
      acc[industry].avgScore += lead.score;
      acc[industry].totalValue += lead.estimatedValue;
    }
    return acc;
  }, {} as Record<string, { count: number; avgScore: number; totalValue: number }>);

  // Calculate industry averages
  Object.keys(leadsByIndustry).forEach(industry => {
    leadsByIndustry[industry].avgScore = leadsByIndustry[industry].avgScore / leadsByIndustry[industry].count;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Lead Scoring</h2>
            <p className="text-gray-600">Intelligent prospect prioritization and qualification</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={generateDemoScores}
            className="flex items-center space-x-2"
          >
            <Star className="h-4 w-4" />
            <span>Demo Scores</span>
          </Button>
          <Select value={bulkScoreCount.toString()} onValueChange={(v) => setBulkScoreCount(parseInt(v))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={scoreAllContacts}
            disabled={isScoring}
            className="flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>{isScoring ? 'Scoring...' : `Score ${bulkScoreCount} Leads`}</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Scored</p>
                <p className="text-2xl font-bold text-gray-900">{leadScores.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averageScore)}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
                <p className="text-xs text-gray-500">Urgency 8+</p>
              </div>
              <Lightning className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">A & B Grades</p>
                <p className="text-2xl font-bold text-green-600">
                  {(gradeDistribution.A || 0) + (gradeDistribution.B || 0)}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-xl font-bold text-purple-600">
                  ${(totalPipelineValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Timeline</p>
                <p className="text-xl font-bold text-indigo-600">{Math.round(avgConversionTime)}d</p>
              </div>
              <Clock className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Leads Summary */}
      {topLeads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Top Priority Leads</span>
            </CardTitle>
            <CardDescription>
              Your highest-scoring prospects requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {topLeads.slice(0, 5).map((lead) => {
                const contact = contacts.find(c => c.id === lead.contactId);
                const company = companies.find(c => c.id === contact?.companyId);
                
                if (!contact || !company) return null;

                return (
                  <div key={lead.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => setSelectedLead(lead)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {contact.firstName[0]}{contact.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{company.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getGradeColor(lead.grade)}>
                        {lead.grade}
                      </Badge>
                      <span className="text-lg font-bold">{lead.score}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div>${(lead.estimatedValue / 1000).toFixed(0)}K</div>
                      <div>{lead.predictedConversionProbability}% likely</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Label htmlFor="search">Search leads</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="grade-filter">Grade</Label>
              <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger id="grade-filter" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="A">Grade A</SelectItem>
                  <SelectItem value="B">Grade B</SelectItem>
                  <SelectItem value="C">Grade C</SelectItem>
                  <SelectItem value="D">Grade D</SelectItem>
                  <SelectItem value="F">Grade F</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort-by">Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="conversion">Conversion %</SelectItem>
                  <SelectItem value="value">Est. Value</SelectItem>
                  <SelectItem value="urgency">Urgency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lead List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {filteredLeads.length > 0 ? (
            <div className="space-y-4">
              {filteredLeads.map((lead) => {
                const contact = contacts.find(c => c.id === lead.contactId);
                const company = companies.find(c => c.id === contact?.companyId);
                
                if (!contact || !company) return null;

                return (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {contact.firstName[0]}{contact.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {contact.firstName} {contact.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {contact.title} at {company.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {company.industry} • {company.size}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className={`text-3xl font-bold rounded-lg px-3 py-2 ${getScoreColor(lead.score)}`}>
                                  {lead.score}
                                </div>
                                <Badge className={getGradeColor(lead.grade)}>
                                  Grade {lead.grade}
                                </Badge>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLead(lead);
                                  }}
                                >
                                  View Details
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    scoreIndividualLead(contact);
                                  }}
                                >
                                  Rescore
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Conversion Probability</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <Progress value={lead.predictedConversionProbability} className="flex-1" />
                                <span className="font-medium">{lead.predictedConversionProbability}%</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Est. Value</span>
                              <p className="font-semibold text-green-600">
                                ${lead.estimatedValue.toLocaleString()}
                              </p>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Timeline</span>
                              <p className="font-medium">{lead.timeToConversion} days</p>
                            </div>
                            
                            <div>
                              <span className="text-gray-600">Urgency</span>
                              <p className={`font-bold ${getUrgencyColor(lead.aiInsights.urgencyScore)}`}>
                                {lead.aiInsights.urgencyScore}/10
                              </p>
                            </div>
                          </div>
                          
                          {/* Scoring Factors Preview */}
                          <div className="mt-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">Top Scoring Factors</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {lead.factors.slice(0, 3).map((factor, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    factor.impact === 'positive' ? 'border-green-300 text-green-700' : 
                                    factor.impact === 'negative' ? 'border-red-300 text-red-700' : 
                                    'border-gray-300'
                                  }`}
                                >
                                  {factor.name}: {factor.value}/100
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* AI Insights Preview */}
                          {lead.aiInsights.recommendations.length > 0 && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-start space-x-2">
                                <Brain className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-blue-900">Next Best Action</p>
                                  <p className="text-sm text-blue-700">
                                    {lead.aiInsights.recommendations[0]}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {leadScores.length === 0 ? 'No Lead Scores Yet' : 'No Matching Leads'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {leadScores.length === 0 
                    ? 'Click "Score All Leads" to generate AI-powered lead scoring'
                    : 'Try adjusting your search or filter criteria'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Industry Analysis */}
            {Object.keys(leadsByIndustry).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChartBar className="h-5 w-5 text-blue-600" />
                    <span>Industry Performance Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    Lead scoring performance by industry vertical
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(leadsByIndustry)
                      .sort(([,a], [,b]) => b.avgScore - a.avgScore)
                      .slice(0, 6)
                      .map(([industry, stats]) => (
                        <div key={industry} className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">{industry}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Leads:</span>
                              <span className="font-medium">{stats.count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Avg Score:</span>
                              <span className="font-medium">{Math.round(stats.avgScore)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Value:</span>
                              <span className="font-medium text-green-600">
                                ${(stats.totalValue / 1000).toFixed(0)}K
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Lead quality breakdown across all scored prospects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {['A', 'B', 'C', 'D', 'F'].map(grade => {
                    const count = gradeDistribution[grade] || 0;
                    const percentage = leadScores.length > 0 ? (count / leadScores.length) * 100 : 0;
                    
                    return (
                      <div key={grade} className="text-center p-4 border rounded-lg">
                        <div className={`text-2xl font-bold mb-1 ${getGradeColor(grade)} rounded px-2 py-1 inline-block`}>
                          {grade}
                        </div>
                        <div className="text-xl font-semibold text-gray-900">{count}</div>
                        <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Lead Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Lead Score Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedLead && (() => {
            const contact = contacts.find(c => c.id === selectedLead.contactId);
            const company = companies.find(c => c.id === contact?.companyId);
            
            if (!contact || !company) return null;

            return (
              <div className="space-y-6">
                {/* Contact Header */}
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <p className="text-gray-600">{contact.title} at {company.name}</p>
                    <p className="text-sm text-gray-500">{company.industry} • {company.size}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className={`text-3xl font-bold rounded-lg px-4 py-2 ${getScoreColor(selectedLead.score)}`}>
                        {selectedLead.score}
                      </div>
                      <Badge className={getGradeColor(selectedLead.grade)} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        Grade {selectedLead.grade}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedLead.predictedConversionProbability}%
                        </div>
                        <div className="text-sm text-gray-600">Conversion Likelihood</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          ${(selectedLead.estimatedValue / 1000).toFixed(0)}K
                        </div>
                        <div className="text-sm text-gray-600">Estimated Value</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedLead.timeToConversion}d
                        </div>
                        <div className="text-sm text-gray-600">Expected Timeline</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getUrgencyColor(selectedLead.aiInsights.urgencyScore)}`}>
                          {selectedLead.aiInsights.urgencyScore}/10
                        </div>
                        <div className="text-sm text-gray-600">Urgency Score</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Scoring Factors */}
                <Card>
                  <CardHeader>
                    <CardTitle>Scoring Factors</CardTitle>
                    <CardDescription>
                      Detailed breakdown of factors contributing to this lead's score
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedLead.factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">{factor.name}</span>
                              <Badge 
                                variant="outline" 
                                className={factor.impact === 'positive' ? 'text-green-700 border-green-300' : 
                                          factor.impact === 'negative' ? 'text-red-700 border-red-300' : 
                                          'text-gray-700'}
                              >
                                {factor.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                            <div className="flex items-center space-x-2">
                              <Progress value={factor.value} className="flex-1" />
                              <span className="text-sm font-medium">{factor.value}/100</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <span>AI Insights & Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="recommendations" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                        <TabsTrigger value="strengths">Strengths</TabsTrigger>
                        <TabsTrigger value="weaknesses">Risks</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="recommendations">
                        <div className="space-y-3">
                          {selectedLead.aiInsights.recommendations.map((rec, index) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                              <p className="text-sm text-blue-900">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="strengths">
                        <div className="space-y-3">
                          {selectedLead.aiInsights.strengths.map((strength, index) => (
                            <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                              <p className="text-sm text-green-900">{strength}</p>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="weaknesses">
                        <div className="space-y-3">
                          {selectedLead.aiInsights.weaknesses.map((weakness, index) => (
                            <div key={index} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                              <p className="text-sm text-orange-900">{weakness}</p>
                            </div>
                          ))}
                          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-900">
                              Competitor Risk: {selectedLead.aiInsights.competitorRisk.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}