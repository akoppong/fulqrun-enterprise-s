import { useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { safeGetTime } from '@/lib/utils';
import {
  GraduationCap,
  BookOpen,
  PlayCircle,
  CheckCircle,
  Clock,
  Trophy,
  Star,
  Users,
  TrendingUp,
  Award,
  Target,
  Brain,
  FileText,
  Video,
  Headphones,
  ChartBar,
  Calendar,
  Download,
  Share,
  Lock,
  Unlock
} from '@phosphor-icons/react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: 'peak' | 'meddpicc' | 'sales-skills' | 'product' | 'compliance';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  modules: Module[];
  prerequisites: string[];
  certificationAvailable: boolean;
  passingScore: number;
  enrollmentCount: number;
  averageRating: number;
  instructor: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

interface Module {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading' | 'interactive' | 'quiz' | 'simulation';
  content: ModuleContent;
  duration: number;
  order: number;
  required: boolean;
}

interface ModuleContent {
  video?: {
    url: string;
    transcript?: string;
    captions?: string;
  };
  reading?: {
    content: string;
    attachments?: string[];
  };
  interactive?: {
    type: 'simulation' | 'case-study' | 'role-play';
    scenario: string;
    interactions: any[];
  };
  quiz?: {
    questions: QuizQuestion[];
    passingScore: number;
  };
}

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'essay' | 'scenario';
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  points: number;
}

interface UserProgress {
  courseId: string;
  userId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedModules: string[];
  quizScores: { [moduleId: string]: number };
  timeSpent: number; // minutes
  progress: number; // percentage
  status: 'enrolled' | 'in-progress' | 'completed' | 'certified';
  certificateEarned?: Date;
  notes: string;
}

interface Certification {
  id: string;
  courseId: string;
  userId: string;
  earnedAt: Date;
  score: number;
  validUntil?: Date;
  certificateUrl: string;
  skills: string[];
}

const defaultCourses: Course[] = [
  {
    id: 'peak-methodology-mastery',
    title: 'PEAK Methodology Mastery',
    description: 'Complete mastery of the PEAK sales methodology: Prospect, Engage, Acquire, Keep',
    category: 'peak',
    level: 'intermediate',
    duration: 240,
    certificationAvailable: true,
    passingScore: 80,
    enrollmentCount: 156,
    averageRating: 4.7,
    instructor: 'Sarah Chen, VP of Sales Excellence',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    status: 'published',
    prerequisites: [],
    tags: ['sales methodology', 'peak', 'foundational'],
    modules: [
      {
        id: 'peak-intro',
        title: 'Introduction to PEAK',
        description: 'Overview of the PEAK methodology and its business impact',
        type: 'video',
        duration: 25,
        order: 0,
        required: true,
        content: {
          video: {
            url: '/videos/peak-intro.mp4',
            transcript: 'The PEAK methodology represents...'
          }
        }
      },
      {
        id: 'prospect-deep-dive',
        title: 'Prospect Phase Deep Dive',
        description: 'Advanced prospecting techniques and qualification strategies',
        type: 'interactive',
        duration: 45,
        order: 1,
        required: true,
        content: {
          interactive: {
            type: 'simulation',
            scenario: 'You are contacting a new prospect for the first time...',
            interactions: []
          }
        }
      },
      {
        id: 'engage-mastery',
        title: 'Engage Phase Mastery',
        description: 'Building relationships and understanding customer needs',
        type: 'video',
        duration: 35,
        order: 2,
        required: true,
        content: {
          video: {
            url: '/videos/engage-mastery.mp4'
          }
        }
      },
      {
        id: 'acquire-strategies',
        title: 'Acquire Phase Strategies',
        description: 'Closing techniques and negotiation best practices',
        type: 'interactive',
        duration: 50,
        order: 3,
        required: true,
        content: {
          interactive: {
            type: 'case-study',
            scenario: 'Review this complex enterprise deal...',
            interactions: []
          }
        }
      },
      {
        id: 'keep-excellence',
        title: 'Keep Phase Excellence',
        description: 'Customer success and account expansion strategies',
        type: 'reading',
        duration: 30,
        order: 4,
        required: true,
        content: {
          reading: {
            content: 'The Keep phase focuses on...',
            attachments: ['/attachments/keep-playbook.pdf']
          }
        }
      },
      {
        id: 'peak-assessment',
        title: 'PEAK Methodology Assessment',
        description: 'Comprehensive quiz covering all PEAK phases',
        type: 'quiz',
        duration: 35,
        order: 5,
        required: true,
        content: {
          quiz: {
            passingScore: 80,
            questions: [
              {
                id: 'q1',
                question: 'What are the four phases of the PEAK methodology?',
                type: 'multiple-choice',
                options: [
                  'Prospect, Engage, Acquire, Keep',
                  'Plan, Execute, Analyze, Keep',
                  'Prepare, Engage, Ask, Keep',
                  'Prospect, Evaluate, Acquire, Know'
                ],
                correctAnswer: 0,
                explanation: 'PEAK stands for Prospect, Engage, Acquire, Keep',
                points: 10
              }
            ]
          }
        }
      }
    ]
  },
  {
    id: 'meddpicc-qualification-expert',
    title: 'MEDDPICC Qualification Expert',
    description: 'Master the MEDDPICC qualification framework for enterprise sales',
    category: 'meddpicc',
    level: 'advanced',
    duration: 180,
    certificationAvailable: true,
    passingScore: 85,
    enrollmentCount: 89,
    averageRating: 4.9,
    instructor: 'Michael Torres, Enterprise Sales Director',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-15'),
    status: 'published',
    prerequisites: ['peak-methodology-mastery'],
    tags: ['meddpicc', 'qualification', 'enterprise sales'],
    modules: [
      {
        id: 'meddpicc-overview',
        title: 'MEDDPICC Framework Overview',
        description: 'Complete introduction to the MEDDPICC qualification methodology',
        type: 'video',
        duration: 30,
        order: 0,
        required: true,
        content: {
          video: {
            url: '/videos/meddpicc-overview.mp4'
          }
        }
      },
      {
        id: 'metrics-mastery',
        title: 'Metrics Identification & Quantification',
        description: 'Learn to identify and quantify business metrics that matter',
        type: 'interactive',
        duration: 45,
        order: 1,
        required: true,
        content: {
          interactive: {
            type: 'simulation',
            scenario: 'Work with a prospect to identify key business metrics...',
            interactions: []
          }
        }
      }
    ]
  },
  {
    id: 'ai-sales-enhancement',
    title: 'AI-Enhanced Sales Techniques',
    description: 'Leverage artificial intelligence to boost your sales performance',
    category: 'sales-skills',
    level: 'intermediate',
    duration: 120,
    certificationAvailable: true,
    passingScore: 75,
    enrollmentCount: 234,
    averageRating: 4.5,
    instructor: 'Dr. Amanda Singh, Sales Technology Expert',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-20'),
    status: 'published',
    prerequisites: [],
    tags: ['ai', 'technology', 'sales enhancement'],
    modules: []
  }
];

export function EnhancedLearningPlatform({ initialTab = 'dashboard' }: { initialTab?: string } = {}) {
  const [courses, setCourses] = useKV<Course[]>('learning-courses', defaultCourses);
  const [userProgress, setUserProgress] = useKV<UserProgress[]>('user-progress', []);
  const [certifications, setCertifications] = useKV<Certification[]>('certifications', []);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel && course.status === 'published';
  });

  const enrollInCourse = useCallback((courseId: string) => {
    const existingProgress = userProgress.find(p => p.courseId === courseId);
    if (existingProgress) {
      toast.info('Already enrolled in this course');
      return;
    }

    const newProgress: UserProgress = {
      courseId,
      userId: 'current-user', // In real app, get from auth
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
      completedModules: [],
      quizScores: {},
      timeSpent: 0,
      progress: 0,
      status: 'enrolled',
      notes: ''
    };

    setUserProgress(current => [...current, newProgress]);
    toast.success('Successfully enrolled in course!');
  }, [userProgress, setUserProgress]);

  const updateProgress = useCallback((courseId: string, updates: Partial<UserProgress>) => {
    setUserProgress(current =>
      current.map(progress =>
        progress.courseId === courseId
          ? { ...progress, ...updates, lastAccessedAt: new Date() }
          : progress
      )
    );
  }, [setUserProgress]);

  const completeModule = useCallback((courseId: string, moduleId: string) => {
    const progress = userProgress.find(p => p.courseId === courseId);
    if (!progress) return;

    if (!progress.completedModules.includes(moduleId)) {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      const newCompletedModules = [...progress.completedModules, moduleId];
      const newProgress = Math.round((newCompletedModules.length / course.modules.length) * 100);

      updateProgress(courseId, {
        completedModules: newCompletedModules,
        progress: newProgress,
        status: newProgress === 100 ? 'completed' : 'in-progress'
      });

      toast.success('Module completed!');

      // Check if course is complete
      if (newProgress === 100) {
        toast.success('Congratulations! Course completed!');
      }
    }
  }, [userProgress, courses, updateProgress]);

  const earnCertification = useCallback((courseId: string, score: number) => {
    const newCertification: Certification = {
      id: `cert-${Date.now()}`,
      courseId,
      userId: 'current-user',
      earnedAt: new Date(),
      score,
      certificateUrl: `/certificates/${courseId}-cert.pdf`,
      skills: courses.find(c => c.id === courseId)?.tags || []
    };

    setCertifications(current => [...current, newCertification]);
    updateProgress(courseId, { status: 'certified', certificateEarned: new Date() });
    toast.success('🎉 Certification earned!');
  }, [courses, setCertifications, updateProgress]);

  // Calculate stats
  const totalCoursesEnrolled = userProgress.length;
  const completedCourses = userProgress.filter(p => p.status === 'completed' || p.status === 'certified').length;
  const certificationsEarned = certifications.length;
  const totalHoursSpent = Math.round(userProgress.reduce((acc, p) => acc + p.timeSpent, 0) / 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">FulQrun Learning Platform</h2>
          <p className="text-muted-foreground">Master sales methodologies and earn certifications</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Trophy className="h-3 w-3" />
            {certificationsEarned} Certifications
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {totalHoursSpent}h learned
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="progress">My Progress</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <LearningDashboard
            userProgress={userProgress}
            courses={courses}
            certifications={certifications}
            onContinueCourse={(courseId) => {
              const course = courses.find(c => c.id === courseId);
              if (course) setSelectedCourse(course);
            }}
          />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6 mt-6">
          <CourseCatalog
            courses={filteredCourses}
            userProgress={userProgress}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            onEnroll={enrollInCourse}
            onSelectCourse={setSelectedCourse}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6 mt-6">
          <ProgressTracker
            userProgress={userProgress}
            courses={courses}
            onContinue={(courseId) => {
              const course = courses.find(c => c.id === courseId);
              if (course) setSelectedCourse(course);
            }}
          />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6 mt-6">
          <CertificatesView
            certifications={certifications}
            courses={courses}
          />
        </TabsContent>
      </Tabs>

      {/* Course Detail Dialog */}
      {selectedCourse && (
        <CourseDetailDialog
          course={selectedCourse}
          userProgress={userProgress.find(p => p.courseId === selectedCourse.id)}
          onClose={() => setSelectedCourse(null)}
          onEnroll={() => enrollInCourse(selectedCourse.id)}
          onCompleteModule={completeModule}
          onEarnCertification={earnCertification}
        />
      )}
    </div>
  );
}

function LearningDashboard({
  userProgress,
  courses,
  certifications,
  onContinueCourse
}: {
  userProgress: UserProgress[];
  courses: Course[];
  certifications: Certification[];
  onContinueCourse: (courseId: string) => void;
}) {
  const inProgressCourses = userProgress.filter(p => p.status === 'in-progress');
  const recentActivity = userProgress
    .sort((a, b) => safeGetTime(b.lastAccessedAt) - safeGetTime(a.lastAccessedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{userProgress.length}</div>
            <p className="text-sm text-muted-foreground">Courses Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">
              {userProgress.filter(p => p.status === 'completed' || p.status === 'certified').length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold">{certifications.length}</div>
            <p className="text-sm text-muted-foreground">Certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">
              {Math.round(userProgress.reduce((acc, p) => acc + p.timeSpent, 0) / 60)}h
            </div>
            <p className="text-sm text-muted-foreground">Hours Learned</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressCourses.length > 0 ? (
              <div className="space-y-4">
                {inProgressCourses.slice(0, 3).map(progress => {
                  const course = courses.find(c => c.id === progress.courseId);
                  if (!course) return null;

                  return (
                    <div key={progress.courseId} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{course.title}</h4>
                        <Badge variant="secondary">{progress.progress}%</Badge>
                      </div>
                      <Progress value={progress.progress} className="mb-3" />
                      <Button 
                        size="sm" 
                        onClick={() => onContinueCourse(course.id)}
                        className="w-full"
                      >
                        Continue Course
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <GraduationCap className="h-8 w-8 mx-auto mb-2" />
                <p>No courses in progress</p>
                <p className="text-sm">Browse the catalog to start learning!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map(progress => {
                const course = courses.find(c => c.id === progress.courseId);
                if (!course) return null;

                return (
                  <div key={progress.courseId} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {progress.status === 'certified' ? (
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      ) : progress.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(progress.lastAccessedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {progress.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses
              .filter(course => 
                course.status === 'published' && 
                !userProgress.some(p => p.courseId === course.id)
              )
              .slice(0, 3)
              .map(course => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {course.level}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{course.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {course.duration}min
                    </div>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseCatalog({
  courses,
  userProgress,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  onEnroll,
  onSelectCourse
}: {
  courses: Course[];
  userProgress: UserProgress[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedLevel: string;
  onLevelChange: (level: string) => void;
  onEnroll: (courseId: string) => void;
  onSelectCourse: (course: Course) => void;
}) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'peak', label: 'PEAK Methodology' },
    { value: 'meddpicc', label: 'MEDDPICC' },
    { value: 'sales-skills', label: 'Sales Skills' },
    { value: 'product', label: 'Product Training' },
    { value: 'compliance', label: 'Compliance' }
  ];

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Search Courses</Label>
          <Input
            id="search"
            placeholder="Search by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="level">Level</Label>
          <Select value={selectedLevel} onValueChange={onLevelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const progress = userProgress.find(p => p.courseId === course.id);
          const isEnrolled = !!progress;

          return (
            <Card key={course.id} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="capitalize">
                    {course.category.replace('-', ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {course.level}
                  </Badge>
                  {course.certificationAvailable && (
                    <Badge variant="default" className="gap-1">
                      <Award className="h-3 w-3" />
                      Cert
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}min
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.enrollmentCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {course.averageRating}
                  </div>
                </div>

                {isEnrolled && progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{progress.progress}%</span>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant={isEnrolled ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => isEnrolled ? onSelectCourse(course) : onEnroll(course.id)}
                  >
                    {isEnrolled ? 
                      (progress?.status === 'completed' ? 'Review' : 'Continue') :
                      'Enroll'
                    }
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectCourse(course)}
                  >
                    Details
                  </Button>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    By {course.instructor}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4" />
          <p>No courses found matching your criteria</p>
          <p className="text-sm mt-2">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
}

function ProgressTracker({
  userProgress,
  courses,
  onContinue
}: {
  userProgress: UserProgress[];
  courses: Course[];
  onContinue: (courseId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {userProgress.map(progress => {
        const course = courses.find(c => c.id === progress.courseId);
        if (!course) return null;

        return (
          <Card key={progress.courseId}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{course.title}</h3>
                    <Badge 
                      variant={progress.status === 'certified' ? 'default' : 
                              progress.status === 'completed' ? 'secondary' : 'outline'}
                    >
                      {progress.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Progress</div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress.progress} className="flex-1" />
                        <span className="text-sm font-medium">{progress.progress}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Time Spent</div>
                      <div className="font-medium">{Math.round(progress.timeSpent / 60)}h {progress.timeSpent % 60}m</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Last Accessed</div>
                      <div className="font-medium">{new Date(progress.lastAccessedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-2">Modules Progress</div>
                    <div className="space-y-2">
                      {course.modules.slice(0, 3).map(module => (
                        <div key={module.id} className="flex items-center gap-2 text-sm">
                          {progress.completedModules.includes(module.id) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20" />
                          )}
                          <span className={progress.completedModules.includes(module.id) ? 'text-muted-foreground line-through' : ''}>
                            {module.title}
                          </span>
                        </div>
                      ))}
                      {course.modules.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          +{course.modules.length - 3} more modules
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => onContinue(course.id)}
                    disabled={progress.status === 'completed'}
                  >
                    {progress.status === 'completed' ? 'Completed' : 'Continue'}
                  </Button>
                  
                  {progress.status === 'certified' && (
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-3 w-3" />
                      Certificate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {userProgress.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <TrendingUp className="h-12 w-12 mx-auto mb-4" />
          <p>No learning progress yet</p>
          <p className="text-sm mt-2">Enroll in a course to start tracking your progress</p>
        </div>
      )}
    </div>
  );
}

function CertificatesView({
  certifications,
  courses
}: {
  certifications: Certification[];
  courses: Course[];
}) {
  return (
    <div className="space-y-4">
      {certifications.map(cert => {
        const course = courses.find(c => c.id === cert.courseId);
        if (!course) return null;

        return (
          <Card key={cert.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1">{course.title} Certification</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Earned on {new Date(cert.earnedAt).toLocaleDateString()}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Score: </span>
                        <span className="font-medium">{cert.score}%</span>
                      </div>
                      {cert.validUntil && (
                        <div>
                          <span className="text-muted-foreground">Valid until: </span>
                          <span className="font-medium">{new Date(cert.validUntil).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {cert.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share className="h-3 w-3" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {certifications.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <Award className="h-12 w-12 mx-auto mb-4" />
          <p>No certifications earned yet</p>
          <p className="text-sm mt-2">Complete courses and pass assessments to earn certificates</p>
        </div>
      )}
    </div>
  );
}

function CourseDetailDialog({
  course,
  userProgress,
  onClose,
  onEnroll,
  onCompleteModule,
  onEarnCertification
}: {
  course: Course;
  userProgress?: UserProgress;
  onClose: () => void;
  onEnroll: () => void;
  onCompleteModule: (courseId: string, moduleId: string) => void;
  onEarnCertification: (courseId: string, score: number) => void;
}) {
  const isEnrolled = !!userProgress;

  const getModuleIcon = (type: Module['type']) => {
    switch (type) {
      case 'video': return Video;
      case 'reading': return FileText;
      case 'interactive': return Brain;
      case 'quiz': return Target;
      case 'simulation': return Users;
      default: return BookOpen;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{course.title}</DialogTitle>
              <p className="text-muted-foreground mt-1">{course.description}</p>
            </div>
            <div className="flex gap-2 ml-4">
              <Badge variant="secondary" className="capitalize">
                {course.category.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {course.level}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Course Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Progress (if enrolled) */}
            {isEnrolled && userProgress && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Your Progress</h4>
                    <Badge variant={userProgress.status === 'certified' ? 'default' : 'secondary'}>
                      {userProgress.status}
                    </Badge>
                  </div>
                  <Progress value={userProgress.progress} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    {userProgress.completedModules.length} of {course.modules.length} modules completed
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Modules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.modules.map((module, index) => {
                  const ModuleIcon = getModuleIcon(module.type);
                  const isCompleted = userProgress?.completedModules.includes(module.id);
                  const canAccess = isEnrolled && (index === 0 || userProgress?.completedModules.includes(course.modules[index - 1]?.id));

                  return (
                    <div 
                      key={module.id} 
                      className={`p-3 border rounded-lg ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : canAccess ? (
                            <ModuleIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium">{module.title}</h5>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {module.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {module.duration}min
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          
                          {canAccess && !isCompleted && (
                            <Button 
                              size="sm" 
                              className="mt-2"
                              onClick={() => onCompleteModule(course.id, module.id)}
                            >
                              Start Module
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Course Details Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{course.duration} minutes</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Instructor</div>
                  <div className="font-medium">{course.instructor}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Enrolled</div>
                  <div className="font-medium">{course.enrollmentCount} students</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{course.averageRating}</span>
                  </div>
                </div>

                {course.certificationAvailable && (
                  <div>
                    <div className="text-sm text-muted-foreground">Certification</div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium">Available</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {course.passingScore}% required to pass
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Skills You'll Learn</h4>
                <div className="flex flex-wrap gap-1">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {!isEnrolled ? (
                <Button onClick={onEnroll} className="w-full">
                  Enroll in Course
                </Button>
              ) : userProgress?.status === 'completed' && course.certificationAvailable && userProgress.status !== 'certified' ? (
                <Button 
                  onClick={() => onEarnCertification(course.id, 85)}
                  className="w-full"
                >
                  Take Certification Exam
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Continue Learning
                </Button>
              )}
              
              <Button variant="outline" className="w-full" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}