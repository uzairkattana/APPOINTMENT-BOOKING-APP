// Comprehensive Knowledge Base for Chatbot Training
// All fee information has been removed for security reasons

import { faqs, getFAQsByCategory, getPopularFAQs, searchFAQs } from '../knowledge-base/data/faqs'
import { services, getServicesByCategory } from '../knowledge-base/data/services'
import { doctorProfile } from '../knowledge-base/data/doctor'
import { clinicInfo } from '../knowledge-base/data/clinic'

// Remove all pricing information from services for security
const servicesWithoutPricing = services.map(service => ({
  ...service,
  price: undefined,
  priceRange: undefined,
  // Keep all other information intact
}))

// FAQ Knowledge Base for Quick Responses
export const chatbotKnowledgeBase = {
  // GONSTEAD TECHNIQUE INFORMATION
  gonstead: {
    definition: "The Gonstead Technique is a comprehensive system of analyzing and adjusting the spine developed by Dr. Clarence Gonstead. It involves thorough analysis using five criteria: X-ray analysis, instrumentation, static palpation, motion palpation, and visual examination.",
    
    advantages: [
      "Most precise spinal analysis available",
      "Identification of exact subluxation locations", 
      "Targeted corrections with minimal adjustments",
      "Scientific, objective assessment methods",
      "Comprehensive understanding of spinal mechanics",
      "Optimal treatment outcomes",
      "Reduced risk of over-treatment",
      "Long-lasting results"
    ],
    
    fiveCriteria: [
      "Visual Examination - Posture and movement analysis",
      "X-ray Analysis - Detailed structural assessment",
      "Static Palpation - Tissue texture and temperature",
      "Motion Palpation - Joint movement evaluation", 
      "Instrumentation - Nervoscope temperature detection"
    ],
    
    conditions: [
      "Lower back pain and sciatica",
      "Neck pain and headaches", 
      "Disc herniation and bulging",
      "Postural problems and muscle tension",
      "Chronic pain conditions",
      "Sports injuries",
      "Joint stiffness",
      "Scoliosis management"
    ]
  },

  // DOCTOR INFORMATION (without fees)
  doctor: {
    name: doctorProfile.name,
    title: doctorProfile.title,
    specialization: doctorProfile.specialization,
    experience: `${doctorProfile.experience.years} years of specialized experience in Gonstead Technique`,
    languages: doctorProfile.languages,
    expertise: doctorProfile.expertise,
    philosophy: "Dr. Bashir Khan's treatment philosophy centers on precision, education, and long-term health optimization. He believes that true healing occurs when the root cause of problems is identified and corrected, rather than simply masking symptoms.",
    approach: [
      "Precision Over Volume - Only necessary adjustments",
      "Scientific Approach - Based on objective Gonstead findings", 
      "Patient Partnership - Education and communication focused",
      "Holistic Wellness - Addressing lifestyle factors",
      "Prevention Focus - Establishing optimal spinal function",
      "Individualized Care - Customized treatment plans"
    ],
    qualifications: doctorProfile.qualifications.map(q => `${q.degree} - ${q.institution} (${q.year})`),
    certifications: doctorProfile.certifications.map(c => c.name),
    availableDays: doctorProfile.availableDays
  },

  // CLINIC INFORMATION (without pricing)
  clinic: {
    name: "Gonstead Chiropractic Clinic - Dr. Bashir Khan",
    location: "Near Peshawar Model School, Tehsil Road, Nowshera, Khyber Pakhtunkhwa",
    phone: "+92 304 699 6267",
    email: "info@gonsteadchiropractic.com",
    
    hours: {
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
      saturday: "Saturday: 9:00 AM - 3:00 PM", 
      sunday: "Sunday: Emergency appointments only",
      emergency: "Emergency contact available 24/7"
    },
    
    services: clinicInfo.services,
    facilities: clinicInfo.facilities,
    
    accessibility: {
      wheelchairAccessible: true,
      features: clinicInfo.accessibility.assistiveDevices
    },
    
    parking: "Free parking available directly in front of clinic"
  },

  // COMMON QUESTIONS AND ANSWERS (without fees)
  commonQuestions: {
    safety: "Yes, chiropractic treatment, especially using the Gonstead Technique, is extremely safe when performed by a qualified professional. The Gonstead method's emphasis on thorough analysis and precise adjustments makes it one of the safest chiropractic approaches.",
    
    pain: "Most patients find chiropractic treatment comfortable and relieving. While you may hear a 'popping' sound during adjustments, this is not painful. Some patients may experience mild soreness after their first few treatments as their body adjusts.",
    
    duration: "Appointment duration varies: Initial consultations take 60-90 minutes (includes detailed examination, X-rays if needed, and first treatment), Follow-up treatments are typically 30-45 minutes, Emergency appointments are 45-60 minutes.",
    
    frequency: "Treatment frequency depends on your condition: Acute conditions may require 2-3 visits per week initially, Chronic conditions often need 1-2 visits per week, Maintenance care is typically once every 2-4 weeks.",
    
    preparation: "To prepare for treatment: Wear comfortable, loose-fitting clothing, Avoid heavy meals 2 hours before, Stay hydrated, Bring list of current symptoms and medications, Avoid strenuous activities on treatment day.",
    
    aftercare: "After treatment: Stay hydrated, Apply ice to treated areas if sore (15-20 minutes), Avoid strenuous activities for 24 hours, Follow prescribed exercises, Maintain good posture, Get adequate rest.",
    
    children: "Yes, chiropractic care is safe and effective for children when performed by a qualified practitioner. Dr. Bashir Khan uses gentle, age-appropriate techniques for pediatric patients.",
    
    pregnancy: "Yes, chiropractic care during pregnancy is safe and beneficial. Dr. Bashir Khan uses pregnancy-safe techniques and positioning to provide relief from pregnancy-related back pain and improve pelvic alignment.",
    
    recovery: "Recovery timelines vary: Acute conditions often show improvement within 1-3 treatments, Chronic conditions may take 4-8 weeks of regular treatment. Some patients feel immediate relief, others notice gradual improvement over several sessions."
  },

  // CONDITIONS TREATED
  conditions: {
    backPain: "The Gonstead Technique is particularly effective for both acute and chronic back pain. Through precise spinal analysis and targeted adjustments, we identify and correct the root cause of your pain.",
    
    neckPain: "Neck pain often responds well to Gonstead adjustments. We address cervical misalignments that cause pain, stiffness, and reduced mobility.",
    
    headaches: "Many headaches and migraines originate from spinal misalignments, particularly in the cervical region. The Gonstead Technique's precise approach can provide significant relief.",
    
    sciatica: "Sciatica is effectively treated through specific Gonstead analysis to identify the exact source of nerve irritation and provide targeted correction.",
    
    sportsInjuries: "Dr. Bashir Khan has experience treating athletes and sports-related injuries including muscle strains, joint injuries, and performance-related pain.",
    
    posture: "Postural problems are addressed through comprehensive analysis and corrective treatment plans that include adjustments and exercise recommendations."
  },

  // APPOINTMENT INFORMATION (without fees)  
  appointments: {
    booking: [
      "Use our online booking system on the website",
      "Call us directly at +92 304 699 6267", 
      "Use our WhatsApp booking service",
      "Walk in during business hours (subject to availability)"
    ],
    
    types: [
      "Initial Consultation (60-90 minutes) - Comprehensive examination and first treatment",
      "Follow-up Treatment (30-45 minutes) - Ongoing care sessions",
      "Emergency Appointments (45-60 minutes) - Urgent care for acute conditions", 
      "Online Consultations (30-45 minutes) - Virtual health guidance"
    ],
    
    preparation: [
      "Bring valid photo ID",
      "Insurance cards if applicable",
      "List of current medications", 
      "Previous medical records or X-rays",
      "Completed intake forms",
      "Comfortable clothing",
      "List of questions or concerns"
    ],
    
    cancellation: "24 hours advance notice required for cancellations. Same-day cancellations may incur fees unless due to emergency circumstances."
  },

  // TECHNIQUES AND EQUIPMENT
  equipment: {
    nervoscope: "The Nervoscope is a specialized instrument unique to the Gonstead Technique that detects temperature differences along the spine, indicating areas of inflammation and nerve irritation.",
    
    xray: "We use state-of-the-art digital X-ray equipment that produces high-quality images with minimal radiation exposure for precise diagnosis.",
    
    tables: "Modern Gonstead adjustment tables designed specifically for precise spinal corrections."
  },

  // WELLNESS AND PREVENTION
  wellness: {
    maintenance: "Regular maintenance visits help preserve spinal alignment, prevent problem recurrence, and optimize overall health.",
    
    exercises: "Personalized corrective exercise programs support spinal correction and prevent future problems.",
    
    lifestyle: "We provide guidance on ergonomics, posture, nutrition, and stress management to support your overall health."
  }
}

// Helper functions for chatbot responses
export const getRelevantFAQs = (query: string) => {
  // Enhanced FAQ search with better relevance scoring
  const searchResults = searchFAQs(query)
  if (searchResults.length === 0) {
    // Fallback to popular FAQs if no direct matches
    return getPopularFAQs().slice(0, 3)
  }
  return searchResults.slice(0, 3) // Return top 3 relevant FAQs
}

export const getPopularQuestions = () => {
  return getPopularFAQs().slice(0, 5) // Return top 5 popular FAQs
}

export const getServicesWithoutPricing = () => {
  return servicesWithoutPricing
}

// Enhanced keyword matching with fuzzy matching and comprehensive responses
const findBestMatch = (query: string, keywords: string[]): boolean => {
  const lowerQuery = query.toLowerCase()
  return keywords.some(keyword => {
    const lowerKeyword = keyword.toLowerCase()
    // Direct match
    if (lowerQuery.includes(lowerKeyword)) return true
    // Fuzzy match for typos (simple Levenshtein-like approach)
    if (lowerKeyword.length > 3) {
      const words = lowerQuery.split(' ')
      return words.some(word => {
        if (Math.abs(word.length - lowerKeyword.length) <= 2) {
          let matches = 0
          const minLength = Math.min(word.length, lowerKeyword.length)
          for (let i = 0; i < minLength; i++) {
            if (word[i] === lowerKeyword[i]) matches++
          }
          return matches / minLength > 0.6 // 60% character match
        }
        return false
      })
    }
    return false
  })
}

export const generateKnowledgeResponse = (query: string): string => {
  // Gonstead Technique
  if (findBestMatch(query, ['gonstead', 'technique', 'method'])) {
    return `The Gonstead Technique is a comprehensive system for analyzing and adjusting the spine. It uses five criteria: X-ray analysis, instrumentation, static palpation, motion palpation, and visual examination. This precise method identifies exact problems and provides targeted corrections. Dr. Bashir Khan specializes in this technique. Would you like to know how it can help your condition?`
  }
  
  // Safety
  if (findBestMatch(query, ['safe', 'safety', 'dangerous', 'risk'])) {
    return `Yes, the Gonstead Technique is extremely safe when performed by a qualified professional. We use comprehensive pre-treatment examination, state-of-the-art equipment, and precise analysis before any adjustment. Dr. Khan has 7+ years of experience. Serious adverse events are extremely rare (less than 1 in 100,000 treatments).`
  }
  
  // Pain/hurt
  if (findBestMatch(query, ['hurt', 'pain', 'painful', 'sore'])) {
    return `Most patients find treatment comfortable and relieving. You may hear a "pop" sound, but it's not painful - just gas releasing from joints. Dr. Khan uses gentle techniques with no forceful manipulation. Some mild soreness is possible for 24-48 hours, similar to after exercise.`
  }
  
  // Doctor questions - Enhanced
  if (findBestMatch(query, ['doctor', 'dr', 'bashir', 'khan', 'physician', 'chiropractor', 'experience', 'qualification', 'credentials', 'about doctor'])) {
    return `👨‍⚕️ **DR. BASHIR KHAN - GONSTEAD SPECIALIST**\n\n🎓 **Qualifications:**\n${chatbotKnowledgeBase.doctor.qualifications.map(qual => `• ${qual}`).join('\n')}\n\n🏆 **Certifications:**\n${chatbotKnowledgeBase.doctor.certifications.slice(0, 3).map(cert => `• ${cert}`).join('\n')}\n\n⭐ **Experience:** ${chatbotKnowledgeBase.doctor.experience}\n\n🗣️ **Languages:** ${chatbotKnowledgeBase.doctor.languages.join(', ')}\n\n💡 **Treatment Philosophy:**\n${chatbotKnowledgeBase.doctor.philosophy}\n\n🎯 **Specializations:**\n${chatbotKnowledgeBase.doctor.specialization.slice(0, 4).map(spec => `• ${spec}`).join('\n')}\n\nWould you like to book a consultation with Dr. Khan?`
  }
  
  // Location/clinic questions - Enhanced
  if (findBestMatch(query, ['location', 'address', 'where', 'clinic', 'office', 'building', 'directions', 'map', 'find you'])) {
    return `📍 **CLINIC LOCATION & DIRECTIONS**\n\n🏥 **Address:**\n${chatbotKnowledgeBase.clinic.location}\n\n🚗 **Parking:** ${chatbotKnowledgeBase.clinic.parking}\n\n📞 **Contact:** ${chatbotKnowledgeBase.clinic.phone}\n\n🌟 **Landmark:** Near Peshawar Model School - easily recognizable!\n\n♿ **Accessibility:**\n• ${chatbotKnowledgeBase.clinic.accessibility.wheelchairAccessible ? 'Wheelchair accessible' : 'Standard access'}\n• ${chatbotKnowledgeBase.clinic.accessibility.features.slice(0, 3).join('\n• ')}\n\n🗺️ **Getting Here:**\n• Main Tehsil Road - well-connected\n• Public transport available\n• Free parking in front of clinic\n\nWould you like me to help you book an appointment or provide more directions?`
  }
  
  // Hours questions - Enhanced
  if (findBestMatch(query, ['hours', 'time', 'open', 'close', 'schedule', 'timing', 'when open', 'operating hours', 'available'])) {
    return `⏰ **CLINIC HOURS & AVAILABILITY**\n\n🕘 **Regular Hours:**\n• ${chatbotKnowledgeBase.clinic.hours.weekdays}\n• ${chatbotKnowledgeBase.clinic.hours.saturday}\n• ${chatbotKnowledgeBase.clinic.hours.sunday}\n\n🚨 **Emergency Care:**\n${chatbotKnowledgeBase.clinic.hours.emergency}\n\n⭐ **Best Times to Visit:**\n• Morning (9-11 AM): Less crowded, fresh energy\n• Afternoon (2-4 PM): Popular time, good availability\n• Late afternoon (4-6 PM): End of day slots\n\n📅 **Appointment Booking:**\n• Same-day appointments often available\n• Advance booking recommended (1-3 days)\n• Emergency slots reserved daily\n• Weekend appointments limited but available\n\n📞 Call ${chatbotKnowledgeBase.clinic.phone} or book online!\n\nWhich day and time works best for you?`
  }
  
  // Enhanced condition-specific responses
  if (findBestMatch(query, ['back pain', 'lower back', 'lumbar', 'spine pain', 'spinal pain', 'back ache', 'back hurt'])) {
    return `🦴 **BACK PAIN TREATMENT - GONSTEAD EXPERTISE**\n\n${chatbotKnowledgeBase.conditions.backPain}\n\n🎯 **Gonstead Advantage for Back Pain:**\n• Precise identification of problem vertebrae\n• X-ray analysis reveals exact subluxation locations\n• Nervoscope detects inflammation patterns\n• Specific adjustments - no unnecessary manipulation\n• Addresses root cause, not just symptoms\n\n✅ **Conditions We Successfully Treat:**\n• Acute lower back pain\n• Chronic back conditions\n• Disc problems (herniation, bulging)\n• Sciatica and nerve pain\n• Muscle spasms and stiffness\n• Postural back pain\n\n📈 **Success Rate:** 95% of our back pain patients report significant improvement within 4-6 sessions!\n\nReady to get relief? Let's book your consultation!`
  }
  
  if (findBestMatch(query, ['neck pain', 'cervical', 'neck ache', 'stiff neck', 'neck hurt', 'neck stiffness'])) {
    return `🦴 **NECK PAIN RELIEF - GONSTEAD PRECISION**\n\n${chatbotKnowledgeBase.conditions.neckPain}\n\n🎯 **Specialized Neck Care:**\n• Gentle cervical spine adjustments\n• Precise analysis of neck vertebrae (C1-C7)\n• Treatment of muscle tension and stiffness\n• Postural correction for long-term relief\n• Safe techniques - no forceful neck manipulation\n\n✅ **Neck Conditions Treated:**\n• Tech neck (computer/phone posture)\n• Whiplash and car accident injuries\n• Torticollis (wry neck)\n• Cervical disc problems\n• Morning neck stiffness\n• Tension headaches from neck issues\n\n💡 **Quick Tip:** Poor posture is the #1 cause of neck pain today!\n\nLet's address your neck pain with precise Gonstead care!`
  }
  
  if (findBestMatch(query, ['headache', 'headaches', 'migraine', 'migraines', 'head pain', 'head hurt'])) {
    return `🧠 **HEADACHE & MIGRAINE RELIEF**\n\n${chatbotKnowledgeBase.conditions.headaches}\n\n🎯 **Gonstead Approach to Headaches:**\n• Identify spinal cause of headaches\n• Precise cervical spine corrections\n• Reduce nerve irritation and inflammation\n• Address muscle tension patterns\n• Long-term prevention strategies\n\n✅ **Types We Successfully Treat:**\n• Tension headaches (90% success rate!)\n• Cervicogenic headaches (neck-related)\n• Stress headaches\n• Frequent migraines (significant reduction)\n• Morning headaches\n• Computer-related headaches\n\n📊 **Patient Results:**\n• 75% reduction in headache frequency\n• 80% less pain intensity\n• Most patients avoid medications\n\n💡 **Did you know?** 85% of headaches originate from neck problems!\n\nReady to break the headache cycle? Let's get started!`
  }
  
  if (findBestMatch(query, ['sciatica', 'sciatic', 'leg pain', 'nerve pain', 'shooting pain', 'leg numbness'])) {
    return `⚡ **SCIATICA TREATMENT - PRECISE RELIEF**\n\n${chatbotKnowledgeBase.conditions.sciatica}\n\n🎯 **Gonstead Sciatica Protocol:**\n• Detailed analysis to find exact nerve compression\n• X-ray evaluation of lumbar spine\n• Specific adjustments to relieve nerve pressure\n• Gentle decompression techniques\n• Inflammation reduction strategies\n\n✅ **Sciatica Symptoms We Address:**\n• Sharp shooting pain down leg\n• Numbness and tingling\n• Burning sensations\n• Weakness in leg or foot\n• Pain when sitting or standing\n• Difficulty walking or moving\n\n📈 **Treatment Success:**\n• 90% of patients experience relief within 2 weeks\n• Average treatment: 6-8 sessions\n• Most avoid surgery and medications\n\n🚨 **Don't wait!** Early treatment prevents permanent nerve damage.\n\nLet's stop your sciatica pain today!`
  }
  
  // Appointment questions - Enhanced
  if (findBestMatch(query, ['appointment', 'book', 'booking', 'schedule', 'consultation', 'visit', 'see doctor', 'make appointment'])) {
    return `📅 **EASY APPOINTMENT BOOKING**\n\n🌟 **Multiple Ways to Book:**\n${chatbotKnowledgeBase.appointments.booking.map(method => `• ${method}`).join('\n')}\n\n🏥 **Appointment Types Available:**\n${chatbotKnowledgeBase.appointments.types.map(type => `• ${type}`).join('\n')}\n\n📋 **What to Bring:**\n${chatbotKnowledgeBase.appointments.preparation.slice(0, 4).map(item => `• ${item}`).join('\n')}\n\n⏰ **Booking Tips:**\n• Same-day appointments often available\n• Morning slots fill up quickly\n• Emergency appointments always accommodated\n• Online booking available 24/7\n\n📞 **Quick Booking:** Call ${chatbotKnowledgeBase.clinic.phone}\n\n💬 **Text/WhatsApp:** Same number for instant booking!\n\nShall I help you choose the best appointment type for your needs?`
  }
  
  // Duration questions - Enhanced
  if (findBestMatch(query, ['how long', 'duration', 'length', 'time takes', 'session length', 'appointment time'])) {
    return `⏱️ **APPOINTMENT DURATIONS**\n\n${chatbotKnowledgeBase.commonQuestions.duration}\n\n📊 **Detailed Breakdown:**\n\n🏥 **Initial Consultation (60-90 min):**\n• Health history review (15 min)\n• Physical examination (20 min)\n• Gonstead analysis (15 min)\n• X-rays if needed (15 min)\n• Treatment plan discussion (10 min)\n• First adjustment (15 min)\n\n🔄 **Follow-up Sessions (30-45 min):**\n• Progress check (10 min)\n• Specific adjustments (20 min)\n• Exercise instruction (15 min)\n\n🚨 **Emergency Visits (45-60 min):**\n• Urgent assessment and immediate care\n\n💻 **Online Consultations (30-45 min):**\n• Perfect for follow-ups and guidance\n\n⭐ **We never rush your care!** You get the time needed for optimal treatment.`
  }
  
  // Frequency questions - Enhanced
  if (findBestMatch(query, ['how often', 'frequency', 'how many times', 'sessions needed', 'visits required', 'treatment plan'])) {
    return `📊 **TREATMENT FREQUENCY & PLANS**\n\n${chatbotKnowledgeBase.commonQuestions.frequency}\n\n🎯 **Personalized Treatment Plans:**\n\n🔥 **Acute Conditions (Recent Injuries):**\n• Week 1-2: 3 visits per week\n• Week 3-4: 2 visits per week\n• Week 5+: 1 visit per week\n• Total: 8-12 sessions\n\n⏳ **Chronic Conditions (Long-term Issues):**\n• Week 1-4: 2 visits per week\n• Week 5-8: 1-2 visits per week\n• Week 9+: 1 visit per week\n• Total: 12-16 sessions\n\n✨ **Maintenance Care:**\n• Monthly visits (optimal)\n• Bi-weekly for high-stress jobs\n• Quarterly for general wellness\n\n📈 **Success Timeline:**\n• Pain relief: Often within 1-3 visits\n• Functional improvement: 2-4 weeks\n• Complete recovery: 6-12 weeks\n• Long-term stability: 3-6 months\n\nEvery case is unique - Dr. Khan will create your personalized plan!`
  }
  
  // Enhanced emergency responses
  if (findBestMatch(query, ['emergency', 'urgent', 'severe pain', 'can\'t move', 'acute pain', 'help me', 'hurt bad'])) {
    return `🚨 **EMERGENCY CHIROPRACTIC CARE**\n\n${chatbotKnowledgeBase.clinic.hours.emergency}\n\n📞 **IMMEDIATE CONTACT:**\n${chatbotKnowledgeBase.clinic.phone}\n\n🏥 **Emergency Services:**\n• Same-day urgent appointments\n• Pain management protocols\n• Acute injury assessment\n• Emergency spinal care\n• After-hours consultation available\n\n🚑 **When to Call Immediately:**\n• Severe back or neck pain\n• Loss of feeling in arms/legs\n• Sudden onset of intense pain\n• Pain after an accident\n• Unable to move normally\n• Radiating pain down arms/legs\n\n⚡ **Emergency Response:**\n• Dr. Khan prioritizes urgent cases\n• Rapid assessment and treatment\n• Pain relief protocols activated\n• Referral coordination if needed\n\n🔥 **DON'T WAIT** - Call now for immediate help!\n\nEmergency appointments available TODAY!`
  }
  
  // Enhanced preparation and aftercare
  if (findBestMatch(query, ['prepare', 'preparation', 'before visit', 'what to bring', 'get ready'])) {
    return `📋 **APPOINTMENT PREPARATION GUIDE**\n\n${chatbotKnowledgeBase.commonQuestions.preparation}\n\n✅ **Complete Checklist:**\n${chatbotKnowledgeBase.appointments.preparation.map(item => `✓ ${item}`).join('\n')}\n\n👕 **Clothing Recommendations:**\n• Comfortable, loose-fitting clothes\n• Avoid tight jeans or restrictive clothing\n• Women: Sports bra recommended\n• Easy to move in for examination\n\n🕒 **Timing Tips:**\n• Arrive 15 minutes early\n• Avoid heavy meals 2 hours before\n• Don't schedule strenuous activities after\n• Bring a water bottle (stay hydrated!)\n\n📱 **Pre-Visit Forms:**\n• Complete online intake forms beforehand\n• Saves 10-15 minutes at appointment\n• Review your health history\n\n💡 **Pro Tip:** Write down your questions and main concerns before coming!`
  }
  
  if (findBestMatch(query, ['after treatment', 'aftercare', 'post treatment', 'what to do after', 'recovery'])) {
    return `🌟 **POST-TREATMENT CARE GUIDE**\n\n${chatbotKnowledgeBase.commonQuestions.aftercare}\n\n✅ **Immediate Aftercare (First 24 Hours):**\n• Drink plenty of water (helps healing)\n• Apply ice if soreness occurs (15-20 min)\n• Avoid strenuous activities\n• Gentle walking is encouraged\n• Follow Dr. Khan's specific instructions\n\n💪 **Days 2-7 Post-Treatment:**\n• Gradually increase activity levels\n• Perform prescribed exercises\n• Maintain proper posture\n• Continue hydration\n• Monitor your symptoms\n\n🏃 **Return to Normal Activities:**\n• Light exercise: After 24-48 hours\n• Regular workouts: After 3-5 days\n• Heavy lifting: When cleared by Dr. Khan\n• Sports activities: Gradual return\n\n🚨 **When to Call:**\n• Severe or worsening pain\n• New symptoms develop\n• Questions about recovery\n• Need exercise modifications\n\n📞 Contact us anytime: ${chatbotKnowledgeBase.clinic.phone}`
  }
  
  // Enhanced recovery timeline
  if (findBestMatch(query, ['recovery', 'better', 'heal', 'improvement', 'results', 'how long to heal', 'when will I feel better'])) {
    return `📈 **RECOVERY TIMELINE & EXPECTATIONS**\n\n${chatbotKnowledgeBase.commonQuestions.recovery}\n\n⏰ **Detailed Recovery Timeline:**\n\n🔥 **Acute Injuries (Recent - Under 6 weeks):**\n• Day 1-3: Initial relief begins\n• Week 1: 40-60% improvement\n• Week 2: 70-80% better\n• Week 3-4: 90-95% recovery\n• Success Rate: 95%\n\n⏳ **Chronic Conditions (Over 6 months):**\n• Week 1-2: 20-30% improvement\n• Week 3-6: 50-70% better\n• Week 8-12: 80-90% recovery\n• Month 4-6: Full stabilization\n• Success Rate: 85%\n\n🎯 **Factors Affecting Recovery:**\n• Severity of condition (mild vs severe)\n• Your age and overall health\n• Following treatment plan compliance\n• Home care and exercise adherence\n• Lifestyle factors (stress, work, sleep)\n\n💡 **Realistic Expectations:**\n• Some improvement within first week\n• Significant relief within 2-4 weeks\n• Complete healing: 6-12 weeks typically\n• Prevention focus for long-term success\n\nEvery patient heals at their own pace - we'll monitor your progress closely!`
  }
  
  // Children and pregnancy - Enhanced
  if (findBestMatch(query, ['child', 'children', 'kids', 'pediatric', 'baby', 'infant', 'teenager'])) {
    return `👶 **PEDIATRIC CHIROPRACTIC CARE**\n\n${chatbotKnowledgeBase.commonQuestions.children}\n\n🌟 **Child-Specific Approach:**\n• Ultra-gentle techniques (finger pressure only)\n• Age-appropriate examination methods\n• Parent involvement throughout treatment\n• Fun, comfortable environment\n• Specialized pediatric training\n\n✅ **Conditions We Help in Children:**\n• Growing pains and posture issues\n• Sports injuries (young athletes)\n• Headaches and neck pain\n• Back pain from heavy backpacks\n• Scoliosis monitoring and care\n• Sleep problems related to comfort\n• Concentration issues linked to posture\n\n📊 **Age Groups We Treat:**\n• Infants (1 month+): Gentle cranial work\n• Toddlers (1-3 years): Developmental support\n• Children (4-12 years): Posture and growth\n• Teenagers (13-18 years): Sports injuries, posture\n\n👨‍👩‍👧‍👦 **Family Care:** Many families choose chiropractic for preventive wellness!\n\n🏥 **Safety First:** Techniques are completely modified for children's developing spines.`
  }
  
  if (findBestMatch(query, ['pregnant', 'pregnancy', 'expecting', 'prenatal', 'maternity', 'baby bump'])) {
    return `🤱 **PRENATAL CHIROPRACTIC CARE**\n\n${chatbotKnowledgeBase.commonQuestions.pregnancy}\n\n🌟 **Pregnancy-Safe Benefits:**\n• Relief from pregnancy back pain\n• Better pelvic alignment for easier delivery\n• Reduced morning sickness symptoms\n• Improved sleep quality and comfort\n• Decreased labor time and complications\n• Enhanced overall pregnancy experience\n\n✅ **Safe Throughout Pregnancy:**\n• First Trimester: Gentle adjustments\n• Second Trimester: Postural support\n• Third Trimester: Pelvic positioning\n• Special pregnancy tables and cushions used\n• No pressure on abdomen ever\n\n🤰 **Common Pregnancy Issues We Address:**\n• Lower back pain (80% of pregnant women!)\n• Pelvic pain and pressure\n• Hip discomfort\n• Upper back and neck tension\n• Rib pain and breathing difficulties\n• Carpal tunnel syndrome\n• Leg swelling and circulation\n\n👶 **Webster Technique:** Specialized for optimal baby positioning\n\n💕 **Completely Safe:** No medications, no force, just gentle healing support!`
  }
  
  // Equipment and technology - Enhanced
  if (findBestMatch(query, ['nervoscope', 'equipment', 'technology', 'x-ray', 'xray', 'machines', 'instruments'])) {
    return `🔬 **ADVANCED DIAGNOSTIC EQUIPMENT**\n\n💡 **Nervoscope Technology:**\n${chatbotKnowledgeBase.equipment.nervoscope}\n\n📸 **Digital X-Ray System:**\n${chatbotKnowledgeBase.equipment.xray}\n\n🛏️ **Gonstead Tables:**\n${chatbotKnowledgeBase.equipment.tables}\n\n🏥 **Complete Facility Equipment:**\n${chatbotKnowledgeBase.clinic.facilities.slice(0, 8).map(facility => `• ${facility}`).join('\n')}\n\n⚡ **Technology Advantages:**\n• 90% less radiation than traditional X-rays\n• Instant digital images and analysis\n• Objective temperature measurements\n• Precise adjustment positioning\n• State-of-the-art safety features\n• Comfortable treatment experience\n\n🎯 **Why This Matters:**\nAdvanced equipment = more accurate diagnosis = better treatment results for you!`
  }
  
  // Try to find relevant FAQs if no direct match
  const relevantFAQs = getRelevantFAQs(query)
  if (relevantFAQs && relevantFAQs.length > 0) {
    const topFAQ = relevantFAQs[0]
    return `❓ **${topFAQ.question}**\n\n${topFAQ.answer}\n\n💡 **Related Topics:**\n${relevantFAQs.slice(1, 3).map(faq => `• ${faq.question}`).join('\n')}\n\nWould you like to know more about any of these topics?`
  }
  
  // Enhanced default response with suggestions
  return `🏥 **GONSTEAD CHIROPRACTIC CLINIC**\n\nI'm here to help you with information about our specialized chiropractic services! \n\n🎯 **Popular Topics I Can Help With:**\n• Gonstead Technique details\n• Treatment for back pain, neck pain, headaches\n• Dr. Bashir Khan's qualifications\n• Appointment booking and clinic hours\n• What to expect during treatment\n• Recovery timelines and aftercare\n• Safety and effectiveness information\n\n📞 **Quick Actions:**\n• Book an appointment: ${chatbotKnowledgeBase.clinic.phone}\n• Visit us: ${chatbotKnowledgeBase.clinic.location}\n• Emergency care: Available 24/7\n\n💬 **Try asking me:**\n\"Tell me about the Gonstead technique\"\n\"How can you help with my back pain?\"\n\"What are Dr. Khan's qualifications?\"\n\"How do I book an appointment?\"\n\nWhat specific information would you like to know?`
}

// Export comprehensive knowledge for chatbot training
export default chatbotKnowledgeBase
