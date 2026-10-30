'use client';

import React, { useState } from 'react';
import { 
  CheckCircle,
  X,
  Minus,
  Info,
  ChevronDown,
  Award,
  Target,
  Zap
} from 'lucide-react';

interface ComparisonCategory {
  category: string;
  aspects: ComparisonAspect[];
}

interface ComparisonAspect {
  aspect: string;
  gonstead: {
    value: string;
    rating: 'excellent' | 'good' | 'moderate' | 'limited';
    details?: string;
  };
  diversified: {
    value: string;
    rating: 'excellent' | 'good' | 'moderate' | 'limited';
    details?: string;
  };
  activator: {
    value: string;
    rating: 'excellent' | 'good' | 'moderate' | 'limited';
    details?: string;
  };
  thompson: {
    value: string;
    rating: 'excellent' | 'good' | 'moderate' | 'limited';
    details?: string;
  };
}

const ComparativeAnalysis: React.FC = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('diagnostic');

  const comparisonData: ComparisonCategory[] = [
    {
      category: 'Diagnostic Approach',
      aspects: [
        {
          aspect: 'X-ray Analysis',
          gonstead: {
            value: 'Full spine, specific views',
            rating: 'excellent',
            details: 'Comprehensive analysis of entire spinal structure with specific positioning'
          },
          diversified: {
            value: 'Selective, as needed',
            rating: 'good',
            details: 'X-rays used when indicated but not routine'
          },
          activator: {
            value: 'Limited use',
            rating: 'moderate',
            details: 'Less emphasis on radiographic analysis'
          },
          thompson: {
            value: 'Selective analysis',
            rating: 'good',
            details: 'X-rays used for specific cases'
          }
        },
        {
          aspect: 'Instrumentation',
          gonstead: {
            value: 'Nervoscope (bilateral temperature)',
            rating: 'excellent',
            details: 'Specific instrument for detecting nerve dysfunction'
          },
          diversified: {
            value: 'Various tools',
            rating: 'good',
            details: 'Multiple assessment instruments used'
          },
          activator: {
            value: 'Activator instrument',
            rating: 'excellent',
            details: 'Specialized mechanical adjustment tool'
          },
          thompson: {
            value: 'Drop table mechanism',
            rating: 'good',
            details: 'Specialized table for analysis and treatment'
          }
        },
        {
          aspect: 'Palpation Techniques',
          gonstead: {
            value: 'Static & motion palpation',
            rating: 'excellent',
            details: 'Comprehensive manual assessment of joint function'
          },
          diversified: {
            value: 'Motion palpation primary',
            rating: 'good',
            details: 'Focus on joint movement assessment'
          },
          activator: {
            value: 'Minimal palpation',
            rating: 'limited',
            details: 'Relies more on instrument feedback'
          },
          thompson: {
            value: 'Leg length analysis',
            rating: 'good',
            details: 'Specific assessment method for imbalance'
          }
        },
        {
          aspect: 'Specificity of Analysis',
          gonstead: {
            value: 'Segment-specific',
            rating: 'excellent',
            details: 'Identifies exact vertebral level and direction'
          },
          diversified: {
            value: 'Regional approach',
            rating: 'good',
            details: 'Focus on general spinal regions'
          },
          activator: {
            value: 'Point-specific',
            rating: 'excellent',
            details: 'Very precise targeting of adjustment'
          },
          thompson: {
            value: 'Segment and leg analysis',
            rating: 'good',
            details: 'Combines segmental and postural assessment'
          }
        }
      ]
    },
    {
      category: 'Adjustment Technique',
      aspects: [
        {
          aspect: 'Force Application',
          gonstead: {
            value: 'Specific manual thrust',
            rating: 'excellent',
            details: 'Controlled force in precise direction'
          },
          diversified: {
            value: 'Manual thrust varied',
            rating: 'good',
            details: 'Multiple thrust techniques used'
          },
          activator: {
            value: 'Mechanical low-force',
            rating: 'good',
            details: 'Consistent controlled impulse'
          },
          thompson: {
            value: 'Drop table assist',
            rating: 'good',
            details: 'Table drop reduces force needed'
          }
        },
        {
          aspect: 'Patient Positioning',
          gonstead: {
            value: 'Side posture, cervical chair',
            rating: 'excellent',
            details: 'Specific positioning for optimal biomechanics'
          },
          diversified: {
            value: 'Multiple positions',
            rating: 'good',
            details: 'Varied positioning based on region'
          },
          activator: {
            value: 'Prone primarily',
            rating: 'moderate',
            details: 'Usually face-down positioning'
          },
          thompson: {
            value: 'Prone on drop table',
            rating: 'good',
            details: 'Specific table positioning'
          }
        },
        {
          aspect: 'Adjustment Precision',
          gonstead: {
            value: 'Vertebra-specific',
            rating: 'excellent',
            details: 'One vertebra at a time with specific vector'
          },
          diversified: {
            value: 'Regional targeting',
            rating: 'good',
            details: 'May address multiple segments'
          },
          activator: {
            value: 'Point-specific',
            rating: 'excellent',
            details: 'Very precise impulse delivery'
          },
          thompson: {
            value: 'Segment-specific',
            rating: 'good',
            details: 'Focused on individual segments'
          }
        },
        {
          aspect: 'Number of Adjustments',
          gonstead: {
            value: 'Only subluxated segments',
            rating: 'excellent',
            details: 'Conservative - adjust only what needs it'
          },
          diversified: {
            value: 'Multiple areas',
            rating: 'moderate',
            details: 'May adjust broader regions'
          },
          activator: {
            value: 'Multiple points',
            rating: 'moderate',
            details: 'Can address numerous points per visit'
          },
          thompson: {
            value: 'Selective adjustments',
            rating: 'good',
            details: 'Focus on key subluxations'
          }
        }
      ]
    },
    {
      category: 'Clinical Outcomes',
      aspects: [
        {
          aspect: 'Research Support',
          gonstead: {
            value: 'Growing evidence base',
            rating: 'good',
            details: 'Increasing number of clinical studies'
          },
          diversified: {
            value: 'Extensive research',
            rating: 'excellent',
            details: 'Most studied chiropractic technique'
          },
          activator: {
            value: 'Good research support',
            rating: 'good',
            details: 'Well-documented outcomes'
          },
          thompson: {
            value: 'Moderate research',
            rating: 'moderate',
            details: 'Some clinical studies available'
          }
        },
        {
          aspect: 'Patient Comfort',
          gonstead: {
            value: 'Generally well-tolerated',
            rating: 'good',
            details: 'Some patients report audible release'
          },
          diversified: {
            value: 'Well-tolerated',
            rating: 'good',
            details: 'Familiar to most patients'
          },
          activator: {
            value: 'Very gentle',
            rating: 'excellent',
            details: 'No twisting or cracking sounds'
          },
          thompson: {
            value: 'Comfortable',
            rating: 'excellent',
            details: 'Drop table reduces force sensation'
          }
        },
        {
          aspect: 'Speed of Relief',
          gonstead: {
            value: 'Often rapid response',
            rating: 'excellent',
            details: 'Specific corrections yield quick results'
          },
          diversified: {
            value: 'Variable timing',
            rating: 'good',
            details: 'Results depend on condition'
          },
          activator: {
            value: 'Gradual improvement',
            rating: 'moderate',
            details: 'Gentle approach may take longer'
          },
          thompson: {
            value: 'Good response time',
            rating: 'good',
            details: 'Effective for most conditions'
          }
        },
        {
          aspect: 'Long-term Stability',
          gonstead: {
            value: 'Excellent holding',
            rating: 'excellent',
            details: 'Corrections tend to hold well'
          },
          diversified: {
            value: 'Good stability',
            rating: 'good',
            details: 'Requires ongoing maintenance'
          },
          activator: {
            value: 'Variable holding',
            rating: 'moderate',
            details: 'May require frequent visits'
          },
          thompson: {
            value: 'Good maintenance',
            rating: 'good',
            details: 'Stable with regular care'
          }
        }
      ]
    },
    {
      category: 'Practical Considerations',
      aspects: [
        {
          aspect: 'Learning Curve',
          gonstead: {
            value: 'Extensive training required',
            rating: 'moderate',
            details: 'Complex system requiring dedicated study'
          },
          diversified: {
            value: 'Moderate training',
            rating: 'good',
            details: 'Standard chiropractic education'
          },
          activator: {
            value: 'Specialized certification',
            rating: 'good',
            details: 'Specific training program available'
          },
          thompson: {
            value: 'Moderate complexity',
            rating: 'good',
            details: 'Requires table-specific training'
          }
        },
        {
          aspect: 'Equipment Required',
          gonstead: {
            value: 'Cervical chair, knee chest bench',
            rating: 'moderate',
            details: 'Specialized equipment needed'
          },
          diversified: {
            value: 'Standard table',
            rating: 'excellent',
            details: 'Minimal special equipment'
          },
          activator: {
            value: 'Activator instrument',
            rating: 'excellent',
            details: 'Portable, low-cost tool'
          },
          thompson: {
            value: 'Drop table required',
            rating: 'moderate',
            details: 'Significant equipment investment'
          }
        },
        {
          aspect: 'Treatment Time',
          gonstead: {
            value: '15-20 minutes',
            rating: 'good',
            details: 'Thorough but efficient'
          },
          diversified: {
            value: '10-15 minutes',
            rating: 'excellent',
            details: 'Quick treatment sessions'
          },
          activator: {
            value: '5-10 minutes',
            rating: 'excellent',
            details: 'Very efficient delivery'
          },
          thompson: {
            value: '10-15 minutes',
            rating: 'excellent',
            details: 'Streamlined approach'
          }
        }
      ]
    }
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'limited': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return <CheckCircle className="h-5 w-5" />;
      case 'good': return <CheckCircle className="h-5 w-5" />;
      case 'moderate': return <Minus className="h-5 w-5" />;
      case 'limited': return <X className="h-5 w-5" />;
      default: return <Minus className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-poppins mb-2">Comparative Analysis</h2>
            <p className="opacity-90 text-lg">
              Detailed comparison of major chiropractic techniques
            </p>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{comparisonData.length}</div>
                <div className="text-sm opacity-80">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {comparisonData.reduce((sum, cat) => sum + cat.aspects.length, 0)}
                </div>
                <div className="text-sm opacity-80">Comparison Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4</div>
                <div className="text-sm opacity-80">Techniques</div>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <Target className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-4">Rating Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">Excellent</div>
              <div className="text-xs text-gray-600">Superior performance</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-blue-100">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">Good</div>
              <div className="text-xs text-gray-600">Strong performance</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-yellow-100">
              <Minus className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">Moderate</div>
              <div className="text-xs text-gray-600">Adequate performance</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-orange-100">
              <X className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">Limited</div>
              <div className="text-xs text-gray-600">Basic capability</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Tables */}
      <div className="space-y-4">
        {comparisonData.map((category) => (
          <div key={category.category} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-bold text-[#0A3A47]">{category.category}</h3>
              <ChevronDown
                className={`h-6 w-6 text-gray-600 transition-transform ${
                  expandedCategory === category.category ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedCategory === category.category && (
              <div className="border-t">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">Aspect</th>
                        <th className="text-left p-4 font-semibold text-[#2a9d8f] min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Gonstead
                          </div>
                        </th>
                        <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">Diversified</th>
                        <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">Activator</th>
                        <th className="text-left p-4 font-semibold text-gray-700 min-w-[200px]">Thompson</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.aspects.map((aspect, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-semibold text-gray-700">{aspect.aspect}</td>
                          
                          {/* Gonstead */}
                          <td className="p-4 bg-[#F8F5F0]">
                            <div className="space-y-2">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(aspect.gonstead.rating)}`}>
                                {getRatingIcon(aspect.gonstead.rating)}
                                {aspect.gonstead.rating.charAt(0).toUpperCase() + aspect.gonstead.rating.slice(1)}
                              </div>
                              <div className="font-medium text-[#0A3A47]">{aspect.gonstead.value}</div>
                              {aspect.gonstead.details && (
                                <div className="text-xs text-gray-600">{aspect.gonstead.details}</div>
                              )}
                            </div>
                          </td>

                          {/* Diversified */}
                          <td className="p-4">
                            <div className="space-y-2">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(aspect.diversified.rating)}`}>
                                {getRatingIcon(aspect.diversified.rating)}
                                {aspect.diversified.rating.charAt(0).toUpperCase() + aspect.diversified.rating.slice(1)}
                              </div>
                              <div className="font-medium text-gray-700">{aspect.diversified.value}</div>
                              {aspect.diversified.details && (
                                <div className="text-xs text-gray-600">{aspect.diversified.details}</div>
                              )}
                            </div>
                          </td>

                          {/* Activator */}
                          <td className="p-4">
                            <div className="space-y-2">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(aspect.activator.rating)}`}>
                                {getRatingIcon(aspect.activator.rating)}
                                {aspect.activator.rating.charAt(0).toUpperCase() + aspect.activator.rating.slice(1)}
                              </div>
                              <div className="font-medium text-gray-700">{aspect.activator.value}</div>
                              {aspect.activator.details && (
                                <div className="text-xs text-gray-600">{aspect.activator.details}</div>
                              )}
                            </div>
                          </td>

                          {/* Thompson */}
                          <td className="p-4">
                            <div className="space-y-2">
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(aspect.thompson.rating)}`}>
                                {getRatingIcon(aspect.thompson.rating)}
                                {aspect.thompson.rating.charAt(0).toUpperCase() + aspect.thompson.rating.slice(1)}
                              </div>
                              <div className="font-medium text-gray-700">{aspect.thompson.value}</div>
                              {aspect.thompson.details && (
                                <div className="text-xs text-gray-600">{aspect.thompson.details}</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key Takeaways */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-[#0A3A47] mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#2a9d8f]" />
          Key Takeaways
        </h3>
        <div className="space-y-3 text-gray-700">
          <p className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
            <span><strong>Gonstead Technique</strong> excels in diagnostic specificity and precision adjustments, making it ideal for patients seeking targeted, conservative care.</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
            <span><strong>Diversified Technique</strong> is the most widely practiced and researched, offering a versatile approach suitable for many conditions.</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
            <span><strong>Activator Method</strong> provides a gentle, low-force option excellent for patients who prefer minimal manual manipulation.</span>
          </p>
          <p className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-[#2a9d8f] flex-shrink-0 mt-0.5" />
            <span><strong>Thompson Technique</strong> combines mechanical advantage with specific analysis, offering comfortable treatment with good outcomes.</span>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-700">Note:</span> This comparison is for educational purposes. The most effective technique varies by individual patient needs, condition severity, and practitioner expertise. Consult with a qualified chiropractor to determine the best approach for your specific situation.
        </p>
      </div>
    </div>
  );
};

export default ComparativeAnalysis;

