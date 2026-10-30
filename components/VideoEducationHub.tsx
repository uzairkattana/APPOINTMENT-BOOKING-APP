'use client';

import React, { useState } from 'react';
import { 
  Play,
  Video,
  PlayCircle,
  Clock,
  Eye,
  ThumbsUp,
  Bookmark,
  Share2,
  Download,
  ChevronRight,
  CheckCircle,
  Target,
  Zap,
  Search,
  Filter
} from 'lucide-react';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  category: 'technique' | 'anatomy' | 'patient-education' | 'case-review' | 'diagnostic';
  duration: string;
  views: number;
  likes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  tags: string[];
  releaseDate: string;
  featured: boolean;
}

interface InteractiveElement {
  id: string;
  title: string;
  type: '3d-model' | 'animation' | 'quiz' | 'diagram';
  description: string;
  icon: React.ReactNode;
}

const VideoEducationHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());

  const videoContent: VideoContent[] = [
    {
      id: 'vid001',
      title: 'Introduction to Gonstead Technique: The Five Components',
      description: 'Comprehensive overview of the five-component analysis system that makes Gonstead unique. Learn about visualization, instrumentation, static palpation, motion palpation, and X-ray analysis.',
      category: 'technique',
      duration: '15:42',
      views: 12450,
      likes: 892,
      difficulty: 'beginner',
      thumbnail: '/images/education/gonstead clinic_page-0001.jpg',
      tags: ['gonstead', 'basics', 'analysis', 'fundamentals'],
      releaseDate: '2024-01-15',
      featured: true
    },
    {
      id: 'vid002',
      title: 'Spine Anatomy 101: Understanding Your Vertebrae',
      description: 'Detailed walkthrough of spinal anatomy including vertebrae, discs, nerves, and how they work together. Visual demonstrations help you understand your body better.',
      category: 'anatomy',
      duration: '12:30',
      views: 18320,
      likes: 1245,
      difficulty: 'beginner',
      thumbnail: '/images/education/anatomy-of-acute-lower-back-pain.jpeg',
      tags: ['anatomy', 'spine', 'education', 'basics'],
      releaseDate: '2024-01-10',
      featured: true
    },
    {
      id: 'vid003',
      title: 'What to Expect: Your First Gonstead Adjustment',
      description: 'Step-by-step guide for new patients showing exactly what happens during a Gonstead adjustment. Reduces anxiety and helps you prepare for your visit.',
      category: 'patient-education',
      duration: '8:15',
      views: 22100,
      likes: 1680,
      difficulty: 'beginner',
      thumbnail: '/images/education/first time gonstead clinic.jpg',
      tags: ['first-visit', 'patient-info', 'what-to-expect'],
      releaseDate: '2024-02-01',
      featured: true
    },
    {
      id: 'vid004',
      title: 'Advanced Nervoscope Techniques and Interpretation',
      description: 'In-depth training on using the Nervoscope for bilateral temperature differential analysis. Learn to identify patterns and correlate findings.',
      category: 'diagnostic',
      duration: '22:45',
      views: 5420,
      likes: 412,
      difficulty: 'advanced',
      thumbnail: '/images/education/image1030.png',
      tags: ['nervoscope', 'instrumentation', 'advanced', 'diagnosis'],
      releaseDate: '2024-01-20',
      featured: false
    },
    {
      id: 'vid005',
      title: 'Case Study: Chronic Lower Back Pain Resolution',
      description: 'Follow a real patient case from initial consultation through successful resolution. See X-rays, adjustment protocols, and outcome measures.',
      category: 'case-review',
      duration: '18:30',
      views: 9870,
      likes: 756,
      difficulty: 'intermediate',
      thumbnail: '/images/education/chiropractic-spinal-examination.jpeg',
      tags: ['case-study', 'lower-back', 'outcomes', 'real-results'],
      releaseDate: '2024-01-25',
      featured: true
    },
    {
      id: 'vid006',
      title: 'Spinal Nerve Chart Explained',
      description: 'Learn how each spinal level connects to different organs and body systems. Understand the neurological basis of chiropractic care.',
      category: 'anatomy',
      duration: '10:20',
      views: 15600,
      likes: 1120,
      difficulty: 'intermediate',
      thumbnail: '/images/education/spinal-nerve-and-organ-function-chart.jpeg',
      tags: ['nerves', 'anatomy', 'connections', 'organ-systems'],
      releaseDate: '2024-02-05',
      featured: false
    },
    {
      id: 'vid007',
      title: 'Proper Posture and Ergonomics',
      description: 'Practical tips for maintaining spinal health at work and home. Ergonomic setup demonstrations and posture correction exercises.',
      category: 'patient-education',
      duration: '14:15',
      views: 13240,
      likes: 980,
      difficulty: 'beginner',
      thumbnail: '/images/education/office-ergonomics-and-spinal-health.jpeg',
      tags: ['posture', 'ergonomics', 'prevention', 'wellness'],
      releaseDate: '2024-01-30',
      featured: false
    },
    {
      id: 'vid008',
      title: 'Cervical Spine Adjustments: Technique Breakdown',
      description: 'Detailed demonstration of cervical adjustment techniques specific to Gonstead method. Includes patient positioning and safety considerations.',
      category: 'technique',
      duration: '16:50',
      views: 7890,
      likes: 623,
      difficulty: 'advanced',
      thumbnail: '/images/education/cervical-spine-pain-and-inflammation.jpeg',
      tags: ['cervical', 'technique', 'neck', 'adjustment'],
      releaseDate: '2024-02-10',
      featured: false
    }
  ];

  const interactiveElements: InteractiveElement[] = [
    {
      id: 'int001',
      title: '3D Spine Model',
      type: '3d-model',
      description: 'Rotate and explore a detailed 3D model of the human spine. Click on vertebrae to learn about each segment.',
      icon: <Target className="h-6 w-6" />
    },
    {
      id: 'int002',
      title: 'Subluxation Animation',
      type: 'animation',
      description: 'Watch animated demonstrations showing how subluxations occur and how Gonstead adjustments correct them.',
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: 'int003',
      title: 'Knowledge Check Quiz',
      type: 'quiz',
      description: 'Test your understanding with interactive quizzes after each video lesson. Track your progress and earn certificates.',
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      id: 'int004',
      title: 'Interactive Anatomy Diagrams',
      type: 'diagram',
      description: 'Click on body parts to see which spinal nerves control them. Understand the spine-body connection.',
      icon: <Target className="h-6 w-6" />
    }
  ];

  const filteredVideos = videoContent.filter(video => {
    const matchesSearch = 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categoryStats = {
    'technique': videoContent.filter(v => v.category === 'technique').length,
    'anatomy': videoContent.filter(v => v.category === 'anatomy').length,
    'patient-education': videoContent.filter(v => v.category === 'patient-education').length,
    'case-review': videoContent.filter(v => v.category === 'case-review').length,
    'diagnostic': videoContent.filter(v => v.category === 'diagnostic').length,
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleBookmark = (videoId: string) => {
    setBookmarkedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const VideoPlaceholder: React.FC<{ video: VideoContent }> = ({ video }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden group cursor-pointer">
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="h-8 w-8 text-[#2a9d8f] ml-1" />
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {video.duration}
        </div>
        {video.featured && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
            FEATURED
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(video.difficulty)}`}>
            {video.difficulty.toUpperCase()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(video.id);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <Bookmark
              className={`h-5 w-5 ${
                bookmarkedVideos.has(video.id)
                  ? 'fill-[#2a9d8f] text-[#2a9d8f]'
                  : 'text-gray-400'
              }`}
            />
          </button>
        </div>

        <h3 className="text-lg font-bold text-[#0A3A47] mb-2 line-clamp-2 group-hover:text-[#2a9d8f] transition-colors">
          {video.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {video.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {video.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{video.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{video.likes.toLocaleString()}</span>
            </div>
          </div>
          <button className="text-[#2a9d8f] hover:text-[#238a7a] flex items-center gap-1 font-semibold">
            Watch
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Video Education Library</h2>
            <p className="opacity-90 text-lg">
              Visual learning resources and interactive content
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{videoContent.length}</div>
                <div className="text-sm opacity-80">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(videoContent.reduce((sum, v) => sum + parseInt(v.duration.split(':')[0]), 0))}h
                </div>
                <div className="text-sm opacity-80">Content</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{bookmarkedVideos.size}</div>
                <div className="text-sm opacity-80">Bookmarked</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Video className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Video Carousel */}
      {selectedCategory === 'all' && searchTerm === '' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#0A3A47] mb-4 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-[#2a9d8f]" />
            Featured Videos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoContent.filter(v => v.featured).slice(0, 3).map(video => (
              <div key={video.id} className="relative">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <h4 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h4>
                      <div className="text-xs opacity-90">{video.duration}</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="h-6 w-6 text-[#2a9d8f] ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent appearance-none bg-white min-w-[220px]"
            >
              <option value="all">All Categories</option>
              <option value="technique">Technique ({categoryStats['technique']})</option>
              <option value="anatomy">Anatomy ({categoryStats['anatomy']})</option>
              <option value="patient-education">Patient Education ({categoryStats['patient-education']})</option>
              <option value="case-review">Case Reviews ({categoryStats['case-review']})</option>
              <option value="diagnostic">Diagnostic ({categoryStats['diagnostic']})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map(video => (
          <VideoPlaceholder key={video.id} video={video} />
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No videos found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Interactive Elements */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-4">Interactive Learning Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interactiveElements.map(element => (
            <div
              key={element.id}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-[#2a9d8f] hover:bg-[#F8F5F0] transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#2a9d8f]/10 rounded-lg text-[#2a9d8f] group-hover:bg-[#2a9d8f] group-hover:text-white transition-colors">
                  {element.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#0A3A47] mb-2 group-hover:text-[#2a9d8f] transition-colors">
                    {element.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {element.description}
                  </p>
                  <div className="mt-3 text-[#2a9d8f] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Try it now
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Path */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-4">Suggested Learning Path</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-gray-700">
            <div className="w-6 h-6 bg-[#2a9d8f] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-semibold">Start with Basics</div>
              <div className="text-sm text-gray-600">Watch introductory videos about spine anatomy and Gonstead principles</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <div className="w-6 h-6 bg-[#2a9d8f] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-semibold">Understand Techniques</div>
              <div className="text-sm text-gray-600">Learn about diagnostic methods and adjustment procedures</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <div className="w-6 h-6 bg-[#2a9d8f] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-semibold">Review Real Cases</div>
              <div className="text-sm text-gray-600">See how Gonstead technique works in actual patient scenarios</div>
            </div>
          </div>
          <div className="flex items-start gap-3 text-gray-700">
            <div className="w-6 h-6 bg-[#2a9d8f] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <div>
              <div className="font-semibold">Test Your Knowledge</div>
              <div className="text-sm text-gray-600">Complete interactive quizzes to reinforce your learning</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEducationHub;

