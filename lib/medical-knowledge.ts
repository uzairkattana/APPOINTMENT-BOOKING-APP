// Medical Knowledge Database for Clinic Chatbot

export interface MedicalDisorder {
  id: string;
  name: string;
  category: string;
  location: string[];
  symptoms: string[];
  description: string;
  treatments: string[];
  severity: 'mild' | 'moderate' | 'severe';
  commonCauses: string[];
  prevention: string[];
}

export interface BodyLocation {
  id: string;
  name: string;
  region: string;
  commonDisorders: string[];
  anatomy: string;
}

export const medicalDisorders: MedicalDisorder[] = [
  // Spine and Back Disorders
  {
    id: 'herniated-disc',
    name: 'Herniated Disc',
    category: 'Spinal Disorders',
    location: ['Lower Back', 'Neck', 'Lumbar Spine', 'Cervical Spine'],
    symptoms: [
      'Sharp pain radiating down leg or arm',
      'Numbness or tingling',
      'Muscle weakness',
      'Loss of reflexes',
      'Difficulty walking',
      'Pain worsens with sitting or coughing'
    ],
    description: 'A herniated disc occurs when the soft center of a spinal disc pushes through a crack in the tougher exterior casing.',
    treatments: [
      'Chiropractic adjustments',
      'Physical therapy',
      'Pain management',
      'Anti-inflammatory medications',
      'Rest and activity modification',
      'Spinal decompression therapy'
    ],
    severity: 'moderate',
    commonCauses: [
      'Age-related wear and tear',
      'Sudden lifting or twisting',
      'Trauma or injury',
      'Poor posture',
      'Repetitive movements'
    ],
    prevention: [
      'Maintain good posture',
      'Regular exercise',
      'Proper lifting techniques',
      'Maintain healthy weight',
      'Avoid prolonged sitting'
    ]
  },
  {
    id: 'sciatica',
    name: 'Sciatica',
    category: 'Nerve Disorders',
    location: ['Lower Back', 'Hip', 'Buttock', 'Leg'],
    symptoms: [
      'Pain radiating from lower back to buttock and leg',
      'Burning or tingling sensation',
      'Numbness in leg or foot',
      'Weakness in affected leg',
      'Difficulty moving leg or foot',
      'Sharp pain when sitting'
    ],
    description: 'Sciatica is pain that radiates along the path of the sciatic nerve, from the lower back through the hips and buttocks and down each leg.',
    treatments: [
      'Chiropractic care',
      'Physical therapy',
      'Heat and ice therapy',
      'Stretching exercises',
      'Anti-inflammatory medications',
      'Massage therapy'
    ],
    severity: 'moderate',
    commonCauses: [
      'Herniated disc',
      'Bone spur',
      'Spinal stenosis',
      'Piriformis syndrome',
      'Pregnancy',
      'Diabetes'
    ],
    prevention: [
      'Regular exercise',
      'Proper posture',
      'Ergonomic workspace',
      'Maintain healthy weight',
      'Avoid prolonged sitting'
    ]
  },
  {
    id: 'cervical-spondylosis',
    name: 'Cervical Spondylosis',
    category: 'Degenerative Disorders',
    location: ['Neck', 'Cervical Spine', 'Shoulders'],
    symptoms: [
      'Neck pain and stiffness',
      'Headaches',
      'Muscle spasms',
      'Grinding noise with neck movement',
      'Numbness or weakness in arms',
      'Difficulty turning head'
    ],
    description: 'Cervical spondylosis is age-related wear and tear affecting the spinal discs in the neck.',
    treatments: [
      'Chiropractic adjustments',
      'Neck exercises',
      'Heat therapy',
      'Massage therapy',
      'Postural correction',
      'Ergonomic modifications'
    ],
    severity: 'mild',
    commonCauses: [
      'Age-related degeneration',
      'Bone spurs',
      'Dehydrated discs',
      'Herniated discs',
      'Ligament stiffness',
      'Poor posture'
    ],
    prevention: [
      'Maintain good posture',
      'Regular neck exercises',
      'Ergonomic workspace',
      'Avoid sleeping on stomach',
      'Use proper pillow support'
    ]
  },
  // Joint Disorders
  {
    id: 'osteoarthritis',
    name: 'Osteoarthritis',
    category: 'Joint Disorders',
    location: ['Knees', 'Hips', 'Hands', 'Spine', 'Shoulders'],
    symptoms: [
      'Joint pain and stiffness',
      'Swelling around joints',
      'Reduced range of motion',
      'Grinding sensation',
      'Bone spurs',
      'Joint deformity in advanced cases'
    ],
    description: 'Osteoarthritis is the most common form of arthritis, caused by wear-and-tear damage to joint cartilage.',
    treatments: [
      'Physical therapy',
      'Joint mobilization',
      'Exercise therapy',
      'Weight management',
      'Pain management',
      'Supportive devices'
    ],
    severity: 'moderate',
    commonCauses: [
      'Age-related wear',
      'Previous joint injuries',
      'Obesity',
      'Genetics',
      'Repetitive stress',
      'Bone deformities'
    ],
    prevention: [
      'Maintain healthy weight',
      'Regular exercise',
      'Avoid repetitive stress',
      'Proper body mechanics',
      'Injury prevention'
    ]
  },
  // Muscle Disorders
  {
    id: 'fibromyalgia',
    name: 'Fibromyalgia',
    category: 'Muscle Disorders',
    location: ['Whole Body', 'Neck', 'Shoulders', 'Back', 'Hips'],
    symptoms: [
      'Widespread muscle pain',
      'Fatigue',
      'Sleep disturbances',
      'Tender points',
      'Cognitive difficulties',
      'Headaches',
      'Irritable bowel syndrome'
    ],
    description: 'Fibromyalgia is a disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory and mood issues.',
    treatments: [
      'Gentle exercise',
      'Stress management',
      'Sleep hygiene',
      'Massage therapy',
      'Trigger point therapy',
      'Multidisciplinary approach'
    ],
    severity: 'moderate',
    commonCauses: [
      'Genetics',
      'Infections',
      'Physical trauma',
      'Emotional trauma',
      'Stress',
      'Other disorders'
    ],
    prevention: [
      'Stress management',
      'Regular gentle exercise',
      'Good sleep hygiene',
      'Healthy lifestyle',
      'Social support'
    ]
  },
  // Headache Disorders
  {
    id: 'tension-headache',
    name: 'Tension Headache',
    category: 'Headache Disorders',
    location: ['Head', 'Neck', 'Shoulders', 'Forehead'],
    symptoms: [
      'Dull, aching head pain',
      'Tight band around head',
      'Tenderness in scalp, neck, shoulders',
      'Mild to moderate pain',
      'No nausea or vomiting',
      'Sensitivity to light or sound'
    ],
    description: 'Tension headaches are the most common type of headache, often related to stress, poor posture, or muscle tension.',
    treatments: [
      'Stress management',
      'Massage therapy',
      'Posture correction',
      'Relaxation techniques',
      'Regular exercise',
      'Ergonomic improvements'
    ],
    severity: 'mild',
    commonCauses: [
      'Stress',
      'Poor posture',
      'Eye strain',
      'Fatigue',
      'Dehydration',
      'Muscle tension'
    ],
    prevention: [
      'Stress management',
      'Good posture',
      'Regular breaks',
      'Proper hydration',
      'Adequate sleep',
      'Eye care'
    ]
  },
  {
    id: 'migraine',
    name: 'Migraine',
    category: 'Headache Disorders',
    location: ['Head', 'One side of head', 'Behind eyes'],
    symptoms: [
      'Severe throbbing pain',
      'Nausea and vomiting',
      'Sensitivity to light and sound',
      'Visual disturbances (aura)',
      'Dizziness',
      'Fatigue after episode'
    ],
    description: 'Migraines are intense headaches that can cause severe throbbing pain, usually on one side of the head.',
    treatments: [
      'Trigger identification',
      'Stress management',
      'Regular sleep schedule',
      'Dietary modifications',
      'Preventive medications',
      'Lifestyle changes'
    ],
    severity: 'severe',
    commonCauses: [
      'Hormonal changes',
      'Certain foods',
      'Stress',
      'Bright lights',
      'Strong smells',
      'Weather changes'
    ],
    prevention: [
      'Avoid triggers',
      'Regular sleep',
      'Stress management',
      'Proper hydration',
      'Regular meals',
      'Exercise'
    ]
  }
];

export const bodyLocations: BodyLocation[] = [
  {
    id: 'cervical-spine',
    name: 'Cervical Spine (Neck)',
    region: 'Upper Spine',
    commonDisorders: ['Cervical Spondylosis', 'Herniated Disc', 'Whiplash', 'Tension Headache'],
    anatomy: 'The cervical spine consists of 7 vertebrae (C1-C7) and supports the head while allowing neck movement.'
  },
  {
    id: 'thoracic-spine',
    name: 'Thoracic Spine (Upper Back)',
    region: 'Middle Spine',
    commonDisorders: ['Kyphosis', 'Scoliosis', 'Compression Fractures', 'Muscle Strain'],
    anatomy: 'The thoracic spine has 12 vertebrae (T1-T12) and connects to the ribcage, providing stability.'
  },
  {
    id: 'lumbar-spine',
    name: 'Lumbar Spine (Lower Back)',
    region: 'Lower Spine',
    commonDisorders: ['Herniated Disc', 'Sciatica', 'Lumbar Stenosis', 'Muscle Strain'],
    anatomy: 'The lumbar spine contains 5 vertebrae (L1-L5) and bears most of the body\'s weight.'
  },
  {
    id: 'sacrum',
    name: 'Sacrum',
    region: 'Pelvic Region',
    commonDisorders: ['Sacroiliac Joint Dysfunction', 'Sacral Fractures', 'Coccydynia'],
    anatomy: 'The sacrum is a triangular bone at the base of the spine, connecting the spine to the pelvis.'
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    region: 'Upper Extremity',
    commonDisorders: ['Frozen Shoulder', 'Rotator Cuff Injury', 'Impingement Syndrome'],
    anatomy: 'The shoulder is a ball-and-socket joint connecting the arm to the torso, allowing wide range of motion.'
  },
  {
    id: 'hips',
    name: 'Hips',
    region: 'Lower Extremity',
    commonDisorders: ['Hip Osteoarthritis', 'Hip Bursitis', 'Hip Flexor Strain'],
    anatomy: 'The hip is a ball-and-socket joint connecting the thigh bone to the pelvis, supporting body weight.'
  },
  {
    id: 'knees',
    name: 'Knees',
    region: 'Lower Extremity',
    commonDisorders: ['Knee Osteoarthritis', 'Patellofemoral Pain', 'Meniscus Tear'],
    anatomy: 'The knee is a hinge joint connecting the thigh bone to the shin bone, allowing leg movement.'
  }
];

export const medicalQuestions = [
  {
    keywords: ['back pain', 'lower back', 'lumbar'],
    response: 'Back pain is very common and can have many causes. It could be due to muscle strain, herniated disc, or poor posture. Would you like to know more about specific back conditions or book an appointment for evaluation?'
  },
  {
    keywords: ['neck pain', 'cervical', 'stiff neck'],
    response: 'Neck pain often results from poor posture, muscle tension, or cervical spine issues. Common causes include sleeping wrong, computer work, or whiplash. Would you like information about neck disorders or schedule a consultation?'
  },
  {
    keywords: ['headache', 'migraine', 'head pain'],
    response: 'Headaches can be tension-type, migraines, or cervicogenic (originating from the neck). Many headaches are related to neck problems and can be helped with chiropractic care. Would you like to learn more or book an appointment?'
  },
  {
    keywords: ['sciatica', 'leg pain', 'nerve pain'],
    response: 'Sciatica is pain that radiates from your lower back down your leg, often caused by a herniated disc or spinal stenosis. It can cause numbness, tingling, and weakness. Would you like more information about sciatica treatment?'
  },
  {
    keywords: ['joint pain', 'arthritis', 'stiff joints'],
    response: 'Joint pain can be caused by arthritis, injury, or inflammation. Osteoarthritis is the most common form, caused by wear and tear. Early intervention can help manage symptoms. Would you like to schedule an evaluation?'
  }
];

export function findDisorderBySymptom(symptom: string): MedicalDisorder[] {
  const searchTerm = symptom.toLowerCase();
  return medicalDisorders.filter(disorder => 
    disorder.symptoms.some(s => s.toLowerCase().includes(searchTerm)) ||
    disorder.name.toLowerCase().includes(searchTerm) ||
    disorder.description.toLowerCase().includes(searchTerm)
  );
}

export function findDisorderByLocation(location: string): MedicalDisorder[] {
  const searchTerm = location.toLowerCase();
  return medicalDisorders.filter(disorder => 
    disorder.location.some(loc => loc.toLowerCase().includes(searchTerm))
  );
}

export function getBodyLocationInfo(location: string): BodyLocation | undefined {
  const searchTerm = location.toLowerCase();
  return bodyLocations.find(loc => 
    loc.name.toLowerCase().includes(searchTerm) ||
    loc.region.toLowerCase().includes(searchTerm)
  );
}

export function searchMedicalKnowledge(query: string): {
  disorders: MedicalDisorder[];
  locations: BodyLocation[];
  suggestions: string[];
} {
  const searchTerm = query.toLowerCase();
  
  const disorders = medicalDisorders.filter(disorder => 
    disorder.name.toLowerCase().includes(searchTerm) ||
    disorder.symptoms.some(s => s.toLowerCase().includes(searchTerm)) ||
    disorder.description.toLowerCase().includes(searchTerm) ||
    disorder.location.some(loc => loc.toLowerCase().includes(searchTerm))
  );

  const locations = bodyLocations.filter(location => 
    location.name.toLowerCase().includes(searchTerm) ||
    location.region.toLowerCase().includes(searchTerm) ||
    location.commonDisorders.some(d => d.toLowerCase().includes(searchTerm))
  );

  const suggestions = [
    'Tell me about back pain',
    'What causes neck pain?',
    'Symptoms of herniated disc',
    'How to treat sciatica',
    'Book an appointment',
    'What is fibromyalgia?'
  ];

  return { disorders, locations, suggestions };
}
