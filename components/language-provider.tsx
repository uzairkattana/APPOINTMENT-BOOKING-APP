"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "ur"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  mounted: boolean
}

const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.doctor": "Doctor",
    "nav.technology": "Technology",
    "nav.contact": "Contact",
    
    // Hero Section
    "hero.certified": "Board Certified Gonstead Specialist",
    "hero.precision": "Precision",
    "hero.spinal.care": "Spinal Care",
    "hero.gonstead.excellence": "with Gonstead Excellence",
    "hero.description": "Experience revolutionary chiropractic care with Dr. Bashir Khan. Advanced Gonstead techniques combined with cutting-edge technology for precise diagnosis and lasting relief.",
    "hero.book.consultation": "Book Expert Consultation",
    "hero.discover.method": "Discover Our Method",
    "hero.patients.healed": "Patients Healed",
    "hero.years.mastery": "Years Mastery",
    "hero.success.rate": "Success Rate",
    "hero.scroll.explore": "Scroll to explore",
    
    // About Section
    "about.clinic": "About Our Clinic",
    "about.title": "Precision Spinal Care with Gonstead Excellence",
    "about.description": "At Gonstead Chiropractic Clinic, we combine traditional Gonstead techniques with modern technology to provide the most effective spinal care in Nowshera.",
    "about.precise.diagnosis": "Precise Diagnosis",
    "about.precise.description": "Advanced spinal analysis using Gonstead methodology for accurate diagnosis",
    "about.effective.treatment": "Effective Treatment",
    "about.effective.description": "Targeted adjustments that address the root cause of your spinal issues",
    "about.compassionate.care": "Compassionate Care",
    "about.compassionate.description": "Patient-centered approach with personalized treatment plans",
    "about.safe.proven": "Safe & Proven",
    "about.safe.description": "Time-tested Gonstead techniques with modern safety protocols",
    
    // Services Section
    "services.badge": "Our Services",
    "services.title": "Comprehensive Chiropractic Solutions",
    "services.description": "From acute pain relief to preventive care, we offer a full range of chiropractic services tailored to your specific needs.",
    "services.gonstead.technique": "Gonstead Technique",
    "services.consultations": "Consultations",
    "services.wellness.programs": "Wellness Programs",
    
    // Doctor Section
    "doctor.meet": "Meet Your Doctor",
    "doctor.name": "Gonstead Chiropractic Clinic",
    "doctor.title": "Gonstead Specialist",
    "doctor.description": "Experience exceptional chiropractic care with a doctor who combines traditional Gonstead techniques with modern expertise and compassionate care.",
    "doctor.education": "Education & Certification",
    "doctor.specializations": "Specializations",
    "doctor.philosophy": "Philosophy of Care",
    "doctor.philosophy.text": "Every patient deserves precise, personalized care. Through the Gonstead technique, I focus on identifying the exact source of spinal dysfunction and providing targeted treatment that addresses the root cause, not just the symptoms.",
    
    // Contact Section
    "contact.badge": "Book Your Appointment",
    "contact.title": "Start Your Journey to Better Spinal Health",
    "contact.description": "Ready to experience the precision of Gonstead chiropractic care? Book your consultation today and take the first step towards a pain-free life.",
    "contact.visit.clinic": "Visit Our Clinic",
    "contact.address": "Address",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.hours": "Hours",
    "contact.find.map": "Find Us on Map",
    
    // Technology Section
    "technology.showcase": "Advanced Technology Showcase",
    
    // Common
    "book.appointment": "Book Appointment",
    "book.consultation": "Book Consultation",
    "call.now": "Call Now",
    "clinic.location": "Near Peshawar Model School, Tehsil Road, Nowshera",
    "clinic.email": "info@gonsteadchiropractic.com",
    "clinic.phone": "+92 304 699 6267",
    "clinic.hours.weekday": "Monday - Saturday: 9:00 AM - 6:00 PM",
    "clinic.hours.sunday": "Sunday: Emergency appointments only",
    
    // Footer
    "footer.description": "Providing expert Gonstead chiropractic care in Nowshera with precision, compassion, and proven results.",
    "footer.quick.links": "Quick Links",
    "footer.services": "Services",
    "footer.contact.info": "Contact Info",
    "footer.copyright": "© 2024 Gonstead Chiropractic Clinic. All rights reserved. | Designed with precision for spinal health excellence.",
  },
  ur: {
    // Navigation
    "nav.home": "ہوم",
    "nav.about": "تعارف",
    "nav.services": "خدمات",
    "nav.doctor": "ڈاکٹر",
    "nav.technology": "ٹیکنالوجی",
    "nav.contact": "رابطہ",
    
    // Hero Section
    "hero.certified": "بورڈ سرٹیفائیڈ گونسٹیڈ اسپیشلسٹ",
    "hero.precision": "درست",
    "hero.spinal.care": "ریڑھ کی دیکھ بھال",
    "hero.gonstead.excellence": "گونسٹیڈ کی بہترین خدمات کے ساتھ",
    "hero.description": "ڈاکٹر بشیر خان کے ساتھ انقلابی کائروپریکٹک کیئر کا تجربہ کریں۔ درست تشخیص اور دیرپا آرام کے لیے جدید گونسٹیڈ تکنیکوں کو جدید ٹیکنالوجی کے ساتھ ملایا گیا ہے۔",
    "hero.book.consultation": "ماہر مشاورت بک کریں",
    "hero.discover.method": "ہمارا طریقہ دریافت کریں",
    "hero.patients.healed": "مریض صحت یاب",
    "hero.years.mastery": "سالوں کی مہارت",
    "hero.success.rate": "کامیابی کی شرح",
    "hero.scroll.explore": "مزید جاننے کے لیے سکرول کریں",
    
    // About Section
    "about.clinic": "ہمارے کلینک کے بارے میں",
    "about.title": "گونسٹیڈ کی بہترین خدمات کے ساتھ درست ریڑھ کی دیکھ بھال",
    "about.description": "گونسٹیڈ کائروپریکٹک کلینک میں، ہم نوشہرہ میں سب سے مؤثر ریڑھ کی دیکھ بھال فراہم کرنے کے لیے روایتی گونسٹیڈ تکنیکوں کو جدید ٹیکنالوجی کے ساتھ ملاتے ہیں۔",
    "about.precise.diagnosis": "درست تشخیص",
    "about.precise.description": "درست تشخیص کے لیے گونسٹیڈ طریقہ کار کا استعمال کرتے ہوئے ایڈوانس اسپائنل تجزیہ",
    "about.effective.treatment": "مؤثر علاج",
    "about.effective.description": "ہدف شدہ ایڈجسٹمنٹ جو آپ کے ریڑھ کی مسائل کی بنیادی وجہ کو حل کرتا ہے",
    "about.compassionate.care": "ہمدردانہ دیکھ بھال",
    "about.compassionate.description": "ذاتی علاج کے منصوبوں کے ساتھ مریض کی ضروریات پر مبنی نقطہ نظر",
    "about.safe.proven": "محفوظ اور ثابت شدہ",
    "about.safe.description": "جدید حفاظتی پروٹوکول کے ساتھ وقت کی آزمائش سے گزرے گونسٹیڈ تکنیکیں",
    
    // Services Section
    "services.badge": "ہماری خدمات",
    "services.title": "جامع کائروپریکٹک حل",
    "services.description": "شدید درد سے آرام سے لے کر بچاؤ کی دیکھ بھال تک، ہم آپ کی مخصوص ضروریات کے مطابق کائروپریکٹک خدمات کی مکمل رینج پیش کرتے ہیں۔",
    "services.gonstead.technique": "گونسٹیڈ تکنیک",
    "services.consultations": "مشاورت",
    "services.wellness.programs": "تندرستی کے پروگرام",
    
    // Doctor Section
    "doctor.meet": "اپنے ڈاکٹر سے ملیں",
    "doctor.name": "گونسٹیڈ کائروپریکٹک کلینک",
    "doctor.title": "گونسٹیڈ اسپیشلسٹ",
    "doctor.description": "ایک ڈاکٹر کے ساتھ غیر معمولی کائروپریکٹک کیئر کا تجربہ کریں جو روایتی گونسٹیڈ تکنیکوں کو جدید مہارت اور ہمدردانہ دیکھ بھال کے ساتھ ملاتا ہے۔",
    "doctor.education": "تعلیم اور سرٹیفیکیشن",
    "doctor.specializations": "خصوصیات",
    "doctor.philosophy": "دیکھ بھال کا فلسفہ",
    "doctor.philosophy.text": "ہر مریض درست، ذاتی دیکھ بھال کا حقدار ہے۔ گونسٹیڈ تکنیک کے ذریعے، میں ریڑھ کی ہڈی کی خرابی کی صحیح وجہ کی شناخت اور ہدف شدہ علاج فراہم کرنے پر توجہ مرکوز کرتا ہوں جو صرف علامات نہیں بلکہ بنیادی وجہ کو حل کرتا ہے۔",
    
    // Contact Section
    "contact.badge": "اپنی ملاقات بک کریں",
    "contact.title": "بہتر ریڑھ کی صحت کے لیے اپنا سفر شروع کریں",
    "contact.description": "گونسٹیڈ کائروپریکٹک کیئر کی درستگی کا تجربہ کرنے کے لیے تیار ہیں؟ آج ہی اپنی مشاورت بک کریں اور درد سے آزاد زندگی کی طرف پہلا قدم اٹھائیں۔",
    "contact.visit.clinic": "ہمارے کلینک آئیں",
    "contact.address": "پتہ",
    "contact.phone": "فون",
    "contact.email": "ای میل",
    "contact.hours": "اوقات",
    "contact.find.map": "نقشے پر ہمیں تلاش کریں",
    
    // Technology Section
    "technology.showcase": "ایڈوانس ٹیکنالوجی شوکیس",
    
    // Common
    "book.appointment": "ملاقات بک کریں",
    "book.consultation": "مشاورت بک کریں",
    "call.now": "ابھی کال کریں",
    "clinic.location": "پولیس سٹیشن کے قریب، تحصیل روڈ، نوشہرہ",
    "clinic.email": "info@gonsteadchiropractic.com",
    "clinic.phone": "+92 304 699 6267",
    "clinic.hours.weekday": "پیر - ہفتہ: صبح 9:00 - شام 6:00 بجے",
    "clinic.hours.sunday": "اتوار: صرف ایمرجنسی ملاقاتیں",
    
    // Footer
    "footer.description": "نوشہرہ میں درستگی، ہمدردی، اور ثابت شدہ نتائج کے ساتھ ماہرانہ گونسٹیڈ کائروپریکٹک کیئر فراہم کرنا۔",
    "footer.quick.links": "فوری لنکس",
    "footer.services": "خدمات",
    "footer.contact.info": "رابطے کی معلومات",
    "footer.copyright": "© 2024 گونسٹیڈ کائروپریکٹک کلینک۔ تمام حقوق محفوظ ہیں۔ | ریڑھ کی صحت کی بہترین خدمات کے لیے درستگی کے ساتھ ڈیزائن کیا گیا۔",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get stored language or default to English
    const stored = (typeof window !== "undefined" ? localStorage.getItem("gonstead-language") : null) as Language | null
    if (stored && ["en", "ur"].includes(stored)) {
      setLanguage(stored)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("gonstead-language", language)
    }
  }, [language, mounted])

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["en"]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, mounted }}>{children}</LanguageContext.Provider>
}

const defaultLanguageContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: (key: string) => translations.en[key as keyof typeof translations.en] || key,
  mounted: true,
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    return defaultLanguageContext
  }
  return context
}
