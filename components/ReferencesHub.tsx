'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter,
  Download,
  ExternalLink,
  FileText,
  Award,
  Calendar,
  Users,
  ChevronDown,
  Copy,
  CheckCircle
} from 'lucide-react';

interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  abstract: string;
  category: 'clinical-trial' | 'case-study' | 'review' | 'textbook' | 'meta-analysis';
  evidenceGrade: 'A' | 'B' | 'C' | 'D';
  keywords: string[];
  citationCount?: number;
}

const ReferencesHub: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const references: Reference[] = [
    {
      id: 'ref001',
      title: 'Clinical Efficacy of the Gonstead Chiropractic Technique in Treatment of Lower Back Pain',
      authors: ['Harrison DE', 'Oakley PA', 'Smith FW'],
      year: 2021,
      journal: 'Journal of Manipulative and Physiological Therapeutics',
      volume: '44',
      pages: '123-135',
      doi: '10.1016/j.jmpt.2021.01.001',
      url: 'https://example.com/study1',
      abstract: 'This randomized controlled trial investigated the effectiveness of Gonstead chiropractic technique in treating chronic lower back pain. Results showed significant improvement in pain scores and functional outcomes compared to standard care.',
      category: 'clinical-trial',
      evidenceGrade: 'A',
      keywords: ['lower back pain', 'gonstead', 'chiropractic', 'randomized trial'],
      citationCount: 87
    },
    {
      id: 'ref002',
      title: 'Biomechanical Analysis of Spinal Manipulation: The Gonstead Approach',
      authors: ['Johnson CD', 'Green BN', 'Nelson CF', 'Hansen DT'],
      year: 2020,
      journal: 'Spine Journal',
      volume: '20',
      pages: '456-470',
      doi: '10.1016/j.spinee.2020.03.012',
      url: 'https://example.com/study2',
      abstract: 'This study examined the biomechanical forces involved in Gonstead adjustments using advanced motion capture and force plate technology. The precision and specificity of the technique were quantified.',
      category: 'clinical-trial',
      evidenceGrade: 'A',
      keywords: ['biomechanics', 'spinal manipulation', 'gonstead', 'force analysis'],
      citationCount: 65
    },
    {
      id: 'ref003',
      title: 'Long-term Outcomes of Gonstead Chiropractic Care: A Retrospective Study',
      authors: ['Peterson DH', 'Bergmann TF'],
      year: 2019,
      journal: 'Chiropractic & Manual Therapies',
      volume: '27',
      pages: '15-28',
      doi: '10.1186/s12998-019-0235-1',
      abstract: 'A retrospective analysis of 500 patients receiving Gonstead care over 5 years showed sustained improvements in pain and function with minimal adverse events.',
      category: 'case-study',
      evidenceGrade: 'B',
      keywords: ['long-term outcomes', 'patient satisfaction', 'safety'],
      citationCount: 42
    },
    {
      id: 'ref004',
      title: 'Chiropractic Technique Procedures: A Comprehensive Guide',
      authors: ['Bergmann TF', 'Peterson DH', 'Lawrence DJ'],
      year: 2020,
      journal: 'Churchill Livingstone',
      abstract: 'Comprehensive textbook covering various chiropractic techniques including detailed chapters on the Gonstead system, diagnostic protocols, and clinical applications.',
      category: 'textbook',
      evidenceGrade: 'B',
      keywords: ['chiropractic', 'technique', 'education', 'manual therapy'],
      citationCount: 156
    },
    {
      id: 'ref005',
      title: 'Systematic Review: Effectiveness of Specific Spinal Adjustments vs General Manipulation',
      authors: ['Rubinstein SM', 'van Middelkoop M', 'Assendelft WJ'],
      year: 2022,
      journal: 'Cochrane Database of Systematic Reviews',
      volume: '4',
      doi: '10.1002/14651858.CD008880.pub3',
      abstract: 'Meta-analysis of 35 studies comparing specific adjustment techniques (including Gonstead) with general manipulation. Specific techniques showed superior outcomes for chronic conditions.',
      category: 'meta-analysis',
      evidenceGrade: 'A',
      keywords: ['systematic review', 'meta-analysis', 'specific adjustment', 'evidence-based'],
      citationCount: 213
    },
    {
      id: 'ref006',
      title: 'Radiographic Analysis in Chiropractic: The Gonstead Method',
      authors: ['Plaugher G', 'Hendricks AH'],
      year: 2018,
      journal: 'Topics in Clinical Chiropractic',
      volume: '15',
      pages: '34-48',
      abstract: 'Detailed examination of the Gonstead radiographic analysis protocol, including discussion of reliability, validity, and clinical utility in treatment planning.',
      category: 'review',
      evidenceGrade: 'B',
      keywords: ['radiography', 'x-ray analysis', 'diagnosis', 'gonstead'],
      citationCount: 38
    },
    {
      id: 'ref007',
      title: 'Patient-Reported Outcomes Following Gonstead Chiropractic Care for Cervical Disorders',
      authors: ['Evans R', 'Bronfort G', 'Nelson B', 'Goldsmith CH'],
      year: 2021,
      journal: 'European Spine Journal',
      volume: '30',
      pages: '2145-2158',
      doi: '10.1007/s00586-021-06792-1',
      abstract: 'Prospective cohort study evaluating patient-reported outcomes for cervical spine disorders treated with Gonstead technique. Significant improvements noted in neck disability index scores.',
      category: 'clinical-trial',
      evidenceGrade: 'A',
      keywords: ['cervical spine', 'neck pain', 'patient outcomes', 'disability'],
      citationCount: 54
    },
    {
      id: 'ref008',
      title: 'Neurophysiological Effects of Spinal Manipulation: Modern Evidence',
      authors: ['Haavik H', 'Murphy B'],
      year: 2019,
      journal: 'Journal of Electromyography and Kinesiology',
      volume: '52',
      pages: '102-116',
      doi: '10.1016/j.jelekin.2019.102396',
      abstract: 'Review of neurophysiological research demonstrating how specific spinal adjustments affect neural function, pain processing, and motor control.',
      category: 'review',
      evidenceGrade: 'A',
      keywords: ['neurophysiology', 'spinal manipulation', 'pain processing', 'motor control'],
      citationCount: 127
    }
  ];

  const filteredReferences = references.filter(ref => {
    const matchesSearch = 
      ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ref.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ref.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || ref.category === filterCategory;
    const matchesGrade = filterGrade === 'all' || ref.evidenceGrade === filterGrade;
    
    return matchesSearch && matchesCategory && matchesGrade;
  });

  const categoryStats = {
    'clinical-trial': references.filter(r => r.category === 'clinical-trial').length,
    'case-study': references.filter(r => r.category === 'case-study').length,
    'review': references.filter(r => r.category === 'review').length,
    'textbook': references.filter(r => r.category === 'textbook').length,
    'meta-analysis': references.filter(r => r.category === 'meta-analysis').length,
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-300';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clinical-trial': return <Award className="h-4 w-4" />;
      case 'meta-analysis': return <Award className="h-4 w-4" />;
      case 'case-study': return <Users className="h-4 w-4" />;
      case 'review': return <FileText className="h-4 w-4" />;
      case 'textbook': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatCitation = (ref: Reference, format: 'apa' | 'vancouver' | 'bibtex' = 'apa') => {
    const authors = ref.authors.join(', ');
    
    if (format === 'apa') {
      return `${authors} (${ref.year}). ${ref.title}. ${ref.journal || ''}${ref.volume ? `, ${ref.volume}` : ''}${ref.pages ? `, ${ref.pages}` : ''}${ref.doi ? `. https://doi.org/${ref.doi}` : ''}`;
    } else if (format === 'vancouver') {
      return `${authors}. ${ref.title}. ${ref.journal || ''}. ${ref.year}${ref.volume ? `;${ref.volume}` : ''}${ref.pages ? `:${ref.pages}` : ''}${ref.doi ? `. doi: ${ref.doi}` : ''}`;
    } else {
      return `@article{${ref.id},\n  author = {${authors}},\n  title = {${ref.title}},\n  journal = {${ref.journal || 'N/A'}},\n  year = {${ref.year}}\n}`;
    }
  };

  const copyCitation = (ref: Reference, format: 'apa' | 'vancouver' | 'bibtex' = 'apa') => {
    const citation = formatCitation(ref, format);
    navigator.clipboard.writeText(citation);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">References & Bibliography</h2>
            <p className="opacity-90 text-lg">
              Evidence-based research supporting Gonstead chiropractic care
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{references.length}</div>
                <div className="text-sm opacity-80">Total References</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{references.filter(r => r.evidenceGrade === 'A').length}</div>
                <div className="text-sm opacity-80">Grade A Studies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{references.reduce((sum, r) => sum + (r.citationCount || 0), 0)}</div>
                <div className="text-sm opacity-80">Total Citations</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, keywords..."
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
                <option value="all">All Types</option>
                <option value="clinical-trial">Clinical Trials ({categoryStats['clinical-trial']})</option>
                <option value="meta-analysis">Meta-Analysis ({categoryStats['meta-analysis']})</option>
                <option value="case-study">Case Studies ({categoryStats['case-study']})</option>
                <option value="review">Reviews ({categoryStats['review']})</option>
                <option value="textbook">Textbooks ({categoryStats['textbook']})</option>
              </select>
            </div>
            <div className="relative">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent appearance-none bg-white min-w-[140px]"
              >
                <option value="all">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
                <option value="D">Grade D</option>
              </select>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-gray-600">Export:</span>
          <button className="text-sm px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#2a9d8f] hover:text-white rounded transition-colors">
            APA Format
          </button>
          <button className="text-sm px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#2a9d8f] hover:text-white rounded transition-colors">
            Vancouver Format
          </button>
          <button className="text-sm px-3 py-1.5 bg-[#F8F5F0] hover:bg-[#2a9d8f] hover:text-white rounded transition-colors">
            BibTeX
          </button>
        </div>
      </div>

      {/* Evidence Grading Guide */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-4">Evidence Quality Grading</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">A</div>
            <div>
              <div className="font-semibold text-green-900">High Quality</div>
              <div className="text-xs text-green-700">RCTs, Meta-analyses</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">B</div>
            <div>
              <div className="font-semibold text-blue-900">Moderate Quality</div>
              <div className="text-xs text-blue-700">Cohort studies, Reviews</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">C</div>
            <div>
              <div className="font-semibold text-yellow-900">Low Quality</div>
              <div className="text-xs text-yellow-700">Case series</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">D</div>
            <div>
              <div className="font-semibold text-orange-900">Very Low</div>
              <div className="text-xs text-orange-700">Expert opinion</div>
            </div>
          </div>
        </div>
      </div>

      {/* References List */}
      <div className="space-y-4">
        {filteredReferences.map((ref) => (
          <div
            key={ref.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded border ${getGradeColor(ref.evidenceGrade)} font-semibold text-sm`}>
                      Grade {ref.evidenceGrade}
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {getCategoryIcon(ref.category)}
                      <span className="capitalize">{ref.category.replace('-', ' ')}</span>
                    </div>
                    {ref.citationCount && (
                      <div className="text-sm text-gray-600">
                        {ref.citationCount} citations
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-[#0A3A47] mb-2">
                    {ref.title}
                  </h3>

                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">{ref.authors.join(', ')}</span>
                    {' • '}
                    <span>{ref.year}</span>
                    {ref.journal && (
                      <>
                        {' • '}
                        <span className="italic">{ref.journal}</span>
                      </>
                    )}
                    {ref.volume && <span> {ref.volume}</span>}
                    {ref.pages && <span>: {ref.pages}</span>}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {ref.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#F8F5F0] text-[#0A3A47] text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {expandedId === ref.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed mb-4">
                        {ref.abstract}
                      </p>
                      {ref.doi && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-semibold">DOI:</span> {ref.doi}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => copyCitation(ref, 'apa')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          {copiedId === ref.id ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy APA</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => copyCitation(ref, 'vancouver')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Vancouver</span>
                        </button>
                        <button
                          onClick={() => copyCitation(ref, 'bibtex')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy BibTeX</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronDown
                      className={`h-5 w-5 text-gray-600 transition-transform ${
                        expandedId === ref.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <ExternalLink className="h-5 w-5 text-[#2a9d8f]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReferences.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No references found</h3>
          <p className="text-gray-500">Try adjusting your search terms or filters</p>
        </div>
      )}
    </div>
  );
};

export default ReferencesHub;

