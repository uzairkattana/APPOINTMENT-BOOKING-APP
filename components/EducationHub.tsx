import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Download, 
  CheckCircle, 
  Clock, 
  User, 
  Star, 
  ChevronRight, 
  Brain, 
  Activity, 
  Stethoscope,
  FileText,
  Video,
  Users,
  Award,
  Search,
  Filter,
  ArrowRight,
  Heart,
  Eye,
  Target,
  Lightbulb,
  Shield,
  Zap,
  PlusCircle,
  X
} from 'lucide-react';

// Types
interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: 'anatomy' | 'technique' | 'wellness' | 'preparation' | 'recovery';
  type: 'video' | 'article' | 'interactive' | 'quiz';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  progress: number;
  thumbnail: string;
  content?: string;
  videoUrl?: string;
  downloadUrl?: string;
  quiz?: QuizQuestion[];
  interactiveElements?: InteractiveElement[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface InteractiveElement {
  id: string;
  type: 'hotspot' | 'diagram' | 'animation';
  title: string;
  description: string;
  imageUrl: string;
}

interface Patient {
  name: string;
  condition?: string;
  treatmentPlan?: {
    treatmentGoals: string[];
  };
}

interface EducationHubProps {
  patient?: Patient;
}

const EducationHub: React.FC<EducationHubProps> = ({ patient }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Sample learning modules with comprehensive content
  const learningModules: LearningModule[] = [
    {
      id: '1',
      title: 'Understanding Your Spine Anatomy',
      description: 'Learn about the basic structure of your spine, vertebrae, discs, and how they work together to support your body.',
      category: 'anatomy',
      type: 'interactive',
      duration: '12 min',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/anatomy-of-acute-lower-back-pain.jpeg',
      content: `Your spine is an amazing structure composed of 24 movable vertebrae, plus the sacrum and coccyx. Each vertebra is separated by intervertebral discs that act as shock absorbers. The spine has natural curves that help distribute weight and maintain balance. Understanding this structure helps you appreciate why proper alignment is so important for your health.`,
      interactiveElements: [
        {
          id: 'spine-anatomy-1',
          type: 'diagram',
          title: 'Cervical Spine',
          description: 'The neck region with 7 vertebrae',
          imageUrl: '/images/education/cervical-spine-pain-and-inflammation.jpeg'
        },
        {
          id: 'spine-anatomy-2',
          type: 'diagram',
          title: 'Thoracic Spine',
          description: 'The mid-back region with 12 vertebrae',
          imageUrl: '/images/education/full-spine-pain-and-inflammation.jpeg'
        }
      ]
    },
    {
      id: '2',
      title: 'The Gonstead Technique Explained',
      description: 'Discover the precise diagnostic and treatment approach developed by Dr. Clarence Gonstead.',
      category: 'technique',
      type: 'video',
      duration: '15 min',
      difficulty: 'intermediate',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/gonstead clinic_page-0001.jpg',
      videoUrl: '#gonstead-technique-video',
      content: `The Gonstead technique uses a five-component analysis system to identify and correct spinal subluxations with precision. This includes X-ray analysis, static and motion palpation, instrumentation, visualization, and case history. The goal is to find the primary subluxation - the root cause of your problems.`
    },
    {
      id: '3',
      title: 'Your Nervous System and Health',
      description: 'Understand how your nervous system controls every function in your body and how spinal health affects it.',
      category: 'anatomy',
      type: 'interactive',
      duration: '10 min',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/spinal-nerve-and-organ-function-chart.jpeg',
      content: `Your nervous system is your body's communication network. The spinal cord, protected by your vertebrae, carries messages between your brain and every part of your body. When vertebrae are misaligned, they can interfere with these vital communications.`,
      interactiveElements: [
        {
          id: 'nervous-system-1',
          type: 'hotspot',
          title: 'Nerve Chart',
          description: 'Click on different spinal levels to see what they control',
          imageUrl: '/images/education/spinalnervechart.jpeg'
        }
      ]
    },
    {
      id: '4',
      title: 'Preparing for Your First Visit',
      description: 'Everything you need to know to get the most out of your initial chiropractic consultation.',
      category: 'preparation',
      type: 'article',
      duration: '8 min',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/first time gonstead clinic.jpg',
      content: `Your first visit is crucial for establishing a baseline of your spinal health. You'll undergo a comprehensive examination including consultation, X-rays, and various diagnostic tests. Come prepared with your health history, list of symptoms, and any previous medical records.`,
      downloadUrl: '/downloads/first-visit-checklist.pdf'
    },
    {
      id: '5',
      title: 'Proper Posture and Ergonomics',
      description: 'Learn how to maintain healthy posture at work, home, and during daily activities.',
      category: 'wellness',
      type: 'video',
      duration: '12 min',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/office-ergonomics-and-spinal-health.jpeg',
      videoUrl: '#posture-video',
      content: `Good posture is essential for spinal health. Poor posture puts extra stress on your spine and can lead to pain and dysfunction. Learn the principles of proper alignment and how to set up your workspace ergonomically.`
    },
    {
      id: '6',
      title: 'Post-Treatment Care Guide',
      description: 'What to expect after your adjustment and how to maximize your healing.',
      category: 'recovery',
      type: 'article',
      duration: '6 min',
      difficulty: 'beginner',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/chiropractic-spinal-examination.jpeg',
      content: `After your adjustment, your body begins the healing process. You may experience some soreness as your body adapts to the correction. Follow these guidelines to support your recovery and maintain the benefits of your treatment.`,
      downloadUrl: '/downloads/post-treatment-care.pdf'
    },
    {
      id: '7',
      title: 'Understanding X-ray Analysis',
      description: 'Learn how chiropractors use X-rays to diagnose spinal problems and plan treatment.',
      category: 'technique',
      type: 'interactive',
      duration: '14 min',
      difficulty: 'intermediate',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/image1030.png',
      content: `X-rays provide a clear picture of your spinal alignment and bone structure. The Gonstead technique uses specific X-ray views to analyze spinal mechanics and identify subluxations. Learn to read basic X-ray findings and understand what they mean for your treatment.`,
      interactiveElements: [
        {
          id: 'xray-analysis-1',
          type: 'animation',
          title: 'Normal vs Subluxated Spine',
          description: 'See the difference between healthy alignment and subluxations',
          imageUrl: '/images/education/anatomy-of-acute-lower-back-pain.jpeg'
        }
      ]
    },
    {
      id: '8',
      title: 'Spinal Health Quiz',
      description: 'Test your knowledge about spinal health and chiropractic care.',
      category: 'wellness',
      type: 'quiz',
      duration: '5 min',
      difficulty: 'intermediate',
      completed: false,
      progress: 0,
      thumbnail: '/images/education/text-neck-syndrome-illustration.jpeg',
      quiz: [
        {
          id: 'q1',
          question: 'How many vertebrae are in the cervical spine?',
          options: ['5', '7', '12', '24'],
          correctAnswer: 1,
          explanation: 'The cervical spine (neck) has 7 vertebrae, labeled C1 through C7.'
        },
        {
          id: 'q2',
          question: 'What is the primary goal of the Gonstead technique?',
          options: [
            'Pain relief only',
            'General spinal manipulation',
            'Finding and correcting the primary subluxation',
            'Muscle relaxation'
          ],
          correctAnswer: 2,
          explanation: 'The Gonstead technique focuses on identifying and correcting the primary subluxation - the root cause of spinal problems.'
        },
        {
          id: 'q3',
          question: 'Which component is NOT part of the Gonstead five-component analysis?',
          options: ['X-ray analysis', 'Blood tests', 'Palpation', 'Instrumentation'],
          correctAnswer: 1,
          explanation: 'The five components are: X-ray analysis, static/motion palpation, instrumentation, visualization, and case history. Blood tests are not part of this system.'
        }
      ]
    }
  ];

  // Filter modules based on search and category
  const filteredModules = learningModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryStats = {
    anatomy: learningModules.filter(m => m.category === 'anatomy').length,
    technique: learningModules.filter(m => m.category === 'technique').length,
    wellness: learningModules.filter(m => m.category === 'wellness').length,
    preparation: learningModules.filter(m => m.category === 'preparation').length,
    recovery: learningModules.filter(m => m.category === 'recovery').length,
  };

  const overallProgress = Math.round((completedModules.size / learningModules.length) * 100);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'anatomy': return <Brain className="h-5 w-5" />;
      case 'technique': return <Stethoscope className="h-5 w-5" />;
      case 'wellness': return <Heart className="h-5 w-5" />;
      case 'preparation': return <Shield className="h-5 w-5" />;
      case 'recovery': return <Activity className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-green-600 bg-green-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleModuleClick = (module: LearningModule) => {
    setSelectedModule(module);
    if (module.type === 'quiz') {
      setShowQuiz(true);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setShowResults(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (!selectedModule?.quiz) return;
    
    const currentQuestion = selectedModule.quiz[currentQuestionIndex];
    if (answerIndex === currentQuestion.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }

    if (currentQuestionIndex < selectedModule.quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
      setCompletedModules(prev => new Set([...prev, selectedModule.id]));
    }
  };

  const handleCompleteModule = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  if (selectedModule && showQuiz && selectedModule.quiz) {
    const currentQuestion = selectedModule.quiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedModule.quiz.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-poppins">{selectedModule.title}</h2>
                <p className="opacity-90 mt-2">Question {currentQuestionIndex + 1} of {selectedModule.quiz.length}</p>
              </div>
              <button
                onClick={() => { setSelectedModule(null); setShowQuiz(false); }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {!showResults ? (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-[#0A3A47] mb-4">{currentQuestion.question}</h3>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(index)}
                      className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-[#2a9d8f] hover:bg-[#F8F5F0] transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="font-open-sans">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-[#2a9d8f] rounded-full flex items-center justify-center mb-4">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#0A3A47] mb-2">Quiz Complete!</h3>
                <p className="text-lg text-gray-600">
                  You scored {quizScore} out of {selectedModule.quiz.length}
                </p>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-[#2a9d8f]">
                    {Math.round((quizScore / selectedModule.quiz.length) * 100)}%
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setSelectedModule(null); setShowQuiz(false); }}
                className="bg-[#2a9d8f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#238a7a] transition-colors"
              >
                Continue Learning
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (selectedModule && selectedModule.type !== 'quiz') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(selectedModule.category)}
                  <span className="text-sm opacity-90 capitalize">{selectedModule.category}</span>
                </div>
                <h2 className="text-2xl font-bold font-poppins">{selectedModule.title}</h2>
                <p className="opacity-90 mt-2">{selectedModule.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedModule.duration}
                  </div>
                  <div className={`px-2 py-1 rounded ${getDifficultyColor(selectedModule.difficulty)}`}>
                    {selectedModule.difficulty}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedModule.type === 'video' && (
              <div className="mb-6">
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-80" />
                    <p className="text-lg">Video content would load here</p>
                    <p className="text-sm opacity-80">Duration: {selectedModule.duration}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedModule.type === 'interactive' && selectedModule.interactiveElements && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedModule.interactiveElements.map((element) => (
                    <div
                      key={element.id}
                      className="border rounded-lg p-4 hover:bg-[#F8F5F0] cursor-pointer transition-colors"
                    >
                      <img
                        src={element.imageUrl}
                        alt={element.title}
                        className="w-full h-48 object-cover rounded mb-3"
                      />
                      <h4 className="font-semibold text-[#0A3A47] mb-2">{element.title}</h4>
                      <p className="text-sm text-gray-600">{element.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="prose max-w-none">
              <div className="text-[#0A3A47] font-open-sans leading-relaxed text-lg">
                {selectedModule.content}
              </div>
            </div>

            {selectedModule.downloadUrl && (
              <div className="mt-6 p-4 bg-[#F8F5F0] rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-[#0A3A47]">Downloadable Resource</h4>
                    <p className="text-sm text-gray-600">Take this guide with you for reference</p>
                  </div>
                  <button className="bg-[#2a9d8f] text-white px-4 py-2 rounded-lg hover:bg-[#238a7a] transition-colors flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => handleCompleteModule(selectedModule.id)}
                disabled={completedModules.has(selectedModule.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  completedModules.has(selectedModule.id)
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'bg-[#2a9d8f] text-white hover:bg-[#238a7a]'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                {completedModules.has(selectedModule.id) ? 'Completed' : 'Mark as Complete'}
              </button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-green-500 fill-current" />
                <span>Rate this module</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Education Hub</h2>
            <p className="opacity-90 text-lg">
              Comprehensive learning resources for {patient?.name || 'your'} chiropractic journey
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{completedModules.size}</div>
                <div className="text-sm opacity-80">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{learningModules.length}</div>
                <div className="text-sm opacity-80">Total Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <div className="text-sm opacity-80">Progress</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Brain className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Overall Progress</span>
            <span className="text-sm opacity-90">{overallProgress}% Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search learning modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent appearance-none bg-white min-w-[200px]"
            >
              <option value="all">All Categories</option>
              <option value="anatomy">Anatomy ({categoryStats.anatomy})</option>
              <option value="technique">Technique ({categoryStats.technique})</option>
              <option value="wellness">Wellness ({categoryStats.wellness})</option>
              <option value="preparation">Preparation ({categoryStats.preparation})</option>
              <option value="recovery">Recovery ({categoryStats.recovery})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Learning Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <div
            key={module.id}
            onClick={() => handleModuleClick(module)}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            <div className="relative">
              <img
                src={module.thumbnail}
                alt={module.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 text-white bg-black/50 px-2 py-1 rounded text-sm">
                  {module.type === 'video' && <Video className="h-4 w-4" />}
                  {module.type === 'article' && <FileText className="h-4 w-4" />}
                  {module.type === 'interactive' && <Target className="h-4 w-4" />}
                  {module.type === 'quiz' && <Brain className="h-4 w-4" />}
                  {module.type}
                </div>
              </div>
              <div className="absolute top-4 right-4">
                {completedModules.has(module.id) && (
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 right-4">
                <div className="bg-[#2a9d8f] text-white px-2 py-1 rounded text-sm font-semibold">
                  {module.duration}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                {getCategoryIcon(module.category)}
                <span className="text-sm text-[#2a9d8f] font-semibold capitalize">
                  {module.category}
                </span>
                <div className={`ml-auto px-2 py-1 rounded text-xs ${getDifficultyColor(module.difficulty)}`}>
                  {module.difficulty}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-[#0A3A47] mb-2 group-hover:text-[#2a9d8f] transition-colors">
                {module.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {module.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {module.duration}
                </div>
                <div className="flex items-center gap-1 text-[#2a9d8f] group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-semibold">Start</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {module.progress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs text-gray-500">{module.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#2a9d8f] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No modules found</h3>
          <p className="text-gray-500">Try adjusting your search terms or category filter</p>
        </div>
      )}

      {/* Quick Access Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-[#F8F5F0] hover:border-[#2a9d8f] transition-all">
            <Download className="h-6 w-6 text-[#2a9d8f]" />
            <span className="text-sm font-semibold text-[#0A3A47]">Download All Guides</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-[#F8F5F0] hover:border-[#2a9d8f] transition-all">
            <Users className="h-6 w-6 text-[#2a9d8f]" />
            <span className="text-sm font-semibold text-[#0A3A47]">Ask Questions</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-[#F8F5F0] hover:border-[#2a9d8f] transition-all">
            <Lightbulb className="h-6 w-6 text-[#2a9d8f]" />
            <span className="text-sm font-semibold text-[#0A3A47]">Tips & Tricks</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-[#F8F5F0] hover:border-[#2a9d8f] transition-all">
            <Award className="h-6 w-6 text-[#2a9d8f]" />
            <span className="text-sm font-semibold text-[#0A3A47]">Certificates</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducationHub;
