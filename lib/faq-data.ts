// Clinical & Patient FAQ Data for Gonstead Chiropractic Clinic
// Shared between the dedicated /faq page and the interactive chatbot

import rawQuestions from './faq-data.json'

export type QuickCategory = 'booking' | 'clinic' | 'treatment' | 'conditions'

export interface DetailSection {
  title: string
  titleUr?: string
  items: string[]
  itemsUr?: string[]
}

export interface FAQItem {
  id: string
  label: string
  labelUr?: string
  category: QuickCategory
  answer: string
  answerUr?: string
  sections?: DetailSection[]
}

export type QQ = FAQItem

export interface CategoryInfo {
  id: 'all' | QuickCategory
  labelEn: string
  labelUr: string
  descriptionEn: string
  descriptionUr: string
  iconName: string
}

export const FAQ_CATEGORIES: CategoryInfo[] = [
  {
    id: 'all',
    labelEn: 'All Questions',
    labelUr: 'تمام سوالات',
    descriptionEn: 'Browse all clinical and practical answers',
    descriptionUr: 'تمام طبی اور عملی جوابات دیکھیں',
    iconName: 'HelpCircle'
  },
  {
    id: 'treatment',
    labelEn: 'Gonstead & Treatment',
    labelUr: 'گونسٹیڈ اور علاج',
    descriptionEn: 'Technique, adjustments, safety, and aftercare',
    descriptionUr: 'تکنیک، ایڈجسٹمنٹ، حفاظت اور علاج کے بعد رہنمائی',
    iconName: 'Activity'
  },
  {
    id: 'conditions',
    labelEn: 'Spine & Conditions',
    labelUr: 'ریڑھ کی ہڈی اور تکالیف',
    descriptionEn: 'Sciatica, disc bulge, back & neck pain, posture',
    descriptionUr: 'سائیٹکا، ڈسک ہرنیا، کمر اور گردن درد، پوسچر',
    iconName: 'ShieldAlert'
  },
  {
    id: 'clinic',
    labelEn: 'Clinic & Facilities',
    labelUr: 'کلینک اور سہولیات',
    descriptionEn: 'Hours, location, equipment, emergency care, policies',
    descriptionUr: 'اوقات، کلینک کا مقام، سامان، ایمرجنسی، قواعد',
    iconName: 'Building'
  },
  {
    id: 'booking',
    labelEn: 'Appointments & Booking',
    labelUr: 'بکنگ اور اپائنٹمنٹ',
    descriptionEn: 'Scheduling, first visit expectations, reminders',
    descriptionUr: 'ملاقات کا شیڈول، پہلی وزٹ کی تیاری، طریقہ کار',
    iconName: 'Calendar'
  }
]

export const quickQuestions: FAQItem[] = rawQuestions as FAQItem[]
