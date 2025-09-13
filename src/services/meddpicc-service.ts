/**
 * MEDDPICC Service
 * Handles data persistence, business logic, and integration with opportunity management
 */

import { MEDDPICCAnswer, MEDDPICCAssessment, MEDDPICCSession, MEDDPICCScore, MEDDPICCAnalytics } from '../types/meddpicc';
import { MEDDPICC_CONFIG, calculatePillarScore, calculateTotalScore, getScoreLevel, getCoachingPrompts } from '../data/meddpicc-config';

export class MEDDPICCService {
  private static STORAGE_KEY = "meddpicc_assessments";
  private static SESSION_KEY = "meddpicc_sessions";

  // Session Management
  static createSession(opportunityId: string, userId: string): MEDDPICCSession {
    const session: MEDDPICCSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      opportunity_id: opportunityId,
      user_id: userId,
      started_at: new Date(),
      answers: {},
      notes: ''
    };

    this.saveSession(session);
    return session;
  }

  static getSession(sessionId: string): MEDDPICCSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === sessionId) || null;
  }

  static getActiveSession(opportunityId: string, userId: string): MEDDPICCSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => 
      session.opportunity_id === opportunityId && 
      session.user_id === userId && 
      !session.completed_at
    ) || null;
  }

  static saveSession(session: MEDDPICCSession): void {
    const sessions = this.getAllSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    
    this.saveSessions(sessions);
  }

  static completeSession(sessionId: string): MEDDPICCAssessment | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    session.completed_at = new Date();
    const assessment = this.generateAssessment(session.opportunity_id, session.answers);
    session.assessment = assessment;
    
    this.saveSession(session);
    this.saveAssessment(assessment);
    
    return assessment;
  }

  // Answer Management
  static saveAnswer(sessionId: string, pillar: string, questionId: string, answerValue: string, userId: string): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const answer: MEDDPICCAnswer = {
      opportunity_id: session.opportunity_id,
      pillar,
      question_id: questionId,
      answer_value: answerValue,
      pillar_score: calculatePillarScore(pillar, { ...session.answers, [questionId]: answerValue }),
      total_score: calculateTotalScore({ ...session.answers, [questionId]: answerValue }),
      last_updated_by: userId,
      timestamp: new Date()
    };

    session.answers[questionId] = answerValue;
    this.saveSession(session);
  }

  static getAnswers(opportunityId: string): Record<string, string> {
    const assessment = this.getLatestAssessment(opportunityId);
    if (!assessment) return {};

    const sessions = this.getAllSessions();
    const latestSession = sessions
      .filter(s => s.opportunity_id === opportunityId && s.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

    return latestSession ? latestSession.answers : {};
  }

  // Assessment Management
  static generateAssessment(opportunityId: string, answers: Record<string, string>): MEDDPICCAssessment {
    const pillarScores: MEDDPICCScore[] = MEDDPICC_CONFIG.pillars.map(pillar => {
      const score = calculatePillarScore(pillar.id, answers);
      const maxScore = pillar.maxScore || 40;
      const percentage = (score / maxScore) * 100;
      
      return {
        pillar: pillar.id,
        score,
        maxScore,
        percentage,
        level: percentage >= 80 ? 'strong' : percentage >= 60 ? 'moderate' : 'weak'
      };
    });

    const totalScore = calculateTotalScore(answers);
    const maxTotalScore = MEDDPICC_CONFIG.scoring.max_score;
    const overallLevel = getScoreLevel(totalScore);
    const completionPercentage = this.calculateCompletionPercentage(answers);
    const coachingPrompts = getCoachingPrompts(answers);

    return {
      opportunity_id: opportunityId,
      pillar_scores: pillarScores,
      total_score: totalScore,
      max_total_score: maxTotalScore,
      overall_level: overallLevel,
      completion_percentage: completionPercentage,
      last_updated: new Date(),
      coaching_prompts: coachingPrompts
    };
  }

  static getLatestAssessment(opportunityId: string): MEDDPICCAssessment | null {
    const assessments = this.getAllAssessments();
    const opportunityAssessments = assessments
      .filter(a => a.opportunity_id === opportunityId)
      .sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime());
    
    return opportunityAssessments[0] || null;
  }

  static saveAssessment(assessment: MEDDPICCAssessment): void {
    const assessments = this.getAllAssessments();
    const index = assessments.findIndex(a => 
      a.opportunity_id === assessment.opportunity_id && 
      a.last_updated.getTime() === assessment.last_updated.getTime()
    );
    
    if (index >= 0) {
      assessments[index] = assessment;
    } else {
      assessments.push(assessment);
    }
    
    this.saveAssessments(assessments);
  }

  // Analytics
  static generateAnalytics(): MEDDPICCAnalytics {
    const assessments = this.getAllAssessments();
    const sessions = this.getAllSessions();
    
    // Score distribution
    const scoreDistribution = {
      strong: assessments.filter(a => a.overall_level === 'strong').length,
      moderate: assessments.filter(a => a.overall_level === 'moderate').length,
      weak: assessments.filter(a => a.overall_level === 'weak').length
    };

    // Pillar analysis
    const pillarAnalysis = MEDDPICC_CONFIG.pillars.map(pillar => {
      const pillarScores = assessments.map(a => 
        a.pillar_scores.find(ps => ps.pillar === pillar.id)?.score || 0
      );
      
      const averageScore = pillarScores.reduce((sum, score) => sum + score, 0) / pillarScores.length || 0;
      
      const commonGaps = this.identifyCommonGaps(pillar.id, assessments);
      
      return {
        pillar: pillar.id,
        average_score: averageScore,
        common_gaps: commonGaps,
        improvement_rate: this.calculateImprovementRate(pillar.id, assessments)
      };
    });

    // Win rate by score (placeholder - would integrate with actual opportunity outcomes)
    const winRateByScore = [
      { score_range: "Strong (256-320)", win_rate: 85, deal_count: scoreDistribution.strong },
      { score_range: "Moderate (192-255)", win_rate: 60, deal_count: scoreDistribution.moderate },
      { score_range: "Weak (0-191)", win_rate: 25, deal_count: scoreDistribution.weak }
    ];

    // Completion metrics
    const completedSessions = sessions.filter(s => s.completed_at);
    const completionRate = completedSessions.length / sessions.length * 100 || 0;
    
    const averageTimeToComplete = completedSessions.reduce((sum, session) => {
      const duration = new Date(session.completed_at!).getTime() - new Date(session.started_at).getTime();
      return sum + duration;
    }, 0) / completedSessions.length || 0;

    return {
      score_distribution: scoreDistribution,
      pillar_analysis: pillarAnalysis,
      win_rate_by_score: winRateByScore,
      completion_rate: completionRate,
      average_time_to_complete: averageTimeToComplete
    };
  }

  // Integration with Opportunity Service
  static async updateOpportunityMEDDPICC(opportunityId: string, assessment: MEDDPICCAssessment): Promise<void> {
    try {
      // Update opportunity record with MEDDPICC scores
      const meddpiccData = {
        meddpicc_total_score: assessment.total_score,
        meddpicc_level: assessment.overall_level,
        meddpicc_completion: assessment.completion_percentage,
        meddpicc_last_updated: assessment.last_updated,
        meddpicc_scores: assessment.pillar_scores.reduce((acc, score) => {
          acc[score.pillar] = score.score;
          return acc;
        }, {} as Record<string, number>)
      };

      // This would integrate with your existing OpportunityService
      // OpportunityService.updateOpportunity(opportunityId, meddpiccData);
      
      console.log('MEDDPICC data updated for opportunity:', opportunityId, meddpiccData);
    } catch (error) {
      console.error('Failed to update opportunity MEDDPICC data:', error);
    }
  }

  // Helper Methods
  private static calculateCompletionPercentage(answers: Record<string, string>): number {
    const totalQuestions = MEDDPICC_CONFIG.pillars.reduce((sum, pillar) => sum + pillar.questions.length, 0);
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  }

  private static identifyCommonGaps(pillarId: string, assessments: MEDDPICCAssessment[]): string[] {
    const weakAssessments = assessments.filter(a => {
      const pillarScore = a.pillar_scores.find(ps => ps.pillar === pillarId);
      return pillarScore && pillarScore.level === 'weak';
    });

    const gapFrequency: Record<string, number> = {};
    
    weakAssessments.forEach(assessment => {
      assessment.coaching_prompts
        .filter(prompt => prompt.pillar === pillarId)
        .forEach(prompt => {
          gapFrequency[prompt.prompt] = (gapFrequency[prompt.prompt] || 0) + 1;
        });
    });

    return Object.entries(gapFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([gap]) => gap);
  }

  private static calculateImprovementRate(pillarId: string, assessments: MEDDPICCAssessment[]): number {
    // Placeholder for improvement rate calculation
    // Would track score changes over time for same opportunities
    return Math.random() * 20; // Mock improvement rate
  }

  // Sample Data Generation
  static initializeSampleData(): void {
    const existingAssessments = this.getAllAssessments();
    const existingSessions = this.getAllSessions();
    
    // Only initialize if no data exists
    if (existingAssessments.length === 0 && existingSessions.length === 0) {
      this.generateSampleAssessments();
    }
  }

  private static generateSampleAssessments(): void {
    const sampleOpportunities = [
      'opp-enterprise-software-2024',
      'opp-marketing-automation-2024',
      'opp-healthcare-solution-2024',
      'opp-financial-services-2024',
      'opp-manufacturing-system-2024',
      'opp-retail-platform-2024'
    ];

    const sampleUsers = ['user-1', 'user-2', 'user-3'];
    
    sampleOpportunities.forEach((oppId, index) => {
      const userId = sampleUsers[index % sampleUsers.length];
      
      // Create a completed session
      const session = this.createSession(oppId, userId);
      
      // Generate realistic answers based on opportunity maturity
      const maturityLevel = index % 3; // 0: early, 1: mid, 2: late stage
      const answers = this.generateRealisticAnswers(maturityLevel);
      
      session.answers = answers;
      session.completed_at = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Within last 30 days
      session.notes = this.generateSampleNotes(maturityLevel);
      
      this.saveSession(session);
      
      // Complete the assessment
      this.completeAssessment(session.id, oppId, userId);
    });
    
    console.log('Sample MEDDPICC data initialized');
  }

  private static generateRealisticAnswers(maturityLevel: number): Record<string, string> {
    const answers: Record<string, string> = {};
    
    MEDDPICC_CONFIG.pillars.forEach(pillar => {
      pillar.questions.forEach((question, qIndex) => {
        // Higher maturity = better answers
        let answerQuality: 'no' | 'partial' | 'yes';
        
        if (maturityLevel === 0) { // Early stage
          answerQuality = qIndex < 2 ? 'no' : (Math.random() > 0.7 ? 'partial' : 'no');
        } else if (maturityLevel === 1) { // Mid stage
          answerQuality = Math.random() > 0.6 ? 'partial' : (Math.random() > 0.8 ? 'yes' : 'no');
        } else { // Late stage
          answerQuality = Math.random() > 0.3 ? 'yes' : (Math.random() > 0.7 ? 'partial' : 'no');
        }
        
        // Ensure realistic progression within pillars
        const validOptions = question.options.filter(opt => opt.value === answerQuality);
        if (validOptions.length > 0) {
          answers[question.id] = answerQuality;
        } else {
          // Fallback to first available option
          answers[question.id] = question.options[0].value;
        }
      });
    });
    
    return answers;
  }

  private static generateSampleNotes(maturityLevel: number): string {
    const notes = [
      // Early stage notes
      "Initial discovery meeting completed. Need to identify economic buyer and understand decision criteria better. Champion identified but needs strengthening.",
      
      // Mid stage notes  
      "Good progress on MEDDPICC qualification. Economic buyer engaged, decision criteria clarified. Competition analysis shows we're well positioned. Working on paper process timeline.",
      
      // Late stage notes
      "Strong MEDDPICC scores across all pillars. Champion actively selling for us internally. Legal review in progress. High confidence in close probability."
    ];
    
    return notes[maturityLevel] || notes[0];
  }

  // Storage Methods
  private static getAllSessions(): MEDDPICCSession[] {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((session: any) => ({
        ...session,
        started_at: new Date(session.started_at),
        completed_at: session.completed_at ? new Date(session.completed_at) : undefined
      }));
    } catch (error) {
      console.error('Error loading MEDDPICC sessions:', error);
      return [];
    }
  }

  private static saveSessions(sessions: MEDDPICCSession[]): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving MEDDPICC sessions:', error);
    }
  }

  private static getAllAssessments(): MEDDPICCAssessment[] {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored).map((assessment: any) => ({
        ...assessment,
        last_updated: new Date(assessment.last_updated)
      }));
    } catch (error) {
      console.error('Error loading MEDDPICC assessments:', error);
      return [];
    }
  }

  private static saveAssessments(assessments: MEDDPICCAssessment[]): void {
    if (typeof window === "undefined") return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessments));
    } catch (error) {
      console.error('Error saving MEDDPICC assessments:', error);
    }
  }

  // Export functionality
  static exportAssessment(opportunityId: string, format: 'json' | 'csv' | 'summary' = 'summary'): string {
    const assessment = this.getLatestAssessment(opportunityId);
    if (!assessment) return '';

    switch (format) {
      case 'json':
        return JSON.stringify(assessment, null, 2);
      
      case 'csv':
        return this.generateCSVExport(assessment);
      
      case 'summary':
      default:
        return this.generateSummaryExport(assessment);
    }
  }

  private static generateCSVExport(assessment: MEDDPICCAssessment): string {
    const headers = ['Pillar', 'Score', 'Max Score', 'Percentage', 'Level'];
    const rows = assessment.pillar_scores.map(score => [
      score.pillar,
      score.score.toString(),
      score.maxScore.toString(),
      score.percentage.toFixed(1) + '%',
      score.level
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private static generateSummaryExport(assessment: MEDDPICCAssessment): string {
    const summary = [
      `MEDDPICC Assessment Summary`,
      `Opportunity ID: ${assessment.opportunity_id}`,
      `Overall Score: ${assessment.total_score}/${assessment.max_total_score} (${assessment.overall_level.toUpperCase()})`,
      `Completion: ${assessment.completion_percentage.toFixed(1)}%`,
      `Last Updated: ${assessment.last_updated.toLocaleDateString()}`,
      '',
      'Pillar Breakdown:',
      ...assessment.pillar_scores.map(score => 
        `  ${score.pillar}: ${score.score}/${score.maxScore} (${score.percentage.toFixed(1)}% - ${score.level})`
      ),
      '',
      'Coaching Recommendations:',
      ...assessment.coaching_prompts.map(prompt => `  • ${prompt.prompt}`)
    ];

    return summary.join('\n');
  }
}