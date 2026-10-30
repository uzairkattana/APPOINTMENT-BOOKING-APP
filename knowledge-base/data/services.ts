import type { ServiceInfo } from '../types/index';

export const services: ServiceInfo[] = [
  // CONSULTATIONS
  {
    id: 'service-001',
    name: 'Initial Consultation & Examination',
    category: 'consultations',
    description: 'Comprehensive first visit including detailed health history, physical examination, and Gonstead analysis.',
    fullDescription: 'Your journey to optimal spinal health begins with our thorough initial consultation. This comprehensive 60-90 minute appointment is designed to understand your complete health picture and identify the root cause of your concerns using the precise Gonstead methodology.',
    benefits: [
      'Complete health history assessment',
      'Detailed physical and neurological examination',
      'Gonstead-specific spinal analysis',
      'Professional X-ray analysis when indicated',
      'Nervoscope instrumentation assessment',
      'Personalized treatment plan development',
      'Clear explanation of your condition',
      'Patient education on spinal health'
    ],
    duration: '60-90 minutes',
    price: '$175',
    priceRange: '$150-200',
    conditions: [
      'Back pain (acute or chronic)',
      'Neck pain and stiffness',
      'Headaches and migraines',
      'Sciatica and leg pain',
      'Joint stiffness and reduced mobility',
      'Sports injuries',
      'Posture-related problems',
      'General wellness assessment'
    ],
    procedure: [
      'Welcome and intake form review',
      'Detailed health history consultation',
      'Physical examination and posture analysis',
      'Orthopedic and neurological testing',
      'Gonstead static and motion palpation',
      'Nervoscope instrumentation reading',
      'X-ray analysis (if clinically indicated)',
      'Treatment plan presentation and discussion',
      'First treatment session (if appropriate)',
      'Home care instructions and scheduling'
    ],
    aftercare: [
      'Follow specific activity restrictions as advised',
      'Apply ice to any tender areas for 15-20 minutes',
      'Maintain good posture throughout the day',
      'Avoid strenuous activities for 24 hours',
      'Stay well hydrated',
      'Schedule your follow-up appointment',
      'Contact clinic with any concerns'
    ],
    contraindications: [
      'Severe acute trauma requiring emergency care',
      'Active infections or fever',
      'Unstable fractures',
      'Certain blood clotting disorders',
      'Severe osteoporosis with fracture risk'
    ],
    images: ['/images/services/initial-consultation.jpg', '/images/services/examination-room.jpg'],
    videoUrl: '/videos/gonstead-examination-process.mp4',
    isPopular: true,
    tags: ['initial visit', 'examination', 'gonstead analysis', 'health assessment', 'treatment plan']
  },
  
  {
    id: 'service-002',
    name: 'Follow-up Treatment Sessions',
    category: 'treatments',
    description: 'Focused treatment sessions using the Gonstead Technique for ongoing spinal correction and maintenance.',
    fullDescription: 'Our follow-up sessions focus on implementing your personalized treatment plan through precise Gonstead adjustments. Each 30-45 minute session includes progress assessment, specific adjustments, and continued education to help you achieve optimal spinal health.',
    benefits: [
      'Targeted Gonstead spinal adjustments',
      'Progress monitoring and assessment',
      'Pain reduction and improved mobility',
      'Continued patient education',
      'Posture correction guidance',
      'Exercise recommendations',
      'Lifestyle modification advice',
      'Long-term health maintenance'
    ],
    duration: '30-45 minutes',
    price: '$95',
    priceRange: '$80-120',
    conditions: [
      'Ongoing back and neck pain',
      'Recovery from acute injuries',
      'Chronic pain management',
      'Maintenance of spinal alignment',
      'Sports performance optimization',
      'Posture improvement',
      'Prevention of re-injury',
      'General wellness maintenance'
    ],
    procedure: [
      'Brief symptom update and discussion',
      'Gonstead palpation assessment',
      'Nervoscope re-evaluation if indicated',
      'Specific spinal adjustments as needed',
      'Progress evaluation and documentation',
      'Exercise instruction and modification',
      'Home care recommendation updates',
      'Next appointment scheduling and planning'
    ],
    aftercare: [
      'Apply ice if experiencing any soreness',
      'Perform prescribed exercises as instructed',
      'Maintain proper posture habits',
      'Continue with lifestyle modifications',
      'Stay hydrated and get adequate rest',
      'Report any changes in symptoms',
      'Follow up as recommended'
    ],
    isPopular: true,
    tags: ['follow-up', 'adjustments', 'treatment', 'pain relief', 'maintenance', 'progress tracking']
  },

  // SPECIALIZED TREATMENTS
  {
    id: 'service-003',
    name: 'Gonstead Spinal Analysis & Correction',
    category: 'specialized',
    description: 'Advanced Gonstead Technique utilizing all five criteria for precise spinal subluxation identification and correction.',
    fullDescription: 'This specialized service represents the gold standard of chiropractic care, employing the complete Gonstead system of analysis. Dr. Bashir Khan uses all five Gonstead criteria to identify and correct spinal subluxations with unmatched precision.',
    benefits: [
      'Most precise spinal analysis available',
      'Identification of exact subluxation locations',
      'Targeted corrections with minimal adjustments',
      'Scientific, objective assessment methods',
      'Comprehensive understanding of spinal mechanics',
      'Optimal treatment outcomes',
      'Reduced risk of over-treatment',
      'Long-lasting results'
    ],
    duration: '45-60 minutes',
    price: '$135',
    priceRange: '$120-180',
    conditions: [
      'Complex spinal conditions',
      'Multiple level subluxations',
      'Chronic recurring problems',
      'Failed previous treatments',
      'Disc-related issues',
      'Scoliosis management',
      'Complicated pain patterns',
      'Precision-required cases'
    ],
    procedure: [
      'Comprehensive visual examination',
      'Detailed X-ray analysis and interpretation',
      'Static palpation of spinal segments',
      'Motion palpation assessment',
      'Nervoscope instrumentation reading',
      'Integration of all five criteria',
      'Precise adjustment delivery',
      'Post-adjustment evaluation',
      'Treatment response documentation'
    ],
    aftercare: [
      'Strict adherence to post-treatment guidelines',
      'Monitor for treatment responses',
      'Apply ice for any post-adjustment soreness',
      'Avoid sudden movements for 24 hours',
      'Follow specific activity modifications',
      'Report any unusual symptoms immediately',
      'Maintain proper hydration and nutrition'
    ],
    contraindications: [
      'Active inflammatory conditions',
      'Recent spinal surgery (within 6 months)',
      'Acute disc herniation with severe neurological signs',
      'Osteoporotic fractures',
      'Spinal infections'
    ],
    images: ['/images/services/gonstead-analysis.jpg', '/images/services/nervoscope.jpg'],
    videoUrl: '/videos/gonstead-five-criteria.mp4',
    isPopular: true,
    tags: ['gonstead', 'advanced analysis', 'precision adjustment', 'five criteria', 'specialized care']
  },

  {
    id: 'service-004',
    name: 'Sports Injury Treatment & Performance Enhancement',
    category: 'specialized',
    description: 'Specialized chiropractic care for athletes focusing on injury treatment, prevention, and performance optimization.',
    fullDescription: 'Our sports injury program combines the precision of the Gonstead Technique with specialized knowledge of athletic biomechanics. Whether you\'re a weekend warrior or professional athlete, we help you recover from injuries and enhance your performance.',
    benefits: [
      'Rapid injury recovery protocols',
      'Performance optimization strategies',
      'Injury prevention education',
      'Sport-specific treatment approaches',
      'Enhanced range of motion',
      'Improved biomechanical efficiency',
      'Reduced injury recurrence',
      'Competitive edge maintenance'
    ],
    duration: '45-60 minutes',
    price: '$125',
    priceRange: '$100-150',
    conditions: [
      'Sports-related injuries',
      'Muscle strains and sprains',
      'Joint dysfunctions',
      'Performance limitations',
      'Repetitive stress injuries',
      'Post-competition recovery',
      'Pre-competition preparation',
      'Athletic maintenance care'
    ],
    procedure: [
      'Sport-specific injury assessment',
      'Biomechanical movement analysis',
      'Gonstead spinal evaluation',
      'Targeted therapeutic interventions',
      'Performance-based adjustments',
      'Recovery protocol development',
      'Return-to-sport planning',
      'Prevention strategy education'
    ],
    aftercare: [
      'Follow sport-specific recovery protocols',
      'Implement prescribed conditioning exercises',
      'Monitor performance and pain levels',
      'Apply therapeutic modalities as directed',
      'Maintain proper nutrition and hydration',
      'Report any performance changes',
      'Schedule regular maintenance sessions'
    ],
    images: ['/images/services/sports-treatment.jpg', '/images/services/athletic-assessment.jpg'],
    tags: ['sports injury', 'athletic performance', 'injury prevention', 'biomechanics', 'recovery']
  },

  // DIAGNOSTIC SERVICES
  {
    id: 'service-005',
    name: 'Digital X-Ray Analysis',
    category: 'diagnostics',
    description: 'State-of-the-art digital X-ray imaging with comprehensive Gonstead analysis for precise diagnosis.',
    fullDescription: 'Our advanced digital X-ray system provides crystal-clear images with minimal radiation exposure. Dr. Bashir Khan performs detailed Gonstead analysis of your X-rays to identify the exact location and nature of spinal problems.',
    benefits: [
      'High-resolution digital imaging',
      'Minimal radiation exposure',
      'Immediate image availability',
      'Precise Gonstead analysis',
      'Objective diagnostic information',
      'Treatment planning optimization',
      'Progress monitoring capability',
      'Patient education enhancement'
    ],
    duration: '30-45 minutes',
    price: '$125',
    priceRange: '$100-150',
    conditions: [
      'Suspected spinal subluxations',
      'Chronic pain evaluation',
      'Pre-treatment planning',
      'Progress monitoring needs',
      'Trauma assessment',
      'Scoliosis evaluation',
      'Disc space analysis',
      'Structural abnormality detection'
    ],
    procedure: [
      'Patient positioning and preparation',
      'Multiple view X-ray acquisition',
      'Digital image processing and enhancement',
      'Comprehensive Gonstead analysis',
      'Measurement and annotation',
      'Detailed report generation',
      'Patient consultation and explanation',
      'Treatment planning integration'
    ],
    aftercare: [
      'No special aftercare required',
      'X-ray results discussion scheduled',
      'Treatment recommendations provided',
      'Questions and concerns addressed',
      'Follow-up planning as needed'
    ],
    contraindications: [
      'Pregnancy (except in emergencies)',
      'Recent multiple X-ray exposures',
      'Patient unable to position properly'
    ],
    images: ['/images/services/digital-xray.jpg', '/images/equipment/xray-machine.jpg'],
    tags: ['x-ray', 'digital imaging', 'diagnosis', 'gonstead analysis', 'minimal radiation']
  },

  {
    id: 'service-006',
    name: 'Nervoscope Assessment',
    category: 'diagnostics',
    description: 'Specialized instrumentation to detect nerve interference and spinal inflammation patterns.',
    fullDescription: 'The Nervoscope is a unique diagnostic instrument that measures temperature differentials along the spine, indicating areas of nerve irritation and inflammation. This objective measurement is crucial for precise Gonstead analysis.',
    benefits: [
      'Objective nerve function assessment',
      'Detection of inflammation patterns',
      'Non-invasive diagnostic procedure',
      'Precise subluxation localization',
      'Treatment progress monitoring',
      'Patient education tool',
      'Scientific measurement data',
      'Enhanced diagnostic accuracy'
    ],
    duration: '15-20 minutes',
    price: '$75',
    priceRange: '$60-90',
    conditions: [
      'Suspected nerve interference',
      'Inflammation detection needs',
      'Subluxation localization',
      'Treatment progress monitoring',
      'Diagnostic confirmation',
      'Wellness assessments',
      'Preventive screenings',
      'Follow-up evaluations'
    ],
    procedure: [
      'Patient positioning and preparation',
      'Nervoscope calibration and setup',
      'Systematic spinal scanning',
      'Temperature differential recording',
      'Pattern analysis and interpretation',
      'Documentation and charting',
      'Results explanation to patient',
      'Integration with other findings'
    ],
    aftercare: [
      'No aftercare required',
      'Results integrated with treatment plan',
      'Follow-up assessments as needed',
      'Patient questions addressed'
    ],
    images: ['/images/equipment/nervoscope.jpg', '/images/services/instrumentation.jpg'],
    tags: ['nervoscope', 'nerve assessment', 'inflammation detection', 'objective measurement', 'gonstead tool']
  },

  // REHABILITATION SERVICES
  {
    id: 'service-007',
    name: 'Corrective Exercise Program',
    category: 'rehabilitation',
    description: 'Personalized exercise programs designed to support spinal correction and prevent future problems.',
    fullDescription: 'Our corrective exercise programs are specifically designed to complement your Gonstead treatments. These targeted exercises help maintain spinal alignment, strengthen supporting muscles, and prevent future problems.',
    benefits: [
      'Customized exercise prescriptions',
      'Spinal stabilization enhancement',
      'Posture improvement support',
      'Muscle balance restoration',
      'Injury prevention strategies',
      'Long-term maintenance tools',
      'Improved daily function',
      'Enhanced treatment outcomes'
    ],
    duration: '30-45 minutes',
    price: '$85',
    priceRange: '$70-100',
    conditions: [
      'Post-treatment maintenance needs',
      'Muscle weakness patterns',
      'Posture correction requirements',
      'Stability improvement needs',
      'Injury prevention goals',
      'Chronic pain management',
      'Movement dysfunction',
      'General fitness enhancement'
    ],
    procedure: [
      'Movement assessment and analysis',
      'Exercise prescription development',
      'Proper technique instruction',
      'Equipment familiarization',
      'Program progression planning',
      'Performance monitoring',
      'Modification and advancement',
      'Home program development'
    ],
    aftercare: [
      'Perform exercises as prescribed',
      'Monitor for any discomfort',
      'Progress exercises gradually',
      'Maintain consistency with routine',
      'Report any difficulties',
      'Schedule regular check-ins',
      'Continue long-term maintenance'
    ],
    images: ['/images/services/corrective-exercise.jpg', '/images/services/rehabilitation.jpg'],
    tags: ['corrective exercise', 'rehabilitation', 'posture correction', 'strengthening', 'prevention']
  },

  // PREVENTIVE SERVICES
  {
    id: 'service-008',
    name: 'Wellness & Maintenance Care',
    category: 'preventive',
    description: 'Regular preventive care to maintain optimal spinal health and prevent future problems.',
    fullDescription: 'Our wellness program focuses on maintaining the improvements achieved through your initial care. Regular maintenance visits help preserve spinal alignment, prevent problem recurrence, and optimize your overall health.',
    benefits: [
      'Long-term health maintenance',
      'Problem prevention strategies',
      'Optimal spinal function preservation',
      'Early detection of new issues',
      'Lifestyle guidance and support',
      'Stress management techniques',
      'Peak performance maintenance',
      'Cost-effective long-term care'
    ],
    duration: '30 minutes',
    price: '$80',
    priceRange: '$70-95',
    conditions: [
      'Completed initial treatment phase',
      'Desire for health maintenance',
      'Prevention-focused individuals',
      'High-stress occupations',
      'Athletic performance maintenance',
      'Age-related changes management',
      'General wellness optimization',
      'Family health programs'
    ],
    procedure: [
      'Brief health status review',
      'Spinal alignment assessment',
      'Maintenance adjustments as needed',
      'Lifestyle factor evaluation',
      'Exercise program review',
      'Ergonomic recommendations',
      'Stress management discussion',
      'Next visit scheduling'
    ],
    aftercare: [
      'Maintain healthy lifestyle habits',
      'Continue recommended exercises',
      'Follow ergonomic guidelines',
      'Monitor for any changes',
      'Schedule regular visits',
      'Stay proactive with health'
    ],
    isPopular: true,
    tags: ['wellness', 'maintenance', 'prevention', 'long-term health', 'lifestyle support']
  },

  // EMERGENCY SERVICES
  {
    id: 'service-009',
    name: 'Emergency & Acute Care',
    category: 'emergency',
    description: 'Urgent care for acute spinal injuries and severe pain episodes requiring immediate attention.',
    fullDescription: 'When you\'re experiencing severe pain or acute injury, our emergency care services provide rapid assessment and treatment. Dr. Bashir Khan prioritizes urgent cases to provide prompt relief and prevent further injury.',
    benefits: [
      'Rapid pain relief protocols',
      'Immediate professional assessment',
      'Urgent injury stabilization',
      'Prompt treatment initiation',
      'Complication prevention',
      'Emergency referral coordination',
      'Same-day availability',
      'Compassionate urgent care'
    ],
    duration: '45-60 minutes',
    price: '$155',
    priceRange: '$140-200',
    conditions: [
      'Acute back or neck injuries',
      'Severe pain episodes',
      'New onset neurological symptoms',
      'Work-related injuries',
      'Motor vehicle accident injuries',
      'Sports injury emergencies',
      'Sudden mobility loss',
      'Severe headache onset'
    ],
    procedure: [
      'Urgent triage and assessment',
      'Pain and symptom evaluation',
      'Emergency examination protocols',
      'Immediate treatment provision',
      'Referral coordination if needed',
      'Pain management strategies',
      'Emergency care instructions',
      'Follow-up planning and scheduling'
    ],
    aftercare: [
      'Strict adherence to emergency protocols',
      'Apply ice for injury management',
      'Follow specific activity restrictions',
      'Monitor symptoms closely',
      'Contact clinic for any changes',
      'Schedule urgent follow-up',
      'Seek emergency medical care if worsening'
    ],
    contraindications: [
      'Life-threatening emergencies requiring hospital care',
      'Severe trauma requiring surgical intervention',
      'Loss of consciousness',
      'Severe neurological deficits'
    ],
    tags: ['emergency', 'acute care', 'urgent treatment', 'pain relief', 'injury management']
  },

  // ONLINE SERVICES
  {
    id: 'service-010',
    name: 'Online Consultation & Telehealth',
    category: 'consultations',
    description: 'Virtual consultations for health guidance, follow-up care, and treatment planning from the comfort of your home.',
    fullDescription: 'Our telehealth services bring expert chiropractic guidance to your home. Perfect for follow-up consultations, health advice, exercise instruction, and maintaining care when you can\'t visit the clinic in person.',
    benefits: [
      'Convenient home-based consultations',
      'Expert health guidance',
      'Exercise instruction and review',
      'Treatment progress monitoring',
      'Lifestyle and ergonomic advice',
      'Cost-effective care option',
      'Flexible scheduling availability',
      'Continuity of care maintenance'
    ],
    duration: '30-45 minutes',
    price: '$95',
    priceRange: '$80-120',
    conditions: [
      'Follow-up care needs',
      'Exercise program review',
      'Health maintenance guidance',
      'Ergonomic consultations',
      'Travel or mobility limitations',
      'Prevention-focused discussions',
      'Treatment plan adjustments',
      'General health questions'
    ],
    procedure: [
      'Secure video platform connection',
      'Health status discussion',
      'Visual posture and movement assessment',
      'Exercise demonstration and review',
      'Treatment plan modifications',
      'Questions and concerns addressed',
      'Action plan development',
      'Follow-up scheduling'
    ],
    aftercare: [
      'Implement discussed recommendations',
      'Continue prescribed exercises',
      'Follow ergonomic guidelines',
      'Monitor symptoms as advised',
      'Schedule in-person visit if needed',
      'Maintain communication about progress'
    ],
    images: ['/images/services/telehealth.jpg', '/images/services/online-consultation.jpg'],
    tags: ['telehealth', 'online consultation', 'virtual care', 'follow-up', 'convenience']
  }
];

// Helper functions for service management
export const getServicesByCategory = (category: string): ServiceInfo[] => {
  return services.filter(service => service.category === category);
};

export const getPopularServices = (): ServiceInfo[] => {
  return services.filter(service => service.isPopular);
};

export const searchServices = (query: string): ServiceInfo[] => {
  const searchTerm = query.toLowerCase();
  return services.filter(service => 
    service.name.toLowerCase().includes(searchTerm) ||
    service.description.toLowerCase().includes(searchTerm) ||
    service.fullDescription.toLowerCase().includes(searchTerm) ||
    service.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    service.conditions.some(condition => condition.toLowerCase().includes(searchTerm))
  );
};

export const getServiceById = (id: string): ServiceInfo | undefined => {
  return services.find(service => service.id === id);
};

export const getServicesByPriceRange = (minPrice: number, maxPrice: number): ServiceInfo[] => {
  return services.filter(service => {
    const price = parseInt(service.price.replace('$', ''));
    return price >= minPrice && price <= maxPrice;
  });
};

export const getServicesByDuration = (maxDuration: number): ServiceInfo[] => {
  return services.filter(service => {
    const duration = parseInt(service.duration.split('-')[0]);
    return duration <= maxDuration;
  });
};
