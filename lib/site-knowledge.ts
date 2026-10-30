// Structured knowledge strictly derived from the public website main page (app/page.tsx)
// and the patient education page (public/educational-guide.html).
//
// NOTE: Do not add any information here that does not already exist on the website.
// This module is the single source of truth for the chatbot when it answers
// using "website knowledge" only.

export type KnowledgeSource = 'main' | 'education'

export type KnowledgeCategory =
  | 'clinic-info'
  | 'doctor'
  | 'services'
  | 'consultation'
  | 'education-general'
  | 'gonstead-history'
  | 'gonstead-technique'
  | 'diagnostics'

export interface SiteKnowledgeItem {
  id: string
  source: KnowledgeSource
  category: KnowledgeCategory
  /** Short title used for debugging / internal reference */
  title: string
  /** One-paragraph answer text written directly from website content */
  answer: string
  /** Extra bullet points or detail text, optional */
  bullets?: string[]
  /** Keywords and phrases taken from the website text to help matching */
  keywords: string[]
}

// Core clinic info from the main Next.js page (app/page.tsx)
const mainPageKnowledge: SiteKnowledgeItem[] = [
  {
    id: 'clinic-hours',
    source: 'main',
    category: 'clinic-info',
    title: 'Clinic hours and emergency availability',
    answer:
      'Gonstead Chiropractic Clinic is open Monday to Saturday from 9:00 AM to 6:00 PM. On Sundays the clinic is closed for regular appointments, but emergency care is available for urgent cases.',
    bullets: [
      'Monday – Saturday: 9:00 AM – 6:00 PM',
      'Sunday: emergency appointments only',
    ],
    keywords: [
      'hours',
      'timings',
      'opening',
      'closing',
      'sunday',
      'emergency',
      '9:00',
      '6:00',
      'schedule',
      'when open',
    ],
  },
  {
    id: 'clinic-location',
    source: 'main',
    category: 'clinic-info',
    title: 'Clinic location and city',
    answer:
      'The clinic is located near Peshawar Model School on Tehsil Road in Nowshera, Khyber Pakhtunkhwa. The footer and contact section also show a Google Maps embed for easy navigation.',
    bullets: [
      'Near Peshawar Model School, Tehsil Road',
      'Nowshera, Khyber Pakhtunkhwa',
    ],
    keywords: [
      'location',
      'address',
      'nowshera',
      'tehsil road',
      'peshawar model school',
      'map',
      'where are you',
      'how to reach',
      'find us',
    ],
  },
  {
    id: 'clinic-contact',
    source: 'main',
    category: 'clinic-info',
    title: 'Phone and email contact details',
    answer:
      'You can contact Gonstead Chiropractic Clinic by phone at +92 304 699 6267 and by email at gonsteadchiropractic.org@gmail.com. These details appear in the contact section and the footer of the main page.',
    bullets: ['Phone: +92 304 699 6267', 'Email: gonsteadchiropractic.org@gmail.com'],
    keywords: [
      'phone',
      'contact number',
      'call',
      'whatsapp',
      'email',
      'gmail',
      'contact',
      'clinic phone',
    ],
  },
  {
    id: 'clinic-stats',
    source: 'main',
    category: 'clinic-info',
    title: 'Clinic experience and results (as shown on site)',
    answer:
      'According to the main page, the clinic highlights more than 2000+ patients healed, over 15+ years of experience, and a 99% success rate. These figures are presented as part of the clinic’s own branding and statistics on the homepage hero and contact sections.',
    bullets: ['2000+ patients healed', '15+ years experience', '99% success rate (clinic branding)'],
    keywords: ['patients healed', '2000+', '15+ years', 'experience', 'success rate', 'results', 'outcomes'],
  },
  {
    id: 'services-gonstead-adjustments',
    source: 'main',
    category: 'services',
    title: 'Gonstead chiropractic adjustments and conditions treated',
    answer:
      'The services section describes Gonstead chiropractic adjustments as precise spinal care focusing on spinal biomechanics and nerve function. Key features include full-spine analysis, specific low-force adjustments, and attention to disc and nerve health. The main page lists conditions commonly treated such as lower back pain, sciatica, neck pain, headaches, disc herniation or bulging, postural problems, and muscle tension.',
    bullets: [
      'Features: precise spinal analysis, specific adjustment techniques, focus on spinal biomechanics and nerve function, minimal force with targeted results.',
      'Conditions listed on the site: lower back pain, sciatica, neck pain, headaches, disc herniation/bulging, postural problems, and muscle tension.',
    ],
    keywords: [
      'gonstead',
      'adjustment',
      'adjustments',
      'treatment',
      'treat',
      'therapy',
      'back pain',
      'low back pain',
      'lower back',
      'neck pain',
      'headache',
      'headaches',
      'migraine',
      'sciatica',
      'leg pain',
      'disc herniation',
      'disc bulge',
      'slipped disc',
      'posture',
      'poor posture',
      'muscle tension',
      'stiffness',
      'services',
      'conditions we treat',
    ],
  },
  {
    id: 'conditions-overview',
    source: 'main',
    category: 'services',
    title: 'List of common conditions treated at the clinic',
    answer:
      'On the main page, Gonstead Chiropractic Clinic lists several common conditions that respond well to Gonstead care. These include lower back pain and sciatica, neck pain and headaches, disc herniation or disc bulging, postural problems, muscle tension, and sports-related issues. The clinic positions these as typical problems patients bring to Bashir Khan Chiropractic for precise spinal analysis and adjustment.',
    bullets: [
      'Lower back pain and sciatica.',
      'Neck pain and headaches.',
      'Disc herniation or disc bulging.',
      'Postural problems and muscle tension.',
      'Sports-related spinal and joint issues.',
    ],
    keywords: [
      'conditions',
      'what do you treat',
      'which problems',
      'sciatica',
      'back pain',
      'neck pain',
      'headache',
      'disc',
      'posture',
      'sports injury',
      'kamar dard',
      'gardan',
    ],
  },
  {
    id: 'consultation-types',
    source: 'main',
    category: 'consultation',
    title: 'In-clinic and video consultation options',
    answer:
      'The main page explains that the clinic offers both in-clinic consultations and video consultations. In-clinic visits include a comprehensive spinal examination, X-ray analysis when indicated, hands-on Gonstead adjustments, and personalized treatment planning. Video consultations are used for remote health assessments, exercise and posture guidance, follow-up care, and convenient access from home.',
    bullets: [
      'In-clinic: full spinal examination, X-ray analysis (when appropriate), hands-on Gonstead adjustments, personalized plan.',
      'Video: remote assessment, exercise and posture guidance, follow-up care and monitoring, home-based access.',
    ],
    keywords: [
      'consultation',
      'in clinic',
      'visit',
      'physical visit',
      'clinic visit',
      'video',
      'online',
      'telehealth',
      'zoom',
      'remote',
      'follow up',
      'booking type',
    ],
  },
  {
    id: 'appointment-how-to-book',
    source: 'main',
    category: 'consultation',
    title: 'How to book an appointment with the clinic',
    answer:
      'On the main page, patients are invited to book by using the booking buttons on the website (for example “Book Now” or “Schedule Your Consultation”) or by contacting the clinic directly. To book, you can click the appointment button on the site, call +92 304 699 6267, or email gonsteadchiropractic.org@gmail.com to arrange a time.',
    bullets: [
      'Use the website booking buttons such as “Book Now” or “Schedule Your Consultation”.',
      'Or call the clinic at +92 304 699 6267.',
      'Or email gonsteadchiropractic.org@gmail.com to request a time.',
    ],
    keywords: [
      'book',
      'booking',
      'appointment',
      'schedule',
      'schedule visit',
      'reserve',
      'how to book',
      'how can i book',
      'online booking',
      'make appointment',
      'consultation booking',
      'i want to meet',
      'i want to visit',
      'can i come',
    ],
  },
  {
    id: 'first-visit-overview',
    source: 'main',
    category: 'consultation',
    title: 'What happens in the first in-clinic visit',
    answer:
      'From the main page consultation section, the first in-clinic visit typically includes a comprehensive spinal examination, Gonstead-style analysis, and when needed X-ray analysis. After this assessment, Bashir Khan Chiropractic provides hands-on Gonstead adjustments when appropriate and builds a personalized treatment plan for the patient.',
    bullets: [
      'Comprehensive spinal examination at the first visit.',
      'Gonstead analysis and X-ray review when clinically indicated.',
      'Hands-on Gonstead adjustments when appropriate.',
      'Personalized treatment plan discussed with the patient.',
    ],
    keywords: [
      'first visit',
      'first time',
      'initial visit',
      'initial consultation',
      'new patient',
      'what happens first',
      'what happens in first appointment',
      'visit process',
    ],
  },
  {
    id: 'wellness-programs',
    source: 'main',
    category: 'services',
    title: 'Wellness, preventive care, and rehabilitation programs',
    answer:
      'The wellness section of the main page describes programs for preventive care, rehabilitation, and patient education. Preventive care includes regular spinal check-ups, posture correction programs, and workplace ergonomics. Rehabilitation focuses on therapeutic exercises, strength and flexibility training, and recovery monitoring. Education covers spinal health workshops, lifestyle modification guidance, and home care instructions.',
    bullets: [
      'Preventive care: regular spinal check-ups, posture correction, workplace ergonomics.',
      'Rehabilitation: therapeutic exercises, strength and flexibility training, recovery monitoring.',
      'Education: spinal health workshops, lifestyle modification guidance, home care instructions.',
    ],
    keywords: [
      'wellness',
      'preventive',
      'prevention',
      'rehabilitation',
      'exercise',
      'home care',
      'lifestyle',
      'workshop',
      'posture program',
    ],
  },
  {
    id: 'doctor-profile',
    source: 'main',
    category: 'doctor',
    title: 'Bashir Khan Chiropractic – Gonstead specialist profile',
    answer:
      'The doctor section presents Bashir Khan Chiropractic as a Gonstead specialist with over 15 years of experience. The main page explains that he focuses on precise spinal analysis, disc and nerve mechanics, and personalized care. His profile emphasizes Gonstead spinal analysis, treatment of disc herniation, postural correction, and sports injury rehabilitation, along with a philosophy of addressing the root cause rather than only symptoms.',
    bullets: [
      'Gonstead Certified Specialist with more than 15 years of experience.',
      'Special interests: Gonstead spinal analysis, disc herniation, postural correction, sports injury rehabilitation.',
      'Philosophy: identify the exact source of spinal dysfunction and treat the root cause, not just symptoms.',
    ],
    keywords: [
      'doctor',
      'bashir',
      'bashir khan',
      'gonstead specialist',
      'experience',
      'who is the doctor',
      'chiropractor',
      'qualifications',
    ],
  },
  {
    id: 'patient-education-hub',
    source: 'main',
    category: 'education-general',
    title: 'Patient Education Hub on the main site',
    answer:
      'The main page includes a Patient Education Hub section that invites patients to access educational materials, guides, and resources to better understand chiropractic care and their healing journey. It describes the resources as expert-approved, regularly updated, and designed to be easy to follow. A prominent button links to the detailed educational guide page at /educational-guide.html.',
    bullets: [
      'Purpose: help patients understand chiropractic care and support their recovery.',
      'Features: expert-approved content, regularly updated, easy-to-follow explanations.',
      'Link: "Explore Resources" button opens the educational guide at /educational-guide.html.',
    ],
    keywords: [
      'education',
      'learning',
      'resources',
      'guides',
      'patient education',
      'educational guide',
      'articles',
    ],
  },
]

// Key conceptual content from public/educational-guide.html (Gonstead technique guide)
const educationPageKnowledge: SiteKnowledgeItem[] = [
  {
    id: 'gonstead-history',
    source: 'education',
    category: 'gonstead-history',
    title: 'History of the Gonstead Technique and Dr. Clarence S. Gonstead',
    answer:
      'The educational guide explains that Dr. Clarence S. Gonstead (1898–1978) transformed chiropractic into a more biomechanical, evidence-based discipline. After recovering from severe rheumatoid arthritis under chiropractic care, he studied at Palmer and opened his first clinic in Mount Horeb in 1923. His success led to the construction of the large Gonstead Clinic of Chiropractic in 1964, a 29,000-square-foot facility with multiple adjusting rooms, research facilities, and on-site lodging for patients. His work introduced the Gonstead Disc Concept and a systematic method that is still taught worldwide.',
    bullets: [
      'Clarence S. Gonstead developed a highly systematic and biomechanical approach to chiropractic.',
      'First clinic opened in Mount Horeb in 1923; the famous Gonstead Clinic was built in 1964.',
      'He introduced the Gonstead Disc Concept and helped found the Gonstead Clinical Studies Society (GCSS).',
    ],
    keywords: [
      'history',
      'clarence',
      'gonstead',
      'who created',
      'founder',
      '1923',
      'mount horeb',
      'disc concept',
      'gcss',
    ],
  },
  {
    id: 'gonstead-disc-concept',
    source: 'education',
    category: 'gonstead-technique',
    title: 'Gonstead Disc Concept explained',
    answer:
      'According to the educational guide, the Gonstead Disc Concept emphasizes that many spinal problems are primarily disc-related rather than purely bony. The idea is that a damaged or misaligned disc can create nerve pressure and inflammation, leading to pain and dysfunction. Gonstead analysis looks for disc involvement and aims to adjust in a way that restores disc and joint mechanics so the body can heal.',
    bullets: [
      'Focus on the intervertebral disc as a key source of nerve pressure and spinal dysfunction.',
      'Adjustments are designed to restore disc and joint mechanics instead of just “pushing bones back”.',
    ],
    keywords: [
      'disc concept',
      'disc',
      'herniation',
      'bulge',
      'nerve pressure',
      'disc theory',
    ],
  },
  {
    id: 'gonstead-five-component-analysis',
    source: 'education',
    category: 'diagnostics',
    title: 'Five-component Gonstead diagnostic framework',
    answer:
      'The education page describes a five-component diagnostic framework in the Gonstead system. It includes: 1) full-spine, weight-bearing X-rays to assess posture, disc integrity, and biomechanics; 2) static and motion palpation to feel for swelling, tenderness, and restricted movement; 3) Nervoscope or thermography to detect heat differences that may indicate inflammation and nerve irritation; 4) visual assessment of posture, gait, and symmetry; and 5) careful integration of the patient’s symptoms and case history to identify the true primary subluxation.',
    bullets: [
      'X-rays: full-spine, weight-bearing views for structural and disc assessment when indicated.',
      'Static and motion palpation: hands-on assessment of joints at rest and in movement.',
      'Nervoscope/thermography: thermal scanning along the spine for signs of inflammation.',
      'Visual assessment: posture, gait, and body symmetry inspection.',
      'Symptom and case management: combining findings with patient history to locate the primary problem.',
    ],
    keywords: [
      'five components',
      'diagnostic framework',
      'x-ray',
      'nervoscope',
      'thermography',
      'palpation',
      'visual assessment',
      'analysis steps',
    ],
  },
  {
    id: 'primary-vs-secondary-subluxations',
    source: 'education',
    category: 'gonstead-technique',
    title: 'Primary versus secondary subluxations in Gonstead',
    answer:
      'The educational guide explains that the Gonstead System distinguishes between primary and secondary subluxations. A primary subluxation is the main area causing biomechanical and neurological stress, while secondary misalignments often appear as compensations above or below. In Gonstead care the goal is to locate and correct the true primary subluxation so that secondary compensations can normalize without over-adjusting the spine.',
    bullets: [
      'Primary subluxation: main driver of mechanical and nerve stress.',
      'Secondary subluxations: compensatory changes that often improve once the primary area is corrected.',
    ],
    keywords: [
      'primary',
      'secondary',
      'subluxation',
      'compensation',
      'root cause',
      'main problem',
    ],
  },
  {
    id: 'spinal-nerve-chart',
    source: 'education',
    category: 'education-general',
    title: 'Spinal nerve chart and nervous system overview',
    answer:
      'The educational guide includes a spinal nerve chart and diagrams explaining that 31 pairs of spinal nerves connect the spine to different organs and body regions. It also shows an animation of autonomic, motor, and sensory nervous system function. The material emphasizes that proper spinal alignment supports healthy nerve communication, which is why Gonstead chiropractic focuses on precise adjustments rather than generalized manipulation.',
    bullets: [
      '31 pairs of spinal nerves link spinal segments to body systems.',
      'The guide illustrates autonomic, motor, and sensory pathways and how they relate to spinal health.',
      'Spinal alignment is presented as important for clear nerve communication throughout the body.',
    ],
    keywords: [
      'spinal nerves',
      'nerve chart',
      '31 pairs',
      'autonomic',
      'motor',
      'sensory',
      'nervous system',
    ],
  },
  {
    id: 'gonstead-overview-simple',
    source: 'education',
    category: 'gonstead-technique',
    title: 'High-level explanation of the Gonstead Technique',
    answer:
      'Overall, the educational guide describes the Gonstead Technique as a precise, biomechanical approach to chiropractic. It combines detailed analysis (X-rays, palpation, instrument readings, and visual posture checks) with very specific adjustments delivered to the exact segment that needs correction. The focus is on restoring normal disc and joint mechanics so that the nervous system can function properly and the body can heal itself.',
    bullets: [
      'Emphasizes precision, biomechanics, and disc health.',
      'Uses multiple diagnostic tools before adjusting.',
      'Applies specific, controlled adjustments instead of general “cracking”.',
    ],
    keywords: [
      'what is gonstead',
      'gonstead technique',
      'method',
      'approach',
      'how it works',
      'precise chiropractic',
    ],
  },
]

export const siteKnowledge: SiteKnowledgeItem[] = [
  ...mainPageKnowledge,
  ...educationPageKnowledge,
]

/**
 * Simple rule-based answer generator that only uses the approved siteKnowledge
 * defined above. It does NOT call any external AI or use any other data.
 */
export function answerFromSiteKnowledge(query: string): { text: string; sourceIds: string[] } | null {
  const q = (query || '').toLowerCase().trim()
  if (!q) return null

  let bestScore = 0
  const scored: { item: SiteKnowledgeItem; score: number }[] = []

  for (const item of siteKnowledge) {
    let score = 0

    // Keyword overlap
    for (const kw of item.keywords) {
      if (!kw) continue
      if (q.includes(kw.toLowerCase())) {
        score += 4
      }
    }

    // Title overlap
    const title = item.title.toLowerCase()
    for (const word of q.split(/\s+/)) {
      if (word && title.includes(word)) score += 1
    }

    // Heuristic boosts for common intents
    if (/hour|time|timing|open|close|sunday|today open|today closed/i.test(q) && item.id === 'clinic-hours') {
      score += 10
    }
    if (/(where|address|location|map|nowshera|tehsil road|school)/i.test(q) && item.id === 'clinic-location') {
      score += 10
    }
    if (/(phone|contact|call|whatsapp|whatapp|mobile|number|email)/i.test(q) && item.id === 'clinic-contact') {
      score += 10
    }
    if (/(who|doctor|dr\.?\s*bashir|chiropractor|bashir khan|about doctor)/i.test(q) && item.category === 'doctor') {
      score += 10
    }
    if (/(book|booking|appointment|schedule|reserve|meet|visit|come)/i.test(q) && item.id === 'appointment-how-to-book') {
      score += 10
    }
    if (/(first visit|first time|initial visit|initial consultation|new patient)/i.test(q) && item.id === 'first-visit-overview') {
      score += 10
    }
    if (/(what is gonstead|gonstead technique|explain gonstead|gonstead method)/i.test(q) &&
        (item.id === 'gonstead-overview-simple' || item.id === 'gonstead-disc-concept')) {
      score += 12
    }
    if (/(condition|treat|treatment|back pain|neck pain|headache|migraine|sciatica|disc|posture|sports injury)/i.test(q) &&
        (item.id === 'services-gonstead-adjustments' || item.id === 'conditions-overview')) {
      score += 8
    }

    if (score > 0) {
      scored.push({ item, score })
      if (score > bestScore) bestScore = score
    }
  }

  if (bestScore <= 0) {
    return null
  }

  // Choose a single best-matching item for a precise, focused answer
  // Prefer items with more specific categories when scores tie.
  const best = scored.reduce((acc, cur) => {
    if (cur.score > acc.score) return cur
    if (cur.score < acc.score) return acc
    // Tie-break: prefer non-clinic-info when user asks about treatment/conditions
    if (/treat|treatment|back pain|neck pain|sciatica|disc|condition/i.test(query) &&
        acc.item.category === 'clinic-info' && cur.item.category !== 'clinic-info') {
      return cur
    }
    return acc
  })
  const item = best.item

  const ids: string[] = [item.id]
  let text = item.answer

  if (item.bullets && item.bullets.length) {
    text += '\n\nKey points from our site:\n- ' + item.bullets.join('\n- ')
  }

  // Add a general safety/accuracy note for clinical/education topics
  const isClinical =
    item.category === 'services' ||
    item.category === 'education-general' ||
    item.category === 'gonstead-technique' ||
    item.category === 'gonstead-history' ||
    item.category === 'diagnostics'

  if (isClinical) {
    text +=
      '\n\nImportant: This information comes directly from the official Gonstead Chiropractic Clinic website and patient education guide. It is general educational guidance only and does not replace an in-person assessment by a qualified clinician. For personal advice or if your symptoms are severe or worsening, please visit the clinic or call +92 304 699 6267. In any emergency, seek urgent medical care or call 1122.'
  }

  return { text, sourceIds: ids }
}

