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
import { Target, TrendingUp, Users, Filter, Search, Brain, Star } from '@phosphor-icons/react';
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
      const contactsToScore = contacts.slice(0, 10); // Limit to prevent rate limiting
      
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
          } else {
            newScores.push(existingScore);
          }
        }
      }
      
      // Merge with existing scores, replacing old ones
      const updatedScores = [...leadScores.filter(s => !newScores.find(ns => ns.contactId === s.contactId)), ...newScores];
      setLeadScores(updatedScores);
      
      toast.success(`Generated AI scores for ${newScores.filter(s => !leadScores.find(ls => ls.contactId === s.contactId)).length} new leads`);
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

  // Statistics
  const gradeDistribution = leadScores.reduce((acc, lead) => {
    acc[lead.grade] = (acc[lead.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageScore = leadScores.length > 0 
    ? leadScores.reduce((sum, lead) => sum + lead.score, 0) / leadScores.length 
    : 0;

  const highValueLeads = leadScores.filter(lead => lead.estimatedValue > 100000).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lead Scoring</h2>
            <p className="text-gray-600">AI-powered lead qualification and prioritization</p>
          </div>
        </div>
        <Button 
          onClick={scoreAllContacts}
          disabled={isScoring}
          className="flex items-center space-x-2"
        >
          <Brain className="h-4 w-4" />
          <span>{isScoring ? 'Scoring...' : 'Score All Leads'}</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
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
          <CardContent className="p-6">
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
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">A & B Grades</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(gradeDistribution.A || 0) + (gradeDistribution.B || 0)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Value</p>
                <p className="text-2xl font-bold text-gray-900">{highValueLeads}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}