'use client';

import React, { useState } from 'react';
import { 
  BookOpen,
  Search,
  Filter,
  Info,
  ChevronRight,
  Hash,
  Bookmark,
  Volume2,
  ExternalLink
} from 'lucide-react';

interface GlossaryTerm {
  id: string;
  term: string;
  pronunciation?: string;
  category: 'anatomy' | 'condition' | 'technique' | 'diagnostic' | 'general';
  definition: string;
  synonyms?: string[];
  relatedTerms?: string[];
  clinicalContext?: string;
}

interface TooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export const GlossaryTooltip: React.FC<TooltipProps> = ({ term, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        className="underline decoration-dotted decoration-[#2a9d8f] cursor-help text-[#0A3A47]"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-white border-2 border-[#2a9d8f] rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          <div className="font-semibold text-[#0A3A47] mb-1 text-sm">{term}</div>
          <div className="text-xs text-gray-600 leading-relaxed">{definition}</div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-[#2a9d8f]"></div>
        </div>
      )}
    </span>
  );
};

const MedicalGlossary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [bookmarkedTerms, setBookmarkedTerms] = useState<Set<string>>(new Set());

  const glossaryTerms: GlossaryTerm[] = [
    {
      id: 'gt001',
      term: 'Subluxation',
      pronunciation: 'sub-luk-SAY-shun',
      category: 'condition',
      definition: 'A misalignment of one or more vertebrae in the spinal column that interferes with proper nerve function and communication between the brain and body.',
      synonyms: ['Vertebral Subluxation Complex', 'VSC'],
      relatedTerms: ['Adjustment', 'Vertebra', 'Nerve Interference'],
      clinicalContext: 'In Gonstead technique, identifying and correcting the primary subluxation is the main focus of treatment.'
    },
    {
      id: 'gt002',
      term: 'Adjustment',
      pronunciation: 'uh-JUST-ment',
      category: 'technique',
      definition: 'A specific, controlled force applied to a vertebra to correct a subluxation and restore proper spinal alignment and nerve function.',
      synonyms: ['Spinal Manipulation', 'Chiropractic Correction'],
      relatedTerms: ['Subluxation', 'Gonstead Technique', 'Thrust'],
      clinicalContext: 'Gonstead adjustments are known for their precision and specificity in targeting individual vertebrae.'
    },
    {
      id: 'gt003',
      term: 'Vertebra',
      pronunciation: 'VER-tuh-bruh',
      category: 'anatomy',
      definition: 'One of the 33 individual bones that stack to form the spinal column. The movable vertebrae include 7 cervical, 12 thoracic, and 5 lumbar.',
      synonyms: ['Spinal Bone'],
      relatedTerms: ['Intervertebral Disc', 'Spinal Column', 'Facet Joint'],
      clinicalContext: 'Each vertebra is analyzed individually in the Gonstead system to determine if it requires adjustment.'
    },
    {
      id: 'gt004',
      term: 'Intervertebral Disc',
      pronunciation: 'in-ter-VER-tuh-brul DISK',
      category: 'anatomy',
      definition: 'A cushion-like pad between vertebrae consisting of a tough outer layer (annulus fibrosus) and gel-like center (nucleus pulposus) that absorbs shock and allows spinal movement.',
      synonyms: ['Spinal Disc', 'Disc'],
      relatedTerms: ['Herniated Disc', 'Disc Degeneration', 'Vertebra'],
      clinicalContext: 'Disc health is evaluated through X-ray analysis and palpation in the Gonstead approach.'
    },
    {
      id: 'gt005',
      term: 'Palpation',
      pronunciation: 'pal-PAY-shun',
      category: 'diagnostic',
      definition: 'The examination technique of using hands to feel the spine and surrounding tissues to detect abnormalities in temperature, texture, and alignment.',
      synonyms: ['Manual Examination'],
      relatedTerms: ['Static Palpation', 'Motion Palpation', 'Instrumentation'],
      clinicalContext: 'Both static and motion palpation are essential components of the Gonstead five-part analysis system.'
    },
    {
      id: 'gt006',
      term: 'Nervoscope',
      pronunciation: 'NER-vo-skope',
      category: 'diagnostic',
      definition: 'A dual-probe instrument used in Gonstead technique that measures temperature differences along the spine to detect inflammation and nerve interference.',
      synonyms: ['Nerve-O-Scope', 'Temperature Scanner'],
      relatedTerms: ['Instrumentation', 'Subluxation', 'Nerve Function'],
      clinicalContext: 'The Nervoscope helps identify areas of nerve dysfunction by detecting bilateral temperature asymmetry.'
    },
    {
      id: 'gt007',
      term: 'Gonstead Technique',
      pronunciation: 'GON-sted tek-NEEK',
      category: 'technique',
      definition: 'A comprehensive chiropractic system developed by Dr. Clarence Gonstead that uses specific analysis methods to identify and correct vertebral subluxations with precision.',
      synonyms: ['Gonstead Method', 'Gonstead System'],
      relatedTerms: ['Five-Component Analysis', 'Specific Adjustment', 'Full Spine Radiography'],
      clinicalContext: 'The Gonstead technique emphasizes finding and correcting the primary subluxation rather than treating symptoms.'
    },
    {
      id: 'gt008',
      term: 'Cervical Spine',
      pronunciation: 'SER-vih-kul SPINE',
      category: 'anatomy',
      definition: 'The upper seven vertebrae (C1-C7) of the spine located in the neck region, responsible for supporting the head and allowing neck movement.',
      synonyms: ['Neck', 'C-Spine'],
      relatedTerms: ['Atlas', 'Axis', 'Thoracic Spine'],
      clinicalContext: 'Cervical subluxations are common and can affect nerve supply to the head, neck, shoulders, and arms.'
    },
    {
      id: 'gt009',
      term: 'Thoracic Spine',
      pronunciation: 'thor-AS-ik SPINE',
      category: 'anatomy',
      definition: 'The middle twelve vertebrae (T1-T12) that connect to the ribs and form the upper and mid-back region of the spine.',
      synonyms: ['Mid-back', 'Upper Back', 'T-Spine'],
      relatedTerms: ['Rib Cage', 'Kyphosis', 'Lumbar Spine'],
      clinicalContext: 'Thoracic subluxations can affect organ function due to nerve connections in this region.'
    },
    {
      id: 'gt010',
      term: 'Lumbar Spine',
      pronunciation: 'LUM-bar SPINE',
      category: 'anatomy',
      definition: 'The lower five vertebrae (L1-L5) in the lower back that bear most of the body\'s weight and provide flexibility for bending and twisting.',
      synonyms: ['Lower Back', 'L-Spine'],
      relatedTerms: ['Sacrum', 'Disc Herniation', 'Lordosis'],
      clinicalContext: 'The lumbar spine is a common site for subluxations and disc problems due to weight-bearing stress.'
    },
    {
      id: 'gt011',
      term: 'Atlas',
      pronunciation: 'AT-lus',
      category: 'anatomy',
      definition: 'The first cervical vertebra (C1) that supports the skull and allows nodding movements of the head.',
      synonyms: ['C1', 'First Cervical'],
      relatedTerms: ['Axis', 'Occipital', 'Upper Cervical'],
      clinicalContext: 'Atlas misalignment can significantly impact overall spinal balance and nerve function.'
    },
    {
      id: 'gt012',
      term: 'Axis',
      pronunciation: 'AK-sis',
      category: 'anatomy',
      definition: 'The second cervical vertebra (C2) that has a peg-like projection allowing the atlas to rotate, enabling head turning movements.',
      synonyms: ['C2', 'Second Cervical'],
      relatedTerms: ['Atlas', 'Odontoid Process', 'Rotation'],
      clinicalContext: 'The atlas-axis complex is critical for head mobility and requires specialized adjustment techniques.'
    },
    {
      id: 'gt013',
      term: 'Sacrum',
      pronunciation: 'SAY-krum',
      category: 'anatomy',
      definition: 'A triangular bone at the base of the spine formed by the fusion of five vertebrae, connecting the spine to the pelvis.',
      synonyms: ['Sacral Bone'],
      relatedTerms: ['Pelvis', 'Coccyx', 'Sacroiliac Joint'],
      clinicalContext: 'Sacral alignment is foundational in Gonstead technique and often addressed first in treatment.'
    },
    {
      id: 'gt014',
      term: 'Facet Joint',
      pronunciation: 'FAS-et JOYNT',
      category: 'anatomy',
      definition: 'Small joints between adjacent vertebrae that guide and limit spinal movement while providing stability.',
      synonyms: ['Zygapophyseal Joint', 'Z-Joint'],
      relatedTerms: ['Arthritis', 'Joint Dysfunction', 'Vertebra'],
      clinicalContext: 'Facet joint dysfunction can cause pain and restricted movement, often addressed through specific adjustments.'
    },
    {
      id: 'gt015',
      term: 'Kinesiology',
      pronunciation: 'kih-nee-see-OL-uh-jee',
      category: 'general',
      definition: 'The scientific study of human movement, including analysis of posture, gait, and muscle function.',
      synonyms: ['Movement Science'],
      relatedTerms: ['Biomechanics', 'Muscle Testing', 'Gait Analysis'],
      clinicalContext: 'Kinesiological assessment helps identify movement patterns that may contribute to spinal problems.'
    },
    {
      id: 'gt016',
      term: 'Scoliosis',
      pronunciation: 'sko-lee-OH-sis',
      category: 'condition',
      definition: 'An abnormal lateral (sideways) curvature of the spine that can occur in the cervical, thoracic, or lumbar regions.',
      synonyms: ['Spinal Curvature'],
      relatedTerms: ['Cobb Angle', 'Vertebral Rotation', 'X-ray Analysis'],
      clinicalContext: 'Gonstead technique uses specific X-ray analysis to assess scoliosis and determine appropriate correction strategies.'
    },
    {
      id: 'gt017',
      term: 'Lordosis',
      pronunciation: 'lor-DOH-sis',
      category: 'condition',
      definition: 'The normal forward curve of the cervical and lumbar spine; excessive curvature is termed hyperlordosis.',
      synonyms: ['Spinal Curve', 'Swayback'],
      relatedTerms: ['Kyphosis', 'Posture', 'Spinal Alignment'],
      clinicalContext: 'Maintaining proper lordotic curves is essential for optimal spinal biomechanics and nerve function.'
    },
    {
      id: 'gt018',
      term: 'Kyphosis',
      pronunciation: 'ky-FOH-sis',
      category: 'condition',
      definition: 'The normal backward curve of the thoracic spine; excessive curvature creates a hunched appearance.',
      synonyms: ['Hunchback', 'Dowager\'s Hump'],
      relatedTerms: ['Lordosis', 'Posture', 'Thoracic Spine'],
      clinicalContext: 'Abnormal kyphotic curves can be improved through specific chiropractic adjustments and postural rehabilitation.'
    },
    {
      id: 'gt019',
      term: 'Sciatica',
      pronunciation: 'sy-AT-ih-kuh',
      category: 'condition',
      definition: 'Pain that radiates along the sciatic nerve pathway from the lower back through the hip and down the leg, often caused by nerve compression.',
      synonyms: ['Sciatic Nerve Pain', 'Radiculopathy'],
      relatedTerms: ['Disc Herniation', 'Nerve Root', 'Lumbar Spine'],
      clinicalContext: 'Sciatica often responds well to Gonstead adjustments that address lumbar subluxations and disc involvement.'
    },
    {
      id: 'gt020',
      term: 'Radiography',
      pronunciation: 'ray-dee-OG-ruh-fee',
      category: 'diagnostic',
      definition: 'The use of X-rays to create images of internal body structures, particularly bones and joints.',
      synonyms: ['X-ray Imaging'],
      relatedTerms: ['Full Spine X-ray', 'Segmental X-ray', 'Imaging'],
      clinicalContext: 'Full spine radiography is a cornerstone of Gonstead analysis, revealing spinal alignment and bone structure.'
    }
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = 
      term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (term.synonyms?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = filterCategory === 'all' || term.category === filterCategory;
    const matchesLetter = selectedLetter === 'all' || term.term[0].toLowerCase() === selectedLetter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesLetter;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const categoryStats = {
    anatomy: glossaryTerms.filter(t => t.category === 'anatomy').length,
    condition: glossaryTerms.filter(t => t.category === 'condition').length,
    technique: glossaryTerms.filter(t => t.category === 'technique').length,
    diagnostic: glossaryTerms.filter(t => t.category === 'diagnostic').length,
    general: glossaryTerms.filter(t => t.category === 'general').length,
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'anatomy': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'condition': return 'bg-red-100 text-red-800 border-red-300';
      case 'technique': return 'bg-green-100 text-green-800 border-green-300';
      case 'diagnostic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'general': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleBookmark = (termId: string) => {
    setBookmarkedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(termId)) {
        newSet.delete(termId);
      } else {
        newSet.add(termId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Medical Glossary</h2>
            <p className="opacity-90 text-lg">
              Comprehensive chiropractic and medical terminology reference
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{glossaryTerms.length}</div>
                <div className="text-sm opacity-80">Total Terms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{categoryStats.anatomy + categoryStats.technique}</div>
                <div className="text-sm opacity-80">Key Concepts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{bookmarkedTerms.size}</div>
                <div className="text-sm opacity-80">Bookmarked</div>
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
              placeholder="Search terms, definitions, or synonyms..."
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
              <option value="condition">Conditions ({categoryStats.condition})</option>
              <option value="technique">Techniques ({categoryStats.technique})</option>
              <option value="diagnostic">Diagnostics ({categoryStats.diagnostic})</option>
              <option value="general">General ({categoryStats.general})</option>
            </select>
          </div>
        </div>

        {/* Alphabetical Filter */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600 font-semibold">Filter by Letter:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedLetter('all')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                selectedLetter === 'all'
                  ? 'bg-[#2a9d8f] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  selectedLetter === letter
                    ? 'bg-[#2a9d8f] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Glossary Terms */}
      <div className="space-y-3">
        {filteredTerms.map((term) => (
          <div
            key={term.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#0A3A47]">{term.term}</h3>
                  {term.pronunciation && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="italic">{term.pronunciation}</span>
                    </div>
                  )}
                  <div className={`px-2 py-1 rounded border text-xs ${getCategoryColor(term.category)}`}>
                    {term.category}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-3">
                  {term.definition}
                </p>

                {term.clinicalContext && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-blue-900 mb-1">Clinical Context</div>
                        <div className="text-sm text-blue-800">{term.clinicalContext}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {term.synonyms && term.synonyms.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">Also known as:</span>
                      <span className="text-gray-600 ml-2">{term.synonyms.join(', ')}</span>
                    </div>
                  )}
                  {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">Related:</span>
                      <span className="text-gray-600 ml-2">{term.relatedTerms.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleBookmark(term.id)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <Bookmark
                  className={`h-5 w-5 ${
                    bookmarkedTerms.has(term.id)
                      ? 'fill-[#2a9d8f] text-[#2a9d8f]'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No terms found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Usage Example */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-3">Using Tooltips in Content</h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          Throughout our educational materials, you'll find medical terms with interactive tooltips. 
          For example, when we discuss <GlossaryTooltip term="Subluxation" definition="A misalignment of vertebrae that interferes with proper nerve function">subluxations</GlossaryTooltip> or 
          describe an <GlossaryTooltip term="Adjustment" definition="A specific, controlled force applied to correct a subluxation">adjustment</GlossaryTooltip>, 
          simply hover over the underlined term to see its definition instantly.
        </p>
        <p className="text-sm text-gray-600 italic">
          Hover over the underlined terms above to see the tooltip in action!
        </p>
      </div>
    </div>
  );
};

export default MedicalGlossary;

