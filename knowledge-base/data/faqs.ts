import type { FAQItem } from '../types/index';

export const faqs: FAQItem[] = [
  // GENERAL QUESTIONS
  {
    id: 'faq-001',
    category: 'general',
    question: 'What is the Gonstead Technique?',
    answer: 'The Gonstead Technique is a highly specific, comprehensive chiropractic method developed by Dr. Clarence Gonstead. It involves thorough analysis using five criteria: X-ray analysis, instrumentation, static palpation, motion palpation, and visual examination. This systematic approach ensures precise diagnosis and targeted treatment of spinal subluxations, making it one of the most effective and safe chiropractic techniques available.',
    tags: ['gonstead', 'technique', 'chiropractic', 'spinal adjustment'],
    priority: 'high',
    relatedQuestions: ['faq-002', 'faq-003'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-002',
    category: 'gonstead-technique',
    question: 'How does the Gonstead Technique differ from other chiropractic methods?',
    answer: 'The Gonstead Technique stands out through its comprehensive five-part analysis system, precision in adjustments, and scientific approach. Unlike general chiropractic methods, Gonstead practitioners: 1) Use detailed X-ray analysis to identify the exact location of subluxations, 2) Employ the Nervoscope instrument to detect inflammation, 3) Perform specific palpation techniques, 4) Make only the most necessary adjustments, 5) Focus on correcting the underlying cause rather than just symptoms. This makes it more precise and often more effective than traditional methods.',
    tags: ['gonstead', 'comparison', 'precision', 'analysis'],
    priority: 'high',
    relatedQuestions: ['faq-001', 'faq-004'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-003',
    category: 'general',
    question: 'Is chiropractic treatment safe?',
    answer: 'Yes, chiropractic treatment, especially using the Gonstead Technique, is extremely safe when performed by a qualified professional. The Gonstead method\'s emphasis on thorough analysis and precise adjustments actually makes it one of the safest chiropractic approaches. Serious adverse events are extremely rare, occurring in less than 1 in 100,000 treatments. Dr. Bashir Khan follows strict safety protocols and conducts comprehensive examinations before any treatment.',
    tags: ['safety', 'treatment', 'risks'],
    priority: 'high',
    relatedQuestions: ['faq-001', 'faq-005'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-004',
    category: 'treatments',
    question: 'What conditions can be treated with the Gonstead Technique?',
    answer: 'The Gonstead Technique is effective for treating a wide range of conditions including: Lower back pain, neck pain, headaches and migraines, sciatica, herniated discs, scoliosis, sports injuries, joint stiffness, muscle tension, numbness and tingling, posture problems, and chronic pain conditions. The technique is particularly effective for complex spinal conditions due to its precise diagnostic approach.',
    tags: ['conditions', 'treatment', 'back pain', 'neck pain', 'headaches'],
    priority: 'high',
    relatedQuestions: ['faq-002', 'faq-006'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-005',
    category: 'treatments',
    question: 'Does chiropractic treatment hurt?',
    answer: 'Most patients find chiropractic treatment to be comfortable and relieving. While you may hear a "popping" sound during adjustments (which is just gas being released from joints), this is not painful. Some patients may experience mild soreness after their first few treatments as their body adjusts, similar to starting a new exercise routine. Dr. Bashir Khan uses gentle, precise techniques and will always communicate with you throughout the treatment to ensure your comfort.',
    tags: ['pain', 'comfort', 'adjustment', 'popping sound'],
    priority: 'high',
    relatedQuestions: ['faq-003', 'faq-007'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },

  // APPOINTMENTS
  {
    id: 'faq-006',
    category: 'appointments',
    question: 'How do I book an appointment?',
    answer: 'You can book an appointment in several convenient ways: 1) Use our online booking system on the website, 2) Call us directly at our clinic number, 3) Use our WhatsApp booking service, 4) Walk in during business hours (subject to availability). We recommend booking in advance to secure your preferred time slot. Our staff will help you choose the best appointment type for your needs.',
    tags: ['booking', 'appointment', 'online', 'phone', 'whatsapp'],
    priority: 'high',
    relatedQuestions: ['faq-007', 'faq-008'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-007',
    category: 'appointments',
    question: 'How long is a typical appointment?',
    answer: 'Appointment duration varies based on the type of visit: Initial consultations take 60-90 minutes (includes detailed examination, X-rays if needed, and first treatment), Follow-up treatments are typically 30-45 minutes, Emergency appointments are 45-60 minutes, Online consultations are 30-45 minutes. We never rush your treatment and ensure you receive the time needed for optimal care.',
    tags: ['duration', 'initial consultation', 'follow-up', 'time'],
    priority: 'high',
    relatedQuestions: ['faq-006', 'faq-009'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-008',
    category: 'appointments',
    question: 'What should I bring to my first appointment?',
    answer: 'For your first appointment, please bring: 1) Valid photo ID, 2) Insurance cards (if applicable), 3) List of current medications, 4) Any previous medical records or X-rays related to your condition, 5) Completed intake forms (can be filled online beforehand), 6) Comfortable clothing that allows easy movement, 7) A list of questions or concerns you\'d like to discuss. Arrive 15 minutes early to complete any remaining paperwork.',
    tags: ['first appointment', 'documents', 'preparation', 'insurance'],
    priority: 'high',
    relatedQuestions: ['faq-007', 'faq-010'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-009',
    category: 'appointments',
    question: 'Can I cancel or reschedule my appointment?',
    answer: 'Yes, you can cancel or reschedule your appointment. We require at least 24 hours notice for cancellations to avoid a cancellation fee. You can reschedule by: 1) Calling our clinic directly, 2) Using our online patient portal, 3) Sending a WhatsApp message. Same-day cancellations may incur a fee unless due to emergency circumstances. We understand that emergencies happen and will work with you when possible.',
    tags: ['cancellation', 'rescheduling', '24 hours notice', 'fees'],
    priority: 'medium',
    relatedQuestions: ['faq-006', 'faq-011'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },

  // COSTS AND INSURANCE
  {
    id: 'faq-010',
    category: 'costs',
    question: 'How much does treatment cost?',
    answer: 'Our fee structure is transparent and competitive: Initial consultation with examination: $150-200, Follow-up treatments: $80-120, X-rays (if needed): $100-150, Specialized treatments: $120-180. Exact costs depend on the complexity of your condition and treatment required. We provide detailed estimates before treatment and offer payment plans for extensive treatment programs. Many insurance plans cover chiropractic care.',
    tags: ['cost', 'fees', 'pricing', 'consultation', 'treatment'],
    priority: 'high',
    relatedQuestions: ['faq-011', 'faq-012'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-011',
    category: 'insurance',
    question: 'Do you accept insurance?',
    answer: 'Yes, we accept most major insurance plans including: Blue Cross Blue Shield, Aetna, Cigna, UnitedHealth, Medicare, and many others. We also accept FSA and HSA payments. Our staff will verify your insurance coverage before your first appointment and explain your benefits. If your insurance doesn\'t cover the full cost, we offer competitive self-pay rates and flexible payment plans.',
    tags: ['insurance', 'coverage', 'medicare', 'payment plans', 'FSA', 'HSA'],
    priority: 'high',
    relatedQuestions: ['faq-010', 'faq-013'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-012',
    category: 'costs',
    question: 'Do you offer payment plans?',
    answer: 'Yes, we offer flexible payment options to make treatment accessible: 1) Payment plans for extended treatment programs, 2) Cash payment discounts, 3) Family package deals, 4) FSA/HSA payment acceptance, 5) Credit card payments, 6) Third-party financing options for larger treatments. We believe cost should never be a barrier to getting the care you need. Discuss options with our administrative staff.',
    tags: ['payment plans', 'financing', 'cash discount', 'family packages'],
    priority: 'medium',
    relatedQuestions: ['faq-010', 'faq-011'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },

  // PREPARATION AND AFTERCARE
  {
    id: 'faq-013',
    category: 'preparation',
    question: 'How should I prepare for my chiropractic treatment?',
    answer: 'To prepare for your treatment: 1) Wear comfortable, loose-fitting clothing, 2) Avoid heavy meals 2 hours before your appointment, 3) Stay hydrated, 4) Bring a list of current symptoms and their history, 5) Avoid strenuous activities on treatment day, 6) Get adequate sleep the night before, 7) Inform us of any changes in your condition. Proper preparation helps ensure the most effective treatment.',
    tags: ['preparation', 'clothing', 'pre-treatment', 'hydration'],
    priority: 'medium',
    relatedQuestions: ['faq-008', 'faq-014'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },
  {
    id: 'faq-014',
    category: 'aftercare',
    question: 'What should I do after my chiropractic treatment?',
    answer: 'After your treatment: 1) Stay hydrated (drink plenty of water), 2) Apply ice to treated areas if there\'s any soreness (15-20 minutes), 3) Avoid strenuous activities for 24 hours, 4) Gentle walking is encouraged, 5) Follow any specific exercises given by Dr. Khan, 6) Maintain good posture, 7) Get adequate rest. Some mild soreness is normal for 24-48 hours as your body adjusts to the correction.',
    tags: ['aftercare', 'post-treatment', 'hydration', 'ice', 'rest', 'exercises'],
    priority: 'high',
    relatedQuestions: ['faq-013', 'faq-015'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-015',
    category: 'aftercare',
    question: 'When will I start feeling better?',
    answer: 'Recovery timelines vary based on several factors: Acute conditions (recent injuries) often show improvement within 1-3 treatments, Chronic conditions may take 4-8 weeks of regular treatment, Some patients feel immediate relief, while others notice gradual improvement over several sessions. Dr. Bashir Khan will discuss realistic expectations based on your specific condition during your initial consultation. Consistency with treatment and following aftercare instructions greatly influences recovery speed.',
    tags: ['recovery time', 'improvement', 'expectations', 'acute', 'chronic'],
    priority: 'high',
    relatedQuestions: ['faq-014', 'faq-016'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },

  // CONDITIONS
  {
    id: 'faq-016',
    category: 'conditions',
    question: 'Can you help with chronic back pain?',
    answer: 'Yes, the Gonstead Technique is particularly effective for chronic back pain. Dr. Bashir Khan uses a systematic approach to identify and correct the root cause of your pain, not just treat symptoms. Through precise spinal analysis and targeted adjustments, many patients with chronic back pain experience significant improvement. Treatment plans are customized based on the underlying cause, duration of symptoms, and individual patient needs.',
    tags: ['chronic pain', 'back pain', 'root cause', 'systematic approach'],
    priority: 'high',
    relatedQuestions: ['faq-004', 'faq-017'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-017',
    category: 'conditions',
    question: 'Do you treat headaches and migraines?',
    answer: 'Absolutely! Many headaches and migraines originate from spinal misalignments, particularly in the cervical (neck) region. The Gonstead Technique\'s precise approach to correcting these misalignments can provide significant relief. We treat tension headaches, cervicogenic headaches, and can help reduce migraine frequency and intensity. Treatment success depends on the underlying cause, which we identify through thorough examination.',
    tags: ['headaches', 'migraines', 'neck', 'cervical spine', 'tension'],
    priority: 'high',
    relatedQuestions: ['faq-004', 'faq-018'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-018',
    category: 'conditions',
    question: 'Can chiropractic help with sports injuries?',
    answer: 'Yes, chiropractic care is excellent for sports injuries! Dr. Bashir Khan has experience treating athletes and sports-related injuries including: muscle strains, joint injuries, spinal misalignments from sports activities, performance-related pain, and injury prevention. The Gonstead Technique\'s precision makes it particularly effective for sports injuries. We also provide guidance on injury prevention and performance optimization.',
    tags: ['sports injuries', 'athletes', 'performance', 'prevention', 'muscle strains'],
    priority: 'medium',
    relatedQuestions: ['faq-004', 'faq-019'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },

  // TECHNICAL QUESTIONS
  {
    id: 'faq-019',
    category: 'technical',
    question: 'Do you use X-rays in diagnosis?',
    answer: 'Yes, X-rays are a crucial component of the Gonstead Technique when clinically indicated. We use state-of-the-art digital X-ray equipment that produces high-quality images with minimal radiation exposure. X-rays help us: 1) Identify the exact location of spinal misalignments, 2) Rule out serious pathology, 3) Determine the best approach for correction, 4) Track progress over time. X-rays are only taken when medically necessary and with your consent.',
    tags: ['x-rays', 'diagnosis', 'digital', 'radiation', 'spinal misalignment'],
    priority: 'medium',
    relatedQuestions: ['faq-001', 'faq-020'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },
  {
    id: 'faq-020',
    category: 'technical',
    question: 'What is the Nervoscope and how does it work?',
    answer: 'The Nervoscope is a specialized instrument unique to the Gonstead Technique that detects temperature differences along the spine. These temperature variations indicate areas of inflammation and nerve irritation. The device is gently glided down both sides of your spine to identify "hot spots" where subluxations are causing nerve interference. This objective measurement helps Dr. Khan pinpoint exactly where adjustments are needed and track your progress over time.',
    tags: ['nervoscope', 'temperature', 'inflammation', 'nerve irritation', 'subluxation'],
    priority: 'low',
    relatedQuestions: ['faq-001', 'faq-002'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },

  // GENERAL HEALTH
  {
    id: 'faq-021',
    category: 'general',
    question: 'How often should I get chiropractic treatment?',
    answer: 'Treatment frequency depends on your specific condition and goals: Acute conditions may require 2-3 visits per week initially, Chronic conditions often need 1-2 visits per week, Maintenance care is typically once every 2-4 weeks, Wellness care can be monthly or quarterly. Dr. Bashir Khan will create a personalized treatment plan and adjust the frequency based on your progress. The goal is always to achieve maximum improvement in the shortest time possible.',
    tags: ['frequency', 'treatment plan', 'acute', 'chronic', 'maintenance', 'wellness'],
    priority: 'high',
    relatedQuestions: ['faq-015', 'faq-022'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-022',
    category: 'general',
    question: 'Is chiropractic treatment suitable for children?',
    answer: 'Yes, chiropractic care is safe and effective for children when performed by a qualified practitioner. Dr. Bashir Khan uses gentle, age-appropriate techniques for pediatric patients. Children can benefit from chiropractic care for: posture problems, sports injuries, growing pains, headaches, and general wellness. Techniques are modified for children\'s smaller size and developing spine. Parental consent and involvement in the treatment process are always required.',
    tags: ['children', 'pediatric', 'gentle techniques', 'growing pains', 'parental consent'],
    priority: 'medium',
    relatedQuestions: ['faq-003', 'faq-023'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },
  {
    id: 'faq-023',
    category: 'general',
    question: 'Can pregnant women receive chiropractic treatment?',
    answer: 'Yes, chiropractic care during pregnancy is safe and beneficial when performed by a qualified practitioner experienced in prenatal care. Dr. Bashir Khan uses pregnancy-safe techniques and positioning. Benefits include: relief from pregnancy-related back pain, better pelvic alignment for easier delivery, reduced nausea, improved sleep quality, and overall comfort during pregnancy. Special pregnancy pillows and modified techniques ensure safety for both mother and baby.',
    tags: ['pregnancy', 'prenatal care', 'back pain', 'pelvic alignment', 'safe techniques'],
    priority: 'medium',
    relatedQuestions: ['faq-003', 'faq-022'],
    lastUpdated: '2025-01-15',
    isPopular: false
  },

  // CLINIC SPECIFIC
  {
    id: 'faq-024',
    category: 'general',
    question: 'What makes Dr. Bashir Khan\'s practice unique?',
    answer: 'Dr. Bashir Khan\'s practice stands out through: 1) Exclusive focus on the Gonstead Technique - one of the most precise chiropractic methods, 2) Comprehensive examination approach using all five Gonstead criteria, 3) State-of-the-art equipment including digital X-rays and Nervoscope, 4) Personalized treatment plans tailored to each patient, 5) Commitment to patient education and understanding, 6) Years of specialized training and experience, 7) Focus on correcting the cause, not just treating symptoms.',
    tags: ['unique practice', 'gonstead specialist', 'comprehensive examination', 'patient education'],
    priority: 'high',
    relatedQuestions: ['faq-001', 'faq-002'],
    lastUpdated: '2025-01-15',
    isPopular: true
  },
  {
    id: 'faq-025',
    category: 'general',
    question: 'Do you offer emergency appointments?',
    answer: 'Yes, we understand that pain and injuries don\'t follow a schedule. We reserve time slots for emergency appointments and acute cases. For emergencies: 1) Call our clinic immediately, 2) If after hours, use our emergency contact number, 3) Describe your symptoms to determine urgency, 4) We prioritize severe pain and new injuries. Emergency appointments are available same-day when possible, and we have protocols for urgent after-hours situations.',
    tags: ['emergency appointments', 'acute cases', 'same-day', 'urgent care'],
    priority: 'medium',
    relatedQuestions: ['faq-006', 'faq-007'],
    lastUpdated: '2025-01-15',
    isPopular: false
  }
];

// Helper functions for FAQ management
export const getFAQsByCategory = (category: string): FAQItem[] => {
  return faqs.filter(faq => faq.category === category);
};

export const getPopularFAQs = (): FAQItem[] => {
  return faqs.filter(faq => faq.isPopular).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const searchFAQs = (query: string): FAQItem[] => {
  const searchTerm = query.toLowerCase();
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm) ||
    faq.answer.toLowerCase().includes(searchTerm) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

export const getFAQById = (id: string): FAQItem | undefined => {
  return faqs.find(faq => faq.id === id);
};

export const getRelatedFAQs = (id: string): FAQItem[] => {
  const faq = getFAQById(id);
  if (!faq || !faq.relatedQuestions) return [];
  
  return faq.relatedQuestions
    .map(relatedId => getFAQById(relatedId))
    .filter((item): item is FAQItem => item !== undefined);
};
