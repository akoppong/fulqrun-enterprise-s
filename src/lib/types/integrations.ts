/**
 * Learning and development, integrations, and compliance types
 */

export interface Integration {
  id: string;
  name: string;
  type: 'slack' | 'docusign' | 'gong' | 'chorus' | 'stripe' | 'quickbooks';
  isActive: boolean;
  credentials: Record<string, string>;
  lastSync?: string; // ISO date string for reliable serialization
  syncStatus: 'connected' | 'error' | 'syncing' | 'disconnected';
  configuration: Record<string, any>;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'peak' | 'meddpicc' | 'product' | 'sales_skills' | 'compliance';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  content: LearningContent[];
  quiz?: Quiz;
  certification?: Certification;
  isRequired: boolean;
}

export interface LearningContent {
  id: string;
  type: 'video' | 'article' | 'interactive' | 'checklist';
  title: string;
  content: string;
  duration?: number;
  resources: string[];
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  validityPeriod: number; // days
  badge: string;
}

export interface UserProgress {
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'certified';
  progress: number; // 0-100
  lastAccessed: string; // ISO date string for reliable serialization
  completedAt?: string; // ISO date string for reliable serialization
  certificationDate?: string; // ISO date string for reliable serialization
  quizAttempts: number;
  quizScore?: number;
}

export interface ComplianceLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string; // ISO date string for reliable serialization
  details: Record<string, any>;
  regulation: 'gdpr' | 'hipaa' | 'sox' | 'general';
  level: 'info' | 'warning' | 'critical';
}