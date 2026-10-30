'use client';

import React, { useState } from 'react';
import { 
  Download,
  FileText,
  Folder,
  Search,
  Filter,
  Star,
  Calendar,
  Users,
  ClipboardList,
  File,
  FileSpreadsheet,
  FileVideo,
  BookOpen,
  Award,
  CheckCircle,
  Eye,
  Share2
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'forms' | 'guides' | 'protocols' | 'education' | 'marketing' | 'templates';
  fileType: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'video';
  fileSize: string;
  downloadCount: number;
  lastUpdated: string;
  featured: boolean;
  audience: 'professional' | 'patient' | 'both';
  preview?: boolean;
}

const ProfessionalToolsHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAudience, setFilterAudience] = useState<string>('all');

  const resources: Resource[] = [
    {
      id: 'res001',
      title: 'Patient Intake Form - Comprehensive',
      description: 'Complete new patient intake form including health history, current complaints, and consent documentation. Customizable for your practice.',
      category: 'forms',
      fileType: 'pdf',
      fileSize: '245 KB',
      downloadCount: 1243,
      lastUpdated: '2024-01-15',
      featured: true,
      audience: 'professional',
      preview: true
    },
    {
      id: 'res002',
      title: 'Gonstead Analysis Worksheet',
      description: 'Systematic worksheet for documenting five-component analysis findings including visualization, instrumentation, static palpation, motion palpation, and X-ray analysis.',
      category: 'forms',
      fileType: 'pdf',
      fileSize: '189 KB',
      downloadCount: 2156,
      lastUpdated: '2024-02-10',
      featured: true,
      audience: 'professional',
      preview: true
    },
    {
      id: 'res003',
      title: 'Understanding Your First Chiropractic Visit',
      description: 'Patient education guide explaining what to expect during initial consultation, examination, and first adjustment. Includes preparation tips and FAQ.',
      category: 'guides',
      fileType: 'pdf',
      fileSize: '1.2 MB',
      downloadCount: 3421,
      lastUpdated: '2024-01-20',
      featured: true,
      audience: 'patient',
      preview: true
    },
    {
      id: 'res004',
      title: 'Post-Adjustment Care Instructions',
      description: 'Comprehensive patient handout covering post-adjustment expectations, activity modifications, and healing timeline. Available in multiple languages.',
      category: 'education',
      fileType: 'pdf',
      fileSize: '432 KB',
      downloadCount: 2890,
      lastUpdated: '2024-02-05',
      featured: false,
      audience: 'patient',
      preview: true
    },
    {
      id: 'res005',
      title: 'Gonstead Technique Protocol Manual',
      description: 'Detailed clinical protocols for Gonstead adjustments by spinal region. Includes biomechanics, setup positions, and troubleshooting.',
      category: 'protocols',
      fileType: 'pdf',
      fileSize: '3.8 MB',
      downloadCount: 1567,
      lastUpdated: '2024-01-10',
      featured: true,
      audience: 'professional',
      preview: false
    },
    {
      id: 'res006',
      title: 'X-ray Analysis Checklist',
      description: 'Step-by-step checklist for systematic radiographic analysis. Covers alignment, disc spacing, bone integrity, and pathology identification.',
      category: 'forms',
      fileType: 'pdf',
      fileSize: '278 KB',
      downloadCount: 1823,
      lastUpdated: '2024-02-08',
      featured: false,
      audience: 'professional',
      preview: true
    },
    {
      id: 'res007',
      title: 'Spinal Health Maintenance Guide',
      description: 'Lifestyle and ergonomics guide for maintaining spinal health. Covers posture, exercise, nutrition, and workplace setup.',
      category: 'education',
      fileType: 'pdf',
      fileSize: '1.5 MB',
      downloadCount: 4102,
      lastUpdated: '2024-01-18',
      featured: true,
      audience: 'both',
      preview: true
    },
    {
      id: 'res008',
      title: 'Progress Tracking Chart',
      description: 'Visual outcome measurement tools including pain scales, functional assessments, and quality of life metrics for monitoring patient progress.',
      category: 'forms',
      fileType: 'xlsx',
      fileSize: '156 KB',
      downloadCount: 892,
      lastUpdated: '2024-02-12',
      featured: false,
      audience: 'professional',
      preview: false
    },
    {
      id: 'res009',
      title: 'Marketing Template: Educational Poster Set',
      description: 'Professional poster designs explaining spine anatomy, common conditions, and benefits of chiropractic care. Print-ready files.',
      category: 'marketing',
      fileType: 'pdf',
      fileSize: '8.9 MB',
      downloadCount: 1456,
      lastUpdated: '2024-01-25',
      featured: false,
      audience: 'professional',
      preview: true
    },
    {
      id: 'res010',
      title: 'Informed Consent Template',
      description: 'Legally reviewed informed consent document covering risks, benefits, and alternatives to chiropractic care. Customizable for state requirements.',
      category: 'templates',
      fileType: 'docx',
      fileSize: '124 KB',
      downloadCount: 2134,
      lastUpdated: '2024-02-01',
      featured: false,
      audience: 'professional',
      preview: false
    },
    {
      id: 'res011',
      title: 'Exercises for Spinal Health Video Series',
      description: 'Instructional video library of therapeutic exercises and stretches organized by spinal region. Includes modifications for different fitness levels.',
      category: 'education',
      fileType: 'video',
      fileSize: '250 MB',
      downloadCount: 3678,
      lastUpdated: '2024-01-30',
      featured: true,
      audience: 'both',
      preview: true
    },
    {
      id: 'res012',
      title: 'Research Summary: Gonstead Effectiveness',
      description: 'Compiled summary of peer-reviewed research supporting Gonstead technique. Includes study abstracts, outcomes, and clinical applications.',
      category: 'guides',
      fileType: 'pdf',
      fileSize: '2.1 MB',
      downloadCount: 1789,
      lastUpdated: '2024-02-15',
      featured: true,
      audience: 'both',
      preview: true
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory;
    const matchesAudience = filterAudience === 'all' || 
                            resource.audience === filterAudience || 
                            resource.audience === 'both';
    
    return matchesSearch && matchesCategory && matchesAudience;
  });

  const categoryStats = {
    forms: resources.filter(r => r.category === 'forms').length,
    guides: resources.filter(r => r.category === 'guides').length,
    protocols: resources.filter(r => r.category === 'protocols').length,
    education: resources.filter(r => r.category === 'education').length,
    marketing: resources.filter(r => r.category === 'marketing').length,
    templates: resources.filter(r => r.category === 'templates').length,
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />;
      case 'docx': return <File className="h-5 w-5 text-blue-600" />;
      case 'xlsx': return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pptx': return <File className="h-5 w-5 text-orange-600" />;
      case 'video': return <FileVideo className="h-5 w-5 text-purple-600" />;
      default: return <File className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'forms': return <ClipboardList className="h-4 w-4" />;
      case 'guides': return <BookOpen className="h-4 w-4" />;
      case 'protocols': return <Award className="h-4 w-4" />;
      case 'education': return <Users className="h-4 w-4" />;
      case 'marketing': return <Share2 className="h-4 w-4" />;
      case 'templates': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const totalDownloads = resources.reduce((sum, r) => sum + r.downloadCount, 0);
  const featuredCount = resources.filter(r => r.featured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Professional Tools & Downloads</h2>
            <p className="opacity-90 text-lg">
              Essential resources, forms, and guides for practitioners and patients
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{resources.length}</div>
                <div className="text-sm opacity-80">Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
                <div className="text-sm opacity-80">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{featuredCount}</div>
                <div className="text-sm opacity-80">Featured</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Folder className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent appearance-none bg-white min-w-[180px]"
              >
                <option value="all">All Categories</option>
                <option value="forms">Forms ({categoryStats.forms})</option>
                <option value="guides">Guides ({categoryStats.guides})</option>
                <option value="protocols">Protocols ({categoryStats.protocols})</option>
                <option value="education">Education ({categoryStats.education})</option>
                <option value="marketing">Marketing ({categoryStats.marketing})</option>
                <option value="templates">Templates ({categoryStats.templates})</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterAudience}
                onChange={(e) => setFilterAudience(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent appearance-none bg-white min-w-[160px]"
              >
                <option value="all">All Audiences</option>
                <option value="professional">Professionals</option>
                <option value="patient">Patients</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources */}
      {filterCategory === 'all' && filterAudience === 'all' && searchTerm === '' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h3 className="text-lg font-semibold text-[#0A3A47]">Featured Resources</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.filter(r => r.featured).slice(0, 3).map((resource) => (
              <div
                key={resource.id}
                className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(resource.fileType)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#0A3A47] text-sm mb-1 line-clamp-2">
                      {resource.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="uppercase font-semibold">{resource.fileType}</span>
                      <span>•</span>
                      <span>{resource.fileSize}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full bg-[#2a9d8f] text-white py-2 rounded-lg hover:bg-[#238a7a] transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                {getFileIcon(resource.fileType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-[#0A3A47] text-lg line-clamp-2">
                    {resource.title}
                  </h3>
                  {resource.featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                    resource.category === 'forms' ? 'bg-blue-100 text-blue-800' :
                    resource.category === 'guides' ? 'bg-green-100 text-green-800' :
                    resource.category === 'protocols' ? 'bg-purple-100 text-purple-800' :
                    resource.category === 'education' ? 'bg-orange-100 text-orange-800' :
                    resource.category === 'marketing' ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getCategoryIcon(resource.category)}
                    <span className="capitalize">{resource.category}</span>
                  </div>

                  <div className={`px-2 py-1 rounded text-xs ${
                    resource.audience === 'professional' ? 'bg-indigo-100 text-indigo-800' :
                    resource.audience === 'patient' ? 'bg-teal-100 text-teal-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {resource.audience === 'both' ? 'All Audiences' : resource.audience.charAt(0).toUpperCase() + resource.audience.slice(1)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      <span>{resource.downloadCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="uppercase font-semibold">{resource.fileType} • {resource.fileSize}</div>
                </div>

                <div className="flex gap-2">
                  {resource.preview && (
                    <button className="flex-1 px-4 py-2 border-2 border-[#2a9d8f] text-[#2a9d8f] rounded-lg hover:bg-[#F8F5F0] transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                  )}
                  <button className="flex-1 bg-[#2a9d8f] text-white px-4 py-2 rounded-lg hover:bg-[#238a7a] transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Resource Request */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#0A3A47] mb-2">Can't find what you need?</h3>
            <p className="text-gray-700 mb-3">
              We're constantly adding new resources to our library. If you have a specific need or suggestion for additional materials, we'd love to hear from you.
            </p>
            <button className="bg-[#2a9d8f] text-white px-6 py-2 rounded-lg hover:bg-[#238a7a] transition-colors font-semibold">
              Request a Resource
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalToolsHub;

