'use client';

import React, { useState } from 'react';
import { 
  User,
  Calendar,
  TrendingUp,
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Clock,
  Target,
  Award,
  Search,
  Filter
} from 'lucide-react';

interface CaseStudy {
  id: string;
  patientProfile: {
    age: number;
    gender: string;
    occupation: string;
    activityLevel: string;
  };
  chiefComplaint: string;
  duration: string;
  painLevel: {
    initial: number;
    final: number;
  };
  functionalStatus: {
    initial: string;
    final: string;
  };
  diagnosis: string;
  gonsteadFindings: string[];
  treatmentProtocol: {
    frequency: string;
    duration: string;
    adjustments: string[];
    additionalTherapies?: string[];
  };
  outcomes: {
    painReduction: number;
    functionalImprovement: string;
    returnToActivities: string;
    patientSatisfaction: number;
  };
  followUp: string;
  category: 'back-pain' | 'neck-pain' | 'sports-injury' | 'post-surgical' | 'chronic-condition';
  imagesBefore?: string[];
  imagesAfter?: string[];
  testimonial?: string;
}

const CaseStudiesHub: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const caseStudies: CaseStudy[] = [
    {
      id: 'case001',
      patientProfile: {
        age: 42,
        gender: 'Male',
        occupation: 'Office Manager',
        activityLevel: 'Sedentary'
      },
      chiefComplaint: 'Chronic lower back pain with radiation into left leg',
      duration: '3 years',
      painLevel: {
        initial: 8,
        final: 2
      },
      functionalStatus: {
        initial: 'Unable to sit for more than 20 minutes, difficulty walking',
        final: 'Full return to work duties, walking 30 minutes daily'
      },
      diagnosis: 'L5 disc herniation with sciatic nerve involvement',
      gonsteadFindings: [
        'L5 posterior-inferior subluxation',
        'Decreased disc space at L5-S1',
        'Bilateral paraspinal muscle spasm',
        'Positive Nervoscope reading at L5',
        'Restricted motion palpation L5'
      ],
      treatmentProtocol: {
        frequency: '3x per week initially, tapering to 1x per week',
        duration: '12 weeks',
        adjustments: [
          'Specific L5 side posture adjustment',
          'Sacral blocking technique',
          'Pelvic stabilization'
        ],
        additionalTherapies: [
          'Ice therapy',
          'Core strengthening exercises',
          'Postural training'
        ]
      },
      outcomes: {
        painReduction: 75,
        functionalImprovement: 'Oswestry Disability Index improved from 64% to 12%',
        returnToActivities: 'Full return to work after 6 weeks, resumed recreational golf at 10 weeks',
        patientSatisfaction: 95
      },
      followUp: 'Monthly maintenance care continues. Patient remains symptom-free at 2-year follow-up.',
      category: 'back-pain',
      testimonial: 'After years of pain and trying everything else, the Gonstead technique finally gave me my life back. I can work, play with my kids, and enjoy activities I thought I\'d never do again.'
    },
    {
      id: 'case002',
      patientProfile: {
        age: 28,
        gender: 'Female',
        occupation: 'Graphic Designer',
        activityLevel: 'Moderate'
      },
      chiefComplaint: 'Severe neck pain with frequent headaches',
      duration: '6 months',
      painLevel: {
        initial: 7,
        final: 1
      },
      functionalStatus: {
        initial: 'Headaches 4-5 days per week, neck stiffness limiting range of motion',
        final: 'Rare headaches (1-2 per month), full cervical range of motion'
      },
      diagnosis: 'Cervical subluxation complex with tension headaches',
      gonsteadFindings: [
        'C5 anterior subluxation',
        'Loss of cervical lordosis',
        'C1-C2 rotation',
        'Elevated temperature readings C5-C6',
        'Restricted lateral flexion'
      ],
      treatmentProtocol: {
        frequency: '2x per week for 8 weeks',
        duration: '8 weeks',
        adjustments: [
          'Cervical chair adjustment C5',
          'Upper cervical specific adjustment C1-C2',
          'Thoracic outlet mobilization'
        ],
        additionalTherapies: [
          'Ergonomic workplace assessment',
          'Cervical traction exercises',
          'Stress management techniques'
        ]
      },
      outcomes: {
        painReduction: 85,
        functionalImprovement: 'Neck Disability Index reduced from 42% to 6%',
        returnToActivities: 'Resumed yoga practice at week 5, full activities by week 7',
        patientSatisfaction: 98
      },
      followUp: 'Bi-weekly maintenance adjustments. Headache frequency remains minimal at 1-year follow-up.',
      category: 'neck-pain',
      testimonial: 'I was skeptical at first, but the specific Gonstead adjustments made an immediate difference. My headaches are almost completely gone, and I can finally work without constant neck pain.'
    },
    {
      id: 'case003',
      patientProfile: {
        age: 35,
        gender: 'Male',
        occupation: 'Professional Athlete',
        activityLevel: 'Very High'
      },
      chiefComplaint: 'Acute lower back injury during competition',
      duration: '2 weeks',
      painLevel: {
        initial: 9,
        final: 1
      },
      functionalStatus: {
        initial: 'Unable to perform athletic activities, difficulty with basic movements',
        final: 'Full return to competitive sport, no limitations'
      },
      diagnosis: 'Acute L4-L5 facet joint dysfunction with muscle strain',
      gonsteadFindings: [
        'L4 rotational subluxation',
        'Positive motion palpation L4-L5',
        'Acute inflammation on instrumentation',
        'Hip flexor muscle involvement',
        'Sacroiliac joint restriction'
      ],
      treatmentProtocol: {
        frequency: 'Daily for first week, then 3x per week',
        duration: '4 weeks intensive, 4 weeks return to sport protocol',
        adjustments: [
          'Specific L4 rotational correction',
          'Sacroiliac adjustment',
          'Lumbar stabilization technique'
        ],
        additionalTherapies: [
          'Sport-specific rehabilitation',
          'Soft tissue work',
          'Progressive loading program',
          'Performance optimization'
        ]
      },
      outcomes: {
        painReduction: 90,
        functionalImprovement: 'Return to full training capacity within 6 weeks',
        returnToActivities: 'Competition-ready at 8 weeks, won next event',
        patientSatisfaction: 100
      },
      followUp: 'Weekly performance optimization adjustments ongoing. Completed full season without recurrence.',
      category: 'sports-injury',
      testimonial: 'The precision of the Gonstead technique got me back to competition faster than I thought possible. Not just pain-free, but performing better than before the injury.'
    },
    {
      id: 'case004',
      patientProfile: {
        age: 58,
        gender: 'Female',
        occupation: 'Retired Teacher',
        activityLevel: 'Light'
      },
      chiefComplaint: 'Chronic mid-back pain and postural decline',
      duration: '10+ years',
      painLevel: {
        initial: 6,
        final: 2
      },
      functionalStatus: {
        initial: 'Forward head posture, rounded shoulders, difficulty with prolonged standing',
        final: 'Improved posture, able to garden and walk without discomfort'
      },
      diagnosis: 'Thoracic hyperkyphosis with multiple subluxations',
      gonsteadFindings: [
        'Multiple thoracic subluxations T4-T8',
        'Increased kyphotic curve',
        'Rib head restrictions',
        'Bilateral scapular dysfunction',
        'Chronic postural adaptations'
      ],
      treatmentProtocol: {
        frequency: '2x per week for 12 weeks, then weekly maintenance',
        duration: '6 months corrective care',
        adjustments: [
          'Specific thoracic adjustments',
          'Rib mobilization techniques',
          'Postural correction protocol'
        ],
        additionalTherapies: [
          'Postural exercises',
          'Stretching program',
          'Home traction',
          'Ergonomic modifications'
        ]
      },
      outcomes: {
        painReduction: 65,
        functionalImprovement: 'Measurable improvement in thoracic curve, increased mobility',
        returnToActivities: 'Resumed gardening hobby, joined walking group',
        patientSatisfaction: 92
      },
      followUp: 'Monthly wellness care maintaining improvements. Quality of life significantly enhanced.',
      category: 'chronic-condition'
    }
  ];

  const filteredCases = caseStudies.filter(caseStudy => {
    const matchesSearch = 
      caseStudy.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseStudy.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || caseStudy.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categoryStats = {
    'back-pain': caseStudies.filter(c => c.category === 'back-pain').length,
    'neck-pain': caseStudies.filter(c => c.category === 'neck-pain').length,
    'sports-injury': caseStudies.filter(c => c.category === 'sports-injury').length,
    'post-surgical': caseStudies.filter(c => c.category === 'post-surgical').length,
    'chronic-condition': caseStudies.filter(c => c.category === 'chronic-condition').length,
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'back-pain': return 'bg-red-100 text-red-800';
      case 'neck-pain': return 'bg-blue-100 text-blue-800';
      case 'sports-injury': return 'bg-green-100 text-green-800';
      case 'post-surgical': return 'bg-purple-100 text-purple-800';
      case 'chronic-condition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PainScale: React.FC<{ initial: number; final: number }> = ({ initial, final }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 w-16">Before:</span>
        <div className="flex-1 flex gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-6 flex-1 rounded ${
                i < initial ? 'bg-red-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-bold text-red-600 w-8">{initial}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 w-16">After:</span>
        <div className="flex-1 flex gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-6 flex-1 rounded ${
                i < final ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-bold text-green-600 w-8">{final}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Clinical Case Studies</h2>
            <p className="opacity-90 text-lg">
              Real patient outcomes demonstrating the effectiveness of Gonstead technique
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{caseStudies.length}</div>
                <div className="text-sm opacity-80">Case Studies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(caseStudies.reduce((sum, c) => sum + c.outcomes.painReduction, 0) / caseStudies.length)}%
                </div>
                <div className="text-sm opacity-80">Avg Pain Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.round(caseStudies.reduce((sum, c) => sum + c.outcomes.patientSatisfaction, 0) / caseStudies.length)}%
                </div>
                <div className="text-sm opacity-80">Satisfaction Rate</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Activity className="h-16 w-16 text-white" />
            </div>
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
              placeholder="Search cases..."
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
              <option value="back-pain">Back Pain ({categoryStats['back-pain']})</option>
              <option value="neck-pain">Neck Pain ({categoryStats['neck-pain']})</option>
              <option value="sports-injury">Sports Injury ({categoryStats['sports-injury']})</option>
              <option value="chronic-condition">Chronic Conditions ({categoryStats['chronic-condition']})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="space-y-6">
        {filteredCases.map((caseStudy) => (
          <div
            key={caseStudy.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Case Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(caseStudy.category)}`}>
                      {caseStudy.category.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{caseStudy.patientProfile.gender}, {caseStudy.patientProfile.age} years</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {caseStudy.duration}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#0A3A47] mb-2">
                    {caseStudy.chiefComplaint}
                  </h3>
                  <p className="text-gray-600">
                    <span className="font-semibold">Diagnosis:</span> {caseStudy.diagnosis}
                  </p>
                </div>
              </div>
            </div>

            {/* Case Details */}
            <div className="p-6 space-y-6">
              {/* Patient Profile */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Occupation</div>
                  <div className="font-semibold text-[#0A3A47]">{caseStudy.patientProfile.occupation}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Activity Level</div>
                  <div className="font-semibold text-[#0A3A47]">{caseStudy.patientProfile.activityLevel}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Treatment Duration</div>
                  <div className="font-semibold text-[#0A3A47]">{caseStudy.treatmentProtocol.duration}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Visit Frequency</div>
                  <div className="font-semibold text-[#0A3A47] text-sm">{caseStudy.treatmentProtocol.frequency}</div>
                </div>
              </div>

              {/* Pain Level Progress */}
              <div>
                <h4 className="text-lg font-semibold text-[#0A3A47] mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#2a9d8f]" />
                  Pain Level Progress (0-10 Scale)
                </h4>
                <PainScale initial={caseStudy.painLevel.initial} final={caseStudy.painLevel.final} />
                <div className="mt-2 text-center">
                  <span className="text-2xl font-bold text-green-600">
                    {caseStudy.outcomes.painReduction}%
                  </span>
                  <span className="text-gray-600 ml-2">reduction in pain</span>
                </div>
              </div>

              {/* Gonstead Findings */}
              <div>
                <h4 className="text-lg font-semibold text-[#0A3A47] mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#2a9d8f]" />
                  Gonstead Analysis Findings
                </h4>
                <ul className="space-y-2">
                  {caseStudy.gonsteadFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Treatment Protocol */}
              <div>
                <h4 className="text-lg font-semibold text-[#0A3A47] mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2a9d8f]" />
                  Treatment Protocol
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-gray-700 mb-2">Adjustments:</div>
                    <ul className="space-y-1">
                      {caseStudy.treatmentProtocol.adjustments.map((adj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <ArrowRight className="h-4 w-4 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
                          <span>{adj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {caseStudy.treatmentProtocol.additionalTherapies && (
                    <div>
                      <div className="font-semibold text-gray-700 mb-2">Additional Therapies:</div>
                      <ul className="space-y-1">
                        {caseStudy.treatmentProtocol.additionalTherapies.map((therapy, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <ArrowRight className="h-4 w-4 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
                            <span>{therapy}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Outcomes */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-[#0A3A47] mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Treatment Outcomes
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-gray-700 text-sm mb-1">Functional Improvement:</div>
                    <p className="text-gray-600 text-sm">{caseStudy.outcomes.functionalImprovement}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 text-sm mb-1">Return to Activities:</div>
                    <p className="text-gray-600 text-sm">{caseStudy.outcomes.returnToActivities}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-green-300">
                    <span className="font-semibold text-gray-700">Patient Satisfaction:</span>
                    <span className="text-2xl font-bold text-green-600">{caseStudy.outcomes.patientSatisfaction}%</span>
                  </div>
                </div>
              </div>

              {/* Testimonial */}
              {caseStudy.testimonial && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 italic">"{caseStudy.testimonial}"</p>
                </div>
              )}

              {/* Follow-up */}
              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <span className="font-semibold text-gray-700">Follow-up:</span> {caseStudy.followUp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudiesHub;

