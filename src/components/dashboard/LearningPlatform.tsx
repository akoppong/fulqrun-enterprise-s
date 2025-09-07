import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  Award, 
  Play, 
  CheckCircle, 
  Clock, 
  Users,
  Target,
  Brain,
  Certificate,
  TrendingUp
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { LearningModule, UserProgress, Certification, User } from '@/lib/types';
import { toast } from 'sonner';

interface LearningPlatformProps {
  currentUser: User;
  allUsers?: User[];
}

export function LearningPlatform({ currentUser, allUsers = [] }: LearningPlatformProps) {
  const [learningModules, setLearningModules] = useKV<LearningModule[]>('learning-modules', []);
  const [userProgress, setUserProgress] = useKV<UserProgress[]>('user-progress', []);
  const [certifications, setCertifications] = useKV<Certification[]>('certifications', []);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [moduleDialog, setModuleDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize demo data
  useEffect(() => {
    if (learningModules.length === 0) {
      const demoModules: LearningModule[] = [
        {
          id: '1',
          title: 'PEAK Methodology Fundamentals',
          description: 'Master the Prospect → Engage → Acquire → Keep sales process',
          category: 'peak',
          level: 'beginner',
          duration: 45,
          content: [
            {
              id: '1-1',
              type: 'video',
              title: 'Introduction to PEAK',
              content: 'Overview of the PEAK methodology and its benefits',
              duration: 15,
              resources: ['PEAK Process Guide', 'Best Practices Checklist']
            },
            {
              id: '1-2',
              type: 'interactive',
              title: 'PEAK Stage Deep Dive',
              content: 'Interactive exploration of each PEAK stage',
              duration: 20,
              resources: ['Stage Templates', 'Activity Worksheets']
            },
            {
              id: '1-3',
              type: 'checklist',
              title: 'Implementation Checklist',
              content: 'Step-by-step checklist for implementing PEAK',
              duration: 10,
              resources: ['Implementation Guide']
            }
          ],
          quiz: {
            id: 'q1',
            questions: [
              {
                id: 'q1-1',
                question: 'What does PEAK stand for?',
                type: 'multiple_choice',
                options: ['Prospect, Engage, Acquire, Keep', 'Plan, Execute, Analyze, Keep', 'Prepare, Engage, Act, Know'],
                correctAnswer: 'Prospect, Engage, Acquire, Keep',
                explanation: 'PEAK stands for Prospect → Engage → Acquire → Keep, the core stages of the sales methodology.'
              },
              {
                id: 'q1-2',
                question: 'The Keep stage focuses on customer retention and expansion.',
                type: 'true_false',
                correctAnswer: 'true',
                explanation: 'The Keep stage is all about maintaining relationships and identifying expansion opportunities.'
              }
            ],
            passingScore: 80,
            timeLimit: 10
          },
          certification: {
            id: 'cert-peak-1',
            name: 'PEAK Methodology Certified',
            description: 'Certified in PEAK sales methodology fundamentals',
            requirements: ['Complete all modules', 'Pass quiz with 80%+'],
            validityPeriod: 365,
            badge: '🎯'
          },
          isRequired: true
        },
        {
          id: '2',
          title: 'MEDDPICC Qualification Mastery',
          description: 'Advanced opportunity qualification using MEDDPICC framework',
          category: 'meddpicc',
          level: 'intermediate',
          duration: 60,
          content: [
            {
              id: '2-1',
              type: 'video',
              title: 'MEDDPICC Overview',
              content: 'Understanding each element of MEDDPICC qualification',
              duration: 25,
              resources: ['MEDDPICC Template', 'Qualification Scorecard']
            },
            {
              id: '2-2',
              type: 'interactive',
              title: 'Real-world Scenarios',
              content: 'Practice MEDDPICC with realistic sales scenarios',
              duration: 25,
              resources: ['Scenario Library', 'Practice Templates']
            },
            {
              id: '2-3',
              type: 'article',
              title: 'Advanced Techniques',
              content: 'Advanced qualification techniques and best practices',
              duration: 10,
              resources: ['Advanced Guide', 'Expert Tips']
            }
          ],
          quiz: {
            id: 'q2',
            questions: [
              {
                id: 'q2-1',
                question: 'What does the "M" in MEDDPICC stand for?',
                type: 'multiple_choice',
                options: ['Metrics', 'Money', 'Manager'],
                correctAnswer: 'Metrics',
                explanation: 'Metrics refers to quantifiable business impact and ROI measurements.'
              }
            ],
            passingScore: 85,
            timeLimit: 15
          },
          certification: {
            id: 'cert-meddpicc-1',
            name: 'MEDDPICC Qualified',
            description: 'Expert-level qualification using MEDDPICC methodology',
            requirements: ['Complete PEAK certification', 'Complete all modules', 'Pass quiz with 85%+'],
            validityPeriod: 365,
            badge: '🎯'
          },
          isRequired: true
        },
        {
          id: '3',
          title: 'Advanced Sales Analytics',
          description: 'Using data and AI insights to optimize sales performance',
          category: 'sales_skills',
          level: 'advanced',
          duration: 90,
          content: [
            {
              id: '3-1',
              type: 'video',
              title: 'CSTPV Metrics Deep Dive',
              content: 'Understanding and optimizing Close, Size, Time, Probability, Value metrics',
              duration: 30,
              resources: ['CSTPV Dashboard Guide', 'Metrics Templates']
            },
            {
              id: '3-2',
              type: 'interactive',
              title: 'AI-Powered Insights',
              content: 'Leveraging AI recommendations for better sales outcomes',
              duration: 30,
              resources: ['AI Guide', 'Best Practices']
            },
            {
              id: '3-3',
              type: 'article',
              title: 'Performance Optimization',
              content: 'Advanced techniques for sales performance improvement',
              duration: 30,
              resources: ['Optimization Guide', 'Case Studies']
            }
          ],
          isRequired: false
        },
        {
          id: '4',
          title: 'Compliance & Data Security',
          description: 'GDPR, HIPAA, and enterprise security best practices',
          category: 'compliance',
          level: 'intermediate',
          duration: 30,
          content: [
            {
              id: '4-1',
              type: 'article',
              title: 'Data Protection Regulations',
              content: 'Understanding GDPR, HIPAA, and other compliance requirements',
              duration: 15,
              resources: ['Compliance Guide', 'Policy Templates']
            },
            {
              id: '4-2',
              type: 'checklist',
              title: 'Security Best Practices',
              content: 'Daily security practices for sales professionals',
              duration: 15,
              resources: ['Security Checklist', 'Incident Response Guide']
            }
          ],
          quiz: {
            id: 'q4',
            questions: [
              {
                id: 'q4-1',
                question: 'GDPR applies to all customer data processing in the EU.',
                type: 'true_false',
                correctAnswer: 'true',
                explanation: 'GDPR applies to all personal data processing of EU individuals, regardless of company location.'
              }
            ],
            passingScore: 90,
            timeLimit: 5
          },
          isRequired: true
        }
      ];
      setLearningModules(demoModules);
    }

    // Initialize user progress
    if (userProgress.length === 0 && learningModules.length > 0) {
      const initialProgress: UserProgress[] = learningModules.map(module => ({
        userId: currentUser.id,
        moduleId: module.id,
        status: 'not_started',
        progress: 0,
        lastAccessed: new Date(),
        quizAttempts: 0
      }));
      setUserProgress(initialProgress);
    }
  }, [learningModules, userProgress, currentUser.id, setLearningModules, setUserProgress]);

  const getUserProgress = (moduleId: string): UserProgress | undefined => {
    return userProgress.find(p => p.userId === currentUser.id && p.moduleId === moduleId);
  };

  const updateProgress = (moduleId: string, updates: Partial<UserProgress>) => {
    setUserProgress(prev => prev.map(p => 
      p.userId === currentUser.id && p.moduleId === moduleId 
        ? { ...p, ...updates, lastAccessed: new Date() }
        : p
    ));
  };

  const startModule = (module: LearningModule) => {
    const progress = getUserProgress(module.id);
    if (progress?.status === 'not_started') {
      updateProgress(module.id, { status: 'in_progress', progress: 0 });
    }
    setSelectedModule(module);
    setModuleDialog(true);
  };

  const completeModule = (moduleId: string) => {
    updateProgress(moduleId, { 
      status: 'completed', 
      progress: 100, 
      completedAt: new Date() 
    });
    toast.success('Module completed!');
    setModuleDialog(false);
  };

  const takeQuiz = (module: LearningModule) => {
    if (!module.quiz) return;
    
    // Simulate quiz taking (in real app, this would open a quiz dialog)
    const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
    const passed = score >= module.quiz.passingScore;
    
    updateProgress(module.id, {
      quizAttempts: (getUserProgress(module.id)?.quizAttempts || 0) + 1,
      quizScore: score,
      status: passed ? 'completed' : 'in_progress'
    });
    
    if (passed) {
      toast.success(`Quiz passed with ${score}%! Module completed.`);
      if (module.certification) {
        updateProgress(module.id, { 
          status: 'certified',
          certificationDate: new Date()
        });
        toast.success(`🎉 Certification earned: ${module.certification.name}!`);
      }
    } else {
      toast.error(`Quiz score: ${score}%. Need ${module.quiz.passingScore}% to pass.`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'certified': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />;
      case 'certified': return <Award size={16} />;
      case 'in_progress': return <Clock size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredModules = selectedCategory === 'all' 
    ? learningModules 
    : learningModules.filter(m => m.category === selectedCategory);

  const completedModules = userProgress.filter(p => 
    p.userId === currentUser.id && (p.status === 'completed' || p.status === 'certified')
  ).length;

  const certifiedModules = userProgress.filter(p => 
    p.userId === currentUser.id && p.status === 'certified'
  ).length;

  const totalProgress = learningModules.length > 0 
    ? Math.round((completedModules / learningModules.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">FulQrun Learning Platform</h2>
          <p className="text-muted-foreground">
            Master sales methodologies and earn certifications
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProgress}%</div>
            <Progress value={totalProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedModules} of {learningModules.length} modules completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certifiedModules}</div>
            <p className="text-xs text-muted-foreground">
              Earned certifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(learningModules.reduce((sum, m) => {
                const progress = getUserProgress(m.id);
                return sum + (progress?.progress || 0) / 100 * m.duration;
              }, 0) / 60)}h
            </div>
            <p className="text-xs text-muted-foreground">
              Time invested in learning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Ranking</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              #{Math.floor(Math.random() * 5) + 1}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {allUsers.length || 10} team members
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="certifications">My Certifications</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
          {currentUser.role !== 'rep' && <TabsTrigger value="team">Team Progress</TabsTrigger>}
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={selectedCategory === 'peak' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory('peak')}
            >
              PEAK
            </Button>
            <Button 
              variant={selectedCategory === 'meddpicc' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory('meddpicc')}
            >
              MEDDPICC
            </Button>
            <Button 
              variant={selectedCategory === 'sales_skills' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory('sales_skills')}
            >
              Sales Skills
            </Button>
            <Button 
              variant={selectedCategory === 'compliance' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSelectedCategory('compliance')}
            >
              Compliance
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module) => {
              const progress = getUserProgress(module.id);
              return (
                <Card key={module.id} className="relative">
                  {module.isRequired && (
                    <Badge className="absolute top-2 right-2 bg-red-100 text-red-800">
                      Required
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getLevelColor(module.level)}>
                        {module.level}
                      </Badge>
                      <Badge variant="outline">
                        <Clock size={12} className="mr-1" />
                        {module.duration}m
                      </Badge>
                      {progress && (
                        <Badge className={getStatusColor(progress.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(progress.status)}
                            {progress.status.replace('_', ' ')}
                          </span>
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {progress && progress.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress.progress}%</span>
                        </div>
                        <Progress value={progress.progress} />
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={() => startModule(module)}
                        size="sm"
                        variant={progress?.status === 'not_started' ? 'default' : 'outline'}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {progress?.status === 'not_started' ? 'Start Module' : 'Continue'}
                      </Button>
                      {module.quiz && progress?.status === 'completed' && (
                        <Button 
                          onClick={() => takeQuiz(module)}
                          size="sm"
                          variant="secondary"
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Take Quiz
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {userProgress
              .filter(p => p.userId === currentUser.id && p.status === 'certified')
              .map((progress) => {
                const module = learningModules.find(m => m.id === progress.moduleId);
                if (!module?.certification) return null;
                
                return (
                  <Card key={progress.moduleId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="text-2xl">{module.certification.badge}</div>
                        {module.certification.name}
                      </CardTitle>
                      <CardDescription>
                        {module.certification.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Earned:</span>
                          <span>{progress.certificationDate ? new Date(progress.certificationDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valid Until:</span>
                          <span>
                            {progress.certificationDate && 
                              new Date(new Date(progress.certificationDate).getTime() + module.certification.validityPeriod * 24 * 60 * 60 * 1000)
                                .toLocaleDateString()
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quiz Score:</span>
                          <span className="font-medium text-green-600">
                            {progress.quizScore}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            }
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Progress</CardTitle>
              <CardDescription>Your learning journey across all modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningModules.map((module) => {
                  const progress = getUserProgress(module.id);
                  return (
                    <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.category}</p>
                        <div className="mt-2">
                          <Progress value={progress?.progress || 0} className="w-full" />
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-sm font-medium">
                          {progress?.progress || 0}%
                        </div>
                        <Badge className={getStatusColor(progress?.status || 'not_started')}>
                          {progress?.status?.replace('_', ' ') || 'Not Started'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {currentUser.role !== 'rep' && (
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Learning Progress</CardTitle>
                <CardDescription>Learning progress across your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Team progress analytics would be displayed here
                  <br />
                  (Manager/Admin view)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Module Detail Dialog */}
      <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedModule && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {selectedModule.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedModule.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedModule.duration}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedModule.content.length}</div>
                    <div className="text-xs text-muted-foreground">Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {getUserProgress(selectedModule.id)?.progress || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Learning Content</h4>
                  {selectedModule.content.map((content, index) => (
                    <div key={content.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{content.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {content.type} • {content.duration} min
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setModuleDialog(false)}>
                    Close
                  </Button>
                  <div className="flex gap-2">
                    {selectedModule.quiz && (
                      <Button variant="outline" onClick={() => takeQuiz(selectedModule)}>
                        <Target className="mr-2 h-4 w-4" />
                        Take Quiz
                      </Button>
                    )}
                    <Button onClick={() => completeModule(selectedModule.id)}>
                      Complete Module
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}